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

// INITIAL SEED DATA
export const INITIAL_RESTAURANTS: Restaurant[] = [
  {
    id: 'rest-1',
    name: 'مطعم الأصالة والذوق',
    description: 'أفضل الأطباق العربية والمأكولات السريعة بلمسة تقليدية',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80',
    whatsapp: '+213555123456',
    phone: '+213555123456',
    workingHours: '10:00 ص - 11:30 م',
    address: 'حي المستقبل، الشارع الرئيسي',
    deliveryFee: 200,
    minOrder: 1000,
    active: true,
  },
  {
    id: 'rest-2',
    name: 'بيتزا اند برغر زون',
    description: 'بيتزا إيطالية حقيقية وبرغر طازج مشوي على الفحم',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80',
    whatsapp: '+213555987654',
    phone: '+213555987654',
    workingHours: '11:00 ص - 01:00 ص',
    address: 'وسط المدينة، قرب الساحة الكبرى',
    deliveryFee: 150,
    minOrder: 800,
    active: true,
  }
];

export const INITIAL_STORES: Store[] = [
  {
    id: 'store-1',
    name: 'سوبرماركت البركة',
    image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=600&auto=format&fit=crop&q=80',
    address: 'شارع الاستقلال، مقابل المسجد الكبير',
    whatsapp: '+213666112233',
    phone: '+213666112233',
    active: true,
  },
  {
    id: 'store-2',
    name: 'متجر الخضار والفواكه الطازجة',
    image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600&auto=format&fit=crop&q=80',
    address: 'حي الأمل، السوق المركزي',
    whatsapp: '+213666445566',
    phone: '+213666445566',
    active: true,
  }
];

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'pizza', name: 'بيتزا', type: 'food', iconName: 'Pizza', active: true },
  { id: 'snacks', name: 'أكل خفيف', type: 'food', iconName: 'UtensilsCrossed', active: true },
  { id: 'groceries', name: 'مواد غذائية', type: 'food', iconName: 'ShoppingBag', active: true },
  { id: 'bread', name: 'خبز', type: 'food', iconName: 'Croissant', active: true },
  { id: 'vegetables', name: 'خضر', type: 'food', iconName: 'Carrot', active: true },
  { id: 'fruits', name: 'فواكه', type: 'food', iconName: 'Apple', active: true },
  { id: 'soda', name: 'مشروبات غازية', type: 'drinks', iconName: 'CupSoda', active: true },
  { id: 'water', name: 'مياه عذبة', type: 'drinks', iconName: 'Droplet', active: true },
  { id: 'energy', name: 'مشروبات الطاقة', type: 'drinks', iconName: 'Zap', active: true },
  { id: 'milk', name: 'حليب', type: 'drinks', iconName: 'Milk', active: true },
  { id: 'juices', name: 'عصائر', type: 'drinks', iconName: 'Citrus', active: true },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'بيتزا مارغريتا ملكية',
    description: 'صلصة طماطم إيطالية، جبن موزاريلا طازج، حبق وزيت زيتون صافي',
    price: 1200,
    discountPrice: 990,
    categoryId: 'pizza',
    vendorId: 'rest-2',
    vendorType: 'restaurant',
    images: ['https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=600&auto=format&fit=crop&q=80'],
    isAvailable: true,
    isBestSeller: true,
    isNew: false,
  },
  {
    id: 'prod-2',
    name: 'ساندويتش تشيكن كريسبي',
    description: 'دجاج مقرمش مع بطاطس مقلية وصلصة خاصة بالثوم',
    price: 750,
    categoryId: 'snacks',
    vendorId: 'rest-1',
    vendorType: 'restaurant',
    images: ['https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80'],
    isAvailable: true,
    isBestSeller: true,
    isNew: true,
  },
  {
    id: 'prod-3',
    name: 'عصير برتقال طبيعي 1L',
    description: 'عصير برتقال معصور طازج بدون سكر مضاف',
    price: 450,
    discountPrice: 380,
    categoryId: 'juices',
    vendorId: 'store-1',
    vendorType: 'store',
    images: ['https://images.unsplash.com/photo-1613478223719-2ab802602423?w=600&auto=format&fit=crop&q=80'],
    isAvailable: true,
    isBestSeller: false,
    isNew: true,
  },
  {
    id: 'prod-4',
    name: 'سلة فواكه تشكيلة فاخرة 3kg',
    description: 'تفاح، موز، برتقال، وعنب فرنسي ممتاز',
    price: 2500,
    categoryId: 'fruits',
    vendorId: 'store-2',
    vendorType: 'store',
    images: ['https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600&auto=format&fit=crop&q=80'],
    isAvailable: true,
    isBestSeller: true,
    isNew: false,
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-9021',
    customerName: 'أحمد بن علي',
    customerPhone: '0552123456',
    customerAddress: 'حي النور، عمارة 12 شقة 4',
    items: [
      { productId: 'prod-1', productName: 'بيتزا مارغريتا ملكية', quantity: 2, price: 990 },
      { productId: 'prod-3', productName: 'عصير برتقال طبيعي 1L', quantity: 1, price: 380 }
    ],
    totalPrice: 2360,
    status: 'new',
    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    vendorName: 'بيتزا اند برغر زون',
    notes: 'يرجى التوصيل سريعاً والاتصال عند الوصول'
  },
  {
    id: 'ORD-9020',
    customerName: 'سارة بومدين',
    customerPhone: '0661987654',
    customerAddress: 'شارع الشهداء، رقم 45',
    items: [
      { productId: 'prod-4', productName: 'سلة فواكه تشكيلة فاخرة 3kg', quantity: 1, price: 2500 }
    ],
    totalPrice: 2700,
    status: 'preparing',
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    vendorName: 'متجر الخضار والفواكه الطازجة'
  },
  {
    id: 'ORD-9019',
    customerName: 'محمد أمين',
    customerPhone: '0770554433',
    customerAddress: 'وسط المدينة، قرب البريد المركزي',
    items: [
      { productId: 'prod-2', productName: 'ساندويتش تشيكن كريسبي', quantity: 3, price: 750 }
    ],
    totalPrice: 2450,
    status: 'delivered',
    createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    vendorName: 'مطعم الأصالة والذوق'
  }
];

