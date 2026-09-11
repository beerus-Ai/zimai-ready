import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, Award, BadgeCheck, Building2, CircleCheck, Circle, ClipboardCheck, FastForward, FlaskConical, Lock, Route,
  ShieldCheck, Sparkles, Trophy, Wrench, CircleX,
} from 'lucide-react';
import { Badge, Button, Card, CardTitle, EmptyState, Modal, PageHeader, ProgressBar, useToast } from '../../components/ui';
import { useApp } from '../../services/store';
import { CERT_RULES } from '../../config';
import {
  buildCertificate, CERT_TYPE_META, certificateState, checkEmployerCompetencies, evaluateCertification, isEmployerReadyEligible,
  LEVEL_META, LEVEL_ORDER,
} from '../../lib/certification';
import { emptyModuleProgress, raiseSkills, recordActivity } from '../../lib/progress';
import { SKILL_LEVEL_LABELS } from '../../lib/readiness';
import { getDomain, getModule, moduleTitle } from '../../data/catalog';
import { cn, formatDate, nowISO, seededRandom, uid } from '../../lib/utils';
import type { ActivitySubmission, Certificate, CertificationLevel, DomainId, EmployeeProgress } from '../../types';
import { Fact, LevelLadder, PrincipleBanner } from './assessment-components';

const rank = (l: CertificationLevel | null | undefined) => (l ? LEVEL_META[l].rank : 0);
const highest = (cs: Certificate[]) => cs.reduce<Certificate | null>((best, c) => (!best || rank(c.level) > rank(best.level) ? c : best), null);

// ───────────────────────────── Demo fast-forward helpers ─────────────────────────────

function fastForwardProgress(prev: EmployeeProgress): EmployeeProgress {
  const rng = seededRandom(`ff:${prev.userId}`);
  const ids = new Set(prev.path.filter((p) => p.required).map((p) => p.moduleId));
  ['core-fundamentals', 'core-responsible'].forEach((id) => ids.add(id)); // AI Aware checks these explicitly
  const modules = { ...prev.modules };
  const skills: string[] = [];
  let n = 0;
  ids.forEach((id) => {
    const meta = getModule(id);
    if (!meta) return;
    skills.push(...meta.skillIds);
    const existing = modules[id] ?? emptyModuleProgress(id);
    if (existing.status === 'completed') return;
    const lessons = meta.kind === 'core' ? 3 : meta.kind === 'domain' ? 2 : 1;
    const mastery = 70 + Math.floor(rng() * 23); // 70–92
    const quizTotal = lessons * 2;
    const quizCorrect = Math.max(1, Math.round((quizTotal * mastery) / 100));
    const { currentLessonId: _drop, ...rest } = existing;
    const completedAt = new Date(Date.now() - (ids.size - n) * 3600_000).toISOString();
    modules[id] = {
      ...rest,
      moduleId: id,
      status: 'completed',
      lessonsCompleted: Array.from({ length: lessons }, (_, k) => `${id}-l${k + 1}`),
      quizCorrect,
      quizTotal,
      struggling: false,
      mastery,
      startedAt: existing.startedAt ?? completedAt,
      completedAt,
      minutesSpent: Math.max(existing.minutesSpent, meta.estimatedMinutes),
    };
    n++;
  });
  return raiseSkills(recordActivity({ ...prev, modules }, 'path', 'Demo fast-forward: required learning modules marked complete'), skills, 2);
}

