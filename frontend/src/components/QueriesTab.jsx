import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Loader2 } from 'lucide-react';

export function QueriesTab({ seedId, sessionId, lang }) {
  const t = (en, ar, tr) => lang === 'ar' ? ar : lang === 'tr' ? tr : en;
  const [queries, setQueries] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!seedId) return;
    fetch(`/api/queries?seedId=${seedId}&sessionId=${sessionId}`)
      .then(r => r.json())
      .then(data => { if (data.success) setQueries(data.queries || []); })
      .catch(() => {});
  }, [seedId, sessionId]);

  const postQuery = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/queries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seedId, sessionId, text: text.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setQueries(prev => [...prev, { id: Date.now(), text: text.trim(), replies: [], timestamp: new Date().toISOString() }]);
        setText('');
      }
    } catch {}
    setLoading(false);
  };

  return (
    <div className="glass-panel rounded-2xl border border-purple-500/15 p-4">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-4 h-4 text-purple-400" />
        <span className="text-sm font-semibold text-gray-300">{t('Discussions', 'المناقشات', 'Tartışmalar')}</span>
      </div>
      <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
        {queries.length === 0 && (
          <p className="text-xs text-gray-600 text-center py-4">{t('No questions yet. Be the first to ask!', 'لا توجد أسئلة بعد. كن أول من يسأل!', 'Henüz soru yok. İlk soran siz olun!')}</p>
        )}
        {queries.map(q => (
          <div key={q.id} className="bg-[#0e1424] rounded-xl p-3 border border-purple-500/10">
            <p className="text-xs text-gray-300">{q.text}</p>
            <p className="text-[10px] text-gray-600 mt-1">{new Date(q.timestamp).toLocaleString()}</p>
            {q.replies?.map((r, i) => (
              <div key={i} className="mt-2 pl-3 border-l-2 border-cyan-500/30">
                <p className="text-[11px] text-cyan-300">{r.text}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={t('Ask a question...', 'اسأل سؤالاً...', 'Bir soru sor...')}
          className="flex-1 bg-[#0e1424] border border-purple-500/20 rounded-xl px-3 py-2 text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:border-purple-500/40"
          onKeyDown={e => e.key === 'Enter' && postQuery()}
        />
        <button onClick={postQuery} disabled={loading || !text.trim()} className="p-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 disabled:opacity-30 transition-colors">
          {loading ? <Loader2 className="w-4 h-4 text-purple-400 animate-spin" /> : <Send className="w-4 h-4 text-purple-400" />}
        </button>
      </div>
    </div>
  );
}
