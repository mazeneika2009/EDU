import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Maximize, Minimize, Volume2, VolumeX, AlertCircle, ExternalLink, CheckCircle, SkipBack, SkipForward, PictureInPicture2, ChevronDown, ChevronUp } from 'lucide-react';

function isEmbedUrl(url) {
  if (!url) return false;
  if (url.includes('iframe.mediadelivery.net') || url.includes('/embed/')) return true;
  return false;
}

function isPlayableVideoUrl(url) {
  if (!url || url.startsWith('bunny_mock') || url === '') return false;
  if (isEmbedUrl(url)) return false;
  if (!url.startsWith('http') && !url.startsWith('/uploads/')) return false;
  return true;
}

function formatTime(s) {
  if (!s || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}:${(m % 60).toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function Controls({
  playing, currentTime, duration, volume, muted, fullscreen, playbackRate,
  onTogglePlay, onSeek, onToggleMute, onVolumeChange, onToggleFullscreen,
  onTogglePip, onPlaybackRateChange, showPip, buffered
}) {
  const progressRef = useRef(null);
  const [hoverTime, setHoverTime] = useState(null);
  const [hoverPct, setHoverPct] = useState(null);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const speedMenuRef = useRef(null);

  const handleProgressMove = (e) => {
    if (!progressRef.current || !duration) return;
    const rect = progressRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverPct(pct);
    setHoverTime(pct * duration);
  };
  const handleProgressLeave = () => { setHoverTime(null); setHoverPct(null); };
  const handleProgressClick = (e) => {
    if (!progressRef.current || !duration) return;
    const rect = progressRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    onSeek(pct * duration);
  };

  const progressPct = duration ? (currentTime / duration) * 100 : 0;
  const bufferedPct = buffered || 0;

  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (speedMenuRef.current && !speedMenuRef.current.contains(e.target)) {
        setShowSpeedMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent pt-14 pb-3 px-3">
      <div
        ref={progressRef}
        className="relative w-full h-6 cursor-pointer group/progress -top-3"
        onMouseMove={handleProgressMove}
        onMouseLeave={handleProgressLeave}
        onClick={handleProgressClick}
      >
        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1.5 bg-white/10 rounded-full overflow-hidden transition-all duration-150 group-hover/progress:h-2.5">
          <div className="absolute inset-0 bg-white/10 rounded-full" style={{ width: `${bufferedPct}%` }} />
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full shadow-lg shadow-cyan-500/20 transition-all duration-100" style={{ width: `${progressPct}%` }} />
          <div className="absolute top-1/2 -translate-y-1/2 rounded-full bg-white w-4 h-4 shadow-lg shadow-black/40 opacity-0 group-hover/progress:opacity-100 transition-all duration-150 scale-0 group-hover/progress:scale-100" style={{ left: `${progressPct}%`, marginLeft: '-8px' }} />
        </div>
        {hoverTime != null && (
          <div
            className="absolute -top-8 -translate-x-1/2 bg-black/95 text-white text-[11px] font-mono px-2 py-1 rounded-lg border border-white/10 shadow-xl pointer-events-none whitespace-nowrap"
            style={{ left: `${hoverPct * 100}%` }}
          >
            {formatTime(hoverTime)}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 -mt-1">
        <button onClick={onTogglePlay} className="p-2 rounded-full hover:bg-white/10 transition-all cursor-pointer flex-shrink-0 hover:scale-110 active:scale-95">
          {playing ? <Pause className="w-5 h-5 text-white fill-white" /> : <Play className="w-5 h-5 text-white fill-white ml-0.5" />}
        </button>
        <span className="text-[12px] text-gray-400 font-mono tabular-nums min-w-[90px] flex-shrink-0 select-none">
          {formatTime(currentTime)} <span className="text-gray-600">/</span> {formatTime(duration)}
        </span>
        <div className="flex-1" />
        <div className="flex items-center gap-1">
          <button onClick={onToggleMute} className="p-2 rounded-full hover:bg-white/10 transition-all cursor-pointer flex-shrink-0 hover:scale-110 active:scale-95">
            {muted || volume === 0 ? <VolumeX className="w-4 h-4 text-gray-400" /> : <Volume2 className="w-4 h-4 text-gray-400" />}
          </button>
          <input
            type="range" min="0" max="1" step="0.05"
            value={muted ? 0 : volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="w-20 h-1 accent-purple-500 cursor-pointer volume-slider"
          />
        </div>
        <div className="relative" ref={speedMenuRef}>
          <button
            onClick={() => setShowSpeedMenu(!showSpeedMenu)}
            className="px-2 py-1 rounded-lg hover:bg-white/10 transition-all cursor-pointer flex-shrink-0 text-[11px] font-mono text-gray-400 hover:text-white font-medium min-w-[36px]"
          >
            {playbackRate}x
          </button>
          {showSpeedMenu && (
            <div className="absolute bottom-full right-0 mb-2 bg-black/95 border border-white/10 rounded-xl py-1.5 shadow-2xl shadow-black/50 backdrop-blur-xl min-w-[72px]">
              {speeds.map(s => (
                <button key={s} onClick={() => { onPlaybackRateChange(s); setShowSpeedMenu(false); }}
                  className={`block w-full text-left px-3 py-1.5 text-xs hover:bg-white/10 transition-all cursor-pointer whitespace-nowrap ${playbackRate === s ? 'text-cyan-400 font-bold' : 'text-gray-400'}`}
                >{s}x</button>
              ))}
            </div>
          )}
        </div>
        {showPip && document.pictureInPictureEnabled && (
          <button onClick={onTogglePip} className="p-2 rounded-full hover:bg-white/10 transition-all cursor-pointer flex-shrink-0 hover:scale-110 active:scale-95">
            <PictureInPicture2 className="w-4 h-4 text-gray-400" />
          </button>
        )}
        <button onClick={onToggleFullscreen} className="p-2 rounded-full hover:bg-white/10 transition-all cursor-pointer flex-shrink-0 hover:scale-110 active:scale-95">
          {fullscreen ? <Minimize className="w-4 h-4 text-gray-400" /> : <Maximize className="w-4 h-4 text-gray-400" />}
        </button>
      </div>
    </div>
  );
}

export function SecureVideoPlayer({
  seedId, videoUrl, studentEmail, studentPhone, sessionId, lang,
  onProgressSaved, onTimeUpdate, seekToTime, onSeekCompleted, onQuizComplete,
  onComplete
}) {
  const t = (en, ar, tr) => lang === 'ar' ? ar : lang === 'tr' ? tr : en;
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [buffered, setBuffered] = useState(0);
  const hideTimer = useRef(null);
  const progressReportedRef = useRef(false);
  const watermarkText = `${studentEmail || 'Guest'} • ${sessionId?.slice(0, 8) || 'No-Session'}`;

  useEffect(() => {
    if (seekToTime != null && videoRef.current) {
      videoRef.current.currentTime = seekToTime;
      onSeekCompleted();
    }
  }, [seekToTime, onSeekCompleted]);

  useEffect(() => {
    const handler = (e) => {
      if (!containerRef.current?.contains(e.target) && e.target !== containerRef.current) return;
      switch (e.code) {
        case 'Space': e.preventDefault(); togglePlay(); break;
        case 'ArrowLeft': e.preventDefault(); seekRelative(-10); break;
        case 'ArrowRight': e.preventDefault(); seekRelative(10); break;
        case 'KeyF': e.preventDefault(); toggleFullscreen(); break;
        case 'KeyM': e.preventDefault(); toggleMute(); break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [playing, currentTime, duration, muted]);

  const seekRelative = (delta) => {
    if (!videoRef.current || !duration) return;
    const t = Math.max(0, Math.min(duration, videoRef.current.currentTime + delta));
    videoRef.current.currentTime = t;
    setCurrentTime(t);
  };

  const reportProgress = useCallback(() => {
    if (onProgressSaved && !progressReportedRef.current) {
      progressReportedRef.current = true;
      onProgressSaved();
    }
  }, [onProgressSaved]);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      const t = videoRef.current.currentTime;
      setCurrentTime(t);
      onTimeUpdate(t);
      const v = videoRef.current;
      if (v.buffered?.length > 0 && v.duration) {
        setBuffered((v.buffered.end(v.buffered.length - 1) / v.duration) * 100);
      }
      if (duration > 0 && t / duration > 0.8) {
        reportProgress();
      }
    }
  }, [onTimeUpdate, duration, reportProgress]);

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setCurrentTime(0);
      progressReportedRef.current = false;
      setCompleted(false);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (playing) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => setError(t('Playback blocked', 'تم حظر التشغيل', 'Oynatma engellendi')));
      }
      setPlaying(!playing);
    }
  };

  const handleVideoEnded = useCallback(() => {
    if (!videoRef.current) return;
    const actualTime = videoRef.current.currentTime;
    const actualDuration = videoRef.current.duration;
    setCurrentTime(actualTime);
    setPlaying(false);
    reportProgress();
    if (!completed && actualDuration > 0 && actualTime / actualDuration >= 0.9 && onComplete) {
      setCompleted(true);
      onComplete();
    }
  }, [reportProgress, completed, onComplete]);

  const handleSeek = (time) => {
    if (!videoRef.current || !duration) return;
    videoRef.current.currentTime = time;
    setCurrentTime(time);
    progressReportedRef.current = false;
  };

  const toggleMute = () => {
    setMuted(m => !m);
    if (videoRef.current) videoRef.current.muted = !muted;
  };

  const handleVolumeChange = (v) => {
    setVolume(v);
    if (videoRef.current) { videoRef.current.volume = v; videoRef.current.muted = v === 0; setMuted(v === 0); }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setFullscreen(true)).catch(() => {});
    } else { document.exitFullscreen().then(() => setFullscreen(false)).catch(() => {}); }
  };

  const togglePip = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else { await videoRef.current.requestPictureInPicture(); }
    } catch {}
  };

  const handlePlaybackRateChange = (rate) => {
    if (videoRef.current) videoRef.current.playbackRate = rate;
    setPlaybackRate(rate);
  };

  const showControlsBriefly = useCallback(() => {
    setShowControls(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowControls(false), 3000);
  }, []);

  useEffect(() => {
    const handler = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  if (!videoUrl || videoUrl.startsWith('bunny_mock') || videoUrl === '') {
    return (
      <div className="glass-panel rounded-2xl border border-purple-500/15 p-12 flex flex-col items-center gap-4">
        <Play className="w-16 h-16 text-purple-500/40" />
        <p className="text-gray-500 text-sm">{t('No video available for this seed', 'لا يوجد فيديو لهذه البذرة', 'Bu tohum için video mevcut değil')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel rounded-2xl border border-red-500/20 p-8 flex flex-col items-center gap-4">
        <AlertCircle className="w-12 h-12 text-red-400" />
        <p className="text-red-300 text-sm">{error}</p>
        {videoUrl && (
          <a href={videoUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 underline mt-2">
            <ExternalLink size={12} /> {t('Open in new tab', 'فتح في علامة تبويب جديدة', 'Yeni sekmede aç')}
          </a>
        )}
      </div>
    );
  }

  if (isEmbedUrl(videoUrl)) {
    return (
      <div className="glass-panel rounded-2xl border border-purple-500/15 overflow-hidden relative">
        <div className="bg-black/60 relative" style={{ padding: '56.25% 0 0 0' }}>
          <iframe
            src={videoUrl}
            className="absolute inset-0 w-full h-full"
            style={{ border: 0 }}
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Video player"
          />
        </div>
        <div className="absolute top-3 right-3 bg-black/70 text-[10px] text-purple-300/70 px-2 py-0.5 rounded font-mono pointer-events-none select-none z-10">
          {watermarkText}
        </div>
        {onComplete && !completed && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10">
            <button onClick={() => { setCompleted(true); if (onComplete) onComplete(); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/30 text-emerald-300 text-xs font-medium transition-all cursor-pointer backdrop-blur-sm">
              <CheckCircle size={14} /> {t('Done', 'تم', 'Tamamlandı')}
            </button>
          </div>
        )}
      </div>
    );
  }

  if (!isPlayableVideoUrl(videoUrl)) {
    return (
      <div className="glass-panel rounded-2xl border border-purple-500/15 p-12 flex flex-col items-center gap-4">
        <AlertCircle className="w-12 h-12 text-yellow-500/40" />
        <p className="text-gray-500 text-sm">{t('This video format is not supported in the browser player', 'تنسيق الفيديو هذا غير مدعوم في المشغل', 'Bu video formatı tarayıcı oynatıcıda desteklenmiyor')}</p>
        <a href={videoUrl} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 underline">
          <ExternalLink size={12} /> {t('Open video directly', 'فتح الفيديو مباشرة', 'Videoyu doğrudan aç')}
        </a>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="glass-panel rounded-2xl border border-purple-500/15 overflow-hidden relative group select-none bg-black"
      onMouseMove={showControlsBriefly}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <div className="relative">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full aspect-video object-contain bg-black"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleVideoEnded}
          onError={() => setError(t('Failed to load video', 'فشل تحميل الفيديو', 'Video yüklenemedi'))}
          onClick={togglePlay}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          controls={false}
          playsInline
          preload="metadata"
        />
        {!playing && !error && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <button onClick={togglePlay} className="pointer-events-auto w-20 h-20 rounded-full bg-black/40 backdrop-blur-sm hover:bg-purple-500/40 hover:scale-110 transition-all duration-300 flex items-center justify-center cursor-pointer group/play">
              <Play className="w-10 h-10 text-white fill-white ml-1 group-hover/play:scale-110 transition-transform" />
            </button>
          </div>
        )}
        <div className={`absolute bottom-0 left-0 right-0 transition-all duration-300 z-20 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
          <Controls
            playing={playing}
            currentTime={currentTime}
            duration={duration}
            volume={volume}
            muted={muted}
            fullscreen={fullscreen}
            playbackRate={playbackRate}
            onTogglePlay={togglePlay}
            onSeek={handleSeek}
            onToggleMute={toggleMute}
            onVolumeChange={handleVolumeChange}
            onToggleFullscreen={toggleFullscreen}
            onTogglePip={togglePip}
            onPlaybackRateChange={handlePlaybackRateChange}
            showPip={true}
            buffered={buffered}
          />
        </div>
        <div className="absolute top-3 right-3 bg-black/70 text-[10px] text-purple-300/70 px-2 py-0.5 rounded font-mono pointer-events-none select-none z-10">
          {watermarkText}
        </div>
        {onComplete && !completed && duration > 0 && (
          <div className="absolute top-3 left-3 z-10">
            <button onClick={() => { setCompleted(true); if (onComplete) onComplete(); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-emerald-600/40 border border-white/10 hover:border-emerald-500/30 text-white/60 hover:text-emerald-300 text-[11px] font-medium transition-all cursor-pointer backdrop-blur-sm">
              <CheckCircle size={12} /> {t('Done', 'تم', 'Tamamlandı')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
