import React from 'react';
import { 
  Package, 
  Tag, 
  Sliders, 
  Home, 
  Building2, 
  Image as ImageIcon, 
  Settings as SettingsIcon, 
  ArrowLeft,
  Clock
} from 'lucide-react';
import { AdminTab } from './AdminSidebar';

interface PlaceholderViewProps {
  tab: AdminTab;
  onNavigateToTab: (tab: AdminTab) => void;
}

export const PlaceholderView: React.FC<PlaceholderViewProps> = ({ tab, onNavigateToTab }) => {
  const getTabInfo = (tabName: AdminTab) => {
    switch (tabName) {
      case 'products':
        return {
          title: 'Products Management',
          icon: Package,
          description: 'Manage engine stock, specifications, automotive category mapping, and pricing availability.'
        };
      case 'categories':
        return {
          title: 'Categories Management',
          icon: Tag,
          description: 'Organize car makes, brand categories (Opel, Toyota, Nissan, etc.), and engine types.'
        };
      case 'heroSlides':
        return {
          title: 'Hero Slides Management',
          icon: Sliders,
          description: 'Configure homepage carousel slides, promotional banners, and featured inventory highlights.'
        };
      case 'homepage':
        return {
          title: 'Homepage Content',
          icon: Home,
          description: 'Manage homepage headlines, feature sections, guarantees, and dynamic callouts.'
        };
      case 'businessInfo':
        return {
          title: 'Business Information & Contacts',
          icon: Building2,
          description: 'Update phone hotlines, Abossey Okai yard address, working hours, and dispatch details.'
        };
      case 'media':
        return {
          title: 'Media & Image Assets',
          icon: ImageIcon,
          description: 'Upload, manage, and optimize engine photographs and workshop asset images.'
        };
      case 'settings':
        return {
          title: 'System & Admin Settings',
          icon: SettingsIcon,
          description: 'Manage dealership configuration, administrator access, and general website settings.'
        };
      default:
        return {
          title: 'Admin Section',
          icon: Clock,
          description: 'This section is ready for development in the next phase.'
        };
    }
  };

  const info = getTabInfo(tab);
  const Icon = info.icon;

  return (
    <div className="p-8 sm:p-10 rounded-lg bg-[#161920] border border-[#2B313E] text-center space-y-5 max-w-2xl mx-auto shadow-xl font-['Outfit']">
      
      <div className="w-14 h-14 rounded-lg bg-[#1E222B] border border-[#2B313E] flex items-center justify-center text-[#E64A19] mx-auto shadow-md">
        <Icon className="w-7 h-7" />
      </div>

      <div className="space-y-2">
        <span className="inline-block px-2.5 py-0.5 rounded bg-[#1E222B] text-gray-400 border border-[#2B313E] text-[10px] font-bold uppercase tracking-wider">
          Section Foundation
        </span>
        <h2 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-white">
          {info.title}
        </h2>
        <p className="text-xs sm:text-sm text-gray-400 max-w-md mx-auto leading-relaxed">
          {info.description}
        </p>
      </div>

      <div className="pt-4 border-t border-[#2B313E] flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => onNavigateToTab('overview')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded bg-[#1E222B] hover:bg-[#252B36] border border-[#2B313E] text-gray-300 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Overview</span>
        </button>
      </div>

    </div>
  );
};
