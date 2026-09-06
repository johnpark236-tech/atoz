import { describe, it, expect, beforeEach } from 'vitest';
import { mockAuthProvider } from '../services/auth/mockAuthProvider';

beforeEach(() => {
  localStorage.clear();
});

describe('Auth - Signup', () => {
  it('회원가입 성공 - 유효한 이메일+비밀번호', async () => {
    const result = await mockAuthProvider.signup({
      email: 'test@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      consent: { terms: true, privacy: true, marketing: false },
    });
    expect(result.success).toBe(true);
    expect(result.user?.email).toBe('test@example.com');
    expect(result.user?.plan).toBe('free');
    expect(result.user?.role).toBe('user');
  });

  it('회원가입 실패 - 비밀번호 불일치', async () => {
    const result = await mockAuthProvider.signup({
      email: 'test2@example.com',
      password: 'Password123!',
      confirmPassword: 'WrongPassword!',
      consent: { terms: true, privacy: true, marketing: false },
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('비밀번호가 일치하지 않습니다');
  });

  it('회원가입 실패 - 필수 동의 미체크', async () => {
    const result = await mockAuthProvider.signup({
      email: 'test3@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      consent: { terms: false, privacy: true, marketing: false },
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('필수 약관');
  });

  it('회원가입 실패 - 8자 미만 비밀번호', async () => {
    const result = await mockAuthProvider.signup({
      email: 'test4@example.com',
      password: 'short',
      confirmPassword: 'short',
      consent: { terms: true, privacy: true, marketing: false },
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('8자 이상');
  });

  it('회원가입 실패 - 중복 이메일', async () => {
    await mockAuthProvider.signup({
      email: 'dup@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      consent: { terms: true, privacy: true, marketing: false },
    });
    const result = await mockAuthProvider.signup({
      email: 'dup@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      consent: { terms: true, privacy: true, marketing: false },
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('이미 사용 중인 이메일');
  });
});

describe('Auth - Login', () => {
  it('로그인 성공 - 가입된 계정', async () => {
    await mockAuthProvider.signup({
      email: 'login@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      consent: { terms: true, privacy: true, marketing: false },
    });
    const result = await mockAuthProvider.login({
      email: 'login@example.com',
      password: 'Password123!',
    });
    expect(result.success).toBe(true);
    expect(result.user?.email).toBe('login@example.com');
  });

  it('로그인 실패 - 잘못된 비밀번호', async () => {
    await mockAuthProvider.signup({
      email: 'fail@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      consent: { terms: true, privacy: true, marketing: false },
    });
    const result = await mockAuthProvider.login({
      email: 'fail@example.com',
      password: 'WrongPassword!',
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('비밀번호가 올바르지 않습니다');
  });

  it('로그인 실패 - 미가입 이메일', async () => {
    const result = await mockAuthProvider.login({
      email: 'notexist@example.com',
      password: 'Password123!',
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('등록되지 않은 이메일');
  });
});

describe('Auth - Logout', () => {
  it('로그아웃 후 getCurrentUser는 null 반환', async () => {
    await mockAuthProvider.signup({
      email: 'logout@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      consent: { terms: true, privacy: true, marketing: false },
    });
    await mockAuthProvider.login({ email: 'logout@example.com', password: 'Password123!' });
    const beforeLogout = await mockAuthProvider.getCurrentUser();
    expect(beforeLogout).not.toBeNull();

    await mockAuthProvider.logout();
    const afterLogout = await mockAuthProvider.getCurrentUser();
    expect(afterLogout).toBeNull();
  });
});

describe('Auth - Admin role', () => {
  it('admin 이메일로 가입 시 role=admin', async () => {
    const result = await mockAuthProvider.signup({
      email: 'admin@bizflow.kr',
      password: 'AdminPass123!',
      confirmPassword: 'AdminPass123!',
      consent: { terms: true, privacy: true, marketing: false },
    });
    expect(result.success).toBe(true);
    expect(result.user?.role).toBe('admin');
  });

  it('일반 이메일로 가입 시 role=user', async () => {
    const result = await mockAuthProvider.signup({
      email: 'regular@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      consent: { terms: true, privacy: true, marketing: false },
    });
    expect(result.user?.role).toBe('user');
  });
});
