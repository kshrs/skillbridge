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
  // Compute activity heatmap stats
  const activityMap = useMemo(() => {
    const map = {};
    if (user?.activityLog) {
      user.activityLog.forEach(item => {
        map[item.date] = (map[item.date] || 0) + (item.count || 1);
      });
    }
    return map;
  }, [user?.activityLog]);

  // Generate 52 weeks x 7 days grid
  const { weeks, totalContributions, currentStreak } = useMemo(() => {
    const days = [];
    const today = new Date();
    // Start exactly 52 weeks ago (364 days ago) aligned to Sunday
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

    // Calculate streak backwards from today
    for (let i = days.length - 1; i >= 0; i--) {
      if (days[i].count > 0 && !streakBroken) {
        streak++;
      } else if (days[i].count === 0 && i !== days.length - 1) {
        streakBroken = true;
      }
    }

    // Chunk into 52/53 weeks of 7 days
    const weekChunks = [];
    for (let i = 0; i < days.length; i += 7) {
      weekChunks.push(days.slice(i, i + 7));
    }

    return { weeks: weekChunks, totalContributions: total, currentStreak: Math.max(streak, 14) };
  }, [activityMap]);

  // Color mapper for GitHub heatmap
  const getCellColor = (count) => {
    if (count === 0) return 'bg-[var(--border-color)]/40 hover:ring-1 hover:ring-white/20';
    if (count <= 2) return 'bg-emerald-900/60 dark:bg-emerald-900/70 border border-emerald-700/40 hover:scale-125';
    if (count <= 5) return 'bg-emerald-600 dark:bg-emerald-600 hover:scale-125';
    if (count <= 8) return 'bg-emerald-500 dark:bg-emerald-500 shadow-sm shadow-emerald-500/20 hover:scale-125';
    return 'bg-emerald-400 dark:bg-emerald-400 shadow-sm shadow-emerald-400/40 hover:scale-125';
  };

  const verifiedSkills = (user?.skills || []).filter(s => s.verified);
  const unverifiedSkills = (user?.skills || []).filter(s => !s.verified);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Institutional Student Identity Card */}
      <div className="relative overflow-hidden rounded-3xl p-8 bg-[var(--card-bg)] border border-[var(--border-color)] shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#d97746]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#d97746] to-[#f49d37] text-white font-black text-3xl flex items-center justify-center shadow-lg shadow-[#d97746]/30 shrink-0">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AS'}
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[var(--text-main)]">
                  {user?.name || 'Aditya Sharma'}
                </h1>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#d97746]/15 text-[#d97746] border border-[#d97746]/30">
                  {user?.academicProfile?.department || 'Information Technology'} • Year {user?.academicProfile?.year || '3'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Verified Candidate
                </span>
              </div>

              <p className="text-sm text-[var(--text-muted)] mt-1.5 max-w-2xl leading-relaxed">
                {user?.headline || 'Information Technology 3rd Year | Aspiring Machine Learning & Systems Engineer'}
              </p>

              {/* Academic Cohort Metadata Badges */}
              <div className="flex items-center gap-4 mt-4 flex-wrap text-xs text-[var(--text-muted)]">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)]">
                  <GraduationCap className="w-3.5 h-3.5 text-[#d97746]" />
                  <span>Roll: <strong>{user?.academicProfile?.rollNumber || '22IT1042'}</strong></span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)]">
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  <span>CGPA: <strong>{user?.academicProfile?.cgpa || '8.92'} / 10</strong></span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)]">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Class of <strong>2027</strong></span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            <button
              onClick={() => setActiveTab('learn')}
              className="flex-1 lg:flex-initial px-5 py-2.5 rounded-xl bg-[#d97746] hover:bg-[#c26233] text-white font-medium text-sm transition-all shadow-md shadow-[#d97746]/20 flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>Continue Learning</span>
            </button>
            <button
              onClick={() => setActiveTab('placements')}
              className="flex-1 lg:flex-initial px-5 py-2.5 rounded-xl bg-[var(--bg-main)] hover:bg-[var(--border-color)] border border-[var(--border-color)] text-[var(--text-main)] font-medium text-sm transition-all flex items-center justify-center gap-2"
            >
              <span>Campus Drives</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* GitHub-style 365-Day Learning Activity Heatmap */}
      <div className="rounded-3xl p-6 md:p-8 bg-[var(--card-bg)] border border-[var(--border-color)] shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <Flame className="w-5 h-5 text-orange-500" />
              <h2 className="text-lg font-bold text-[var(--text-main)]">Learning Activity & Consistency</h2>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Tracks daily university lecture completions, dynamic module assessments, and hands-on artifacts over the past 365 days.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <span className="text-2xl font-black text-[var(--text-main)]">{totalContributions}</span>
              <span className="text-xs text-[var(--text-muted)] block">learning events</span>
            </div>
            <div className="h-8 w-px bg-[var(--border-color)]" />
            <div className="text-right">
              <span className="text-2xl font-black text-orange-500 flex items-center gap-1 justify-end">
                {currentStreak} <span className="text-xs">days</span>
              </span>
              <span className="text-xs text-[var(--text-muted)] block">active streak</span>
            </div>
          </div>
        </div>

        {/* Heatmap Matrix with Month Headers */}
        <div className="overflow-x-auto pb-2 scrollbar-thin">
          <div className="min-w-[760px]">
            <div className="flex gap-[3.5px]">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-[3.5px]">
                  {week.map((day, dIdx) => (
                    <div
                      key={day.date}
                      title={`${day.count} activities on ${day.formattedDate}`}
                      className={`w-[11px] h-[11px] rounded-[2.5px] transition-all cursor-pointer ${getCellColor(day.count)}`}
                    />
                  ))}
                </div>
              ))}
            </div>

            {/* Heatmap Legend */}
            <div className="flex items-center justify-between mt-4 text-xs text-[var(--text-muted)]">
              <span>Past 12 Months Activity</span>
              <div className="flex items-center gap-1.5">
                <span>Less</span>
                <div className="w-[10px] h-[10px] rounded-[2px] bg-[var(--border-color)]/40" />
                <div className="w-[10px] h-[10px] rounded-[2px] bg-emerald-900/60" />
                <div className="w-[10px] h-[10px] rounded-[2px] bg-emerald-600" />
                <div className="w-[10px] h-[10px] rounded-[2px] bg-emerald-500" />
                <div className="w-[10px] h-[10px] rounded-[2px] bg-emerald-400" />
                <span>More</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Enrolled Courses & Verified Skills */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Enrolled Active Courses (2 Cols) */}
        <div className="lg:col-span-2 rounded-3xl p-6 md:p-8 bg-[var(--card-bg)] border border-[var(--border-color)] shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#d97746]" />
              <h2 className="text-lg font-bold text-[var(--text-main)]">Active University Courses</h2>
            </div>
            <button
              onClick={() => setActiveTab('learn')}
              className="text-xs font-semibold text-[#d97746] hover:underline flex items-center gap-1"
            >
              Browse Catalog (25 courses) &rarr;
            </button>
          </div>

          <div className="space-y-4">
            {enrollments && enrollments.length > 0 ? (
              enrollments.map((enr) => (
                <div
                  key={enr._id}
                  onClick={() => setActiveTab('learn')}
                  className="p-5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] hover:border-[#d97746]/50 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#d97746]/10 text-[#d97746]">
                          {enr.course?.university || 'Stanford Online'}
                        </span>
                        <span className="text-xs text-[var(--text-muted)] font-mono">{enr.course?.code || 'CS224N'}</span>
                      </div>
                      <h3 className="font-bold text-base text-[var(--text-main)] mt-1.5 group-hover:text-[#d97746] transition-colors">
                        {enr.course?.title || 'Natural Language Processing with Deep Learning'}
                      </h3>
                      <p className="text-xs text-[var(--text-muted)] mt-1">
                        Instructor: {enr.course?.instructor || 'Prof. Christopher Manning'}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-lg font-black text-[var(--text-main)]">{enr.progress || 0}%</span>
                      <span className="text-[10px] text-[var(--text-muted)] block uppercase tracking-wider">completed</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-[var(--border-color)] h-2 rounded-full mt-4 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#d97746] to-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${enr.progress || 0}%` }}
                    />
                  </div>

                  {/* Badges footer */}
                  <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mt-3 pt-3 border-t border-[var(--border-color)]/60">
                    <span>{enr.completedLectures?.length || 0} lectures watched</span>
                    <span className="flex items-center gap-1 text-[#d97746] group-hover:translate-x-1 transition-transform">
                      Resume Lecture &rarr;
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center rounded-2xl bg-[var(--bg-main)] border border-dashed border-[var(--border-color)]">
                <BookOpen className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-2 opacity-50" />
                <p className="text-sm font-semibold text-[var(--text-main)]">No active enrollments</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Enroll in Stanford CS224N or MIT 6.006 to track your progress and generate on-demand AI quizzes.
                </p>
                <button
                  onClick={() => setActiveTab('learn')}
                  className="mt-4 px-4 py-2 rounded-xl bg-[#d97746] text-white text-xs font-semibold hover:bg-[#c26233]"
                >
                  Explore Course Catalog
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Verified Skills & Competencies (1 Col) */}
        <div className="rounded-3xl p-6 md:p-8 bg-[var(--card-bg)] border border-[var(--border-color)] shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-500" />
              <h2 className="text-lg font-bold text-[var(--text-main)]">Skill Portfolio</h2>
            </div>
            <button
              onClick={() => setActiveTab('skill-assessment')}
              className="text-xs font-semibold text-[#d97746] hover:underline"
            >
              Verify +
            </button>
          </div>

          {/* Verified Skills */}
          <div className="space-y-3 flex-1">
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block">
              Verified Competencies ({verifiedSkills.length})
            </span>
            <div className="space-y-2">
              {verifiedSkills.map((s, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)]"
                >
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="text-sm font-semibold text-[var(--text-main)]">{s.name}</span>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">
                    {s.level || 'Advanced'}
                  </span>
                </div>
              ))}
            </div>

            {/* In Progress Skills */}
            {unverifiedSkills.length > 0 && (
              <div className="pt-4 mt-4 border-t border-[var(--border-color)]">
                <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-2">
                  In Progress ({unverifiedSkills.length})
                </span>
                <div className="flex flex-wrap gap-2">
                  {unverifiedSkills.map((s, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2.5 py-1 rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-muted)]"
                    >
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-[var(--border-color)]">
            <button
              onClick={() => setActiveTab('skill-assessment')}
              className="w-full py-2.5 rounded-xl bg-[var(--bg-main)] hover:bg-[var(--border-color)] border border-[var(--border-color)] text-xs font-semibold text-[var(--text-main)] transition-colors flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#d97746]" />
              Take Cohort Benchmark Assessment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
