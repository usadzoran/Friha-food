import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Image as ImageIcon, Plus, Trash2, Copy, Check, UploadCloud } from 'lucide-react';

export default function MediaTab() {
  const { mediaItems, addMediaItem, deleteMediaItem } = useApp();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [imageName, setImageName] = useState('');

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddMedia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) return;
    addMediaItem({
      name: imageName || 'صورة_جديدة.jpg',
      url: imageUrl,
      size: '1.5 MB'
    });
    setImageUrl('');
    setImageName('');
  };

  return (
    <div className="space-y-6 font-cairo dir-rtl text-right">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-stone-900 p-5 rounded-2xl border border-stone-800">
        <div className="space-y-1 w-full sm:w-auto">
          <h2 className="text-2xl font-bold font-kufi text-white flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-emerald-400" />
            <span>إدارة الصور والوسائط</span>
          </h2>
          <p className="text-xs text-stone-400">
            مكتبة الصور المستخدمة للبانرات، الوجبات، والمتاجر والمطاعم
          </p>
        </div>
      </div>

      {/* ADD NEW IMAGE BAR */}
      <form onSubmit={handleAddMedia} className="bg-stone-900 border border-stone-800 p-5 rounded-2xl space-y-4">
        <h3 className="text-sm font-bold text-stone-200 flex items-center gap-2">
          <UploadCloud className="w-4 h-4 text-emerald-400" />
          <span>إضافة رابط صورة جديد إلى المكتبة</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input
            type="text"
            value={imageName}
            onChange={(e) => setImageName(e.target.value)}
            placeholder="اسم الصورة (مثال: banner_food.jpg)"
            className="bg-stone-950 border border-stone-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-stone-100 text-sm focus:outline-none"
          />
          <input
            type="url"
            required
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="رابط الصورة المباشر (https://...)"
            className="bg-stone-950 border border-stone-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-stone-100 text-sm focus:outline-none dir-ltr"
          />
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl py-2.5 px-5 shadow-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة للمكتبة</span>
          </button>
        </div>
      </form>

      {/* MEDIA GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {mediaItems.map((item) => (
          <div
            key={item.id}
            className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-lg space-y-3 p-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="relative h-40 w-full rounded-xl overflow-hidden bg-stone-950 border border-stone-800">
                <img
                  src={item.url}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-0.5 px-1">
                <h4 className="text-xs font-bold text-white truncate">{item.name}</h4>
                <div className="flex items-center justify-between text-[11px] text-stone-500">
                  <span>{item.uploadedAt}</span>
                  <span>{item.size}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between gap-2">
              <button
                onClick={() => handleCopy(item.url, item.id)}
                className="flex-1 py-1.5 px-3 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId === item.id ? 'تم النسخ!' : 'نسخ الرابط'}</span>
              </button>
              <button
                onClick={() => {
                  if (confirm('هل أنت تأكد من حذف الصورة؟')) {
                    deleteMediaItem(item.id);
                  }
                }}
                className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-400 border border-red-800/50 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
