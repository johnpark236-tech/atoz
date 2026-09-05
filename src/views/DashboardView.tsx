import React, { useState } from 'react';
import { Project, Task, TaskStatus } from '../types';
import { calculateProjectProgress, getTodaysTasks } from '../services/ruleEngine';
import { AtoZProgressBar } from '../components/AtoZProgressBar';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  FileCheck,
  Building,
  ChevronRight,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  ArrowUpRight,
  Coins,
  Package,
  ClipboardCheck,
} from 'lucide-react';
import { BusinessChecklistTree } from '../components/BusinessChecklistTree';

interface DashboardViewProps {
  project: Project;
  onOpenTaskModal: (task: Task) => void;
  onNavigateTab: (tab: string, filterCategory?: string) => void;
  onQuickUpdateTaskStatus: (taskId: string, status: TaskStatus) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  project,
  onOpenTaskModal,
  onNavigateTab,
  onQuickUpdateTaskStatus,
}) => {
  const [showChecklist, setShowChecklist] = useState(false);
  const stats = calculateProjectProgress(project.tasks);
  const todaysTasks = getTodaysTasks(project.tasks);
  const featuredTask = todaysTasks[0];
  const secondaryTasks = todaysTasks.slice(1);

  // Financial summary
  const totalRevenue = project.sales.reduce((acc, s) => acc + s.totalRevenue, 0);
  const totalSettlementPending = project.sales
    .filter((s) => s.status !== '입금완료')
    .reduce((acc, s) => acc + s.settlementExpectedAmount, 0);
  const totalSettled = project.sales
    .filter((s) => s.status === '입금완료')
    .reduce((acc, s) => acc + (s.actualDepositAmount || s.settlementExpectedAmount), 0);
  const totalProfit = project.sales.reduce((acc, s) => acc + s.netProfit, 0);

  return (
    <div className="space-y-6">
      {/* Welcome / Project Hero Header */}
      <div className="bg-white rounded-[32px] border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-200/80 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-blue-700">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>AtoZ Business Pipeline</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 leading-tight">
              {project.title}
              <span className="text-slate-300 ml-3 font-light text-xl sm:text-2xl">#1042</span>
            </h1>
            <p className="text-slate-500 text-sm leading-relaxed font-medium">
              {project.description}
            </p>

            {/* Profile tag chips */}
            <div className="flex flex-wrap gap-2 pt-1">
              {project.profile.businessTypes.map((bt) => (
                <span
                  key={bt}
                  className="bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs px-3 py-1 rounded-full"
                >
                  {bt}
                </span>
              ))}
              {project.profile.salesChannels.map((sc) => (
                <span
                  key={sc}
                  className="bg-blue-50 border border-blue-200 text-blue-700 font-bold text-xs px-3 py-1 rounded-full"
                >
                  {sc}
                </span>
              ))}
              <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-xs px-3 py-1 rounded-full">
                {project.profile.targetCustomers.join(', ')}
              </span>
            </div>
          </div>

          {/* Overall Progress Gauge Card */}
          <div className="bg-slate-900 text-white p-6 rounded-[28px] shadow-[4px_4px_0px_0px_rgba(37,99,235,1)] flex flex-col items-center justify-center min-w-[260px] text-center border-2 border-slate-900">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
              전체 사업화 달성률
            </span>
            <div className="flex items-baseline space-x-1.5 my-1">
              <span className="text-5xl font-black text-white tracking-tight">
                {stats.percentage}%
              </span>
              <span className="text-xs text-slate-400 font-bold">
                ({stats.completed}/{stats.activeTasksCount})
              </span>
            </div>

            {/* Micro bar */}
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden my-3">
              <div
                className="bg-blue-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${stats.percentage}%` }}
              />
            </div>

            <div className="flex justify-between w-full text-xs font-bold text-slate-400 px-1">
              <span className="text-blue-300">진행중 {stats.inProgress}개</span>
              <span className="text-slate-400">미착수 {stats.notStarted}개</span>
            </div>
          </div>
        </div>
      </div>

      {/* Central 9-Step AtoZ Pipeline Bar */}
      <AtoZProgressBar
        tasks={project.tasks}
        onSelectStage={(catKey) => onNavigateTab('roadmap', catKey)}
      />

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setShowChecklist((value) => !value)}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs sm:text-sm font-black transition-all border ${
            showChecklist
              ? 'bg-blue-600 text-white border-blue-700 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]'
              : 'bg-white text-slate-800 border-slate-200 hover:border-slate-900'
          }`}
          aria-expanded={showChecklist}
        >
          <ClipboardCheck className="w-4 h-4" />
          <span>사업화 체크리스트</span>
        </button>
      </div>

      {showChecklist && <BusinessChecklistTree projectId={project.id} />}

      {/* Grid: Featured Today's Action Item + Financial Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Center/Left: Roadmap & Today's Action Section (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="flex items-baseline justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tighter text-slate-900 uppercase">
                ROADMAP ACTIONS
              </h2>
              <p className="text-xs font-bold text-slate-400 tracking-wide mt-0.5">
                오늘 실행할 우선순위 태스크
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('roadmap')}
              className="text-xs sm:text-sm font-black text-blue-600 hover:text-blue-800 flex items-center space-x-1 transition-colors"
            >
              <span>전체보기 ({project.tasks.length}개) →</span>
            </button>
          </div>

          {/* Featured Hero Action Item Card */}
          {featuredTask ? (
            <div className="bg-white rounded-[36px] border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden group">
              <div className="relative z-10 space-y-4">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                    Today&apos;s Action Item
                  </span>
                  <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    {featuredTask.task_id}
                  </span>
                  {featuredTask.mandatory && (
                    <span className="text-[10px] font-black text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md">
                      법정필수
                    </span>
                  )}
                </div>

                <div>
                  <h3
                    onClick={() => onOpenTaskModal(featuredTask)}
                    className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 leading-tight hover:text-blue-600 cursor-pointer transition-colors"
                  >
                    {featuredTask.task_name}
                  </h3>
                  <p className="text-slate-500 text-sm font-medium mt-2 max-w-xl leading-relaxed">
                    {featuredTask.description}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-600 pt-1">
                  <span className="flex items-center space-x-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    <span>{featuredTask.organization}</span>
                  </span>
                  <span className="flex items-center space-x-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                    <Coins className="w-3.5 h-3.5 text-slate-400" />
                    <span>예상비용: {featuredTask.estimated_cost}</span>
                  </span>
                  <span className="flex items-center space-x-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>소요기간: {featuredTask.estimated_days}</span>
                  </span>
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => onOpenTaskModal(featuredTask)}
                    className="bg-slate-900 text-white px-7 py-3 rounded-full font-black text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[2px_2px_0px_0px_rgba(37,99,235,1)]"
                  >
                    업무 시작 및 서류 확인
                  </button>
                  <button
                    onClick={() =>
                      onQuickUpdateTaskStatus(
                        featuredTask.task_id,
                        featuredTask.status === '완료' ? '준비중' : '완료'
                      )
                    }
                    className={`px-5 py-3 rounded-full font-bold text-sm transition-all border ${
                      featuredTask.status === '완료'
                        ? 'bg-emerald-500 text-white border-emerald-600'
                        : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {featuredTask.status === '완료' ? '✓ 완료 처리됨' : '완료 체크하기'}
                  </button>
                </div>
              </div>

              {/* Large Stylistic Ghost Typography Number in Background */}
              <div className="absolute right-[-15px] bottom-[-30px] text-[180px] font-black text-slate-900/[0.04] select-none italic pointer-events-none leading-none">
                01
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[32px] border border-slate-200 p-8 text-center text-slate-400 font-bold">
              모든 우선순위 태스크가 완료되었습니다! 로드맵에서 다음 단계를 탐색하세요.
            </div>
          )}

          {/* Secondary Tasks Grid */}
          {secondaryTasks.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {secondaryTasks.map((task, idx) => (
                <div
                  key={task.task_id}
                  className="bg-white p-5 rounded-[28px] border border-slate-200 hover:border-slate-400 transition-all flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black text-blue-600 uppercase">
                        Phase 0{idx + 2}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                        {task.task_id}
                      </span>
                    </div>
                    <h4
                      onClick={() => onOpenTaskModal(task)}
                      className="text-base font-black text-slate-900 hover:text-blue-600 cursor-pointer tracking-tight"
                    >
                      {task.task_name}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium mt-1 line-clamp-2">
                      {task.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400">{task.organization}</span>
                    <button
                      onClick={() => onOpenTaskModal(task)}
                      className="text-xs font-black text-blue-600 hover:underline"
                    >
                      가이드 →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick status summary counter blocks */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center space-x-3 shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-sm">
                ✓
              </div>
              <div>
                <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">완료 절차</div>
                <div className="text-xl font-black text-slate-900 tracking-tight">{stats.completed}개</div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center space-x-3 shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-sm">
                ⏳
              </div>
              <div>
                <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">진행/심사중</div>
                <div className="text-xl font-black text-slate-900 tracking-tight">{stats.inProgress}개</div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center space-x-3 shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center font-black text-sm">
                📋
              </div>
              <div>
                <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">미착수 절차</div>
                <div className="text-xl font-black text-slate-900 tracking-tight">{stats.notStarted}개</div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center space-x-3 shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-black text-sm">
                ⚠️
              </div>
              <div>
                <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">보완/주의</div>
                <div className="text-xl font-black text-slate-900 tracking-tight">{stats.needsRevision}개</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Financials & AI Quick Card (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Finance Mini Card matching Bold Typography theme */}
          <div className="bg-emerald-500 p-6 rounded-[32px] text-white shadow-xl relative overflow-hidden">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-[10px] font-black opacity-80 uppercase tracking-widest">내 통장 실입금액</p>
                <p className="text-xs font-bold opacity-90">정산 완료 수령액</p>
              </div>
              <span className="bg-white/20 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                정산완료
              </span>
            </div>
            <p className="text-4xl sm:text-5xl font-black mb-1 tracking-tight">
              ₩{totalSettled.toLocaleString('ko-KR')}
            </p>
            <div className="h-1.5 w-full bg-white/20 rounded-full mt-4 overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-500"
                style={{
                  width: totalRevenue > 0 ? `${Math.min(100, (totalSettled / totalRevenue) * 100)}%` : '0%',
                }}
              ></div>
            </div>
            <div className="flex justify-between items-center text-[10px] font-black mt-2.5 opacity-90 uppercase">
              <span>정산 대기 ₩{totalSettlementPending.toLocaleString('ko-KR')}</span>
              <span>순이익 ₩{totalProfit.toLocaleString('ko-KR')}</span>
            </div>
          </div>

          {/* Quick Tasks & Waiting List Card */}
          <div className="bg-white p-6 rounded-[32px] border border-slate-200 flex-1 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black tracking-tight text-slate-900">
                  최근 주문 정산 상태
                </h3>
                <button
                  onClick={() => onNavigateTab('finance')}
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  전체장부 →
                </button>
              </div>

              <div className="space-y-2.5">
                {project.sales.slice(0, 3).map((sale) => (
                  <div
                    key={sale.id}
                    className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between border border-transparent hover:border-slate-200 transition-all"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900 truncate max-w-[150px]">
                        {sale.productName}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                        {sale.channel} • {sale.orderDate}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-slate-900">
                        ₩{sale.settlementExpectedAmount.toLocaleString('ko-KR')}
                      </p>
                      <span
                        className={`inline-block text-[9px] font-black px-1.5 py-0.5 rounded-md mt-0.5 ${
                          sale.status === '입금완료'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {sale.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Assistant Quick Bar */}
            <div className="mt-5 pt-4 border-t border-slate-100">
              <div
                onClick={() => onNavigateTab('ai')}
                className="flex items-center gap-2 bg-slate-100 p-2 rounded-2xl cursor-pointer hover:bg-slate-200/70 transition-colors"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-xs">
                  AI
                </div>
                <div className="text-xs flex-1 font-bold text-slate-500 px-2">
                  KC인증·상표·세무 AI 비서에게 질문...
                </div>
                <span className="text-slate-400 text-sm mr-2 font-bold">→</span>
              </div>
            </div>
          </div>

          {/* Quick government portals box */}
          <div className="bg-white rounded-[28px] border border-slate-200 p-5 space-y-3 shadow-xs">
            <span className="text-xs font-black text-slate-900 uppercase tracking-wide block">
              공식 행정 기관 바로가기
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              <a
                href="http://www.kipris.or.kr"
                target="_blank"
                rel="noreferrer"
                className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-400 flex items-center justify-between text-slate-700 transition-colors"
              >
                <span>KIPRIS 상표</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
              <a
                href="https://www.hometax.go.kr"
                target="_blank"
                rel="noreferrer"
                className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-400 flex items-center justify-between text-slate-700 transition-colors"
              >
                <span>국세청 홈택스</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
              <a
                href="https://www.safetykorea.kr"
                target="_blank"
                rel="noreferrer"
                className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-400 flex items-center justify-between text-slate-700 transition-colors"
              >
                <span>Safety Korea</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
              <a
                href="https://www.gov.kr"
                target="_blank"
                rel="noreferrer"
                className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-400 flex items-center justify-between text-slate-700 transition-colors"
              >
                <span>정부24 통판</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
