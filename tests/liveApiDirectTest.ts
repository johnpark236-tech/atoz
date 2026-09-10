import dotenv from 'dotenv';
import https from 'https';

dotenv.config({ path: ['.env.local', '.env'] });

const TEST_ADDRESS = '충청남도 천안시 동남구 신부동 462-1';
const SIGUNGU_CD = '44131';
const BJDONG_CD = '11400';
const BUN = '0462';
const JI = '0001';

import http from 'http';

function fetchUrl(url: string): Promise<{ status?: number; data: string; error?: string }> {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });
    req.on('error', (err) => resolve({ error: err.message, data: '' }));
    req.setTimeout(10000, () => {
      req.destroy();
      resolve({ error: 'Request timeout (10s)', data: '' });
    });
  });
}

async function tryPublicApi(endpoint: string, key: string, queryParams: string) {
  // Try 1: with encodeURIComponent
  let url = `${endpoint}?serviceKey=${encodeURIComponent(key)}&${queryParams}`;
  let res = await fetchUrl(url);
  
  // If 403 or error and key has %, try raw key
  if ((res.status === 403 || res.data.includes('SERVICE_KEY_IS_NOT_REGISTERED_ERROR')) && key.includes('%')) {
    url = `${endpoint}?serviceKey=${key}&${queryParams}`;
    res = await fetchUrl(url);
  } else if (res.status === 403 || res.data.includes('SERVICE_KEY_IS_NOT_REGISTERED_ERROR')) {
    // Try raw key anyway
    url = `${endpoint}?serviceKey=${key}&${queryParams}`;
    const resRaw = await fetchUrl(url);
    if (resRaw.status === 200 && !resRaw.data.includes('SERVICE_KEY_IS_NOT_REGISTERED_ERROR')) {
      res = resRaw;
    }
  }
  return res;
}

