import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  ClipboardCheck,
} from 'lucide-react';
import { BUSINESS_CHECKLIST } from '../data/businessChecklist';
import { ChecklistCategory, ChecklistSection, ChecklistTask } from '../types';
import {
  ChecklistCompletionMap,
  loadChecklistCompletions,
  saveChecklistCompletions,
} from '../services/storage';

interface BusinessChecklistTreeProps {
  projectId: string;
}

type Progress = {
  completed: number;
  total: number;
  percentage: number;
};

function getPercent(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

function getTaskCompleted(task: ChecklistTask, completions: ChecklistCompletionMap): boolean {
  return completions[task.id] ?? task.completed;
}

function getSectionProgress(
  section: ChecklistSection,
  completions: ChecklistCompletionMap
): Progress {
  const total = section.tasks.length;
  const completed = section.tasks.filter((task) => getTaskCompleted(task, completions)).length;
  return { completed, total, percentage: getPercent(completed, total) };
}

function getCategoryProgress(
  category: ChecklistCategory,
  completions: ChecklistCompletionMap
): Progress {
  const sectionStats = category.sections.map((section) =>
    getSectionProgress(section, completions)
  );
  const total = sectionStats.reduce((sum, stat) => sum + stat.total, 0);
  const completed = sectionStats.reduce((sum, stat) => sum + stat.completed, 0);
  return { completed, total, percentage: getPercent(completed, total) };
}

function getTotalProgress(completions: ChecklistCompletionMap): Progress {
  const categoryStats = BUSINESS_CHECKLIST.map((category) =>
    getCategoryProgress(category, completions)
  );
  const total = categoryStats.reduce((sum, stat) => sum + stat.total, 0);
  const completed = categoryStats.reduce((sum, stat) => sum + stat.completed, 0);
  return { completed, total, percentage: getPercent(completed, total) };
}

const ProgressBar: React.FC<{ value: number; size?: 'sm' | 'md' }> = ({
  value,
  size = 'md',
}) => (
  <div
    className={`w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200 ${
      size === 'sm' ? 'h-2' : 'h-2.5'
    }`}
  >
    <div
      className="h-full bg-blue-600 rounded-full transition-all duration-500"
      style={{ width: `${value}%` }}
    />
  </div>
);

export const BusinessChecklistTree: React.FC<BusinessChecklistTreeProps> = ({
  projectId,
}) => {
  const [completions, setCompletions] = useState<ChecklistCompletionMap>(() =>
    loadChecklistCompletions(projectId)
  );
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setCompletions(loadChecklistCompletions(projectId));
    setOpenCategories({});
    setOpenSections({});
  }, [projectId]);

  useEffect(() => {
    saveChecklistCompletions(projectId, completions);
  }, [projectId, completions]);

  const totalProgress = useMemo(() => getTotalProgress(completions), [completions]);

  const toggleTask = (taskId: string) => {
    setCompletions((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  return (
    <section className="bg-white rounded-[32px] border border-slate-200 p-5 sm:p-6 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-blue-600">
            <ClipboardCheck className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Business Checklist
            </span>
          </div>
          <div className="flex items-baseline gap-3">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tighter text-slate-900">
              전체 진행률 <span data-testid="checklist-total-progress">{totalProgress.percentage}%</span>
            </h2>
            <span className="text-xs font-black text-slate-400">
              {totalProgress.completed}/{totalProgress.total}
            </span>
          </div>
        </div>
        <div className="w-full sm:w-56">
          <ProgressBar value={totalProgress.percentage} />
        </div>
      </div>

      <div className="space-y-3">
        {BUSINESS_CHECKLIST.map((category) => {
          const categoryProgress = getCategoryProgress(category, completions);
          const categoryDone =
            categoryProgress.total > 0 &&
            categoryProgress.completed === categoryProgress.total;
          const categoryOpen = !!openCategories[category.id];

          return (
            <div
              key={category.id}
                className={`rounded-[28px] border transition-all ${
                categoryDone
                  ? 'border-emerald-200 bg-emerald-50/40'
                  : 'border-slate-200 bg-white'
                }`}
                data-testid={`checklist-category-${category.id}`}
              >
              <button
                type="button"
                onClick={() =>
                  setOpenCategories((prev) => ({
                    ...prev,
                    [category.id]: !prev[category.id],
                  }))
                }
                className="w-full p-4 sm:p-5 text-left flex flex-col gap-3"
                aria-expanded={categoryOpen}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center min-w-0 gap-3">
                    {categoryOpen ? (
                      <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
                    )}
                    {categoryDone ? (
                      <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
                    ) : (
                      <Circle className="w-8 h-8 text-slate-300 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <h3
                        className={`text-lg sm:text-xl font-black tracking-tight truncate ${
                          categoryDone ? 'text-emerald-800' : 'text-slate-900'
                        }`}
                      >
                        {category.title}
                      </h3>
                      <p className="text-[11px] font-bold text-slate-400">
                        중항목 {category.sections.length}개
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-sm sm:text-base font-black shrink-0 ${
                      categoryDone ? 'text-emerald-700' : 'text-blue-600'
                    }`}
                    data-testid={`checklist-category-progress-${category.id}`}
                  >
                    {categoryProgress.percentage}%
                  </span>
                </div>
                <ProgressBar value={categoryProgress.percentage} />
              </button>

              {categoryOpen && (
                <div className="px-4 sm:px-5 pb-5 space-y-3">
                  {category.sections.map((section) => {
                    const sectionProgress = getSectionProgress(section, completions);
                    const sectionDone =
                      sectionProgress.total > 0 &&
                      sectionProgress.completed === sectionProgress.total;
                    const sectionOpen = !!openSections[section.id];

                    return (
                      <div
                        key={section.id}
                        className={`rounded-[22px] border ${
                          sectionDone
                            ? 'border-emerald-200 bg-white'
                            : 'border-slate-200 bg-slate-50/70'
                        }`}
                        data-testid={`checklist-section-${section.id}`}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setOpenSections((prev) => ({
                              ...prev,
                              [section.id]: !prev[section.id],
                            }))
                          }
                          className="w-full p-4 text-left space-y-2"
                          aria-expanded={sectionOpen}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center min-w-0 gap-2.5">
                              {sectionOpen ? (
                                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                              )}
                              {sectionDone ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                              ) : (
                                <Circle className="w-5 h-5 text-slate-300 shrink-0" />
                              )}
                              <span
                                className={`text-base font-black truncate ${
                                  sectionDone ? 'text-emerald-800' : 'text-slate-800'
                                }`}
                              >
                                {section.title}
                              </span>
                            </div>
                            <span
                              className={`text-sm font-black shrink-0 ${
                                sectionDone ? 'text-emerald-700' : 'text-blue-600'
                              }`}
                              data-testid={`checklist-section-progress-${section.id}`}
                            >
                              {sectionProgress.percentage}%
                            </span>
                          </div>
                          <ProgressBar value={sectionProgress.percentage} size="sm" />
                        </button>

                        {sectionOpen && (
                          <div className="px-4 pb-4 space-y-2">
                            {section.tasks.map((task) => {
                              const completed = getTaskCompleted(task, completions);
                              return (
                                <label
                                  key={task.id}
                                  className={`flex items-center gap-3 rounded-2xl border px-3.5 py-3 text-sm font-bold cursor-pointer transition-all ${
                                    completed
                                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={completed}
                                    onChange={() => toggleTask(task.id)}
                                    className="w-4 h-4 rounded-sm text-blue-600 focus:ring-blue-600 cursor-pointer shrink-0"
                                    data-testid={`checklist-task-${task.id}`}
                                  />
                                  <span className={completed ? 'line-through decoration-2' : ''}>
                                    {task.title}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
