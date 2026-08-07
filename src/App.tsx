import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import MobileBottomNav from './components/MobileBottomNav';
import PostCard from './components/PostCard';
import CreatePostModal from './components/CreatePostModal';
import SearchView from './components/SearchView';
import ProfileView from './components/ProfileView';
import AdminPanel from './components/AdminPanel';
import AuthModal from './components/AuthModal';
import { Post } from './types';
import { subscribePosts, subscribeUserLikes } from './services/socialService';
import { Sparkles, PlusSquare, Compass, Shield, Users } from 'lucide-react';

function MainApp() {
  const {
    currentUser,
    activeTab,
    setActiveTab,
    selectedUserId,
    setSelectedUserId
  } = useAuth();

  const [posts, setPosts] = useState<Post[]>([]);
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set());
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(true);

  // Subscribe to Posts in Realtime from Firebase Firestore
  useEffect(() => {
    setLoadingPosts(true);
    const unsubPosts = subscribePosts((pList) => {
      setPosts(pList);
      setLoadingPosts(false);
    });
    return () => unsubPosts();
  }, []);

  // Subscribe to User's Likes in Realtime
  useEffect(() => {
    if (currentUser?.uid) {
      const unsubLikes = subscribeUserLikes(currentUser.uid, (likedIds) => {
        setLikedPostIds(likedIds);
      });
      return () => unsubLikes();
    } else {
      setLikedPostIds(new Set());
    }
  }, [currentUser]);

  // Sync Create Modal with activeTab
  useEffect(() => {
    if (activeTab === 'create') {
      if (!currentUser) {
        setShowAuthModal(true);
      } else {
        setShowCreateModal(true);
      }
    }
  }, [activeTab, currentUser]);

  const handleViewUserProfile = (userId: string) => {
    setSelectedUserId(userId);
    setActiveTab('profile');
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-sans transition-colors pb-24 md:pb-12 dir-rtl">
      
      {/* NAVBAR */}
      <Navbar onOpenAuth={() => setShowAuthModal(true)} />

      {/* MAIN CONTAINER */}
      <main className="max-w-4xl mx-auto px-4 pt-6 pb-8">
        
        {/* VIEW 1: HOME FEED */}
        {activeTab === 'home' && (
          <div className="max-w-xl mx-auto space-y-6">
            
            {/* HERO STORIES / WELCOME BAR */}
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-4 shadow-sm flex items-center justify-between gap-3 text-right">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-amber-400 p-0.5 shrink-0">
                  <div className="w-full h-full bg-white dark:bg-stone-900 rounded-[14px] flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-pink-500" />
                  </div>
                </div>
                <div>
                  <h2 className="text-sm font-bold text-stone-900 dark:text-white">
                    مرحبًا بك في انستغرامي 👋
                  </h2>
                  <p className="text-xs text-stone-400">
                    شارك لحظاتك وصورك مباشرة مع الجميع في الوقت الحقيقي
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  if (!currentUser) {
                    setShowAuthModal(true);
                  } else {
                    setShowCreateModal(true);
                  }
                }}
                className="px-4 py-2 rounded-xl bg-pink-500/10 hover:bg-pink-500 text-pink-500 hover:text-white font-bold text-xs transition-colors cursor-pointer shrink-0 flex items-center gap-1.5"
              >
                <PlusSquare className="w-4 h-4" />
                <span>نشر الآن</span>
              </button>
            </div>

            {/* REALTIME FEED POSTS */}
            {loadingPosts ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 h-96 animate-pulse"
                  />
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-12 text-center space-y-4 shadow-sm">
                <div className="w-16 h-16 rounded-full bg-pink-500/10 text-pink-500 mx-auto flex items-center justify-center">
                  <Compass className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-stone-900 dark:text-white">
                    لا توجد منشورات حالياً في الصفحة الرئيسية
                  </h3>
                  <p className="text-xs text-stone-400 max-w-sm mx-auto">
                    كن أول من يشارك صورة أو فيديو عبر الزر أدناه وسوف تظهر مباشرة للجميع!
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (!currentUser) {
                      setShowAuthModal(true);
                    } else {
                      setShowCreateModal(true);
                    }
                  }}
                  className="px-6 py-3 rounded-2xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs shadow-lg shadow-pink-500/20 transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <PlusSquare className="w-4 h-4" />
                  <span>إضافة أول منشور</span>
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    isLiked={likedPostIds.has(post.id)}
                    onOpenAuth={() => setShowAuthModal(true)}
                    onViewUserProfile={handleViewUserProfile}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: SEARCH */}
        {activeTab === 'search' && (
          <SearchView onViewUserProfile={handleViewUserProfile} />
        )}

        {/* VIEW 3: PROFILE */}
        {activeTab === 'profile' && (
          <ProfileView
            targetUserId={selectedUserId}
            onOpenAuth={() => setShowAuthModal(true)}
            onViewUserProfile={handleViewUserProfile}
          />
        )}

        {/* VIEW 4: ADMIN PANEL */}
        {activeTab === 'admin' && <AdminPanel />}
      </main>

      {/* MOBILE BOTTOM NAVIGATION */}
      <MobileBottomNav onOpenAuth={() => setShowAuthModal(true)} />

      {/* CREATE POST MODAL */}
      {showCreateModal && (
        <CreatePostModal
          onClose={() => {
            setShowCreateModal(false);
            if (activeTab === 'create') setActiveTab('home');
          }}
        />
      )}

      {/* AUTH MODAL */}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
