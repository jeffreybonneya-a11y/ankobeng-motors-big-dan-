import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Copy, 
  Check, 
  RefreshCw, 
  LogOut, 
  ArrowLeft, 
  Database, 
  Loader2,
  Lock,
  AlertOctagon,
  CheckCircle2,
  Server
} from 'lucide-react';
import { User } from 'firebase/auth';
import { AdminStatusInspection, signOutAdmin } from '../../services/auth';

interface AdminSetupHelperProps {
  user: User;
  inspection: AdminStatusInspection;
  onRecheck: () => Promise<void>;
  onNavigateToPublic: () => void;
}

export const AdminSetupHelper: React.FC<AdminSetupHelperProps> = ({
  user,
  inspection,
  onRecheck,
  onNavigateToPublic
}) => {
  const [copied, setCopied] = useState(false);
  const [checking, setChecking] = useState(false);

  const handleCopyUid = () => {
    navigator.clipboard.writeText(user.uid);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleRecheckClick = async () => {
    setChecking(true);
    try {
      await onRecheck();
    } finally {
      setChecking(false);
    }
  };

  const handleSignOutClick = async () => {
    try {
      await signOutAdmin();
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const isAuthorized = inspection.authorizationResult === 'AUTHORIZED';
  const hasError = Boolean(inspection.errorCode || inspection.errorMessage);

  return (
    <div className="min-h-screen bg-[#0F1115] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-['Outfit'] text-gray-200">
      
      {/* Top back navigation */}
      <div className="sm:mx-auto sm:w-full sm:max-w-xl mb-6 flex items-center justify-between">
        <button
          onClick={onNavigateToPublic}
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#E64A19]" />
          <span>Back to Public Website</span>
        </button>

        <button
          onClick={handleSignOutClick}
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-red-400 hover:text-red-300 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        
        {/* Main Diagnostic Card */}
        <div className="bg-[#161920] border border-[#2B313E] rounded-xl shadow-2xl overflow-hidden">
          
          <div className="p-6 bg-[#111317] border-b border-[#2B313E] flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 shadow-lg ${
              isAuthorized 
                ? 'bg-emerald-950 border-emerald-700 text-emerald-400' 
                : 'bg-[#251e16] border-amber-800/80 text-amber-500'
            }`}>
              {isAuthorized ? <CheckCircle2 className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#E64A19] block">
                ADMIN AUTHORIZATION DIAGNOSTIC PANEL
              </span>
              <h1 className="text-lg sm:text-xl font-black uppercase text-white tracking-tight">
                {isAuthorized ? 'Account Authorized' : 'Authorization Verification Pending'}
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">
                Live inspection details for database connection &amp; authorization status.
              </p>
            </div>
          </div>

          {/* Diagnostic Metrics */}
          <div className="p-6 space-y-6">
            
            <div className="p-4 rounded-lg bg-[#111317] border border-[#2B313E] space-y-3">
              <span className="text-[11px] font-bold uppercase text-gray-400 tracking-wider flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-[#E64A19]" />
                <span>Live Firestore Connection &amp; Auth Diagnostics</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                
                {/* 1. Authenticated Email */}
                <div className="p-2.5 rounded bg-[#1E222B] border border-[#2B313E]">
                  <span className="text-[10px] font-bold uppercase text-gray-400 block">Authenticated Email</span>
                  <span className="font-bold text-white block truncate">{inspection.authenticatedEmail}</span>
                </div>

                {/* 2. Firebase Project ID */}
                <div className="p-2.5 rounded bg-[#1E222B] border border-[#2B313E]">
                  <span className="text-[10px] font-bold uppercase text-gray-400 block">Firebase Project ID</span>
                  <span className="font-mono text-gray-200 block truncate text-[11px]">{inspection.firebaseProjectId}</span>
                </div>

                {/* 3. Firestore Database ID */}
                <div className="p-2.5 rounded bg-[#1E222B] border border-[#2B313E] sm:col-span-2">
                  <span className="text-[10px] font-bold uppercase text-gray-400 block">Firestore Database ID</span>
                  <code className="font-mono text-[#E64A19] font-bold block truncate text-[11px]">
                    {inspection.firestoreDatabaseId}
                  </code>
                </div>

                {/* 4. Expected Firestore Path */}
                <div className="p-2.5 rounded bg-[#1E222B] border border-[#2B313E] sm:col-span-2">
                  <span className="text-[10px] font-bold uppercase text-gray-400 block">Expected Firestore Document Path</span>
                  <code className="font-mono text-emerald-400 font-bold block truncate text-[11px]">
                    {inspection.expectedFirestorePath}
                  </code>
                </div>

                {/* 5. Document Exists */}
                <div className="p-2.5 rounded bg-[#1E222B] border border-[#2B313E]">
                  <span className="text-[10px] font-bold uppercase text-gray-400 block">Document Exists Result</span>
                  <span className={`font-bold text-[11px] ${inspection.documentExists ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {inspection.documentExists ? 'true (Found in Firestore)' : 'false (Not Found)'}
                  </span>
                </div>

                {/* 6. Active Status */}
                <div className="p-2.5 rounded bg-[#1E222B] border border-[#2B313E]">
                  <span className="text-[10px] font-bold uppercase text-gray-400 block">Active Status (`active: true`)</span>
                  <span className={`font-bold text-[11px] ${inspection.activeStatus ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {inspection.activeStatus ? 'true (Active)' : 'false / Missing'}
                  </span>
                </div>

                {/* 7. Read Error Category */}
                <div className="p-2.5 rounded bg-[#1E222B] border border-[#2B313E]">
                  <span className="text-[10px] font-bold uppercase text-gray-400 block">Read Error Status</span>
                  <span className={`font-mono text-[11px] font-bold ${hasError ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {inspection.errorCode ? inspection.errorCode : 'none (Read executed)'}
                  </span>
                </div>

                {/* 8. Authorization Result */}
                <div className="p-2.5 rounded bg-[#1E222B] border border-[#2B313E]">
                  <span className="text-[10px] font-bold uppercase text-gray-400 block">Authorization Status</span>
                  <span className={`font-bold uppercase text-[11px] ${
                    isAuthorized ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {isAuthorized ? 'AUTHORIZED' : 'UNAUTHORIZED'}
                  </span>
                </div>

              </div>

              {/* Firebase UID with 1-Click Copy */}
              <div className="p-3 rounded bg-[#1E222B] border border-[#2B313E] flex items-center justify-between gap-3 mt-2">
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase text-gray-400 block">
                    Firebase Authentication UID (Document ID in `admins`)
                  </span>
                  <code className="text-xs font-mono text-emerald-400 font-bold block truncate">
                    {user.uid}
                  </code>
                </div>
                <button
                  type="button"
                  onClick={handleCopyUid}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#2B313E] hover:bg-[#383F4F] text-white text-xs font-bold uppercase transition-colors cursor-pointer shrink-0"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy UID</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Error Message Details if any */}
            {inspection.errorMessage && (
              <div className="p-3.5 rounded-md bg-[#251818] border border-red-800 text-red-300 text-xs flex items-start gap-2.5">
                <AlertOctagon className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block uppercase font-bold text-[11px]">Firestore Error Details:</strong>
                  <span>{inspection.errorMessage}</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={handleRecheckClick}
                disabled={checking}
                className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-md bg-[#E64A19] hover:bg-[#D84315] disabled:opacity-60 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-lg cursor-pointer"
              >
                {checking ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Executing Fresh Firestore Query...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    <span>Re-check Authorization (Fresh Query)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleSignOutClick}
                className="w-full sm:w-auto px-4 py-3 rounded-md bg-[#1E222B] hover:bg-[#252B36] border border-[#2B313E] text-gray-300 hover:text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer text-center"
              >
                Switch Account
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
