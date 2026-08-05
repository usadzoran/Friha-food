import { Category, Store, Product, Order } from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  // مأكولات
  { id: 'cat-pizza', name: 'بيتزا', section: 'food', icon: '🍕' },
  { id: 'cat-fastfood', name: 'أكل خفيف', section: 'food', icon: '🍔' },
  { id: 'cat-sandwich', name: 'سندويتش', section: 'food', icon: '🥪' },
  { id: 'cat-veggies', name: 'خضر', section: 'food', icon: '🥦' },
  { id: 'cat-fruits', name: 'فواكه', section: 'food', icon: '🍎' },
  
  // مشروبات
  { id: 'cat-soda', name: 'مشروبات غازية', section: 'drinks', icon: '🥤' },
  { id: 'cat-juice', name: 'عصائر', section: 'drinks', icon: '🧃' },
  { id: 'cat-water', name: 'ماء', section: 'drinks', icon: '💧' },
  { id: 'cat-milk', name: 'حليب ومستلزماته', section: 'drinks', icon: '🥛' },
];

export const INITIAL_STORES: Store[] = [
  {
    id: 'store-restaurant-1',
    name: 'مطعم الياسمين للمأكولات والبيتزا',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    description: 'أشهر الأطباق السريعة، البيتزا الإيطالية الساخنة، والسندويتشات المشوية على الطريقة الجزائرية.',
    section: 'food',
    whatsapp: '213661234567',
    address: 'وسط المدينة، شارع الاستقلال، مقابل البريد المركزي',
    is_open: true,
    category_ids: ['cat-pizza', 'cat-fastfood', 'cat-sandwich'],
    rating: 4.8
  },
  {
    id: 'store-grocery-1',
    name: 'سوبرماركت البركة للمواد الغذائية',
    image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=800&q=80',
    description: 'كافة المستلزمات اليومية من خضروات وفواكه طازجة، عصائر، مشروبات ومواد التغذية العامة.',
    section: 'both',
    whatsapp: '213550987654',
    address: 'حي المجاهدين، مقابل المسجد الكبير',
    is_open: true,
    category_ids: ['cat-veggies', 'cat-fruits', 'cat-soda', 'cat-juice', 'cat-water', 'cat-milk'],
    rating: 4.9
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  // Products for Restaurant 1 (مطعم الياسمين)
  {
    id: 'prod-101',
    store_id: 'store-restaurant-1',
    category_id: 'cat-pizza',
    name: 'بيتزا ميغا مارغريتا',
    description: 'صلصة طماطم معتقة، جبن موزاريلا فاخر، زيتون أسود وأعشاب برية',
    price: 650,
    image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=600&q=80',
    is_available: true
  },
  {
    id: 'prod-102',
    store_id: 'store-restaurant-1',
    category_id: 'cat-pizza',
    name: 'بيتزا كواترو فورماجي (4 أجبان)',
    description: 'مزيج من الأجبان الأربعة المذابة على العجين المقرمش',
    price: 900,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
    is_available: true
  },
  {
    id: 'prod-103',
    store_id: 'store-restaurant-1',
    category_id: 'cat-fastfood',
    name: 'وجبة همبرغر دجاج كريسبي',
    description: 'قطعة دجاج مقرمشة مع الجبن، الخس، المايونيز والبطاطس المقلي',
    price: 550,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
    is_available: true
  },
  {
    id: 'prod-104',
    store_id: 'store-restaurant-1',
    category_id: 'cat-sandwich',
    name: 'سندويتش شاورما دجاج جامبو',
    description: 'خبز صاج طازج، دجاج متبل بصلصة الثوم والمخلل مع البطاطس',
    price: 450,
    image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=600&q=80',
    is_available: true
  },
  {
    id: 'prod-105',
    store_id: 'store-restaurant-1',
    category_id: 'cat-sandwich',
    name: 'سندويتش كبدة دجاج حار',
    description: 'كبدة مطبوخة بالثوم والفلفل الحار والليمون والكمون',
    price: 400,
    image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=600&q=80',
    is_available: true
  },

  // Products for Grocery Store 1 (سوبرماركت البركة)
  {
    id: 'prod-201',
    store_id: 'store-grocery-1',
    category_id: 'cat-fruits',
    name: 'تفاح أحمر محلي طازج (1 كغ)',
    description: 'تفاح أحمر حلو وطازج من مزارع باتنة',
    price: 380,
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80',
    is_available: true
  },
  {
    id: 'prod-202',
    store_id: 'store-grocery-1',
    category_id: 'cat-veggies',
    name: 'طماطم طازجة ممتازة (1 كغ)',
    description: 'طماطم حمراء ناضجة للطبخ والسلاطات',
    price: 120,
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
    is_available: true
  },
  {
    id: 'prod-203',
    store_id: 'store-grocery-1',
    category_id: 'cat-soda',
    name: 'حمود بوعلام قارورة زجاجية 1 لتر',
    description: 'المشروب الجزائري الغازي الأصيل بالنكهة المميزة',
    price: 130,
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80',
    is_available: true
  },
  {
    id: 'prod-204',
    store_id: 'store-grocery-1',
    category_id: 'cat-juice',
    name: 'عصير برتقال طبيعي رامي 1 لتر',
    description: 'عصير برتقال غني بفتامين C بدون سكر مضاف',
    price: 180,
    image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=600&q=80',
    is_available: true
  },
  {
    id: 'prod-205',
    store_id: 'store-grocery-1',
    category_id: 'cat-water',
    name: 'ماء معدني لالة خديجة (حزمة 6 قارورات 1.5L)',
    description: 'مياه معدنية طبيعية صحية لنقاء وعافية عائلتك',
    price: 240,
    image: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=600&q=80',
    is_available: true
  },
  {
    id: 'prod-206',
    store_id: 'store-grocery-1',
    category_id: 'cat-milk',
    name: 'حليب كانديا 1 لتر كامل الدسم',
    description: 'حليب بقري مبسط معقم وعلبة صحية سهلة الفتح',
    price: 160,
    image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=600&q=80',
    is_available: true
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-9821',
    store_id: 'store-restaurant-1',
    store_name: 'مطعم الياسمين للمأكولات والبيتزا',
    customer_name: 'محمد بوعلام',
    customer_phone: '0661122334',
    customer_address: 'حي 500 مسكن، عمارة ب، شقة 4',
    notes: 'الرجاء الإسراع بالطلب، يفضل صوص الحار جانباً',
    items: [
      { product_id: 'prod-101', product_name: 'بيتزا ميغا مارغريتا', price: 650, quantity: 2 },
      { product_id: 'prod-104', product_name: 'سندويتش شاورما دجاج جامبو', price: 450, quantity: 1 }
    ],
    total_amount: 1750,
    status: 'new',
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    whatsapp_sent: true
  }
];
