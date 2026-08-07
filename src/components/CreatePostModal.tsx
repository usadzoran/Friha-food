import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { createPostData } from '../services/socialService';
import { Image, Video, Upload, Sparkles, X, PlusSquare } from 'lucide-react';

interface CreatePostModalProps {
  onClose: () => void;
}

const SAMPLE_PRESETS = [
  {
    name: 'غروب الشمس',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'قهوة وصباح',
    url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'طبيعة وجبال',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'مدينة ليلية',
    url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&auto=format&fit=crop&q=80'
  }
];

export default function CreatePostModal({ onClose }: CreatePostModalProps) {
  const { currentUser, showToast, setActiveTab } = useAuth();
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [caption, setCaption] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  // Handle local file selection converting to base64 data URL
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showToast('حجم الملف كبير جدًا (الحد الأقصى 10 ميغابايت)', 'error');
      return;
    }

    const isVid = file.type.startsWith('video');
    setMediaType(isVid ? 'video' : 'image');

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setMediaUrl(reader.result);
        setPreviewError(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      showToast('يجب تسجيل الدخول أولاً لنشر منشور', 'error');
      return;
    }

    if (!mediaUrl.trim()) {
      showToast('يرجى اختيار صورة أو فيديو للمنشور', 'error');
      return;
    }

    setIsPublishing(true);
    try {
      await createPostData({
        userId: currentUser.uid,
        username: currentUser.username,
        userPhotoURL: currentUser.photoURL,
        mediaUrl: mediaUrl.trim(),
        mediaType,
        caption: caption.trim()
      });

      showToast('تم نشر المنشور بنجاح! ✨', 'success');
      setActiveTab('home');
      onClose();
    } catch (e) {
      console.error(e);
      showToast('فشل نشر المنشور، حاول مجددًا', 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 dir-rtl text-right animate-in fade-in duration-200">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-pink-500/10 text-pink-500 flex items-center justify-center">
              <PlusSquare className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-stone-900 dark:text-white font-sans">
              إنشاء منشور جديد
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1">
          
          {/* MEDIA PREVIEW & SELECTOR */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
              الصورة أو الفيديو
            </label>

            {/* PREVIEW CONTAINER */}
            {mediaUrl ? (
              <div className="relative rounded-2xl overflow-hidden bg-stone-950 aspect-4/3 flex items-center justify-center border border-stone-800 group">
                {mediaType === 'video' ? (
                  <video src={mediaUrl} controls className="w-full h-full object-contain" />
                ) : (
                  <img
                    src={mediaUrl}
                    alt="معاينة"
                    onError={() => setPreviewError(true)}
                    className="w-full h-full object-cover"
                  />
                )}

                <button
                  type="button"
                  onClick={() => setMediaUrl('')}
                  className="absolute top-3 left-3 p-2 bg-black/60 hover:bg-black text-white rounded-full transition-colors cursor-pointer"
                  title="تغيير الوسائط"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-stone-300 dark:border-stone-700 rounded-2xl p-6 text-center space-y-3 bg-stone-50 dark:bg-stone-800/40 hover:border-pink-500 transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-pink-500/10 text-pink-500 mx-auto flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-bold text-stone-800 dark:text-stone-200">
                    اختر صورة أو فيديو من جهازك
                  </p>
                  <p className="text-[11px] text-stone-400">
                    يدعم جميع صيغ الصور والفيديو حتى 10 ميغابايت
                  </p>
                </div>

                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs cursor-pointer transition-colors shadow-md shadow-pink-500/20">
                  <Upload className="w-4 h-4" />
                  <span>رفع من الجهاز</span>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>

          {/* URL INPUT OPTION */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
              أو أدخل رابط صورة / فيديو مباشرة
            </label>
            <input
              type="url"
              placeholder="https://example.com/photo.jpg"
              value={mediaUrl.startsWith('data:') ? '' : mediaUrl}
              onChange={(e) => {
                setMediaUrl(e.target.value);
                setMediaType('image');
              }}
              className="w-full bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl py-2.5 px-3.5 text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500 dir-ltr"
            />
          </div>

          {/* QUICK SAMPLE PRESETS */}
          <div className="space-y-2">
            <span className="block text-[11px] font-bold text-stone-500 dark:text-stone-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>أو اختر صورة جاهزة بسرعة:</span>
            </span>
            <div className="grid grid-cols-4 gap-2">
              {SAMPLE_PRESETS.map((preset) => (
                <button
                  type="button"
                  key={preset.name}
                  onClick={() => {
                    setMediaUrl(preset.url);
                    setMediaType('image');
                  }}
                  className="group relative rounded-xl overflow-hidden aspect-square border border-stone-200 dark:border-stone-700 hover:ring-2 hover:ring-pink-500 transition-all cursor-pointer"
                >
                  <img
                    src={preset.url}
                    alt={preset.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                  />
                  <span className="absolute inset-0 bg-black/40 flex items-end p-1 text-[9px] text-white font-bold text-center">
                    {preset.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* CAPTION */}
          <div className="space-y-1.5 pt-2">
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
              الوصف / النص المصاحب
            </label>
            <textarea
              rows={3}
              placeholder="اكتب وصفًا للمنشور..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl py-2.5 px-3.5 text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
            />
          </div>

          {/* SUBMIT BUTTON */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isPublishing || !mediaUrl.trim()}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 disabled:opacity-50 text-white font-bold text-sm shadow-xl shadow-pink-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <PlusSquare className="w-5 h-5" />
              <span>{isPublishing ? 'جاري النشر في القاعدة...' : 'نشر المنشور الآن'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
