import React, { useState } from 'react';
import { 
  Lock, 
  ShieldAlert, 
  ArrowLeft, 
  Loader2, 
  Phone,
  Eye,
  EyeOff
} from 'lucide-react';
import { loginWithPhone, AdminRecord } from '../../services/auth';

interface AdminLoginProps {
  onBackToSite: () => void;
  onLoginSuccess: (record: AdminRecord) => void;
  initialError?: string | null;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ 
  onBackToSite, 
  onLoginSuccess,
  initialError = null
}) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(initialError);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const record = await loginWithPhone(phone, password);
      onLoginSuccess(record);
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid phone number or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1115] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-['Outfit'] text-gray-200 antialiased">
      
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
        
        {/* Brand Header */}
        <div className="text-center mb-8 flex flex-col items-center gap-1.5">
          <div className="w-14 h-14 rounded-xl bg-[#1E222B] border border-[#2B313E] flex items-center justify-center text-[#E64A19] mb-2 shadow-xl">
            <Lock className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
            ANKOBENG MOTORS (BIG DAN)
          </h1>
          <span className="text-xs uppercase tracking-widest text-[#E64A19] font-bold">
            Admin Dashboard
          </span>
        </div>

        {/* Login Card */}
        <div className="bg-[#161920] border border-[#2B313E] py-8 px-6 sm:px-10 rounded-xl shadow-2xl">
          
          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-lg bg-[#251818] border border-red-800/80 flex items-center gap-3 text-red-300 text-xs animate-fadeIn">
              <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
              <span className="font-semibold text-xs text-red-300">{errorMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            
            {/* Phone Number Field */}
            <div className="space-y-1.5">
              <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="phone"
                  type="text"
                  required
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder=""
                  className="w-full bg-[#111317] border border-[#2B313E] rounded-md pl-10 pr-3.5 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#E64A19] transition-colors font-mono"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder=""
                  className="w-full bg-[#111317] border border-[#2B313E] rounded-md pl-10 pr-10 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#E64A19] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 cursor-pointer p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-md bg-[#E64A19] hover:bg-[#D84315] disabled:opacity-60 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xl cursor-pointer active:scale-[0.99]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <span>LOGIN</span>
                )}
              </button>
            </div>

          </form>

        </div>

      </div>
    </div>
  );
};
