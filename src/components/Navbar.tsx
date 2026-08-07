import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Compass,
  PlusSquare,
  Search,
  User,
  Shield,
  Sun,
  Moon,
  LogOut,
  LogIn,
  Bell,
  Heart,
  Sparkles
} from 'lucide-react';
import { subscribeNotifications } from '../services/socialService';
import { Notification } from '../types';

interface NavbarProps {
  onOpenAuth: () => void;
}

export default function Navbar({ onOpenAuth }: NavbarProps) {
  const {
    currentUser,
    signOut,
    activeTab,
    setActiveTab,
    selectedUserId,
    setSelectedUserId,
    darkMode,
    toggleDarkMode
  } = useAuth();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  useEffect(() => {
    if (currentUser?.uid) {
      const unsub = subscribeNotifications(currentUser.uid, (notifs) => {
        setNotifications(notifs);
      });
      return () => unsub();
    }
  }, [currentUser]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-stone-900/80 border-b border-stone-200 dark:border-stone-800 transition-colors">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between dir-rtl">
        
        {/* LOGO */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setSelectedUserId(null);
              setActiveTab('home');
            }}
            className="flex items-center gap-2 group cursor-pointer text-right"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 p-0.5 shadow-md shadow-pink-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-white dark:bg-stone-900 rounded-[14px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-pink-500" />
              </div>
            </div>
            <div>
              <span className="text-xl font-black bg-gradient-to-r from-pink-500 via-purple-500 to-amber-500 bg-clip-text text-transparent font-sans tracking-tight">
                انستغرامي
              </span>
              <span className="block text-[10px] text-stone-400 font-bold -mt-1">
                تواصل بلحظات
              </span>
            </div>
          </button>
        </div>

        {/* DESKTOP NAV TABS */}
        <nav className="hidden md:flex items-center gap-1 bg-stone-100 dark:bg-stone-800/60 p-1.5 rounded-2xl border border-stone-200/60 dark:border-stone-700/40">
          <button
            onClick={() => {
              setSelectedUserId(null);
              setActiveTab('home');
            }}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'home'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-sm'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <Compass className="w-4 h-4 text-pink-500" />
            <span>الرئيسية</span>
          </button>

          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'create'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-sm'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <PlusSquare className="w-4 h-4 text-purple-500" />
            <span>إنشاء منشور</span>
          </button>

          <button
            onClick={() => setActiveTab('search')}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'search'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-sm'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <Search className="w-4 h-4 text-amber-500" />
            <span>البحث</span>
          </button>

          {currentUser && (
            <button
              onClick={() => {
                setSelectedUserId(null);
                setActiveTab('profile');
              }}
              className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'profile' && !selectedUserId
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-sm'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <User className="w-4 h-4 text-emerald-500" />
              <span>الملف الشخصي</span>
            </button>
          )}

          {currentUser?.role === 'admin' && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-rose-500 hover:bg-rose-500/10'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>لوحة الإدارة</span>
            </button>
          )}
        </nav>

        {/* RIGHT CONTROLS: THEME, NOTIFS, USER AUTH */}
        <div className="flex items-center gap-2">
          
          {/* Theme Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2.5 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            title={darkMode ? 'الوضع الفاتح' : 'الوضع الداكن'}
          >
            {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Notifications Dropdown */}
          {currentUser && (
            <div className="relative">
              <button
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="p-2.5 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer relative"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-pink-500 ring-2 ring-white dark:ring-stone-900 animate-ping" />
                )}
              </button>

              {showNotifMenu && (
                <div className="absolute left-0 mt-2 w-80 bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800 mb-3">
                    <span className="font-bold text-sm text-stone-900 dark:text-white flex items-center gap-2">
                      <Heart className="w-4 h-4 text-pink-500" />
                      <span>الإشعارات</span>
                    </span>
                    <span className="text-xs text-stone-400 font-mono">{notifications.length}</span>
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto text-xs">
                    {notifications.length === 0 ? (
                      <p className="text-center py-6 text-stone-400">لا توجد إشعارات حالياً</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/50 flex items-start gap-2.5"
                        >
                          <div className="w-7 h-7 rounded-full bg-pink-100 text-pink-600 dark:bg-pink-950 dark:text-pink-300 flex items-center justify-center font-bold text-xs shrink-0">
                            {n.senderUsername?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div className="flex-1 space-y-0.5">
                            <p className="text-stone-800 dark:text-stone-200 font-medium">{n.text}</p>
                            <span className="text-[10px] text-stone-400 block">
                              {new Date(n.createdAt).toLocaleTimeString('ar-EG', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* USER / AUTH */}
          {currentUser ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSelectedUserId(null);
                  setActiveTab('profile');
                }}
                className="flex items-center gap-2.5 pl-3 pr-2 py-1.5 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors cursor-pointer"
              >
                <img
                  src={currentUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.username}`}
                  alt={currentUser.username}
                  className="w-7 h-7 rounded-full object-cover ring-2 ring-pink-500/50"
                />
                <span className="font-bold text-xs text-stone-800 dark:text-stone-200 hidden sm:inline">
                  @{currentUser.username}
                </span>
              </button>

              <button
                onClick={signOut}
                className="p-2.5 rounded-xl text-stone-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                title="تسجيل الخروج"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold text-xs shadow-md shadow-pink-500/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>تسجيل الدخول</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
