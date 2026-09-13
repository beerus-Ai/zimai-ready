import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { Activity, Award, Bot, ChevronsDownUp, ChevronsUpDown, ClipboardCheck, Flame, Gauge, Layers, Map as MapIcon } from 'lucide-react';
import { Button, ExpandableSection, useExpandedSections } from '../../components/ui';
import { GhostText, Reveal } from '../../components/motion';
import { useApp } from '../../services/store';
import { evaluateCertification, LEVEL_META } from '../../lib/certification';
import { pathStats } from '../../lib/progress';
import { getDomain } from '../../data/catalog';
import { cn, timeAgo } from '../../lib/utils';
import { reassessEligibility } from '../learning/reassess';
import { bestSubmissions, effectiveStreak, levelCounts, quizAccuracy, trackedSkillLevels } from './stats';
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

const SECTION_IDS = ['readiness', 'learning', 'practice', 'certification', 'activity'] as const;
type SectionId = (typeof SECTION_IDS)[number];

/**
 * Calm dashboard: one next step and four key numbers up front; everything else lives in collapsible
 * sections the learner can open when they want the detail (open state is remembered per browser).
 */
export default function EmployeeDashboard() {
  const { user, profile, progress, submissions, results, certificates, assessments, latestAssessment, initialAssessment } = useApp();
  const { open, toggle, set, setAll } = useExpandedSections('zimai.dashboard.sections');

  const status = useMemo(() => evaluateCertification({ progress, submissions, results }), [progress, submissions, results]);
  const action = useMemo(
    () => nextRecommendedAction({ progress, submissions, results, certificates, assessments, status }),
    [progress, submissions, results, certificates, assessments, status],
  );
  const stats = useMemo(() => pathStats(progress), [progress]);
  const canReassess = useMemo(() => reassessEligibility(progress, submissions).eligible, [progress, submissions]);
  const streak = effectiveStreak(progress);
  const skillLevels = useMemo(() => trackedSkillLevels(progress), [progress]);
  const counts = levelCounts(skillLevels);
  const skillsTotal = Object.keys(skillLevels).length;
  const skillsAcquired = counts[2] + counts[3];
  const quiz = quizAccuracy(progress);
  const practicals = bestSubmissions(submissions);
  const lastActivity = progress?.activity?.[0];

  const firstName = (profile?.displayName || user?.name || '').trim().split(/\s+/)[0] || 'there';
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  const domain = getDomain(progress?.domainId)?.shortName;
  const allOpen = SECTION_IDS.every((id) => open[id]);

  const reveal = (id: SectionId) => {
    set(id, true);
    window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
  };

  const glance: { id: SectionId; label: string; value: ReactNode; icon: ReactNode }[] = [
    {
      id: 'readiness',
      label: 'AI readiness',
      value: latestAssessment ? `${latestAssessment.personalReadiness}%` : '—',
      icon: <Gauge className="h-4 w-4" />,
    },
    { id: 'learning', label: domain ? `${domain} path` : 'Learning path', value: progress ? `${stats.percent}%` : '—', icon: <MapIcon className="h-4 w-4" /> },
    { id: 'learning', label: 'Day streak', value: streak.current, icon: <Flame className="h-4 w-4" /> },
    { id: 'learning', label: 'Skills acquired', value: skillsTotal ? `${skillsAcquired}/${skillsTotal}` : '—', icon: <Layers className="h-4 w-4" /> },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      {/* Greeting */}
      <section className="flex flex-col gap-5 pt-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="mb-2 animate-ghost-in text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">{today}</p>
          <h1 className="text-4xl leading-[1] text-ink-950 sm:text-5xl">
            <GhostText text={`${greeting()}, *${firstName}.*`} accentClassName="italic text-brand-800" startOnView={false} />
          </h1>
        </div>
        <div className="animate-ghost-in" style={{ animationDelay: '200ms' }}>
          <Button to="/app/tutor" variant="outline" size="sm" icon={<Bot className="h-4 w-4" />}>
            Ask AI Tutor
          </Button>
        </div>
      </section>

      {/* The one thing to do next */}
      <Reveal className="mt-8" delay={120}>
        {progress ? <NextActionCard action={action} /> : <StartPathHero latest={latestAssessment} />}
      </Reveal>

      {/* At a glance — each number opens its detail */}
      <Reveal delay={220}>
        <ul className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {glance.map((g) => (
            <li key={g.label}>
              <button
                type="button"
                onClick={() => reveal(g.id)}
                className="group flex w-full items-center gap-3 rounded-2xl border border-ink-950/[0.08] bg-paper px-4 py-3.5 text-left transition hover:-translate-y-0.5 hover:border-ink-950 hover:shadow-ink-sm"
                aria-label={`${g.label}: ${typeof g.value === 'string' || typeof g.value === 'number' ? g.value : ''}. Show details`}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sand-200/80 text-ink-700 transition group-hover:bg-lilac-200 group-hover:text-ink-950">{g.icon}</span>
                <span className="min-w-0">
                  <span className="block font-display text-2xl leading-none tabular-nums text-ink-950">{g.value}</span>
                  <span className="mt-1 block truncate text-xs font-medium text-ink-500">{g.label}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </Reveal>

      {/* Details on demand */}
      <div className="mt-12 flex items-center justify-between gap-3">
        <p className="font-display text-lg italic text-ink-500 sm:text-xl">
          More detail<span className="hidden sm:inline">, when you want it</span>
        </p>
        <button
          type="button"
          onClick={() => setAll([...SECTION_IDS], !allOpen)}
          className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-semibold text-ink-600 transition hover:bg-ink-950/5 hover:text-ink-950"
        >
          {allOpen ? <ChevronsDownUp className="h-4 w-4" /> : <ChevronsUpDown className="h-4 w-4" />}
          {allOpen ? 'Collapse all' : 'Expand all'}
        </button>
      </div>

      <div className="mt-4 space-y-3">
        <ExpandableSection
          id="readiness"
          title="AI readiness"
          icon={<Gauge className="h-5 w-5" />}
          summary={latestAssessment ? `${latestAssessment.personalReadiness}% · ${latestAssessment.readinessLevel} · assessed ${timeAgo(latestAssessment.createdAt)}` : 'Not assessed yet'}
          open={!!open.readiness}
          onToggle={() => toggle('readiness')}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <ReadinessWidget latest={latestAssessment} initial={initialAssessment} canReassess={canReassess} />
            <FocusTip latest={latestAssessment} />
          </div>
        </ExpandableSection>

        <ExpandableSection
          id="learning"
          title="Learning & skills"
          icon={<MapIcon className="h-5 w-5" />}
          summary={progress ? `${stats.completed}/${stats.total} modules · ${streak.current}-day streak · ${skillsAcquired} skills acquired` : 'Your path starts after your assessment'}
          open={!!open.learning}
          onToggle={() => toggle('learning')}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <LearningProgressWidget progress={progress} />
            <StreakWidget progress={progress} />
            <SkillsAcquiredWidget progress={progress} />
            <MiniSkillsMap progress={progress} />
          </div>
        </ExpandableSection>

        <ExpandableSection
          id="practice"
          title="Practice & assessments"
          icon={<ClipboardCheck className="h-5 w-5" />}
          summary={`${practicals.length} practical${practicals.length === 1 ? '' : 's'} submitted · quiz accuracy ${quiz.total ? `${quiz.percent}%` : '—'}`}
          open={!!open.practice}
          onToggle={() => toggle('practice')}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <PracticalsWidget progress={progress} submissions={submissions} />
            <AssessmentWidget progress={progress} status={status} />
          </div>
        </ExpandableSection>

        <ExpandableSection
          id="certification"
          title="Certification"
          icon={<Award className="h-5 w-5" />}
          summary={
            status.achievableLevel
              ? `${LEVEL_META[status.achievableLevel].label} reached${status.nextLevel ? ` · next: ${LEVEL_META[status.nextLevel].label}` : ''}`
              : status.nextLevel
                ? `Working towards ${LEVEL_META[status.nextLevel].label}`
                : 'Your certification journey'
          }
          open={!!open.certification}
          onToggle={() => toggle('certification')}
        >
          <CertificationJourney status={status} certificates={certificates} />
        </ExpandableSection>

        <ExpandableSection
          id="activity"
          title="Activity & shortcuts"
          icon={<Activity className="h-5 w-5" />}
          summary={lastActivity ? `Last: ${lastActivity.label} · ${timeAgo(lastActivity.at)}` : 'Recent activity and quick links'}
          open={!!open.activity}
          onToggle={() => toggle('activity')}
        >
          <div className={cn('grid gap-4', 'lg:grid-cols-[1.4fr_1fr]')}>
            <ActivityFeed progress={progress} />
            <QuickLinks profile={profile} latest={latestAssessment} certificates={certificates} />
          </div>
        </ExpandableSection>
      </div>
    </div>
  );
}
