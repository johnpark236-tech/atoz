import { AddressInfo, CommercialAreaSummary, CommercialCategoryCount, CommercialStore, SourceStatus } from './types';

/**
 * Calculates Haversine distance in meters between two lat/lng coordinates.
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Checks if a store matches the user's selected business type.
 */
export function matchStoreCategory(
  storeName: string,
  majorCat: string,
  midCat: string,
  subCat: string,
  targetBusinessType: string
): { isSame: boolean; isSimilar: boolean } {
  const target = targetBusinessType.trim().toLowerCase();
  const allStoreText = `${storeName} ${majorCat} ${midCat} ${subCat}`.toLowerCase();

  if (!target) {
    return { isSame: false, isSimilar: false };
  }

  // Exact / High similarity keywords
  if (target.includes('카페') || target.includes('커피') || target.includes('디저트') || target.includes('베이커리')) {
    const isSame = allStoreText.includes('카페') || allStoreText.includes('커피') || allStoreText.includes('음료') || allStoreText.includes('디저트');
    const isSimilar = isSame || allStoreText.includes('제과') || allStoreText.includes('베이커리') || allStoreText.includes('패스트푸드') || allStoreText.includes('아이스크림');
    return { isSame, isSimilar };
  }

  if (target.includes('학원') || target.includes('교육') || target.includes('교습소') || target.includes('어학') || target.includes('한국어')) {
    const isSame = allStoreText.includes('학원') || allStoreText.includes('교육') || allStoreText.includes('어학') || allStoreText.includes('교습');
    const isSimilar = isSame || allStoreText.includes('독서실') || allStoreText.includes('스터디') || allStoreText.includes('공부방');
    return { isSame, isSimilar };
  }

  if (target.includes('음식점') || target.includes('식당') || target.includes('한식') || target.includes('일식') || target.includes('중식') || target.includes('양식') || target.includes('치킨') || target.includes('분식')) {
    const isSame = allStoreText.includes(target) || allStoreText.includes('음식') || allStoreText.includes('식당');
    const isSimilar = allStoreText.includes('음식') || allStoreText.includes('식음료') || allStoreText.includes('주점') || allStoreText.includes('패스트푸드');
    return { isSame, isSimilar };
  }

  if (target.includes('미용') || target.includes('헤어') || target.includes('네일') || target.includes('피부') || target.includes('뷰티')) {
    const isSame = allStoreText.includes('미용') || allStoreText.includes('헤어') || allStoreText.includes('네일') || allStoreText.includes('피부');
    const isSimilar = isSame || allStoreText.includes('이용') || allStoreText.includes('마사지') || allStoreText.includes('화장품');
    return { isSame, isSimilar };
  }

  if (target.includes('편의점') || target.includes('마트') || target.includes('슈퍼') || target.includes('소매')) {
    const isSame = allStoreText.includes('편의점') || allStoreText.includes('마트') || allStoreText.includes('슈퍼');
    const isSimilar = isSame || allStoreText.includes('종합소매') || allStoreText.includes('할인점');
    return { isSame, isSimilar };
  }

  if (target.includes('헬스') || target.includes('피트니스') || target.includes('필라테스') || target.includes('요가') || target.includes('운동')) {
    const isSame = allStoreText.includes('헬스') || allStoreText.includes('피트니스') || allStoreText.includes('필라테스') || allStoreText.includes('요가');
    const isSimilar = isSame || allStoreText.includes('체육') || allStoreText.includes('스포츠') || allStoreText.includes('골프');
    return { isSame, isSimilar };
  }

  // Fallback direct inclusion
  const isSame = allStoreText.includes(target);
  const isSimilar = isSame || majorCat.toLowerCase().includes(target);
  return { isSame, isSimilar };
}

/**
 * Queries Small Enterprise Commercial Store Data within radius.
 */
