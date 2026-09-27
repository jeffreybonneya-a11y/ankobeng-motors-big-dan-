import React, { useState } from 'react';
import { AlertTriangle, Loader2, X } from 'lucide-react';
import { FirestoreProductItem } from '../../services/products';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  product: FirestoreProductItem | null;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  product
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !product) return null;

  const handleConfirm = async () => {
    setError(null);
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to delete product.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 font-['Outfit']">
      
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-xs animate-fadeIn"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-md bg-[#161920] border border-[#2B313E] rounded-xl shadow-2xl overflow-hidden flex flex-col z-10 animate-scaleUp">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#111317] border-b border-[#2B313E] flex items-center justify-between">
          <div className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h3 className="text-sm sm:text-base font-black uppercase tracking-tight text-white">
              Delete Product Confirmation
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-[#1E222B] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          
          {error && (
            <div className="p-3 rounded-md bg-[#251818] border border-red-800 text-red-300 text-xs">
              {error}
            </div>
          )}

          <p className="text-xs text-gray-300 leading-relaxed">
            Are you sure you want to permanently remove this engine part from Firestore?
          </p>

          {/* Product Summary Card */}
          <div className="p-3.5 rounded-lg bg-[#1E222B] border border-[#2B313E] flex items-center gap-3">
            <div className="w-12 h-12 rounded bg-[#111317] border border-[#2B313E] overflow-hidden shrink-0">
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
              <span className="font-bold text-white text-xs uppercase block truncate">
                {product.name}
              </span>
              <span className="text-[11px] text-gray-400 block font-mono">
                Category: {product.category} • #{product.sortOrder}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-gray-400 leading-relaxed">
            This action cannot be undone. Public website real-time listeners will update immediately upon deletion.
          </p>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#111317] border-t border-[#2B313E] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-[#1E222B] hover:bg-[#252B36] text-gray-300 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-lg cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <span>Confirm Delete</span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
