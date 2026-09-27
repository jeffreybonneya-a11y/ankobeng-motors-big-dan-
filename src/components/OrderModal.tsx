import React, { useState, useEffect } from 'react';
import { X, Phone, MessageSquare, ShoppingBag, CheckCircle2 } from 'lucide-react';
import { BUSINESS_INFO } from '../data/initialData';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName?: string;
}

export const OrderModal: React.FC<OrderModalProps> = ({
  isOpen,
  onClose,
  productName = ''
}) => {
  const [phone, setPhone] = useState('');
  const [part, setPart] = useState(productName);
  const [vehicle, setVehicle] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (productName) {
      setPart(productName);
    }
    setSubmitted(false);
  }, [productName, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleWhatsAppInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const cleanPhone = '233244148534';

    let messageText = `Hello Ankobeng Motors (Big Dan),\n\nI want to place an order/inquiry for:\n- Part: ${part || 'Automotive Engine Part'}`;
    if (vehicle.trim()) {
      messageText += `\n- Vehicle: ${vehicle.trim()}`;
    }
    if (phone.trim()) {
      messageText += `\n- Phone: ${phone.trim()}`;
    }

    const textMsg = encodeURIComponent(messageText);

    setTimeout(() => {
      window.open(`https://wa.me/${cleanPhone}?text=${textMsg}`, '_blank');
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      {/* Overlay backdrop click */}
      <div className="fixed inset-0" onClick={onClose}></div>

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-[#161920] border border-[#2B313E] rounded-xl shadow-2xl p-6 z-10 flex flex-col gap-5">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#2B313E] pb-3">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#E64A19]" />
            <span className="font-['Outfit'] text-base sm:text-lg font-bold uppercase text-white">
              PLACE ENGINE &amp; PART ORDER
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="w-8 h-8 rounded-md bg-[#1E222B] hover:bg-[#252B36] border border-[#2B313E] flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Fast Action Hotline */}
        <div className="p-3 rounded-lg bg-[#1E222B] border border-[#2B313E] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex flex-col">
            <span className="font-['Outfit'] text-[10px] uppercase text-[#E64A19] font-bold">
              URGENT SHOP FLOOR CONFIRMATION
            </span>
            <span className="font-['Outfit'] text-xs text-gray-300 font-normal">
              Call Big Dan directly for real-time yard stock.
            </span>
          </div>
          <a
            href={`tel:${BUSINESS_INFO.phones.primary}`}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-[#E64A19] hover:bg-[#D84315] text-white font-['Outfit'] text-xs font-bold uppercase shrink-0 transition-colors"
          >
            <Phone className="w-3 h-3" />
            <span>0244 148 534</span>
          </a>
        </div>

        {/* Modal Form */}
        {submitted ? (
          <div className="p-6 rounded-md bg-[#1E222B] border border-[#E64A19] flex flex-col items-center text-center gap-2">
            <CheckCircle2 className="w-10 h-10 text-[#E64A19]" />
            <span className="font-['Outfit'] text-base font-bold text-white uppercase">
              Connecting with Big Dan...
            </span>
            <p className="font-['Outfit'] text-xs text-gray-300 font-normal">
              Your inquiry for <strong className="text-white">{part}</strong> is opening in WhatsApp.
            </p>
          </div>
        ) : (
          <form onSubmit={handleWhatsAppInquiry} className="flex flex-col gap-3.5">
            <div className="flex flex-col gap-1">
              <label className="font-['Outfit'] text-[11px] font-bold uppercase text-gray-300">
                Engine / Part Required <span className="text-[#E64A19]">*</span>
              </label>
              <input
                type="text"
                required
                value={part}
                onChange={(e) => setPart(e.target.value)}
                placeholder="e.g. OPEL 1.4, OPEL DIESEL 1.7, GEARBOX"
                className="bg-[#1E222B] border border-[#2B313E] rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E64A19] font-['Outfit']"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="font-['Outfit'] text-[11px] font-bold uppercase text-gray-300">
                  Vehicle Details <span className="text-gray-500 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={vehicle}
                  onChange={(e) => setVehicle(e.target.value)}
                  placeholder="e.g. Opel Astra 2007"
                  className="bg-[#1E222B] border border-[#2B313E] rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E64A19] font-['Outfit']"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-['Outfit'] text-[11px] font-bold uppercase text-gray-300">
                  Phone Number <span className="text-gray-500 font-normal">(Optional)</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 0244123456"
                  className="bg-[#1E222B] border border-[#2B313E] rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E64A19] font-mono"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-md bg-[#E64A19] hover:bg-[#D84315] text-white font-['Outfit'] text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>CONFIRM ORDER VIA WHATSAPP</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
