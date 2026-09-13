import { useEffect, useMemo, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowRight, CircleCheck, ClipboardCheck, Copy, ExternalLink, EyeOff, Globe, Lock, UploadCloud, UserRound } from 'lucide-react';
import type { PublicSkillsProfile } from '../../types';
import { useApp } from '../../services/store';
import { Badge, Button, Card, CardTitle, EmptyState, PageHeader, Skeleton, useToast } from '../../components/ui';
import { nowISO, timeAgo } from '../../lib/utils';
import { ProfileView } from './ProfileView';
import { buildPublicProfile, sameSnapshot } from './profileSnapshot';
import { copyText, publicProfileUrl } from './cert-utils';
import { Reveal } from '../../components/motion';
import { MapPins } from '../../components/illustrations';

const INCLUDED = ['Name and professional headline', 'AI readiness level and score', 'Competency status with its evidence source', 'Demonstrated skill levels', 'Certificate summary and verification link'];
const NEVER = ['Assessment answers and question-level scores', 'Practical activity submissions', 'Email address and contact details', 'AI Tutor conversations'];

export default function SkillsProfilePage() {
  const { user, profile, latestAssessment, progress, certificates, results, submissions, publishPublic, lookupPublic } = useApp();
  const toast = useToast();
  const [published, setPublished] = useState<PublicSkillsProfile | null>(null);
  const [checking, setChecking] = useState(true);
  const [publishing, setPublishing] = useState(false);

  const snapshot = useMemo(
    () => (user ? buildPublicProfile({ user, profile, assessment: latestAssessment, progress, certificates, results, submissions }) : null),
    [user, profile, latestAssessment, progress, certificates, results, submissions],
  );

  const uid = user?.id;
  useEffect(() => {
    if (!uid) return;
    let alive = true;
    setChecking(true);
    lookupPublic<PublicSkillsProfile>('publicProfiles', uid)
      .then((p) => alive && setPublished(p))
      .catch(() => alive && setPublished(null))
      .finally(() => alive && setChecking(false));
    return () => {
      alive = false;
    };
  }, [uid, lookupPublic]);

  if (!user || !snapshot) return null;

  const link = publicProfileUrl(user.id);
  const upToDate = sameSnapshot(published, snapshot);
  const verified = snapshot.competencies.filter((c) => c.status === 'verified').length;
  const inProgress = snapshot.competencies.filter((c) => c.status === 'in-progress').length;
  const hasFoundation = Boolean(progress || latestAssessment);

  const publish = async () => {
    setPublishing(true);
    try {
      const snap: PublicSkillsProfile = { ...snapshot, updatedAt: nowISO() };
      await publishPublic('publicProfiles', user.id, snap);
      const first = !published;
      setPublished(snap);
      toast.success(first ? 'Public profile published' : 'Public profile updated', 'Anyone with your link can now view this snapshot.');
    } catch (e) {
      console.warn('[ZimAI] publish failed', e);
      toast.error('Could not publish your profile', 'Please try again in a moment.');
    } finally {
      setPublishing(false);
    }
  };

  const copy = async () => {
    const ok = await copyText(link);
    if (ok) toast.success('Profile link copied', 'Paste it into your CV, email signature or job application.');
    else toast.error('Could not copy the link', link);
  };

  const publishLabel = published ? (upToDate ? 'Profile up to date' : 'Update public profile') : 'Publish public profile';

  if (!hasFoundation) {
    return (
      <div>
        <PageHeader eyebrow="Share your skills" title={<>My AI skills <em>profile</em></>} />
        <EmptyState
          icon={<UserRound className="h-6 w-6" />}
          title="Your profile starts with your readiness assessment"
          description="Take the readiness assessment to start your verified profile."
          action={<Button to="/onboarding">Start my readiness assessment</Button>}
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Share your skills"
        title={<>My AI skills <em>profile</em></>}
        description="A verified, shareable snapshot of your AI competencies."
        actions={
          <>
          <MapPins animated className="pointer-events-none -my-6 mr-2 hidden h-28 w-28 animate-ghost-in lg:block" />
          <Button onClick={publish} loading={publishing} disabled={checking || upToDate} icon={upToDate ? <CircleCheck className="h-4 w-4" /> : <UploadCloud className="h-4 w-4" />}>
            {publishLabel}
          </Button>
          </>
        }
      />

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10">
        <Reveal className="min-w-0">
          {verified === 0 && (
            <div className="mb-6 flex flex-col gap-3 rounded-3xl border border-ink-950/10 bg-sand-100 p-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-start gap-2.5 text-sm text-ink-800">
                <span>
                  <strong>Just getting started.</strong> Pass modules, practicals and assessments to verify competencies.
                </span>
              </p>
              <Button to="/app/learning" size="sm" variant="dark" iconRight={<ArrowRight className="h-4 w-4" />}>
                Continue learning
              </Button>
            </div>
          )}
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">Live preview</p>
            {published && !upToDate && <Badge tone="gold">Unpublished changes</Badge>}
          </div>
          <ProfileView profile={snapshot} preview />
        </Reveal>

        <aside className="space-y-6 lg:sticky lg:top-6">
          <Reveal delay={80}>
          <Card className="rounded-3xl">
            <CardTitle icon={<Globe className="h-5 w-5" />} title="Public link" subtitle={published ? `Published ${timeAgo(published.updatedAt)}` : 'Private until you publish'} />
            {checking ? (
              <div className="space-y-2">
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
              </div>
            ) : published ? (
              <>
                <div className="flex items-center gap-2 rounded-xl border border-ink-950/10 bg-sand-100 px-3 py-2.5">
                  <span className="min-w-0 flex-1 truncate font-mono text-xs text-slate-700" title={link}>
                    {link}
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <Button size="sm" variant="outline" onClick={copy} icon={<Copy className="h-4 w-4" />}>
                    Copy
                  </Button>
                  <Button size="sm" variant="outline" href={link} icon={<ExternalLink className="h-4 w-4" />}>
                    Open
                  </Button>
                </div>
                <div className="mt-4 flex items-center gap-3 rounded-xl bg-sand-100 p-3">
                  <div className="shrink-0 rounded-lg bg-white p-1.5 ring-1 ring-ink-950/10">
                    <QRCodeSVG value={link} size={72} marginSize={0} level="M" fgColor="#1a1a1a" />
                  </div>
                  <p className="text-xs text-slate-500">Employers can scan this code to open your profile. {upToDate ? 'Your public snapshot is up to date.' : 'You have changes that are not yet published.'}</p>
                </div>
                {!upToDate && (
                  <Button full className="mt-3" onClick={publish} loading={publishing} icon={<UploadCloud className="h-4 w-4" />}>
                    Update public profile
                  </Button>
                )}
              </>
            ) : (
              <>
                <p className="text-sm text-slate-600">Publish a snapshot to get a shareable link for your CV, email signature or job applications. You can update it at any time.</p>
                <Button full className="mt-4" onClick={publish} loading={publishing} icon={<UploadCloud className="h-4 w-4" />}>
                  Publish public profile
                </Button>
              </>
            )}
          </Card>
          </Reveal>

          <Reveal delay={140}>
          <Card className="rounded-3xl">
            <CardTitle icon={<Lock className="h-5 w-5" />} title="What employers see" />
            <ul className="space-y-2">
              {INCLUDED.map((t) => (
                <li key={t} className="flex items-start gap-2 text-sm text-slate-700">
                  <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                  {t}
                </li>
              ))}
            </ul>
            <p className="mb-2 mt-4 text-xs font-bold uppercase tracking-wider text-slate-400">Never shared</p>
            <ul className="space-y-2">
              {NEVER.map((t) => (
                <li key={t} className="flex items-start gap-2 text-sm text-slate-500">
                  <EyeOff className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  {t}
                </li>
              ))}
            </ul>
          </Card>
          </Reveal>

          <Reveal delay={200}>
          <Card className="rounded-3xl bg-lilac-50">
            <CardTitle icon={<ClipboardCheck className="h-5 w-5" />} title="Strengthen your profile" />
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { label: 'Verified', value: verified, cls: 'text-brand-800' },
                { label: 'In progress', value: inProgress, cls: 'text-gold-700' },
                { label: 'Not started', value: snapshot.competencies.length - verified - inProgress, cls: 'text-slate-500' },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl border border-ink-950/5 bg-paper px-2 py-3">
                  <p className={`font-display text-4xl font-medium leading-none tabular-nums ${s.cls}`}>{s.value}</p>
                  <p className="text-[11px] font-semibold text-slate-500">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button to="/app/learning" size="sm" variant="secondary">
                Learning path
              </Button>
              <Button to="/app/assessments" size="sm" variant="outline">
                Assessments
              </Button>
            </div>
          </Card>
          </Reveal>
        </aside>
      </div>
    </div>
  );
}
