import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function inspectFirestore() {
  console.log('Inspecting Firestore collections...');
  const collections = ['categories', 'products', 'orders', 'order_items', 'settings', 'visitors'];
  for (const colName of collections) {
    try {
      const snap = await getDocs(collection(db, colName));
      console.log(`Collection "${colName}": ${snap.size} documents found.`);
      snap.docs.forEach(doc => {
        console.log(` - ID: ${doc.id}`, JSON.stringify(doc.data()).substring(0, 100));
      });
    } catch (e) {
      console.error(`Error reading ${colName}:`, e);
    }
  }
}

inspectFirestore();
