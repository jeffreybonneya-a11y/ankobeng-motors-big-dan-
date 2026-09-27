import React, { useState, useEffect, useMemo } from 'react';
import { 
  Tag, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  X,
  Layers,
  ArrowUpDown
} from 'lucide-react';
import { 
  CategoryItem, 
  CategoryInput, 
  subscribeToCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} from '../../services/categories';

export const CategoriesManager: React.FC = () => {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CategoryItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [sortOrder, setSortOrder] = useState(1);
  const [active, setActive] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  // Feedback toast
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Subscribe to realtime categories
  useEffect(() => {
    const unsubscribe = subscribeToCategories(
      (items) => {
        setCategories(items);
        setLoading(false);
      },
      (err) => {
        console.warn('Realtime categories error:', err);
        setFeedback({ type: 'error', message: 'Failed to stream realtime categories updates.' });
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const filteredCategories = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return categories;
    return categories.filter(c => 
      c.name.toLowerCase().includes(q) || 
      (c.slug && c.slug.toLowerCase().includes(q)) ||
      (c.description && c.description.toLowerCase().includes(q))
    );
  }, [categories, searchQuery]);

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setSortOrder(categories.length + 1);
    setActive(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug || '');
    setDescription(cat.description || '');
    setSortOrder(cat.sortOrder || 1);
    setActive(cat.active !== false);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Category name is required.');
      return;
    }

    setIsSaving(true);
    setFormError(null);

    try {
      const payload: CategoryInput = {
        name: name.trim(),
        slug: slug.trim() || undefined,
        description: description.trim() || undefined,
        sortOrder: Number(sortOrder) || 1,
        active
      };

      if (editingCategory) {
        await updateCategory(editingCategory.id, payload);
        setFeedback({ type: 'success', message: `Updated category "${name}" successfully!` });
      } else {
        await createCategory(payload);
        setFeedback({ type: 'success', message: `Created category "${name}" successfully!` });
      }

      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save category.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteCategory(deleteTarget.id);
      setFeedback({ type: 'success', message: `Deleted category "${deleteTarget.name}".` });
      setDeleteTarget(null);
    } catch (err: any) {
      setFeedback({ type: 'error', message: `Error deleting category: ${err.message}` });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleActive = async (cat: CategoryItem) => {
    try {
      await updateCategory(cat.id, { active: !cat.active });
    } catch (err: any) {
      setFeedback({ type: 'error', message: `Error updating active state: ${err.message}` });
    }
  };

  return (
    <div className="space-y-6 font-['Outfit'] text-gray-200">
      
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
            <Tag className="w-6 h-6 text-[#E64A19]" />
            <span>Categories Management ({categories.length})</span>
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Define automotive brands and component categories (OPEL, CHEVROLET, TOYOTA, etc.) in real time.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-[#E64A19] hover:bg-[#D84315] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-lg cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
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

      {/* Filter / Search Bar */}
      <div className="p-4 rounded-xl bg-[#161920] border border-[#2B313E] flex items-center justify-between gap-4 shadow-lg">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search categories..."
            className="w-full bg-[#1E222B] border border-[#2B313E] rounded-md pl-10 pr-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#E64A19] transition-colors"
          />
        </div>

        <span className="text-xs text-gray-400">
          Showing {filteredCategories.length} of {categories.length}
        </span>
      </div>

      {/* Categories Table / Empty State */}
      {loading ? (
        <div className="p-16 rounded-xl bg-[#161920] border border-[#2B313E] flex flex-col items-center justify-center gap-3 shadow-xl">
          <Loader2 className="w-8 h-8 animate-spin text-[#E64A19]" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Streaming Realtime Categories...
          </span>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="p-12 rounded-xl bg-[#161920] border border-[#2B313E] text-center space-y-3 shadow-xl">
          <Layers className="w-12 h-12 text-gray-600 mx-auto" />
          <h3 className="text-sm font-bold uppercase text-gray-300">
            {categories.length === 0 ? 'No categories created yet' : 'No matching categories found'}
          </h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            {categories.length === 0 
              ? 'Click "Add New Category" to create your first vehicle make or component division.'
              : 'Try searching for another brand name or keyword.'}
          </p>
          {categories.length === 0 && (
            <div className="pt-2">
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#E64A19] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#D84315] transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create First Category</span>
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
                  <th className="py-3.5 px-4">Category Name</th>
                  <th className="py-3.5 px-4">Slug Identifier</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2B313E]/60 text-gray-300">
                {filteredCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-[#1A1E26] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-gray-400">
                      #{cat.sortOrder}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-white uppercase text-xs">
                      {cat.name}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-gray-400 text-[11px]">
                      {cat.slug || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-gray-400 text-[11px] max-w-xs truncate">
                      {cat.description || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(cat)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase cursor-pointer border transition-colors ${
                          cat.active
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                            : 'bg-[#1E222B] text-gray-500 border-[#2B313E]'
                        }`}
                      >
                        {cat.active ? 'Active' : 'Disabled'}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(cat)}
                          title="Edit Category"
                          className="p-1.5 rounded bg-[#1E222B] hover:bg-[#252B36] border border-[#2B313E] text-gray-300 hover:text-white transition-colors cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(cat)}
                          title="Delete Category"
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
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#161920] border border-[#2B313E] rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#2B313E] pb-3">
              <h3 className="font-bold text-sm uppercase text-white flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#E64A19]" />
                <span>{editingCategory ? 'Edit Category' : 'Add New Category'}</span>
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded bg-[#251818] border border-red-800 text-red-300 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                  Category Name <span className="text-[#E64A19]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!editingCategory) {
                      setSlug(e.target.value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-'));
                    }
                  }}
                  placeholder="e.g. OPEL, CHEVROLET, TRANSMISSIONS"
                  className="w-full bg-[#1E222B] border border-[#2B313E] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E64A19]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                  Slug / URL Identifier
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. opel"
                  className="w-full bg-[#1E222B] border border-[#2B313E] rounded px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#E64A19]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                  Display Sort Order
                </label>
                <input
                  type="number"
                  min="1"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 1)}
                  className="w-full bg-[#1E222B] border border-[#2B313E] rounded px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#E64A19]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                  Description (Optional)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short notes about parts in this category..."
                  className="w-full bg-[#1E222B] border border-[#2B313E] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E64A19] resize-none"
                />
              </div>

              <label className="flex items-center gap-2 p-2.5 rounded bg-[#1E222B] border border-[#2B313E] cursor-pointer">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-4 h-4 accent-[#E64A19] rounded cursor-pointer"
                />
                <span className="text-xs font-bold uppercase text-white">Active in Catalog Filter</span>
              </label>

              <div className="pt-3 border-t border-[#2B313E] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded bg-[#1E222B] hover:bg-[#252B36] text-xs font-bold uppercase text-gray-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded bg-[#E64A19] hover:bg-[#D84315] disabled:opacity-60 text-xs font-bold uppercase text-white cursor-pointer shadow"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingCategory ? 'Update Category' : 'Create Category'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#161920] border border-[#2B313E] rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-10 h-10 rounded-lg bg-[#251818] border border-red-800 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold uppercase text-white">Delete Category</h3>
                <span className="text-xs text-gray-400">Remove from categories collection</span>
              </div>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-white">"{deleteTarget.name}"</strong>?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded bg-[#1E222B] hover:bg-[#252B36] text-xs font-bold uppercase text-gray-300 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="inline-flex items-center gap-2 px-4 py-2 rounded bg-red-600 hover:bg-red-700 disabled:opacity-60 text-xs font-bold uppercase text-white cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Category</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
