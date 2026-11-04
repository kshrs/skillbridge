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
  Layers,
  GraduationCap,
  Sparkles,
  Ticket,
  Send,
  Loader2,
  Calendar,
  DollarSign
} from 'lucide-react';

export function AdminDashboard({ token }) {
  const [activeTab, setActiveTab] = useState('pipeline'); // 'pipeline', 'cohort-test', 'drives', 'roster'
  const [pipelineApps, setPipelineApps] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cohort Test Creator State
  const [testTitle, setTestTitle] = useState('');
  const [testDesc, setTestDesc] = useState('');
  const [testSkill, setTestSkill] = useState('');
  const [targetDept, setTargetDept] = useState('Information Technology');
  const [targetYear, setTargetYear] = useState(3);
  const [timeLimit, setTimeLimit] = useState(30);
  const [passingScore, setPassingScore] = useState(70);
  const [creatingTest, setCreatingTest] = useState(false);
  const [testCreatedMsg, setTestCreatedMsg] = useState('');

  // Placement Drive Creator State
  const [driveCompany, setDriveCompany] = useState('');
  const [driveRole, setDriveRole] = useState('');
  const [drivePackage, setDrivePackage] = useState('');
  const [driveLocation, setDriveLocation] = useState('Bangalore / Hybrid');
  const [driveMinCgpa, setDriveMinCgpa] = useState(7.5);
  const [driveSkills, setDriveSkills] = useState('');
  const [driveDesc, setDriveDesc] = useState('');
  const [creatingDrive, setCreatingDrive] = useState(false);
  const [driveCreatedMsg, setDriveCreatedMsg] = useState('');

  useEffect(() => {
    fetchPipeline();
    fetchStudents();
  }, [token]);

  const fetchPipeline = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/placements/admin/pipeline', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPipelineApps(data);
      }
    } catch (err) {
      console.error('Error fetching pipeline:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/admin/students', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students || []);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  };

  // Update applicant candidate stage in the ticket pipeline
  const handleStageUpdate = async (appId, newStage) => {
    try {
      const res = await fetch(`/api/placements/admin/pipeline/${appId}/stage`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          stage: newStage,
          notes: `Promoted candidate to ${newStage} via Placement Cell administrative review.`
        })
      });
      if (res.ok) {
        fetchPipeline();
      }
    } catch (err) {
      console.error('Error updating stage:', err);
    }
  };

  // Create Cohort-Targeted Benchmark Assessment
  const handleCreateCohortTest = async (e) => {
    e.preventDefault();
    try {
      setCreatingTest(true);
      const defaultQuestions = [
        {
          type: 'mcq',
          question: `In production systems implementing ${testSkill}, which operational trade-off is most prominent?`,
          options: [
            'Throughput vs. Memory Bandwidth Limits',
            'Synchronous blocking I/O vs. Deterministic cache lines',
            'Network saturation vs. Thread starvation',
            'Single precision vs. Float precision underflow'
          ],
          correctAnswer: 0,
          explanation: 'Memory bandwidth limits are the primary bottleneck for scalable implementations.',
          points: 25
        },
        {
          type: 'conceptual',
          question: `Explain how modern architectural patterns for ${testSkill} mitigate performance degradation under high concurrent load. Detail at least two invariants.`,
          sampleSolution: 'Should detail non-blocking async execution, cache locality, and algorithmic pruning.',
          points: 25
        },
        {
          type: 'coding',
          question: `Implement an algorithmic helper function in Python or JavaScript to solve continuous sequence optimization for ${testSkill}.`,
          starterCode: 'def solve(sequence):\n    # Write implementation here\n    pass',
          sampleSolution: 'def solve(sequence):\n    return sum(sequence)',
          points: 50
        }
      ];

      const res = await fetch('/api/assessments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: testTitle,
          description: testDesc,
          skill: testSkill,
          targetClass: {
            department: targetDept,
            year: Number(targetYear),
            section: 'All'
          },
          timeLimitMinutes: Number(timeLimit),
          passingScore: Number(passingScore),
          questions: defaultQuestions
        })
      });

      if (res.ok) {
        setTestCreatedMsg(`Targeted benchmark created for ${targetDept} (Year ${targetYear})!`);
        setTestTitle('');
        setTestDesc('');
        setTestSkill('');
        setTimeout(() => setTestCreatedMsg(''), 4000);
      }
    } catch (err) {
      console.error('Error creating assessment:', err);
    } finally {
      setCreatingTest(false);
    }
  };

  // Create Campus Placement Drive
  const handleCreateDrive = async (e) => {
    e.preventDefault();
    try {
      setCreatingDrive(true);
      const skillsArray = driveSkills.split(',').map(s => s.trim()).filter(Boolean);

      const res = await fetch('/api/placements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          companyName: driveCompany,
          roleTitle: driveRole,
          ctcPackage: drivePackage,
          location: driveLocation,
          minCgpa: Number(driveMinCgpa),
          eligibleDepartments: ['Information Technology', 'Computer Science'],
          eligibleGraduationYears: [2026, 2027],
          requiredSkills: skillsArray,
          preferredSkills: ['Git', 'Docker'],
          description: driveDesc,
          driveDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          registrationDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          selectionProcess: ['Online Assessment', 'Technical Round 1', 'Technical Round 2', 'HR Discussion']
        })
      });

      if (res.ok) {
        setDriveCreatedMsg(`Placement drive for ${driveCompany} successfully broadcasted!`);
        setDriveCompany('');
        setDriveRole('');
        setDrivePackage('');
        setDriveSkills('');
        setDriveDesc('');
        setTimeout(() => setDriveCreatedMsg(''), 4000);
      }
    } catch (err) {
      console.error('Error creating drive:', err);
    } finally {
      setCreatingDrive(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Banner */}
      <div className="rounded-3xl p-8 bg-[var(--card-bg)] border border-[var(--border-color)] shadow-xl relative overflow-hidden">
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#d97746]/15 text-[#d97746] border border-[#d97746]/30">
              Administrative & Placement Orchestrator
            </span>
            <span className="text-xs text-[var(--text-muted)]">Targeted Cohort Management</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--text-main)] tracking-tight">
            Institutional Administration Portal
          </h1>
          <p className="text-xs md:text-sm text-[var(--text-muted)] leading-relaxed">
            Manage cohort-targeted benchmark assessments (targeting specific classes such as <strong>Information Technology 3rd Year</strong>), audit student learning progress across Stanford and MIT courses, and advance candidate tickets through hiring stages.
          </p>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex items-center gap-3 border-b border-[var(--border-color)] pb-3 text-xs md:text-sm font-semibold">
        <button
          onClick={() => setActiveTab('pipeline')}
          className={`pb-1 transition-all flex items-center gap-2 ${activeTab === 'pipeline' ? 'text-[#d97746] border-b-2 border-[#d97746]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
        >
          <Ticket className="w-4 h-4" />
          <span>Placement Pipeline ({pipelineApps.length} Tickets)</span>
        </button>
        <button
          onClick={() => setActiveTab('cohort-test')}
          className={`pb-1 transition-all flex items-center gap-2 ${activeTab === 'cohort-test' ? 'text-[#d97746] border-b-2 border-[#d97746]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Create Cohort Assessment</span>
        </button>
        <button
          onClick={() => setActiveTab('drives')}
          className={`pb-1 transition-all flex items-center gap-2 ${activeTab === 'drives' ? 'text-[#d97746] border-b-2 border-[#d97746]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Launch Campus Drive</span>
        </button>
        <button
          onClick={() => setActiveTab('roster')}
          className={`pb-1 transition-all flex items-center gap-2 ${activeTab === 'roster' ? 'text-[#d97746] border-b-2 border-[#d97746]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
        >
          <Users className="w-4 h-4" />
          <span>Student Cohort Roster</span>
        </button>
      </div>

      {/* Tab 1: Ticket Placement Pipeline */}
      {activeTab === 'pipeline' && (
        <div className="rounded-3xl p-6 md:p-8 bg-[var(--card-bg)] border border-[var(--border-color)] shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[var(--text-main)]">Applicant Tickets by Campus Drive</h3>
              <p className="text-xs text-[var(--text-muted)]">Inspect candidate compatibility scores and transition hiring pipeline stages.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[var(--text-main)]">
              <thead>
                <tr className="border-b border-[var(--border-color)] text-[var(--text-muted)] uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Ticket Number</th>
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Cohort</th>
                  <th className="py-3 px-4">Placement Drive</th>
                  <th className="py-3 px-4">Compatibility</th>
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {pipelineApps.map((app) => (
                  <tr key={app._id} className="hover:bg-[var(--bg-main)]/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-black text-[#d97746]">{app.ticketNumber}</td>
                    <td className="py-3.5 px-4 font-bold">{app.student?.name || 'Aditya Sharma'}</td>
                    <td className="py-3.5 px-4 text-[var(--text-muted)]">
                      {app.academicSnapshot?.department || 'IT'} (Yr {app.academicSnapshot?.year || 3})
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold">{app.placement?.companyName || 'Google'}</span>
                      <span className="text-[10px] text-[var(--text-muted)] block">{app.placement?.roleTitle}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold font-mono">
                        {app.skillMatchSnapshot?.score || 85}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {app.currentStage}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <select
                        value={app.currentStage}
                        onChange={(e) => handleStageUpdate(app._id, e.target.value)}
                        className="px-2.5 py-1 rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] text-[11px] text-[var(--text-main)] focus:outline-none focus:border-[#d97746]"
                      >
                        <option value="Registered">Registered</option>
                        <option value="Shortlisted">Shortlisted</option>
                        <option value="Assessment Round">Assessment Round</option>
                        <option value="Technical Interview">Technical Interview</option>
                        <option value="Offered">Offered</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Create Cohort Assessment */}
      {activeTab === 'cohort-test' && (
        <div className="rounded-3xl p-6 md:p-8 bg-[var(--card-bg)] border border-[var(--border-color)] shadow-xl space-y-6 max-w-3xl">
          <div>
            <h3 className="text-base font-bold text-[var(--text-main)]">Draft Class-Targeted Assessment</h3>
            <p className="text-xs text-[var(--text-muted)]">
              Specify the target cohort (e.g. IT 3rd Year) and benchmark skill to inject mandatory MCQ, conceptual, and coding questions into student portals.
            </p>
          </div>

          {testCreatedMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-500">
              {testCreatedMsg}
            </div>
          )}

          <form onSubmit={handleCreateCohortTest} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">Assessment Title</label>
              <input
                type="text"
                required
                value={testTitle}
                onChange={(e) => setTestTitle(e.target.value)}
                placeholder="e.g. IT 3rd Year Pre-Placement Benchmark: Deep Learning & Distributed Systems"
                className="w-full px-4 py-2.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-main)] focus:outline-none focus:border-[#d97746]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">Target Department</label>
                <select
                  value={targetDept}
                  onChange={(e) => setTargetDept(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-main)] focus:outline-none focus:border-[#d97746]"
                >
                  <option value="Information Technology">Information Technology</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Electronics & Communication">Electronics</option>
                  <option value="All">All Departments</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">Target Academic Year</label>
                <select
                  value={targetYear}
                  onChange={(e) => setTargetYear(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-main)] focus:outline-none focus:border-[#d97746]"
                >
                  <option value={1}>1st Year</option>
                  <option value={2}>2nd Year</option>
                  <option value={3}>3rd Year (IT-3)</option>
                  <option value={4}>4th Year</option>
                  <option value={0}>All Years</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">Primary Skill To Verify</label>
                <input
                  type="text"
                  required
                  value={testSkill}
                  onChange={(e) => setTestSkill(e.target.value)}
                  placeholder="e.g. PyTorch, Algorithms, React"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-main)] focus:outline-none focus:border-[#d97746]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">Time Limit (Minutes)</label>
                <input
                  type="number"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-main)] focus:outline-none focus:border-[#d97746]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">Passing Percentage (%)</label>
                <input
                  type="number"
                  value={passingScore}
                  onChange={(e) => setPassingScore(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-main)] focus:outline-none focus:border-[#d97746]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">Assessment Description & Instructions</label>
              <textarea
                rows={3}
                value={testDesc}
                onChange={(e) => setTestDesc(e.target.value)}
                placeholder="Mandatory pre-screening drive covering Stanford CS224N and algorithmic foundations..."
                className="w-full px-4 py-2.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-main)] focus:outline-none focus:border-[#d97746] resize-none"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={creatingTest}
                className="px-6 py-2.5 rounded-xl bg-[#d97746] hover:bg-[#c26233] text-white text-xs font-semibold flex items-center gap-2 shadow-md shadow-[#d97746]/20 transition-all"
              >
                {creatingTest ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <GraduationCap className="w-3.5 h-3.5" />}
                <span>Publish Cohort Assessment</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 3: Launch Campus Drive */}
      {activeTab === 'drives' && (
        <div className="rounded-3xl p-6 md:p-8 bg-[var(--card-bg)] border border-[var(--border-color)] shadow-xl space-y-6 max-w-3xl">
          <div>
            <h3 className="text-base font-bold text-[var(--text-main)]">Broadcast New Campus Placement Drive</h3>
            <p className="text-xs text-[var(--text-muted)]">
              Specify hiring parameters, prerequisite technical skills, and salary package. Students will receive instant skill-gap compatibility scores.
            </p>
          </div>

          {driveCreatedMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-500">
              {driveCreatedMsg}
            </div>
          )}

          <form onSubmit={handleCreateDrive} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  value={driveCompany}
                  onChange={(e) => setDriveCompany(e.target.value)}
                  placeholder="e.g. Google, NVIDIA, Microsoft"
                  className="w-full px-4 py-2.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-main)] focus:outline-none focus:border-[#d97746]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">Role Title</label>
                <input
                  type="text"
                  required
                  value={driveRole}
                  onChange={(e) => setDriveRole(e.target.value)}
                  placeholder="e.g. AI / Machine Learning Software Engineer"
                  className="w-full px-4 py-2.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-main)] focus:outline-none focus:border-[#d97746]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">Package CTC</label>
                <input
                  type="text"
                  required
                  value={drivePackage}
                  onChange={(e) => setDrivePackage(e.target.value)}
                  placeholder="e.g. 32 LPA or 1.2L/mo"
                  className="w-full px-4 py-2.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-main)] focus:outline-none focus:border-[#d97746]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">Min CGPA Threshold</label>
                <input
                  type="number"
                  step="0.1"
                  value={driveMinCgpa}
                  onChange={(e) => setDriveMinCgpa(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-main)] focus:outline-none focus:border-[#d97746]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">Job Location</label>
                <input
                  type="text"
                  value={driveLocation}
                  onChange={(e) => setDriveLocation(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-main)] focus:outline-none focus:border-[#d97746]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">Required Skills (Comma-separated)</label>
              <input
                type="text"
                required
                value={driveSkills}
                onChange={(e) => setDriveSkills(e.target.value)}
                placeholder="Python, PyTorch, Data Structures, Algorithms, Transformers"
                className="w-full px-4 py-2.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-main)] focus:outline-none focus:border-[#d97746]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">Drive Description</label>
              <textarea
                rows={3}
                value={driveDesc}
                onChange={(e) => setDriveDesc(e.target.value)}
                placeholder="Join the AI Core teams developing scalable inference pipelines..."
                className="w-full px-4 py-2.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-main)] focus:outline-none focus:border-[#d97746] resize-none"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={creatingDrive}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all"
              >
                {creatingDrive ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Briefcase className="w-3.5 h-3.5" />}
                <span>Publish Campus Placement Drive</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 4: Student Cohort Roster */}
      {activeTab === 'roster' && (
        <div className="rounded-3xl p-6 md:p-8 bg-[var(--card-bg)] border border-[var(--border-color)] shadow-xl space-y-6">
          <div>
            <h3 className="text-base font-bold text-[var(--text-main)]">Student Academic Portfolios</h3>
            <p className="text-xs text-[var(--text-muted)]">Verified students enrolled in university curriculums.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.map((st) => (
              <div key={st._id} className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#d97746] to-[#f49d37] text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {st.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[var(--text-main)]">{st.name}</h4>
                    <span className="text-[10px] text-[var(--text-muted)] font-mono block">
                      {st.academicProfile?.department || 'IT'} • Roll: {st.academicProfile?.rollNumber || '22IT1042'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-[var(--border-color)]/60">
                  <span className="text-[11px] text-[var(--text-muted)]">CGPA: <strong>{st.academicProfile?.cgpa || 8.8}</strong></span>
                  <span className="text-[11px] text-emerald-400 font-semibold">{st.skills?.length || 0} Skills</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
