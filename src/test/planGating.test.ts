import { describe, it, expect } from 'vitest';
import { PLAN_CONFIGS } from '../types/billing';

describe('Plan Configs', () => {
  it('FREE 플랜: 프로젝트 최대 1개', () => {
    expect(PLAN_CONFIGS.free.maxProjects).toBe(1);
    expect(PLAN_CONFIGS.free.price).toBe(0);
  });

  it('PRO 플랜: 프로젝트 최대 20개', () => {
    expect(PLAN_CONFIGS.pro.maxProjects).toBe(20);
    expect(PLAN_CONFIGS.pro.price).toBeGreaterThan(0);
  });

  it('PRO 가격은 양수', () => {
    expect(PLAN_CONFIGS.pro.price).toBe(19900);
  });

  it('FREE features 배열은 비어있지 않음', () => {
    expect(PLAN_CONFIGS.free.features.length).toBeGreaterThan(0);
  });

  it('PRO features가 FREE보다 많음', () => {
    expect(PLAN_CONFIGS.pro.features.length).toBeGreaterThan(
      PLAN_CONFIGS.free.features.length
    );
  });
});

describe('Plan Gating Logic', () => {
  it('FREE 사용자: 1개 이하면 프로젝트 생성 가능', () => {
    const maxFree = PLAN_CONFIGS.free.maxProjects;
    expect(0 < maxFree).toBe(true);
    expect(1 <= maxFree).toBe(true);
    expect(2 <= maxFree).toBe(false);
  });

  it('PRO 사용자: 20개 이하면 프로젝트 생성 가능', () => {
    const maxPro = PLAN_CONFIGS.pro.maxProjects;
    expect(19 < maxPro).toBe(true);
    expect(20 <= maxPro).toBe(true);
    expect(21 <= maxPro).toBe(false);
  });
});
