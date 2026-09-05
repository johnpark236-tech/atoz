import React, { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import { AuthState, UserProfile } from '../types/auth';
import { authService } from '../services/auth/authService';

interface AuthContextValue extends AuthState {
  refreshUser: () => Promise<void>;
  setUser: (user: UserProfile | null) => void;
}

type AuthAction =
  | { type: 'SET_LOADING' }
  | { type: 'SET_USER'; user: UserProfile }
  | { type: 'SET_GUEST' }
  | { type: 'CLEAR_USER' };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, status: 'loading' };
    case 'SET_USER':
      return { status: 'authenticated', user: action.user, consent: state.consent };
    case 'SET_GUEST':
      return { status: 'guest', user: null, consent: null };
    case 'CLEAR_USER':
      return { status: 'guest', user: null, consent: null };
    default:
      return state;
  }
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    status: 'loading',
    user: null,
    consent: null,
  });

  const refreshUser = useCallback(async () => {
    try {
      const user = await authService.getCurrentUser();
      if (user) {
        dispatch({ type: 'SET_USER', user });
      } else {
        dispatch({ type: 'SET_GUEST' });
      }
    } catch {
      dispatch({ type: 'SET_GUEST' });
    }
  }, []);

  const setUser = useCallback((user: UserProfile | null) => {
    if (user) {
      dispatch({ type: 'SET_USER', user });
    } else {
      dispatch({ type: 'CLEAR_USER' });
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  return (
    <AuthContext.Provider value={{ ...state, refreshUser, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
