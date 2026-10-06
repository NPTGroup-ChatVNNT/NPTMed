export interface Ebook {
  id: string;
  title: string;
  author: string;
  year: string;
  school?: string;
  category: string;
  description: string;
  isPro: boolean;
  price: number; // in VND
  fileUrl: string; // Google Drive or PDF link
  coverUrl?: string;
  aiSummary?: string;
  uploadedBy: string;
  uploadedByName?: string;
  createdAt: number;
  qrCodeUrl?: string;
}

export interface ShopProduct {
  id: string;
  name: string;
  description: string;
  price: number; // in VND
  category: 'equipment' | 'book' | 'app' | 'other';
  imageUrl: string;
  linkUrl: string;
  isExternal: boolean;
  bankAccount?: string;
  qrCodeUrl?: string;
}

export interface VideoItem {
  id: string;
  title: string;
  description: string;
  youtubeUrl: string;
  youtubeId: string;
  category: 'clinical' | 'lecture' | 'anatomy' | 'other';
  addedBy: string;
  createdAt: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'admin' | 'user';
}
