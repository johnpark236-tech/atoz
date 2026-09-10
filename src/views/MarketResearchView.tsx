import React, { useMemo, useState, useEffect } from 'react';
import { Project } from '../types';
import {
  BarChart3,
  Clipboard,
  CheckCircle2,
  Search,
  Sparkles,
  AlertTriangle,
  MapPin,
  ArrowRight,
  ExternalLink,
  Globe,
  Layers,
  Clock,
  Check,
} from 'lucide-react';
import { LocationAnalysisView } from './LocationAnalysisView';

interface MarketResearchViewProps {
  project: Project;
  onProjectUpdated?: (updated: Project) => void;
  initialSubTab?: 'idea' | 'location';
  activeTabKey?: string;
  onSubTabChange?: (subTab: 'idea' | 'location') => void;
}

interface ResearchForm {
  ideaName: string;
  ideaSummary: string;
  problem: string;
  targetCustomer: string;
  targetModels: string[];
  marketRegion: string;
  businessModel: string;
  priceModel: string;
  competitors: string;
  differentiation: string;
  technology: string;
  regulation: string;
  resources: string;
  successGoal: string;
  other: string;
}

interface MarketResearchSource {
  title: string;
  url: string;
  domain: string;
}

interface MarketResearchResponse {
  report: string;
  source: string;
  grounded?: boolean;
  model?: string;
  searchedAt?: string;
  searchQueries?: string[];
  sources?: MarketResearchSource[];
  warnings?: string[];
}

const CUSTOMER_MODELS = [
  {
    id: 'B2C',
    label: '일반 소비자 B2C',
    description: '플랫폼/서비스가 최종 소비자에게 직접 가치를 제공',
  },
  {
    id: 'B2B',
    label: '기업·사업자 B2B',
    description: '기업, 매장, 브랜드, 사업자가 직접 고객',
  },
  {
    id: 'B2B2C',
    label: '사업자→플랫폼→소비자 B2B2C',
    description: '사업자 상품·재고·서비스를 플랫폼이 소비자 선택/구매와 연결',
  },
  {
    id: 'B2G',
    label: '정부·지자체·공공기관 B2G',
    description: '정부·지자체·공공기관에 솔루션/서비스를 공급',
  },
  {
    id: 'B2G2C',
    label: '공공기관→플랫폼→시민 B2G2C',
    description: '공공기관이 도입하고 플랫폼을 통해 시민에게 서비스 제공',
  },
  {
    id: 'B2B_SAAS',
    label: '사업자용 B2B SaaS',
    description: '사업자 관리도구, 분석, CRM, 운영 자동화 등을 구독으로 제공',
  },
  {
    id: 'B2B_API',
    label: 'B2B API·SDK·데이터',
    description: 'API, SDK, 데이터, 추천엔진 등을 다른 기업/서비스에 공급',
  },
];

