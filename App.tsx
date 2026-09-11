import { lazy, Suspense } from 'react';
import type { ReactNode } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppProvider } from './services/store';
import { FullPageLoader, ToastProvider } from './components/ui';
import ErrorBoundary from './components/ErrorBoundary';
import PublicLayout from './components/layout/PublicLayout';
import AppShell from './components/layout/AppShell';
import RequireAuth from './components/layout/RequireAuth';

// ── Public ──
const LandingPage = lazy(() => import('./features/landing/LandingPage'));
const ForEmployersPage = lazy(() => import('./features/employer/ForEmployersPage'));
const LoginPage = lazy(() => import('./features/auth/LoginPage'));
const DemoPage = lazy(() => import('./features/auth/DemoPage'));
const VerifyPage = lazy(() => import('./features/certification/VerifyPage'));
const PublicProfilePage = lazy(() => import('./features/certification/PublicProfilePage'));
const NotFound = lazy(() => import('./features/misc/NotFound'));

// ── Employee (Stages 1–3) ──
const OnboardingPage = lazy(() => import('./features/onboarding/OnboardingPage'));
const EmployeeDashboard = lazy(() => import('./features/dashboard/EmployeeDashboard'));
const ReadinessPage = lazy(() => import('./features/readiness/ReadinessPage'));
const CareerPage = lazy(() => import('./features/readiness/CareerPage'));
const LearningPathPage = lazy(() => import('./features/learning/LearningPathPage'));
const ModulePage = lazy(() => import('./features/learning/ModulePage'));
const ActivityPage = lazy(() => import('./features/learning/ActivityPage'));
const SkillsPage = lazy(() => import('./features/learning/SkillsPage'));
const ReassessPage = lazy(() => import('./features/learning/ReassessPage'));
const TutorPage = lazy(() => import('./features/tutor/TutorPage'));
const AssessmentsHub = lazy(() => import('./features/certification/AssessmentsHub'));
const FinalAssessmentPage = lazy(() => import('./features/certification/FinalAssessmentPage'));
const CapstonePage = lazy(() => import('./features/certification/CapstonePage'));
const CertificatesPage = lazy(() => import('./features/certification/CertificatesPage'));
const CertificateView = lazy(() => import('./features/certification/CertificateView'));
const SkillsProfilePage = lazy(() => import('./features/certification/SkillsProfilePage'));
const MaintainPage = lazy(() => import('./features/certification/MaintainPage'));

// ── Employer (Stage 4) ──
const EmployerOnboarding = lazy(() => import('./features/employer/EmployerOnboarding'));
const EmployerDashboard = lazy(() => import('./features/employer/EmployerDashboard'));
const WorkforcePage = lazy(() => import('./features/employer/WorkforcePage'));
const SkillsGapPage = lazy(() => import('./features/employer/SkillsGapPage'));
const CompetenciesPage = lazy(() => import('./features/employer/CompetenciesPage'));
const EmployerCertificationPage = lazy(() => import('./features/employer/EmployerCertificationPage'));
const AdvisorPage = lazy(() => import('./features/employer/AdvisorPage'));
const MaturityPage = lazy(() => import('./features/employer/MaturityPage'));

// ── Shared ──
const SettingsPage = lazy(() => import('./features/settings/SettingsPage'));

const S = ({ children }: { children: ReactNode }) => (
  <ErrorBoundary>
    <Suspense fallback={<FullPageLoader title="Loading…" />}>{children}</Suspense>
  </ErrorBoundary>
);

export default function App() {
  return (
    <HashRouter>
      <AppProvider>
        <ToastProvider>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route index element={<S><LandingPage /></S>} />
              <Route path="for-employers" element={<S><ForEmployersPage /></S>} />
              <Route path="login" element={<S><LoginPage /></S>} />
              <Route path="demo" element={<S><DemoPage /></S>} />
              <Route path="verify" element={<S><VerifyPage /></S>} />
              <Route path="verify/:certId" element={<S><VerifyPage /></S>} />
              <Route path="p/:userId" element={<S><PublicProfilePage /></S>} />
            </Route>

            <Route path="onboarding" element={<RequireAuth role="employee" allowIncomplete><S><OnboardingPage /></S></RequireAuth>} />

            <Route path="app" element={<RequireAuth role="employee"><AppShell role="employee" /></RequireAuth>}>
              <Route index element={<S><EmployeeDashboard /></S>} />
              <Route path="readiness" element={<S><ReadinessPage /></S>} />
              <Route path="career" element={<S><CareerPage /></S>} />
              <Route path="learning" element={<S><LearningPathPage /></S>} />
              <Route path="learning/:moduleId" element={<S><ModulePage /></S>} />
              <Route path="learning/:moduleId/activity" element={<S><ActivityPage /></S>} />
              <Route path="skills" element={<S><SkillsPage /></S>} />
              <Route path="tutor" element={<S><TutorPage /></S>} />
              <Route path="reassess" element={<S><ReassessPage /></S>} />
              <Route path="assessments" element={<S><AssessmentsHub /></S>} />
              <Route path="assessments/final" element={<S><FinalAssessmentPage /></S>} />
              <Route path="assessments/capstone" element={<S><CapstonePage /></S>} />
              <Route path="certificates" element={<S><CertificatesPage /></S>} />
              <Route path="certificates/:certId" element={<S><CertificateView /></S>} />
              <Route path="profile" element={<S><SkillsProfilePage /></S>} />
              <Route path="maintain" element={<S><MaintainPage /></S>} />
              <Route path="settings" element={<S><SettingsPage /></S>} />
              <Route path="*" element={<Navigate to="/app" replace />} />
            </Route>

            <Route path="employer/onboarding" element={<RequireAuth role="employer" allowIncomplete><S><EmployerOnboarding /></S></RequireAuth>} />

            <Route path="employer" element={<RequireAuth role="employer"><AppShell role="employer" /></RequireAuth>}>
              <Route index element={<S><EmployerDashboard /></S>} />
              <Route path="workforce" element={<S><WorkforcePage /></S>} />
              <Route path="skills" element={<S><SkillsGapPage /></S>} />
              <Route path="competencies" element={<S><CompetenciesPage /></S>} />
              <Route path="certification" element={<S><EmployerCertificationPage /></S>} />
              <Route path="advisor" element={<S><AdvisorPage /></S>} />
              <Route path="maturity" element={<S><MaturityPage /></S>} />
              <Route path="settings" element={<S><SettingsPage /></S>} />
              <Route path="*" element={<Navigate to="/employer" replace />} />
            </Route>

            <Route element={<PublicLayout />}>
              <Route path="*" element={<S><NotFound /></S>} />
            </Route>
          </Routes>
        </ToastProvider>
      </AppProvider>
    </HashRouter>
  );
}
