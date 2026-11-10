import React, { useEffect, useState } from 'react';
import {
  Send,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  MailCheck,
} from 'lucide-react';
import { api } from '../services/api';
import type { DashboardMetrics } from '../types';
import { Badge } from '../components/common/Badge';
import type { NavItem } from '../components/layout/Sidebar';

interface DashboardProps {
  setActiveTab: (tab: NavItem) => void;
  onComposeWithContact?: (contact: { name: string; email: string; company: string }) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setActiveTab }) => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const data = await api.getDashboardMetrics();
      setMetrics(data);
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isGmailConnected = metrics?.gmailStatus?.isConnected;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI-Powered Recruiter Outreach</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Welcome back, {metrics?.userName || 'Sourabh'}
            </h2>
            <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
              Your personal cold email command center. Reach top recruiters, generate tailored
              applications with Gemini AI, and send verified emails through your Gmail account.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('compose')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-sm shadow-blue-500/20 hover:shadow-md transition-all active:scale-[0.98]"
            >
              <Send className="w-4 h-4" />
              <span>Compose Email</span>
            </button>
            <button
              onClick={() => setActiveTab('contacts')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium text-sm transition-all"
            >
              <Users className="w-4 h-4 text-slate-400" />
              <span>Contacts</span>
            </button>
          </div>
        </div>
      </div>

      {/* Gmail Connection Warning if disconnected */}
      {!isGmailConnected && !loading && (
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-semibold text-amber-900">
                Gmail account not connected
              </div>
              <div className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                Connect your personal Gmail via Google OAuth to send emails directly from your inbox
                with full RFC 2822 formatting.
              </div>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('settings')}
            className="shrink-0 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
          >
            Connect Gmail Account
          </button>
        </div>
      )}

      {/* Metrics Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Emails Sent */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Emails Sent
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <MailCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900">
              {loading ? '-' : metrics?.totalEmailsSent ?? 0}
            </div>
            <div className="text-xs text-slate-500 mt-1">Verified deliveries via Gmail</div>
          </div>
        </div>

        {/* Card 2: Recruiters Contacted */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Recruiters Reached
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900">
              {loading ? '-' : metrics?.totalRecruitersContacted ?? 0}
            </div>
            <div className="text-xs text-slate-500 mt-1">Unique recruiter inboxes</div>
          </div>
        </div>

        {/* Card 3: Saved Contacts */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Saved Contacts
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900">
              {loading ? '-' : metrics?.totalContactsSaved ?? 0}
            </div>
            <div className="text-xs text-slate-500 mt-1">Ready for personalized outreach</div>
          </div>
        </div>

        {/* Card 4: Gmail Status */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Gmail Auth
            </span>
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isGmailConnected
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-amber-50 text-amber-600'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isGmailConnected ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
              <span className="text-lg font-bold text-slate-900">
                {isGmailConnected ? 'Connected' : 'Offline'}
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-1 truncate">
              {isGmailConnected
                ? metrics?.gmailStatus?.connectedAccount?.email
                : 'OAuth required'}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Checklist & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Completion Checklist */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900">Professional Profile</h3>
              <Badge variant={metrics?.profileConfigured ? 'emerald' : 'amber'}>
                {metrics?.profileConfigured ? 'Links Active' : 'Setup Incomplete'}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              ColdMail automatically inserts your active resume, portfolio, LinkedIn, and GitHub
              links into every email signature.
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Name: {metrics?.userName}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Title: {metrics?.userTitle}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2
                  className={`w-4 h-4 ${
                    metrics?.profileConfigured ? 'text-emerald-500' : 'text-slate-300'
                  } shrink-0`}
                />
                <span>Resume & Portfolio Hyperlinks</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('profile')}
            className="mt-6 w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl border border-slate-200 hover:border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <span>Edit Profile & Links</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>

        {/* Recent Activity / Sent Emails */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Sent Outreach</h3>
              <p className="text-xs text-slate-500">Live records from your database</p>
            </div>
            <button
              onClick={() => setActiveTab('history')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading records...</div>
          ) : !metrics?.recentEmails || metrics.recentEmails.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <Clock className="w-6 h-6" />
              </div>
              <div className="text-sm font-medium text-slate-700">No emails sent yet</div>
              <p className="text-xs text-slate-500 max-w-sm">
                Ready to make your first connection? Click below to compose and generate a
                personalized cold email.
              </p>
              <button
                onClick={() => setActiveTab('compose')}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Start Outreach</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-medium">
                    <th className="pb-3 font-semibold">Recipient</th>
                    <th className="pb-3 font-semibold">Company / Role</th>
                    <th className="pb-3 font-semibold">Purpose</th>
                    <th className="pb-3 font-semibold">Sent Date</th>
                    <th className="pb-3 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {metrics.recentEmails.map(email => (
                    <tr key={email._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3">
                        <div className="font-semibold text-slate-800">
                          {email.recipientName || email.recipientEmail}
                        </div>
                        {email.recipientName && (
                          <div className="text-slate-400 text-[11px]">{email.recipientEmail}</div>
                        )}
                      </td>
                      <td className="py-3 text-slate-600">
                        <div>{email.company || 'Direct'}</div>
                        <div className="text-slate-400 text-[11px]">{email.jobRole || '-'}</div>
                      </td>
                      <td className="py-3">
                        <Badge variant="blue" size="sm">
                          {email.purpose}
                        </Badge>
                      </td>
                      <td className="py-3 text-slate-500 whitespace-nowrap">
                        {formatDate(email.sentAt)}
                      </td>
                      <td className="py-3 text-right">
                        <Badge
                          variant={email.status === 'Sent' ? 'emerald' : 'rose'}
                          size="sm"
                        >
                          {email.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
