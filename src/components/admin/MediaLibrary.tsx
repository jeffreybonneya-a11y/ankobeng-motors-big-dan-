import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, 
  Image as ImageIcon, 
  Film, 
  Copy, 
  Check, 
  Trash2, 
  Search, 
  ExternalLink, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  Eye, 
  Clock,
  Database,
  Cloud
} from 'lucide-react';
import { User } from 'firebase/auth';
import { uploadToCloudinary, CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from '../../services/cloudinary';
import { MediaItem, createMediaRecord, subscribeToMedia, deleteMediaRecord } from '../../services/media';

interface MediaLibraryProps {
  user?: { uid?: string; email?: string };
}

/**
 * Extracts video duration locally in browser before any upload
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

export const MediaLibrary: React.FC<MediaLibraryProps> = ({ user }) => {
  // Media State from Firestore realtime listener
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(true);

  // Filter & Search
  const [activeFilter, setActiveFilter] = useState<'all' | 'image' | 'video'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [fileDuration, setFileDuration] = useState<number | null>(null);
  const [isCheckingDuration, setIsCheckingDuration] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadFeedback, setUploadFeedback] = useState<{
    type: 'success' | 'error' | null;
    message: string;
    details?: string;
  }>({ type: null, message: '' });

  // Modal State
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Subscribe to real-time Firestore media records
  useEffect(() => {
    setLoadingMedia(true);
    const unsubscribe = subscribeToMedia(
      (items) => {
        setMediaItems(items);
        setLoadingMedia(false);
      },
      (error) => {
        console.warn('Realtime media subscription error:', error);
        setLoadingMedia(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // 2. Clear selected file and revoked previews
  const handleClearSelection = () => {
    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl);
    }
    setSelectedFile(null);
    setFilePreviewUrl(null);
    setFileDuration(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 3. Handle file selection with HARD 50-SECOND VIDEO RULE
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadFeedback({ type: null, message: '' });

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      setUploadFeedback({
        type: 'error',
        message: 'Unsupported file format. Please select an image (JPG, PNG, WEBP) or a video (MP4, WEBM).'
      });
      return;
    }

    // Video validation rule
    if (isVideo) {
      setIsCheckingDuration(true);
      try {
        const durationInSeconds = await readLocalVideoDuration(file);
        
        // HARD 50-SECOND MAXIMUM CHECK
        if (durationInSeconds > 50) {
          setIsCheckingDuration(false);
          handleClearSelection();
          setUploadFeedback({
            type: 'error',
            message: 'Video must be 50 seconds or less.',
            details: `Selected video is ${Math.round(durationInSeconds)} seconds long, which exceeds the 50-second maximum limit.`
          });
          return;
        }

        // Allowed video
        setIsCheckingDuration(false);
        setSelectedFile(file);
        setFileDuration(durationInSeconds);
        const objectUrl = URL.createObjectURL(file);
        setFilePreviewUrl(objectUrl);
      } catch (err: any) {
        setIsCheckingDuration(false);
        handleClearSelection();
        setUploadFeedback({
          type: 'error',
          message: 'Failed to inspect video duration.',
          details: err.message || 'Please ensure the video is a valid MP4 or WEBM file.'
        });
        return;
      }
    } else {
      // Allowed image
      setSelectedFile(file);
      setFileDuration(null);
      const objectUrl = URL.createObjectURL(file);
      setFilePreviewUrl(objectUrl);
    }
  };

  // 4. Perform Cloudinary upload & Firestore record creation
  const handleUploadSubmit = async () => {
    if (!selectedFile) return;

    // Secondary safety check for videos
    if (selectedFile.type.startsWith('video/') && fileDuration && fileDuration > 50) {
      setUploadFeedback({
        type: 'error',
        message: 'Video must be 50 seconds or less.'
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadFeedback({ type: null, message: '' });

    try {
      // Step 1: Upload to Cloudinary with real progress tracking
      const uploadResult = await uploadToCloudinary(selectedFile, (progress) => {
        setUploadProgress(progress);
      });

      // Step 2: Validate duration from Cloudinary response if provided
      const resolvedDuration = typeof uploadResult.duration === 'number' 
        ? uploadResult.duration 
        : (fileDuration ?? undefined);

      if (uploadResult.resource_type === 'video' && resolvedDuration && resolvedDuration > 50.5) {
        throw new Error('Cloudinary verified video duration exceeds the 50 seconds limit.');
      }

      // Step 3: Save metadata to Firestore using authenticated UID
      await createMediaRecord({
        name: selectedFile.name,
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        resourceType: uploadResult.resource_type || (selectedFile.type.startsWith('video/') ? 'video' : 'image'),
        format: uploadResult.format || selectedFile.name.split('.').pop() || '',
        width: uploadResult.width,
        height: uploadResult.height,
        duration: resolvedDuration ? Math.round(resolvedDuration * 10) / 10 : undefined,
        bytes: uploadResult.bytes || selectedFile.size,
        uploadedBy: user?.uid || 'admin'
      });

      setUploadFeedback({
        type: 'success',
        message: `Successfully uploaded "${selectedFile.name}" to Cloudinary and indexed in Media Library.`
      });

      // Reset file input
      handleClearSelection();
    } catch (err: any) {
      console.error('Upload pipeline error:', err);
      setUploadFeedback({
        type: 'error',
        message: 'Media upload failed.',
        details: err.message || 'Network error or Cloudinary rejection.'
      });
    } finally {
      setIsUploading(false);
    }
  };

  // 5. Handle Copy URL
  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  // 6. Handle Delete Record
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      await deleteMediaRecord(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err: any) {
      console.error('Delete error:', err);
      alert(`Failed to delete media record: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Format bytes helper
  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Format duration helper
  const formatDuration = (seconds?: number) => {
    if (!seconds && seconds !== 0) return null;
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Filter & search computation
  const filteredMedia = mediaItems.filter((item) => {
    const matchesFilter = 
      activeFilter === 'all' || 
      (activeFilter === 'image' && item.resourceType === 'image') ||
      (activeFilter === 'video' && item.resourceType === 'video');

    const matchesSearch = 
      !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.format.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.publicId.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 font-['Outfit'] text-gray-200">
      
      {/* 1. Header & Cloudinary Pipeline Specs */}
      <div className="p-6 rounded-lg bg-[#161920] border border-[#2B313E] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#E64A19]"></span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#E64A19]">
              Cloudinary Media Pipeline
            </span>
          </div>
          <h2 className="text-xl font-bold uppercase tracking-tight text-white">
            Media Asset Library
          </h2>
          <p className="text-xs text-gray-400">
            Upload and manage high-resolution engine photos, short videos (max 50s), and dealership branding assets.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="px-3 py-1.5 rounded bg-[#1E222B] border border-[#2B313E] flex items-center gap-2">
            <Cloud className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-gray-400">Cloud:</span>
            <code className="text-white font-mono font-bold">{CLOUDINARY_CLOUD_NAME}</code>
          </div>
          <div className="px-3 py-1.5 rounded bg-[#1E222B] border border-[#2B313E] flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-gray-400">Total Assets:</span>
            <span className="text-white font-bold">{mediaItems.length}</span>
          </div>
        </div>
      </div>

      {/* 2. Upload Area */}
      <div className="p-6 rounded-lg bg-[#161920] border border-[#2B313E] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
            <Upload className="w-4 h-4 text-[#E64A19]" />
            <span>Upload New Asset (Image or Video)</span>
          </span>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="px-2 py-0.5 rounded bg-[#1E222B] text-amber-400 border border-[#2B313E] font-bold">
              Videos: Max 50s
            </span>
            <span className="text-gray-400">
              Preset: <code className="text-gray-300 font-mono text-[10px]">{CLOUDINARY_UPLOAD_PRESET}</code>
            </span>
          </div>
        </div>

        {/* Dropzone & Picker */}
        <div className="border-2 border-dashed border-[#2B313E] hover:border-[#E64A19]/60 rounded-lg p-6 text-center transition-colors bg-[#111317]">
          <input
            ref={fileInputRef}
            type="file"
            id="media-file-input"
            accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
            onChange={handleFileChange}
            disabled={isUploading || isCheckingDuration}
            className="hidden"
          />

          {!selectedFile ? (
            <label
              htmlFor="media-file-input"
              className="flex flex-col items-center justify-center cursor-pointer space-y-2 py-4"
            >
              <div className="w-12 h-12 rounded-lg bg-[#1E222B] border border-[#2B313E] flex items-center justify-center text-[#E64A19] group-hover:scale-105 transition-transform">
                {isCheckingDuration ? (
                  <Loader2 className="w-6 h-6 animate-spin text-[#E64A19]" />
                ) : (
                  <Upload className="w-6 h-6" />
                )}
              </div>
              <div className="space-y-1">
                <p className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                  {isCheckingDuration ? 'Reading Video Duration...' : 'Click to Browse or Drag & Drop Media'}
                </p>
                <p className="text-[11px] text-gray-400">
                  Images: JPG, PNG, WEBP • Videos: MP4, WEBM (Hard limit: 50 seconds maximum)
                </p>
              </div>
            </label>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3 rounded-lg bg-[#1E222B] border border-[#2B313E] text-left">
              <div className="flex items-center gap-3 min-w-0">
                {selectedFile.type.startsWith('video/') ? (
                  <div className="w-20 h-16 rounded bg-[#161920] border border-[#2B313E] overflow-hidden shrink-0 relative flex items-center justify-center">
                    {filePreviewUrl ? (
                      <video
                        src={filePreviewUrl}
                        className="w-full h-full object-cover"
                        controls={false}
                        muted
                      />
                    ) : (
                      <Film className="w-6 h-6 text-blue-400" />
                    )}
                    <span className="absolute bottom-1 right-1 bg-black/80 px-1 py-0.2 rounded text-[9px] font-mono text-amber-400">
                      {fileDuration ? `${Math.round(fileDuration)}s` : 'Video'}
                    </span>
                  </div>
                ) : filePreviewUrl ? (
                  <img
                    src={filePreviewUrl}
                    alt="Preview"
                    className="w-16 h-16 object-cover rounded border border-[#2B313E] shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded bg-[#161920] border border-[#2B313E] flex items-center justify-center text-[#E64A19] shrink-0">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                )}

                <div className="min-w-0 space-y-1">
                  <span className="font-bold text-white text-xs block truncate">{selectedFile.name}</span>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-400">
                    <span>{formatBytes(selectedFile.size)}</span>
                    <span>•</span>
                    <span className="uppercase font-mono">{selectedFile.type || 'Media'}</span>
                    {fileDuration !== null && (
                      <>
                        <span>•</span>
                        <span className="text-amber-400 font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{Math.round(fileDuration)}s / 50s max</span>
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleClearSelection}
                  disabled={isUploading}
                  className="flex-1 sm:flex-none px-3 py-2 rounded bg-[#161920] hover:bg-[#252B36] border border-[#2B313E] text-gray-300 hover:text-white text-xs font-bold uppercase transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUploadSubmit}
                  disabled={isUploading}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 rounded bg-[#E64A19] hover:bg-[#D84315] disabled:opacity-60 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow cursor-pointer"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Uploading {uploadProgress}%</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Start Upload</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Upload Progress Bar */}
        {isUploading && (
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400 text-[11px]">Uploading to Cloudinary...</span>
              <span className="text-[#E64A19] font-mono font-bold text-[11px]">{uploadProgress}%</span>
            </div>
            <div className="w-full h-2 bg-[#111317] rounded-full overflow-hidden border border-[#2B313E]">
              <div
                className="h-full bg-[#E64A19] transition-all duration-200 ease-out"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Feedback Message */}
        {uploadFeedback.type && (
          <div className={`p-3.5 rounded-md border text-xs flex items-start gap-2.5 ${
            uploadFeedback.type === 'success' 
              ? 'bg-[#142318] border-emerald-800 text-emerald-300' 
              : 'bg-[#251818] border-red-800 text-red-300'
          }`}>
            {uploadFeedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            )}
            <div>
              <strong className="block font-bold">{uploadFeedback.message}</strong>
              {uploadFeedback.details && <span className="text-[11px] mt-0.5 block opacity-90">{uploadFeedback.details}</span>}
            </div>
          </div>
        )}
      </div>

      {/* 3. Toolbar: Search & Resource Type Filters */}
      <div className="p-4 rounded-lg bg-[#161920] border border-[#2B313E] flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shrink-0 ${
              activeFilter === 'all'
                ? 'bg-[#E64A19] text-white'
                : 'bg-[#1E222B] text-gray-300 hover:text-white border border-[#2B313E]'
            }`}
          >
            All ({mediaItems.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('image')}
            className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeFilter === 'image'
                ? 'bg-[#E64A19] text-white'
                : 'bg-[#1E222B] text-gray-300 hover:text-white border border-[#2B313E]'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Images ({mediaItems.filter(m => m.resourceType === 'image').length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('video')}
            className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeFilter === 'video'
                ? 'bg-[#E64A19] text-white'
                : 'bg-[#1E222B] text-gray-300 hover:text-white border border-[#2B313E]'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Videos ({mediaItems.filter(m => m.resourceType === 'video').length})</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search media..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded bg-[#111317] border border-[#2B313E] text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#E64A19]"
          />
        </div>

      </div>

      {/* 4. Real-time Media Grid */}
      {loadingMedia ? (
        <div className="p-12 text-center rounded-lg bg-[#161920] border border-[#2B313E] space-y-3">
          <Loader2 className="w-6 h-6 animate-spin text-[#E64A19] mx-auto" />
          <p className="text-xs text-gray-400">Loading Firestore media records...</p>
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="p-12 text-center rounded-lg bg-[#161920] border border-[#2B313E] space-y-3">
          <div className="w-12 h-12 rounded-lg bg-[#1E222B] border border-[#2B313E] flex items-center justify-center text-gray-500 mx-auto">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              {mediaItems.length === 0 ? 'No media uploaded yet' : 'No matching media assets found'}
            </h3>
            <p className="text-xs text-gray-400">
              {mediaItems.length === 0 
                ? 'Select an engine photo or short video above to upload your first asset to Cloudinary.'
                : 'Try adjusting your search query or resource filter.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredMedia.map((item) => {
            const isVideo = item.resourceType === 'video';

            return (
              <div
                key={item.id}
                className="rounded-lg bg-[#161920] border border-[#2B313E] overflow-hidden flex flex-col justify-between group hover:border-[#3B4254] transition-colors"
              >
                {/* Media Preview Container */}
                <div className="relative aspect-video bg-[#0D0F13] flex items-center justify-center overflow-hidden border-b border-[#2B313E]">
                  {isVideo ? (
                    <video
                      src={item.url}
                      className="w-full h-full object-cover"
                      controls={false}
                      preload="metadata"
                    />
                  ) : (
                    <img
                      src={item.url}
                      alt={item.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}

                  {/* Resource Type & Duration Badge */}
                  <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/80 backdrop-blur-xs text-[10px] font-bold uppercase tracking-wider text-white">
                    {isVideo ? <Film className="w-3 h-3 text-blue-400" /> : <ImageIcon className="w-3 h-3 text-emerald-400" />}
                    <span>{item.format || item.resourceType}</span>
                    {item.duration ? <span>({item.duration}s)</span> : null}
                  </div>

                  {/* Quick Action Overlay on Hover */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      title="Full Preview"
                      onClick={() => setPreviewItem(item)}
                      className="p-2 rounded bg-[#1E222B] hover:bg-[#2B313E] text-white transition-colors cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open Cloudinary URL in new tab"
                      className="p-2 rounded bg-[#1E222B] hover:bg-[#2B313E] text-white transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* Info & Footer */}
                <div className="p-3 space-y-2.5">
                  <div className="min-w-0">
                    <span className="font-bold text-xs text-white block truncate" title={item.name}>
                      {item.name}
                    </span>
                    <div className="flex items-center justify-between text-[10px] text-gray-400 mt-0.5">
                      <span>{formatBytes(item.bytes)}</span>
                      {item.duration ? (
                        <span className="text-amber-400 font-mono font-bold">{item.duration}s</span>
                      ) : item.width && item.height ? (
                        <span>{item.width} × {item.height}</span>
                      ) : null}
                    </div>
                  </div>

                  {/* Action Toolbar */}
                  <div className="pt-2 border-t border-[#2B313E] flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopyUrl(item.url, item.id)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-2 py-1 rounded bg-[#1E222B] hover:bg-[#252B36] text-[11px] font-bold text-gray-300 hover:text-white transition-colors cursor-pointer truncate"
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy URL</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteTarget(item)}
                      title="Delete Firestore media index"
                      className="p-1 rounded bg-[#1E222B] hover:bg-[#2C1919] text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* 5. Full Detail / Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#161920] border border-[#2B313E] rounded-xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            
            <div className="p-4 bg-[#111317] border-b border-[#2B313E] flex items-center justify-between">
              <div className="min-w-0 pr-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#E64A19] block">
                  ASSET PREVIEW &amp; TECHNICAL METADATA
                </span>
                <h3 className="text-sm font-bold text-white truncate">
                  {previewItem.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="p-1.5 rounded bg-[#1E222B] text-gray-400 hover:text-white transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
              {/* Media Player / Image */}
              <div className="rounded-lg bg-[#0D0F13] border border-[#2B313E] overflow-hidden flex items-center justify-center max-h-96">
                {previewItem.resourceType === 'video' ? (
                  <video
                    src={previewItem.url}
                    controls
                    autoPlay
                    className="max-h-96 w-full object-contain"
                  />
                ) : (
                  <img
                    src={previewItem.url}
                    alt={previewItem.name}
                    className="max-h-96 w-full object-contain"
                  />
                )}
              </div>

              {/* Technical Specifications Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded bg-[#111317] border border-[#2B313E]">
                  <span className="text-[10px] font-bold uppercase text-gray-400 block">Cloudinary Public ID</span>
                  <code className="text-gray-200 font-mono text-[11px] truncate block">{previewItem.publicId}</code>
                </div>

                <div className="p-2.5 rounded bg-[#111317] border border-[#2B313E]">
                  <span className="text-[10px] font-bold uppercase text-gray-400 block">File Size &amp; Format</span>
                  <span className="text-white font-bold block">{formatBytes(previewItem.bytes)} • {previewItem.format.toUpperCase()}</span>
                </div>

                <div className="p-2.5 rounded bg-[#111317] border border-[#2B313E]">
                  <span className="text-[10px] font-bold uppercase text-gray-400 block">
                    {previewItem.resourceType === 'video' ? 'Duration' : 'Dimensions'}
                  </span>
                  <span className="text-white font-bold block">
                    {previewItem.resourceType === 'video' && previewItem.duration
                      ? `${previewItem.duration} seconds (Hard max: 50s)`
                      : previewItem.width && previewItem.height 
                        ? `${previewItem.width} × ${previewItem.height} px` 
                        : 'N/A'}
                  </span>
                </div>

                <div className="p-2.5 rounded bg-[#111317] border border-[#2B313E]">
                  <span className="text-[10px] font-bold uppercase text-gray-400 block">Resource Type</span>
                  <span className="text-emerald-400 uppercase font-bold block">{previewItem.resourceType}</span>
                </div>

                <div className="p-2.5 rounded bg-[#111317] border border-[#2B313E] sm:col-span-2">
                  <span className="text-[10px] font-bold uppercase text-gray-400 block">Cloudinary Hosted Delivery URL</span>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-[#E64A19] font-mono text-[11px] truncate block flex-1">
                      {previewItem.url}
                    </code>
                    <button
                      type="button"
                      onClick={() => handleCopyUrl(previewItem.url, previewItem.id)}
                      className="px-2.5 py-1 rounded bg-[#1E222B] hover:bg-[#252B36] text-[11px] font-bold text-white shrink-0 cursor-pointer"
                    >
                      {copiedId === previewItem.id ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#111317] border-t border-[#2B313E] flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="px-4 py-2 rounded bg-[#1E222B] hover:bg-[#252B36] text-xs font-bold uppercase text-white transition-colors cursor-pointer"
              >
                Close Preview
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 6. Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#161920] border border-[#2B313E] rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-10 h-10 rounded-lg bg-[#251818] border border-red-800 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold uppercase text-white">Delete Media Record</h3>
                <span className="text-xs text-gray-400">Remove from Firestore collection</span>
              </div>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              Are you sure you want to remove <strong className="text-white">"{deleteTarget.name}"</strong> from the Media Library?
            </p>

            <div className="p-3 rounded bg-[#111317] border border-[#2B313E] text-[11px] text-gray-400 space-y-1">
              <span className="font-bold text-amber-400 block">Security Note:</span>
              <span>This removes the Firestore index record. The Cloudinary hosted asset remains safe and untouched.</span>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded bg-[#1E222B] hover:bg-[#252B36] text-xs font-bold uppercase text-gray-300 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="inline-flex items-center gap-2 px-4 py-2 rounded bg-red-600 hover:bg-red-700 disabled:opacity-60 text-xs font-bold uppercase text-white transition-colors cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Record</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
