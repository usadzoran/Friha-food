import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Compass, PlusSquare, Search, User, Shield } from 'lucide-react';

interface MobileBottomNavProps {
  onOpenAuth: () => void;
}

export default function MobileBottomNav({ onOpenAuth }: MobileBottomNavProps) {
  const { currentUser, activeTab, setActiveTab, setSelectedUserId } = useAuth();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-stone-900/90 backdrop-blur-xl border-t border-stone-200 dark:border-stone-800 py-2 px-4 dir-rtl">
      <div className="flex items-center justify-around max-w-md mx-auto">
        
        {/* Home */}
        <button
          onClick={() => {
            setSelectedUserId(null);
            setActiveTab('home');
          }}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'home'
              ? 'text-pink-500 scale-110 font-bold'
              : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
          }`}
        >
          <Compass className="w-6 h-6" />
          <span className="text-[10px]">الرئيسية</span>
        </button>

        {/* Create */}
        <button
          onClick={() => {
            if (!currentUser) {
              onOpenAuth();
            } else {
              setActiveTab('create');
            }
          }}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'create'
              ? 'text-purple-500 scale-110 font-bold'
              : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
          }`}
        >
          <PlusSquare className="w-6 h-6" />
          <span className="text-[10px]">إنشاء</span>
        </button>

        {/* Search */}
        <button
          onClick={() => setActiveTab('search')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'search'
              ? 'text-amber-500 scale-110 font-bold'
              : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
          }`}
        >
          <Search className="w-6 h-6" />
          <span className="text-[10px]">البحث</span>
        </button>

        {/* Profile */}
        <button
          onClick={() => {
            if (!currentUser) {
              onOpenAuth();
            } else {
              setSelectedUserId(null);
              setActiveTab('profile');
            }
          }}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'profile'
              ? 'text-emerald-500 scale-110 font-bold'
              : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
          }`}
        >
          <User className="w-6 h-6" />
          <span className="text-[10px]">الملف</span>
        </button>

        {/* Admin if admin */}
        {currentUser?.role === 'admin' && (
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'admin'
                ? 'text-rose-500 scale-110 font-bold'
                : 'text-rose-400 hover:text-rose-600'
            }`}
          >
            <Shield className="w-6 h-6" />
            <span className="text-[10px]">الإدارة</span>
          </button>
        )}
      </div>
    </div>
  );
}
