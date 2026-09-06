import React, { useEffect, useMemo, useState } from 'react';
import { X, ChevronLeft, ChevronRight, HandPointer, Sparkles } from 'lucide-react';

type TutorialStep = {
  title: string;
  text: string;
  selector?: string;
  navigateTab?: string;
};

interface GuidedTutorialProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
}

const STEPS: TutorialStep[] = [
  {
    title: 'AtoZ 따라오세요 👋',
    text: '아무것도 몰라도 됩니다. 화면에 표시되는 손가락과 안내문만 따라오세요. 실제 버튼을 누르면 다음 단계로 자동 진행됩니다.',
  },
  {
    title: '1. 새 프로젝트 만들기',
    text: '오른쪽 위의 “새 프로젝트” 버튼을 클릭하세요. 사업 아이디어를 입력하는 위저드가 열립니다.',
    selector: '#new-project-btn',
  },
  {
    title: '2. 사업화 위저드 확인',
    text: '상단의 “사업화 위저드” 메뉴를 클릭하세요. 프로젝트명, 아이디어, 고객, 판매채널 등을 순서대로 입력하면 됩니다.',
    selector: '#nav-wizard',
  },
  {
    title: '3. 시장조사로 아이디어 검증',
    text: '“A to Z 시장조사”를 클릭하세요. 아이디어의 경쟁사, 시장성, 수익모델, 위험을 확인합니다.',
    selector: '#nav-market',
  },
  {
    title: '4. 해야 할 일 확인',
    text: '“A to Z 로드맵”을 클릭하세요. 사업화에 필요한 업무를 순서대로 확인하고 하나씩 완료 처리합니다.',
    selector: '#nav-roadmap',
  },
  {
    title: '5. 공식 기관 찾기',
    text: '“행정·기관 포털”을 클릭하세요. 특허, 세무, 인증, 지원사업의 공식기관을 찾을 수 있습니다.',
    selector: '#nav-organizations',
  },
  {
    title: '6. 판매 후 정산 관리',
    text: '“매출·정산 관리”를 클릭하세요. 판매금액, 비용, 정산예정일과 실제 입금을 관리합니다.',
    selector: '#nav-finance',
  },
  {
    title: '7. 모르는 것은 AI에게 질문',
    text: '“AI 창업비서”를 클릭하세요. 지금 프로젝트에 맞춰 궁금한 내용을 자연어로 질문할 수 있습니다.',
    selector: '#nav-ai',
  },
  {
    title: '완료했습니다 🎉',
    text: '이제 AtoZ의 전체 흐름을 한 번 경험했습니다. 다시 막히면 상단의 “사용자 매뉴얼”에서 검색하거나 “따라하기”를 다시 시작하세요.',
  },
];

export const GuidedTutorial: React.FC<GuidedTutorialProps> = ({ open, onClose, onNavigate }) => {
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const step = STEPS[index];

  useEffect(() => {
    if (!open) return;
    setIndex(0);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (step.navigateTab) onNavigate(step.navigateTab);

    const updateRect = () => {
      if (!step.selector) return setRect(null);
      const el = document.querySelector(step.selector) as HTMLElement | null;
      if (!el) return setRect(null);
      el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      window.setTimeout(() => setRect(el.getBoundingClientRect()), 180);
    };

    updateRect();
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, true);

    let target: HTMLElement | null = null;
    const advance = () => setIndex((i) => Math.min(i + 1, STEPS.length - 1));
    if (step.selector) {
      target = document.querySelector(step.selector) as HTMLElement | null;
      target?.addEventListener('click', advance, { once: true });
    }

    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect, true);
      target?.removeEventListener('click', advance);
    };
  }, [open, index, step.selector, step.navigateTab, onNavigate]);

  const cardStyle = useMemo<React.CSSProperties>(() => {
    if (!rect) return { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' };
    const width = Math.min(360, window.innerWidth - 24);
    const left = Math.min(Math.max(12, rect.left + rect.width / 2 - width / 2), window.innerWidth - width - 12);
    const topCandidate = rect.bottom + 18;
    const top = topCandidate + 220 < window.innerHeight ? topCandidate : Math.max(12, rect.top - 230);
    return { left, top, width };
  }, [rect]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      <div className="absolute inset-0 bg-slate-950/60 pointer-events-auto" onClick={() => {}} />

      {rect && (
        <>
          <div className="fixed rounded-2xl border-4 border-yellow-300 shadow-[0_0_0_6px_rgba(37,99,235,0.55),0_0_40px_rgba(250,204,21,0.9)] pointer-events-none animate-pulse" style={{ left: rect.left - 8, top: rect.top - 8, width: rect.width + 16, height: rect.height + 16 }} />
          <div className="fixed text-5xl z-[102] pointer-events-none drop-shadow-lg animate-bounce" style={{ left: Math.max(8, rect.left + rect.width / 2 - 20), top: Math.max(8, rect.top - 58) }}>👇</div>
          <div className="fixed z-[103] pointer-events-auto" style={{ left: rect.left - 12, top: rect.top - 12, width: rect.width + 24, height: rect.height + 24 }} />
        </>
      )}

      <section className="fixed z-[104] bg-white rounded-3xl border-2 border-slate-900 shadow-[6px_6px_0_0_rgba(37,99,235,1)] p-5 pointer-events-auto" style={cardStyle}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[10px] font-black text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full"><Sparkles className="w-3 h-3" /> 초보자 따라하기 {index + 1}/{STEPS.length}</div>
            <h3 className="mt-2 text-lg font-black text-slate-900">{step.title}</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200" aria-label="튜토리얼 닫기"><X className="w-4 h-4" /></button>
        </div>
        <p className="text-sm text-slate-600 font-bold leading-relaxed mt-3">{step.text}</p>

        {step.selector && (
          <div className="mt-4 flex items-center gap-2 text-sm font-black text-amber-700 bg-amber-50 border border-amber-200 rounded-2xl p-3">
            <HandPointer className="w-5 h-5 shrink-0" /> 손가락이 가리키는 버튼을 직접 클릭하세요.
          </div>
        )}

        <div className="mt-5 flex items-center justify-between gap-2">
          <button disabled={index === 0} onClick={() => setIndex((i) => Math.max(0, i - 1))} className="inline-flex items-center gap-1 px-3 py-2 rounded-full text-xs font-black text-slate-600 bg-slate-100 disabled:opacity-30"><ChevronLeft className="w-4 h-4" /> 이전</button>
          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-blue-600" style={{ width: `${((index + 1) / STEPS.length) * 100}%` }} /></div>
          {index < STEPS.length - 1 ? (
            <button onClick={() => setIndex((i) => Math.min(STEPS.length - 1, i + 1))} className="inline-flex items-center gap-1 px-3 py-2 rounded-full text-xs font-black text-white bg-slate-900">건너뛰기 <ChevronRight className="w-4 h-4" /></button>
          ) : (
            <button onClick={onClose} className="px-4 py-2 rounded-full text-xs font-black text-white bg-blue-600">튜토리얼 완료</button>
          )}
        </div>
      </section>
    </div>
  );
};
