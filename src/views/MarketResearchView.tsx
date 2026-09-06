import React, { useMemo, useState } from 'react';
import { Project } from '../types';
import { BarChart3, Clipboard, CheckCircle2, Search, Sparkles, AlertTriangle } from 'lucide-react';

interface MarketResearchViewProps {
  project: Project;
}

interface ResearchForm {
  ideaName: string;
  ideaSummary: string;
  problem: string;
  targetCustomer: string;
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

const buildPrompt = (form: ResearchForm, project: Project) => `
[역할]
당신은 20년 경력의 글로벌 시장조사 책임자, 스타트업 투자심사역, 제품전략가, 경쟁정보(Competitive Intelligence) 분석가입니다.
단순히 아이디어를 칭찬하지 말고, 2026년 현재 시장에서 실제로 사업이 될 수 있는지 냉정하고 검증 가능하게 조사하십시오.

[조사 원칙]
1. 가능한 경우 웹 검색을 사용하고 최신 자료를 우선하십시오.
2. 한국 시장을 기본으로 하되 해외 유사사례가 있으면 미국·일본·유럽·동남아까지 확장하십시오.
3. 사실, 추정, 가설을 명확히 구분하십시오.
4. 숫자와 시장규모는 출처와 기준연도를 표시하십시오. 확인되지 않는 수치는 임의로 만들지 마십시오.
5. 경쟁사는 직접경쟁, 간접경쟁, 대체재로 구분하십시오.
6. "좋은 아이디어"라는 결론을 미리 정하지 말고 NO-GO 가능성도 동일하게 검토하십시오.
7. 법률·규제·특허·상표 관련 내용은 참고정보로 제공하고 공식기관 또는 전문가 확인 필요 여부를 표시하십시오.
8. 사용자가 제공하지 않은 정보를 사실처럼 단정하지 말고 필요한 경우 가설로 표시하십시오.
9. 조사 결과는 한국어로 작성하십시오.
10. 마지막에 반드시 GO / CONDITIONAL GO / PIVOT / NO-GO 중 하나를 선택하고 근거를 제시하십시오.

[고객 아이디어]
- 아이디어/프로젝트명: ${form.ideaName}
- 핵심 설명: ${form.ideaSummary}
- 해결하려는 문제: ${form.problem || '미입력'}
- 목표 고객: ${form.targetCustomer || project.profile.targetCustomers.join(', ')}
- 목표 시장/지역: ${form.marketRegion || '대한민국 우선, 필요 시 해외 비교'}
- 사업유형: ${project.profile.businessTypes.join(', ')}
- 판매/유통 채널: ${project.profile.salesChannels.join(', ')}
- 현재 준비단계: ${project.profile.stage}
- 사업자 상태: ${project.profile.corporateStatus}
- 인력구성: ${project.profile.staffing}
- 해외판매 계획: ${project.profile.hasOverseasSales}
- 예상 수익모델: ${form.businessModel || '미입력'}
- 가격/과금 아이디어: ${form.priceModel || '미입력'}
- 알고 있는 경쟁사/대체재: ${form.competitors || '미입력'}
- 차별점: ${form.differentiation || '미입력'}
- 핵심 기술/데이터: ${form.technology || '미입력'}
- 예상 규제/인허가: ${form.regulation || '미입력'}
- 현재 보유 자원/역량: ${form.resources || '미입력'}
- 성공 목표: ${form.successGoal || '미입력'}
- 기타 추가 아이디어/조건: ${form.other || '없음'}

[요청: A to Z 시장조사 보고서]
아래 A~Z 26개 항목을 빠짐없이 작성하십시오.

A. Abstract — 아이디어 한 문장 정의와 시장조사 핵심 결론
B. Buyer Problem — 고객이 실제로 겪는 문제, 문제의 빈도·강도·지불의사
C. Customer Segments — 핵심 고객군, Early Adopter, B2C/B2B/B2G 구분
D. Demand Evidence — 검색수요, 커뮤니티 반응, 기존 소비행태 등 실제 수요 증거
E. Existing Alternatives — 현재 고객이 문제를 해결하는 방식과 대체재
F. Field & Market Size — 시장 정의, TAM/SAM/SOM. 신뢰할 수 있는 데이터가 없으면 산식과 가정을 분리
G. Growth Drivers — 성장요인, 기술·정책·인구·소비 트렌드
H. Headwinds — 시장을 막는 구조적 악재와 실패 요인
I. Industry Structure — 공급자·유통·플랫폼·고객·규제기관을 포함한 가치사슬
J. Jobs To Be Done — 고객이 실제로 고용하는 제품의 역할과 구매상황
K. Key Competitors — 국내외 경쟁사 표: 서비스, 국가, 고객, 가격, 강점, 약점, 차이점, URL
L. Legal / Regulation — 국내 규제, 인허가, 개인정보, 소비자보호, 데이터/AI 관련 위험
M. Monetization — 가능한 수익모델을 우선순위로 비교하고 가장 현실적인 모델 제안
N. Numbers & Unit Economics — 예상 객단가, CAC, LTV, 마진, 손익분기 구조. 데이터 부족 시 시나리오로 제시
O. Opportunity Gap — 경쟁사가 해결하지 못하는 빈틈과 실제 진입기회
P. Positioning — 가장 강한 포지셔닝 문장과 경쟁제품 대비 차별화 지도
Q. Questions To Validate — 아직 검증되지 않은 핵심 가설 10개와 검증방법
R. Risks — 시장/기술/재무/법률/운영/모방 위험을 High/Medium/Low로 평가
S. Sales & Go-To-Market — 첫 고객 10명→100명→1,000명 확보 전략
T. Technology Feasibility — 2026년 기술수준에서 구현난이도, 필요한 API/AI/데이터/인프라, Build vs Buy
U. USP — 고객이 10초 안에 이해할 수 있는 독특한 가치제안 3개
V. Validation Plan — 2주, 30일, 90일 시장검증 계획과 측정 KPI
W. Willingness To Pay — 가격 가설, 무료/구독/수수료/라이선스 모델과 가격검증 방법
X. eXecution Roadmap — MVP→Pilot→PMF→Scale의 단계별 로드맵
Y. Year-1 Scenario — 보수/기준/공격 3개 1년 시나리오, 핵심 지표와 필요한 자원
Z. Zero-Bias Verdict — 최종 점수표와 GO / CONDITIONAL GO / PIVOT / NO-GO 판정

[최종 점수표]
100점 만점으로 다음을 평가하십시오.
- 문제 강도 10
- 시장 수요 10
- 시장 성장성 10
- 경쟁우위 10
- 차별화 지속성 10
- 수익화 가능성 10
- 고객획득 가능성 10
- 기술 구현 가능성 10
- 규제/운영 리스크 10 (낮을수록 고득점)
- 창업자/팀 실행 적합성 10

[필수 최종 산출물]
1. 종합점수 /100
2. 최종판정: GO / CONDITIONAL GO / PIVOT / NO-GO
3. 가장 치명적인 위험 3개
4. 지금 바로 검증해야 할 가설 5개
5. 경쟁사 대비 우리가 가져가야 할 단 하나의 포지션
6. 최소기능 MVP 범위
7. 첫 유료고객 확보 방법
8. 30일 실행 체크리스트
9. 조사에 사용한 핵심 출처 목록과 링크
10. 추가 조사가 필요한 데이터 목록
`;

export const MarketResearchView: React.FC<MarketResearchViewProps> = ({ project }) => {
  const [form, setForm] = useState<ResearchForm>({
    ideaName: project.title,
    ideaSummary: project.description,
    problem: '',
    targetCustomer: project.profile.targetCustomers.join(', '),
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

  const runResearch = async () => {
    if (!form.ideaName.trim() || !form.ideaSummary.trim()) return;
    setIsLoading(true);
    setReport('');
    setFallbackMode(false);

    try {
      const response = await fetch('/api/market-research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, form, projectContext: project.profile }),
      });
      if (!response.ok) throw new Error(`API unavailable: ${response.status}`);
      const data = await response.json();
      if (!data?.report) throw new Error('Empty market research response');
      setReport(data.report);
    } catch (error) {
      console.warn('Market research API unavailable; prompt fallback enabled.', error);
      setFallbackMode(true);
    } finally {
      setIsLoading(false);
    }
  };

  const copyPrompt = async () => {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const textField = (
    key: keyof ResearchForm,
    label: string,
    placeholder: string,
    rows = 2
  ) => (
    <label className="block space-y-2">
      <span className="text-xs font-black text-slate-800">{label}</span>
      <textarea
        rows={rows}
        value={form[key]}
        onChange={(e) => update(key, e.target.value)}
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
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3 tracking-tight">아이디어 시장조사</h2>
            <p className="text-xs sm:text-sm text-slate-500 font-bold mt-1 max-w-3xl">
              현재 프로젝트 설문정보를 자동 반영하고 추가 조건을 입력하면 A~Z 26개 항목으로 시장을 검증합니다. API가 연결되지 않은 GitHub Pages 환경에서는 동일한 조사 품질을 목표로 하는 상세 프롬프트를 즉시 제공합니다.
            </p>
          </div>
          <div className="text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-200 rounded-2xl p-3 max-w-xs">
            <strong className="text-slate-900">기본 입력 자동반영</strong><br />
            사업유형 · 고객 · 판매채널 · 준비단계 · 사업자형태 · 인력 · 해외판매
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-5 mt-6">
          <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
            <label className="block space-y-2">
              <span className="text-xs font-black text-slate-800">아이디어 / 프로젝트명 *</span>
              <input value={form.ideaName} onChange={(e) => update('ideaName', e.target.value)} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:bg-white focus:border-slate-900 focus:outline-hidden" />
            </label>
            <label className="block space-y-2">
              <span className="text-xs font-black text-slate-800">목표 시장 / 지역</span>
              <input value={form.marketRegion} onChange={(e) => update('marketRegion', e.target.value)} placeholder="예: 대한민국, 천안 우선 후 전국" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:bg-white focus:border-slate-900 focus:outline-hidden" />
            </label>
          </div>
          <div className="lg:col-span-2">{textField('ideaSummary', '핵심 아이디어 설명 *', '무엇을 누구에게 어떤 방식으로 제공하는지 적어주세요.', 3)}</div>
          {textField('problem', '해결하려는 문제', '고객이 현재 겪는 불편, 비용, 시간 낭비, 기존 방식의 문제')}
          {textField('targetCustomer', '주 고객', '예: 30~50대 직장인, 소상공인, 지자체, 학교')}
          {textField('businessModel', '예상 수익모델', '예: 월 구독, 거래 수수료, B2G 라이선스, 광고')}
          {textField('priceModel', '가격 / 과금 아이디어', '예: 소비자 무료, 사업자 월 29,000원')}
          {textField('competitors', '알고 있는 경쟁사 / 대체재', '모르면 비워두어도 됩니다. AI가 조사합니다.')}
          {textField('differentiation', '우리가 생각하는 차별점', '기존 서비스와 다른 점, 데이터, 네트워크, 기술, 운영방식')}
          {textField('technology', '핵심 기술 / 데이터', 'AI, API, 공공데이터, 앱, 하드웨어 등')}
          {textField('regulation', '예상 규제 / 인허가', '개인정보, 의료, 금융, KC, 식품, 공공조달 등')}
          {textField('resources', '현재 보유 자원 / 역량', '개발역량, 고객, 데이터, 특허, 자금, 파트너 등')}
          {textField('successGoal', '성공 목표', '예: 6개월 내 유료고객 100명, 천안 PoC')}
          <div className="lg:col-span-2">{textField('other', '기타 — 추가 아이디어 / 반드시 조사할 내용', '설문에 없는 조건, 떠오른 아이디어, 특정 경쟁사, 원하는 조사방향을 자유롭게 입력하세요.', 4)}</div>
        </div>

        <button
          type="button"
          onClick={runResearch}
          disabled={isLoading || !form.ideaName.trim() || !form.ideaSummary.trim()}
          className="mt-7 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 text-white rounded-full text-sm font-black shadow-[3px_3px_0px_0px_rgba(37,99,235,1)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:hover:scale-100"
        >
          {isLoading ? <Sparkles className="w-4 h-4 animate-pulse" /> : <Search className="w-4 h-4 text-blue-400" />}
          {isLoading ? 'A to Z 시장을 조사하는 중...' : 'A to Z 시장조사 시작'}
        </button>
      </section>

      {report && (
        <section className="bg-white rounded-[32px] border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(37,99,235,1)] p-6 sm:p-8">
          <h3 className="text-xl font-black text-slate-900 mb-4">시장조사 결과</h3>
          <div className="whitespace-pre-wrap text-sm leading-7 text-slate-700 font-medium">{report}</div>
        </section>
      )}

      {fallbackMode && (
        <section className="bg-amber-50 rounded-[32px] border-2 border-amber-400 p-6 sm:p-8 space-y-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
            <div>
              <h3 className="font-black text-slate-900">AI API가 연결되어 있지 않습니다. 프롬프트 모드로 전환했습니다.</h3>
              <p className="text-xs text-slate-600 font-bold mt-1">아래 프롬프트에는 현재 설문과 추가 입력값이 모두 포함되어 있습니다. 복사한 뒤 ChatGPT, Gemini 또는 Claude의 웹 검색/Deep Research 기능에 붙여 넣으면 됩니다.</p>
            </div>
          </div>

          <button onClick={copyPrompt} className="inline-flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-full text-xs font-black shadow-[2px_2px_0px_0px_rgba(245,158,11,1)]">
            {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Clipboard className="w-4 h-4 text-blue-400" />}
            {copied ? '프롬프트 복사 완료' : 'A to Z 시장조사 프롬프트 복사'}
          </button>

          <details className="bg-white border border-amber-200 rounded-2xl p-4">
            <summary className="cursor-pointer text-xs font-black text-slate-800">프롬프트 전체 보기</summary>
            <pre className="mt-4 whitespace-pre-wrap text-[11px] leading-5 text-slate-600 font-mono max-h-[600px] overflow-y-auto">{prompt}</pre>
          </details>
        </section>
      )}
    </div>
  );
};
