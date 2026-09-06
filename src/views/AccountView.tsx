import React, { useState, useEffect } from 'react';
import {
  User, CreditCard, Settings, FileText, LogOut, Trash2,
  ChevronRight, Crown, Calendar, Download, AlertTriangle,
  Loader2, CheckCircle, RefreshCw
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/auth/authService';
import { billingService } from '../services/billing/billingService';
import { PLAN_CONFIGS } from '../types/billing';
import { PaymentRecord, RefundRequest } from '../types/billing';
import { getConsentForUser } from '../services/auth/mockAuthProvider';
import { getRefundRequests } from '../services/billing/mockPaymentProvider';
import { loadProjects } from '../services/storage';

interface AccountViewProps {
  onSelectTab: (tab: string) => void;
}

type AccountSection = 'info' | 'plan' | 'data' | 'settings' | 'payments';

export const AccountView: React.FC<AccountViewProps> = ({ onSelectTab }) => {
  const { user, setUser } = useAuth();
  const [activeSection, setActiveSection] = useState<AccountSection>('info');
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [projectCount, setProjectCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  useEffect(() => {
    if (!user) return;
    billingService.getPaymentHistory(user.id).then(setPayments);
    setRefunds(getRefundRequests(user.id));
    setProjectCount(loadProjects().length);
  }, [user]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500 font-medium">로그인이 필요합니다.</p>
      </div>
    );
  }

  const consent = getConsentForUser(user.id);
  const sub = billingService.getSubscriptionState(user.id);
  const plan = PLAN_CONFIGS[user.plan];

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
    onSelectTab('dashboard');
  };

  const handleExportData = () => {
    const projects = loadProjects();
    const data = { exportedAt: new Date().toISOString(), projects };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bizflow_export_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('데이터를 내보냈습니다.');
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      '정말로 계정을 탈퇴하시겠습니까?\n모든 데이터가 삭제되며 복구할 수 없습니다.'
    );
    if (!confirmed) return;
    setLoading(true);
    try {
      const result = await authService.deleteAccount(user.id);
      if (result.success) {
        setUser(null);
        onSelectTab('dashboard');
      } else {
        showToast(result.error || '탈퇴에 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    const confirmed = window.confirm('구독을 해지하시겠습니까? 현재 결제 기간 종료까지 사용 가능합니다.');
    if (!confirmed) return;
    setLoading(true);
    try {
      const result = await billingService.cancel(user.id);
      if (result.success) {
        showToast('구독이 해지되었습니다.');
        const updated = await authService.getCurrentUser();
        if (updated) setUser(updated);
      } else {
        showToast(result.error || '해지에 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  const navItems: { id: AccountSection; label: string; icon: React.ReactNode }[] = [
    { id: 'info', label: '계정 정보', icon: <User className="w-4 h-4" /> },
    { id: 'plan', label: '요금제 & 구독', icon: <Crown className="w-4 h-4" /> },
    { id: 'data', label: '데이터 관리', icon: <FileText className="w-4 h-4" /> },
    { id: 'payments', label: '결제 내역', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'settings', label: '설정', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] p-6 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white text-xl font-black border-2 border-slate-900">
          {user.email[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-black text-slate-900 text-lg truncate">{user.displayName || user.email}</p>
          <p className="text-sm text-slate-500 font-medium truncate">{user.email}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs font-black px-2 py-0.5 rounded-full border-2 ${
              user.plan === 'pro'
                ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                : 'bg-slate-50 text-slate-600 border-slate-200'
            }`}>
              {user.plan === 'pro' ? '⭐ PRO' : 'FREE'}
            </span>
            {user.role === 'admin' && (
              <span className="text-xs font-black px-2 py-0.5 rounded-full border-2 bg-purple-50 text-purple-700 border-purple-200">
                ADMIN
              </span>
            )}
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 font-bold rounded-xl border-2 border-slate-200 hover:bg-slate-100 transition-colors text-sm"
        >
          <LogOut className="w-4 h-4" />
          로그아웃
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Nav */}
        <div className="md:col-span-1">
          <nav className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-bold transition-colors border-b border-slate-100 last:border-0 ${
                  activeSection === item.id
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {item.icon}
                {item.label}
                {activeSection === item.id && <ChevronRight className="w-3 h-3 ml-auto" />}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="md:col-span-3">
          {activeSection === 'info' && (
            <InfoSection user={user} consent={consent} createdAt={user.createdAt} />
          )}
          {activeSection === 'plan' && (
            <PlanSection
              user={user}
              plan={plan}
              sub={sub}
              onUpgrade={() => onSelectTab('pricing')}
              onCancel={handleCancelSubscription}
              loading={loading}
            />
          )}
          {activeSection === 'data' && (
            <DataSection
              projectCount={projectCount}
              onExport={handleExportData}
              onDeleteAccount={handleDeleteAccount}
              loading={loading}
            />
          )}
          {activeSection === 'payments' && (
            <PaymentsSection payments={payments} refunds={refunds} userId={user.id} />
          )}
          {activeSection === 'settings' && (
            <SettingsSection />
          )}
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-5 py-3 rounded-full shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
};

// --- Sub-sections ---

const Card: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden">
    <div className="px-6 py-4 border-b border-slate-100">
      <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider">{title}</h3>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

const InfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
    <span className="text-sm font-bold text-slate-500">{label}</span>
    <span className="text-sm font-bold text-slate-900">{value}</span>
  </div>
);

const InfoSection: React.FC<{ user: any; consent: any; createdAt: string }> = ({ user, consent, createdAt }) => (
  <div className="space-y-4">
    <Card title="계정 정보">
      <InfoRow label="이메일" value={user.email} />
      <InfoRow label="가입일" value={new Date(createdAt).toLocaleDateString('ko-KR')} />
      <InfoRow label="역할" value={user.role === 'admin' ? '관리자' : '일반 사용자'} />
      <InfoRow label="상태" value="활성" />
    </Card>
    {consent && (
      <Card title="약관 동의 내역">
        <InfoRow label="이용약관" value={`동의 (v${consent.termsVersion})`} />
        <InfoRow label="개인정보처리방침" value={`동의 (v${consent.privacyVersion})`} />
        <InfoRow label="마케팅 수신" value={consent.marketingOptional ? '동의' : '거부'} />
        <InfoRow label="동의 일시" value={new Date(consent.consentedAt).toLocaleDateString('ko-KR')} />
      </Card>
    )}
  </div>
);

const PlanSection: React.FC<{ user: any; plan: any; sub: any; onUpgrade: () => void; onCancel: () => void; loading: boolean }> = ({
  user, plan, sub, onUpgrade, onCancel, loading
}) => (
  <div className="space-y-4">
    <Card title="현재 요금제">
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border-2 border-slate-200">
          <Crown className={`w-6 h-6 ${user.plan === 'pro' ? 'text-yellow-500' : 'text-slate-400'}`} />
          <div>
            <p className="font-black text-slate-900">{plan.name}</p>
            <p className="text-sm text-slate-500">{plan.price === 0 ? '무료' : `₩${plan.price.toLocaleString()}/월`}</p>
          </div>
          {user.plan === 'pro' && (
            <span className="ml-auto text-xs font-black px-2 py-1 bg-green-50 text-green-700 rounded-full border border-green-200">
              {user.subscriptionStatus === 'active' ? '활성' : user.subscriptionStatus}
            </span>
          )}
        </div>

        {sub?.nextBillingDate && user.subscriptionStatus === 'active' && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Calendar className="w-4 h-4" />
            <span>다음 결제일: <strong>{new Date(sub.nextBillingDate).toLocaleDateString('ko-KR')}</strong></span>
          </div>
        )}
        {user.subscriptionStatus === 'canceled' && sub?.endDate && (
          <div className="flex items-center gap-2 text-sm text-amber-600">
            <AlertTriangle className="w-4 h-4" />
            <span>해지됨 · {new Date(sub.endDate).toLocaleDateString('ko-KR')}까지 사용 가능</span>
          </div>
        )}

        {user.plan === 'free' && (
          <button
            onClick={onUpgrade}
            className="w-full py-3 bg-yellow-400 text-slate-900 font-black rounded-xl border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] hover:shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center justify-center gap-2"
          >
            <Crown className="w-4 h-4" />
            PRO로 업그레이드
          </button>
        )}

        {user.plan === 'pro' && user.subscriptionStatus === 'active' && (
          <button
            onClick={onCancel}
            disabled={loading}
            className="w-full py-3 bg-white text-red-600 font-bold rounded-xl border-2 border-red-200 hover:bg-red-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            구독 해지
          </button>
        )}
      </div>
    </Card>
  </div>
);

const DataSection: React.FC<{ projectCount: number; onExport: () => void; onDeleteAccount: () => void; loading: boolean }> = ({
  projectCount, onExport, onDeleteAccount, loading
}) => (
  <div className="space-y-4">
    <Card title="데이터 관리">
      <div className="space-y-4">
        <div className="p-4 bg-slate-50 rounded-xl">
          <p className="text-sm font-bold text-slate-600">저장된 프로젝트</p>
          <p className="text-2xl font-black text-slate-900">{projectCount}개</p>
        </div>
        <button
          onClick={onExport}
          className="w-full py-3 bg-white text-slate-700 font-bold rounded-xl border-2 border-slate-200 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          전체 데이터 내보내기 (JSON)
        </button>
      </div>
    </Card>
    <Card title="계정 삭제">
      <div className="space-y-3">
        <div className="bg-red-50 rounded-xl p-4 text-sm text-red-700 font-medium">
          <AlertTriangle className="w-4 h-4 inline-block mr-2" />
          계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다.
        </div>
        <button
          onClick={onDeleteAccount}
          disabled={loading}
          className="w-full py-3 bg-white text-red-600 font-bold rounded-xl border-2 border-red-200 hover:bg-red-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          회원탈퇴
        </button>
      </div>
    </Card>
  </div>
);

const PaymentsSection: React.FC<{ payments: PaymentRecord[]; refunds: RefundRequest[]; userId: string }> = ({
  payments, refunds, userId
}) => {
  const [refundLoading, setRefundLoading] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [selectedPaymentId, setSelectedPaymentId] = useState('');

  const handleRefundRequest = async () => {
    if (!selectedPaymentId || !refundReason.trim()) return;
    setRefundLoading(selectedPaymentId);
    try {
      const result = await billingService.requestRefund(selectedPaymentId, refundReason);
      if (result.success) {
        setSelectedPaymentId('');
        setRefundReason('');
      }
    } finally {
      setRefundLoading('');
    }
  };

  return (
    <div className="space-y-4">
      <Card title="결제 내역">
        {payments.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">결제 내역이 없습니다.</p>
        ) : (
          <div className="space-y-3">
            {payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div>
                  <p className="text-sm font-bold text-slate-800">{p.description}</p>
                  <p className="text-xs text-slate-400">{new Date(p.createdAt).toLocaleDateString('ko-KR')}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-slate-900">₩{p.amount.toLocaleString()}</p>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    p.status === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                  }`}>
                    {p.status === 'success' ? '결제완료' : p.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {refunds.length > 0 && (
        <Card title="환불 요청 내역">
          {refunds.map((r) => (
            <div key={r.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl mb-2">
              <div>
                <p className="text-xs text-slate-500">{new Date(r.requestedAt).toLocaleDateString('ko-KR')}</p>
                <p className="text-sm font-medium text-slate-700">{r.reason}</p>
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                r.status === 'pending' ? 'bg-amber-50 text-amber-700' :
                r.status === 'approved' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                {r.status === 'pending' ? '검토중' : r.status === 'approved' ? '승인' : '반려'}
              </span>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
};

const SettingsSection: React.FC = () => (
  <Card title="설정">
    <div className="space-y-4">
      <div className="p-4 bg-slate-50 rounded-xl text-sm text-slate-500">
        <p className="font-bold text-slate-700 mb-1">글자 크기</p>
        <p>헤더의 폰트 크기 설정을 사용하세요.</p>
      </div>
      <div className="p-4 bg-slate-50 rounded-xl text-sm text-slate-500">
        <p className="font-bold text-slate-700 mb-1">알림 설정</p>
        <p className="text-amber-600">🔜 PRO 기능 - 출시 예정</p>
      </div>
    </div>
  </Card>
);
