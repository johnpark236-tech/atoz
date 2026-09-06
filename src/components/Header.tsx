import React from 'react';
import { Project } from '../types';
import { calculateProjectProgress } from '../services/ruleEngine';
import { FontSizeSettings } from './FontSizeSettings';
import { useAuth } from '../contexts/AuthContext';
import {
  PlusCircle,
  FolderKanban,
  User,
  LogIn,
  Crown,
  Shield,
} from 'lucide-react';

interface HeaderProps {
  projects: Project[];
  activeProject: Project;
  onSelectProject: (id: string) => void;
  onNewProject: () => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenLogin?: () => void;
  onOpenSignup?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  projects,
  activeProject,
  onSelectProject,
  onNewProject,
  activeTab,
  onSelectTab,
  onOpenLogin,
  onOpenSignup,
}) => {
  const { user, status } = useAuth();
  const stats = calculateProjectProgress(activeProject.tasks);
  const totalSettled = activeProject.sales
    .filter((s) => s.status === '입금완료')
    .reduce((acc, curr) => acc + (curr.actualDepositAmount || curr.settlementExpectedAmount), 0);

  const tabs = [
    { id: 'dashboard', label: '대시보드', icon: '📊' },
    { id: 'roadmap', label: 'A to Z 로드맵', icon: '🗺️' },
    { id: 'wizard', label: '사업화 위저드', icon: '🪄' },
    { id: 'finance', label: '매출·정산 관리', icon: '💰' },
    { id: 'organizations', label: '행정·기관 포털', icon: '🏛️' },
    { id: 'tax', label: '세무 캘린더', icon: '📅' },
    { id: 'ai', label: 'AI 창업비서', icon: '🤖' },
    { id: 'documents', label: '문서 보관함', icon: '📁' },
    { id: 'pricing', label: '요금제', icon: '💎' },
    ...(user?.role === 'admin' ? [{ id: 'admin', label: '관리자', icon: '🛡️' }] : []),
  ];

  return (
    <header role="banner" className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-18 py-2 gap-3">
          <div
            className="flex items-center space-x-3 cursor-pointer select-none min-w-0"
            onClick={() => onSelectTab('dashboard')}
            role="link"
            aria-label="BizFlow AtoZ 홈으로 이동"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onSelectTab('dashboard')}
          >
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] font-black text-xl italic tracking-tighter shrink-0">
              BZ
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2 min-w-0">
                <h1 className="text-xl sm:text-2xl font-black tracking-tighter text-blue-600 italic leading-none whitespace-nowrap">
                  BizFlow AtoZ
                </h1>
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold bg-slate-100 px-2 py-0.5 rounded-full hidden md:inline">
                  아이디어투머니
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-bold mt-1 tracking-tight hidden sm:block">
                아이디어에서 첫 매출 정산금 입금까지 원스톱 가이드
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="relative hidden sm:flex items-center">
              <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 hover:border-slate-400 transition-colors">
                <FolderKanban className="w-4 h-4 text-slate-400" />
                <select
                  id="project-select"
                  aria-label="사업 프로젝트 선택"
                  value={activeProject.id}
                  onChange={(e) => onSelectProject(e.target.value)}
                  className="bg-transparent text-xs sm:text-sm font-black text-slate-900 focus:outline-hidden cursor-pointer tracking-tight max-w-44"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <FontSizeSettings />

            {status !== 'loading' && !user && (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenLogin}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">로그인</span>
                </button>
                <button
                  onClick={onOpenSignup}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  <span className="hidden sm:inline">회원가입</span>
                  <span className="sm:hidden">가입</span>
                </button>
              </div>
            )}

            {user && (
              <button
                onClick={() => onSelectTab('account')}
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors border border-slate-200"
              >
                {user.plan === 'pro' ? (
                  <Crown className="w-4 h-4 text-yellow-500" />
                ) : user.role === 'admin' ? (
                  <Shield className="w-4 h-4 text-purple-500" />
                ) : (
                  <User className="w-4 h-4 text-slate-400" />
                )}
                <span className="text-xs font-bold text-slate-700 hidden sm:inline max-w-24 truncate">
                  {user.displayName || user.email.split('@')[0]}
                </span>
              </button>
            )}

            <button
              id="new-project-btn"
              onClick={onNewProject}
              aria-label="새 프로젝트 만들기"
              className="inline-flex items-center space-x-2 px-4 py-2 text-xs sm:text-sm font-black rounded-full bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-[2px_2px_0px_0px_rgba(37,99,235,1)] hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2"
            >
              <PlusCircle className="w-4 h-4 text-blue-400" aria-hidden="true" />
              <span className="hidden lg:inline">새 프로젝트</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-2 border-t border-slate-100 gap-3">
          <nav aria-label="주요 메뉴" className="flex space-x-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`nav-${tab.id}`}
                  onClick={() => onSelectTab(tab.id)}
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={tab.label}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-black shadow-xs ring-1 ring-blue-200'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-blue-600' : 'bg-slate-200'}`} aria-hidden="true"></span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="flex items-center space-x-3 text-xs overflow-x-auto pb-1 md:pb-0">
            <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 whitespace-nowrap">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">진행률</span>
              <span className="font-black text-blue-600 text-sm tracking-tight">{stats.percentage}%</span>
              <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden hidden sm:block">
                <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${stats.percentage}%` }}></div>
              </div>
            </div>

            <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 whitespace-nowrap">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">정산 입금</span>
              <span className="font-black text-emerald-600 text-sm tracking-tight">
                ₩{totalSettled.toLocaleString('ko-KR')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
