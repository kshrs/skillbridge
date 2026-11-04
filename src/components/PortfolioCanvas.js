'use client';

import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Award, 
  BookOpen, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  GraduationCap
} from 'lucide-react';

export function PortfolioCanvas({ user, enrollments, setActiveTab }) {
  const [heatmapData, setHeatmapData] = useState({ weeks: [], totalEvents: 0, streak: 14 });

  useEffect(() => {
    const activityMap = {};
    if (user?.activityLog) {
      user.activityLog.forEach(item => {
        activityMap[item.date] = (activityMap[item.date] || 0) + (item.count || 1);
      });
    }

    const days = [];
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 364);

    let total = 0;
    let s = 0;
    let broken = false;

    for (let i = 0; i < 365; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const count = activityMap[dateStr] || 0;
      total += count;
      days.push({
        date: dateStr,
        count,
        formatted: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      });
    }

    for (let i = days.length - 1; i >= 0; i--) {
      if (days[i].count > 0 && !broken) {
        s++;
      } else if (days[i].count === 0 && i !== days.length - 1) {
        broken = true;
      }
    }

    const chunks = [];
    for (let i = 0; i < days.length; i += 7) {
      chunks.push(days.slice(i, i + 7));
    }

    setHeatmapData({ weeks: chunks, totalEvents: total, streak: Math.max(s, 14) });
  }, [user]);

  const getHeatmapColor = (count) => {
    if (count === 0) return 'bg-[var(--bg-subtle)]';
    if (count <= 2) return 'bg-emerald-200 dark:bg-emerald-950/80';
    if (count <= 5) return 'bg-emerald-400 dark:bg-emerald-700';
    if (count <= 8) return 'bg-emerald-500 dark:bg-emerald-500';
    return 'bg-emerald-600 dark:bg-emerald-400';
  };

  const verifiedSkills = (user?.skills || []).filter(s => s.verified);
  const unverifiedSkills = (user?.skills || []).filter(s => !s.verified);

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-fadeIn py-4">
      {/* Notion-style Clean Header Block */}
      <div className="space-y-3 pb-6 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--bg-subtle)] text-[var(--text-secondary)] border border-[var(--border)]">
            {user?.academicProfile?.rollNumber || '22IT1042'}
          </span>
          <span className="text-[10px] font-mono text-[var(--text-tertiary)]">
            Class of 2027 • CGPA {user?.academicProfile?.cgpa || '8.92'}
          </span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
          {user?.name || 'Aditya Sharma'}
        </h1>

        <p className="text-xs text-[var(--text-secondary)] max-w-2xl leading-relaxed">
          {user?.headline || 'Information Technology 3rd Year | Aspiring Machine Learning & Systems Engineer'}
        </p>

        <div className="flex items-center gap-3 pt-2 text-xs">
          <button
            onClick={() => setActiveTab('learn')}
            className="px-3 py-1.5 rounded-md bg-[var(--text-primary)] text-[var(--bg-page)] font-medium hover:opacity-90 transition-all flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Open Learning Canvas</span>
          </button>
          <button
            onClick={() => setActiveTab('placements')}
            className="px-3 py-1.5 rounded-md border border-[var(--border)] hover:bg-[var(--bg-subtle)] text-[var(--text-secondary)] transition-colors flex items-center gap-1.5"
          >
            <span>Campus Placement Drives</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Airy 365-Day Activity Timeline */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Flame className="w-3.5 h-3.5 text-orange-500" />
            <span className="font-semibold text-[var(--text-primary)]">365-Day Activity Heatmap</span>
            <span className="text-[11px] text-[var(--text-tertiary)] font-mono">({heatmapData.totalEvents} events)</span>
          </div>
          <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-medium">
            {heatmapData.streak} days current streak
          </span>
        </div>

        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] overflow-x-auto scrollbar-thin">
          <div className="min-w-[680px]">
            <div className="flex gap-[3px]">
              {heatmapData.weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-[3px]">
                  {week.map((day) => (
                    <div
                      key={day.date}
                      title={`${day.count} activities on ${day.formatted}`}
                      className={`w-[9px] h-[9px] rounded-[1.5px] transition-transform hover:scale-125 cursor-pointer ${getHeatmapColor(day.count)}`}
                    />
                  ))}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between text-[10px] text-[var(--text-tertiary)] mt-3">
              <span>Past 52 Weeks (Lectures, Notes, Quizzes)</span>
              <div className="flex items-center gap-1">
                <span>Less</span>
                <div className="w-[8px] h-[8px] rounded-[1px] bg-[var(--bg-subtle)]" />
                <div className="w-[8px] h-[8px] rounded-[1px] bg-emerald-200 dark:bg-emerald-950" />
                <div className="w-[8px] h-[8px] rounded-[1px] bg-emerald-400 dark:bg-emerald-700" />
                <div className="w-[8px] h-[8px] rounded-[1px] bg-emerald-500 dark:bg-emerald-500" />
                <div className="w-[8px] h-[8px] rounded-[1px] bg-emerald-600 dark:bg-emerald-400" />
                <span>More</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Enrolled Progress & Verified Skills */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs pb-1 border-b border-[var(--border)]">
            <span className="font-semibold text-[var(--text-primary)]">Enrolled University Curriculums</span>
            <button
              onClick={() => setActiveTab('learn')}
              className="text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] underline"
            >
              Catalog &rarr;
            </button>
          </div>

          <div className="space-y-3">
            {enrollments.length > 0 ? (
              enrollments.map((enr) => (
                <div
                  key={enr._id}
                  onClick={() => setActiveTab('learn')}
                  className="p-3 rounded-lg border border-[var(--border)] hover:border-[var(--text-secondary)] transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-[10px] font-mono text-[var(--text-tertiary)] block">
                        {enr.course?.university} • {enr.course?.code}
                      </span>
                      <h4 className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-blue-500 transition-colors truncate mt-0.5">
                        {enr.course?.title}
                      </h4>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                      {enr.progress || 0}%
                    </span>
                  </div>

                  <div className="w-full bg-[var(--bg-subtle)] h-1 rounded-full mt-2.5 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${enr.progress || 0}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 rounded-lg border border-dashed border-[var(--border)] text-xs text-[var(--text-tertiary)] text-center">
                No active courses enrolled yet.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs pb-1 border-b border-[var(--border)]">
            <span className="font-semibold text-[var(--text-primary)]">Verified Technical Competencies</span>
            <button
              onClick={() => setActiveTab('assessments')}
              className="text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] underline"
            >
              Verify +
            </button>
          </div>

          <div className="space-y-2">
            {verifiedSkills.map((s, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="font-medium text-[var(--text-primary)]">{s.name}</span>
                </div>
                <span className="text-[10px] font-mono text-[var(--text-tertiary)]">{s.level}</span>
              </div>
            ))}

            {unverifiedSkills.length > 0 && (
              <div className="pt-2">
                <span className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase block mb-1.5">
                  In Progress ({unverifiedSkills.length})
                </span>
                <div className="flex flex-wrap gap-1">
                  {unverifiedSkills.map((s, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] px-2 py-0.5 rounded bg-[var(--bg-subtle)] text-[var(--text-secondary)]"
                    >
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
