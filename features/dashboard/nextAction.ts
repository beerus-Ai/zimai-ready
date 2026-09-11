import type { ActivitySubmission, AssessmentResult, Certificate, EmployeeProgress, ReadinessAssessment } from '../../types';
import { moduleTitle } from '../../data/catalog';
import { getModuleContent } from '../../data/content';
import { evaluateCertification, LEVEL_META } from '../../lib/certification';
import type { CertificationStatus } from '../../lib/certification';
import { pathStats } from '../../lib/progress';
import { formatDate } from '../../lib/utils';
import { expiringCertificates } from './stats';

/**
 * "Next Recommended Action" engine — picks exactly ONE action, by priority:
 *  1. no learning path            → start the personalised path
 *  2. a struggling module         → extra practice on it
 *  3. a module in progress        → continue it
 *  4. completed module with an unsubmitted practical → do the practical
 *  5. ≥2 modules completed, no reassessment yet     → reassess readiness
 *  6. final assessment unlocked, not attempted      → final knowledge assessment
 *  7. capstone unlocked, not yet passed             → capstone
 *  8. achievable level without that certificate     → claim certificate
 *  9. certificate expiring within 60 days           → maintain readiness
 * 10. otherwise                                     → continue the next module
 */

export type NextActionKind =
  | 'start-path'
  | 'extra-practice'
  | 'continue-module'
  | 'practical'
  | 'reassess'
  | 'final'
  | 'capstone'
  | 'claim'
  | 'maintain'
  | 'next-module'
  | 'all-done';

export interface NextAction {
  kind: NextActionKind;
  eyebrow: string;
  title: string;
  description: string;
  cta: string;
  to: string;
  minutes?: number;
}

export function nextRecommendedAction(input: {
  progress: EmployeeProgress | null;
  submissions: ActivitySubmission[];
  results: AssessmentResult[];
  certificates: Certificate[];
  assessments: ReadinessAssessment[];
  status?: CertificationStatus;
}): NextAction {
  const { progress, submissions, results, certificates, assessments } = input;

  if (!progress || !progress.path.length)
    return {
      kind: 'start-path',
      eyebrow: 'Get started',
      title: 'Start your personalised learning path',
      description: 'Your Skills Prescription is ready. Turn it into a step-by-step pathway built around your role, gaps and goals.',
      cta: 'Start my learning path',
      to: '/app/learning',
    };

  const domain = progress.domainId;
  const title = (id: string) => moduleTitle(id, domain);
  const ordered = [...progress.path].sort((a, b) => a.priority - b.priority);
  const mod = (id: string) => progress.modules[id];

  const struggling = ordered.find((p) => mod(p.moduleId)?.struggling && mod(p.moduleId)?.status !== 'completed');
  if (struggling)
    return {
      kind: 'extra-practice',
      eyebrow: 'Extra practice',
      title: `Strengthen: ${title(struggling.moduleId)}`,
      description: 'A few lesson checks did not land yet. Revisit the tricky parts with extra examples before moving on — it pays off in the final assessment.',
      cta: 'Practise now',
      to: `/app/learning/${struggling.moduleId}`,
    };

  const inProgress = ordered.find((p) => mod(p.moduleId)?.status === 'in-progress');
  if (inProgress) {
    const m = mod(inProgress.moduleId)!;
    return {
      kind: 'continue-module',
      eyebrow: 'Pick up where you left off',
      title: `Continue: ${title(inProgress.moduleId)}`,
      description: inProgress.reason || `You have completed ${m.lessonsCompleted.length} lesson${m.lessonsCompleted.length === 1 ? '' : 's'} so far.`,
      cta: 'Continue learning',
      to: `/app/learning/${inProgress.moduleId}`,
    };
  }

  const pendingPractical = ordered.find((p) => {
    if (mod(p.moduleId)?.status !== 'completed') return false;
    const activity = getModuleContent(p.moduleId)?.activity;
    return activity && !submissions.some((s) => s.activityId === activity.id || s.moduleId === p.moduleId);
  });
  if (pendingPractical) {
    const activity = getModuleContent(pendingPractical.moduleId)!.activity!;
    return {
      kind: 'practical',
      eyebrow: 'Prove it in practice',
      title: activity.title,
      description: `Apply what you learnt in ${title(pendingPractical.moduleId)} to a realistic workplace scenario. Gemini gives rubric-based feedback — and it counts towards certification.`,
      cta: 'Start the practical',
      to: `/app/learning/${pendingPractical.moduleId}/activity`,
    };
  }

  const completedCount = Object.values(progress.modules).filter((m) => m.status === 'completed').length;
  const hasReassessment = assessments.some((a) => a.kind === 'reassessment');
  if (completedCount >= 2 && !hasReassessment)
    return {
      kind: 'reassess',
      eyebrow: 'Measure your growth',
      title: 'Reassess your AI readiness',
      description: `You have completed ${completedCount} modules since your first assessment. A 2-minute pulse check shows how much your readiness has moved.`,
      cta: 'Reassess my readiness',
      to: '/app/reassess',
    };

  const status = input.status ?? evaluateCertification({ progress, submissions, results });

  if (status.finalUnlocked && !results.some((r) => r.kind === 'final-knowledge'))
    return {
      kind: 'final',
      eyebrow: 'Certification',
      title: 'Take the final knowledge assessment',
      description: 'You have covered enough of your required learning to attempt the final assessment — the first step towards certification.',
      cta: 'Start assessment',
      to: '/app/assessments/final',
    };

  if (status.capstoneUnlocked && !results.some((r) => r.kind === 'capstone' && r.passed))
    return {
      kind: 'capstone',
      eyebrow: 'Certification',
      title: 'Complete your practical capstone',
      description: 'Show you can responsibly integrate AI into a real workflow. The capstone is the strongest evidence for AI Ready certification.',
      cta: 'Open capstone',
      to: '/app/assessments/capstone',
    };

  if (status.achievableLevel && !certificates.some((c) => c.level === status.achievableLevel && c.status !== 'revoked'))
    return {
      kind: 'claim',
      eyebrow: 'You have earned it',
      title: `Claim your ${LEVEL_META[status.achievableLevel].label} certificate`,
      description: 'You meet every requirement for this level. Issue your verifiable certificate and share it with employers.',
      cta: 'Claim certificate',
      to: '/app/assessments',
    };

  const expiring = expiringCertificates(certificates, 60)[0];
  if (expiring)
    return {
      kind: 'maintain',
      eyebrow: 'Keep your readiness current',
      title: `Renew your ${LEVEL_META[expiring.level].label} certification`,
      description: `Your certificate ${new Date(expiring.expiryDate).getTime() < Date.now() ? 'expired' : 'expires'} on ${formatDate(expiring.expiryDate)}. AI changes fast — a short refresher keeps it valid.`,
      cta: 'Maintain readiness',
      to: '/app/maintain',
    };

  const stats = pathStats(progress);
  if (stats.current)
    return {
      kind: 'next-module',
      eyebrow: 'Up next',
      title: title(stats.current.moduleId),
      description: stats.current.reason || 'The next module on your personalised pathway.',
      cta: 'Start module',
      to: `/app/learning/${stats.current.moduleId}`,
    };

  return {
    kind: 'all-done',
    eyebrow: 'Continuous upskilling',
    title: 'Keep your AI skills sharp',
    description: 'Your pathway is complete. Explore new AI techniques with your AI Tutor and keep your readiness current.',
    cta: 'Ask the AI Tutor',
    to: '/app/tutor',
  };
}
