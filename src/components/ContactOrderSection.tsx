import React, { useState } from 'react';
import { Phone, Send, CheckCircle2, Clock, MapPin } from 'lucide-react';
import { BUSINESS_INFO } from '../data/initialData';

interface ContactOrderSectionProps {
  prefilledPart?: string;
}

export const ContactOrderSection: React.FC<ContactOrderSectionProps> = ({ prefilledPart }) => {
  const [formData, setFormData] = useState({
    phone: '',
    vehicle: '',
    part: prefilledPart || '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  React.useEffect(() => {
    if (prefilledPart) {
      setFormData((prev) => ({ ...prev, part: prefilledPart }));
    }
  }, [prefilledPart]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    
    const cleanPhone = '233244148534';
    let text = `Hello Ankobeng Motors (Big Dan),\n\nI want to order/inquire about:\n- Part: ${formData.part || 'Engine Parts'}`;
    if (formData.vehicle.trim()) {
      text += `\n- Vehicle: ${formData.vehicle.trim()}`;
    }
    if (formData.phone.trim()) {
      text += `\n- Phone: ${formData.phone.trim()}`;
    }
    if (formData.message.trim()) {
      text += `\n- Note: ${formData.message.trim()}`;
    }

    const textMsg = encodeURIComponent(text);

    setTimeout(() => {
      window.open(`https://wa.me/${cleanPhone}?text=${textMsg}`, '_blank');
    }, 800);
  };

  return (
    <section id="contact" className="w-full bg-[#121419] py-16 px-4 sm:px-6 lg:px-8 border-t border-[#2B313E]">
      <div className="max-w-7xl mx-auto flex flex-col gap-10">
        
        {/* Header */}
        <div className="flex flex-col max-w-3xl">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-[#E64A19]"></span>
            <span className="font-['Outfit'] text-xs uppercase tracking-widest text-[#E64A19] font-bold">
              DIRECT DESK &amp; DISPATCH
            </span>
          </div>
          <h2 className="font-['Outfit'] text-2xl sm:text-3xl lg:text-4xl font-black uppercase text-white tracking-tight mt-1">
            PLACE ORDER &amp; INQUIRIES
          </h2>
          <p className="font-['Outfit'] font-normal text-sm text-gray-400 mt-2">
            Contact Big Dan directly for instant inventory confirmation, mechanic measurements, pricing, and workshop pickup or dispatch across Ghana.
          </p>
        </div>

        {/* 2-Column Contact Info + Order Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Direct Phone Numbers & Physical Details */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            
            {/* Primary Hotline Box */}
            <div className="p-6 rounded-lg bg-[#161920] border border-[#2B313E] flex flex-col gap-4 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-[#1E222B] border border-[#2B313E] flex items-center justify-center text-[#E64A19]">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-['Outfit'] text-[10px] uppercase text-[#E64A19] font-bold tracking-wider">
                    DIRECT CALL LINES
                  </span>
                  <span className="font-['Outfit'] text-base font-bold text-white uppercase">
                    Big Dan Order Desk
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2 border-t border-[#2B313E]">
                <a
                  href={`tel:${BUSINESS_INFO.phones.primary}`}
                  className="flex items-center justify-between p-3 rounded bg-[#1E222B] hover:bg-[#252B36] border border-[#2B313E] transition-colors"
                >
                  <span className="font-['Outfit'] text-sm font-bold text-white">
                    {BUSINESS_INFO.phones.primary}
                  </span>
                  <span className="font-['Outfit'] text-[11px] uppercase text-[#E64A19] font-bold">
                    PRIMARY LINE →
                  </span>
                </a>

                <a
                  href={`tel:${BUSINESS_INFO.phones.secondary}`}
                  className="flex items-center justify-between p-3 rounded bg-[#1E222B] hover:bg-[#252B36] border border-[#2B313E] transition-colors"
                >
                  <span className="font-['Outfit'] text-sm font-bold text-white">
                    {BUSINESS_INFO.phones.secondary}
                  </span>
                  <span className="font-['Outfit'] text-[11px] uppercase text-[#E64A19] font-bold">
                    OFFICE LINE →
                  </span>
                </a>
              </div>
            </div>

            {/* Operating Hours & Address */}
            <div className="p-6 rounded-lg bg-[#161920] border border-[#2B313E] flex flex-col gap-4 shadow-lg">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#E64A19] shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <span className="font-['Outfit'] text-xs font-bold uppercase text-white">
                    Physical Address
                  </span>
                  <span className="font-['Outfit'] text-xs text-gray-300 mt-0.5 font-normal">
                    {BUSINESS_INFO.address.landmark}
                  </span>
                  <span className="font-['Outfit'] text-xs text-gray-400 font-normal">
                    {BUSINESS_INFO.address.poBox}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-3 border-t border-[#2B313E]">
                <Clock className="w-5 h-5 text-[#E64A19] shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <span className="font-['Outfit'] text-xs font-bold uppercase text-white">
                    Yard Operating Hours
                  </span>
                  <span className="font-['Outfit'] text-xs text-gray-300 mt-0.5 font-normal">
                    {BUSINESS_INFO.workingHours.regular}
                  </span>
                  <span className="font-['Outfit'] text-xs text-gray-400 font-normal">
                    {BUSINESS_INFO.workingHours.sunday}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Direct Order Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 rounded-lg bg-[#161920] border border-[#2B313E] shadow-xl flex flex-col gap-6">
              
              <div className="flex flex-col gap-1 border-b border-[#2B313E] pb-4">
                <h3 className="font-['Outfit'] text-lg sm:text-xl font-bold uppercase text-white">
                  SPECIFY YOUR ENGINE OR PART ORDER
                </h3>
                <span className="font-['Outfit'] text-xs text-gray-400 font-normal">
                  Specify the required engine or part to check warehouse inventory and connect directly with Big Dan.
                </span>
              </div>

              {submitted ? (
                <div className="p-8 rounded-md bg-[#1E222B] border border-[#E64A19] flex flex-col items-center text-center gap-3 animate-fadeIn">
                  <CheckCircle2 className="w-12 h-12 text-[#E64A19]" />
                  <h4 className="font-['Outfit'] text-lg font-bold uppercase text-white">
                    Inquiry Prepared
                  </h4>
                  <p className="font-['Outfit'] text-xs text-gray-300 max-w-md font-normal">
                    Connecting you directly to Big Dan with your inquiry for: <strong className="text-white">{formData.part || 'Engine Parts'}</strong>.
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <a
                      href={`tel:${BUSINESS_INFO.phones.primary}`}
                      className="px-4 py-2 rounded bg-[#E64A19] text-white font-['Outfit'] text-xs font-bold uppercase"
                    >
                      Call Desk ({BUSINESS_INFO.phones.primary})
                    </a>
                    <button
                      type="button"
                      onClick={() => setSubmitted(false)}
                      className="px-4 py-2 rounded bg-[#161920] border border-[#2B313E] text-gray-300 font-['Outfit'] text-xs font-bold uppercase cursor-pointer"
                    >
                      New Inquiry
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  {/* Required Part Field */}
                  <div className="flex flex-col gap-1.5">
                    <label className="font-['Outfit'] text-xs font-bold uppercase text-gray-300">
                      Required Engine or Part <span className="text-[#E64A19]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. OPEL 1.4 / OPEL DIESEL 1.7 / COMPLETE GEARBOX"
                      value={formData.part}
                      onChange={(e) => setFormData({ ...formData, part: e.target.value })}
                      className="bg-[#1E222B] border border-[#2B313E] rounded-md px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#E64A19] transition-colors font-['Outfit']"
                    />
                  </div>

                  {/* Optional Vehicle and Phone Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-['Outfit'] text-xs font-bold uppercase text-gray-300">
                        Vehicle Make, Model &amp; Year <span className="text-gray-500 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Opel Astra 2008 / Chevrolet Aveo"
                        value={formData.vehicle}
                        onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
                        className="bg-[#1E222B] border border-[#2B313E] rounded-md px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#E64A19] transition-colors font-['Outfit']"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-['Outfit'] text-xs font-bold uppercase text-gray-300">
                        Phone Number <span className="text-gray-500 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="tel"
                        placeholder="e.g. 0244 000 000"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="bg-[#1E222B] border border-[#2B313E] rounded-md px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#E64A19] transition-colors font-mono"
                      />
                    </div>
                  </div>

                  {/* Optional Notes Field */}
                  <div className="flex flex-col gap-1.5">
                    <label className="font-['Outfit'] text-xs font-bold uppercase text-gray-300">
                      Additional Notes / Delivery Location <span className="text-gray-500 font-normal">(Optional)</span>
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Specify if you require delivery in Accra, mechanic testing on site, gearbox matching, etc."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="bg-[#1E222B] border border-[#2B313E] rounded-md px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#E64A19] transition-colors resize-none font-['Outfit']"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-md bg-[#E64A19] hover:bg-[#D84315] text-white font-['Outfit'] text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-[0.99]"
                  >
                    <Send className="w-4 h-4" />
                    <span>SEND ORDER INQUIRY TO BIG DAN VIA WHATSAPP</span>
                  </button>
                </form>
              )}

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
