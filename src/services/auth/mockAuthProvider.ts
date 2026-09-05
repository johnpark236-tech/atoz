import {
  AuthProvider,
  AuthResult,
  LoginCredentials,
  SignupCredentials,
  UserProfile,
  ConsentRecord,
} from '../../types/auth';

const AUTH_STORAGE_KEY = 'bizflow_auth_user_v1';
const USERS_STORAGE_KEY = 'bizflow_auth_users_v1';
const CONSENTS_STORAGE_KEY = 'bizflow_auth_consents_v1';

interface StoredUser {
  profile: UserProfile;
  passwordHash: string; // mock: just stores password for demo
}

function getStoredUsers(): Record<string, StoredUser> {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStoredUsers(users: Record<string, StoredUser>): void {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch {}
}

function getStoredConsents(): Record<string, ConsentRecord> {
  try {
    const raw = localStorage.getItem(CONSENTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStoredConsents(consents: Record<string, ConsentRecord>): void {
  try {
    localStorage.setItem(CONSENTS_STORAGE_KEY, JSON.stringify(consents));
  } catch {}
}

// Mock admin emails for demo
const ADMIN_EMAILS = ['admin@bizflow.kr', 'johnpark236@gmail.com'];

export const mockAuthProvider: AuthProvider = {
  async login(credentials: LoginCredentials): Promise<AuthResult> {
    await new Promise((r) => setTimeout(r, 600)); // simulate network
    const users = getStoredUsers();
    const stored = Object.values(users).find(
      (u) => u.profile.email === credentials.email
    );
    if (!stored) {
      return { success: false, error: '등록되지 않은 이메일입니다.' };
    }
    if (stored.passwordHash !== credentials.password) {
      return { success: false, error: '비밀번호가 올바르지 않습니다.' };
    }
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(stored.profile));
    return { success: true, user: stored.profile };
  },

  async signup(credentials: SignupCredentials): Promise<AuthResult> {
    await new Promise((r) => setTimeout(r, 800));
    if (credentials.password !== credentials.confirmPassword) {
      return { success: false, error: '비밀번호가 일치하지 않습니다.' };
    }
    if (credentials.password.length < 8) {
      return { success: false, error: '비밀번호는 8자 이상이어야 합니다.' };
    }
    if (!credentials.consent.terms || !credentials.consent.privacy) {
      return { success: false, error: '필수 약관에 동의해주세요.' };
    }

    const users = getStoredUsers();
    const existing = Object.values(users).find(
      (u) => u.profile.email === credentials.email
    );
    if (existing) {
      return { success: false, error: '이미 사용 중인 이메일입니다.' };
    }

    const isAdmin = ADMIN_EMAILS.includes(credentials.email);
    const userId = `user_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const newUser: UserProfile = {
      id: userId,
      email: credentials.email,
      createdAt: new Date().toISOString(),
      role: isAdmin ? 'admin' : 'user',
      plan: 'free',
      subscriptionStatus: 'free',
      displayName: credentials.email.split('@')[0],
    };

    users[userId] = { profile: newUser, passwordHash: credentials.password };
    saveStoredUsers(users);

    // Save consent
    const consents = getStoredConsents();
    consents[userId] = {
      termsOfService: credentials.consent.terms,
      privacyPolicy: credentials.consent.privacy,
      marketingOptional: credentials.consent.marketing,
      consentedAt: new Date().toISOString(),
      termsVersion: '1.0.0',
      privacyVersion: '1.0.0',
    };
    saveStoredConsents(consents);

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
    return { success: true, user: newUser };
  },

  async logout(): Promise<void> {
    await new Promise((r) => setTimeout(r, 200));
    localStorage.removeItem(AUTH_STORAGE_KEY);
  },

  async getCurrentUser(): Promise<UserProfile | null> {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as UserProfile;
    } catch {
      return null;
    }
  },

  async sendPasswordResetEmail(email: string): Promise<{ success: boolean; error?: string }> {
    await new Promise((r) => setTimeout(r, 600));
    const users = getStoredUsers();
    const exists = Object.values(users).some((u) => u.profile.email === email);
    if (!exists) {
      // Don't reveal if email exists for security
      return { success: true };
    }
    // MOCK: In production, send actual email via SMTP/Supabase
    // ENV_REQUIRED: SMTP or Supabase auth config
    console.log(`[MOCK] Password reset email sent to: ${email}`);
    return { success: true };
  },

  async deleteAccount(userId: string): Promise<{ success: boolean; error?: string }> {
    await new Promise((r) => setTimeout(r, 500));
    const users = getStoredUsers();
    delete users[userId];
    saveStoredUsers(users);
    const consents = getStoredConsents();
    delete consents[userId];
    saveStoredConsents(consents);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return { success: true };
  },

  async updateProfile(userId: string, data: Partial<UserProfile>): Promise<AuthResult> {
    await new Promise((r) => setTimeout(r, 400));
    const users = getStoredUsers();
    const stored = users[userId];
    if (!stored) {
      return { success: false, error: '사용자를 찾을 수 없습니다.' };
    }
    const updated = { ...stored.profile, ...data };
    users[userId] = { ...stored, profile: updated };
    saveStoredUsers(users);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
    return { success: true, user: updated };
  },

  async verifyEmail(_token: string): Promise<{ success: boolean; error?: string }> {
    // MOCK: In production, verify JWT token from email link
    // ENV_REQUIRED: Email verification token secret
    await new Promise((r) => setTimeout(r, 400));
    return { success: true };
  },
};

export function getConsentForUser(userId: string): ConsentRecord | null {
  const consents = getStoredConsents();
  return consents[userId] || null;
}

export function getAllUsersForAdmin(): UserProfile[] {
  const users = getStoredUsers();
  return Object.values(users).map((u) => u.profile);
}

export function updateUserPlanInStorage(userId: string, plan: UserProfile['plan'], subscriptionStatus: UserProfile['subscriptionStatus']): void {
  const users = getStoredUsers();
  if (users[userId]) {
    users[userId].profile.plan = plan;
    users[userId].profile.subscriptionStatus = subscriptionStatus;
    saveStoredUsers(users);
    const current = localStorage.getItem(AUTH_STORAGE_KEY);
    if (current) {
      try {
        const parsed = JSON.parse(current);
        if (parsed.id === userId) {
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ ...parsed, plan, subscriptionStatus }));
        }
      } catch {}
    }
  }
}
