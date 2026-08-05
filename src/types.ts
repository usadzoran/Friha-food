export type SectionType = 'food' | 'drinks' | 'both';

export type CategorySection = 'food' | 'drinks';

export interface Category {
  id: string;
  name: string;
  section: CategorySection; // 'food' (مأكولات) or 'drinks' (مشروبات)
  icon?: string;
  created_at?: string;
}

export interface Store {
  id: string;
  name: string;
  image: string;
  description: string;
  section: SectionType; // 'food' | 'drinks' | 'both'
  whatsapp: string; // e.g. "213600000000" or "0600000000"
  address: string;
  is_open: boolean;
  category_ids?: string[]; // categories this store belongs to
  rating?: number;
  created_at?: string;
}

export interface Product {
  id: string;
  store_id: string;
  category_id: string;
  name: string;
  description: string;
  price: number; // in DZD (دج)
  image: string;
  is_available: boolean;
  created_at?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  store: Store;
}

export type OrderStatus = 'new' | 'preparing' | 'delivered' | 'cancelled';

export interface OrderItem {
  id?: string;
  product_id: string;
  product_name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  store_id: string;
  store_name: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  notes?: string;
  items: OrderItem[];
  total_amount: number;
  status: OrderStatus;
  created_at: string;
  whatsapp_sent: boolean;
}

export interface AdminStats {
  storesCount: number;
  productsCount: number;
  ordersCount: number;
  categoriesCount: number;
  totalRevenue: number;
}
