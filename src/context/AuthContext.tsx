import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile, ViewTab } from '../types';
import { isUsernameTaken } from '../services/socialService';

interface AuthContextType {
  currentUser: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  activeTab: ViewTab;
  setActiveTab: (tab: ViewTab) => void;
  selectedUserId: string | null; // For viewing another user's profile
  setSelectedUserId: (uid: string | null) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  signUp: (email: string, pass: string, username: string, photoURL?: string, bio?: string) => Promise<void>;
  signIn: (emailOrUsername: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<ViewTab>('home');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('theme_dark') === 'true';
  });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem('theme_dark', String(next));
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        // Subscribe to user doc in Firestore in Realtime
        const userDocRef = doc(db, 'users', user.uid);
        const unsubUserDoc = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data() as UserProfile;
            if (userData.status === 'blocked') {
              showToast('حسابك معطل من قبل إدارة التطبيق', 'error');
              firebaseSignOut(auth);
              setCurrentUser(null);
            } else {
              setCurrentUser(userData);
            }
          } else {
            // Profile doesn't exist yet, create default
            const defaultUser: UserProfile = {
              uid: user.uid,
              email: user.email || '',
              username: user.email ? user.email.split('@')[0] : `user_${user.uid.slice(0, 5)}`,
              displayName: user.displayName || 'مستخدم جديد',
              photoURL: user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`,
              role: (user.email && user.email.toLowerCase().includes('admin')) ? 'admin' : 'user',
              status: 'active',
              createdAt: new Date().toISOString()
            };
            setDoc(userDocRef, defaultUser).catch(console.error);
            setCurrentUser(defaultUser);
          }
          setLoading(false);
        });

        return () => unsubUserDoc();
      } else {
        setCurrentUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Sign Up
  const signUp = async (
    email: string,
    pass: string,
    username: string,
    photoURL?: string,
    bio?: string
  ) => {
    const cleanUsername = username.trim().toLowerCase();
    if (cleanUsername.length < 3) {
      throw new Error('اسم المستخدم يجب أن يتكون من 3 أحرف على الأقل.');
    }

    // Check if username is taken
    const taken = await isUsernameTaken(cleanUsername);
    if (taken) {
      throw new Error('اسم المستخدم هذا محجوز بالفعل، اختر اسمًا آخر.');
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const user = userCredential.user;

    const newProfile: UserProfile = {
      uid: user.uid,
      email,
      username: cleanUsername,
      displayName: username,
      photoURL: photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanUsername}`,
      bio: bio || 'مرحبًا بك في ملفي الشخصي!',
      role: (email.toLowerCase().includes('admin') || cleanUsername.includes('admin')) ? 'admin' : 'user',
      status: 'active',
      createdAt: new Date().toISOString()
    };

    await setDoc(doc(db, 'users', user.uid), newProfile);
    setCurrentUser(newProfile);
    showToast('تم إنشاء الحساب بنجاح! مرحبًا بك 🎉', 'success');
  };

  // Sign In
  const signIn = async (emailOrUsername: string, pass: string) => {
    let emailToUse = emailOrUsername.trim();

    // If input does not contain @, try looking up user by username in Firestore
    if (!emailToUse.includes('@')) {
      const q = query(collection(db, 'users'), where('username', '==', emailToUse.toLowerCase()));
      const snap = await getDocs(q);
      if (snap.empty) {
        throw new Error('اسم المستخدم غير موجود.');
      }
      emailToUse = snap.docs[0].data().email;
    }

    const userCredential = await signInWithEmailAndPassword(auth, emailToUse, pass);
    const user = userCredential.user;

    // Check user doc status
    const userDocRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userDocRef);
    if (userSnap.exists() && userSnap.data().status === 'blocked') {
      await firebaseSignOut(auth);
      throw new Error('هذا الحساب تم إيقافه من قبل لوحة الإدارة.');
    }

    showToast('تم تسجيل الدخول بنجاح! 👋', 'success');
  };

  // Sign Out
  const signOut = async () => {
    await firebaseSignOut(auth);
    setCurrentUser(null);
    setActiveTab('home');
    showToast('تم تسجيل الخروج', 'info');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        firebaseUser,
        loading,
        activeTab,
        setActiveTab,
        selectedUserId,
        setSelectedUserId,
        darkMode,
        toggleDarkMode,
        signUp,
        signIn,
        signOut,
        toast,
        showToast
      }}
    >
      {children}
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 animate-in fade-in slide-in-from-top-4 duration-300 max-w-sm dir-rtl">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl border text-sm font-bold flex items-center gap-3 ${
              toast.type === 'success'
                ? 'bg-emerald-950 text-emerald-200 border-emerald-800'
                : toast.type === 'error'
                ? 'bg-rose-950 text-rose-200 border-rose-800'
                : 'bg-stone-900 text-stone-200 border-stone-700'
            }`}
          >
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
