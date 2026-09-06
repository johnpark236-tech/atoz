/**
 * Supabase auth provider adapter skeleton.
 *
 * ENV_REQUIRED: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
 *
 * Swap this in authService.ts when Supabase credentials are available.
 * All methods currently throw ENV_REQUIRED so the app fails fast at runtime
 * rather than silently misbehaving.
 *
 * Implementation checklist (before production):
 *   1. npm install @supabase/supabase-js
 *   2. Replace every throw with actual Supabase calls (see comments)
 *   3. Run supabase/migrations/001_initial_schema.sql against your project
 *   4. Enable RLS on all tables via Supabase dashboard
 *   5. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env
 */

import type {
  AuthProvider,
  AuthResult,
  LoginCredentials,
  SignupCredentials,
  UserProfile,
} from '../../types/auth';

const ENV_ERROR = 'SUPABASE_NOT_CONFIGURED: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY';

/*
 * When implementing:
 *
 * import { createClient } from '@supabase/supabase-js';
 * const supabase = createClient(
 *   import.meta.env.VITE_SUPABASE_URL,
 *   import.meta.env.VITE_SUPABASE_ANON_KEY
 * );
 */

async function login(credentials: LoginCredentials): Promise<AuthResult> {
  // TODO: const { data, error } = await supabase.auth.signInWithPassword({
  //   email: credentials.email,
  //   password: credentials.password,
  // });
  // if (error) return { success: false, error: error.message };
  // const profile = await fetchProfile(data.user.id);
  // return { success: true, user: profile };
  throw new Error(ENV_ERROR);
}

async function signup(credentials: SignupCredentials): Promise<AuthResult> {
  // TODO: const { data, error } = await supabase.auth.signUp({
  //   email: credentials.email,
  //   password: credentials.password,
  // });
  // if (error) return { success: false, error: error.message };
  // await supabase.from('profiles').insert({
  //   id: data.user!.id,
  //   email: credentials.email,
  //   display_name: credentials.displayName || null,
  //   role: 'user',
  //   plan: 'free',
  // });
  // await supabase.from('consents').insert({
  //   user_id: data.user!.id,
  //   terms_agreed: credentials.termsAgreed,
  //   privacy_agreed: credentials.privacyAgreed,
  //   marketing_agreed: credentials.marketingAgreed ?? false,
  //   version: '1.0.0',
  // });
  // const profile = await fetchProfile(data.user!.id);
  // return { success: true, user: profile };
  throw new Error(ENV_ERROR);
}

async function logout(): Promise<void> {
  // TODO: await supabase.auth.signOut();
  throw new Error(ENV_ERROR);
}

async function getCurrentUser(): Promise<UserProfile | null> {
  // TODO: const { data } = await supabase.auth.getUser();
  // if (!data.user) return null;
  // return fetchProfile(data.user.id);
  throw new Error(ENV_ERROR);
}

async function sendPasswordResetEmail(email: string): Promise<{ success: boolean; error?: string }> {
  // TODO: const { error } = await supabase.auth.resetPasswordForEmail(email, {
  //   redirectTo: `${window.location.origin}/atoz/#reset-password`,
  // });
  // if (error) return { success: false, error: error.message };
  // return { success: true };
  void email;
  throw new Error(ENV_ERROR);
}

async function deleteAccount(userId: string): Promise<{ success: boolean; error?: string }> {
  // TODO: Server-side function required — Supabase does not allow client-side user deletion.
  // Call a Supabase Edge Function or backend endpoint:
  // const { error } = await supabase.functions.invoke('delete-user', { body: { userId } });
  // if (error) return { success: false, error: error.message };
  // return { success: true };
  void userId;
  throw new Error(ENV_ERROR);
}

async function updateProfile(userId: string, data: Partial<import('../../types/auth').UserProfile>): Promise<import('../../types/auth').AuthResult> {
  // TODO: const { error } = await supabase.from('profiles').update(data).eq('id', userId);
  // if (error) return { success: false, error: error.message };
  // const profile = await fetchProfile(userId);
  // return { success: true, user: profile };
  void userId; void data;
  throw new Error(ENV_ERROR);
}

async function verifyEmail(token: string): Promise<{ success: boolean; error?: string }> {
  // TODO: const { error } = await supabase.auth.verifyOtp({ token_hash: token, type: 'email' });
  // if (error) return { success: false, error: error.message };
  // return { success: true };
  void token;
  throw new Error(ENV_ERROR);
}

/* Helper — not exported */
// async function fetchProfile(userId: string): Promise<UserProfile> {
//   const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
//   return {
//     id: data.id,
//     email: data.email,
//     displayName: data.display_name ?? undefined,
//     role: data.role,
//     plan: data.plan,
//     planExpiresAt: data.plan_expires_at ?? undefined,
//     createdAt: data.created_at,
//   };
// }

export const supabaseAuthProvider: AuthProvider = {
  login,
  signup,
  logout,
  getCurrentUser,
  sendPasswordResetEmail,
  deleteAccount,
  updateProfile,
  verifyEmail,
};
