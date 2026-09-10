import { GoogleGenAI } from '@google/genai';
import { geocodeAddress } from './addressAdapter';
import { getBuildingRegister } from './buildingRegisterAdapter';
import { getLandUseInfo } from './landUseAdapter';
import { getCommercialAreaSummary } from './commercialAreaAdapter';
import {
  AddressInfo,
  AiLocationEvaluation,
  BuildingInfo,
  CommercialAreaSummary,
  DataSourceRecord,
  LandUseInfo,
  LocationAnalysisResult,
  LocationScore,
  Phase2Metrics,
  VerdictType,
} from './types';

export interface LocationAnalysisServiceConfig {
  vworldApiKey?: string;
  dataGoKrServiceKey?: string;
  geminiClient?: GoogleGenAI | null;
}

/**
 * Calculates objective location score based on available data.
 */
export function calculateLocationScore(
  building: BuildingInfo,
  landUse: LandUseInfo,
  commercial: CommercialAreaSummary,
  businessType: string
): LocationScore {
  let coveredItems = 0;
  const totalItems = 5;

  // 1. Building suitability score (/20)
  let buildingScore = 14;
  let buildingDesc = '건축물 용도 기본 적합';
  if (building.classification.suitabilityLevel === 'HIGH') {
    buildingScore = 19;
    buildingDesc = '희망 업종에 즉시 입점 가능한 최적의 건축물 용도';
  } else if (building.classification.suitabilityLevel === 'MEDIUM') {
    buildingScore = 13;
    buildingDesc = '업종 기재변경 또는 부속용도 적합성 검토 필요';
  } else if (building.classification.suitabilityLevel === 'REQUIRES_PERMIT') {
    buildingScore = 8;
    buildingDesc = '용도변경 허가/신고 및 인허가 선행 필수';
  }
  coveredItems++;

  // 2. Accessibility score (/20)
  let accessScore = 15;
  let accessDesc = '주요 도로 및 보행 접근성 양호';
  if (commercial.densityLevel === 'VERY_HIGH' || commercial.densityLevel === 'HIGH') {
    accessScore = 18;
    accessDesc = '유동인구 집중 상권 및 대중교통/도로 접근성 우수';
  } else if (commercial.densityLevel === 'LOW') {
    accessScore = 12;
    accessDesc = '주거 이면도로 위치로 목적형 방문 고객 유치 전략 필요';
  }
  coveredItems++;

  // 3. Competition Intensity score (/20)
  // Moderate competition with high customer draw is optimal (16~18)
  let compScore = 14;
  let compDesc = '동일/유사업종 적정 수준 분포';
  const same = commercial.sameCategoryCount;
  if (same === 0) {
    compScore = 17;
    compDesc = '반경 내 동일 업종 독점 진입 기회 우수';
  } else if (same >= 1 && same <= 4) {
    compScore = 18;
    compDesc = '상권 집객 효과를 공유하면서도 차별화 가능한 최적 경쟁 구도';
  } else if (same >= 5 && same <= 10) {
    compScore = 13;
    compDesc = '동일 업종 경쟁 다소 심화, 명확한 USP 및 마케팅 필요';
  } else {
    compScore = 9;
    compDesc = '동일 업종 과밀 경쟁 구역으로 치열한 가격/서비스 경쟁 예상';
  }
  coveredItems++;

  // 4. Commercial Density score (/20)
  let densityScore = 15;
  let densityDesc = '상가 및 편의시설 밀집도 양호';
  if (commercial.densityLevel === 'VERY_HIGH') {
    densityScore = 19;
    densityDesc = '핵심 상권 집중도로 배후 집객력 최상위';
  } else if (commercial.densityLevel === 'HIGH') {
    densityScore = 16;
    densityDesc = '활성 상권으로 시너지 창출 용이';
  } else if (commercial.densityLevel === 'LOW') {
    densityScore = 11;
    densityDesc = '상권 규모가 작아 온라인 마케팅 및 고정 배후수요 의존도 높음';
  }
  coveredItems++;

  // 5. Surrounding Demand score (/20)
  let demandScore = 16;
  let demandDesc = '주거 및 직장인 배후수요 탄탄';
  if (landUse.zoningArea.includes('상업')) {
    demandScore = 18;
    demandDesc = '상업·업무 복합지구로 광역 유동인구 및 직장인 수요 풍부';
  } else if (landUse.zoningArea.includes('주거')) {
    demandScore = 15;
    demandDesc = '아파트·주택 밀집 주거지역으로 가족 단위 및 지역 밀착 수요 중심';
  }
  coveredItems++;

  const overallScore = buildingScore + accessScore + compScore + densityScore + demandScore;
  const dataCoverage = Math.round((coveredItems / totalItems) * 100);

  return {
    overallScore,
    dataCoverage,
    breakdown: {
      buildingSuitability: { score: buildingScore, max: 20, label: '건축물 용도 적합성', description: buildingDesc },
      accessibility: { score: accessScore, max: 20, label: '입지 접근성', description: accessDesc },
      competitionIntensity: { score: compScore, max: 20, label: '경쟁 강도 및 독점도', description: compDesc },
      commercialDensity: { score: densityScore, max: 20, label: '상권 집객 밀집도', description: densityDesc },
      surroundingDemand: { score: demandScore, max: 20, label: '배후 수요 잠재력', description: demandDesc },
    },
  };
}

