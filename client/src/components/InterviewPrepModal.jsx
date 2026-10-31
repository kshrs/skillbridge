import React, { useState } from 'react';
import { 
  Sparkles, 
  HelpCircle, 
  Code, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  Send, 
  Play, 
  RotateCcw,
  BookOpen,
  Filter,
  BrainCircuit,
  Bot
} from 'lucide-react';
import { INTERVIEW_QUESTIONS } from '../data/interviewQuestions';

export const InterviewPrepModal = ({ initialModule = 'all', onClose, token }) => {
  const [filterModule, setFilterModule] = useState(initialModule);
  const [filterLevel, setFilterLevel] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [selectedQuestion, setSelectedQuestion] = useState(INTERVIEW_QUESTIONS[0]);

  // Candidate answer states
  const [textAnswer, setTextAnswer] = useState('');
  const [codeAnswer, setCodeAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState(null);

  // Evaluation states
  const [evaluating, setEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [codeExecutionResult, setCodeExecutionResult] = useState(null);

  // Filtered list
  const filteredQuestions = INTERVIEW_QUESTIONS.filter(q => {
    if (filterModule !== 'all' && q.module.toLowerCase() !== filterModule.toLowerCase()) return false;
    if (filterLevel !== 'All' && q.level.toLowerCase() !== filterLevel.toLowerCase()) return false;
    if (filterType !== 'All' && q.type.toLowerCase() !== filterType.toLowerCase()) return false;
    return true;
  });

  const handleSelectQuestion = (q) => {
    setSelectedQuestion(q);
    setTextAnswer('');
    setSelectedOption(null);
    setEvaluationResult(null);
    setCodeExecutionResult(null);
    setCodeAnswer(q.starterCode || '');
  };

  // Submit conceptual text answer for AI Evaluation via Gemini
  const handleEvaluateConceptual = async () => {
    if (!textAnswer.trim()) return;
    setEvaluating(true);
    try {
      const res = await fetch('/api/interview/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          question: selectedQuestion.question,
          userAnswer: textAnswer,
          type: selectedQuestion.type,
          rubric: selectedQuestion.rubric,
          title: selectedQuestion.title,
          level: selectedQuestion.level,
          module: selectedQuestion.module
        })
      });
      const data = await res.json();
      if (data.success) {
        setEvaluationResult(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setEvaluating(false);
    }
  };

  // Evaluate coding questions via local sandbox runner
  const handleRunCode = () => {
    try {
      // Evaluate user code in safe scope
      const runnable = new Function(
        `${codeAnswer}\n\n${selectedQuestion.testSnippet}`
      );
      const passed = runnable();
      if (passed) {
        setCodeExecutionResult({
          passed: true,
          message: 'All unit test assertions passed! Correct algorithmic implementation.'
        });
      } else {
        setCodeExecutionResult({
          passed: false,
          message: 'Test failed: Code returned unexpected value or did not meet edge conditions.'
        });
      }
    } catch (err) {
      setCodeExecutionResult({
        passed: false,
        message: `Runtime Error: ${err.message}`
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="app-card w-full max-w-6xl h-[92vh] flex flex-col bg-[#121419] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        {/* Modal Topbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 border-b border-white/10 bg-[#15181e] gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#d97746]/20 text-[#d97746] border border-[#d97746]/30 flex items-center justify-center">
              <BrainCircuit size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Interactive Interview Arena</h3>
                <span className="text-[11px] font-mono text-[#9ed68c] px-2 py-0.5 rounded bg-[#1c291e] border border-[#2d4831]">
                  92 Practice Questions
                </span>
              </div>
              <p className="text-xs text-[#7e8798]">
                AI-evaluated conceptual questions, MCQ checks & live coding exercises powered by Gemini 2.5 Flash
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="self-end sm:self-auto px-4 py-2 rounded-xl bg-[#202530] text-xs font-semibold text-[#cbd2e0] hover:text-white hover:bg-[#2a3040] transition-colors"
          >
            Close Arena
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 border-b border-white/5 bg-[#14171d] text-xs shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#737c8e] mr-1">Track:</span>
            {[
              { id: 'all', label: 'All 92 Questions' },
              { id: 'model foundations', label: 'Model Foundations (31)' },
              { id: 'inference and model optimization', label: 'Inference & Optimization (30)' },
              { id: 'prompt and context engineering', label: 'Prompt Engineering (31)' }
            ].map(m => (
              <button
                key={m.id}
                onClick={() => setFilterModule(m.id)}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  filterModule.toLowerCase() === m.id.toLowerCase()
                    ? 'bg-white text-black font-bold shadow'
                    : 'bg-[#1b1e25] text-[#8e98aa] hover:text-white border border-white/5'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-[#1b1e25] border border-white/10 rounded-xl px-2.5 py-1 text-xs text-white focus:outline-none"
            >
              <option value="All">All Formats</option>
              <option value="conceptual">Conceptual Input</option>
              <option value="mcq">MCQ Benchmark</option>
              <option value="coding">Live Coding</option>
            </select>

            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="bg-[#1b1e25] border border-white/10 rounded-xl px-2.5 py-1 text-xs text-white focus:outline-none"
            >
              <option value="All">All Tiers</option>
              <option value="Junior">Junior (27)</option>
              <option value="Mid">Mid (32)</option>
              <option value="Senior">Senior (33)</option>
            </select>
          </div>
        </div>

        {/* Main Content Split: Question List (Left) vs Interactive Workspace (Right) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden">
          
          {/* Question List (4 cols) */}
          <div className="lg:col-span-4 border-r border-white/5 overflow-y-auto p-4 space-y-2 bg-[#101217]">
            <div className="text-[11px] font-mono text-[#6e7787] px-2 pb-1">
              Showing {filteredQuestions.length} of 92 questions
            </div>

            {filteredQuestions.map((q, idx) => {
              const isSelected = selectedQuestion?.id === q.id;
              return (
                <div
                  key={q.id}
                  onClick={() => handleSelectQuestion(q)}
                  className={`p-3.5 rounded-2xl cursor-pointer transition-all border text-xs space-y-1.5 ${
                    isSelected
                      ? 'bg-[#1b202a] border-[#d97746] text-white shadow-md shadow-[#d97746]/5'
                      : 'bg-[#14171d] border-white/5 hover:border-white/20 text-[#8e98aa]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#d97746] uppercase">
                      {q.module.split(' ')[0]} • #{idx + 1}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#222732] text-[#cbd2e0] font-mono">
                      {q.level}
                    </span>
                  </div>

                  <h5 className="font-semibold text-white line-clamp-1">{q.title}</h5>

                  <div className="flex items-center justify-between text-[11px] text-[#697284] pt-1">
                    <span className="capitalize font-mono flex items-center gap-1">
                      {q.type === 'coding' && <Code size={12} />}
                      {q.type === 'conceptual' && <HelpCircle size={12} />}
                      {q.type === 'mcq' && <CheckCircle2 size={12} />}
                      {q.type}
                    </span>
                    <ChevronRight size={14} className="text-[#555d6e]" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Workspace (8 cols) */}
          <div className="lg:col-span-8 overflow-y-auto p-6 md:p-8 space-y-6 bg-[#13151a]">
            {selectedQuestion && (
              <div className="space-y-6">
                {/* Question Header */}
                <div className="space-y-2 pb-4 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#d97746] uppercase">
                      {selectedQuestion.module}
                    </span>
                    <span className="text-xs text-[#6e7787]">•</span>
                    <span className="text-xs font-mono text-[#9ed68c]">{selectedQuestion.level} Tier</span>
                    <span className="text-xs text-[#6e7787]">•</span>
                    <span className="text-xs uppercase font-mono px-2 py-0.5 rounded bg-[#1e232d] text-[#cbd2e0]">
                      {selectedQuestion.type} format
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white">{selectedQuestion.title}</h3>
                  <p className="text-sm text-[#cbd2e0] leading-relaxed pt-1">
                    {selectedQuestion.question}
                  </p>
                </div>

                {/* 1. CONCEPTUAL INPUT QUESTION WORKSPACE */}
                {selectedQuestion.type === 'conceptual' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#8c96a7] uppercase tracking-wider block">
                        Type Your Detailed Technical Explanation:
                      </label>
                      <span className="text-[11px] font-mono text-[#737d8f]">
                        {textAnswer.trim().split(/\s+/).filter(Boolean).length} words
                      </span>
                    </div>

                    <textarea
                      value={textAnswer}
                      onChange={(e) => setTextAnswer(e.target.value)}
                      rows={7}
                      placeholder="Explain the architectural principles, mathematical logic, trade-offs, and failure modes..."
                      className="w-full bg-[#101217] border border-[#232833] rounded-2xl p-4 text-xs font-sans text-white placeholder-[#555d6e] focus:outline-none focus:border-[#d97746] leading-relaxed"
                    />

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-[#687283] flex items-center gap-1.5">
                        <Bot size={14} className="text-[#d97746]" /> Evaluated by Gemini 2.5 Flash / Flash Lite
                      </span>
                      <button
                        onClick={handleEvaluateConceptual}
                        disabled={evaluating || !textAnswer.trim()}
                        className="px-6 py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-gray-200 transition-colors flex items-center gap-2 shadow disabled:opacity-40"
                      >
                        <Send size={13} /> {evaluating ? 'Grading with Gemini...' : 'Submit for AI Evaluation'}
                      </button>
                    </div>

                    {/* AI Evaluation Result Card */}
                    {evaluationResult && (
                      <div className="p-5 rounded-2xl bg-[#101319] border border-[#232936] space-y-3 animate-in fade-in">
                        <div className="flex items-center justify-between pb-2 border-b border-white/5">
                          <div>
                            <span className="text-[10px] font-mono text-[#d97746] uppercase">
                              AI Graded ({evaluationResult.modelUsed})
                            </span>
                            <div className="text-sm font-bold text-white flex items-center gap-2 mt-0.5">
                              <span>Verdict: {evaluationResult.verdict}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-2xl font-black text-[#9ed68c] font-mono">
                              {evaluationResult.score}/100
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-[#cbd2e0] leading-relaxed">
                          {evaluationResult.feedback}
                        </p>

                        {evaluationResult.improvements && evaluationResult.improvements.length > 0 && (
                          <div className="space-y-1.5 pt-1">
                            <span className="text-[10px] font-bold uppercase text-[#f3a478]">Areas to Enhance:</span>
                            <ul className="list-disc list-inside text-xs text-[#a4adb8] space-y-0.5">
                              {evaluationResult.improvements.map((imp, idx) => (
                                <li key={idx}>{imp}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* 2. MCQ QUESTION WORKSPACE */}
                {selectedQuestion.type === 'mcq' && (
                  <div className="space-y-4">
                    <label className="text-xs font-bold text-[#8c96a7] uppercase tracking-wider block">
                      Select the Most Accurate Technical Answer:
                    </label>

                    <div className="space-y-2.5">
                      {selectedQuestion.options.map((opt, idx) => {
                        const isChosen = selectedOption === idx;
                        const isCorrect = idx === selectedQuestion.correctAnswer;
                        const showFeedback = selectedOption !== null;

                        return (
                          <div
                            key={idx}
                            onClick={() => setSelectedOption(idx)}
                            className={`p-4 rounded-2xl border text-xs cursor-pointer transition-all flex items-start gap-3 ${
                              showFeedback && isCorrect
                                ? 'bg-[#18261b] border-[#2e5233] text-white font-medium'
                                : showFeedback && isChosen && !isCorrect
                                ? 'bg-[#291717] border-[#522e2e] text-[#fca5a5]'
                                : isChosen
                                ? 'bg-[#212632] border-[#d97746] text-white font-medium'
                                : 'bg-[#101217] border-[#202530] text-[#a4adbc] hover:border-white/20'
                            }`}
                          >
                            <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <span className="flex-1 leading-relaxed">{opt}</span>
                            {showFeedback && isCorrect && (
                              <CheckCircle2 size={16} className="text-[#9ed68c] shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {selectedOption !== null && (
                      <div className="p-4 rounded-2xl bg-[#101319] border border-white/5 space-y-1.5 text-xs animate-in fade-in">
                        <span className="font-bold text-white flex items-center gap-1.5">
                          <BookOpen size={14} className="text-[#d97746]" /> Technical Explanation:
                        </span>
                        <p className="text-[#a4adb8] leading-relaxed">
                          {selectedQuestion.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. LIVE CODING QUESTION WORKSPACE */}
                {selectedQuestion.type === 'coding' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#8c96a7] uppercase tracking-wider flex items-center gap-1.5">
                        <Code size={14} /> Interactive JavaScript Code Sandbox:
                      </label>
                      <button
                        onClick={() => {
                          setCodeAnswer(selectedQuestion.starterCode || '');
                          setCodeExecutionResult(null);
                        }}
                        className="text-xs text-[#70798a] hover:text-white flex items-center gap-1"
                      >
                        <RotateCcw size={12} /> Reset Starter Code
                      </button>
                    </div>

                    <div className="rounded-2xl border border-[#232833] overflow-hidden bg-[#0d0e12]">
                      <div className="px-4 py-2 border-b border-white/5 bg-[#14161d] text-[10px] font-mono text-[#656e7f] flex items-center justify-between">
                        <span>algorithm.js</span>
                        <span>V8 Browser Engine</span>
                      </div>
                      <textarea
                        value={codeAnswer}
                        onChange={(e) => setCodeAnswer(e.target.value)}
                        rows={10}
                        spellCheck={false}
                        className="w-full bg-[#0d0e12] p-4 text-xs font-mono text-[#9ed68c] focus:outline-none leading-relaxed"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-[#6e7787]">
                        Verified against hidden automated test assertions.
                      </span>
                      <button
                        onClick={handleRunCode}
                        className="px-6 py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-gray-200 transition-colors flex items-center gap-2 shadow"
                      >
                        <Play size={13} fill="currentColor" /> Run & Evaluate Code
                      </button>
                    </div>

                    {codeExecutionResult && (
                      <div className={`p-4 rounded-2xl border text-xs animate-in fade-in flex items-start gap-3 ${
                        codeExecutionResult.passed
                          ? 'bg-[#18261b] border-[#2e5233] text-[#9ed68c]'
                          : 'bg-[#291717] border-[#522e2e] text-[#fca5a5]'
                      }`}>
                        {codeExecutionResult.passed ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                        <div className="space-y-0.5">
                          <span className="font-bold">
                            {codeExecutionResult.passed ? 'Execution Succeeded' : 'Execution Failed'}
                          </span>
                          <p className="text-[11px] opacity-90">{codeExecutionResult.message}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
