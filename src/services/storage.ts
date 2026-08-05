import { Store, Category, Product, Order, AdminStats } from '../types';
import { INITIAL_STORES, INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_ORDERS } from '../data/initialData';

const STORES_KEY = 'echri_min_darak_stores_v1';
const CATEGORIES_KEY = 'echri_min_darak_categories_v1';
const PRODUCTS_KEY = 'echri_min_darak_products_v1';
const ORDERS_KEY = 'echri_min_darak_orders_v1';

class StorageService {
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.initDefaultData();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  private initDefaultData() {
    if (!localStorage.getItem(STORES_KEY)) {
      localStorage.setItem(STORES_KEY, JSON.stringify(INITIAL_STORES));
    }
    if (!localStorage.getItem(CATEGORIES_KEY)) {
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(INITIAL_CATEGORIES));
    }
    if (!localStorage.getItem(PRODUCTS_KEY)) {
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(INITIAL_PRODUCTS));
    }
    if (!localStorage.getItem(ORDERS_KEY)) {
      localStorage.setItem(ORDERS_KEY, JSON.stringify(INITIAL_ORDERS));
    }
  }

  // --- STORES ---
  public getStores(): Store[] {
    try {
      const data = localStorage.getItem(STORES_KEY);
      return data ? JSON.parse(data) : INITIAL_STORES;
    } catch {
      return INITIAL_STORES;
    }
  }

  public getStoreById(id: string): Store | undefined {
    return this.getStores().find((s) => s.id === id);
  }

  public saveStore(store: Partial<Store> & { name: string }): Store {
    const stores = this.getStores();
    let savedStore: Store;

    if (store.id) {
      const index = stores.findIndex((s) => s.id === store.id);
      if (index !== -1) {
        savedStore = { ...stores[index], ...store };
        stores[index] = savedStore;
      } else {
        savedStore = {
          id: `store-${Date.now()}`,
          image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
          description: '',
          section: 'food',
          whatsapp: '',
          address: '',
          is_open: true,
          ...store,
        };
        stores.push(savedStore);
      }
    } else {
      savedStore = {
        id: `store-${Date.now()}`,
        image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
        description: '',
        section: 'food',
        whatsapp: '',
        address: '',
        is_open: true,
        ...store,
      };
      stores.push(savedStore);
    }

    localStorage.setItem(STORES_KEY, JSON.stringify(stores));
    this.notify();
    return savedStore;
  }

  public deleteStore(id: string): boolean {
    let stores = this.getStores();
    stores = stores.filter((s) => s.id !== id);
    localStorage.setItem(STORES_KEY, JSON.stringify(stores));

    // Also delete products belonging to this store
    let products = this.getProducts();
    products = products.filter((p) => p.store_id !== id);
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));

    this.notify();
    return true;
  }

  // --- CATEGORIES ---
  public getCategories(): Category[] {
    try {
      const data = localStorage.getItem(CATEGORIES_KEY);
      return data ? JSON.parse(data) : INITIAL_CATEGORIES;
    } catch {
      return INITIAL_CATEGORIES;
    }
  }

  public saveCategory(category: Partial<Category> & { name: string; section: 'food' | 'drinks' }): Category {
    const categories = this.getCategories();
    let savedCat: Category;

    if (category.id) {
      const index = categories.findIndex((c) => c.id === category.id);
      if (index !== -1) {
        savedCat = { ...categories[index], ...category };
        categories[index] = savedCat;
      } else {
        savedCat = {
          id: `cat-${Date.now()}`,
          icon: category.section === 'food' ? '🍔' : '🥤',
          ...category,
        };
        categories.push(savedCat);
      }
    } else {
      savedCat = {
        id: `cat-${Date.now()}`,
        icon: category.section === 'food' ? '🍔' : '🥤',
        ...category,
      };
      categories.push(savedCat);
    }

    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
    this.notify();
    return savedCat;
  }

  public deleteCategory(id: string): boolean {
    let categories = this.getCategories();
    categories = categories.filter((c) => c.id !== id);
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
    this.notify();
    return true;
  }

  // --- PRODUCTS ---
  public getProducts(): Product[] {
    try {
      const data = localStorage.getItem(PRODUCTS_KEY);
      return data ? JSON.parse(data) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  }

  public getProductsByStore(storeId: string): Product[] {
    return this.getProducts().filter((p) => p.store_id === storeId);
  }

  public saveProduct(product: Partial<Product> & { store_id: string; category_id: string; name: string; price: number }): Product {
    const products = this.getProducts();
    let savedProduct: Product;

    if (product.id) {
      const index = products.findIndex((p) => p.id === product.id);
      if (index !== -1) {
        savedProduct = { ...products[index], ...product };
        products[index] = savedProduct;
      } else {
        savedProduct = {
          id: `prod-${Date.now()}`,
          description: '',
          image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
          is_available: true,
          ...product,
        };
        products.push(savedProduct);
      }
    } else {
      savedProduct = {
        id: `prod-${Date.now()}`,
        description: '',
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
        is_available: true,
        ...product,
      };
      products.push(savedProduct);
    }

    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    this.notify();
    return savedProduct;
  }

  public deleteProduct(id: string): boolean {
    let products = this.getProducts();
    products = products.filter((p) => p.id !== id);
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    this.notify();
    return true;
  }

  // --- ORDERS ---
  public getOrders(): Order[] {
    try {
      const data = localStorage.getItem(ORDERS_KEY);
      return data ? JSON.parse(data) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  }

  public createOrder(orderData: Omit<Order, 'id' | 'created_at' | 'status'>): Order {
    const orders = this.getOrders();
    const newOrder: Order = {
      ...orderData,
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'new',
      created_at: new Date().toISOString(),
    };

    orders.unshift(newOrder);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    this.notify();
    return newOrder;
  }

  public updateOrderStatus(orderId: string, status: Order['status']): boolean {
    const orders = this.getOrders();
    const index = orders.findIndex((o) => o.id === orderId);
    if (index !== -1) {
      orders[index].status = status;
      localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
      this.notify();
      return true;
    }
    return false;
  }

  public deleteOrder(orderId: string): boolean {
    let orders = this.getOrders();
    orders = orders.filter((o) => o.id !== orderId);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    this.notify();
    return true;
  }

  // --- STATS ---
  public getStats(): AdminStats {
    const stores = this.getStores();
    const products = this.getProducts();
    const categories = this.getCategories();
    const orders = this.getOrders();

    const totalRevenue = orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.total_amount, 0);

    return {
      storesCount: stores.length,
      productsCount: products.length,
      ordersCount: orders.length,
      categoriesCount: categories.length,
      totalRevenue,
    };
  }

  // --- RESET ALL DATA ---
  public resetToDefault() {
    localStorage.setItem(STORES_KEY, JSON.stringify(INITIAL_STORES));
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(INITIAL_CATEGORIES));
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(INITIAL_PRODUCTS));
    localStorage.setItem(ORDERS_KEY, JSON.stringify(INITIAL_ORDERS));
    this.notify();
  }
}

export const storageService = new StorageService();
