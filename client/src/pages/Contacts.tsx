import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  Mail,
  Building,
  Briefcase,
  Edit2,
  Trash2,
  Send,
} from 'lucide-react';
import { api } from '../services/api';
import type { Contact } from '../types';
import { useNotification } from '../context/NotificationContext';
import { Modal } from '../components/common/Modal';

interface ContactsProps {
  onComposeContact: (contact: { name: string; email: string; company: string; role: string }) => void;
}

export const Contacts: React.FC<ContactsProps> = ({ onComposeContact }) => {
  const { showNotification } = useNotification();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [deletingContactId, setDeletingContactId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    designation: '',
    notes: '',
  });

  useEffect(() => {
    loadContacts();
  }, [search]);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const data = await api.getContacts(search);
      setContacts(data);
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingContact(null);
    setFormData({ name: '', email: '', company: '', designation: '', notes: '' });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (c: Contact) => {
    setEditingContact(c);
    setFormData({
      name: c.name || '',
      email: c.email || '',
      company: c.company || '',
      designation: c.designation || '',
      notes: c.notes || '',
    });
    setIsAddModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email.trim()) {
      showNotification('error', 'Recruiter email is required.');
      return;
    }

    try {
      if (editingContact) {
        await api.updateContact(editingContact._id, formData);
        showNotification('success', 'Contact updated successfully.');
      } else {
        await api.createContact(formData);
        showNotification('success', 'Contact added successfully.');
      }
      setIsAddModalOpen(false);
      loadContacts();
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to save contact.');
    }
  };

  const handleDelete = async () => {
    if (!deletingContactId) return;
    try {
      await api.deleteContact(deletingContactId);
      showNotification('success', 'Contact deleted successfully.');
      setDeletingContactId(null);
      loadContacts();
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to delete contact.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Recruiter Directory</h2>
            <p className="text-xs text-slate-500">
              {contacts.length} {contacts.length === 1 ? 'contact' : 'contacts'} saved in database
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search bar */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by name, company, email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Add contact CTA */}
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Contact</span>
          </button>
        </div>
      </div>

      {/* Contacts Data Table / List */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">Loading directory...</div>
        ) : contacts.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <Users className="w-6 h-6" />
            </div>
            <div className="text-sm font-semibold text-slate-800">No contacts found</div>
            <p className="text-xs text-slate-500 max-w-sm">
              {search
                ? `No contacts match "${search}". Try clearing your search.`
                : 'Start adding recruiters, HR managers, and talent acquisition leads to streamline your cold emailing.'}
            </p>
            {!search && (
              <button
                onClick={handleOpenAdd}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Your First Contact</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200/70 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-5">Recruiter</th>
                  <th className="py-3.5 px-4">Company</th>
                  <th className="py-3.5 px-4">Designation</th>
                  <th className="py-3.5 px-4">Notes</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {contacts.map(c => (
                  <tr key={c._id} className="hover:bg-slate-50/60 transition-colors group">
                    <td className="py-3.5 px-5">
                      <div className="font-semibold text-slate-900 text-sm">
                        {c.name || 'Unnamed Recruiter'}
                      </div>
                      <div className="text-slate-500 text-xs flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{c.email}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {c.company ? (
                        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          <span>{c.company}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {c.designation ? (
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                          <span>{c.designation}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 max-w-xs truncate text-slate-500">
                      {c.notes || '-'}
                    </td>

                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Quick Compose CTA */}
                        <button
                          onClick={() =>
                            onComposeContact({
                              name: c.name || '',
                              email: c.email,
                              company: c.company || '',
                              role: c.designation || '',
                            })
                          }
                          className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                          title="Open in Composer"
                        >
                          <Send className="w-3 h-3" />
                          <span>Compose</span>
                        </button>

                        <button
                          onClick={() => handleOpenEdit(c)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                          title="Edit Contact"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setDeletingContactId(c._id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Contact"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Add / Edit Contact Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingContact ? 'Edit Recruiter Contact' : 'Add New Recruiter Contact'}
        description="Prevent duplicate entries and manage recruiter profiles"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Recruiter Email <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              placeholder="e.g. recruiter@company.com"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Recruiter Name</label>
            <input
              type="text"
              placeholder="e.g. Emily Watson"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Company</label>
              <input
                type="text"
                placeholder="e.g. Microsoft"
                value={formData.company}
                onChange={e => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Designation</label>
              <input
                type="text"
                placeholder="e.g. Senior Tech Recruiter"
                value={formData.designation}
                onChange={e => setFormData({ ...formData, designation: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Notes / Context</label>
            <textarea
              rows={3}
              placeholder="e.g. Connected on LinkedIn; Hiring for Summer 2025 backend roles..."
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400 resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs transition-colors cursor-pointer"
            >
              {editingContact ? 'Save Changes' : 'Create Contact'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deletingContactId)}
        onClose={() => setDeletingContactId(null)}
        title="Delete Contact"
        description="Are you sure you want to remove this contact from your directory?"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            This action cannot be undone. You will need to re-enter this recruiter's information
            manually in the future.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setDeletingContactId(null)}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-xs transition-colors cursor-pointer"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
