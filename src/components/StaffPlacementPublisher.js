'use client';

import React, { useState } from 'react';
import { 
  Building2, 
  DollarSign, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  HelpCircle, 
  Sparkles,
  Users,
  Briefcase
} from 'lucide-react';

export function StaffPlacementPublisher({ token, onPlacementCreated }) {
  const [companyName, setCompanyName] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [driveType, setDriveType] = useState('On-Campus');
  const [ctcPackage, setCtcPackage] = useState('');
  const [location, setLocation] = useState('Bangalore / Hybrid');
  const [description, setDescription] = useState('');
  const [eligibleDepartments, setEligibleDepartments] = useState(['Information Technology', 'Computer Science']);
  const [eligibleGraduationYears, setEligibleGraduationYears] = useState([2026, 2027]);
  const [minCgpa, setMinCgpa] = useState('7.5');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [preferredSkills, setPreferredSkills] = useState('');
  const [driveDate, setDriveDate] = useState('2026-11-25');
  const [registrationDeadline, setRegistrationDeadline] = useState('2026-11-20');
  const [selectionProcess, setSelectionProcess] = useState('Resume Screening, Technical Assessment, System Architecture Round, HR Discussion');

  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  const handleTemplate = (type) => {
    if (type === 'meta') {
      setCompanyName('Meta Platforms');
      setRoleTitle('Production Engineer - Systems Infrastructure');
      setCtcPackage('44 LPA');
      setLocation('Hyderabad / Hybrid');
      setDescription('Seeking high-performing undergraduate engineers to build global distributed cache, Linux kernel debugging pipelines, and edge networking.');
      setMinCgpa('8.0');
      setRequiredSkills('Linux Internals, C++, Distributed Systems, Python, Networking');
      setPreferredSkills('eBPF, Kubernetes, Performance Profiling');
      setDriveDate('2026-12-05');
      setRegistrationDeadline('2026-11-28');
    } else if (type === 'anthropic') {
      setCompanyName('Anthropic AI');
      setRoleTitle('AI Systems & Alignment Engineering Intern');
      setCtcPackage('52 LPA equivalent');
      setLocation('Bangalore / San Francisco Hybrid');
      setDescription('Work on large-scale model evaluation harness, automated interpretability tools, and robust RLHF safety mechanisms.');
      setMinCgpa('8.5');
      setRequiredSkills('PyTorch, Transformers & NLP, Python, Distributed Systems, CUDA');
      setPreferredSkills('DeepSpeed, FlashAttention, Vector Databases');
      setDriveDate('2026-12-10');
      setRegistrationDeadline('2026-11-30');
    }
  };

  const handleToggleDept = (dept) => {
    if (eligibleDepartments.includes(dept)) {
      setEligibleDepartments(eligibleDepartments.filter(d => d !== dept));
    } else {
      setEligibleDepartments([...eligibleDepartments, dept]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!companyName || !roleTitle || !ctcPackage || !driveDate || !registrationDeadline) {
      setStatusMsg({ type: 'error', text: 'Please fill in all mandatory fields (Company, Role, CTC, Dates).' });
      return;
    }

    setSubmitting(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/placements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          companyName,
          roleTitle,
          driveType,
          ctcPackage,
          location,
          description,
          eligibleDepartments,
          eligibleGraduationYears,
          minCgpa: Number(minCgpa) || 7.0,
          requiredSkills: requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
          preferredSkills: preferredSkills.split(',').map(s => s.trim()).filter(Boolean),
          driveDate,
          registrationDeadline,
          selectionProcess: selectionProcess.split(',').map(s => s.trim()).filter(Boolean)
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to publish placement drive');

      setStatusMsg({ type: 'success', text: `Placement drive for ${companyName} published successfully!` });
      if (onPlacementCreated) onPlacementCreated(data.drive);

      // Reset
      setCompanyName('');
      setRoleTitle('');
      setCtcPackage('');
      setDescription('');
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Presets Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] text-xs">
        <div className="flex items-center gap-2 text-[var(--text-secondary)]">
          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          <span className="font-medium text-[var(--text-primary)]">Quick Presets:</span>
          <span>Load verified high-package recruitment drive templates</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleTemplate('meta')}
            className="px-2.5 py-1 rounded bg-[var(--bg-page)] border border-[var(--border)] hover:border-neutral-400 font-medium text-[var(--text-primary)] transition-all"
          >
            Meta Infrastructure (44 LPA)
          </button>
          <button
            type="button"
            onClick={() => handleTemplate('anthropic')}
            className="px-2.5 py-1 rounded bg-[var(--bg-page)] border border-[var(--border)] hover:border-neutral-400 font-medium text-[var(--text-primary)] transition-all"
          >
            Anthropic AI Systems (52 LPA)
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
          statusMsg.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' 
            : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
        }`}>
          {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <HelpCircle className="w-4 h-4 shrink-0" />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              Company Name *
            </label>
            <input
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Google, Microsoft, Atlassian"
              className="w-full px-3 py-2 text-xs rounded bg-[var(--bg-page)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              Role Title *
            </label>
            <input
              type="text"
              required
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
              placeholder="e.g. Software Development Engineer"
              className="w-full px-3 py-2 text-xs rounded bg-[var(--bg-page)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              CTC Package Offered *
            </label>
            <input
              type="text"
              required
              value={ctcPackage}
              onChange={(e) => setCtcPackage(e.target.value)}
              placeholder="e.g. 28 - 36 LPA"
              className="w-full px-3 py-2 text-xs rounded bg-[var(--bg-page)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              Drive Type
            </label>
            <select
              value={driveType}
              onChange={(e) => setDriveType(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded bg-[var(--bg-page)] border border-[var(--border)] text-[var(--text-primary)]"
            >
              <option value="On-Campus">On-Campus Recruitment</option>
              <option value="Virtual / Remote">Virtual / Remote Drive</option>
              <option value="Pool Campus">Pool Campus</option>
              <option value="Direct Referral">Direct Referral Fast-Track</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Bangalore / Hyderabad / Hybrid"
              className="w-full px-3 py-2 text-xs rounded bg-[var(--bg-page)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              Minimum CGPA Cutoff
            </label>
            <input
              type="number"
              step="0.1"
              min="5.0"
              max="10.0"
              value={minCgpa}
              onChange={(e) => setMinCgpa(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded bg-[var(--bg-page)] border border-[var(--border)] text-[var(--text-primary)]"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
            Job Description & Team Focus
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Details on engineering team scope, tech stack, and primary responsibilities..."
            className="w-full px-3 py-2 text-xs rounded bg-[var(--bg-page)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Skills Requirements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              Mandatory Required Skills (Comma-separated) *
            </label>
            <input
              type="text"
              required
              value={requiredSkills}
              onChange={(e) => setRequiredSkills(e.target.value)}
              placeholder="e.g. Data Structures & Algorithms, Go, Distributed Systems"
              className="w-full px-3 py-2 text-xs rounded bg-[var(--bg-page)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              Preferred Bonus Skills (Comma-separated)
            </label>
            <input
              type="text"
              value={preferredSkills}
              onChange={(e) => setPreferredSkills(e.target.value)}
              placeholder="e.g. Kubernetes, Redis, Docker, gRPC"
              className="w-full px-3 py-2 text-xs rounded bg-[var(--bg-page)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Department Eligibility & Important Dates */}
        <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] space-y-4">
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider block">
              Eligible Academic Departments
            </label>
            <div className="flex flex-wrap gap-2 text-xs">
              {['Information Technology', 'Computer Science', 'Data Science', 'Electronics & Communication', 'Mechanical'].map((dept) => {
                const checked = eligibleDepartments.includes(dept);
                return (
                  <button
                    key={dept}
                    type="button"
                    onClick={() => handleToggleDept(dept)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-all ${
                      checked 
                        ? 'bg-[var(--text-primary)] text-[var(--bg-page)] border-[var(--text-primary)]' 
                        : 'bg-[var(--bg-page)] text-[var(--text-secondary)] border-[var(--border)] hover:border-neutral-400'
                    }`}
                  >
                    {dept}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider block mb-1">
                Drive Execution Date *
              </label>
              <input
                type="date"
                required
                value={driveDate}
                onChange={(e) => setDriveDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded bg-[var(--bg-page)] border border-[var(--border)] text-[var(--text-primary)]"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider block mb-1">
                Student Registration Deadline *
              </label>
              <input
                type="date"
                required
                value={registrationDeadline}
                onChange={(e) => setRegistrationDeadline(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded bg-[var(--bg-page)] border border-[var(--border)] text-[var(--text-primary)]"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider block mb-1">
              Selection Rounds Pipeline (Comma-separated)
            </label>
            <input
              type="text"
              value={selectionProcess}
              onChange={(e) => setSelectionProcess(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded bg-[var(--bg-page)] border border-[var(--border)] text-[var(--text-primary)]"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 rounded-md bg-[var(--text-primary)] text-[var(--bg-page)] text-xs font-semibold hover:opacity-90 disabled:opacity-50 transition-all shadow-sm flex items-center gap-2"
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>{submitting ? 'Publishing Drive...' : 'Publish Campus Recruitment Drive'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
