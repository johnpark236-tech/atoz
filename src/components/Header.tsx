import React from 'react';
import { Project } from '../types';
import { calculateProjectProgress } from '../services/ruleEngine';
import {
  Sparkles,
  PlusCircle,
  FolderKanban,
  CheckCircle2,
  Wallet,
  Compass,
} from 'lucide-react';

interface HeaderProps {
  projects: Project[];
  activeProject: Project;
  onSelectProject: (id: string) => void;
  onNewProject: () => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  projects,
  activeProject,
  onSelectProject,
  onNewProject,
  activeTab,
  onSelectTab,
}) => {
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
  ];

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top bar: Brand & Project selection */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo & Service Name */}
          <div className="flex items-center space-x-3 cursor-pointer select-none" onClick={() => onSelectTab('dashboard')}>
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] font-black text-xl italic tracking-tighter">
              BZ
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tighter text-blue-600 italic leading-none">
                  BizFlow AtoZ
                </h1>
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold bg-slate-100 px-2 py-0.5 rounded-full">
                  아이디어투머니
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-bold mt-1 tracking-tight hidden sm:block">
                아이디어에서 첫 매출 정산금 입금까지 원스톱 가이드
              </p>
            </div>
          </div>

          {/* Project Selector & Actions */}
          <div className="flex items-center space-x-3">
            {/* Project Picker */}
            <div className="relative flex items-center">
              <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 hover:border-slate-400 transition-colors">
                <FolderKanban className="w-4 h-4 text-slate-400" />
                <select
                  id="project-select"
                  aria-label="사업 프로젝트 선택"
                  value={activeProject.id}
                  onChange={(e) => onSelectProject(e.target.value)}
                  className="bg-transparent text-xs sm:text-sm font-black text-slate-900 focus:outline-hidden cursor-pointer tracking-tight"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* New Project Wizard Button */}
            <button
              id="new-project-btn"
              onClick={onNewProject}
              className="inline-flex items-center space-x-2 px-4 py-2 text-xs sm:text-sm font-black rounded-full bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-[2px_2px_0px_0px_rgba(37,99,235,1)] hover:scale-[1.02] active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4 text-blue-400" />
              <span className="hidden sm:inline">새 프로젝트</span>
            </button>
          </div>
        </div>

        {/* Global Progress Strip & Navigation Tabs */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-2 border-t border-slate-100 gap-3">
          {/* Nav Tabs */}
          <nav className="flex space-x-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`nav-${tab.id}`}
                  onClick={() => onSelectTab(tab.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-black shadow-xs ring-1 ring-blue-200'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-blue-600' : 'bg-slate-200'}`}></span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Quick status mini badges */}
          <div className="flex items-center space-x-3 text-xs">
            <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">진행률</span>
              <span className="font-black text-blue-600 text-sm tracking-tight">{stats.percentage}%</span>
              <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden hidden sm:block">
                <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${stats.percentage}%` }}></div>
              </div>
            </div>

            <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
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
