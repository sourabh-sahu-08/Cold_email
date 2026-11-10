import React from 'react';
import { Menu } from 'lucide-react';
import type { GmailStatus } from '../../types';
import type { NavItem } from './Sidebar';

interface TopNavbarProps {
  onOpenMobile: () => void;
  activeTab: NavItem;
  setActiveTab: (tab: NavItem) => void;
  gmailStatus?: GmailStatus;
  userName?: string;
  userTitle?: string;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  onOpenMobile,
  activeTab,
  setActiveTab,
  gmailStatus,
  userName = 'Sourabh Sahu',
  userTitle = 'Full Stack Developer',
}) => {
  const titles: Record<NavItem, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Dashboard',
      subtitle: 'Overview of your cold outreach performance',
    },
    compose: {
      title: 'Compose Cold Email',
      subtitle: 'Craft personalized recruiter emails powered by AI',
    },
    contacts: {
      title: 'Recruiter Contacts',
      subtitle: 'Manage recruiters, talent managers, and hiring leads',
    },
    history: {
      title: 'Sent Email History',
      subtitle: 'Archive of past outreach messages and delivery statuses',
    },
    profile: {
      title: 'My Profile & Links',
      subtitle: 'Resume, portfolio, and social links inserted into emails',
    },
    settings: {
      title: 'Settings & Integrations',
      subtitle: 'Configure Google OAuth and Gemini API credentials',
    },
  };

  const isConnected = gmailStatus?.isConnected;
  const connectedEmail = gmailStatus?.connectedAccount?.email;

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-20 px-4 sm:px-8 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Mobile menu toggle */}
        <button
          onClick={onOpenMobile}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Page Title & Breadcrumb */}
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
            {titles[activeTab].title}
          </h1>
          <p className="text-xs text-slate-500 hidden sm:block">
            {titles[activeTab].subtitle}
          </p>
        </div>
      </div>

      {/* Right controls: Gmail status & Profile avatar */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Gmail Status Pill */}
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
            isConnected
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/70'
              : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100/70'
          }`}
          title={
            isConnected
              ? `Connected as ${connectedEmail}`
              : 'Gmail not connected. Click to configure in Settings.'
          }
        >
          <span className="relative flex h-2 w-2">
            {isConnected && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            )}
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isConnected ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
          </span>

          <span className="hidden sm:inline font-semibold">
            {isConnected ? 'Gmail Connected' : 'Connect Gmail'}
          </span>
          {isConnected && connectedEmail && (
            <span className="text-[11px] text-emerald-600/80 max-w-[120px] truncate hidden md:inline">
              ({connectedEmail})
            </span>
          )}
        </button>

        {/* User preview */}
        <div
          onClick={() => setActiveTab('profile')}
          className="flex items-center gap-2.5 pl-2 border-l border-slate-200 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-semibold flex items-center justify-center text-xs shadow-xs group-hover:ring-2 group-hover:ring-blue-500 transition-all">
            SS
          </div>
          <div className="hidden xl:block text-left">
            <div className="text-xs font-bold text-slate-800 leading-none group-hover:text-blue-600 transition-colors">
              {userName}
            </div>
            <div className="text-[10px] text-slate-500 leading-none mt-1">{userTitle}</div>
          </div>
        </div>
      </div>
    </header>
  );
};
