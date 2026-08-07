import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyDX2hq72gGkCOo3RYmdHK7cTfjN75wLIBI",
  authDomain: "oopsis.firebaseapp.com",
  projectId: "oopsis",
  storageBucket: "oopsis.firebasestorage.app",
  messagingSenderId: "1007067574071",
  appId: "1:1007067574071:web:46b5a66739518ceba3b4b2",
  measurementId: "G-DPCZ2EE4VT"
};

// Initialize Firebase
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Initialize Analytics safely
export const analyticsPromise = typeof window !== 'undefined'
  ? isSupported().then(supported => supported ? getAnalytics(app) : null).catch(() => null)
  : Promise.resolve(null);
