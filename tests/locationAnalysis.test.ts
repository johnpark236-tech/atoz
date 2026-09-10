import { parseKoreanAddress, buildPNU, geocodeAddress } from '../src/services/location/addressAdapter';
import { classifyBuildingPurpose, getBuildingRegister } from '../src/services/location/buildingRegisterAdapter';
import { getLandUseInfo } from '../src/services/location/landUseAdapter';
import { calculateDistance, matchStoreCategory, getCommercialAreaSummary } from '../src/services/location/commercialAreaAdapter';
import { calculateLocationScore, runAiEvaluation, analyzeLocation } from '../src/services/location/locationAnalysisService';
import { createDemoProject, saveSingleProject, loadProjects, buildCurrentAppState } from '../src/services/storage';
import { LocationAnalysisRecord, Project } from '../src/types';

// Mock localStorage in Node.js environment
class LocalStorageMock {
  private store: Record<string, string> = {};
  get length(): number {
    return Object.keys(this.store).length;
  }
  getItem(key: string): string | null {
    return this.store[key] !== undefined ? this.store[key] : null;
  }
  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }
  removeItem(key: string): void {
    delete this.store[key];
  }
  clear(): void {
    this.store = {};
  }
  key(index: number): string | null {
    const keys = Object.keys(this.store);
    return keys[index] || null;
  }
}

(globalThis as any).localStorage = new LocalStorageMock();

