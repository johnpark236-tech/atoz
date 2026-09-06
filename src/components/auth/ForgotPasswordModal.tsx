import React, { useState } from 'react';
import { X, Mail, Loader2, CheckCircle } from 'lucide-react';
import { authService } from '../../services/auth/authService';

interface ForgotPasswordModalProps {
  onClose: () => void;
  onGoLogin: () => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ onClose, onGoLogin }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await authService.sendPasswordResetEmail(email);
      if (result.success) {
        setSent(true);
      } else {
        setError(result.error || '오류가 발생했습니다.');
      }
    } catch {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl border-2 border-slate-900 w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-black tracking-tight text-slate-900">비밀번호 찾기</h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">이메일로 재설정 링크를 보내드립니다</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <div className="p-6">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <p className="font-black text-slate-900">이메일을 확인해주세요</p>
                <p className="text-sm text-slate-500 mt-1">
                  <span className="font-bold text-slate-700">{email}</span>로<br />
                  비밀번호 재설정 링크를 전송했습니다.
                </p>
                {/* MOCK notice */}
                <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg mt-3 font-medium">
                  [개발 모드] 실제 이메일은 발송되지 않습니다. ENV_REQUIRED: SMTP 설정 필요
                </p>
              </div>
              <button
                onClick={onGoLogin}
                className="w-full py-3 bg-slate-900 text-white font-black rounded-xl border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(59,130,246,1)] hover:shadow-[1px_1px_0px_0px_rgba(59,130,246,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
              >
                로그인으로 이동
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 font-medium">
                  {error}
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">이메일</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="가입한 이메일 입력"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 text-sm font-medium focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] hover:shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {loading ? '전송 중...' : '재설정 링크 전송'}
              </button>
              <p className="text-center text-sm text-slate-500">
                <button type="button" onClick={onGoLogin} className="text-blue-600 font-black hover:underline">
                  로그인으로 돌아가기
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
