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

export interface ProductInput {
  name: string;
  imageUrl: string;
  description: string;
  category: string;
  featured: boolean;
  showInHero: boolean;
  sortOrder: number;
}

export interface FirestoreProductItem extends ProductInput {
  id: string;
  createdAt?: Timestamp | any;
  updatedAt?: Timestamp | any;
}

const PRODUCTS_COLLECTION = 'products';

/**
 * Fetch all products from Firestore once (ordered by sortOrder)
 */
export async function getProducts(): Promise<FirestoreProductItem[]> {
  try {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const q = query(productsRef, orderBy('sortOrder', 'asc'));
    const snapshot = await getDocs(q);

    const items: FirestoreProductItem[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      items.push({
        id: docSnap.id,
        name: data.name || 'Untitled Part',
        imageUrl: data.imageUrl || '',
        description: data.description || '',
        category: data.category || 'OPEL',
        featured: Boolean(data.featured),
        showInHero: Boolean(data.showInHero ?? true),
        sortOrder: typeof data.sortOrder === 'number' ? data.sortOrder : 0,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      });
    });

    return items;
  } catch (error) {
    console.error('Error fetching products from Firestore:', error);
    throw error;
  }
}

/**
 * Real-time listener for products collection
 * Calls callback whenever any product is added, updated, reordered, or deleted
 */
export function subscribeToProducts(
  callback: (products: FirestoreProductItem[]) => void,
  onError?: (error: Error) => void
): () => void {
  const productsRef = collection(db, PRODUCTS_COLLECTION);
  const q = query(productsRef, orderBy('sortOrder', 'asc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: FirestoreProductItem[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          id: docSnap.id,
          name: data.name || 'Untitled Part',
          imageUrl: data.imageUrl || '',
          description: data.description || '',
          category: data.category || 'OPEL',
          featured: Boolean(data.featured),
          showInHero: Boolean(data.showInHero ?? true),
          sortOrder: typeof data.sortOrder === 'number' ? data.sortOrder : 0,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        });
      });
      callback(items);
    },
    (error) => {
      console.error('Realtime products subscription error:', error);
      if (onError) onError(error);
    }
  );
}

/**
 * Fetch a single product by ID
 */
export async function getProduct(id: string): Promise<FirestoreProductItem | null> {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;

    const data = docSnap.data();
    return {
      id: docSnap.id,
      name: data.name || '',
      imageUrl: data.imageUrl || '',
      description: data.description || '',
      category: data.category || 'OPEL',
      featured: Boolean(data.featured),
      showInHero: Boolean(data.showInHero ?? true),
      sortOrder: typeof data.sortOrder === 'number' ? data.sortOrder : 0,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    };
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    throw error;
  }
}

/**
 * Create a new product in Firestore
 */
export async function createProduct(input: ProductInput): Promise<string> {
  try {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const docRef = await addDoc(productsRef, {
      name: input.name.trim(),
      imageUrl: input.imageUrl.trim(),
      description: input.description.trim(),
      category: input.category || 'OPEL',
      featured: Boolean(input.featured),
      showInHero: Boolean(input.showInHero),
      sortOrder: Number(input.sortOrder) || 1,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error: any) {
    console.error('Error creating product in Firestore:', error);
    throw new Error(error.message || 'Failed to create product.');
  }
}

/**
 * Update an existing product in Firestore
 */
export async function updateProduct(id: string, input: Partial<ProductInput>): Promise<void> {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    const payload: Record<string, any> = {
      updatedAt: serverTimestamp()
    };

    if (input.name !== undefined) payload.name = input.name.trim();
    if (input.imageUrl !== undefined) payload.imageUrl = input.imageUrl.trim();
    if (input.description !== undefined) payload.description = input.description.trim();
    if (input.category !== undefined) payload.category = input.category;
    if (input.featured !== undefined) payload.featured = Boolean(input.featured);
    if (input.showInHero !== undefined) payload.showInHero = Boolean(input.showInHero);
    if (input.sortOrder !== undefined) payload.sortOrder = Number(input.sortOrder);

    await updateDoc(docRef, payload);
  } catch (error: any) {
    console.error(`Error updating product ${id}:`, error);
    throw new Error(error.message || 'Failed to update product.');
  }
}

/**
 * Delete a product from Firestore
 */
export async function deleteProduct(id: string): Promise<void> {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error: any) {
    console.error(`Error deleting product ${id}:`, error);
    throw new Error(error.message || 'Failed to delete product.');
  }
}

/**
 * Quick inline toggle for Featured flag
 */
export async function toggleProductFeatured(id: string, currentStatus: boolean): Promise<void> {
  return updateProduct(id, { featured: !currentStatus });
}

/**
 * Quick inline toggle for Show in Hero flag
 */
export async function toggleProductHero(id: string, currentStatus: boolean): Promise<void> {
  return updateProduct(id, { showInHero: !currentStatus });
}
