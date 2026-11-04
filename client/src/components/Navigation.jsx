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
    { id: 'home', label: 'Home Portfolio', icon: Home },
    { id: 'learn', label: 'University Courses', icon: BookOpen },
    { id: 'assessments', label: 'Assessments', icon: Award },
    { id: 'placements', label: 'Campus Drives', icon: Briefcase },
    { id: 'mentors', label: 'Faculty Mentors', icon: Users },
    { id: 'resume', label: 'ATS Resume Studio', icon: FileText },
  ];

  if (userRole === 'admin' || userRole === 'faculty') {
    navItems.push({ id: 'admin', label: 'Admin Portal', icon: LayoutDashboard });
  }

  return (
    <aside className="w-20 md:w-20 flex flex-col items-center py-6 px-3 bg-[var(--card-bg)] border-r border-[var(--border-color)] select-none h-screen sticky top-0 shrink-0 z-30 transition-colors">
      {/* Brand Icon top */}
      <div 
        onClick={() => setActiveTab('home')}
        className="w-11 h-11 rounded-2xl bg-[#d97746] text-[#0e1013] font-black text-xl flex items-center justify-center shadow-lg shadow-[#d97746]/20 cursor-pointer hover:scale-105 transition-all"
        title="SkillBridge 2.0"
      >
        SB
      </div>

      {/* Navigation Icons */}
      <div className="flex-1 flex flex-col items-center gap-3 mt-10 w-full">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              title={item.label}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all group relative ${
                isActive 
                  ? 'bg-[#d97746] text-white shadow-md shadow-[#d97746]/30' 
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-main)]'
              }`}
            >
              <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
              {/* Tooltip on hover */}
              <span className="absolute left-16 px-2.5 py-1 rounded-lg bg-[var(--card-bg)] text-[var(--text-main)] border border-[var(--border-color)] text-xs font-semibold whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-lg z-50">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Profile Avatar bottom */}
      <div 
        onClick={() => setActiveTab('profile')}
        className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#d97746] to-[#f49d37] text-white font-bold text-xs flex items-center justify-center cursor-pointer shadow-md hover:scale-105 transition-transform"
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
    <header className="h-16 border-b border-[var(--border-color)] bg-[var(--card-bg)]/80 backdrop-blur-md px-6 md:px-8 flex items-center justify-between sticky top-0 z-20 transition-colors">
      {/* Search Bar */}
      <div className="relative w-72 md:w-96">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search courses, skills, placement drives..."
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[#d97746] transition-colors"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Academic Cohort Pill */}
        {user?.academicProfile && (
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-muted)]">
            <GraduationCap className="w-3.5 h-3.5 text-[#d97746]" />
            <span>{user.academicProfile.department} (Yr {user.academicProfile.year})</span>
          </div>
        )}

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-main)] transition-colors border border-[var(--border-color)]"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-500" />
          )}
        </button>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--text-muted)] hover:text-rose-400 hover:bg-[var(--bg-main)] transition-colors border border-[var(--border-color)]"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
        </button>

        {/* User Badge */}
        <div 
          onClick={() => setActiveTab('profile')}
          className="flex items-center gap-2.5 pl-2 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#d97746] to-[#f49d37] text-white font-bold text-xs flex items-center justify-center shadow-sm">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AS'}
          </div>
          <div className="hidden md:block text-left">
            <span className="block text-xs font-bold text-[var(--text-main)] group-hover:text-[#d97746] transition-colors">
              {user?.name || 'Aditya Sharma'}
            </span>
            <span className="block text-[10px] text-[var(--text-muted)] font-mono">
              {user?.role || 'student'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
