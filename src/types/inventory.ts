export interface Product {
  id: string;
  name: string; // The exact name from filename without extension
  image: string; // The real uploaded engine image URL
  category: 'OPEL' | 'CHEVROLET' | 'OTHER';
  description: string;
  featured?: boolean;
  yardLocation?: string;
  tags?: string[];
}

export interface BusinessInfo {
  name: string;
  subTitle: string;
  tagline: string;
  ownerNickname: string;
  phones: {
    primary: string;
    secondary: string;
    formatted: string;
  };
  address: {
    poBox: string;
    area: string;
    city: string;
    country: string;
    landmark: string;
    gps: string;
    mapsLink: string;
  };
  workingHours: {
    regular: string;
    sunday: string;
  };
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  iconName: string;
}

export interface OrderInquiry {
  customerName: string;
  phoneNumber: string;
  vehicleDetails: string;
  partNeeded: string;
  message?: string;
}
