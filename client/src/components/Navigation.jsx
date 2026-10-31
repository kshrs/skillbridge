import React from 'react';
import { 
  Home, 
  Compass, 
  Briefcase, 
  FileText, 
  Award, 
  Users, 
  LayoutDashboard, 
  Search, 
  Sun, 
  Moon, 
  LogOut,
  Sparkles
} from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab, userRole }) => {
  const navItems = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'curriculum', label: 'Stanford CS224N Course', icon: Compass },
    { id: 'jobs', label: 'Jobs & Internships', icon: Briefcase },
    { id: 'skill-assessment', label: 'Assessments', icon: Award },
    { id: 'resume', label: 'AI Resume Studio', icon: FileText },
    { id: 'mentors', label: 'Mentors', icon: Users },
  ];

  if (userRole === 'admin') {
    navItems.push({ id: 'admin', label: 'Admin Portal', icon: LayoutDashboard });
  }

  return (
    <aside className="w-20 md:w-20 flex flex-col items-center py-6 px-3 bg-[#111317] border-r border-[#1e222b] select-none h-screen sticky top-0 shrink-0 z-30">
      {/* Brand Icon top */}
      <div 
        onClick={() => setActiveTab('dashboard')}
        className="w-11 h-11 rounded-2xl bg-[#d97746] text-[#0e1013] font-black text-xl flex items-center justify-center shadow-lg shadow-[#d97746]/20 cursor-pointer hover:scale-105 transition-all"
        title="SkillBridge"
      >
        AI
      </div>

      {/* Navigation Icons matching low-quality reference */}
      <div className="flex-1 flex flex-col items-center gap-3 mt-10 w-full">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              title={item.label}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all group relative ${
                isActive 
                  ? 'bg-[#ffffff] text-[#121417] shadow-md shadow-white/10' 
                  : 'text-[#6f7684] hover:text-[#e1e4ea] hover:bg-[#1a1e26]'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              
              {/* Tooltip on hover */}
              <span className="absolute left-16 px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#222731] text-white opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl border border-white/5 z-50">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bottom Profile / Quick Info */}
      <div className="flex flex-col items-center gap-3">
        <div 
          onClick={() => setActiveTab('profile')}
          className={`w-11 h-11 rounded-2xl border flex items-center justify-center text-sm font-bold cursor-pointer transition-all ${
            activeTab === 'profile' 
              ? 'border-[#d97746] bg-[#222731] text-[#d97746]' 
              : 'border-[#262c37] bg-[#161920] text-gray-400 hover:text-white'
          }`}
          title="Student Profile & Settings"
        >
          <span className="text-xs">PRO</span>
        </div>
      </div>
    </aside>
  );
};

export const Header = ({ onSearch, searchQuery, user, onLogout, setActiveTab, theme, toggleTheme }) => {
  return (
    <header className="flex items-center justify-between px-8 py-5 border-b border-[#181c24] bg-[#0e1013]/80 backdrop-blur-md sticky top-0 z-20">
      {/* Search Input pill */}
      <div className="relative w-80 md:w-96">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#565d6d]" size={16} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search courses, skills, internships..."
          className="w-full bg-[#16191f] border border-[#232833] text-sm text-[#e1e4ea] placeholder-[#565d6d] pl-11 pr-12 py-2.5 rounded-2xl focus:outline-none focus:border-[#d97746] transition-colors"
        />
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-[#5b6375] px-1.5 py-0.5 rounded border border-[#2b313e]">
          ⌘K
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          className="w-10 h-10 rounded-2xl bg-[#161920] border border-[#252a36] flex items-center justify-center text-[#9aa2b1] hover:text-[#d97746] hover:border-[#d97746]/40 transition-colors"
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Skill Gap Badge */}
        <div 
          onClick={() => setActiveTab('profile')}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1b1e26] border border-[#262c38] cursor-pointer hover:border-[#d97746]/50 transition-colors"
        >
          <Sparkles size={14} className="text-[#d97746]" />
          <span className="text-xs text-[#a0a7b5]">Role Target:</span>
          <span className="text-xs font-semibold text-white">{user?.targetRole || 'Full Stack Developer'}</span>
        </div>

        {/* User Pill */}
        <div 
          onClick={() => setActiveTab('profile')}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-[#161920] border border-[#252a36] cursor-pointer hover:border-white/20 transition-colors"
        >
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-[#d97746] to-[#f3a478] flex items-center justify-center text-xs font-bold text-gray-900">
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <span className="text-sm font-medium text-[#e1e4ea] hidden md:inline">
            {user?.name || 'Student'}
          </span>
          {user?.role === 'admin' && (
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#d97746]/20 text-[#d97746]">
              Admin
            </span>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          title="Sign Out"
          className="w-10 h-10 rounded-2xl bg-[#161920] border border-[#252a36] flex items-center justify-center text-[#757d8f] hover:text-red-400 hover:border-red-900/50 transition-colors"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
};