/**
 * Runs AI comprehensive evaluation or domain expert fallback.
 */
export async function runAiEvaluation(
  address: AddressInfo,
  building: BuildingInfo,
  landUse: LandUseInfo,
  commercial: CommercialAreaSummary,
  businessType: string,
  score: LocationScore,
  geminiClient?: GoogleGenAI | null
): Promise<AiLocationEvaluation> {
  const legalDisclaimer =
    '본 분석 결과는 공공데이터 및 GIS 기반의 입지 참고 정보이며, 실제 영업신고·인허가·건축물 용도변경·소방필증 발급 가능 여부는 관할 지자체 및 유관기관에 반드시 사전 확인해야 합니다.';

  // If Gemini client is available, query live model
  if (geminiClient) {
    try {
      const prompt = `
당신은 대한민국 최고의 GIS 상권분석가이자 창업 입지 전문 컨설턴트입니다.
아래 공공데이터 조사 결과를 바탕으로 예비창업자가 해당 주소지에서 [${businessType || '일반 점포'}]을 창업/입점하는 것에 대한 종합 평가 보고서를 작성하십시오.

[조사 대상 점포 및 공공데이터]
- 입력 주소: ${address.rawAddress} (${address.roadAddress} / ${address.jibunAddress})
- 희망 업종: ${businessType || '미지정 (일반 상가)'}
- 건축물 주용도: ${building.mainPurpose} (기타: ${building.etcPurpose})
- 건축물 구조 및 규모: ${building.structure}, 지상 ${building.grndFlrCnt || '-'}층 / 지하 ${building.ugrndFlrCnt || '-'}층 (연면적: ${building.totArea || '-'}㎡)
- 건축물 용도 판정: ${building.classification.category} (${building.classification.suitabilityLevel})
- 토지 용도지역: ${landUse.zoningArea} (${landUse.zoningDistrict})
- 반경 ${commercial.radius}m 상권: 전체 점포 ${commercial.totalStoreCount}개, 동일 업종 ${commercial.sameCategoryCount}개, 유사 업종 ${commercial.similarCategoryCount}개
- 상권 밀집도: ${commercial.densityLevel} (${commercial.densityDescription})
- 입지 종합점수: ${score.overallScore} / 100점 (데이터 커버리지: ${score.dataCoverage}%)

[응답 요구사항]
반드시 아래 JSON 형식으로만 응답하십시오 (마크다운 코드블록 없이 순수 JSON 또는 \`\`\`json 형식):
{
  "oneLineVerdict": "한 줄 핵심 입지 평가 요약",
  "verdict": "GOOD" | "CONDITIONAL" | "CAUTION" | "NOT_RECOMMENDED",
  "pros": ["장점1", "장점2", "장점3"],
  "risks": ["위험요인1", "위험요인2", "위험요인3"],
  "businessSuitability": "업종 적합성 상세 설명",
  "competitionAnalysis": "경쟁 현황 및 대응 전략",
  "requiredPermitsAndChecks": ["필수 확인사항1", "필수 확인사항2", "필수 확인사항3"],
  "preLeaseChecklist": ["임대차 계약 전 체크사항1", "임대차 계약 전 체크사항2", "임대차 계약 전 체크사항3"]
}
`;

      const response = await geminiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          temperature: 0.3,
        },
      });

      const text = response.text || '';
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      let verdict: VerdictType = 'CONDITIONAL';
      if (['GOOD', 'CONDITIONAL', 'CAUTION', 'NOT_RECOMMENDED'].includes(parsed.verdict)) {
        verdict = parsed.verdict as VerdictType;
      }

      return {
        oneLineVerdict: parsed.oneLineVerdict || '입지 조건과 상권 환경이 양호한 편입니다.',
        verdict,
        pros: Array.isArray(parsed.pros) ? parsed.pros : ['상권 접근성 양호'],
        risks: Array.isArray(parsed.risks) ? parsed.risks : ['주변 경쟁점포 확인 필요'],
        businessSuitability: parsed.businessSuitability || '건축물 및 상권 조건에 부합합니다.',
        competitionAnalysis: parsed.competitionAnalysis || '경쟁 점포와의 차별화가 필요합니다.',
        requiredPermitsAndChecks: Array.isArray(parsed.requiredPermitsAndChecks)
          ? parsed.requiredPermitsAndChecks
          : building.classification.recommendedChecks,
        preLeaseChecklist: Array.isArray(parsed.preLeaseChecklist)
          ? parsed.preLeaseChecklist
          : [
              '전 임차인의 영업허가 폐업신고 완료 여부 확인 (신규 영업신고 불가 방지)',
              '정화조 용량 및 하수도원인자부담금 승계 여부',
              '전기 승압(kW) 비용 및 건물주 동의 여부',
            ],
        legalDisclaimer,
        source: 'Gemini 3.8 Flash AI Location Engine',
      };
    } catch (err) {
      console.warn('Gemini AI location evaluation failed, using domain expert fallback:', err);
    }
  }

  // Domain Expert Fallback Logic
  let verdict: VerdictType = 'GOOD';
  let oneLineVerdict = `[${businessType || '신규 점포'}] 입점에 적합한 상권 환경과 건축물 용도를 갖추고 있습니다.`;

  if (score.overallScore >= 80 && building.classification.suitabilityLevel === 'HIGH') {
    verdict = 'GOOD';
    oneLineVerdict = `[${businessType || '해당 점포'}] 상권 활성도와 건축물 인허가 조건이 매우 우수한 추천 입지입니다.`;
  } else if (building.classification.suitabilityLevel === 'REQUIRES_PERMIT') {
    verdict = 'CAUTION';
    oneLineVerdict = '건축물 용도변경 또는 행정 인허가 확인이 필수적인 주의 입지입니다.';
  } else if (score.overallScore < 60 || commercial.sameCategoryCount > 10) {
    verdict = 'CONDITIONAL';
    oneLineVerdict = '상권 내 동종업종 밀집도가 높아 차별화된 전략과 타깃 선점이 필요한 조건부 추천 입지입니다.';
  } else {
    verdict = 'CONDITIONAL';
    oneLineVerdict = '기본 상권 배후수요가 양호하며, 세부 인허가 및 계약 조건 확인 후 진입을 권장합니다.';
  }

  const pros = [
    `건축물 용도(${building.mainPurpose}) 기준 ${building.classification.suitabilitySummary}`,
    `반경 ${commercial.radius}m 내 ${commercial.totalStoreCount}개 점포가 형성된 ${commercial.densityDescription}`,
    `용도지역(${landUse.zoningArea}) 기반 안정적인 배후수요 확보 가능`,
  ];

  const risks = [
    commercial.sameCategoryCount > 3
      ? `반경 내 동일 업종 점포(${commercial.sameCategoryCount}개)와의 직접 경쟁 심화 가능성`
      : '초기 인지도 확보를 위한 지역 기반 로컬 마케팅 필요',
    '건물 노후도 및 사용승인일에 따른 시설 보수 및 설비 인입 비용 검토 요망',
  ];

  const preLeaseChecklist = [
    '전 임차인의 영업신고증 폐업 여부 확인 (기존 영업 미폐업 시 신규 허가 지연)',
    '건축물 정화조 용량 초과 여부 및 오수처리시설 확인 (식음료/학원 필수)',
    '전기 계약전력(kW) 용량 확인 및 추가 승압 공사 비용/건물주 동의 여부',
    '간판 설치 위치 및 옥외광고물 허가 규격 확인',
    '원상복구 범위 및 렌트프리(인테리어 공사기간 임대료 면제) 협의',
  ];

  return {
    oneLineVerdict,
    verdict,
    pros,
    risks,
    businessSuitability: `현재 건축물 용도는 [${building.mainPurpose}]로, ${building.classification.suitabilitySummary}`,
    competitionAnalysis: `반경 ${commercial.radius}m 기준 동일 업종 점포 ${commercial.sameCategoryCount}개, 유사 업종 ${commercial.similarCategoryCount}개가 운영 중입니다.`,
    requiredPermitsAndChecks: building.classification.recommendedChecks,
    preLeaseChecklist,
    legalDisclaimer,
    source: 'BizFlow AtoZ Domain GIS Expert Engine',
  };
}

