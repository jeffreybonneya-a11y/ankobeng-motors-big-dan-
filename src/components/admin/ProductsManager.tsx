import React, { useState, useEffect, useMemo } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Star, 
  Flame, 
  Edit, 
  Trash2, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Eye,
  ExternalLink,
  SlidersHorizontal,
  ImageIcon
} from 'lucide-react';
import { 
  FirestoreProductItem, 
  subscribeToProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  toggleProductFeatured, 
  toggleProductHero,
  ProductInput
} from '../../services/products';
import { ProductModal } from './ProductModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';

export const ProductsManager: React.FC = () => {
  const [products, setProducts] = useState<FirestoreProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'FEATURED' | 'HERO'>('ALL');

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<FirestoreProductItem | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<FirestoreProductItem | null>(null);
  const [previewProduct, setPreviewProduct] = useState<FirestoreProductItem | null>(null);

  // Notifications
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // 1. Subscribe to real-time Firestore updates for `products`
  useEffect(() => {
    const unsubscribe = subscribeToProducts(
      (items) => {
        setProducts(items);
        setLoading(false);
      },
      (err) => {
        console.error('Realtime product subscription error:', err);
        setFeedback({ type: 'error', message: 'Failed to stream real-time product updates.' });
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Filtered products calculation
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || 
        p.name.toLowerCase().includes(query) || 
        p.description.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query);

      const matchesCategory = categoryFilter === 'ALL' || p.category === categoryFilter;

      const matchesStatus = 
        statusFilter === 'ALL' || 
        (statusFilter === 'FEATURED' && p.featured) ||
        (statusFilter === 'HERO' && p.showInHero);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, searchQuery, categoryFilter, statusFilter]);

  const highestSortOrder = useMemo(() => {
    if (products.length === 0) return 0;
    return Math.max(...products.map(p => p.sortOrder || 0));
  }, [products]);

  // Unique categories list for dynamic filter tabs
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach(p => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats);
  }, [products]);

  // Actions
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (product: FirestoreProductItem) => {
    setEditingProduct(product);
    setModalOpen(true);
  };

  const handleSaveProduct = async (input: ProductInput) => {
    if (editingProduct) {
      await updateProduct(editingProduct.id, input);
      setFeedback({ type: 'success', message: `Updated "${input.name}" successfully!` });
    } else {
      await createProduct(input);
      setFeedback({ type: 'success', message: `Added "${input.name}" to inventory!` });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProduct) return;
    await deleteProduct(deletingProduct.id);
    setFeedback({ type: 'success', message: `Deleted "${deletingProduct.name}" from inventory.` });
  };

  const handleToggleFeatured = async (product: FirestoreProductItem) => {
    setTogglingId(product.id);
    try {
      await toggleProductFeatured(product.id, product.featured);
    } catch (err: any) {
      setFeedback({ type: 'error', message: `Error updating featured status: ${err.message}` });
    } finally {
      setTogglingId(null);
    }
  };

  const handleToggleHero = async (product: FirestoreProductItem) => {
    setTogglingId(product.id);
    try {
      await toggleProductHero(product.id, product.showInHero);
    } catch (err: any) {
      setFeedback({ type: 'error', message: `Error updating hero status: ${err.message}` });
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-6 font-['Outfit'] text-gray-200">
      
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-[#E64A19]" />
            <span>Product Inventory ({products.length})</span>
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Manage authentic European engines, transmissions, and multi-brand parts in real time.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-[#E64A19] hover:bg-[#D84315] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-lg cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div className={`p-3.5 rounded-lg border flex items-center justify-between gap-3 text-xs ${
          feedback.type === 'success'
            ? 'bg-[#15251a] border-emerald-800 text-emerald-300'
            : 'bg-[#251818] border-red-800 text-red-300'
        }`}>
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button 
            onClick={() => setFeedback(null)} 
            className="text-[11px] font-bold uppercase underline hover:text-white cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-xl bg-[#161920] border border-[#2B313E] flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center shadow-lg">
        
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products by name, brand, description..."
            className="w-full bg-[#1E222B] border border-[#2B313E] rounded-md pl-10 pr-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#E64A19] transition-colors"
          />
        </div>

        {/* Category Pills & Status Filters */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Category Selector */}
          <div className="flex items-center gap-1 bg-[#1E222B] p-1 rounded-md border border-[#2B313E] overflow-x-auto max-w-full">
            <button
              type="button"
              onClick={() => setCategoryFilter('ALL')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase transition-colors cursor-pointer shrink-0 ${
                categoryFilter === 'ALL'
                  ? 'bg-[#E64A19] text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              All
            </button>
            {['OPEL', 'CHEVROLET', 'TOYOTA', 'NISSAN', 'OTHER'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase transition-colors cursor-pointer shrink-0 ${
                  categoryFilter === cat
                    ? 'bg-[#E64A19] text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-[#1E222B] p-1 rounded-md border border-[#2B313E]">
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase transition-colors cursor-pointer ${
                statusFilter === 'ALL' ? 'bg-[#2B313E] text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              All Status
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('FEATURED')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase transition-colors flex items-center gap-1 cursor-pointer ${
                statusFilter === 'FEATURED' ? 'bg-amber-600 text-white' : 'text-amber-400 hover:text-amber-300'
              }`}
            >
              <Star className="w-3 h-3 fill-current" />
              <span>Featured</span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('HERO')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase transition-colors flex items-center gap-1 cursor-pointer ${
                statusFilter === 'HERO' ? 'bg-rose-600 text-white' : 'text-rose-400 hover:text-rose-300'
              }`}
            >
              <Flame className="w-3 h-3" />
              <span>In Hero</span>
            </button>
          </div>

        </div>

      </div>

      {/* Main Inventory Table / Cards */}
      {loading ? (
        <div className="p-16 rounded-xl bg-[#161920] border border-[#2B313E] flex flex-col items-center justify-center gap-3 shadow-xl">
          <Loader2 className="w-8 h-8 animate-spin text-[#E64A19]" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Streaming Realtime Inventory...
          </span>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="p-12 rounded-xl bg-[#161920] border border-[#2B313E] text-center space-y-3 shadow-xl">
          <Package className="w-12 h-12 text-gray-600 mx-auto" />
          <h3 className="text-sm font-bold uppercase text-gray-300">
            {products.length === 0 ? 'No products in database' : 'No products matched your search or filters'}
          </h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            {products.length === 0 
              ? 'Click "Add New Product" to create your first engine part in Firestore.'
              : 'Try clearing your search query or switching filters to view all products.'}
          </p>
          {products.length === 0 && (
            <div className="pt-2">
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#E64A19] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#D84315] transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create First Product</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-xl bg-[#161920] border border-[#2B313E] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#111317] border-b border-[#2B313E] text-gray-400 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Order</th>
                  <th className="py-3.5 px-4">Engine / Part</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4 text-center">Featured</th>
                  <th className="py-3.5 px-4 text-center">In Hero</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2B313E]/60 text-gray-300">
                {filteredProducts.map((prod) => (
                  <tr key={prod.id} className="hover:bg-[#1A1E26] transition-colors">
                    
                    {/* Sort Order Index */}
                    <td className="py-3.5 px-4 font-mono text-gray-400 font-bold">
                      #{prod.sortOrder}
                    </td>

                    {/* Image & Product Name */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3.5">
                        <div 
                          onClick={() => setPreviewProduct(prod)}
                          className="w-12 h-12 rounded bg-[#111317] border border-[#2B313E] overflow-hidden shrink-0 cursor-pointer group relative"
                        >
                          <img 
                            src={prod.imageUrl} 
                            alt={prod.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Eye className="w-4 h-4 text-white" />
                          </div>
                        </div>

                        <div className="min-w-0">
                          <span className="font-extrabold text-white text-xs uppercase block truncate max-w-sm">
                            {prod.name}
                          </span>
                          <span className="text-[11px] text-gray-400 line-clamp-1 max-w-sm block">
                            {prod.description || 'No description added'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category Pill */}
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#1E222B] text-gray-300 border border-[#2B313E]">
                        {prod.category}
                      </span>
                    </td>

                    {/* Featured Inline Toggle */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleFeatured(prod)}
                        disabled={togglingId === prod.id}
                        title={prod.featured ? 'Remove from Featured' : 'Mark as Featured'}
                        className={`p-1.5 rounded-md border transition-all cursor-pointer ${
                          prod.featured
                            ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                            : 'bg-[#1E222B] border-[#2B313E] text-gray-500 hover:text-gray-300'
                        }`}
                      >
                        <Star className={`w-4 h-4 ${prod.featured ? 'fill-amber-400' : ''}`} />
                      </button>
                    </td>

                    {/* Hero Inline Toggle */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleHero(prod)}
                        disabled={togglingId === prod.id}
                        title={prod.showInHero ? 'Hide from Hero' : 'Show in Hero Slideshow'}
                        className={`p-1.5 rounded-md border transition-all cursor-pointer ${
                          prod.showInHero
                            ? 'bg-rose-500/20 border-rose-500/50 text-rose-400'
                            : 'bg-[#1E222B] border-[#2B313E] text-gray-500 hover:text-gray-300'
                        }`}
                      >
                        <Flame className="w-4 h-4" />
                      </button>
                    </td>

                    {/* Action Buttons */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(prod)}
                          title="Edit Product"
                          className="p-1.5 rounded bg-[#1E222B] hover:bg-[#252B36] border border-[#2B313E] text-gray-300 hover:text-white transition-colors cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingProduct(prod)}
                          title="Delete Product"
                          className="p-1.5 rounded bg-[#251818] hover:bg-[#321e1e] border border-red-900/50 text-red-400 hover:text-red-200 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Table Footer Stats */}
          <div className="p-4 bg-[#111317] border-t border-[#2B313E] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
            <span>
              Showing {filteredProducts.length} of {products.length} total inventory items
            </span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-amber-400 font-bold">
                <Star className="w-3 h-3 fill-amber-400" />
                {products.filter(p => p.featured).length} Featured
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-rose-400 font-bold">
                <Flame className="w-3 h-3" />
                {products.filter(p => p.showInHero).length} in Hero
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Product Add/Edit Modal */}
      <ProductModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSaveProduct}
        initialProduct={editingProduct}
        highestSortOrder={highestSortOrder}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingProduct)}
        onClose={() => setDeletingProduct(null)}
        onConfirm={handleDeleteConfirm}
        product={deletingProduct}
      />

      {/* Detail Preview Modal */}
      {previewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80" onClick={() => setPreviewProduct(null)} />
          <div className="relative bg-[#161920] border border-[#2B313E] rounded-xl max-w-lg w-full p-6 space-y-4 z-10 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#2B313E] pb-3">
              <h3 className="font-bold text-sm uppercase text-white truncate">{previewProduct.name}</h3>
              <button onClick={() => setPreviewProduct(null)} className="text-gray-400 hover:text-white cursor-pointer">&times;</button>
            </div>
            <div className="aspect-video w-full rounded bg-[#111317] overflow-hidden border border-[#2B313E]">
              <img src={previewProduct.imageUrl} alt={previewProduct.name} className="w-full h-full object-contain" />
            </div>
            <div className="text-xs space-y-1 text-gray-300">
              <p><strong>Category:</strong> {previewProduct.category}</p>
              <p><strong>Sort Order:</strong> #{previewProduct.sortOrder}</p>
              <p><strong>Description:</strong> {previewProduct.description || 'N/A'}</p>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => {
                  const p = previewProduct;
                  setPreviewProduct(null);
                  handleOpenEditModal(p);
                }}
                className="px-4 py-2 rounded bg-[#E64A19] hover:bg-[#D84315] text-white text-xs font-bold uppercase cursor-pointer"
              >
                Edit Product
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
