import React, { useState } from 'react';
import { X, Mail, Lock, Eye, EyeOff, Loader2, CheckSquare, Square, ExternalLink } from 'lucide-react';
import { authService } from '../../services/auth/authService';
import { useAuth } from '../../contexts/AuthContext';
import { hasGuestData, getGuestProjects, isMigrationDone } from '../../services/migrationService';

interface SignupModalProps {
  onClose: () => void;
  onGoLogin: () => void;
  onGoMigration?: () => void;
}

export const SignupModal: React.FC<SignupModalProps> = ({ onClose, onGoLogin, onGoMigration }) => {
  const { setUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsChecked, setTermsChecked] = useState(false);
  const [privacyChecked, setPrivacyChecked] = useState(false);
  const [marketingChecked, setMarketingChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!termsChecked || !privacyChecked) {
      setError('필수 약관에 동의해주세요.');
      return;
    }
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (password.length < 8) {
      setError('비밀번호는 8자 이상이어야 합니다.');
      return;
    }

    setLoading(true);
    try {
      const result = await authService.signup({
        email,
        password,
        confirmPassword,
        consent: {
          terms: termsChecked,
          privacy: privacyChecked,
          marketing: marketingChecked,
        },
      });

      if (result.success && result.user) {
        setUser(result.user);
        // Check if there's guest data to migrate
        const guestProjects = getGuestProjects();
        const hasMigratable = guestProjects.length > 0 && !isMigrationDone(result.user.id);
        if (hasMigratable && onGoMigration) {
          onGoMigration();
        } else {
          onClose();
        }
      } else {
        setError(result.error || '회원가입에 실패했습니다.');
      }
    } catch {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl border-2 border-slate-900 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-black tracking-tight text-slate-900">회원가입</h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">무료로 시작하세요</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                placeholder="example@email.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 text-sm font-medium focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">비밀번호</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="8자 이상 입력"
                className="w-full pl-10 pr-10 py-3 rounded-xl border-2 border-slate-200 text-sm font-medium focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1">
                {showPassword ? <EyeOff className="w-4 h-4 text-slate-400" /> : <Eye className="w-4 h-4 text-slate-400" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">비밀번호 확인</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="비밀번호 재입력"
                className="w-full pl-10 pr-10 py-3 rounded-xl border-2 border-slate-200 text-sm font-medium focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1">
                {showConfirmPassword ? <EyeOff className="w-4 h-4 text-slate-400" /> : <Eye className="w-4 h-4 text-slate-400" />}
              </button>
            </div>
          </div>

          {/* Consent section */}
          <div className="border-2 border-slate-100 rounded-xl p-4 space-y-3">
            <p className="text-xs font-black text-slate-700 uppercase tracking-wider">약관 동의</p>

            <ConsentRow
              checked={termsChecked}
              onChange={setTermsChecked}
              label="이용약관 동의"
              required
              linkLabel="약관 보기"
              onLink={() => {}}
            />
            <ConsentRow
              checked={privacyChecked}
              onChange={setPrivacyChecked}
              label="개인정보 수집·이용 동의"
              required
              linkLabel="처리방침 보기"
              onLink={() => {}}
            />
            <ConsentRow
              checked={marketingChecked}
              onChange={setMarketingChecked}
              label="마케팅 정보 수신 동의 (선택)"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !termsChecked || !privacyChecked}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] hover:shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {loading ? '가입 중...' : '회원가입'}
          </button>

          <p className="text-center text-sm text-slate-500">
            이미 계정이 있으신가요?{' '}
            <button type="button" onClick={onGoLogin} className="text-blue-600 font-black hover:underline">
              로그인
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

interface ConsentRowProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  required?: boolean;
  linkLabel?: string;
  onLink?: () => void;
}

const ConsentRow: React.FC<ConsentRowProps> = ({ checked, onChange, label, required, linkLabel, onLink }) => (
  <div className="flex items-center gap-3">
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="shrink-0 text-blue-600"
      aria-label={`${label} ${checked ? '동의 취소' : '동의'}`}
    >
      {checked ? (
        <CheckSquare className="w-5 h-5" />
      ) : (
        <Square className="w-5 h-5 text-slate-300" />
      )}
    </button>
    <span className="text-sm font-medium text-slate-700 flex-1">
      {required && <span className="text-red-500 mr-1 font-black">[필수]</span>}
      {label}
    </span>
    {linkLabel && onLink && (
      <button
        type="button"
        onClick={onLink}
        className="text-xs text-blue-500 flex items-center gap-0.5 hover:underline shrink-0"
      >
        {linkLabel} <ExternalLink className="w-3 h-3" />
      </button>
    )}
  </div>
);
