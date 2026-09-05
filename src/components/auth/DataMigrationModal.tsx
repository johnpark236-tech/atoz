import React, { useState } from 'react';
import { Upload, CheckSquare, Square, Loader2, CheckCircle } from 'lucide-react';
import { getGuestProjects, migrateGuestData } from '../../services/migrationService';
import { useAuth } from '../../contexts/AuthContext';

interface DataMigrationModalProps {
  onComplete: () => void;
  onSkip: () => void;
}

export const DataMigrationModal: React.FC<DataMigrationModalProps> = ({ onComplete, onSkip }) => {
  const { user } = useAuth();
  const guestProjects = getGuestProjects();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(guestProjects.map((p) => p.id))
  );
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [result, setResult] = useState<{ migrated: number; errors: string[] } | null>(null);

  const toggleProject = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleMigrate = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await migrateGuestData(user.id, Array.from(selectedIds));
      setResult({ migrated: res.migrated, errors: res.errors });
      setDone(true);
    } catch {
      setResult({ migrated: 0, errors: ['이전에 실패했습니다.'] });
      setDone(true);
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-2xl border-2 border-slate-900 w-full max-w-md p-6 text-center space-y-4">
          <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-black text-slate-900">데이터 이전 완료</h2>
          <p className="text-sm text-slate-600">
            <span className="font-bold text-blue-600">{result?.migrated}개</span> 프로젝트가 계정으로 이전되었습니다.
          </p>
          {result?.errors.length ? (
            <div className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">
              {result.errors.join(', ')}
            </div>
          ) : null}
          <button
            onClick={onComplete}
            className="w-full py-3 bg-blue-600 text-white font-black rounded-xl border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] hover:shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
          >
            시작하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl border-2 border-slate-900 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Upload className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">기존 데이터 가져오기</h2>
              <p className="text-xs text-slate-500">브라우저에 저장된 데이터를 계정으로 이전합니다</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600 font-medium">
            이전할 프로젝트를 선택하세요:
          </p>

          <div className="space-y-2">
            {guestProjects.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => toggleProject(p.id)}
                className="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-all text-left"
              >
                {selectedIds.has(p.id) ? (
                  <CheckSquare className="w-5 h-5 text-blue-600 shrink-0" />
                ) : (
                  <Square className="w-5 h-5 text-slate-300 shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{p.title}</p>
                  <p className="text-xs text-slate-400">{p.tasks.length}개 Task · {p.sales.length}개 매출</p>
                </div>
              </button>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onSkip}
              className="flex-1 py-3 bg-white text-slate-600 font-bold rounded-xl border-2 border-slate-200 hover:bg-slate-50 transition-colors"
            >
              건너뛰기
            </button>
            <button
              onClick={handleMigrate}
              disabled={loading || selectedIds.size === 0}
              className="flex-1 py-3 bg-blue-600 text-white font-black rounded-xl border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] hover:shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {loading ? '이전 중...' : `${selectedIds.size}개 가져오기`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
