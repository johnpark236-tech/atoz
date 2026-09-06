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
import { GuidedTutorial } from './components/GuidedTutorial';
import { TaskModal } from './components/TaskModal';
import { DashboardView } from './views/DashboardView';
import { RoadmapView } from './views/RoadmapView';
import { WizardView } from './views/WizardView';
import { MarketResearchView } from './views/MarketResearchView';
import { UserGuideView } from './views/UserGuideView';
import { FinanceView } from './views/FinanceView';
import { OrganizationsView } from './views/OrganizationsView';
import { TaxCalendarView } from './views/TaxCalendarView';
import { AiAssistantView } from './views/AiAssistantView';
import { AccountView } from './views/AccountView';
import { PricingView } from './views/PricingView';
import { DocumentVaultView } from './views/DocumentVaultView';
import { AdminView } from './views/AdminView';
import { LegalView } from './views/LegalView';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginModal } from './components/auth/LoginModal';
import { SignupModal } from './components/auth/SignupModal';
import { ForgotPasswordModal } from './components/auth/ForgotPasswordModal';
import { DataMigrationModal } from './components/auth/DataMigrationModal';
import { hasGuestData, isMigrationDone } from './services/migrationService';

type AuthModal = 'login' | 'signup' | 'forgotPassword' | 'migration' | null;

