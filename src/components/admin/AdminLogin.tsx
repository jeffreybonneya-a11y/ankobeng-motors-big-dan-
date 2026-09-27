import React, { useState } from 'react';
import { 
  Lock, 
  ShieldAlert, 
  ArrowLeft, 
  Loader2, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { signInWithGoogle, ALLOWED_ADMIN_EMAIL } from '../../services/auth';

interface AdminLoginProps {
  onBackToSite: () => void;
  onLoginSuccess: () => void;
  initialError?: string | null;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ 
  onBackToSite, 
  onLoginSuccess,
  initialError = null
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(initialError);

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setLoading(true);

    try {
      await signInWithGoogle();
      onLoginSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'Google authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1115] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-['Outfit'] text-gray-200">
      
      {/* Back to Public Website Navigation */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 mb-6">
        <button
          type="button"
          onClick={onBackToSite}
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#E64A19]" />
          <span>Back to Public Website</span>
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        
        {/* Brand Lockup */}
        <div className="text-center mb-8 flex flex-col items-center gap-1.5">
          <div className="w-14 h-14 rounded-xl bg-[#1E222B] border border-[#2B313E] flex items-center justify-center text-[#E64A19] mb-2 shadow-xl">
            <Lock className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
            ANKOBENG MOTORS
          </h1>
          <span className="text-xs uppercase tracking-widest text-[#E64A19] font-bold">
            BIG DAN • ADMIN CMS PORTAL
          </span>
          <p className="text-xs text-gray-400 mt-1 max-w-xs leading-relaxed">
            Restricted dealership administration area. Authorized administrator Google account only.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#161920] border border-[#2B313E] py-8 px-6 sm:px-10 rounded-xl shadow-2xl space-y-6">
          
          {/* Error Message Box */}
          {errorMessage && (
            <div className="p-4 rounded-lg bg-[#251818] border border-red-800/80 flex items-start gap-3 text-red-300 text-xs animate-fadeIn">
              <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <strong className="block font-bold text-red-200 uppercase tracking-wider text-[11px]">
                  Authorization Denied
                </strong>
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Authorized Admin Notice */}
          <div className="p-3.5 rounded-lg bg-[#111317] border border-[#2B313E] space-y-1 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
              Authorized Administrator Account
            </span>
            <code className="text-[#E64A19] font-mono font-bold text-xs block">
              {ALLOWED_ADMIN_EMAIL}
            </code>
          </div>

          {/* Single Google Sign-In Action */}
          <div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-lg bg-white hover:bg-gray-100 disabled:opacity-60 text-gray-900 font-bold text-xs sm:text-sm uppercase tracking-wider transition-all shadow-xl cursor-pointer active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-[#E64A19]" />
                  <span>Verifying Google Account...</span>
                </>
              ) : (
                <>
                  {/* Official Google 'G' Icon */}
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>
          </div>

          {/* Security and Authorization Policy */}
          <div className="pt-4 border-t border-[#2B313E] flex flex-col gap-2 text-center">
            <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-[#E64A19]" />
              <span>Strict Access Control Policy</span>
            </div>
            <p className="text-[11px] text-gray-500 font-normal leading-relaxed">
              Google authentication is restricted exclusively to <strong className="text-gray-400 font-mono">{ALLOWED_ADMIN_EMAIL}</strong>. Any other account will be signed out immediately and denied access.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
