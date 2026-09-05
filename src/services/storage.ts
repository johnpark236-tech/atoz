import { Project, SaleRecord, Task, TaskStatus } from '../types';
import { generateTasksForProfile } from './ruleEngine';

const STORAGE_KEY = 'bizflow_atoz_projects_v1';
const ACTIVE_PROJECT_KEY = 'bizflow_atoz_active_id_v1';
const CHECKLIST_STORAGE_PREFIX = 'bizflow_atoz_checklist_tree_v1';

/**
 * Creates the initial demo project specified in Prompt Requirement 25:
 * "한글 주사위 교구"
 * 실물 제품 + 교육 교구, B2C, B2B, 스마트스토어, 쿠팡, 개인사업자 예정, 18% 진행
 */
export function createDemoProject(): Project {
  const profile = {
    businessTypes: ['실물 제품', '교육 교구'],
    targetCustomers: ['일반 소비자 B2C', '학교/교육기관'],
    salesChannels: ['네이버 스마트스토어', '쿠팡'],
    stage: '시장조사 중',
    corporateStatus: '없음',
    staffing: '외주만 사용',
    hasOverseasSales: '검토 중',
  };

  // Generate tasks matching rules
  const allTasks = generateTasksForProfile(profile);

  // Set task statuses to simulate 18% progress
  const completedTaskIds = [
    'TASK-01', // 아이디어 정의
    'TASK-02', // 문제 정의
    'TASK-03', // 타깃 고객 정의
    'TASK-04', // 시장 규모 조사
    'TASK-05', // 경쟁사 조사
    'TASK-06', // 유사 제품 조사
    'TASK-07', // 가격 조사
    'TASK-08', // 수익모델 결정
    'TASK-09', // 원가 구조 계산
    'TASK-10', // 사업성 검토
    'TASK-11', // 브랜드명 후보 도출
    'TASK-12', // 도메인 검색 및 확보
    'TASK-13', // SNS 계정 선점
    'TASK-EDU-01', // 사용연령 구분 및 어린이제품 해당 여부 판정
  ];

  const inProgressTaskIds: Record<string, TaskStatus> = {
    'TASK-14': '준비중', // KIPRIS 상표 검색
    'TASK-15': '준비중', // 상표 출원 필요성 판단
    'TASK-24': '준비중', // 제품 관련 법규 확인
    'TASK-25': '준비중', // 인증 필요 여부 확인
    'TASK-EDU-02': '준비중', // 어린이제품 KC 안전확인 시험 의뢰
    'TASK-28': '준비중', // 시제품 제작
    'TASK-35': '준비중', // 사업자등록 준비
  };

  const tasks: Task[] = allTasks.map((task) => {
    if (completedTaskIds.includes(task.task_id)) {
      return {
        ...task,
        status: '완료',
        completed_date: '2026-09-01',
        memo: '기획 및 시장 조사 단계 완료',
      };
    }
    if (inProgressTaskIds[task.task_id]) {
      return {
        ...task,
        status: inProgressTaskIds[task.task_id],
        memo: '현재 진행 중인 작업입니다.',
      };
    }
    return task;
  });

  const demoSales: SaleRecord[] = [
    {
      id: 'SALE-01',
      orderDate: '2026-09-02',
      channel: '네이버 스마트스토어',
      productName: '훈민정음 한글 자음모음 원목 주사위 세트',
      quantity: 2,
      unitPrice: 38000,
      totalRevenue: 76000,
      platformFee: 2888, // 3.8%
      shippingCost: 3000,
      manufacturingCost: 24000,
      adCost: 8000,
      settlementExpectedAmount: 70112,
      settlementExpectedDate: '2026-09-07',
      depositDate: '2026-09-07',
      actualDepositAmount: 70112,
      netProfit: 38112,
      status: '입금완료',
    },
    {
      id: 'SALE-02',
      orderDate: '2026-09-04',
      channel: '쿠팡',
      productName: '훈민정음 한글 자음모음 원목 주사위 세트',
      quantity: 1,
      unitPrice: 38000,
      totalRevenue: 38000,
      platformFee: 4180, // 11%
      shippingCost: 3000,
      manufacturingCost: 12000,
      adCost: 5000,
      settlementExpectedAmount: 30820,
      settlementExpectedDate: '2026-09-15',
      netProfit: 13820,
      status: '구매확정',
    },
    {
      id: 'SALE-03',
      orderDate: '2026-09-05',
      channel: '네이버 스마트스토어',
      productName: '훈민정음 한글 자음모음 원목 주사위 세트 (교사용 대용량)',
      quantity: 1,
      unitPrice: 65000,
      totalRevenue: 65000,
      platformFee: 2470,
      shippingCost: 3000,
      manufacturingCost: 21000,
      adCost: 6000,
      settlementExpectedAmount: 59530,
      settlementExpectedDate: '2026-09-12',
      netProfit: 32530,
      status: '배송중',
    },
  ];

  const demoDocuments = [
    {
      id: 'DOC-01',
      folder: '아이디어/기획',
      name: '한글_주사위_교구_제품기획서_v1.2.pdf',
      size: '2.4 MB',
      uploadedAt: '2026-08-28',
      fileType: 'PDF',
      note: '3D 렌더링 및 음소 조합 룰북 포함',
    },
    {
      id: 'DOC-02',
      folder: '상표/특허',
      name: 'KIPRIS_선행상표검색_결과보고서.pdf',
      size: '1.1 MB',
      uploadedAt: '2026-09-02',
      fileType: 'PDF',
      note: '28류 완구류 유사상표 없음 확인',
    },
    {
      id: 'DOC-03',
      folder: 'KC/시험성적서',
      name: 'KCL_친환경목재_유해물질사전검사서.pdf',
      size: '3.8 MB',
      uploadedAt: '2026-09-03',
      fileType: 'PDF',
      note: '원목 자작나무 프탈레이트/중금속 불검출',
    },
  ];

  return {
    id: 'proj-demo-hangul-dice',
    title: '한글 주사위 교구',
    description: '아이들이 놀면서 자음과 모음을 조립하여 단어를 완성하는 친환경 원목 놀이 교구',
    createdAt: '2026-08-25T10:00:00.000Z',
    updatedAt: '2026-09-05T09:30:00.000Z',
    profile,
    tasks,
    sales: demoSales,
    documents: demoDocuments,
  };
}

