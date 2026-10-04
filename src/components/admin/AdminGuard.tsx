import React, { useEffect, useState, useCallback } from 'react';
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

  const checkSession = useCallback(async () => {
    setLoading(true);
    try {
      const record = await verifyAdminSession();
      setAdminRecord(record);
    } catch {
      setAdminRecord(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

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
          Verifying Admin Session...
        </span>
      </div>
    );
  }

  // Unauthenticated -> Render Admin Login
  if (!adminRecord) {
    return (
      <AdminLogin
        onBackToSite={onNavigateToPublic}
        onLoginSuccess={(record) => setAdminRecord(record)}
      />
    );
  }

  // Authenticated -> Render Full Admin CMS Dashboard
  return (
    <AdminDashboardLayout
      adminRecord={adminRecord}
      onNavigateToPublic={onNavigateToPublic}
      onSignOut={handleLogout}
    />
  );
};
