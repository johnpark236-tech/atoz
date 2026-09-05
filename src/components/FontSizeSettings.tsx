import React, { useEffect, useState } from 'react';
import { Settings2, X, RotateCcw, Save } from 'lucide-react';

type FontSettings = {
  small: number;
  body: number;
  heading: number;
};

const STORAGE_KEY = 'bizflow-font-settings-v1';
const DEFAULT_SETTINGS: FontSettings = {
  small: 1.5,
  body: 1.1,
  heading: 1,
};

function loadSettings(): FontSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function applySettings(settings: FontSettings) {
  const root = document.documentElement;
  root.style.setProperty('--font-scale-small', String(settings.small));
  root.style.setProperty('--font-scale-body', String(settings.body));
  root.style.setProperty('--font-scale-heading', String(settings.heading));
}

export const FontSizeSettings: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<FontSettings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const settings = loadSettings();
    setDraft(settings);
    applySettings(settings);
  }, []);

  const update = (key: keyof FontSettings, value: number) => {
    const next = { ...draft, [key]: value };
    setDraft(next);
    applySettings(next);
    setSaved(false);
  };

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    applySettings(draft);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  const handleReset = () => {
    setDraft(DEFAULT_SETTINGS);
    applySettings(DEFAULT_SETTINGS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
    setSaved(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-slate-200 bg-white text-slate-700 hover:border-slate-900 hover:text-slate-900 transition-all font-black text-sm"
        aria-label="글자 크기 설정"
        title="글자 크기 설정"
      >
        <Settings2 className="w-4 h-4" />
        <span className="hidden lg:inline">글자 설정</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] bg-slate-900/45 backdrop-blur-sm flex items-center justify-center p-4" onMouseDown={() => setOpen(false)}>
          <div
            className="w-full max-w-lg bg-white rounded-[28px] border-2 border-slate-900 shadow-[6px_6px_0_0_rgba(37,99,235,1)] p-6 sm:p-7"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <div className="text-sm font-black text-blue-600 uppercase tracking-wider">Accessibility</div>
                <h2 className="text-2xl font-black text-slate-900 mt-1">글자 크기 설정</h2>
                <p className="text-sm font-semibold text-slate-500 mt-2 leading-relaxed">
                  작은 안내문, 일반 본문, 제목 크기를 각각 조정할 수 있습니다. 저장하면 다음 방문에도 동일하게 적용됩니다.
                </p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="p-2 rounded-full hover:bg-slate-100" aria-label="닫기">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5">
              <SettingRow
                label="작은 글씨"
                description="10~12px 안내문·배지·보조 설명"
                value={draft.small}
                min={1}
                max={2}
                step={0.05}
                onChange={(v) => update('small', v)}
              />
              <SettingRow
                label="일반 글씨"
                description="본문·버튼·일반 텍스트"
                value={draft.body}
                min={0.9}
                max={1.6}
                step={0.05}
                onChange={(v) => update('body', v)}
              />
              <SettingRow
                label="큰 글씨"
                description="페이지 제목·섹션 헤딩"
                value={draft.heading}
                min={0.9}
                max={1.4}
                step={0.05}
                onChange={(v) => update('heading', v)}
              />
            </div>

            <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">미리보기</div>
              <div className="preview-heading text-xl font-black text-slate-900">사업화 진행 현황</div>
              <div className="preview-body text-sm font-bold text-slate-700 mt-1">상표 출원과 사업자등록 진행 상태를 확인하세요.</div>
              <div className="preview-small text-[10px] font-bold text-slate-500 mt-1">예상 처리기간 1~3일 · 공식기관 확인 필요</div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:justify-between">
              <button type="button" onClick={handleReset} className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full border border-slate-300 bg-white font-black text-sm text-slate-700 hover:bg-slate-50">
                <RotateCcw className="w-4 h-4" />
                기본값 복원
              </button>
              <div className="flex gap-3">
                <button type="button" onClick={() => setOpen(false)} className="px-5 py-3 rounded-full border border-slate-300 font-black text-sm text-slate-700 hover:bg-slate-50">닫기</button>
                <button type="button" onClick={handleSave} className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-blue-600 text-white font-black text-sm hover:bg-blue-700 shadow-[2px_2px_0_0_rgba(15,23,42,1)]">
                  <Save className="w-4 h-4" />
                  {saved ? '저장 완료' : '설정 저장'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const SettingRow: React.FC<{
  label: string;
  description: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}> = ({ label, description, value, min, max, step, onChange }) => (
  <div className="rounded-2xl border border-slate-200 p-4">
    <div className="flex items-center justify-between gap-4 mb-3">
      <div>
        <div className="font-black text-slate-900">{label}</div>
        <div className="text-xs font-bold text-slate-500 mt-0.5">{description}</div>
      </div>
      <div className="min-w-16 text-center px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 font-black text-sm">
        {Math.round(value * 100)}%
      </div>
    </div>
    <div className="flex items-center gap-3">
      <button type="button" onClick={() => onChange(Math.max(min, Number((value - step).toFixed(2))))} className="w-9 h-9 rounded-full border border-slate-300 font-black text-lg hover:bg-slate-50" aria-label={`${label} 축소`}>−</button>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 accent-blue-600"
      />
      <button type="button" onClick={() => onChange(Math.min(max, Number((value + step).toFixed(2))))} className="w-9 h-9 rounded-full border border-slate-300 font-black text-lg hover:bg-slate-50" aria-label={`${label} 확대`}>+</button>
    </div>
  </div>
);
