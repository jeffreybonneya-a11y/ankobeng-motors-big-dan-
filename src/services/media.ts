import { 
  collection, 
  doc, 
  addDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  publicId: string;
  resourceType: 'image' | 'video' | string;
  format: string;
  width?: number;
  height?: number;
  duration?: number;
  bytes: number;
  createdAt?: any;
  uploadedBy: string;
}

const MEDIA_COLLECTION = 'media';

/**
 * Creates a media record in Firestore after Cloudinary upload completes
 */
export async function createMediaRecord(
  data: Omit<MediaItem, 'id' | 'createdAt'>
): Promise<string> {
  try {
    const colRef = collection(db, MEDIA_COLLECTION);
    const docData: Record<string, any> = {
      name: data.name,
      url: data.url,
      publicId: data.publicId,
      resourceType: data.resourceType,
      format: data.format,
      width: data.width || null,
      height: data.height || null,
      duration: typeof data.duration === 'number' ? data.duration : null,
      bytes: data.bytes || 0,
      createdAt: serverTimestamp(),
      uploadedBy: data.uploadedBy
    };

    const docRef = await addDoc(colRef, docData);
    return docRef.id;
  } catch (error: any) {
    console.error('Error creating Firestore media record:', error);
    throw new Error(`Failed to save media metadata in Firestore: ${error.message}`);
  }
}

/**
 * Fetches all media items once
 */
export async function getMedia(): Promise<MediaItem[]> {
  try {
    const colRef = collection(db, MEDIA_COLLECTION);
    const q = query(colRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        name: data.name || 'Untitled Asset',
        url: data.url,
        publicId: data.publicId,
        resourceType: data.resourceType || 'image',
        format: data.format || '',
        width: data.width,
        height: data.height,
        duration: data.duration,
        bytes: data.bytes || 0,
        createdAt: data.createdAt,
        uploadedBy: data.uploadedBy || 'Admin'
      };
    });
  } catch (error: any) {
    console.error('Error fetching media:', error);
    throw error;
  }
}

/**
 * Subscribes to real-time updates for the media collection
 */
export function subscribeToMedia(
  callback: (items: MediaItem[]) => void,
  onError?: (error: any) => void
): () => void {
  const colRef = collection(db, MEDIA_COLLECTION);
  const q = query(colRef, orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: MediaItem[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          name: data.name || 'Untitled Asset',
          url: data.url,
          publicId: data.publicId,
          resourceType: data.resourceType || 'image',
          format: data.format || '',
          width: data.width,
          height: data.height,
          duration: data.duration,
          bytes: data.bytes || 0,
          createdAt: data.createdAt,
          uploadedBy: data.uploadedBy || 'Admin'
        };
      });
      callback(items);
    },
    (err) => {
      console.warn('Realtime media subscription notice:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Deletes a media record from Firestore
 */
export async function deleteMediaRecord(mediaId: string): Promise<void> {
  if (!mediaId) return;
  try {
    const docRef = doc(db, MEDIA_COLLECTION, mediaId);
    await deleteDoc(docRef);
  } catch (error: any) {
    console.error(`Error deleting media record ${mediaId}:`, error);
    throw new Error(`Failed to delete media record: ${error.message}`);
  }
}
