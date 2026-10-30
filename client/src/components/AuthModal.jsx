import React, { useState } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, UserPlus, LogIn } from 'lucide-react';

export const AuthModal = ({ onLogin, onRegister }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('Aditya');
  const [email, setEmail] = useState('aditya@example.com');
  const [password, setPassword] = useState('password123');
  const [role, setRole] = useState('student');
  const [targetRole, setTargetRole] = useState('Full Stack Developer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        const res = await onRegister(name, email, password, role, targetRole);
        if (!res.success) setError(res.message);
      } else {
        const res = await onLogin(email, password);
        if (!res.success) setError(res.message);
      }
    } catch (err) {
      setError('Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickDemo = (roleType) => {
    if (roleType === 'student') {
      setEmail('aditya@example.com');
      setPassword('password123');
      setIsRegister(false);
    } else {
      setEmail('admin@skillbridge.io');
      setPassword('adminpassword');
      setIsRegister(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="app-card w-full max-w-md p-8 space-y-6 border border-white/10 shadow-2xl relative">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#d97746] text-[#121417] font-black text-2xl mx-auto flex items-center justify-center shadow-lg shadow-[#d97746]/20">
            SB
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {isRegister ? 'Student Registration' : 'Welcome to SkillBridge'}
          </h2>
          <p className="text-xs text-[#7e8798]">
            {isRegister 
              ? 'Begin your youth employability journey & skill gap mapping' 
              : 'Sign in to access your dashboard, courses, and jobs'}
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-950/50 border border-red-800/40 text-[#fca5a5] text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {isRegister && (
            <div>
              <label className="font-bold text-[#8c96a7] block mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#111317] border border-[#232833] rounded-xl p-2.5 text-white focus:outline-none focus:border-[#d97746]"
                placeholder="e.g. Aditya Sharma"
              />
            </div>
          )}

          <div>
            <label className="font-bold text-[#8c96a7] block mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#111317] border border-[#232833] rounded-xl p-2.5 text-white focus:outline-none focus:border-[#d97746]"
              placeholder="e.g. student@college.edu"
            />
          </div>

          <div>
            <label className="font-bold text-[#8c96a7] block mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#111317] border border-[#232833] rounded-xl p-2.5 text-white focus:outline-none focus:border-[#d97746]"
              placeholder="••••••••"
            />
          </div>

          {isRegister && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-[#8c96a7] block mb-1">Account Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-[#111317] border border-[#232833] rounded-xl p-2.5 text-white focus:outline-none"
                >
                  <option value="student">Student</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#8c96a7] block mb-1">Career Goal</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full bg-[#111317] border border-[#232833] rounded-xl p-2.5 text-white focus:outline-none"
                >
                  <option value="Full Stack Developer">Full Stack Dev</option>
                  <option value="Frontend Developer">Frontend Dev</option>
                  <option value="Backend Developer">Backend Dev</option>
                  <option value="AI / ML Engineer">AI Engineer</option>
                </select>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-white text-black font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 shadow"
          >
            {isRegister ? <UserPlus size={15} /> : <LogIn size={15} />}
            {loading ? 'Processing...' : (isRegister ? 'Complete Registration' : 'Sign In')}
          </button>
        </form>

        {/* Quick Demo Logins for Pair Programming review */}
        <div className="pt-2 border-t border-white/5 space-y-2">
          <span className="text-[10px] uppercase font-bold text-[#656e7f] block text-center">
            One-Click Quick Login
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => fillQuickDemo('student')}
              className="py-2 px-3 rounded-xl bg-[#161922] border border-[#242b38] text-white hover:border-[#d97746] transition-colors"
            >
              Demo Student
            </button>
            <button
              onClick={() => fillQuickDemo('admin')}
              className="py-2 px-3 rounded-xl bg-[#161922] border border-[#242b38] text-[#d97746] hover:border-[#d97746] transition-colors font-semibold"
            >
              Demo Admin
            </button>
          </div>
        </div>

        <div className="text-center pt-1">
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
            className="text-xs text-[#a0aab8] hover:text-white transition-colors"
          >
            {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Register now"}
          </button>
        </div>
      </div>
    </div>
  );
};
