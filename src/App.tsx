import React, { useState, useEffect } from 'react';
import { Project, Task, TaskStatus, SaleRecord } from './types';
import {
  loadProjects,
  saveSingleProject,
  saveProjects,
  getActiveProjectId,
  setActiveProjectId,
} from './services/storage';
import { Header } from './components/Header';
import { TaskModal } from './components/TaskModal';
import { DashboardView } from './views/DashboardView';
import { RoadmapView } from './views/RoadmapView';
import { WizardView } from './views/WizardView';
import { FinanceView } from './views/FinanceView';
import { OrganizationsView } from './views/OrganizationsView';
import { TaxCalendarView } from './views/TaxCalendarView';
import { AiAssistantView } from './views/AiAssistantView';

export default function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setCurrentActiveProjectId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [roadmapCategoryFilter, setRoadmapCategoryFilter] = useState<string | null>(null);

  // Modal and AI state
  const [modalTask, setModalTask] = useState<Task | null>(null);
  const [aiPrefillTask, setAiPrefillTask] = useState<Task | null>(null);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Initialize projects on mount
  useEffect(() => {
    const loaded = loadProjects();
    setProjects(loaded);
    const savedActiveId = getActiveProjectId();
    const targetId =
      loaded.find((p) => p.id === savedActiveId)?.id || loaded[0]?.id || '';
    setCurrentActiveProjectId(targetId);
  }, []);

  const activeProject =
    projects.find((p) => p.id === activeProjectId) || projects[0];

  const handleSelectProject = (id: string) => {
    setCurrentActiveProjectId(id);
    setActiveProjectId(id);
  };

  const handleNewProject = () => {
    setActiveTab('wizard');
  };

  const handleCompleteWizard = (newProject: Project) => {
    const updated = [newProject, ...projects];
    setProjects(updated);
    saveProjects(updated);
    handleSelectProject(newProject.id);
    setActiveTab('dashboard');
    showToast(`"${newProject.title}" 맞춤형 로드맵이 생성되었습니다!`);
  };

  const handleUpdateTaskStatus = (
    taskId: string,
    status: TaskStatus,
    memo?: string
  ) => {
    if (!activeProject) return;

    const updatedTasks = activeProject.tasks.map((t) => {
      if (t.task_id === taskId) {
        return {
          ...t,
          status,
          memo: memo !== undefined ? memo : t.memo,
          completed_date:
            status === '완료' ? new Date().toISOString().split('T')[0] : t.completed_date,
        };
      }
      return t;
    });

    const updatedProject = {
      ...activeProject,
      tasks: updatedTasks,
    };

    saveSingleProject(updatedProject);
    setProjects((prev) =>
      prev.map((p) => (p.id === updatedProject.id ? updatedProject : p))
    );

    // Also update current modal if open
    if (modalTask && modalTask.task_id === taskId) {
      setModalTask({
        ...modalTask,
        status,
        memo: memo !== undefined ? memo : modalTask.memo,
      });
    }

    showToast(`[${taskId}] 상태가 "${status}"(으)로 업데이트되었습니다.`);
  };

  const handleAddSale = (sale: SaleRecord) => {
    if (!activeProject) return;
    const updatedSales = [sale, ...activeProject.sales];
    const updatedProject = {
      ...activeProject,
      sales: updatedSales,
    };
    saveSingleProject(updatedProject);
    setProjects((prev) =>
      prev.map((p) => (p.id === updatedProject.id ? updatedProject : p))
    );
    showToast('새로운 주문/정산 내역이 등록되었습니다.');
  };

  const handleUpdateSaleStatus = (
    saleId: string,
    status: SaleRecord['status']
  ) => {
    if (!activeProject) return;
    const updatedSales = activeProject.sales.map((s) => {
      if (s.id === saleId) {
        return {
          ...s,
          status,
          depositDate:
            status === '입금완료'
              ? new Date().toISOString().split('T')[0]
              : s.depositDate,
          actualDepositAmount:
            status === '입금완료'
              ? s.actualDepositAmount || s.settlementExpectedAmount
              : s.actualDepositAmount,
        };
      }
      return s;
    });

    const updatedProject = {
      ...activeProject,
      sales: updatedSales,
    };
    saveSingleProject(updatedProject);
    setProjects((prev) =>
      prev.map((p) => (p.id === updatedProject.id ? updatedProject : p))
    );
    showToast(`정산 상태가 "${status}"(으)로 갱신되었습니다.`);
  };

  const handleConsultAi = (task: Task) => {
    setAiPrefillTask(task);
    setActiveTab('ai');
  };

  if (!activeProject) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-3 border-stone-900 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-stone-600">
            BizFlow AtoZ를 불러오는 중입니다...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden bg-[#F8FAFC] text-[#0F172A] font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* Global Header */}
      <Header
        projects={projects}
        activeProject={activeProject}
        onSelectProject={handleSelectProject}
        onNewProject={handleNewProject}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setRoadmapCategoryFilter(null);
        }}
      />

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            project={activeProject}
            onOpenTaskModal={(task) => setModalTask(task)}
            onNavigateTab={(tab, catKey) => {
              setActiveTab(tab);
              if (catKey) setRoadmapCategoryFilter(catKey);
            }}
            onQuickUpdateTaskStatus={(taskId, status) =>
              handleUpdateTaskStatus(taskId, status)
            }
          />
        )}

        {activeTab === 'roadmap' && (
          <RoadmapView
            tasks={activeProject.tasks}
            initialCategory={roadmapCategoryFilter}
            onOpenTaskModal={(task) => setModalTask(task)}
            onQuickUpdateStatus={(taskId, status) =>
              handleUpdateTaskStatus(taskId, status)
            }
          />
        )}

        {activeTab === 'wizard' && (
          <WizardView
            onComplete={handleCompleteWizard}
            onCancel={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'finance' && (
          <FinanceView
            project={activeProject}
            onAddSale={handleAddSale}
            onUpdateSaleStatus={handleUpdateSaleStatus}
          />
        )}

        {activeTab === 'organizations' && <OrganizationsView />}

        {activeTab === 'tax' && <TaxCalendarView />}

        {activeTab === 'ai' && (
          <AiAssistantView
            project={activeProject}
            prefillTask={aiPrefillTask}
            onClearPrefillTask={() => setAiPrefillTask(null)}
          />
        )}
      </main>

      {/* Task Modal Popup */}
      <TaskModal
        task={modalTask}
        onClose={() => setModalTask(null)}
        onUpdateStatus={handleUpdateTaskStatus}
        onConsultAi={handleConsultAi}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0F172A] text-white text-xs font-bold px-5 py-3.5 rounded-full shadow-[4px_4px_0px_0px_rgba(37,99,235,1)] border-2 border-[#0F172A] animate-in fade-in slide-in-from-bottom-2 flex items-center space-x-2.5">
          <span className="w-4 h-4 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] font-black">✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-blue-600 tracking-tighter text-sm italic">BizFlow AtoZ</span>
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">아이디어투머니</span>
            </div>
            <p className="mt-1 text-slate-500 font-medium">
              대한민국 1인 사업자·창작자·예비창업자를 위한 원스톱 사업화 파이프라인
            </p>
          </div>
          <div className="text-slate-400 text-right sm:max-w-md font-medium">
            본 서비스는 창업 실무 절차 가이드 및 시뮬레이터이며, 행정처분 및 세무 신고의 최종 법적 책임은 신청인 본인에게 있습니다.
          </div>
        </div>
      </footer>
    </div>
  );
}
