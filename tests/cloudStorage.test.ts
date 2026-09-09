/**
 * Comprehensive Integration & Verification Test Suite for BizFlow AtoZ Cloud Save
 */

import {
  createDemoProject,
  loadProjects,
  saveProjects,
  saveSingleProject,
  loadChecklistCompletions,
  saveChecklistCompletions,
  getAllLocalChecklists,
  saveAllChecklistsLocally,
  getActiveProjectId,
  setActiveProjectId,
  initAppState,
  buildCurrentAppState,
  performCloudSync,
} from '../src/services/storage';

import {
  setCloudEndpointOverride,
  getCloudEndpoint,
  isCloudConfigured,
  fetchCloudAppState,
  saveCloudAppState,
  checkCloudHealth,
  CloudAppState,
} from '../src/services/cloudStorage';

import { Project, Task } from '../src/types';

// Mock localStorage in Node.js environment
class LocalStorageMock {
  private store: Record<string, string> = {};

  get length(): number {
    return Object.keys(this.store).length;
  }

  getItem(key: string): string | null {
    return this.store[key] !== undefined ? this.store[key] : null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  clear(): void {
    this.store = {};
  }

  key(index: number): string | null {
    const keys = Object.keys(this.store);
    return keys[index] || null;
  }
}

// Attach mock localStorage
(globalThis as any).localStorage = new LocalStorageMock();

// Mock Google Sheets Cloud Backend in memory
let remoteCloudDB: {
  state: CloudAppState | null;
  healthy: boolean;
  failCount: number;
} = {
  state: null,
  healthy: true,
  failCount: 0,
};

// Mock global fetch to simulate Google Apps Script Web App endpoints
(globalThis as any).fetch = async (urlStr: string, options: any = {}) => {
  if (!remoteCloudDB.healthy) {
    throw new Error('503 Service Unavailable (Network Failure)');
  }

  const method = options.method || 'GET';

  if (method === 'GET') {
    const url = new URL(urlStr);
    const action = url.searchParams.get('action');

    if (action === 'HEALTH') {
      return {
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ success: true, status: 'ok', timestamp: new Date().toISOString() }),
      };
    }

    if (action === 'GET_ALL_STATE') {
      if (!remoteCloudDB.state) {
        return {
          ok: true,
          status: 200,
          text: async () => JSON.stringify({
            success: true,
            data: { projects: [], checklists: {}, activeProjectId: '', updatedAt: new Date().toISOString() },
            timestamp: new Date().toISOString(),
          }),
        };
      }
      return {
        ok: true,
        status: 200,
        text: async () => JSON.stringify({
          success: true,
          data: remoteCloudDB.state,
          timestamp: new Date().toISOString(),
        }),
      };
    }
  }

  if (method === 'POST') {
    const bodyStr = options.body;
    const parsed = JSON.parse(bodyStr);
    const action = parsed.action;
    const payload = parsed.payload;

    if (action === 'SAVE_ALL_STATE') {
      remoteCloudDB.state = {
        ...payload,
        updatedAt: new Date().toISOString(),
      };
      return {
        ok: true,
        status: 200,
        text: async () => JSON.stringify({
          success: true,
          message: 'Saved successfully',
          timestamp: new Date().toISOString(),
        }),
      };
    }
  }

  return {
    ok: false,
    status: 404,
    text: async () => JSON.stringify({ success: false, error: 'Unknown action' }),
  };
};

