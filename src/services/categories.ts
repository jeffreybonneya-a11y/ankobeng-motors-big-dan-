import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
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

export interface CategoryItem {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  sortOrder: number;
  active: boolean;
  createdAt?: Timestamp | any;
  updatedAt?: Timestamp | any;
}

export type CategoryInput = Omit<CategoryItem, 'id' | 'createdAt' | 'updatedAt'>;

const CATEGORIES_COLLECTION = 'categories';

/**
 * Fetch all categories from Firestore once
 */
export async function getCategories(): Promise<CategoryItem[]> {
  try {
    const colRef = collection(db, CATEGORIES_COLLECTION);
    const q = query(colRef, orderBy('sortOrder', 'asc'));
    const snapshot = await getDocs(q);

    const items: CategoryItem[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      items.push({
        id: docSnap.id,
        name: data.name || '',
        slug: data.slug || '',
        description: data.description || '',
        sortOrder: typeof data.sortOrder === 'number' ? data.sortOrder : 0,
        active: data.active !== false,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      });
    });

    return items;
  } catch (error) {
    console.error('Error fetching categories from Firestore:', error);
    throw error;
  }
}

/**
 * Real-time listener for categories collection
 */
export function subscribeToCategories(
  callback: (categories: CategoryItem[]) => void,
  onError?: (error: Error) => void
): () => void {
  const colRef = collection(db, CATEGORIES_COLLECTION);
  const q = query(colRef, orderBy('sortOrder', 'asc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: CategoryItem[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          id: docSnap.id,
          name: data.name || '',
          slug: data.slug || '',
          description: data.description || '',
          sortOrder: typeof data.sortOrder === 'number' ? data.sortOrder : 0,
          active: data.active !== false,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        });
      });
      callback(items);
    },
    (error) => {
      console.warn('Realtime categories subscription notice:', error);
      if (onError) onError(error);
    }
  );
}

/**
 * Create a new category
 */
export async function createCategory(input: CategoryInput): Promise<string> {
  try {
    const colRef = collection(db, CATEGORIES_COLLECTION);
    const docRef = await addDoc(colRef, {
      name: input.name.trim(),
      slug: (input.slug || input.name).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-'),
      description: (input.description || '').trim(),
      sortOrder: Number(input.sortOrder) || 1,
      active: input.active !== false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error: any) {
    console.error('Error creating category in Firestore:', error);
    throw new Error(error.message || 'Failed to create category.');
  }
}

/**
 * Update an existing category
 */
export async function updateCategory(id: string, input: Partial<CategoryInput>): Promise<void> {
  try {
    const docRef = doc(db, CATEGORIES_COLLECTION, id);
    const payload: Record<string, any> = {
      updatedAt: serverTimestamp()
    };

    if (input.name !== undefined) {
      payload.name = input.name.trim();
      if (!input.slug) {
        payload.slug = input.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
      }
    }
    if (input.slug !== undefined) payload.slug = input.slug.toLowerCase().trim();
    if (input.description !== undefined) payload.description = input.description.trim();
    if (input.sortOrder !== undefined) payload.sortOrder = Number(input.sortOrder);
    if (input.active !== undefined) payload.active = Boolean(input.active);

    await updateDoc(docRef, payload);
  } catch (error: any) {
    console.error(`Error updating category ${id}:`, error);
    throw new Error(error.message || 'Failed to update category.');
  }
}

/**
 * Delete a category
 */
export async function deleteCategory(id: string): Promise<void> {
  try {
    const docRef = doc(db, CATEGORIES_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error: any) {
    console.error(`Error deleting category ${id}:`, error);
    throw new Error(error.message || 'Failed to delete category.');
  }
}