export const INITIAL_USERS: UserAccount[] = [
  {
    id: 'usr-1',
    name: 'المدير العام',
    email: 'admin@eshry.com',
    phone: '0550000000',
    role: 'admin',
    ordersCount: 0,
    status: 'active',
    createdAt: '2026-01-01'
  },
  {
    id: 'usr-2',
    name: 'أحمد بن علي',
    email: 'ahmed@gmail.com',
    phone: '0552123456',
    role: 'customer',
    ordersCount: 12,
    status: 'active',
    createdAt: '2026-03-15'
  },
  {
    id: 'usr-3',
    name: 'سارة بومدين',
    email: 'sara@gmail.com',
    phone: '0661987654',
    role: 'customer',
    ordersCount: 5,
    status: 'active',
    createdAt: '2026-04-10'
  }
];

export const INITIAL_OFFERS: Offer[] = [
  {
    id: 'off-1',
    title: 'تخفيض الافتتاح - 20% على جميع الطلبات',
    code: 'ESHRY20',
    discountPercent: 20,
    startDate: '2026-08-01',
    endDate: '2026-08-31',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&auto=format&fit=crop&q=80',
    active: true
  }
];

export const INITIAL_SETTINGS: SiteSettings = {
  siteName: 'اشري من دارك',
  siteDescription: 'منصة طلب وتوصيل المواد الغذائية والمأكولات والمشروبات حتى باب منزلك',
  heroTitle: 'اشري من دارك',
  heroSubtext: 'طلب كل احتياجاتك الغذائية والمأكولات الطازجة والمشروبات بأسرع توصيل وبأفضل جودة',
  heroImageUrl: '', // dynamically uses generated image
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
