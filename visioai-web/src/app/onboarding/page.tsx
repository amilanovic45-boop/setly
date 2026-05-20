'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Key, CheckCircle, ExternalLink, Zap, Shield, Coins } from 'lucide-react';
import { saveApiKey } from '@/lib/api';
import { checkBalance } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import GradientButton from '@/components/ui/GradientButton';

const STEPS = [
  {
    step: 1,
    icon: ExternalLink,
    title: 'Visit Higgsfield.ai',
    description: 'Go to higgsfield.ai and create a free account if you haven\'t already.',
  },
  {
    step: 2,
    icon: Key,
    title: 'Navigate to API Keys',
    description: 'In your dashboard, go to Settings → API Keys section.',
  },
  {
    step: 3,
    icon: Zap,
    title: 'Generate an API Key',
    description: 'Click "Create new key", give it a name, and copy the key.',
  },
  {
    step: 4,
    icon: Shield,
    title: 'Paste it below',
    description: 'Your key is stored locally and never sent to our servers.',
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { setApiKey, setOnboarded, setBalance } = useAppStore();
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [creditsCount, setCreditsCount] = useState(0);

  async function handleConnect() {
    const key = apiKeyInput.trim();
    if (!key) {
      toast.error('Please enter your API key');
      return;
    }

    setConnecting(true);
    try {
      saveApiKey(key);
      setApiKey(key);
      const balance = await checkBalance();
      setBalance(balance);
      setCreditsCount(balance.credits);
      setConnected(true);
      setOnboarded(true);
      toast.success('Successfully connected!');
      setTimeout(() => router.push('/'), 1500);
    } catch {
      saveApiKey('');
      setApiKey(null);
      toast.error('Failed to connect. Please check your API key.');
    } finally {
      setConnecting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-primary to-violet-700 flex items-center justify-center shadow-glow-primary">
            <Key className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight mb-2">
            Connect Your Account
          </h1>
          <p className="text-text-secondary">
            Link your Higgsfield AI API key to start generating
          </p>
        </div>

        {/* Steps */}
        <div className="bg-card border border-border rounded-2xl p-5 mb-6 space-y-4">
          {STEPS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="flex items-start gap-3"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">
                    {item.step}. {item.title}
                  </p>
                  <p className="text-xs text-text-secondary mt-0.5">{item.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* API Key input */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <label className="block text-sm font-semibold text-text-primary mb-3">
            Your Higgsfield API Key
          </label>

          {connected ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3 bg-success/10 border border-success/30 rounded-xl p-4"
            >
              <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-success">Connected successfully!</p>
                <p className="text-xs text-text-secondary mt-0.5 flex items-center gap-1">
                  <Coins className="w-3 h-3" />
                  {creditsCount.toLocaleString()} credits available
                </p>
              </div>
            </motion.div>
          ) : (
            <>
              <div className="flex items-center gap-2 bg-surface rounded-xl border border-border overflow-hidden mb-3 focus-within:border-primary transition-colors">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
                  placeholder="hf-xxxxxxxxxxxxxxxxxxxxxxxx"
                  autoComplete="off"
                  spellCheck={false}
                  className="flex-1 bg-transparent px-4 py-3 text-sm text-text-primary placeholder:text-text-muted font-mono focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="px-3 py-3 text-text-muted hover:text-text-primary transition-colors"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <GradientButton
                fullWidth
                size="lg"
                loading={connecting}
                disabled={!apiKeyInput.trim()}
                onClick={handleConnect}
              >
                {connecting ? 'Connecting...' : 'Connect API Key'}
              </GradientButton>
            </>
          )}

          <div className="flex items-start gap-2 mt-3">
            <Shield className="w-3.5 h-3.5 text-text-muted mt-0.5 flex-shrink-0" />
            <p className="text-xs text-text-muted">
              Your key is stored locally in your browser and never sent to our servers.
            </p>
          </div>
        </div>

        {/* Get API key link */}
        <div className="mt-4 text-center">
          <a
            href="https://higgsfield.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-violet-400 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Get your API key at higgsfield.ai
          </a>
        </div>
      </motion.div>
    </div>
  );
}
