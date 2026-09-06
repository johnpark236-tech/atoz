import React, { useState } from 'react';
import { Crown, Check, Loader2, X } from 'lucide-react';
import { PLAN_CONFIGS } from '../types/billing';
import { useAuth } from '../contexts/AuthContext';
import { billingService } from '../services/billing/billingService';

interface PricingViewProps {
  onSelectTab: (tab: string) => void;
}

export const PricingView: React.FC<PricingViewProps> = ({ onSelectTab }) => {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSubscribe = async () => {
    if (!user) {
      showToast('로그인이 필요합니다.', 'error');
      return;
    }
    if (user.plan === 'pro' && user.subscriptionStatus === 'active') {
      showToast('이미 PRO 구독 중입니다.', 'error');
      return;
    }

    setLoading(true);
    try {
      const result = await billingService.subscribe(user.id, 'pro');
      if (result.success) {
        showToast('PRO 구독이 시작되었습니다! 🎉');
        // Refresh user
        const { authService } = await import('../services/auth/authService');
        const updated = await authService.getCurrentUser();
        if (updated) setUser(updated);
      } else {
        showToast(result.error || '결제에 실패했습니다.', 'error');
      }
    } catch {
      showToast('결제 중 오류가 발생했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const freePlan = PLAN_CONFIGS.free;
  const proPlan = PLAN_CONFIGS.pro;
  const isAlreadyPro = user?.plan === 'pro' && user?.subscriptionStatus === 'active';

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-black tracking-tight text-slate-900">
          요금제 선택
        </h2>
        <p className="text-slate-500 font-medium">
          아이디어에서 첫 매출까지, 당신의 속도에 맞게 시작하세요
        </p>
      </div>

      {/* Mock notice */}
      <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 text-center">
        <p className="text-sm text-amber-700 font-bold">
          🔧 [개발 모드] 실제 결제가 처리되지 않습니다.
          <span className="font-normal ml-1">ENV_REQUIRED: PG 연동 (Toss Payments / PortOne)</span>
        </p>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Free */}
        <div className={`bg-white rounded-2xl border-2 ${user?.plan === 'free' || !user ? 'border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]' : 'border-slate-200'} p-6 space-y-6`}>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg font-black text-slate-900">FREE</span>
              {(user?.plan === 'free' || !user) && (
                <span className="text-xs bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full border border-slate-200">현재 플랜</span>
              )}
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-slate-900">₩0</span>
              <span className="text-slate-500 font-medium">/월</span>
            </div>
            <p className="text-sm text-slate-500 mt-2">개인 창업자를 위한 기본 기능</p>
          </div>

          <ul className="space-y-3">
            {freePlan.features.map((f, i) => (
              <li key={i} className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Check className="w-4 h-4 text-green-500 shrink-0" />
                {f}
              </li>
            ))}
          </ul>

          <button
            disabled
            className="w-full py-3 bg-slate-100 text-slate-400 font-bold rounded-xl border-2 border-slate-200 cursor-not-allowed"
          >
            무료 플랜
          </button>
        </div>

        {/* Pro */}
        <div className={`rounded-2xl border-2 p-6 space-y-6 relative overflow-hidden ${
          isAlreadyPro
            ? 'bg-yellow-50 border-yellow-400 shadow-[4px_4px_0px_0px_rgba(234,179,8,1)]'
            : 'bg-slate-900 border-slate-900 shadow-[4px_4px_0px_0px_rgba(59,130,246,1)]'
        }`}>
          {!isAlreadyPro && (
            <div className="absolute top-4 right-4 bg-blue-600 text-white text-xs font-black px-3 py-1 rounded-full">
              추천
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Crown className={`w-5 h-5 ${isAlreadyPro ? 'text-yellow-600' : 'text-yellow-400'}`} />
              <span className={`text-lg font-black ${isAlreadyPro ? 'text-yellow-800' : 'text-white'}`}>PRO</span>
              {isAlreadyPro && (
                <span className="text-xs bg-yellow-100 text-yellow-700 font-bold px-2 py-0.5 rounded-full border border-yellow-300">현재 플랜</span>
              )}
            </div>
            <div className="flex items-baseline gap-1">
              <span className={`text-4xl font-black ${isAlreadyPro ? 'text-yellow-900' : 'text-white'}`}>₩{proPlan.price.toLocaleString()}</span>
              <span className={`font-medium ${isAlreadyPro ? 'text-yellow-700' : 'text-slate-400'}`}>/월</span>
            </div>
            <p className={`text-sm mt-2 ${isAlreadyPro ? 'text-yellow-700' : 'text-slate-400'}`}>
              창업 전 과정을 완주하는 PRO 기능
            </p>
          </div>

          <ul className="space-y-3">
            {proPlan.features.map((f, i) => (
              <li key={i} className={`flex items-center gap-2 text-sm font-medium ${isAlreadyPro ? 'text-yellow-900' : 'text-slate-300'}`}>
                <Check className={`w-4 h-4 shrink-0 ${isAlreadyPro ? 'text-yellow-500' : 'text-yellow-400'}`} />
                {f}
              </li>
            ))}
          </ul>

          {!isAlreadyPro ? (
            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="w-full py-3.5 bg-yellow-400 text-slate-900 font-black rounded-xl border-2 border-white shadow-[3px_3px_0px_0px_rgba(255,255,255,0.3)] hover:shadow-[1px_1px_0px_0px_rgba(255,255,255,0.3)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crown className="w-4 h-4" />}
              {loading ? '처리 중...' : user ? 'PRO 시작하기' : '시작하기 (로그인 필요)'}
            </button>
          ) : (
            <button
              onClick={() => onSelectTab('account')}
              className="w-full py-3.5 bg-yellow-100 text-yellow-800 font-bold rounded-xl border-2 border-yellow-300 hover:bg-yellow-200 transition-colors"
            >
              구독 관리
            </button>
          )}
        </div>
      </div>

      {/* Feature comparison */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="font-black text-slate-900">기능 비교</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left px-6 py-3 font-bold text-slate-600">기능</th>
                <th className="text-center px-4 py-3 font-bold text-slate-600">FREE</th>
                <th className="text-center px-4 py-3 font-black text-blue-700">PRO</th>
              </tr>
            </thead>
            <tbody>
              {[
                { feature: '프로젝트 수', free: '1개', pro: '최대 20개' },
                { feature: 'A to Z 로드맵', free: '✓', pro: '✓' },
                { feature: '사업화 체크리스트', free: '✓', pro: '✓' },
                { feature: '매출·정산 관리', free: '기본', pro: '고급' },
                { feature: 'AI 창업비서', free: '기본', pro: '컨텍스트 강화' },
                { feature: '문서 보관함', free: '—', pro: '✓' },
                { feature: '고급 분석 리포트', free: '—', pro: '✓' },
                { feature: '알림 기능', free: '—', pro: '출시 예정' },
              ].map((row, i) => (
                <tr key={i} className="border-t border-slate-50">
                  <td className="px-6 py-3 font-medium text-slate-700">{row.feature}</td>
                  <td className="px-4 py-3 text-center text-slate-500">{row.free}</td>
                  <td className="px-4 py-3 text-center font-bold text-blue-700">{row.pro}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-full shadow-lg border-2 border-slate-900 text-sm font-bold ${
          toast.type === 'success' ? 'bg-slate-900 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.type === 'error' ? <X className="w-4 h-4" /> : null}
          {toast.message}
        </div>
      )}
    </div>
  );
};
