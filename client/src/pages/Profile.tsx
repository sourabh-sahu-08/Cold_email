import React, { useState, useEffect } from 'react';
import {
  UserCircle,
  FileText,
  Globe,
  Mail,
  Save,
  CheckCircle2,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api';
import type { Profile as ProfileType } from '../types';
import { useNotification } from '../context/NotificationContext';
import { Badge } from '../components/common/Badge';

// Clean SVG components for LinkedIn and GitHub
const LinkedInIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
  </svg>
);

const GitHubIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
    />
  </svg>
);

export const Profile: React.FC = () => {
  const { showNotification } = useNotification();

  const [formData, setFormData] = useState<Partial<ProfileType>>({
    fullName: 'Sourabh Sahu',
    professionalTitle: 'Full Stack Developer',
    resumeUrl: '',
    portfolioUrl: '',
    linkedInUrl: '',
    gitHubUrl: '',
    contactEmail: '',
    skillsSummary: 'Proficient in React, Node.js, TypeScript, Next.js, MongoDB, and REST APIs.',
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await api.getProfile();
      setFormData(data);
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to load profile.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const updated = await api.updateProfile(formData);
      setFormData(updated);
      showNotification('success', 'Profile and signature links updated successfully!');
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Title & Intro */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <UserCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Professional Profile & Links</h2>
            <p className="text-xs text-slate-500">
              Saved information is automatically injected into every AI email and email signature.
            </p>
          </div>
        </div>

        <Badge variant="blue">Auto-Signature Enabled</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Editable Form (7 cols) */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-5">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-5">
            <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
              Candidate Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.fullName || ''}
                  onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Sourabh Sahu"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Professional Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.professionalTitle || ''}
                  onChange={e => setFormData({ ...formData, professionalTitle: e.target.value })}
                  placeholder="e.g. Full Stack Developer"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1 text-xs">
                Contact Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={formData.contactEmail || ''}
                  onChange={e => setFormData({ ...formData, contactEmail: e.target.value })}
                  placeholder="e.g. sourabh@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1 text-xs">
                Key Skills & Experience Summary{' '}
                <span className="text-slate-400 font-normal">(Used by Gemini AI for contextual pitching)</span>
              </label>
              <textarea
                rows={3}
                value={formData.skillsSummary || ''}
                onChange={e => setFormData({ ...formData, skillsSummary: e.target.value })}
                placeholder="e.g. 2 years experience building responsive web applications using React, Node.js, Express, MongoDB, and Tailwind CSS..."
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400 resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* Online Links Section */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Professional Links & URLs</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Only populated links will be included in email signatures and outreach letters.
              </p>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Resume URL */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Resume URL (Google Drive / Cloud Link)
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="url"
                    value={formData.resumeUrl || ''}
                    onChange={e => setFormData({ ...formData, resumeUrl: e.target.value })}
                    placeholder="https://drive.google.com/... or https://sourabh.dev/resume.pdf"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Portfolio URL */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Portfolio Website URL</label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="url"
                    value={formData.portfolioUrl || ''}
                    onChange={e => setFormData({ ...formData, portfolioUrl: e.target.value })}
                    placeholder="https://sourabh-portfolio.vercel.app"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* LinkedIn URL */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">LinkedIn Profile URL</label>
                <div className="relative">
                  <span className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 flex items-center">
                    <LinkedInIcon className="w-4 h-4" />
                  </span>
                  <input
                    type="url"
                    value={formData.linkedInUrl || ''}
                    onChange={e => setFormData({ ...formData, linkedInUrl: e.target.value })}
                    placeholder="https://www.linkedin.com/in/sourabh-sahu"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* GitHub URL */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">GitHub Profile URL</label>
                <div className="relative">
                  <span className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 flex items-center">
                    <GitHubIcon className="w-4 h-4" />
                  </span>
                  <input
                    type="url"
                    value={formData.gitHubUrl || ''}
                    onChange={e => setFormData({ ...formData, gitHubUrl: e.target.value })}
                    placeholder="https://github.com/sourabh-sahu"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving Changes...' : 'Save Profile Details'}</span>
              </button>
            </div>
          </div>
        </form>

        {/* Right Column: Live Signature Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Email Signature Preview</h3>
                <p className="text-xs text-slate-500">Live preview of auto-injected signature</p>
              </div>
              <Sparkles className="w-4 h-4 text-blue-500" />
            </div>

            {/* Signature Box */}
            <div className="p-5 rounded-xl bg-slate-50/70 border border-slate-200 text-sm font-sans space-y-4">
              <div>
                <p className="text-slate-800 font-semibold mb-0.5">Best Regards,</p>
                <p className="text-slate-900 font-bold text-base">
                  {formData.fullName || 'Sourabh Sahu'}
                </p>
                <p className="text-slate-500 text-xs font-medium">
                  {formData.professionalTitle || 'Full Stack Developer'}
                </p>
                {formData.contactEmail && (
                  <p className="text-slate-400 text-xs mt-0.5">{formData.contactEmail}</p>
                )}
              </div>

              {/* Clickable links block */}
              <div className="pt-3 border-t border-slate-200/80 space-y-1.5 text-xs">
                {formData.resumeUrl?.trim() ? (
                  <div className="flex items-center gap-1.5">
                    <strong className="text-slate-700">Resume:</strong>
                    <a
                      href={formData.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-0.5 font-medium"
                    >
                      [View My Resume] <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                ) : (
                  <div className="text-slate-400 italic text-[11px]">• No Resume URL configured</div>
                )}

                {formData.portfolioUrl?.trim() ? (
                  <div className="flex items-center gap-1.5">
                    <strong className="text-slate-700">Portfolio:</strong>
                    <a
                      href={formData.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-0.5 font-medium"
                    >
                      [Visit My Portfolio] <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                ) : (
                  <div className="text-slate-400 italic text-[11px]">• No Portfolio URL configured</div>
                )}

                {formData.linkedInUrl?.trim() ? (
                  <div className="flex items-center gap-1.5">
                    <strong className="text-slate-700">LinkedIn:</strong>
                    <a
                      href={formData.linkedInUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-0.5 font-medium"
                    >
                      [Connect on LinkedIn] <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                ) : (
                  <div className="text-slate-400 italic text-[11px]">• No LinkedIn URL configured</div>
                )}

                {formData.gitHubUrl?.trim() ? (
                  <div className="flex items-center gap-1.5">
                    <strong className="text-slate-700">GitHub:</strong>
                    <a
                      href={formData.gitHubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-0.5 font-medium"
                    >
                      [View GitHub Profile] <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                ) : (
                  <div className="text-slate-400 italic text-[11px]">• No GitHub URL configured</div>
                )}
              </div>
            </div>

            <div className="text-[11px] text-slate-500 bg-blue-50/60 p-3 rounded-xl border border-blue-100 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                These exact hyperlinks are automatically attached to every draft generated by Gemini AI.
                Recruiters can click straight into your work.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
