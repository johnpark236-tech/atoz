import { Project, SaleRecord, Task, TaskStatus } from '../types';
import { generateTasksForProfile } from './ruleEngine';
import {
  CloudAppState,
  CloudSyncStatus,
  fetchCloudAppState,
  isCloudConfigured,
  saveCloudAppState,
} from './cloudStorage';

const STORAGE_KEY = 'bizflow_atoz_projects_v1';
const ACTIVE_PROJECT_KEY = 'bizflow_atoz_active_id_v1';
const CHECKLIST_STORAGE_PREFIX = 'bizflow_atoz_checklist_tree_v1';
const APP_VERSION = '1.0.0';

export type ChecklistCompletionMap = Record<string, boolean>;

type CloudStatusListener = (status: CloudSyncStatus, message?: string) => void;
const statusListeners: Set<CloudStatusListener> = new Set();
let currentCloudStatus: CloudSyncStatus = isCloudConfigured() ? 'idle' : 'local_only';
let currentCloudMessage: string = isCloudConfigured() ? '클라우드 연동 준비됨' : '로컬 모드 (미연동)';

export function getCloudStatus(): CloudSyncStatus {
  return currentCloudStatus;
}

export function getCloudStatusMessage(): string {
  return currentCloudMessage;
}

export function subscribeCloudStatus(listener: CloudStatusListener): () => void {
  statusListeners.add(listener);
  listener(currentCloudStatus, currentCloudMessage);
  return () => {
    statusListeners.delete(listener);
  };
}

function updateCloudStatus(status: CloudSyncStatus, message?: string): void {
  currentCloudStatus = status;
  currentCloudMessage = message || '';
  statusListeners.forEach((l) => l(status, message));
}

/**
 * Creates the initial demo project specified in Prompt Requirement:
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

  const allTasks = generateTasksForProfile(profile);

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
 * Loads all projects synchronously from local storage cache
 */
export function loadProjects(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const demo = createDemoProject();
      saveProjectsLocally([demo]);
      setActiveProjectId(demo.id);
      return [demo];
    }
    const projects = JSON.parse(raw);
    if (!Array.isArray(projects) || projects.length === 0) {
      const demo = createDemoProject();
      saveProjectsLocally([demo]);
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

function saveProjectsLocally(projects: Project[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (e) {
    console.error('Failed to save projects locally:', e);
  }
}

export function getActiveProjectId(): string {
  return localStorage.getItem(ACTIVE_PROJECT_KEY) || 'proj-demo-hangul-dice';
}

export function setActiveProjectId(id: string): void {
  localStorage.setItem(ACTIVE_PROJECT_KEY, id);
  triggerAutoCloudSync();
}

function getChecklistStorageKey(projectId: string): string {
  return `${CHECKLIST_STORAGE_PREFIX}:${projectId}`;
}

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
    triggerAutoCloudSync();
  } catch (e) {
    console.error('Failed to save checklist state:', e);
  }
}

export function getAllLocalChecklists(): Record<string, ChecklistCompletionMap> {
  const result: Record<string, ChecklistCompletionMap> = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`${CHECKLIST_STORAGE_PREFIX}:`)) {
        const projectId = key.substring(CHECKLIST_STORAGE_PREFIX.length + 1);
        result[projectId] = loadChecklistCompletions(projectId);
      }
    }
  } catch (e) {
    console.error('Failed to get all local checklists:', e);
  }
  return result;
}

export function saveAllChecklistsLocally(checklists: Record<string, ChecklistCompletionMap>): void {
  try {
    Object.entries(checklists).forEach(([projectId, map]) => {
      localStorage.setItem(getChecklistStorageKey(projectId), JSON.stringify(map));
    });
  } catch (e) {
    console.error('Failed to save all checklists locally:', e);
  }
}

