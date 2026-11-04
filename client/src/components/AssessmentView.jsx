import React, { useState, useEffect } from 'react';
import { 
  Award, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ArrowRight, 
  RotateCcw, 
  Sparkles,
  Clock,
  GraduationCap,
  Loader2,
  Terminal,
  FileText
} from 'lucide-react';

export function AssessmentView({ user, token, onSkillVerified }) {
  const [assessments, setAssessments] = useState([]);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [answers, setAnswers] = useState({}); // { [qId]: optionIndex | text }
  const [result, setResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.assessments || [];
      setAssessments(list);
    } catch (e) {
      console.error('Error fetching assessments:', e);
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = async (item) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/assessments/${item._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      const assessmentData = data.assessment || data;
      setActiveQuiz(assessmentData);
      setAnswers({});
      setResult(null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!activeQuiz) return;
    setIsSubmitting(true);
    try {
      const formattedAnswers = (activeQuiz.questions || []).map((q) => {
        const val = answers[q._id];
        if (q.type === 'mcq') {
          return { questionId: q._id, type: 'mcq', selectedOption: typeof val === 'number' ? val : -1 };
        } else {
          return { questionId: q._id, type: q.type, textAnswer: val || '' };
        }
      });

      const res = await fetch(`/api/assessments/${activeQuiz._id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ answers: formattedAnswers })
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data.result || data);
        if (onSkillVerified) onSkillVerified();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Taking active quiz view
  if (activeQuiz) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn pb-12">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => { setActiveQuiz(null); setResult(null); }}
            className="text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
          >
            &larr; Back to Assessment Catalog
          </button>
          <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-muted)] bg-[var(--card-bg)] px-3 py-1 rounded-xl border border-[var(--border-color)]">
            <Clock className="w-3.5 h-3.5 text-[#d97746]" />
            <span>Time Limit: {activeQuiz.timeLimitMinutes || 30} mins</span>
          </div>
        </div>

        {/* Quiz Title Banner */}
        <div className="p-6 md:p-8 rounded-3xl bg-[var(--card-bg)] border border-[var(--border-color)] shadow-xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-[#d97746]/10 text-[#d97746] border border-[#d97746]/20">
              {activeQuiz.skill}
            </span>
            <span className="text-xs text-[var(--text-muted)]">
              Passing: {activeQuiz.passingScore || 70}%
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-[var(--text-main)]">{activeQuiz.title}</h1>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">{activeQuiz.description}</p>
        </div>

        {/* Question Cards */}
        <div className="space-y-6">
          {(activeQuiz.questions || []).map((q, idx) => (
            <div
              key={q._id || idx}
              className="p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--border-color)] shadow-lg space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[var(--bg-main)] text-[var(--text-muted)] uppercase tracking-wider">
                  Question {idx + 1} • {q.type.toUpperCase()}
                </span>
                <span className="text-xs font-mono text-emerald-500 font-semibold">{q.points || 25} pts</span>
              </div>

              <p className="text-sm font-semibold text-[var(--text-main)] leading-relaxed">
                {q.question}
              </p>

              {/* MCQ Options */}
              {q.type === 'mcq' && q.options && (
                <div className="space-y-2 pt-2">
                  {q.options.map((opt, oIdx) => (
                    <label
                      key={oIdx}
                      className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        answers[q._id] === oIdx
                          ? 'bg-[#d97746]/10 border-[#d97746] text-[var(--text-main)] font-semibold shadow-sm'
                          : 'bg-[var(--bg-main)] border-[var(--border-color)] text-[var(--text-muted)] hover:border-gray-500'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question_${q._id}`}
                        checked={answers[q._id] === oIdx}
                        onChange={() => setAnswers(prev => ({ ...prev, [q._id]: oIdx }))}
                        className="accent-[#d97746]"
                      />
                      <span className="text-xs md:text-sm">{opt}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* Conceptual Answer Text Box */}
              {q.type === 'conceptual' && (
                <textarea
                  rows={4}
                  value={answers[q._id] || ''}
                  onChange={(e) => setAnswers(prev => ({ ...prev, [q._id]: e.target.value }))}
                  placeholder="Detail your conceptual reasoning and underlying system invariants here..."
                  className="w-full p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs md:text-sm text-[var(--text-main)] focus:outline-none focus:border-[#d97746] resize-none leading-relaxed"
                />
              )}

              {/* Coding Box */}
              {q.type === 'coding' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                    <Terminal className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Algorithm Implementation</span>
                  </div>
                  <textarea
                    rows={6}
                    value={answers[q._id] || q.starterCode || ''}
                    onChange={(e) => setAnswers(prev => ({ ...prev, [q._id]: e.target.value }))}
                    className="w-full p-4 rounded-2xl bg-[#0e1013] border border-[#242833] text-xs font-mono text-emerald-400 focus:outline-none focus:border-[#d97746] resize-none leading-relaxed"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Submit Actions */}
        {!result ? (
          <div className="flex justify-end pt-2">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-8 py-3 rounded-2xl bg-[#d97746] hover:bg-[#c26233] text-white text-xs md:text-sm font-semibold flex items-center gap-2 transition-all shadow-lg shadow-[#d97746]/20 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>Submit for Neural AI Evaluation</span>
            </button>
          </div>
        ) : (
          /* Scorecard Result */
          <div className="p-8 rounded-3xl bg-gradient-to-br from-emerald-500/15 to-transparent border border-emerald-500/30 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider block">
                  Evaluation Scorecard
                </span>
                <h3 className="text-2xl font-black text-[var(--text-main)]">
                  Total Score: {result.totalScore} / {result.maxPossibleScore} ({result.percentage}%)
                </h3>
              </div>

              <span className={`px-5 py-2 rounded-2xl text-xs font-bold ${
                result.passed ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-amber-500 text-white'
              }`}>
                {result.passed ? 'BENCHMARK PASSED & CREDENTIAL VERIFIED' : 'FAILED - NEEDS RETRY'}
              </span>
            </div>

            <p className="text-xs md:text-sm text-[var(--text-muted)] leading-relaxed">
              {result.overallFeedback}
            </p>

            <button
              onClick={() => { setActiveQuiz(null); setResult(null); fetchAssessments(); }}
              className="px-6 py-2.5 rounded-xl bg-[var(--card-bg)] hover:bg-[var(--border-color)] border border-[var(--border-color)] text-xs font-semibold text-[var(--text-main)] transition-colors"
            >
              Back to Assessments
            </button>
          </div>
        )}
      </div>
    );
  }

  // Assessment Roster View
  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Banner */}
      <div className="rounded-3xl p-8 bg-[var(--card-bg)] border border-[var(--border-color)] shadow-xl relative overflow-hidden">
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30">
              Institutional Benchmarks
            </span>
            <span className="text-xs text-[var(--text-muted)]">Targeted to IT 3rd Year</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--text-main)] tracking-tight">
            Academic & Cohort Assessments
          </h1>
          <p className="text-xs md:text-sm text-[var(--text-muted)] leading-relaxed">
            Faculty-administered cohort evaluations designed specifically for your class cohort. Passing an assessment immediately flags the corresponding skill as <strong className="text-emerald-400">Verified</strong> across your campus placement profile and GitHub-style learning activity matrix.
          </p>
        </div>
      </div>

      {/* Roster Cards */}
      {loading ? (
        <div className="p-16 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#d97746] mx-auto mb-2" />
          <p className="text-xs text-[var(--text-muted)]">Loading targeted assessments...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {assessments.map((item) => (
            <div
              key={item._id}
              className="rounded-3xl p-6 md:p-8 bg-[var(--card-bg)] border border-[var(--border-color)] hover:border-[#d97746]/50 transition-all shadow-xl flex flex-col justify-between space-y-6"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-[#d97746]/10 text-[#d97746] border border-[#d97746]/20">
                    {item.skill}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 font-mono">
                    {item.targetClass?.department || 'IT'} {item.targetClass?.year ? `Year ${item.targetClass.year}` : 'Cohort'}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-[var(--text-main)]">{item.title}</h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed line-clamp-3">
                  {item.description}
                </p>

                <div className="flex items-center gap-4 text-xs text-[var(--text-muted)] pt-2">
                  <span>Questions: <strong>{item.questions?.length || 4}</strong></span>
                  <span>Time: <strong>{item.timeLimitMinutes || 30}m</strong></span>
                  <span>Passing: <strong>{item.passingScore || 70}%</strong></span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[var(--border-color)]">
                {item.result ? (
                  <span className={`text-xs font-bold ${item.result.passed ? 'text-emerald-500' : 'text-amber-500'}`}>
                    Previous: {item.result.percentage}% ({item.result.passed ? 'Passed' : 'Needs Retake'})
                  </span>
                ) : (
                  <span className="text-xs text-[var(--text-muted)]">Status: Pending Attempt</span>
                )}

                <button
                  onClick={() => startQuiz(item)}
                  className="px-5 py-2.5 rounded-xl bg-[#d97746] hover:bg-[#c26233] text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-[#d97746]/20"
                >
                  <span>{item.result ? 'Retake Exam' : 'Start Assessment'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
