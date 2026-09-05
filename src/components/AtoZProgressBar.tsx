import React from 'react';
import { Task } from '../types';
import { getAtoZStages, ProcessStage } from '../services/ruleEngine';
import { Check, ChevronRight } from 'lucide-react';

interface AtoZProgressBarProps {
  tasks: Task[];
  onSelectStage?: (categoryKey: string) => void;
  selectedCategory?: string | null;
}

export const AtoZProgressBar: React.FC<AtoZProgressBarProps> = ({
  tasks,
  onSelectStage,
  selectedCategory,
}) => {
  const stages = getAtoZStages(tasks);

  return (
    <div className="bg-white rounded-[28px] border border-slate-200 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-4 gap-2">
        <div className="flex items-center space-x-3">
          <h3 className="text-base sm:text-lg font-black tracking-tighter text-slate-900 uppercase">
            A to Z PIPELINE
          </h3>
          <span className="text-[10px] uppercase tracking-widest font-black text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/60">
            9단계 사업화 경로
          </span>
        </div>
        <span className="text-xs font-medium text-slate-400">
          단계를 클릭하면 해당 업무 항목으로 즉시 이동합니다
        </span>
      </div>

      {/* Grid of 9 stages */}
      <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2.5">
        {stages.map((stage, idx) => {
          const isComplete = stage.total > 0 && stage.completed === stage.total;
          const isSelected = selectedCategory && stage.categoryKeys.includes(selectedCategory);
          const isCurrentActive = stage.isActive && !isComplete;

          return (
            <button
              key={stage.id}
              onClick={() => onSelectStage && onSelectStage(stage.categoryKeys[0])}
              className={`flex flex-col text-left p-3 rounded-2xl border transition-all relative ${
                isSelected
                  ? 'border-2 border-slate-900 bg-white shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] scale-[1.02]'
                  : isCurrentActive
                  ? 'border-2 border-blue-600 bg-blue-50/50 shadow-[3px_3px_0px_0px_rgba(37,99,235,1)]'
                  : isComplete
                  ? 'border-slate-200 bg-emerald-50/30 hover:border-emerald-300'
                  : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 hover:border-slate-300'
              }`}
            >
              {/* Step number badge & Completion icon */}
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-black uppercase tracking-wider ${isCurrentActive ? 'text-blue-600' : 'text-slate-400'}`}>
                  0{idx + 1}
                </span>
                {isComplete ? (
                  <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">
                    <Check className="w-2.5 h-2.5" />
                  </span>
                ) : isCurrentActive ? (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400 font-bold">
                    {stage.completed}/{stage.total}
                  </span>
                )}
              </div>

              {/* Stage title */}
              <div className="font-black text-xs text-slate-900 truncate tracking-tight">
                {stage.shortName}
              </div>

              {/* Progress bar inside stage */}
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    isComplete
                      ? 'bg-emerald-500'
                      : isCurrentActive
                      ? 'bg-blue-600'
                      : 'bg-slate-400'
                  }`}
                  style={{ width: `${stage.percentage}%` }}
                />
              </div>

              <div className="text-[10px] text-slate-400 font-black mt-1.5 font-mono">
                {stage.percentage}%
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
