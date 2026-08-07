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

// Clear all database collections completely
export async function clearAllDatabaseCollections(): Promise<void> {
  const collectionsToClear = [
    'restaurants',
    'stores',
    'categories',
    'products',
    'orders',
    'users',
    'offers',
    'media'
  ];

  for (const colName of collectionsToClear) {
    const snap = await getDocs(collection(db, colName));
    const deletePromises = snap.docs.map((docSnap) => deleteDoc(docSnap.ref));
    await Promise.all(deletePromises);
  }

  // Set default clean settings
  await setDocumentMerge('settings', 'site_config', INITIAL_SETTINGS);
}
