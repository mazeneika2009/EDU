import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Shield, X, Users, CreditCard, BookOpen, BarChart3, MessageSquare,
  RefreshCw, Loader2, CheckCircle, XCircle, Trash2, Plus, Search,
  Mail, Zap, Trophy, FileText, BrainCircuit, Unlock, Settings
} from 'lucide-react';

const tr = (lang, en, ar, tr) => lang === 'ar' ? ar : lang === 'tr' ? tr : en;

function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex gap-1.5 mb-6 overflow-x-auto pb-1.5 scrollbar-thin border-b border-purple-500/10">
      {tabs.map(t => (
        <button key={t.key} onClick={() => onChange(t.key)}
          className={`relative flex items-center gap-1.5 px-4 py-2 rounded-lg text-[11px] font-bold tracking-wide transition-all cursor-pointer shrink-0 ${
            active === t.key
              ? 'text-white after:absolute after:bottom-0 after:left-2 after:right-2 after:h-0.5 after:bg-gradient-to-r after:from-purple-500 after:to-cyan-400 after:rounded-full'
              : 'text-gray-500 hover:text-gray-300'
          }`}>
          <t.icon className={`w-3.5 h-3.5 ${active === t.key ? 'text-purple-400' : ''}`} />
          {t.label}
        </button>
      ))}
    </div>
  );
}

function LoadingSpinner() {
  return <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 text-purple-400 animate-spin" /></div>;
}

function EmptyState({ icon: Icon, text, subtext }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16">
      <div className="p-4 rounded-2xl bg-[#0e1424] border border-purple-500/10">
        <Icon className="w-8 h-8 text-gray-700" />
      </div>
      <p className="text-xs text-gray-600 font-medium">{text}</p>
      {subtext && <p className="text-[10px] text-gray-700 font-mono">{subtext}</p>}
    </div>
  );
}

