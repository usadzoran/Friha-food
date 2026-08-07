import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { subscribeUsers } from '../services/socialService';
import { Search, User, ShieldCheck } from 'lucide-react';

interface SearchViewProps {
  onViewUserProfile: (userId: string) => void;
}

export default function SearchView({ onViewUserProfile }: SearchViewProps) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const unsub = subscribeUsers((userList) => {
      setUsers(userList);
    });
    return () => unsub();
  }, []);

  const filteredUsers = users.filter((u) => {
    const query = searchTerm.toLowerCase().trim();
    if (!query) return true;
    return (
      u.username.toLowerCase().includes(query) ||
      (u.displayName && u.displayName.toLowerCase().includes(query)) ||
      (u.email && u.email.toLowerCase().includes(query))
    );
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6 dir-rtl text-right">
      
      {/* SEARCH INPUT */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-4 rounded-3xl shadow-sm space-y-3">
        <h2 className="text-xl font-bold text-stone-900 dark:text-white font-sans flex items-center gap-2">
          <Search className="w-5 h-5 text-amber-500" />
          <span>البحث عن مستخدمين</span>
        </h2>

        <div className="relative">
          <input
            type="text"
            placeholder="ابحث باسم المستخدم أو البريد..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-2xl py-3 pr-11 pl-4 text-sm text-stone-900 dark:text-white focus:outline-none transition-colors"
          />
          <Search className="w-5 h-5 text-stone-400 absolute right-3.5 top-3.5" />
        </div>
      </div>

      {/* USERS LIST */}
      <div className="space-y-3">
        {filteredUsers.length === 0 ? (
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-12 text-center text-stone-400 space-y-2">
            <User className="w-12 h-12 mx-auto text-stone-300 dark:text-stone-700" />
            <p className="font-bold text-sm">لم يتم العثور على أي مستخدم يناسب بحثك</p>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div
              key={user.uid}
              onClick={() => onViewUserProfile(user.uid)}
              className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 flex items-center justify-between hover:border-amber-500/50 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <img
                  src={
                    user.photoURL ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`
                  }
                  alt={user.username}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-amber-500/20 group-hover:ring-amber-500 transition-all"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-stone-900 dark:text-white group-hover:text-amber-500 transition-colors">
                      @{user.username}
                    </span>
                    {user.role === 'admin' && (
                      <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-500 text-[10px] font-bold flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        <span>مشرف</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-400 line-clamp-1">
                    {user.bio || 'مستخدم في انستغرامي'}
                  </p>
                </div>
              </div>

              <button className="px-4 py-2 rounded-xl bg-amber-500/10 group-hover:bg-amber-500 text-amber-600 dark:text-amber-400 group-hover:text-white font-bold text-xs transition-colors">
                عرض الملف
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
