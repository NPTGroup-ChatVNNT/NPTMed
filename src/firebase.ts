import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, deleteDoc, onSnapshot, getDocs } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import localforage from 'localforage';
import { Ebook, ShopProduct, VideoItem, UserProfile } from './types';
import { INITIAL_EBOOKS, INITIAL_PRODUCTS, INITIAL_VIDEOS } from './data';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
export const storage = getStorage(app);

// Storage Keys
const STORAGE_KEYS = {
  USER: 'nptmed_user_v2',
  USERS_DB: 'nptmed_users_db_v2',
  CART: 'nptmed_cart_v2'
};

// In-memory cache
let ebooksCache: Ebook[] = [];
let productsCache: ShopProduct[] = [];
let videosCache: VideoItem[] = [];
let cartCache: { product: ShopProduct; quantity: number }[] = [];
let userCache: UserProfile | null = null;
let usersDbCache: any[] = [];
let isInitialized = false;

// Async init
export const initDB = async () => {
  if (isInitialized) return;
  localforage.config({
    name: 'NPTMed',
    storeName: 'nptmed_db'
  });

  // Migrate from localForage if necessary
  const legacyLocalEbooks = await localforage.getItem<Ebook[]>('nptmed_ebooks_v2');
  if (Array.isArray(legacyLocalEbooks)) {
    // Only push if we don't know they're in firestore yet. 
    // We can just push them async and Firestore will overwrite or ignore if identical.
    legacyLocalEbooks.forEach(b => setDoc(doc(firestore, 'ebooks', b.id), b));
    // Clear it so we don't migrate again
    await localforage.removeItem('nptmed_ebooks_v2');
  }

  const legacyLocalVideos = await localforage.getItem<VideoItem[]>('nptmed_videos_v2');
  if (Array.isArray(legacyLocalVideos)) {
    legacyLocalVideos.forEach(v => setDoc(doc(firestore, 'videos', v.id), v));
    await localforage.removeItem('nptmed_videos_v2');
  }

  const legacyLocalProducts = await localforage.getItem<ShopProduct[]>('nptmed_products_v2');
  if (Array.isArray(legacyLocalProducts)) {
    legacyLocalProducts.forEach(p => setDoc(doc(firestore, 'products', p.id), p));
    await localforage.removeItem('nptmed_products_v2');
  }

  // Setup Firestore Realtime Listeners for Syncing
  onSnapshot(collection(firestore, 'ebooks'), (snapshot) => {
    const data: Ebook[] = [];
    snapshot.forEach(doc => data.push(doc.data() as Ebook));
    if (data.length === 0) {
      // Seed if empty
      INITIAL_EBOOKS.forEach(b => setDoc(doc(firestore, 'ebooks', b.id), b));
    } else {
      ebooksCache = data.sort((a, b) => b.createdAt - a.createdAt);
      window.dispatchEvent(new Event('db_updated'));
    }
  });

  onSnapshot(collection(firestore, 'products'), (snapshot) => {
    const data: ShopProduct[] = [];
    snapshot.forEach(doc => data.push(doc.data() as ShopProduct));
    if (data.length === 0) {
      INITIAL_PRODUCTS.forEach(p => setDoc(doc(firestore, 'products', p.id), p));
    } else {
      productsCache = data;
      window.dispatchEvent(new Event('db_updated'));
    }
  });

  onSnapshot(collection(firestore, 'videos'), (snapshot) => {
    const data: VideoItem[] = [];
    snapshot.forEach(doc => data.push(doc.data() as VideoItem));
    if (data.length === 0) {
      INITIAL_VIDEOS.forEach(v => setDoc(doc(firestore, 'videos', v.id), v));
    } else {
      videosCache = data.sort((a, b) => b.createdAt - a.createdAt);
      window.dispatchEvent(new Event('db_updated'));
    }
  });

  // Load user data locally (mock auth for now to prevent breaking existing logins, can be upgraded to FB Auth later)
  cartCache = await localforage.getItem(STORAGE_KEYS.CART) || [];
  userCache = await localforage.getItem<UserProfile | null>(STORAGE_KEYS.USER) || null;
  if (userCache && userCache.email && userCache.email.trim().toLowerCase() === 'nguyenphitruong1973@gmail.com') {
    userCache.role = 'admin';
    await localforage.setItem(STORAGE_KEYS.USER, userCache);
  }
  usersDbCache = await localforage.getItem<any[]>(STORAGE_KEYS.USERS_DB) || [];
  
  isInitialized = true;
};

