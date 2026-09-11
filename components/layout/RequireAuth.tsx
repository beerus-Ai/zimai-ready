import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../../services/store';
import { FullPageLoader } from '../ui';

/**
 * Route guard.
 * - Not signed in → /login (returns afterwards via ?next=)
 * - Wrong role → that role's home
 * - Employee without completed onboarding → /onboarding
 * - Employer without an organisation → /employer/onboarding
 */
export default function RequireAuth({ role, allowIncomplete, children }: { role: 'employee' | 'employer'; allowIncomplete?: boolean; children: ReactNode }) {
  const { ready, user, profile, organisation, latestAssessment } = useApp();
  const location = useLocation();
  if (!ready) return <FullPageLoader />;
  if (!user) return <Navigate to={`/login?role=${role}&next=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  if (user.role !== role) return <Navigate to={user.role === 'employer' ? '/employer' : '/app'} replace />;
  if (!allowIncomplete) {
    if (role === 'employee' && (!profile?.onboardingCompletedAt || !latestAssessment)) return <Navigate to="/onboarding" replace />;
    if (role === 'employer' && !organisation) return <Navigate to="/employer/onboarding" replace />;
  }
  return <>{children}</>;
}