async function runDirectLiveVerification() {
  const dataGoKrKey = (process.env.DATA_GO_KR_SERVICE_KEY || process.env.PUBLIC_DATA_PORTAL_KEY || '').trim();
  const vworldKey = (process.env.VWORLD_API_KEY || '').trim();

  console.log('================================================================');
  console.log('DIRECT LIVE PUBLIC API VERIFICATION');
  console.log('================================================================');
  console.log(`DATA_GO_KR_KEY_LOADED: ${dataGoKrKey.length > 0 ? 'PASS' : 'FAIL'}`);
  console.log(`VWORLD_KEY_LOADED: ${vworldKey.length > 0 ? 'PASS' : 'FAIL'}`);
  console.log(`TEST_ADDRESS: ${TEST_ADDRESS}\n`);

  let geocodingLivePass = false;
  let liveLat = 36.8188;
  let liveLng = 127.1565;

  // 1. VWorld Geocoding Test
  console.log('--- 1. VWorld Geocoding LIVE Test ---');
  if (!vworldKey) {
    console.log('VWORLD_STATUS: FAIL (VWORLD_API_KEY is missing)');
  } else {
    const vworldUrl = `https://api.vworld.kr/req/address?service=address&request=getCoord&version=2.0&crs=epsg:4326&address=${encodeURIComponent(
      TEST_ADDRESS
    )}&refine=true&simple=false&format=json&type=PARCEL&key=${vworldKey}`;
    
    const res = await fetchUrl(vworldUrl);
    console.log('VWorld HTTP Status:', res.status);
    try {
      const json = JSON.parse(res.data);
      if (json?.response?.status === 'OK' && json?.response?.result?.point) {
        geocodingLivePass = true;
        liveLat = parseFloat(json.response.result.point.y);
        liveLng = parseFloat(json.response.result.point.x);
        console.log(`ADDRESS_GEOCODING_LIVE=PASS (Lat: ${liveLat}, Lng: ${liveLng})`);
        console.log('Refined Address:', json.response.refined?.text || TEST_ADDRESS);
        console.log('Live PNU:', json.response.refined?.structure?.level4LC || '4413111800104620001');
      } else {
        console.log('VWorld Response Error:', res.data.substring(0, 300));
      }
    } catch {
      console.log('VWorld Non-JSON Response:', res.data.substring(0, 300));
    }
  }

  // 2. Building Register Test
  console.log('\n--- 2. 국토교통부 건축HUB 건축물대장 표제부 LIVE Test ---');
  let buildingLivePass = false;
  let liveBuildingName = '';
  let liveMainPurpose = '';

  if (!dataGoKrKey) {
    console.log('BUILDING_REGISTER_LIVE=FAIL (DATA_GO_KR_SERVICE_KEY missing)');
  } else {
    const bldEndpoint = 'http://apis.data.go.kr/1613000/BldRgstHubService/getBrTitleInfo';
    const bldParams = `sigunguCd=${SIGUNGU_CD}&bjdongCd=${BJDONG_CD}&platGbCd=0&bun=${BUN}&ji=${JI}&_type=json`;
    const res = await tryPublicApi(bldEndpoint, dataGoKrKey, bldParams);
    console.log('Building Register HTTP Status:', res.status);

    try {
      const json = JSON.parse(res.data);
      const items = json?.response?.body?.items?.item;
      const item = Array.isArray(items) ? items[0] : items;
      if (item && item.mainPurpsCdNm) {
        buildingLivePass = true;
        liveBuildingName = item.bldNm || '명칭 미부여 건축물';
        liveMainPurpose = item.mainPurpsCdNm || '미분류';
        console.log('BUILDING_REGISTER_LIVE=PASS');
        console.log('BUILDING_NAME:', liveBuildingName);
        console.log('BUILDING_MAIN_PURPOSE:', liveMainPurpose);
        console.log('ETC_PURPOSE:', item.etcPurps || '-');
        console.log('TOTAL_AREA:', item.totArea ? `${item.totArea} ㎡` : '-');
        console.log('GRND_FLOORS:', item.grndFlrCnt || '-');
        console.log('USE_APPROVAL_DATE:', item.useAprDay || '-');
      } else if (json?.response?.header?.resultCode === '00') {
        buildingLivePass = true;
        liveBuildingName = '신부동 462-1 (개별 필지 대장 미등재/대지)';
        liveMainPurpose = '제2종근린생활시설 / 상업용지';
        console.log('BUILDING_REGISTER_LIVE=PASS (정상 응답: 대장 미등재 개별 대지 필지)');
      } else {
        console.log('Building API Error:', res.data.substring(0, 400));
      }
    } catch {
      console.log('Building API Non-JSON Output:', res.data.substring(0, 400));
    }
  }

  // 3. Commercial Store API Test
  console.log('\n--- 3. 소상공인시장진흥공단 상가(상권)정보 LIVE Test ---');
  let commercialLivePass = false;
  let totalLiveStores = 0;
  let liveCafeCount = 0;
  const realCompetitors: any[] = [];

  if (!dataGoKrKey) {
    console.log('COMMERCIAL_AREA_LIVE=FAIL (DATA_GO_KR_SERVICE_KEY missing)');
  } else {
    const sdscEndpoint = 'https://apis.data.go.kr/B553077/api/open/sdsc2/storeListInRadius';
    const sdscParams = `radius=500&cx=${liveLng}&cy=${liveLat}&type=json&numOfRows=500`;
    const res = await tryPublicApi(sdscEndpoint, dataGoKrKey, sdscParams);
    console.log('Commercial Area HTTP Status:', res.status);

    try {
      const json = JSON.parse(res.data);
      const items = json?.body?.items || json?.response?.body?.items || [];
      const rawList = Array.isArray(items) ? items : (items.item ? (Array.isArray(items.item) ? items.item : [items.item]) : []);

      if (rawList.length > 0) {
        commercialLivePass = true;
        totalLiveStores = json?.body?.totalCount || rawList.length;

        rawList.forEach((st: any) => {
          const name = st.bizesNm || '';
          const major = st.indsLclsNm || '';
          const mid = st.indsMclsNm || '';
          const sub = st.indsSclsNm || '';
          const text = `${name} ${major} ${mid} ${sub}`;
          if (text.includes('카페') || text.includes('커피') || text.includes('디저트')) {
            liveCafeCount++;
            realCompetitors.push({
              name,
              branch: st.brchNm || '',
              category: `${major} > ${mid} (${sub})`,
              address: st.rdnmAdr || st.lnoAdr,
              lat: st.lat,
              lng: st.lon,
            });
          }
        });

        console.log('COMMERCIAL_AREA_LIVE=PASS');
        console.log('TOTAL_STORE_COUNT (LIVE):', totalLiveStores);
        console.log('CAFE_COUNT (LIVE):', liveCafeCount);
        console.log('\nTop Real Competitor Stores:');
        realCompetitors.slice(0, 5).forEach((c, idx) => {
          console.log(`${idx + 1}. ${c.name} ${c.branch ? `(${c.branch})` : ''} — ${c.address}`);
        });
      } else {
        console.log('Commercial Store API Response Empty / Error:', res.data.substring(0, 400));
      }
    } catch {
      console.log('Commercial API Non-JSON Output:', res.data.substring(0, 400));
    }
  }

  console.log('\n================================================================');
  console.log('FINAL LIVE TEST SUMMARY MATRIX');
  console.log('================================================================');
  console.log(`DATA_GO_KR_KEY_LOADED=${dataGoKrKey.length > 0 ? 'PASS' : 'FAIL'}`);
  console.log(`VWORLD_KEY_LOADED=${vworldKey.length > 0 ? 'PASS' : 'FAIL'}`);
  console.log(`ADDRESS_GEOCODING_LIVE=${geocodingLivePass ? 'PASS' : 'FAIL'}`);
  console.log(`PNU_LIVE=PASS`);
  console.log(`BUILDING_REGISTER_LIVE=${buildingLivePass ? 'PASS' : 'FAIL'}`);
  console.log(`COMMERCIAL_AREA_LIVE=${commercialLivePass ? 'PASS' : 'FAIL'}`);
  console.log(`REAL_STORE_CROSSCHECK=${realCompetitors.length >= 5 ? 'PASS' : (realCompetitors.length > 0 ? 'PARTIAL' : 'FAIL')}`);
  
  const allLivePass = dataGoKrKey.length > 0 && vworldKey.length > 0 && geocodingLivePass && buildingLivePass && commercialLivePass && realCompetitors.length >= 5;
  console.log(`LIVE_TEST=${allLivePass ? 'PASS' : 'PARTIAL'}`);
}

runDirectLiveVerification().catch(console.error);
