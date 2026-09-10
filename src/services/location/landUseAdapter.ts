import { AddressInfo, LandUseInfo } from './types';

/**
 * Retrieves land zoning and urban planning regulations.
 */
export async function getLandUseInfo(
  address: AddressInfo,
  vworldApiKey?: string
): Promise<LandUseInfo> {
  // 1. Live VWorld Land Use Plan API if API key provided
  if (vworldApiKey && address.pnu) {
    try {
      const url = `https://api.vworld.kr/req/data?service=data&request=GetFeature&data=LT_C_UQ111&key=${encodeURIComponent(
        vworldApiKey
      )}&pnu=${address.pnu}&domain=http://localhost:3000&format=json`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const feature = data?.response?.result?.featureCollection?.features?.[0];
        if (feature) {
          const props = feature.properties;
          const zoningArea = props.uname || props.dstrc_nm || '일반상업지역';
          return {
            zoningArea,
            zoningDistrict: props.dstrc_sub_nm || '해당없음',
            zoningSection: '해당없음',
            districtPlan: zoningArea.includes('지구단위') || '지구단위계획구역 해당',
            restrictions: [
              '국토의 계획 및 이용에 관한 법률 및 관할 지자체 도시계획조례 적용',
              '건폐율 및 용적률 상한선 준수 필요',
            ],
            sourceStatus: 'LIVE_API',
          };
        }
      }
    } catch (err) {
      console.warn('Land use API query failed:', err);
    }
  }

  // 2. Reference Zoning based on Commercial / Residential Context
  const isCommercialHub =
    address.rawAddress.includes('신부동') ||
    address.rawAddress.includes('불당동') ||
    address.rawAddress.includes('역삼동') ||
    address.rawAddress.includes('서교동') ||
    address.rawAddress.includes('인계동') ||
    address.rawAddress.includes('중앙로') ||
    address.rawAddress.includes('상업');

  const isApartmentOrResidential =
    address.rawAddress.includes('아파트') ||
    address.rawAddress.includes('주택') ||
    address.rawAddress.includes('대치동') ||
    address.rawAddress.includes('원성동');

  let zoningArea = '제2종일반주거지역';
  let zoningDistrict = '상대보호구역 (교육환경보호에 관한 법률)';
  let zoningSection = '해당없음';
  let districtPlan: boolean | string = '지구단위계획구역 수립';
  const restrictions = [
    '지자체 도시계획조례에 따른 건폐율(60% 이하) 및 용적률(200%~250% 이하) 적용',
    '정화조 용량 및 하수도원인자부담금 사전 확인 필수',
    '간판 등 옥외광고물 특정구역 고시 준수 필요',
  ];

  if (isCommercialHub) {
    zoningArea = '일반상업지역';
    zoningDistrict = '방화지구, 중심지미관지구';
    zoningSection = '해당없음';
    districtPlan = '지구단위계획구역 (상업·업무기능 강화지구)';
    restrictions.length = 0;
    restrictions.push('일반상업지역 기준 건폐율(80% 이하) 및 용적률(1000%~1300% 이하) 적용');
    restrictions.push('제1·2종 근린생활시설, 판매시설, 업무시설, 위락시설 입점 폭넓게 허용');
    restrictions.push('도로변 옥외광고물 및 주차대수 산정 기준 확인 필요');
  } else if (isApartmentOrResidential) {
    zoningArea = '제3종일반주거지역';
    zoningDistrict = '상대보호구역';
    restrictions.push('주거환경 보호를 위해 일부 소음/유해업종(유흥주점 등) 입점 제한');
  }

  return {
    zoningArea,
    zoningDistrict,
    zoningSection,
    districtPlan,
    restrictions,
    sourceStatus: 'VERIFICATION_REQUIRED',
  };
}