// State Managers
export const db = {
  getEbooks: (): Ebook[] => ebooksCache,
  saveEbook: (ebook: Ebook): void => {
    setDoc(doc(firestore, 'ebooks', ebook.id), ebook);
  },
  deleteEbook: (id: string): void => {
    deleteDoc(doc(firestore, 'ebooks', id));
  },
  
  getProducts: (): ShopProduct[] => productsCache,
  saveProduct: (product: ShopProduct): void => {
    setDoc(doc(firestore, 'products', product.id), product);
  },
  deleteProduct: (id: string): void => {
    deleteDoc(doc(firestore, 'products', id));
  },
  
  getVideos: (): VideoItem[] => videosCache,
  saveVideo: (video: VideoItem): void => {
    setDoc(doc(firestore, 'videos', video.id), video);
  },
  deleteVideo: (id: string): void => {
    deleteDoc(doc(firestore, 'videos', id));
  },
  
  getCart: () => cartCache,
  saveCart: (cart: any): void => {
    cartCache = cart;
    localforage.setItem(STORAGE_KEYS.CART, cartCache);
  }
};

export const auth = {
  getCurrentUser: (): UserProfile | null => {
    if (userCache && userCache.email && userCache.email.trim().toLowerCase() === 'nguyenphitruong1973@gmail.com') {
      userCache.role = 'admin';
    }
    return userCache;
  },
  
  signUpWithEmail: async (email: string, password: string, displayName: string): Promise<UserProfile> => {
    const cleanedEmail = email.trim().toLowerCase();
    
    // Check if user already exists
    if (usersDbCache.some(u => u.email === cleanedEmail)) {
      throw new Error('Email này đã được sử dụng.');
    }
    
    const isAdmin = cleanedEmail === 'nguyenphitruong1973@gmail.com';
    const profile: UserProfile = {
      uid: 'user_' + Math.random().toString(36).substr(2, 9),
      email: cleanedEmail,
      displayName: displayName || cleanedEmail.split('@')[0],
      role: isAdmin ? 'admin' : 'user',
      photoURL: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(displayName || cleanedEmail)}`
    };
    
    // Save to users DB
    usersDbCache.push({ ...profile, password });
    await localforage.setItem(STORAGE_KEYS.USERS_DB, usersDbCache);
    
    // Set as current user
    userCache = profile;
    await localforage.setItem(STORAGE_KEYS.USER, profile);
    return profile;
  },

  signInWithEmail: async (email: string, password: string): Promise<UserProfile> => {
    const cleanedEmail = email.trim().toLowerCase();
    const user = usersDbCache.find(u => u.email === cleanedEmail && u.password === password);
    
    if (!user) {
      throw new Error('Email hoặc mật khẩu không chính xác.');
    }
    
    const isAdmin = cleanedEmail === 'nguyenphitruong1973@gmail.com';
    const profile: UserProfile = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      role: isAdmin ? 'admin' : user.role,
      photoURL: user.photoURL
    };
    
    userCache = profile;
    await localforage.setItem(STORAGE_KEYS.USER, profile);
    return profile;
  },

  signInWithGoogle: (email: string, displayName: string, photoURL?: string): UserProfile => {
    const cleanedEmail = email.trim().toLowerCase();
    
    // Check if user exists to preserve their role
    let existingUser = usersDbCache.find(u => u.email === cleanedEmail);
    const isAdmin = cleanedEmail === 'nguyenphitruong1973@gmail.com';
    
    const profile: UserProfile = {
      uid: existingUser?.uid || 'user_' + Math.random().toString(36).substr(2, 9),
      email: cleanedEmail,
      displayName: existingUser?.displayName || displayName || cleanedEmail.split('@')[0],
      role: isAdmin ? 'admin' : (existingUser?.role || 'user'),
      photoURL: existingUser?.photoURL || photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(displayName || cleanedEmail)}`
    };

    if (!existingUser) {
      usersDbCache.push({ ...profile, password: 'google_sso_user' });
      localforage.setItem(STORAGE_KEYS.USERS_DB, usersDbCache);
    }
    
    userCache = profile;
    localforage.setItem(STORAGE_KEYS.USER, profile);
    return profile;
  },
  
  updateProfile: async (updates: Partial<UserProfile>): Promise<UserProfile> => {
    if (userCache) {
      userCache = { ...userCache, ...updates };
      await localforage.setItem(STORAGE_KEYS.USER, userCache);
      
      // Update in users DB
      const userIndex = usersDbCache.findIndex(u => u.uid === userCache?.uid);
      if (userIndex >= 0) {
        usersDbCache[userIndex] = { ...usersDbCache[userIndex], ...updates };
        await localforage.setItem(STORAGE_KEYS.USERS_DB, usersDbCache);
      }
      return userCache;
    }
    throw new Error('Not signed in');
  },

  changePassword: async (oldPassword: string, newPassword: string): Promise<void> => {
    if (!userCache) throw new Error('Not signed in');
    
    const userIndex = usersDbCache.findIndex(u => u.uid === userCache?.uid);
    if (userIndex >= 0) {
      const user = usersDbCache[userIndex];
      // Google SSO users can directly set password
      if (user.password !== 'google_sso_user' && user.password !== oldPassword) {
        throw new Error('Mật khẩu cũ không chính xác.');
      }
      usersDbCache[userIndex].password = newPassword;
      await localforage.setItem(STORAGE_KEYS.USERS_DB, usersDbCache);
    }
  },

  sendPasswordResetEmail: async (email: string): Promise<string> => {
    const cleanedEmail = email.trim().toLowerCase();
    const user = usersDbCache.find(u => u.email === cleanedEmail);
    if (!user) {
      throw new Error('Không tìm thấy tài khoản với email này.');
    }
    
    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Save to window for validation later since it's just mock
    (window as any).__reset_otps = (window as any).__reset_otps || {};
    (window as any).__reset_otps[cleanedEmail] = otp;

    // Simulate sending email (would use SendGrid, NodeMailer etc. in real life)
    console.log(`[EMAIL SIMULATION] Sending OTP to ${cleanedEmail}: ${otp}`);
    
    return otp; // In a real app we wouldn't return OTP, we just log it or send via email.
  },

  resetPasswordWithOTP: async (email: string, otp: string, newPassword: string): Promise<void> => {
    const cleanedEmail = email.trim().toLowerCase();
    const storedOtp = (window as any).__reset_otps?.[cleanedEmail];
    
    if (!storedOtp || storedOtp !== otp) {
      throw new Error('Mã OTP không hợp lệ hoặc đã hết hạn.');
    }
    
    const userIndex = usersDbCache.findIndex(u => u.email === cleanedEmail);
    if (userIndex >= 0) {
      usersDbCache[userIndex].password = newPassword;
      await localforage.setItem(STORAGE_KEYS.USERS_DB, usersDbCache);
      // clear OTP
      delete (window as any).__reset_otps[cleanedEmail];
    } else {
      throw new Error('Không tìm thấy tài khoản.');
    }
  },

  signOut: (): void => {
    userCache = null;
    localforage.removeItem(STORAGE_KEYS.USER);
  }
};
