import dotenv from 'dotenv';
import https from 'https';

dotenv.config({ path: ['.env.local', '.env'] });

const TEST_ADDRESS = '충청남도 천안시 동남구 신부동 462-1';
const SIGUNGU_CD = '44131';
const BJDONG_CD = '11400';
const BUN = '0462';
const JI = '0001';
const LAT = 36.8188;
const LNG = 127.1565;

function fetchUrl(url: string): Promise<{ status?: number; data: string; error?: string }> {
  return new Promise((resolve) => {
    const req = https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });
    req.on('error', (err) => resolve({ error: err.message, data: '' }));
    req.setTimeout(8000, () => {
      req.destroy();
      resolve({ error: 'Request timeout (8s)', data: '' });
    });
  });
}

async function runDirectLiveVerification() {
  const dataGoKrKey = process.env.DATA_GO_KR_SERVICE_KEY || process.env.PUBLIC_DATA_PORTAL_KEY || '';
  const vworldKey = process.env.VWORLD_API_KEY || '';

  console.log('================================================================');
  console.log('DIRECT LIVE PUBLIC API DIAGNOSTIC TEST');
  console.log('================================================================');
  console.log(`DATA_GO_KR_SERVICE_KEY loaded: ${Boolean(dataGoKrKey)} (Length: ${dataGoKrKey.length})`);
  console.log(`VWORLD_API_KEY loaded: ${Boolean(vworldKey)} (Length: ${vworldKey.length})`);
  console.log(`TEST_ADDRESS: ${TEST_ADDRESS}\n`);

  // 1. VWorld Geocoding Test
  console.log('--- 1. VWorld Geocoding LIVE Test ---');
  if (!vworldKey) {
    console.log('VWORLD_STATUS: NOT_CONFIGURED (VWORLD_API_KEY is empty in .env.local / .env)');
  } else {
    const vworldUrl = `https://api.vworld.kr/req/address?service=address&request=getCoord&version=2.0&crs=epsg:4326&address=${encodeURIComponent(
      TEST_ADDRESS
    )}&refine=true&simple=false&format=json&type=BOTH&key=${vworldKey}`;
    console.log('Endpoint:', 'https://api.vworld.kr/req/address');
    const res = await fetchUrl(vworldUrl);
    console.log('HTTP Status:', res.status);
    console.log('Response Body:', res.data.substring(0, 300));
  }

  // 2. Building Register (건축물대장 표제부) Test
  console.log('\n--- 2. 국토교통부 건축HUB 건축물대장 표제부 LIVE Test ---');
  const bldEndpoint = 'https://apis.data.go.kr/1613000/BldRgstHubService/getBrTitleInfo';
  const bldParams = `sigunguCd=${SIGUNGU_CD}&bjdongCd=${BJDONG_CD}&platGbCd=0&bun=${BUN}&ji=${JI}&_type=json`;
  console.log('Endpoint:', bldEndpoint);
  console.log('Request Parameters:', bldParams);

  if (!dataGoKrKey) {
    console.log('HTTP Status: N/A');
    console.log('Provider Error Code: KEY_MISSING');
    console.log('Cause: DATA_GO_KR_SERVICE_KEY가 .env.local에 설정되지 않았습니다.');
  } else {
    // Try decoded and encoded
    const bldUrl = `${bldEndpoint}?serviceKey=${encodeURIComponent(dataGoKrKey)}&${bldParams}`;
    const res = await fetchUrl(bldUrl);
    console.log('HTTP Status:', res.status);
    console.log('Response Body:', res.data.substring(0, 500));
  }

  // 3. Small Enterprise Commercial Store API (소상공인 상가정보) Test
  console.log('\n--- 3. 소상공인시장진흥공단 상가(상권)정보 LIVE Test ---');
  const sdscEndpoint = 'https://apis.data.go.kr/B553077/api/open/sdsc2/storeListInRadius';
  const sdscParams = `radius=500&cx=${LNG}&cy=${LAT}&type=json`;
  console.log('Endpoint:', sdscEndpoint);
  console.log('Request Parameters:', sdscParams);

  if (!dataGoKrKey) {
    console.log('HTTP Status: N/A');
    console.log('Provider Error Code: KEY_MISSING');
    console.log('Cause: DATA_GO_KR_SERVICE_KEY가 .env.local에 설정되지 않았습니다.');
  } else {
    const sdscUrl = `${sdscEndpoint}?serviceKey=${encodeURIComponent(dataGoKrKey)}&${sdscParams}`;
    const res = await fetchUrl(sdscUrl);
    console.log('HTTP Status:', res.status);
    console.log('Response Body:', res.data.substring(0, 500));
  }
}

runDirectLiveVerification().catch(console.error);
