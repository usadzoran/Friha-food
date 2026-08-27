export type OrderStatus = 'pending' | 'accepted' | 'delivered' | 'cancelled';

export interface Category {
  id: string;
  name: string;
  image_url?: string;
  icon?: string;
  whatsapp_number?: string;
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

export interface DailyVisit {
  date: string;
  visits: number;
}

export interface VisitorStats {
  total_visits: number;
  unique_visits: number;
  today_visits: number;
  last_visit_date?: string;
  last_visit_at?: string;
  daily_history?: DailyVisit[];
}

export type AdminTab = 
  | 'dashboard' 
  | 'visitors' 
  | 'products' 
  | 'categories' 
  | 'current_orders' 
  | 'order_history' 
  | 'ads' 
  | 'whatsapp_settings'
  | 'department_managers'
  | 'join_requests';

export type JoinRequestStatus = 'pending' | 'approved' | 'rejected';

export interface JoinRequest {
  id: string;
  first_name: string;
  last_name: string;
  phone: string; // WhatsApp number
  work_type: string; // Profession, business, or category interest
  wilaya?: string;
  notes?: string;
  status: JoinRequestStatus;
  created_at: string;
  reviewed_at?: string;
  assigned_username?: string;
  assigned_password?: string;
  assigned_category_id?: string;
  assigned_category_name?: string;
  invitation_sent_at?: string;
}

export interface DepartmentManager {
  id: string;
  category_id: string;
  category_name?: string;
  manager_name: string;
  phone: string; // WhatsApp contact phone for the manager
  username: string; // Login username or phone
  password_plain: string; // Password / PIN for manager login & invite generation
  is_active: boolean;
  created_at: string;
  last_login_at?: string;
  notes?: string;
}

export type AuthRole = 'admin' | 'department_manager' | null;

export interface AuthSession {
  role: 'admin' | 'department_manager';
  manager?: DepartmentManager;
}

export type AdPlacement = 
  | 'header_top' 
  | 'home_banner' 
  | 'product_grid_middle' 
  | 'product_details_modal' 
  | 'cart_modal_bottom' 
  | 'order_success' 
  | 'sidebar_or_footer' 
  | 'popup_ad' 
  | 'custom_head_script';

export interface AdSlot {
  id: string;
  title: string;
  placement: AdPlacement;
  html_code: string;
  is_active: boolean;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export type WhatsappMessageStatus = 'pending' | 'sent' | 'failed';

export interface WhatsappOrderMessage {
  id: string;
  order_id: string;
  category_id: string;
  whatsapp_number: string;
  message: string;
  status: WhatsappMessageStatus;
  provider_message_id?: string;
  error_message?: string;
  sent_at?: string;
  created_at: string;
}

export interface WhatsappConfigStatus {
  isConfigured: boolean;
  hasToken: boolean;
  phoneNumberId: string;
  wabaId: string;
}
