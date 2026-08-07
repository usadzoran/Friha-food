import React, { useState, useEffect } from 'react';
import { Post, Comment } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  toggleLikePost,
  subscribePostComments,
  addCommentData,
  deleteCommentData,
  deletePostData
} from '../services/socialService';
import {
  Heart,
  MessageCircle,
  Share2,
  MoreVertical,
  Trash2,
  Send,
  User,
  Check,
  ShieldAlert
} from 'lucide-react';

interface PostCardProps {
  key?: string;
  post: Post;
  isLiked: boolean;
  onOpenAuth: () => void;
  onViewUserProfile: (userId: string) => void;
}

export default function PostCard({
  post,
  isLiked,
  onOpenAuth,
  onViewUserProfile
}: PostCardProps) {
  const { currentUser, showToast } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showHeartAnim, setShowHeartAnim] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Subscribe to real-time comments for this post
  useEffect(() => {
    const unsub = subscribePostComments(post.id, (commentList) => {
      setComments(commentList);
    });
    return () => unsub();
  }, [post.id]);

  const handleLikeToggle = async () => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    try {
      await toggleLikePost(post.id, currentUser.uid, currentUser.username, post.userId);
    } catch (e) {
      console.error(e);
      showToast('تعذر تغيير الإعجاب', 'error');
    }
  };

  const handleDoubleTap = () => {
    if (!isLiked) {
      handleLikeToggle();
    }
    setShowHeartAnim(true);
    setTimeout(() => setShowHeartAnim(false), 800);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    setIsSubmittingComment(true);
    try {
      await addCommentData(
        {
          postId: post.id,
          userId: currentUser.uid,
          username: currentUser.username,
          userPhotoURL: currentUser.photoURL,
          text: newCommentText.trim()
        },
        post.userId
      );
      setNewCommentText('');
      setShowComments(true);
    } catch (e) {
      console.error(e);
      showToast('تعذر إضافة التعليق', 'error');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (confirm('هل أنت متاكد من حذف هذا التعليق؟')) {
      try {
        await deleteCommentData(commentId, post.id);
        showToast('تم حذف التعليق بنجاح', 'success');
      } catch (e) {
        console.error(e);
        showToast('فشل حذف التعليق', 'error');
      }
    }
  };

  const handleDeletePost = async () => {
    if (confirm('هل أنت متاكد من حذف هذا المنشور بالكامل؟')) {
      try {
        await deletePostData(post.id);
        showToast('تم حذف المنشور بنجاح', 'success');
      } catch (e) {
        console.error(e);
        showToast('فشل حذف المنشور', 'error');
      }
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    showToast('تم نسخ رابط المنشور إلى الحافظة 📋', 'info');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const canDeletePost =
    currentUser && (currentUser.uid === post.userId || currentUser.role === 'admin');

  return (
    <article className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow dir-rtl text-right">
      
      {/* POST HEADER */}
      <div className="p-4 flex items-center justify-between border-b border-stone-100 dark:border-stone-800/60">
        <button
          onClick={() => onViewUserProfile(post.userId)}
          className="flex items-center gap-3 group text-right cursor-pointer"
        >
          <img
            src={
              post.userPhotoURL ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.username}`
            }
            alt={post.username}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-pink-500/30 group-hover:ring-pink-500 transition-all"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-stone-900 dark:text-white group-hover:text-pink-500 transition-colors">
                @{post.username}
              </span>
            </div>
            <span className="text-[11px] text-stone-400 block">
              {new Date(post.createdAt).toLocaleDateString('ar-EG', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        </button>

        {/* OPTIONS MENU */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {showMenu && (
            <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xl p-2 z-30 animate-in fade-in zoom-in-95 duration-150">
              <button
                onClick={() => {
                  onViewUserProfile(post.userId);
                  setShowMenu(false);
                }}
                className="w-full text-right px-3 py-2 text-xs font-bold text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl flex items-center gap-2 cursor-pointer"
              >
                <User className="w-4 h-4 text-emerald-500" />
                <span>زيارة الملف الشخصي</span>
              </button>

              {canDeletePost && (
                <button
                  onClick={handleDeletePost}
                  className="w-full text-right px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl flex items-center gap-2 cursor-pointer mt-1"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>حذف المنشور</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* POST MEDIA WITH DOUBLE TAP LIKE */}
      <div
        onDoubleClick={handleDoubleTap}
        className="relative bg-stone-950 aspect-square sm:aspect-4/3 overflow-hidden flex items-center justify-center select-none cursor-pointer group"
      >
        {post.mediaType === 'video' ? (
          <video
            src={post.mediaUrl}
            controls
            className="w-full h-full object-contain"
          />
        ) : (
          <img
            src={post.mediaUrl}
            alt={post.caption || 'صورة المنشور'}
            className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-300"
            loading="lazy"
          />
        )}

        {/* Animated Heart Overlay on Double Tap */}
        {showHeartAnim && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px] animate-in zoom-in-50 duration-200">
            <Heart className="w-24 h-24 text-pink-500 fill-pink-500 drop-shadow-2xl animate-bounce" />
          </div>
        )}
      </div>

      {/* ACTION BAR */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            
            {/* LIKE BUTTON */}
            <button
              onClick={handleLikeToggle}
              className={`p-2.5 rounded-2xl flex items-center gap-2 transition-all cursor-pointer ${
                isLiked
                  ? 'bg-pink-500/10 text-pink-500'
                  : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <Heart
                className={`w-6 h-6 transition-transform active:scale-125 ${
                  isLiked ? 'fill-pink-500 text-pink-500' : ''
                }`}
              />
              <span className="font-bold text-xs">{post.likeCount || 0}</span>
            </button>

            {/* COMMENT BUTTON */}
            <button
              onClick={() => setShowComments(!showComments)}
              className="p-2.5 rounded-2xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center gap-2 transition-all cursor-pointer"
            >
              <MessageCircle className="w-6 h-6" />
              <span className="font-bold text-xs">{post.commentCount || comments.length}</span>
            </button>

            {/* SHARE BUTTON */}
            <button
              onClick={handleShare}
              className="p-2.5 rounded-2xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all cursor-pointer"
              title="مشاركة المنشور"
            >
              {copiedLink ? <Check className="w-5 h-5 text-emerald-500" /> : <Share2 className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* CAPTION */}
        {post.caption && (
          <div className="text-sm text-stone-800 dark:text-stone-200 leading-relaxed font-normal">
            <span
              onClick={() => onViewUserProfile(post.userId)}
              className="font-bold text-stone-900 dark:text-white ml-2 hover:underline cursor-pointer"
            >
              @{post.username}
            </span>
            <span>{post.caption}</span>
          </div>
        )}

        {/* COMMENTS SECTION */}
        <div className="pt-2 border-t border-stone-100 dark:border-stone-800/80 space-y-3">
          
          {/* Toggle comments link */}
          {!showComments && comments.length > 0 && (
            <button
              onClick={() => setShowComments(true)}
              className="text-xs font-bold text-stone-400 hover:text-pink-500 transition-colors cursor-pointer"
            >
              عرض جميع التعليقات ({comments.length})
            </button>
          )}

          {/* Realtime Comments List */}
          {showComments && (
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {comments.length === 0 ? (
                <p className="text-xs text-stone-400 py-2 text-center">لا توجد تعليقات بعد، كن أول المعلقين!</p>
              ) : (
                comments.map((comment) => {
                  const canDeleteComment =
                    currentUser &&
                    (currentUser.uid === comment.userId ||
                      currentUser.uid === post.userId ||
                      currentUser.role === 'admin');

                  return (
                    <div
                      key={comment.id}
                      className="flex items-start justify-between gap-2 p-2.5 rounded-2xl bg-stone-50 dark:bg-stone-800/40 text-xs"
                    >
                      <div className="flex items-start gap-2.5">
                        <img
                          src={
                            comment.userPhotoURL ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.username}`
                          }
                          alt={comment.username}
                          className="w-6 h-6 rounded-full object-cover shrink-0 mt-0.5"
                        />
                        <div className="space-y-0.5">
                          <span className="font-bold text-stone-900 dark:text-white ml-2">
                            @{comment.username}
                          </span>
                          <span className="text-stone-700 dark:text-stone-300 font-normal">
                            {comment.text}
                          </span>
                        </div>
                      </div>

                      {canDeleteComment && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-stone-400 hover:text-rose-500 transition-colors p-1 cursor-pointer shrink-0"
                          title="حذف التعليق"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ADD COMMENT INPUT FORM */}
          <form onSubmit={handleAddComment} className="flex items-center gap-2 pt-1">
            <input
              type="text"
              placeholder={currentUser ? 'أضف تعليقًا...' : 'سجل الدخول للتعليق'}
              disabled={!currentUser || isSubmittingComment}
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              className="flex-1 bg-stone-100 dark:bg-stone-800 border-none focus:ring-2 focus:ring-pink-500 rounded-2xl py-2 px-3.5 text-xs text-stone-900 dark:text-white focus:outline-none placeholder:text-stone-400"
            />
            <button
              type="submit"
              disabled={!currentUser || !newCommentText.trim() || isSubmittingComment}
              className="p-2 rounded-xl bg-pink-500 hover:bg-pink-600 disabled:opacity-40 text-white transition-all cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </article>
  );
}
