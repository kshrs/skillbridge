

import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Terminal 
} from 'lucide-react';

export function AssessmentsCanvas({ user, token, onActivityUpdated }) {
  const [assessments, setAssessments] = useState([]);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssessments();
  }, [token]);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/assessments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAssessments(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = (item) => {
    setActiveQuiz(item);
    setAnswers({});
    setResult(null);
  };

  const handleSubmit = async () => {
    if (!activeQuiz) return;
    try {
      setSubmitting(true);
      const formatted = (activeQuiz.questions || []).map(q => {
        const val = answers[q._id];
        return {
          questionId: q._id,
          type: q.type,
          selectedOption: q.type === 'mcq' ? (val ?? -1) : -1,
          textAnswer: q.type !== 'mcq' ? (val || '') : ''
        };
      });

      const res = await fetch(`/api/assessments/${activeQuiz._id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ answers: formatted })
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data.result);
        if (onActivityUpdated) onActivityUpdated();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  if (activeQuiz) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn py-4">
        <button
          onClick={() => { setActiveQuiz(null); setResult(null); }}
          className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          &larr; Back to Assessments
        </button>

        <div className="space-y-1 pb-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--bg-subtle)] text-[var(--text-primary)]">
              {activeQuiz.skill}
            </span>
            <span className="text-xs text-[var(--text-tertiary)] font-mono">Time: {activeQuiz.timeLimitMinutes}m</span>
          </div>
          <h2 className="text-lg font-bold text-[var(--text-primary)]">{activeQuiz.title}</h2>
          <p className="text-xs text-[var(--text-secondary)]">{activeQuiz.description}</p>
        </div>

        <div className="space-y-4">
          {(activeQuiz.questions || []).map((q, idx) => (
            <div key={q._id || idx} className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] space-y-2 text-xs">
              <span className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase block">
                Question {idx + 1} • {q.type} ({q.points} pts)
              </span>
              <p className="font-semibold text-[var(--text-primary)]">{q.question}</p>

              {q.type === 'mcq' && q.options && (
                <div className="space-y-1 pt-1">
                  {q.options.map((opt, oIdx) => (
                    <label
                      key={oIdx}
                      className={`flex items-center gap-2 p-2 rounded border cursor-pointer text-xs ${
                        answers[q._id] === oIdx
                          ? 'border-[var(--text-primary)] bg-[var(--bg-subtle)] font-medium'
                          : 'border-[var(--border)]'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`q_${q._id}`}
                        checked={answers[q._id] === oIdx}
                        onChange={() => setAnswers(prev => ({ ...prev, [q._id]: oIdx }))}
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              )}

              {q.type === 'conceptual' && (
                <textarea
                  rows={3}
                  value={answers[q._id] || ''}
                  onChange={(e) => setAnswers(prev => ({ ...prev, [q._id]: e.target.value }))}
                  placeholder="Detail conceptual explanation..."
                  className="w-full p-2.5 rounded border border-[var(--border)] bg-[var(--bg-page)] text-xs focus:outline-none"
                />
              )}

              {q.type === 'coding' && (
                <textarea
                  rows={4}
                  value={answers[q._id] || q.starterCode || ''}
                  onChange={(e) => setAnswers(prev => ({ ...prev, [q._id]: e.target.value }))}
                  className="w-full p-2.5 rounded border border-[var(--border)] bg-[#0d0f12] text-emerald-400 font-mono text-xs focus:outline-none"
                />
              )}
            </div>
          ))}
        </div>

        {!result ? (
          <div className="flex justify-end pt-2">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-[var(--text-primary)] text-[var(--bg-page)] text-xs font-semibold hover:opacity-90"
            >
              {submitting ? 'Submitting...' : 'Submit Assessment'}
            </button>
          </div>
        ) : (
          <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/40 text-xs space-y-1">
            <span className="font-bold text-sm text-emerald-900 dark:text-emerald-300">
              Score: {result.totalScore} / {result.maxPossibleScore} ({result.percentage}%)
            </span>
            <p className="text-[11px] text-[var(--text-secondary)]">{result.overallFeedback}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn py-4">
      <div className="pb-3 border-b border-[var(--border)]">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Cohort Benchmark Assessments</h2>
        <p className="text-xs text-[var(--text-tertiary)]">Targeted to Information Technology 3rd Year class</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {assessments.map((a) => (
          <div
            key={a._id}
            className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] flex flex-col justify-between space-y-3"
          >
            <div className="space-y-1">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--bg-subtle)] text-[var(--text-primary)]">
                {a.skill}
              </span>
              <h3 className="text-xs font-bold text-[var(--text-primary)] mt-1">{a.title}</h3>
              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">{a.description}</p>
            </div>

            <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between text-xs">
              <span className="text-[10px] text-[var(--text-tertiary)] font-mono">
                {a.questions?.length || 4} Questions • {a.timeLimitMinutes}m
              </span>
              <button
                onClick={() => handleStart(a)}
                className="px-3 py-1 rounded bg-[var(--text-primary)] text-[var(--bg-page)] text-[11px] font-semibold hover:opacity-90"
              >
                {a.result ? 'Retake' : 'Start Assessment'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
