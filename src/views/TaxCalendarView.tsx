import React, { useState } from 'react';
import { TAX_CALENDAR_EVENTS } from '../data/taxCalendar';
import {
  Calendar,
  AlertCircle,
  ExternalLink,
  Coins,
  CheckCircle,
  Clock,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

export const TaxCalendarView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');

  const categories = ['전체', '부가가치세', '종합소득세', '원천세', '행정신고', '지방세'];

  const filteredEvents = TAX_CALENDAR_EVENTS.filter((evt) => {
    if (selectedCategory === '전체') return true;
    return evt.category === selectedCategory;
  });

  return (
    <div className="space-y-6">
      {/* Top Tax Saving Strategy Card */}
      <div className="bg-slate-900 text-white rounded-[32px] p-6 sm:p-8 shadow-[4px_4px_0px_0px_rgba(37,99,235,1)] border-2 border-slate-900">
        <div className="max-w-4xl space-y-3">
          <div className="inline-flex items-center space-x-1.5 bg-blue-600/30 text-blue-300 border border-blue-400/30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>1인 창업자 필수 세무 4대 절세 골든룰</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            세금을 아는 만큼 내 통장의 순이익이 지켜집니다
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
            <div className="bg-slate-800/90 p-4 rounded-[20px] border border-slate-700 space-y-1">
              <span className="font-black text-amber-300 block text-xs">
                1. 청년창업 세액감면 (최대 100%)
              </span>
              <p className="text-slate-300 leading-relaxed font-medium">
                창업 당시 만 15~34세 청년이 수도권 과밀억제권역 밖에서 최초 창업 시 소득세 5년간 100% 감면 (과밀권역 내는 50%).
              </p>
            </div>
            <div className="bg-slate-800/90 p-4 rounded-[20px] border border-slate-700 space-y-1">
              <span className="font-black text-amber-300 block text-xs">
                2. 사업용 신용카드 홈택스 등록
              </span>
              <p className="text-slate-300 leading-relaxed font-medium">
                대표자 명의 카드를 홈택스에 등록해 두면 물품 구매, 비품비의 매입세액 10%가 자동 공제됩니다.
              </p>
            </div>
            <div className="bg-slate-800/90 p-4 rounded-[20px] border border-slate-700 space-y-1">
              <span className="font-black text-amber-300 block text-xs">
                3. 부가세 10% 별도 파킹통장
              </span>
              <p className="text-slate-300 leading-relaxed font-medium">
                입금된 매출은 내 돈이 아닙니다. 10%를 세금 통장으로 즉시 분리하여 납부 기한 지연가산세를 예방하세요.
              </p>
            </div>
            <div className="bg-slate-800/90 p-4 rounded-[20px] border border-slate-700 space-y-1">
              <span className="font-black text-amber-300 block text-xs">
                4. 적격증빙(세금계산서, 현금영수증)
              </span>
              <p className="text-slate-300 leading-relaxed font-medium">
                간이영수증은 3만원 한도만 인정됩니다. 외주나 구매 시 무조건 지출증빙용 현금영수증이나 세금계산서를 수취하세요.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Filters */}
      <div className="bg-white rounded-[28px] border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center space-x-2 text-xs font-black text-slate-800">
          <Calendar className="w-4 h-4 text-blue-600" />
          <span>연간 세무 일정 카테고리:</span>
        </div>
        <div className="flex items-center space-x-1.5 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-black whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] scale-[1.02]'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Tax Schedule Timeline List */}
      <div className="space-y-4">
        {filteredEvents.map((evt) => (
          <div
            key={evt.id}
            className="bg-white rounded-[28px] border border-slate-200 hover:border-slate-900 hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] p-6 shadow-xs transition-all flex flex-col md:flex-row md:items-center md:justify-between gap-4 group"
          >
            <div className="space-y-2.5 flex-1">
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <span className="text-xs font-black text-amber-900 bg-amber-50 border-2 border-amber-300 px-3 py-0.5 rounded-full">
                  {evt.dueDate}
                </span>
                <span className="text-xs font-black text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full">
                  {evt.category}
                </span>
                <span className="text-xs font-bold text-slate-400">
                  과세 대상: {evt.period}
                </span>
              </div>

              <h3 className="text-lg font-black text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">
                {evt.title}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                {evt.description}
              </p>

              {/* Tax filing tip */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 flex items-start space-x-2 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-slate-900 font-black">신고 실무 팁: </strong>
                  {evt.filingTip}
                </span>
              </div>
            </div>

            <div className="shrink-0 flex md:flex-col items-center justify-end gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
              <a
                href={evt.officialUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-full text-xs font-black shadow-[2px_2px_0px_0px_rgba(37,99,235,1)] hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <span>신고 사이트 접속</span>
                <ExternalLink className="w-3.5 h-3.5 text-blue-300" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