function CMSTab({ adminToken, lang, onGardensChange }) {
  const [gardens, setGardens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedGarden, setExpandedGarden] = useState(null);
  const [seeds, setSeeds] = useState({});
  const [editGarden, setEditGarden] = useState(null);
  const [editSeed, setEditSeed] = useState(null);
  const [showForm, setShowForm] = useState(null);
  const [quizSeed, setQuizSeed] = useState(null);

  const fetchGardens = useCallback(async () => {
    try {
      const r = await fetch('/api/gardens');
      const data = await r.json();
      if (Array.isArray(data)) setGardens(data);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchGardens(); }, [fetchGardens]);

  const loadSeeds = async (gardenId) => {
    if (seeds[gardenId]) return;
    try {
      const r = await fetch(`/api/gardens/${gardenId}/seeds`);
      const data = await r.json();
      if (Array.isArray(data)) setSeeds(prev => ({ ...prev, [gardenId]: data }));
    } catch {}
  };

  const handleDelete = async (type, id) => {
    if (!type || !id) return;
    try {
      await fetch('/api/admin/cms/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': adminToken },
        body: JSON.stringify({ type, id })
      });
      if (type === 'garden') setGardens(prev => prev.filter(g => g.id !== id));
      else setSeeds(prev => ({ ...prev, [expandedGarden]: (prev[expandedGarden] || []).filter(s => s.id !== id) }));
    } catch {}
  };

  const handleSave = async (data) => {
    try {
      await fetch('/api/admin/cms/gardens', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-token': adminToken }, body: JSON.stringify(data)
      });
      setShowForm(null); setEditGarden(null); fetchGardens();
      if (onGardensChange) onGardensChange();
    } catch {}
  };

  const handleSaveSeed = async (data) => {
    try {
      await fetch('/api/admin/cms/seeds', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-token': adminToken }, body: JSON.stringify(data)
      });
      setShowForm(null); setEditSeed(null);
      if (data.gardenId) { setSeeds(prev => ({ ...prev, [data.gardenId]: undefined })); loadSeeds(data.gardenId); }
    } catch {}
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{tr(lang, 'Gardens & Seeds', 'الحدائق والبذور', 'Bahçeler ve Tohumlar')}</span>
        <button onClick={() => { setEditGarden(null); setShowForm('garden'); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-xs text-purple-300 transition-all">
          <Plus className="w-3.5 h-3.5" /> {tr(lang, 'New Garden', 'حديقة جديدة', 'Yeni Bahçe')}
        </button>
      </div>

      <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
        {gardens.length === 0 && <EmptyState icon={BookOpen} text={tr(lang, 'No gardens found', 'لا توجد حدائق', 'Bahçe bulunamadı')} />}
        {gardens.map(g => (
          <div key={g.id} className="bg-[#0e1424] rounded-xl border border-purple-500/10 overflow-hidden">
            <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-white/[0.02] transition-colors"
              onClick={() => { if (expandedGarden === g.id) { setExpandedGarden(null); } else { setExpandedGarden(g.id); loadSeeds(g.id); } }}>
              <div className="flex items-center gap-3 min-w-0">
                <BookOpen className="w-4 h-4 text-purple-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-300 truncate">{g.titleEn || g.titleAr}</p>
                  <p className="text-[10px] text-gray-600">{g.category || 'General'} • {g.priceEGP} EGP / {g.priceTRY} TRY</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] text-gray-600 bg-[#090D16] px-2 py-0.5 rounded-lg">{g.rating || '5.0'}</span>
                <button onClick={(e) => { e.stopPropagation(); setEditGarden(g); setShowForm('garden'); }}
                  className="p-1 rounded hover:bg-purple-500/10 transition-colors"><Settings className="w-3 h-3 text-gray-500" /></button>
                <button onClick={(e) => { e.stopPropagation(); handleDelete('garden', g.id); }}
                  className="p-1 rounded hover:bg-red-500/10 transition-colors"><Trash2 className="w-3 h-3 text-red-400/60" /></button>
              </div>
            </div>
            {expandedGarden === g.id && (
              <div className="border-t border-purple-500/5 px-3 py-2 space-y-1.5">
                {(() => {
                  const grouped = {};
                  (seeds[g.id] || []).forEach(s => {
                    const sec = s.section || 'General';
                    if (!grouped[sec]) grouped[sec] = [];
                    grouped[sec].push(s);
                  });
                  return Object.entries(grouped).map(([secName, secSeeds]) => (
                    <div key={secName}>
                      <p className="text-[9px] text-purple-500/60 font-mono uppercase tracking-wider px-1 py-1.5">{secName}</p>
                      {secSeeds.map(s => (
                        <div key={s.id} className="flex items-center justify-between bg-[#090D16] rounded-lg px-3 py-2 mb-1">
                          <div className="min-w-0">
                            <p className="text-[11px] text-gray-400 truncate">{s.titleEn || s.titleAr}</p>
                            <p className="text-[10px] text-gray-700">{s.duration} • {(s.tags || []).join(', ')}</p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button onClick={(e) => { e.stopPropagation(); setQuizSeed(s); }}
                              className="p-1 rounded hover:bg-purple-500/10" title="Add Quiz"><BrainCircuit className="w-3 h-3 text-cyan-400" /></button>
                            <button onClick={() => { setEditSeed(s); setShowForm('seed'); }}
                              className="p-1 rounded hover:bg-purple-500/10"><Settings className="w-3 h-3 text-gray-600" /></button>
                            <button onClick={() => handleDelete('seed', s.id)}
                              className="p-1 rounded hover:bg-red-500/10"><Trash2 className="w-3 h-3 text-red-400/60" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ));
                })()}
                {(seeds[g.id] || []).length === 0 && <p className="text-[10px] text-gray-700 text-center py-2">{tr(lang, 'No seeds', 'لا توجد بذور', 'Tohum yok')}</p>}
                <button onClick={() => { setEditSeed(null); setEditGarden(g); setShowForm('seed'); }}
                  className="w-full py-1.5 text-[10px] text-purple-500/60 hover:text-purple-400 border border-dashed border-purple-500/20 rounded-lg transition-colors">
                  + {tr(lang, 'Add Seed', 'إضافة بذرة', 'Tohum Ekle')}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {showForm === 'garden' && (
        <GardenForm garden={editGarden} onSave={handleSave} onClose={() => { setShowForm(null); setEditGarden(null); }} lang={lang} />
      )}
      {showForm === 'seed' && (
        <SeedForm seed={editSeed} gardenId={editGarden?.id} onSave={handleSaveSeed} onClose={() => { setShowForm(null); setEditSeed(null); }} lang={lang} />
      )}
      {quizSeed && <QuizForm seed={quizSeed} adminToken={adminToken} lang={lang} onClose={() => setQuizSeed(null)} />}
    </div>
  );
}

function GardenForm({ garden, onSave, onClose, lang }) {
  const [titleEn, setTitleEn] = useState(garden?.titleEn || '');
  const [titleAr, setTitleAr] = useState(garden?.titleAr || '');
  const [titleTr, setTitleTr] = useState(garden?.titleTr || '');
  const [descEn, setDescEn] = useState(garden?.descriptionEn || '');
  const [descAr, setDescAr] = useState(garden?.descriptionAr || '');
  const [descTr, setDescTr] = useState(garden?.descriptionTr || '');
  const [category, setCategory] = useState(garden?.category || '');
  const [priceEGP, setPriceEGP] = useState(garden?.priceEGP || '');
  const [priceTRY, setPriceTRY] = useState(garden?.priceTRY || '');
  const [image, setImage] = useState(garden?.image || '');
  const [imagePreview, setImagePreview] = useState(garden?.image || '');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleImagePick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    fetch('/api/upload', { method: 'POST', body: formData })
      .then(r => r.json())
      .then(data => {
        if (data.success && data.url) {
          setImage(data.url);
          setImagePreview(data.url);
        }
      })
      .catch(() => {
        setImagePreview(garden?.image || '');
      })
      .finally(() => setUploading(false));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ id: garden?.id, titleEn, titleAr, titleTr, descriptionEn: descEn, descriptionAr: descAr, descriptionTr: descTr, category, priceEGP: Number(priceEGP), priceTRY: Number(priceTRY), image });
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-[#131B2E] border border-purple-500/20 rounded-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">{garden ? tr(lang, 'Edit Garden', 'تعديل الحديقة', 'Bahçeyi Düzenle') : tr(lang, 'New Garden', 'حديقة جديدة', 'Yeni Bahçe')}</span>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/5"><X className="w-4 h-4 text-gray-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-[10px] text-purple-300 font-mono uppercase block mb-1">{tr(lang, 'Title (English)', 'العنوان (إنجليزي)', 'Başlık (İngilizce)')}</label>
            <input value={titleEn} onChange={e => setTitleEn(e.target.value)}
              className="w-full bg-[#090D16] border border-purple-500/20 text-xs text-white px-3 py-2 rounded-xl outline-none focus:border-purple-400 transition-colors" />
          </div>
          <div>
            <label className="text-[10px] text-purple-300 font-mono uppercase block mb-1">{tr(lang, 'Title (Arabic)', 'العنوان (عربي)', 'Başlık (Arapça)')}</label>
            <input value={titleAr} onChange={e => setTitleAr(e.target.value)}
              className="w-full bg-[#090D16] border border-purple-500/20 text-xs text-white px-3 py-2 rounded-xl outline-none focus:border-purple-400 transition-colors" />
          </div>
          <div>
            <label className="text-[10px] text-purple-300 font-mono uppercase block mb-1">{tr(lang, 'Title (Turkish)', 'العنوان (تركي)', 'Başlık (Türkçe)')}</label>
            <input value={titleTr} onChange={e => setTitleTr(e.target.value)}
              className="w-full bg-[#090D16] border border-purple-500/20 text-xs text-white px-3 py-2 rounded-xl outline-none focus:border-purple-400 transition-colors" />
          </div>
          <div>
            <label className="text-[10px] text-purple-300 font-mono uppercase block mb-1">{tr(lang, 'Description (English)', 'الوصف (إنجليزي)', 'Açıklama (İngilizce)')}</label>
            <textarea value={descEn} onChange={e => setDescEn(e.target.value)}
              className="w-full bg-[#090D16] border border-purple-500/20 text-xs text-white px-3 py-2 rounded-xl outline-none focus:border-purple-400 transition-colors resize-none h-16" />
          </div>
          <div>
            <label className="text-[10px] text-purple-300 font-mono uppercase block mb-1">{tr(lang, 'Description (Arabic)', 'الوصف (عربي)', 'Açıklama (Arapça)')}</label>
            <textarea value={descAr} onChange={e => setDescAr(e.target.value)}
              className="w-full bg-[#090D16] border border-purple-500/20 text-xs text-white px-3 py-2 rounded-xl outline-none focus:border-purple-400 transition-colors resize-none h-16" />
          </div>
          <div>
            <label className="text-[10px] text-purple-300 font-mono uppercase block mb-1">{tr(lang, 'Description (Turkish)', 'الوصف (تركي)', 'Açıklama (Türkçe)')}</label>
            <textarea value={descTr} onChange={e => setDescTr(e.target.value)}
              className="w-full bg-[#090D16] border border-purple-500/20 text-xs text-white px-3 py-2 rounded-xl outline-none focus:border-purple-400 transition-colors resize-none h-16" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-purple-300 font-mono uppercase block mb-1">{tr(lang, 'Category', 'الفئة', 'Kategori')}</label>
              <input value={category} onChange={e => setCategory(e.target.value)}
                className="w-full bg-[#090D16] border border-purple-500/20 text-xs text-white px-3 py-2 rounded-xl outline-none focus:border-purple-400 transition-colors" />
            </div>
            <div>
              <label className="text-[10px] text-purple-300 font-mono uppercase block mb-1">{tr(lang, 'Image', 'الصورة', 'Resim')}</label>
              <div className="flex gap-2">
                <input value={image} onChange={e => { setImage(e.target.value); setImagePreview(e.target.value); }}
                  className="flex-1 bg-[#090D16] border border-purple-500/20 text-xs text-white px-3 py-2 rounded-xl outline-none focus:border-purple-400 transition-colors" placeholder={tr(lang, 'Image URL or upload', 'رابط الصورة أو رفع', 'Resim URL veya yükle')} />
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-2 bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/30 text-xs text-purple-300 rounded-xl transition-colors shrink-0">
                  {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : tr(lang, 'Browse', 'تصفح', 'Gözat')}
                </button>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImagePick} className="hidden" />
              {imagePreview && (
                <div className="mt-2 rounded-xl overflow-hidden border border-purple-500/10 bg-[#090D16]">
                  <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover" onError={() => setImagePreview(null)} />
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-purple-300 font-mono uppercase block mb-1">{tr(lang, 'Price EGP', 'السعر EGP', 'Fiyat EGP')}</label>
              <input type="number" value={priceEGP} onChange={e => setPriceEGP(e.target.value)}
                className="w-full bg-[#090D16] border border-purple-500/20 text-xs text-white px-3 py-2 rounded-xl outline-none focus:border-purple-400 transition-colors" />
            </div>
            <div>
              <label className="text-[10px] text-purple-300 font-mono uppercase block mb-1">{tr(lang, 'Price TRY', 'السعر TRY', 'Fiyat TRY')}</label>
              <input type="number" value={priceTRY} onChange={e => setPriceTRY(e.target.value)}
                className="w-full bg-[#090D16] border border-purple-500/20 text-xs text-white px-3 py-2 rounded-xl outline-none focus:border-purple-400 transition-colors" />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="submit" className="flex-1 py-2 bg-gradient-to-tr from-purple-600 to-cyan-500 text-white font-bold text-xs rounded-xl hover:shadow-lg hover:shadow-purple-500/20 active:scale-[0.98] transition-all">
              {garden ? tr(lang, 'Update Garden', 'تحديث الحديقة', 'Bahçeyi Güncelle') : tr(lang, 'Create Garden', 'إنشاء حديقة', 'Bahçe Oluştur')}
            </button>
            <button type="button" onClick={onClose} className="px-4 py-2 bg-[#090D16] border border-purple-500/20 text-xs text-gray-400 rounded-xl hover:text-gray-300 hover:border-purple-500/40 transition-colors">{tr(lang, 'Cancel', 'إلغاء', 'İptal')}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SeedForm({ seed, gardenId, onSave, onClose, lang }) {
  const [titleEn, setTitleEn] = useState(seed?.titleEn || '');
  const [titleAr, setTitleAr] = useState(seed?.titleAr || '');
  const [titleTr, setTitleTr] = useState(seed?.titleTr || '');
  const [gId, setGId] = useState(seed?.gardenId || gardenId || '');
  const [duration, setDuration] = useState(seed?.duration || '30:00');
  const [videoUrl, setVideoUrl] = useState(seed?.videoUrl || '');
  const [section, setSection] = useState(seed?.section || '');
  const [sortOrder, setSortOrder] = useState(seed?.sortOrder ?? 0);
  const [tags, setTags] = useState((seed?.tags || []).join(', '));
  const [videoUploading, setVideoUploading] = useState(false);
  const videoInputRef = useRef(null);

  const handleVideoPick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    fetch('/api/upload', { method: 'POST', body: formData })
      .then(r => r.json())
      .then(data => {
        if (data.success && data.url) setVideoUrl(data.url);
      })
      .catch(() => {})
      .finally(() => setVideoUploading(false));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ id: seed?.id, gardenId: gId, titleEn, titleAr, titleTr, duration, videoUrl, section, sortOrder, tags: tags.split(',').map(t => t.trim()).filter(Boolean) });
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-[#131B2E] border border-purple-500/20 rounded-2xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">{seed ? tr(lang, 'Edit Seed', 'تعديل البذرة', 'Tohumu Düzenle') : tr(lang, 'New Seed', 'بذرة جديدة', 'Yeni Tohum')}</span>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/5"><X className="w-4 h-4 text-gray-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-[10px] text-purple-300 font-mono uppercase block mb-1">{tr(lang, 'Garden ID', 'معرف الحديقة', 'Bahçe ID')}</label>
            <input value={gId} onChange={e => setGId(e.target.value)}
              className="w-full bg-[#090D16] border border-purple-500/20 text-xs text-white px-3 py-2 rounded-xl outline-none focus:border-purple-400 transition-colors" />
          </div>
          <div>
            <label className="text-[10px] text-purple-300 font-mono uppercase block mb-1">{tr(lang, 'Title (English)', 'العنوان (إنجليزي)', 'Başlık (İngilizce)')}</label>
            <input value={titleEn} onChange={e => setTitleEn(e.target.value)}
              className="w-full bg-[#090D16] border border-purple-500/20 text-xs text-white px-3 py-2 rounded-xl outline-none focus:border-purple-400 transition-colors" />
          </div>
          <div>
            <label className="text-[10px] text-purple-300 font-mono uppercase block mb-1">{tr(lang, 'Title (Arabic)', 'العنوان (عربي)', 'Başlık (Arapça)')}</label>
            <input value={titleAr} onChange={e => setTitleAr(e.target.value)}
              className="w-full bg-[#090D16] border border-purple-500/20 text-xs text-white px-3 py-2 rounded-xl outline-none focus:border-purple-400 transition-colors" />
          </div>
          <div>
            <label className="text-[10px] text-purple-300 font-mono uppercase block mb-1">{tr(lang, 'Title (Turkish)', 'العنوان (تركي)', 'Başlık (Türkçe)')}</label>
            <input value={titleTr} onChange={e => setTitleTr(e.target.value)}
              className="w-full bg-[#090D16] border border-purple-500/20 text-xs text-white px-3 py-2 rounded-xl outline-none focus:border-purple-400 transition-colors" />
          </div>
          <div>
            <label className="text-[10px] text-purple-300 font-mono uppercase block mb-1">{tr(lang, 'Section', 'القسم', 'Bölüm')}</label>
            <input value={section} onChange={e => setSection(e.target.value)}
              className="w-full bg-[#090D16] border border-purple-500/20 text-xs text-white px-3 py-2 rounded-xl outline-none focus:border-purple-400 transition-colors" placeholder={tr(lang, 'e.g. Introduction, Chapter 1, Basics', 'مثال: مقدمة، فصل 1، أساسيات', 'Örn: Giriş, Bölüm 1, Temel')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-purple-300 font-mono uppercase block mb-1">{tr(lang, 'Sort Order', 'ترتيب الفرز', 'Sıralama')}</label>
              <input type="number" value={sortOrder} onChange={e => setSortOrder(Number(e.target.value))}
                className="w-full bg-[#090D16] border border-purple-500/20 text-xs text-white px-3 py-2 rounded-xl outline-none focus:border-purple-400 transition-colors" />
            </div>
            <div>
              <label className="text-[10px] text-purple-300 font-mono uppercase block mb-1">{tr(lang, 'Duration', 'المدة', 'Süre')}</label>
              <input value={duration} onChange={e => setDuration(e.target.value)}
                className="w-full bg-[#090D16] border border-purple-500/20 text-xs text-white px-3 py-2 rounded-xl outline-none focus:border-purple-400 transition-colors" />
            </div>
          </div>
          <div>
            <label className="text-[10px] text-purple-300 font-mono uppercase block mb-1">{tr(lang, 'Video URL', 'رابط الفيديو', 'Video URL')}</label>
            <div className="flex gap-2">
              <input value={videoUrl} onChange={e => setVideoUrl(e.target.value)}
                className="flex-1 bg-[#090D16] border border-purple-500/20 text-xs text-white px-3 py-2 rounded-xl outline-none focus:border-purple-400 transition-colors" placeholder={tr(lang, 'Video URL or upload', 'رابط الفيديو أو رفع', 'Video URL veya yükle')} />
              <button type="button" onClick={() => videoInputRef.current?.click()}
                className="px-3 py-2 bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/30 text-xs text-purple-300 rounded-xl transition-colors shrink-0">
                {videoUploading ? <Loader2 className="w-3 h-3 animate-spin" /> : tr(lang, 'Browse', 'تصفح', 'Gözat')}
              </button>
            </div>
            <input ref={videoInputRef} type="file" accept="video/*" onChange={handleVideoPick} className="hidden" />
          </div>
          <div>
            <label className="text-[10px] text-purple-300 font-mono uppercase block mb-1">{tr(lang, 'Tags (comma separated)', 'الوسوم (مفصولة بفواصل)', 'Etiketler (virgülle ayır)')}</label>
            <input value={tags} onChange={e => setTags(e.target.value)}
              className="w-full bg-[#090D16] border border-purple-500/20 text-xs text-white px-3 py-2 rounded-xl outline-none focus:border-purple-400 transition-colors" />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="submit" className="flex-1 py-2 bg-gradient-to-tr from-purple-600 to-cyan-500 text-white font-bold text-xs rounded-xl hover:shadow-lg hover:shadow-purple-500/20 active:scale-[0.98] transition-all">
              {seed ? tr(lang, 'Update Seed', 'تحديث البذرة', 'Tohumu Güncelle') : tr(lang, 'Create Seed', 'إنشاء بذرة', 'Tohum Oluştur')}
            </button>
            <button type="button" onClick={onClose} className="px-4 py-2 bg-[#090D16] border border-purple-500/20 text-xs text-gray-400 rounded-xl hover:text-gray-300 hover:border-purple-500/40 transition-colors">{tr(lang, 'Cancel', 'إلغاء', 'İptal')}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function QuizForm({ seed, adminToken, lang, onClose }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [questionEn, setQuestionEn] = useState('');
  const [questionAr, setQuestionAr] = useState('');
  const [questionTr, setQuestionTr] = useState('');
  const [optionEn, setOptionEn] = useState(['', '', '', '']);
  const [optionAr, setOptionAr] = useState(['', '', '', '']);
  const [optionTr, setOptionTr] = useState(['', '', '', '']);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [timestamp, setTimestamp] = useState('0');
  const [saving, setSaving] = useState(false);

  const fetchQuestions = useCallback(async () => {
    try {
      const r = await fetch(`/api/quiz_questions?seedId=${seed.id}`);
      const data = await r.json();
      if (Array.isArray(data)) setQuestions(data);
    } catch {} finally { setLoading(false); }
  }, [seed.id]);

  useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (!questionEn.trim()) return;
    setSaving(true);
    try {
      await fetch('/api/admin/quiz_questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': adminToken },
        body: JSON.stringify({
          seedId: seed.id,
          timestamp: Number(timestamp),
          questionEn: questionEn.trim(),
          questionAr: questionAr.trim() || questionEn.trim(),
          questionTr: questionTr.trim() || questionEn.trim(),
          optionsEn: optionEn,
          optionsAr: optionAr.some(o => o.trim()) ? optionAr : optionEn,
          optionsTr: optionTr.some(o => o.trim()) ? optionTr : optionEn,
          correctIndex
        })
      });
      setQuestionEn(''); setQuestionAr(''); setQuestionTr('');
      setOptionEn(['', '', '', '']); setOptionAr(['', '', '', '']); setOptionTr(['', '', '', '']);
      setCorrectIndex(0); setTimestamp('0');
      fetchQuestions();
    } catch {} finally { setSaving(false); }
  };

  const handleDeleteQuestion = async (qId) => {
    try {
      await fetch('/api/admin/quiz_questions/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': adminToken },
        body: JSON.stringify({ id: qId })
      });
      fetchQuestions();
    } catch {}
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-[#131B2E] border border-purple-500/20 rounded-2xl p-6 w-full max-w-2xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">{tr(lang, 'Quiz Questions', 'أسئلة الاختبار', 'Sınav Soruları')} — {seed.titleEn || seed.titleAr}</span>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/5"><X className="w-4 h-4 text-gray-500" /></button>
        </div>

        {loading ? <LoadingSpinner /> : (
          <>
            <div className="space-y-2 mb-4 max-h-[30vh] overflow-y-auto pr-1">
              {questions.length === 0 && <p className="text-[10px] text-gray-600 text-center py-4">{tr(lang, 'No quiz questions for this seed', 'لا توجد أسئلة اختبار لهذه البذرة', 'Bu tohum için sınav sorusu yok')}</p>}
              {questions.map((q, i) => (
                <div key={q.id} className="bg-[#0e1424] rounded-xl p-3 border border-purple-500/10">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-300"><span className="text-purple-400">#{i + 1}</span> {q.questionEn || q.questionAr}</p>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {(q.optionsEn || []).map((opt, oi) => (
                          <span key={oi} className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${oi === q.correctIndex ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-[#090D16] text-gray-500 border border-purple-500/10'}`}>
                            {opt}
                          </span>
                        ))}
                      </div>
                      <p className="text-[9px] text-gray-700 mt-1">Timestamp: {q.timestamp}s</p>
                    </div>
                    <button onClick={() => handleDeleteQuestion(q.id)} className="p-1 rounded hover:bg-red-500/10 shrink-0">
                      <Trash2 className="w-3 h-3 text-red-400/60" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddQuestion} className="space-y-3 border-t border-purple-500/10 pt-4">
              <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">{tr(lang, 'Add New Question', 'إضافة سؤال جديد', 'Yeni Soru Ekle')}</p>
              <div>
                <label className="text-[9px] text-purple-300 font-mono uppercase block mb-1">{tr(lang, 'Question (English)', 'السؤال (إنجليزي)', 'Soru (İngilizce)')}</label>
                <input value={questionEn} onChange={e => setQuestionEn(e.target.value)}
                  className="w-full bg-[#090D16] border border-purple-500/20 text-xs text-white px-3 py-2 rounded-xl outline-none focus:border-purple-400 transition-colors" placeholder={tr(lang, 'What is...', 'ما هو...', 'Nedir...')} />
              </div>
              <div>
                <label className="text-[9px] text-purple-300 font-mono uppercase block mb-1">{tr(lang, 'Question (Arabic)', 'السؤال (عربي)', 'Soru (Arapça)')}</label>
                <input value={questionAr} onChange={e => setQuestionAr(e.target.value)}
                  className="w-full bg-[#090D16] border border-purple-500/20 text-xs text-white px-3 py-2 rounded-xl outline-none focus:border-purple-400 transition-colors" />
              </div>
              <div>
                <label className="text-[9px] text-purple-300 font-mono uppercase block mb-1">{tr(lang, 'Question (Turkish)', 'السؤال (تركي)', 'Soru (Türkçe)')}</label>
                <input value={questionTr} onChange={e => setQuestionTr(e.target.value)}
                  className="w-full bg-[#090D16] border border-purple-500/20 text-xs text-white px-3 py-2 rounded-xl outline-none focus:border-purple-400 transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] text-purple-300 font-mono uppercase block mb-1">{tr(lang, 'Timestamp (seconds)', 'الطابع الزمني (ثوان)', 'Zaman Damgası (saniye)')}</label>
                  <input type="number" value={timestamp} onChange={e => setTimestamp(e.target.value)}
                    className="w-full bg-[#090D16] border border-purple-500/20 text-xs text-white px-3 py-2 rounded-xl outline-none focus:border-purple-400 transition-colors" />
                </div>
                <div>
                  <label className="text-[9px] text-purple-300 font-mono uppercase block mb-1">{tr(lang, 'Correct Answer', 'الإجابة الصحيحة', 'Doğru Cevap')}</label>
                  <select value={correctIndex} onChange={e => setCorrectIndex(Number(e.target.value))}
                    className="w-full bg-[#090D16] border border-purple-500/20 text-xs text-white px-3 py-2 rounded-xl outline-none focus:border-purple-400 transition-colors">
                    {[0, 1, 2, 3].map(i => <option key={i} value={i}>{tr(lang, `Option ${i + 1}`, `خيار ${i + 1}`, `Seçenek ${i + 1}`)}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] text-purple-300 font-mono uppercase block mb-1">{tr(lang, 'Options (English)', 'الخيارات (إنجليزي)', 'Seçenekler (İngilizce)')}</label>
                {[0, 1, 2, 3].map(i => (
                  <input key={i} value={optionEn[i]} onChange={e => { const o = [...optionEn]; o[i] = e.target.value; setOptionEn(o); }}
                    placeholder={tr(lang, `Option ${i + 1}`, `خيار ${i + 1}`, `Seçenek ${i + 1}`)}
                    className="w-full bg-[#090D16] border border-purple-500/20 text-xs text-white px-3 py-1.5 rounded-xl outline-none focus:border-purple-400 transition-colors mb-1" />
                ))}
              </div>
              <details className="text-[10px] text-gray-500 group">
                <summary className="cursor-pointer hover:text-gray-300 transition-colors">{tr(lang, 'Arabic / Turkish options', 'الخيارات العربية / التركية', 'Arapça / Türkçe seçenekler')}</summary>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[8px] text-gray-600 font-mono">{tr(lang, 'Arabic', 'العربية', 'Arapça')}</label>
                    {[0, 1, 2, 3].map(i => (
                      <input key={i} value={optionAr[i]} onChange={e => { const o = [...optionAr]; o[i] = e.target.value; setOptionAr(o); }}
                        placeholder={`خيار ${i + 1}`}
                        className="w-full bg-[#090D16] border border-purple-500/20 text-xs text-white px-3 py-1.5 rounded-xl outline-none focus:border-purple-400 transition-colors mb-1" />
                    ))}
                  </div>
                  <div>
                    <label className="text-[8px] text-gray-600 font-mono">{tr(lang, 'Turkish', 'التركية', 'Türkçe')}</label>
                    {[0, 1, 2, 3].map(i => (
                      <input key={i} value={optionTr[i]} onChange={e => { const o = [...optionTr]; o[i] = e.target.value; setOptionTr(o); }}
                        placeholder={`Seçenek ${i + 1}`}
                        className="w-full bg-[#090D16] border border-purple-500/20 text-xs text-white px-3 py-1.5 rounded-xl outline-none focus:border-purple-400 transition-colors mb-1" />
                    ))}
                  </div>
                </div>
              </details>
              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={saving || !questionEn.trim()}
                  className="flex-1 py-2 bg-gradient-to-tr from-purple-600 to-cyan-500 text-white font-bold text-xs rounded-xl hover:scale-[1.01] transition-all disabled:opacity-50">
                  {saving ? tr(lang, 'Saving...', 'جاري الحفظ...', 'Kaydediliyor...') : tr(lang, 'Add Question', 'إضافة سؤال', 'Soru Ekle')}
                </button>
                <button type="button" onClick={onClose} className="px-4 py-2 bg-[#090D16] border border-purple-500/20 text-xs text-gray-400 rounded-xl hover:text-gray-300 transition-colors">{tr(lang, 'Close', 'إغلاق', 'Kapat')}</button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function PaymentsTab({ adminToken, lang }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [previewImage, setPreviewImage] = useState(null);

  const fetchPayments = useCallback(async () => {
    try {
      const r = await fetch('/api/admin/payments', { headers: { 'x-admin-token': adminToken } });
      const data = await r.json();
      if (Array.isArray(data)) setPayments(data);
    } catch {} finally { setLoading(false); }
  }, [adminToken]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await fetch('/api/admin/payments/approve', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-token': adminToken },
        body: JSON.stringify({ transactionId: id })
      });
      fetchPayments();
    } catch {} finally { setActionLoading(null); }
  };

  const handleReject = async (id) => {
    if (!rejectReason.trim()) return;
    setActionLoading(id);
    try {
      await fetch('/api/admin/payments/reject', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-token': adminToken },
        body: JSON.stringify({ transactionId: id, reason: rejectReason.trim() })
      });
      setRejectingId(null);
      setRejectReason('');
      fetchPayments();
    } catch {} finally { setActionLoading(null); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{tr(lang, 'Transaction History', 'سجل المعاملات', 'İşlem Geçmişi')}</span>
        <button onClick={fetchPayments} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
          <RefreshCw className="w-3.5 h-3.5 text-gray-500" />
        </button>
      </div>
      <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
        {payments.length === 0 && <EmptyState icon={CreditCard} text={tr(lang, 'No transactions found', 'لا توجد معاملات', 'İşlem bulunamadı')} />}
        {payments.map(p => (
          <div key={p.id} className="bg-[#0e1424] rounded-xl p-3 border border-purple-500/10 hover:border-purple-500/20 transition-colors">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-gray-300 truncate">{p.userEmail || tr(lang, 'Unknown', 'غير معروف', 'Bilinmiyor')}</p>
                <p className="text-[10px] text-gray-600">{p.currency} {Number(p.amount).toFixed(2)} • {p.gateway === 'instapay' ? tr(lang, 'InstaPay', 'إنستاباي', 'InstaPay') : p.gateway || tr(lang, 'N/A', 'غير متوفر', 'Yok')}</p>
                <p className="text-[10px] text-gray-600">{p.paymentMethod?.startsWith('instapay:') ? `📱 ${p.paymentMethod.split(':')[1]}` : p.paymentMethod}</p>
                <p className="text-[10px] text-gray-700">{tr(lang, 'ID:', 'المعرف:', 'ID:')} {p.id?.slice(0, 16)}...</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-lg ${
                  p.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                  p.status === 'rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                  'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}>{p.status === 'approved' ? tr(lang, 'Approved', 'مقبول', 'Onaylandı') : p.status === 'rejected' ? tr(lang, 'Rejected', 'مرفوض', 'Reddedildi') : tr(lang, 'Pending', 'معلق', 'Beklemede')}</span>
              </div>
            </div>
            {p.status === 'pending' && (
              <div className="mt-3 pt-2 border-t border-purple-500/5">
                {rejectingId === p.id ? (
                  <div className="flex flex-col gap-2">
                    <textarea
                      value={rejectReason}
                      onChange={e => setRejectReason(e.target.value)}
                      placeholder={tr(lang, 'Reason for rejection...', 'سبب الرفض...', 'Reddetme sebebi...')}
                      className="w-full bg-[#0a0f1e] border border-red-500/30 rounded-lg p-2 text-xs text-gray-300 placeholder-gray-600 resize-none focus:outline-none focus:border-red-500/50"
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <button onClick={() => handleReject(p.id)} disabled={actionLoading === p.id || !rejectReason.trim()}
                        className="flex items-center gap-1 px-3 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-[10px] text-red-400 transition-all disabled:opacity-30">
                        {actionLoading === p.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />} {tr(lang, 'Confirm Reject', 'تأكيد الرفض', 'Reddi Onayla')}
                      </button>
                      <button onClick={() => { setRejectingId(null); setRejectReason(''); }}
                        className="px-3 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 text-[10px] text-gray-400 transition-all">
                        {tr(lang, 'Cancel', 'إلغاء', 'İptal')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => handleApprove(p.id)} disabled={actionLoading === p.id}
                      className="flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-[10px] text-emerald-400 transition-all disabled:opacity-30">
                      {actionLoading === p.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />} {tr(lang, 'Approve', 'موافقة', 'Onayla')}
                    </button>
                    <button onClick={() => { setRejectingId(p.id); setRejectReason(''); }} disabled={actionLoading === p.id}
                      className="flex items-center gap-1 px-3 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-[10px] text-red-400 transition-all disabled:opacity-30">
                      {actionLoading === p.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />} {tr(lang, 'Reject', 'رفض', 'Reddet')}
                    </button>
                  </div>
                )}
              </div>
            )}
            {p.screenshot && (
              <div className="mt-2">
                <button onClick={() => setPreviewImage(p.screenshot)}
                  className="text-[10px] text-cyan-500/60 hover:text-cyan-400 underline bg-transparent border-none cursor-pointer">
                  {tr(lang, 'View Proof', 'عرض الإثبات', 'Kanıtı Gör')}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {previewImage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-3xl max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <button onClick={() => setPreviewImage(null)}
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-red-500/20 hover:bg-red-500/40 border border-red-500/30 text-red-400 flex items-center justify-center text-sm z-10 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
            <img src={previewImage} alt="Payment proof" className="max-w-full max-h-[85vh] rounded-xl border border-purple-500/20 object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}

function UsersTab({ adminToken, lang }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toggling, setToggling] = useState(null);
  const [toggleInput, setToggleInput] = useState({ userId: null, gardenId: '' });

  const fetchUsers = useCallback(async () => {
    try {
      const r = await fetch('/api/admin/users', { headers: { 'x-admin-token': adminToken } });
      const data = await r.json();
      if (Array.isArray(data)) setUsers(data);
    } catch {} finally { setLoading(false); }
  }, [adminToken]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const togglePaid = async (userId, currentGardens, gardenId) => {
    if (!gardenId.trim()) return;
    setToggling(userId);
    const gId = gardenId.trim();
    const updated = currentGardens?.includes(gId)
      ? (currentGardens || []).filter(id => id !== gId)
      : [...(currentGardens || []), gId];
    try {
      await fetch('/api/admin/users/toggle-paid', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-token': adminToken },
        body: JSON.stringify({ userId, paidGardens: updated })
      });
      fetchUsers();
      setToggleInput({ userId: null, gardenId: '' });
    } catch {} finally { setToggling(null); }
  };

  const filtered = users.filter(u =>
    !search || u.email?.toLowerCase().includes(search.toLowerCase()) || u.phone?.includes(search)
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 flex items-center gap-2 bg-[#0e1424] rounded-xl px-3 py-2 border border-purple-500/10">
          <Search className="w-3.5 h-3.5 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder={tr(lang, 'Search by email or phone...', 'ابحث بالبريد أو الهاتف...', 'E-posta veya telefon ile ara...')}
            className="flex-1 bg-transparent text-xs text-gray-300 placeholder-gray-600 focus:outline-none" />
        </div>
        <span className="text-[10px] text-gray-600 font-mono">{users.length} {tr(lang, 'users', 'مستخدم', 'kullanıcı')}</span>
      </div>
      <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
        {filtered.length === 0 && <EmptyState icon={Users} text={tr(lang, 'No users found', 'لا توجد مستخدمين', 'Kullanıcı bulunamadı')} />}
        {filtered.map(u => (
          <div key={u.id} className="bg-[#0e1424] rounded-xl p-3 border border-purple-500/10 hover:border-purple-500/20 transition-colors">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-gray-300 truncate">{u.email}</p>
                <p className="text-[10px] text-gray-600">{u.phone || tr(lang, 'No phone', 'لا يوجد هاتف', 'Telefon yok')} • ID: {u.id?.slice(0, 12)}...</p>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {(u.paidGardens || []).map(gId => (
                    <span key={gId} className="text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">{gId?.slice(0, 8)}</span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <span className={`text-[10px] px-2 py-0.5 rounded-lg ${u.isVerified ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                  {u.isVerified ? tr(lang, 'Verified', 'موثق', 'Doğrulandı') : tr(lang, 'Pending', 'معلق', 'Beklemede')}
                </span>
              </div>
            </div>
            {toggleInput.userId === u.id ? (
              <div className="mt-2 flex items-center gap-2">
                <input value={toggleInput.gardenId} onChange={e => setToggleInput(prev => ({ ...prev, gardenId: e.target.value }))}
                  placeholder={tr(lang, 'Enter Garden ID...', 'أدخل معرف الحديقة...', 'Bahçe ID girin...')}
                  className="flex-1 bg-[#090D16] border border-cyan-500/30 text-[10px] text-white px-2.5 py-1.5 rounded-lg outline-none focus:border-cyan-400 transition-colors placeholder-gray-700"
                  onKeyDown={e => { if (e.key === 'Enter') togglePaid(u.id, u.paidGardens || [], toggleInput.gardenId); }} autoFocus />
                <button onClick={() => togglePaid(u.id, u.paidGardens || [], toggleInput.gardenId)} disabled={toggling === u.id || !toggleInput.gardenId.trim()}
                  className="px-2.5 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 text-[10px] text-cyan-400 transition-all disabled:opacity-30">
                  {toggling === u.id ? <Loader2 className="w-3 h-3 animate-spin" /> : tr(lang, 'Apply', 'تطبيق', 'Uygula')}
                </button>
                <button onClick={() => setToggleInput({ userId: null, gardenId: '' })}
                  className="px-2.5 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 text-[10px] text-gray-400 transition-all">
                  {tr(lang, 'Cancel', 'إلغاء', 'İptal')}
                </button>
              </div>
            ) : (
              <button onClick={() => setToggleInput({ userId: u.id, gardenId: '' })} disabled={toggling === u.id}
                className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#090D16] border border-purple-500/10 hover:border-purple-500/30 text-[10px] text-purple-300 transition-all disabled:opacity-30">
                {toggling === u.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Unlock className="w-3 h-3" />} {tr(lang, 'Toggle Garden Access', 'تعديل وصول الحديقة', 'Bahçe Erişimini Değiştir')}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function AnalyticsTab({ adminToken, lang }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/admin/analytics', { headers: { 'x-admin-token': adminToken } });
        const data = await r.json();
        if (data.success) setStats(data);
      } catch {} finally { setLoading(false); }
    })();
  }, [adminToken]);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{tr(lang, 'Analytics Dashboard', 'لوحة التحليلات', 'Analiz Gösterge Paneli')}</span>
        <button onClick={() => setLoading(true)} className="p-1.5 rounded-lg hover:bg-white/5"><RefreshCw className="w-3.5 h-3.5 text-gray-500" /></button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: tr(lang, 'Total Users', 'إجمالي المستخدمين', 'Toplam Kullanıcı'), value: stats?.totalUsers || 0, icon: Users, color: 'text-purple-400', bg: 'from-purple-500/10 to-transparent' },
          { label: tr(lang, 'Active Now', 'النشطون الآن', 'Aktif Kullanıcılar'), value: stats?.activeConcurrentUsers || 0, icon: Zap, color: 'text-cyan-400', bg: 'from-cyan-500/10 to-transparent' },
          { label: tr(lang, 'Payments', 'المدفوعات', 'Ödemeler'), value: stats?.totalPayments || 0, icon: CreditCard, color: 'text-emerald-400', bg: 'from-emerald-500/10 to-transparent' },
          { label: tr(lang, 'EGP Revenue', 'إيرادات EGP', 'EGP Geliri'), value: `${stats?.totalEGP || 0} EGP`, icon: BarChart3, color: 'text-amber-400', bg: 'from-amber-500/10 to-transparent' },
          { label: tr(lang, 'TRY Revenue', 'إيرادات TRY', 'TRY Geliri'), value: `${stats?.totalTRY || 0} TRY`, icon: BarChart3, color: 'text-rose-400', bg: 'from-rose-500/10 to-transparent' },
        ].map((s, i) => (
          <div key={i} className="relative bg-[#0e1424] rounded-xl p-4 border border-purple-500/10 overflow-hidden group hover:border-purple-500/25 transition-colors">
            <div className={`absolute inset-0 bg-gradient-to-br ${s.bg} opacity-50`} />
            <div className="relative flex items-center justify-between mb-2">
              <span className="text-[10px] text-gray-600 font-medium">{s.label}</span>
              <div className={`p-1.5 rounded-lg bg-[#090D16] ${s.color} opacity-60`}>
                <s.icon className="w-3 h-3" />
              </div>
            </div>
            <p className={`relative text-lg font-extrabold tracking-tight ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AuditLogsTab({ adminToken, lang }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/admin/audit-logs', { headers: { 'x-admin-token': adminToken } });
        const data = await r.json();
        if (Array.isArray(data)) setLogs(data);
      } catch {} finally { setLoading(false); }
    })();
  }, [adminToken]);

  const filtered = logs.filter(l => !search || JSON.stringify(l).toLowerCase().includes(search.toLowerCase()));

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 flex items-center gap-2 bg-[#0e1424] rounded-xl px-3 py-2 border border-purple-500/10">
          <Search className="w-3.5 h-3.5 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={tr(lang, 'Search logs...', 'ابحث في السجلات...', 'Günlüklerde ara...')}
            className="flex-1 bg-transparent text-xs text-gray-300 placeholder-gray-600 focus:outline-none" />
        </div>
      </div>
      <div className="space-y-1.5 max-h-[60vh] overflow-y-auto pr-1">
        {filtered.length === 0 && <EmptyState icon={FileText} text={tr(lang, 'No audit logs found', 'لا توجد سجلات تدقيق', 'Denetim günlüğü bulunamadı')} />}
        {filtered.map((l, i) => (
          <div key={i} className="bg-[#0e1424] rounded-lg px-3 py-2 border border-purple-500/5">
            <p className="text-[10px] text-gray-400 font-mono">{l.timestamp || '—'} <span className="text-purple-400">{l.action || '—'}</span></p>
            <p className="text-[9px] text-gray-700 font-mono mt-0.5">{JSON.stringify(l.details || l)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function QueriesTab({ adminToken, lang }) {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [answerText, setAnswerText] = useState({});
  const [answering, setAnswering] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/admin/queries', { headers: { 'x-admin-token': adminToken } });
        const data = await r.json();
        if (Array.isArray(data)) setQueries(data);
      } catch {} finally { setLoading(false); }
    })();
  }, [adminToken]);

  const handleAnswer = async (queryId) => {
    if (!answerText[queryId]?.trim()) return;
    setAnswering(queryId);
    try {
      await fetch('/api/admin/queries/answer', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-token': adminToken },
        body: JSON.stringify({ queryId, text: answerText[queryId] })
      });
      setAnswerText(prev => ({ ...prev, [queryId]: '' }));
      setQueries(prev => prev.map(q => q.id === queryId ? { ...q, replies: [...(q.replies || []), { author: 'Admin', text: answerText[queryId], timestamp: new Date().toISOString() }] } : q));
    } catch {} finally { setAnswering(null); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center mb-4">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{tr(lang, 'Student Queries', 'استفسارات الطلاب', 'Öğrenci Soruları')}</span>
      </div>
      <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
        {queries.length === 0 && <EmptyState icon={MessageSquare} text={tr(lang, 'No pending queries', 'لا توجد استفسارات معلقة', 'Bekleyen soru yok')} />}
        {queries.map(q => (
          <div key={q.id} className="bg-[#0e1424] rounded-xl p-3 border border-purple-500/10">
            <div className="flex items-start gap-3">
              <MessageSquare className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-300">{q.text}</p>
                <p className="text-[10px] text-gray-600 mt-1">Seed: {q.seedId?.slice(0, 12)}... • {new Date(q.timestamp).toLocaleString()}</p>
                {(q.replies || []).map((r, i) => (
                  <div key={i} className="mt-2 pl-3 border-l-2 border-cyan-500/30">
                    <p className="text-[11px] text-cyan-300"><span className="text-[9px] text-cyan-600">{r.author}:</span> {r.text}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <input value={answerText[q.id] || ''} onChange={e => setAnswerText(prev => ({ ...prev, [q.id]: e.target.value }))}
                placeholder={tr(lang, 'Type answer...', 'اكتب الإجابة...', 'Cevap yaz...')}
                className="flex-1 bg-[#090D16] border border-purple-500/20 rounded-xl px-3 py-1.5 text-[11px] text-gray-300 placeholder-gray-600 focus:outline-none focus:border-purple-500/40"
                onKeyDown={e => e.key === 'Enter' && handleAnswer(q.id)} />
              <button onClick={() => handleAnswer(q.id)} disabled={answering === q.id || !answerText[q.id]?.trim()}
                className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 disabled:opacity-30 text-[10px] text-purple-300 transition-all">
                {answering === q.id ? <Loader2 className="w-3 h-3 animate-spin" /> : tr(lang, 'Reply', 'رد', 'Yanıtla')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuizDegreesTab({ adminToken, lang }) {
  const [degrees, setDegrees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchDegrees = useCallback(async () => {
    try {
      const r = await fetch('/api/admin/quiz-degrees', { headers: { 'x-admin-token': adminToken } });
      const data = await r.json();
      if (Array.isArray(data)) setDegrees(data);
    } catch {} finally { setLoading(false); }
  }, [adminToken]);

  useEffect(() => { fetchDegrees(); }, [fetchDegrees]);

  const filtered = degrees.filter(d =>
    !search || d.email?.toLowerCase().includes(search.toLowerCase()) || d.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 flex items-center gap-2 bg-[#0e1424] rounded-xl px-3 py-2 border border-purple-500/10">
          <Search className="w-3.5 h-3.5 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder={tr(lang, 'Search by email or name...', 'ابحث بالبريد أو الاسم...', 'E-posta veya isim ile ara...')}
            className="flex-1 bg-transparent text-xs text-gray-300 placeholder-gray-600 focus:outline-none" />
        </div>
        <span className="text-[10px] text-gray-600 font-mono">{degrees.length} {tr(lang, 'records', 'سجل', 'kayıt')}</span>
        <button onClick={() => { setLoading(true); fetchDegrees(); }} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
          <RefreshCw className="w-3.5 h-3.5 text-gray-500" />
        </button>
      </div>
      <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
        {filtered.length === 0 && <EmptyState icon={Trophy} text={tr(lang, 'No quiz records found', 'لا توجد سجلات اختبار', 'Sınav kaydı bulunamadı')} />}
        {filtered.map((d, i) => (
          <div key={d.userId || i} className="bg-[#0e1424] rounded-xl p-3 border border-purple-500/10">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
                  <p className="text-xs text-gray-300 truncate">{d.name || d.email || tr(lang, 'Unknown', 'غير معروف', 'Bilinmiyor')}</p>
                </div>
                <p className="text-[10px] text-gray-600 mt-1">{d.email || tr(lang, 'No email', 'لا يوجد بريد', 'E-posta yok')}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/20" title={tr(lang, 'Questions answered', 'الأسئلة المجاب عنها', 'Cevaplanan sorular')}>
                  {d.totalAnswered || 0} {tr(lang, 'Q', 'س', 'S')}
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-lg ${
                  (d.rate || 0) >= 80 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                  (d.rate || 0) >= 50 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                  'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                  {d.rate || 0}%
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-600 font-mono">
              <span className="text-emerald-500/60">{tr(lang, 'Correct', 'صحيح', 'Doğru')}: {d.correct || 0}/{d.totalAnswered || 0}</span>
              <span className="text-gray-700">•</span>
              <span className="text-red-500/60">{tr(lang, 'Wrong', 'خطأ', 'Yanlış')}: {d.wrong || 0}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminPanel({ lang, onClose, onGardensChange }) {
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('admin_token') || '');
  const [tokenValid, setTokenValid] = useState(null);
  const [tab, setTab] = useState('cms');
  const [adminUserInput, setAdminUserInput] = useState('');
  const [adminPassInput, setAdminPassInput] = useState('');
  const [adminLoginError, setAdminLoginError] = useState('');
  const [adminLoggingIn, setAdminLoggingIn] = useState(false);

  useEffect(() => {
    if (!adminToken) { setTokenValid(false); return; }
    fetch('/api/admin/users', { headers: { 'x-admin-token': adminToken } })
      .then(r => { if (r.status === 401) { localStorage.removeItem('admin_token'); setAdminToken(''); setTokenValid(false); } else { setTokenValid(true); } })
      .catch(() => { setTokenValid(true); });
  }, [adminToken]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAdminLoginError('');
    setAdminLoggingIn(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: adminUserInput, password: adminPassInput }),
      });
      const data = await res.json();
      if (!res.ok) { setAdminLoginError(data.error || 'Login failed'); setAdminLoggingIn(false); return; }
      localStorage.setItem('admin_token', data.token);
      setAdminToken(data.token);
    } catch { setAdminLoginError('Server unreachable'); }
    setAdminLoggingIn(false);
  };

  const handleClose = () => {
    localStorage.removeItem('admin_token');
    setAdminToken('');
    if (onClose) onClose();
  };

  const t = (en, ar, tr) => lang === 'ar' ? ar : lang === 'tr' ? tr : en;

  if (tokenValid === null) {
    return (
      <div className="glass-panel rounded-2xl border border-purple-500/20 p-6 mt-6">
        <div className="flex items-center justify-center py-16">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
            <span className="text-xs text-gray-500 font-mono">{tr(lang, 'Verifying access...', 'جاري التحقق من الوصول...', 'Erişim doğrulanıyor...')}</span>
          </div>
        </div>
      </div>
    );
  }

  if (!adminToken) {
    return (
      <div className="glass-panel rounded-2xl border border-purple-500/20 p-6 mt-6">
        <div className="max-w-sm mx-auto py-12">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600/20 to-cyan-500/20 border border-purple-500/20 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-purple-500/10">
              <Shield className="w-7 h-7 text-purple-400" />
            </div>
            <h2 className="text-lg font-extrabold text-white uppercase tracking-wider">{t('Admin Access', 'دخول المدير', 'Yönetici Girişi')}</h2>
            <p className="text-[11px] text-gray-500 mt-1.5 font-mono">{t('Enter admin credentials', 'أدخل بيانات المدير', 'Yönetici bilgilerini girin')}</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] text-purple-300 font-mono font-bold uppercase tracking-wider block">{t('Username', 'اسم المستخدم', 'Kullanıcı Adı')}</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" />
                <input value={adminUserInput} onChange={e => setAdminUserInput(e.target.value)}
                  className="w-full bg-[#090D16] border border-purple-500/20 text-xs text-white pl-9 pr-3 py-2.5 rounded-xl outline-none focus:border-purple-400/60 transition-colors placeholder-gray-700"
                  placeholder={t('Username', 'اسم المستخدم', 'Kullanıcı Adı')} required />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] text-purple-300 font-mono font-bold uppercase tracking-wider block">{t('Password', 'كلمة المرور', 'Şifre')}</label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" />
                <input type="password" value={adminPassInput} onChange={e => setAdminPassInput(e.target.value)}
                  className="w-full bg-[#090D16] border border-purple-500/20 text-xs text-white pl-9 pr-3 py-2.5 rounded-xl outline-none focus:border-purple-400/60 transition-colors placeholder-gray-700"
                  placeholder="••••••••" required />
              </div>
            </div>
            {adminLoginError && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5">
                <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <p className="text-[10px] text-red-400 font-mono">{adminLoginError}</p>
              </div>
            )}
            <button type="submit" disabled={adminLoggingIn}
              className="w-full py-3 bg-gradient-to-tr from-purple-600 to-cyan-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 disabled:scale-100">
              {adminLoggingIn ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  {t('Authenticating...', 'جاري التحقق...', 'Doğrulanıyor...')}
                </span>
              ) : t('Access Admin Panel', 'دخول لوحة التحكم', 'Yönetici Paneline Gir')}
            </button>
            <button type="button" onClick={handleClose}
              className="w-full text-[10px] text-gray-600 hover:text-gray-400 font-mono cursor-pointer transition-colors py-1">
              ← {t('Back to Home', 'العودة للرئيسية', 'Ana Sayfaya Dön')}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: 'cms', label: tr(lang, 'CMS', 'CMS', 'CMS'), icon: BookOpen },
    { key: 'payments', label: tr(lang, 'Payments', 'المدفوعات', 'Ödemeler'), icon: CreditCard },
    { key: 'users', label: tr(lang, 'Users', 'المستخدمون', 'Kullanıcılar'), icon: Users },
    { key: 'analytics', label: tr(lang, 'Analytics', 'التحليلات', 'Analiz'), icon: BarChart3 },
    { key: 'queries', label: tr(lang, 'Queries', 'الاستفسارات', 'Sorular'), icon: MessageSquare },
    { key: 'quiz-degrees', label: tr(lang, 'Quiz Degrees', 'درجات الاختبار', 'Sınav Dereceleri'), icon: Trophy },
    { key: 'audit', label: tr(lang, 'Audit Logs', 'سجلات التدقيق', 'Denetim Günlükleri'), icon: FileText },
    { key: 'smtp', label: tr(lang, 'SMTP', 'SMTP', 'SMTP'), icon: Mail },
  ];

  return (
    <div className="glass-panel rounded-2xl border border-purple-500/20 p-6 mt-6">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-purple-500/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-gray-200 uppercase tracking-wider">
              {tr(lang, 'System Controller', 'التحكم في النظام', 'Sistem Kontrolü')}
            </h1>
            <p className="text-[9px] text-gray-600 font-mono leading-none">v1.0</p>
          </div>
        </div>
        <button onClick={handleClose} className="p-2 rounded-lg hover:bg-white/5 transition-all text-gray-500 hover:text-gray-300">
          <X className="w-4 h-4" />
        </button>
      </div>

      <Tabs tabs={tabs} active={tab} onChange={setTab} />

      <div key={tab} className="transition-opacity duration-200">
        {tab === 'cms' && <CMSTab adminToken={adminToken} lang={lang} onGardensChange={onGardensChange} />}
        {tab === 'payments' && <PaymentsTab adminToken={adminToken} lang={lang} />}
        {tab === 'users' && <UsersTab adminToken={adminToken} lang={lang} />}
        {tab === 'analytics' && <AnalyticsTab adminToken={adminToken} lang={lang} />}
        {tab === 'quiz-degrees' && <QuizDegreesTab adminToken={adminToken} lang={lang} />}
        {tab === 'audit' && <AuditLogsTab adminToken={adminToken} lang={lang} />}
        {tab === 'queries' && <QueriesTab adminToken={adminToken} lang={lang} />}
        {tab === 'smtp' && <SmtpTab adminToken={adminToken} lang={lang} />}
      </div>
    </div>
  );
}

function SmtpTab({ adminToken, lang }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testEmail, setTestEmail] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/admin/smtp/status', { headers: { 'x-admin-token': adminToken } });
        const data = await r.json();
        setStatus(data);
      } catch {} finally { setLoading(false); }
    })();
  }, [adminToken]);

  const handleTest = async () => {
    if (!testEmail.trim()) return;
    setTesting(true); setTestResult(null);
    try {
      const r = await fetch('/api/admin/smtp/test', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-token': adminToken },
        body: JSON.stringify({ testEmail: testEmail.trim() })
      });
      const data = await r.json();
      setTestResult(data);
    } catch { setTestResult({ error: 'SMTP test failed' }); } finally { setTesting(false); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center mb-4">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{tr(lang, 'SMTP Diagnostics', 'تشخيص SMTP', 'SMTP Teşhis')}</span>
      </div>
      <div className="bg-[#0e1424] rounded-xl p-4 border border-purple-500/10 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Mail className="w-4 h-4 text-cyan-400" />
          <span className="text-xs text-gray-300">{tr(lang, 'Mail Server Status', 'حالة خادم البريد', 'Posta Sunucu Durumu')}</span>
        </div>
        <div className="space-y-1.5">
          {[
            { label: tr(lang, 'Host', 'المضيف', 'Sunucu'), value: status?.host },
            { label: tr(lang, 'Port', 'المنفذ', 'Port'), value: status?.port },
            { label: tr(lang, 'User', 'المستخدم', 'Kullanıcı'), value: status?.user },
            { label: tr(lang, 'From', 'من', 'Kimden'), value: status?.from },
            { label: tr(lang, 'Configured', 'مهيأ', 'Yapılandırılmış'), value: status?.isConfigured ? 'YES' : 'NO', color: status?.isConfigured ? 'text-emerald-400' : 'text-red-400' },
          ].map((s, i) => (
            <div key={i} className="flex items-center justify-between py-0.5">
              <span className="text-[10px] text-gray-600 font-mono">{s.label}</span>
              <span className={`text-[10px] font-mono ${s.color || 'text-gray-400'}`}>{s.value || '—'}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-[#0e1424] rounded-xl p-4 border border-purple-500/10">
        <p className="text-xs text-gray-300 mb-3">{tr(lang, 'Send Test Email', 'إرسال بريد اختباري', 'Test E-postası Gönder')}</p>
        <div className="flex gap-2">
          <input value={testEmail} onChange={e => setTestEmail(e.target.value)}
            placeholder="recipient@example.com"
            className="flex-1 bg-[#090D16] border border-purple-500/20 rounded-xl px-3 py-2 text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:border-purple-500/40" />
          <button onClick={handleTest} disabled={testing || !testEmail.trim()}
            className="px-4 py-2 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-500 text-white font-bold text-xs disabled:opacity-50 hover:scale-[1.02] transition-all">
            {testing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : tr(lang, 'Send Test', 'إرسال اختبار', 'Test Gönder')}
          </button>
        </div>
        {testResult && (
          <div className={`mt-3 p-3 rounded-xl text-[10px] font-mono ${testResult.success ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
            {testResult.success ? `✓ Message sent! ID: ${testResult.messageId}` : `✗ ${testResult.error || 'Failed'}`}
          </div>
        )}
      </div>
    </div>
  );
}
