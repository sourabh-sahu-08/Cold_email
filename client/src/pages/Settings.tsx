import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Mail,
  Sparkles,
  ShieldCheck,
  Key,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../services/api';
import type { SettingsData } from '../types';
import { useNotification } from '../context/NotificationContext';
import { Badge } from '../components/common/Badge';

export const Settings: React.FC = () => {
  const { showNotification } = useNotification();

  const [settings, setSettings] = useState<SettingsData | null>(null);

  // Form Fields
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [googleClientId, setGoogleClientId] = useState('');
  const [googleClientSecret, setGoogleClientSecret] = useState('');
  const [dailySendLimit, setDailySendLimit] = useState(50);

  // Actions state
  const [testingGemini, setTestingGemini] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [copiedRedirectUri, setCopiedRedirectUri] = useState(false);
  const [connectingOAuth, setConnectingOAuth] = useState(false);

  useEffect(() => {
    loadSettings();

    // Check query params if redirected from Google OAuth
    const params = new URLSearchParams(window.location.search);
    if (params.get('connected') === 'true') {
      showNotification('success', 'Gmail account connected successfully via Google OAuth 2.0!');
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (params.get('error')) {
      showNotification('error', `OAuth connection failed: ${params.get('error')}`);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const loadSettings = async () => {
    try {
      const data = await api.getSettings();
      setSettings(data);
      setDailySendLimit(data.dailySendLimit || 50);
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to load settings');
    }
  };

  const handleCopyUri = () => {
    if (!settings?.redirectUri) return;
    navigator.clipboard.writeText(settings.redirectUri);
    setCopiedRedirectUri(true);
    showNotification('success', 'Redirect URI copied to clipboard!');
    setTimeout(() => setCopiedRedirectUri(false), 2000);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingSettings(true);
      await api.updateSettings({
        geminiApiKey: geminiApiKey.trim() || undefined,
        googleClientId: googleClientId.trim() || undefined,
        googleClientSecret: googleClientSecret.trim() || undefined,
        dailySendLimit,
      });

      showNotification('success', 'Settings updated successfully!');
      setGeminiApiKey('');
      setGoogleClientId('');
      setGoogleClientSecret('');
      loadSettings();
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to save settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleTestGemini = async () => {
    try {
      setTestingGemini(true);
      const res = await api.testGeminiKey(geminiApiKey.trim() || undefined);
      showNotification('success', res.message, 'Gemini Verified');
    } catch (err: any) {
      showNotification('error', err.message, 'Gemini Check Failed');
    } finally {
      setTestingGemini(false);
    }
  };

  const handleConnectGmail = async () => {
    try {
      setConnectingOAuth(true);
      const authUrl = await api.getGoogleAuthUrl();
      window.location.href = authUrl;
    } catch (err: any) {
      showNotification(
        'error',
        err.message || 'Please configure Google Client ID and Secret first.',
        'OAuth Failed'
      );
      setConnectingOAuth(false);
    }
  };

  const handleDisconnectGmail = async () => {
    if (!confirm('Are you sure you want to disconnect your Gmail account?')) return;
    try {
      await api.disconnectGoogle();
      showNotification('success', 'Gmail account disconnected successfully.');
      loadSettings();
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to disconnect Gmail.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Intro Header */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <SettingsIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Integrations & Settings</h2>
            <p className="text-xs text-slate-500">
              Manage your Google OAuth 2.0 connection, Gemini API key, and outreach preferences.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* CARD 1: Gmail API & OAuth 2.0 Integration */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Gmail Integration</h3>
                <p className="text-[11px] text-slate-500">Google OAuth 2.0 sending channel</p>
              </div>
            </div>

            <Badge variant={settings?.connectedAccount ? 'emerald' : 'amber'}>
              {settings?.connectedAccount ? 'Active & Connected' : 'Disconnected'}
            </Badge>
          </div>

          {/* Account status badge */}
          {settings?.connectedAccount ? (
            <div className="bg-emerald-50/70 border border-emerald-200/70 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                    G
                  </div>
                  <div>
                    <div className="text-xs font-bold text-emerald-950">
                      {settings.connectedAccount.name || 'Connected Gmail User'}
                    </div>
                    <div className="text-[11px] text-emerald-700 font-medium">
                      {settings.connectedAccount.email}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDisconnectGmail}
                  className="px-3 py-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-700 text-xs font-semibold transition-colors"
                >
                  Disconnect
                </button>
              </div>

              <div className="text-[11px] text-emerald-800 flex items-center gap-1.5 pt-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Verified sender permissions granted for Gmail API</span>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 text-xs">
              <div className="text-slate-700 font-medium">
                Connect your personal Gmail account to transmit personalized cold emails directly
                from your address.
              </div>

              <button
                type="button"
                onClick={handleConnectGmail}
                disabled={connectingOAuth}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                {connectingOAuth ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Connecting Google OAuth...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Connect Gmail with Google OAuth 2.0</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Google Credentials Configuration */}
          <div className="space-y-3 pt-2 text-xs">
            <h4 className="font-bold text-slate-800 text-xs">Google OAuth Credentials</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Create an OAuth 2.0 Client ID in your Google Cloud Console and paste the keys below,
              or configure them in <code className="bg-slate-100 px-1 py-0.5 rounded">server/.env</code>.
            </p>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Authorized Redirect URI (Copy to Google Cloud Console)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={settings?.redirectUri || 'http://localhost:5000/api/auth/google/callback'}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-mono"
                />
                <button
                  type="button"
                  onClick={handleCopyUri}
                  className="px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-1 shrink-0"
                >
                  {copiedRedirectUri ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedRedirectUri ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Google Client ID{' '}
                {settings?.hasGoogleClientId && (
                  <span className="text-emerald-600 font-normal">(Configured)</span>
                )}
              </label>
              <input
                type="text"
                placeholder={
                  settings?.hasGoogleClientId
                    ? '•••••••••••••••••••• (Leave blank to keep existing)'
                    : 'e.g. 123456789-abc.apps.googleusercontent.com'
                }
                value={googleClientId}
                onChange={e => setGoogleClientId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Google Client Secret{' '}
                {settings?.hasGoogleClientSecret && (
                  <span className="text-emerald-600 font-normal">(Configured)</span>
                )}
              </label>
              <input
                type="password"
                placeholder={
                  settings?.hasGoogleClientSecret
                    ? '•••••••••••••••••••• (Leave blank to keep existing)'
                    : 'Enter Google Client Secret'
                }
                value={googleClientSecret}
                onChange={e => setGoogleClientSecret(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* CARD 2: Gemini AI Integration & Limits */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Google Gemini AI</h3>
                  <p className="text-[11px] text-slate-500">AI Cold Email Generation Engine</p>
                </div>
              </div>

              <Badge variant={settings?.hasGeminiApiKey ? 'indigo' : 'slate'}>
                {settings?.hasGeminiApiKey ? 'Gemini 1.5 Flash' : 'Smart Template Mode'}
              </Badge>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Gemini API Key{' '}
                  {settings?.hasGeminiApiKey && (
                    <span className="text-emerald-600 font-normal">
                      (Configured: {settings.geminiApiKeyMasked})
                    </span>
                  )}
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    placeholder={
                      settings?.hasGeminiApiKey
                        ? 'Enter new key to update, or leave empty'
                        : 'AIzaSy...'
                    }
                    value={geminiApiKey}
                    onChange={e => setGeminiApiKey(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={handleTestGemini}
                  disabled={testingGemini || (!settings?.hasGeminiApiKey && !geminiApiKey)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testingGemini ? 'animate-spin' : ''}`} />
                  <span>{testingGemini ? 'Testing Gemini API...' : 'Test Connection'}</span>
                </button>

                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-1 text-[11px] font-medium"
                >
                  <span>Get Free Key (Google AI Studio)</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Outreach Safety Limits */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <Sliders className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Safety & Sending Controls</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Daily Sending Limit (Max emails per day)
                </label>
                <input
                  type="number"
                  min="5"
                  max="500"
                  value={dailySendLimit}
                  onChange={e => setDailySendLimit(parseInt(e.target.value, 10) || 50)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Protects your personal Gmail account from spam filters and ensures deliverability.
                  Recommended: 30-50 emails/day.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={handleSaveSettings}
                disabled={savingSettings}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
              >
                {savingSettings ? 'Saving Settings...' : 'Save Configuration'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
