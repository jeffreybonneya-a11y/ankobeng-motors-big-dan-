import { 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot, 
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

// 1. Homepage Content
export interface HomepageContent {
  headline: string;
  subheadline: string;
  sectionText: string;
  primaryButtonText: string;
  secondaryButtonText: string;
  tagline: string;
  storefrontImageUrl?: string;
  updatedAt?: Timestamp | any;
}

export const DEFAULT_HOMEPAGE: HomepageContent = {
  headline: 'DEALERS IN OPEL ENGINES & ALL KINDS OF ENGINE PARTS',
  subheadline: 'ABOSSEY OKAI, ACCRA • BIG DAN DIRECT DISPATCH',
  sectionText: 'Direct importers and stockists of authentic European Opel engines, manual and automatic gearboxes, cylinder heads, crankshafts, and multi-brand automotive replacement assemblies in Abossey Okai.',
  primaryButtonText: 'VIEW INVENTORY',
  secondaryButtonText: 'PLACE ORDER',
  tagline: 'Authentic European Imports & Direct Workshop Inventory',
  storefrontImageUrl: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=1600&q=80'
};

export async function getHomepageContent(): Promise<HomepageContent> {
  try {
    const docRef = doc(db, 'homepageContent', 'main');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { ...DEFAULT_HOMEPAGE, ...docSnap.data() } as HomepageContent;
    }
    return DEFAULT_HOMEPAGE;
  } catch (error) {
    console.error('Error fetching homepage content:', error);
    return DEFAULT_HOMEPAGE;
  }
}

export function subscribeToHomepageContent(
  callback: (data: HomepageContent) => void,
  onError?: (error: Error) => void
): () => void {
  const docRef = doc(db, 'homepageContent', 'main');
  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        callback({ ...DEFAULT_HOMEPAGE, ...docSnap.data() } as HomepageContent);
      } else {
        callback(DEFAULT_HOMEPAGE);
      }
    },
    (err) => {
      console.error('Realtime homepageContent subscription error:', err);
      if (onError) onError(err);
    }
  );
}

export async function saveHomepageContent(data: Partial<HomepageContent>): Promise<void> {
  try {
    const docRef = doc(db, 'homepageContent', 'main');
    await setDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error: any) {
    console.error('Error saving homepage content:', error);
    throw new Error(error.message || 'Failed to save homepage content.');
  }
}

// 2. Business Information
export interface BusinessInfo {
  businessName: string;
  tagline: string;
  primaryPhone: string;
  secondaryPhone: string;
  whatsappNumber: string;
  address: string;
  city: string;
  country: string;
  workingHours: string;
  locationDescription: string;
  updatedAt?: Timestamp | any;
}

export const DEFAULT_BUSINESS_INFO: BusinessInfo = {
  businessName: 'ANKOBENG MOTORS (BIG DAN)',
  tagline: 'Dealers in Opel Engines & All Kinds of Engine Parts',
  primaryPhone: '024 382 5556',
  secondaryPhone: '050 139 7443',
  whatsappNumber: '0243825556',
  address: 'Abossey Okai, Near Total Filling Station',
  city: 'Accra',
  country: 'Ghana',
  workingHours: 'Monday - Saturday: 7:00 AM - 6:00 PM',
  locationDescription: 'Abossey Okai spare parts commercial hub, directly accessible from Central Accra.'
};

export async function getBusinessInfo(): Promise<BusinessInfo> {
  try {
    const docRef = doc(db, 'businessInfo', 'main');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { ...DEFAULT_BUSINESS_INFO, ...docSnap.data() } as BusinessInfo;
    }
    return DEFAULT_BUSINESS_INFO;
  } catch (error) {
    console.error('Error fetching business info:', error);
    return DEFAULT_BUSINESS_INFO;
  }
}

export function subscribeToBusinessInfo(
  callback: (data: BusinessInfo) => void,
  onError?: (error: Error) => void
): () => void {
  const docRef = doc(db, 'businessInfo', 'main');
  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        callback({ ...DEFAULT_BUSINESS_INFO, ...docSnap.data() } as BusinessInfo);
      } else {
        callback(DEFAULT_BUSINESS_INFO);
      }
    },
    (err) => {
      console.error('Realtime businessInfo subscription error:', err);
      if (onError) onError(err);
    }
  );
}

export async function saveBusinessInfo(data: Partial<BusinessInfo>): Promise<void> {
  try {
    const docRef = doc(db, 'businessInfo', 'main');
    await setDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error: any) {
    console.error('Error saving business info:', error);
    throw new Error(error.message || 'Failed to save business info.');
  }
}

// 3. Settings / WhatsApp
export interface WhatsAppSettings {
  whatsappNumber: string;
  defaultOrderMessage: string;
  enableQuickInquiry: boolean;
  autoAppendLocation: boolean;
  updatedAt?: Timestamp | any;
}

export const DEFAULT_SETTINGS: WhatsAppSettings = {
  whatsappNumber: '233243825556',
  defaultOrderMessage: 'Hello Big Dan, I am inquiring from Ankobeng Motors website regarding an engine / part.',
  enableQuickInquiry: true,
  autoAppendLocation: true
};

export async function getWhatsAppSettings(): Promise<WhatsAppSettings> {
  try {
    const docRef = doc(db, 'settings', 'whatsapp');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { ...DEFAULT_SETTINGS, ...docSnap.data() } as WhatsAppSettings;
    }
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error fetching settings:', error);
    return DEFAULT_SETTINGS;
  }
}

export function subscribeToWhatsAppSettings(
  callback: (data: WhatsAppSettings) => void,
  onError?: (error: Error) => void
): () => void {
  const docRef = doc(db, 'settings', 'whatsapp');
  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        callback({ ...DEFAULT_SETTINGS, ...docSnap.data() } as WhatsAppSettings);
      } else {
        callback(DEFAULT_SETTINGS);
      }
    },
    (err) => {
      console.error('Realtime settings subscription error:', err);
      if (onError) onError(err);
    }
  );
}

export async function saveWhatsAppSettings(data: Partial<WhatsAppSettings>): Promise<void> {
  try {
    const docRef = doc(db, 'settings', 'whatsapp');
    await setDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error: any) {
    console.error('Error saving settings:', error);
    throw new Error(error.message || 'Failed to save settings.');
  }
}
