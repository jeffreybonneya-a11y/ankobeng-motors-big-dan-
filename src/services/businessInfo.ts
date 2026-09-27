import { 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';

export interface BusinessInfoData {
  businessName: string;
  subTitle?: string;
  tagline: string;
  ownerNickname?: string;
  phone1: string;
  phone2: string;
  postalAddress: string;
  location: string;
  landmark?: string;
  latitude: number;
  longitude: number;
  workingHoursRegular?: string;
  workingHoursSunday?: string;
  updatedAt?: Timestamp | any;
}

const BUSINESS_INFO_COLLECTION = 'businessInfo';
const BUSINESS_INFO_DOC_ID = 'main';

/**
 * Fetch business info once from Firestore
 */
export async function getBusinessInfo(): Promise<BusinessInfoData | null> {
  try {
    const docRef = doc(db, BUSINESS_INFO_COLLECTION, BUSINESS_INFO_DOC_ID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        businessName: data.businessName || '',
        subTitle: data.subTitle || '',
        tagline: data.tagline || '',
        ownerNickname: data.ownerNickname || '',
        phone1: data.phone1 || '',
        phone2: data.phone2 || '',
        postalAddress: data.postalAddress || '',
        location: data.location || '',
        landmark: data.landmark || '',
        latitude: typeof data.latitude === 'number' ? data.latitude : 5.547731,
        longitude: typeof data.longitude === 'number' ? data.longitude : -0.217733,
        workingHoursRegular: data.workingHoursRegular || '',
        workingHoursSunday: data.workingHoursSunday || '',
        updatedAt: data.updatedAt
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching business info from Firestore:', error);
    throw error;
  }
}

/**
 * Real-time listener for business info
 */
export function subscribeToBusinessInfo(
  callback: (info: BusinessInfoData | null) => void,
  onError?: (error: Error) => void
): () => void {
  const docRef = doc(db, BUSINESS_INFO_COLLECTION, BUSINESS_INFO_DOC_ID);

  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        callback({
          businessName: data.businessName || '',
          subTitle: data.subTitle || '',
          tagline: data.tagline || '',
          ownerNickname: data.ownerNickname || '',
          phone1: data.phone1 || '',
          phone2: data.phone2 || '',
          postalAddress: data.postalAddress || '',
          location: data.location || '',
          landmark: data.landmark || '',
          latitude: typeof data.latitude === 'number' ? data.latitude : 5.547731,
          longitude: typeof data.longitude === 'number' ? data.longitude : -0.217733,
          workingHoursRegular: data.workingHoursRegular || '',
          workingHoursSunday: data.workingHoursSunday || '',
          updatedAt: data.updatedAt
        });
      } else {
        callback(null);
      }
    },
    (error) => {
      console.warn('Realtime business info subscription notice:', error);
      if (onError) onError(error);
    }
  );
}

/**
 * Save business info to businessInfo/main
 */
export async function saveBusinessInfo(input: Partial<BusinessInfoData>): Promise<void> {
  try {
    const docRef = doc(db, BUSINESS_INFO_COLLECTION, BUSINESS_INFO_DOC_ID);
    const payload: Record<string, any> = {
      updatedAt: serverTimestamp()
    };

    if (input.businessName !== undefined) payload.businessName = input.businessName.trim();
    if (input.subTitle !== undefined) payload.subTitle = input.subTitle.trim();
    if (input.tagline !== undefined) payload.tagline = input.tagline.trim();
    if (input.ownerNickname !== undefined) payload.ownerNickname = input.ownerNickname.trim();
    if (input.phone1 !== undefined) payload.phone1 = input.phone1.trim();
    if (input.phone2 !== undefined) payload.phone2 = input.phone2.trim();
    if (input.postalAddress !== undefined) payload.postalAddress = input.postalAddress.trim();
    if (input.location !== undefined) payload.location = input.location.trim();
    if (input.landmark !== undefined) payload.landmark = input.landmark.trim();
    if (input.latitude !== undefined) payload.latitude = Number(input.latitude) || 0;
    if (input.longitude !== undefined) payload.longitude = Number(input.longitude) || 0;
    if (input.workingHoursRegular !== undefined) payload.workingHoursRegular = input.workingHoursRegular.trim();
    if (input.workingHoursSunday !== undefined) payload.workingHoursSunday = input.workingHoursSunday.trim();

    await setDoc(docRef, payload, { merge: true });
  } catch (error: any) {
    console.error('Error saving business info to Firestore:', error);
    throw new Error(error.message || 'Failed to save business information.');
  }
}
