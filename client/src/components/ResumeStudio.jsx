import React, { useState } from 'react';
import { 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  Plus, 
  Trash2, 
  Save, 
  Cpu,
  Layers,
  ArrowRight
} from 'lucide-react';

export const ResumeStudio = ({ user, token, onUpdateResume }) => {
  const [activeSubTab, setActiveSubTab] = useState('builder'); // 'builder' | 'ai-analysis'
  
  // Resume Builder state
  const [title, setTitle] = useState(user?.resume?.title || 'Master Tech Resume');
  const [summary, setSummary] = useState(user?.resume?.summary || 'Junior software developer specializing in React and MongoDB.');
  const [projects, setProjects] = useState(user?.resume?.projects || [
    { title: 'SkillBridge Platform', tech: ['React', 'Node.js', 'MongoDB', 'Tailwind CSS'], link: 'https://github.com/aditya/skillbridge', description: 'Youth employability engine with automated skill gap mapping.' }
  ]);
  const [experience, setExperience] = useState(user?.resume?.experience || [
    { role: 'Web Development Intern', company: 'TechNovation', period: '2025', description: 'Built dark theme UI dashboard widgets and REST endpoints.' }
  ]);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  // AI Resume Analyzer state
  const [resumeText, setResumeText] = useState(
    `Aditya - Software Engineering Student\nSkills: React, JavaScript, MongoDB, Git\nExperience: Web Development Intern at TechNovation Labs\nEducation: B.Tech Computer Science\nProjects: Built SkillBridge platform, a youth employability platform with skill recommendations and match scoring.`
  );
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const handleSaveResume = async () => {
    setSaving(true);
    setSaveMsg('');
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          resume: {
            title,
            summary,
            projects,
            experience
          }
        })
      });
      const data = await res.json();
      if (data.success) {
        setSaveMsg('Resume saved successfully!');
        if (onUpdateResume) onUpdateResume();
      }
    } catch (e) {
      setSaveMsg('Failed to save resume.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddProject = () => {
    setProjects([
      ...projects,
      { title: 'New Full Stack Project', tech: ['React', 'Express'], link: '', description: 'Describe technical outcomes and metrics achieved.' }
    ]);
  };

  const handleRemoveProject = (index) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  const handleRunAiAnalysis = async () => {
    setAnalyzing(true);
    try {
      const res = await fetch('/api/assessments/ai-resume-analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ resumeText })
      });
      const data = await res.json();
      if (data.success) {
        setAiAnalysis(data.analysis);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Resume Studio & AI Audit</h2>
          <p className="text-xs text-[#7e8798] mt-0.5">Build formatted developer resumes and evaluate ATS compliance with AI parser</p>
        </div>

        <div className="flex items-center gap-2 p-1 bg-[#14171d] rounded-2xl border border-[#232731]">
          <button
            onClick={() => setActiveSubTab('builder')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeSubTab === 'builder'
                ? 'bg-white text-black shadow-sm'
                : 'text-[#7d8697] hover:text-white'
            }`}
          >
            Resume Builder
          </button>
          <button
            onClick={() => setActiveSubTab('ai-analysis')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'ai-analysis'
                ? 'bg-white text-black shadow-sm'
                : 'text-[#7d8697] hover:text-white'
            }`}
          >
            <Sparkles size={13} className="text-[#d97746]" /> AI Resume Analyzer
          </button>
        </div>
      </div>

      {activeSubTab === 'builder' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Builder Form (7 cols) */}
          <div className="lg:col-span-7 app-card p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Edit Resume Content</h3>
              {saveMsg && <span className="text-xs text-[#9ed68c] font-medium">{saveMsg}</span>}
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#8c96a7] block mb-1">Resume Document Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#111317] border border-[#232833] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#d97746]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#8c96a7] block mb-1">Professional Summary</label>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  rows={3}
                  className="w-full bg-[#111317] border border-[#232833] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#d97746]"
                />
              </div>

              {/* Projects Section */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#8c96a7]">Projects & Technical Implementations</label>
                  <button
                    onClick={handleAddProject}
                    className="text-xs font-semibold text-[#d97746] hover:text-[#f3a478] flex items-center gap-1"
                  >
                    <Plus size={13} /> Add Project
                  </button>
                </div>

                {projects.map((proj, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-[#111317] border border-[#202530] space-y-3">
                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        value={proj.title}
                        onChange={(e) => {
                          const updated = [...projects];
                          updated[idx].title = e.target.value;
                          setProjects(updated);
                        }}
                        placeholder="Project Title"
                        className="bg-transparent text-xs font-bold text-white focus:outline-none w-2/3 border-b border-transparent focus:border-[#d97746]"
                      />
                      <button
                        onClick={() => handleRemoveProject(idx)}
                        className="text-[#656e7f] hover:text-red-400 p-1"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <input
                      type="text"
                      value={proj.tech?.join(', ') || ''}
                      onChange={(e) => {
                        const updated = [...projects];
                        updated[idx].tech = e.target.value.split(',').map(s => s.trim());
                        setProjects(updated);
                      }}
                      placeholder="Tech stack (e.g. React, Node.js, Express)"
                      className="w-full bg-[#161a22] border border-[#242934] rounded-lg p-2 text-[11px] text-[#cbd2e0] focus:outline-none"
                    />

                    <textarea
                      value={proj.description}
                      onChange={(e) => {
                        const updated = [...projects];
                        updated[idx].description = e.target.value;
                        setProjects(updated);
                      }}
                      placeholder="Key engineering challenges, metrics, and architecture..."
                      rows={2}
                      className="w-full bg-[#161a22] border border-[#242934] rounded-lg p-2 text-[11px] text-[#cbd2e0] focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleSaveResume}
              disabled={saving}
              className="w-full py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 shadow"
            >
              <Save size={14} /> {saving ? 'Saving...' : 'Save Resume To Profile'}
            </button>
          </div>

          {/* Live Preview Paper (5 cols) */}
          <div className="lg:col-span-5 app-card p-6 md:p-8 space-y-5 bg-[#0f1115] border border-[#222834]">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <span className="text-[10px] font-mono uppercase text-[#737c8e]">Formatted ATS Document Preview</span>
              <button 
                onClick={() => window.print()}
                className="text-xs text-[#a0a9ba] hover:text-white flex items-center gap-1"
              >
                <Download size={13} /> Export PDF
              </button>
            </div>

            {/* Document sheet */}
            <div className="p-6 rounded-2xl bg-[#14171d] border border-white/5 space-y-4 text-xs font-sans">
              <div className="text-center pb-3 border-b border-white/10 space-y-1">
                <h2 className="text-lg font-extrabold text-white tracking-wide">{user?.name || 'Aditya'}</h2>
                <p className="text-[11px] text-[#8e98aa]">{user?.headline || 'Full Stack Engineering Student'}</p>
                <p className="text-[10px] text-[#697384] font-mono">{user?.email} • GitHub: github.com/aditya</p>
              </div>

              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#d97746] mb-1">Summary</h4>
                <p className="text-[11px] text-[#b3bdcb] leading-relaxed">{summary}</p>
              </div>

              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#d97746] mb-1">Skills</h4>
                <div className="flex flex-wrap gap-1">
                  {user?.skills?.map((s, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-[#1f242e] text-[#cbd2e0] text-[10px]">
                      {s.name || s}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#d97746] mb-1">Key Projects</h4>
                <div className="space-y-2">
                  {projects.map((p, i) => (
                    <div key={i} className="text-[11px]">
                      <div className="font-bold text-white">{p.title}</div>
                      <div className="text-[10px] text-[#717b8c] font-mono">{p.tech?.join(' • ')}</div>
                      <p className="text-[#a4adbc] text-[10px] mt-0.5">{p.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* AI Resume Analysis View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-6 app-card p-6 md:p-8 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles size={16} className="text-[#d97746]" /> Paste Resume Text for AI Parsing
            </h3>
            <p className="text-xs text-[#7d8697]">
              Our parsing engine extracts verified skills, calculates ATS structural strength, and identifies missing keywords for the {user?.targetRole || 'Full Stack Developer'} benchmark.
            </p>

            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              rows={12}
              className="w-full bg-[#111317] border border-[#232833] rounded-2xl p-4 text-xs font-mono text-[#cbd2e0] focus:outline-none focus:border-[#d97746] leading-relaxed"
              placeholder="Paste raw resume or paste LinkedIn profile text here..."
            />

            <button
              onClick={handleRunAiAnalysis}
              disabled={analyzing}
              className="w-full py-3 rounded-2xl bg-white text-black font-bold text-xs hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 shadow"
            >
              <Cpu size={14} /> {analyzing ? 'Analyzing with Neural Parser...' : 'Run AI Resume & Skill Analysis'}
            </button>
          </div>

          <div className="lg:col-span-6 space-y-4">
            {aiAnalysis ? (
              <div className="app-card p-6 md:p-8 space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-white/5">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#d97746]">AI Audit Complete</span>
                    <h4 className="text-lg font-bold text-white mt-0.5">Resume Strength Score</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-extrabold text-[#9ed68c]">{aiAnalysis.overallStrength}/100</span>
                    <p className="text-[10px] text-[#697283]">ATS Benchmark</p>
                  </div>
                </div>

                {/* Detected Skills */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-[#8c96a7] uppercase tracking-wider block">
                    Detected Skills ({aiAnalysis.detectedSkills.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {aiAnalysis.detectedSkills.map((sk, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-full bg-[#1b251e] border border-[#2f4a35] text-[#9ed68c] text-xs font-semibold">
                        ✓ {sk}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Section Check */}
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold text-[#8c96a7] uppercase tracking-wider block">
                    ATS Structural Sections Found
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(aiAnalysis.sectionsFound).map(([sec, found]) => (
                      <div key={sec} className="p-2.5 rounded-xl bg-[#111317] border border-[#1f242e] flex items-center justify-between">
                        <span className="capitalize text-[#cbd2e0]">{sec}</span>
                        {found ? (
                          <span className="text-[#9ed68c] font-bold text-[10px]">Pass</span>
                        ) : (
                          <span className="text-[#fca5a5] font-bold text-[10px]">Missing</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Recommendations */}
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold text-[#f3a478] uppercase tracking-wider block">
                    Actionable Improvement Recommendations
                  </span>
                  <div className="space-y-2">
                    {aiAnalysis.improvements.map((imp, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-[#211915] border border-[#422c1f] text-xs text-[#f4ba98] flex items-start gap-2">
                        <AlertCircle size={14} className="shrink-0 mt-0.5 text-[#f3a478]" />
                        <span>{imp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="app-card p-12 text-center space-y-3">
                <Sparkles size={36} className="mx-auto text-[#d97746]/50" />
                <h4 className="text-base font-bold text-white">No Analysis Run Yet</h4>
                <p className="text-xs text-[#7e8798]">
                  Click "Run AI Resume & Skill Analysis" on the left to inspect syntax, keyword matches, and role compatibility.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
