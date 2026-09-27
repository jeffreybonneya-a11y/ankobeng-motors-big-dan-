/**
 * Cloudinary Media Service
 * Handles media uploads and transformations for Ankobeng Motors.
 *
 * Cloud Name: zpzdjznd
 * Upload Preset: ankobeng motors(big dan)_uploads
 */

export const CLOUDINARY_CLOUD_NAME = 
  import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'zpzdjznd';

export const CLOUDINARY_UPLOAD_PRESET = 
  import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ankobeng motors(big dan)_uploads';

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  resource_type: 'image' | 'video' | string;
  format: string;
  width?: number;
  height?: number;
  duration?: number;
  bytes: number;
  original_filename: string;
  created_at: string;
}

/**
 * Uploads an image or video file to Cloudinary using an unsigned upload preset
 * Supports real-time upload progress tracking.
 */
export async function uploadToCloudinary(
  file: File,
  onProgress?: (progressPercent: number) => void
): Promise<CloudinaryUploadResult> {
  if (!file) {
    throw new Error('No file provided for upload.');
  }

  // Determine resource type: images and videos supported
  const isVideo = file.type.startsWith('video/');
  const resourceType = isVideo ? 'video' : 'image';
  const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  return new Promise<CloudinaryUploadResult>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', uploadUrl, true);

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          if (!data.secure_url || !data.public_id) {
            reject(new Error('Invalid response from Cloudinary: missing secure_url or public_id.'));
            return;
          }

          const result: CloudinaryUploadResult = {
            secure_url: data.secure_url,
            public_id: data.public_id,
            resource_type: data.resource_type || resourceType,
            format: data.format || file.name.split('.').pop() || '',
            width: data.width,
            height: data.height,
            duration: typeof data.duration === 'number' ? data.duration : undefined,
            bytes: data.bytes || file.size,
            original_filename: data.original_filename || file.name,
            created_at: data.created_at || new Date().toISOString()
          };

          resolve(result);
        } catch (parseErr: any) {
          reject(new Error(`Failed to parse Cloudinary response: ${parseErr.message}`));
        }
      } else {
        try {
          const errorData = JSON.parse(xhr.responseText);
          const errorMsg = errorData?.error?.message || `Cloudinary upload failed with status ${xhr.status}`;
          reject(new Error(errorMsg));
        } catch {
          reject(new Error(`Cloudinary upload failed with status ${xhr.status}: ${xhr.statusText}`));
        }
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error during Cloudinary upload. Please check your internet connection.'));
    };

    xhr.onabort = () => {
      reject(new Error('Cloudinary upload was aborted.'));
    };

    xhr.send(formData);
  });
}

/**
 * Helper to generate optimized Cloudinary delivery URLs
 */
export function getOptimizedImageUrl(
  publicIdOrUrl: string, 
  options: { width?: number; height?: number; quality?: string | number; crop?: string } = {}
): string {
  if (!publicIdOrUrl) return '';
  if (publicIdOrUrl.startsWith('http://') || publicIdOrUrl.startsWith('https://')) {
    return publicIdOrUrl;
  }

  const { width, height, quality = 'auto', crop = 'scale' } = options;
  const transformations: string[] = [];

  if (crop) transformations.push(`c_${crop}`);
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (quality) transformations.push(`q_${quality}`);
  transformations.push('f_auto');

  const transformStr = transformations.join(',');
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${transformStr}/${publicIdOrUrl}`;
}
