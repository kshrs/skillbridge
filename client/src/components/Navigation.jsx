import React, { useState } from 'react';
import { 
  Home, 
  BookOpen, 
  Briefcase, 
  FileText, 
  Award, 
  Users, 
  LayoutDashboard, 
  Search, 
  Sun, 
  Moon, 
  LogOut,
  Sparkles,
  GraduationCap
} from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab, userRole }) => {
  const navItems = [
    { id: 'home', label: 'Portfolio', icon: Home },
    { id: 'learn', label: 'Learn', icon: BookOpen },
    { id: 'assessments', label: 'Assessments', icon: Award },
    { id: 'placements', label: 'Drives', icon: Briefcase },
    { id: 'mentors', label: 'Mentors', icon: Users },
    { id: 'resume', label: 'Resume', icon: FileText },
  ];

  if (userRole === 'admin' || userRole === 'faculty') {
    navItems.push({ id: 'admin', label: 'Admin', icon: LayoutDashboard });
  }

  return (
    <aside className="w-16 md:w-16 flex flex-col items-center py-5 px-2 bg-[var(--bg-sidebar)] border-r border-[var(--border-color)] select-none h-screen sticky top-0 shrink-0 z-30 transition-colors">
      {/* Brand Icon */}
      <div 
        onClick={() => setActiveTab('home')}
        className="w-9 h-9 rounded-xl bg-[#d97746] text-[#0e1013] font-black text-base flex items-center justify-center shadow-md shadow-[#d97746]/20 cursor-pointer hover:scale-105 transition-all"
        title="SkillBridge 2.0"
      >
        SB
      </div>

      {/* Navigation Icons */}
      <div className="flex-1 flex flex-col items-center gap-2 mt-8 w-full">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              title={item.label}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all group relative ${
                isActive 
                  ? 'bg-[#d97746] text-white shadow-sm' 
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-main)]'
              }`}
            >
              <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
              <span className="absolute left-14 px-2 py-0.5 rounded-md bg-[var(--card-bg)] text-[var(--text-main)] border border-[var(--border-color)] text-[11px] font-semibold whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-lg z-50">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Profile Avatar */}
      <div 
        onClick={() => setActiveTab('profile')}
        className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#d97746] to-[#f49d37] text-white font-bold text-[10px] flex items-center justify-center cursor-pointer shadow-sm hover:scale-105 transition-transform"
        title="Profile & Settings"
      >
        AS
      </div>
    </aside>
  );
};

export const Header = ({ 
  searchQuery, 
  onSearch, 
  user, 
  onLogout, 
  setActiveTab,
  theme,
  toggleTheme
}) => {
  return (
    <header className="h-14 border-b border-[var(--border-color)] bg-[var(--bg-header)] backdrop-blur-md px-5 md:px-6 flex items-center justify-between sticky top-0 z-20 transition-colors">
      <div className="flex items-center gap-3">
        <span className="text-xs font-bold text-[var(--text-main)] hidden sm:block">SkillBridge</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#d97746]/10 text-[#d97746] font-mono font-bold">2.0</span>
      </div>

      {/* Global Search Bar */}
      <div className="relative w-64 md:w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)]" />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search courses, skills, placement drives..."
          className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[#d97746] transition-colors"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2.5">
        {user?.academicProfile && (
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] text-[11px] text-[var(--text-muted)]">
            <GraduationCap className="w-3 h-3 text-[#d97746]" />
            <span>{user.academicProfile.department} (Yr {user.academicProfile.year})</span>
          </div>
        )}

        <button
          onClick={toggleTheme}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-main)] transition-colors border border-[var(--border-color)]"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? (
            <Sun className="w-3.5 h-3.5 text-amber-400" />
          ) : (
            <Moon className="w-3.5 h-3.5 text-indigo-500" />
          )}
        </button>

        <button
          onClick={onLogout}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-rose-400 hover:bg-[var(--bg-main)] transition-colors border border-[var(--border-color)]"
          title="Logout"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>

        <div 
          onClick={() => setActiveTab('profile')}
          className="flex items-center gap-2 pl-1 cursor-pointer group"
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#d97746] to-[#f49d37] text-white font-bold text-[10px] flex items-center justify-center shadow-sm">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AS'}
          </div>
          <div className="hidden md:block text-left">
            <span className="block text-xs font-semibold text-[var(--text-main)] group-hover:text-[#d97746] transition-colors leading-tight">
              {user?.name || 'Aditya Sharma'}
            </span>
            <span className="block text-[9px] text-[var(--text-muted)] font-mono capitalize">
              {user?.role || 'student'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