const buildPrompt = (form: ResearchForm, project: Project) => `
[역할]
당신은 20년 경력의 글로벌 시장조사 책임자, 스타트업 투자심사역, 플랫폼 비즈니스 전략가, 제품전략가, 경쟁정보(Competitive Intelligence) 분석가입니다.
단순히 아이디어를 칭찬하지 말고, 2026년 현재 시장에서 실제로 사업이 될 수 있는지 냉정하고 검증 가능하게 조사하십시오.

[최우선 조사 방식]
1. 웹 검색 또는 실시간 검색 기능을 사용할 수 있다면 반드시 사용하십시오.
2. 공식기관, 기업 공식사이트, 공시, 정부 통계, 산업협회, 신뢰도 높은 언론/리서치 자료를 우선하십시오.
3. 경쟁사·가격·서비스 기능·시장규모·정책·규제는 가능한 한 현재 기준으로 직접 확인하십시오.
4. 검색한 자료에는 URL과 확인일 또는 자료 기준연도를 표시하십시오.
5. 실시간 검색이 불가능한 환경이라면 그 사실을 명확히 밝히고, 검색이 필요한 항목을 별도 목록으로 남기십시오.

[조사 원칙]
1. 한국 시장을 기본으로 하되 해외 유사사례가 있으면 미국·일본·유럽·동남아까지 확장하십시오.
2. 사실, 추정, 가설을 명확히 구분하십시오.
3. 숫자와 시장규모는 출처와 기준연도를 표시하십시오. 확인되지 않는 수치는 임의로 만들지 마십시오.
4. 경쟁사는 직접경쟁, 간접경쟁, 대체재, 잠재 플랫폼 경쟁자로 구분하십시오.
5. "좋은 아이디어"라는 결론을 미리 정하지 말고 NO-GO 가능성도 동일하게 검토하십시오.
6. 법률·규제·특허·상표·개인정보 관련 내용은 참고정보로 제공하고 공식기관 또는 전문가 확인 필요 여부를 표시하십시오.
7. 사용자가 제공하지 않은 정보를 사실처럼 단정하지 말고 필요한 경우 가설로 표시하십시오.
8. 조사 결과는 한국어로 작성하십시오.
9. 플랫폼형 사업은 공급자와 최종소비자를 한 고객군으로 섞지 말고 각각 분리 분석하십시오.
10. 마지막에 반드시 GO / CONDITIONAL GO / PIVOT / NO-GO 중 하나를 선택하고 근거를 제시하십시오.

[고객 아이디어]
- 아이디어/프로젝트명: ${form.ideaName}
- 핵심 설명: ${form.ideaSummary}
- 해결하려는 문제: ${form.problem || '미입력'}
- 선택한 고객/사업 모델: ${form.targetModels.length ? form.targetModels.join(', ') : '미선택 — 조사 과정에서 적합 모델 판별'}
- 상세 목표 고객: ${form.targetCustomer || project.profile.targetCustomers.join(', ')}
- 프로젝트 기존 고객정보: ${project.profile.targetCustomers.join(', ') || '미입력'}
- 목표 시장/지역: ${form.marketRegion || '대한민국 우선, 필요 시 해외 비교'}
- 사업유형: ${project.profile.businessTypes.join(', ')}
- 판매/유통 채널: ${project.profile.salesChannels.join(', ')}
- 현재 준비단계: ${project.profile.stage}
- 사업자 상태: ${project.profile.corporateStatus}
- 인력구성: ${project.profile.staffing}
- 해외판매 계획: ${project.profile.hasOverseasSales}
- 예상 수익모델: ${form.businessModel || '미입력'}
- 가격/과금 아이디어: ${form.priceModel || '미입력'}
- 알고 있는 경쟁사/대체재: ${form.competitors || '미입력 — 직접 검색하여 찾을 것'}
- 차별점: ${form.differentiation || '미입력'}
- 핵심 기술/데이터: ${form.technology || '미입력'}
- 예상 규제/인허가: ${form.regulation || '미입력'}
- 현재 보유 자원/역량: ${form.resources || '미입력'}
- 성공 목표: ${form.successGoal || '미입력'}
- 기타 추가 아이디어/조건: ${form.other || '없음'}

[플랫폼/B2B2C/B2G2C 필수 분석 규칙]
아이디어가 B2B2C 또는 B2G2C에 해당하거나 해당 가능성이 있으면 반드시 아래 구조를 별도 분석하십시오.

1. Payer — 실제 돈을 지불하는 주체
2. User — 서비스를 직접 사용하는 주체
3. Beneficiary — 최종 혜택을 받는 주체
4. Supplier — 상품/재고/콘텐츠/서비스/데이터를 공급하는 주체
5. Platform — 매칭·추천·거래·데이터·결제를 연결하는 주체
6. Consumer/Citizen — 최종 선택·방문·클릭·구매·이용 행동을 만드는 주체
7. 각 참여자가 플랫폼에 들어와야 하는 이유와 이탈하는 이유
8. 공급자 확보 전략과 최종 소비자 확보 전략을 별도로 작성
9. Chicken-and-Egg 문제(공급자가 먼저인가 소비자가 먼저인가) 해결 전략
10. 네트워크 효과가 실제로 발생하는지, 발생한다면 어떤 데이터/거래/리뷰가 해자를 만드는지 검증
11. 플랫폼이 단순 광고매체인지, 거래/추천/운영 인프라인지 판별
12. 사업자 매출과 소비자 행동이 어떻게 연결되는지 KPI로 정의

예시 구조:
사업자/브랜드/매장
→ 상품·재고·프로모션·데이터 제공
→ 플랫폼의 AI/데이터 추천·매칭
→ 최종 소비자
→ 클릭·방문·구매
→ 성과데이터가 다시 사업자/플랫폼에 축적

공공형이면:
지자체/공공기관
→ 플랫폼 도입·예산·공공데이터 제공
→ 플랫폼
→ 시민
→ 이용·행동·정책성과

[수익모델 비교 규칙]
다음 모델을 사업에 적용 가능한지 각각 검토하고 현실성 순위를 매기십시오.
- B2C 유료구독/인앱결제
- B2B 사업자 구독
- B2B2C 거래/성과 수수료
- 광고/추천 노출료
- 제휴/CPA/CPS
- B2B SaaS
- B2B API/SDK/데이터 라이선스
- B2G 구축/라이선스/운영비
- B2G2C 공공서비스 운영
- 화이트라벨/OEM
- 데이터 분석 리포트

수익모델마다 다음을 작성하십시오:
누가 지불하는가 / 무엇에 지불하는가 / 과금단위 / 예상가격범위 / 장점 / 위험 / 검증방법.

[요청: A to Z 시장조사 보고서]
아래 A~Z 26개 항목을 빠짐없이 작성하십시오.

A. Abstract — 아이디어 한 문장 정의, 가장 적합한 고객모델(B2C/B2B/B2B2C/B2G/B2G2C 등), 핵심 결론
B. Buyer Problem — Payer/User/Beneficiary별 문제, 빈도·강도·지불의사
C. Customer Segments — 핵심 고객군, Early Adopter, B2C/B2B/B2B2C/B2G/B2G2C를 구분하고 Payer/User/Beneficiary를 표로 작성
D. Demand Evidence — 검색수요, 커뮤니티 반응, 기존 소비행태, 기업/사업자 수요, 공공수요 등 실제 증거
E. Existing Alternatives — 현재 각 참여자가 문제를 해결하는 방식과 대체재
F. Field & Market Size — 시장 정의, TAM/SAM/SOM. B2B2C면 공급자 시장과 소비자 시장을 분리 산정 후 연결 가능한 시장을 별도로 추정
G. Growth Drivers — 성장요인, 기술·정책·인구·소비·지역상권·AI/데이터 트렌드
H. Headwinds — 시장을 막는 구조적 악재, 플랫폼 콜드스타트, CAC, 공급부족, 규제 등 실패 요인
I. Industry Structure — 공급자→플랫폼→최종고객 가치사슬, 돈의 흐름, 데이터 흐름, 의사결정권자, 규제기관
J. Jobs To Be Done — 사업자/기업/공공기관/최종소비자 각각의 JTBD와 이용상황
K. Key Competitors — 국내외 경쟁사 표: 서비스, 국가, 고객모델, Payer, User, 가격, 수익모델, 강점, 약점, 차이점, 공식 URL
L. Legal / Regulation — 국내 규제, 인허가, 개인정보, 위치정보, 소비자보호, 추천/광고표시, 데이터/AI 관련 위험
M. Monetization — B2C/B2B/B2B2C/B2G/B2G2C 수익모델을 비교하고 1순위·2순위·장기모델 제안
N. Numbers & Unit Economics — ARPU/객단가, 사업자 CAC, 소비자 CAC, LTV, take rate, gross margin, churn, payback period, 손익분기. 데이터 부족 시 시나리오
O. Opportunity Gap — 경쟁사가 해결하지 못하는 빈틈, 지역/세대/데이터/유통/추천/공공 영역의 진입기회
P. Positioning — 최종소비자용 포지셔닝과 사업자/기관용 포지셔닝을 각각 한 문장으로 작성
Q. Questions To Validate — Payer/User/Supplier/Consumer별 핵심 가설 최소 12개와 검증방법
R. Risks — 시장/기술/재무/법률/운영/공급자확보/소비자확보/플랫폼 의존/모방 위험을 High/Medium/Low 평가
S. Sales & Go-To-Market — 공급자 10→100→1,000개 확보전략과 소비자 100→1,000→10,000명 확보전략을 분리. B2G는 첫 PoC→본사업→타지역 확장 경로 포함
T. Technology Feasibility — 2026년 기술수준에서 필요한 API/AI/공공데이터/추천엔진/재고연동/결제/위치/분석 인프라, Build vs Buy
U. USP — 소비자에게 10초 안에 설명하는 USP 3개 + 사업자/기관에게 설명하는 USP 3개
V. Validation Plan — 2주, 30일, 90일 검증계획. 공급자·소비자 양면 KPI 포함
W. Willingness To Pay — 소비자·사업자·공공기관별 가격가설, 무료/구독/수수료/라이선스 가격검증
X. eXecution Roadmap — MVP→Local Pilot→PMF→Scale→B2G/B2B API 확장의 단계별 로드맵
Y. Year-1 Scenario — 보수/기준/공격 3개 시나리오. 공급 사업자 수, 활성 소비자 수, 거래/전환, 매출, 비용, 필요한 인력 포함
Z. Zero-Bias Verdict — 최종 점수표와 GO / CONDITIONAL GO / PIVOT / NO-GO 판정

[플랫폼 고객 흐름도 — 필수]
텍스트 또는 Mermaid를 사용할 수 있으면 다음을 반드시 시각화하십시오.
- 상품/서비스 흐름
- 데이터 흐름
- 돈의 흐름
- 추천/노출 흐름
- 최종 소비자 행동의 피드백 루프

[최종 점수표]
100점 만점으로 다음을 평가하십시오.
- 문제 강도 10
- 시장 수요 10
- 시장 성장성 10
- 경쟁우위 10
- 차별화 지속성 10
- 수익화 가능성 10
- 양면 고객획득 가능성 10
- 기술 구현 가능성 10
- 규제/운영 리스크 10 (낮을수록 고득점)
- 창업자/팀 실행 적합성 10

[필수 최종 산출물]
1. 종합점수 /100
2. 최종판정: GO / CONDITIONAL GO / PIVOT / NO-GO
3. 가장 적합한 사업모델: B2C / B2B / B2B2C / B2G / B2G2C / B2B SaaS / API 중 복수선택 가능
4. Payer / User / Beneficiary / Supplier 표
5. 고객·상품·돈·데이터 흐름도
6. B2B2C라면 공급자 확보전략 + 최종소비자 확보전략
7. 가장 치명적인 위험 5개
8. 지금 바로 검증해야 할 가설 7개
9. 경쟁사 대비 우리가 가져가야 할 단 하나의 포지션
10. 최소기능 MVP 범위
11. 첫 유료고객/사업자 확보 방법
12. 첫 최종소비자 1,000명 확보 방법
13. 30일 실행 체크리스트
14. 조사에 사용한 핵심 출처 목록과 링크
15. 직접 확인한 경쟁사/유사서비스 목록과 공식 URL
16. 추가 조사가 필요한 데이터 목록
`;

