import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Briefcase, 
  BookOpen, 
  Plus, 
  Trash2, 
  TrendingUp, 
  CheckCircle, 
  ShieldCheck, 
  Clock,
  Layers
} from 'lucide-react';

export const AdminDashboard = ({ token }) => {
  const [stats, setStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const [students, setStudents] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'jobs' | 'applications' | 'students'
  
  // New Job Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newLocation, setNewLocation] = useState('Remote');
  const [newType, setNewType] = useState('Internship');
  const [newSkills, setNewSkills] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [postingJob, setPostingJob] = useState(false);
  const [jobMsg, setJobMsg] = useState('');

  useEffect(() => {
    fetchStats();
    fetchAdminApplications();
    fetchStudents();
  }, [token]);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setStats(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAdminApplications = async () => {
    try {
      const res = await fetch('/api/applications/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setApplications(data.applications);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/admin/students', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setStudents(data.students);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      const res = await fetch(`/api/applications/${appId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus, note: `Status updated by admin to ${newStatus}` })
      });
      const data = await res.json();
      if (data.success) {
        fetchAdminApplications();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    setPostingJob(true);
    setJobMsg('');
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newTitle,
          company: newCompany,
          location: newLocation,
          type: newType,
          requiredSkills: newSkills.split(',').map(s => s.trim()),
          description: newDesc
        })
      });
      const data = await res.json();
      if (data.success) {
        setJobMsg('New job listing published!');
        setNewTitle('');
        setNewCompany('');
        setNewSkills('');
        setNewDesc('');
        fetchStats();
      } else {
        setJobMsg(data.message || 'Error creating job');
      }
    } catch (e) {
      setJobMsg('Server error');
    } finally {
      setPostingJob(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-[#d97746]/20 text-[#d97746] text-[10px] font-black uppercase">
              Admin Control Hub
            </span>
            <span className="text-xs text-[#70798a]">SkillBridge Platform Admin</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight mt-1">Platform Analytics & Management</h2>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 p-1 bg-[#14171d] rounded-2xl border border-[#232731]">
          {['overview', 'create-job', 'applications', 'students'].map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                activeTab === t
                  ? 'bg-white text-black shadow'
                  : 'text-[#7d8697] hover:text-white'
              }`}
            >
              {t.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Cards Row */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="app-card p-4 space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#697283]">Registered Students</span>
            <div className="text-2xl font-black text-white">{stats.metrics.totalStudents}</div>
          </div>
          <div className="app-card p-4 space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#697283]">Active Postings</span>
            <div className="text-2xl font-black text-[#9ed68c]">{stats.metrics.activeJobs}</div>
          </div>
          <div className="app-card p-4 space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#697283]">Job Applications</span>
            <div className="text-2xl font-black text-[#f3c46e]">{stats.metrics.totalApplications}</div>
          </div>
          <div className="app-card p-4 space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#697283]">Curriculum Courses</span>
            <div className="text-2xl font-black text-white">{stats.metrics.totalCourses}</div>
          </div>
          <div className="app-card p-4 space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#697283]">System Database</span>
            <div className="text-sm font-black text-[#9ed68c] font-mono mt-1">MongoDB 7 (Online)</div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {activeTab === 'overview' && stats && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Top In-Demand Skills in Ecosystem (6 cols) */}
          <div className="lg:col-span-6 app-card p-6 md:p-8 space-y-4">
            <h3 className="text-base font-bold text-white">Student Skill Distribution</h3>
            <p className="text-xs text-[#7e8798]">Most commonly acquired skills across the student body</p>

            <div className="space-y-3 pt-2">
              {stats.topSkills.map((sk, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white font-medium">{sk.name}</span>
                    <span className="text-[#6d7788] font-mono">{sk.count} students</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#1f242e] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#d97746] rounded-full" 
                      style={{ width: `${Math.min(100, sk.count * 40)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Candidate Applications (6 cols) */}
          <div className="lg:col-span-6 app-card p-6 md:p-8 space-y-4">
            <h3 className="text-base font-bold text-white">Recent Application Pipeline</h3>
            <p className="text-xs text-[#7e8798]">Live applications submitted by youth candidates</p>

            <div className="space-y-2 pt-2">
              {stats.recentApplications.map((app) => (
                <div key={app._id} className="p-3 rounded-xl bg-[#111317] border border-[#1f242f] flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-white">{app.studentId?.name || 'Applicant'}</div>
                    <div className="text-[11px] text-[#717b8c]">{app.jobId?.title} • {app.jobId?.company}</div>
                  </div>
                  <span className="px-2.5 py-1 rounded-md bg-[#191d26] text-[#b3bdcb] font-semibold text-[10px]">
                    {app.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'create-job' && (
        <div className="app-card p-6 md:p-8 max-w-2xl mx-auto space-y-6">
          <div className="pb-3 border-b border-white/5">
            <h3 className="text-lg font-bold text-white">Post New Job or Internship Opening (CRUD)</h3>
            <p className="text-xs text-[#7e8798]">Create new career opportunities for students</p>
          </div>

          {jobMsg && (
            <div className="p-3 rounded-xl bg-green-950/50 border border-green-800/40 text-[#9ed68c] text-xs font-semibold">
              {jobMsg}
            </div>
          )}

          <form onSubmit={handleCreateJob} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-[#8c96a7] block mb-1">Job / Internship Title</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Junior Backend Node Engineer"
                className="w-full bg-[#111317] border border-[#232833] rounded-xl p-2.5 text-white focus:outline-none focus:border-[#d97746]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-[#8c96a7] block mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  placeholder="e.g. CloudForge Systems"
                  className="w-full bg-[#111317] border border-[#232833] rounded-xl p-2.5 text-white focus:outline-none focus:border-[#d97746]"
                />
              </div>

              <div>
                <label className="font-bold text-[#8c96a7] block mb-1">Employment Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="w-full bg-[#111317] border border-[#232833] rounded-xl p-2.5 text-white focus:outline-none"
                >
                  <option value="Internship">Internship</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-bold text-[#8c96a7] block mb-1">Location</label>
              <input
                type="text"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                className="w-full bg-[#111317] border border-[#232833] rounded-xl p-2.5 text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-[#8c96a7] block mb-1">Required Skills (comma separated)</label>
              <input
                type="text"
                required
                value={newSkills}
                onChange={(e) => setNewSkills(e.target.value)}
                placeholder="e.g. Node.js, Express, MongoDB, Docker"
                className="w-full bg-[#111317] border border-[#232833] rounded-xl p-2.5 text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-[#8c96a7] block mb-1">Job Description</label>
              <textarea
                required
                rows={4}
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Describe role scope, technologies, and mentorship..."
                className="w-full bg-[#111317] border border-[#232833] rounded-xl p-2.5 text-white focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={postingJob}
              className="w-full py-3 rounded-xl bg-white text-black font-bold hover:bg-gray-200 transition-colors"
            >
              {postingJob ? 'Publishing...' : 'Publish Opening'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'applications' && (
        <div className="app-card p-6 md:p-8 space-y-4">
          <h3 className="text-base font-bold text-white">Review & Manage Applications (CRUD Status)</h3>
          <div className="space-y-3">
            {applications.map((app) => (
              <div key={app._id} className="p-4 rounded-2xl bg-[#111317] border border-[#1f242e] flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                <div>
                  <div className="font-bold text-white text-sm">
                    {app.studentId?.name || 'Candidate'} ({app.studentId?.email})
                  </div>
                  <div className="text-[#8c96a7] mt-0.5">
                    Applied for: <span className="text-white font-medium">{app.jobId?.title}</span> at {app.jobId?.company}
                  </div>
                  {app.matchScore && (
                    <div className="text-[11px] text-[#f3c46e] font-mono mt-1">
                      AI Compatibility Score: {app.matchScore}%
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={app.status}
                    onChange={(e) => handleUpdateStatus(app._id, e.target.value)}
                    className="bg-[#181d26] border border-[#2a313f] text-white rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none"
                  >
                    <option value="Submitted">Submitted</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Skill Assessment">Skill Assessment</option>
                    <option value="Interview Scheduled">Interview Scheduled</option>
                    <option value="Offered">Offered</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'students' && (
        <div className="app-card p-6 md:p-8 space-y-4">
          <h3 className="text-base font-bold text-white">Registered Students Roster</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {students.map((st) => (
              <div key={st._id} className="p-4 rounded-2xl bg-[#111317] border border-[#1f242e] text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">{st.name}</span>
                  <span className="text-[10px] font-mono text-[#d97746]">{st.targetRole}</span>
                </div>
                <div className="text-[#7e8798]">{st.email}</div>
                <div className="flex flex-wrap gap-1 pt-1">
                  {st.skills?.map((s, idx) => (
                    <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-[#181d26] text-[#b3bdcb]">
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
