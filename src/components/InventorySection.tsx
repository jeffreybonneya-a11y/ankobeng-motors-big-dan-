import React, { useState, useMemo } from 'react';
import { Search, Phone, Wrench, Layers } from 'lucide-react';
import { Product } from '../types/inventory';
import { ProductCard } from './ProductCard';
import { BUSINESS_INFO } from '../data/initialData';

interface InventorySectionProps {
  products: Product[];
  onOpenOrderModal: (productName: string) => void;
}

type FilterCategory = 'ALL' | 'OPEL' | 'CHEVROLET' | 'OTHER';

export const InventorySection: React.FC<InventorySectionProps> = ({ products, onOpenOrderModal }) => {
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const matchesCategory = activeCategory === 'ALL' || item.category === activeCategory;
      const matchesSearch =
        searchQuery.trim() === '' ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategory, searchQuery]);

  const categories: { label: string; value: FilterCategory }[] = [
    { label: 'ALL PARTS', value: 'ALL' },
    { label: 'OPEL ENGINES', value: 'OPEL' },
    { label: 'CHEVROLET', value: 'CHEVROLET' },
    { label: 'OTHER BRANDS', value: 'OTHER' }
  ];

  return (
    <section id="inventory" className="w-full bg-[#0F1115] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#2B313E] pb-6">
          <div className="flex flex-col gap-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-[#E64A19]"></span>
              <span className="font-['Outfit'] text-xs uppercase tracking-widest text-[#E64A19] font-bold">
                WORKSHOP &amp; WAREHOUSE STOCK
              </span>
            </div>
            <h2 className="font-['Outfit'] text-2xl sm:text-3xl lg:text-4xl font-black uppercase text-white tracking-tight">
              AVAILABLE ENGINES &amp; PARTS
            </h2>
            <p className="font-['Outfit'] font-normal text-sm text-gray-400">
              Genuine inventory stored at our Abossey Okai yard, Accra. All items available for physical mechanic inspection and on-site collection.
            </p>
          </div>

          {/* Search & Category Filter Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search engine or brand..."
                className="w-full sm:w-56 bg-[#161920] border border-[#2B313E] rounded-md pl-9 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#E64A19] transition-colors font-['Outfit']"
              />
            </div>

            {/* Category Segmented Tabs */}
            <div className="flex items-center gap-1 bg-[#161920] p-1 rounded-md border border-[#2B313E] overflow-x-auto">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setActiveCategory(cat.value)}
                  className={`px-3 py-1.5 rounded font-['Outfit'] text-xs font-bold uppercase whitespace-nowrap transition-colors cursor-pointer ${
                    activeCategory === cat.value
                      ? 'bg-[#E64A19] text-white shadow-sm'
                      : 'text-gray-400 hover:text-white hover:bg-[#1E222B]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOpenOrderModal={onOpenOrderModal}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center rounded-lg bg-[#161920] border border-[#2B313E] flex flex-col items-center justify-center gap-3">
            <Layers className="w-10 h-10 text-gray-500" />
            <span className="font-['Outfit'] text-lg font-bold text-white uppercase">
              No direct matches found
            </span>
            <p className="font-['Outfit'] text-xs text-gray-400 max-w-md">
              We frequently receive new containers at our Abossey Okai yard. Call Big Dan directly to check unlisted workshop inventory.
            </p>
            <a
              href={`tel:${BUSINESS_INFO.phones.primary}`}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded bg-[#E64A19] text-white font-['Outfit'] text-xs font-bold uppercase"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Big Dan ({BUSINESS_INFO.phones.primary})</span>
            </a>
          </div>
        )}

        {/* Custom Engine Inquiry Bar */}
        <div className="p-6 rounded-lg bg-[#161920] border border-[#2B313E] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded bg-[#1E222B] border border-[#2B313E] flex items-center justify-center text-[#E64A19] shrink-0">
              <Wrench className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <h3 className="font-['Outfit'] text-base sm:text-lg font-bold uppercase text-white">
                LOOKING FOR A SPECIFIC ENGINE CODE OR GEARBOX?
              </h3>
              <span className="font-['Outfit'] text-xs text-gray-400 font-normal">
                Tell Big Dan your vehicle model and year. We check warehouse stock and incoming European shipments immediately.
              </span>
            </div>
          </div>

          <a
            href={`tel:${BUSINESS_INFO.phones.primary}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#1E222B] hover:bg-[#252B36] border border-[#2B313E] text-white font-['Outfit'] text-xs uppercase font-bold tracking-wider transition-colors shrink-0 shadow-sm"
          >
            <Phone className="w-4 h-4 text-[#E64A19]" />
            <span>CALL BIG DAN DIRECT</span>
          </a>
        </div>

      </div>
    </section>
  );
};
