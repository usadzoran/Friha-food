import React, { useState, useEffect } from 'react';
import { UserProfile, Post } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  subscribePosts,
  subscribeUsers,
  updateUserProfileData,
  isUsernameTaken
} from '../services/socialService';
import PostCard from './PostCard';
import {
  User,
  Edit3,
  Grid,
  Heart,
  Calendar,
  X,
  Save,
  ShieldAlert,
  Camera
} from 'lucide-react';

interface ProfileViewProps {
  targetUserId: string | null;
  onOpenAuth: () => void;
  onViewUserProfile: (userId: string) => void;
}

export default function ProfileView({
  targetUserId,
  onOpenAuth,
  onViewUserProfile
}: ProfileViewProps) {
  const { currentUser, showToast } = useAuth();
  const [profileUser, setProfileUser] = useState<UserProfile | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set());
  const [showEditModal, setShowEditModal] = useState(false);

  // Edit Form State
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editPhotoURL, setEditPhotoURL] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const effectiveUid = targetUserId || currentUser?.uid;
  const isOwnProfile = currentUser && currentUser.uid === effectiveUid;

  // Load user details
  useEffect(() => {
    if (!effectiveUid) return;

    const unsubUsers = subscribeUsers((userList) => {
      const found = userList.find((u) => u.uid === effectiveUid);
      if (found) {
        setProfileUser(found);
      } else if (isOwnProfile && currentUser) {
        setProfileUser(currentUser);
      }
    });

    return () => unsubUsers();
  }, [effectiveUid, currentUser, isOwnProfile]);

  // Load posts for this user
  useEffect(() => {
    if (!effectiveUid) return;

    const unsubPosts = subscribePosts((allPosts) => {
      const userFiltered = allPosts.filter((p) => p.userId === effectiveUid);
      setUserPosts(userFiltered);
    });

    return () => unsubPosts();
  }, [effectiveUid]);

  // Initialize Edit Form
  const handleOpenEdit = () => {
    if (!profileUser) return;
    setEditDisplayName(profileUser.displayName || '');
    setEditUsername(profileUser.username || '');
    setEditBio(profileUser.bio || '');
    setEditPhotoURL(profileUser.photoURL || '');
    setShowEditModal(true);
  };

  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setEditPhotoURL(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileUser) return;

    const cleanUsername = editUsername.trim().toLowerCase();
    if (cleanUsername.length < 3) {
      showToast('اسم المستخدم يجب أن يتكون من 3 أحرف على الأقل', 'error');
      return;
    }

    setIsSaving(true);
    try {
      if (cleanUsername !== profileUser.username) {
        const taken = await isUsernameTaken(cleanUsername, profileUser.uid);
        if (taken) {
          showToast('اسم المستخدم هذا محجوز، اختر اسمًا آخر', 'error');
          setIsSaving(false);
          return;
        }
      }

      await updateUserProfileData(profileUser.uid, {
        displayName: editDisplayName.trim(),
        username: cleanUsername,
        bio: editBio.trim(),
        photoURL: editPhotoURL.trim()
      });

      showToast('تم تحديث الملف الشخصي بنجاح ✨', 'success');
      setShowEditModal(false);
    } catch (e) {
      console.error(e);
      showToast('فشل تحديث البيانات', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (!effectiveUid) {
    return (
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-12 text-center text-stone-400 space-y-4 dir-rtl max-w-md mx-auto">
        <User className="w-16 h-16 text-stone-300 dark:text-stone-700 mx-auto" />
        <h2 className="text-lg font-bold text-stone-900 dark:text-white">لم يتم تسجيل الدخول</h2>
        <p className="text-xs">قم بتسجيل الدخول للاستفادة من كامل المزايا واستعراض ملفك الشخصي.</p>
        <button
          onClick={onOpenAuth}
          className="px-6 py-2.5 rounded-2xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
        >
          تسجيل الدخول الآن
        </button>
      </div>
    );
  }

  const totalLikesReceived = userPosts.reduce((acc, p) => acc + (p.likeCount || 0), 0);

  return (
    <div className="max-w-3xl mx-auto space-y-6 dir-rtl text-right">
      
      {/* PROFILE HEADER CARD */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl overflow-hidden shadow-sm">
        
        {/* COVER BANNER */}
        <div className="h-32 sm:h-44 bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 relative" />

        {/* INFO SECTION */}
        <div className="px-6 pb-6 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-4">
            <div className="flex items-end gap-4">
              <img
                src={
                  profileUser?.photoURL ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${profileUser?.username || 'user'}`
                }
                alt={profileUser?.username || 'مستخدم'}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover ring-4 ring-white dark:ring-stone-900 shadow-xl bg-white dark:bg-stone-800"
              />
              <div className="space-y-0.5">
                <h1 className="text-xl font-black text-stone-900 dark:text-white font-sans">
                  {profileUser?.displayName || `@${profileUser?.username}`}
                </h1>
                <p className="text-xs font-bold text-pink-500">@{profileUser?.username}</p>
              </div>
            </div>

            {isOwnProfile && (
              <button
                onClick={handleOpenEdit}
                className="px-5 py-2.5 rounded-2xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer self-start sm:self-auto"
              >
                <Edit3 className="w-4 h-4 text-emerald-500" />
                <span>تعديل الملف الشخصي</span>
              </button>
            )}
          </div>

          {/* BIO */}
          {profileUser?.bio && (
            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-normal bg-stone-50 dark:bg-stone-800/40 p-3.5 rounded-2xl border border-stone-100 dark:border-stone-800 mb-4">
              {profileUser.bio}
            </p>
          )}

          {/* METRICS ROW */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 border-t border-stone-100 dark:border-stone-800 pt-4">
            <div className="bg-stone-50 dark:bg-stone-800/40 p-3 rounded-2xl text-center">
              <span className="block text-lg font-black text-stone-900 dark:text-white font-mono">
                {userPosts.length}
              </span>
              <span className="text-[11px] text-stone-400 font-bold">عدد المنشورات</span>
            </div>

            <div className="bg-stone-50 dark:bg-stone-800/40 p-3 rounded-2xl text-center">
              <span className="block text-lg font-black text-pink-500 font-mono">
                {totalLikesReceived}
              </span>
              <span className="text-[11px] text-stone-400 font-bold">مجموع الإعجابات</span>
            </div>

            <div className="bg-stone-50 dark:bg-stone-800/40 p-3 rounded-2xl text-center col-span-2 sm:col-span-1">
              <span className="block text-xs font-bold text-stone-700 dark:text-stone-300 mt-1">
                {profileUser?.createdAt
                  ? new Date(profileUser.createdAt).toLocaleDateString('ar-EG', {
                      year: 'numeric',
                      month: 'short'
                    })
                  : 'عضو جديد'}
              </span>
              <span className="text-[11px] text-stone-400 font-bold">تاريخ الانضمام</span>
            </div>
          </div>
        </div>
      </div>

      {/* POSTS GRID / FEED */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-stone-800">
          <h2 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2">
            <Grid className="w-5 h-5 text-pink-500" />
            <span>منشورات المستخدم</span>
          </h2>
          <span className="text-xs text-stone-400 font-mono">{userPosts.length} منشور</span>
        </div>

        {userPosts.length === 0 ? (
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-12 text-center text-stone-400 space-y-2">
            <Grid className="w-12 h-12 mx-auto text-stone-300 dark:text-stone-700" />
            <p className="font-bold text-sm">لا توجد منشورات لهذا المستخدم بعد</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {userPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                isLiked={false}
                onOpenAuth={onOpenAuth}
                onViewUserProfile={onViewUserProfile}
              />
            ))}
          </div>
        )}
      </div>

      {/* EDIT PROFILE MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 dir-rtl text-right animate-in fade-in duration-200">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <h3 className="text-base font-bold text-stone-900 dark:text-white">
                تعديل الملف الشخصي
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3">
              {/* PHOTO URL / PREVIEW */}
              <div className="space-y-1.5 text-center">
                <img
                  src={editPhotoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${editUsername}`}
                  alt="الصورة"
                  className="w-20 h-20 rounded-full mx-auto object-cover ring-2 ring-pink-500/50"
                />
                <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-xs font-bold text-stone-700 dark:text-stone-200 cursor-pointer hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors">
                  <Camera className="w-4 h-4 text-pink-500" />
                  <span>تغيير الصورة</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                  اسم العرض
                </label>
                <input
                  type="text"
                  value={editDisplayName}
                  onChange={(e) => setEditDisplayName(e.target.value)}
                  className="w-full bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl py-2 px-3 text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                  اسم المستخدم (@username)
                </label>
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="w-full bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl py-2 px-3 text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500 dir-ltr"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                  الوصف الشخصي (Bio)
                </label>
                <textarea
                  rows={2}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl py-2 px-3 text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl text-stone-500 text-xs font-bold hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'جاري الحفظ...' : 'حفظ التعديلات'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
