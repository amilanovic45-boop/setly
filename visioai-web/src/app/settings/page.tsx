'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAppStore } from '@/lib/store';
import { useBalance } from '@/lib/hooks';
import { saveApiKey, clearApiKey, checkBalance } from '@/lib/api';

export default function SettingsPage() {
  const { balance, generations, settings, apiKey, setApiKey, setBalance, setOnboarded, updateSettings } = useAppStore();
  const { refetch } = useBalance();

  const [editKey, setEditKey] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [show, setShow] = useState(false);

  const totalImages = generations.filter((g) => g.type === 'image').length;
  const totalVideos = generations.filter((g) => g.type === 'video').length;

  const maskedKey = apiKey ? apiKey.slice(0, 8) + '••••••••' + apiKey.slice(-4) : 'Not connected';

  const handleSave = async () => {
    if (!newKey.trim()) return;
    setSaving(true);
    try {
      saveApiKey(newKey.trim());
      setApiKey(newKey.trim());
      const bal = await checkBalance();
      setBalance(bal);
      setEditKey(false);
      setNewKey('');
      toast.success('API key updated');
    } catch {
      toast.error('Invalid API key');
    } finally {
      setSaving(false);
    }
  };

  const handleDisconnect = () => {
    if (!confirm('Disconnect your API key?')) return;
    clearApiKey();
    setApiKey(null);
    setBalance(null);
    setOnboarded(false);
    toast.success('Disconnected');
  };

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-text-primary tracking-tight mb-6">Settings</h1>

      {/* Credits card */}
      {apiKey && (
        <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/20 to-accent/10 p-5 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest font-bold text-text-secondary mb-2">Credits Balance</p>
              <p className="text-4xl font-bold text-text-primary tracking-tight">
                {balance?.credits?.toLocaleString() ?? '—'}
              </p>
              <p className="text-sm text-text-secondary mt-1">credits remaining</p>
            </div>
            <span className="bg-primary/20 text-primary text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-xl border border-primary/30">
              {balance?.plan ?? 'Free'}
            </span>
          </div>
          <button
            onClick={() => refetch()}
            className="mt-4 text-xs text-text-secondary hover:text-text-primary transition-colors"
          >
            ↺ Refresh balance
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Images', value: totalImages },
          { label: 'Videos', value: totalVideos },
          { label: 'Total', value: generations.length },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-text-primary">{s.value}</p>
            <p className="text-xs text-text-muted mt-1 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* API Key section */}
      <Section title="API Connection">
        {editKey ? (
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-2 bg-surface rounded-xl border border-border overflow-hidden">
              <input
                type={show ? 'text' : 'password'}
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                placeholder="hf-xxxxxxxxxxxxxxxxxxxxxxxx"
                className="flex-1 bg-transparent px-4 py-3 text-sm text-text-primary placeholder:text-text-muted font-mono"
              />
              <button onClick={() => setShow(!show)} className="px-3 text-text-muted">{show ? '🙈' : '👁'}</button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={!newKey.trim() || saving}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary to-violet-700 disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button
                onClick={() => { setEditKey(false); setNewKey(''); }}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-border text-text-secondary hover:text-text-primary"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <Row label="API Key" value={maskedKey} onClick={() => setEditKey(true)} action="Edit" />
            {apiKey && <Row label="Disconnect" onClick={handleDisconnect} danger />}
          </>
        )}
      </Section>

      {/* Preferences */}
      <Section title="Preferences">
        <div className="p-4 space-y-4">
          <div>
            <p className="text-xs uppercase tracking-widest font-semibold text-text-secondary mb-2">Default Image Model</p>
            <select
              value={settings.defaultImageModel}
              onChange={(e) => updateSettings({ defaultImageModel: e.target.value as typeof settings.defaultImageModel })}
              className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 text-sm text-text-primary"
            >
              <option value="soul_2">Soul 2</option>
              <option value="nano_banana_pro">Nano Banana Pro</option>
              <option value="ms_image">DTC Ads</option>
            </select>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest font-semibold text-text-secondary mb-2">Default Aspect Ratio</p>
            <select
              value={settings.defaultAspectRatio}
              onChange={(e) => updateSettings({ defaultAspectRatio: e.target.value as typeof settings.defaultAspectRatio })}
              className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 text-sm text-text-primary"
            >
              {['1:1', '9:16', '16:9', '3:4', '4:3'].map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>
      </Section>

      <Section title="About">
        <Row label="Version" value="1.0.0" />
        <Row label="Powered by" value="Higgsfield AI" />
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <p className="text-xs uppercase tracking-widest font-bold text-text-secondary mb-2 px-1">{title}</p>
      <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border">
        {children}
      </div>
    </div>
  );
}

function Row({ label, value, onClick, action, danger }: {
  label: string; value?: string; onClick?: () => void; action?: string; danger?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between px-4 py-3.5 ${onClick ? 'cursor-pointer hover:bg-white/5 transition-colors' : ''}`}
      onClick={onClick}>
      <span className={`text-sm font-medium ${danger ? 'text-error' : 'text-text-primary'}`}>{label}</span>
      <div className="flex items-center gap-3">
        {value && <span className="text-sm text-text-secondary">{value}</span>}
        {action && <span className="text-xs text-primary font-semibold">{action}</span>}
      </div>
    </div>
  );
}
