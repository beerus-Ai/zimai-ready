import { useEffect, useMemo, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowRight, CircleCheck, ClipboardCheck, Copy, ExternalLink, EyeOff, Globe, Lock, Sparkles, UploadCloud, UserRound } from 'lucide-react';
import type { PublicSkillsProfile } from '../../types';
import { useApp } from '../../services/store';
import { Badge, Button, Card, CardTitle, EmptyState, PageHeader, Skeleton, useToast } from '../../components/ui';
import { nowISO, timeAgo } from '../../lib/utils';
import { ProfileView } from './ProfileView';
import { buildPublicProfile, sameSnapshot } from './profileSnapshot';
import { copyText, publicProfileUrl } from './cert-utils';

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
        <PageHeader eyebrow="Share your skills" title="My AI Skills Profile" />
        <EmptyState
          icon={<UserRound className="h-6 w-6" />}
          title="Your profile starts with your readiness assessment"
          description="Complete the AI readiness assessment to create your learning path. Your profile then fills with verified competencies as you learn, practise and pass assessments."
          action={<Button to="/onboarding">Start my readiness assessment</Button>}
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Share your skills"
        title="My AI Skills Profile"
        description="A verified, shareable snapshot of your AI competencies — built from evidence, not self-assessment."
        actions={
          <Button onClick={publish} loading={publishing} disabled={checking || upToDate} icon={upToDate ? <CircleCheck className="h-4 w-4" /> : <UploadCloud className="h-4 w-4" />}>
            {publishLabel}
          </Button>
        }
      />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0">
          {verified === 0 && (
            <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-gold-200 bg-gold-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-start gap-2.5 text-sm text-gold-900">
                <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-gold-600" />
                <span>
                  <strong>Your profile is just getting started.</strong> Complete modules, practical activities and assessments to turn competencies from "in progress" into "verified".
                </span>
              </p>
              <Button to="/app/learning" size="sm" variant="dark" iconRight={<ArrowRight className="h-4 w-4" />}>
                Continue learning
              </Button>
            </div>
          )}
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Live preview</p>
            {published && !upToDate && <Badge tone="gold">Unpublished changes</Badge>}
          </div>
          <ProfileView profile={snapshot} preview />
        </div>

        <aside className="space-y-4 lg:sticky lg:top-6">
          <Card>
            <CardTitle icon={<Globe className="h-5 w-5" />} title="Public link" subtitle={published ? `Published ${timeAgo(published.updatedAt)}` : 'Private until you publish'} />
            {checking ? (
              <div className="space-y-2">
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
              </div>
            ) : published ? (
              <>
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
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
                <div className="mt-4 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                  <div className="shrink-0 rounded-lg bg-white p-1.5 ring-1 ring-slate-200">
                    <QRCodeSVG value={link} size={72} marginSize={0} level="M" fgColor="#0b1220" />
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

          <Card>
            <CardTitle icon={<Lock className="h-5 w-5" />} title="What employers see" subtitle="Only this snapshot — nothing else." />
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

          <Card>
            <CardTitle icon={<ClipboardCheck className="h-5 w-5" />} title="Strengthen your profile" />
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { label: 'Verified', value: verified, cls: 'text-brand-700' },
                { label: 'In progress', value: inProgress, cls: 'text-gold-700' },
                { label: 'Not started', value: snapshot.competencies.length - verified - inProgress, cls: 'text-slate-500' },
              ].map((s) => (
                <div key={s.label} className="rounded-xl bg-slate-50 px-2 py-3">
                  <p className={`text-xl font-extrabold tabular-nums ${s.cls}`}>{s.value}</p>
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
        </aside>
      </div>
    </div>
  );
}
