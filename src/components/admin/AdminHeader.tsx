import React from 'react';
import { Menu, ExternalLink, ShieldCheck } from 'lucide-react';
import { AdminTab } from './AdminSidebar';

interface AdminHeaderProps {
  currentTab: AdminTab;
  onOpenMobileMenu: () => void;
  onNavigateToPublic: () => void;
  adminEmail?: string;
  adminPhone?: string;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  currentTab,
  onOpenMobileMenu,
  onNavigateToPublic,
  adminEmail
}) => {
  const getTabTitle = (tab: AdminTab) => {
    switch (tab) {
      case 'overview':
        return 'Dashboard Overview';
      case 'products':
        return 'Products Management';
      case 'categories':
        return 'Categories Management';
      case 'heroSlides':
        return 'Hero Slides Management';
      case 'homepage':
        return 'Homepage Content';
      case 'businessInfo':
        return 'Business Information & Contacts';
      case 'media':
        return 'Media & Image Assets';
      case 'settings':
        return 'System & Admin Settings';
      default:
        return 'Admin Portal';
    }
  };

  return (
    <header className="h-16 bg-[#111317] border-b border-[#2B313E] px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 sticky top-0 z-30 font-['Outfit']">
      
      {/* Left: Mobile Menu Toggle & Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded bg-[#1E222B] border border-[#2B313E] text-gray-300 hover:text-white"
          aria-label="Open mobile navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-gray-400">
            <span>Admin</span>
            <span>/</span>
            <span className="text-[#E64A19]">{currentTab}</span>
          </div>
          <h1 className="text-sm sm:text-base font-black uppercase tracking-tight text-white truncate">
            {getTabTitle(currentTab)}
          </h1>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2.5 shrink-0">
        
        <button
          type="button"
          onClick={onNavigateToPublic}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#1E222B] hover:bg-[#252B36] border border-[#2B313E] text-gray-300 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
        >
          <ExternalLink className="w-3.5 h-3.5 text-[#E64A19]" />
          <span className="hidden sm:inline">View Live Site</span>
        </button>

        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#161920] border border-[#2B313E] text-[11px] text-emerald-400 font-bold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Active Admin</span>
        </div>

      </div>

    </header>
  );
};
