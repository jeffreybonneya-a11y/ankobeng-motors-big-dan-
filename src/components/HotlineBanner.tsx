import React from 'react';
import { Phone, ShoppingBag } from 'lucide-react';
import { BUSINESS_INFO } from '../data/initialData';

interface HotlineBannerProps {
  onOpenOrderModal: () => void;
}

export const HotlineBanner: React.FC<HotlineBannerProps> = ({ onOpenOrderModal }) => {
  return (
    <aside className="w-full bg-[#13161C] border-b border-[#2B313E] py-2.5 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E64A19] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#E64A19]"></span>
          </span>
          <span className="font-['Outfit'] text-xs uppercase tracking-wider text-gray-300 font-bold">
            BIG DAN HOTLINE (ACCRA YARD):
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <a
            href={`tel:${BUSINESS_INFO.phones.primary}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#1E222B] border border-[#2B313E] hover:bg-[#252B36] text-gray-200 font-['Outfit'] text-xs font-bold transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-[#E64A19]" />
            <span>{BUSINESS_INFO.phones.primary}</span>
          </a>

          <a
            href={`tel:${BUSINESS_INFO.phones.secondary}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#1E222B] border border-[#2B313E] hover:bg-[#252B36] text-gray-200 font-['Outfit'] text-xs font-bold transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-[#E64A19]" />
            <span>{BUSINESS_INFO.phones.secondary}</span>
          </a>

          <button
            onClick={onOpenOrderModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-[#E64A19] hover:bg-[#D84315] text-white font-['Outfit'] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            <ShoppingBag className="w-3 h-3" />
            <span>ORDER DESK</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
