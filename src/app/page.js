'use client';

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { TopNavbar } from '@/components/TopNavbar';
import { AuthModal } from '@/components/AuthModal';
import { PortfolioCanvas } from '@/components/PortfolioCanvas';
import { LearnCanvas } from '@/components/LearnCanvas';
import { AssessmentsCanvas } from '@/components/AssessmentsCanvas';
import { PlacementsCanvas } from '@/components/PlacementsCanvas';
import { MentorsCanvas } from '@/components/MentorsCanvas';
import { StaffPortalCanvas } from '@/components/StaffPortalCanvas';

function AppContent() {
  const { user, token, refreshProfile } = useAuth();
  const isStaff = user && ['admin', 'faculty', 'mentor'].includes(user.role);
  const [activeTab, setActiveTab] = useState('portfolio');
  const [enrollments, setEnrollments] = useState([]);

  // Auto-switch default tab if staff logs in
  useEffect(() => {
    if (isStaff && ['portfolio', 'learn', 'mentors'].includes(activeTab)) {
      setActiveTab('staff-students');
    } else if (!isStaff && activeTab.startsWith('staff-')) {
      setActiveTab('portfolio');
    }
  }, [isStaff]);


  useEffect(() => {
    if (token) {
      fetch('/api/enrollment/my', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(r => r.json())
      .then(d => setEnrollments(Array.isArray(d) ? d : []))
      .catch(console.error);
    }
  }, [token]);

  const handleActivityUpdated = () => {
    refreshProfile();
    if (token) {
      fetch('/api/enrollment/my', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(r => r.json())
      .then(d => setEnrollments(Array.isArray(d) ? d : []))
      .catch(console.error);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] flex flex-col font-sans transition-colors duration-200">
      {!token && <AuthModal />}

      <TopNavbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 px-6 py-6 overflow-y-auto">
        {activeTab === 'portfolio' && (
          <PortfolioCanvas 
            user={user} 
            enrollments={enrollments} 
            setActiveTab={setActiveTab} 
          />
        )}

        {activeTab === 'learn' && (
          <LearnCanvas 
            user={user} 
            token={token} 
            onActivityUpdated={handleActivityUpdated} 
          />
        )}

        {activeTab === 'assessments' && (
          <AssessmentsCanvas 
            user={user} 
            token={token} 
            onActivityUpdated={handleActivityUpdated} 
          />
        )}

        {activeTab === 'placements' && (
          <PlacementsCanvas 
            user={user} 
            token={token} 
            onActivityUpdated={handleActivityUpdated} 
          />
        )}

        {activeTab === 'mentors' && (
          <MentorsCanvas 
            user={user} 
            token={token} 
          />
        )}

        {/* Staff/Admin Specialized Workstation Views */}
        {isStaff && (
          <>
            {activeTab === 'staff-students' && (
              <StaffPortalCanvas 
                user={user} 
                token={token} 
                activeSubTab="students"
                onActivityUpdated={handleActivityUpdated} 
              />
            )}

            {activeTab === 'staff-assessments' && (
              <StaffPortalCanvas 
                user={user} 
                token={token} 
                activeSubTab="assessments"
                onActivityUpdated={handleActivityUpdated} 
              />
            )}

            {activeTab === 'staff-placements' && (
              <StaffPortalCanvas 
                user={user} 
                token={token} 
                activeSubTab="placements"
                onActivityUpdated={handleActivityUpdated} 
              />
            )}

            {activeTab === 'staff-tickets' && (
              <StaffPortalCanvas 
                user={user} 
                token={token} 
                activeSubTab="tickets"
                onActivityUpdated={handleActivityUpdated} 
              />
            )}

            {activeTab === 'staff-doubts' && (
              <StaffPortalCanvas 
                user={user} 
                token={token} 
                activeSubTab="doubts"
                onActivityUpdated={handleActivityUpdated} 
              />
            )}
          </>
        )}
      </main>

    </div>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
