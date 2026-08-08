export type OrderStatus = 'pending' | 'accepted' | 'delivered' | 'cancelled';

export interface Category {
  id: string;
  name: string;
  icon?: string;
  created_at?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // in DZD
  image_url: string;
  category_id?: string;
  active: boolean;
  created_at?: string;
}

export interface OrderItem {
  id?: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price: number; // Unit price in DZD at time of purchase
  subtotal: number; // quantity * price
}

export interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  notes?: string;
  total_price: number; // in DZD
  status: OrderStatus;
  created_at: string;
  updated_at?: string;
  items?: OrderItem[]; // Populated joined items
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  address: string;
  notes: string;
}

export type AdminTab = 'dashboard' | 'products' | 'categories' | 'current_orders' | 'order_history';
