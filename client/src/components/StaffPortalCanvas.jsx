

import React, { useState } from 'react';
import { 
  Users, 
  Award, 
  Briefcase, 
  Ticket, 
  MessageSquare,
  ShieldCheck,
  Building,
  GraduationCap
} from 'lucide-react';
import { StaffStudentRoster } from './StaffStudentRoster';
import { StaffAssessmentBuilder } from './StaffAssessmentBuilder';
import { StaffPlacementPublisher } from './StaffPlacementPublisher';
import { StaffTicketManager } from './StaffTicketManager';
import { StaffStudentChat } from './StaffStudentChat';

export function StaffPortalCanvas({ user, token, activeSubTab, setActiveSubTab, onActivityUpdated }) {
  const [subTab, setSubTab] = useState(activeSubTab || 'students');
  const [preselectedStudentForChat, setPreselectedStudentForChat] = useState(null);

  const handleSelectStudentForChat = (student) => {
    setPreselectedStudentForChat(student);
    setSubTab('doubts');
  };

  const navItems = [
    { id: 'students', label: 'Student Roster & Dossiers', icon: Users, badge: null },
    { id: 'assessments', label: 'Publish Assessment', icon: Award, badge: null },
    { id: 'placements', label: 'Publish Placement Drive', icon: Briefcase, badge: null },
    { id: 'tickets', label: 'Manage Drive Tickets', icon: Ticket, badge: null },
    { id: 'doubts', label: 'Doubt Clearance & Chat', icon: MessageSquare, badge: null }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Staff Identity & Scope Banner */}
      <div className="border border-[var(--border)] rounded-lg p-5 bg-[var(--bg-subtle)]/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-600 border border-blue-500/20 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              <span>{user?.role === 'admin' ? 'Academic Administration Portal' : 'Faculty Mentor Workstation'}</span>
            </span>
            <span className="text-xs text-[var(--text-secondary)] font-medium">
              {user?.staffProfile?.department || 'Department of Information Technology'}
            </span>
          </div>

          <h2 className="text-lg font-bold text-[var(--text-primary)]">
            Welcome, {user?.name || 'Faculty Member'}
          </h2>
          <p className="text-xs text-[var(--text-secondary)] max-w-2xl">
            Publish targeted cohort benchmark assessments, orchestrate campus recruitment drives, review student skill dossiers, track placement application tickets, and resolve student doubts.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs bg-[var(--bg-page)] px-3 py-2 rounded-md border border-[var(--border)] shrink-0">
          <GraduationCap className="w-4 h-4 text-blue-500" />
          <div>
            <div className="font-semibold text-[var(--text-primary)]">
              {user?.staffProfile?.designation || 'Associate Professor'}
            </div>
            <div className="text-[10px] text-[var(--text-tertiary)]">
              {user?.staffProfile?.officeHours || 'Mon-Fri 2:00 - 5:00 PM'}
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-[var(--border)] pb-2 overflow-x-auto text-xs">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = subTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setSubTab(item.id)}
              className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-2 transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-[var(--text-primary)] text-[var(--bg-page)] shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Tab Panels */}
      <div>
        {subTab === 'students' && (
          <StaffStudentRoster 
            token={token} 
            onSelectStudentForChat={handleSelectStudentForChat} 
          />
        )}

        {subTab === 'assessments' && (
          <StaffAssessmentBuilder 
            token={token} 
            onAssessmentCreated={() => {
              if (onActivityUpdated) onActivityUpdated();
            }} 
          />
        )}

        {subTab === 'placements' && (
          <StaffPlacementPublisher 
            token={token} 
            onPlacementCreated={() => {
              if (onActivityUpdated) onActivityUpdated();
            }} 
          />
        )}

        {subTab === 'tickets' && (
          <StaffTicketManager 
            token={token} 
          />
        )}

        {subTab === 'doubts' && (
          <StaffStudentChat 
            token={token} 
            preselectedStudent={preselectedStudentForChat} 
          />
        )}
      </div>
    </div>
  );
}
