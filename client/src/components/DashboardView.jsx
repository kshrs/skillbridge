import React, { useState } from 'react';
import { 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  Briefcase, 
  Clock, 
  Sparkles, 
  Play, 
  BookOpen, 
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { TokenBarChart, EmbeddingsScatterChart, AttentionArcChart } from './DataVisualizations';

export const DashboardView = ({ user, skillGap, setActiveTab, onQuickApply }) => {
  const [selectedDay, setSelectedDay] = useState(22);
  const calendarDays = [
    { day: 'M', date: 19 },
    { day: 'T', date: 20 },
    { day: 'W', date: 21 },
    { day: 'T', date: 22, active: true },
    { day: 'F', date: 23 },
    { day: 'S', date: 24 },
    { day: 'S', date: 25 },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Main Grid matching the exact layout of the attached UI */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Column (8 of 12): Greeting + Hero Card + Learning Path */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Hero "Continue where you left off" Card */}
          <div className="app-card p-6 md:p-8 relative overflow-hidden flex flex-col justify-between">
            {/* Top row: Greeting and action button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                  Hello, {user?.name || 'Aditya'}
                </h1>
                <p className="text-sm text-[#7d8697] mt-1">Pick up where you left off.</p>
              </div>

              <button 
                onClick={() => setActiveTab('curriculum')}
                className="self-start sm:self-auto px-4 py-2 rounded-xl bg-[#202530] hover:bg-[#282e3c] text-xs font-semibold text-[#cbd2e0] border border-[#2d3444] transition-colors"
              >
                Browse the curriculum
              </button>
            </div>

            {/* Inner Feature split: Continue Topic + Data visualization */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-[#101217] p-5 rounded-2xl border border-white/5">
              <div className="md:col-span-6 space-y-4">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#d97746]">
                    Continue • Module 01
                  </div>
                  <h2 className="text-2xl font-bold text-white mt-1">Tokenization</h2>
                  <p className="text-xs text-[#8c95a6] mt-0.5">Topic 1: Models do not read text</p>
                </div>

                {/* Progress bar and time */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-[#20242e] rounded-full overflow-hidden flex gap-1">
                      <div className="h-full bg-white w-1/4 rounded-full"></div>
                      <div className="h-full bg-[#20242e] w-1/4 rounded-full"></div>
                      <div className="h-full bg-[#20242e] w-1/4 rounded-full"></div>
                      <div className="h-full bg-[#20242e] w-1/4 rounded-full"></div>
                    </div>
                  </div>
                  <div className="text-[11px] text-[#697283]">
                    1 of 8 topics • 18 min remaining
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-1">
                  <button 
                    onClick={() => setActiveTab('skill-assessment')}
                    className="px-5 py-2.5 rounded-full bg-white text-[#121417] text-xs font-bold hover:bg-gray-200 transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <Play size={12} fill="currentColor" /> Continue
                  </button>
                  <button 
                    onClick={() => setActiveTab('curriculum')}
                    className="px-4 py-2.5 rounded-full bg-[#1b1f27] text-xs font-semibold text-[#a6b0c2] hover:text-white border border-[#2b313e] transition-colors"
                  >
                    Outline
                  </button>
                </div>
              </div>

              {/* Right miniature chart visualization */}
              <div className="md:col-span-6">
                <TokenBarChart compact />
              </div>
            </div>
          </div>

          {/* Module 01 - Foundations Grid Section */}
          <div className="app-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono text-[#d97746]">Module 01 • you are here</span>
                <h3 className="text-lg font-bold text-white mt-0.5">Model Foundations</h3>
                <p className="text-xs text-[#6e7788]">1 of 6 lessons started • 46 topics</p>
              </div>

              <button 
                onClick={() => setActiveTab('curriculum')}
                className="px-3.5 py-1.5 rounded-xl bg-[#1b1f27] hover:bg-[#242935] text-xs font-medium text-[#9da7b8] border border-[#29303d] transition-colors"
              >
                View module
              </button>
            </div>

            {/* 3 cards matching the reference image: Tokenization, Embeddings, Attention */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {/* Card 1 */}
              <div 
                onClick={() => setActiveTab('skill-assessment')}
                className="app-card-sub p-4 space-y-3 cursor-pointer hover:border-white/20 transition-all group"
              >
                <TokenBarChart compact />
                <div>
                  <h4 className="text-sm font-semibold text-white group-hover:text-[#d97746] transition-colors">
                    Tokenization
                  </h4>
                  <div className="flex items-center justify-between text-[11px] text-[#697283] mt-1">
                    <span>18 min • Beginner</span>
                    <span className="font-mono text-[#9ed68c]">1 / 8</span>
                  </div>
                </div>
                <div className="w-full h-1 bg-[#232731] rounded-full overflow-hidden">
                  <div className="h-full bg-[#d97746] w-1/8"></div>
                </div>
              </div>

              {/* Card 2 */}
              <div 
                onClick={() => setActiveTab('skill-assessment')}
                className="app-card-sub p-4 space-y-3 cursor-pointer hover:border-white/20 transition-all group"
              >
                <EmbeddingsScatterChart />
                <div>
                  <h4 className="text-sm font-semibold text-white group-hover:text-[#d97746] transition-colors">
                    Embeddings
                  </h4>
                  <div className="flex items-center justify-between text-[11px] text-[#697283] mt-1">
                    <span>20 min • Beginner</span>
                    <span className="font-mono text-[#626a7a]">0 / 8</span>
                  </div>
                </div>
                <div className="w-full h-1 bg-[#232731] rounded-full overflow-hidden">
                  <div className="h-full bg-[#374151] w-0"></div>
                </div>
              </div>

              {/* Card 3 */}
              <div 
                onClick={() => setActiveTab('skill-assessment')}
                className="app-card-sub p-4 space-y-3 cursor-pointer hover:border-white/20 transition-all group"
              >
                <AttentionArcChart />
                <div>
                  <h4 className="text-sm font-semibold text-white group-hover:text-[#d97746] transition-colors">
                    Attention
                  </h4>
                  <div className="flex items-center justify-between text-[11px] text-[#697283] mt-1">
                    <span>22 min • Beginner</span>
                    <span className="font-mono text-[#626a7a]">0 / 8</span>
                  </div>
                </div>
                <div className="w-full h-1 bg-[#232731] rounded-full overflow-hidden">
                  <div className="h-full bg-[#374151] w-0"></div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Skill-Gap Analysis Card (Direct fulfillment of example requirement) */}
          <div className="app-card p-6 space-y-4 border border-[#d97746]/20 bg-gradient-to-br from-[#16191f] to-[#121418]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#d97746]/10 border border-[#d97746]/30 flex items-center justify-center text-[#d97746]">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">AI Skill-Gap & Employability Match</h3>
                  <p className="text-xs text-[#7d8697]">
                    Targeting: <span className="text-[#e2e8f0] font-semibold">{user?.targetRole || 'Full Stack Developer'}</span>
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-2xl font-black text-[#f3c46e]">
                  {skillGap?.readinessScore ?? 62}%
                </span>
                <p className="text-[10px] text-[#717b8d] uppercase tracking-wider">Role Readiness</p>
              </div>
            </div>

            {/* Current vs Recommended Skills Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Current Skills */}
              <div className="p-4 rounded-2xl bg-[#0f1116] border border-[#1f242e] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#9ed68c] flex items-center gap-1.5">
                    <CheckCircle2 size={13} /> Current Skills
                  </span>
                  <span className="text-[10px] text-[#687182]">
                    {user?.skills?.length || 3} verified
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {user?.skills?.map((s, idx) => (
                    <span 
                      key={idx}
                      className="px-3 py-1 rounded-full bg-[#1b221a] border border-[#2f432b] text-xs font-medium text-[#b3e0a3]"
                    >
                      {s.name || s} {s.level ? `(${s.level})` : ''}
                    </span>
                  ))}
                </div>
              </div>

              {/* Recommended Skills to close gap */}
              <div className="p-4 rounded-2xl bg-[#0f1116] border border-[#1f242e] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#f3a478] flex items-center gap-1.5">
                    <AlertCircle size={13} /> Recommended Skills
                  </span>
                  <span className="text-[10px] text-[#687182]">Skill gap bridges</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(skillGap?.recommendedSkills || ['Node.js', 'Express', 'Docker']).map((rec, idx) => (
                    <span 
                      key={idx}
                      className="px-3 py-1 rounded-full bg-[#271d18] border border-[#4a2e20] text-xs font-medium text-[#f6b189] flex items-center gap-1 cursor-pointer hover:border-[#d97746] transition-colors"
                      onClick={() => setActiveTab('curriculum')}
                      title="Click to view learning paths"
                    >
                      + {rec}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column (4 of 12): Review Calendar + Interview Prep (matches right widget of screenshot) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Review Widget */}
          <div className="app-card p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Review</h3>
              <span className="text-xs text-[#70798a] font-medium">October</span>
            </div>

            <div>
              <div className="text-3xl font-extrabold text-white">0</div>
              <p className="text-xs text-[#7e8798] mt-0.5">questions due today</p>
              <p className="text-[11px] text-[#555d6e] mt-1">Missed questions come back after 1, 3 and 7 days.</p>
            </div>

            {/* Calendar Strip matching image */}
            <div className="grid grid-cols-7 gap-1 pt-1 text-center">
              {calendarDays.map((cal, i) => {
                const isSelected = selectedDay === cal.date;
                return (
                  <div 
                    key={i} 
                    onClick={() => setSelectedDay(cal.date)}
                    className="flex flex-col items-center gap-1 cursor-pointer group"
                  >
                    <span className="text-[10px] text-[#5b6375] font-mono">{cal.day}</span>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isSelected 
                        ? 'bg-[#d97746] text-black shadow-md shadow-[#d97746]/30' 
                        : 'text-[#8e98aa] hover:bg-[#202530]'
                    }`}>
                      {cal.date}
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-xs text-[#6e7787] leading-relaxed pt-1">
              Answer the quick checks in any lesson. The ones you miss show up here on the right day.
            </p>

            <button 
              onClick={() => setActiveTab('skill-assessment')}
              className="w-full py-2.5 rounded-xl bg-[#202530] hover:bg-[#29303e] text-xs font-semibold text-[#cbd2e0] border border-[#2d3444] transition-colors"
            >
              Open review
            </button>
          </div>

          {/* Interview Prep Widget matching image */}
          <div className="app-card p-6 space-y-5 flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white">Interview prep</h3>
                <span className="text-xs text-[#70798a] font-mono">3 modules</span>
              </div>

              <div>
                <div className="text-3xl font-extrabold text-white">92</div>
                <p className="text-xs text-[#7e8798] mt-0.5">questions to practise</p>
                <p className="text-[11px] text-[#555d6e]">Every answer is traced to its source.</p>
              </div>

              {/* Levels 27 Junior / 32 Mid / 33 Senior */}
              <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-[#111317] border border-[#1e232d] text-center">
                <div>
                  <div className="text-base font-bold text-white">27</div>
                  <div className="text-[10px] text-[#6b7586]">Junior</div>
                </div>
                <div className="border-x border-[#1f242f]">
                  <div className="text-base font-bold text-white">32</div>
                  <div className="text-[10px] text-[#6b7586]">Mid</div>
                </div>
                <div>
                  <div className="text-base font-bold text-white">33</div>
                  <div className="text-[10px] text-[#6b7586]">Senior</div>
                </div>
              </div>

              {/* Module Questions List */}
              <div className="space-y-2 pt-1">
                <div 
                  onClick={() => setActiveTab('skill-assessment')}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#191d25] cursor-pointer transition-colors"
                >
                  <span className="text-xs font-medium text-[#c4ccd8]">Model Foundations</span>
                  <div className="flex items-center gap-1 text-[11px] text-[#697284]">
                    <span>31 questions</span>
                    <ChevronRight size={14} />
                  </div>
                </div>

                <div 
                  onClick={() => setActiveTab('skill-assessment')}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#191d25] cursor-pointer transition-colors"
                >
                  <span className="text-xs font-medium text-[#c4ccd8]">Inference and Model Optimization</span>
                  <div className="flex items-center gap-1 text-[11px] text-[#697284]">
                    <span>30 questions</span>
                    <ChevronRight size={14} />
                  </div>
                </div>

                <div 
                  onClick={() => setActiveTab('skill-assessment')}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#191d25] cursor-pointer transition-colors"
                >
                  <span className="text-xs font-medium text-[#c4ccd8]">Prompt and Context Engineering</span>
                  <div className="flex items-center gap-1 text-[11px] text-[#697284]">
                    <span>31 questions</span>
                    <ChevronRight size={14} />
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setActiveTab('skill-assessment')}
              className="w-full py-2.5 rounded-xl bg-[#202530] hover:bg-[#29303e] text-xs font-semibold text-[#cbd2e0] border border-[#2d3444] transition-colors mt-2"
            >
              Practise all 92 questions
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
