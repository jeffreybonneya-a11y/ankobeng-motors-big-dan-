import React from 'react';
import { MapPin, Mail, Clock, Phone } from 'lucide-react';
import { BUSINESS_INFO } from '../data/initialData';

export const Footer: React.FC = () => {
  const scrollTo = (id: string) => {
    const el = document.querySelector(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="w-full bg-[#0D0F13] text-gray-300 pt-16 pb-12 border-t border-[#2B313E]">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-[#2B313E]">
          
          {/* Col 1: Brand Info */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col">
              <span className="font-['Outfit'] text-xl font-black uppercase text-white tracking-tight">
                {BUSINESS_INFO.name}
              </span>
              <span className="font-['Outfit'] text-xs uppercase tracking-widest text-[#E64A19] font-bold">
                {BUSINESS_INFO.subTitle}
              </span>
            </div>
            <p className="font-['Outfit'] text-xs text-gray-400 leading-relaxed font-normal">
              Dealers in authentic European Opel engines, manual &amp; automatic transmissions, cylinder heads, crankshafts, and multi-brand automotive replacement assemblies in Accra, Ghana.
            </p>
          </div>

          {/* Col 2: Yard Location */}
          <div className="flex flex-col gap-3">
            <span className="font-['Outfit'] text-xs font-bold uppercase tracking-wider text-white">
              YARD LOCATION
            </span>
            <div className="flex flex-col gap-2 font-['Outfit'] text-xs text-gray-400 font-normal">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#E64A19] shrink-0 mt-0.5" />
                <span>{BUSINESS_INFO.address.landmark}</span>
              </div>
              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-[#E64A19] shrink-0 mt-0.5" />
                <span>P.O. {BUSINESS_INFO.address.poBox}</span>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-[#E64A19] shrink-0 mt-0.5" />
                <span>
                  {BUSINESS_INFO.workingHours.regular}
                  <br />
                  {BUSINESS_INFO.workingHours.sunday}
                </span>
              </div>
            </div>
          </div>

          {/* Col 3: Direct Contact */}
          <div className="flex flex-col gap-3">
            <span className="font-['Outfit'] text-xs font-bold uppercase tracking-wider text-white">
              DIRECT CONTACT
            </span>
            <div className="flex flex-col gap-2 font-['Outfit'] text-xs text-gray-400 font-normal">
              <a
                href={`tel:${BUSINESS_INFO.phones.primary}`}
                className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
              >
                <Phone className="w-4 h-4 text-[#E64A19]" />
                <span>+233 (0) 244 148 534 (Big Dan)</span>
              </a>
              <a
                href={`tel:${BUSINESS_INFO.phones.secondary}`}
                className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
              >
                <Phone className="w-4 h-4 text-[#E64A19]" />
                <span>+233 (0) 277 649 509 (Office)</span>
              </a>
            </div>
          </div>

          {/* Col 4: Quick Navigation */}
          <div className="flex flex-col gap-3">
            <span className="font-['Outfit'] text-xs font-bold uppercase tracking-wider text-white">
              QUICK NAVIGATION
            </span>
            <nav className="flex flex-col gap-1.5 font-['Outfit'] text-xs">
              <button
                onClick={() => scrollTo('#inventory')}
                className="text-left text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                OPEL ENGINES
              </button>
              <button
                onClick={() => scrollTo('#services')}
                className="text-left text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                TRANSMISSIONS &amp; GEARBOXES
              </button>
              <button
                onClick={() => scrollTo('#about')}
                className="text-left text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                ABOUT THE WORKSHOP
              </button>
              <button
                onClick={() => scrollTo('#location')}
                className="text-left text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                LOCATION &amp; MAP
              </button>
              <button
                onClick={() => scrollTo('#contact')}
                className="text-left text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                ORDER DESK
              </button>
            </nav>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 font-['Outfit'] text-xs text-gray-500">
          <span>
            &copy; {new Date().getFullYear()} ANKOBENG MOTORS (BIG DAN). ABOSSEY OKAI, ACCRA. ALL RIGHTS RESERVED.
          </span>
          <div className="flex items-center gap-3">
            <span>GENUINE EUROPEAN IMPORTS</span>
            <span>•</span>
            <span>ACCRA, GHANA</span>
            <span>•</span>
            <a 
              href="#admin" 
              className="text-gray-600 hover:text-gray-400 transition-colors uppercase text-[11px] font-bold"
              title="Dealership Admin Portal"
            >
              Staff Portal
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};
