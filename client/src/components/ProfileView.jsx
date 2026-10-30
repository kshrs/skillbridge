import React, { useState } from 'react';
import { 
  User as UserIcon, 
  Sparkles, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Award, 
  Briefcase, 
  GraduationCap, 
  Save 
} from 'lucide-react';

export const ProfileView = ({ user, skillGap, onUpdateProfile, onAddSkill, onRemoveSkill }) => {
  const [name, setName] = useState(user?.name || '');
  const [headline, setHeadline] = useState(user?.headline || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [targetRole, setTargetRole] = useState(user?.targetRole || 'Full Stack Developer');
  
  // New skill input
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState('Intermediate');
  
  const [isSaving, setIsSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMsg('');
    const res = await onUpdateProfile({
      name,
      headline,
      bio,
      targetRole
    });
    if (res?.success) {
      setMsg('Profile details updated!');
    } else {
      setMsg('Update failed.');
    }
    setIsSaving(false);
  };

  const handleAddSkillSubmit = async (e) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    await onAddSkill(newSkillName.trim(), newSkillLevel);
    setNewSkillName('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Student Profile & Skill Inventory</h2>
        <p className="text-xs text-[#7e8798] mt-0.5">Manage your personal details, career target role, and technical competencies</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form: Profile Metadata (7 cols) */}
        <div className="lg:col-span-7 app-card p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/5">
            <h3 className="text-base font-bold text-white">General Information</h3>
            {msg && <span className="text-xs text-[#9ed68c] font-semibold">{msg}</span>}
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#8c96a7] block mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#111317] border border-[#232833] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#d97746]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#8c96a7] block mb-1">Target Career Role</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full bg-[#111317] border border-[#232833] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#d97746]"
                >
                  <option value="Full Stack Developer">Full Stack Developer</option>
                  <option value="Frontend Developer">Frontend Developer</option>
                  <option value="Backend Developer">Backend Developer</option>
                  <option value="AI / ML Engineer">AI / ML Engineer</option>
                  <option value="DevOps Engineer">DevOps Engineer</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#8c96a7] block mb-1">Professional Headline</label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full bg-[#111317] border border-[#232833] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#d97746]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#8c96a7] block mb-1">Bio / Statement</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full bg-[#111317] border border-[#232833] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#d97746]"
              />
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="py-2.5 px-6 rounded-xl bg-white text-black font-bold text-xs hover:bg-gray-200 transition-colors flex items-center gap-2 shadow"
            >
              <Save size={14} /> {isSaving ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </form>

          {/* Education Box */}
          <div className="pt-4 border-t border-white/5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#8c96a7] flex items-center gap-1.5">
              <GraduationCap size={15} /> Academic Background
            </h4>
            <div className="p-4 rounded-2xl bg-[#111317] border border-[#1f242e] text-xs space-y-1">
              <div className="font-bold text-white">B.Tech in Computer Science & Engineering</div>
              <p className="text-[#8792a3]">National Institute of Technology • 2022 - 2026</p>
              <p className="text-[#5f6878] font-mono text-[11px]">Cumulative GPA: 8.8 / 10.0</p>
            </div>
          </div>
        </div>

        {/* Right Column: Skills & Verification (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Skills CRUD */}
          <div className="app-card p-6 md:p-8 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <h3 className="text-base font-bold text-white">Skills Inventory (CRUD)</h3>
              <span className="text-xs text-[#70798a] font-mono">
                {user?.skills?.length || 0} active
              </span>
            </div>

            {/* Add Skill Form */}
            <form onSubmit={handleAddSkillSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Docker, TypeScript"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                className="flex-1 bg-[#111317] border border-[#232833] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d97746]"
              />
              <select
                value={newSkillLevel}
                onChange={(e) => setNewSkillLevel(e.target.value)}
                className="bg-[#111317] border border-[#232833] rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-[#d97746] text-black font-bold text-xs hover:bg-[#e68453] transition-colors"
                title="Add Skill"
              >
                <Plus size={15} />
              </button>
            </form>

            {/* List of Skills */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {user?.skills?.map((skill, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#111317] border border-[#202530] flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{skill.name}</span>
                    <span className="text-[10px] text-[#70798a] px-1.5 py-0.5 rounded bg-[#181c24]">
                      {skill.level}
                    </span>
                    {skill.verified ? (
                      <span className="text-[10px] font-bold text-[#9ed68c] flex items-center gap-0.5" title="Verified by Assessment">
                        <CheckCircle2 size={11} /> Verified
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#717b8b]">Self-reported</span>
                    )}
                  </div>

                  <button
                    onClick={() => onRemoveSkill(skill.name)}
                    className="text-[#5a6273] hover:text-red-400 p-1"
                    title="Remove skill"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* AI Gap Snapshot Card */}
          <div className="app-card p-6 space-y-4 border border-[#d97746]/20 bg-gradient-to-br from-[#161a22] to-[#121419]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#d97746] flex items-center gap-1.5">
                <Sparkles size={14} /> Employability Readiness
              </span>
              <span className="text-xl font-black text-white font-mono">
                {skillGap?.readinessScore ?? 62}%
              </span>
            </div>

            <div className="text-xs text-[#8c96a7] leading-relaxed">
              Based on your target role (<strong className="text-white">{targetRole}</strong>), you have matched {skillGap?.matchedCount ?? 3} of {skillGap?.totalRequired ?? 5} core benchmark skills.
            </div>

            <div className="pt-2 border-t border-white/5 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#f3a478]">Recommended next badges:</span>
              <div className="flex flex-wrap gap-1.5">
                {(skillGap?.recommendedSkills || ['Node.js', 'Express', 'Docker']).map((rec, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-full bg-[#271d18] border border-[#482d1f] text-[#f6b38c] text-[11px] font-semibold">
                    {rec}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
