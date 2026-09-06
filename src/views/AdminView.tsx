import React, { useState, useEffect } from 'react';
import {
  Users, CreditCard, TrendingUp, Shield, Search, Filter,
  AlertTriangle, CheckCircle, XCircle, Loader2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getAllUsersForAdmin } from '../services/auth/mockAuthProvider';
import { getRefundRequests, updateRefundStatus } from '../services/billing/mockPaymentProvider';
import { UserProfile } from '../types/auth';
import { RefundRequest } from '../types/billing';
import { loadProjects } from '../services/storage';

export const AdminView: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  useEffect(() => {
    if (user?.role !== 'admin') return;
    setLoading(true);
    try {
      setUsers(getAllUsersForAdmin());
      setRefunds(getRefundRequests());
    } finally {
      setLoading(false);
    }
  }, [user]);

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Shield className="w-16 h-16 text-red-300" />
        <h3 className="text-xl font-black text-slate-900">접근 제한</h3>
        <p className="text-slate-500">관리자 전용 페이지입니다.</p>
      </div>
    );
  }

  const projects = loadProjects();
  const freeCount = users.filter((u) => u.plan === 'free').length;
  const proCount = users.filter((u) => u.plan === 'pro').length;
  const activeCount = users.filter((u) => u.subscriptionStatus === 'active').length;
  const pendingRefunds = refunds.filter((r) => r.status === 'pending').length;

  const filteredUsers = users.filter((u) => {
    const matchSearch = !searchQuery ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.displayName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchPlan = !planFilter || u.plan === planFilter;
    return matchSearch && matchPlan;
  });

  const handleRefundAction = (refundId: string, status: 'approved' | 'rejected') => {
    updateRefundStatus(refundId, status);
    setRefunds(getRefundRequests());
    showToast(status === 'approved' ? '환불 승인되었습니다.' : '환불 반려되었습니다.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center border-2 border-purple-200">
          <Shield className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900">관리자 대시보드</h2>
          <p className="text-sm text-slate-500 font-medium">서비스 현황을 모니터링합니다</p>
        </div>
      </div>

      {/* Mock notice */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl px-4 py-3 text-xs text-purple-700 font-medium">
        🔧 [개발 모드] 실제 DB가 아닌 localStorage 기반 mock 데이터입니다.
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: '총 사용자', value: users.length, icon: <Users className="w-5 h-5 text-blue-600" />, color: 'blue' },
          { label: 'PRO 구독', value: proCount, icon: <CreditCard className="w-5 h-5 text-yellow-600" />, color: 'yellow' },
          { label: '프로젝트 수', value: projects.length, icon: <TrendingUp className="w-5 h-5 text-green-600" />, color: 'green' },
          { label: '환불 요청', value: pendingRefunds, icon: <AlertTriangle className="w-5 h-5 text-red-600" />, color: 'red' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl border-2 border-slate-200 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{stat.label}</span>
              {stat.icon}
            </div>
            <p className="text-3xl font-black text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Plan distribution */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-6">
        <h3 className="font-black text-slate-900 mb-4">플랜 현황</h3>
        <div className="flex gap-4">
          <div className="flex-1 bg-slate-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-black text-slate-700">{freeCount}</p>
            <p className="text-sm font-bold text-slate-400">FREE</p>
          </div>
          <div className="flex-1 bg-yellow-50 rounded-xl p-4 text-center border-2 border-yellow-100">
            <p className="text-2xl font-black text-yellow-700">{proCount}</p>
            <p className="text-sm font-bold text-yellow-400">PRO</p>
          </div>
          <div className="flex-1 bg-green-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-black text-green-700">{activeCount}</p>
            <p className="text-sm font-bold text-green-400">활성 구독</p>
          </div>
        </div>
      </div>

      {/* User list */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-4 flex-wrap">
          <h3 className="font-black text-slate-900">사용자 목록</h3>
          <div className="flex items-center gap-3 ml-auto flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="이메일 검색..."
                className="pl-8 pr-3 py-2 rounded-lg border border-slate-200 text-xs font-medium focus:outline-none focus:border-blue-500"
              />
            </div>
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium focus:outline-none focus:border-blue-500"
            >
              <option value="">전체 플랜</option>
              <option value="free">FREE</option>
              <option value="pro">PRO</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-slate-400 font-medium">
            사용자가 없습니다.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">이메일</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">가입일</th>
                  <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">플랜</th>
                  <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">역할</th>
                  <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">상태</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="border-t border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 font-medium text-slate-900 truncate max-w-xs">{u.email}</td>
                    <td className="px-4 py-3 text-slate-500">{new Date(u.createdAt).toLocaleDateString('ko-KR')}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                        u.plan === 'pro' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {u.plan.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                        u.role === 'admin' ? 'bg-purple-50 text-purple-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                        u.subscriptionStatus === 'active' ? 'bg-green-50 text-green-700' :
                        u.subscriptionStatus === 'canceled' ? 'bg-red-50 text-red-700' :
                        'bg-slate-100 text-slate-500'
                      }`}>
                        {u.subscriptionStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Refund requests */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <h3 className="font-black text-slate-900">환불 요청</h3>
          {pendingRefunds > 0 && (
            <span className="text-xs font-black bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
              {pendingRefunds} 대기
            </span>
          )}
        </div>
        {refunds.length === 0 ? (
          <div className="flex items-center justify-center h-24 text-slate-400 font-medium text-sm">
            환불 요청이 없습니다.
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {refunds.map((r) => (
              <div key={r.id} className="px-6 py-4 flex items-center gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-400">{new Date(r.requestedAt).toLocaleDateString('ko-KR')}</p>
                  <p className="text-sm font-bold text-slate-800 truncate">{r.userId}</p>
                  <p className="text-xs text-slate-500">{r.reason}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {r.status === 'pending' ? (
                    <>
                      <button
                        onClick={() => handleRefundAction(r.id, 'approved')}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 font-bold rounded-lg border border-green-200 hover:bg-green-100 transition-colors text-xs"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        승인
                      </button>
                      <button
                        onClick={() => handleRefundAction(r.id, 'rejected')}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 font-bold rounded-lg border border-red-200 hover:bg-red-100 transition-colors text-xs"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        반려
                      </button>
                    </>
                  ) : (
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      r.status === 'approved' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {r.status === 'approved' ? '승인됨' : '반려됨'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-5 py-3 rounded-full shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
};
