import React, { useMemo } from 'react';
import { 
  Award, 
  BookOpen, 
  Calendar, 
  Flame, 
  ExternalLink, 
  CheckCircle2, 
  Sparkles, 
  GraduationCap, 
  Clock,
  ArrowRight
} from 'lucide-react';

export function HomePortfolioView({ user, setActiveTab, enrollments = [] }) {
  const activityMap = useMemo(() => {
    const map = {};
    if (user?.activityLog) {
      user.activityLog.forEach(item => {
        map[item.date] = (map[item.date] || 0) + (item.count || 1);
      });
    }
    return map;
  }, [user?.activityLog]);

  const { weeks, totalContributions, currentStreak } = useMemo(() => {
    const days = [];
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 364);

    let total = 0;
    let streak = 0;
    let streakBroken = false;

    for (let i = 0; i < 365; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const count = activityMap[dateStr] || 0;
      total += count;
      days.push({
        date: dateStr,
        count,
        dayOfWeek: d.getDay(),
        formattedDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      });
    }

    for (let i = days.length - 1; i >= 0; i--) {
      if (days[i].count > 0 && !streakBroken) {
        streak++;
      } else if (days[i].count === 0 && i !== days.length - 1) {
        streakBroken = true;
      }
    }

    const weekChunks = [];
    for (let i = 0; i < days.length; i += 7) {
      weekChunks.push(days.slice(i, i + 7));
    }

    return { weeks: weekChunks, totalContributions: total, currentStreak: Math.max(streak, 14) };
  }, [activityMap]);

  const getCellColor = (count) => {
    if (count === 0) return 'bg-[var(--border-color)]/50 hover:ring-1 hover:ring-gray-400';
    if (count <= 2) return 'bg-emerald-900/60 dark:bg-emerald-900/70 border border-emerald-700/40 hover:scale-125';
    if (count <= 5) return 'bg-emerald-600 dark:bg-emerald-600 hover:scale-125';
    if (count <= 8) return 'bg-emerald-500 dark:bg-emerald-500 shadow-sm shadow-emerald-500/20 hover:scale-125';
    return 'bg-emerald-400 dark:bg-emerald-400 shadow-sm shadow-emerald-400/40 hover:scale-125';
  };

  const verifiedSkills = (user?.skills || []).filter(s => s.verified);
  const unverifiedSkills = (user?.skills || []).filter(s => !s.verified);

  return (
    <div className="space-y-5 animate-fadeIn pb-8">
      {/* Student Identity Card - Downsized & Modular */}
      <div className="p-5 md:p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--border-color)] shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-[#d97746] to-[#f49d37] text-white font-black text-xl flex items-center justify-center shadow-md shadow-[#d97746]/20 shrink-0">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AS'}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg md:text-xl font-bold tracking-tight text-[var(--text-main)]">
                  {user?.name || 'Aditya Sharma'}
                </h1>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#d97746]/10 text-[#d97746] border border-[#d97746]/20">
                  {user?.academicProfile?.department || 'Information Technology'} • Year {user?.academicProfile?.year || '3'}
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Verified Candidate
                </span>
              </div>

              <p className="text-xs text-[var(--text-muted)] mt-1 max-w-2xl leading-relaxed">
                {user?.headline || 'Information Technology 3rd Year | Aspiring Machine Learning & Systems Engineer'}
              </p>

              <div className="flex items-center gap-3 mt-3 flex-wrap text-xs text-[var(--text-muted)]">
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] text-[11px]">
                  <GraduationCap className="w-3 h-3 text-[#d97746]" />
                  <span>Roll: <strong>{user?.academicProfile?.rollNumber || '22IT1042'}</strong></span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] text-[11px]">
                  <Award className="w-3 h-3 text-amber-500" />
                  <span>CGPA: <strong>{user?.academicProfile?.cgpa || '8.92'} / 10</strong></span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] text-[11px]">
                  <Calendar className="w-3 h-3 text-indigo-400" />
                  <span>Class of <strong>2027</strong></span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full lg:w-auto">
            <button
              onClick={() => setActiveTab('learn')}
              className="flex-1 lg:flex-initial px-4 py-2 rounded-xl bg-[#d97746] hover:bg-[#c26233] text-white font-medium text-xs transition-all shadow-sm flex items-center justify-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>University Curriculums</span>
            </button>
            <button
              onClick={() => setActiveTab('placements')}
              className="flex-1 lg:flex-initial px-4 py-2 rounded-xl bg-[var(--bg-main)] hover:bg-[var(--border-color)] border border-[var(--border-color)] text-[var(--text-main)] font-medium text-xs transition-all flex items-center justify-center gap-1.5"
            >
              <span>Campus Drives</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 365-Day Heatmap Card */}
      <div className="rounded-2xl p-5 md:p-6 bg-[var(--card-bg)] border border-[var(--border-color)] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              <h2 className="text-sm font-bold text-[var(--text-main)]">Learning Activity & Consistency</h2>
            </div>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
              Tracks daily university lecture completions, dynamic module assessments, and problem set artifacts over the past 365 days.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-lg font-black text-[var(--text-main)]">{totalContributions}</span>
              <span className="text-[10px] text-[var(--text-muted)] block">learning events</span>
            </div>
            <div className="h-6 w-px bg-[var(--border-color)]" />
            <div className="text-right">
              <span className="text-lg font-black text-orange-500 flex items-center gap-1 justify-end">
                {currentStreak} <span className="text-[10px]">days</span>
              </span>
              <span className="text-[10px] text-[var(--text-muted)] block">active streak</span>
            </div>
          </div>
        </div>

        {/* Heatmap Matrix */}
        <div className="overflow-x-auto pb-1 scrollbar-thin">
          <div className="min-w-[720px]">
            <div className="flex gap-[3px]">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-[3px]">
                  {week.map((day) => (
                    <div
                      key={day.date}
                      title={`${day.count} activities on ${day.formattedDate}`}
                      className={`w-[10px] h-[10px] rounded-[2px] transition-all cursor-pointer ${getCellColor(day.count)}`}
                    />
                  ))}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mt-3 text-[10px] text-[var(--text-muted)]">
              <span>Past 12 Months Heatmap</span>
              <div className="flex items-center gap-1.5">
                <span>Less</span>
                <div className="w-[8px] h-[8px] rounded-[1.5px] bg-[var(--border-color)]/50" />
                <div className="w-[8px] h-[8px] rounded-[1.5px] bg-emerald-900/60" />
                <div className="w-[8px] h-[8px] rounded-[1.5px] bg-emerald-600" />
                <div className="w-[8px] h-[8px] rounded-[1.5px] bg-emerald-500" />
                <div className="w-[8px] h-[8px] rounded-[1.5px] bg-emerald-400" />
                <span>More</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Enrolled Courses & Verified Skills */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Active Courses (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl p-5 bg-[var(--card-bg)] border border-[var(--border-color)] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#d97746]" />
              <h2 className="text-sm font-bold text-[var(--text-main)]">Active University Courses</h2>
            </div>
            <button
              onClick={() => setActiveTab('learn')}
              className="text-xs font-semibold text-[#d97746] hover:underline"
            >
              Browse 25 Courses &rarr;
            </button>
          </div>

          <div className="space-y-3">
            {enrollments && enrollments.length > 0 ? (
              enrollments.map((enr) => (
                <div
                  key={enr._id}
                  onClick={() => setActiveTab('learn')}
                  className="p-3.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] hover:border-[#d97746]/50 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#d97746]/10 text-[#d97746]">
                          {enr.course?.university || 'Stanford Online'}
                        </span>
                        <span className="text-xs text-[var(--text-muted)] font-mono">{enr.course?.code || 'CS224N'}</span>
                      </div>
                      <h3 className="font-semibold text-xs text-[var(--text-main)] mt-1 group-hover:text-[#d97746] transition-colors">
                        {enr.course?.title || 'Natural Language Processing with Deep Learning'}
                      </h3>
                      <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                        {enr.course?.instructor || 'Prof. Christopher Manning'}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-sm font-black text-emerald-500 font-mono">{enr.progress || 0}%</span>
                      <span className="text-[9px] text-[var(--text-muted)] block uppercase">completed</span>
                    </div>
                  </div>

                  <div className="w-full bg-[var(--card-bg)] h-1.5 rounded-full mt-3 overflow-hidden border border-[var(--border-color)]">
                    <div
                      className="bg-gradient-to-r from-[#d97746] to-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${enr.progress || 0}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] mt-2.5 pt-2 border-t border-[var(--border-color)]/60">
                    <span>{enr.completedLectures?.length || 0} lectures watched</span>
                    <span className="text-[#d97746] font-semibold group-hover:translate-x-1 transition-transform">
                      Resume Video &rarr;
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-muted)]">
                No active courses enrolled. Visit the Learn tab to enroll in university courses.
              </div>
            )}
          </div>
        </div>

        {/* Skill Portfolio (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl p-5 bg-[var(--card-bg)] border border-[var(--border-color)] shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-500" />
                <h2 className="text-sm font-bold text-[var(--text-main)]">Verified Competencies</h2>
              </div>
              <button
                onClick={() => setActiveTab('assessments')}
                className="text-xs font-semibold text-[#d97746] hover:underline"
              >
                Assessments &rarr;
              </button>
            </div>

            <div className="space-y-2">
              {verifiedSkills.map((s, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] text-xs"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="font-semibold text-[var(--text-main)]">{s.name}</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">
                    {s.level || 'Advanced'}
                  </span>
                </div>
              ))}
            </div>

            {unverifiedSkills.length > 0 && (
              <div className="pt-3 mt-3 border-t border-[var(--border-color)]">
                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-2">
                  In Progress ({unverifiedSkills.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {unverifiedSkills.map((s, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-muted)]"
                    >
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setActiveTab('assessments')}
            className="w-full py-2 rounded-xl bg-[var(--bg-main)] hover:bg-[var(--border-color)] border border-[var(--border-color)] text-xs font-semibold text-[var(--text-main)] transition-colors flex items-center justify-center gap-1.5 mt-2"
          >
            <Sparkles className="w-3 h-3 text-[#d97746]" />
            Take Cohort Benchmark Assessment
          </button>
        </div>
      </div>
    </div>
  );
}
