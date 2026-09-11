import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cloud, Cpu, Database, FlaskConical, KeyRound, LogOut, RotateCcw, Sparkles, User as UserIcon } from 'lucide-react';
import { AIDisclaimer, Avatar, Badge, Button, Card, CardTitle, Modal, PageHeader, useToast } from '../../components/ui';
import { useApp } from '../../services/store';
import { getActiveModel, hasEnvApiKey, isGeminiAvailable, setUserApiKey, useAIStatus } from '../../services/gemini';
import { formatDate } from '../../lib/utils';

export default function SettingsPage() {
  const { user, backendKind, signOut, resetDemo, organisation } = useApp();
  const status = useAIStatus();
  const toast = useToast();
  const navigate = useNavigate();
  const [key, setKey] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetting, setResetting] = useState(false);
  if (!user) return null;

  const statusText = {
    ready: 'Gemini is configured and ready.',
    connected: `Connected${getActiveModel() ? ` · ${getActiveModel()}` : ''}.`,
    degraded: 'The last Gemini request failed — the built-in engine is covering. It will retry automatically.',
    offline: 'No Gemini API key found. ZimAI Ready is using its built-in offline engine, so every feature still works.',
  }[status];

  return (
    <div className="animate-fade-up">
      <PageHeader eyebrow="Settings" title="Account & platform" description="Manage your account, AI engine and data." />
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardTitle icon={<UserIcon className="h-5 w-5" />} title="Account" />
          <div className="flex items-center gap-4">
            <Avatar name={user.name} photoURL={user.photoURL} size={52} />
            <div className="min-w-0">
              <p className="truncate font-bold text-ink-950">{user.name}</p>
              <p className="truncate text-sm text-slate-500">{user.email}</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                <Badge tone="brand">{user.role === 'employer' ? 'Employer' : 'Employee'}</Badge>
                {user.isDemo && <Badge tone="gold" icon={<FlaskConical className="h-3 w-3" />}>Demo profile</Badge>}
                {organisation && <Badge>{organisation.name}</Badge>}
              </div>
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-500">Member since {formatDate(user.createdAt)}</p>
          <Button
            variant="outline"
            className="mt-5"
            icon={<LogOut className="h-4 w-4" />}
            onClick={async () => {
              await signOut();
              navigate('/');
            }}
          >
            Sign out
          </Button>
        </Card>

        <Card>
          <CardTitle icon={status === 'offline' ? <Cpu className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />} title="AI engine" subtitle="Google Gemini powers analysis, tutoring, feedback and advice." />
          <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">{statusText}</div>
          {!hasEnvApiKey() && (
            <div className="mt-4">
              <label className="text-sm font-semibold text-slate-700" htmlFor="gk">
                Gemini API key (optional, stored only in this browser)
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  id="gk"
                  type="password"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder={isGeminiAvailable() ? '•••••••• saved' : 'Paste key from aistudio.google.com'}
                  className="h-11 min-w-0 flex-1 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
                <Button
                  icon={<KeyRound className="h-4 w-4" />}
                  onClick={() => {
                    setUserApiKey(key);
                    setKey('');
                    toast.success(key.trim() ? 'Gemini key saved' : 'Gemini key removed');
                  }}
                >
                  Save
                </Button>
              </div>
            </div>
          )}
          <AIDisclaimer className="mt-4" />
        </Card>

        <Card>
          <CardTitle icon={backendKind === 'firebase' && !user.isDemo ? <Cloud className="h-5 w-5" /> : <Database className="h-5 w-5" />} title="Data storage" />
          <p className="text-sm text-slate-600">
            {user.isDemo
              ? 'Demo profiles are stored in this browser so presentations work anywhere, even offline.'
              : backendKind === 'firebase'
                ? 'Your data is stored securely in Google Cloud Firestore.'
                : 'Your data is stored in this browser. Connect Firebase to sync across devices.'}
          </p>
          <p className="mt-3 text-xs text-slate-500">ZimAI Ready stores only what is needed to personalise your learning. Employers see readiness and skills — never your answers to individual questions.</p>
        </Card>

        {user.isDemo && (
          <Card>
            <CardTitle icon={<RotateCcw className="h-5 w-5" />} title="Demo data" subtitle="Restore this demo profile to its original state." />
            <Button variant="outline" icon={<RotateCcw className="h-4 w-4" />} onClick={() => setConfirmReset(true)}>
              Reset demo data
            </Button>
          </Card>
        )}
      </div>

      <Modal
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="Reset demo data?"
        description="All locally stored demo progress will be restored to the starting scenario."
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmReset(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={resetting}
              onClick={async () => {
                setResetting(true);
                await resetDemo();
                setResetting(false);
                setConfirmReset(false);
                toast.success('Demo data restored');
                navigate(user.role === 'employer' ? '/employer' : '/app');
              }}
            >
              Reset
            </Button>
          </>
        }
      />
    </div>
  );
}
