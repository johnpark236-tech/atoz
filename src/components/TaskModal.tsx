import React, { useState } from 'react';
import { Task, TaskStatus } from '../types';
import {
  X,
  ExternalLink,
  Clock,
  Coins,
  FileText,
  AlertTriangle,
  Building2,
  CheckCircle2,
  HelpCircle,
  Bot,
  Save,
} from 'lucide-react';

interface TaskModalProps {
  task: Task | null;
  onClose: () => void;
  onUpdateStatus: (taskId: string, status: TaskStatus, memo?: string) => void;
  onConsultAi: (task: Task) => void;
}

const STATUS_OPTIONS: TaskStatus[] = [
  '미착수',
  '준비중',
  '신청준비',
  '신청완료',
  '심사중',
  '보완요청',
  '승인',
  '완료',
  '불필요',
];

export const TaskModal: React.FC<TaskModalProps> = ({
  task,
  onClose,
  onUpdateStatus,
  onConsultAi,
}) => {
  if (!task) return null;

  const [currentStatus, setCurrentStatus] = useState<TaskStatus>(task.status);
  const [memo, setMemo] = useState(task.memo || '');
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  const handleSave = () => {
    onUpdateStatus(task.task_id, currentStatus, memo);
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-[32px] max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border-2 border-slate-900 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-start justify-between bg-slate-50/70">
          <div>
            <div className="flex items-center space-x-1.5 flex-wrap gap-y-1 mb-2">
              <span className="text-[10px] font-mono font-black text-slate-600 bg-slate-200/80 px-2 py-0.5 rounded-md">
                {task.task_id}
              </span>
              <span className="text-[10px] font-bold text-slate-700 bg-slate-200/60 px-2.5 py-0.5 rounded-full">
                {task.category} &gt; {task.sub_category}
              </span>
              {task.mandatory ? (
                <span className="text-[10px] font-black bg-red-50 text-red-700 border border-red-200 px-2.5 py-0.5 rounded-full">
                  필수 법정 절차
                </span>
              ) : (
                <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full">
                  선택/권장
                </span>
              )}
              {task.is_industry_specific && (
                <span className="text-[10px] font-black bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-0.5 rounded-full">
                  {task.industry_tag} 특화
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
              {task.task_name}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-slate-700">
          {/* Quick status & action selector */}
          <div className="p-4 bg-slate-50 rounded-[24px] border border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2.5">
              <label htmlFor="task-status-select" className="text-xs font-black text-slate-700">진행 상태:</label>
              <select
                id="task-status-select"
                aria-label="태스크 진행 상태 선택"
                value={currentStatus}
                onChange={(e) => setCurrentStatus(e.target.value as TaskStatus)}
                className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-black text-slate-900 shadow-xs focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-slate-900 text-white rounded-full text-xs font-black hover:bg-slate-800 transition-all shadow-[2px_2px_0px_0px_rgba(37,99,235,1)]"
              >
                <Save className="w-3.5 h-3.5 text-blue-400" />
                <span>{isSavedNotice ? '저장됨!' : '상태 저장'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onConsultAi(task);
                }}
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600 text-white font-black rounded-full text-xs hover:bg-blue-700 transition-all shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>AI 비서에게 묻기</span>
              </button>
            </div>
          </div>

          {/* Description & Why needed */}
          <div>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
              상세 설명
            </h3>
            <p className="text-slate-800 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200 font-medium text-xs sm:text-sm">
              {task.description}
            </p>
          </div>

          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest mb-1.5 flex items-center space-x-1.5 text-amber-900">
              <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>왜 필요한가? (사업적 당위성)</span>
            </h3>
            <p className="text-amber-950 bg-amber-50/80 p-4 rounded-2xl border-2 border-amber-300/70 leading-relaxed font-bold text-xs sm:text-sm">
              {task.why_needed}
            </p>
          </div>

          {/* Key Facts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex items-center space-x-1.5 text-slate-400 text-[10px] font-black uppercase tracking-wider mb-1">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                <span>담당 기관 및 신청처</span>
              </div>
              <div className="font-black text-slate-900 flex items-center justify-between text-xs sm:text-sm">
                <span>{task.organization}</span>
                {task.official_url && (
                  <a
                    href={task.official_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 font-black"
                  >
                    <span>바로가기</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex items-center space-x-1.5 text-slate-400 text-[10px] font-black uppercase tracking-wider mb-1">
                <Coins className="w-3.5 h-3.5 text-blue-600" />
                <span>예상 비용</span>
              </div>
              <div className="font-black text-slate-900 text-xs sm:text-sm">
                {task.estimated_cost}
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex items-center space-x-1.5 text-slate-400 text-[10px] font-black uppercase tracking-wider mb-1">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>소요 기간</span>
              </div>
              <div className="font-black text-slate-900 text-xs sm:text-sm">
                {task.estimated_days}
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex items-center space-x-1.5 text-slate-400 text-[10px] font-black uppercase tracking-wider mb-1">
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                <span>최종 결과물</span>
              </div>
              <div className="font-black text-slate-900 text-xs sm:text-sm">
                {task.result_document}
              </div>
            </div>
          </div>

          {/* Required Documents */}
          <div>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
              필요 서류 및 준비물
            </h3>
            <ul className="list-disc list-inside space-y-1.5 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-slate-800 text-xs sm:text-sm font-medium">
              {task.required_documents.map((doc, idx) => (
                <li key={idx} className="leading-normal">
                  {doc}
                </li>
              ))}
            </ul>
          </div>

          {/* Step by Step */}
          {task.step_by_step && task.step_by_step.length > 0 && (
            <div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                구체적 진행 순서 (Step-by-Step)
              </h3>
              <div className="space-y-2">
                {task.step_by_step.map((step, idx) => (
                  <div
                    key={idx}
                    className="flex items-start space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs"
                  >
                    <span className="w-5 h-5 rounded-full bg-slate-900 font-black text-white flex items-center justify-center shrink-0 text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="text-slate-800 font-bold pt-0.5 leading-relaxed">
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cautions */}
          {task.cautions && (
            <div className="p-4 bg-red-50/80 rounded-2xl border-2 border-red-300/80 text-red-900">
              <div className="flex items-center space-x-1.5 font-black text-xs mb-1 text-red-800">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>주의사항 및 실패 사례 예방</span>
              </div>
              <p className="text-xs leading-relaxed text-red-950 font-bold">
                {task.cautions}
              </p>
            </div>
          )}

          {/* Memo & Notes field */}
          <div>
            <label htmlFor="task-memo-input" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
              내 프로젝트 메모 및 진행 기록
            </label>
            <textarea
              id="task-memo-input"
              rows={3}
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="서류 발급 번호, 신청일자, 반려 사유, 또는 보완 사항 등을 자유롭게 기록하세요."
              className="w-full text-xs font-bold p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-slate-900 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-200 flex items-center justify-between bg-slate-50">
          <span className="text-xs font-bold text-slate-500">
            {task.dependency && task.dependency.length > 0
              ? `선행 필수: ${task.dependency.join(', ')}`
              : '선행 태스크 없음 (즉시 시작 가능)'}
          </span>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-full transition-colors"
            >
              닫기
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 text-xs font-black text-white bg-slate-900 hover:bg-slate-800 rounded-full shadow-[2px_2px_0px_0px_rgba(37,99,235,1)] transition-all"
            >
              저장하고 닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
