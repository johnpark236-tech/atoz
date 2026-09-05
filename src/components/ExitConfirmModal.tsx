import React from 'react';
import { LogOut, X } from 'lucide-react';

interface ExitConfirmModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const ExitConfirmModal: React.FC<ExitConfirmModalProps> = ({
  open,
  onCancel,
  onConfirm,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 backdrop-blur-sm px-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="exit-confirm-title"
        className="w-full max-w-sm rounded-[28px] border-2 border-slate-900 bg-white p-6 shadow-[6px_6px_0px_0px_rgba(37,99,235,1)]"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white">
              <LogOut className="h-5 w-5" />
            </div>
            <div>
              <h2 id="exit-confirm-title" className="text-xl font-black tracking-tight text-slate-900">
                종료하시겠습니까?
              </h2>
              <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-500">
                현재 페이지를 나가면 이전 화면으로 이동합니다.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="종료 확인창 닫기"
            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base font-black text-slate-800 transition hover:bg-slate-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-2xl border border-slate-900 bg-slate-900 px-4 py-3 text-base font-black text-white transition hover:bg-slate-800"
          >
            종료
          </button>
        </div>
      </div>
    </div>
  );
};
