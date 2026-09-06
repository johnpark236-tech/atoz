// Auth abstraction layer
// ENV_REQUIRED: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY for production
// Currently uses mockAuthProvider. Switch to supabaseAuthProvider when env vars are available.

import { AuthProvider, AuthState, LoginCredentials, SignupCredentials, UserProfile } from '../../types/auth';
import { mockAuthProvider } from './mockAuthProvider';

// TODO: ADAPTER - when Supabase is configured, swap this with supabaseAuthProvider
// import { supabaseAuthProvider } from './supabaseAuthProvider';
// const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
// const provider = SUPABASE_URL ? supabaseAuthProvider : mockAuthProvider;

const provider: AuthProvider = mockAuthProvider;

export const authService = {
  async login(credentials: LoginCredentials) {
    return provider.login(credentials);
  },

  async signup(credentials: SignupCredentials) {
    return provider.signup(credentials);
  },

  async logout() {
    return provider.logout();
  },

  async getCurrentUser(): Promise<UserProfile | null> {
    return provider.getCurrentUser();
  },

  async sendPasswordResetEmail(email: string) {
    return provider.sendPasswordResetEmail(email);
  },

  async deleteAccount(userId: string) {
    return provider.deleteAccount(userId);
  },

  async updateProfile(userId: string, data: Partial<UserProfile>) {
    return provider.updateProfile(userId, data);
  },
};

export function getInitialAuthState(): AuthState {
  return {
    status: 'loading',
    user: null,
    consent: null,
  };
}
