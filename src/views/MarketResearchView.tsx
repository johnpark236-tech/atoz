import React, { useMemo, useState } from 'react';
import { Project } from '../types';
import {
  BarChart3,
  Clipboard,
  CheckCircle2,
  Search,
  Sparkles,
  AlertTriangle,
  Network,
  Globe2,
} from 'lucide-react';

interface MarketResearchViewProps {
  project: Project;
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

B2B2C 예시:
[지역 사업자/브랜드]
  ↓ 상품·재고·프로모션
[플랫폼/AI 추천]
  ↓ 개인화 추천
[최종 소비자]
  ↓ 클릭·방문·구매
[성과 데이터]
  ↺ 사업자와 플랫폼으로 피드백

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

export const MarketResearchView: React.FC<MarketResearchViewProps> = ({ project }) => {
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
  const [report, setReport] = useState('');
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
    setReport('');
    setFallbackMode(false);

    const configuredEndpoint = import.meta.env.VITE_MARKET_RESEARCH_API_URL as string | undefined;
    const endpoints = [configuredEndpoint, '/api/market-research'].filter(Boolean) as string[];

    let lastError: unknown = null;

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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

        if (!response.ok) throw new Error(`API unavailable: ${response.status}`);
        const data = await response.json();
        if (!data?.report) throw new Error('Empty market research response');
        setReport(data.report);
        setIsLoading(false);
        return;
      } catch (error) {
        lastError = error;
      }
    }

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

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <section className="bg-white rounded-[32px] border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
              <BarChart3 className="w-3.5 h-3.5" /> A to Z Market Research
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3 tracking-tight">
              아이디어 시장조사
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-bold mt-1 max-w-3xl">
              B2C·B2B뿐 아니라 B2B2C·B2G·B2G2C·B2B SaaS·API까지 분석합니다. 연결된 시장조사 API가 있으면 경쟁사와 최신 자료를 직접 찾고, API가 없으면 동일한 조사 지시가 담긴 상세 프롬프트를 제공합니다.
            </p>
          </div>
          <div className="text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-200 rounded-2xl p-3 max-w-sm">
            <strong className="text-slate-900 flex items-center gap-1">
              <Globe2 className="w-3.5 h-3.5" /> API 자동조사 지원
            </strong>
            <span className="block mt-1">
              VITE_MARKET_RESEARCH_API_URL이 연결되어 있으면 해당 API를 우선 사용하고, 없으면 기본 /api/market-research를 시도합니다.
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-5 mt-6">
          <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
            <label className="block space-y-2">
              <span className="text-xs font-black text-slate-800">아이디어 / 프로젝트명 *</span>
              <input
                value={form.ideaName}
                onChange={(e) => update('ideaName', e.target.value)}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:bg-white focus:border-slate-900 focus:outline-hidden"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-xs font-black text-slate-800">목표 시장 / 지역</span>
              <input
                value={form.marketRegion}
                onChange={(e) => update('marketRegion', e.target.value)}
                placeholder="예: 대한민국, 천안 우선 후 전국"
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:bg-white focus:border-slate-900 focus:outline-hidden"
              />
            </label>
          </div>

          <div className="lg:col-span-2">
            {textField(
              'ideaSummary',
              '핵심 아이디어 설명 *',
              '무엇을 누구에게 어떤 방식으로 제공하는지 적어주세요.',
              3
            )}
          </div>

          <div className="lg:col-span-2 rounded-[28px] border border-blue-200 bg-blue-50/60 p-5">
            <div className="flex items-start gap-3">
              <Network className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-black text-slate-900">목표 고객 / 사업모델 선택</h3>
                <p className="text-xs text-slate-600 font-bold mt-1">
                  복수 선택 가능합니다. 모르겠으면 선택하지 않아도 AI가 적합한 구조를 판별합니다.
                </p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3 mt-4">
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
            '모르면 비워두세요. API가 연결되어 있으면 AI가 직접 검색하도록 요청합니다.'
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

        <button
          type="button"
          onClick={runResearch}
          disabled={isLoading || !form.ideaName.trim() || !form.ideaSummary.trim()}
          className="mt-7 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 text-white rounded-full text-sm font-black shadow-[3px_3px_0px_0px_rgba(37,99,235,1)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:hover:scale-100"
        >
          {isLoading ? (
            <Sparkles className="w-4 h-4 animate-pulse" />
          ) : (
            <Search className="w-4 h-4 text-blue-400" />
          )}
          {isLoading ? '최신 시장·경쟁사를 조사하는 중...' : 'A to Z 시장조사 시작'}
        </button>
      </section>

      {report && (
        <section className="bg-white rounded-[32px] border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(37,99,235,1)] p-6 sm:p-8">
          <h3 className="text-xl font-black text-slate-900 mb-4">시장조사 결과</h3>
          <div className="whitespace-pre-wrap text-sm leading-7 text-slate-700 font-medium">
            {report}
          </div>
        </section>
      )}

      {fallbackMode && (
        <section className="bg-amber-50 rounded-[32px] border-2 border-amber-400 p-6 sm:p-8 space-y-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
            <div>
              <h3 className="font-black text-slate-900">
                시장조사 API가 연결되어 있지 않습니다. 상세 프롬프트 모드로 전환했습니다.
              </h3>
              <p className="text-xs text-slate-600 font-bold mt-1">
                아래 프롬프트에는 B2C·B2B·B2B2C·B2G·B2G2C 분석, Payer/User/Beneficiary 구분, 경쟁사 직접검색, 공급자/소비자 확보전략까지 포함되어 있습니다. ChatGPT, Gemini 또는 Claude의 웹 검색/Deep Research 기능에 붙여 넣으면 됩니다.
              </p>
            </div>
          </div>

          <button
            onClick={copyPrompt}
            className="inline-flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-full text-xs font-black shadow-[2px_2px_0px_0px_rgba(245,158,11,1)]"
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
    </div>
  );
};