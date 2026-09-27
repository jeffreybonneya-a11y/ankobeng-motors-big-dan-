import React from 'react';
import { 
  Flame, 
  Cog, 
  Wrench, 
  Car, 
  ShieldCheck, 
  Truck 
} from 'lucide-react';
import { SERVICES } from '../data/initialData';

export const ServicesSection: React.FC = () => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Engine':
        return <Flame className="w-5 h-5 text-[#E64A19]" />;
      case 'Cog':
        return <Cog className="w-5 h-5 text-[#E64A19]" />;
      case 'Wrench':
        return <Wrench className="w-5 h-5 text-[#E64A19]" />;
      case 'Car':
        return <Car className="w-5 h-5 text-[#E64A19]" />;
      case 'CheckCircle':
        return <ShieldCheck className="w-5 h-5 text-[#E64A19]" />;
      case 'Truck':
        return <Truck className="w-5 h-5 text-[#E64A19]" />;
      default:
        return <Wrench className="w-5 h-5 text-[#E64A19]" />;
    }
  };

  return (
    <section id="services" className="w-full bg-[#121419] py-16 px-4 sm:px-6 lg:px-8 border-t border-b border-[#2B313E]">
      <div className="max-w-7xl mx-auto flex flex-col gap-10">
        
        {/* Section Header */}
        <div className="flex flex-col max-w-3xl">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-[#E64A19]"></span>
            <span className="font-['Outfit'] text-xs uppercase tracking-widest text-[#E64A19] font-bold">
              AUTOMOTIVE EXPERTISE
            </span>
          </div>
          <h2 className="font-['Outfit'] text-2xl sm:text-3xl lg:text-4xl font-black uppercase text-white tracking-tight mt-1">
            SPECIALIZED ENGINES &amp; TRANSMISSIONS
          </h2>
          <p className="font-['Outfit'] text-sm text-gray-400 mt-2 font-normal">
            All components are authentic European imports, stored in dry, covered workshop facilities in Abossey Okai ready for direct mechanic testing.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((service) => (
            <div
              key={service.id}
              className="p-6 rounded-lg bg-[#161920] border border-[#2B313E] hover:border-gray-500 transition-colors flex flex-col gap-3 shadow-md group"
            >
              <div className="w-11 h-11 rounded bg-[#1E222B] border border-[#2B313E] flex items-center justify-center group-hover:border-[#E64A19]/50 transition-colors">
                {getIcon(service.iconName)}
              </div>
              <h3 className="font-['Outfit'] text-base font-bold uppercase text-white group-hover:text-[#FF5722] transition-colors">
                {service.title}
              </h3>
              <p className="font-['Outfit'] font-normal text-xs sm:text-sm text-gray-400 leading-relaxed">
                {service.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