/**
 * Main Location Analysis Orchestrator
 */
export async function analyzeLocation(
  rawAddress: string,
  businessType: string = '카페',
  radius: number = 500,
  config: LocationAnalysisServiceConfig = {}
): Promise<LocationAnalysisResult> {
  const now = new Date().toISOString();
  const analysisId = `LOC-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  // Step 1: Geocoding & PNU Extraction
  const address = await geocodeAddress(rawAddress, config.vworldApiKey);

  // Step 2: Building Register Query & Classification
  const building = await getBuildingRegister(address, businessType, config.dataGoKrServiceKey);

  // Step 3: Land Use & Zoning Information
  const landUse = await getLandUseInfo(address, config.vworldApiKey);

  // Step 4: Commercial Store & Competitor Data
  const commercialArea = await getCommercialAreaSummary(
    address,
    businessType,
    radius,
    config.dataGoKrServiceKey
  );

  // Step 5: Location Score & Coverage Calculation
  const score = calculateLocationScore(building, landUse, commercialArea, businessType);

  // Step 6: Phase 2 Metrics Indicator (Transparent status)
  const phase2Metrics: Phase2Metrics = {
    floatingPopulation: {
      status: 'NOT_CONNECTED',
      label: '시간대별 유동인구 / 통신사 생활인구',
      description: '소상공인365 / 통신사 빅데이터 API 연동 준비 중 (추가 API 연결 필요)',
    },
    cardSales: {
      status: 'NOT_CONNECTED',
      label: '상권 카드 추정매출 및 객단가',
      description: '카드사 가맹점 통계 API 연동 준비 중 (추가 API 연결 필요)',
    },
    demographics: {
      status: 'NOT_CONNECTED',
      label: '주거·직장 인구 및 연령별 구성',
      description: '통계청 SGIS 인구통계 API 연동 준비 중 (추가 API 연결 필요)',
    },
    openCloseRate: {
      status: 'NOT_CONNECTED',
      label: '업종별 개업·폐업률 추이',
      description: '국세청/소진공 개폐업 동향 API 연동 준비 중 (추가 API 연결 필요)',
    },
  };

  // Step 7: AI Comprehensive Analysis
  const aiAnalysis = await runAiEvaluation(
    address,
    building,
    landUse,
    commercialArea,
    businessType,
    score,
    config.geminiClient
  );

  // Step 8: Data Sources Logging
  const sources: DataSourceRecord[] = [
    {
      provider: '국토교통부',
      dataset: '건축HUB 건축물대장정보 서비스 (표제부/용도)',
      retrievedAt: now,
      officialUrl: 'https://www.data.go.kr/data/15044438/openapi.do',
      status: building.sourceStatus,
    },
    {
      provider: '소상공인시장진흥공단',
      dataset: '상가(상권)정보 서비스 (반경내 점포/경쟁점포)',
      retrievedAt: now,
      officialUrl: 'https://www.data.go.kr/data/15012005/openapi.do',
      status: commercialArea.sourceStatus,
    },
    {
      provider: '공간정보산업진흥원 (VWorld)',
      dataset: 'VWorld 전자지도 및 Geocoder 주소변환',
      retrievedAt: now,
      officialUrl: 'https://www.vworld.kr/dev/v4dv_geocoderguide2_s001.do',
      status: address.sourceStatus,
    },
    {
      provider: '토지이음 (국토교통부)',
      dataset: '국토이용계획 및 토지이용계획정보',
      retrievedAt: now,
      officialUrl: 'https://www.eum.go.kr',
      status: landUse.sourceStatus,
    },
  ];

  return {
    analysisId,
    analyzedAt: now,
    inputAddress: rawAddress,
    businessType,
    radius,
    address,
    building,
    landUse,
    commercialArea,
    phase2Metrics,
    score,
    aiAnalysis,
    sources,
  };
}
