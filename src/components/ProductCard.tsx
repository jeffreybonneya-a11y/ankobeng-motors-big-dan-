import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { Product } from '../types/inventory';
import { BUSINESS_INFO } from '../data/initialData';

interface ProductCardProps {
  product: Product;
  onOpenOrderModal: (productName: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenOrderModal }) => {
  return (
    <article className="flex flex-col bg-[#161920] rounded-lg border border-[#2B313E] overflow-hidden hover:border-gray-500 transition-all duration-200 group shadow-lg">
      {/* Product Image Frame */}
      <div className="relative w-full h-64 bg-[#0D0F13] p-4 flex items-center justify-center border-b border-[#2B313E] overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
          referrerPolicy="no-referrer"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 bg-[#111317]/95 border border-[#2B313E] px-2.5 py-0.5 rounded text-[10px] font-['Outfit'] uppercase font-bold text-gray-300 tracking-wider">
          {product.category}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="font-['Outfit'] text-[10px] uppercase tracking-wider text-[#E64A19] font-bold">
            ABOSSEY OKAI YARD
          </span>
          <h3 className="font-['Outfit'] text-lg font-bold uppercase text-white group-hover:text-[#FF5722] transition-colors">
            {product.name}
          </h3>
          <p className="font-['Outfit'] font-normal text-xs text-gray-400 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-[#2B313E]">
          <div className="flex flex-col">
            <span className="font-['Outfit'] text-[10px] uppercase text-gray-400 font-bold">
              CALL DESK
            </span>
            <a
              href={`tel:${BUSINESS_INFO.phones.primary}`}
              className="font-['Outfit'] text-xs font-bold text-gray-200 hover:text-[#E64A19] transition-colors"
            >
              {BUSINESS_INFO.phones.primary}
            </a>
          </div>

          <button
            type="button"
            onClick={() => onOpenOrderModal(product.name)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-[#E64A19] hover:bg-[#D84315] text-white font-['Outfit'] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer active:scale-95 shadow-sm"
          >
            <ShoppingBag className="w-3 h-3" />
            <span>PLACE ORDER</span>
          </button>
        </div>
      </div>
    </article>
  );
};
