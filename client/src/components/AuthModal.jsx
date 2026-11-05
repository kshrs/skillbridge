

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { LogIn, UserCheck, ShieldCheck, Sparkles, Loader2 } from 'lucide-react';

export function AuthModal() {
  const { login } = useAuth();
  const [email, setEmail] = useState('aditya@example.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePreset = (presetEmail) => {
    setEmail(presetEmail);
    setPassword('password123');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await login(email, password);
    if (!res.success) {
      setError(res.message);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-sm p-6 rounded-xl bg-[var(--bg-page)] border border-[var(--border)] shadow-xl space-y-4">
        {/* Brand */}
        <div className="text-center space-y-1">
          <div className="w-8 h-8 rounded-lg bg-[var(--text-primary)] text-[var(--bg-page)] font-bold text-xs flex items-center justify-center mx-auto">
            SB
          </div>
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">SkillBridge Sign In</h2>
          <p className="text-[11px] text-[var(--text-tertiary)]">Linear minimalist institutional workspace</p>
        </div>

        {/* 1-Click Role Presets */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider block">
            1-Click Dev Role Switch
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => handlePreset('aditya@example.com')}
              className={`p-2 rounded-lg text-left border transition-all ${
                email === 'aditya@example.com'
                  ? 'border-[var(--text-primary)] bg-[var(--bg-subtle)] text-[var(--text-primary)]'
                  : 'border-[var(--border)] hover:bg-[var(--bg-subtle)] text-[var(--text-secondary)]'
              }`}
            >
              <div className="flex items-center gap-1 font-semibold text-[11px]">
                <UserCheck className="w-3 h-3 text-blue-500" />
                <span>Student</span>
              </div>
              <span className="text-[9px] text-[var(--text-tertiary)] block mt-0.5">Aditya</span>
            </button>

            <button
              type="button"
              onClick={() => handlePreset('thorne@faculty.edu')}
              className={`p-2 rounded-lg text-left border transition-all ${
                email === 'thorne@faculty.edu'
                  ? 'border-[var(--text-primary)] bg-[var(--bg-subtle)] text-[var(--text-primary)]'
                  : 'border-[var(--border)] hover:bg-[var(--bg-subtle)] text-[var(--text-secondary)]'
              }`}
            >
              <div className="flex items-center gap-1 font-semibold text-[11px]">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                <span>Mentor</span>
              </div>
              <span className="text-[9px] text-[var(--text-tertiary)] block mt-0.5">Dr. Thorne</span>
            </button>

            <button
              type="button"
              onClick={() => handlePreset('vance@faculty.edu')}
              className={`p-2 rounded-lg text-left border transition-all ${
                email === 'vance@faculty.edu'
                  ? 'border-[var(--text-primary)] bg-[var(--bg-subtle)] text-[var(--text-primary)]'
                  : 'border-[var(--border)] hover:bg-[var(--bg-subtle)] text-[var(--text-secondary)]'
              }`}
            >
              <div className="flex items-center gap-1 font-semibold text-[11px]">
                <ShieldCheck className="w-3 h-3 text-purple-500" />
                <span>Admin</span>
              </div>
              <span className="text-[9px] text-[var(--text-tertiary)] block mt-0.5">Dean Vance</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-2 rounded-md bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 text-[11px] font-medium border border-rose-200 dark:border-rose-900">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 pt-1">
          <div>
            <label className="text-[11px] font-medium text-[var(--text-secondary)] block mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)] transition-colors"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-[var(--text-secondary)] block mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)] transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg bg-[var(--text-primary)] hover:opacity-90 text-[var(--bg-page)] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogIn className="w-3.5 h-3.5" />}
            <span>Sign In to Canvas</span>
          </button>
        </form>
      </div>
    </div>
  );
}
