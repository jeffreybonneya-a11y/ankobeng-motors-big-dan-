import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  MessageSquare, 
  Save, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Sliders, 
  ShieldCheck,
  PhoneCall
} from 'lucide-react';
import { 
  WhatsAppSettings, 
  GeneralSettings,
  subscribeToWhatsAppSettings, 
  saveWhatsAppSettings,
  getGeneralSettings,
  saveGeneralSettings
} from '../../services/settings';

export const SettingsManager: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // WhatsApp Settings (settings/whatsapp)
  const [whatsappPhone, setWhatsappPhone] = useState('233244148534');
  const [whatsappMessage, setWhatsappMessage] = useState('Hello Big Dan, I am inquiring about engine parts at Ankobeng Motors.');
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [businessHoursOnly, setBusinessHoursOnly] = useState(false);

  // General Settings (settings/general)
  const [dealershipName, setDealershipName] = useState('ANKOBENG MOTORS (BIG DAN)');
  const [contactEmail, setContactEmail] = useState('');
  const [allowDirectOrders, setAllowDirectOrders] = useState(true);

  // Subscribe to realtime WhatsApp settings
  useEffect(() => {
    let isMounted = true;

    const unsubscribe = subscribeToWhatsAppSettings(
      (data) => {
        if (!isMounted) return;
        if (data) {
          setWhatsappPhone(data.phoneNumber || '233244148534');
          setWhatsappMessage(data.defaultMessage || 'Hello Big Dan, I am inquiring about engine parts at Ankobeng Motors.');
          setWhatsappEnabled(data.enabled !== false);
          setBusinessHoursOnly(Boolean(data.businessHoursOnly));
        }
        setLoading(false);
      },
      (err) => {
        console.warn('Realtime WhatsApp settings error:', err);
        setLoading(false);
      }
    );

    // Also load general settings
    getGeneralSettings().then((gen) => {
      if (!isMounted || !gen) return;
      setDealershipName(gen.dealershipName || 'ANKOBENG MOTORS (BIG DAN)');
      setContactEmail(gen.contactEmail || '');
      setAllowDirectOrders(gen.allowDirectOrders !== false);
    }).catch(() => {});

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!whatsappPhone.trim()) {
      setFeedback({ type: 'error', message: 'WhatsApp phone number cannot be empty.' });
      return;
    }

    setIsSaving(true);
    setFeedback(null);

    try {
      // 1. Save WhatsApp settings to settings/whatsapp
      await saveWhatsAppSettings({
        phoneNumber: whatsappPhone.trim(),
        defaultMessage: whatsappMessage.trim(),
        enabled: whatsappEnabled,
        businessHoursOnly
      });

      // 2. Save General settings to settings/general
      await saveGeneralSettings({
        dealershipName: dealershipName.trim(),
        contactEmail: contactEmail.trim(),
        allowDirectOrders
      });

      setFeedback({
        type: 'success',
        message: 'Settings successfully saved to Firestore (settings/whatsapp & settings/general)!'
      });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to save settings.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 font-['Outfit'] text-gray-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-[#E64A19]" />
            <span>Settings &amp; Integration CMS</span>
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Configure WhatsApp inquiry routing, online ordering toggles, and system preferences.
          </p>
        </div>

        <span className="text-[11px] font-mono text-gray-400 bg-[#161920] px-3 py-1.5 rounded border border-[#2B313E] shrink-0">
          Target: <strong className="text-white">settings/whatsapp</strong>
        </span>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div className={`p-3.5 rounded-lg border flex items-center justify-between gap-3 text-xs ${
          feedback.type === 'success'
            ? 'bg-[#15251a] border-emerald-800 text-emerald-300'
            : 'bg-[#251818] border-red-800 text-red-300'
        }`}>
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button 
            onClick={() => setFeedback(null)} 
            className="text-[11px] font-bold uppercase underline hover:text-white cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {loading ? (
        <div className="p-16 rounded-xl bg-[#161920] border border-[#2B313E] flex flex-col items-center justify-center gap-3 shadow-xl">
          <Loader2 className="w-8 h-8 animate-spin text-[#E64A19]" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Streaming Settings...
          </span>
        </div>
      ) : (
        <form onSubmit={handleSave} className="bg-[#161920] border border-[#2B313E] rounded-xl p-6 sm:p-8 space-y-6 shadow-xl max-w-4xl">
          
          {/* Section 1: WhatsApp Integration (settings/whatsapp) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#2B313E] pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp Dispatch &amp; Inquiries (<code className="font-mono text-emerald-400">settings/whatsapp</code>)</span>
              </h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={whatsappEnabled}
                  onChange={(e) => setWhatsappEnabled(e.target.checked)}
                  className="w-4 h-4 accent-[#E64A19] rounded cursor-pointer"
                />
                <span className="text-xs font-bold uppercase text-white">Enable WhatsApp Feature</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                  WhatsApp Contact Number <span className="text-[#E64A19]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={whatsappPhone}
                  onChange={(e) => setWhatsappPhone(e.target.value)}
                  placeholder="e.g. 233244148534 (with country code)"
                  className="w-full bg-[#1E222B] border border-[#2B313E] rounded px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#E64A19]"
                />
                <p className="text-[11px] text-gray-400">
                  International format without '+' prefix (e.g. 233244148534 for Ghana).
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                  Dispatch Hours Option
                </label>
                <label className="flex items-center gap-2 p-2.5 rounded bg-[#1E222B] border border-[#2B313E] cursor-pointer mt-1">
                  <input
                    type="checkbox"
                    checked={businessHoursOnly}
                    onChange={(e) => setBusinessHoursOnly(e.target.checked)}
                    className="w-4 h-4 accent-[#E64A19] rounded cursor-pointer"
                  />
                  <span className="text-xs text-gray-300">Show notice outside regular yard working hours</span>
                </label>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                  Default Pre-filled WhatsApp Inquiry Message
                </label>
                <textarea
                  rows={2}
                  value={whatsappMessage}
                  onChange={(e) => setWhatsappMessage(e.target.value)}
                  placeholder="Hello Big Dan, I am inquiring about engine parts at Ankobeng Motors."
                  className="w-full bg-[#1E222B] border border-[#2B313E] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E64A19] resize-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: General System Settings (settings/general) */}
          <div className="space-y-4 pt-3 border-t border-[#2B313E]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white border-b border-[#2B313E] pb-2 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#E64A19]" />
              <span>General System Preferences (<code className="font-mono text-gray-400">settings/general</code>)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                  Dealership Brand Name
                </label>
                <input
                  type="text"
                  value={dealershipName}
                  onChange={(e) => setDealershipName(e.target.value)}
                  placeholder="ANKOBENG MOTORS (BIG DAN)"
                  className="w-full bg-[#1E222B] border border-[#2B313E] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E64A19]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                  Notification Email (Optional)
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="admin@ankobengmotors.com"
                  className="w-full bg-[#1E222B] border border-[#2B313E] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E64A19]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="flex items-center gap-2 p-3 rounded bg-[#1E222B] border border-[#2B313E] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowDirectOrders}
                    onChange={(e) => setAllowDirectOrders(e.target.checked)}
                    className="w-4 h-4 accent-[#E64A19] rounded cursor-pointer"
                  />
                  <div>
                    <span className="block text-xs font-bold uppercase text-white">Enable Direct Part Orders Modal</span>
                    <span className="text-[11px] text-gray-400">Allows website visitors to trigger the "Place Order / Inquiry" popup</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-[#2B313E] flex items-center justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-md bg-[#E64A19] hover:bg-[#D84315] disabled:opacity-60 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-lg cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving to Firestore...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save All Settings</span>
                </>
              )}
            </button>
          </div>

        </form>
      )}

    </div>
  );
};