function demoSubmission(userId: string, domainId: DomainId, moduleId: string, score: 78 | 81): ActivitySubmission {
  const title = moduleTitle(moduleId, domainId);
  const crit =
    score === 78
      ? [
          { criterion: 'Correct use of AI', score: 20, max: 25, comment: 'Clear, well-structured prompt with useful context and a defined output format.' },
          { criterion: 'Verification', score: 19, max: 25, comment: 'You checked the key figures against the source; also verify the AI’s stated assumptions.' },
          { criterion: 'Data handling & privacy', score: 16, max: 20, comment: 'Good anonymisation before using AI; say which approved tool you would use.' },
          { criterion: 'Quality of output', score: 23, max: 30, comment: 'Practical and relevant — add a clearer recommendation and owner.' },
        ]
      : [
          { criterion: 'Correct use of AI', score: 21, max: 25, comment: 'Effective use of AI for drafting and analysis, with sensible limits on what it decides.' },
          { criterion: 'Verification', score: 21, max: 25, comment: 'Strong — you caught an incorrect AI conclusion and corrected it with evidence.' },
          { criterion: 'Data handling & privacy', score: 17, max: 20, comment: 'Personal data was removed and human sign-off was kept for decisions affecting people.' },
          { criterion: 'Quality of output', score: 22, max: 30, comment: 'A well-reasoned output; tighten the executive summary.' },
        ];
  return {
    id: uid('sub-'),
    userId,
    moduleId,
    activityId: `${moduleId}-activity`,
    answer: `(Demo fast-forward sample answer — ${title}) I used AI to produce a first draft from anonymised data, checked every figure and claim against the source material, corrected the errors I found and added a recommendation for human review before anything was shared.`,
    feedback: {
      score,
      verdict: 'good',
      overall:
        score === 78
          ? 'A solid, practical submission. You used AI deliberately and verified its main outputs. Strengthen how you document assumptions and who approves the final result.'
          : 'A strong submission that shows real verification habits — you challenged the AI rather than accepting it. Keep making your recommendations specific and owned.',
      criteria: crit,
      strengths: ['Anonymised data before using AI', 'Verified AI output against the source', 'Kept a human accountable for the final decision'],
      improvements: ['State assumptions explicitly', 'Add a clear owner and timeline to your recommendation'],
    },
    createdAt: nowISO(),
    source: 'engine',
  };
}

// ───────────────────────────── Page ─────────────────────────────

