import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ExternalLink, 
  Tag, 
  Users, 
  DollarSign, 
  ArrowRight,
  Loader2,
  Clock,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';

export function PlacementsView({ user, token, onActivityLogged }) {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState(null);
  const [appliedSuccess, setAppliedSuccess] = useState(null); // { company, ticketNumber }

  useEffect(() => {
    fetchDrives();
  }, [token]);

  const fetchDrives = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/placements', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDrives(data);
      }
    } catch (err) {
      console.error('Error fetching drives:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (drive) => {
    try {
      setApplyingId(drive._id);
      const res = await fetch(`/api/placements/${drive._id}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (res.ok) {
        setAppliedSuccess({
          company: drive.companyName,
          ticketNumber: data.ticketNumber
        });
        // Update local drive state
        setDrives(prev => prev.map(d => {
          if (d._id === drive._id) {
            return {
              ...d,
              application: {
                applied: true,
                ticketNumber: data.ticketNumber,
                currentStage: 'Registered',
                appliedAt: new Date()
              }
            };
          }
          return d;
        }));
        if (onActivityLogged) onActivityLogged();
      } else {
        alert(data.message || 'Failed to submit application');
      }
    } catch (err) {
      console.error('Error applying:', err);
    } finally {
      setApplyingId(null);
    }
  };

  const getStageBadge = (stage) => {
    const map = {
      'Registered': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      'Shortlisted': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      'Assessment Round': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      'Technical Interview': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      'Offered': 'bg-emerald-600 text-white font-black',
      'Rejected': 'bg-rose-500/10 text-rose-400 border-rose-500/20'
    };
    return map[stage] || 'bg-gray-500/10 text-gray-400';
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="rounded-3xl p-8 bg-[var(--card-bg)] border border-[var(--border-color)] shadow-xl relative overflow-hidden">
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
              Campus Recruitment Portal
            </span>
            <span className="text-xs text-[var(--text-muted)]">Verified Pre-requisite Matching</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--text-main)] tracking-tight">
            Institutional Placement Drives
          </h1>
          <p className="text-xs md:text-sm text-[var(--text-muted)] leading-relaxed">
            Direct recruitment pipelines targeted to your academic cohort ({user?.academicProfile?.department || 'Information Technology'}, Year {user?.academicProfile?.year || 3}). The platform automatically calculates your prerequisite skill compatibility against real open courseware competencies and generates a unique campus ticket number upon 1-click registration.
          </p>
        </div>
      </div>

      {/* Applied Success Modal / Banner */}
      {appliedSuccess && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-500/15 to-transparent border border-emerald-500/30 flex items-center justify-between gap-4 flex-wrap animate-fadeIn">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-emerald-500/30 shrink-0">
              ✓
            </div>
            <div>
              <h3 className="font-bold text-base text-[var(--text-main)]">
                Application Submitted for {appliedSuccess.company}!
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Your credentials and verified open-course artifacts have been dispatched to the placement coordinators.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)]">
              <span className="text-[10px] text-[var(--text-muted)] block uppercase font-mono">Official Ticket</span>
              <span className="text-sm font-black font-mono text-emerald-400">{appliedSuccess.ticketNumber}</span>
            </div>
            <button
              onClick={() => setAppliedSuccess(null)}
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] px-3 py-1"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Placement Drives List */}
      {loading ? (
        <div className="p-16 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#d97746] mx-auto mb-2" />
          <p className="text-xs text-[var(--text-muted)]">Loading upcoming placement drives...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {drives.map((drive) => {
            const hasApplied = drive.application?.applied;
            const matchScore = drive.matchScore || 0;

            return (
              <div
                key={drive._id}
                className="rounded-3xl p-6 md:p-8 bg-[var(--card-bg)] border border-[var(--border-color)] hover:border-[#d97746]/40 transition-all shadow-xl space-y-6"
              >
                {/* Header Row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] flex items-center justify-center font-black text-lg text-[#d97746] shrink-0">
                      {drive.companyName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h2 className="text-xl font-bold text-[var(--text-main)]">{drive.roleTitle}</h2>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--bg-main)] text-[#d97746] border border-[#d97746]/20">
                          {drive.companyName}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {drive.driveType}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-[var(--text-muted)] mt-2 flex-wrap">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                          {drive.location}
                        </span>
                        <span className="flex items-center gap-1 font-bold text-emerald-500">
                          <DollarSign className="w-3.5 h-3.5" />
                          {drive.ctcPackage}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                          Drive: {new Date(drive.driveDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Action / Ticket Info */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    {hasApplied ? (
                      <div className="p-3 rounded-2xl bg-[var(--bg-main)] border border-emerald-500/30 flex items-center gap-3">
                        <div>
                          <span className="text-[10px] text-[var(--text-muted)] block uppercase font-mono">Tracking Ticket</span>
                          <span className="text-xs font-black font-mono text-emerald-400">{drive.application.ticketNumber}</span>
                        </div>
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${getStageBadge(drive.application.currentStage)}`}>
                          {drive.application.currentStage}
                        </span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleApply(drive)}
                        disabled={applyingId === drive._id}
                        className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#d97746] hover:bg-[#c26233] text-white text-xs font-semibold transition-all shadow-md shadow-[#d97746]/20 flex items-center justify-center gap-2"
                      >
                        {applyingId === drive._id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5" />
                        )}
                        <span>1-Click Apply (Generate Ticket)</span>
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs md:text-sm text-[var(--text-muted)] leading-relaxed">
                  {drive.description}
                </p>

                {/* Skill Compatibility Bar & Breakdown */}
                <div className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-[#d97746]" />
                      <span className="text-xs font-bold text-[var(--text-main)]">
                        Prerequisite Skill Match: <strong className={matchScore >= 75 ? 'text-emerald-500' : 'text-amber-500'}>{matchScore}%</strong>
                      </span>
                    </div>
                    <span className="text-[11px] text-[var(--text-muted)]">
                      {drive.matchedSkills?.length || 0} of {drive.requiredSkills?.length || 0} required skills verified
                    </span>
                  </div>

                  <div className="w-full bg-[var(--border-color)] h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        matchScore >= 80 ? 'bg-emerald-500' : matchScore >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${matchScore}%` }}
                    />
                  </div>

                  {/* Skills Tags */}
                  <div className="flex items-center justify-between flex-wrap gap-2 pt-1 text-xs">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] text-[var(--text-muted)]">Matched:</span>
                      {(drive.matchedSkills || []).map((sk, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold">
                          ✓ {sk}
                        </span>
                      ))}
                    </div>

                    {(drive.missingSkills || []).length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] text-[var(--text-muted)]">Gaps:</span>
                        {(drive.missingSkills || []).map((sk, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-semibold">
                            ✗ {sk}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Selection Pipeline Stages */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin text-xs text-[var(--text-muted)]">
                  <span className="font-semibold text-[var(--text-main)] shrink-0">Hiring Stages:</span>
                  {(drive.selectionProcess || []).map((step, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 shrink-0">
                      <span className="px-2.5 py-1 rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] text-[11px]">
                        {idx + 1}. {step}
                      </span>
                      {idx < drive.selectionProcess.length - 1 && <span>&rarr;</span>}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
