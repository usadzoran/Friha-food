import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '../lib/firebase';
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
import {
  INITIAL_RESTAURANTS,
  INITIAL_STORES,
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_USERS,
  INITIAL_OFFERS,
  INITIAL_SETTINGS
} from '../lib/store';

// Generic Realtime Collection Listener
export function subscribeCollection<T extends { id: string }>(
  collectionName: string,
  onData: (items: T[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  return onSnapshot(
    collection(db, collectionName),
    (snapshot) => {
      const items = snapshot.docs.map((docSnap) => ({
        ...docSnap.data(),
        id: docSnap.id
      })) as T[];
      onData(items);
    },
    (err) => {
      console.error(`[Firestore Listener Error] ${collectionName}:`, err);
      if (onError) onError(err);
    }
  );
}

// Generic Realtime Document Listener
export function subscribeDocument<T>(
  collectionName: string,
  docId: string,
  onData: (data: T | null) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  return onSnapshot(
    doc(db, collectionName, docId),
    (snapshot) => {
      if (snapshot.exists()) {
        onData(snapshot.data() as T);
      } else {
        onData(null);
      }
    },
    (err) => {
      console.error(`[Firestore Doc Error] ${collectionName}/${docId}:`, err);
      if (onError) onError(err);
    }
  );
}

// Generic CRUD Operations
export async function createDocument<T extends { id: string }>(
  collectionName: string,
  item: T
): Promise<void> {
  const docRef = doc(db, collectionName, item.id);
  await setDoc(docRef, item);
}

export async function updateDocument(
  collectionName: string,
  docId: string,
  data: Record<string, any>
): Promise<void> {
  const docRef = doc(db, collectionName, docId);
  await updateDoc(docRef, data);
}

export async function deleteDocument(
  collectionName: string,
  docId: string
): Promise<void> {
  const docRef = doc(db, collectionName, docId);
  await deleteDoc(docRef);
}

export async function setDocumentMerge<T extends Record<string, any>>(
  collectionName: string,
  docId: string,
  data: T
): Promise<void> {
  const docRef = doc(db, collectionName, docId);
  await setDoc(docRef, data, { merge: true });
}

// Optional Seed Database Helper if admin requests populating default content
export async function seedInitialDatabaseIfEmpty(): Promise<boolean> {
  try {
    const settingsSnap = await getDocs(collection(db, 'settings'));
    if (!settingsSnap.empty) {
      return false; // Already seeded or has data
    }

    const batch = writeBatch(db);

    // Settings
    batch.set(doc(db, 'settings', 'site_config'), INITIAL_SETTINGS);

    // Restaurants
    INITIAL_RESTAURANTS.forEach((r) => {
      batch.set(doc(db, 'restaurants', r.id), r);
    });

    // Stores
    INITIAL_STORES.forEach((s) => {
      batch.set(doc(db, 'stores', s.id), s);
    });

    // Categories
    INITIAL_CATEGORIES.forEach((c) => {
      batch.set(doc(db, 'categories', c.id), c);
    });

    // Products
    INITIAL_PRODUCTS.forEach((p) => {
      batch.set(doc(db, 'products', p.id), p);
    });

    // Orders
    INITIAL_ORDERS.forEach((o) => {
      batch.set(doc(db, 'orders', o.id), o);
    });

    // Users
    INITIAL_USERS.forEach((u) => {
      batch.set(doc(db, 'users', u.id), u);
    });

    // Offers
    INITIAL_OFFERS.forEach((off) => {
      batch.set(doc(db, 'offers', off.id), off);
    });

    await batch.commit();
    return true;
  } catch (e) {
    console.error('Error seeding initial database:', e);
    throw e;
  }
}
