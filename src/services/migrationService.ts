import { Project } from '../types';
import { loadProjects, saveProjects } from './storage';
import { projectRepository } from '../repositories/projectRepository';

const MIGRATION_DONE_KEY = 'bizflow_migration_done_v1';

export interface MigrationResult {
  migrated: number;
  skipped: number;
  errors: string[];
}

export function hasGuestData(): boolean {
  try {
    const projects = loadProjects();
    // If only demo project, no real guest data to migrate
    const nonDemoProjects = projects.filter(
      (p) => p.id !== 'proj-demo-hangul-dice'
    );
    return nonDemoProjects.length > 0 || projects.length > 0;
  } catch {
    return false;
  }
}

export function getGuestProjects(): Project[] {
  try {
    return loadProjects();
  } catch {
    return [];
  }
}

export function isMigrationDone(userId: string): boolean {
  try {
    const raw = localStorage.getItem(MIGRATION_DONE_KEY);
    if (!raw) return false;
    const done = JSON.parse(raw) as string[];
    return done.includes(userId);
  } catch {
    return false;
  }
}

export function markMigrationDone(userId: string): void {
  try {
    const raw = localStorage.getItem(MIGRATION_DONE_KEY);
    const done: string[] = raw ? JSON.parse(raw) : [];
    if (!done.includes(userId)) {
      done.push(userId);
      localStorage.setItem(MIGRATION_DONE_KEY, JSON.stringify(done));
    }
  } catch {}
}

export async function migrateGuestData(
  userId: string,
  selectedProjectIds: string[]
): Promise<MigrationResult> {
  const result: MigrationResult = { migrated: 0, skipped: 0, errors: [] };

  try {
    const guestProjects = getGuestProjects();
    const existingProjects = await projectRepository.findAll(userId);
    const existingIds = new Set(existingProjects.map((p) => p.id));

    for (const project of guestProjects) {
      if (!selectedProjectIds.includes(project.id)) {
        result.skipped++;
        continue;
      }

      try {
        let projectId = project.id;
        // Handle ID collision: generate new ID if collision
        if (existingIds.has(projectId)) {
          projectId = `${projectId}_migrated_${Date.now()}`;
        }

        const migratedProject: Project = {
          ...project,
          id: projectId,
          updatedAt: new Date().toISOString(),
        };

        await projectRepository.save(migratedProject, userId);
        existingIds.add(projectId);
        result.migrated++;
      } catch (e) {
        result.errors.push(`프로젝트 "${project.title}" 이전 실패: ${e}`);
      }
    }

    markMigrationDone(userId);
  } catch (e) {
    result.errors.push(`이전 실패: ${e}`);
  }

  return result;
}
