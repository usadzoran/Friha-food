export type OrderStatus = 'new' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
export type VendorType = 'restaurant' | 'store';
export type CategoryType = 'food' | 'drinks';

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  image: string;
  whatsapp: string;
  phone: string;
  workingHours: string;
  address: string;
  deliveryFee: number;
  minOrder: number;
  active: boolean;
}

export interface Store {
  id: string;
  name: string;
  image: string;
  address: string;
  whatsapp: string;
  phone: string;
  active: boolean;
}

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  iconName: string;
  active: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  categoryId: string;
  vendorId: string;
  vendorType: VendorType;
  images: string[];
  isAvailable: boolean;
  isBestSeller: boolean;
  isNew: boolean;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: OrderItem[];
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
  vendorName: string;
  notes?: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'customer' | 'driver';
  ordersCount: number;
  status: 'active' | 'blocked';
  createdAt: string;
}

export interface Offer {
  id: string;
  title: string;
  code: string;
  discountPercent: number;
  startDate: string;
  endDate: string;
  image: string;
  active: boolean;
}

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  size: string;
  uploadedAt: string;
}

export interface SiteSettings {
  siteName: string;
  siteDescription: string;
  logoUrl?: string;
  heroTitle: string;
  heroSubtext: string;
  heroImageUrl: string;
  contactPhone: string;
  whatsappNumber: string;
  facebookUrl: string;
  instagramUrl: string;
  twitterUrl: string;
  isStoreOpen: boolean;
}
