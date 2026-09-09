import React, { useState, useEffect } from 'react';
import {
  Cloud,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  UploadCloud,
  DownloadCloud,
  X,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import {
  getCloudEndpoint,
  setCloudEndpointOverride,
  isCloudConfigured,
  checkCloudHealth,
  CloudSyncStatus,
} from '../services/cloudStorage';
import {
  getCloudStatus,
  getCloudStatusMessage,
  subscribeCloudStatus,
  performCloudSync,
  initAppState,
} from '../services/storage';
import { Project } from '../types';

interface CloudSyncModalProps {
  open: boolean;
  onClose: () => void;
  onStateReloaded?: (projects: Project[], activeId: string) => void;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  open,
  onClose,
  onStateReloaded,
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [status, setStatus] = useState<CloudSyncStatus>(getCloudStatus());
  const [statusMessage, setStatusMessage] = useState<string>(getCloudStatusMessage());
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  useEffect(() => {
    if (open) {
      setUrlInput(getCloudEndpoint());
      setStatus(getCloudStatus());
      setStatusMessage(getCloudStatusMessage());
      setFeedback(null);
    }
  }, [open]);

  useEffect(() => {
    const unsub = subscribeCloudStatus((st, msg) => {
      setStatus(st);
      if (msg) setStatusMessage(msg);
    });
    return unsub;
  }, []);

  if (!open) return null;

  const handleSaveUrl = () => {
    const trimmed = urlInput.trim();
    setCloudEndpointOverride(trimmed.length > 0 ? trimmed : null);
    setFeedback({
      type: 'success',
      text: trimmed ? 'Google Sheets 웹 앱 URL이 설정되었습니다.' : '클라우드 URL 설정이 해제되었습니다 (로컬 모드).',
    });
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setFeedback(null);
    try {
      const res = await checkCloudHealth();
      if (res.ok) {
        setFeedback({
          type: 'success',
          text: `연결 성공! Google Sheets와 정상 통신 중입니다. (${res.timestamp || new Date().toLocaleTimeString()})`,
        });
      } else {
        setFeedback({
          type: 'error',
          text: `연결 실패: ${res.message || '응답이 없습니다.'}`,
        });
      }
    } catch (e: any) {
      setFeedback({
        type: 'error',
        text: `오류 발생: ${e.message || '알 수 없는 오류'}`,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleForcePush = async () => {
    setIsSyncing(true);
    setFeedback(null);
    try {
      const res = await performCloudSync();
      if (res.success) {
        setFeedback({
          type: 'success',
          text: '현재 로컬의 모든 프로젝트/체크리스트가 Google Sheets에 성공적으로 저장되었습니다.',
        });
      } else {
        setFeedback({
          type: 'error',
          text: `저장 실패: ${res.error || '알 수 없는 오류'}`,
        });
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const handleForcePull = async () => {
    setIsSyncing(true);
    setFeedback(null);
    try {
      const res = await initAppState();
      if (res.projects && res.projects.length > 0) {
        if (onStateReloaded) {
          onStateReloaded(res.projects, res.activeProjectId);
        }
        setFeedback({
          type: 'success',
          text: `Google Sheets에서 ${res.projects.length}개의 프로젝트를 성공적으로 불러왔습니다.`,
        });
      } else {
        setFeedback({
          type: 'info',
          text: '클라우드에 저장된 프로젝트가 없습니다.',
        });
      }
    } catch (e: any) {
      setFeedback({
        type: 'error',
        text: `불러오기 실패: ${e.message || '알 수 없는 오류'}`,
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 sm:p-7 space-y-6 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                Google Sheets 클라우드 동기화
              </h2>
              <p className="text-xs text-slate-500 font-bold">
                다른 PC에서도 동일한 사업화 로드맵과 진행상태를 조회/저장합니다.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Live Status */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3 min-w-0">
            {status === 'saved' || status === 'idle' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : status === 'saving' || status === 'loading' ? (
              <RefreshCw className="w-5 h-5 text-blue-600 animate-spin shrink-0" />
            ) : status === 'error' ? (
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            ) : (
              <Cloud className="w-5 h-5 text-slate-400 shrink-0" />
            )}
            <div className="min-w-0">
              <div className="text-xs font-black text-slate-900 truncate">
                상태:{' '}
                {status === 'saved'
                  ? '클라우드 동기화 완료'
                  : status === 'saving'
                  ? '클라우드 저장 중'
                  : status === 'loading'
                  ? '데이터 불러오는 중'
                  : status === 'error'
                  ? '클라우드 저장 오류'
                  : status === 'local_only'
                  ? '로컬 캐시 모드 (미연동)'
                  : '대기 중'}
              </div>
              <p className="text-[11px] text-slate-500 font-medium truncate">
                {statusMessage}
              </p>
            </div>
          </div>
          <button
            onClick={handleTestConnection}
            disabled={isTesting || !isCloudConfigured()}
            className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 shrink-0 flex items-center gap-1.5"
          >
            {isTesting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            연결 테스트
          </button>
        </div>

        {/* URL Configuration */}
        <div className="space-y-2">
          <label className="block text-xs font-black text-slate-700">
            Google Apps Script Web App URL
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://script.google.com/macros/s/.../exec"
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSaveUrl}
              className="px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-black hover:bg-blue-700 transition-colors shrink-0 shadow-xs"
            >
              저장
            </button>
          </div>
          <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
            Google Apps Script 배포 시 생성된 웹 앱 URL(Web App URL)을 입력합니다. 환경변수(<code className="font-mono text-blue-600">VITE_GOOGLE_SHEETS_API_URL</code>)를 설정하지 않은 경우에도 여기서 직접 입력하여 바로 연동할 수 있습니다.
          </p>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-3.5 rounded-2xl text-xs font-bold flex items-start gap-2.5 ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : feedback.type === 'error'
                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                : 'bg-blue-50 text-blue-800 border border-blue-200'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : feedback.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            ) : (
              <Cloud className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            )}
            <div className="leading-relaxed">{feedback.text}</div>
          </div>
        )}

        {/* Sync Controls */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleForcePush}
              disabled={isSyncing || !isCloudConfigured()}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-black text-slate-800 hover:bg-slate-50 disabled:opacity-40"
            >
              <UploadCloud className="w-4 h-4 text-blue-600" />
              <span>클라우드로 전체 내보내기</span>
            </button>
            <button
              onClick={handleForcePull}
              disabled={isSyncing || !isCloudConfigured()}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-black text-slate-800 hover:bg-slate-50 disabled:opacity-40"
            >
              <DownloadCloud className="w-4 h-4 text-emerald-600" />
              <span>클라우드에서 새로고침</span>
            </button>
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-black hover:bg-slate-800 transition-colors text-center"
          >
            닫기
          </button>
        </div>

        {/* Security / Dev Mode Notice */}
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3 text-[11px] text-amber-900 space-y-1">
          <div className="flex items-center gap-1.5 font-black text-amber-950">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
            <span>단일 개발자 테스트 모드 (DEV_SINGLE_USER_MODE)</span>
          </div>
          <p className="text-amber-800 font-medium">
            주민번호, 비밀번호, 카드번호, API Key 등 민감한 개인정보는 절대 저장하지 마십시오.
          </p>
        </div>
      </div>
    </div>
  );
};
