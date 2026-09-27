import { 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';

export interface HomepageContentData {
  headline: string;
  subheadline: string;
  supportingText: string;
  primaryButtonText: string;
  secondaryButtonText: string;
  heroBadge?: string;
  heroBackground?: string; // legacy support
  backgroundType?: 'image' | 'video';
  backgroundUrl?: string;
  backgroundPosterUrl?: string;
  updatedAt?: Timestamp | any;
}

const HOMEPAGE_DOC_PATH = 'homepageContent';
const HOMEPAGE_DOC_ID = 'main';

/**
 * Derives a poster image URL from a Cloudinary video URL if not explicitly provided
 */
export function getCloudinaryVideoPoster(videoUrl: string): string {
  if (!videoUrl) return '';
  if (videoUrl.includes('res.cloudinary.com') && videoUrl.includes('/video/upload/')) {
    // Cloudinary automatically extracts a frame when switching extension to .jpg with so_0 (start offset 0s)
    let poster = videoUrl.replace(/\.(mp4|webm|mov|ogg)$/i, '.jpg');
    if (!poster.includes('/so_')) {
      poster = poster.replace('/video/upload/', '/video/upload/so_0,f_jpg,q_auto/');
    }
    return poster;
  }
  return '';
}

/**
 * Generates cache-busted URL using updatedAt timestamp
 */
export function getCacheBustedUrl(url?: string, updatedAt?: any): string {
  if (!url) return '';
  let version = Date.now().toString();
  if (updatedAt) {
    if (typeof updatedAt.toMillis === 'function') {
      version = updatedAt.toMillis().toString();
    } else if (typeof updatedAt.seconds === 'number') {
      version = `${updatedAt.seconds}`;
    } else if (updatedAt instanceof Date) {
      version = updatedAt.getTime().toString();
    }
  }
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${version}`;
}

/**
 * Fetch homepage content once
 */
export async function getHomepageContent(): Promise<HomepageContentData | null> {
  try {
    const docRef = doc(db, HOMEPAGE_DOC_PATH, HOMEPAGE_DOC_ID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        headline: data.headline || '',
        subheadline: data.subheadline || '',
        supportingText: data.supportingText || '',
        primaryButtonText: data.primaryButtonText || 'VIEW INVENTORY',
        secondaryButtonText: data.secondaryButtonText || 'PLACE ORDER',
        heroBadge: data.heroBadge || '',
        heroBackground: data.heroBackground || '',
        backgroundType: data.backgroundType || (data.backgroundUrl ? 'image' : undefined),
        backgroundUrl: data.backgroundUrl || data.heroBackground || '',
        backgroundPosterUrl: data.backgroundPosterUrl || '',
        updatedAt: data.updatedAt
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching homepage content from Firestore:', error);
    throw error;
  }
}

/**
 * Real-time listener for homepage content
 */
export function subscribeToHomepageContent(
  callback: (content: HomepageContentData | null) => void,
  onError?: (error: Error) => void
): () => void {
  const docRef = doc(db, HOMEPAGE_DOC_PATH, HOMEPAGE_DOC_ID);

  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        callback({
          headline: data.headline || '',
          subheadline: data.subheadline || '',
          supportingText: data.supportingText || '',
          primaryButtonText: data.primaryButtonText || 'VIEW INVENTORY',
          secondaryButtonText: data.secondaryButtonText || 'PLACE ORDER',
          heroBadge: data.heroBadge || '',
          heroBackground: data.heroBackground || '',
          backgroundType: data.backgroundType || (data.backgroundUrl ? 'image' : undefined),
          backgroundUrl: data.backgroundUrl || data.heroBackground || '',
          backgroundPosterUrl: data.backgroundPosterUrl || '',
          updatedAt: data.updatedAt
        });
      } else {
        callback(null);
      }
    },
    (error) => {
      console.warn('Realtime homepage content subscription notice:', error);
      if (onError) onError(error);
    }
  );
}

/**
 * Save / update homepage content in homepageContent/main
 */
export async function saveHomepageContent(input: Partial<HomepageContentData>): Promise<void> {
  try {
    const docRef = doc(db, HOMEPAGE_DOC_PATH, HOMEPAGE_DOC_ID);
    const payload: Record<string, any> = {
      updatedAt: serverTimestamp()
    };

    if (input.headline !== undefined) payload.headline = input.headline.trim();
    if (input.subheadline !== undefined) payload.subheadline = input.subheadline.trim();
    if (input.supportingText !== undefined) payload.supportingText = input.supportingText.trim();
    if (input.primaryButtonText !== undefined) payload.primaryButtonText = input.primaryButtonText.trim();
    if (input.secondaryButtonText !== undefined) payload.secondaryButtonText = input.secondaryButtonText.trim();
    if (input.heroBadge !== undefined) payload.heroBadge = input.heroBadge.trim();
    if (input.heroBackground !== undefined) payload.heroBackground = input.heroBackground.trim();
    if (input.backgroundType !== undefined) payload.backgroundType = input.backgroundType;
    if (input.backgroundUrl !== undefined) {
      payload.backgroundUrl = input.backgroundUrl.trim();
      // Keep legacy heroBackground in sync
      payload.heroBackground = input.backgroundUrl.trim();
    }
    if (input.backgroundPosterUrl !== undefined) {
      payload.backgroundPosterUrl = input.backgroundPosterUrl.trim();
    }

    await setDoc(docRef, payload, { merge: true });
  } catch (error: any) {
    console.error('Error saving homepage content to Firestore:', error);
    throw new Error(error.message || 'Failed to save homepage content.');
  }
}
