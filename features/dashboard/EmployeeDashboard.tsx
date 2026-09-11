import { useMemo } from 'react';
import { Bot } from 'lucide-react';
import { Button, PageHeader } from '../../components/ui';
import { useApp } from '../../services/store';
import { evaluateCertification } from '../../lib/certification';
import { pathStats } from '../../lib/progress';
import { getDomain } from '../../data/catalog';
import { reassessEligibility } from '../learning/reassess';
import { effectiveStreak } from './stats';
import { nextRecommendedAction } from './nextAction';
import {
  ActivityFeed, AssessmentWidget, CertificationJourney, FocusTip, LearningProgressWidget, MiniSkillsMap, NextActionCard,
  PracticalsWidget, QuickLinks, ReadinessWidget, SkillsAcquiredWidget, StartPathHero, StreakWidget,
} from './widgets';

function greeting(d = new Date()) {
  const h = d.getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function EmployeeDashboard() {
  const { user, profile, progress, submissions, results, certificates, assessments, latestAssessment, initialAssessment } = useApp();

  const status = useMemo(() => evaluateCertification({ progress, submissions, results }), [progress, submissions, results]);
  const action = useMemo(
    () => nextRecommendedAction({ progress, submissions, results, certificates, assessments, status }),
    [progress, submissions, results, certificates, assessments, status],
  );
  const stats = useMemo(() => pathStats(progress), [progress]);
  const canReassess = useMemo(() => reassessEligibility(progress, submissions).eligible, [progress, submissions]);

  const firstName = (profile?.displayName || user?.name || '').trim().split(/\s+/)[0] || 'there';
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

  const statusLine = (() => {
    const latest = latestAssessment;
    if (!latest) return 'Let’s discover where you stand with AI — it takes about five minutes.';
    const readiness = `${latest.personalReadiness}% AI readiness (${latest.readinessLevel})`;
    if (!progress) return `You’re at ${readiness}. Your personalised learning path is ready when you are.`;
    const streak = effectiveStreak(progress).current;
    const domain = getDomain(progress.domainId)?.shortName ?? 'learning';
    if (stats.total && stats.completed === stats.total) return `Pathway complete at ${readiness} — time to certify and keep your skills current.`;
    return `You’re ${stats.percent}% through your ${domain} pathway${streak > 1 ? ` on a ${streak}-day streak` : ''} · ${readiness}.`;
  })();

  return (
    <div className="animate-fade-up">
      <PageHeader
        eyebrow={today}
        title={`${greeting()}, ${firstName}`}
        description={statusLine}
        actions={
          <Button to="/app/tutor" variant="outline" icon={<Bot className="h-4 w-4" />}>
            Ask AI Tutor
          </Button>
        }
      />

      {/* Hero row */}
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">{progress ? <NextActionCard action={action} pathPercent={stats.percent} /> : <StartPathHero latest={latestAssessment} />}</div>
        <ReadinessWidget latest={latestAssessment} initial={initialAssessment} canReassess={canReassess} />
      </div>

      {/* Widget grid */}
      <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        <LearningProgressWidget progress={progress} />
        <StreakWidget progress={progress} />
        <SkillsAcquiredWidget progress={progress} />
        <PracticalsWidget progress={progress} submissions={submissions} />
        <AssessmentWidget progress={progress} status={status} />
        <MiniSkillsMap progress={progress} />
      </div>

      {/* Certification, activity, tips */}
      <div className="mt-5 grid items-start gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <CertificationJourney status={status} certificates={certificates} />
          <ActivityFeed progress={progress} />
        </div>
        <div className="space-y-5">
          <FocusTip latest={latestAssessment} />
          <QuickLinks profile={profile} latest={latestAssessment} certificates={certificates} />
        </div>
      </div>
    </div>
  );
}
