import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowRight, Building2, Globe, Link2, Lock, PencilLine, ShieldCheck, Sparkles, UserX } from 'lucide-react';
import type { PublicSkillsProfile } from '../../types';
import { useApp } from '../../services/store';
import { localDb } from '../../services/backend';
import { DEMO_PUBLIC_PROFILE_ID, seedPublicDemoData } from '../../data/demo/seed';
import { Button, ErrorState, Skeleton, useToast } from '../../components/ui';
import { GhostText, Reveal } from '../../components/motion';
import { CertificateRibbon, GhostMascot, ShieldHands, Sparkle, Squiggle } from '../../components/illustrations';
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
    <div className="relative overflow-x-clip">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[30rem] bg-grid [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]" aria-hidden />
      <div className="relative mx-auto max-w-4xl px-4 pb-20 pt-28 sm:px-6 sm:pt-36">
        {state.kind === 'loading' && <ProfileSkeleton />}

        {state.kind === 'error' && <ErrorState title="We couldn't load this profile" message="Please check your connection and try again." onRetry={load} className="mt-6" />}

        {state.kind === 'missing' && (
          <div className="relative mt-4 animate-ghost-in overflow-hidden rounded-4xl border border-ink-950/10 bg-paper px-6 py-14 text-center shadow-card sm:px-12 sm:py-20">
            <div className="pointer-events-none absolute left-6 top-6 hidden sm:block" aria-hidden>
              <Sparkle className="h-8 w-8" color="#ffa946" animated />
            </div>
            <div className="relative mx-auto w-fit">
              <span className="absolute inset-4 animate-ghost-pulse rounded-full bg-lilac-300/60 blur-2xl" aria-hidden />
              <GhostMascot mood="thinking" className="relative h-32 w-32 animate-ghost-float sm:h-40 sm:w-40" animated />
              <span className="absolute -bottom-1 right-0 flex h-10 w-10 items-center justify-center rounded-xl border border-ink-950 bg-blush-200 text-ink-950 shadow-ink-sm">
                <UserX className="h-5 w-5" />
              </span>
            </div>
            <h1 className="mt-8 text-balance text-4xl leading-[1] text-ink-950 sm:text-6xl">
              Profile <em className="text-brand-800">not found</em>
            </h1>
            <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-ink-600">
              This AI Skills Profile doesn't exist or hasn't been published yet. Profiles are only visible after the holder chooses to publish them.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              <Button to={`/p/${DEMO_PUBLIC_PROFILE_ID}`} icon={<Sparkles className="h-4 w-4" />}>
                View a demo profile
              </Button>
              <Button to="/verify" variant="outline">
                Verify a certificate
              </Button>
            </div>
          </div>
        )}

        {state.kind === 'ready' && (
          <div>
            <div className="relative mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <p className="inline-flex animate-ghost-in items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">
                  <Globe className="h-3.5 w-3.5 text-brand-800" />
                  Public AI Skills Profile
                </p>
                <h1 className="mt-3 text-5xl leading-[0.95] text-ink-950 sm:text-6xl">
                  <span className="sr-only">AI Skills Profile</span>
                  <span aria-hidden>
                    <GhostText text="AI Skills" startOnView={false} stagger={80} />{' '}
                    <span className="relative inline-block">
                      <GhostText text="*Profile*" accentClassName="italic text-brand-800" startOnView={false} delay={200} />
                      <Squiggle className="absolute -bottom-2 left-0 h-3 w-full sm:h-4" color="#ff6c4c" animated />
                    </span>
                  </span>
                </h1>
              </div>
              <div className="flex animate-ghost-in flex-wrap gap-2" style={{ animationDelay: '200ms' }}>
                {isOwn && (
                  <Button to="/app/profile" size="sm" variant="primary" icon={<PencilLine className="h-4 w-4" />}>
                    Update my profile
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={copy} icon={<Link2 className="h-4 w-4" />}>
                  Copy link
                </Button>
              </div>
              <div className="pointer-events-none absolute -top-16 right-0 hidden md:block" aria-hidden>
                <div className="rotate-6">
                  <CertificateRibbon className="h-24 w-24 animate-float" animated />
                </div>
              </div>
            </div>

            <div className="animate-ghost-in" style={{ animationDelay: '120ms' }}>
              <div className="rounded-[1.9rem] border border-ink-950 bg-paper p-1.5 shadow-ink">
                <ProfileView profile={state.profile} />
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <Reveal>
                <div className="relative h-full overflow-hidden rounded-4xl border border-ink-950/10 bg-paper p-6 shadow-card">
                  <div className="pointer-events-none absolute -bottom-4 -right-4 opacity-90" aria-hidden>
                    <ShieldHands className="h-24 w-24" />
                  </div>
                  <div className="relative flex items-start gap-3 pr-10">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-ink-950 bg-lilac-200 text-ink-950">
                      <ShieldCheck className="h-5 w-5" />
                    </span>
                    <div>
                      <h2 className="text-2xl leading-tight text-ink-950">
                        What "<em>Verified</em>" means
                      </h2>
                      <p className="mt-2 text-sm leading-relaxed text-ink-600">
                        Backed by a certificate, a passed assessment or a scored workplace activity — never self-assessment.
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
              <Reveal delay={100}>
                <div className="h-full rounded-4xl border border-ink-950/10 bg-paper p-6 shadow-card">
                  <div className="flex items-start gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-ink-950 bg-gold-400 text-ink-950">
                      <Lock className="h-5 w-5" />
                    </span>
                    <div>
                      <h2 className="text-2xl leading-tight text-ink-950">
                        Privacy <em>by design</em>
                      </h2>
                      <p className="mt-2 text-sm leading-relaxed text-ink-600">
                        A snapshot the holder chose to publish. No answers, submissions, contact details or tutor chats.
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>

            <Reveal className="mt-8">
              <div className="relative overflow-hidden rounded-4xl bg-brand-800 p-6 text-canvas sm:p-10">
                <div className="bg-grid-dark pointer-events-none absolute inset-0" aria-hidden />
                <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-4">
                    <GhostMascot mood="wave" className="h-16 w-16 shrink-0 animate-ghost-float sm:h-20 sm:w-20" animated />
                    <div>
                      <h2 className="text-3xl leading-tight sm:text-4xl">
                        Where do you stand <em className="text-gold-300">with AI?</em>
                      </h2>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button to="/login?role=employee&mode=signup" variant="primary" iconRight={<ArrowRight className="h-4 w-4" />}>
                      Check My AI Readiness
                    </Button>
                    <Button to="/for-employers" variant="white" icon={<Building2 className="h-4 w-4" />}>
                      For employers
                    </Button>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        )}
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading profile">
      <div className="mb-6 flex items-center gap-3">
        <GhostMascot mood="thinking" className="h-12 w-12" animated />
        <p className="animate-ghost-pulse font-display text-2xl text-ink-700">Loading profile…</p>
      </div>
      <div className="overflow-hidden rounded-4xl border border-ink-950/10 bg-paper">
        <div className="flex items-center gap-4 bg-ink-950 p-7">
          <div className="h-[68px] w-[68px] animate-ghost-pulse rounded-full bg-canvas/20" />
          <div className="flex-1 space-y-2">
            <div className="h-6 w-1/2 animate-ghost-pulse rounded-lg bg-canvas/20" />
            <div className="h-4 w-1/3 animate-ghost-pulse rounded-lg bg-canvas/10" />
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