export function saveProjects(projects: Project[]): void {
  saveProjectsLocally(projects);
  triggerAutoCloudSync();
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

// ----------------------------------------------------------------------------
// Cloud Persistence Engine (Source of Truth with Local Cache/Fallback)
// ----------------------------------------------------------------------------

let syncDebounceTimer: ReturnType<typeof setTimeout> | null = null;

export function triggerAutoCloudSync(immediate = false): void {
  if (!isCloudConfigured()) {
    updateCloudStatus('local_only', '로컬 모드 (Google Sheets 미설정)');
    return;
  }

  if (syncDebounceTimer) {
    clearTimeout(syncDebounceTimer);
    syncDebounceTimer = null;
  }

  if (immediate) {
    performCloudSync();
  } else {
    updateCloudStatus('saving', '☁ 클라우드 저장 대기 중...');
    syncDebounceTimer = setTimeout(() => {
      performCloudSync();
    }, 400);
  }
}

/**
 * Builds the complete app state snapshot from local storage
 */
export function buildCurrentAppState(): CloudAppState {
  const projects = loadProjects();
  const checklists = getAllLocalChecklists();
  const activeProjectId = getActiveProjectId();

  return {
    projects,
    checklists,
    activeProjectId,
    updatedAt: new Date().toISOString(),
    version: APP_VERSION,
  };
}

/**
 * Sends current state to Google Sheets Cloud
 */
export async function performCloudSync(): Promise<{ success: boolean; error?: string }> {
  if (!isCloudConfigured()) {
    updateCloudStatus('local_only', '로컬 모드');
    return { success: false, error: 'Google Sheets URL 미설정' };
  }

  updateCloudStatus('saving', '☁ 클라우드에 저장하는 중...');
  try {
    const state = buildCurrentAppState();
    const res = await saveCloudAppState(state);

    if (res.success) {
      updateCloudStatus('saved', '✓ 클라우드 동기화 완료');
      return { success: true };
    } else {
      updateCloudStatus('error', `⚠ 클라우드 저장 실패 (${res.error || '오류'}) - 로컬 임시저장됨`);
      return { success: false, error: res.error };
    }
  } catch (err: any) {
    const msg = err.message || '네트워크 오류';
    updateCloudStatus('error', `⚠ 클라우드 저장 실패 (${msg}) - 로컬 임시저장됨`);
    return { success: false, error: msg };
  }
}

/**
 * Loads application state on startup following Requirement 10 Priority:
 * 1. Google Sheets Cloud 조회
 * 2. Cloud data 있음 -> Cloud data 사용 & 로컬 캐시 갱신
 * 3. Cloud data 없음 (신규 시트) -> 기존 localStorage 확인 후 Cloud로 마이그레이션
 * 4. Cloud 연결 실패/오류 -> localStorage 캐시 확인
 * 5. 둘 다 없음 -> Demo Project 생성
 */
export async function initAppState(): Promise<{
  projects: Project[];
  activeProjectId: string;
  source: 'cloud' | 'local_migrated' | 'local_fallback' | 'demo';
}> {
  if (!isCloudConfigured()) {
    updateCloudStatus('local_only', '로컬 모드 (Google Sheets 미연동)');
    const localProjects = loadProjects();
    return {
      projects: localProjects,
      activeProjectId: getActiveProjectId(),
      source: 'local_fallback',
    };
  }

  updateCloudStatus('loading', '☁ 클라우드 데이터 불러오는 중...');

  try {
    const cloudRes = await fetchCloudAppState();

    if (cloudRes.success && cloudRes.state && Array.isArray(cloudRes.state.projects) && cloudRes.state.projects.length > 0) {
      // 2. Cloud data exists -> Source of Truth
      const cloudProjects = cloudRes.state.projects;
      saveProjectsLocally(cloudProjects);

      if (cloudRes.state.checklists && typeof cloudRes.state.checklists === 'object') {
        saveAllChecklistsLocally(cloudRes.state.checklists);
      }

      const activeId =
        cloudRes.state.activeProjectId ||
        cloudProjects[0]?.id ||
        'proj-demo-hangul-dice';
      localStorage.setItem(ACTIVE_PROJECT_KEY, activeId);

      updateCloudStatus('saved', '✓ 클라우드 데이터 로드 완료');
      return {
        projects: cloudProjects,
        activeProjectId: activeId,
        source: 'cloud',
      };
    }

    // 3. Cloud is connected but empty -> check local data for migration
    const localRaw = localStorage.getItem(STORAGE_KEY);
    if (localRaw) {
      try {
        const localProjects = JSON.parse(localRaw);
        if (Array.isArray(localProjects) && localProjects.length > 0) {
          updateCloudStatus('saving', '☁ 기존 로컬 데이터를 클라우드로 마이그레이션 중...');
          await performCloudSync();
          updateCloudStatus('saved', '✓ 클라우드 마이그레이션 및 동기화 완료');
          return {
            projects: localProjects,
            activeProjectId: getActiveProjectId(),
            source: 'local_migrated',
          };
        }
      } catch {
        // local json parsing error, proceed to demo
      }
    }

    // 5. Fresh setup on both -> create demo and push to cloud
    const demo = createDemoProject();
    saveProjectsLocally([demo]);
    setActiveProjectId(demo.id);
    await performCloudSync();
    updateCloudStatus('saved', '✓ 초기 데모 프로젝트 생성 및 클라우드 동기화 완료');
    return {
      projects: [demo],
      activeProjectId: demo.id,
      source: 'demo',
    };
  } catch (err: any) {
    console.warn('Failed to load from cloud; using local cache:', err);
    updateCloudStatus('error', `⚠ 클라우드 연결 실패 (${err.message || '오류'}) - 로컬 캐시 사용`);
    const localProjects = loadProjects();
    return {
      projects: localProjects,
      activeProjectId: getActiveProjectId(),
      source: 'local_fallback',
    };
  }
}
