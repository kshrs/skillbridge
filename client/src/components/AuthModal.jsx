import React, { useState } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, UserCheck, LogIn } from 'lucide-react';

export const AuthModal = ({ onLogin, onRegister }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('Aditya Sharma');
  const [email, setEmail] = useState('aditya@example.com');
  const [password, setPassword] = useState('password123');
  const [role, setRole] = useState('student');
  const [targetRole, setTargetRole] = useState('AI / ML Engineer');
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
      setError('Authentication failed. Please check network connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPreset = (presetEmail, presetRole) => {
    setEmail(presetEmail);
    setPassword('password123');
    setRole(presetRole);
    setIsRegister(false);
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--border-color)] shadow-2xl relative space-y-5">
        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <div className="w-10 h-10 rounded-xl bg-[#d97746] text-[#0e1013] font-black text-lg mx-auto flex items-center justify-center shadow-md shadow-[#d97746]/20">
            SB
          </div>
          <h2 className="text-lg font-bold text-[var(--text-main)] tracking-tight">
            {isRegister ? 'Student Registration' : 'Sign in to SkillBridge'}
          </h2>
          <p className="text-xs text-[var(--text-muted)]">
            Institutional career readiness & university open courseware platform
          </p>
        </div>

        {/* Quick Dev Preset Bar */}
        <div className="p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] space-y-2">
          <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">
            Dev Quick Switch (1-Click Login Preset)
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleSelectPreset('aditya@example.com', 'student')}
              className={`p-2 rounded-lg text-left border transition-all ${
                email === 'aditya@example.com'
                  ? 'border-[#d97746] bg-[#d97746]/10 text-[var(--text-main)]'
                  : 'border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--text-muted)] hover:border-gray-500'
              }`}
            >
              <div className="flex items-center gap-1 font-semibold text-xs text-[var(--text-main)]">
                <UserCheck className="w-3 h-3 text-[#d97746]" />
                <span>Student</span>
              </div>
              <span className="text-[10px] block opacity-75">IT 3rd Year</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectPreset('thorne@faculty.edu', 'faculty')}
              className={`p-2 rounded-lg text-left border transition-all ${
                email === 'thorne@faculty.edu'
                  ? 'border-[#d97746] bg-[#d97746]/10 text-[var(--text-main)]'
                  : 'border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--text-muted)] hover:border-gray-500'
              }`}
            >
              <div className="flex items-center gap-1 font-semibold text-xs text-[var(--text-main)]">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                <span>Mentor</span>
              </div>
              <span className="text-[10px] block opacity-75">Dr. Thorne</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectPreset('vance@faculty.edu', 'admin')}
              className={`p-2 rounded-lg text-left border transition-all ${
                email === 'vance@faculty.edu'
                  ? 'border-[#d97746] bg-[#d97746]/10 text-[var(--text-main)]'
                  : 'border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--text-muted)] hover:border-gray-500'
              }`}
            >
              <div className="flex items-center gap-1 font-semibold text-xs text-[var(--text-main)]">
                <ShieldCheck className="w-3 h-3 text-indigo-400" />
                <span>Admin</span>
              </div>
              <span className="text-[10px] block opacity-75">Dean Vance</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {isRegister && (
            <div>
              <label className="font-semibold text-[var(--text-muted)] block mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-2.5 text-[var(--text-main)] focus:outline-none focus:border-[#d97746]"
                placeholder="e.g. Aditya Sharma"
              />
            </div>
          )}

          <div>
            <label className="font-semibold text-[var(--text-muted)] block mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-2.5 text-[var(--text-main)] focus:outline-none focus:border-[#d97746]"
              placeholder="e.g. aditya@example.com"
            />
          </div>

          <div>
            <label className="font-semibold text-[var(--text-muted)] block mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-2.5 text-[var(--text-main)] focus:outline-none focus:border-[#d97746]"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-[#d97746] hover:bg-[#c26233] text-white font-semibold text-xs transition-all shadow-md shadow-[#d97746]/20 flex items-center justify-center gap-1.5"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>{loading ? 'Authenticating...' : isRegister ? 'Register & Begin' : 'Sign In with Selected Role'}</span>
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-[var(--text-muted)] border-t border-[var(--border-color)]">
          {isRegister ? (
            <span>
              Already have an institutional account?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(false)}
                className="text-[#d97746] font-semibold hover:underline"
              >
                Sign In
              </button>
            </span>
          ) : (
            <span>
              Need a student account?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(true)}
                className="text-[#d97746] font-semibold hover:underline"
              >
                Register
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
