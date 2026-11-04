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

function AppContent() {
  const { user, token, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('portfolio');
  const [enrollments, setEnrollments] = useState([]);

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
