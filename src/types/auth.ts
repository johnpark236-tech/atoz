export type AuthStatus = 'loading' | 'guest' | 'authenticated';

export type UserRole = 'user' | 'admin';

export type PlanType = 'free' | 'pro';

export type SubscriptionStatus = 'free' | 'active' | 'canceled' | 'past_due' | 'trial';

export interface UserProfile {
  id: string;
  email: string;
  createdAt: string;
  role: UserRole;
  plan: PlanType;
  subscriptionStatus: SubscriptionStatus;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  nextBillingDate?: string;
  displayName?: string;
}

export interface ConsentRecord {
  termsOfService: boolean;
  privacyPolicy: boolean;
  marketingOptional: boolean;
  consentedAt: string;
  termsVersion: string;
  privacyVersion: string;
}

export interface AuthState {
  status: AuthStatus;
  user: UserProfile | null;
  consent: ConsentRecord | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  confirmPassword: string;
  consent: {
    terms: boolean;
    privacy: boolean;
    marketing: boolean;
  };
}

export interface AuthResult {
  success: boolean;
  user?: UserProfile;
  error?: string;
}

export interface AuthProvider {
  login(credentials: LoginCredentials): Promise<AuthResult>;
  signup(credentials: SignupCredentials): Promise<AuthResult>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<UserProfile | null>;
  sendPasswordResetEmail(email: string): Promise<{ success: boolean; error?: string }>;
  deleteAccount(userId: string): Promise<{ success: boolean; error?: string }>;
  updateProfile(userId: string, data: Partial<UserProfile>): Promise<AuthResult>;
  verifyEmail(token: string): Promise<{ success: boolean; error?: string }>;
}
