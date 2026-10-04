import React, { useState } from 'react';
import { AdminRecord } from '../../services/auth';
import { AdminSidebar, AdminTab } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { DashboardOverview } from './DashboardOverview';
import { MediaLibrary } from './MediaLibrary';
import { ProductsManager } from './ProductsManager';
import { CategoriesManager } from './CategoriesManager';
import { HeroSlidesManager } from './HeroSlidesManager';
import { HomepageManager } from './HomepageManager';
import { BusinessInfoManager } from './BusinessInfoManager';
import { SettingsManager } from './SettingsManager';

interface AdminDashboardLayoutProps {
  adminRecord: AdminRecord;
  onNavigateToPublic: () => void;
  onSignOut: () => void;
}

export const AdminDashboardLayout: React.FC<AdminDashboardLayoutProps> = ({
  adminRecord,
  onNavigateToPublic,
  onSignOut
}) => {
  const [currentTab, setCurrentTab] = useState<AdminTab>('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0F1115] flex font-['Outfit'] text-gray-200 antialiased selection:bg-[#E64A19] selection:text-white">
      
      {/* 1. Sidebar Navigation */}
      <AdminSidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onNavigateToPublic={onNavigateToPublic}
        onSignOut={onSignOut}
        adminPhone={adminRecord.phone}
        adminRecord={adminRecord}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <AdminHeader
          currentTab={currentTab}
          onOpenMobileMenu={() => setMobileSidebarOpen(true)}
          onNavigateToPublic={onNavigateToPublic}
          adminPhone={adminRecord.phone}
        />

        {/* Tab Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto overflow-y-auto">
          {currentTab === 'overview' && (
            <DashboardOverview
              adminRecord={adminRecord}
              onNavigateTab={setCurrentTab}
            />
          )}

          {currentTab === 'products' && (
            <ProductsManager />
          )}

          {currentTab === 'categories' && (
            <CategoriesManager />
          )}

          {currentTab === 'heroSlides' && (
            <HeroSlidesManager />
          )}

          {currentTab === 'homepage' && (
            <HomepageManager />
          )}

          {currentTab === 'businessInfo' && (
            <BusinessInfoManager />
          )}

          {currentTab === 'media' && (
            <MediaLibrary user={{ uid: 'admin_session', email: adminRecord.phone }} />
          )}

          {currentTab === 'settings' && (
            <SettingsManager />
          )}
        </main>

      </div>

    </div>
  );
};
