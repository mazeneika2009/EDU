import React from 'react';
import { TrendingUp, X, BarChart3, Award, Clock, CheckCircle2, BookOpen } from 'lucide-react';

export function GrowthReportModal({ isOpen, onClose, lang, report }) {
  const t = (en, ar, tr) => lang === 'ar' ? ar : lang === 'tr' ? tr : en;
  if (!isOpen || !report) return null;

  const hours = report.totalHours || report.hoursSpent || 0;
  const minutes = report.totalMinutes || 0;
  const hoursDisplay = typeof hours === 'number' && !isNaN(hours) ? hours : parseFloat(hours) || 0;
  const totalHours = Math.floor(hoursDisplay);
  const totalMinutes = minutes > 0 ? minutes : Math.round((hoursDisplay - totalHours) * 60);
  const completedSeeds = report.completedSeeds || report.completedSeedsCount || 0;
  const totalSeeds = report.totalSeeds || report.totalSeedsCount || 0;
  const score = report.score || (totalSeeds > 0 ? Math.round((completedSeeds / totalSeeds) * 100) : 0);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="glass-panel rounded-2xl border border-purple-500/20 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-purple-500/10">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-semibold text-gray-300">{t('Growth Report', 'تقرير النمو', 'Gelişim Raporu')}</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {report.gardenTitle && (
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">{t('Course', 'الدورة', 'Kurs')}</p>
              <p className="text-sm font-semibold text-gray-200">{report.gardenTitle}</p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#0e1424] rounded-xl p-3 border border-purple-500/10 text-center">
              <BarChart3 className="w-5 h-5 text-purple-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-purple-300">{completedSeeds}</p>
              <p className="text-[10px] text-gray-500">{t('Completed', 'مكتمل', 'Tamamlandı')}</p>
            </div>
            <div className="bg-[#0e1424] rounded-xl p-3 border border-purple-500/10 text-center">
              <Award className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-cyan-300">{score}%</p>
              <p className="text-[10px] text-gray-500">{t('Progress', 'تقدم', 'İlerleme')}</p>
            </div>
            <div className="bg-[#0e1424] rounded-xl p-3 border border-purple-500/10 text-center">
              <Clock className="w-5 h-5 text-amber-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-amber-300">{totalHours}{t('h', 'س', 's')}</p>
              <p className="text-[10px] text-gray-500">{t('Hours', 'ساعات', 'Saat')}</p>
            </div>
          </div>

          {report.userName && (
            <div className="bg-[#0e1424] rounded-xl p-3 border border-purple-500/10">
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                <BookOpen size={12} />
                <span>{t('Student', 'طالب', 'Öğrenci')}</span>
              </div>
              <p className="text-sm text-gray-200">{report.userName}</p>
              {report.completedAt && <p className="text-[10px] text-gray-600 mt-1">{report.completedAt}</p>}
            </div>
          )}

          {report.skillsAcquired && (
            <div className="bg-[#0e1424] rounded-xl p-3 border border-purple-500/10">
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                <CheckCircle2 size={12} />
                <span>{t('Skills Acquired', 'المهارات المكتسبة', 'Kazanılan Beceriler')}</span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">{report.skillsAcquired}</p>
            </div>
          )}

          {report.seeds?.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-2">{t('Seed Details', 'تفاصيل البذور', 'Tohum Detayları')}</p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {report.seeds.map((seed, i) => (
                  <div key={i} className="bg-[#0e1424] rounded-lg p-2.5 border border-purple-500/10 flex items-center justify-between">
                    <span className="text-xs text-gray-300 truncate mr-2">{seed.title}</span>
                    <span className={`text-[10px] flex-shrink-0 ${seed.completed ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {seed.completed ? t('Done', 'تم', 'Tamamlandı') : t('In Progress', 'قيد التنفيذ', 'Devam Ediyor')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {report.certificateId && (
            <div className="text-center pt-2 border-t border-purple-500/10">
              <p className="text-[10px] text-gray-600 mb-1">{t('Certificate', 'شهادة', 'Sertifika')}</p>
              <p className="text-xs font-mono text-cyan-400">{report.certificateId}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
