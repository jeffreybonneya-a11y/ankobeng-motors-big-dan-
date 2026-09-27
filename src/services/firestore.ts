import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  query, 
  orderBy, 
  serverTimestamp,
  DocumentData
} from 'firebase/firestore';
import { db } from './firebase';
import { Product } from '../types/inventory';
import { INITIAL_PRODUCTS, BUSINESS_INFO, SERVICES, ASSETS } from '../data/initialData';

// Collection Constants
export const COLLECTIONS = {
  PRODUCTS: 'products',
  HOMEPAGE: 'homepage',
  SERVICES: 'services',
  ABOUT: 'about',
  CONTACT: 'contact',
  BUSINESS_INFO: 'businessInfo',
  MEDIA: 'media',
  SETTINGS: 'settings',
  HERO_SLIDES: 'heroSlides',
  ADMINS: 'admins'
} as const;

export interface FirestoreProduct {
  id?: string;
  name: string;
  imageUrl: string;
  description: string;
  category: 'OPEL' | 'CHEVROLET' | 'OTHER';
  featured: boolean;
  showInHero: boolean;
  sortOrder: number;
  createdAt?: any;
  updatedAt?: any;
}

export interface FirestoreHomepage {
  headline: string;
  supportingText: string;
  heroBackground: string;
  primaryButtonText: string;
  secondaryButtonText: string;
  heroEnabled: boolean;
  updatedAt?: any;
}

export interface FirestoreBusinessInfo {
  businessName: string;
  subTitle?: string;
  tagline: string;
  ownerNickname?: string;
  phone1: string;
  phone2: string;
  postalAddress: string;
  location: string;
  latitude: number;
  longitude: number;
  landmark?: string;
  workingHoursRegular?: string;
  workingHoursSunday?: string;
  updatedAt?: any;
}

/**
 * Fetch products from Firestore with fallback to static initial dataset
 */
export async function getProductsFromFirestore(): Promise<Product[]> {
  try {
    const productsRef = collection(db, COLLECTIONS.PRODUCTS);
    const q = query(productsRef, orderBy('sortOrder', 'asc'));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return INITIAL_PRODUCTS;
    }

    const firestoreProducts: Product[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as FirestoreProduct;
      firestoreProducts.push({
        id: docSnap.id,
        name: data.name,
        image: data.imageUrl,
        category: data.category,
        description: data.description,
        featured: data.featured,
        yardLocation: 'Abossey Okai Yard'
      });
    });

    return firestoreProducts.length > 0 ? firestoreProducts : INITIAL_PRODUCTS;
  } catch (error) {
    console.warn('Firestore products fetch fallback to static dataset:', error);
    return INITIAL_PRODUCTS;
  }
}

/**
 * Fetch business information from Firestore with fallback
 */
export async function getBusinessInfoFromFirestore(): Promise<typeof BUSINESS_INFO> {
  try {
    const infoDocRef = doc(db, COLLECTIONS.BUSINESS_INFO, 'main');
    const docSnap = await getDoc(infoDocRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as FirestoreBusinessInfo;
      return {
        name: data.businessName || BUSINESS_INFO.name,
        subTitle: data.subTitle || BUSINESS_INFO.subTitle,
        tagline: data.tagline || BUSINESS_INFO.tagline,
        ownerNickname: data.ownerNickname || BUSINESS_INFO.ownerNickname,
        phones: {
          primary: data.phone1 || BUSINESS_INFO.phones.primary,
          secondary: data.phone2 || BUSINESS_INFO.phones.secondary,
          formatted: `${data.phone1 || BUSINESS_INFO.phones.primary} / ${data.phone2 || BUSINESS_INFO.phones.secondary}`
        },
        address: {
          poBox: data.postalAddress || BUSINESS_INFO.address.poBox,
          area: BUSINESS_INFO.address.area,
          city: BUSINESS_INFO.address.city,
          country: BUSINESS_INFO.address.country,
          landmark: data.location || BUSINESS_INFO.address.landmark,
          gps: `${data.latitude}, ${data.longitude}`,
          mapsLink: BUSINESS_INFO.address.mapsLink
        },
        workingHours: {
          regular: data.workingHoursRegular || BUSINESS_INFO.workingHours.regular,
          sunday: data.workingHoursSunday || BUSINESS_INFO.workingHours.sunday
        }
      };
    }
    return BUSINESS_INFO;
  } catch (error) {
    console.warn('Firestore business info fetch fallback:', error);
    return BUSINESS_INFO;
  }
}

/**
 * Initial database seeder for admin foundation
 * Populates Firestore with the initial approved real dataset
 */
export async function seedInitialDatabase(): Promise<{ success: boolean; message: string }> {
  try {
    // 1. Seed Business Info
    const businessDocRef = doc(db, COLLECTIONS.BUSINESS_INFO, 'main');
    await setDoc(businessDocRef, {
      businessName: 'ANKOBENG MOTORS (BIG DAN)',
      subTitle: 'BIG DAN • ABOSSEY OKAI',
      tagline: 'DEALERS IN OPEL ENGINES & ALL KINDS OF ENGINE PARTS',
      ownerNickname: 'Big Dan',
      phone1: '0244148534',
      phone2: '0277649509',
      postalAddress: 'Box KN4009, ACCRA',
      location: 'Near the Post Office, Abossey Okai – Accra',
      latitude: 5.547731,
      longitude: -0.217733,
      workingHoursRegular: 'Mon - Sat: 7:30 AM – 6:00 PM',
      workingHoursSunday: 'Sunday: Emergency Orders Only',
      updatedAt: serverTimestamp()
    }, { merge: true });

    // 2. Seed Homepage Document
    const homepageDocRef = doc(db, COLLECTIONS.HOMEPAGE, 'main');
    await setDoc(homepageDocRef, {
      headline: 'DEALERS IN OPEL ENGINES & ALL KINDS OF ENGINE PARTS',
      supportingText: 'Direct importers and stockists of authentic European Opel engines, manual and automatic gearboxes, cylinder heads, crankshafts, and multi-brand automotive replacement assemblies in Abossey Okai.',
      heroBackground: ASSETS.storefront,
      primaryButtonText: 'VIEW INVENTORY',
      secondaryButtonText: 'PLACE ORDER',
      heroEnabled: true,
      updatedAt: serverTimestamp()
    }, { merge: true });

    // 3. Seed Products
    for (let i = 0; i < INITIAL_PRODUCTS.length; i++) {
      const p = INITIAL_PRODUCTS[i];
      const prodDocRef = doc(db, COLLECTIONS.PRODUCTS, p.id);
      await setDoc(prodDocRef, {
        name: p.name,
        imageUrl: p.image,
        description: p.description,
        category: p.category,
        featured: !!p.featured,
        showInHero: true,
        sortOrder: i + 1,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });
    }

    // 4. Seed Services
    for (let i = 0; i < SERVICES.length; i++) {
      const s = SERVICES[i];
      const srvDocRef = doc(db, COLLECTIONS.SERVICES, s.id);
      await setDoc(srvDocRef, {
        title: s.title,
        description: s.description,
        iconName: s.iconName,
        sortOrder: i + 1,
        updatedAt: serverTimestamp()
      }, { merge: true });
    }

    return { success: true, message: 'All initial collections seeded successfully into Firestore!' };
  } catch (error: any) {
    console.error('Error seeding initial Firestore data:', error);
    throw new Error(error.message || 'Failed to seed database.');
  }
}
