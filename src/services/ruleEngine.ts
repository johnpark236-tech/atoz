import { ProjectProfile, Task, TaskStatus } from '../types';
import { COMMON_TASKS_TEMPLATE } from '../data/commonTasks';
import { INDUSTRY_RULES } from '../data/industryRules';

/**
 * Evaluates rules against the project profile and generates the full task roadmap
 */
export function generateTasksForProfile(profile: ProjectProfile): Task[] {
  // 1. Clone baseline 75 common tasks
  const tasks: Task[] = COMMON_TASKS_TEMPLATE.map((template) => ({
    ...template,
    status: '미착수' as TaskStatus,
  }));

  const existingTaskIds = new Set(tasks.map((t) => t.task_id));

  // 2. Evaluate declarative industry rules
  for (const rule of INDUSTRY_RULES) {
    let matched = false;

    // Check business types match
    if (rule.condition.businessTypes && rule.condition.businessTypes.length > 0) {
      const hasMatch = rule.condition.businessTypes.some((bt) =>
        profile.businessTypes.includes(bt)
      );
      if (hasMatch) matched = true;
    }

    // Check target customers match
    if (rule.condition.targetCustomers && rule.condition.targetCustomers.length > 0) {
      const hasMatch = rule.condition.targetCustomers.some((tc) =>
        profile.targetCustomers.includes(tc)
      );
      if (hasMatch) matched = true;
    }

    // Check sales channels match
    if (rule.condition.salesChannels && rule.condition.salesChannels.length > 0) {
      const hasMatch = rule.condition.salesChannels.some((sc) =>
        profile.salesChannels.includes(sc)
      );
      if (hasMatch) matched = true;
    }

    // Check staffing match
    if (rule.condition.staffing && rule.condition.staffing.length > 0) {
      if (rule.condition.staffing.includes(profile.staffing)) {
        matched = true;
      }
    }

    // Check overseas sales match
    if (rule.condition.hasOverseasSales && rule.condition.hasOverseasSales.length > 0) {
      if (rule.condition.hasOverseasSales.includes(profile.hasOverseasSales)) {
        matched = true;
      }
    }

    // If rule matched, add its specialized tasks
    if (matched) {
      for (const addTask of rule.add_tasks) {
        if (!existingTaskIds.has(addTask.task_id)) {
          tasks.push({
            ...addTask,
            status: '미착수' as TaskStatus,
          });
          existingTaskIds.add(addTask.task_id);
        }
      }
    }
  }

  // Sort tasks by category and task_id for logical sequence
  return sortTasks(tasks);
}

/**
 * Sorts tasks in sequence of lifecycle
 */
export function sortTasks(tasks: Task[]): Task[] {
  const categoryOrder: Record<string, number> = {
    '01_아이디어': 1,
    '02_지식재산': 2,
    '03_인증인허가': 3,
    '04_제조시제품': 4,
    '05_사업자세무': 5,
    '06_판매준비': 6,
    '07_주문배송': 7,
    '08_정산입금': 8,
    '09_세무회계': 9,
    '10_사업성장': 10,
  };

  return [...tasks].sort((a, b) => {
    const catDiff = (categoryOrder[a.category] || 99) - (categoryOrder[b.category] || 99);
    if (catDiff !== 0) return catDiff;
    return a.task_id.localeCompare(b.task_id);
  });
}

/**
 * Calculates project statistics and progress
 */
export function calculateProjectProgress(tasks: Task[]) {
  const activeTasks = tasks.filter((t) => t.status !== '불필요');
  const completed = tasks.filter((t) => t.status === '완료').length;
  const inProgress = tasks.filter((t) =>
    ['준비중', '신청준비', '신청완료', '심사중', '승인'].includes(t.status)
  ).length;
  const reviewPending = tasks.filter((t) => t.status === '심사중').length;
  const needsRevision = tasks.filter((t) => t.status === '보완요청').length;
  const notStarted = tasks.filter((t) => t.status === '미착수').length;
  const notNeeded = tasks.filter((t) => t.status === '불필요').length;

  const total = activeTasks.length || 1;
  const percentage = Math.round((completed / total) * 100);

  return {
    totalTasks: tasks.length,
    activeTasksCount: activeTasks.length,
    completed,
    inProgress,
    reviewPending,
    needsRevision,
    notStarted,
    notNeeded,
    percentage,
  };
}

/**
 * Gets up to 3 prioritized executable tasks for the "Today's Tasks" card
 */
export function getTodaysTasks(tasks: Task[]): Task[] {
  // 1. Any tasks requiring revision (보완요청) has highest urgency
  const revisionTasks = tasks.filter((t) => t.status === '보완요청');
  if (revisionTasks.length >= 3) return revisionTasks.slice(0, 3);

  // 2. Currently in-progress / application ready
  const inProgressTasks = tasks.filter((t) =>
    ['신청준비', '준비중', '심사중'].includes(t.status)
  );

  // 3. Not started tasks whose prerequisites are met
  const completedIds = new Set(tasks.filter((t) => t.status === '완료').map((t) => t.task_id));
  const readyToStart = tasks.filter((t) => {
    if (t.status !== '미착수') return false;
    if (!t.dependency || t.dependency.length === 0) return true;
    return t.dependency.every((dep) => completedIds.has(dep));
  });

  const candidates = [...revisionTasks, ...inProgressTasks, ...readyToStart];
  // Remove duplicates if any and take 3
  const unique = Array.from(new Set(candidates));
  return unique.slice(0, 3);
}

/**
 * Stages for the Central 9-step A to Z progress track
 */
export interface ProcessStage {
  id: string;
  name: string;
  shortName: string;
  categoryKeys: string[];
  total: number;
  completed: number;
  percentage: number;
  isActive: boolean;
}

export function getAtoZStages(tasks: Task[]): ProcessStage[] {
  const stageDefinitions = [
    { id: 'idea', name: '아이디어', shortName: '아이디어', categories: ['01_아이디어'] },
    { id: 'ip', name: '지식재산 (IP)', shortName: 'IP', categories: ['02_지식재산'] },
    { id: 'cert', name: '인증/인허가', shortName: '인증', categories: ['03_인증인허가'] },
    { id: 'proto', name: '시제품/제조', shortName: '제조', categories: ['04_제조시제품'] },
    { id: 'biz', name: '사업자/행정', shortName: '사업자', categories: ['05_사업자세무'] },
    { id: 'prep', name: '판매준비', shortName: '판매준비', categories: ['06_판매준비'] },
    { id: 'order', name: '주문/배송', shortName: '판매', categories: ['07_주문배송'] },
    { id: 'settle', name: '정산/입금', shortName: '정산', categories: ['08_정산입금'] },
    { id: 'tax', name: '세무/성장', shortName: '세무·성장', categories: ['09_세무회계', '10_사업성장'] },
  ];

  let foundActive = false;

  return stageDefinitions.map((def) => {
    const stageTasks = tasks.filter(
      (t) => def.categories.includes(t.category) && t.status !== '불필요'
    );
    const total = stageTasks.length;
    const completed = stageTasks.filter((t) => t.status === '완료').length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    const hasInProgress = stageTasks.some((t) =>
      ['준비중', '신청준비', '신청완료', '심사중', '보완요청', '승인'].includes(t.status)
    );

    let isActive = false;
    if (!foundActive && (hasInProgress || (percentage > 0 && percentage < 100))) {
      isActive = true;
      foundActive = true;
    }

    return {
      id: def.id,
      name: def.name,
      shortName: def.shortName,
      categoryKeys: def.categories,
      total,
      completed,
      percentage,
      isActive,
    };
  });
}
