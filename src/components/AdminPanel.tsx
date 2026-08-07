import React, { useState, useEffect } from 'react';
import { Post, Comment, UserProfile } from '../types';
import {
  subscribePosts,
  subscribeUsers,
  deletePostData,
  deleteCommentData,
  setUserStatusData,
  deleteUserData
} from '../services/socialService';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  Users,
  FileText,
  MessageSquare,
  Trash2,
  Ban,
  CheckCircle,
  BarChart3,
  Search,
  Eye
} from 'lucide-react';

export default function AdminPanel() {
  const { showToast } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'posts' | 'users'>('overview');
  const [searchTerm, setSearchTerm] = useState('');

  // Subscribe to Posts & Users in Realtime
  useEffect(() => {
    const unsubPosts = subscribePosts((pList) => setPosts(pList));
    const unsubUsers = subscribeUsers((uList) => setUsers(uList));

    return () => {
      unsubPosts();
      unsubUsers();
    };
  }, []);

  const handleDeletePost = async (postId: string) => {
    if (confirm('تأكيد الإدمن: هل تريد حذف هذا المنشور نهائيًا من قاعدة البيانات؟')) {
      try {
        await deletePostData(postId);
        showToast('تم حذف المنشور بنجاح', 'success');
      } catch (e) {
        console.error(e);
        showToast('فشل حذف المنشور', 'error');
      }
    }
  };

  const handleToggleUserStatus = async (uid: string, currentStatus: 'active' | 'blocked') => {
    const nextStatus = currentStatus === 'active' ? 'blocked' : 'active';
    try {
      await setUserStatusData(uid, nextStatus);
      showToast(
        nextStatus === 'blocked' ? 'تم حظر المستخدم وإيقاف حسابه' : 'تم تفعيل حساب المستخدم بنجاح',
        'info'
      );
    } catch (e) {
      console.error(e);
      showToast('فشل تغيير حالة المستخدم', 'error');
    }
  };

  const handleDeleteUser = async (uid: string) => {
    if (confirm('تأكيد الإدمن: هل تريد حذف هذا الحساب نهائيًا من النظام؟')) {
      try {
        await deleteUserData(uid);
        showToast('تم حذف حساب المستخدم بنجاح', 'success');
      } catch (e) {
        console.error(e);
        showToast('فشل حذف المستخدم', 'error');
      }
    }
  };

  const totalLikes = posts.reduce((sum, p) => sum + (p.likeCount || 0), 0);
  const totalComments = posts.reduce((sum, p) => sum + (p.commentCount || 0), 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6 dir-rtl text-right">
      
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-rose-950 via-stone-900 to-rose-900 border border-rose-800/60 p-6 rounded-3xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-white">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-rose-400" />
            <h1 className="text-xl font-black font-sans">لوحة الإدارة المركزية</h1>
          </div>
          <p className="text-xs text-rose-200/80">
            إدارة المنشورات والمستخدمين والتعليقات في الوقت الحقيقي مباشر من Firebase Firestore
          </p>
        </div>

        {/* ADMIN TABS */}
        <div className="flex items-center gap-1 bg-stone-950/60 p-1 rounded-2xl border border-rose-800/40">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'overview' ? 'bg-rose-600 text-white' : 'text-stone-300 hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>الإحصائيات</span>
          </button>

          <button
            onClick={() => setActiveTab('posts')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'posts' ? 'bg-rose-600 text-white' : 'text-stone-300 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>المنشورات ({posts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'users' ? 'bg-rose-600 text-white' : 'text-stone-300 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>المستخدمين ({users.length})</span>
          </button>
        </div>
      </div>

      {/* STATS OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-5 rounded-3xl space-y-1">
            <Users className="w-6 h-6 text-amber-500" />
            <span className="block text-2xl font-black text-stone-900 dark:text-white font-mono">
              {users.length}
            </span>
            <span className="text-xs text-stone-400 font-bold">المستخدمين المسجلين</span>
          </div>

          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-5 rounded-3xl space-y-1">
            <FileText className="w-6 h-6 text-pink-500" />
            <span className="block text-2xl font-black text-stone-900 dark:text-white font-mono">
              {posts.length}
            </span>
            <span className="text-xs text-stone-400 font-bold">إجمالي المنشورات</span>
          </div>

          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-5 rounded-3xl space-y-1">
            <MessageSquare className="w-6 h-6 text-purple-500" />
            <span className="block text-2xl font-black text-stone-900 dark:text-white font-mono">
              {totalComments}
            </span>
            <span className="text-xs text-stone-400 font-bold">إجمالي التعليقات</span>
          </div>

          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-5 rounded-3xl space-y-1">
            <Shield className="w-6 h-6 text-emerald-500" />
            <span className="block text-2xl font-black text-stone-900 dark:text-white font-mono">
              {totalLikes}
            </span>
            <span className="text-xs text-stone-400 font-bold">إجمالي الإعجابات</span>
          </div>
        </div>
      )}

      {/* POSTS TAB */}
      {activeTab === 'posts' && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 space-y-4 shadow-sm">
          <h2 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2 border-b border-stone-100 dark:border-stone-800 pb-3">
            <FileText className="w-5 h-5 text-rose-500" />
            <span>إدارة المنشورات الفعالة ({posts.length})</span>
          </h2>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {posts.length === 0 ? (
              <p className="text-center py-10 text-stone-400 text-xs font-bold">
                لا توجد منشورات مسجلة في القاعدة حالياً
              </p>
            ) : (
              posts.map((post) => (
                <div
                  key={post.id}
                  className="p-3.5 rounded-2xl border border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/40 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={post.mediaUrl}
                      alt={post.caption}
                      className="w-14 h-14 rounded-xl object-cover shrink-0 bg-stone-900"
                    />
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-stone-900 dark:text-white">
                          @{post.username}
                        </span>
                        <span className="text-[10px] text-stone-400 font-mono">
                          {new Date(post.createdAt).toLocaleDateString('ar-EG')}
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 dark:text-stone-300 truncate">
                        {post.caption || 'بدون وصف'}
                      </p>
                      <div className="flex items-center gap-3 text-[10px] text-stone-400 font-mono">
                        <span>❤️ {post.likeCount || 0}</span>
                        <span>💬 {post.commentCount || 0}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white font-bold text-xs transition-colors cursor-pointer shrink-0 flex items-center gap-1.5"
                    title="حذف المنشور"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">حذف</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* USERS TAB */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 space-y-4 shadow-sm">
          <h2 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2 border-b border-stone-100 dark:border-stone-800 pb-3">
            <Users className="w-5 h-5 text-rose-500" />
            <span>إدارة الحسابات والمستخدمين ({users.length})</span>
          </h2>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {users.map((u) => (
              <div
                key={u.uid}
                className="p-3.5 rounded-2xl border border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/40 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={
                      u.photoURL ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`
                    }
                    alt={u.username}
                    className="w-10 h-10 rounded-full object-cover shrink-0"
                  />
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-stone-900 dark:text-white">
                        @{u.username}
                      </span>
                      {u.role === 'admin' && (
                        <span className="px-2 py-0.5 rounded bg-rose-500 text-white text-[9px] font-bold">
                          مشرف
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          u.status === 'blocked'
                            ? 'bg-rose-500/20 text-rose-500'
                            : 'bg-emerald-500/20 text-emerald-500'
                        }`}
                      >
                        {u.status === 'blocked' ? 'محظور' : 'نشط'}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-400 truncate">{u.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggleUserStatus(u.uid, u.status)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                      u.status === 'blocked'
                        ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white'
                        : 'bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white'
                    }`}
                  >
                    {u.status === 'blocked' ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>تفعيل</span>
                      </>
                    ) : (
                      <>
                        <Ban className="w-3.5 h-3.5" />
                        <span>حظر</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleDeleteUser(u.uid)}
                    className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white transition-colors cursor-pointer"
                    title="حذف الحساب"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
