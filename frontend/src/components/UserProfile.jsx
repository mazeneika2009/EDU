import React, { useState } from 'react';
import { User, ArrowLeft, Award, BookOpen, CheckCircle, Mail, Phone, Shield, Sparkles, AlertTriangle, Trash2, Loader2 } from 'lucide-react';

export function UserProfile({ currentUser, onUpdateCurrentUser, gardens, selectedGarden, gardenProgress, onBack, onOpenGarden, lang }) {
  const t = (en, ar, tr) => lang === 'ar' ? ar : lang === 'tr' ? tr : en;
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!currentUser) return null;

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const sessionId = localStorage.getItem('kg_session_id');
      const res = await fetch('/api/auth/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.removeItem('kg_session_id');
        localStorage.removeItem('kg_active_garden_id');
        window.location.href = '/';
      }
    } catch (err) {
      console.error('Delete account failed:', err);
    }
    setDeleting(false);
  };

  return (
    <div className="glass-panel rounded-2xl border border-purple-500/20 p-6 mt-6">
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 mb-6 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> {t('Back', 'رجوع', 'Geri')}
      </button>

      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
          <User className="w-8 h-8 text-purple-400" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-200">{currentUser.email?.split('@')[0] || t('Student', 'طالب', 'Öğrenci')}</h2>
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
            <Shield className="w-3 h-3 text-emerald-400" />
            {t('Verified Cultivator', 'مزارع معتمد', 'Onaylı Yetiştirici')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-[#0e1424] rounded-xl p-3 border border-purple-500/10">
          <div className="flex items-center gap-1.5 mb-1">
            <Mail className="w-3 h-3 text-purple-400" />
            <span className="text-[10px] text-gray-600">{t('Email', 'البريد', 'E-posta')}</span>
          </div>
          <p className="text-xs text-gray-300 truncate">{currentUser.email}</p>
        </div>
        <div className="bg-[#0e1424] rounded-xl p-3 border border-purple-500/10">
          <div className="flex items-center gap-1.5 mb-1">
            <Phone className="w-3 h-3 text-purple-400" />
            <span className="text-[10px] text-gray-600">{t('Phone', 'الهاتف', 'Telefon')}</span>
          </div>
          <p className="text-xs text-gray-300">{currentUser.phone || '—'}</p>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-semibold text-gray-400">{t('Enrolled Gardens', 'الحدائق النشطة', 'Kayıtlı Bahçeler')}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {(gardens || []).filter(g => (currentUser.paidGardens || []).includes(g.id)).map(g => (
            <button key={g.id} onClick={() => onOpenGarden(g)} className="bg-[#0e1424] rounded-xl p-3 border border-purple-500/10 hover:border-purple-500/30 text-left transition-all group">
              <p className="text-xs text-gray-300 group-hover:text-purple-300 transition-colors">{g.titleEn || g.titleAr}</p>
              <div className="flex items-center gap-1 mt-1">
                <CheckCircle className="w-3 h-3 text-emerald-400" />
                <span className="text-[10px] text-emerald-400">{t('Enrolled', 'مفعل', 'Aktif')}</span>
              </div>
            </button>
          ))}
          {(currentUser.paidGardens || []).length === 0 && (
            <p className="text-xs text-gray-700 col-span-2 text-center py-4">{t('No enrolled gardens', 'لا توجد حدائق مفعلة', 'Kayıtlı bahçe yok')}</p>
          )}
        </div>
      </div>

      {gardenProgress && (
        <div className="bg-[#0e1424] rounded-xl p-4 border border-purple-500/10">
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-semibold text-gray-400">{t('Progress', 'التقدم', 'İlerleme')}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full transition-all" style={{ width: `${gardenProgress.completionPercent || 0}%` }} />
            </div>
            <span className="text-xs font-mono text-gray-400">{gardenProgress.completionPercent || 0}%</span>
          </div>
          <p className="text-[10px] text-gray-600 mt-2">{gardenProgress.completedSeedsCount || 0}/{gardenProgress.totalSeedsCount || 0} {t('seeds completed', 'بذرة مكتملة', 'tohum tamamlandı')}</p>
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-red-500/10">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <span className="text-xs font-semibold text-red-400">{t('Danger Zone', 'منطقة الخطر', 'Tehlikeli Bölge')}</span>
        </div>
        <p className="text-[10px] text-gray-600 mb-3">{t('Permanently delete your account and all associated data. This action cannot be undone.', 'احذف حسابك وجميع البيانات المرتبطة به بشكل دائم. هذا الإجراء لا يمكن التراجع عنه.', 'Hesabınızı ve tüm ilişkili verileri kalıcı olarak silin. Bu işlem geri alınamaz.')}</p>
        {confirmDelete ? (
          <div className="flex items-center gap-2">
            <button
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-all cursor-pointer disabled:opacity-50"
            >
              {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              {deleting ? t('Deleting...', 'جاري الحذف...', 'Siliniyor...') : t('Yes, Delete My Account', 'نعم، احذف حسابي', 'Evet, Hesabımı Sil')}
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              disabled={deleting}
              className="px-4 py-2 rounded-xl bg-[#131B2E] border border-purple-500/20 text-gray-400 hover:text-white text-xs font-bold transition-all cursor-pointer"
            >
              {t('Cancel', 'إلغاء', 'İptal')}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-950/40 border border-red-500/20 text-red-400 hover:bg-red-950/60 hover:text-red-300 text-xs font-bold transition-all cursor-pointer"
          >
            <Trash2 size={14} />
            {t('Delete Account', 'حذف الحساب', 'Hesabı Sil')}
          </button>
        )}
      </div>
    </div>
  );
}
