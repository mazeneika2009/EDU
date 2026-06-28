import React, { useState, useEffect, useRef, useMemo } from 'react';

function SelectDropdown({ options, value, onChange, className }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = options.find(o => o.value === value) || options[0];
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  return (
    <div className={`relative ${className || ''}`} ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full bg-[#050811] text-[10px] text-white border border-purple-500/15 py-1.5 px-2 rounded-lg outline-none focus:border-cyan-400 cursor-pointer font-mono text-left flex items-center justify-between gap-1"
      >
        <span className="truncate">{current.label}</span>
        <span className={`text-gray-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[#0c101d] border border-purple-500/20 rounded-xl py-1 shadow-2xl shadow-black/50 backdrop-blur-xl z-50 max-h-48 overflow-y-auto">
          {options.map(o => (
            <button
              key={o.value}
              onClick={() => { onChange(o.value); setOpen(false); }}
              className={`block w-full text-left px-3 py-1.5 text-[10px] font-mono hover:bg-white/5 transition-colors cursor-pointer ${o.value === value ? 'text-cyan-400 font-bold' : 'text-gray-400'}`}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ContactForm({ t }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);
    if (!name.trim() || !email.trim() || !message.trim()) {
      setFeedback({ type: 'error', text: t.contact_required });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), subject: subject.trim(), message: message.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: 'success', text: t.contact_success });
        setName(''); setEmail(''); setSubject(''); setMessage('');
      } else {
        setFeedback({ type: 'error', text: data.error || t.contact_error });
      }
    } catch {
      setFeedback({ type: 'error', text: t.contact_error });
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full bg-[#0c101d] border border-purple-500/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 font-mono outline-none focus:border-cyan-500/40 transition-colors';

  return (
    <form onSubmit={handleSubmit} className="glass-panel rounded-2xl p-6 md:p-8 space-y-5">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] text-gray-500 font-mono uppercase tracking-wider mb-1.5">{t.contact_name}</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder={t.contact_name_placeholder} className={inputClass} disabled={loading} />
        </div>
        <div>
          <label className="block text-[10px] text-gray-500 font-mono uppercase tracking-wider mb-1.5">{t.contact_email}</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={t.contact_email_placeholder} className={inputClass} disabled={loading} />
        </div>
      </div>
      <div>
        <label className="block text-[10px] text-gray-500 font-mono uppercase tracking-wider mb-1.5">{t.contact_subject}</label>
        <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder={t.contact_subject_placeholder} className={inputClass} disabled={loading} />
      </div>
      <div>
        <label className="block text-[10px] text-gray-500 font-mono uppercase tracking-wider mb-1.5">{t.contact_message}</label>
        <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder={t.contact_message_placeholder} rows={5} className={inputClass + ' resize-none'} disabled={loading} />
      </div>

      {feedback && (
        <div className={`text-[11px] font-mono px-4 py-2 rounded-xl ${feedback.type === 'success' ? 'bg-green-950/40 border border-green-500/30 text-green-400' : 'bg-red-950/40 border border-red-500/30 text-red-400'}`}>
          {feedback.text}
        </div>
      )}

      <button type="submit" disabled={loading}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-extrabold text-sm shadow-lg shadow-purple-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
      >
        {loading ? (
          <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {t.contact_sending}</span>
        ) : (
          <span className="flex items-center gap-2"><Send size={15} /> {t.contact_submit}</span>
        )}
      </button>
    </form>
  );
}

import { localization, createTranslator } from './types.js';
import { LanguageSelector } from './components/LanguageSelector.jsx';
import { SecureVideoPlayer } from './components/WatermarkPlayer.jsx';
import { QueriesTab } from './components/QueriesTab.jsx';
import { CheckoutSandbox } from './components/CheckoutSandbox.jsx';
import { AdminPanel } from './components/AdminPanel.jsx';
import { MockInbox } from './components/MockInbox.jsx';
import { GrowthReportModal } from './components/GrowthReportModal.jsx';
import { DigitalNotebook } from './components/DigitalNotebook.jsx';
import { UserProfile } from './components/UserProfile.jsx';
import { QuizReview } from './components/QuizReview.jsx';
import { motion } from 'motion/react';
import { BrowserRouter as Router, useNavigate, useLocation } from 'react-router-dom';
import {
  Sprout, Leaf, Compass, Shield, Milestone, Sparkles, UserCheck, Flame, BookOpen, KeyRound,
  Eye, EyeOff, Lock, User as UserIcon, LogOut, CheckCircle2, UserPlus, Info, Phone, Mail, Award, Clock,
  Filter, ArrowLeft, BrainCircuit, ChevronRight, BarChart3,
  Target, Globe, GraduationCap, Bookmark, Send, MessageCircle
} from 'lucide-react';

export const getTagStyles = (tag) => {
  const t = tag.toLowerCase().trim();
  if (['react', 'react hooks', 'vite', 'frontend', 'ui'].some(k => t.includes(k))) {
    return 'bg-cyan-500/5 border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/15 hover:border-cyan-500/40';
  }
  if (['typescript', 'js', 'javascript'].some(k => t.includes(k))) {
    return 'bg-amber-500/5 border-amber-500/20 text-amber-400 hover:bg-amber-500/15 hover:border-amber-500/40';
  }
  if (['system design', 'concurrency', 'threading', 'cloud', 'architect', 'performance'].some(k => t.includes(k))) {
    return 'bg-purple-500/5 border-purple-500/20 text-purple-400 hover:bg-purple-500/15 hover:border-purple-500/40';
  }
  if (['python', 'oop', 'fastapi', 'backend', 'routing'].some(k => t.includes(k))) {
    return 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/15 hover:border-emerald-500/40';
  }
  return 'bg-gray-500/5 border-gray-400/20 text-gray-400 hover:bg-gray-400/15 hover:border-gray-400/40';
};

export function parseDurationToSeconds(duration) {
  if (!duration || typeof duration !== 'string') return 0;
  const parts = duration.split(':').map(Number);
  if (parts.some(isNaN)) return 1800;
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return parts[0] || 0;
}

export function getSeedDifficulty(seed) {
  const durationSecs = parseDurationToSeconds(seed.duration);
  const titleLower = ((seed.titleEn || '') + ' ' + (seed.titleAr || '') + ' ' + (seed.titleTr || '')).toLowerCase();
  const tagsJoined = (seed.tags || []).map(t => t.toLowerCase()).join(' ');

  if (
    tagsJoined.includes('system design') ||
    tagsJoined.includes('architect') ||
    tagsJoined.includes('cloud') ||
    tagsJoined.includes('concurrency') ||
    tagsJoined.includes('advanced') ||
    titleLower.includes('advanced') ||
    titleLower.includes('متقدم') ||
    titleLower.includes('ileri') ||
    durationSecs >= 2400
  ) {
    return 'Advanced';
  }

  if (
    tagsJoined.includes('vite') ||
    tagsJoined.includes('setup') ||
    tagsJoined.includes('introduction') ||
    titleLower.includes('introduction') ||
    titleLower.includes('setup') ||
    titleLower.includes('مقدمة') ||
    titleLower.includes('giriş') ||
    durationSecs <= 1000
  ) {
    return 'Beginner';
  }

  return 'Intermediate';
}

function AppContent() {
  const [lang, setLang] = useState(() => {
    const saved = localStorage.getItem('kg_lang');
    return (saved === 'en' || saved === 'ar' || saved === 'tr') ? saved : 'ar';
  });
  
  const navigate = useNavigate();
  const location = useLocation();

  const screen = useMemo(() => {
    const p = location.pathname;
    if (p === '/login') return 'login';
    if (p === '/register') return 'register';
    if (p === '/verify') return 'verify';
    if (p === '/classroom') return 'classroom';
    if (p === '/profile') return 'profile';
    if (p === '/forgot-password') return 'forgot_password';
    if (p === '/admin') return 'admin';
    if (p === '/gardens') return 'gardens';
    return 'landing';
  }, [location.pathname]);

  const [currentUser, setCurrentUser] = useState(null);
  const [sessionId, setSessionId] = useState('');
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  const [gardens, setGardens] = useState([]);
  const [selectedGarden, setSelectedGarden] = useState(null);
  const [gardenSeeds, setGardenSeeds] = useState([]);
  const [activeSeed, setActiveSeed] = useState(null);

  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [passInput, setPassInput] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [authError, setAuthError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [verificationUserId, setVerificationUserId] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

  const [checkoutGarden, setCheckoutGarden] = useState(null);

  const [emails, setEmails] = useState([]);
  const [unreadMailCount, setUnreadMailCount] = useState(0);
  const [isInboxOpen, setIsInboxOpen] = useState(false);
  
  const [gardenProgress, setGardenProgress] = useState(null);
  const [otpCodeInput, setOtpCodeInput] = useState('');
  const [reportError, setReportError] = useState('');
  const [reportSuccess, setReportSuccess] = useState('');
  const [isOtpRequesting, setIsOtpRequesting] = useState(false);
  const [isOtpVerifying, setIsOtpVerifying] = useState(false);
  const [activeReport, setActiveReport] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const notifiedEmailIds = useRef(new Set());
  const isFirstMailLoad = useRef(true);
  const currentVideoTimeRef = useRef(0);
  const autoReportShown = useRef(false);

  const [currentVideoTime, setCurrentVideoTime] = useState(0);

  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(setStats).catch(() => {});
  }, []);

  useEffect(() => {
    currentVideoTimeRef.current = currentVideoTime;
  }, [currentVideoTime]);

  const completedGardenIds = useMemo(() => {
    return new Set(emails.filter(e => e.isGrowthReport).map(e => e.gardenId));
  }, [emails]);

  const [seekToTime, setSeekToTime] = useState(null);
  const [resolvedVideoUrl, setResolvedVideoUrl] = useState(null);
  const [videoResolving, setVideoResolving] = useState(false);
  const [sidebarTab, setSidebarTab] = useState('seeds');
  const [quizForceOpen, setQuizForceOpen] = useState(false);

  const [sidebarSort, setSidebarSort] = useState('index');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [durationFilter, setDurationFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('all');

  const uniqueTags = useMemo(() => {
    const tagsSet = new Set();
    gardenSeeds.forEach(seed => {
      if (seed.tags) {
        seed.tags.forEach(tag => tagsSet.add(tag));
      }
    });
    return Array.from(tagsSet);
  }, [gardenSeeds]);

  const processedSeeds = useMemo(() => {
    let list = [...gardenSeeds];

    if (difficultyFilter !== 'all') {
      list = list.filter(seed => getSeedDifficulty(seed) === difficultyFilter);
    }
    if (durationFilter !== 'all') {
      list = list.filter(seed => {
        const sec = parseDurationToSeconds(seed.duration);
        if (durationFilter === 'short') return sec < 900;
        if (durationFilter === 'medium') return sec >= 900 && sec < 1800;
        if (durationFilter === 'long') return sec >= 1800;
        return true;
      });
    }
    if (tagFilter !== 'all') {
      list = list.filter(seed => seed.tags && seed.tags.includes(tagFilter));
    }

    if (sidebarSort === 'difficulty-asc') {
      const diffRank = { 'Beginner': 1, 'Intermediate': 2, 'Advanced': 3 };
      list.sort((a, b) => diffRank[getSeedDifficulty(a)] - diffRank[getSeedDifficulty(b)]);
    } else if (sidebarSort === 'difficulty-desc') {
      const diffRank = { 'Beginner': 1, 'Intermediate': 2, 'Advanced': 3 };
      list.sort((a, b) => diffRank[getSeedDifficulty(b)] - diffRank[getSeedDifficulty(a)]);
    } else if (sidebarSort === 'duration-asc') {
      list.sort((a, b) => parseDurationToSeconds(a.duration) - parseDurationToSeconds(b.duration));
    } else if (sidebarSort === 'duration-desc') {
      list.sort((a, b) => parseDurationToSeconds(b.duration) - parseDurationToSeconds(a.duration));
    } else if (sidebarSort === 'tag-count-desc') {
      list.sort((a, b) => (b.tags?.length || 0) - (a.tags?.length || 0));
    }

    return list;
  }, [gardenSeeds, sidebarSort, difficultyFilter, durationFilter, tagFilter]);

  const [bloomedSeedIds, setBloomedSeedIds] = useState(new Set());
  const prevCompletedRef = useRef(new Set());
  const isFirstProgressLoadRef = useRef(true);

  useEffect(() => {
    if (gardenProgress?.seedProgressDetails) {
      const currentCompleted = new Set();
      gardenProgress.seedProgressDetails.forEach((d) => {
        if (d.isCompleted) {
          currentCompleted.add(d.seedId);
        }
      });

      const newlyCompleted = [];
      if (!isFirstProgressLoadRef.current) {
        currentCompleted.forEach(id => {
          if (!prevCompletedRef.current.has(id)) {
            newlyCompleted.push(id);
          }
        });
      }

      if (newlyCompleted.length > 0) {
        setBloomedSeedIds(prev => {
          const next = new Set(prev);
          newlyCompleted.forEach(id => next.add(id));
          return next;
        });

        setTimeout(() => {
          setBloomedSeedIds(prev => {
            const next = new Set(prev);
            newlyCompleted.forEach(id => next.delete(id));
            return next;
          });
        }, 3200);
      }

      prevCompletedRef.current = currentCompleted;
      isFirstProgressLoadRef.current = false;
    } else {
      isFirstProgressLoadRef.current = true;
      prevCompletedRef.current = new Set();
    }
  }, [gardenProgress]);

  const fetchGardens = async () => {
    try {
      const res = await fetch('/api/gardens');
      if (res.ok) {
        const data = await res.json();
        setGardens(data);
      }
    } catch (err) {
      console.warn('Backend API not responding, retrying...');
    }
  };

  useEffect(() => {
    fetchGardens();
  }, []);

  const syncSession = async (cachedSessionId) => {
    if (!cachedSessionId) return;
    try {
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: cachedSessionId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCurrentUser(data.user);
        setSessionId(cachedSessionId);
      } else {
        handleLogout();
      }
    } catch (e) {
      console.warn('Network session synchronization pending...');
      setIsAuthChecking(false);
    } finally {
      setIsAuthChecking(false);
    }
  };

  useEffect(() => {
    const cachedSession = localStorage.getItem('kg_session_id');
    if (cachedSession) {
      syncSession(cachedSession);
    } else {
      setIsAuthChecking(false);
    }
  }, []);

  const fetchEmails = async () => {
    const activeSession = sessionId || localStorage.getItem('kg_session_id');
    if (!activeSession) return;
    try {
      const res = await fetch(`/api/emails?sessionId=${encodeURIComponent(activeSession)}`);
      if (res.ok) {
        const data = await res.json();
        setEmails(data);
        const unread = data.filter((e) => !e.isRead).length;
        setUnreadMailCount(unread);
      }
    } catch (err) {
      console.warn('Syncing mock inbox pending...');
    }
  };

  const fetchGardenProgress = async (gardenId) => {
    const activeSession = sessionId || localStorage.getItem('kg_session_id');
    if (!activeSession || !gardenId) return;
    try {
      const res = await fetch('/api/student_growth/garden-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: activeSession, gardenId })
      });
      if (res.ok) {
        const data = await res.json();
        setGardenProgress(data);
      }
    } catch (err) {
      console.warn('Tracking garden completion failed:', err);
    }
  };

  useEffect(() => {
    const activeSession = sessionId || localStorage.getItem('kg_session_id');
    if (activeSession) {
      fetchEmails();
      const inv = setInterval(fetchEmails, 5000);
      return () => clearInterval(inv);
    }
  }, [sessionId]);

  useEffect(() => {
    if (!activeSeed || !sessionId || !selectedGarden) return;
    const interval = setInterval(async () => {
      const time = currentVideoTimeRef.current;
      if (time > 0) {
        try {
          await fetch('/api/student_growth/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId, seedId: activeSeed.id, watchedSeconds: Math.floor(time) }),
          });
        } catch {}
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [activeSeed?.id, sessionId, selectedGarden?.id]);

  useEffect(() => {
    if (emails.length > 0) {
      if (isFirstMailLoad.current) {
        emails.forEach((e) => notifiedEmailIds.current.add(e.id));
        isFirstMailLoad.current = false;
        return;
      }

      const newStatusMail = emails.find(e => 
        !e.isRead && 
        !notifiedEmailIds.current.has(e.id) &&
        (e.subject.includes('Approved') || e.subject.includes('Rejected'))
      );

      if (newStatusMail) {
        notifiedEmailIds.current.add(newStatusMail.id);
        const isApproved = newStatusMail.subject.includes('Approved');
        
        const alertTitle = isApproved 
          ? t.payment_approved
          : t.payment_rejected;
        const alertBody = isApproved
          ? t.access_activated
          : t.check_inbox_details;

        alert(`${alertTitle}\n\n${alertBody}`);

        if (isApproved && (sessionId || localStorage.getItem('kg_session_id'))) {
          syncSession(sessionId || localStorage.getItem('kg_session_id'));
        }
      }
    }
  }, [emails, lang, sessionId]);
  useEffect(() => {
    if (selectedGarden && (sessionId || localStorage.getItem('kg_session_id'))) {
      fetchGardenProgress(selectedGarden.id);
    }
  }, [selectedGarden, sessionId]);

  useEffect(() => {
    if (!gardenProgress || autoReportShown.current || !currentUser || !selectedGarden) return;
    const loc = localization[lang];
    if (gardenProgress.completionPercent === 100) {
      autoReportShown.current = true;
      const totalSec = (gardenProgress.seedProgressDetails || []).reduce((acc, curr) => acc + (curr.durationSeconds || 0), 0);
      const studyMinutes = Math.floor(totalSec / 60);
      const studyHours = (studyMinutes / 60).toFixed(1);
      const seedDetails = (gardenProgress.seedProgressDetails || []).map(s => ({
        title: s.titleEn || s.titleAr || s.titleTr || '',
        completed: s.isCompleted
      }));
      setActiveReport({
        gardenTitle: lang === 'ar' ? selectedGarden.titleAr : lang === 'tr' ? selectedGarden.titleTr : selectedGarden.titleEn,
        userName: currentUser.name || currentUser.email?.split('@')[0] || '',
        completedAt: new Date().toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' }),
        totalHours: studyHours,
        totalMinutes: studyMinutes,
        completedSeedsCount: gardenProgress.completedSeedsCount,
        totalSeedsCount: gardenProgress.totalSeedsCount,
        skillsAcquired: loc.skills_acquired,
        aiAdvice: loc.ai_advice,
        seeds: seedDetails,
      });
      setIsReportModalOpen(true);
    }
  }, [gardenProgress, currentUser, selectedGarden, lang]);

  useEffect(() => {
    if (!isAuthChecking && (screen === 'classroom' || screen === 'profile') && !currentUser) {
      navigate('/login');
    }
  }, [screen, currentUser, navigate, isAuthChecking]);

  useEffect(() => {
    const savedGardenId = localStorage.getItem('kg_active_garden_id');
    if (currentUser && gardens.length > 0 && savedGardenId && !selectedGarden) {
      const g = gardens.find(x => x.id === savedGardenId);
      if (g) {
        handleGardenAccess(g);
      }
    }
  }, [currentUser, gardens, selectedGarden]);

  const handleLanguageChange = (selectedLang) => {
    setLang(selectedLang);
    localStorage.setItem('kg_lang', selectedLang);
    const root = document.documentElement;
    if (selectedLang === 'ar') {
      root.dir = 'rtl';
    } else {
      root.dir = 'ltr';
    }
  };

  useEffect(() => {
    handleLanguageChange(lang);
  }, [lang]);

  const handleLogout = () => {
    localStorage.removeItem('kg_session_id');
    localStorage.removeItem('kg_active_garden_id');
    notifiedEmailIds.current.clear();
    isFirstMailLoad.current = true;
    setCurrentUser(null);
    setSessionId('');
    navigate('/');
    setSelectedGarden(null);
    setActiveSeed(null);
  };

  const handleResendCode = async () => {
    if (!verificationUserId) return;
    setAuthError('');
    setSuccessMsg('');
    try {
      const res = await fetch('/api/auth/resend-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: verificationUserId }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(data.message || 'New code sent.');
      } else {
        setAuthError(data.error);
      }
    } catch {
      setAuthError('Network communication node error.');
    }
  };

  const handleDeleteEmail = async (emailId) => {
    const activeSession = sessionId || localStorage.getItem('kg_session_id');
    if (!activeSession) return;
    try {
      const res = await fetch('/api/emails/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: activeSession,
          emailId
        })
      });
      if (res.ok) {
        fetchEmails();
      }
    } catch (err) {
      console.warn('De-rooting message failed.');
    }
  };

  const handleRequestReportOtp = async () => {
    const activeSession = sessionId || localStorage.getItem('kg_session_id');
    if (!selectedGarden || !activeSession) return;
    setIsOtpRequesting(true);
    setReportError('');
    setReportSuccess('');
    try {
      const res = await fetch('/api/reports/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: activeSession, gardenId: selectedGarden.id })
      });
      const data = await res.json();
      if (res.ok) {
        setReportSuccess(t.otp_dispatched);
        await fetchGardenProgress(selectedGarden.id);
        await fetchEmails();
        setTimeout(() => {
          setIsInboxOpen(true);
        }, 1000);
      } else {
        setReportError(data.error || 'Failed to dispatch verification code.');
      }
    } catch (err) {
      setReportError('Network dispatch failed.');
    } finally {
      setIsOtpRequesting(false);
    }
  };

  const handleVerifyReportOtp = async (e) => {
    e.preventDefault();
    const activeSession = sessionId || localStorage.getItem('kg_session_id');
    if (!selectedGarden || !otpCodeInput || !activeSession) return;
    setIsOtpVerifying(true);
    setReportError('');
    setReportSuccess('');
    try {
      const res = await fetch('/api/reports/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: activeSession,
          gardenId: selectedGarden.id,
          otpCode: otpCodeInput,
          lang
        })
      });
      const data = await res.json();
      if (res.ok) {
        setReportSuccess(t.otp_verified);
        setOtpCodeInput('');
        const seedDetails = (gardenProgress?.seedProgressDetails || []).map(s => ({ title: s.titleEn || s.titleAr || s.titleTr || '', completed: s.isCompleted }));
        setActiveReport({ ...data.report, seeds: seedDetails, completedSeedsCount: gardenProgress?.completedSeedsCount, totalSeedsCount: gardenProgress?.totalSeedsCount });
        setIsReportModalOpen(true);
        await fetchGardenProgress(selectedGarden.id);
        await fetchEmails();
      } else {
        setReportError(data.error || 'Verification failed. Try again.');
      }
    } catch (err) {
      setReportError('Verification sync failed.');
    } finally {
      setIsOtpVerifying(false);
    }
  };

  const handleViewDispatchedReport = () => {
    if (!selectedGarden || !currentUser) return;
    const reportEmail = emails.find(e => e.gardenId === selectedGarden.id && e.isGrowthReport);
    if (reportEmail) {
      const totalSec = (gardenProgress?.seedProgressDetails || []).reduce((acc, curr) => acc + (curr.durationSeconds || 0), 0);
      const studyMinutes = Math.floor(totalSec / 60);
      const studyHours = (studyMinutes / 60).toFixed(1);

      const seedDetails = (gardenProgress?.seedProgressDetails || []).map(s => ({ title: s.titleEn || s.titleAr || s.titleTr || '', completed: s.isCompleted }));
      const verifiedPayload = {
        id: reportEmail.id,
        gardenId: selectedGarden.id,
        gardenTitle: lang === 'ar' ? selectedGarden.titleAr : lang === 'tr' ? selectedGarden.titleTr : selectedGarden.titleEn,
        toEmail: reportEmail.toEmail,
        userName: currentUser.name || currentUser.email.split('@')[0],
        completedAt: new Date(reportEmail.timestamp).toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' }),
        totalHours: studyHours,
        totalMinutes: studyMinutes,
        completedSeedsCount: gardenProgress?.completedSeedsCount,
        totalSeedsCount: gardenProgress?.totalSeedsCount,
        skillsAcquired: t.skills_acquired,
        aiAdvice: t.ai_advice,
        certificateId: 'CERT_' + reportEmail.id.substring(6).toUpperCase(),
        body: lang === 'ar' ? reportEmail.bodyAr : lang === 'tr' ? reportEmail.bodyTr : reportEmail.bodyEn,
        seeds: seedDetails,
      };
      setActiveReport(verifiedPayload);
      setIsReportModalOpen(true);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailInput,
          password: passInput,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || 'Authentication rejected.');
        return;
      }

      if (data.requiresVerification) {
        setVerificationUserId(data.userId);
        navigate('/verify');
        setSuccessMsg(data.message);
        return;
      }

      localStorage.setItem('kg_session_id', data.sessionId);
      setCurrentUser(data.user);
      setSessionId(data.sessionId);
      navigate('/');
      setSuccessMsg('Synchronization successful! Base logged-in.');
    } catch (err) {
      setAuthError('Connection issue. Server offline.');
    }
  };
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setSuccessMsg('');

    if (!emailInput || !phoneInput || !passInput) {
      setAuthError('Please fill out all credentials.');
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailInput,
          name: nameInput,
          phone: phoneInput,
          password: passInput,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || 'Registration failed.');
        return;
      }

      setVerificationUserId(data.userId);
      navigate('/verify');
      setSuccessMsg('Account registered. Please enter verification code.');
    } catch (err) {
      setAuthError('Database offline.');
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setSuccessMsg('');
    setResetLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(t.reset_success_msg);
        setVerificationUserId(data.userId);
        navigate('/verify');
      } else {
        setAuthError(data.error);
      }
    } catch {
      setAuthError('Network communication failed.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setAuthError('');

    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: verificationUserId,
          code: verificationCode,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || 'Invalid synchronization code.');
        return;
      }

      localStorage.setItem('kg_session_id', data.sessionId);
      setCurrentUser(data.user);
      setSessionId(data.sessionId);
      navigate('/');
      setSuccessMsg('Identity verified! Digital Garden Base unlocked.');
    } catch (err) {
      setAuthError('Verification system failure.');
    }
  };

  const handleGardenAccess = async (garden) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    if (currentUser.pendingGardens?.includes(garden.id)) {
      alert(t.payment_verified_pending);
      return;
    }

    if (currentUser.paidGardens?.includes(garden.id)) {
      try {
        const res = await fetch(`/api/gardens/${garden.id}/seeds`);
        if (res.ok) {
          const seeds = await res.json();
          setGardenSeeds(seeds);
          setSelectedGarden(garden);
          localStorage.setItem('kg_active_garden_id', garden.id);
          const activeSid = sessionId || localStorage.getItem('kg_session_id');
          if (activeSid) {
            const progRes = await fetch('/api/student_growth/garden-progress', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ sessionId: activeSid, gardenId: garden.id })
            });
            if (progRes.ok) {
              const progData = await progRes.json();
              setGardenProgress(progData);
              const nextSeed = seeds.find(s => !progData.seedProgressDetails?.find(d => d.seedId === s.id)?.isCompleted);
              setActiveSeed(nextSeed || seeds[0] || null);
            } else {
              setActiveSeed(seeds[0] || null);
            }
          } else {
            setActiveSeed(seeds[0] || null);
          }
          navigate('/classroom');
        }
      } catch (err) {
        console.warn(err);
      }
    } else {
      setCheckoutGarden(garden);
    }
  };

  const selectActiveSeed = (seed) => {
    setActiveSeed(seed);
    setCurrentVideoTime(0);
    setSeekToTime(null);
    setQuizForceOpen(false);
    setResolvedVideoUrl(null);
  };

  const activeSeedIndex = useMemo(() => {
    if (!activeSeed) return -1;
    return processedSeeds.findIndex(s => s.id === activeSeed.id);
  }, [activeSeed, processedSeeds]);

  const handlePreviousSeed = () => {
    if (activeSeedIndex > 0) {
      selectActiveSeed(processedSeeds[activeSeedIndex - 1]);
    }
  };

  const handleNextSeed = () => {
    if (activeSeedIndex < processedSeeds.length - 1) {
      selectActiveSeed(processedSeeds[activeSeedIndex + 1]);
    } else {
      navigate('/gardens');
    }
  };

  useEffect(() => {
    let cancelled = false;
    if (!activeSeed || !sessionId) {
      setResolvedVideoUrl(null);
      return;
    }
    const rawUrl = activeSeed.videoUrl;
    if (!rawUrl || rawUrl.startsWith('bunny_mock') || rawUrl === '') {
      setResolvedVideoUrl(null);
      return;
    }
    setVideoResolving(true);
    fetch(`/api/seeds/${activeSeed.id}/stream?token=${encodeURIComponent(sessionId)}`)
      .then(r => r.json())
      .then(data => {
        if (cancelled) return;
        const url = data.success && data.resolvedUrl && data.resolvedUrl.startsWith('http') ? data.resolvedUrl : rawUrl;
        setResolvedVideoUrl(url);
      })
      .catch(() => { if (!cancelled) setResolvedVideoUrl(rawUrl); })
      .finally(() => { if (!cancelled) setVideoResolving(false); });
    return () => { cancelled = true; };
  }, [activeSeed?.id, sessionId]);

  const handleMarkComplete = async () => {
    if (!activeSeed || !sessionId || !selectedGarden) return;

    const durationSecs = parseDurationToSeconds(activeSeed.duration);

    // Save progress first, then check quizzes
    try {
      await fetch('/api/student_growth/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          seedId: activeSeed.id,
          watchedSeconds: durationSecs,
        }),
      });
    } catch (e) {
      console.warn('Progress save failed before quiz check');
    }

    try {
      const quizRes = await fetch(`/api/quiz_questions?seedId=${activeSeed.id}`);
      if (quizRes.ok) {
        const quizQuestions = await quizRes.json();
        if (quizQuestions.length > 0) {
          const answersRes = await fetch('/api/quiz_answers/get', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId }),
          });
          if (answersRes.ok) {
            const answersData = await answersRes.json();
            const correctAnswerIds = new Set(
              (answersData.answers || [])
                .filter((a) => a.seedId === activeSeed.id && a.isCorrect)
                .map((a) => a.questionId)
            );
            const allAnswered = quizQuestions.every((q) => correctAnswerIds.has(q.id));
            if (!allAnswered) {
              setQuizForceOpen(true);
              setSidebarTab('quiz');
            }
          }
        }
      }
    } catch (e) {
      console.warn('Quiz check failed, proceeding with mark complete');
    }

    fetchGardenProgress(selectedGarden.id);
    handleNextSeed();
  };

  const handleDirectComplete = async (seedId) => {
    const seed = gardenSeeds.find(s => s.id === seedId);
    if (!seed || !sessionId || !selectedGarden) return;
    setGardenProgress(prev => {
      if (!prev) return prev;
      const details = prev.seedProgressDetails || [];
      const existing = details.find(d => d.seedId === seedId);
      const newDetails = existing
        ? details.map(d => d.seedId === seedId ? { ...d, isCompleted: true } : d)
        : [...details, { seedId, isCompleted: true, titleEn: seed.titleEn, titleAr: seed.titleAr, titleTr: seed.titleTr, durationSeconds: parseDurationToSeconds(seed.duration) }];
      return { ...prev, completedSeedsCount: newDetails.filter(d => d.isCompleted).length, seedProgressDetails: newDetails };
    });
    const durationSecs = parseDurationToSeconds(seed.duration);
    try {
      await fetch('/api/student_growth/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, seedId: seed.id, watchedSeconds: durationSecs }),
      });
    } catch (e) {
      console.warn('Direct complete failed');
    }
    fetchGardenProgress(selectedGarden.id);
  };

  const t = createTranslator(lang);

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-[#090D16] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Sprout className="text-cyan-400 animate-bounce" size={48} />
          <p className="text-xs font-mono text-gray-500 uppercase tracking-widest">Synchronizing Academic Node...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pb-16 flex flex-col items-center bg-[#090D16] selection:bg-cyan-500 selection:text-black overflow-x-hidden ${lang === 'ar' ? 'font-sans' : 'font-sans'}`}>
      
      <header className="w-full max-w-7xl px-4 mt-4 sticky top-4 z-40">
        <div className="glass-panel rounded-2xl px-6 py-4 flex items-center justify-between border border-purple-500/20 shadow-lg">
          <div 
            className="flex items-center gap-2.5 cursor-pointer group"
            onClick={() => navigate('/')}
          >
            <Sprout className="text-cyan-400" size={24} />
            <div>
              <h1 className="text-base font-black text-white tracking-wide uppercase font-headline group-hover:text-cyan-400 transition-colors">
                {t.brand}
              </h1>
              <p className="text-[9px] text-purple-400 font-mono tracking-widest uppercase">
                {t.brand_subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSelector currentLang={lang} onLanguageChange={handleLanguageChange} />

            <button
              onClick={() => navigate('/gardens')}
              className={`px-3 py-1.5 rounded-full border transition-all cursor-pointer text-xs font-bold ${
                screen === 'gardens'
                  ? 'bg-cyan-950 text-cyan-400 border-cyan-500/40'
                  : 'bg-purple-950/30 hover:bg-purple-900/50 text-purple-300 hover:text-cyan-400 border-purple-500/20'
              }`}
            >
              {t.gardens}
            </button>

            {currentUser ? (
              <div id="header-user-controls" className="flex items-center gap-2 bg-purple-950/15 border border-purple-500/10 px-2.5 py-1.5 rounded-full">
                <button
                  onClick={() => navigate('/gardens')}
                  className={`p-1.5 rounded-full border transition-all cursor-pointer flex items-center justify-center ${
                    screen === 'gardens'
                      ? 'bg-cyan-950 text-cyan-400 border-cyan-500/40 shadow-[0_0_10px_rgba(34,211,238,0.35)]'
                      : 'bg-[#131b2e] hover:bg-[#18233c] text-purple-300 hover:text-cyan-400 border-purple-500/20'
                  }`}
                  style={{ minWidth: '28px', minHeight: '28px' }}
                  title={t.gardens}
                >
                  <Sprout size={13} />
                </button>

                <button
                  id="profile-btn"
                  onClick={() => navigate('/profile')}
                  className={`p-1.5 rounded-full border transition-all cursor-pointer flex items-center justify-center ${
                    screen === 'profile'
                      ? 'bg-cyan-950 text-cyan-400 border-cyan-500/40 shadow-[0_0_10px_rgba(34,211,238,0.35)]'
                      : 'bg-[#131b2e] hover:bg-[#18233c] text-purple-300 hover:text-cyan-400 border-purple-500/20'
                  }`}
                  style={{ minWidth: '28px', minHeight: '28px' }}
                  title={t.user_page_title}
                >
                  <UserIcon size={13} />
                </button>

                <button
                  onClick={() => setIsInboxOpen(true)}
                  className="relative p-1.5 rounded-full bg-[#131b2e] hover:bg-[#18233c] text-cyan-400 border border-cyan-400/25 transition-all cursor-pointer flex items-center justify-center"
                  style={{ minWidth: '28px', minHeight: '28px' }}
                  title={t.secure_inbox}
                >
                  <Mail size={13} />
                  {unreadMailCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[8px] font-mono font-black text-white flex items-center justify-center">
                      {unreadMailCount}
                    </span>
                  )}
                </button>

                <div className="w-px h-5 bg-purple-500/10 mx-0.5" />

                <button 
                  onClick={() => navigate('/profile')}
                  title={t.view_profile}
                  className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors text-left cursor-pointer"
                >
                  <UserCheck size={12} className="text-cyan-400" />
                  <span className="text-[11px] font-mono font-bold text-gray-200 truncate max-w-[120px]">
                    {currentUser.email.split('@')[0]}
                  </span>
                </button>
                
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                  (currentUser.paidGardens?.length ?? 0) > 0 ? 'bg-cyan-950 text-cyan-400 border border-cyan-500/20' : 'bg-red-950 text-red-300 border border-red-500/10'
                }`}>
                  {(currentUser.paidGardens?.length ?? 0) > 0 ? t.membership_paid : t.membership_free}
                </span>

                <button
                  onClick={handleLogout}
                  className="text-red-400/70 hover:text-red-300 transition-colors cursor-pointer p-1"
                  title={t.logout_session}
                >
                  <LogOut size={13} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/gardens')}
                  className="px-3 py-1.5 rounded-full border border-purple-500/20 text-purple-300 hover:text-cyan-400 font-bold text-xs hover:border-purple-500/40 transition-all cursor-pointer"
                >
                  {t.gardens}
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-extrabold text-xs tracking-wide hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer"
                >
                  {t.login_title}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {screen === 'landing' && (
        <section className="w-full px-4 pt-20 pb-12 text-center relative overflow-hidden flex flex-col items-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] -z-10" />
          <div className="absolute top-20 left-1/4 w-64 h-64 bg-purple-500/10 blur-[120px] rounded-full -z-10" />
          <div className="absolute bottom-10 right-1/4 w-64 h-64 bg-cyan-500/10 blur-[120px] rounded-full -z-10" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="flex flex-col items-center gap-6 max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-950/40 border border-purple-500/30 rounded-full text-[10px] text-cyan-400 font-mono font-bold tracking-widest uppercase"
            >
              <Sparkles size={11} className="animate-pulse" />
              <span>{t.new_era}</span>
            </motion.div>

            <h2 className="text-5xl md:text-7xl font-black text-white leading-tight font-headline text-center">
              {t.hero_title_prefix}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-purple-500 to-cyan-400">
                {t.hero_title_highlight}
              </span>{' '}
              {t.hero_title_suffix}
            </h2>

            <p className="max-w-2xl text-sm md:text-base text-gray-400 leading-relaxed text-center">
              {t.subtitle}
            </p>

            <div className="flex gap-4 mt-2">
              <button
                onClick={() => navigate('/gardens')}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-extrabold text-sm shadow-lg shadow-purple-500/20 hover:shadow-cyan-500/20 transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer"
              >
                {t.explore}
              </button>
              
              {currentUser && (
                <button
                  onClick={() => {
                    if (selectedGarden) navigate('/classroom');
                  }}
                  className="px-8 py-3 rounded-xl bg-[#131B2E] border border-purple-500/20 text-cyan-400 font-bold text-sm hover:border-cyan-500/40 hover:bg-[#1a2440] transition-all duration-200 cursor-pointer"
                >
                  {t.classroomTitle}
                </button>
              )}
            </div>
          </motion.div>
        </section>
      )}
      <main className="w-full max-w-7xl px-4 mt-12 flex-1">
        
        {screen === 'landing' && (
          <><div id="available-gardens-section" className="space-y-8">
            {currentUser && currentUser.paidGardens && currentUser.paidGardens.length > 0 && (
              <div className="mb-8">
                <div className="border-b border-cyan-500/10 pb-4 mb-4">
                  <h3 className="text-xl font-extrabold text-cyan-400 font-headline">
                    {t.my_gardens}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    {t.my_gardens_desc}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {gardens.filter(g => currentUser.paidGardens.includes(g.id)).map((g) => (
                    <motion.div
                      key={g.id}
                      whileHover={{ y: -6 }}
                      className="glass-panel rounded-2xl overflow-hidden flex flex-col justify-between group border-cyan-500/20"
                    >
                      <div className="aspect-video w-full overflow-hidden relative border-b border-cyan-500/10 bg-[#0c101d]">
                        <img
                          src={g.image}
                          alt={g.titleEn}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-3 left-3 px-2 py-0.5 bg-cyan-950/90 border border-cyan-500/30 rounded text-[9px] font-bold text-cyan-400 font-mono">
                          {g.category}
                        </div>
                        <div className="absolute top-3 right-3 px-2 py-0.5 bg-green-950/90 border border-green-500/30 rounded text-[9px] font-bold text-green-400 font-mono">
                          {t.enrolled_badge}
                        </div>
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="text-base font-extrabold text-white tracking-wide group-hover:text-[#22D3EE] transition-colors leading-tight font-headline">
                            {lang === 'ar' ? g.titleAr : lang === 'tr' ? g.titleTr : g.titleEn}
                          </h4>
                          <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                            {lang === 'ar' ? g.descriptionAr : lang === 'tr' ? g.descriptionTr : g.descriptionEn}
                          </p>
                        </div>
                        <div className="mt-4 border-t border-cyan-500/10 pt-3 flex items-center justify-between">
                          <div className="flex items-center gap-1 text-[10px] text-yellow-400/80 font-mono">
                            <span className="text-yellow-400">*</span>
                            <span>{g.rating}</span>
                          </div>
                          {completedGardenIds.has(g.id) ? (
                            <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-[10px] font-extrabold rounded-lg uppercase tracking-wider">
                              <CheckCircle2 size={12} /> {t.completed}
                            </div>
                          ) : (
                            <button
                              onClick={() => handleGardenAccess(g)}
                              className="px-3.5 py-1.5 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-extrabold text-[10px] rounded-lg shadow-md cursor-pointer hover:scale-105 transition-transform uppercase tracking-wider"
                            >
                              {t.open_garden}
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-b border-purple-500/10 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-xl font-extrabold text-white font-headline">
                  {t.available_gardens}
                </h3>
                <p className="text-xs text-gray-400 mt-1">{t.choose_spec}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/gardens')}
                  className="text-xs font-mono bg-purple-600 hover:bg-purple-700 text-white font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                >
                  {t.view_all}
                </button>
                <div className="flex items-center gap-2 text-xs font-mono bg-purple-950/20 border border-purple-500/25 px-3 py-1.5 rounded-xl">
                  <span>{t.realtime_status}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {gardens.length > 0 ? gardens.map((g) => (
                <motion.div
                  key={g.id}
                  whileHover={{ y: -6 }}
                  className="glass-panel rounded-2xl overflow-hidden flex flex-col justify-between group"
                >
                  <div className="aspect-video w-full overflow-hidden relative border-b border-purple-500/10 bg-[#0c101d]">
                    <img
                      src={g.image || null}
                      alt={g.titleEn}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 left-3 px-2 py-0.5 bg-[#131B2E]/90 border border-purple-500/30 rounded text-[9px] font-bold text-[#22D3EE] font-mono">
                      {g.category}
                    </div>
                    {currentUser?.paidGardens?.includes(g.id) && (
                      <div className="absolute top-3 right-3 px-2 py-0.5 bg-green-950/90 border border-green-500/30 rounded text-[9px] font-bold text-green-400 font-mono">
                        {t.enrolled_badge}
                      </div>
                    )}
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                          <h4 className="text-base font-extrabold text-white tracking-wide group-hover:text-[#22D3EE] transition-colors leading-tight font-headline">
                            {lang === 'ar' ? g.titleAr : lang === 'tr' ? g.titleTr : g.titleEn}
                          </h4>
                          <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                        {lang === 'ar' ? g.descriptionAr : lang === 'tr' ? g.descriptionTr : g.descriptionEn}
                      </p>
                    </div>

                    <div className="mt-4 border-t border-purple-500/10 pt-3 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-1 text-[10px] text-yellow-400/80 font-mono">
                          <span className="text-yellow-400">*</span>
                          <span>{g.rating}</span>
                        </div>
                        <div className="text-[11px] font-bold text-cyan-400 mt-1">
                          {lang === 'ar' ? `${g.priceEGP} ${t.currency_egp}` : `${g.priceTRY} ${t.currency_try}`}
                        </div>
                      </div>

                      {currentUser?.paidGardens?.includes(g.id) ? (
                        completedGardenIds.has(g.id) ? (
                          <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-[10px] font-extrabold rounded-lg uppercase tracking-wider">
                            <CheckCircle2 size={12} /> {t.completed}
                          </div>
                        ) : (
                          <button
                            onClick={() => handleGardenAccess(g)}
                            className="px-3.5 py-1.5 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-extrabold text-[10px] rounded-lg shadow-md cursor-pointer hover:scale-105 transition-transform uppercase tracking-wider"
                          >
                            {t.open_garden}
                          </button>
                        )
                      ) : currentUser?.pendingGardens?.includes(g.id) ? (
                        <button
                          className="px-3.5 py-1.5 bg-amber-600/20 border border-amber-500/30 text-amber-400 font-extrabold text-[9px] rounded-lg shadow-md uppercase tracking-wider animate-pulse"
                          disabled
                        >
                          {t.pending_approval}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleGardenAccess(g)}
                          className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-extrabold text-[10px] rounded-lg shadow-md cursor-pointer hover:scale-105 transition-transform uppercase tracking-wider"
                        >
                          {t.plant_skill}
                        </button>
                      )}
                    </div>
                  </div>
                  </motion.div>
              ))
              : (
                <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                  <Sprout size={40} className="text-purple-500/30 mb-3" />
                  <p className="text-sm text-gray-500 font-mono">{t.no_gardens_available}</p>
                </div>
                )}
              </div>
            </div>

            {/* About Section */}
            <section className="pt-24 pb-12">
              <div className="relative mb-12 text-center">
                <div className="absolute inset-0 flex items-center justify-center -z-10">
                  <div className="w-32 h-32 bg-purple-500/5 blur-[100px] rounded-full" />
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-950/40 border border-purple-500/30 rounded-full text-[10px] text-cyan-400 font-mono font-bold tracking-widest uppercase mb-4">
                    <Info size={11} />
                    <span>{t.about_title}</span>
                  </div>
                  <h3 className="text-3xl md:text-4xl font-black text-white font-headline mb-4">
                    {t.about_title}
                  </h3>
                  <p className="max-w-3xl mx-auto text-sm md:text-base text-gray-400 leading-relaxed">
                    {t.about_description}
                  </p>
                </motion.div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
                {[
                  { icon: UserCheck, value: stats ? `${stats.totalUsers}+` : '—', label: t.about_stat_students },
                  { icon: BookOpen, value: stats ? String(stats.totalGardens) : '—', label: t.about_stat_courses },
                  { icon: Globe, value: stats ? String(stats.totalCountries) : '—', label: t.about_stat_countries },
                  { icon: GraduationCap, value: stats ? `${stats.totalSeeds}+` : '—', label: t.about_stat_lessons },
                ].map((stat, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1, duration: 0.5 }}
                    className="relative group"
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-2xl opacity-0 group-hover:opacity-20 blur transition-all duration-500" />
                    <div className="relative glass-panel rounded-2xl p-5 text-center">
                      <stat.icon size={22} className="mx-auto mb-2 text-cyan-400" />
                      <div className="text-2xl md:text-3xl font-black text-white font-headline">{stat.value}</div>
                      <div className="text-[10px] text-gray-400 font-mono mt-1 uppercase tracking-wider">{stat.label}</div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Mission & Vision */}
              <div className="grid md:grid-cols-2 gap-6 mb-16">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="glass-panel rounded-2xl p-6 md:p-8 relative overflow-hidden group"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500 to-cyan-500" />
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                      <Target size={20} className="text-purple-400" />
                    </div>
                    <h4 className="text-lg font-extrabold text-white font-headline">{t.about_mission}</h4>
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">{t.about_mission_desc}</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="glass-panel rounded-2xl p-6 md:p-8 relative overflow-hidden group"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-cyan-500 to-purple-500" />
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-cyan-500/10 rounded-lg">
                      <Compass size={20} className="text-cyan-400" />
                    </div>
                    <h4 className="text-lg font-extrabold text-white font-headline">{t.about_vision}</h4>
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">{t.about_vision_desc}</p>
                </motion.div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  { icon: BrainCircuit, title: t.about_feature_1_title, desc: t.about_feature_1_desc },
                  { icon: Sparkles, title: t.about_feature_2_title, desc: t.about_feature_2_desc },
                  { icon: Award, title: t.about_feature_3_title, desc: t.about_feature_3_desc },
                  { icon: Bookmark, title: t.about_feature_4_title, desc: t.about_feature_4_desc },
                ].map((feat, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1, duration: 0.5 }}
                    className="glass-panel rounded-2xl p-5 group hover:border-purple-500/30 transition-all duration-300"
                  >
                    <div className="p-2.5 bg-gradient-to-br from-purple-500/10 to-cyan-500/10 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform duration-300">
                      <feat.icon size={18} className="text-cyan-400" />
                    </div>
                    <h5 className="text-sm font-extrabold text-white mb-2 font-headline">{feat.title}</h5>
                    <p className="text-[11px] text-gray-400 leading-relaxed">{feat.desc}</p>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Contact Section */}
            <section className="pt-24 pb-12">
              <div className="relative mb-10 text-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-950/40 border border-purple-500/30 rounded-full text-[10px] text-cyan-400 font-mono font-bold tracking-widest uppercase mb-4">
                    <MessageCircle size={11} />
                    <span>{t.contact_title}</span>
                  </div>
                  <h3 className="text-3xl md:text-4xl font-black text-white font-headline mb-4">
                    {t.contact_title}
                  </h3>
                  <p className="max-w-2xl mx-auto text-sm md:text-base text-gray-400 leading-relaxed">
                    {t.contact_description}
                  </p>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="max-w-2xl mx-auto"
              >
                <ContactForm t={t} />
              </motion.div>
            </section>
          </>)}
          
          {screen === 'gardens' && (
          <div className="space-y-8">
            {currentUser && currentUser.paidGardens && currentUser.paidGardens.length > 0 && (
              <div className="mb-8">
                <div className="border-b border-cyan-500/10 pb-4 mb-4">
                  <h3 className="text-xl font-extrabold text-cyan-400 font-headline">
                    {t.my_gardens}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    {t.my_gardens_desc}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {gardens.filter(g => currentUser.paidGardens.includes(g.id)).map((g) => (
                    <motion.div
                      key={g.id}
                      whileHover={{ y: -6 }}
                      className="glass-panel rounded-2xl overflow-hidden flex flex-col justify-between group border-cyan-500/20"
                    >
                      <div className="aspect-video w-full overflow-hidden relative border-b border-cyan-500/10 bg-[#0c101d]">
                        <img
                          src={g.image}
                          alt={g.titleEn}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-3 left-3 px-2 py-0.5 bg-cyan-950/90 border border-cyan-500/30 rounded text-[9px] font-bold text-cyan-400 font-mono">
                          {g.category}
                        </div>
                        <div className="absolute top-3 right-3 px-2 py-0.5 bg-green-950/90 border border-green-500/30 rounded text-[9px] font-bold text-green-400 font-mono">
                          {t.enrolled_badge}
                        </div>
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="text-base font-extrabold text-white tracking-wide group-hover:text-[#22D3EE] transition-colors leading-tight font-headline">
                            {lang === 'ar' ? g.titleAr : lang === 'tr' ? g.titleTr : g.titleEn}
                          </h4>
                          <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                            {lang === 'ar' ? g.descriptionAr : lang === 'tr' ? g.descriptionTr : g.descriptionEn}
                          </p>
                        </div>
                        <div className="mt-4 border-t border-cyan-500/10 pt-3 flex items-center justify-between">
                          <div className="flex items-center gap-1 text-[10px] text-yellow-400/80 font-mono">
                            <span className="text-yellow-400">*</span>
                            <span>{g.rating}</span>
                          </div>
                          {completedGardenIds.has(g.id) ? (
                            <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-[10px] font-extrabold rounded-lg uppercase tracking-wider">
                              <CheckCircle2 size={12} /> {t.completed}
                            </div>
                          ) : (
                            <button
                              onClick={() => handleGardenAccess(g)}
                              className="px-3.5 py-1.5 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-extrabold text-[10px] rounded-lg shadow-md cursor-pointer hover:scale-105 transition-transform uppercase tracking-wider"
                            >
                              {t.open_garden}
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-b border-purple-500/10 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-xl font-extrabold text-white font-headline">
                  {t.all_gardens}
                </h3>
                <p className="text-xs text-gray-400 mt-1">{t.choose_spec}</p>
              </div>
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-1 text-xs text-purple-400 hover:text-cyan-400 font-mono font-bold transition-colors cursor-pointer"
              >
                <ArrowLeft size={14} />
                {t.back_to_home}
              </button>
            </div>
            <div>
              <div className="border-b border-purple-500/10 pb-4 mb-4">
                <h3 className="text-xl font-extrabold text-purple-400 font-headline">
                  {t.browse_gardens}
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  {t.discover_courses}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {gardens.length > 0 ? gardens.map((g) => (
                  <motion.div
                    key={g.id}
                    whileHover={{ y: -6 }}
                    className="glass-panel rounded-2xl overflow-hidden flex flex-col justify-between group"
                  >
                    <div className="aspect-video w-full overflow-hidden relative border-b border-purple-500/10 bg-[#0c101d]">
                      <img
                        src={g.image}
                        alt={g.titleEn}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-3 left-3 px-2 py-0.5 bg-[#131B2E]/90 border border-purple-500/30 rounded text-[9px] font-bold text-[#22D3EE] font-mono">
                        {g.category}
                      </div>
                      {currentUser?.paidGardens?.includes(g.id) && (
                        <div className="absolute top-3 right-3 px-2 py-0.5 bg-green-950/90 border border-green-500/30 rounded text-[9px] font-bold text-green-400 font-mono">
                          {t.enrolled_badge}
                        </div>
                      )}
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="text-base font-extrabold text-white tracking-wide group-hover:text-[#22D3EE] transition-colors leading-tight font-headline">
                          {lang === 'ar' ? g.titleAr : lang === 'tr' ? g.titleTr : g.titleEn}
                        </h4>
                        <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                          {lang === 'ar' ? g.descriptionAr : lang === 'tr' ? g.descriptionTr : g.descriptionEn}
                        </p>
                      </div>

                      <div className="mt-4 border-t border-purple-500/10 pt-3 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-1 text-[10px] text-yellow-400/80 font-mono">
                            <span className="text-yellow-400">*</span>
                            <span>{g.rating}</span>
                          </div>
                          <div className="text-[11px] font-bold text-cyan-400 mt-1">
                            {lang === 'ar' ? `${g.priceEGP} ${t.currency_egp}` : `${g.priceTRY} ${t.currency_try}`}
                          </div>
                        </div>

                        {currentUser?.paidGardens?.includes(g.id) ? (
                          completedGardenIds.has(g.id) ? (
                            <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-[10px] font-extrabold rounded-lg uppercase tracking-wider">
                              <CheckCircle2 size={12} /> {t.completed}
                            </div>
                          ) : (
                            <button
                              onClick={() => handleGardenAccess(g)}
                              className="px-3.5 py-1.5 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-extrabold text-[10px] rounded-lg shadow-md cursor-pointer hover:scale-105 transition-transform uppercase tracking-wider"
                            >
                              {t.open_garden}
                            </button>
                          )
                        ) : currentUser?.pendingGardens?.includes(g.id) ? (
                          <button
                            className="px-3.5 py-1.5 bg-amber-600/20 border border-amber-500/30 text-amber-400 font-extrabold text-[9px] rounded-lg shadow-md uppercase tracking-wider animate-pulse"
                            disabled
                          >
                            {t.pending_approval}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleGardenAccess(g)}
                            className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-extrabold text-[10px] rounded-lg shadow-md cursor-pointer hover:scale-105 transition-transform uppercase tracking-wider"
                          >
                            {t.plant_skill}
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
              ))
              : (
                <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                  <Sprout size={40} className="text-purple-500/30 mb-3" />
                  <p className="text-sm text-gray-500 font-mono">{t.no_gardens_available}</p>
                </div>
                )}
              </div>
            </div>
          </div>
        )}

        {screen === 'login' && (
          <div className="max-w-md mx-auto glass-panel rounded-2xl p-8 border border-purple-500/20 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
            <h2 className="text-2xl font-extrabold text-white text-center font-headline">{t.login_title}</h2>
            <p className="text-xs text-gray-400 text-center mt-1.5 mb-6">{t.login_subtitle}</p>

            {authError && (
              <div className="p-3 bg-red-950/30 border border-red-500/20 text-red-400 rounded-xl text-center text-xs mb-4 font-mono">
                {authError}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-semibold text-purple-300 block uppercase tracking-wider">{t.email_or_phone}</label>
                <div className="flex items-center gap-2 rounded-xl border border-purple-500/20 bg-[#090D16]/60 px-3 py-2.5 focus-within:border-cyan-500/40 transition-colors">
                  <Mail size={15} className="text-cyan-400/60 flex-shrink-0" />
                  <input
                    type="text"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder={t.email_placeholder}
                    className="flex-1 bg-transparent border-0 text-sm text-white placeholder-gray-600 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-mono font-semibold text-purple-300 uppercase tracking-wider">{t.password}</label>
                  <button type="button" onClick={() => navigate('/forgot-password')} className="text-[9px] text-cyan-400/70 hover:text-cyan-300 font-mono cursor-pointer transition-colors">{t.forgot_password}</button>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-purple-500/20 bg-[#090D16]/60 px-3 py-2.5 focus-within:border-cyan-500/40 transition-colors">
                  <Lock size={15} className="text-cyan-400/60 flex-shrink-0" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={passInput}
                    onChange={(e) => setPassInput(e.target.value)}
                    placeholder={t.password_placeholder}
                    className="flex-1 bg-transparent border-0 text-sm text-white placeholder-gray-600 focus:outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="text-gray-500 hover:text-white cursor-pointer px-1 transition-colors"
                  >
                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-extrabold text-sm shadow-lg shadow-purple-500/20 hover:shadow-cyan-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer"
              >
                {t.login_title}
              </button>
            </form>

            <div className="mt-5 text-center">
              <button
                onClick={() => navigate('/register')}
                className="text-xs text-purple-400 hover:text-cyan-400 font-semibold transition-colors"
              >
                {t.create_account}
              </button>
            </div>
          </div>
        )}

        {screen === 'register' && (
          <div className="max-w-md mx-auto glass-panel rounded-2xl p-8 border border-purple-500/20 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
            <h2 className="text-2xl font-extrabold text-white text-center font-headline">{t.create_account}</h2>
            <p className="text-xs text-gray-400 text-center mt-1.5 mb-6">{t.register_subtitle}</p>

            {authError && (
              <div className="p-3 bg-red-950/30 border border-red-500/20 text-red-400 rounded-xl text-center text-xs mb-4 font-mono">
                {authError}
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-semibold text-purple-300 block uppercase tracking-wider">{t.email_address}</label>
                <div className="flex items-center gap-2 rounded-xl border border-purple-500/20 bg-[#090D16]/60 px-3 py-2.5 focus-within:border-cyan-500/40 transition-colors">
                  <Mail size={15} className="text-cyan-400/60 flex-shrink-0" />
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder={t.email_placeholder}
                    className="flex-1 bg-transparent border-0 text-sm text-white placeholder-gray-600 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-semibold text-purple-300 block uppercase tracking-wider">{t.full_name}</label>
                <div className="flex items-center gap-2 rounded-xl border border-purple-500/20 bg-[#090D16]/60 px-3 py-2.5 focus-within:border-cyan-500/40 transition-colors">
                  <UserIcon size={15} className="text-cyan-400/60 flex-shrink-0" />
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder={t.full_name_placeholder}
                    className="flex-1 bg-transparent border-0 text-sm text-white placeholder-gray-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-semibold text-purple-300 block uppercase tracking-wider">{t.phone_wallet_num}</label>
                <div className="flex items-center gap-2 rounded-xl border border-purple-500/20 bg-[#090D16]/60 px-3 py-2.5 focus-within:border-cyan-500/40 transition-colors">
                  <Phone size={15} className="text-cyan-400/60 flex-shrink-0" />
                  <input
                    type="text"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder={t.phone_placeholder}
                    className="flex-1 bg-transparent border-0 text-sm text-white placeholder-gray-600 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-semibold text-purple-300 block uppercase tracking-wider">{t.password}</label>
                <div className="flex items-center gap-2 rounded-xl border border-purple-500/20 bg-[#090D16]/60 px-3 py-2.5 focus-within:border-cyan-500/40 transition-colors">
                  <Lock size={15} className="text-cyan-400/60 flex-shrink-0" />
                  <input
                    type="password"
                    value={passInput}
                    onChange={(e) => setPassInput(e.target.value)}
                    placeholder={t.password_placeholder}
                    className="flex-1 bg-transparent border-0 text-sm text-white placeholder-gray-600 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-extrabold text-sm shadow-lg shadow-purple-500/20 hover:shadow-cyan-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer"
              >
                {t.create_account}
              </button>
            </form>

            <div className="mt-5 text-center">
              <button
                onClick={() => navigate('/login')}
                className="text-xs text-purple-400 hover:text-cyan-400 font-semibold transition-colors cursor-pointer"
              >
                {t.already_have_account}
              </button>
            </div>
          </div>
        )}

        {screen === 'verify' && (
          <div className="max-w-md mx-auto glass-panel rounded-2xl p-8 border border-purple-500/20 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
            <h2 className="text-2xl font-extrabold text-white text-center font-headline">{t.verify_title}</h2>
            <p className="text-xs text-gray-400 text-center mt-1.5 mb-6 leading-relaxed">
              {t.verify_subtitle}
            </p>

            {authError && (
              <div className="p-3 bg-red-950/30 border border-red-500/20 text-red-400 rounded-xl text-center text-xs mb-4 font-mono">
                {authError}
              </div>
            )}

            <form onSubmit={handleVerifySubmit} className="space-y-4">
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder={t.sync_key_placeholder}
                maxLength={6}
                className="w-full bg-[#090D16] border-2 border-purple-500/20 rounded-xl py-3.5 text-center text-xl font-bold text-white tracking-[0.3em] focus:outline-none focus:border-cyan-400 transition-colors"
                required
              />

              <div className="space-y-3">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-extrabold text-sm shadow-lg shadow-purple-500/20 hover:shadow-cyan-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer"
                >
                  {t.verify_btn}
                </button>

                <button
                  type="button"
                  onClick={handleResendCode}
                  className="w-full py-2 text-[10px] text-purple-400 hover:text-cyan-400 font-semibold uppercase tracking-widest cursor-pointer transition-colors"
                >
                  {t.resend_btn}
                </button>
              </div>
            </form>
          </div>
        )}

        {screen === 'forgot_password' && (
          <div className="max-w-md mx-auto glass-panel rounded-2xl p-8 border border-purple-500/20 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
            <h2 className="text-2xl font-extrabold text-white text-center font-headline">{t.forgot_password_title}</h2>
            <p className="text-xs text-gray-400 text-center mt-1.5 mb-6 leading-relaxed">
              {t.forgot_password_subtitle}
            </p>

            {authError && (
              <div className="p-3 bg-red-950/30 border border-red-500/20 text-red-400 rounded-xl text-center text-xs mb-4 font-mono">
                {authError}
              </div>
            )}
            {successMsg && (
              <div className="p-3 bg-green-950/30 border border-green-500/20 text-green-400 rounded-xl text-center text-xs mb-4 font-mono">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
              <div className="flex items-center gap-2 rounded-xl border border-purple-500/20 bg-[#090D16]/60 px-3 py-2.5 focus-within:border-cyan-500/40 transition-colors">
                <Mail size={15} className="text-cyan-400/60 flex-shrink-0" />
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder={t.email_placeholder}
                  className="flex-1 bg-transparent border-0 text-sm text-white placeholder-gray-600 focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={resetLoading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-extrabold text-sm shadow-lg shadow-purple-500/20 hover:shadow-cyan-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
              >
                {resetLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    {t.sending || '...'}
                  </span>
                ) : t.send_reset_btn}
              </button>
            </form>
            <div className="mt-5 text-center">
              <button onClick={() => navigate('/login')} className="text-xs text-purple-400 hover:text-cyan-400 font-semibold transition-colors cursor-pointer">
                {t.already_have_account.split(/[?؟]/)[1]?.trim() || t.login_title}
              </button>
            </div>
          </div>
        )}
        {screen === 'classroom' && selectedGarden && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div className="lg:col-span-2 space-y-6">
              
              <div className="flex items-center gap-2 bg-[#131B2E]/80 p-3 rounded-xl border border-purple-500/10 text-xs backdrop-blur-sm">
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/10">
                  <Compass className="text-cyan-400" size={14} />
                  <span className="text-purple-300 font-bold uppercase tracking-widest text-[10px]">{t.classroom_path}</span>
                </div>
                <ChevronRight size={14} className="text-purple-500/40 flex-shrink-0" />
                <span className="text-white/90 font-semibold truncate">{lang === 'ar' ? selectedGarden.titleAr : lang === 'tr' ? selectedGarden.titleTr : selectedGarden.titleEn}</span>
                {activeSeed && (
                  <>
                    <ChevronRight size={14} className="text-purple-500/40 flex-shrink-0" />
                    <span className={`font-mono truncate ${gardenProgress?.seedProgressDetails?.find(d => d.seedId === activeSeed.id)?.isCompleted ? 'text-green-400' : 'text-cyan-400'}`}>
                      {lang === 'ar' ? activeSeed.titleAr : lang === 'tr' ? activeSeed.titleTr : activeSeed.titleEn}
                    </span>
                    {gardenProgress?.seedProgressDetails?.find(d => d.seedId === activeSeed.id)?.isCompleted && (
                      <CheckCircle2 size={14} className="text-green-400 flex-shrink-0" />
                    )}
                  </>
                )}
              </div>

              {activeSeed && (
                <div className="glass-panel rounded-2xl border border-purple-500/15 p-5 bg-gradient-to-br from-[#131B2E] to-[#0e1424]">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-base font-bold text-white truncate">
                          {lang === 'ar' ? activeSeed.titleAr : lang === 'tr' ? activeSeed.titleTr : activeSeed.titleEn}
                        </h3>
                        {gardenProgress?.seedProgressDetails?.find(d => d.seedId === activeSeed.id)?.isCompleted && (
                          <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            <CheckCircle2 size={11} /> {t.completed}
                          </span>
                        )}
                      </div>
                      {activeSeed.descriptionEn && (
                        <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                          {lang === 'ar' ? activeSeed.descriptionAr : lang === 'tr' ? activeSeed.descriptionTr : activeSeed.descriptionEn}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        <span className="text-[10px] text-gray-500 font-mono flex items-center gap-1">
                          <Clock size={11} /> {activeSeed.duration}
                        </span>
                        <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${
                          getSeedDifficulty(activeSeed) === 'Beginner' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/20' :
                          getSeedDifficulty(activeSeed) === 'Intermediate' ? 'bg-amber-950/40 text-amber-400 border border-amber-500/20' :
                          'bg-red-950/40 text-red-400 border border-red-500/20'
                        }`}>
                          {getSeedDifficulty(activeSeed) === 'Beginner' ? t.beginner :
                           getSeedDifficulty(activeSeed) === 'Intermediate' ? t.intermediate :
                           t.difficult}
                        </span>
                        {activeSeed.tags && activeSeed.tags.length > 0 && activeSeed.tags.slice(0, 3).map((tag, i) => (
                          <span key={i} className={`px-2 py-0.5 rounded-full text-[8px] font-mono border uppercase tracking-wider ${getTagStyles(tag)}`}>{tag}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex-shrink-0 flex items-center gap-2">
                      <div className="flex flex-col items-center">
                        <span className="text-xl font-bold font-mono text-white">{activeSeedIndex + 1}</span>
                        <span className="text-[9px] text-gray-500 font-mono uppercase">{t.of} {processedSeeds.length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSeed && videoResolving && !resolvedVideoUrl && !activeSeed.videoUrl?.startsWith('bunny_mock') && activeSeed.videoUrl ? (
                <div className="glass-panel rounded-2xl border border-purple-500/15 p-12 flex flex-col items-center gap-4">
                  <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-gray-500 text-sm">Resolving secure stream...</p>
                </div>
              ) : null}
              {activeSeed && (
                <SecureVideoPlayer
                  key={activeSeed.id}
                  seedId={activeSeed.id}
                  videoUrl={resolvedVideoUrl || activeSeed.videoUrl}
                  studentEmail={currentUser?.email || ''}
                  studentPhone={currentUser?.phone || ''}
                  sessionId={sessionId}
                  lang={lang}
                  onProgressSaved={() => fetchGardenProgress(selectedGarden.id)}
                  onTimeUpdate={(time) => setCurrentVideoTime(time)}
                  seekToTime={seekToTime}
                   onSeekCompleted={() => setSeekToTime(null)}
                   onQuizComplete={handleNextSeed}
                  onComplete={handleMarkComplete}
                />
              )}

              {processedSeeds.length > 1 && (
                <div className="flex justify-between items-center gap-4 mt-4">
                  <button
                    onClick={handlePreviousSeed}
                    disabled={activeSeedIndex <= 0}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#131B2E] border border-purple-500/20 text-purple-300 hover:text-cyan-400 hover:border-cyan-500/30 transition-all duration-200 cursor-pointer text-xs font-mono font-bold group disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ArrowLeft size={14} className={`${lang === 'ar' ? 'rotate-180' : ''} group-hover:-translate-x-1 transition-transform duration-200`} />
                    <span>{t.previous_seed}</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {processedSeeds.map((s, i) => (
                      <button
                        key={s.id}
                        onClick={() => selectActiveSeed(s)}
                        className={`w-2 h-2 rounded-full transition-all duration-200 cursor-pointer ${
                          i === activeSeedIndex
                            ? 'bg-cyan-400 w-5'
                            : gardenProgress?.seedProgressDetails?.find(d => d.seedId === s.id)?.isCompleted
                              ? 'bg-green-500/60'
                              : 'bg-purple-500/30 hover:bg-purple-500/50'
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={handleNextSeed}
                    disabled={activeSeedIndex >= processedSeeds.length - 1}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#131B2E] border border-purple-500/20 text-purple-300 hover:text-cyan-400 hover:border-cyan-500/30 transition-all duration-200 cursor-pointer text-xs font-mono font-bold group disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <span>{t.next_seed}</span>
                    <ArrowLeft size={14} className={`${lang === 'ar' ? '' : 'rotate-180'} group-hover:translate-x-1 transition-transform duration-200`} />
                  </button>
                </div>
              )}


              {activeSeed && (
                <QueriesTab
                  seedId={activeSeed.id}
                  sessionId={sessionId}
                  lang={lang}
                />
              )}
            </div>

            <div className="space-y-6">
              <div className="glass-panel p-4 rounded-2xl border border-purple-500/15 animate-fade-in">
                <div className="flex gap-1 mb-4 p-1 bg-[#0c101d] rounded-xl border border-purple-500/10">
                  {[
                    { key: 'seeds', icon: Flame, label: t.classroom_seeds },
                    { key: 'notebook', icon: BookOpen, label: t.notebook_title },
                    { key: 'quiz', icon: BrainCircuit, label: t.quiz_short },
                  ].map(({ key, icon: Icon, label }) => (
                    <button
                      key={key}
                      onClick={() => setSidebarTab(key)}
                      className={`flex-1 py-2 text-[10px] uppercase font-mono tracking-wider font-extrabold flex items-center justify-center gap-1.5 rounded-lg transition-all duration-200 cursor-pointer ${
                        sidebarTab === key
                          ? 'bg-gradient-to-br from-cyan-500/20 to-purple-500/20 text-white shadow-sm shadow-cyan-500/10 border border-cyan-500/10'
                          : 'text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      <Icon size={12} className={sidebarTab === key ? 'text-cyan-400' : ''} />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>

                {sidebarTab === 'seeds' ? (
                  <div className="space-y-3">
                    {gardenSeeds.length === 0 ? (
                      <div className="text-center py-8 px-4">
                        <Sprout size={28} className="text-purple-500/30 mx-auto mb-2" />
                        <p className="text-xs text-gray-500 font-mono">{t.no_garden_seeds}</p>
                      </div>
                    ) : (<>
                    {(sidebarSort !== 'index' || difficultyFilter !== 'all' || durationFilter !== 'all' || tagFilter !== 'all') && (
                      <button
                        onClick={() => {
                          setSidebarSort('index');
                          setDifficultyFilter('all');
                          setDurationFilter('all');
                          setTagFilter('all');
                        }}
                        className="w-full text-[9px] text-cyan-400 hover:text-cyan-300 underline cursor-pointer text-center py-1"
                      >
                        {t.reset} filters
                      </button>
                    )}

                    <div className="grid grid-cols-4 gap-1.5">
                      <SelectDropdown
                        options={[
                          { value: 'index', label: t.default_order },
                          { value: 'difficulty-asc', label: t.difficulty_low_high },
                          { value: 'difficulty-desc', label: t.difficulty_high_low },
                          { value: 'duration-asc', label: t.duration_short_long },
                          { value: 'duration-desc', label: t.duration_long_short },
                          { value: 'tag-count-desc', label: t.skill_tag_count },
                        ]}
                        value={sidebarSort}
                        onChange={setSidebarSort}
                      />
                      <SelectDropdown
                        options={[
                          { value: 'all', label: t.difficulty },
                          { value: 'Beginner', label: t.beginner },
                          { value: 'Intermediate', label: t.intermediate },
                          { value: 'Advanced', label: t.advanced },
                        ]}
                        value={difficultyFilter}
                        onChange={setDifficultyFilter}
                      />
                      <SelectDropdown
                        options={[
                          { value: 'all', label: t.duration },
                          { value: 'short', label: t.short_duration },
                          { value: 'medium', label: t.medium_duration },
                          { value: 'long', label: t.long_duration },
                        ]}
                        value={durationFilter}
                        onChange={setDurationFilter}
                      />
                      <SelectDropdown
                        options={[
                          { value: 'all', label: t.skill_tag },
                          ...uniqueTags.map(tag => ({ value: tag, label: tag })),
                        ]}
                        value={tagFilter}
                        onChange={setTagFilter}
                      />
                    </div>

                    {processedSeeds.length === 0 ? (
                      <div className="text-center py-6 px-4 bg-[#0a0d16]/70 border border-purple-500/10 rounded-2xl">
                        <Filter className="text-gray-650 mx-auto mb-2" size={18} />
                        <p className="text-xs text-gray-300 font-bold mb-0.5">
                          {t.no_matching_seeds}
                        </p>
                        <p className="text-[10px] text-gray-500">
                          {t.adjust_filters}
                        </p>
                      </div>
                    ) : (
                      (() => {
                        const grouped = {};
                        let globalIdx = 0;
                        processedSeeds.forEach(seed => {
                          const sec = gardenSeeds.find(s => s.id === seed.id)?.section || 'General';
                          if (!grouped[sec]) grouped[sec] = { seeds: [], globalStart: globalIdx };
                          grouped[sec].seeds.push(seed);
                          globalIdx++;
                        });
                        return Object.entries(grouped).flatMap(([secName, { seeds: secSeeds, globalStart }]) => {
                          const items = [];
                          items.push(
                            <div key={`section-${secName}`} className="text-[9px] text-purple-500/60 font-mono uppercase tracking-wider px-1 py-2 border-b border-purple-500/10 mb-1">
                              {secName}
                            </div>
                          );
                          secSeeds.forEach((seed, localIdx) => {
                            const originalIndex = gardenSeeds.findIndex(s => s.id === seed.id);
                            const isActive = activeSeed?.id === seed.id;
                            const isCompleted = gardenProgress?.seedProgressDetails?.find((d) => d.seedId === seed.id)?.isCompleted || false;
                            const isBlooming = bloomedSeedIds.has(seed.id);
                            const difficulty = getSeedDifficulty(seed);
                            items.push(
                              <motion.button
                                key={seed.id}
                                id={`seed-card-${seed.id}`}
                                onClick={() => selectActiveSeed(seed)}
                                animate={{
                                  scale: isBlooming ? [1, 1.06, 0.97, 1.03, 1] : 1,
                                  borderColor: isBlooming 
                                    ? ["rgba(0,0,0,0)", "rgb(16, 185, 129)", "rgb(34, 211, 238)", "rgba(168, 85, 247, 0.2)"]
                                    : isActive 
                                      ? 'rgba(34, 211, 238, 0.5)' 
                                      : 'rgba(168, 85, 247, 0.1)',
                                  boxShadow: isBlooming
                                    ? [
                                        "0 0 0px rgba(16, 185, 129, 0)",
                                        "0 0 20px rgba(16, 185, 129, 0.7)",
                                        "0 0 30px rgba(34, 211, 238, 0.9)",
                                        "0 0 0px rgba(34, 211, 238, 0)"
                                      ]
                                    : isActive 
                                      ? '0 0 12px rgba(34, 211, 238, 0.08)' 
                                      : 'none'
                                }}
                                transition={isBlooming ? { duration: 1.8, ease: "easeInOut" } : { duration: 0.2 }}
                                className={`flex items-center gap-3 w-full p-3 rounded-xl text-left border cursor-pointer relative overflow-hidden focus:outline-none transition-all duration-300 ${
                                  isActive
                                    ? 'bg-gradient-to-r from-cyan-950/30 to-purple-950/20 text-cyan-300 ring-1 ring-cyan-500/25 shadow-lg shadow-cyan-500/5'
                                    : 'bg-[#0c101d]/80 hover:bg-[#111827] text-gray-300 border-transparent hover:border-purple-500/20'
                                } ${isCompleted ? 'opacity-80' : ''}`}
                              >
                                {isBlooming && (
                                  <div id={`particles-${seed.id}`} className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
                                    <motion.div
                                      initial={{ scale: 0.7, opacity: 0 }}
                                      animate={{ scale: [0.7, 2.3, 2.6], opacity: [0, 0.6, 0] }}
                                      transition={{ duration: 1.6, ease: "easeOut" }}
                                      className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500/30 via-cyan-500/40 to-purple-500/30 blur-md"
                                    />
                                    {[...Array(6)].map((_, i) => (
                                      <motion.span
                                        key={i}
                                        initial={{ y: 25, x: (i - 2.5) * 16 + (Math.random() - 0.5) * 8, scale: 0, opacity: 1 }}
                                        animate={{ y: -45, scale: [0, 1.4, 0], opacity: [0, 1, 0] }}
                                        transition={{ duration: 1.6 + Math.random() * 0.4, delay: i * 0.1, ease: "easeOut" }}
                                        className="absolute bottom-2 left-1/2 text-cyan-400 text-xs font-mono select-none"
                                      >
                                        {i % 2 === 0 ? '*' : '~'}
                                      </motion.span>
                                    ))}
                                  </div>
                                )}

                                <div className={`flex-shrink-0 w-8 h-8 rounded-xl border flex items-center justify-center text-xs font-mono font-bold transition-all ${
                                  isCompleted
                                    ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
                                    : isActive
                                      ? 'bg-cyan-950/40 border-cyan-500/30 text-cyan-400'
                                      : 'bg-purple-950/40 border-purple-500/20 text-purple-400'
                                }`}>
                                  {isCompleted ? <CheckCircle2 size={18} /> : originalIndex + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className={`text-sm font-semibold truncate ${isCompleted ? 'text-gray-400' : isActive ? 'text-white' : 'text-gray-200'}`}>
                                    {lang === 'ar' ? seed.titleAr : lang === 'tr' ? seed.titleTr : seed.titleEn}
                                  </h4>

                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] text-gray-500 font-mono flex items-center gap-1">
                                      <Clock size={10} /> {seed.duration}
                                    </span>
                                    <span className="text-gray-600 text-[9px]">|</span>
                                    <span className={`text-[9px] font-mono font-medium px-1.5 py-0.5 rounded ${
                                      difficulty === 'Beginner' ? 'bg-emerald-950/30 text-emerald-400' :
                                      difficulty === 'Intermediate' ? 'bg-amber-950/30 text-amber-400' :
                                      'bg-red-950/30 text-red-400'
                                    }`}>
                                      {difficulty === 'Beginner' ? t.beginner :
                                       difficulty === 'Intermediate' ? t.intermediate :
                                       t.difficult}
                                    </span>
                                    {isCompleted && (
                                      <span className="text-[9px] text-emerald-500 font-mono font-medium">{t.completed}</span>
                                    )}
                                  </div>

                                  {seed.tags && seed.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1.5">
                                      {seed.tags.slice(0, 3).map((tag, tIdx) => (
                                        <span
                                          key={tIdx}
                                          className={`px-1.5 py-0.5 rounded text-[7px] font-mono border uppercase tracking-wider ${getTagStyles(tag)}`}
                                        >
                                          {tag}
                                        </span>
                                      ))}
                                      {seed.tags.length > 3 && (
                                        <span className="text-[7px] text-gray-500 font-mono">+{seed.tags.length - 3}</span>
                                      )}
                                    </div>
                                  )}
                                </div>
                                {!isCompleted && (
                                  <span
                                    onClick={(e) => { e.stopPropagation(); handleDirectComplete(seed.id); }}
                                    className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold transition-all hover:scale-105 cursor-pointer"
                                  >
                                    Mark Done
                                  </span>
                                )}
                              </motion.button>
                            );
                          });
                          return items;
                        });
                      })()
                    )}
                  </>)}
                </div>
                ) : sidebarTab === 'notebook' ? (
                  <DigitalNotebook
                    seedId={activeSeed?.id || ''}
                    studentEmail={currentUser?.email || ''}
                    currentVideoTime={currentVideoTime}
                    onSeekTo={(time) => setSeekToTime(time)}
                    lang={lang}
                  />
                ) : sidebarTab === 'quiz' && activeSeed ? (
                  <QuizReview
                    seedId={activeSeed.id}
                    sessionId={sessionId}
                    lang={lang}
                    isSeedCompleted={gardenProgress?.seedProgressDetails?.find((d) => d.seedId === activeSeed.id)?.isCompleted || false || quizForceOpen}
                  />
                ) : null}
              </div>
              <div className="p-5 rounded-2xl border border-purple-500/15 bg-gradient-to-br from-[#0e1424] to-[#0a0d16] shadow-lg shadow-black/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/10 flex items-center justify-center">
                      <BarChart3 size={16} className="text-cyan-400" />
                    </div>
                    <div>
                      <h4 className="text-xs uppercase font-mono font-bold tracking-widest text-[#22D3EE]">
                        {t.student_growth_metrics}
                      </h4>
                      <p className="text-[8px] text-gray-500 font-mono mt-0.5">{t.progress_tracking}</p>
                    </div>
                  </div>
                  <div className={`text-sm font-mono font-bold px-3 py-1 rounded-lg border ${
                    (gardenProgress?.completionPercent || 0) >= 100
                      ? 'text-emerald-400 bg-emerald-950/30 border-emerald-500/20'
                      : (gardenProgress?.completionPercent || 0) >= 50
                        ? 'text-amber-400 bg-amber-950/30 border-amber-500/20'
                        : 'text-cyan-400 bg-cyan-950/30 border-cyan-500/20'
                  }`}>
                    {gardenProgress?.completionPercent || 0}%
                  </div>
                </div>

                <div className="w-full bg-[#090D16] rounded-full h-3 overflow-hidden border border-purple-500/10 mb-4">
                  <div 
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{ 
                      width: `${gardenProgress?.completionPercent || 0}%`,
                      background: `linear-gradient(90deg, #a855f7, #22d3ee)`,
                      boxShadow: `0 0 8px ${(gardenProgress?.completionPercent || 0) >= 100 ? 'rgba(16,185,129,0.5)' : 'rgba(34,211,238,0.3)'}`
                    }}
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-[#090D16] border border-purple-500/10 flex flex-col items-center">
                    <span className="text-lg font-bold font-mono text-cyan-400">{gardenProgress?.completedSeedsCount || 0}</span>
                    <span className="text-[8px] text-gray-500 font-mono uppercase tracking-wider mt-1">{t.completed}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#090D16] border border-purple-500/10 flex flex-col items-center">
                    <span className="text-lg font-bold font-mono text-purple-400">{gardenProgress?.totalSeedsCount || gardenSeeds.length}</span>
                    <span className="text-[8px] text-gray-500 font-mono uppercase tracking-wider mt-1">{t.total}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#090D16] border border-purple-500/10 flex flex-col items-center">
                    <span className="text-lg font-bold font-mono text-amber-400">{gardenProgress ? gardenProgress.totalSeedsCount - gardenProgress.completedSeedsCount : gardenSeeds.length}</span>
                    <span className="text-[8px] text-gray-500 font-mono uppercase tracking-wider mt-1">{t.remaining}</span>
                  </div>
                </div>

                <div className="flex justify-between text-[10px] text-gray-500 font-mono mt-4">
                  <span className="flex items-center gap-1.5">
                    <Award size={11} className="text-cyan-400" />
                    {gardenProgress?.completedSeedsCount || 0} / {gardenProgress?.totalSeedsCount || gardenSeeds.length} {t.seeds_bloomed}
                  </span>
                  <span className={`font-semibold ${(gardenProgress?.completionPercent || 0) >= 100 ? 'text-emerald-400' : 'text-gray-400'}`}>
                    {gardenProgress?.completionPercent || 0}%
                  </span>
                </div>

                {reportError && (
                  <div className="p-2.5 bg-red-950/30 border border-red-500/20 text-red-400 rounded-xl text-[10px] leading-relaxed text-center font-mono">
                    {reportError}
                  </div>
                )}
                {reportSuccess && (
                  <div className="p-2.5 bg-green-950/30 border border-green-500/20 text-green-400 rounded-xl text-[10px] leading-relaxed text-center font-mono animate-pulse">
                    {reportSuccess}
                  </div>
                )}

                <div className="border-t border-purple-500/10 pt-3 flex flex-col gap-2.5">
                  
                  {(gardenProgress?.completionPercent || 0) < 100 && (
                    <div className="space-y-2">
                      <p className="text-[10px] text-gray-400 leading-relaxed">
                        {t.report_instruction}
                      </p>
                    </div>
                  )}

                  {(gardenProgress?.completionPercent || 0) === 100 && !gardenProgress?.isReportIssued && !gardenProgress?.isOtpPending && (
                    <div className="space-y-2.5">
                      <p className="text-[11px] font-black text-green-400 animate-pulse text-center">
                        {t.garden_complete}
                      </p>
                      <button
                        onClick={handleRequestReportOtp}
                        disabled={isOtpRequesting}
                        className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-[#22D3EE] text-white text-xs font-black rounded-xl hover:scale-[1.02] transition-transform cursor-pointer text-center flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/10"
                      >
                        {isOtpRequesting ? '...' : t.request_report}
                      </button>
                    </div>
                  )}

                  {gardenProgress?.isOtpPending && (
                    <div className="space-y-2.5 bg-[#0a0d16] p-3 rounded-xl border border-yellow-500/15">
                      <form onSubmit={handleVerifyReportOtp} className="space-y-2">
                        <label className="block text-[10px] text-yellow-500 font-mono font-bold uppercase leading-relaxed text-center">
                          {t.report_otp_label}
                        </label>
                        <input 
                          type="text"
                          placeholder="e.g. 123456"
                          maxLength={6}
                          value={otpCodeInput}
                          onChange={(e) => setOtpCodeInput(e.target.value)}
                          className="w-full text-center py-2 bg-[#080d16] border border-yellow-500/30 text-white rounded-lg text-sm font-mono tracking-widest focus:outline-none focus:border-yellow-400 font-black"
                          required
                        />
                        <button
                          type="submit"
                          disabled={isOtpVerifying}
                          className="w-full py-1.5 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-xs rounded-lg transition-colors cursor-pointer text-center"
                        >
                          {isOtpVerifying ? '...' : t.verify_certificate}
                        </button>
                      </form>
                      <p className="text-[9px] text-gray-500 leading-tight text-center leading-relaxed">
                        {t.otp_instruction}
                      </p>
                    </div>
                  )}

                  {gardenProgress?.isReportIssued && (
                    <div className="space-y-2 text-center bg-green-950/10 p-3 rounded-xl border border-green-500/20">
                      <p className="text-[11px] font-mono font-bold text-green-400 flex items-center justify-center gap-1">
                        <CheckCircle2 size={13} /> {t.certificate_issued}
                      </p>
                      <button
                        onClick={handleViewDispatchedReport}
                        className="w-full py-2 bg-[#131b2e] hover:bg-[#18233c] text-cyan-400 border border-cyan-400/30 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Eye size={12} />
                        {t.view_report}
                      </button>
                    </div>
                  )}

                </div>
              </div>
            </div>

          </div>
        )}

        {screen === 'profile' && currentUser && (
          <UserProfile
            currentUser={currentUser}
            onUpdateCurrentUser={(updatedUser) => setCurrentUser(updatedUser)}
            gardens={gardens}
            selectedGarden={selectedGarden}
            gardenProgress={gardenProgress}
            onBack={() => {
              if (selectedGarden) {
                navigate('/classroom');
              } else {
                navigate('/');
              }
            }}
            onOpenGarden={(garden) => handleGardenAccess(garden)}
            lang={lang}
          />
        )}

        {screen === 'admin' && (
          <AdminPanel
            lang={lang}
            onGardensChange={fetchGardens}
            onClose={() => {
              navigate('/');
              fetchGardens();
            }}
          />
        )}

      </main>

      {checkoutGarden && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="max-w-lg w-full">
            <div className="flex justify-between mb-2">
              <span className="text-[10px] text-cyan-400 font-mono font-bold uppercase">{`Payment Simulation Module`}</span>
              <button
                onClick={() => setCheckoutGarden(null)}
                className="text-gray-400 hover:text-white font-bold text-xs cursor-pointer"
              >
                Cancel Gate
              </button>
            </div>
            
            <CheckoutSandbox
              garden={checkoutGarden}
              sessionId={sessionId}
              lang={lang}
              onPaymentSuccess={async () => {
                setCheckoutGarden(null);
                if (sessionId) {
                  await syncSession(sessionId);
                }
              }}
            />
          </div>
        </div>
      )}

      <MockInbox
        isOpen={isInboxOpen}
        onClose={() => setIsInboxOpen(false)}
        lang={lang}
        sessionId={sessionId}
        emails={emails}
        onEmailRead={fetchEmails}
        onEmailDelete={handleDeleteEmail}
      />

      <GrowthReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        lang={lang}
        report={activeReport}
      />

      <footer className="mt-16 pb-8 text-center text-[10px] text-gray-500 font-mono">
        <div className="w-full max-w-xs mx-auto h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent mb-6" />
        <p>© {new Date().getFullYear()} {t.brand}. {t.rights_reserved}</p>
        <p className="mt-1 text-gray-600">Knowledge Garden Core Server Node v1.4.0</p>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