export default function AssessmentsHub() {
  const { user, progress, submissions, results, certificates, organisation, saveProgress, addSubmission, addCertificate } = useApp();
  const toast = useToast();
  const navigate = useNavigate();
  const status = useMemo(() => evaluateCertification({ progress, submissions, results }), [progress, submissions, results]);
  const [claiming, setClaiming] = useState<'domain' | 'employer' | null>(null);
  const [ffOpen, setFfOpen] = useState(false);
  const [ffBusy, setFfBusy] = useState(false);

  if (!user) return null;

  const header = (
    <PageHeader
      eyebrow="Stage 3 · Certify"
      title="Competency Assessment & Certification"
      description="Prove what you can do. Certificates are earned through a knowledge assessment, practical workplace activities and a profession-specific capstone."
    />
  );

  if (!progress) {
    return (
      <div className="animate-fade-up">
        {header}
        <PrincipleBanner className="mb-6" />
        <EmptyState
          icon={<Route className="h-6 w-6" />}
          title="Start your learning path first"
          description="Complete your AI readiness assessment and begin your personalised learning path. Assessments unlock as you build and practise your skills."
          action={
            <Button to="/app/learning" iconRight={<ArrowRight className="h-4 w-4" />}>
              Go to my learning path
            </Button>
          }
        />
      </div>
    );
  }

  const domain = getDomain(progress.domainId);
  const valid = certificates.filter((c) => certificateState(c) === 'valid');
  const domainCerts = valid.filter((c) => c.type === 'domain');
  const heldHere = highest(domainCerts.filter((c) => c.domainId === progress.domainId));
  const bestDomainCert = highest(domainCerts);
  const achievable = status.achievableLevel;
  const canClaim = !!achievable && rank(heldHere?.level) < rank(achievable);

  const finalAttempts = results.filter((r) => r.kind === 'final-knowledge');
  const capAttempts = results.filter((r) => r.kind === 'capstone');
  const k = status.bestKnowledge?.score;
  const c = status.bestCapstone?.score;
  const unlockTarget = Math.max(1, Math.min(Math.ceil(status.requiredTotal / 2), 3));

  const competencies = organisation?.requiredCompetencies ?? [];
  const checks = competencies.length ? checkEmployerCompetencies(progress.skillLevels, competencies) : [];
  const employerEligible = isEmployerReadyEligible(bestDomainCert?.level ?? null, checks);
  const heldEmployer = organisation ? valid.find((x) => x.type === 'employer' && x.organisationId === organisation.id) : undefined;

  const requiredIds = progress.path.filter((p) => p.required).map((p) => p.moduleId);
  const ffDone = requiredIds.length > 0 && requiredIds.every((id) => progress.modules[id]?.status === 'completed') && status.practicalsCompleted >= CERT_RULES.minPracticalActivities;

  async function claimDomain(level: CertificationLevel) {
    if (!user || !progress) return;
    setClaiming('domain');
    try {
      const cert = buildCertificate({ user, progress, status, level });
      await addCertificate(cert);
      const label = `Earned ${LEVEL_META[level].label} certificate — ${domain?.name ?? progress.domainId}`;
      if (level === 'AI_READY') {
        const skillIds = [
          ...new Set([
            ...progress.path.flatMap((p) => getModule(p.moduleId)?.skillIds ?? []),
            ...cert.competencies.map((x) => x.skillId).filter((s): s is string => Boolean(s)),
          ]),
        ];
        await saveProgress((prev) => raiseSkills(recordActivity(prev ?? progress, 'certificate', label), skillIds, 3));
      } else {
        await saveProgress((prev) => recordActivity(prev ?? progress, 'certificate', label));
      }
      toast.success(`${LEVEL_META[level].label} certificate issued`, 'Your verifiable certificate is ready to share.');
      navigate(`/app/certificates/${cert.id}`);
    } catch {
      toast.error('Could not issue your certificate', 'Please check your connection and try again.');
      setClaiming(null);
    }
  }

  async function claimEmployer() {
    if (!user || !progress || !organisation || !bestDomainCert) return;
    setClaiming('employer');
    try {
      const cert = buildCertificate({ user, progress, status, level: bestDomainCert.level, type: 'employer', organisation });
      await addCertificate(cert);
      await saveProgress((prev) => recordActivity(prev ?? progress, 'certificate', `Earned Employer AI Ready certificate — ${organisation.name}`));
      toast.success('Employer AI Ready certificate issued', `Verified against ${organisation.name}’s required competencies.`);
      navigate(`/app/certificates/${cert.id}`);
    } catch {
      toast.error('Could not issue your certificate', 'Please check your connection and try again.');
      setClaiming(null);
    }
  }

  async function applyFastForward() {
    if (!user || !progress) return;
    setFfBusy(true);
    try {
      await saveProgress((prev) => fastForwardProgress(prev ?? progress));
      const d = getDomain(progress.domainId);
      if (d) {
        const targets: [string, 78 | 81][] = [
          [d.moduleIds[0], 78],
          [d.moduleIds[3], 81],
        ];
        for (const [moduleId, score] of targets) {
          const activityId = `${moduleId}-activity`;
          if (submissions.some((s) => s.activityId === activityId && s.feedback.score >= 60)) continue;
          await addSubmission(demoSubmission(user.id, progress.domainId, moduleId, score));
        }
      }
      toast.success('Demo fast-forward applied', 'Required modules are complete — you can now take the final assessment live.');
      setFfOpen(false);
    } catch {
      toast.error('Fast-forward failed', 'Please try again.');
    } finally {
      setFfBusy(false);
    }
  }

  return (
    <div className="animate-fade-up space-y-6">
      {header}
      <PrincipleBanner />

      {/* Claim banner */}
      {canClaim && achievable && (
        <div className="relative overflow-hidden rounded-3xl bg-ink-950 p-6 text-white shadow-lift sm:p-8">
          <div className="bg-grid-dark absolute inset-0 opacity-60" />
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-40 blur-3xl" style={{ background: LEVEL_META[achievable].color }} />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <Badge tone="white" icon={<Sparkles className="h-3 w-3" />}>
                Competency demonstrated
              </Badge>
              <h2 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">You have earned {LEVEL_META[achievable].label}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300">
                {LEVEL_META[achievable].description} Your certificate will record the evidence — knowledge {k ?? 0}%, capstone {c ?? 0}%, responsible AI {status.responsibleAIScore}% and {status.practicalsCompleted} practical
                {status.practicalsCompleted === 1 ? '' : 's'} — and is valid for 12 months.
              </p>
            </div>
            <Button variant="gold" size="lg" className="shrink-0" loading={claiming === 'domain'} icon={<Award className="h-5 w-5" />} onClick={() => claimDomain(achievable)}>
              Claim your {LEVEL_META[achievable].label} certificate
            </Button>
          </div>
        </div>
      )}

      {/* Level ladder */}
      <Card>
        <CardTitle
          icon={<Trophy className="h-5 w-5" />}
          title="Your certification journey"
          subtitle={`${domain?.name ?? ''} · ${domain?.competency ?? ''}`}
          action={
            heldHere ? (
              <Button variant="outline" size="sm" to={`/app/certificates/${heldHere.id}`} icon={<BadgeCheck className="h-4 w-4" />}>
                View certificate
              </Button>
            ) : undefined
          }
        />
        <LevelLadder status={status} heldLevel={heldHere?.level ?? null} />
        {heldHere && (
          <p className="mt-4 flex items-center gap-2 text-sm text-slate-600">
            <BadgeCheck className="h-4 w-4 text-brand-600" />
            You hold <strong className="font-semibold text-ink-950">{LEVEL_META[heldHere.level].label}</strong> — valid until {formatDate(heldHere.expiryDate)}.
          </p>
        )}
        {!heldHere && !achievable && status.nextLevel && (
          <p className="mt-4 text-sm text-slate-600">
            Next milestone: <strong className="font-semibold text-ink-950">{LEVEL_META[status.nextLevel].label}</strong> — see the requirements below.
          </p>
        )}
      </Card>

      {/* Assessment stages */}
      <div className="grid gap-5 md:grid-cols-2">
        <StageCard
          icon={<ClipboardCheck className="h-5 w-5" />}
          title="Final Knowledge Assessment"
          subtitle="10 scenario questions · ~12 minutes"
          state={!status.finalUnlocked ? 'locked' : (k ?? 0) >= CERT_RULES.knowledgePassMark ? 'done' : 'open'}
          footer={
            status.finalUnlocked ? (
              <Button to="/app/assessments/final" full variant={(k ?? 0) >= CERT_RULES.knowledgePassMark ? 'outline' : 'primary'} iconRight={<ArrowRight className="h-4 w-4" />}>
                {finalAttempts.length ? 'Retake assessment' : 'Start assessment'}
              </Button>
            ) : (
              <Button to="/app/learning" full variant="outline" iconRight={<ArrowRight className="h-4 w-4" />}>
                Continue learning
              </Button>
            )
          }
        >
          {status.finalUnlocked ? (
            <dl className="grid grid-cols-3 gap-2">
              <Fact label="Best score" value={k != null ? `${k}%` : '—'} />
              <Fact label="Attempts" value={finalAttempts.length} />
              <Fact label="Pass mark" value={`${CERT_RULES.knowledgePassMark}%`} />
            </dl>
          ) : (
            <div>
              <p className="text-slate-600">Unlocks when you complete at least half of your required modules (or three of them). Tests knowledge, tool use, domain application, critical thinking, responsible AI and verification.</p>
              <ProgressBar className="mt-3" value={(status.requiredCompleted / unlockTarget) * 100} label="Progress to unlock" showValue tone="gold" />
              <p className="mt-1.5 text-xs text-slate-500">
                {status.requiredCompleted}/{status.requiredTotal} required modules completed
              </p>
            </div>
          )}
        </StageCard>

        <StageCard
          icon={<Wrench className="h-5 w-5" />}
          title="Practical Capstone"
          subtitle={`${domain?.shortName ?? 'Profession'}-specific workplace scenario`}
          state={!status.capstoneUnlocked ? 'locked' : (c ?? 0) >= CERT_RULES.capstonePassMark ? 'done' : 'open'}
          footer={
            status.capstoneUnlocked ? (
              <Button to="/app/assessments/capstone" full variant={(c ?? 0) >= CERT_RULES.capstonePassMark ? 'outline' : 'primary'} iconRight={<ArrowRight className="h-4 w-4" />}>
                {capAttempts.length ? 'Revise & resubmit' : 'Open capstone brief'}
              </Button>
            ) : status.finalUnlocked ? (
              <Button to="/app/assessments/final" full variant="outline" iconRight={<ArrowRight className="h-4 w-4" />}>
                Take the final assessment
              </Button>
            ) : undefined
          }
        >
          {status.capstoneUnlocked ? (
            <dl className="grid grid-cols-3 gap-2">
              <Fact label="Best score" value={c != null ? `${c}%` : '—'} />
              <Fact label="Submissions" value={capAttempts.length} />
              <Fact label="Pass mark" value={`${CERT_RULES.capstonePassMark}%`} />
            </dl>
          ) : (
            <div>
              <p className="text-slate-600">
                Unlocks when you score at least {CERT_RULES.awareKnowledgeMark}% in the final knowledge assessment. You will solve a realistic {domain?.shortName ?? ''} scenario with AI — and show how you verified it.
              </p>
              <ProgressBar className="mt-3" value={((k ?? 0) / CERT_RULES.awareKnowledgeMark) * 100} label="Progress to unlock" showValue tone="gold" />
            </div>
          )}
        </StageCard>

        <StageCard
          icon={<Route className="h-5 w-5" />}
          title="Practical workplace activities"
          subtitle="Completed during your learning path"
          state={status.practicalsCompleted >= CERT_RULES.minPracticalActivities ? 'done' : 'open'}
          footer={
            <Button to="/app/learning" full variant="outline" iconRight={<ArrowRight className="h-4 w-4" />}>
              {status.practicalsCompleted >= CERT_RULES.minPracticalActivities ? 'View learning path' : 'Find activities in my path'}
            </Button>
          }
        >
          <ProgressBar
            value={(status.practicalsCompleted / CERT_RULES.minPracticalActivities) * 100}
            label={`${Math.min(status.practicalsCompleted, 99)}/${CERT_RULES.minPracticalActivities} passed (score ≥ 60%)`}
            showValue
          />
          <p className="mt-3 text-slate-600">
            {status.practicalsCompleted ? `Average practical score: ${status.practicalAverage}%. ` : ''}AI Ready requires at least {CERT_RULES.minPracticalActivities} passed practical activities — real workplace tasks assessed against a rubric.
          </p>
        </StageCard>

        <StageCard
          icon={<ShieldCheck className="h-5 w-5" />}
          title="Responsible AI competency"
          subtitle={`Required: ${CERT_RULES.responsibleAIPassMark}% or more`}
          state={status.requirements.find((r) => r.id === 'ready-responsible')?.met ? 'done' : 'open'}
        >
          <ProgressBar value={status.responsibleAIScore} label="Responsible AI score" showValue tone={status.responsibleAIScore >= CERT_RULES.responsibleAIPassMark ? 'brand' : 'gold'} />
          <dl className="mt-3 grid grid-cols-2 gap-2">
            <Fact label="Knowledge assessment" value={status.bestKnowledge?.responsibleAIScore != null ? `${status.bestKnowledge.responsibleAIScore}%` : '—'} />
            <Fact label="Capstone" value={status.bestCapstone?.responsibleAIScore != null ? `${status.bestCapstone.responsibleAIScore}%` : '—'} />
          </dl>
          <p className="mt-3 text-xs leading-relaxed text-slate-500">
            Averaged across your best final assessment (responsible AI and verification questions) and your capstone safeguards. Until both are complete, only half counts.
          </p>
        </StageCard>
      </div>

      {/* Requirements checklist */}
      <Card>
        <CardTitle icon={<CircleCheck className="h-5 w-5" />} title="Requirements checklist" subtitle="Each level requires all of its own requirements and those of the levels below." />
        <div className="grid gap-6 lg:grid-cols-3">
          {LEVEL_ORDER.map((lvl) => {
            const reqs = status.requirements.filter((r) => r.level === lvl);
            const met = reqs.filter((r) => r.met).length;
            return (
              <section key={lvl}>
                <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-sm font-extrabold tracking-wide" style={{ color: LEVEL_META[lvl].color }}>
                    {LEVEL_META[lvl].label.toUpperCase()}
                  </h4>
                  <span className="text-xs font-semibold tabular-nums text-slate-500">
                    {met}/{reqs.length}
                  </span>
                </div>
                <ul className="space-y-3.5">
                  {reqs.map((r) => (
                    <li key={r.id} className="flex gap-2.5">
                      {r.met ? <CircleCheck className="mt-0.5 h-[18px] w-[18px] shrink-0 text-brand-600" /> : <Circle className="mt-0.5 h-[18px] w-[18px] shrink-0 text-slate-300" />}
                      <div className="min-w-0 flex-1">
                        <p className={cn('text-sm font-semibold leading-snug', r.met ? 'text-ink-950' : 'text-slate-700')}>{r.label}</p>
                        <p className="text-xs text-slate-500">{r.detail}</p>
                        {!r.met && <ProgressBar value={r.progress} size="xs" className="mt-1.5" color={LEVEL_META[lvl].color} />}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </Card>

      {/* Employer AI Ready */}
      {organisation && competencies.length > 0 && (
        <Card>
          <CardTitle
            icon={<Building2 className="h-5 w-5" />}
            title={`Employer AI Ready — ${organisation.name}`}
            subtitle="Measured against the AI competencies your employer requires."
            action={
              heldEmployer ? (
                <Button variant="outline" size="sm" to={`/app/certificates/${heldEmployer.id}`} icon={<BadgeCheck className="h-4 w-4" />}>
                  View
                </Button>
              ) : undefined
            }
          />
          <div className="mb-5 grid gap-3 sm:grid-cols-2">
            {(['domain', 'employer'] as const).map((t) => (
              <div key={t} className={cn('rounded-xl border p-4', t === 'employer' ? 'border-violet-200 bg-violet-50/50' : 'border-brand-200 bg-brand-50/50')}>
                <p className="text-sm font-bold text-ink-950">{CERT_TYPE_META[t].label}</p>
                <p className="mt-1 text-[13px] leading-snug text-slate-600">{CERT_TYPE_META[t].description}</p>
              </div>
            ))}
          </div>

          <div className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="py-2.5 pr-3">Competency</th>
                  <th className="py-2.5 pr-3">Priority</th>
                  <th className="py-2.5 pr-3">Required</th>
                  <th className="py-2.5 pr-3">Your level</th>
                  <th className="py-2.5 text-right">Met</th>
                </tr>
              </thead>
              <tbody>
                {checks.map((ch) => (
                  <tr key={ch.competency.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-3 pr-3 align-top">
                      <p className="font-semibold text-ink-950">{ch.competency.name}</p>
                      <p className="text-xs text-slate-500">{ch.competency.description}</p>
                    </td>
                    <td className="py-3 pr-3 align-top">
                      <Badge tone={ch.competency.priority === 'critical' ? 'clay' : ch.competency.priority === 'important' ? 'gold' : 'neutral'}>{ch.competency.priority}</Badge>
                    </td>
                    <td className="py-3 pr-3 align-top text-slate-700">{SKILL_LEVEL_LABELS[ch.competency.requiredLevel]}</td>
                    <td className="py-3 pr-3 align-top text-slate-700">{SKILL_LEVEL_LABELS[ch.actual]}</td>
                    <td className="py-3 text-right align-top">
                      {ch.met ? <CircleCheck className="ml-auto h-5 w-5 text-brand-600" aria-label="Met" /> : <CircleX className="ml-auto h-5 w-5 text-slate-300" aria-label="Not yet met" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-5 flex flex-col gap-3 rounded-xl bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-600">
              {heldEmployer
                ? `You hold the Employer AI Ready certificate for ${organisation.name}, valid until ${formatDate(heldEmployer.expiryDate)}.`
                : employerEligible
                  ? 'You meet every critical and important competency and hold a Domain certificate of AI Capable or above.'
                  : `Requires a Domain certificate of AI Capable or above${bestDomainCert ? '' : ' (not yet held)'} and every critical and important competency met.`}
            </p>
            {!heldEmployer && employerEligible && (
              <Button className="shrink-0" loading={claiming === 'employer'} icon={<Award className="h-4 w-4" />} onClick={claimEmployer}>
                Claim Employer AI Ready certificate
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Demo accelerator */}
      {user.isDemo && (
        <div className="rounded-2xl border border-dashed border-gold-300 bg-gold-50/40 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-100 text-gold-800">
                <FlaskConical className="h-5 w-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-bold text-ink-950">Demo fast-forward</p>
                  <Badge tone="gold">Demo profiles only</Badge>
                </div>
                <p className="mt-1 max-w-2xl text-sm text-slate-600">
                  For live presentations: marks your required learning modules as complete and adds two passed practical activities. It never passes an assessment for you — the final assessment and capstone must still be taken.
                </p>
              </div>
            </div>
            <Button variant="outline" className="shrink-0" disabled={ffDone} icon={<FastForward className="h-4 w-4" />} onClick={() => setFfOpen(true)}>
              {ffDone ? 'Already applied' : 'Fast-forward learning'}
            </Button>
          </div>
        </div>
      )}

      <Modal
        open={ffOpen}
        onClose={() => !ffBusy && setFfOpen(false)}
        title="Fast-forward this demo profile?"
        description="This is a presentation shortcut for demo profiles only."
        footer={
          <>
            <Button variant="ghost" disabled={ffBusy} onClick={() => setFfOpen(false)}>
              Cancel
            </Button>
            <Button loading={ffBusy} icon={<FastForward className="h-4 w-4" />} onClick={applyFastForward}>
              Apply fast-forward
            </Button>
          </>
        }
      >
        <ul className="space-y-2.5 text-sm text-slate-600">
          <li className="flex gap-2">
            <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" /> Marks all {requiredIds.length} required modules on your path as completed, with realistic mastery scores.
          </li>
          <li className="flex gap-2">
            <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" /> Adds two passed practical activities (78% and 81%) if they are missing.
          </li>
          <li className="flex gap-2">
            <Lock className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" /> Does <strong className="font-semibold text-ink-950">not</strong> award any certificate — you still need to pass the final assessment and capstone live.
          </li>
        </ul>
      </Modal>
    </div>
  );
}

function StageCard({ icon, title, subtitle, state, children, footer }: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  state: 'locked' | 'open' | 'done';
  children: ReactNode;
  footer?: ReactNode;
}) {
  const badge = state === 'locked' ? { tone: 'neutral' as const, label: 'Locked' } : state === 'done' ? { tone: 'brand' as const, label: 'Passed' } : { tone: 'gold' as const, label: 'Available' };
  return (
    <Card className={cn('flex flex-col', state === 'locked' && 'bg-slate-50/70')}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', state === 'done' ? 'bg-brand-600 text-white' : state === 'locked' ? 'bg-slate-200/70 text-slate-500' : 'bg-brand-50 text-brand-700')}>
            {state === 'locked' ? <Lock className="h-5 w-5" /> : icon}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold leading-tight text-ink-950">{title}</h3>
            <p className="mt-0.5 text-[13px] text-slate-500">{subtitle}</p>
          </div>
        </div>
        <Badge tone={badge.tone}>{badge.label}</Badge>
      </div>
      <div className="mt-4 flex-1 text-sm">{children}</div>
      {footer && <div className="mt-5">{footer}</div>}
    </Card>
  );
}
