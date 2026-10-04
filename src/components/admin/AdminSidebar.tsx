import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Tag, 
  Sliders, 
  Home, 
  Building2, 
  Image as ImageIcon, 
  Settings as SettingsIcon, 
  ExternalLink, 
  LogOut, 
  ShieldCheck,
  X
} from 'lucide-react';
import { AdminRecord } from '../../services/auth';

export type AdminTab = 
  | 'overview' 
  | 'products' 
  | 'categories' 
  | 'heroSlides' 
  | 'homepage' 
  | 'businessInfo' 
  | 'media' 
  | 'settings';

interface AdminSidebarProps {
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  onNavigateToPublic: () => void;
  onSignOut: () => void;
  adminEmail?: string;
  adminPhone?: string;
  adminRecord: AdminRecord;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentTab,
  onSelectTab,
  onNavigateToPublic,
  onSignOut,
  adminEmail,
  adminRecord,
  mobileOpen,
  onCloseMobile
}) => {
  const navItems: { id: AdminTab; label: string; icon: React.FC<{ className?: string }>; description: string }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, description: 'System status & metrics' },
    { id: 'products', label: 'Products', icon: Package, description: 'Engine & parts inventory' },
    { id: 'categories', label: 'Categories', icon: Tag, description: 'Opel, Toyota, Nissan, etc.' },
    { id: 'heroSlides', label: 'Hero Slides', icon: Sliders, description: 'Homepage carousel banners' },
    { id: 'homepage', label: 'Homepage', icon: Home, description: 'Headline & section blocks' },
    { id: 'businessInfo', label: 'Business Information', icon: Building2, description: 'Contacts, phone & yard location' },
    { id: 'media', label: 'Media', icon: ImageIcon, description: 'Image assets library' },
    { id: 'settings', label: 'Settings', icon: SettingsIcon, description: 'Website configuration' },
  ];

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between bg-[#111317] border-r border-[#2B313E] font-['Outfit'] select-none">
      
      {/* Brand Header */}
      <div className="p-5 border-b border-[#2B313E]">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-black text-lg uppercase tracking-tight text-white">
              ANKOBENG MOTORS
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-[#E64A19]"></span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#E64A19]">
                BIG DAN • ADMIN CMS
              </span>
            </div>
          </div>
          {mobileOpen && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded bg-[#1E222B] text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-gray-500">
          Admin Sections
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectTab(item.id);
                if (mobileOpen) onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-md text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer text-left ${
                isActive
                  ? 'bg-[#E64A19] text-white shadow-sm'
                  : 'text-gray-300 hover:bg-[#1A1E26] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#E64A19]'}`} />
                <span className="truncate">{item.label}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Current Admin Information & Actions */}
      <div className="p-4 border-t border-[#2B313E] space-y-3 bg-[#0D0F13]">
        
        {/* Admin Card */}
        <div className="p-3 rounded-lg bg-[#161920] border border-[#2B313E] flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#1E222B] border border-[#2B313E] flex items-center justify-center text-[#E64A19] font-bold text-xs shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white truncate">
                {adminRecord.displayName || 'Big Dan Admin'}
              </span>
            </div>
            <span className="text-[11px] text-gray-400 truncate block font-mono">
              {adminRecord.phone || adminEmail || '0244148534'}
            </span>
          </div>
        </div>

        {/* Action Buttons: Live Site & Sign Out */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onNavigateToPublic}
            title="View Public Website"
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded bg-[#1E222B] hover:bg-[#252B36] border border-[#2B313E] text-[11px] font-bold uppercase tracking-wider text-gray-300 hover:text-white transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3 h-3 text-[#E64A19]" />
            <span className="truncate">Public Site</span>
          </button>

          <button
            onClick={onSignOut}
            title="Sign Out"
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded bg-[#251818] hover:bg-[#321e1e] border border-red-900/50 text-[11px] font-bold uppercase tracking-wider text-red-300 hover:text-white transition-colors cursor-pointer"
          >
            <LogOut className="w-3 h-3" />
            <span>Sign Out</span>
          </button>
        </div>

      </div>

    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] shadow-2xl z-50">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
