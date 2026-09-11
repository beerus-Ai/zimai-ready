import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowRight, Building2, Globe, Link2, Lock, PencilLine, ShieldCheck, Sparkles, UserX } from 'lucide-react';
import type { PublicSkillsProfile } from '../../types';
import { useApp } from '../../services/store';
import { localDb } from '../../services/backend';
import { DEMO_PUBLIC_PROFILE_ID, seedPublicDemoData } from '../../data/demo/seed';
import { Badge, Button, Card, EmptyState, ErrorState, Skeleton, useToast } from '../../components/ui';
import { ProfileView } from './ProfileView';
import { copyText, publicProfileUrl } from './cert-utils';

type State = { kind: 'loading' } | { kind: 'ready'; profile: PublicSkillsProfile } | { kind: 'missing' } | { kind: 'error' };

export default function PublicProfilePage() {
  const { userId = '' } = useParams();
  const { lookupPublic, user, ready } = useApp();
  const toast = useToast();
  const [state, setState] = useState<State>({ kind: 'loading' });
  const reqRef = useRef(0);

  const load = useCallback(async () => {
    const req = ++reqRef.current;
    setState({ kind: 'loading' });
    try {
      await seedPublicDemoData(localDb).catch((e) => console.warn('[ZimAI] demo seed failed', e));
      const profile = await lookupPublic<PublicSkillsProfile>('publicProfiles', userId);
      if (req !== reqRef.current) return;
      setState(profile ? { kind: 'ready', profile } : { kind: 'missing' });
    } catch (e) {
      console.warn('[ZimAI] profile lookup failed', e);
      if (req === reqRef.current) setState({ kind: 'error' });
    }
  }, [lookupPublic, userId]);

  // Wait for the backend (local or Firestore) to be ready; the ref avoids reloading when lookup callbacks change identity.
  const loadRef = useRef(load);
  loadRef.current = load;
  useEffect(() => {
    if (ready) loadRef.current();
  }, [ready, userId]);

  const isOwn = Boolean(user && user.id === userId);
  const copy = async () => {
    const ok = await copyText(publicProfileUrl(userId));
    if (ok) toast.success('Profile link copied');
    else toast.error('Could not copy the link');
  };

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-brand-50/80 to-transparent" />
      <div className="relative mx-auto max-w-4xl px-4 pb-16 pt-8 sm:px-6 sm:pt-12">
        {state.kind === 'loading' && <ProfileSkeleton />}

        {state.kind === 'error' && <ErrorState title="We couldn't load this profile" message="Please check your connection and try again." onRetry={load} className="mt-6" />}

        {state.kind === 'missing' && (
          <EmptyState
            className="mt-6 bg-white"
            icon={<UserX className="h-6 w-6" />}
            title="Profile not found"
            description="This AI Skills Profile doesn't exist or hasn't been published yet. Profiles are only visible after the holder chooses to publish them."
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Button to={`/p/${DEMO_PUBLIC_PROFILE_ID}`} icon={<Sparkles className="h-4 w-4" />}>
                  View a demo profile
                </Button>
                <Button to="/verify" variant="outline">
                  Verify a certificate
                </Button>
              </div>
            }
          />
        )}

        {state.kind === 'ready' && (
          <div className="animate-fade-up">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Badge tone="brand" icon={<Globe className="h-3.5 w-3.5" />}>
                Public AI Skills Profile
              </Badge>
              <div className="flex flex-wrap gap-2">
                {isOwn && (
                  <Button to="/app/profile" size="sm" variant="secondary" icon={<PencilLine className="h-4 w-4" />}>
                    Update my profile
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={copy} icon={<Link2 className="h-4 w-4" />}>
                  Copy link
                </Button>
              </div>
            </div>

            <ProfileView profile={state.profile} />

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Card>
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                    <ShieldCheck className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="font-bold text-ink-950">What "Verified" means</h2>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">
                      A competency is verified only when it is backed by a valid ZimAI Ready certificate, a passed assessment or a practical workplace activity scored against a rubric —
                      never by self-assessment alone.
                    </p>
                  </div>
                </div>
              </Card>
              <Card>
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-ink-900">
                    <Lock className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="font-bold text-ink-950">Privacy by design</h2>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">
                      This is a snapshot the holder chose to publish. It never includes assessment answers, activity submissions, contact details or AI Tutor conversations.
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            <div className="relative mt-6 overflow-hidden rounded-3xl bg-ink-950 p-6 text-white sm:p-8">
              <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand-500/30 blur-3xl" />
              <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl font-extrabold tracking-tight">Where do you stand with AI?</h2>
                  <p className="mt-1 max-w-md text-sm text-slate-300">Discover your AI readiness in minutes, follow a personalised learning path and earn a verifiable certificate.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button to="/login?role=employee&mode=signup" variant="gold" iconRight={<ArrowRight className="h-4 w-4" />}>
                    Check My AI Readiness
                  </Button>
                  <Button to="/for-employers" variant="white" icon={<Building2 className="h-4 w-4" />}>
                    For employers
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading profile">
      <Skeleton className="mb-4 h-6 w-48" />
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
        <div className="flex items-center gap-4 bg-ink-950/90 p-7">
          <div className="h-[68px] w-[68px] animate-pulse rounded-full bg-white/15" />
          <div className="flex-1 space-y-2">
            <div className="h-6 w-1/2 animate-pulse rounded-lg bg-white/15" />
            <div className="h-4 w-1/3 animate-pulse rounded-lg bg-white/10" />
          </div>
        </div>
        <div className="grid gap-6 p-7 lg:grid-cols-2">
          <div className="space-y-3">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
          <div className="space-y-4">
            {Array.from({ length: 5 }, (_, i) => (
              <Skeleton key={i} className="h-8" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
