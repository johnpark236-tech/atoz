import { analyzeLocation } from '../src/services/location/locationAnalysisService';
import dotenv from 'dotenv';

dotenv.config();

async function runLiveTest() {
  console.log('================================================================');
  console.log('LIVE Public API Integration Test — Cheonan Address');
  console.log('================================================================\n');

  const testAddress = '충청남도 천안시 동남구 신부동 462-1';
  const dataGoKrKey = process.env.DATA_GO_KR_SERVICE_KEY || process.env.PUBLIC_DATA_PORTAL_KEY;
  const vworldKey = process.env.VWORLD_API_KEY;

  console.log('Environment Key Status:');
  console.log('- DATA_GO_KR_SERVICE_KEY configured:', Boolean(dataGoKrKey));
  console.log('- VWORLD_API_KEY configured:', Boolean(vworldKey));
  console.log('- TEST ADDRESS:', testAddress);

  const result = await analyzeLocation(testAddress, '카페', 500, {
    dataGoKrServiceKey: dataGoKrKey,
    vworldApiKey: vworldKey,
  });

  console.log('\n--- Result Summary ---');
  console.log('Address Geocoding Status:', result.address.sourceStatus);
  console.log('Road Address:', result.address.roadAddress);
  console.log('Jibun Address:', result.address.jibunAddress);
  console.log('Lat / Lng:', result.address.lat, result.address.lng);
  console.log('PNU:', result.address.pnu);
  console.log('Building Register Status:', result.building.sourceStatus);
  console.log('Building Name:', result.building.buildingName);
  console.log('Building Main Purpose:', result.building.mainPurpose);
  console.log('Commercial Area Status:', result.commercialArea.sourceStatus);
  console.log('Total Stores in 500m:', result.commercialArea.totalStoreCount);
  console.log('Same Category (Cafe) Count:', result.commercialArea.sameCategoryCount);
  console.log('Competitors Found:', result.commercialArea.competitors.length);
}

runLiveTest().catch(console.error);