function AppInner() {
  const { user, status } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setCurrentActiveProjectId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [roadmapCategoryFilter, setRoadmapCategoryFilter] = useState<string | null>(null);
  const [tutorialOpen, setTutorialOpen] = useState(false);

  const [modalTask, setModalTask] = useState<Task | null>(null);
  const [aiPrefillTask, setAiPrefillTask] = useState<Task | null>(null);
  const [authModal, setAuthModal] = useState<AuthModal>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    const loaded = loadProjects();
    setProjects(loaded);
    const savedActiveId = getActiveProjectId();
    const targetId = loaded.find((p) => p.id === savedActiveId)?.id || loaded[0]?.id || '';
    setCurrentActiveProjectId(targetId);
  }, []);

  useEffect(() => {
    if (user && status === 'authenticated') {
      const guestData = hasGuestData();
      const alreadyDone = isMigrationDone(user.id);
      if (guestData && !alreadyDone) {
        setAuthModal('migration');
      }
    }
  }, [user, status]);

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];

  const handleSelectProject = (id: string) => {
    setCurrentActiveProjectId(id);
    setActiveProjectId(id);
  };

  const handleSelectTab = (tab: string, catKey?: string) => {
    setActiveTab(tab);
    if (catKey) setRoadmapCategoryFilter(catKey);
    else setRoadmapCategoryFilter(null);
  };

  const handleNewProject = () => setActiveTab('wizard');

  const handleCompleteWizard = (newProject: Project) => {
    const updated = [newProject, ...projects];
    setProjects(updated);
    saveProjects(updated);
    handleSelectProject(newProject.id);
    setActiveTab('dashboard');
    showToast(`"${newProject.title}" 맞춤형 로드맵이 생성되었습니다!`);
  };

  const handleUpdateTaskStatus = (taskId: string, status: TaskStatus, memo?: string) => {
    if (!activeProject) return;
    const updatedTasks = activeProject.tasks.map((t) =>
      t.task_id === taskId
        ? {
            ...t,
            status,
            memo: memo !== undefined ? memo : t.memo,
            completed_date: status === '완료' ? new Date().toISOString().split('T')[0] : t.completed_date,
          }
        : t
    );
    const updatedProject = { ...activeProject, tasks: updatedTasks };
    saveSingleProject(updatedProject);
    setProjects((prev) => prev.map((p) => (p.id === updatedProject.id ? updatedProject : p)));
    if (modalTask && modalTask.task_id === taskId) {
      setModalTask({ ...modalTask, status, memo: memo !== undefined ? memo : modalTask.memo });
    }
    showToast(`[${taskId}] 상태가 "${status}"(으)로 업데이트되었습니다.`);
  };

  const handleAddSale = (sale: SaleRecord) => {
    if (!activeProject) return;
    const updatedProject = { ...activeProject, sales: [sale, ...activeProject.sales] };
    saveSingleProject(updatedProject);
    setProjects((prev) => prev.map((p) => (p.id === updatedProject.id ? updatedProject : p)));
    showToast('새로운 주문/정산 내역이 등록되었습니다.');
  };

  const handleUpdateSaleStatus = (saleId: string, status: SaleRecord['status']) => {
    if (!activeProject) return;
    const updatedSales = activeProject.sales.map((s) => {
      if (s.id !== saleId) return s;
      return {
        ...s,
        status,
        depositDate: status === '입금완료' ? new Date().toISOString().split('T')[0] : s.depositDate,
        actualDepositAmount:
          status === '입금완료'
            ? s.actualDepositAmount || s.settlementExpectedAmount
            : s.actualDepositAmount,
      };
    });
    const updatedProject = { ...activeProject, sales: updatedSales };
    saveSingleProject(updatedProject);
    setProjects((prev) => prev.map((p) => (p.id === updatedProject.id ? updatedProject : p)));
    showToast(`정산 상태가 "${status}"(으)로 갱신되었습니다.`);
  };

  const handleConsultAi = (task: Task) => {
    setAiPrefillTask(task);
    setActiveTab('ai');
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-3 border-stone-900 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-stone-600">BizFlow AtoZ를 불러오는 중입니다...</p>
        </div>
      </div>
    );
  }

  if (!activeProject) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-3 border-stone-900 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-stone-600">프로젝트를 불러오는 중입니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden bg-[#F8FAFC] text-[#0F172A] font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* Auth Modals */}
      {authModal === 'login' && (
        <LoginModal
          onClose={() => setAuthModal(null)}
          onGoSignup={() => setAuthModal('signup')}
          onGoForgotPassword={() => setAuthModal('forgotPassword')}
        />
      )}
      {authModal === 'signup' && (
        <SignupModal
          onClose={() => setAuthModal(null)}
          onGoLogin={() => setAuthModal('login')}
          onGoMigration={() => setAuthModal('migration')}
        />
      )}
      {authModal === 'forgotPassword' && (
        <ForgotPasswordModal
          onClose={() => setAuthModal(null)}
          onGoLogin={() => setAuthModal('login')}
        />
      )}
      {authModal === 'migration' && (
        <DataMigrationModal
          onComplete={() => {
            setAuthModal(null);
            showToast('기존 데이터를 계정으로 이전했습니다.');
          }}
          onSkip={() => setAuthModal(null)}
        />
      )}

      <Header
        projects={projects}
        activeProject={activeProject}
        onSelectProject={handleSelectProject}
        onNewProject={handleNewProject}
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onStartTutorial={() => setTutorialOpen(true)}
        onOpenLogin={() => setAuthModal('login')}
        onOpenSignup={() => setAuthModal('signup')}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            project={activeProject}
            onOpenTaskModal={(task) => setModalTask(task)}
            onNavigateTab={(tab, catKey) => {
              setActiveTab(tab);
              if (catKey) setRoadmapCategoryFilter(catKey);
            }}
            onQuickUpdateTaskStatus={(taskId, status) => handleUpdateTaskStatus(taskId, status)}
          />
        )}

        {activeTab === 'roadmap' && (
          <RoadmapView
            tasks={activeProject.tasks}
            initialCategory={roadmapCategoryFilter}
            onOpenTaskModal={(task) => setModalTask(task)}
            onQuickUpdateStatus={(taskId, status) => handleUpdateTaskStatus(taskId, status)}
          />
        )}

        {activeTab === 'wizard' && (
          <WizardView onComplete={handleCompleteWizard} onCancel={() => setActiveTab('dashboard')} />
        )}

        {activeTab === 'market' && <MarketResearchView project={activeProject} />}

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

        {activeTab === 'guide' && (
          <UserGuideView
            onStartTutorial={() => setTutorialOpen(true)}
            onNavigate={handleSelectTab}
          />
        )}

        {activeTab === 'account' && <AccountView onSelectTab={handleSelectTab} />}
        {activeTab === 'pricing' && <PricingView onSelectTab={handleSelectTab} />}

        {activeTab === 'documents' && (
          <DocumentVaultView
            projectId={activeProject.id}
            onUpgrade={() => setActiveTab('pricing')}
          />
        )}

        {activeTab === 'admin' && <AdminView />}
        {activeTab === 'terms' && <LegalView type="terms" />}
        {activeTab === 'privacy' && <LegalView type="privacy" />}
      </main>

      <TaskModal
        task={modalTask}
        onClose={() => setModalTask(null)}
        onUpdateStatus={handleUpdateTaskStatus}
        onConsultAi={handleConsultAi}
      />

      <GuidedTutorial open={tutorialOpen} onClose={() => setTutorialOpen(false)} />

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0F172A] text-white text-xs font-bold px-5 py-3.5 rounded-full shadow-[4px_4px_0px_0px_rgba(37,99,235,1)] border-2 border-[#0F172A] animate-in fade-in slide-in-from-bottom-2 flex items-center space-x-2.5">
          <span className="w-4 h-4 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] font-black">✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      <footer className="bg-white border-t border-slate-200 py-8 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-blue-600 tracking-tighter text-sm italic">BizFlow AtoZ</span>
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">아이디어투머니</span>
            </div>
            <p className="mt-1 text-slate-500 font-medium">대한민국 1인 사업자·창작자·예비창업자를 위한 원스톱 사업화 파이프라인</p>
            <div className="flex items-center gap-4 mt-2">
              <button onClick={() => setActiveTab('pricing')} className="text-slate-400 hover:text-blue-600 transition-colors font-medium">요금제</button>
              <span className="text-slate-200">|</span>
              <button onClick={() => setActiveTab('terms')} className="text-slate-400 hover:text-slate-600 transition-colors font-medium">이용약관</button>
              <span className="text-slate-200">|</span>
              <button onClick={() => setActiveTab('privacy')} className="text-slate-400 hover:text-slate-600 transition-colors font-medium">개인정보처리방침</button>
            </div>
          </div>
          <div className="text-slate-400 text-right sm:max-w-md font-medium">
            {/* 운영 전 법률 검토 필요: 이용약관·개인정보처리방침 임시 문안 */}
            본 서비스는 창업 실무 절차 가이드 및 시뮬레이터이며, 행정처분 및 세무 신고의 최종 법적 책임은 신청인 본인에게 있습니다.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
