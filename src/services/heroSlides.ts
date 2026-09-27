import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';

export interface HeroSlideItem {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  ctaText?: string;
  ctaLink?: string;
  sortOrder: number;
  active: boolean;
  createdAt?: Timestamp | any;
  updatedAt?: Timestamp | any;
}

export type HeroSlideInput = Omit<HeroSlideItem, 'id' | 'createdAt' | 'updatedAt'>;

const HERO_SLIDES_COLLECTION = 'heroSlides';

/**
 * Fetch all hero slides once
 */
export async function getHeroSlides(): Promise<HeroSlideItem[]> {
  try {
    const colRef = collection(db, HERO_SLIDES_COLLECTION);
    const q = query(colRef, orderBy('sortOrder', 'asc'));
    const snapshot = await getDocs(q);

    const items: HeroSlideItem[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      items.push({
        id: docSnap.id,
        title: data.title || '',
        subtitle: data.subtitle || '',
        imageUrl: data.imageUrl || '',
        ctaText: data.ctaText || '',
        ctaLink: data.ctaLink || '',
        sortOrder: typeof data.sortOrder === 'number' ? data.sortOrder : 0,
        active: data.active !== false,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      });
    });

    return items;
  } catch (error) {
    console.error('Error fetching hero slides from Firestore:', error);
    throw error;
  }
}

/**
 * Real-time listener for hero slides collection
 */
export function subscribeToHeroSlides(
  callback: (slides: HeroSlideItem[]) => void,
  onError?: (error: Error) => void
): () => void {
  const colRef = collection(db, HERO_SLIDES_COLLECTION);
  const q = query(colRef, orderBy('sortOrder', 'asc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: HeroSlideItem[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          id: docSnap.id,
          title: data.title || '',
          subtitle: data.subtitle || '',
          imageUrl: data.imageUrl || '',
          ctaText: data.ctaText || '',
          ctaLink: data.ctaLink || '',
          sortOrder: typeof data.sortOrder === 'number' ? data.sortOrder : 0,
          active: data.active !== false,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        });
      });
      callback(items);
    },
    (error) => {
      console.warn('Realtime hero slides subscription notice:', error);
      if (onError) onError(error);
    }
  );
}

/**
 * Create a new hero slide
 */
export async function createHeroSlide(input: HeroSlideInput): Promise<string> {
  try {
    const colRef = collection(db, HERO_SLIDES_COLLECTION);
    const docRef = await addDoc(colRef, {
      title: input.title.trim(),
      subtitle: (input.subtitle || '').trim(),
      imageUrl: input.imageUrl.trim(),
      ctaText: (input.ctaText || '').trim(),
      ctaLink: (input.ctaLink || '').trim(),
      sortOrder: Number(input.sortOrder) || 1,
      active: input.active !== false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error: any) {
    console.error('Error creating hero slide in Firestore:', error);
    throw new Error(error.message || 'Failed to create hero slide.');
  }
}

/**
 * Update an existing hero slide
 */
export async function updateHeroSlide(id: string, input: Partial<HeroSlideInput>): Promise<void> {
  try {
    const docRef = doc(db, HERO_SLIDES_COLLECTION, id);
    const payload: Record<string, any> = {
      updatedAt: serverTimestamp()
    };

    if (input.title !== undefined) payload.title = input.title.trim();
    if (input.subtitle !== undefined) payload.subtitle = input.subtitle.trim();
    if (input.imageUrl !== undefined) payload.imageUrl = input.imageUrl.trim();
    if (input.ctaText !== undefined) payload.ctaText = input.ctaText.trim();
    if (input.ctaLink !== undefined) payload.ctaLink = input.ctaLink.trim();
    if (input.sortOrder !== undefined) payload.sortOrder = Number(input.sortOrder);
    if (input.active !== undefined) payload.active = Boolean(input.active);

    await updateDoc(docRef, payload);
  } catch (error: any) {
    console.error(`Error updating hero slide ${id}:`, error);
    throw new Error(error.message || 'Failed to update hero slide.');
  }
}

/**
 * Delete a hero slide
 */
export async function deleteHeroSlide(id: string): Promise<void> {
  try {
    const docRef = doc(db, HERO_SLIDES_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error: any) {
    console.error(`Error deleting hero slide ${id}:`, error);
    throw new Error(error.message || 'Failed to delete hero slide.');
  }
}

/**
 * Inline toggle active
 */
export async function toggleHeroSlideActive(id: string, currentStatus: boolean): Promise<void> {
  return updateHeroSlide(id, { active: !currentStatus });
}
