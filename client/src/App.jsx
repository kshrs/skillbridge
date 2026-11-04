import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import { Sidebar, Header } from './components/Navigation';
import { HomePortfolioView } from './components/HomePortfolioView';
import { LearnView } from './components/LearnView';
import { PlacementsView } from './components/PlacementsView';
import { AssessmentView } from './components/AssessmentView';
import { MentorsChatView } from './components/MentorsChatView';
import { ResumeStudio } from './components/ResumeStudio';
import { ProfileView } from './components/ProfileView';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthModal } from './components/AuthModal';

export function App() {
  const { 
    token, 
    user, 
    login, 
    register, 
    logout, 
    updateProfile, 
    addSkill, 
    removeSkill,
    fetchProfile 
  } = useAuth();

  const { theme, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = useState('home'); // 'home', 'learn', 'assessments', 'placements', 'mentors', 'resume', 'profile', 'admin'
  const [searchQuery, setSearchQuery] = useState('');
  const [enrollments, setEnrollments] = useState([]);

  // Fetch student enrollments
  useEffect(() => {
    if (token) {
      fetchMyEnrollments();
    }
  }, [token]);

  const fetchMyEnrollments = async () => {
    try {
      const res = await fetch('/api/enrollment/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setEnrollments(data);
      }
    } catch (err) {
      console.error('Error fetching enrollments:', err);
    }
  };

  const handleActivityLogged = () => {
    fetchProfile();
    fetchMyEnrollments();
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex font-sans transition-colors duration-200">
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
          {activeTab === 'home' && (
            <HomePortfolioView 
              user={user} 
              setActiveTab={setActiveTab} 
              enrollments={enrollments}
            />
          )}

          {activeTab === 'learn' && (
            <LearnView 
              user={user} 
              token={token}
              onActivityLogged={handleActivityLogged}
            />
          )}

          {activeTab === 'assessments' && (
            <AssessmentView 
              user={user}
              token={token} 
              onSkillVerified={handleActivityLogged}
            />
          )}

          {activeTab === 'placements' && (
            <PlacementsView 
              user={user} 
              token={token} 
              onActivityLogged={handleActivityLogged}
            />
          )}

          {activeTab === 'mentors' && (
            <MentorsChatView 
              user={user} 
              token={token} 
            />
          )}

          {activeTab === 'resume' && (
            <ResumeStudio 
              user={user} 
              token={token} 
            />
          )}

          {activeTab === 'profile' && (
            <ProfileView 
              user={user} 
              onUpdateProfile={updateProfile} 
              onAddSkill={addSkill} 
              onRemoveSkill={removeSkill} 
            />
          )}

          {activeTab === 'admin' && (
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
