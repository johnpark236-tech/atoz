import React, { useMemo, useState } from 'react';
import { Search, BookOpen, MousePointerClick, HelpCircle, Sparkles } from 'lucide-react';

interface UserGuideViewProps {
  onStartTutorial: () => void;
  onNavigate: (tab: string) => void;
}

type GuideItem = {
  title: string;
  keywords: string[];
  summary: string;
  steps: string[];
  tab?: string;
};

const GUIDE_ITEMS: GuideItem[] = [
  {
    title: '처음 시작하기',
    keywords: ['처음', '시작', '초보자', '새 프로젝트', '아이디어'],
    summary: '아이디어를 새 프로젝트로 등록하고 A to Z 로드맵을 만드는 첫 단계입니다.',
    steps: ['오른쪽 위의 새 프로젝트 버튼을 누릅니다.', '프로젝트명과 핵심 아이디어를 입력합니다.', '사업유형, 고객, 판매채널, 현재단계 등을 순서대로 선택합니다.', '마지막 단계에서 로드맵 생성을 완료합니다.'],
    tab: 'wizard',
  },
  {
    title: 'A to Z 시장조사',
    keywords: ['시장조사', '경쟁사', '시장규모', '프롬프트', 'go', 'no-go', '사업성'],
    summary: '아이디어의 시장성, 경쟁, 수익모델, 위험을 A~Z 26개 항목으로 검증합니다.',
    steps: ['A to Z 시장조사 메뉴를 누릅니다.', '아이디어와 추가 조사조건을 입력합니다.', 'A to Z 시장조사 시작을 누릅니다.', 'API가 연결되면 자동 조사 결과를 확인합니다.', 'API가 없으면 생성된 상세 프롬프트를 복사해 ChatGPT/Gemini/Claude에 붙여넣습니다.'],
    tab: 'market',
  },
  {
    title: '로드맵 확인과 업무 완료 처리',
    keywords: ['로드맵', '할일', '태스크', '완료', '진행률'],
    summary: '사업화에 필요한 태스크를 순서대로 확인하고 상태를 관리합니다.',
    steps: ['A to Z 로드맵 메뉴를 누릅니다.', '우선순위가 높은 업무부터 엽니다.', '필요서류·기관·비용·주의사항을 확인합니다.', '실제로 처리한 업무는 완료로 변경합니다.'],
    tab: 'roadmap',
  },
  {
    title: '행정·기관 포털 찾기',
    keywords: ['기관', '행정', '정부24', '특허청', '홈택스', '지원사업'],
    summary: '특허, 세무, 인증, 정부지원 등 업무별 공식기관을 빠르게 찾습니다.',
    steps: ['행정·기관 포털 메뉴를 누릅니다.', '업무 목적에 맞는 기관을 찾습니다.', '공식 링크를 열어 실제 신청요건을 최종 확인합니다.'],
    tab: 'organizations',
  },
  {
    title: '매출·정산 관리',
    keywords: ['매출', '정산', '입금', '수익', '판매'],
    summary: '판매 후 매출, 수수료, 비용, 실제 정산입금을 기록합니다.',
    steps: ['매출·정산 관리 메뉴를 누릅니다.', '판매건과 비용을 입력합니다.', '구매확정·정산예정·입금완료 상태를 갱신합니다.'],
    tab: 'finance',
  },
  {
    title: 'AI 창업비서 사용하기',
    keywords: ['ai', '창업비서', '질문', '상담', '도움'],
    summary: '현재 프로젝트 맥락을 반영해 창업 실무 질문을 하는 공간입니다.',
    steps: ['AI 창업비서 메뉴를 누릅니다.', '궁금한 내용을 자연어로 입력합니다.', '법률·세무·인증 정보는 반드시 공식기관에서 최종 확인합니다.'],
    tab: 'ai',
  },
];

export const UserGuideView: React.FC<UserGuideViewProps> = ({ onStartTutorial, onNavigate }) => {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return GUIDE_ITEMS;
    return GUIDE_ITEMS.filter((item) => [item.title, item.summary, ...item.keywords, ...item.steps].join(' ').toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <section className="bg-white rounded-[32px] border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full"><BookOpen className="w-3.5 h-3.5" /> 초보자 사용자 매뉴얼</div>
            <h2 className="text-2xl sm:text-3xl font-black mt-3">무엇을 해야 할지 몰라도 괜찮습니다</h2>
            <p className="text-sm text-slate-500 font-bold mt-2">검색창에 “시장조사”, “상표”, “매출”, “처음 시작”처럼 궁금한 단어만 입력하세요.</p>
          </div>
          <button onClick={onStartTutorial} className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-blue-600 text-white font-black text-sm shadow-[3px_3px_0_0_rgba(15,23,42,1)] hover:bg-blue-700">
            <MousePointerClick className="w-4 h-4" /> 따라하기 튜토리얼 시작
          </button>
        </div>
        <div className="relative mt-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="예: 처음 시작, 시장조사, 경쟁사, 상표, 세금, 매출, AI..." className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold focus:bg-white focus:border-slate-900 focus:outline-hidden" />
        </div>
      </section>

      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map((item) => (
          <article key={item.title} className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0"><HelpCircle className="w-5 h-5" /></div>
              <div className="min-w-0">
                <h3 className="font-black text-slate-900">{item.title}</h3>
                <p className="text-xs text-slate-500 font-bold mt-1">{item.summary}</p>
              </div>
            </div>
            <ol className="mt-4 space-y-2">
              {item.steps.map((step, i) => <li key={step} className="text-xs text-slate-700 font-medium flex gap-2"><span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-black shrink-0">{i + 1}</span><span>{step}</span></li>)}
            </ol>
            {item.tab && <button onClick={() => onNavigate(item.tab!)} className="mt-4 inline-flex items-center gap-2 text-xs font-black text-blue-700 hover:text-blue-900"><Sparkles className="w-3.5 h-3.5" /> 이 기능 바로 열기</button>}
          </article>
        ))}
      </div>

      {filtered.length === 0 && <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-sm font-bold text-slate-500">검색 결과가 없습니다. 다른 단어로 검색해 보세요.</div>}
    </div>
  );
};
