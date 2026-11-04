'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  Compass, 
  BookOpen, 
  Award, 
  Briefcase, 
  Users, 
  Sun, 
  Moon, 
  LogOut,
  GraduationCap,
  ShieldCheck,
  Ticket,
  MessageSquare
} from 'lucide-react';

export function TopNavbar({ activeTab, setActiveTab }) {
  const { user, logout, theme, toggleTheme } = useAuth();
  const isStaff = user && ['admin', 'faculty', 'mentor'].includes(user.role);

  const studentNavItems = [
    { id: 'portfolio', label: 'Portfolio', icon: Compass },
    { id: 'learn', label: 'Learn', icon: BookOpen },
    { id: 'assessments', label: 'Assessments', icon: Award },
    { id: 'placements', label: 'Drives', icon: Briefcase },
    { id: 'mentors', label: 'Faculty Mentors', icon: Users },
  ];

  const staffNavItems = [
    { id: 'staff-students', label: 'Students Roster', icon: Users },
    { id: 'staff-assessments', label: 'Publish Assessment', icon: Award },
    { id: 'staff-placements', label: 'Publish Drive', icon: Briefcase },
    { id: 'staff-tickets', label: 'Manage Tickets', icon: Ticket },
    { id: 'staff-doubts', label: 'Student Doubts', icon: MessageSquare },
  ];

  const navItems = isStaff ? staffNavItems : studentNavItems;

  return (
    <header className="h-12 border-b border-[var(--border)] bg-[var(--bg-page)]/90 backdrop-blur-md px-6 sticky top-0 z-40 flex items-center justify-between transition-colors">
      {/* Left: Brand & Main Navigation Pills */}
      <div className="flex items-center gap-6">
        <div 
          onClick={() => setActiveTab(isStaff ? 'staff-students' : 'portfolio')}
          className="flex items-center gap-2 cursor-pointer font-bold text-xs tracking-tight text-[var(--text-primary)]"
        >
          <span className={`w-5 h-5 rounded flex items-center justify-center font-black text-[10px] ${
            isStaff ? 'bg-blue-600 text-white' : 'bg-[var(--text-primary)] text-[var(--bg-page)]'
          }`}>
            {isStaff ? 'SP' : 'SB'}
          </span>
          <div className="flex items-center gap-1.5">
            <span>SkillBridge</span>
            {isStaff && (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-600 font-semibold uppercase tracking-wider">
                {user.role}
              </span>
            )}
          </div>
        </div>

        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
                  isActive
                    ? 'bg-[var(--bg-subtle)] text-[var(--text-primary)] font-semibold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Right: Academic Meta & Actions */}
      <div className="flex items-center gap-3">
        {user?.academicProfile && !isStaff && (
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)]">
            <GraduationCap className="w-3.5 h-3.5 text-blue-500" />
            <span>{user.academicProfile.department} (Yr {user.academicProfile.year})</span>
          </div>
        )}

        {isStaff && user?.staffProfile && (
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)]">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
            <span>{user.staffProfile.department}</span>
          </div>
        )}


        <button
          onClick={toggleTheme}
          className="p-1 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
        </button>

        <div className="h-4 w-px bg-[var(--border)]" />

        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[var(--bg-subtle)] border border-[var(--border)] flex items-center justify-center font-bold text-[10px] text-[var(--text-primary)]">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AS'}
          </div>
          <span className="text-xs font-medium text-[var(--text-primary)] hidden md:block">
            {user?.name || 'Aditya Sharma'}
          </span>
        </div>

        <button
          onClick={logout}
          className="p-1 rounded-md text-[var(--text-tertiary)] hover:text-rose-500 hover:bg-[var(--bg-subtle)] transition-colors"
          title="Sign Out"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
}