export async function getCommercialAreaSummary(
  address: AddressInfo,
  businessType: string = '',
  radius: number = 500,
  serviceKey?: string
): Promise<CommercialAreaSummary> {
  const centerLat = address.lat;
  const centerLng = address.lng;

  // 1. Live Public API Call if Service Key is provided
  if (serviceKey) {
    try {
      const cleanKey = serviceKey.trim();
      let url = `https://apis.data.go.kr/B553077/api/open/sdsc2/storeListInRadius?serviceKey=${encodeURIComponent(
        cleanKey
      )}&radius=${radius}&cx=${centerLng}&cy=${centerLat}&type=json&numOfRows=500`;

      let res = await fetch(url);
      let json = res.ok ? await res.json() : null;

      if (!json || (!json.body && !json.response)) {
        // Retry with unencoded key if needed
        url = `https://apis.data.go.kr/B553077/api/open/sdsc2/storeListInRadius?serviceKey=${cleanKey}&radius=${radius}&cx=${centerLng}&cy=${centerLat}&type=json&numOfRows=500`;
        res = await fetch(url);
        json = res.ok ? await res.json() : null;
      }

      const items = json?.body?.items || json?.response?.body?.items || [];
      const rawList = Array.isArray(items) ? items : (items.item ? (Array.isArray(items.item) ? items.item : [items.item]) : []);

      if (rawList.length > 0) {
          const stores: CommercialStore[] = rawList.map((item: any, idx: number) => {
            const lat = parseFloat(item.lat || item.y || 0);
            const lng = parseFloat(item.lon || item.x || 0);
            const distance = calculateDistance(centerLat, centerLng, lat, lng);
            const majorCat = item.indsLclsNm || '음식';
            const midCat = item.indsMclsNm || '기타';
            const subCat = item.indsSclsNm || '기타';
            const match = matchStoreCategory(item.bizesNm || '', majorCat, midCat, subCat, businessType);

            return {
              id: item.bizesId || `store-${idx + 1}`,
              name: item.bizesNm || '상호명 미상',
              branch: item.brchNm || '',
              mainCategory: majorCat,
              midCategory: midCat,
              subCategory: subCat,
              industryCode: item.indsSclsCd || '',
              address: item.lnoAdr || address.jibunAddress,
              roadAddress: item.rdnmAdr || address.roadAddress,
              lat,
              lng,
              distance,
              isSameCategory: match.isSame,
              isSimilarCategory: match.isSimilar,
            };
          });

          // Sort by distance
          stores.sort((a, b) => a.distance - b.distance);

          // Category counts
          const catMap: Record<string, number> = {};
          stores.forEach((s) => {
            catMap[s.mainCategory] = (catMap[s.mainCategory] || 0) + 1;
          });

          const total = stores.length;
          const categoryCounts: CommercialCategoryCount[] = Object.entries(catMap)
            .map(([category, count]) => ({
              category,
              count,
              percentage: Math.round((count / (total || 1)) * 100),
            }))
            .sort((a, b) => b.count - a.count);

          const sameCategoryCount = stores.filter((s) => s.isSameCategory).length;
          const similarCategoryCount = stores.filter((s) => s.isSimilarCategory).length;

          let densityLevel: CommercialAreaSummary['densityLevel'] = 'MEDIUM';
          let densityDescription = '점포 밀집도가 보통 수준입니다.';
          if (total > 80) {
            densityLevel = 'VERY_HIGH';
            densityDescription = '상권 활성도와 유동 점포 밀집도가 매우 높은 핵심 상권입니다.';
          } else if (total > 40) {
            densityLevel = 'HIGH';
            densityDescription = '상권 점포 밀집도가 높아 유동인구 유입이 활발한 상권입니다.';
          } else if (total < 15) {
            densityLevel = 'LOW';
            densityDescription = '점포 수가 적은 저밀도 주거/배후 상권입니다.';
          }

          return {
            radius,
            totalStoreCount: total,
            categoryCounts,
            sameCategoryCount,
            similarCategoryCount,
            densityLevel,
            densityDescription,
            competitors: stores,
            sourceStatus: 'LIVE_API',
          };
        }
    } catch (err) {
      console.warn('Commercial area API call failed:', err);
    }
  }

  // 2. Pure Non-Mock Fallback (Zero fake data)
  return {
    radius,
    totalStoreCount: 0,
    categoryCounts: [],
    sameCategoryCount: 0,
    similarCategoryCount: 0,
    densityLevel: 'LOW',
    densityDescription: serviceKey
      ? '상권 점포 데이터를 조회하지 못했거나 반경 내 점포가 없습니다.'
      : '공공데이터포털 API 키(DATA_GO_KR_SERVICE_KEY) 설정이 필요합니다.',
    competitors: [],
    sourceStatus: serviceKey ? 'DATA_UNAVAILABLE' : 'API_KEY_REQUIRED',
  };
}

