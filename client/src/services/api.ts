import type {
  Profile,
  Contact,
  SentEmail,
  DashboardMetrics,
  SettingsData,
  GenerateEmailRequest,
  GeneratedEmailResponse,
  SendEmailPayload,
} from '../types';

const BASE_URL = '/api';

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    ...options,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }

  return data;
}

export const api = {
  // Dashboard
  getDashboardMetrics: async (): Promise<DashboardMetrics> => {
    const res = await fetchJSON<{ success: boolean; data: DashboardMetrics }>('/dashboard/metrics');
    return res.data;
  },

  // Auth / Gmail
  getAuthStatus: async () => {
    const res = await fetchJSON<{ success: boolean; data: any }>('/auth/status');
    return res.data;
  },
  getGoogleAuthUrl: async (): Promise<string> => {
    const res = await fetchJSON<{ success: boolean; authUrl: string }>('/auth/google/url');
    return res.authUrl;
  },
  disconnectGoogle: async () => {
    return await fetchJSON<{ success: boolean; message: string }>('/auth/disconnect', {
      method: 'POST',
    });
  },

  // Profile
  getProfile: async (): Promise<Profile> => {
    const res = await fetchJSON<{ success: boolean; data: Profile }>('/profile');
    return res.data;
  },
  updateProfile: async (profile: Partial<Profile>): Promise<Profile> => {
    const res = await fetchJSON<{ success: boolean; data: Profile }>('/profile', {
      method: 'PUT',
      body: JSON.stringify(profile),
    });
    return res.data;
  },

  // AI Email Generation
  generateEmail: async (params: GenerateEmailRequest): Promise<GeneratedEmailResponse> => {
    const res = await fetchJSON<{ success: boolean; data: GeneratedEmailResponse }>(
      '/ai/generate-email',
      {
        method: 'POST',
        body: JSON.stringify(params),
      }
    );
    return res.data;
  },

  // Email Sending & History
  sendEmail: async (payload: SendEmailPayload): Promise<SentEmail> => {
    const res = await fetchJSON<{ success: boolean; message: string; data: SentEmail }>(
      '/email/send',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
    return res.data;
  },
  getSentHistory: async (params?: {
    search?: string;
    company?: string;
    purpose?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ emails: SentEmail[]; total: number; totalPages: number }> => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.company) query.append('company', params.company);
    if (params?.purpose) query.append('purpose', params.purpose);
    if (params?.status) query.append('status', params.status);
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));

    const res = await fetchJSON<{
      success: boolean;
      data: SentEmail[];
      pagination: { total: number; totalPages: number };
    }>(`/email/history?${query.toString()}`);

    return {
      emails: res.data,
      total: res.pagination?.total || 0,
      totalPages: res.pagination?.totalPages || 1,
    };
  },
  getSentEmailById: async (id: string): Promise<SentEmail> => {
    const res = await fetchJSON<{ success: boolean; data: SentEmail }>(`/email/${id}`);
    return res.data;
  },

  // Contacts
  getContacts: async (search?: string): Promise<Contact[]> => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    const res = await fetchJSON<{ success: boolean; data: Contact[] }>(`/contacts${query}`);
    return res.data;
  },
  createContact: async (contact: Partial<Contact>): Promise<Contact> => {
    const res = await fetchJSON<{ success: boolean; data: Contact }>('/contacts', {
      method: 'POST',
      body: JSON.stringify(contact),
    });
    return res.data;
  },
  updateContact: async (id: string, contact: Partial<Contact>): Promise<Contact> => {
    const res = await fetchJSON<{ success: boolean; data: Contact }>(`/contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(contact),
    });
    return res.data;
  },
  deleteContact: async (id: string): Promise<void> => {
    await fetchJSON<{ success: boolean; message: string }>(`/contacts/${id}`, {
      method: 'DELETE',
    });
  },

  // Settings
  getSettings: async (): Promise<SettingsData> => {
    const res = await fetchJSON<{ success: boolean; data: SettingsData }>('/settings');
    return res.data;
  },
  updateSettings: async (settings: {
    geminiApiKey?: string;
    googleClientId?: string;
    googleClientSecret?: string;
    dailySendLimit?: number;
  }) => {
    return await fetchJSON<{ success: boolean; message: string }>('/settings', {
      method: 'POST',
      body: JSON.stringify(settings),
    });
  },
  testGeminiKey: async (apiKey?: string): Promise<{ message: string; response?: string }> => {
    const res = await fetchJSON<{ success: boolean; message: string; response?: string }>(
      '/settings/test-gemini',
      {
        method: 'POST',
        body: JSON.stringify({ apiKey }),
      }
    );
    return res;
  },
};
