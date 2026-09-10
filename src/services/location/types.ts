export type SourceStatus =
  | 'LIVE_API'
  | 'REFERENCE_DATA'
  | 'VERIFICATION_REQUIRED'
  | 'DATA_UNAVAILABLE'
  | 'API_KEY_REQUIRED';

export type SuitabilityLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'REQUIRES_PERMIT';

export type VerdictType = 'GOOD' | 'CONDITIONAL' | 'CAUTION' | 'NOT_RECOMMENDED';

export interface AddressInfo {
  rawAddress: string;
  roadAddress: string;
  jibunAddress: string;
  lat: number;
  lng: number;
  sido: string;
  sigungu: string;
  bjdong: string;
  hjdong?: string;
  pnu: string;
  sggCd: string; // 5-digit sigungu code
  bjdongCd: string; // 5-digit bjdong code
  bun: string; // 4-digit main number
  ji: string; // 4-digit sub number
  sourceStatus: SourceStatus;
}

export interface BuildingPurposeClassification {
  category: string; // e.g. 제2종근린생활시설, 제1종근린생활시설, 교육연구시설, 업무시설, 주거시설 등
  mainPurposeName: string;
  etcPurposeName: string;
  suitabilityLevel: SuitabilityLevel;
  suitabilitySummary: string;
  recommendedChecks: string[];
}

export interface BuildingInfo {
  buildingName: string;
  jibunAddress: string;
  roadAddress: string;
  mainPurpose: string;
  etcPurpose: string;
  structure: string;
  platArea: number | null; // 대지면적 m²
  archArea: number | null; // 건축면적 m²
  totArea: number | null; // 연면적 m²
  bcRat: number | null; // 건폐율 %
  vlRat: number | null; // 용적률 %
  grndFlrCnt: number | null; // 지상층수
  ugrndFlrCnt: number | null; // 지하층수
  rideUseElvtCnt: number | null; // 승강기수
  parkingCnt: number | null; // 총 주차대수
  pmsDay: string | null; // 허가일
  stcnsDay: string | null; // 착공일
  useAprDay: string | null; // 사용승인일
  sourceStatus: SourceStatus;
  classification: BuildingPurposeClassification;
}

export interface LandUseInfo {
  zoningArea: string; // 용도지역 (예: 제2종일반주거지역, 일반상업지역)
  zoningDistrict: string; // 용도지구
  zoningSection: string; // 용도구역
  districtPlan: boolean | string; // 지구단위계획구역 여부
  restrictions: string[]; // 행위제한 및 참고사항
  sourceStatus: SourceStatus;
}

export interface CommercialStore {
  id: string;
  name: string;
  branch?: string;
  mainCategory: string; // 대분류 (음식, 학원, 소매 등)
  midCategory: string; // 중분류
  subCategory: string; // 소분류
  industryCode: string;
  address: string;
  roadAddress: string;
  lat: number;
  lng: number;
  distance: number; // 거리(미터)
  isSameCategory: boolean;
  isSimilarCategory: boolean;
}

export interface CommercialCategoryCount {
  category: string;
  count: number;
  percentage: number;
}

export interface CommercialAreaSummary {
  radius: number; // 300, 500, 1000
  totalStoreCount: number;
  categoryCounts: CommercialCategoryCount[];
  sameCategoryCount: number;
  similarCategoryCount: number;
  densityLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
  densityDescription: string;
  competitors: CommercialStore[];
  sourceStatus: SourceStatus;
}

export interface Phase2Metrics {
  floatingPopulation: {
    status: 'NOT_CONNECTED' | 'AVAILABLE';
    label: string;
    description: string;
  };
  cardSales: {
    status: 'NOT_CONNECTED' | 'AVAILABLE';
    label: string;
    description: string;
  };
  demographics: {
    status: 'NOT_CONNECTED' | 'AVAILABLE';
    label: string;
    description: string;
  };
  openCloseRate: {
    status: 'NOT_CONNECTED' | 'AVAILABLE';
    label: string;
    description: string;
  };
}

export interface ScoreDimension {
  score: number;
  max: number;
  label: string;
  description: string;
}

export interface LocationScore {
  overallScore: number; // 100점 만점
  dataCoverage: number; // % (데이터 가용성 비율)
  breakdown: {
    buildingSuitability: ScoreDimension;
    accessibility: ScoreDimension;
    competitionIntensity: ScoreDimension;
    commercialDensity: ScoreDimension;
    surroundingDemand: ScoreDimension;
  };
}

export interface AiLocationEvaluation {
  oneLineVerdict: string;
  verdict: VerdictType;
  pros: string[];
  risks: string[];
  businessSuitability: string;
  competitionAnalysis: string;
  requiredPermitsAndChecks: string[];
  preLeaseChecklist: string[];
  legalDisclaimer: string;
  source: string;
}

export interface DataSourceRecord {
  provider: string;
  dataset: string;
  retrievedAt: string;
  officialUrl: string;
  status: SourceStatus;
}

export interface LocationAnalysisResult {
  analysisId: string;
  projectId?: string;
  analyzedAt: string;
  inputAddress: string;
  businessType: string;
  radius: number;
  address: AddressInfo;
  building: BuildingInfo;
  landUse: LandUseInfo;
  commercialArea: CommercialAreaSummary;
  phase2Metrics: Phase2Metrics;
  score: LocationScore;
  aiAnalysis: AiLocationEvaluation;
  sources: DataSourceRecord[];
}

export interface LocationAnalysisRecord extends LocationAnalysisResult {
  id: string;
  createdAt: string;
  updatedAt: string;
}
