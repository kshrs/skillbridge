

import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Sparkles, 
  CheckCircle, 
  Loader2 
} from 'lucide-react';

export function PlacementsCanvas({ user, token, onActivityUpdated }) {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState(null);
  const [successTicket, setSuccessTicket] = useState(null);

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
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (drive) => {
    try {
      setApplyingId(drive._id);
      const res = await fetch(`/api/placements/${drive._id}/apply`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessTicket({ company: drive.companyName, ticket: data.ticketNumber });
        fetchDrives();
        if (onActivityUpdated) onActivityUpdated();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn py-4">
      <div className="pb-3 border-b border-[var(--border)]">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Campus Placement Drives</h2>
        <p className="text-xs text-[var(--text-tertiary)]">
          Targeted to {user?.academicProfile?.department || 'Information Technology'}, Year {user?.academicProfile?.year || 3}
        </p>
      </div>

      {successTicket && (
        <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/40 text-xs flex items-center justify-between">
          <span>Application ticket generated for {successTicket.company}: <strong className="font-mono">{successTicket.ticket}</strong></span>
          <button onClick={() => setSuccessTicket(null)} className="underline text-[11px]">Dismiss</button>
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-xs text-[var(--text-tertiary)]">Loading placement opportunities...</div>
      ) : (
        <div className="space-y-3">
          {drives.map((d) => (
            <div
              key={d._id}
              className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--bg-subtle)] font-bold text-[var(--text-primary)]">
                      {d.companyName}
                    </span>
                    <span className="text-xs font-semibold text-[var(--text-primary)]">{d.roleTitle}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-[var(--text-tertiary)] mt-1">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {d.location}</span>
                    <span className="flex items-center gap-1 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      <DollarSign className="w-3 h-3" /> {d.ctcPackage}
                    </span>
                  </div>
                </div>

                <div>
                  {d.application?.applied ? (
                    <div className="text-right">
                      <span className="text-[10px] font-mono text-[var(--text-tertiary)] block">Ticket: {d.application.ticketNumber}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                        {d.application.currentStage}
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleApply(d)}
                      disabled={applyingId === d._id}
                      className="px-3 py-1.5 rounded-lg bg-[var(--text-primary)] text-[var(--bg-page)] text-xs font-semibold hover:opacity-90 flex items-center gap-1.5"
                    >
                      {applyingId === d._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                      <span>1-Click Apply</span>
                    </button>
                  )}
                </div>
              </div>

              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{d.description}</p>

              {/* Match Score */}
              <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between text-xs">
                <span className="text-[11px] text-[var(--text-tertiary)]">
                  Prerequisite Match: <strong className="text-[var(--text-primary)] font-mono">{d.matchScore}%</strong>
                </span>
                <div className="flex gap-1 flex-wrap">
                  {(d.matchedSkills || []).map((sk, i) => (
                    <span key={i} className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 font-mono">
                      ✓ {sk}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
