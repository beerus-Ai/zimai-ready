import { Home, Sparkles } from 'lucide-react';
import { Button } from '../../components/ui';
import { GhostMascot, Sparkle } from '../../components/illustrations';
import { useApp } from '../../services/store';

export default function NotFound() {
  const { user } = useApp();
  const home = user ? (user.role === 'employer' ? '/employer' : '/app') : '/';
  return (
    <div className="relative overflow-x-clip">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[36rem] bg-grid [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]" aria-hidden />
      <div className="relative mx-auto flex max-w-4xl flex-col items-center px-4 pb-28 pt-28 text-center sm:pb-36 sm:pt-36">
        {/* Giant 404 with the ghost drifting through it */}
        <div className="relative select-none" aria-hidden>
          <p className="animate-ghost-in font-condensed text-[42vw] leading-[0.8] tracking-tight text-ink-950 sm:text-[16rem] lg:text-[20rem]">
            4<span className="text-lilac-200 [-webkit-text-stroke:3px_#1a1a1a]">0</span>4
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-ghost-in" style={{ animationDelay: '350ms' }}>
              <GhostMascot mood="wave" className="h-28 w-28 animate-ghost-float drop-shadow-xl sm:h-44 sm:w-44 lg:h-56 lg:w-56" animated />
            </div>
          </div>
          <span className="absolute -right-4 top-2 sm:-right-8">
            <Sparkle className="h-10 w-10 sm:h-14 sm:w-14" color="#ffa946" animated />
          </span>
          <span className="absolute -left-2 bottom-6 sm:-left-6">
            <Sparkle className="h-6 w-6 sm:h-9 sm:w-9" color="#ffbcf2" animated />
          </span>
        </div>

        <p className="sr-only">Error 404</p>
        <h1 className="mt-10 animate-ghost-in text-balance text-4xl leading-[1] text-ink-950 sm:text-6xl" style={{ animationDelay: '200ms' }}>
          This page has <em className="text-brand-800">ghosted</em> you.
        </h1>
        <p className="mt-4 animate-ghost-in text-ink-500" style={{ animationDelay: '320ms' }}>
          It doesn't exist or has moved.
        </p>
        <div className="mt-9 flex animate-ghost-in flex-col gap-3 sm:flex-row" style={{ animationDelay: '440ms' }}>
          <Button to={home} size="lg" icon={<Home className="h-4 w-4" />}>
            {user ? 'Back to my dashboard' : 'Back to home'}
          </Button>
          <Button to="/demo" size="lg" variant="outline" icon={<Sparkles className="h-4 w-4 text-gold-500" />}>
            Try the demo
          </Button>
        </div>
      </div>
    </div>
  );
}
