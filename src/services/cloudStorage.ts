import { Project } from '../types';
import { ChecklistCompletionMap } from './storage';

export const CLOUD_URL_OVERRIDE_KEY = 'bizflow_atoz_cloud_url_override';

export interface CloudAppState {
  projects: Project[];
  checklists: Record<string, ChecklistCompletionMap>;
  activeProjectId?: string;
  updatedAt: string;
  version: string;
}

export type CloudSyncStatus =
  | 'idle'
  | 'loading'
  | 'saving'
  | 'saved'
  | 'error'
  | 'local_only';

export const DEFAULT_CLOUD_ENDPOINT =
  'https://script.google.com/macros/s/AKfycbymdhsa5hvNIOymglFn1mzBUytV08jsFlXfsQO-dgTsAknTT4_iMTUZ-jhkLmj0FsdohA/exec';

/**
 * Returns the currently configured Google Apps Script Web App URL.
 * Checks runtime localStorage override first, then Vite build environment variable, then default endpoint.
 */
export function getCloudEndpoint(): string {
  try {
    const override = localStorage.getItem(CLOUD_URL_OVERRIDE_KEY);
    if (override && override.trim().length > 0) {
      return override.trim();
    }
  } catch {
    // localStorage might fail in restricted environments
  }
  const envUrl =
    typeof import.meta !== 'undefined' && (import.meta as any)?.env?.VITE_GOOGLE_SHEETS_API_URL
      ? (import.meta as any).env.VITE_GOOGLE_SHEETS_API_URL
      : typeof process !== 'undefined'
      ? process.env?.VITE_GOOGLE_SHEETS_API_URL
      : undefined;
  return (envUrl || DEFAULT_CLOUD_ENDPOINT).trim();
}

/**
 * Sets or removes the runtime override for the Google Apps Script Web App URL.
 */
export function setCloudEndpointOverride(url: string | null): void {
  try {
    if (!url || url.trim().length === 0) {
      localStorage.removeItem(CLOUD_URL_OVERRIDE_KEY);
    } else {
      localStorage.setItem(CLOUD_URL_OVERRIDE_KEY, url.trim());
    }
  } catch (e) {
    console.error('Failed to set cloud endpoint override:', e);
  }
}

/**
 * Checks if a Google Apps Script Web App URL is configured.
 */
export function isCloudConfigured(): boolean {
  const url = getCloudEndpoint();
  return url.length > 0 && url.startsWith('http');
}

/**
 * Executes a network request to the Google Apps Script Web App.
 * Uses text/plain body for POST to bypass CORS preflight issues inherent in Google Apps Script.
 */
async function sendToCloud<T>(
  action: string,
  payload?: unknown,
  timeoutMs = 12000
): Promise<{ success: boolean; data?: T; error?: string; timestamp?: string }> {
  const endpoint = getCloudEndpoint();
  if (!endpoint) {
    return { success: false, error: 'Google Sheets API URL이 설정되지 않았습니다 (로컬 모드).' };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    // For GET-like read actions without heavy payload
    if (action === 'GET_ALL_STATE' || action === 'HEALTH') {
      const url = new URL(endpoint);
      url.searchParams.set('action', action);
      url.searchParams.set('_t', Date.now().toString());

      const res = await fetch(url.toString(), {
        method: 'GET',
        mode: 'cors',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`HTTP 오류 (${res.status}): ${res.statusText}`);
      }

      const text = await res.text();
      let parsed: any;
      try {
        parsed = JSON.parse(text);
      } catch {
        throw new Error(`잘못된 서버 응답 형식: ${text.slice(0, 100)}`);
      }

      if (parsed && parsed.success === false) {
        return { success: false, error: parsed.error || '클라우드 요청 실패' };
      }

      return { success: true, data: (parsed.data !== undefined ? parsed.data : parsed) as T, timestamp: parsed.timestamp };
    }

    // For POST actions (SAVE_ALL_STATE, SAVE_PROJECTS, SAVE_CHECKLIST, etc.)
    // Note: text/plain prevents browser OPTIONS preflight which Apps Script Web App does not handle
    const bodyStr = JSON.stringify({
      action,
      payload,
      timestamp: new Date().toISOString(),
    });

    const res = await fetch(endpoint, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: bodyStr,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`HTTP 오류 (${res.status}): ${res.statusText}`);
    }

    const text = await res.text();
    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch {
      // If Apps Script returns 200 without JSON or empty
      return { success: true, timestamp: new Date().toISOString() };
    }

    if (parsed && parsed.success === false) {
      return { success: false, error: parsed.error || '클라우드 저장 실패' };
    }

    return { success: true, data: parsed.data as T, timestamp: parsed.timestamp };
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      return { success: false, error: '클라우드 요청 시간 초과 (12초)' };
    }
    return { success: false, error: err.message || '네트워크 오류가 발생했습니다.' };
  }
}

/**
 * Health check for the Google Apps Script Web App
 */
export async function checkCloudHealth(): Promise<{ ok: boolean; message?: string; timestamp?: string }> {
  if (!isCloudConfigured()) {
    return { ok: false, message: 'Google Sheets API URL 미설정' };
  }
  const res = await sendToCloud<{ status: string }>('HEALTH');
  if (res.success) {
    return { ok: true, message: '정상 연결됨', timestamp: res.timestamp };
  }
  return { ok: false, message: res.error };
}

/**
 * Fetches the entire application state snapshot from Google Sheets
 */
export async function fetchCloudAppState(): Promise<{
  success: boolean;
  state?: CloudAppState;
  error?: string;
}> {
  if (!isCloudConfigured()) {
    return { success: false, error: 'Google Sheets URL 미설정' };
  }

  const res = await sendToCloud<CloudAppState>('GET_ALL_STATE');
  if (res.success && res.data) {
    return { success: true, state: res.data };
  }
  return { success: false, error: res.error || '클라우드 데이터를 불러오지 못했습니다.' };
}

/**
 * Saves the entire application state snapshot to Google Sheets
 */
export async function saveCloudAppState(state: CloudAppState): Promise<{
  success: boolean;
  error?: string;
  timestamp?: string;
}> {
  if (!isCloudConfigured()) {
    return { success: false, error: 'Google Sheets URL 미설정' };
  }

  return await sendToCloud('SAVE_ALL_STATE', state);
}
