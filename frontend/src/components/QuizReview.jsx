import React, { useState, useEffect, useCallback } from 'react';
import { BrainCircuit, CheckCircle, XCircle, ArrowRight, RotateCcw, Loader2, Trophy } from 'lucide-react';

export function QuizReview({ seedId, sessionId, lang, isSeedCompleted }) {
  const t = (en, ar, tr) => lang === 'ar' ? ar : lang === 'tr' ? tr : en;
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (!seedId) return;
    setLoading(true);
    fetch(`/api/quiz?seedId=${seedId}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setQuestions(data.questions || []);
          setAnswered(new Array((data.questions || []).length).fill(null));
          setCurrent(0);
          setSelected(null);
          setResult(null);
          setShowResult(false);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [seedId]);

  const handleAnswer = useCallback(async () => {
    if (selected == null || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/quiz/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seedId, sessionId, questionId: questions[current]?.id, answer: selected })
      });
      const data = await res.json();
      const newAnswered = [...answered];
      newAnswered[current] = { selected, correct: data.correct };
      setAnswered(newAnswered);
      if (data.correct && current < questions.length - 1) {
        setTimeout(() => { setCurrent(prev => prev + 1); setSelected(null); }, 800);
      } else if (data.correct && current === questions.length - 1) {
        setResult({ total: questions.length, correct: newAnswered.filter(a => a?.correct).length + 1 });
        setShowResult(true);
      }
    } catch {}
    setSubmitting(false);
  }, [selected, submitting, seedId, sessionId, questions, current, answered]);

  const q = questions[current];

  if (loading) {
    return (
      <div className="glass-panel rounded-2xl border border-purple-500/15 p-4">
        <div className="flex items-center gap-2 mb-4">
          <BrainCircuit className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-semibold text-gray-300">{t('Quiz', 'اختبار', 'Sınav')}</span>
        </div>
        <div className="flex items-center justify-center py-8"><Loader2 className="w-6 h-6 text-purple-400 animate-spin" /></div>
      </div>
    );
  }

  if (showResult && result) {
    const pct = Math.round((result.correct / result.total) * 100);
    return (
      <div className="glass-panel rounded-2xl border border-purple-500/15 p-4">
        <div className="flex flex-col items-center gap-3 py-6">
          <Trophy className={`w-12 h-12 ${pct >= 70 ? 'text-amber-400' : 'text-gray-600'}`} />
          <p className="text-lg font-bold text-gray-200">{result.correct}/{result.total}</p>
          <p className="text-sm text-gray-400">{pct}%</p>
          <button onClick={() => { setCurrent(0); setSelected(null); setAnswered(new Array(questions.length).fill(null)); setResult(null); setShowResult(false); }} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-xs text-purple-300 transition-colors">
            <RotateCcw className="w-3.5 h-3.5" /> {t('Retry', 'إعادة المحاولة', 'Tekrar Dene')}
          </button>
        </div>
      </div>
    );
  }

  if (!q) {
    return (
      <div className="glass-panel rounded-2xl border border-purple-500/15 p-4">
        <div className="flex items-center gap-2 mb-4">
          <BrainCircuit className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-semibold text-gray-300">{t('Quiz', 'اختبار', 'Sınav')}</span>
        </div>
        <p className="text-xs text-gray-600 text-center py-4">{t('No questions available', 'لا توجد أسئلة متاحة', 'Soru bulunamadı')}</p>
      </div>
    );
  }

  const options = q.optionsEn || q.optionsAr || q.optionsTr || [];
  const answeredData = answered[current];

  return (
    <div className="glass-panel rounded-2xl border border-purple-500/15 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-semibold text-gray-300">{t('Quiz', 'اختبار', 'Sınav')}</span>
        </div>
        <span className="text-[10px] text-gray-600">{current + 1}/{questions.length}</span>
      </div>

      <p className="text-xs text-gray-300 mb-4">{q.questionEn || q.questionAr || q.questionTr}</p>

      <div className="space-y-2 mb-4">
        {options.map((opt, i) => {
          const isSelected = selected === i;
          const isCorrect = answeredData?.correct && answeredData?.selected === i;
          const isWrong = answeredData && !answeredData.correct && answeredData?.selected === i;
          return (
            <button key={i} onClick={() => !answeredData && setSelected(i)} disabled={!!answeredData}
              className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                isCorrect ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' :
                isWrong ? 'bg-red-500/10 border-red-500/30 text-red-300' :
                isSelected ? 'bg-purple-500/10 border-purple-500/30 text-purple-300' :
                'bg-[#0e1424] border-purple-500/10 text-gray-400 hover:border-purple-500/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{opt}</span>
                {isCorrect && <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
                {isWrong && <XCircle className="w-3.5 h-3.5 text-red-400" />}
              </div>
            </button>
          );
        })}
      </div>

      {!answeredData && (
        <button onClick={handleAnswer} disabled={selected == null || submitting} className="w-full py-2.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 disabled:opacity-30 border border-purple-500/30 text-xs font-semibold text-purple-300 transition-all flex items-center justify-center gap-1.5">
          {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowRight className="w-3.5 h-3.5" />}
          {submitting ? t('Checking...', 'جارٍ التحقق...', 'Kontrol ediliyor...') : t('Confirm Answer', 'تأكيد الإجابة', 'Cevabı Onayla')}
        </button>
      )}

      {answeredData && !answeredData.correct && current < questions.length - 1 && (
        <button onClick={() => { setCurrent(prev => prev + 1); setSelected(null); }} className="w-full py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-xs font-semibold text-amber-300 transition-all mt-2">
          {t('Next Question', 'السؤال التالي', 'Sonraki Soru')}
        </button>
      )}
    </div>
  );
}