export const MarketResearchView: React.FC<MarketResearchViewProps> = ({
  project,
  initialSubTab = 'idea',
  activeTabKey,
  onSubTabChange,
}) => {
  const [subTab, setSubTab] = useState<'idea' | 'location'>(initialSubTab);
  const [form, setForm] = useState<ResearchForm>({
    ideaName: project.title,
    ideaSummary: project.description,
    problem: '',
    targetCustomer: project.profile.targetCustomers.join(', '),
    targetModels: [],
    marketRegion: '대한민국',
    businessModel: '',
    priceModel: '',
    competitors: '',
    differentiation: '',
    technology: '',
    regulation: '',
    resources: '',
    successGoal: '',
    other: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [researchResult, setResearchResult] = useState<MarketResearchResponse | null>(null);
  const [fallbackMode, setFallbackMode] = useState(false);
  const [copied, setCopied] = useState(false);

  const prompt = useMemo(() => buildPrompt(form, project), [form, project]);

  const update = (key: keyof ResearchForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleTargetModel = (modelId: string) => {
    setForm((prev) => ({
      ...prev,
      targetModels: prev.targetModels.includes(modelId)
        ? prev.targetModels.filter((item) => item !== modelId)
        : [...prev.targetModels, modelId],
    }));
  };

  const runResearch = async () => {
    if (!form.ideaName.trim() || !form.ideaSummary.trim()) return;
    setIsLoading(true);
    setResearchResult(null);
    setFallbackMode(false);
    setLoadingStep('Google 실시간 웹 검색 및 최신 시장 출처 탐색 중...');

    const timer1 = setTimeout(() => {
      setLoadingStep('경쟁사·수익모델·정부 정책 및 규제 데이터 크로스체크 중...');
    }, 7000);

    const timer2 = setTimeout(() => {
      setLoadingStep('A to Z 26개 항목 종합 시장조사 보고서 및 흐름도 작성 중...');
    }, 18000);

    const configuredEndpoint = import.meta.env.VITE_MARKET_RESEARCH_API_URL as string | undefined;
    const endpoints = [configuredEndpoint, '/api/market-research'].filter(Boolean) as string[];

    let lastError: unknown = null;

    for (const endpoint of endpoints) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000);

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            prompt,
            form,
            projectContext: project.profile,
            researchMode: 'live-web-search',
            requirements: {
              useWebSearchWhenAvailable: true,
              findCompetitorsAutomatically: true,
              verifyOfficialUrls: true,
              includeSources: true,
              currentYear: 2026,
            },
          }),
        });

        clearTimeout(timeoutId);

        if (!response.ok) throw new Error(`API unavailable: ${response.status}`);
        const data = await response.json();
        if (!data?.report) throw new Error('Empty market research response');

        setResearchResult({
          report: data.report,
          source: data.source || 'gemini-google-search',
          grounded: Boolean(data.grounded),
          model: data.model,
          searchedAt: data.searchedAt,
          searchQueries: data.searchQueries || [],
          sources: data.sources || [],
          warnings: data.warnings || [],
        });

        clearTimeout(timer1);
        clearTimeout(timer2);
        setIsLoading(false);
        return;
      } catch (error) {
        clearTimeout(timeoutId);
        lastError = error;
      }
    }

    clearTimeout(timer1);
    clearTimeout(timer2);
    console.warn('Market research API unavailable; prompt fallback enabled.', lastError);
    setFallbackMode(true);
    setIsLoading(false);
  };

  const copyPrompt = async () => {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const textField = (
    key: keyof Omit<ResearchForm, 'targetModels'>,
    label: string,
    placeholder: string,
    rows = 2
  ) => (
    <label className="block space-y-2">
      <span className="text-xs font-black text-slate-800">{label}</span>
      <textarea
        rows={rows}
        value={form[key] as string}
        onChange={(e) => update(key as keyof ResearchForm, e.target.value)}
        placeholder={placeholder}
        className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 focus:bg-white focus:border-slate-900 focus:outline-hidden resize-y"
      />
    </label>
  );

  useEffect(() => {
    if (initialSubTab) {
      setSubTab(initialSubTab);
    }
  }, [initialSubTab, activeTabKey]);

  const handleSwitchSubTab = (newTab: 'idea' | 'location') => {
    setSubTab(newTab);
    if (onSubTabChange) onSubTabChange(newTab);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 2 Large Mode Selection Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Card 1: 아이디어 시장조사 */}
        <div
          onClick={() => handleSwitchSubTab('idea')}
          className={`cursor-pointer rounded-[28px] p-6 border-2 transition-all flex flex-col justify-between ${
            subTab === 'idea'
              ? 'bg-white border-slate-900 shadow-[4px_4px_0px_0px_rgba(37,99,235,1)] ring-2 ring-blue-500'
              : 'bg-white/80 border-slate-200 hover:border-slate-400 hover:bg-white'
          }`}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                    subTab === 'idea' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 block">
                    Business Model Analysis
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900">아이디어 시장조사</h3>
                </div>
              </div>
              {subTab === 'idea' && (
                <span className="text-xs font-black px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  선택됨
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm font-bold text-slate-600 leading-relaxed">
              Google Search 실시간 웹검색으로 시장규모·경쟁사·고객·수익모델·규제를 분석합니다.
            </p>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {['Google 실시간 검색', 'B2C·B2B·B2B2C', '경쟁사 탐색', '수익모델 검증', '규제·리스크'].map((tag) => (
                <span key={tag} className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-5 mt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleSwitchSubTab('idea');
              }}
              className={`w-full min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-black transition-all ${
                subTab === 'idea'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-800 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <span>아이디어 시장조사 시작</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Card 2: 점포·상권 분석 */}
        <div
          onClick={() => handleSwitchSubTab('location')}
          className={`cursor-pointer rounded-[28px] p-6 border-2 transition-all flex flex-col justify-between ${
            subTab === 'location'
              ? 'bg-white border-slate-900 shadow-[4px_4px_0px_0px_rgba(16,185,129,1)] ring-2 ring-emerald-500'
              : 'bg-white/80 border-slate-200 hover:border-slate-400 hover:bg-white'
          }`}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                    subTab === 'location' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 block">
                    Location & Commercial GIS
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900">점포·상권 분석</h3>
                </div>
              </div>
              {subTab === 'location' && (
                <span className="text-xs font-black px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  선택됨
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm font-bold text-slate-600 leading-relaxed">
              입점할 주소를 입력하면 건축물대장·토지이용계획·경쟁점포·배후상권을 실시간 분석합니다.
            </p>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {['VWorld PNU 실연동', '건축HUB 대장', '소진공 상권분석', '동종업종 반경분석'].map((tag) => (
                <span key={tag} className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-5 mt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleSwitchSubTab('location');
              }}
              className={`w-full min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-black transition-all ${
                subTab === 'location'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-emerald-50 text-emerald-900 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <span>점포·상권분석 시작</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* SubTab Content */}
      {subTab === 'location' ? (
        <LocationAnalysisView />
      ) : (
        <>
          <section className="bg-white rounded-[32px] border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(37,99,235,1)] p-6 sm:p-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-black mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  실시간 웹검색 시장조사 연결 지원
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  A to Z 시장조사 질문지
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-bold mt-1">
                  Google Search 실시간 검색을 통해 2026년 최신 시장지표, 경쟁사, 규제 현황을 A~Z 26개 항목으로 종합 분석합니다.
                </p>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-4">
              {textField('ideaName', '아이디어 / 프로젝트명 *', '예: TodayPick — 오늘뭐입지 AI 코디 플랫폼')}
              {textField(
                'ideaSummary',
                '핵심 아이디어 요약 *',
                '예: 날씨/TPO/체형/퍼스널컬러 기반 패션 코디 추천 및 지역 오프라인 옷가게 재고 실시간 연동',
                3
              )}

              <div className="lg:col-span-2 space-y-2">
                <span className="text-xs font-black text-slate-800">
                  고객 / 사업 모델 선택 (복수 선택 가능)
                </span>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {CUSTOMER_MODELS.map((model) => {
                    const selected = form.targetModels.includes(model.id);
                    return (
                      <button
                        key={model.id}
                        type="button"
                        onClick={() => toggleTargetModel(model.id)}
                        className={`text-left rounded-2xl border p-3.5 transition-all ${
                          selected
                            ? 'bg-slate-900 text-white border-slate-900 shadow-[2px_2px_0px_0px_rgba(37,99,235,1)]'
                            : 'bg-white text-slate-800 border-slate-200 hover:border-blue-400'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-black">{model.label}</span>
                          <span className="text-sm">{selected ? '✓' : '+'}</span>
                        </div>
                        <p className={`text-[11px] font-bold mt-1.5 ${selected ? 'text-slate-300' : 'text-slate-500'}`}>
                          {model.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {textField('problem', '해결하려는 문제', '고객이 현재 겪는 불편, 비용, 시간 낭비, 기존 방식의 문제')}
              {textField(
                'targetCustomer',
                '상세 목표 고객',
                '예: 지역 패션매장 + 30~50대 소비자, 지자체 + 시민, 학교 + 학부모'
              )}
              {textField(
                'businessModel',
                '예상 수익모델',
                '예: 소비자 무료 + 사업자 월 구독 + 구매전환 수수료 + B2G 라이선스'
              )}
              {textField(
                'priceModel',
                '가격 / 과금 아이디어',
                '예: 소비자 무료, 사업자 월 29,000원, 거래 3%, 지자체 연간 라이선스'
              )}
              {textField(
                'competitors',
                '알고 있는 경쟁사 / 대체재',
                '모르면 비워두세요. Google Search 실시간 검색으로 AI가 직접 탐색합니다.'
              )}
              {textField(
                'differentiation',
                '우리가 생각하는 차별점',
                '기존 서비스와 다른 점, 지역 네트워크, 데이터, 추천엔진, 유통, 공공연계 등'
              )}
              {textField('technology', '핵심 기술 / 데이터', 'AI, API, OD 공공데이터, 날씨, 위치, 재고, 앱, 추천엔진 등')}
              {textField('regulation', '예상 규제 / 인허가', '개인정보, 위치정보, 광고표시, 전자상거래, 공공조달 등')}
              {textField('resources', '현재 보유 자원 / 역량', '개발역량, 고객, 지역사업자 네트워크, 데이터, 특허, 자금, 파트너 등')}
              {textField('successGoal', '성공 목표', '예: 6개월 내 지역매장 100곳 + MAU 1만명 + 첫 B2G PoC')}
              <div className="lg:col-span-2">
                {textField(
                  'other',
                  '기타 — 추가 아이디어 / 반드시 조사할 내용',
                  '예: TodayPick/오늘뭐입지처럼 사업자→플랫폼→소비자의 B2B2C 구조가 타당한지, 지역 패션매장의 재고와 소비자 구매를 연결할 수 있는지 조사',
                  4
                )}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={runResearch}
                disabled={isLoading || !form.ideaName.trim() || !form.ideaSummary.trim()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 text-white rounded-full text-sm font-black shadow-[3px_3px_0px_0px_rgba(37,99,235,1)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:hover:scale-100 cursor-pointer"
              >
                {isLoading ? (
                  <Sparkles className="w-4 h-4 animate-pulse text-blue-400" />
                ) : (
                  <Search className="w-4 h-4 text-blue-400" />
                )}
                {isLoading ? '실시간 시장조사 보고서 생성 중...' : 'A to Z 시장조사 시작'}
              </button>

              {isLoading && (
                <div className="mt-4 p-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-center gap-3 animate-pulse">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin shrink-0" />
                  <span className="text-xs font-bold text-blue-900">{loadingStep}</span>
                </div>
              )}
            </div>
          </section>

          {/* Research Report Section */}
          {researchResult && (
            <section className="bg-white rounded-[32px] border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(37,99,235,1)] p-6 sm:p-8 space-y-6">
              {/* Metadata Badges Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {researchResult.grounded ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-black">
                        <Check className="w-3.5 h-3.5" />
                        Google Search 실시간 검색 완료
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-black">
                        <Sparkles className="w-3.5 h-3.5" />
                        AI 시장조사 보고서
                      </span>
                    )}

                    {researchResult.model && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-bold">
                        <Layers className="w-3 h-3" />
                        {researchResult.model}
                      </span>
                    )}

                    {researchResult.searchedAt && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-medium">
                        <Clock className="w-3 h-3" />
                        {new Date(researchResult.searchedAt).toLocaleTimeString('ko-KR')}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-black text-slate-900 pt-1">
                    {form.ideaName} — A to Z 시장조사 결과
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={copyPrompt}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-black transition-colors"
                >
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Clipboard className="w-3.5 h-3.5" />}
                  {copied ? '프롬프트 복사됨' : '프롬프트 복사'}
                </button>
              </div>

              {/* Search Queries Executed */}
              {researchResult.searchQueries && researchResult.searchQueries.length > 0 && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-black text-slate-700">
                    <Search className="w-3.5 h-3.5 text-blue-600" />
                    실시간 Google 검색 질의어 ({researchResult.searchQueries.length}건)
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {researchResult.searchQueries.map((q, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700"
                      >
                        {q}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Markdown Report Content */}
              <div className="whitespace-pre-wrap text-sm leading-7 text-slate-700 font-medium">
                {researchResult.report}
              </div>

              {/* Search Grounding Sources Section */}
              {researchResult.sources && researchResult.sources.length > 0 && (
                <div className="border-t border-slate-200 pt-6 space-y-3">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-600" />
                    <h4 className="text-sm font-black text-slate-900">
                      실시간 조사 출처 및 참고 웹사이트 ({researchResult.sources.length}개)
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    본 조사는 Google Search Grounding을 통해 실시간으로 수집된 공식 웹사이트 및 언론/통계 자료를 바탕으로 작성되었습니다.
                  </p>
                  <div className="grid sm:grid-cols-2 gap-2.5 pt-2">
                    {researchResult.sources.map((src, idx) => (
                      <a
                        key={idx}
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-start justify-between gap-2 p-3 rounded-2xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 transition-all text-left"
                      >
                        <div className="space-y-1 overflow-hidden">
                          <span className="inline-block text-[10px] font-black px-2 py-0.5 rounded bg-white text-blue-700 border border-slate-200">
                            {src.domain}
                          </span>
                          <p className="text-xs font-black text-slate-800 group-hover:text-blue-900 truncate">
                            {src.title}
                          </p>
                          <p className="text-[10px] font-medium text-slate-400 truncate">
                            {src.url}
                          </p>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 shrink-0 mt-1" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Fallback Mode Section */}
          {fallbackMode && (
            <section className="bg-amber-50 rounded-[32px] border-2 border-amber-400 p-6 sm:p-8 space-y-5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
                <div>
                  <h3 className="font-black text-slate-900">
                    실시간 시장조사 API가 준비되지 않아 프롬프트 모드로 전환했습니다.
                  </h3>
                  <p className="text-xs text-slate-600 font-bold mt-1">
                    아래 프롬프트에는 B2C·B2B·B2B2C·B2G·B2G2C 분석, Payer/User/Beneficiary 구분, 경쟁사 직접검색, 공급자/소비자 확보전략까지 포함되어 있습니다. ChatGPT, Gemini 또는 Claude의 웹 검색/Deep Research 기능에 붙여 넣으면 됩니다.
                  </p>
                </div>
              </div>

              <button
                onClick={copyPrompt}
                className="inline-flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-full text-xs font-black shadow-[2px_2px_0px_0px_rgba(245,158,11,1)] cursor-pointer"
              >
                {copied ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Clipboard className="w-4 h-4 text-blue-400" />
                )}
                {copied ? '프롬프트 복사 완료' : '확장형 A to Z 시장조사 프롬프트 복사'}
              </button>

              <details className="bg-white border border-amber-200 rounded-2xl p-4">
                <summary className="cursor-pointer text-xs font-black text-slate-800">
                  프롬프트 전체 보기
                </summary>
                <pre className="mt-4 whitespace-pre-wrap text-[11px] leading-5 text-slate-600 font-mono max-h-[600px] overflow-y-auto">
                  {prompt}
                </pre>
              </details>
            </section>
          )}
        </>
      )}
    </div>
  );
};