function assert(condition: boolean, testName: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${testName}`);
    process.exit(1);
  } else {
    console.log(`✅ PASS: ${testName}`);
  }
}

async function runTests() {
  console.log('🚀 Starting AtoZ Google Sheets Cloud Persistence Verification...\n');

  // Configure Mock Cloud Web App URL
  setCloudEndpointOverride('https://script.google.com/macros/s/AKfycb_MOCK_TEST/exec');
  assert(isCloudConfigured() === true, 'TEST 0: Cloud URL configured and recognized');

  // Test Cloud Health Check
  const health = await checkCloudHealth();
  assert(health.ok === true, 'TEST 0.1: Cloud Health check returns OK');

  // --------------------------------------------------------------------------
  // TEST 1: Initial load on empty storage creates Demo project and syncs
  // --------------------------------------------------------------------------
  localStorage.clear();
  remoteCloudDB.state = null;

  const init1 = await initAppState();
  assert(init1.projects.length >= 1, 'TEST 1.1: Demo project seeded when all stores empty');
  assert(init1.projects[0].title === '한글 주사위 교구', 'TEST 1.2: Demo project title matches prompt');
  assert(init1.source === 'demo', 'TEST 1.3: Init source reported as demo');

  // Verify it synced to cloud
  assert(remoteCloudDB.state !== null, 'TEST 1.4: Demo state automatically pushed to Cloud');
  assert(remoteCloudDB.state?.projects[0].id === init1.projects[0].id, 'TEST 1.5: Cloud has same project ID');

  // --------------------------------------------------------------------------
  // TEST 2: Task status update and memo save
  // --------------------------------------------------------------------------
  const currentProjects = loadProjects();
  const activeProj = currentProjects[0];
  const targetTask = activeProj.tasks.find((t) => t.task_id === 'TASK-14');
  assert(!!targetTask, 'TEST 2.1: TASK-14 exists');

  targetTask!.status = '완료';
  targetTask!.memo = 'KIPRIS 상표 검색 완료됨';
  targetTask!.completed_date = '2026-09-10';

  saveSingleProject(activeProj);
  await performCloudSync();

  const cloudStateAfterTask = remoteCloudDB.state;
  const cloudTask = cloudStateAfterTask?.projects[0].tasks.find((t) => t.task_id === 'TASK-14');
  assert(cloudTask?.status === '완료', 'TEST 2.2: Cloud reflects task status = 완료');
  assert(cloudTask?.memo === 'KIPRIS 상표 검색 완료됨', 'TEST 2.3: Cloud reflects task memo');

  // --------------------------------------------------------------------------
  // TEST 3: Checklist completion save and sync
  // --------------------------------------------------------------------------
  saveChecklistCompletions(activeProj.id, {
    'task-idea-1': true,
    'task-idea-2': true,
  });
  await performCloudSync();

  assert(remoteCloudDB.state?.checklists[activeProj.id]?.['task-idea-1'] === true, 'TEST 3.1: Checklist saved to Cloud');

  // --------------------------------------------------------------------------
  // TEST 4: LocalStorage deletion & Cloud Restore (PC B / Clean Browser Test)
  // --------------------------------------------------------------------------
  console.log('\n--- Simulating LocalStorage wipe / Access from Browser B ---');
  localStorage.clear();
  assert(localStorage.length === 0, 'TEST 4.1: Local storage completely cleared');

  // New browser/PC accesses the site and loads app state from Cloud
  const restored = await initAppState();
  assert(restored.source === 'cloud', 'TEST 4.2: State loaded from Cloud as Source of Truth');
  assert(restored.projects.length >= 1, 'TEST 4.3: Projects restored from Cloud');
  assert(restored.projects[0].tasks.find((t) => t.task_id === 'TASK-14')?.status === '완료', 'TEST 4.4: Task status preserved after localStorage wipe');
  assert(loadChecklistCompletions(activeProj.id)['task-idea-1'] === true, 'TEST 4.5: Checklist completions restored from Cloud');

  // --------------------------------------------------------------------------
  // TEST 5: Creating New Project on PC A and fetching on PC B
  // --------------------------------------------------------------------------
  console.log('\n--- Simulating New Project Creation on PC A ---');
  const newProject: Project = {
    id: 'proj-ai-homepage-2026',
    title: 'AI 홈페이지 사업',
    description: '소상공인을 위한 생성형 AI 기반 맞춤 웹사이트 자동 제작 서비스',
    createdAt: '2026-09-10T00:00:00.000Z',
    updatedAt: '2026-09-10T00:00:00.000Z',
    profile: {
      businessTypes: ['소프트웨어/IT', 'B2B SaaS'],
      targetCustomers: ['소상공인', '개인사업자'],
      salesChannels: ['자사몰', '네이버 스마트스토어'],
      stage: '아이디어 단계',
      corporateStatus: '개인사업자',
      staffing: '외주만 사용',
      hasOverseasSales: '없음',
    },
    tasks: [
      {
        task_id: 'TASK-01',
        category: '01_아이디어',
        sub_category: '기획',
        task_name: '아이디어 정의',
        description: 'AI 홈페이지 기획',
        why_needed: '필수',
        mandatory: true,
        organization: 'AtoZ',
        official_url: 'https://example.com',
        estimated_cost: '0원',
        estimated_days: '3일',
        required_documents: [],
        result_document: '기획서',
        step_by_step: ['기획'],
        cautions: '없음',
        status: '완료',
        memo: '기획안 작성 완료',
      },
      {
        task_id: 'TASK-02',
        category: '01_아이디어',
        sub_category: '기획',
        task_name: '문제 정의',
        description: '소상공인 웹사이트 제작 비용 문제 해결',
        why_needed: '필수',
        mandatory: true,
        organization: 'AtoZ',
        official_url: 'https://example.com',
        estimated_cost: '0원',
        estimated_days: '2일',
        required_documents: [],
        result_document: '문제정의서',
        step_by_step: ['문제정의'],
        cautions: '없음',
        status: '완료',
        memo: '타깃 페인포인트 검증',
      },
    ],
    sales: [],
    documents: [],
  };

  const allProjectsOnA = [newProject, ...loadProjects()];
  saveProjects(allProjectsOnA);
  setActiveProjectId(newProject.id);
  await performCloudSync();

  // Now simulate PC B loading from Cloud
  localStorage.clear();
  const initB = await initAppState();
  assert(initB.projects.some((p) => p.id === 'proj-ai-homepage-2026'), 'TEST 5.1: PC B sees new project "AI 홈페이지 사업"');
  const restoredAiProj = initB.projects.find((p) => p.id === 'proj-ai-homepage-2026');
  assert(restoredAiProj?.tasks.find((t) => t.task_id === 'TASK-01')?.status === '완료', 'TEST 5.2: TASK-01 status is 완료 on PC B');
  assert(restoredAiProj?.tasks.find((t) => t.task_id === 'TASK-02')?.status === '완료', 'TEST 5.3: TASK-02 status is 완료 on PC B');

  // --------------------------------------------------------------------------
  // TEST 6: Temporary Cloud Network Failure & Fallback Resilience
  // --------------------------------------------------------------------------
  console.log('\n--- Simulating Cloud Network Failure (Offline / HTTP 503) ---');
  remoteCloudDB.healthy = false;

  // App should continue working offline using localStorage cache
  const offlineInit = await initAppState();
  assert(offlineInit.source === 'local_fallback', 'TEST 6.1: Graceful fallback to local cache on network error');
  assert(offlineInit.projects.length >= 2, 'TEST 6.2: All projects available offline without crash');

  // Make a local edit while offline
  const offlineProj = offlineInit.projects[0];
  offlineProj.description = '오프라인에서 수정한 설명';
  saveSingleProject(offlineProj);

  assert(loadProjects()[0].description === '오프라인에서 수정한 설명', 'TEST 6.3: Local cache updated while offline');

  // --------------------------------------------------------------------------
  // TEST 7: Network Recovery & Resync
  // --------------------------------------------------------------------------
  console.log('\n--- Simulating Network Recovery ---');
  remoteCloudDB.healthy = true;

  const resync = await performCloudSync();
  assert(resync.success === true, 'TEST 7.1: Sync succeeded upon network restoration');
  assert(remoteCloudDB.state?.projects[0].description === '오프라인에서 수정한 설명', 'TEST 7.2: Cloud successfully received offline changes');

  // --------------------------------------------------------------------------
  // TEST 8: Migration of existing LocalStorage to Fresh Cloud Sheet
  // --------------------------------------------------------------------------
  console.log('\n--- Simulating Migration of Local Data to a New Empty Cloud Sheet ---');
  remoteCloudDB.state = null; // New empty sheet
  // LocalStorage already has existing projects from above tests
  const migrationInit = await initAppState();
  assert(migrationInit.source === 'local_migrated', 'TEST 8.1: Existing local data detected and migrated to empty Cloud');
  assert(remoteCloudDB.state !== null, 'TEST 8.2: Cloud now populated with migrated data');
  assert(remoteCloudDB.state?.projects.length === migrationInit.projects.length, 'TEST 8.3: Project count matches exactly');

  console.log('\n🎉 ALL 18 INTEGRATION & VERIFICATION TESTS PASSED SUCCESSFULLY!\n');
}

runTests().catch((e) => {
  console.error('Fatal test error:', e);
  process.exit(1);
});
