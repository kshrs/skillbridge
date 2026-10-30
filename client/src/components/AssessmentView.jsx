import React, { useState, useEffect } from 'react';
import { 
  Award, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ArrowRight, 
  RotateCcw, 
  Sparkles,
  HelpCircle,
  Clock
} from 'lucide-react';

export const AssessmentView = ({ token, onSkillVerified }) => {
  const [assessments, setAssessments] = useState([]);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssessments();
  }, [token]);

  const fetchAssessments = async () => {
    try {
      const res = await fetch('/api/assessments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setAssessments(data.assessments);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = async (assessment) => {
    try {
      const res = await fetch(`/api/assessments/${assessment._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setActiveQuiz(data.assessment);
        setAnswers({});
        setResult(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectAnswer = (qIndex, optIndex) => {
    setAnswers(prev => ({ ...prev, [qIndex]: optIndex }));
  };

  const handleSubmit = async () => {
    if (!activeQuiz) return;
    setIsSubmitting(true);
    try {
      const formattedAnswers = activeQuiz.questions.map((_, idx) => answers[idx] ?? -1);
      const res = await fetch(`/api/assessments/${activeQuiz._id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ answers: formattedAnswers })
      });
      const data = await res.json();
      if (data.success) {
        setResult(data);
        if (data.passed && onSkillVerified) {
          onSkillVerified();
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Interactive Skill Assessments</h2>
        <p className="text-xs text-[#7e8798] mt-0.5">Validate your proficiency with automated multi-question check benchmarks</p>
      </div>

      {!activeQuiz ? (
        /* Assessment Listing */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {assessments.map(ass => (
            <div key={ass._id} className="app-card p-6 flex flex-col justify-between space-y-4 hover:border-white/20 transition-all">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-mono font-bold text-[#d97746] bg-[#281b15] px-2.5 py-1 rounded-md">
                    {ass.skill}
                  </span>
                  <span className="text-xs text-[#6e7788] flex items-center gap-1">
                    <Clock size={12} /> ~10 mins
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mt-1">{ass.title}</h3>
                <p className="text-xs text-[#8c96a7] leading-relaxed">{ass.description}</p>
                <div className="text-[11px] text-[#5e6676] pt-1">
                  Passing score: <span className="font-semibold text-white">{ass.passingScore}%</span> • {ass.questions?.length || 3} Questions
                </div>
              </div>

              <button
                onClick={() => startQuiz(ass)}
                className="w-full py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                Take Assessment <ArrowRight size={14} />
              </button>
            </div>
          ))}
        </div>
      ) : result ? (
        /* Assessment Result Screen */
        <div className="app-card p-8 max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-3 pb-6 border-b border-white/5">
            <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center ${
              result.passed 
                ? 'bg-[#1a2f1e] text-[#9ed68c] border border-[#2e5435]' 
                : 'bg-[#2f1a1a] text-[#fca5a5] border border-[#542e2e]'
            }`}>
              {result.passed ? <CheckCircle2 size={36} /> : <AlertCircle size={36} />}
            </div>

            <div>
              <h3 className="text-2xl font-bold text-white">
                {result.passed ? 'Assessment Passed! Skill Verified' : 'Assessment Incomplete'}
              </h3>
              <p className="text-xs text-[#7d8697] mt-1">
                You scored <span className="font-bold text-white">{result.percentage}%</span> ({result.score} of {result.total} correct). Required: {result.passingScore}%.
              </p>
            </div>

            {result.passed && (
              <div className="inline-block px-4 py-1.5 rounded-full bg-[#1e2e1e] border border-[#3b633b] text-xs font-semibold text-[#9ed68c]">
                ✓ Skill Badge for "{activeQuiz.skill}" has been automatically verified on your profile!
              </div>
            )}
          </div>

          {/* Question Explanations */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white">Answer Breakdown & Explanations</h4>
            {result.review.map((item, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-[#111317] border border-[#1e232e] space-y-2 text-xs">
                <div className="flex items-start justify-between gap-3">
                  <span className="font-semibold text-white">
                    {idx + 1}. {item.question}
                  </span>
                  {item.isCorrect ? (
                    <span className="text-[#9ed68c] font-bold flex items-center gap-1 shrink-0">
                      <CheckCircle2 size={13} /> Correct
                    </span>
                  ) : (
                    <span className="text-[#fca5a5] font-bold flex items-center gap-1 shrink-0">
                      <XCircle size={13} /> Incorrect
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-[#6d7789] pt-1">
                  Correct Answer: <span className="text-white font-medium">{item.options[item.correctAnswer]}</span>
                </div>

                {item.explanation && (
                  <p className="text-[11px] text-[#8691a3] bg-[#161a22] p-2.5 rounded-xl border border-white/5">
                    💡 <span className="font-semibold text-white">Explanation:</span> {item.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-3 pt-4 border-t border-white/5">
            <button
              onClick={() => {
                setActiveQuiz(null);
                setResult(null);
              }}
              className="px-6 py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-gray-200 transition-colors"
            >
              Back to Assessments
            </button>
          </div>
        </div>
      ) : (
        /* Live Quiz Screen */
        <div className="app-card p-6 md:p-8 max-w-3xl mx-auto space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/5">
            <div>
              <span className="text-[10px] font-mono text-[#d97746] uppercase tracking-wider">Skill Verification</span>
              <h3 className="text-xl font-bold text-white mt-0.5">{activeQuiz.title}</h3>
            </div>
            <button
              onClick={() => setActiveQuiz(null)}
              className="text-xs text-[#70798a] hover:text-white"
            >
              Cancel
            </button>
          </div>

          {/* Questions */}
          <div className="space-y-6">
            {activeQuiz.questions.map((q, qIdx) => (
              <div key={qIdx} className="space-y-3 p-4 rounded-2xl bg-[#121419] border border-[#202530]">
                <div className="text-xs font-bold text-white flex items-start gap-2">
                  <span className="text-[#d97746] font-mono">{qIdx + 1}.</span>
                  <span>{q.question}</span>
                </div>

                <div className="space-y-2 pt-1">
                  {q.options.map((opt, oIdx) => {
                    const isSelected = answers[qIdx] === oIdx;
                    return (
                      <div
                        key={oIdx}
                        onClick={() => handleSelectAnswer(qIdx, oIdx)}
                        className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-[#232833] border-[#d97746] text-white font-medium'
                            : 'bg-[#161920] border-[#222834] text-[#a4adbc] hover:border-white/20'
                        }`}
                      >
                        <span>{opt}</span>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-[#d97746] bg-[#d97746]' : 'border-[#3d4554]'
                        }`}>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <span className="text-xs text-[#6e7787]">
              Answered {Object.keys(answers).length} of {activeQuiz.questions.length} questions
            </span>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || Object.keys(answers).length === 0}
              className="px-6 py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-gray-200 transition-colors disabled:opacity-40"
            >
              {isSubmitting ? 'Evaluating...' : 'Submit Answers'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
