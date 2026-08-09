import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';
import * as fs from 'fs';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function exportFullFirestore() {
  console.log('Starting full export of Firestore data...');
  const collections = ['categories', 'products', 'orders', 'order_items'];
  const backupData: Record<string, any[]> = {};

  for (const colName of collections) {
    try {
      const snap = await getDocs(collection(db, colName));
      console.log(`Exporting "${colName}" (${snap.size} documents)...`);
      backupData[colName] = snap.docs.map(doc => ({
        _id: doc.id,
        ...doc.data()
      }));
    } catch (err) {
      console.error(`Error exporting ${colName}:`, err);
      backupData[colName] = [];
    }
  }

  fs.writeFileSync('firestore-backup.json', JSON.stringify(backupData, null, 2));
  console.log('Successfully saved full backup to firestore-backup.json');
}

exportFullFirestore();
