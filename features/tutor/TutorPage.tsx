import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Bot, Check, Eye, ShieldCheck, Sparkles } from 'lucide-react';
import { Badge, Card, CardTitle, Icon, PageHeader } from '../../components/ui';
import { GhostMascot, Sparkle } from '../../components/illustrations';
import { useApp } from '../../services/store';
import { getModule, moduleTitle, getDomain } from '../../data/catalog';
import { industryName } from '../../data/industries';
import { roleName } from '../../data/roles';
import { cn } from '../../lib/utils';
import { TutorPanel } from './TutorPanel';
import { PACE_META, sortedPath, useEnsureProgress } from '../learning/components/useLearning';
import { peekModuleContent } from '../learning/components/moduleContent';

export default function TutorPage() {
  const { profile, progress, latestAssessment } = useApp();
  useEnsureProgress();
  const [params, setParams] = useSearchParams();
  const domainId = progress?.domainId ?? profile?.domainId ?? 'operations';
  const items = sortedPath(progress);
  const requested = params.get('module') ?? '';
  const [moduleId, setModuleId] = useState<string>(() => (requested && getModule(requested) ? requested : ''));

  const select = (id: string) => {
    setModuleId(id);
    const next = new URLSearchParams(params);
    if (id) next.set('module', id);
    else next.delete('module');
    setParams(next, { replace: true });
  };

  const lessonTitle = useMemo(() => {
    if (!moduleId) return undefined;
    const current = progress?.modules[moduleId]?.currentLessonId;
    const content = peekModuleContent(moduleId, domainId);
    return content?.lessons.find((l) => l.id === current)?.title;
  }, [moduleId, progress, domainId]);

  const jobTitle = profile?.jobTitle || (profile ? roleName(profile.roleId, profile.roleOther) : '—');
  const options = [{ id: '', title: 'General', icon: 'Sparkles', status: undefined as string | undefined }].concat(
    items.map((i) => ({ id: i.moduleId, title: moduleTitle(i.moduleId, domainId), icon: getModule(i.moduleId)?.icon ?? 'BookOpen', status: progress?.modules[i.moduleId]?.status })),
  );
  if (moduleId && !options.some((o) => o.id === moduleId)) options.push({ id: moduleId, title: moduleTitle(moduleId, domainId), icon: getModule(moduleId)?.icon ?? 'BookOpen', status: undefined });

  return (
    <div className="animate-fade-in">
      <PageHeader
        eyebrow="Personal AI coach"
        title={
          <>
            AI <em>Tutor</em>
          </>
        }
        description={`Tailored to your work as ${/^[aeiou]/i.test(jobTitle) ? 'an' : 'a'} ${jobTitle}${profile ? ` in ${industryName(profile.industryId, profile.industryOther)}` : ''}.`}
      />

      {/* Mobile context selector */}
      <div className="no-scrollbar -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 lg:hidden">
        {options.map((o) => (
          <button
            key={o.id || 'general'}
            onClick={() => select(o.id)}
            className={cn(
              'inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-[13px] font-semibold transition',
              moduleId === o.id ? 'border-ink-950 bg-ink-950 text-canvas' : 'border-ink-950/15 bg-paper text-ink-700',
            )}
          >
            <Icon name={o.icon} className="h-3.5 w-3.5" />
            <span className="max-w-[180px] truncate">{o.title}</span>
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="hidden space-y-4 lg:block">
          <Card padded={false} className="animate-ghost-in rounded-3xl p-3">
            <p className="px-2 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-400">Tutor context</p>
            <div className="space-y-0.5">
              {options.map((o) => (
                <button
                  key={o.id || 'general'}
                  onClick={() => select(o.id)}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[13px] font-semibold transition',
                    moduleId === o.id ? 'bg-lilac-100 text-ink-950 ring-1 ring-inset ring-ink-950' : 'text-ink-600 hover:bg-ink-950/[0.04]',
                  )}
                >
                  <span className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-lg', moduleId === o.id ? 'bg-ink-950 text-canvas' : 'bg-sand-200 text-ink-500')}>
                    <Icon name={o.icon} className="h-3.5 w-3.5" />
                  </span>
                  <span className="min-w-0 flex-1 truncate">{o.title}</span>
                  {o.status === 'completed' && <Check className="h-3.5 w-3.5 shrink-0 text-brand-800" />}
                  {o.status === 'in-progress' && <span className="h-2 w-2 shrink-0 rounded-full bg-gold-400" title="In progress" />}
                </button>
              ))}
            </div>
          </Card>

          {knowsCard()}

          <Card className="relative animate-ghost-in overflow-hidden rounded-3xl border-ink-950 bg-lilac-200" style={{ animationDelay: '160ms' }}>
            <Sparkle className="absolute right-3 top-3 h-5 w-5" color="#1a1a1a" />
            <div className="flex items-start gap-3">
              <span className="h-10 w-10 shrink-0 animate-ghost-float" aria-hidden>
                <GhostMascot mood="wave" className="h-full w-full" />
              </span>
              <div className="text-sm text-ink-800">
                <p className="font-display text-xl leading-tight text-ink-950">Tip</p>
                <p className="mt-1">Say <strong>"Test my understanding"</strong> — the tutor asks one question, waits for your answer and then gives feedback.</p>
              </div>
            </div>
          </Card>
        </aside>

        <div className="min-w-0">
          <TutorPanel
            key={moduleId || 'general'}
            moduleId={moduleId || undefined}
            lessonTitle={lessonTitle}
            variant="page"
            className="h-[calc(100dvh-17rem)] min-h-[460px] lg:h-[calc(100vh-13rem)] lg:min-h-[560px]"
          />
          <div className="mt-4 lg:hidden">
            {knowsCard()}
          </div>
        </div>
      </div>
    </div>
  );

  function knowsCard() {
    const domain = getDomain(domainId);
    const rows: [string, string][] = [
      ['Role', jobTitle],
      ['Industry', profile ? industryName(profile.industryId, profile.industryOther) : '—'],
      ['Learning domain', domain?.name ?? '—'],
      ['AI readiness', latestAssessment ? `${latestAssessment.personalReadiness}% · ${latestAssessment.readinessLevel}` : '—'],
    ];
    return (
      <Card className="animate-ghost-in rounded-3xl" style={{ animationDelay: '80ms' }}>
        <CardTitle icon={<Eye className="h-4 w-4" />} title="What the tutor knows" subtitle="Used only to personalise answers" />
        <dl className="space-y-2 text-sm">
          {rows.map(([k, v]) => (
            <div key={k} className="flex items-start justify-between gap-3">
              <dt className="text-ink-500">{k}</dt>
              <dd className="text-right font-semibold text-ink-950">{v}</dd>
            </div>
          ))}
          {progress && (
            <div className="flex items-center justify-between gap-3">
              <dt className="text-ink-500">Pace</dt>
              <dd>
                <Badge tone={PACE_META[progress.pace].tone}>{PACE_META[progress.pace].label}</Badge>
              </dd>
            </div>
          )}
        </dl>
        <p className="mt-4 flex items-start gap-2 rounded-2xl bg-sand-200/60 p-3 text-xs leading-relaxed text-ink-500">
          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-800" />
          Don't paste personal or confidential information into the chat. Conversations are saved on this device only and you can clear them at any time.
        </p>
        {progress && progress.tutorQuestions > 0 && (
          <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-ink-500">
            <Bot className="h-3.5 w-3.5 text-brand-800" /> {progress.tutorQuestions} question{progress.tutorQuestions === 1 ? '' : 's'} asked so far
            <Sparkles className="h-3 w-3 text-gold-500" />
          </p>
        )}
      </Card>
    );
  }
}
