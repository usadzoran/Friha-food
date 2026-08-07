import {
  Restaurant,
  Store,
  Category,
  Product,
  Order,
  UserAccount,
  Offer,
  MediaItem,
  SiteSettings
} from '../types/admin';

// INITIAL SEED DATA - START BLANK FOR ADMIN
export const INITIAL_RESTAURANTS: Restaurant[] = [];

export const INITIAL_STORES: Store[] = [];

export const INITIAL_CATEGORIES: Category[] = [];

export const INITIAL_PRODUCTS: Product[] = [];

export const INITIAL_ORDERS: Order[] = [];

export const INITIAL_USERS: UserAccount[] = [];

export const INITIAL_OFFERS: Offer[] = [];

export const INITIAL_SETTINGS: SiteSettings = {
  siteName: 'اشري من دارك',
  siteDescription: 'منصة طلب وتوصيل المواد الغذائية والمأكولات والمشروبات حتى باب منزلك',
  heroTitle: 'اشري من دارك',
  heroSubtext: 'طلب كل احتياجاتك الغذائية والمأكولات الطازجة والمشروبات بأسرع توصيل وبأفضل جودة',
  heroImageUrl: '',
  contactPhone: '+213 555 000 111',
  whatsappNumber: '+213 555 000 111',
  facebookUrl: 'https://facebook.com',
  instagramUrl: 'https://instagram.com',
  twitterUrl: 'https://twitter.com',
  isStoreOpen: true
};

// STORAGE UTILS
export function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const saved = localStorage.getItem(`eshry_admin_${key}`);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (e) {
    console.error('Failed to load from storage:', e);
    return defaultValue;
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`eshry_admin_${key}`, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save to storage:', e);
  }
}
