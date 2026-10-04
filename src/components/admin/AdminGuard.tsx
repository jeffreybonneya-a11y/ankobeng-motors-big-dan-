import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { 
  verifyAdminSession,
  signOutAdmin, 
  AdminRecord 
} from '../../services/auth';
import { AdminLogin } from './AdminLogin';
import { AdminDashboardLayout } from './AdminDashboardLayout';

interface AdminGuardProps {
  onNavigateToPublic: () => void;
}

export const AdminGuard: React.FC<AdminGuardProps> = ({ onNavigateToPublic }) => {
  const [adminRecord, setAdminRecord] = useState<AdminRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function check() {
      try {
        const record = await verifyAdminSession();
        if (active) {
          setAdminRecord(record);
          setLoading(false);
        }
      } catch (err) {
        if (active) {
          setAdminRecord(null);
          setLoading(false);
        }
      }
    }
    check();
    return () => {
      active = false;
    };
  }, []);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOutAdmin();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setAdminRecord(null);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F1115] flex flex-col items-center justify-center font-['Outfit'] text-gray-200">
        <Loader2 className="w-8 h-8 text-[#E64A19] animate-spin mb-3" />
        <span className="text-xs uppercase font-bold tracking-wider text-gray-400">
          Verifying Admin Authorization...
        </span>
      </div>
    );
  }

  // Unauthenticated or unauthorized -> Render Admin Login
  if (!adminRecord || !adminRecord.active) {
    return (
      <AdminLogin
        onBackToSite={onNavigateToPublic}
        onLoginSuccess={(record) => {
          setAdminRecord(record);
          setLoading(false);
        }}
      />
    );
  }

  // Authenticated & Authorized -> Render Full Admin CMS Dashboard
  return (
    <AdminDashboardLayout
      adminRecord={adminRecord}
      onNavigateToPublic={onNavigateToPublic}
      onSignOut={handleLogout}
    />
  );
};
