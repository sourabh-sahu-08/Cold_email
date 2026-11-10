import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Copy,
  Check,
  RefreshCw,
  Eye,
  Edit3,
  Users,
  AlertCircle,
  Trash2,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import { api } from '../services/api';
import type { EmailPurpose, Contact, Profile, GmailStatus } from '../types';
import { useNotification } from '../context/NotificationContext';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';

interface ComposeProps {
  initialContact?: {
    name?: string;
    email: string;
    company?: string;
    role?: string;
    purpose?: EmailPurpose;
    subject?: string;
    bodyText?: string;
  } | null;
}

export const Compose: React.FC<ComposeProps> = ({ initialContact }) => {
  const { showNotification } = useNotification();

  // Form State
  const [recruiterName, setRecruiterName] = useState(initialContact?.name || '');
  const [recruiterEmail, setRecruiterEmail] = useState(initialContact?.email || '');
  const [companyName, setCompanyName] = useState(initialContact?.company || '');
  const [jobRole, setJobRole] = useState(initialContact?.role || '');
  const [purpose, setPurpose] = useState<EmailPurpose>(
    initialContact?.purpose || 'Internship Application'
  );
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [saveContact, setSaveContact] = useState(true);

  // Email Content State
  const [subject, setSubject] = useState(initialContact?.subject || '');
  const [bodyText, setBodyText] = useState(initialContact?.bodyText || '');
  const [bodyHtml, setBodyHtml] = useState('');
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const [providerUsed, setProviderUsed] = useState<'gemini' | 'smart-template' | null>(null);

  // Loading States
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [copiedSubject, setCopiedSubject] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);

  // App Data
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [gmailStatus, setGmailStatus] = useState<GmailStatus | null>(null);

  // Modals
  const [isContactsModalOpen, setIsContactsModalOpen] = useState(false);
  const [isConfirmSendOpen, setIsConfirmSendOpen] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (initialContact) {
      if (initialContact.name) setRecruiterName(initialContact.name);
      if (initialContact.email) setRecruiterEmail(initialContact.email);
      if (initialContact.company) setCompanyName(initialContact.company);
      if (initialContact.role) setJobRole(initialContact.role);
      if (initialContact.purpose) setPurpose(initialContact.purpose);
      if (initialContact.subject) setSubject(initialContact.subject);
      if (initialContact.bodyText) setBodyText(initialContact.bodyText);
    }
  }, [initialContact]);

  const loadInitialData = async () => {
    try {
      const [fetchedContacts, fetchedProfile, fetchedStatus] = await Promise.all([
        api.getContacts(),
        api.getProfile(),
        api.getAuthStatus(),
      ]);
      setContacts(fetchedContacts);
      setProfile(fetchedProfile);
      setGmailStatus(fetchedStatus);
    } catch (err) {
      console.error('Error loading compose data:', err);
    }
  };

  const handleSelectContact = (c: Contact) => {
    setRecruiterName(c.name || '');
    setRecruiterEmail(c.email);
    setCompanyName(c.company || '');
    setJobRole(c.designation || '');
    setIsContactsModalOpen(false);
    showNotification('info', `Selected recruiter: ${c.email}`);
  };

  const handleGenerate = async () => {
    if (!recruiterEmail.trim()) {
      showNotification('error', 'Please enter a recipient email address.');
      return;
    }

    try {
      setGenerating(true);
      const res = await api.generateEmail({
        recruiterName,
        recruiterEmail,
        companyName,
        jobRole,
        purpose,
        additionalNotes,
      });

      setSubject(res.subject);
      setBodyText(res.bodyText);
      setBodyHtml(res.bodyHtml);
      setProviderUsed(res.provider);

      if (res.provider === 'gemini') {
        showNotification('success', 'Email generated successfully with Gemini AI!');
      } else {
        showNotification(
          'info',
          'Email generated using smart template. (Configure Gemini API key in Settings to unlock real AI generation).'
        );
      }
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to generate email.');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopySubject = () => {
    if (!subject) return;
    navigator.clipboard.writeText(subject);
    setCopiedSubject(true);
    showNotification('success', 'Subject copied to clipboard!');
    setTimeout(() => setCopiedSubject(false), 2000);
  };

  const handleCopyBody = () => {
    if (!bodyText) return;
    navigator.clipboard.writeText(bodyText);
    setCopiedBody(true);
    showNotification('success', 'Email body copied to clipboard!');
    setTimeout(() => setCopiedBody(false), 2000);
  };

  const handleSendEmail = async () => {
    if (!recruiterEmail.trim()) {
      showNotification('error', 'Recipient email is required.');
      return;
    }
    if (!subject.trim()) {
      showNotification('error', 'Email subject cannot be empty.');
      return;
    }
    if (!bodyText.trim()) {
      showNotification('error', 'Email body cannot be empty.');
      return;
    }

    if (!gmailStatus?.isConnected) {
      showNotification(
        'error',
        'Gmail is not connected. Please connect your Gmail account in Settings before sending.',
        'Gmail OAuth Required'
      );
      setIsConfirmSendOpen(false);
      return;
    }

    try {
      setSending(true);
      setIsConfirmSendOpen(false);

      await api.sendEmail({
        recipientEmail: recruiterEmail,
        recipientName: recruiterName,
        company: companyName,
        jobRole,
        purpose,
        subject,
        bodyText,
        bodyHtml: bodyHtml || undefined,
        saveContact,
      });

      showNotification(
        'success',
        `Email successfully delivered to ${recruiterEmail} via your Gmail account!`,
        'Email Sent'
      );

      // Refresh contacts list
      api.getContacts().then(setContacts).catch(() => {});
    } catch (err: any) {
      showNotification(
        'error',
        err.message || 'Failed to send email through Gmail.',
        'Send Failed'
      );
    } finally {
      setSending(false);
    }
  };

  const handleClear = () => {
    if (confirm('Are you sure you want to clear the composer?')) {
      setRecruiterName('');
      setRecruiterEmail('');
      setCompanyName('');
      setJobRole('');
      setAdditionalNotes('');
      setSubject('');
      setBodyText('');
      setBodyHtml('');
      setProviderUsed(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner Alert if Gmail Not Connected */}
      {!gmailStatus?.isConnected && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Gmail is not connected:</strong> You can compose and generate AI emails now,
              but you must connect Gmail in Settings to send directly.
            </span>
          </div>
          <a
            href="#settings"
            onClick={e => {
              e.preventDefault();
              window.location.hash = 'settings';
            }}
            className="font-bold underline text-amber-800 shrink-0 ml-4 hover:text-amber-950"
          >
            Go to Settings →
          </a>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Recruiter Details & AI Trigger (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Recruiter Information</h2>
                <p className="text-xs text-slate-500">Who are you reaching out to?</p>
              </div>

              {contacts.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsContactsModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <Users className="w-3.5 h-3.5 text-slate-500" />
                  <span>Saved Contacts ({contacts.length})</span>
                </button>
              )}
            </div>

            <div className="space-y-4 text-xs">
              {/* Recruiter Email (Required) */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Recruiter Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="e.g. recruiter@google.com"
                  value={recruiterEmail}
                  onChange={e => setRecruiterEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400"
                  required
                />
              </div>

              {/* Recruiter Name */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Recruiter Name <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sarah Jenkins"
                  value={recruiterName}
                  onChange={e => setRecruiterName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Company Name */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Company Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Stripe, Uber"
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400"
                  />
                </div>

                {/* Job Role */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Job Role</label>
                  <input
                    type="text"
                    placeholder="e.g. Frontend Engineer"
                    value={jobRole}
                    onChange={e => setJobRole(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Email Purpose */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Purpose</label>
                <div className="relative">
                  <select
                    value={purpose}
                    onChange={e => setPurpose(e.target.value as EmailPurpose)}
                    className="w-full appearance-none px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white pr-9"
                  >
                    <option value="Internship Application">Internship Application</option>
                    <option value="Full-Time Job Application">Full-Time Job Application</option>
                    <option value="Referral Request">Referral Request</option>
                    <option value="General Job Opportunity">General Job Opportunity</option>
                    <option value="Follow-up Email">Follow-up Email</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Additional Notes / Context */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Job Context / Special Instructions{' '}
                  <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Paste a snippet from the job posting, or special note (e.g. mention experience with Next.js & GraphQL)..."
                  value={additionalNotes}
                  onChange={e => setAdditionalNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400 leading-relaxed resize-none"
                />
              </div>

              {/* Save as contact checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="saveContactCheck"
                  checked={saveContact}
                  onChange={e => setSaveContact(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <label htmlFor="saveContactCheck" className="text-slate-600 font-medium cursor-pointer">
                  Save this recruiter in my Contacts directory
                </label>
              </div>

              {/* AI Generation Button */}
              <button
                type="button"
                onClick={handleGenerate}
                disabled={generating || !recruiterEmail.trim()}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white font-semibold text-sm shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer"
              >
                {generating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Gemini is crafting email...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate with AI</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Active Profile Signature Teaser */}
          <div className="bg-slate-50/80 border border-slate-200/70 rounded-2xl p-4 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">Auto-Injected Links</span>
              <span className="text-[11px] text-slate-400">From My Profile</span>
            </div>
            <div className="text-[11px] text-slate-500 leading-relaxed">
              Name: <strong className="text-slate-700">{profile?.fullName || 'Sourabh Sahu'}</strong>{' '}
              ({profile?.professionalTitle || 'Full Stack Developer'})
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {profile?.resumeUrl && (
                <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 text-[10px] font-medium flex items-center gap-1">
                  Resume <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                </span>
              )}
              {profile?.portfolioUrl && (
                <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 text-[10px] font-medium flex items-center gap-1">
                  Portfolio <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                </span>
              )}
              {profile?.linkedInUrl && (
                <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 text-[10px] font-medium flex items-center gap-1">
                  LinkedIn <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                </span>
              )}
              {profile?.gitHubUrl && (
                <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 text-[10px] font-medium flex items-center gap-1">
                  GitHub <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                </span>
              )}
              {!profile?.resumeUrl &&
                !profile?.portfolioUrl &&
                !profile?.linkedInUrl &&
                !profile?.gitHubUrl && (
                  <span className="text-amber-700 text-[11px]">
                    No links configured yet. Go to My Profile to add them.
                  </span>
                )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Subject, Body, Preview & Send (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
            {/* Header with Mode Toggle & Provider Badge */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900">Email Draft</span>
                {providerUsed && (
                  <Badge variant={providerUsed === 'gemini' ? 'indigo' : 'slate'} size="sm">
                    {providerUsed === 'gemini' ? 'Gemini AI' : 'Smart Template'}
                  </Badge>
                )}
              </div>

              {/* View Switcher: Edit vs HTML Preview */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setViewMode('edit')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                    viewMode === 'edit'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Text</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('preview')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                    viewMode === 'preview'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Recipient Preview</span>
                </button>
              </div>
            </div>

            {/* Subject Field */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">Subject Line</label>
                <button
                  type="button"
                  onClick={handleCopySubject}
                  disabled={!subject}
                  className="text-[11px] font-medium text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors disabled:opacity-40"
                >
                  {copiedSubject ? (
                    <Check className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  <span>{copiedSubject ? 'Copied' : 'Copy Subject'}</span>
                </button>
              </div>
              <input
                type="text"
                placeholder="Subject will be generated automatically, or you can type here..."
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm font-medium rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400 placeholder:font-normal"
              />
            </div>

            {/* Body Editor or Preview */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">Email Message</label>
                <button
                  type="button"
                  onClick={handleCopyBody}
                  disabled={!bodyText}
                  className="text-[11px] font-medium text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors disabled:opacity-40"
                >
                  {copiedBody ? (
                    <Check className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  <span>{copiedBody ? 'Copied' : 'Copy Body'}</span>
                </button>
              </div>

              {viewMode === 'edit' ? (
                <div className="relative">
                  <textarea
                    rows={15}
                    placeholder="Enter recruiter info on the left and click 'Generate with AI', or write your custom email message here..."
                    value={bodyText}
                    onChange={e => setBodyText(e.target.value)}
                    className="w-full p-4 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400 font-sans leading-relaxed resize-y"
                  />
                  <div className="flex justify-between items-center text-[11px] text-slate-400 px-1 pt-1">
                    <span>
                      {bodyText ? bodyText.trim().split(/\s+/).length : 0} words •{' '}
                      {bodyText.length} characters
                    </span>
                    <span>Plain text + clickable links in signature</span>
                  </div>
                </div>
              ) : (
                /* Recruiter Preview: Exact simulated inbox render */
                <div className="border border-slate-200 rounded-xl bg-slate-50/50 p-4 min-h-[360px] overflow-y-auto">
                  <div className="bg-white rounded-lg border border-slate-200/80 p-5 shadow-xs max-w-2xl mx-auto space-y-4">
                    <div className="border-b border-slate-100 pb-3 text-xs space-y-1">
                      <div>
                        <span className="text-slate-400">To:</span>{' '}
                        <span className="font-semibold text-slate-800">
                          {recruiterName ? `${recruiterName} <${recruiterEmail}>` : recruiterEmail || '(Recipient Email)'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400">From:</span>{' '}
                        <span className="font-semibold text-slate-800">
                          {profile?.fullName || 'Sourabh Sahu'} (
                          {gmailStatus?.connectedAccount?.email || 'your-gmail@gmail.com'})
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400">Subject:</span>{' '}
                        <span className="font-semibold text-slate-900">{subject || '(No subject)'}</span>
                      </div>
                    </div>

                    <div className="text-sm text-slate-800 leading-relaxed font-sans whitespace-pre-line">
                      {bodyText || (
                        <div className="text-slate-400 italic py-8 text-center">
                          Generate or write an email to preview how it looks in the recruiter's inbox.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions Bar */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={generating || !recruiterEmail.trim()}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  title="Regenerate email content"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} />
                  <span>Regenerate</span>
                </button>

                <button
                  type="button"
                  onClick={handleClear}
                  className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-600 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  title="Clear composer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              </div>

              {/* Primary Send Button */}
              <button
                type="button"
                onClick={() => setIsConfirmSendOpen(true)}
                disabled={sending || !recruiterEmail.trim() || !subject.trim() || !bodyText.trim()}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-sm shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
              >
                {sending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Sending via Gmail...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Email</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Select Contact Modal */}
      <Modal
        isOpen={isContactsModalOpen}
        onClose={() => setIsContactsModalOpen(false)}
        title="Select Recruiter from Contacts"
        description="Choose a saved recruiter to prefill composer fields"
        maxWidth="lg"
      >
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {contacts.map(c => (
            <div
              key={c._id}
              onClick={() => handleSelectContact(c)}
              className="p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div>
                <div className="font-semibold text-sm text-slate-800 group-hover:text-blue-600">
                  {c.name || c.email}
                </div>
                <div className="text-xs text-slate-500">
                  {c.email} {c.company && `• ${c.company}`} {c.designation && `• ${c.designation}`}
                </div>
              </div>
              <span className="text-xs font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                Select →
              </span>
            </div>
          ))}
        </div>
      </Modal>

      {/* Send Confirmation Safety Modal */}
      <Modal
        isOpen={isConfirmSendOpen}
        onClose={() => setIsConfirmSendOpen(false)}
        title="Confirm Send via Gmail"
        description="Please review recipient details before transmitting"
      >
        <div className="space-y-4 text-xs">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-1.5">
            <div>
              <span className="text-slate-400 font-medium">Recipient:</span>{' '}
              <strong className="text-slate-800">{recruiterEmail}</strong>
            </div>
            {recruiterName && (
              <div>
                <span className="text-slate-400 font-medium">Recruiter:</span>{' '}
                <span className="text-slate-700">{recruiterName}</span>
              </div>
            )}
            {companyName && (
              <div>
                <span className="text-slate-400 font-medium">Company:</span>{' '}
                <span className="text-slate-700">{companyName}</span>
              </div>
            )}
            <div>
              <span className="text-slate-400 font-medium">Subject:</span>{' '}
              <span className="text-slate-700">{subject}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Sending From:</span>{' '}
              <span className="text-slate-700">
                {gmailStatus?.connectedAccount?.email || 'Connected Gmail account'}
              </span>
            </div>
          </div>

          <p className="text-slate-500 leading-relaxed">
            This email will be dispatched directly through your verified Gmail API connection.
            Details will be logged in your Sent History.
          </p>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsConfirmSendOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSendEmail}
              disabled={sending}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Confirm & Send Now</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
