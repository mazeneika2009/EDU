import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Trash2, Clock, Search, Download } from 'lucide-react';

export function DigitalNotebook({ seedId, studentEmail, currentVideoTime, onSeekTo, lang }) {
  const t = (en, ar, tr) => lang === 'ar' ? ar : lang === 'tr' ? tr : en;
  const [notes, setNotes] = useState([]);
  const [text, setText] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!seedId || !studentEmail) return;
    fetch(`/api/notebook?seedId=${seedId}&email=${studentEmail}`)
      .then(r => r.json())
      .then(data => { if (data.success) setNotes(data.notes || []); })
      .catch(() => {});
  }, [seedId, studentEmail]);

  const addNote = async () => {
    if (!text.trim()) return;
    const note = { text: text.trim(), timestamp: currentVideoTime, createdAt: new Date().toISOString() };
    try {
      await fetch('/api/notebook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seedId, email: studentEmail, note })
      });
      setNotes(prev => [...prev, note]);
      setText('');
    } catch {}
  };

  const deleteNote = async (idx) => {
    try {
      await fetch('/api/notebook/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seedId, email: studentEmail, index: idx })
      });
      setNotes(prev => prev.filter((_, i) => i !== idx));
    } catch {}
  };

  const formatTime = (s) => {
    if (s == null) return '--:--';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const filtered = notes.filter(n => !search || n.text.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="glass-panel rounded-2xl border border-purple-500/15 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-semibold text-gray-300">{t('Notebook', 'المفكرة', 'Not Defteri')}</span>
        </div>
        <button onClick={() => { const txt = notes.map(n => `[${formatTime(n.timestamp)}] ${n.text}`).join('\n'); navigator.clipboard?.writeText(txt); }} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
          <Download className="w-3.5 h-3.5 text-gray-500" />
        </button>
      </div>

      <div className="flex items-center gap-2 bg-[#0e1424] rounded-xl px-3 py-2 border border-purple-500/10 mb-3">
        <Search className="w-3.5 h-3.5 text-gray-600" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('Search notes...', 'ابحث في الملاحظات...', 'Notlarda ara...')} className="flex-1 bg-transparent text-xs text-gray-400 placeholder-gray-700 focus:outline-none" />
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto mb-3">
        {filtered.length === 0 && (
          <p className="text-xs text-gray-700 text-center py-4">{t('No notes yet', 'لا توجد ملاحظات بعد', 'Henüz not yok')}</p>
        )}
        {filtered.map((note, i) => (
          <div key={i} className="bg-[#0e1424] rounded-xl p-3 border border-purple-500/10 group">
            <p className="text-xs text-gray-300 pr-6">{note.text}</p>
            <div className="flex items-center justify-between mt-2">
              <button onClick={() => onSeekTo(note.timestamp)} className="flex items-center gap-1 text-[10px] text-cyan-500/60 hover:text-cyan-400 transition-colors">
                <Clock className="w-3 h-3" /> {formatTime(note.timestamp)}
              </button>
              <button onClick={() => deleteNote(i)} className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-500/10 transition-all">
                <Trash2 className="w-3 h-3 text-red-400" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input value={text} onChange={e => setText(e.target.value)} placeholder={t('Write a note...', 'اكتب ملاحظة...', 'Not yaz...')} className="flex-1 bg-[#0e1424] border border-purple-500/20 rounded-xl px-3 py-2 text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:border-purple-500/40" onKeyDown={e => e.key === 'Enter' && addNote()} />
        <button onClick={addNote} disabled={!text.trim()} className="p-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 disabled:opacity-30 transition-colors">
          <Plus className="w-4 h-4 text-purple-400" />
        </button>
      </div>
      {currentVideoTime > 0 && (
        <p className="text-[10px] text-gray-700 mt-2">{t('Capturing time:', 'التقاط الوقت:', 'Yakalanan süre:')} {formatTime(currentVideoTime)}</p>
      )}
    </div>
  );
}
