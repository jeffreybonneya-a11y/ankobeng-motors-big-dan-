import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Image as ImageIcon, 
  Upload, 
  Loader2, 
  Star, 
  Flame, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  Trash2
} from 'lucide-react';
import { FirestoreProductItem, ProductInput } from '../../services/products';
import { uploadToCloudinary } from '../../services/cloudinary';
import { createMediaRecord } from '../../services/media';
import { auth } from '../../services/firebase';
import { subscribeToCategories, CategoryItem } from '../../services/categories';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: ProductInput) => Promise<void>;
  initialProduct?: FirestoreProductItem | null;
  highestSortOrder?: number;
}

/**
 * Extracts default product name by removing ONLY the file extension from the original filename
 * e.g. "opel_engine_2.0.jpg" -> "opel_engine_2.0"
 */
function extractDefaultNameFromFilename(filename: string): string {
  if (!filename) return '';
  const lastDotIndex = filename.lastIndexOf('.');
  if (lastDotIndex > 0) {
    return filename.substring(0, lastDotIndex);
  }
  return filename;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialProduct = null,
  highestSortOrder = 0
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>('OPEL');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [featured, setFeatured] = useState(false);
  const [showInHero, setShowInHero] = useState(true);
  const [sortOrder, setSortOrder] = useState(1);
  
  // Submission & Upload States
  const [loading, setLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [availableCategories, setAvailableCategories] = useState<CategoryItem[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsub = subscribeToCategories((cats) => {
      setAvailableCategories(cats.filter(c => c.active !== false));
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (initialProduct) {
      setName(initialProduct.name);
      setCategory(initialProduct.category || 'OPEL');
      setImageUrl(initialProduct.imageUrl);
      setDescription(initialProduct.description || '');
      setFeatured(Boolean(initialProduct.featured));
      setShowInHero(Boolean(initialProduct.showInHero));
      setSortOrder(initialProduct.sortOrder || 1);
    } else {
      setName('');
      setCategory('OPEL');
      setImageUrl('');
      setDescription('');
      setFeatured(false);
      setShowInHero(true);
      setSortOrder(highestSortOrder + 1);
    }
    setFormError(null);
    setUploadError(null);
    setUploadProgress(0);
    setIsUploadingImage(false);
  }, [initialProduct, isOpen, highestSortOrder]);

  if (!isOpen) return null;

  // Handle direct file upload to Cloudinary
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      // 1. Upload to Cloudinary with real progress tracking
      const uploadResult = await uploadToCloudinary(file, (progress) => {
        setUploadProgress(progress);
      });

      // 2. Set imageUrl to Cloudinary secure_url
      setImageUrl(uploadResult.secure_url);

      // 3. Set default product name from original filename minus extension if name is empty
      if (!name.trim()) {
        const defaultName = extractDefaultNameFromFilename(file.name);
        setName(defaultName);
      }

      // 4. Save metadata record into media collection if user is authenticated
      const currentUid = auth.currentUser?.uid;
      if (currentUid) {
        try {
          await createMediaRecord({
            name: file.name,
            url: uploadResult.secure_url,
            publicId: uploadResult.public_id,
            resourceType: uploadResult.resource_type || 'image',
            format: uploadResult.format,
            width: uploadResult.width,
            height: uploadResult.height,
            bytes: uploadResult.bytes,
            uploadedBy: currentUid
          });
        } catch (mediaErr) {
          console.warn('Media index creation notice:', mediaErr);
        }
      }
    } catch (err: any) {
      console.error('Cloudinary upload error in ProductModal:', err);
      setUploadError(err.message || 'Failed to upload image to Cloudinary.');
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Product name is required.');
      return;
    }
    if (!imageUrl.trim()) {
      setFormError('Product image is required. Please upload an image or provide a valid Cloudinary URL.');
      return;
    }

    setFormError(null);
    setLoading(true);

    try {
      await onSubmit({
        name: name.trim(),
        category: category.trim(),
        imageUrl: imageUrl.trim(),
        description: description.trim(),
        featured,
        showInHero,
        sortOrder: Number(sortOrder) || 1
      });
      onClose();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save product.');
    } finally {
      setLoading(false);
    }
  };

  const isEditing = Boolean(initialProduct);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 font-['Outfit']">
      
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-xs animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-[#161920] border border-[#2B313E] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10 animate-scaleUp">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#111317] border-b border-[#2B313E] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#E64A19]"></span>
            <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-white">
              {isEditing ? 'Edit Engine / Part' : 'Add New Product'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-[#1E222B] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {formError && (
            <div className="p-3.5 rounded-md bg-[#251818] border border-red-800 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* 1. Image Upload & Cloudinary Integration */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
              Product Image <span className="text-[#E64A19]">*</span>
            </label>

            {/* Cloudinary Upload Area */}
            <div className="p-4 rounded-lg bg-[#111317] border border-[#2B313E] space-y-3">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                
                {/* Image Preview Box */}
                <div className="w-24 h-24 rounded-lg bg-[#161920] border border-[#2B313E] overflow-hidden shrink-0 flex items-center justify-center relative">
                  {imageUrl ? (
                    <img 
                      src={imageUrl} 
                      alt="Product Preview" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-gray-600" />
                  )}
                  {isUploadingImage && (
                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-[#E64A19] gap-1">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="text-[10px] font-mono font-bold">{uploadProgress}%</span>
                    </div>
                  )}
                </div>

                {/* Upload Button & Info */}
                <div className="flex-1 space-y-2 text-center sm:text-left min-w-0 w-full">
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="product-image-upload"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    disabled={isUploadingImage}
                    className="hidden"
                  />

                  <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                    <label
                      htmlFor="product-image-upload"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded bg-[#E64A19] hover:bg-[#D84315] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{imageUrl ? 'Change Image' : 'Upload to Cloudinary'}</span>
                    </label>

                    {imageUrl && (
                      <button
                        type="button"
                        onClick={() => setImageUrl('')}
                        className="p-2 rounded bg-[#1E222B] hover:bg-[#2C1919] text-gray-400 hover:text-red-400 border border-[#2B313E] transition-colors cursor-pointer"
                        title="Remove image URL"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <p className="text-[11px] text-gray-400">
                    Uploads directly to Cloudinary. Original filename will auto-fill the product name.
                  </p>
                </div>

              </div>

              {/* Upload Progress Bar */}
              {isUploadingImage && (
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-gray-400">Uploading to Cloudinary...</span>
                    <span className="text-[#E64A19] font-mono font-bold">{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#161920] rounded-full overflow-hidden border border-[#2B313E]">
                    <div
                      className="h-full bg-[#E64A19] transition-all duration-150"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Upload Error */}
              {uploadError && (
                <div className="p-2.5 rounded bg-[#251818] border border-red-800 text-red-300 text-xs">
                  {uploadError}
                </div>
              )}

              {/* Direct URL input fallback */}
              <div className="pt-2 border-t border-[#2B313E]/60">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Or enter Cloudinary image URL directly..."
                  className="w-full bg-[#1E222B] border border-[#2B313E] rounded px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#E64A19] font-mono"
                />
              </div>

            </div>
          </div>

          {/* 2. Product Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
              Product Name <span className="text-[#E64A19]">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. opel_engine_2.0"
              className="w-full bg-[#1E222B] border border-[#2B313E] rounded-md px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#E64A19] transition-colors"
            />
            <p className="text-[11px] text-gray-400">
              Derived automatically from uploaded filename. Can be customized anytime.
            </p>
          </div>

          {/* 3. Category & Sort Order Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Category */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                Category / Brand <span className="text-[#E64A19]">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#1E222B] border border-[#2B313E] rounded-md px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#E64A19] transition-colors cursor-pointer"
              >
                {availableCategories.length > 0 ? (
                  availableCategories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="OPEL">OPEL (European Import)</option>
                    <option value="CHEVROLET">CHEVROLET</option>
                    <option value="TOYOTA">TOYOTA</option>
                    <option value="NISSAN">NISSAN</option>
                    <option value="HYUNDAI">HYUNDAI / KIA</option>
                    <option value="OTHER">OTHER MULTI-BRAND</option>
                  </>
                )}
                {category && availableCategories.length > 0 && !availableCategories.some(c => c.name === category) && (
                  <option value={category}>{category}</option>
                )}
              </select>
            </div>

            {/* Sort Order */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                Sort Order Index
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={sortOrder}
                onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 1)}
                className="w-full bg-[#1E222B] border border-[#2B313E] rounded-md px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#E64A19] transition-colors font-mono"
              />
            </div>

          </div>

          {/* 4. Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
              Description / Specifications
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Displacement, valve configuration, transmission compatibility, warranty details..."
              className="w-full bg-[#1E222B] border border-[#2B313E] rounded-md px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#E64A19] transition-colors resize-none"
            />
          </div>

          {/* 5. Feature & Hero Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#2B313E]">
            
            {/* Featured Switch */}
            <label className="flex items-center justify-between p-3 rounded-lg bg-[#1E222B] border border-[#2B313E] cursor-pointer hover:bg-[#232731] transition-colors">
              <div className="flex items-center gap-2.5">
                <Star className={`w-4 h-4 ${featured ? 'text-amber-400 fill-amber-400' : 'text-gray-400'}`} />
                <div>
                  <span className="block text-xs font-bold uppercase text-white">Featured Engine</span>
                  <span className="text-[10px] text-gray-400">Highlight in catalog</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 accent-[#E64A19] rounded cursor-pointer"
              />
            </label>

            {/* Show in Hero Switch */}
            <label className="flex items-center justify-between p-3 rounded-lg bg-[#1E222B] border border-[#2B313E] cursor-pointer hover:bg-[#232731] transition-colors">
              <div className="flex items-center gap-2.5">
                <Flame className={`w-4 h-4 ${showInHero ? 'text-rose-500' : 'text-gray-400'}`} />
                <div>
                  <span className="block text-xs font-bold uppercase text-white">Show in Hero</span>
                  <span className="text-[10px] text-gray-400">Display in hero rotation</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={showInHero}
                onChange={(e) => setShowInHero(e.target.checked)}
                className="w-4 h-4 accent-[#E64A19] rounded cursor-pointer"
              />
            </label>

          </div>

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-[#2B313E] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-md bg-[#1E222B] hover:bg-[#252B36] text-gray-300 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || isUploadingImage}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#E64A19] hover:bg-[#D84315] disabled:opacity-60 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-lg cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving to Firestore...</span>
                </>
              ) : (
                <span>{isEditing ? 'Save Changes' : 'Create Product'}</span>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
