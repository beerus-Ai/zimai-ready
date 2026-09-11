import { Compass, Home } from 'lucide-react';
import { Button } from '../../components/ui';
import { useApp } from '../../services/store';

export default function NotFound() {
  const { user } = useApp();
  const home = user ? (user.role === 'employer' ? '/employer' : '/app') : '/';
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
        <Compass className="h-8 w-8" />
      </div>
      <p className="text-sm font-bold uppercase tracking-[0.14em] text-brand-600">404</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink-950">This page took a different career path</h1>
      <p className="mt-3 text-slate-500">The page you were looking for doesn't exist or has moved.</p>
      <Button to={home} className="mt-8" icon={<Home className="h-4 w-4" />}>
        {user ? 'Back to my dashboard' : 'Back to home'}
      </Button>
    </div>
  );
}
