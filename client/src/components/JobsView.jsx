import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Clock, 
  Send, 
  CheckCircle, 
  Sparkles, 
  Search, 
  Filter, 
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

export const JobsView = ({ user, token }) => {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [activeTab, setActiveTab] = useState('browse'); // 'browse' | 'applications'
  const [filterType, setFilterType] = useState('All');
  const [selectedJob, setSelectedJob] = useState(null);
  const [coverNote, setCoverNote] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
    if (token) fetchApplications();
  }, [token]);

  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/jobs', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (data.success) {
        setJobs(data.jobs);
        if (data.jobs.length > 0 && !selectedJob) {
          setSelectedJob(data.jobs[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await fetch('/api/applications/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setApplications(data.applications);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleApply = async () => {
    if (!selectedJob) return;
    setIsApplying(true);
    setStatusMsg({ type: '', text: '' });

    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          jobId: selectedJob._id,
          coverNote
        })
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg({ type: 'success', text: 'Application submitted successfully with AI skill match!' });
        setCoverNote('');
        fetchApplications();
      } else {
        setStatusMsg({ type: 'error', text: data.message || 'Application failed' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setIsApplying(false);
    }
  };

  const handleWithdraw = async (applicationId) => {
    if (!confirm('Are you sure you want to withdraw this application?')) return;
    try {
      const res = await fetch(`/api/applications/${applicationId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchApplications();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const hasApplied = (jobId) => {
    return applications.some(app => (app.jobId?._id || app.jobId) === jobId);
  };

  const filteredJobs = jobs.filter(j => {
    if (filterType === 'All') return true;
    if (filterType === 'Internship') return j.type === 'Internship';
    if (filterType === 'Remote') return j.workplaceType === 'Remote';
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header controls & tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Opportunities & Applications</h2>
          <p className="text-xs text-[#7e8798] mt-0.5">Explore job openings with automated AI skill-compatibility scoring</p>
        </div>

        <div className="flex items-center gap-2 p-1 bg-[#14171d] rounded-2xl border border-[#232731]">
          <button
            onClick={() => setActiveTab('browse')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'browse'
                ? 'bg-white text-black shadow-sm'
                : 'text-[#7d8697] hover:text-white'
            }`}
          >
            Browse Listings ({filteredJobs.length})
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'applications'
                ? 'bg-white text-black shadow-sm'
                : 'text-[#7d8697] hover:text-white'
            }`}
          >
            Track Applications
            {applications.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-[#d97746] text-black text-[10px] font-black">
                {applications.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {activeTab === 'browse' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Job List (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            {/* Filter pills */}
            <div className="flex items-center gap-2 pb-1 overflow-x-auto">
              {['All', 'Internship', 'Remote'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setFilterType(filter)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    filterType === filter
                      ? 'bg-[#d97746] border-[#d97746] text-black font-semibold'
                      : 'bg-[#15181e] border-[#252b36] text-[#8e98aa] hover:border-white/20'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="p-8 text-center text-[#6e7787] text-xs">Loading openings...</div>
            ) : filteredJobs.length === 0 ? (
              <div className="app-card p-6 text-center text-xs text-[#7b8596]">No job openings found.</div>
            ) : (
              filteredJobs.map((job) => {
                const isSelected = selectedJob?._id === job._id;
                const applied = hasApplied(job._id);

                return (
                  <div
                    key={job._id}
                    onClick={() => setSelectedJob(job)}
                    className={`app-card p-5 cursor-pointer transition-all border ${
                      isSelected
                        ? 'border-[#d97746] bg-[#1a1e26] shadow-lg shadow-[#d97746]/5'
                        : 'hover:border-white/20 bg-[#14171d]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-white">{job.title}</h4>
                        <p className="text-xs text-[#8c95a6] mt-0.5">{job.company}</p>
                      </div>
                      
                      {/* Match Score Badge */}
                      {job.matchScore !== null && (
                        <div className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-1 border ${
                          job.matchScore >= 75
                            ? 'bg-[#1c291e] text-[#9ed68c] border-[#2d4831]'
                            : 'bg-[#292218] text-[#f3c46e] border-[#4a3922]'
                        }`}>
                          <Sparkles size={11} /> {job.matchScore}% Match
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#697284] mt-3">
                      <span className="flex items-center gap-1">
                        <MapPin size={12} /> {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> {job.type}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-white/5">
                      {job.requiredSkills.slice(0, 3).map((skill, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-[#1f242e] text-[#b3bdcb]">
                          {skill}
                        </span>
                      ))}
                      {job.requiredSkills.length > 3 && (
                        <span className="text-[10px] px-1.5 py-0.5 text-[#5e6676]">
                          +{job.requiredSkills.length - 3}
                        </span>
                      )}
                      {applied && (
                        <span className="ml-auto text-[10px] font-bold text-[#9ed68c] flex items-center gap-1">
                          <CheckCircle size={11} /> Applied
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Job Details Panel (7 cols) */}
          <div className="lg:col-span-7">
            {selectedJob ? (
              <div className="app-card p-6 md:p-8 space-y-6 sticky top-24">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
                  <div>
                    <span className="text-xs font-mono text-[#d97746] uppercase tracking-wider">
                      {selectedJob.experienceLevel} Level Opening
                    </span>
                    <h3 className="text-2xl font-bold text-white mt-1">{selectedJob.title}</h3>
                    <p className="text-sm text-[#8c95a6] mt-0.5">{selectedJob.company} • {selectedJob.location}</p>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-mono font-bold text-white">{selectedJob.salary}</div>
                    <span className="text-xs text-[#70798a]">{selectedJob.workplaceType}</span>
                  </div>
                </div>

                {/* AI Skill Alignment Card */}
                {selectedJob.matchScore !== null && (
                  <div className="p-4 rounded-2xl bg-[#111317] border border-[#222732] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Sparkles size={14} className="text-[#f3c46e]" /> AI Skill Alignment Report
                      </span>
                      <span className="text-xs font-mono font-bold text-[#f3c46e]">
                        {selectedJob.matchScore}% Match
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                      <div>
                        <span className="text-[11px] text-[#9ed68c] block mb-1">✓ Your Matched Skills</span>
                        <div className="flex flex-wrap gap-1">
                          {selectedJob.matchedSkills && selectedJob.matchedSkills.length > 0 ? (
                            selectedJob.matchedSkills.map((s, idx) => (
                              <span key={idx} className="px-2 py-0.5 rounded bg-[#18261b] text-[#9ed68c] text-[10px]">
                                {s}
                              </span>
                            ))
                          ) : (
                            <span className="text-[11px] text-[#616a7b]">None yet</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <span className="text-[11px] text-[#f3a478] block mb-1">⚠ Missing Skills to Learn</span>
                        <div className="flex flex-wrap gap-1">
                          {selectedJob.missingSkills && selectedJob.missingSkills.length > 0 ? (
                            selectedJob.missingSkills.map((s, idx) => (
                              <span key={idx} className="px-2 py-0.5 rounded bg-[#281b16] text-[#f3a478] text-[10px]">
                                {s}
                              </span>
                            ))
                          ) : (
                            <span className="text-[11px] text-[#9ed68c]">All skills present!</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Job Description */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#7e8798]">About the Role</h4>
                  <p className="text-sm text-[#cbd2e0] leading-relaxed">{selectedJob.description}</p>
                </div>

                {/* Required Skills */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#7e8798]">Required Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.requiredSkills.map((skill, idx) => (
                      <span key={idx} className="px-3 py-1 rounded-xl bg-[#1b1f27] border border-[#2b313e] text-xs font-medium text-[#d1d7e2]">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Responsibilities */}
                {selectedJob.responsibilities && selectedJob.responsibilities.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#7e8798]">Key Responsibilities</h4>
                    <ul className="list-disc list-inside text-xs text-[#a3adb8] space-y-1">
                      {selectedJob.responsibilities.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Application submission form */}
                <div className="pt-4 border-t border-white/5 space-y-3">
                  {statusMsg.text && (
                    <div className={`p-3 rounded-xl text-xs font-semibold ${
                      statusMsg.type === 'success' 
                        ? 'bg-green-950/50 text-[#9ed68c] border border-green-800/40' 
                        : 'bg-red-950/50 text-[#fca5a5] border border-red-800/40'
                    }`}>
                      {statusMsg.text}
                    </div>
                  )}

                  {hasApplied(selectedJob._id) ? (
                    <div className="p-4 rounded-2xl bg-[#131b15] border border-[#234228] flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#9ed68c] flex items-center gap-2">
                        <CheckCircle size={16} /> You have applied for this position.
                      </span>
                      <button
                        onClick={() => setActiveTab('applications')}
                        className="text-xs text-white underline hover:text-[#9ed68c]"
                      >
                        View status
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <label className="text-xs font-semibold text-[#8e98aa] block">
                        Quick Note / Statement of Interest (Optional):
                      </label>
                      <textarea
                        value={coverNote}
                        onChange={(e) => setCoverNote(e.target.value)}
                        placeholder="Highlight your relevant projects, motivation, or learning roadmap..."
                        rows={3}
                        className="w-full bg-[#111317] border border-[#232833] rounded-2xl p-3 text-xs text-white placeholder-[#555d6e] focus:outline-none focus:border-[#d97746]"
                      />

                      <button
                        onClick={handleApply}
                        disabled={isApplying}
                        className="w-full py-3 rounded-2xl bg-white text-black font-bold text-xs hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                      >
                        <Send size={14} /> {isApplying ? 'Submitting...' : 'Apply Now with 1-Click Profile'}
                      </button>
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div className="app-card p-12 text-center text-xs text-[#6f7787]">
                Select a job on the left to inspect details.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Application Tracking View */
        <div className="space-y-4">
          {applications.length === 0 ? (
            <div className="app-card p-12 text-center space-y-3">
              <Briefcase className="mx-auto text-[#4b5466]" size={36} />
              <h3 className="text-base font-bold text-white">No applications yet</h3>
              <p className="text-xs text-[#7d8697]">
                Apply for open jobs or internships to begin tracking your hiring milestones.
              </p>
              <button
                onClick={() => setActiveTab('browse')}
                className="px-4 py-2 rounded-xl bg-white text-black text-xs font-bold hover:bg-gray-200 transition-colors"
              >
                Browse Listings
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {applications.map((app) => (
                <div key={app._id} className="app-card p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-mono text-[#d97746] uppercase">Application Reference</span>
                      <h3 className="text-lg font-bold text-white mt-0.5">{app.jobId?.title || 'Position'}</h3>
                      <p className="text-xs text-[#8c95a6]">{app.jobId?.company} • {app.jobId?.location}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                        app.status === 'Offered'
                          ? 'bg-[#18261b] text-[#9ed68c] border-[#2d4831]'
                          : app.status === 'Rejected'
                          ? 'bg-[#291717] text-[#fca5a5] border-[#4a2424]'
                          : 'bg-[#1f2533] text-[#6ca8f7] border-[#2b3952]'
                      }`}>
                        Status: {app.status}
                      </span>
                      <button
                        onClick={() => handleWithdraw(app._id)}
                        className="text-xs text-[#6e7787] hover:text-red-400 p-1"
                        title="Withdraw application"
                      >
                        Withdraw
                      </button>
                    </div>
                  </div>

                  {/* Timeline Tracker */}
                  <div className="p-4 rounded-2xl bg-[#111317] border border-[#202530] space-y-3">
                    <span className="text-[11px] font-bold text-[#717b8c] uppercase tracking-wider block">
                      Hiring Timeline Milestones
                    </span>
                    <div className="space-y-3">
                      {app.timeline?.map((step, sIdx) => (
                        <div key={sIdx} className="flex items-start gap-3 text-xs">
                          <div className="w-2.5 h-2.5 rounded-full bg-[#d97746] mt-1 shrink-0"></div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-white">{step.status}</span>
                              <span className="text-[10px] text-[#5e6676] font-mono">
                                {new Date(step.date).toLocaleDateString()}
                              </span>
                            </div>
                            {step.note && <p className="text-[#848e9f] text-[11px] mt-0.5">{step.note}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
