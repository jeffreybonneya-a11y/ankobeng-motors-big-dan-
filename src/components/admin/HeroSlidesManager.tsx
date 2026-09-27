import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Sliders, 
  Plus, 
  Upload, 
  Image as ImageIcon, 
  Edit, 
  Trash2, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  X,
  ExternalLink,
  Layers,
  Eye
} from 'lucide-react';
import { 
  HeroSlideItem, 
  HeroSlideInput, 
  subscribeToHeroSlides, 
  createHeroSlide, 
  updateHeroSlide, 
  deleteHeroSlide, 
  toggleHeroSlideActive 
} from '../../services/heroSlides';
import { uploadToCloudinary } from '../../services/cloudinary';
import { createMediaRecord } from '../../services/media';
import { auth } from '../../services/firebase';

export const HeroSlidesManager: React.FC = () => {
  const [slides, setSlides] = useState<HeroSlideItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlideItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<HeroSlideItem | null>(null);
  const [previewSlide, setPreviewSlide] = useState<HeroSlideItem | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [ctaText, setCtaText] = useState('');
  const [ctaLink, setCtaLink] = useState('');
  const [sortOrder, setSortOrder] = useState(1);
  const [active, setActive] = useState(true);

  // Upload & submission states
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Feedback toast
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Subscribe to realtime hero slides
  useEffect(() => {
    const unsubscribe = subscribeToHeroSlides(
      (items) => {
        setSlides(items);
        setLoading(false);
      },
      (err) => {
        console.warn('Realtime hero slides error:', err);
        setFeedback({ type: 'error', message: 'Failed to stream hero slides.' });
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleOpenAddModal = () => {
    setEditingSlide(null);
    setTitle('');
    setSubtitle('');
    setImageUrl('');
    setCtaText('VIEW INVENTORY');
    setCtaLink('#inventory');
    setSortOrder(slides.length + 1);
    setActive(true);
    setFormError(null);
    setUploadError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (slide: HeroSlideItem) => {
    setEditingSlide(slide);
    setTitle(slide.title);
    setSubtitle(slide.subtitle || '');
    setImageUrl(slide.imageUrl);
    setCtaText(slide.ctaText || '');
    setCtaLink(slide.ctaLink || '');
    setSortOrder(slide.sortOrder || 1);
    setActive(slide.active !== false);
    setFormError(null);
    setUploadError(null);
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (JPG, PNG, WEBP).');
      return;
    }

    setUploadError(null);
    setIsUploadingImage(true);
    setUploadProgress(0);

    try {
      const uploadResult = await uploadToCloudinary(file, (progress) => {
        setUploadProgress(progress);
      });

      setImageUrl(uploadResult.secure_url);

      // Auto-index into media collection if authenticated
      const uid = auth.currentUser?.uid;
      if (uid) {
        try {
          await createMediaRecord({
            name: file.name,
            url: uploadResult.secure_url,
            publicId: uploadResult.public_id,
            resourceType: 'image',
            format: uploadResult.format,
            width: uploadResult.width,
            height: uploadResult.height,
            bytes: uploadResult.bytes,
            uploadedBy: uid
          });
        } catch {
          // ignore media index failure
        }
      }
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload slide image to Cloudinary.');
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Slide title is required.');
      return;
    }
    if (!imageUrl.trim()) {
      setFormError('Slide banner image is required. Please upload to Cloudinary.');
      return;
    }

    setIsSaving(true);
    setFormError(null);

    try {
      const payload: HeroSlideInput = {
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
        imageUrl: imageUrl.trim(),
        ctaText: ctaText.trim() || undefined,
        ctaLink: ctaLink.trim() || undefined,
        sortOrder: Number(sortOrder) || 1,
        active
      };

      if (editingSlide) {
        await updateHeroSlide(editingSlide.id, payload);
        setFeedback({ type: 'success', message: `Updated slide "${title}" successfully!` });
      } else {
        await createHeroSlide(payload);
        setFeedback({ type: 'success', message: `Added new hero slide "${title}"!` });
      }

      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save hero slide.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteHeroSlide(deleteTarget.id);
      setFeedback({ type: 'success', message: `Deleted slide "${deleteTarget.title}".` });
      setDeleteTarget(null);
    } catch (err: any) {
      setFeedback({ type: 'error', message: `Error deleting slide: ${err.message}` });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleActive = async (slide: HeroSlideItem) => {
    try {
      await toggleHeroSlideActive(slide.id, slide.active);
    } catch (err: any) {
      setFeedback({ type: 'error', message: `Error updating slide state: ${err.message}` });
    }
  };

  return (
    <div className="space-y-6 font-['Outfit'] text-gray-200">
      
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
            <Sliders className="w-6 h-6 text-[#E64A19]" />
            <span>Hero Slides Management ({slides.length})</span>
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Configure homepage slideshow banners, featured engines, and call-to-action buttons.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-[#E64A19] hover:bg-[#D84315] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-lg cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Slide</span>
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

      {/* Slides List / Grid */}
      {loading ? (
        <div className="p-16 rounded-xl bg-[#161920] border border-[#2B313E] flex flex-col items-center justify-center gap-3 shadow-xl">
          <Loader2 className="w-8 h-8 animate-spin text-[#E64A19]" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Streaming Hero Slides...
          </span>
        </div>
      ) : slides.length === 0 ? (
        <div className="p-12 rounded-xl bg-[#161920] border border-[#2B313E] text-center space-y-3 shadow-xl">
          <Sliders className="w-12 h-12 text-gray-600 mx-auto" />
          <h3 className="text-sm font-bold uppercase text-gray-300">
            No hero slides created yet
          </h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            Add custom slides with high-resolution engine photos and CTAs to feature prominently at the top of the homepage.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#E64A19] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#D84315] transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Slide</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {slides.map((slide) => (
            <div
              key={slide.id}
              className="rounded-xl bg-[#161920] border border-[#2B313E] overflow-hidden flex flex-col justify-between shadow-xl group hover:border-[#3B4254] transition-colors"
            >
              {/* Image Preview Container */}
              <div className="relative aspect-video bg-[#0D0F13] overflow-hidden border-b border-[#2B313E]">
                <img
                  src={slide.imageUrl}
                  alt={slide.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Sort Order & Status Badges */}
                <div className="absolute top-2 left-2 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono font-bold text-white">
                    #{slide.sortOrder}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggleActive(slide)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase cursor-pointer border ${
                      slide.active
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        : 'bg-black/80 text-gray-400 border-gray-600'
                    }`}
                  >
                    {slide.active ? 'Active' : 'Hidden'}
                  </button>
                </div>
              </div>

              {/* Slide Meta & Actions */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-extrabold text-sm uppercase text-white truncate" title={slide.title}>
                    {slide.title}
                  </h3>
                  {slide.subtitle && (
                    <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">
                      {slide.subtitle}
                    </p>
                  )}
                  {slide.ctaText && (
                    <span className="inline-block mt-2 px-2 py-0.5 rounded bg-[#1E222B] border border-[#2B313E] text-[10px] text-[#E64A19] font-bold uppercase tracking-wider">
                      CTA: {slide.ctaText}
                    </span>
                  )}
                </div>

                <div className="pt-3 border-t border-[#2B313E] flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(slide)}
                    className="p-1.5 rounded bg-[#1E222B] hover:bg-[#252B36] border border-[#2B313E] text-gray-300 hover:text-white transition-colors cursor-pointer"
                    title="Edit Slide"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(slide)}
                    className="p-1.5 rounded bg-[#251818] hover:bg-[#321e1e] border border-red-900/50 text-red-400 hover:text-red-200 transition-colors cursor-pointer"
                    title="Delete Slide"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Slide Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#161920] border border-[#2B313E] rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#2B313E] pb-3">
              <h3 className="font-bold text-sm uppercase text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#E64A19]" />
                <span>{editingSlide ? 'Edit Hero Slide' : 'Add Hero Slide'}</span>
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
              {/* Image Upload Box */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                  Slide Banner Image <span className="text-[#E64A19]">*</span>
                </label>

                <div className="p-3 rounded-lg bg-[#111317] border border-[#2B313E] space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-20 h-14 rounded bg-[#161920] border border-[#2B313E] overflow-hidden shrink-0 flex items-center justify-center relative">
                      {imageUrl ? (
                        <img src={imageUrl} alt="Slide Preview" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-gray-600" />
                      )}
                      {isUploadingImage && (
                        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-[#E64A19]">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-[9px] font-mono">{uploadProgress}%</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        id="slide-image-file"
                        onChange={handleImageUpload}
                        disabled={isUploadingImage}
                        className="hidden"
                      />
                      <label
                        htmlFor="slide-image-file"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#E64A19] hover:bg-[#D84315] text-white text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer shadow"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{imageUrl ? 'Change Image' : 'Upload to Cloudinary'}</span>
                      </label>
                      <p className="text-[10px] text-gray-400 mt-1">
                        High resolution landscape image recommended.
                      </p>
                    </div>
                  </div>

                  {isUploadingImage && (
                    <div className="w-full h-1.5 bg-[#161920] rounded-full overflow-hidden">
                      <div className="h-full bg-[#E64A19] transition-all" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  )}

                  {uploadError && (
                    <div className="p-2 rounded bg-[#251818] border border-red-800 text-red-300 text-xs">
                      {uploadError}
                    </div>
                  )}

                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Or enter Cloudinary image URL..."
                    className="w-full bg-[#1E222B] border border-[#2B313E] rounded px-2.5 py-1.5 text-xs text-white placeholder-gray-500 font-mono"
                  />
                </div>
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                  Slide Title / Main Headline <span className="text-[#E64A19]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. OPEL ZAFIRA &amp; ASTRA PETROL ENGINES"
                  className="w-full bg-[#1E222B] border border-[#2B313E] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E64A19]"
                />
              </div>

              {/* Subtitle */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                  Subtitle / Highlight Details
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g. Complete with gearboxes &amp; warranty inspection in Abossey Okai"
                  className="w-full bg-[#1E222B] border border-[#2B313E] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E64A19]"
                />
              </div>

              {/* CTA Button Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                    CTA Button Label
                  </label>
                  <input
                    type="text"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    placeholder="e.g. VIEW INVENTORY"
                    className="w-full bg-[#1E222B] border border-[#2B313E] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E64A19]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                    CTA Button Link / Anchor
                  </label>
                  <input
                    type="text"
                    value={ctaLink}
                    onChange={(e) => setCtaLink(e.target.value)}
                    placeholder="e.g. #inventory or tel:0244148534"
                    className="w-full bg-[#1E222B] border border-[#2B313E] rounded px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#E64A19]"
                  />
                </div>
              </div>

              {/* Sort Order & Active */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 1)}
                    className="w-full bg-[#1E222B] border border-[#2B313E] rounded px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#E64A19]"
                  />
                </div>

                <div className="flex items-center">
                  <label className="flex items-center gap-2 p-2.5 rounded bg-[#1E222B] border border-[#2B313E] cursor-pointer w-full mt-4">
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={(e) => setActive(e.target.checked)}
                      className="w-4 h-4 accent-[#E64A19] rounded cursor-pointer"
                    />
                    <span className="text-xs font-bold uppercase text-white">Active in Hero</span>
                  </label>
                </div>
              </div>

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
                  disabled={isSaving || isUploadingImage}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded bg-[#E64A19] hover:bg-[#D84315] disabled:opacity-60 text-xs font-bold uppercase text-white cursor-pointer shadow"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingSlide ? 'Update Slide' : 'Create Slide'}</span>
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
                <h3 className="text-base font-bold uppercase text-white">Delete Hero Slide</h3>
                <span className="text-xs text-gray-400">Remove from heroSlides collection</span>
              </div>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-white">"{deleteTarget.title}"</strong>?
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
                  <span>Delete Slide</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
