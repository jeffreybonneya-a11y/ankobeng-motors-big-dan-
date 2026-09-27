import React from 'react';
import { Store, PlaneTakeoff, Gauge, Phone } from 'lucide-react';
import { BUSINESS_INFO, ASSETS } from '../data/initialData';

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="w-full bg-[#0F1115] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-12">
        
        {/* Section Title */}
        <div className="flex flex-col max-w-3xl">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-[#E64A19]"></span>
            <span className="font-['Outfit'] text-xs uppercase tracking-widest text-[#E64A19] font-bold">
              THE ABOSSEY OKAI STANDARD
            </span>
          </div>
          <h2 className="font-['Outfit'] text-2xl sm:text-3xl lg:text-4xl font-black uppercase text-white tracking-tight mt-1">
            ABOUT ANKOBENG MOTORS
          </h2>
          <p className="font-['Outfit'] font-normal text-sm text-gray-400 mt-2">
            Established in the center of Accra&apos;s primary automotive parts hub, Ankobeng Motors (Big Dan) connects automotive mechanics, commercial drivers, fleet operators, and private vehicle owners with verified European powertrain hardware.
          </p>
        </div>

        {/* 2-Column Visual & Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Storefront Image Card */}
          <div className="lg:col-span-6 flex flex-col gap-3">
            <div className="relative w-full h-[320px] sm:h-[400px] rounded-lg overflow-hidden border border-[#2B313E] shadow-2xl bg-[#161920]">
              <img
                src={ASSETS.storefront}
                alt="Ankobeng Motors Storefront, Abossey Okai Accra"
                className="w-full h-full object-cover brightness-[0.9] contrast-[1.05]"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
              
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-md bg-[#111317]/90 backdrop-blur-sm border border-[#2B313E]">
                <span className="font-['Outfit'] text-[10px] uppercase text-[#E64A19] font-bold tracking-widest">
                  ABOSSEY OKAI DISPATCH CENTER
                </span>
                <p className="font-['Outfit'] text-sm sm:text-base font-bold text-white uppercase mt-0.5">
                  Ankobeng Motors Physical Yard &amp; Loading Bay
                </p>
              </div>
            </div>
          </div>

          {/* Value Highlights */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            
            {/* Highlight 1 */}
            <div className="flex items-start gap-4 p-4 rounded-lg bg-[#161920] border border-[#2B313E]">
              <div className="w-10 h-10 rounded bg-[#1E222B] border border-[#2B313E] flex items-center justify-center text-[#E64A19] shrink-0 mt-1">
                <Store className="w-5 h-5" />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="font-['Outfit'] text-base font-bold uppercase text-white">
                  TRANSPARENT YARD INSPECTION
                </h3>
                <p className="font-['Outfit'] font-normal text-xs text-gray-400 leading-relaxed">
                  Located near the Abossey Okai Post Office. Mechanics and vehicle owners are encouraged to inspect motors directly on the shop floor before purchase.
                </p>
              </div>
            </div>

            {/* Highlight 2 */}
            <div className="flex items-start gap-4 p-4 rounded-lg bg-[#161920] border border-[#2B313E]">
              <div className="w-10 h-10 rounded bg-[#1E222B] border border-[#2B313E] flex items-center justify-center text-[#E64A19] shrink-0 mt-1">
                <PlaneTakeoff className="w-5 h-5" />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="font-['Outfit'] text-base font-bold uppercase text-white">
                  DIRECT EUROPEAN IMPORTS
                </h3>
                <p className="font-['Outfit'] font-normal text-xs text-gray-400 leading-relaxed">
                  Containers received directly from European ports. Low-mileage original factory blocks, manual gearboxes, automatic transmissions, and complete top-end cylinder heads.
                </p>
              </div>
            </div>

            {/* Highlight 3 */}
            <div className="flex items-start gap-4 p-4 rounded-lg bg-[#161920] border border-[#2B313E]">
              <div className="w-10 h-10 rounded bg-[#1E222B] border border-[#2B313E] flex items-center justify-center text-[#E64A19] shrink-0 mt-1">
                <Gauge className="w-5 h-5" />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="font-['Outfit'] text-base font-bold uppercase text-white">
                  OPEL SPECIALIST &amp; MULTI-BRAND
                </h3>
                <p className="font-['Outfit'] font-normal text-xs text-gray-400 leading-relaxed">
                  Specialized in Opel (Astra, Corsa, Vectra, Zafira) with extensive inventory for Nissan, Chevrolet, Daewoo, Hyundai, and Kia assemblies.
                </p>
              </div>
            </div>

            {/* Contact Callout */}
            <div className="pt-2 flex items-center gap-3">
              <a
                href={`tel:${BUSINESS_INFO.phones.primary}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded bg-[#E64A19] hover:bg-[#D84315] text-white font-['Outfit'] text-xs font-bold uppercase tracking-wider transition-colors shadow-md"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>SPEAK WITH BIG DAN</span>
              </a>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
