import React, { useState } from 'react';
import { Phone, Menu, X, ShoppingBag } from 'lucide-react';
import { BUSINESS_INFO } from '../data/initialData';

interface HeaderProps {
  onOpenOrderModal: (productName?: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenOrderModal }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'HOME', href: '#' },
    { label: 'INVENTORY', href: '#inventory' },
    { label: 'SERVICES', href: '#services' },
    { label: 'ABOUT', href: '#about' },
    { label: 'LOCATION', href: '#location' },
    { label: 'CONTACT', href: '#contact' }
  ];

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    if (href === '#') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const el = document.querySelector(href);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#111317]/95 backdrop-blur-md border-b border-[#2B313E]">
      <div className="h-20 w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Lockup with modern geometric font */}
        <a 
          href="#" 
          onClick={(e) => { e.preventDefault(); handleNavClick('#'); }} 
          className="flex flex-col group cursor-pointer"
        >
          <span className="font-['Outfit'] text-xl sm:text-2xl font-extrabold uppercase tracking-tight text-white group-hover:text-gray-100 transition-colors">
            {BUSINESS_INFO.name}
          </span>
          <span className="font-['Outfit'] text-[11px] sm:text-xs uppercase tracking-widest text-[#E64A19] font-bold">
            {BUSINESS_INFO.subTitle}
          </span>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 bg-[#181B22] p-1.5 rounded-md border border-[#2B313E]">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick(link.href);
              }}
              className="px-3.5 py-1.5 rounded text-gray-300 hover:text-white hover:bg-[#1E222B] font-['Outfit'] text-xs font-bold uppercase tracking-wider transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop Direct Call & Order Button */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex flex-col items-end text-right">
            <span className="font-['Outfit'] text-[10px] uppercase tracking-wider text-gray-400 font-bold">
              DIRECT ORDER DESK
            </span>
            <a
              href={`tel:${BUSINESS_INFO.phones.primary}`}
              className="font-['Outfit'] text-xs sm:text-sm font-bold text-gray-200 hover:text-[#E64A19] transition-colors"
            >
              {BUSINESS_INFO.phones.formatted}
            </a>
          </div>
          <button
            onClick={() => onOpenOrderModal()}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#E64A19] hover:bg-[#D84315] text-white font-['Outfit'] text-xs font-bold uppercase tracking-wider rounded-md transition-colors cursor-pointer shadow-md"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>PLACE ORDER</span>
          </button>
        </div>

        {/* Mobile Action Controls */}
        <div className="flex md:hidden items-center gap-2">
          <a
            href={`tel:${BUSINESS_INFO.phones.primary}`}
            aria-label="Call Ankobeng Motors"
            className="w-10 h-10 rounded-md bg-[#1E222B] border border-[#2B313E] flex items-center justify-center text-[#E64A19] active:bg-[#252B36]"
          >
            <Phone className="w-5 h-5" />
          </a>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="w-10 h-10 rounded-md bg-[#1E222B] border border-[#2B313E] flex items-center justify-center text-gray-200 hover:text-white active:bg-[#252B36]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden w-full bg-[#111317] border-b border-[#2B313E] px-4 py-4 flex flex-col gap-3 animate-fadeIn">
          <nav className="flex flex-col gap-1.5">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link.href);
                }}
                className="px-3 py-2.5 rounded text-gray-300 hover:bg-[#1E222B] hover:text-white font-['Outfit'] text-xs font-bold uppercase tracking-wider transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex flex-col gap-2 pt-3 border-t border-[#2B313E]">
            <div className="grid grid-cols-2 gap-2">
              <a
                href={`tel:${BUSINESS_INFO.phones.primary}`}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded bg-[#1E222B] border border-[#2B313E] text-white font-['Outfit'] text-xs font-bold active:bg-[#252B36]"
              >
                <Phone className="w-3.5 h-3.5 text-[#E64A19]" />
                {BUSINESS_INFO.phones.primary}
              </a>
              <a
                href={`tel:${BUSINESS_INFO.phones.secondary}`}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded bg-[#1E222B] border border-[#2B313E] text-white font-['Outfit'] text-xs font-bold active:bg-[#252B36]"
              >
                <Phone className="w-3.5 h-3.5 text-[#E64A19]" />
                {BUSINESS_INFO.phones.secondary}
              </a>
            </div>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenOrderModal();
              }}
              className="w-full py-3 bg-[#E64A19] hover:bg-[#D84315] text-white font-['Outfit'] text-xs font-bold uppercase tracking-wider text-center rounded-md transition-colors cursor-pointer shadow-md"
            >
              PLACE ORDER
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