/**
 * Loads all projects from storage, seeding demo if empty
 */
export function loadProjects(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const demo = createDemoProject();
      saveProjects([demo]);
      setActiveProjectId(demo.id);
      return [demo];
    }
    const projects = JSON.parse(raw);
    if (!Array.isArray(projects) || projects.length === 0) {
      const demo = createDemoProject();
      saveProjects([demo]);
      setActiveProjectId(demo.id);
      return [demo];
    }
    return projects;
  } catch (e) {
    console.error('Failed to load projects from storage:', e);
    const demo = createDemoProject();
    return [demo];
  }
}

export function saveProjects(projects: Project[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (e) {
    console.error('Failed to save projects:', e);
  }
}

export function getActiveProjectId(): string {
  return localStorage.getItem(ACTIVE_PROJECT_KEY) || 'proj-demo-hangul-dice';
}

export function setActiveProjectId(id: string): void {
  localStorage.setItem(ACTIVE_PROJECT_KEY, id);
}

export function saveSingleProject(updatedProject: Project): void {
  const projects = loadProjects();
  const index = projects.findIndex((p) => p.id === updatedProject.id);
  if (index >= 0) {
    projects[index] = {
      ...updatedProject,
      updatedAt: new Date().toISOString(),
    };
  } else {
    projects.push(updatedProject);
  }
  saveProjects(projects);
}

function getChecklistStorageKey(projectId: string): string {
  return `${CHECKLIST_STORAGE_PREFIX}:${projectId}`;
}

export type ChecklistCompletionMap = Record<string, boolean>;

export function loadChecklistCompletions(projectId: string): ChecklistCompletionMap {
  try {
    const raw = localStorage.getItem(getChecklistStorageKey(projectId));
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return parsed as ChecklistCompletionMap;
  } catch (e) {
    console.error('Failed to load checklist state:', e);
    return {};
  }
}

export function saveChecklistCompletions(
  projectId: string,
  completions: ChecklistCompletionMap
): void {
  try {
    localStorage.setItem(getChecklistStorageKey(projectId), JSON.stringify(completions));
  } catch (e) {
    console.error('Failed to save checklist state:', e);
  }
}
