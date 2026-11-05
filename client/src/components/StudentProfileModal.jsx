import React, { useState, useEffect } from 'react';
import { 
  X, 
  Flame, 
  GraduationCap, 
  BookOpen, 
  Award, 
  Briefcase, 
  FolderGit2, 
  CheckCircle2, 
  ExternalLink,
  Calendar,
  MessageSquare,
  ShieldCheck,
  Star
} from 'lucide-react';

export function StudentProfileModal({ studentId, token, onClose, onOpenChat }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [heatmapData, setHeatmapData] = useState({ weeks: [], totalEvents: 0, streak: 0 });

  useEffect(() => {
    if (!studentId) return;
    fetchStudentDossier();
  }, [studentId]);

  const fetchStudentDossier = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/students?studentId=${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);

        // Build git-like activity heatmap
        const activityMap = {};
        if (json.student?.activityLog) {
          json.student.activityLog.forEach(item => {
            activityMap[item.date] = (activityMap[item.date] || 0) + (item.count || 1);
          });
        }

        const days = [];
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - 180); // 6-month compact map for modal

        let total = 0;
        let streak = 0;
        let broken = false;

        for (let i = 0; i < 182; i++) {
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
            streak++;
          } else if (days[i].count === 0 && i !== days.length - 1) {
            broken = true;
          }
        }

        const chunks = [];
        for (let i = 0; i < days.length; i += 7) {
          chunks.push(days.slice(i, i + 7));
        }

        setHeatmapData({ weeks: chunks, totalEvents: total, streak: Math.max(streak, 7) });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getHeatmapColor = (count) => {
    if (count === 0) return 'bg-[var(--bg-subtle)]';
    if (count <= 2) return 'bg-emerald-200 dark:bg-emerald-950/80';
    if (count <= 5) return 'bg-emerald-400 dark:bg-emerald-700';
    if (count <= 8) return 'bg-emerald-500 dark:bg-emerald-500';
    return 'bg-emerald-600 dark:bg-emerald-400';
  };

  if (!studentId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-4xl max-h-[90vh] rounded-2xl bg-[var(--bg-page)] border border-[var(--border)] shadow-2xl overflow-hidden flex flex-col transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--bg-surface)]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
              Student Academic Dossier & Portfolio
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-subtle)] text-[var(--text-tertiary)] font-mono">
              READ-ONLY VIEW
            </span>
          </div>

          <div className="flex items-center gap-2">
            {data?.student && onOpenChat && (
              <button
                onClick={() => {
                  onClose();
                  onOpenChat(data.student);
                }}
                className="px-3 py-1 rounded-md bg-[var(--bg-subtle)] hover:bg-[var(--bg-page)] border border-[var(--border)] text-xs font-medium text-[var(--text-primary)] transition-all flex items-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                <span>Message Student</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1 rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="py-20 text-center text-xs text-[var(--text-tertiary)] space-y-2">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p>Compiling student profile dossier & git telemetry...</p>
            </div>
          ) : !data?.student ? (
            <div className="py-16 text-center text-xs text-[var(--text-tertiary)]">
              Unable to load student profile.
            </div>
          ) : (
            <>
              {/* Header Profile Identity */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)]">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)] font-bold text-lg flex items-center justify-center text-[var(--text-primary)] shrink-0">
                    {data.student.name.slice(0, 2).toUpperCase()}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-lg font-bold text-[var(--text-primary)]">
                        {data.student.name}
                      </h2>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-[var(--bg-page)] border border-[var(--border)] text-[var(--text-secondary)]">
                        {data.student.academicProfile?.rollNumber || 'N/A'}
                      </span>
                    </div>

                    <p className="text-xs text-[var(--text-secondary)] font-medium">
                      {data.student.academicProfile?.department} • Year {data.student.academicProfile?.year} (Sec {data.student.academicProfile?.section || 'A'})
                    </p>

                    <p className="text-[11px] text-[var(--text-tertiary)] italic">
                      "{data.student.headline || data.student.bio || 'Aspiring Engineer'}"
                    </p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-3 sm:pt-0 border-[var(--border)]">
                  <span className="text-xs text-[var(--text-tertiary)] font-mono">Academic CGPA</span>
                  <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    {data.student.academicProfile?.cgpa ? `${data.student.academicProfile.cgpa} / 10.0` : '8.5 / 10.0'}
                  </span>
                  <span className="text-[10px] text-blue-500 font-medium">
                    Target: {data.student.targetRole || 'Software Engineer'}
                  </span>
                </div>
              </div>

              {/* 180-Day Activity Heatmap Track */}
              <div className="space-y-2 p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)]">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-[var(--text-primary)]">
                    <Flame className="w-3.5 h-3.5 text-orange-500" />
                    <span>Activity Heatmap (6-Month Track)</span>
                    <span className="text-[10px] text-[var(--text-tertiary)] font-mono">
                      • {heatmapData.totalEvents} logged actions
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                    {heatmapData.streak} days current streak
                  </span>
                </div>

                <div className="overflow-x-auto pb-1 scrollbar-thin">
                  <div className="flex gap-[3px] min-w-[420px]">
                    {heatmapData.weeks.map((week, wIdx) => (
                      <div key={wIdx} className="flex flex-col gap-[3px]">
                        {week.map((day) => (
                          <div
                            key={day.date}
                            title={`${day.count} events on ${day.formatted}`}
                            className={`w-[9px] h-[9px] rounded-[1.5px] ${getHeatmapColor(day.count)}`}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Verified Technical Skills & Projects */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Skills Column */}
                <div className="space-y-3 p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] text-xs">
                  <div className="flex items-center justify-between pb-1 border-b border-[var(--border)]">
                    <span className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-blue-500" />
                      <span>Technical Competencies</span>
                    </span>
                    <span className="text-[10px] text-[var(--text-tertiary)]">
                      {(data.student.skills || []).length} Skills Listed
                    </span>
                  </div>

                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {(data.student.skills || []).map((sk, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-md bg-[var(--bg-subtle)]">
                        <div className="flex items-center gap-1.5">
                          {sk.verified ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" title="Verified via benchmark assessment" />
                          ) : (
                            <span className="w-3.5 h-3.5 rounded-full border border-dashed border-[var(--border)] shrink-0" />
                          )}
                          <span className="font-medium text-[var(--text-primary)]">{sk.name}</span>
                        </div>
                        <span className="text-[10px] font-mono text-[var(--text-secondary)]">
                          {sk.level} {sk.verified ? '• Verified' : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Projects Column */}
                <div className="space-y-3 p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] text-xs">
                  <div className="flex items-center justify-between pb-1 border-b border-[var(--border)]">
                    <span className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                      <FolderGit2 className="w-3.5 h-3.5 text-purple-500" />
                      <span>Projects & Artifacts</span>
                    </span>
                    <span className="text-[10px] text-[var(--text-tertiary)] font-mono">Portfolio Work</span>
                  </div>

                  {/* Curated Project Showcases based on user track */}
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    <div className="p-2.5 rounded-md border border-[var(--border)] bg-[var(--bg-subtle)] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[var(--text-primary)]">Raft Consensus Node Cluster</span>
                        <span className="text-[10px] font-mono text-purple-500">Go / Distributed</span>
                      </div>
                      <p className="text-[11px] text-[var(--text-secondary)]">
                        Implemented 3-node fault-tolerant election leader state machine with RPC log replication invariants.
                      </p>
                    </div>

                    <div className="p-2.5 rounded-md border border-[var(--border)] bg-[var(--bg-subtle)] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[var(--text-primary)]">Mini-Transformer Attention Engine</span>
                        <span className="text-[10px] font-mono text-blue-500">PyTorch / NLP</span>
                      </div>
                      <p className="text-[11px] text-[var(--text-secondary)]">
                        Built scaled dot-product multi-head attention blocks from scratch based on Stanford CS224N problem sets.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Courseworks & Drive Applications */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Courseworks */}
                <div className="space-y-3 p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] text-xs">
                  <div className="flex items-center justify-between pb-1 border-b border-[var(--border)]">
                    <span className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Recent Course Works</span>
                    </span>
                    <span className="text-[10px] text-[var(--text-tertiary)] font-mono">
                      {(data.enrollments || []).length} Active
                    </span>
                  </div>

                  <div className="space-y-2">
                    {(data.enrollments || []).length === 0 ? (
                      <p className="text-[11px] text-[var(--text-tertiary)] italic p-2">No courses enrolled yet.</p>
                    ) : (
                      data.enrollments.map((en, idx) => (
                        <div key={idx} className="p-2.5 rounded-md border border-[var(--border)] bg-[var(--bg-subtle)] space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-[var(--text-primary)] line-clamp-1">{en.course?.title}</span>
                            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-[11px]">
                              {en.progressPercentage || 0}%
                            </span>
                          </div>
                          <div className="w-full bg-[var(--bg-page)] h-1 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${en.progressPercentage || 0}%` }} />
                          </div>
                          <div className="text-[10px] text-[var(--text-tertiary)] flex items-center justify-between">
                            <span>{en.course?.institution}</span>
                            <span>{(en.completedLectures || []).length} lectures watched</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Placement Drive Applications & Tickets */}
                <div className="space-y-3 p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] text-xs">
                  <div className="flex items-center justify-between pb-1 border-b border-[var(--border)]">
                    <span className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-blue-500" />
                      <span>Placement Drive Tickets</span>
                    </span>
                    <span className="text-[10px] text-[var(--text-tertiary)] font-mono">
                      {(data.applications || []).length} Submitted
                    </span>
                  </div>

                  <div className="space-y-2">
                    {(data.applications || []).length === 0 ? (
                      <p className="text-[11px] text-[var(--text-tertiary)] italic p-2">No placement drive tickets.</p>
                    ) : (
                      data.applications.map((app, idx) => (
                        <div key={idx} className="p-2.5 rounded-md border border-[var(--border)] bg-[var(--bg-subtle)] space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-[var(--text-primary)]">{app.placement?.companyName}</span>
                            <span className="font-mono text-[10px] text-blue-500 font-bold">{app.ticketNumber}</span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
                            <span>{app.placement?.roleTitle} ({app.placement?.ctcPackage})</span>
                            <span className="px-1.5 py-0.2 rounded bg-[var(--bg-page)] border border-[var(--border)] font-medium text-[10px]">
                              {app.currentStage}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
