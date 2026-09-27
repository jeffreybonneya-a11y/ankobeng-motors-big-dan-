import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Save, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Phone, 
  MapPin, 
  Clock, 
  Globe 
} from 'lucide-react';
import { 
  BusinessInfoData, 
  subscribeToBusinessInfo, 
  saveBusinessInfo 
} from '../../services/businessInfo';

export const BusinessInfoManager: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form Fields
  const [businessName, setBusinessName] = useState('');
  const [subTitle, setSubTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [ownerNickname, setOwnerNickname] = useState('');
  const [phone1, setPhone1] = useState('');
  const [phone2, setPhone2] = useState('');
  const [postalAddress, setPostalAddress] = useState('');
  const [location, setLocation] = useState('');
  const [landmark, setLandmark] = useState('');
  const [latitude, setLatitude] = useState(5.547731);
  const [longitude, setLongitude] = useState(-0.217733);
  const [workingHoursRegular, setWorkingHoursRegular] = useState('');
  const [workingHoursSunday, setWorkingHoursSunday] = useState('');

  // Subscribe to realtime business info
  useEffect(() => {
    const unsubscribe = subscribeToBusinessInfo(
      (data) => {
        if (data) {
          setBusinessName(data.businessName || '');
          setSubTitle(data.subTitle || '');
          setTagline(data.tagline || '');
          setOwnerNickname(data.ownerNickname || '');
          setPhone1(data.phone1 || '');
          setPhone2(data.phone2 || '');
          setPostalAddress(data.postalAddress || '');
          setLocation(data.location || '');
          setLandmark(data.landmark || '');
          setLatitude(typeof data.latitude === 'number' ? data.latitude : 5.547731);
          setLongitude(typeof data.longitude === 'number' ? data.longitude : -0.217733);
          setWorkingHoursRegular(data.workingHoursRegular || '');
          setWorkingHoursSunday(data.workingHoursSunday || '');
        } else {
          // Defaults if document doesn't exist yet
          setBusinessName('ANKOBENG MOTORS (BIG DAN)');
          setSubTitle('BIG DAN • ABOSSEY OKAI');
          setTagline('DEALERS IN OPEL ENGINES & ALL KINDS OF ENGINE PARTS');
          setOwnerNickname('Big Dan');
          setPhone1('0244148534');
          setPhone2('0277649509');
          setPostalAddress('Box KN4009, ACCRA');
          setLocation('Near the Post Office, Abossey Okai – Accra');
          setLandmark('Near the Post Office, Abossey Okai – Accra');
          setLatitude(5.547731);
          setLongitude(-0.217733);
          setWorkingHoursRegular('Mon - Sat: 7:30 AM – 6:00 PM');
          setWorkingHoursSunday('Sunday: Emergency Orders Only');
        }
        setLoading(false);
      },
      (err) => {
        console.warn('Realtime business info error:', err);
        setFeedback({ type: 'error', message: 'Failed to stream business info from Firestore.' });
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) {
      setFeedback({ type: 'error', message: 'Business name is required.' });
      return;
    }
    if (!phone1.trim()) {
      setFeedback({ type: 'error', message: 'Primary phone number is required.' });
      return;
    }

    setIsSaving(true);
    setFeedback(null);

    try {
      await saveBusinessInfo({
        businessName: businessName.trim(),
        subTitle: subTitle.trim(),
        tagline: tagline.trim(),
        ownerNickname: ownerNickname.trim(),
        phone1: phone1.trim(),
        phone2: phone2.trim(),
        postalAddress: postalAddress.trim(),
        location: location.trim(),
        landmark: landmark.trim(),
        latitude: Number(latitude) || 5.547731,
        longitude: Number(longitude) || -0.217733,
        workingHoursRegular: workingHoursRegular.trim(),
        workingHoursSunday: workingHoursSunday.trim()
      });

      setFeedback({ 
        type: 'success', 
        message: 'Business information successfully saved to Firestore! Live website and call banners reflect these contacts.' 
      });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to save business info.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 font-['Outfit'] text-gray-200">
      
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-[#E64A19]" />
            <span>Business Information &amp; Hotlines</span>
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Manage contact numbers, Abossey Okai yard address, GPS location coordinates, and working hours.
          </p>
        </div>

        <span className="text-[11px] font-mono text-gray-400 bg-[#161920] px-3 py-1.5 rounded border border-[#2B313E] shrink-0">
          Path: <strong className="text-white">businessInfo/main</strong>
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
            Streaming Business Info...
          </span>
        </div>
      ) : (
        <form onSubmit={handleSave} className="bg-[#161920] border border-[#2B313E] rounded-xl p-6 sm:p-8 space-y-6 shadow-xl">
          
          {/* Section 1: Business Identity */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white border-b border-[#2B313E] pb-2 flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#E64A19]" />
              <span>Dealership Identity &amp; Tagline</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                  Business Name <span className="text-[#E64A19]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. ANKOBENG MOTORS (BIG DAN)"
                  className="w-full bg-[#1E222B] border border-[#2B313E] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E64A19]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                  Owner / Contact Person
                </label>
                <input
                  type="text"
                  value={ownerNickname}
                  onChange={(e) => setOwnerNickname(e.target.value)}
                  placeholder="e.g. Big Dan"
                  className="w-full bg-[#1E222B] border border-[#2B313E] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E64A19]"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                  Business Tagline
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. DEALERS IN OPEL ENGINES &amp; ALL KINDS OF ENGINE PARTS"
                  className="w-full bg-[#1E222B] border border-[#2B313E] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E64A19]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Contact Numbers */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white border-b border-[#2B313E] pb-2 flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#E64A19]" />
              <span>Direct Hotline &amp; Dispatch Phone Lines</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                  Primary Phone Hotline <span className="text-[#E64A19]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={phone1}
                  onChange={(e) => setPhone1(e.target.value)}
                  placeholder="e.g. 0244148534"
                  className="w-full bg-[#1E222B] border border-[#2B313E] rounded px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#E64A19]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                  Secondary Phone / WhatsApp Dispatch
                </label>
                <input
                  type="text"
                  value={phone2}
                  onChange={(e) => setPhone2(e.target.value)}
                  placeholder="e.g. 0277649509"
                  className="w-full bg-[#1E222B] border border-[#2B313E] rounded px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#E64A19]"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Physical Location & GPS */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white border-b border-[#2B313E] pb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#E64A19]" />
              <span>Physical Yard Location &amp; Coordinates</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                  Physical Yard Landmark &amp; Address
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Near the Post Office, Abossey Okai – Accra"
                  className="w-full bg-[#1E222B] border border-[#2B313E] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E64A19]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                  Postal Address
                </label>
                <input
                  type="text"
                  value={postalAddress}
                  onChange={(e) => setPostalAddress(e.target.value)}
                  placeholder="e.g. Box KN4009, ACCRA"
                  className="w-full bg-[#1E222B] border border-[#2B313E] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E64A19]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                    GPS Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={latitude}
                    onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#1E222B] border border-[#2B313E] rounded px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#E64A19]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                    GPS Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={longitude}
                    onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#1E222B] border border-[#2B313E] rounded px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#E64A19]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Working Hours */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white border-b border-[#2B313E] pb-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#E64A19]" />
              <span>Workshop &amp; Warehouse Opening Hours</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                  Regular Working Hours (Mon - Sat)
                </label>
                <input
                  type="text"
                  value={workingHoursRegular}
                  onChange={(e) => setWorkingHoursRegular(e.target.value)}
                  placeholder="e.g. Mon - Sat: 7:30 AM – 6:00 PM"
                  className="w-full bg-[#1E222B] border border-[#2B313E] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E64A19]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                  Sunday / Emergency Hours
                </label>
                <input
                  type="text"
                  value={workingHoursSunday}
                  onChange={(e) => setWorkingHoursSunday(e.target.value)}
                  placeholder="e.g. Sunday: Emergency Orders Only"
                  className="w-full bg-[#1E222B] border border-[#2B313E] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E64A19]"
                />
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
                  <span>Save Business Information</span>
                </>
              )}
            </button>
          </div>

        </form>
      )}

    </div>
  );
};
