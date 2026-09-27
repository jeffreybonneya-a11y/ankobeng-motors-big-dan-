import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, 
  Save, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  Sparkles,
  Upload,
  Image as ImageIcon,
  Film,
  Trash2,
  Clock,
  Video,
  Play,
  RotateCcw
} from 'lucide-react';
import { 
  HomepageContentData, 
  subscribeToHomepageContent, 
  saveHomepageContent,
  getCloudinaryVideoPoster,
  getCacheBustedUrl
} from '../../services/homepage';
import { uploadToCloudinary } from '../../services/cloudinary';
import { createMediaRecord } from '../../services/media';
import { auth } from '../../services/firebase';

/**
 * Extracts video duration locally in browser before upload
 */
function readLocalVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    const objectUrl = URL.createObjectURL(file);
    video.src = objectUrl;

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(video.duration);
    };

    video.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Unable to read video metadata. Please check the video file.'));
    };
  });
}

export const HomepageManager: React.FC = () => {
  const [content, setContent] = useState<HomepageContentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form fields: Text Copy
  const [headline, setHeadline] = useState('');
  const [subheadline, setSubheadline] = useState('');
  const [supportingText, setSupportingText] = useState('');
  const [primaryButtonText, setPrimaryButtonText] = useState('VIEW INVENTORY');
  const [secondaryButtonText, setSecondaryButtonText] = useState('PLACE ORDER');
  const [heroBadge, setHeroBadge] = useState('');

  // Form fields: Background Media
  const [backgroundType, setBackgroundType] = useState<'image' | 'video'>('image');
  const [backgroundUrl, setBackgroundUrl] = useState('');
  const [backgroundPosterUrl, setBackgroundPosterUrl] = useState('');

  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isCheckingDuration, setIsCheckingDuration] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Subscribe to realtime homepage content
  useEffect(() => {
    const unsubscribe = subscribeToHomepageContent(
      (data) => {
        if (data) {
          setContent(data);
          setHeadline(data.headline || '');
          setSubheadline(data.subheadline || '');
          setSupportingText(data.supportingText || '');
          setPrimaryButtonText(data.primaryButtonText || 'VIEW INVENTORY');
          setSecondaryButtonText(data.secondaryButtonText || 'PLACE ORDER');
          setHeroBadge(data.heroBadge || '');
          
          if (data.backgroundUrl) {
            setBackgroundUrl(data.backgroundUrl);
            setBackgroundType(data.backgroundType || (data.backgroundUrl.match(/\.(mp4|webm)$/i) ? 'video' : 'image'));
            setBackgroundPosterUrl(data.backgroundPosterUrl || getCloudinaryVideoPoster(data.backgroundUrl));
          } else if (data.heroBackground) {
            setBackgroundUrl(data.heroBackground);
            setBackgroundType('image');
            setBackgroundPosterUrl('');
          }
        } else {
          // Defaults if document doesn't exist yet
          setHeadline('DEALERS IN OPEL ENGINES & ALL KINDS OF ENGINE PARTS');
          setSubheadline('BIG DAN DIRECT DISPATCH • ABOSSEY OKAI, ACCRA');
          setSupportingText('Direct importers and stockists of authentic European Opel engines, manual and automatic gearboxes, cylinder heads, crankshafts, and multi-brand automotive replacement assemblies in Abossey Okai.');
          setPrimaryButtonText('VIEW INVENTORY');
          setSecondaryButtonText('PLACE ORDER');
          setHeroBadge('ABOSSEY OKAI, ACCRA');
          setBackgroundType('image');
          setBackgroundUrl('');
          setBackgroundPosterUrl('');
        }
        setLoading(false);
      },
      (err) => {
        console.warn('Realtime homepage content error:', err);
        setFeedback({ type: 'error', message: 'Failed to stream homepage content from Firestore.' });
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // 2. Handle File Upload (Image or Video)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setFeedback(null);

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      setUploadError('Unsupported file format. Please select an image (JPG, PNG, WEBP) or a video (MP4, WEBM).');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Video validation rule: Maximum 50 seconds
    if (isVideo) {
      setIsCheckingDuration(true);
      try {
        const durationInSeconds = await readLocalVideoDuration(file);
        setIsCheckingDuration(false);

        if (durationInSeconds > 50) {
          setUploadError('Video must be 50 seconds or less.');
          if (fileInputRef.current) fileInputRef.current.value = '';
          return;
        }
      } catch (err: any) {
        setIsCheckingDuration(false);
        setUploadError(err.message || 'Unable to inspect video duration.');
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
    }

    // Upload to Cloudinary with progress
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const uploadResult = await uploadToCloudinary(file, (progress) => {
        setUploadProgress(progress);
      });

      const secureUrl = uploadResult.secure_url;
      const resType = isVideo ? 'video' : 'image';

      setBackgroundType(resType);
      setBackgroundUrl(secureUrl);

      // Derive video poster
      if (resType === 'video') {
        const poster = getCloudinaryVideoPoster(secureUrl);
        setBackgroundPosterUrl(poster);
      } else {
        setBackgroundPosterUrl('');
      }

      // Auto-index into media collection
      const uid = auth.currentUser?.uid;
      if (uid) {
        try {
          await createMediaRecord({
            name: file.name,
            url: secureUrl,
            publicId: uploadResult.public_id,
            resourceType: resType,
            format: uploadResult.format || file.name.split('.').pop() || '',
            width: uploadResult.width,
            height: uploadResult.height,
            duration: uploadResult.duration,
            bytes: uploadResult.bytes || file.size,
            uploadedBy: uid
          });
        } catch {
          // ignore background index error
        }
      }

      setFeedback({
        type: 'success',
        message: `Uploaded new homepage ${resType} background! Click "Save Homepage Content" to apply it live to the storefront.`
      });
    } catch (err: any) {
      console.error('Cloudinary background upload error:', err);
      setUploadError(err.message || 'Failed to upload media to Cloudinary.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleClearBackground = () => {
    setBackgroundUrl('');
    setBackgroundPosterUrl('');
    setBackgroundType('image');
  };

  // 3. Save to Firestore homepageContent/main
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!headline.trim()) {
      setFeedback({ type: 'error', message: 'Headline cannot be empty.' });
      return;
    }

    setIsSaving(true);
    setFeedback(null);

    try {
      const poster = backgroundType === 'video' 
        ? (backgroundPosterUrl || getCloudinaryVideoPoster(backgroundUrl)) 
        : '';

      await saveHomepageContent({
        headline: headline.trim(),
        subheadline: subheadline.trim(),
        supportingText: supportingText.trim(),
        primaryButtonText: primaryButtonText.trim(),
        secondaryButtonText: secondaryButtonText.trim(),
        heroBadge: heroBadge.trim(),
        backgroundType,
        backgroundUrl: backgroundUrl.trim(),
        backgroundPosterUrl: poster.trim()
      });

      setFeedback({ 
        type: 'success', 
        message: 'Homepage content & background saved successfully! Public storefront is updated in real time.' 
      });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to save homepage content.' });
    } finally {
      setIsSaving(false);
    }
  };

  const previewMediaUrl = getCacheBustedUrl(backgroundUrl, content?.updatedAt);

  return (
    <div className="space-y-6 font-['Outfit'] text-gray-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
            <Home className="w-6 h-6 text-[#E64A19]" />
            <span>Homepage Content &amp; Background CMS</span>
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Configure homepage headlines, action buttons, and active image or video background in real time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-gray-400 bg-[#161920] px-3 py-1.5 rounded border border-[#2B313E]">
            Target: <strong className="text-white">homepageContent/main</strong>
          </span>
        </div>
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

      {loading ? (
        <div className="p-16 rounded-xl bg-[#161920] border border-[#2B313E] flex flex-col items-center justify-center gap-3 shadow-xl">
          <Loader2 className="w-8 h-8 animate-spin text-[#E64A19]" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Streaming Homepage Content...
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Main Edit Form (7 cols) */}
          <form onSubmit={handleSave} className="lg:col-span-7 bg-[#161920] border border-[#2B313E] rounded-xl p-6 space-y-6 shadow-xl">
            
            {/* 1. HOMEPAGE BACKGROUND MEDIA SECTION */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#2B313E] pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  {backgroundType === 'video' ? (
                    <Video className="w-4 h-4 text-blue-400" />
                  ) : (
                    <ImageIcon className="w-4 h-4 text-[#E64A19]" />
                  )}
                  <span>Homepage Background Media (Image or Video)</span>
                </span>
                <span className="text-[10px] text-gray-400">Cloudinary Powered</span>
              </div>

              {/* Type Switcher Pills */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setBackgroundType('image')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                    backgroundType === 'image'
                      ? 'bg-[#E64A19] text-white shadow'
                      : 'bg-[#1E222B] text-gray-400 hover:text-white border border-[#2B313E]'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Image Background</span>
                </button>
                <button
                  type="button"
                  onClick={() => setBackgroundType('video')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                    backgroundType === 'video'
                      ? 'bg-[#E64A19] text-white shadow'
                      : 'bg-[#1E222B] text-gray-400 hover:text-white border border-[#2B313E]'
                  }`}
                >
                  <Film className="w-3.5 h-3.5" />
                  <span>Video Background (Max 50s)</span>
                </button>
              </div>

              {/* Upload Dropzone / Picker */}
              <div className="p-4 rounded-lg bg-[#111317] border border-[#2B313E] space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  id="homepage-bg-file"
                  accept={backgroundType === 'video' ? 'video/mp4,video/webm' : 'image/jpeg,image/png,image/webp'}
                  onChange={handleFileUpload}
                  disabled={isUploading || isCheckingDuration}
                  className="hidden"
                />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {backgroundType === 'video' ? 'Upload Background Video' : 'Upload Background Image'}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      {backgroundType === 'video' 
                        ? 'MP4 or WEBM • Hard maximum 50 seconds • Autoplays muted on desktop & mobile' 
                        : 'JPG, PNG, or WEBP • High-resolution landscape recommended'}
                    </span>
                  </div>

                  <label
                    htmlFor="homepage-bg-file"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded bg-[#E64A19] hover:bg-[#D84315] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow cursor-pointer shrink-0"
                  >
                    {isCheckingDuration ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Checking Video...</span>
                      </>
                    ) : isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Uploading {uploadProgress}%</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>{backgroundUrl ? 'Replace Background' : 'Upload From Disk'}</span>
                      </>
                    )}
                  </label>
                </div>

                {/* Upload Progress Bar */}
                {isUploading && (
                  <div className="space-y-1 pt-1">
                    <div className="w-full h-1.5 bg-[#1E222B] rounded-full overflow-hidden">
                      <div className="h-full bg-[#E64A19] transition-all" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  </div>
                )}

                {/* Upload Error Banner */}
                {uploadError && (
                  <div className="p-3 rounded bg-[#251818] border border-red-800 text-red-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {/* Active Background Status / Input */}
                <div className="space-y-2 pt-2 border-t border-[#2B313E]/60">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400">
                      Active Background URL
                    </label>
                    {backgroundUrl && (
                      <button
                        type="button"
                        onClick={handleClearBackground}
                        className="text-[11px] text-gray-400 hover:text-red-400 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remove Custom Background</span>
                      </button>
                    )}
                  </div>

                  <input
                    type="url"
                    value={backgroundUrl}
                    onChange={(e) => setBackgroundUrl(e.target.value)}
                    placeholder={backgroundType === 'video' ? 'https://res.cloudinary.com/.../video.mp4' : 'https://res.cloudinary.com/.../image.jpg'}
                    className="w-full bg-[#1E222B] border border-[#2B313E] rounded px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#E64A19]"
                  />

                  {backgroundType === 'video' && (
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        Video Poster Image URL (Initial Frame Fallback)
                      </label>
                      <input
                        type="url"
                        value={backgroundPosterUrl}
                        onChange={(e) => setBackgroundPosterUrl(e.target.value)}
                        placeholder="Auto-derived from Cloudinary or custom image URL..."
                        className="w-full bg-[#1E222B] border border-[#2B313E] rounded px-3 py-1.5 text-xs text-gray-300 font-mono focus:outline-none focus:border-[#E64A19]"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 2. STOREFRONT HERO COPY */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between border-b border-[#2B313E] pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#E64A19]" />
                  <span>Storefront Hero Copy &amp; Buttons</span>
                </span>
              </div>

              {/* Location Tag */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                  Hero Top Badge Tag
                </label>
                <input
                  type="text"
                  value={heroBadge}
                  onChange={(e) => setHeroBadge(e.target.value)}
                  placeholder="e.g. ABOSSEY OKAI, ACCRA"
                  className="w-full bg-[#1E222B] border border-[#2B313E] rounded px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#E64A19]"
                />
              </div>

              {/* Main Headline */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                  Primary Dealership Headline <span className="text-[#E64A19]">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g. DEALERS IN OPEL ENGINES &amp; ALL KINDS OF ENGINE PARTS"
                  className="w-full bg-[#1E222B] border border-[#2B313E] rounded px-3.5 py-2 text-xs font-bold uppercase text-white focus:outline-none focus:border-[#E64A19] resize-none"
                />
              </div>

              {/* Subheadline */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                  Subheadline / Secondary Tagline
                </label>
                <input
                  type="text"
                  value={subheadline}
                  onChange={(e) => setSubheadline(e.target.value)}
                  placeholder="e.g. BIG DAN DIRECT DISPATCH • ABOSSEY OKAI, ACCRA"
                  className="w-full bg-[#1E222B] border border-[#2B313E] rounded px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#E64A19]"
                />
              </div>

              {/* Supporting Paragraph */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                  Supporting Section Text
                </label>
                <textarea
                  rows={3}
                  value={supportingText}
                  onChange={(e) => setSupportingText(e.target.value)}
                  placeholder="Describe your dealership imports, European warranty inspections, on-site mechanic testing..."
                  className="w-full bg-[#1E222B] border border-[#2B313E] rounded px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#E64A19] resize-none leading-relaxed"
                />
              </div>

              {/* CTA Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#2B313E]">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                    Primary Button Label
                  </label>
                  <input
                    type="text"
                    value={primaryButtonText}
                    onChange={(e) => setPrimaryButtonText(e.target.value)}
                    placeholder="VIEW INVENTORY"
                    className="w-full bg-[#1E222B] border border-[#2B313E] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E64A19]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                    Secondary Button Label
                  </label>
                  <input
                    type="text"
                    value={secondaryButtonText}
                    onChange={(e) => setSecondaryButtonText(e.target.value)}
                    placeholder="PLACE ORDER"
                    className="w-full bg-[#1E222B] border border-[#2B313E] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E64A19]"
                  />
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-4 border-t border-[#2B313E] flex items-center justify-end">
              <button
                type="submit"
                disabled={isSaving || isUploading}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-md bg-[#E64A19] hover:bg-[#D84315] disabled:opacity-60 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-lg cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving to Firestore...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Homepage Content</span>
                  </>
                )}
              </button>
            </div>

          </form>

          {/* Live Preview Card (5 cols) */}
          <div className="lg:col-span-5 bg-[#161920] border border-[#2B313E] rounded-xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#2B313E] pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-400" />
                <span>Live Hero Preview</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-bold uppercase">
                {backgroundUrl ? `${backgroundType.toUpperCase()} BACKGROUND` : 'DEFAULT BACKGROUND'}
              </span>
            </div>

            {/* Visual Screen with Active Background */}
            <div className="relative rounded-lg overflow-hidden border border-[#2B313E] min-h-[300px] flex flex-col justify-end p-5 bg-[#0F1115]">
              {/* Media Layer */}
              <div className="absolute inset-0 z-0 overflow-hidden">
                {backgroundUrl ? (
                  backgroundType === 'video' ? (
                    <video
                      key={previewMediaUrl}
                      src={previewMediaUrl}
                      poster={backgroundPosterUrl || getCloudinaryVideoPoster(backgroundUrl)}
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="w-full h-full object-cover brightness-[0.75]"
                    />
                  ) : (
                    <img
                      key={previewMediaUrl}
                      src={previewMediaUrl}
                      alt="Homepage Background"
                      className="w-full h-full object-cover brightness-[0.75]"
                    />
                  )
                ) : (
                  <div className="w-full h-full bg-radial from-[#1E222B] to-[#0F1115] opacity-90" />
                )}

                {/* Overlaid Gradient Scrim */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F1115] via-[#0F1115]/60 to-transparent" />
              </div>

              {/* Overlaid Content Preview */}
              <div className="relative z-10 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-xs bg-[#E64A19]" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-[#E64A19]">
                    {heroBadge || 'ABOSSEY OKAI, ACCRA'}
                  </span>
                </div>

                <h1 className="text-sm sm:text-base font-black uppercase text-white tracking-tight leading-snug">
                  {headline || 'DEALERS IN OPEL ENGINES & ALL KINDS OF ENGINE PARTS'}
                </h1>

                <p className="text-[11px] text-gray-300 leading-relaxed line-clamp-2">
                  {supportingText || 'Direct importers and stockists of authentic European Opel engines in Abossey Okai.'}
                </p>

                <div className="flex items-center gap-2 pt-1">
                  <span className="px-2.5 py-1 rounded bg-[#E64A19] text-white text-[9px] font-bold uppercase tracking-wider shadow">
                    {primaryButtonText || 'VIEW INVENTORY'}
                  </span>
                  <span className="px-2.5 py-1 rounded bg-[#1E222B] border border-[#2B313E] text-white text-[9px] font-bold uppercase tracking-wider">
                    {secondaryButtonText || 'PLACE ORDER'}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded bg-[#111317] border border-[#2B313E] text-[11px] text-gray-400 space-y-1">
              <strong className="text-gray-300 block font-bold uppercase">Realtime Delivery:</strong>
              <p>
                When you click save, the active background and copy are written to <code className="text-[#E64A19] font-mono">homepageContent/main</code>. Open the public website in any browser and watch it update live without needing a page reload.
              </p>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
