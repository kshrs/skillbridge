import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import { Sidebar, Header } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { CurriculumView } from './components/CurriculumView';
import { JobsView } from './components/JobsView';
import { AssessmentView } from './components/AssessmentView';
import { ResumeStudio } from './components/ResumeStudio';
import { MentorsView } from './components/MentorsView';
import { ProfileView } from './components/ProfileView';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthModal } from './components/AuthModal';

export function App() {
  const { 
    token, 
    user, 
    skillGap, 
    login, 
    register, 
    logout, 
    updateProfile, 
    addSkill, 
    removeSkill,
    fetchProfile 
  } = useAuth();

  const { theme, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex font-sans">
      {/* Auth Modal if unauthenticated */}
      {!token && (
        <AuthModal onLogin={login} onRegister={register} />
      )}

      {/* Persistent Left Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        userRole={user?.role} 
      />

      {/* Main App Body */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Header 
          searchQuery={searchQuery}
          onSearch={setSearchQuery}
          user={user}
          onLogout={logout}
          setActiveTab={setActiveTab}
          theme={theme}
          toggleTheme={toggleTheme}
        />

        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardView 
              user={user} 
              skillGap={skillGap} 
              setActiveTab={setActiveTab} 
            />
          )}

          {activeTab === 'curriculum' && (
            <CurriculumView 
              token={token} 
              skillGap={skillGap} 
              user={user} 
            />
          )}

          {activeTab === 'jobs' && (
            <JobsView 
              user={user} 
              token={token} 
            />
          )}

          {activeTab === 'skill-assessment' && (
            <AssessmentView 
              token={token} 
              onSkillVerified={fetchProfile} 
            />
          )}

          {activeTab === 'resume' && (
            <ResumeStudio 
              user={user} 
              token={token} 
              onUpdateResume={fetchProfile} 
            />
          )}

          {activeTab === 'mentors' && (
            <MentorsView 
              token={token} 
              user={user} 
            />
          )}

          {activeTab === 'profile' && (
            <ProfileView 
              user={user} 
              skillGap={skillGap} 
              onUpdateProfile={updateProfile} 
              onAddSkill={addSkill} 
              onRemoveSkill={removeSkill} 
            />
          )}

          {activeTab === 'admin' && user?.role === 'admin' && (
            <AdminDashboard 
              token={token} 
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
