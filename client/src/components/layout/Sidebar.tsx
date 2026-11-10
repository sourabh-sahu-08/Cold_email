import React from 'react';
import {
  LayoutDashboard,
  Send,
  Users,
  History,
  UserCircle,
  Settings,
  Mail,
  ExternalLink,
} from 'lucide-react';

export type NavItem = 'dashboard' | 'compose' | 'contacts' | 'history' | 'profile' | 'settings';

interface SidebarProps {
  activeTab: NavItem;
  setActiveTab: (tab: NavItem) => void;
  isOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  onCloseMobile,
}) => {
  const navItems = [
    { id: 'dashboard' as NavItem, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'compose' as NavItem, label: 'Compose Email', icon: Send, badge: 'AI' },
    { id: 'contacts' as NavItem, label: 'Contacts', icon: Users },
    { id: 'history' as NavItem, label: 'Sent History', icon: History },
    { id: 'profile' as NavItem, label: 'My Profile', icon: UserCircle },
    { id: 'settings' as NavItem, label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-30 lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/30">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-lg tracking-tight flex items-center gap-1.5">
                ColdMail
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/60">
                  Pro
                </span>
              </div>
              <div className="text-[11px] text-slate-600 -mt-0.5 font-medium">Personal Cold Outreach</div>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
            Main Menu
          </div>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-50/80 text-blue-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-blue-600' : 'text-slate-600'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer profile teaser */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/60">
          <div
            onClick={() => {
              setActiveTab('profile');
              onCloseMobile();
            }}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-white hover:shadow-xs border border-transparent hover:border-slate-200/80 transition-all cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-full bg-linear-to-tr from-blue-600 to-indigo-600 text-white font-semibold flex items-center justify-center text-sm shadow-xs">
              SS
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                Sourabh Sahu
              </div>
              <div className="text-xs text-slate-600 truncate font-medium">Full Stack Developer</div>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-600 group-hover:text-blue-600" />
          </div>
        </div>
      </aside>
    </>
  );
};
