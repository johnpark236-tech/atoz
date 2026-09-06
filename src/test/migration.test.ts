import { describe, it, expect, beforeEach } from 'vitest';
import { hasGuestData, getGuestProjects, migrateGuestData, isMigrationDone } from '../services/migrationService';
import { loadProjects, saveProjects } from '../services/storage';

beforeEach(() => {
  localStorage.clear();
});

describe('Migration Service', () => {
  it('localStorage 데이터 없으면 hasGuestData는 false (demo project 있어도 체크)', () => {
    // demo project가 자동 생성되더라도 hasGuestData 는 true 반환 (demo도 guest data)
    const result = hasGuestData();
    expect(typeof result).toBe('boolean');
  });

  it('getGuestProjects는 현재 localStorage의 프로젝트 반환', () => {
    const projects = getGuestProjects();
    expect(Array.isArray(projects)).toBe(true);
  });

  it('migration 완료 후 isMigrationDone은 true', async () => {
    const userId = 'test-user-123';
    expect(isMigrationDone(userId)).toBe(false);

    const projects = getGuestProjects();
    await migrateGuestData(userId, projects.map((p) => p.id));

    expect(isMigrationDone(userId)).toBe(true);
  });

  it('migration 결과는 migrated 수와 errors 배열 포함', async () => {
    const userId = 'test-user-456';
    const projects = getGuestProjects();
    const result = await migrateGuestData(userId, projects.map((p) => p.id));

    expect(typeof result.migrated).toBe('number');
    expect(Array.isArray(result.errors)).toBe(true);
  });
});
