import { Project, SaleRecord } from '../types';
import {
  loadProjects,
  saveProjects,
  saveSingleProject,
  getActiveProjectId,
  setActiveProjectId,
  loadChecklistCompletions,
  saveChecklistCompletions,
  ChecklistCompletionMap,
} from '../services/storage';

// Repository interface - swap implementation for Supabase when ready
// ENV_REQUIRED: VITE_SUPABASE_URL for production repository

export interface ProjectRepository {
  findAll(userId?: string): Promise<Project[]>;
  findById(id: string, userId?: string): Promise<Project | null>;
  save(project: Project, userId?: string): Promise<void>;
  saveAll(projects: Project[], userId?: string): Promise<void>;
  delete(id: string, userId?: string): Promise<void>;
  getActiveId(): string;
  setActiveId(id: string): void;
  loadChecklistCompletions(projectId: string): ChecklistCompletionMap;
  saveChecklistCompletions(projectId: string, completions: ChecklistCompletionMap): void;
}

// LocalStorage implementation (current)
export const localProjectRepository: ProjectRepository = {
  async findAll(_userId?: string): Promise<Project[]> {
    return loadProjects();
  },

  async findById(id: string, _userId?: string): Promise<Project | null> {
    const projects = loadProjects();
    return projects.find((p) => p.id === id) || null;
  },

  async save(project: Project, _userId?: string): Promise<void> {
    saveSingleProject(project);
  },

  async saveAll(projects: Project[], _userId?: string): Promise<void> {
    saveProjects(projects);
  },

  async delete(id: string, _userId?: string): Promise<void> {
    const projects = loadProjects().filter((p) => p.id !== id);
    saveProjects(projects);
  },

  getActiveId(): string {
    return getActiveProjectId();
  },

  setActiveId(id: string): void {
    setActiveProjectId(id);
  },

  loadChecklistCompletions(projectId: string): ChecklistCompletionMap {
    return loadChecklistCompletions(projectId);
  },

  saveChecklistCompletions(projectId: string, completions: ChecklistCompletionMap): void {
    saveChecklistCompletions(projectId, completions);
  },
};

// TODO: ADAPTER - SupabaseProjectRepository
// All data scoped by user_id. RLS enforced server-side.
// export const supabaseProjectRepository: ProjectRepository = { ... }

// Active repository (switch when Supabase is configured)
export const projectRepository = localProjectRepository;
