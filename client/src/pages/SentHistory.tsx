import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  Filter,
  Eye,
  RotateCcw,
  Clock,
  Mail,
} from 'lucide-react';
import { api } from '../services/api';
import type { SentEmail, EmailPurpose } from '../types';
import { useNotification } from '../context/NotificationContext';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';

interface SentHistoryProps {
  onReuseEmail: (data: {
    name?: string;
    email: string;
    company?: string;
    role?: string;
    purpose?: EmailPurpose;
    subject?: string;
    bodyText?: string;
  }) => void;
}

export const SentHistory: React.FC<SentHistoryProps> = ({ onReuseEmail }) => {
  const { showNotification } = useNotification();

  const [emails, setEmails] = useState<SentEmail[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [filterPurpose, setFilterPurpose] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // View Modal
  const [selectedEmail, setSelectedEmail] = useState<SentEmail | null>(null);

  useEffect(() => {
    loadHistory();
  }, [search, filterPurpose, filterStatus]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const res = await api.getSentHistory({
        search,
        purpose: filterPurpose || undefined,
        status: filterStatus || undefined,
      });
      setEmails(res.emails);
      setTotal(res.total);
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to load sent email history');
    } finally {
      setLoading(false);
    }
  };

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

  const handleReuse = (item: SentEmail) => {
    onReuseEmail({
      name: item.recipientName,
      email: item.recipientEmail,
      company: item.company,
      role: item.jobRole,
      purpose: item.purpose as EmailPurpose,
      subject: item.subject,
      bodyText: item.bodyText,
    });
    showNotification('info', `Draft loaded into composer for ${item.recipientEmail}`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Search & Filter Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Sent Email History</h2>
              <p className="text-xs text-slate-500">
                {total} {total === 1 ? 'record' : 'records'} logged in MongoDB
              </p>
            </div>
          </div>

          {/* Quick Search */}
          <div className="relative sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search subject, company, email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-medium flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>

          <select
            value={filterPurpose}
            onChange={e => setFilterPurpose(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Purposes</option>
            <option value="Internship Application">Internship Application</option>
            <option value="Full-Time Job Application">Full-Time Job Application</option>
            <option value="Referral Request">Referral Request</option>
            <option value="General Job Opportunity">General Job Opportunity</option>
            <option value="Follow-up Email">Follow-up Email</option>
          </select>

          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="Sent">Sent (Delivered)</option>
            <option value="Failed">Failed</option>
          </select>

          {(search || filterPurpose || filterStatus) && (
            <button
              onClick={() => {
                setSearch('');
                setFilterPurpose('');
                setFilterStatus('');
              }}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium ml-2"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">Loading history records...</div>
        ) : emails.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <Clock className="w-6 h-6" />
            </div>
            <div className="text-sm font-semibold text-slate-800">No sent emails recorded</div>
            <p className="text-xs text-slate-500 max-w-sm">
              {search || filterPurpose || filterStatus
                ? 'No emails match the selected filters.'
                : 'Emails sent via ColdMail are securely preserved here with message IDs and full content.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200/70 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-5">Recipient & Company</th>
                  <th className="py-3.5 px-4">Subject Line</th>
                  <th className="py-3.5 px-4">Purpose</th>
                  <th className="py-3.5 px-4">Sent At</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {emails.map(item => (
                  <tr key={item._id} className="hover:bg-slate-50/60 transition-colors group">
                    <td className="py-3.5 px-5">
                      <div className="font-semibold text-slate-900 text-sm">
                        {item.recipientName || item.recipientEmail}
                      </div>
                      <div className="text-slate-500 text-xs flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{item.recipientEmail}</span>
                      </div>
                      {item.company && (
                        <div className="text-slate-400 text-[11px] mt-0.5">
                          {item.company} {item.jobRole && `• ${item.jobRole}`}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 max-w-xs truncate font-medium text-slate-800">
                      {item.subject}
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge variant="blue" size="sm">
                        {item.purpose}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {formatDate(item.sentAt)}
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge
                        variant={item.status === 'Sent' ? 'emerald' : 'rose'}
                        size="sm"
                      >
                        {item.status}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedEmail(item)}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                          title="View Full Email"
                        >
                          <Eye className="w-3 h-3 text-slate-500" />
                          <span>View</span>
                        </button>

                        <button
                          onClick={() => handleReuse(item)}
                          className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                          title="Reuse Email in Composer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Reuse</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Email Modal */}
      <Modal
        isOpen={Boolean(selectedEmail)}
        onClose={() => setSelectedEmail(null)}
        title="Email Details"
        description="Archived transmission record"
        maxWidth="2xl"
      >
        {selectedEmail && (
          <div className="space-y-4 text-xs">
            {/* Meta Header */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900 text-sm">
                  {selectedEmail.subject}
                </span>
                <Badge
                  variant={selectedEmail.status === 'Sent' ? 'emerald' : 'rose'}
                  size="sm"
                >
                  {selectedEmail.status}
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 pt-1">
                <div>
                  <span className="text-slate-400">To:</span>{' '}
                  <span className="font-medium text-slate-800">
                    {selectedEmail.recipientName
                      ? `${selectedEmail.recipientName} (${selectedEmail.recipientEmail})`
                      : selectedEmail.recipientEmail}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Company / Role:</span>{' '}
                  <span className="font-medium text-slate-800">
                    {selectedEmail.company || '-'} / {selectedEmail.jobRole || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Purpose:</span>{' '}
                  <span className="font-medium text-slate-800">{selectedEmail.purpose}</span>
                </div>
                <div>
                  <span className="text-slate-400">Timestamp:</span>{' '}
                  <span className="font-medium text-slate-800">
                    {formatDate(selectedEmail.sentAt)}
                  </span>
                </div>
                {selectedEmail.messageId && (
                  <div className="sm:col-span-2 truncate">
                    <span className="text-slate-400">Gmail Message ID:</span>{' '}
                    <code className="text-[11px] bg-slate-200/60 px-1.5 py-0.5 rounded text-slate-700">
                      {selectedEmail.messageId}
                    </code>
                  </div>
                )}
                {selectedEmail.errorMessage && (
                  <div className="sm:col-span-2 text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">
                    <strong>Error:</strong> {selectedEmail.errorMessage}
                  </div>
                )}
              </div>
            </div>

            {/* Email Body */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Body</label>
              <div className="border border-slate-200 rounded-xl p-4 bg-white max-h-80 overflow-y-auto whitespace-pre-line text-sm text-slate-800 leading-relaxed font-sans">
                {selectedEmail.bodyText}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(selectedEmail.bodyText);
                  showNotification('success', 'Email body copied to clipboard!');
                }}
                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs"
              >
                Copy Content
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedEmail(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium transition-colors"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleReuse(selectedEmail);
                    setSelectedEmail(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reuse in Composer</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
