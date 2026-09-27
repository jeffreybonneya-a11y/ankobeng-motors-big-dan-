import React, { useState, useEffect, useRef } from 'react';
import { MapPin, PhoneCall, ChevronLeft, ChevronRight, ShoppingBag, Package } from 'lucide-react';
import { Product } from '../types/inventory';
import { BUSINESS_INFO } from '../data/initialData';
import { 
  subscribeToHomepageContent, 
  HomepageContentData, 
  getCloudinaryVideoPoster, 
  getCacheBustedUrl 
} from '../services/homepage';

interface HeroProps {
  products: Product[];
  onOpenOrderModal: (productName?: string) => void;
  onViewInventory: () => void;
}

export const Hero: React.FC<HeroProps> = ({ products, onOpenOrderModal, onViewInventory }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [homepageData, setHomepageData] = useState<HomepageContentData | null>(null);
  const [activeMedia, setActiveMedia] = useState<{
    type: 'image' | 'video';
    url: string;
    posterUrl: string;
  } | null>(null);
  const touchStartX = useRef<number | null>(null);

  // Realtime subscription to homepage content & background
  useEffect(() => {
    const unsub = subscribeToHomepageContent((data) => {
      setHomepageData(data);

      if (!data) {
        setActiveMedia(null);
        return;
      }

      const rawUrl = data.backgroundUrl || data.heroBackground || '';
      if (!rawUrl) {
        setActiveMedia(null);
        return;
      }

      const mediaType = data.backgroundType || (rawUrl.match(/\.(mp4|webm)$/i) ? 'video' : 'image');
      const poster = data.backgroundPosterUrl || getCloudinaryVideoPoster(rawUrl);
      const cacheBusted = getCacheBustedUrl(rawUrl, data.updatedAt);

      if (mediaType === 'image') {
        // Preload new image before switching
        const img = new Image();
        img.src = cacheBusted;
        img.onload = () => {
          setActiveMedia({
            type: 'image',
            url: cacheBusted,
            posterUrl: ''
          });
        };
        img.onerror = () => {
          setActiveMedia({
            type: 'image',
            url: cacheBusted,
            posterUrl: ''
          });
        };
      } else {
        // Video media type: initialize with poster & autoplay
        setActiveMedia({
          type: 'video',
          url: cacheBusted,
          posterUrl: poster
        });
      }
    });
    return () => unsub();
  }, []);

  // Auto-slide transition
  useEffect(() => {
    if (isPaused || products.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % products.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [isPaused, products.length]);

  const currentProduct = products[currentIndex] || products[0];

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 40) {
      // Swipe left -> next
      setCurrentIndex((prev) => (prev + 1) % products.length);
    } else if (diff < -40) {
      // Swipe right -> prev
      setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
    }
    touchStartX.current = null;
  };

  return (
    <section className="relative w-full bg-[#0F1115] border-b border-[#2B313E] overflow-hidden pt-20">
      {/* Background Media Container (Image or Video) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {activeMedia ? (
          activeMedia.type === 'video' ? (
            <video
              key={activeMedia.url}
              src={activeMedia.url}
              poster={activeMedia.posterUrl}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              className="w-full h-full object-cover object-center brightness-[0.75] contrast-[1.05]"
            />
          ) : (
            <img
              key={activeMedia.url}
              src={activeMedia.url}
              alt="Ankobeng Motors Homepage Background"
              className="w-full h-full object-cover object-[center_30%] brightness-[0.75] contrast-[1.05] transition-opacity duration-500"
              referrerPolicy="no-referrer"
            />
          )
        ) : (
          /* Clean neutral fallback when no background is configured */
          <div className="w-full h-full bg-[#0F1115]">
            <div className="w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1C202A] via-[#12141A] to-[#0F1115]" />
          </div>
        )}

        {/* Measured Scrim for WCAG AA readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0F1115]/95 via-[#0F1115]/80 to-[#0F1115]/50"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F1115] via-transparent to-black/40"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Headline & Business Identity */}
          <div className="lg:col-span-7 flex flex-col gap-5 sm:gap-6 drop-shadow-md">
            
            {/* Location Tag */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-xs bg-[#E64A19]"></span>
              <span className="font-['Outfit'] text-xs uppercase tracking-widest text-[#E64A19] font-bold">
                {homepageData?.heroBadge || 'ABOSSEY OKAI, ACCRA'}
              </span>
              <span className="text-gray-500 font-bold">•</span>
              <span className="font-['Outfit'] text-xs uppercase tracking-wider text-gray-300 font-semibold">
                {homepageData?.subheadline || 'BIG DAN DIRECT DISPATCH'}
              </span>
            </div>

            {/* Main Headline with Outfit bold typography */}
            <h1 className="font-['Outfit'] font-black uppercase tracking-tight text-white text-3xl sm:text-4xl md:text-5xl lg:text-5xl leading-[1.12]">
              {homepageData?.headline ? (
                <span>{homepageData.headline}</span>
              ) : (
                <>DEALERS IN <span className="text-[#E64A19]">OPEL ENGINES</span> &amp; ALL KINDS OF ENGINE PARTS</>
              )}
            </h1>

            {/* Supporting Description */}
            <p className="font-['Outfit'] font-normal text-sm sm:text-base text-gray-300 max-w-2xl leading-relaxed">
              {homepageData?.supportingText || 'Direct importers and stockists of authentic European Opel engines, manual and automatic gearboxes, cylinder heads, crankshafts, and multi-brand automotive replacement assemblies in Abossey Okai.'}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={onViewInventory}
                className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 rounded-md bg-[#E64A19] hover:bg-[#D84315] text-white font-['Outfit'] text-xs uppercase tracking-wider font-bold transition-all shadow-lg active:scale-[0.98] cursor-pointer"
              >
                <Package className="w-4 h-4" />
                <span>{homepageData?.primaryButtonText || 'VIEW INVENTORY'}</span>
              </button>

              <button
                onClick={() => onOpenOrderModal()}
                className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 rounded-md bg-[#1E222B] hover:bg-[#252B36] border border-[#2B313E] text-white font-['Outfit'] text-xs uppercase tracking-wider font-bold transition-all shadow-md active:scale-[0.98] cursor-pointer"
              >
                <PhoneCall className="w-4 h-4 text-[#E64A19]" />
                <span>{homepageData?.secondaryButtonText || 'PLACE ORDER'}</span>
              </button>
            </div>

            {/* Quick Yard Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-[#2B313E]/80">
              <div className="flex items-center gap-3 p-3 rounded-md bg-[#161920]/90 border border-[#2B313E] backdrop-blur-sm">
                <div className="w-9 h-9 rounded bg-[#202530] border border-[#2B313E] flex items-center justify-center text-[#E64A19] shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-['Outfit'] text-[10px] uppercase text-gray-400 font-bold tracking-wider">
                    PHYSICAL SHOP YARD
                  </span>
                  <span className="font-['Outfit'] text-xs text-gray-200 font-semibold truncate">
                    {BUSINESS_INFO.address.landmark}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-md bg-[#161920]/90 border border-[#2B313E] backdrop-blur-sm">
                <div className="w-9 h-9 rounded bg-[#202530] border border-[#2B313E] flex items-center justify-center text-[#E64A19] shrink-0">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-['Outfit'] text-[10px] uppercase text-gray-400 font-bold tracking-wider">
                    BIG DAN DIRECT LINES
                  </span>
                  <span className="font-['Outfit'] text-xs text-white font-bold truncate">
                    {BUSINESS_INFO.phones.formatted}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Featured Real Engine Showcase Slideshow */}
          <div className="lg:col-span-5 w-full flex flex-col">
            {products.length > 0 && currentProduct ? (
              <div
                className="w-full rounded-lg border border-[#2B313E] bg-[#161920] p-4 flex flex-col gap-4 shadow-2xl relative"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                {/* Product Image Frame */}
                <div className="relative w-full aspect-square rounded-md overflow-hidden bg-[#101217] border border-[#2B313E] flex items-center justify-center group">
                  <img
                    src={currentProduct.image}
                    alt={currentProduct.name}
                    className="w-full h-full object-contain p-3 transition-transform duration-300 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />

                  {/* Category Tag */}
                  <div className="absolute top-3 left-3 bg-[#111317]/95 border border-[#2B313E] px-2.5 py-1 rounded text-[11px] font-['Outfit'] uppercase font-bold text-gray-300 tracking-wider">
                    {currentProduct.category}
                  </div>

                  {/* Manual Navigation Arrows */}
                  {products.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => setCurrentIndex((prev) => (prev - 1 + products.length) % products.length)}
                        aria-label="Previous engine"
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded bg-[#111317]/80 hover:bg-[#111317] border border-[#2B313E] flex items-center justify-center text-white transition-opacity opacity-70 hover:opacity-100 cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentIndex((prev) => (prev + 1) % products.length)}
                        aria-label="Next engine"
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded bg-[#111317]/80 hover:bg-[#111317] border border-[#2B313E] flex items-center justify-center text-white transition-opacity opacity-70 hover:opacity-100 cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>

                {/* Product Meta & Action */}
                <div className="flex items-center justify-between gap-3 pt-1">
                  <div className="flex flex-col min-w-0">
                    <span className="font-['Outfit'] text-[10px] uppercase tracking-wider text-gray-400 font-bold">
                      PHYSICAL YARD UNIT
                    </span>
                    <span className="font-['Outfit'] text-lg sm:text-xl font-extrabold uppercase text-white truncate">
                      {currentProduct.name}
                    </span>
                  </div>

                  <button
                    onClick={() => onOpenOrderModal(currentProduct.name)}
                    className="px-4 py-2 rounded-md bg-[#E64A19] hover:bg-[#D84315] text-white font-['Outfit'] text-xs font-bold uppercase tracking-wider transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>PLACE ORDER</span>
                  </button>
                </div>

                {/* Subtle Slide Progress Bar Indicators */}
                <div className="flex items-center justify-between pt-2 border-t border-[#2B313E]">
                  <div className="flex items-center gap-1.5 overflow-x-auto max-w-[200px] py-1">
                    {products.map((p, idx) => (
                      <button
                        key={p.id}
                        onClick={() => setCurrentIndex(idx)}
                        aria-label={`Showcase engine ${p.name}`}
                        className={`h-1.5 rounded transition-all cursor-pointer ${
                          idx === currentIndex
                            ? 'w-5 bg-[#E64A19]'
                            : 'w-2 bg-[#1E222B] hover:bg-[#252B36] border border-[#2B313E]'
                        }`}
                      />
                    ))}
                  </div>

                  <span className="font-['Outfit'] text-[10px] uppercase tracking-wider text-gray-400 font-bold">
                    YARD STOCK SHOWCASE
                  </span>
                </div>
              </div>
            ) : (
              <div className="w-full rounded-lg border border-[#2B313E] bg-[#161920] p-6 flex flex-col items-center justify-center text-center gap-3 shadow-2xl">
                <div className="w-14 h-14 rounded-xl bg-[#1E222B] border border-[#2B313E] flex items-center justify-center text-[#E64A19]">
                  <Package className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#E64A19] block">
                    ABOSSEY OKAI DIRECT WAREHOUSE
                  </span>
                  <h3 className="text-base sm:text-lg font-bold uppercase text-white">
                    Direct European Engine Shipments
                  </h3>
                  <p className="text-xs text-gray-400 max-w-sm mx-auto">
                    New engines and parts arriving weekly. Call Big Dan directly to check unlisted yard stock.
                  </p>
                </div>
                <button
                  onClick={() => onOpenOrderModal()}
                  className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#E64A19] hover:bg-[#D84315] text-white font-['Outfit'] text-xs uppercase font-bold tracking-wider transition-colors cursor-pointer"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call Big Dan ({BUSINESS_INFO.phones.primary})</span>
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
};
