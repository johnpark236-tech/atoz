async function testLiveCloudRun() {
  const backendUrl = 'https://atoz-backend-363284724091.asia-northeast3.run.app';

  console.log('================================================================');
  console.log('🌐 TESTING LIVE CLOUD RUN BACKEND DEPLOYMENT');
  console.log('Endpoint:', backendUrl);
  console.log('================================================================\n');

  console.log('--- 1. Testing GET /api/health ---');
  const healthRes = await fetch(backendUrl + '/api/health');
  console.log('Health HTTP Status:', healthRes.status);
  const healthJson = await healthRes.json();
  console.log('Health Data:', healthJson);

  console.log('\n--- 2. Testing POST /api/market-research (Live Google Search Grounding) ---');
  const prompt = `
[고객 아이디어]
- 아이디어/프로젝트명: AI 기반 소상공인 창업지원 플랫폼
- 핵심 설명: 소상공인을 위한 상권분석, 건축물대장 자동조회, AI 사업계획서 생성
- 목표시장: 대한민국

[요청]
2026년 기준 대한민국 소상공인 창업지원 시장 규모, 주요 공공/민간 경쟁사, 수익화 모델을 3개 단락으로 요약하고 실시간 검색 출처를 제공해줘.
`;

  const startTime = Date.now();
  const mrRes = await fetch(backendUrl + '/api/market-research', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });
  const duration = Date.now() - startTime;
  console.log('Market Research HTTP Status:', mrRes.status, `(${duration}ms)`);
  const mrJson = await mrRes.json();
  console.log('Market Research Details:', {
    source: mrJson.source,
    grounded: mrJson.grounded,
    model: mrJson.model,
    searchedAt: mrJson.searchedAt,
    searchQueriesCount: mrJson.searchQueries?.length,
    searchQueries: mrJson.searchQueries,
    sourcesCount: mrJson.sources?.length,
    sourcesSample: mrJson.sources?.slice(0, 5),
    reportLength: mrJson.report?.length,
  });

  console.log('\n--- 3. Testing POST /api/location/analyze (Cheonan Live Location Analysis) ---');
  const locRes = await fetch(backendUrl + '/api/location/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      address: '충청남도 천안시 동남구 신부동 462-1',
      businessType: '카페',
      radius: 500,
    }),
  });
  console.log('Location Analyze HTTP Status:', locRes.status);
  const locJson = await locRes.json();
  console.log('Location Analyze Details:', {
    pnu: locJson.address?.pnu,
    sido: locJson.address?.sido,
    sigungu: locJson.address?.sigungu,
    bjdong: locJson.address?.bjdong,
    buildingName: locJson.building?.buildingName,
    mainPurpose: locJson.building?.mainPurpose,
    suitabilityLevel: locJson.building?.classification?.suitabilityLevel,
    totalStores: locJson.commercial?.totalStoreCount,
    sameCategoryStores: locJson.commercial?.competitorCount,
    overallScore: locJson.score?.overallScore,
    verdict: locJson.evaluation?.verdict,
    sources: locJson.sources?.map((s: any) => ({ name: s.sourceName, status: s.status })),
  });

  console.log('\n================================================================');
  console.log('✅ ALL CLOUD RUN LIVE ENDPOINT TESTS COMPLETED SUCCESSFULLY');
  console.log('================================================================');
}

testLiveCloudRun().catch((err) => {
  console.error('❌ Cloud Run live test error:', err);
  process.exit(1);
});
