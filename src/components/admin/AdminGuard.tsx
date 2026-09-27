import React, { useEffect, useState, useCallback } from 'react';
import { User } from 'firebase/auth';
import { Loader2 } from 'lucide-react';
import { 
  subscribeToAuth, 
  signOutAdmin, 
  isAuthorizedAdminEmail, 
  ALLOWED_ADMIN_EMAIL,
  AdminRecord 
} from '../../services/auth';
import { AdminLogin } from './AdminLogin';
import { AdminDashboardLayout } from './AdminDashboardLayout';

interface AdminGuardProps {
  onNavigateToPublic: () => void;
}

export const AdminGuard: React.FC<AdminGuardProps> = ({ onNavigateToPublic }) => {
  const [user, setUser] = useState<User | null>(null);
  const [adminRecord, setAdminRecord] = useState<AdminRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [authErrorMessage, setAuthErrorMessage] = useState<string | null>(null);

  const verifyUser = useCallback(async (currentUser: User | null) => {
    setLoading(true);

    if (!currentUser) {
      setUser(null);
      setAdminRecord(null);
      setLoading(false);
      return;
    }

    const email = currentUser.email || '';

    // Check if authenticated email strictly matches 10362581@upsamail.edu.gh
    if (isAuthorizedAdminEmail(email)) {
      setUser(currentUser);
      setAdminRecord({
        email,
        displayName: currentUser.displayName || 'Big Dan Admin',
        role: 'superadmin',
        active: true
      });
      setAuthErrorMessage(null);
      setLoading(false);
    } else {
      // Reject and immediately sign out unauthorized Google account
      try {
        await signOutAdmin();
      } catch (err) {
        console.error('Sign-out error:', err);
      }
      setUser(null);
      setAdminRecord(null);
      setAuthErrorMessage(
        `Access Denied: Google account "${email || 'Unknown'}" is not authorized. Only ${ALLOWED_ADMIN_EMAIL} can access the administration portal.`
      );
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToAuth((currentUser, isAuthorized) => {
      if (!currentUser) {
        setUser(null);
        setAdminRecord(null);
        setLoading(false);
        return;
      }

      if (isAuthorized) {
        setUser(currentUser);
        setAdminRecord({
          email: currentUser.email || ALLOWED_ADMIN_EMAIL,
          displayName: currentUser.displayName || 'Big Dan Admin',
          role: 'superadmin',
          active: true
        });
        setAuthErrorMessage(null);
        setLoading(false);
      } else {
        verifyUser(currentUser);
      }
    });

    return () => unsubscribe();
  }, [verifyUser]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F1115] flex flex-col items-center justify-center font-['Outfit'] text-gray-200">
        <Loader2 className="w-8 h-8 text-[#E64A19] animate-spin mb-3" />
        <span className="text-xs uppercase font-bold tracking-wider text-gray-400">
          Verifying Google Admin Authorization...
        </span>
      </div>
    );
  }

  // Not signed in OR rejected unauthorized account
  if (!user || !adminRecord) {
    return (
      <AdminLogin
        onBackToSite={onNavigateToPublic}
        onLoginSuccess={() => {}}
        initialError={authErrorMessage}
      />
    );
  }

  // Authorized Admin: 10362581@upsamail.edu.gh
  return (
    <AdminDashboardLayout
      user={user}
      adminRecord={adminRecord}
      onNavigateToPublic={onNavigateToPublic}
    />
  );
};
