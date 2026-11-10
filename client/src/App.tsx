import { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import type { NavItem } from './components/layout/Sidebar';
import { TopNavbar } from './components/layout/TopNavbar';
import { NotificationProvider } from './context/NotificationContext';
import { Dashboard } from './pages/Dashboard';
import { Compose } from './pages/Compose';
import { Contacts } from './pages/Contacts';
import { SentHistory } from './pages/SentHistory';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import { api } from './services/api';
import type { GmailStatus, Profile as ProfileType, EmailPurpose } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<NavItem>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Cross-page state: when composing to a specific recruiter or reusing draft
  const [composeInitialContact, setComposeInitialContact] = useState<{
    name?: string;
    email: string;
    company?: string;
    role?: string;
    purpose?: EmailPurpose;
    subject?: string;
    bodyText?: string;
  } | null>(null);

  // Shared profile and Gmail status
  const [gmailStatus, setGmailStatus] = useState<GmailStatus | undefined>();
  const [userProfile, setUserProfile] = useState<ProfileType | null>(null);

  useEffect(() => {
    // Check initial hash route if any
    const hash = window.location.hash.replace('#', '') as NavItem;
    if (['dashboard', 'compose', 'contacts', 'history', 'profile', 'settings'].includes(hash)) {
      setActiveTab(hash);
    }

    // Refresh header data
    refreshStatus();
  }, []);

  const refreshStatus = async () => {
    try {
      const [status, profile] = await Promise.all([
        api.getAuthStatus(),
        api.getProfile(),
      ]);
      setGmailStatus(status);
      setUserProfile(profile);
    } catch {
      // Quiet fail if server is initializing
    }
  };

  const handleTabChange = (tab: NavItem) => {
    setActiveTab(tab);
    window.location.hash = tab;
    refreshStatus();
  };

  const handleComposeWithContact = (contact: {
    name: string;
    email: string;
    company: string;
    role?: string;
  }) => {
    setComposeInitialContact({
      name: contact.name,
      email: contact.email,
      company: contact.company,
      role: contact.role || '',
      purpose: 'Internship Application',
    });
    handleTabChange('compose');
  };

  const handleReuseEmail = (draft: {
    name?: string;
    email: string;
    company?: string;
    role?: string;
    purpose?: EmailPurpose;
    subject?: string;
    bodyText?: string;
  }) => {
    setComposeInitialContact(draft);
    handleTabChange('compose');
  };

  return (
    <NotificationProvider>
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          isOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />

        {/* Main Content Area */}
        <div className="lg:pl-64 flex flex-col flex-1 min-h-screen">
          {/* Top Navbar */}
          <TopNavbar
            activeTab={activeTab}
            setActiveTab={handleTabChange}
            onOpenMobile={() => setMobileMenuOpen(true)}
            gmailStatus={gmailStatus}
            userName={userProfile?.fullName || 'Sourabh Sahu'}
            userTitle={userProfile?.professionalTitle || 'Full Stack Developer'}
          />

          {/* Page Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            {activeTab === 'dashboard' && (
              <Dashboard
                setActiveTab={handleTabChange}
                onComposeWithContact={handleComposeWithContact}
              />
            )}

            {activeTab === 'compose' && (
              <Compose initialContact={composeInitialContact} />
            )}

            {activeTab === 'contacts' && (
              <Contacts onComposeContact={handleComposeWithContact} />
            )}

            {activeTab === 'history' && (
              <SentHistory onReuseEmail={handleReuseEmail} />
            )}

            {activeTab === 'profile' && <Profile />}

            {activeTab === 'settings' && <Settings />}
          </main>
        </div>
      </div>
    </NotificationProvider>
  );
}

export default App;
