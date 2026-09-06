import { useAuth } from '../contexts/AuthContext';
import { PLAN_CONFIGS } from '../types/billing';

export function usePlanGating() {
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const isPro = user?.plan === 'pro' && (user?.subscriptionStatus === 'active' || user?.subscriptionStatus === 'trial');
  const maxProjects = isPro ? PLAN_CONFIGS.pro.maxProjects : PLAN_CONFIGS.free.maxProjects;

  return {
    isAuthenticated,
    isPro,
    maxProjects,
    canCreateProject: (currentCount: number) => {
      if (!isAuthenticated) return currentCount < maxProjects; // guest: free limit
      return currentCount < maxProjects;
    },
    requiresPro: (feature: string) => {
      const proFeatures = ['documents', 'ai_enhanced', 'advanced_analytics', 'notifications'];
      return proFeatures.includes(feature) && !isPro;
    },
    projectLimitReached: (count: number) => count >= maxProjects,
  };
}