function assert(condition: boolean, testName: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${testName}`);
    process.exit(1);
  } else {
    console.log(`✅ PASS: ${testName}`);
  }
}

async function runLocationTests() {
  console.log('🚀 Starting Location & Commercial Analysis Comprehensive Test Suite...\n');

  // --------------------------------------------------------------------------
  // TEST 1: Address Parsing & PNU Generation
  // --------------------------------------------------------------------------
  console.log('--- TEST 1: Address Parsing & PNU Code Construction ---');
  const addr1 = parseKoreanAddress('충남 천안시 동남구 신부동 451-1');
  assert(addr1.sido === '충청남도', 'TEST 1.1: Sido extracted as 충청남도');
  assert(addr1.sigungu === '천안시 동남구', 'TEST 1.2: Sigungu extracted as 천안시 동남구');
  assert(addr1.bjdong === '신부동', 'TEST 1.3: Bjdong extracted as 신부동');
  assert(addr1.bun === '451', 'TEST 1.4: Bun extracted as 451');
  assert(addr1.ji === '1', 'TEST 1.5: Ji extracted as 1');

  const pnu1 = buildPNU('44131', '11400', false, '451', '1');
  assert(pnu1 === '4413111400104510001', `TEST 1.6: PNU 19-digits format exact (Got: ${pnu1})`);
  assert(pnu1.length === 19, 'TEST 1.7: PNU length is exactly 19 digits');

  // Test Apartment Address Parsing
  const addr2 = parseKoreanAddress('서울 강남구 대치동 316 은마아파트');
  assert(addr2.sido === '서울특별시', 'TEST 1.8: Seoul Sido extracted');
  assert(addr2.sigungu === '강남구', 'TEST 1.9: Gangnam Sigungu extracted');
  assert(addr2.bjdong === '대치동', 'TEST 1.10: Daechi-dong extracted');

  // Test Single-house Address Parsing
  const addr3 = parseKoreanAddress('충남 천안시 동남구 원성동 120-5 단독주택');
  assert(addr3.bjdong === '원성동', 'TEST 1.11: Wonseong-dong extracted');
  assert(addr3.bun === '120' && addr3.ji === '5', 'TEST 1.12: Bun/Ji extracted correctly');

  // --------------------------------------------------------------------------
  // TEST 2: Geocoding & Coordinate Resolution
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 2: Geocoding Resolution ---');
  const geo1 = await geocodeAddress('충남 천안시 동남구 신부동 451-1');
  assert(geo1.lat > 36.0 && geo1.lat < 38.0, 'TEST 2.1: Latitude within Korean bounds (Cheonan)');
  assert(geo1.lng > 126.0 && geo1.lng < 129.0, 'TEST 2.2: Longitude within Korean bounds (Cheonan)');
  assert(geo1.pnu.startsWith('4413111400'), 'TEST 2.3: Geocoded PNU has correct SGG & Dong prefix');

  const geoGangnam = await geocodeAddress('서울 강남구 역삼동 737');
  assert(geoGangnam.sggCd === '11680', 'TEST 2.4: Gangnam SGG code is 11680');
  assert(geoGangnam.lat > 37.49 && geoGangnam.lat < 37.52, 'TEST 2.5: Gangnam coordinates accurate');

  // --------------------------------------------------------------------------
  // TEST 3: Building Register Purpose Classification & Suitability
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 3: Building Register & Suitability Classification ---');
  const bldClassCafe = classifyBuildingPurpose('제2종근린생활시설', '휴게음식점', '카페');
  assert(bldClassCafe.suitabilityLevel === 'HIGH', 'TEST 3.1: Cafe in 제2종근린생활시설 is HIGH suitability');
  assert(bldClassCafe.recommendedChecks.length >= 2, 'TEST 3.2: Recommended checks generated for Cafe');

  const bldClassAcademy = classifyBuildingPurpose('제2종근린생활시설', '학원', '한국어 학원');
  assert(bldClassAcademy.suitabilityLevel === 'HIGH', 'TEST 3.3: Academy in 제2종근린생활시설 is HIGH suitability');
  assert(
    bldClassAcademy.recommendedChecks.some((c) => c.includes('교육청') || c.includes('소방')),
    'TEST 3.4: Academy checks include education office/fire code rules'
  );

  const bldClassHousing = classifyBuildingPurpose('공동주택', '아파트', '일반음식점');
  assert(bldClassHousing.suitabilityLevel === 'REQUIRES_PERMIT', 'TEST 3.5: Restaurant in residential apartment flagged as REQUIRES_PERMIT');

  const bldInfo = await getBuildingRegister(geo1, '카페');
  assert(!!bldInfo.buildingName, 'TEST 3.6: Building name returned');
  assert(!!bldInfo.mainPurpose, 'TEST 3.7: Main purpose returned');
  assert(bldInfo.grndFlrCnt !== null && bldInfo.grndFlrCnt >= 1, 'TEST 3.8: Floor count returned');

  // --------------------------------------------------------------------------
  // TEST 4: Land Use & Zoning Information
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 4: Land Use & Zoning ---');
  const landInfo = await getLandUseInfo(geo1);
  assert(!!landInfo.zoningArea, 'TEST 4.1: Zoning area returned');
  assert(landInfo.restrictions.length > 0, 'TEST 4.2: Urban planning restrictions list populated');

  // --------------------------------------------------------------------------
  // TEST 5: Commercial Area Analysis & Radius Queries
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 5: Commercial Area & Competitor Matching ---');
  // Distance test
  const dist = calculateDistance(36.8188, 127.1565, 36.8200, 127.1570);
  assert(dist > 0 && dist < 500, `TEST 5.1: Distance calculated in reasonable range (${dist}m)`);

  // Category matching test
  const cafeMatch = matchStoreCategory('스타벅스 천안신부점', '음식', '커피점/카페', '커피전문점', '카페');
  assert(cafeMatch.isSame === true, 'TEST 5.2: Starbucks matched as same category for Cafe');

  const academyMatch = matchStoreCategory('정철어학원', '학원/교육', '외국어학원', '어학원', '한국어 학원');
  assert(academyMatch.isSame === true, 'TEST 5.3: Academy matched as same category for Language Academy');

  // Commercial area summary test
  const commSummary = await getCommercialAreaSummary(geo1, '카페', 500);
  assert(commSummary.totalStoreCount > 0, 'TEST 5.4: Total store count is positive');
  assert(commSummary.competitors.length > 0, 'TEST 5.5: Competitors list populated');
  assert(commSummary.competitors[0].distance <= commSummary.competitors[commSummary.competitors.length - 1].distance, 'TEST 5.6: Competitors sorted by distance ascending');
  assert(commSummary.categoryCounts.length > 0, 'TEST 5.7: Industry category breakdown generated');

  // --------------------------------------------------------------------------
  // TEST 6: Location Scoring & Data Coverage
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 6: Location Scoring Engine ---');
  const score = calculateLocationScore(bldInfo, landInfo, commSummary, '카페');
  assert(score.overallScore >= 0 && score.overallScore <= 100, `TEST 6.1: Overall score in valid 0~100 range (${score.overallScore})`);
  assert(score.dataCoverage === 100, `TEST 6.2: Data coverage is 100% when all dimensions covered`);
  assert(score.breakdown.buildingSuitability.score <= 20, 'TEST 6.3: Building suitability subscore max 20');
  assert(score.breakdown.accessibility.score <= 20, 'TEST 6.4: Accessibility subscore max 20');
  assert(score.breakdown.competitionIntensity.score <= 20, 'TEST 6.5: Competition subscore max 20');

  // --------------------------------------------------------------------------
  // TEST 7: AI Location Evaluation (Resilient Fallback & Structure)
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 7: AI Location Evaluation ---');
  const aiEval = await runAiEvaluation(geo1, bldInfo, landInfo, commSummary, '카페', score, null);
  assert(!!aiEval.oneLineVerdict, 'TEST 7.1: One-line verdict generated');
  assert(['GOOD', 'CONDITIONAL', 'CAUTION', 'NOT_RECOMMENDED'].includes(aiEval.verdict), `TEST 7.2: Verdict enum valid (${aiEval.verdict})`);
  assert(aiEval.pros.length >= 1, 'TEST 7.3: Pros list populated');
  assert(aiEval.risks.length >= 1, 'TEST 7.4: Risks list populated');
  assert(aiEval.preLeaseChecklist.length >= 3, 'TEST 7.5: Pre-lease checklist items populated');
  assert(aiEval.legalDisclaimer.includes('참고 정보') || aiEval.legalDisclaimer.includes('지자체'), 'TEST 7.6: Mandatory legal disclaimer present');

  // --------------------------------------------------------------------------
  // TEST 8: Full Orchestration Pipeline (analyzeLocation)
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 8: Full Orchestrator analyzeLocation ---');
  const fullResult = await analyzeLocation('충남 천안시 동남구 신부동 451-1', '한국어 학원', 500);
  assert(fullResult.inputAddress === '충남 천안시 동남구 신부동 451-1', 'TEST 8.1: Input address preserved');
  assert(fullResult.businessType === '한국어 학원', 'TEST 8.2: Business type preserved');
  assert(fullResult.radius === 500, 'TEST 8.3: Radius preserved');
  assert(fullResult.sources.length === 4, 'TEST 8.4: Exactly 4 official sources recorded');
  assert(fullResult.phase2Metrics.floatingPopulation.status === 'NOT_CONNECTED', 'TEST 8.5: Phase 2 metrics marked unlinked transparently');

  // --------------------------------------------------------------------------
  // TEST 9: Project Persistence & Cloud Snapshot Sync Integration
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 9: Project Save & Cloud Snapshot Integration ---');
  const demoProj = createDemoProject();
  const savedRecord: LocationAnalysisRecord = {
    ...fullResult,
    id: fullResult.analysisId,
    projectId: demoProj.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const updatedProject: Project = {
    ...demoProj,
    locationAnalyses: [savedRecord],
  };

  saveSingleProject(updatedProject);
  const reloadedProjects = loadProjects();
  const targetProj = reloadedProjects.find((p) => p.id === demoProj.id);
  assert(!!targetProj, 'TEST 9.1: Target project reloaded from storage');
  assert(targetProj?.locationAnalyses?.length === 1, 'TEST 9.2: Location analysis saved in project');
  assert(targetProj?.locationAnalyses?.[0].inputAddress === '충남 천안시 동남구 신부동 451-1', 'TEST 9.3: Saved record address matches');
  assert(targetProj?.locationAnalyses?.[0].businessType === '한국어 학원', 'TEST 9.4: Saved record business type matches');

  // Cloud State Snapshot Check
  const cloudSnapshot = buildCurrentAppState();
  assert(
    cloudSnapshot.projects.some((p) => p.locationAnalyses && p.locationAnalyses.length > 0),
    'TEST 9.5: Cloud Snapshot contains location analyses for multi-device sync'
  );

  console.log('\n🎉 ALL 32 LOCATION ANALYSIS INTEGRATION TESTS PASSED PERFECTLY!\n');
}

runLocationTests().catch((e) => {
  console.error('Fatal test error:', e);
  process.exit(1);
});
