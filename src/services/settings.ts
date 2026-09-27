import { 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';

export interface WhatsAppSettings {
  phoneNumber: string;
  defaultMessage: string;
  enabled: boolean;
  businessHoursOnly?: boolean;
  updatedAt?: Timestamp | any;
}

export interface GeneralSettings {
  dealershipName: string;
  contactEmail?: string;
  allowDirectOrders: boolean;
  orderNotificationPhone?: string;
  updatedAt?: Timestamp | any;
}

const SETTINGS_COLLECTION = 'settings';
const WHATSAPP_DOC_ID = 'whatsapp';
const GENERAL_DOC_ID = 'general';

/**
 * Fetch WhatsApp settings
 */
export async function getWhatsAppSettings(): Promise<WhatsAppSettings | null> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, WHATSAPP_DOC_ID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        phoneNumber: data.phoneNumber || '233244148534',
        defaultMessage: data.defaultMessage || 'Hello Big Dan, I am inquiring about engine parts at Ankobeng Motors.',
        enabled: data.enabled !== false,
        businessHoursOnly: Boolean(data.businessHoursOnly),
        updatedAt: data.updatedAt
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching WhatsApp settings:', error);
    throw error;
  }
}

/**
 * Real-time listener for WhatsApp settings
 */
export function subscribeToWhatsAppSettings(
  callback: (settings: WhatsAppSettings | null) => void,
  onError?: (error: Error) => void
): () => void {
  const docRef = doc(db, SETTINGS_COLLECTION, WHATSAPP_DOC_ID);

  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        callback({
          phoneNumber: data.phoneNumber || '233244148534',
          defaultMessage: data.defaultMessage || 'Hello Big Dan, I am inquiring about engine parts at Ankobeng Motors.',
          enabled: data.enabled !== false,
          businessHoursOnly: Boolean(data.businessHoursOnly),
          updatedAt: data.updatedAt
        });
      } else {
        callback(null);
      }
    },
    (error) => {
      console.warn('Realtime WhatsApp settings subscription notice:', error);
      if (onError) onError(error);
    }
  );
}

/**
 * Save WhatsApp settings
 */
export async function saveWhatsAppSettings(input: Partial<WhatsAppSettings>): Promise<void> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, WHATSAPP_DOC_ID);
    const payload: Record<string, any> = {
      updatedAt: serverTimestamp()
    };

    if (input.phoneNumber !== undefined) payload.phoneNumber = input.phoneNumber.trim();
    if (input.defaultMessage !== undefined) payload.defaultMessage = input.defaultMessage.trim();
    if (input.enabled !== undefined) payload.enabled = Boolean(input.enabled);
    if (input.businessHoursOnly !== undefined) payload.businessHoursOnly = Boolean(input.businessHoursOnly);

    await setDoc(docRef, payload, { merge: true });
  } catch (error: any) {
    console.error('Error saving WhatsApp settings:', error);
    throw new Error(error.message || 'Failed to save WhatsApp settings.');
  }
}

/**
 * Fetch General Settings
 */
export async function getGeneralSettings(): Promise<GeneralSettings | null> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, GENERAL_DOC_ID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        dealershipName: data.dealershipName || 'ANKOBENG MOTORS (BIG DAN)',
        contactEmail: data.contactEmail || '',
        allowDirectOrders: data.allowDirectOrders !== false,
        orderNotificationPhone: data.orderNotificationPhone || '',
        updatedAt: data.updatedAt
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching general settings:', error);
    throw error;
  }
}

/**
 * Save General Settings
 */
export async function saveGeneralSettings(input: Partial<GeneralSettings>): Promise<void> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, GENERAL_DOC_ID);
    const payload: Record<string, any> = {
      updatedAt: serverTimestamp()
    };

    if (input.dealershipName !== undefined) payload.dealershipName = input.dealershipName.trim();
    if (input.contactEmail !== undefined) payload.contactEmail = input.contactEmail.trim();
    if (input.allowDirectOrders !== undefined) payload.allowDirectOrders = Boolean(input.allowDirectOrders);
    if (input.orderNotificationPhone !== undefined) payload.orderNotificationPhone = input.orderNotificationPhone.trim();

    await setDoc(docRef, payload, { merge: true });
  } catch (error: any) {
    console.error('Error saving general settings:', error);
    throw new Error(error.message || 'Failed to save general settings.');
  }
}
