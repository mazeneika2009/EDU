import React, { useState } from 'react';
import { Mail, Trash2, X, Search, Loader2, Inbox, ArrowLeft, Clock, CheckCircle2 } from 'lucide-react';

export function MockInbox({ isOpen, onClose, lang, sessionId, emails, onEmailRead, onEmailDelete }) {
  const t = (en, ar, tr) => lang === 'ar' ? ar : lang === 'tr' ? tr : en;
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [selectedEmail, setSelectedEmail] = useState(null);

  const filtered = (emails || []).filter(e =>
    !search || (e.subject || '').toLowerCase().includes(search.toLowerCase()) || (e.bodyEn || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (emailId) => {
    setDeleting(emailId);
    await onEmailDelete(emailId);
    setDeleting(null);
    if (selectedEmail?.id === emailId) setSelectedEmail(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="glass-panel rounded-2xl border border-purple-500/20 w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-purple-500/10">
          <div className="flex items-center gap-2">
            {selectedEmail ? (
              <button onClick={() => setSelectedEmail(null)} className="flex items-center gap-1.5 text-purple-400 hover:text-cyan-400 transition-colors cursor-pointer">
                <ArrowLeft size={16} />
                <span className="text-xs font-semibold">{t('Back', 'رجوع', 'Geri')}</span>
              </button>
            ) : (
              <>
                <Mail className="w-5 h-5 text-purple-400" />
                <span className="text-sm font-semibold text-gray-300">{t('Secure Inbox', 'صندوق وارد آمن', 'Güvenli Gelen Kutusu')}</span>
              </>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {selectedEmail ? (
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div>
              <h3 className="text-base font-bold text-white">{selectedEmail.subject || '(No Subject)'}</h3>
              <div className="flex items-center gap-3 mt-2">
                <span className="flex items-center gap-1 text-[10px] text-gray-500 font-mono">
                  <Clock size={11} />
                  {new Date(selectedEmail.timestamp).toLocaleString()}
                </span>
                {selectedEmail.isGrowthReport && (
                  <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <CheckCircle2 size={11} /> {t('Growth Report', 'تقرير النمو', 'Gelişim Raporu')}
                  </span>
                )}
              </div>
            </div>
            <div className="h-px bg-purple-500/10" />
            <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
              {(lang === 'ar' ? selectedEmail.bodyAr : lang === 'tr' ? selectedEmail.bodyTr : selectedEmail.bodyEn) || selectedEmail.bodyEn}
            </div>
            <div className="flex justify-end pt-2">
              <button onClick={(e) => { e.stopPropagation(); handleDelete(selectedEmail.id); }} disabled={deleting === selectedEmail.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer">
                {deleting === selectedEmail.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 size={14} />}
                {t('Delete', 'حذف', 'Sil')}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="p-4 border-b border-purple-500/10">
              <div className="flex items-center gap-2 bg-[#0e1424] rounded-xl px-3 py-2 border border-purple-500/10">
                <Search className="w-4 h-4 text-gray-500" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('Search emails...', 'ابحث في الرسائل...', 'E-postalarda ara...')} className="flex-1 bg-transparent text-xs text-gray-300 placeholder-gray-600 focus:outline-none" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {filtered.length === 0 && (
                <div className="flex flex-col items-center gap-3 py-12">
                  <Inbox className="w-12 h-12 text-gray-700" />
                  <p className="text-xs text-gray-600">{t('Inbox is empty', 'صندوق الوارد فارغ', 'Gelen kutusu boş')}</p>
                </div>
              )}
              {filtered.map(email => (
                <div key={email.id} className="bg-[#0e1424] rounded-xl p-4 border border-purple-500/10 hover:border-purple-500/20 hover:bg-[#111827] transition-all group cursor-pointer" onClick={() => { setSelectedEmail(email); onEmailRead && onEmailRead(email.id); }}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold text-gray-300">{email.subject || '(No Subject)'}</p>
                        {email.isGrowthReport && <CheckCircle2 size={11} className="text-emerald-400 flex-shrink-0" />}
                      </div>
                      <p className="text-[11px] text-gray-600 mt-1 line-clamp-2">{(lang === 'ar' ? email.bodyAr : lang === 'tr' ? email.bodyTr : email.bodyEn) || email.bodyEn}</p>
                      <p className="text-[10px] text-gray-700 mt-2">{new Date(email.timestamp).toLocaleString()}</p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(email.id); }} disabled={deleting === email.id} className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/10 transition-all">
                      {deleting === email.id ? <Loader2 className="w-3.5 h-3.5 text-red-400 animate-spin" /> : <Trash2 className="w-3.5 h-3.5 text-red-400" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
