'use client';

import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  History, 
  User, 
  Building2,
  Calendar,
  Sparkles
} from 'lucide-react';

export function StaffTicketManager({ token }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlacement, setSelectedPlacement] = useState('All');
  const [selectedStage, setSelectedStage] = useState('All');
  const [updatingTicketId, setUpdatingTicketId] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [nextStage, setNextStage] = useState('Shortlisted');
  const [statusMsg, setStatusMsg] = useState(null);

  const stages = ['Registered', 'Shortlisted', 'Assessment Round', 'Technical Interview', 'Offered', 'Rejected'];

  useEffect(() => {
    fetchTickets();
  }, [selectedPlacement, selectedStage]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (selectedPlacement !== 'All') q.set('placementId', selectedPlacement);
      if (selectedStage !== 'All') q.set('stage', selectedStage);

      const res = await fetch(`/api/admin/tickets?${q.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setTickets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStage = async (ticket) => {
    setStatusMsg(null);
    try {
      const res = await fetch('/api/admin/tickets', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          applicationId: ticket._id,
          nextStage,
          reviewNotes: reviewNotes.trim() || `Promoted to ${nextStage} during faculty review`
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update ticket');

      setStatusMsg({ type: 'success', text: data.message });
      setUpdatingTicketId(null);
      setReviewNotes('');
      fetchTickets();
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-xs font-semibold text-[var(--text-primary)]">
            Student Drive Application Tickets ({tickets.length})
          </h3>
          <p className="text-[11px] text-[var(--text-secondary)]">
            Manage stage progression, review criteria, and audit history for campus recruitment drives
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <select
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
            className="px-2.5 py-1.5 rounded-md bg-[var(--bg-subtle)] border border-[var(--border)] text-[var(--text-primary)]"
          >
            <option value="All">All Stages</option>
            {stages.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {statusMsg && (
        <div className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
          statusMsg.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' 
            : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
        }`}>
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Ticket List */}
      {loading ? (
        <div className="py-12 text-center text-xs text-[var(--text-tertiary)]">
          Loading application tickets...
        </div>
      ) : tickets.length === 0 ? (
        <div className="py-12 text-center text-xs text-[var(--text-tertiary)] border border-dashed border-[var(--border)] rounded-lg">
          No application tickets match the filter criteria.
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => {
            const isEditing = updatingTicketId === ticket._id;

            return (
              <div 
                key={ticket._id}
                className="p-4 rounded-lg border border-[var(--border)] bg-[var(--bg-page)] text-xs space-y-3"
              >
                {/* Header line: Ticket number, Company, Student, Current Stage */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[var(--border)]">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-[var(--bg-subtle)] border border-[var(--border)] text-blue-600 dark:text-blue-400">
                      {ticket.ticketNumber}
                    </span>
                    <span className="font-semibold text-[var(--text-primary)]">
                      {ticket.placement?.companyName} • {ticket.placement?.roleTitle}
                    </span>
                    <span className="text-[11px] text-[var(--text-secondary)] font-mono">
                      ({ticket.placement?.ctcPackage})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                      ticket.currentStage === 'Offered'
                        ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                        : ticket.currentStage === 'Rejected'
                        ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                        : 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                    }`}>
                      {ticket.currentStage}
                    </span>

                    <button
                      onClick={() => {
                        if (isEditing) {
                          setUpdatingTicketId(null);
                        } else {
                          setUpdatingTicketId(ticket._id);
                          setNextStage(ticket.currentStage);
                        }
                      }}
                      className="px-2.5 py-1 rounded border border-[var(--border)] bg-[var(--bg-subtle)] hover:bg-[var(--bg-page)] font-medium text-[var(--text-primary)] transition-all"
                    >
                      {isEditing ? 'Cancel' : 'Update Stage'}
                    </button>
                  </div>
                </div>

                {/* Candidate & Matching Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider block">
                      Applicant Dossier
                    </span>
                    <div className="font-medium text-[var(--text-primary)]">
                      {ticket.student?.name}
                    </div>
                    <div className="text-[11px] text-[var(--text-secondary)]">
                      {ticket.academicSnapshot?.rollNumber} • {ticket.academicSnapshot?.department} (Yr {ticket.academicSnapshot?.year})
                    </div>
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                      {ticket.academicSnapshot?.cgpa} CGPA
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider block">
                      Skill Compatibility
                    </span>
                    <div className="flex items-center gap-1.5 font-mono font-bold text-xs text-[var(--text-primary)]">
                      <span>{ticket.skillMatchSnapshot?.score || 0}% Prerequisite Match</span>
                    </div>
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {(ticket.skillMatchSnapshot?.matchedSkills || []).map((sk, idx) => (
                        <span key={idx} className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 text-[10px] font-medium">
                          ✓ {sk}
                        </span>
                      ))}
                      {(ticket.skillMatchSnapshot?.missingSkills || []).map((sk, idx) => (
                        <span key={idx} className="px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 text-[10px] font-medium">
                          ! {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider block">
                      Audit Trail
                    </span>
                    <div className="text-[11px] text-[var(--text-secondary)] flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[var(--text-tertiary)]" />
                      <span>Applied: {new Date(ticket.appliedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="text-[11px] text-[var(--text-secondary)]">
                      {ticket.stageHistory?.length || 1} stage updates logged
                    </div>
                  </div>
                </div>

                {/* Inline Stage Update Form */}
                {isEditing && (
                  <div className="mt-3 p-3 rounded-lg border border-blue-500/30 bg-blue-500/5 space-y-3">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <div className="flex-1">
                        <label className="text-[11px] font-semibold text-[var(--text-secondary)] block mb-1">
                          Advance / Change Stage to:
                        </label>
                        <select
                          value={nextStage}
                          onChange={(e) => setNextStage(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded bg-[var(--bg-page)] border border-[var(--border)] text-[var(--text-primary)] font-medium"
                        >
                          {stages.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>

                      <div className="flex-[2]">
                        <label className="text-[11px] font-semibold text-[var(--text-secondary)] block mb-1">
                          Reviewer Assessment Notes
                        </label>
                        <input
                          type="text"
                          value={reviewNotes}
                          onChange={(e) => setReviewNotes(e.target.value)}
                          placeholder="e.g. Cleared round 1 coding test; scheduled for architecture interview"
                          className="w-full px-2.5 py-1.5 rounded bg-[var(--bg-page)] border border-[var(--border)] text-[var(--text-primary)]"
                        />
                      </div>

                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => handleUpdateStage(ticket)}
                          className="px-4 py-1.5 rounded bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 transition-all shadow-sm"
                        >
                          Commit Update
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
