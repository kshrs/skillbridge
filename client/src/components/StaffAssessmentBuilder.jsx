

import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, 
  Trash2, 
  CheckCircle2, 
  HelpCircle, 
  Clock, 
  Award, 
  Filter, 
  Sparkles,
  Layers,
  BookOpen
} from 'lucide-react';

export function StaffAssessmentBuilder({ token, onAssessmentCreated }) {
  const [courses, setCourses] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skill, setSkill] = useState('');
  const [category, setCategory] = useState('cohort-drive');
  const [department, setDepartment] = useState('All');
  const [year, setYear] = useState('0');
  const [section, setSection] = useState('All');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(30);
  const [passingScore, setPassingScore] = useState(70);

  const [questions, setQuestions] = useState([
    {
      type: 'mcq',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
      points: 25
    }
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  useEffect(() => {
    fetch('/api/courses')
      .then(r => r.json())
      .then(d => {
        if (Array.isArray(d)) setCourses(d);
      })
      .catch(console.error);
  }, []);

  const handleAddQuestion = (type = 'mcq') => {
    if (type === 'mcq') {
      setQuestions([
        ...questions,
        {
          type: 'mcq',
          question: '',
          options: ['', '', '', ''],
          correctAnswer: 0,
          explanation: '',
          points: 25
        }
      ]);
    } else if (type === 'conceptual') {
      setQuestions([
        ...questions,
        {
          type: 'conceptual',
          question: '',
          sampleSolution: '',
          points: 25
        }
      ]);
    } else if (type === 'coding') {
      setQuestions([
        ...questions,
        {
          type: 'coding',
          question: '',
          starterCode: 'def solution():\n    # write code here\n    pass',
          sampleSolution: 'def solution():\n    return True',
          points: 25
        }
      ]);
    }
  };

  const handleRemoveQuestion = (idx) => {
    if (questions.length <= 1) return;
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const handleUpdateQuestion = (idx, field, value) => {
    const next = [...questions];
    next[idx][field] = value;
    setQuestions(next);
  };

  const handleUpdateOption = (qIdx, optIdx, value) => {
    const next = [...questions];
    next[qIdx].options[optIdx] = value;
    setQuestions(next);
  };

  const handleLoadTemplate = (topic) => {
    if (topic === 'sys-design') {
      setTitle('Cohort Benchmark: Distributed Systems & Raft Consensus');
      setSkill('Distributed Systems');
      setDescription('Mandatory cohort evaluation covering consensus invariants, leader election, and log compaction.');
      setDepartment('Computer Science');
      setYear('4');
      setQuestions([
        {
          type: 'mcq',
          question: 'In the Raft consensus protocol, what condition must be true for a leader to commit a log entry from a previous term?',
          options: [
            'It can be committed directly once stored on a majority of servers.',
            'It cannot be committed directly; it must be committed by committing an entry from its current term.',
            'It requires an immediate quorum reconfiguration heartbeat.',
            'It can only be committed if all candidate votes are unanimous.'
          ],
          correctAnswer: 1,
          explanation: 'Raft does not commit previous-term entries by counting replicas directly; a leader commits them indirectly by replicating and committing an entry from its current term (Section 5.4.2 of Raft paper).',
          points: 25
        },
        {
          type: 'conceptual',
          question: 'Explain how Split-Brain is prevented in a 5-node distributed cluster when network partition separates 2 nodes from 3 nodes.',
          sampleSolution: 'In a 5-node cluster, a strict quorum requires (5/2)+1 = 3 nodes. The partition with 2 nodes cannot achieve a majority quorum and rejects write requests or abdicates leadership. The 3-node partition achieves quorum and continues safely.',
          points: 25
        }
      ]);
    } else if (topic === 'nlp-attention') {
      setTitle('Stanford CS224N Diagnostic: Self-Attention & Transformers');
      setSkill('Transformers & NLP');
      setDescription('Assessment on Scaled Dot-Product Attention, Multi-Head projection dimensions, and LayerNorm ordering.');
      setDepartment('Information Technology');
      setYear('3');
      setQuestions([
        {
          type: 'mcq',
          question: 'Why is the dot-product in Scaled Dot-Product Attention divided by sqrt(d_k)?',
          options: [
            'To accelerate backward gradient propagation through GPU matrix cores.',
            'To avoid softmax saturation and vanishing gradients for large key dimension sizes.',
            'To ensure that the attention matrix diagonal always sums to 1.0.',
            'To normalize the output vector magnitude to unit Euclidean norm.'
          ],
          correctAnswer: 1,
          explanation: 'Dividing by sqrt(d_k) prevents the dot products from growing excessively large for large dimensions, which would push the softmax function into regions with vanishingly small gradients.',
          points: 25
        },
        {
          type: 'coding',
          question: 'Implement a vectorized computation for Scaled Dot-Product Attention in Python given Q, K, V numpy matrices.',
          starterCode: 'import numpy as np\n\ndef scaled_dot_product_attention(Q, K, V):\n    # d_k = Q.shape[-1]\n    # Return attention output\n    pass',
          sampleSolution: 'import numpy as np\n\ndef scaled_dot_product_attention(Q, K, V):\n    d_k = Q.shape[-1]\n    scores = np.matmul(Q, K.swapaxes(-2, -1)) / np.sqrt(d_k)\n    weights = np.exp(scores - np.max(scores, axis=-1, keepdims=True))\n    weights = weights / np.sum(weights, axis=-1, keepdims=True)\n    return np.matmul(weights, V)',
          points: 25
        }
      ]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !skill.trim()) {
      setStatusMsg({ type: 'error', text: 'Please fill in Title and Target Skill.' });
      return;
    }

    setSubmitting(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/assessments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          description,
          skill,
          category,
          targetClass: {
            department,
            year: Number(year) || 0,
            section
          },
          timeLimitMinutes: Number(timeLimitMinutes) || 30,
          passingScore: Number(passingScore) || 70,
          questions
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create assessment');

      setStatusMsg({ type: 'success', text: `Published successfully! Target: ${department} (Year ${year === '0' ? 'All' : year})` });
      if (onAssessmentCreated) onAssessmentCreated(data.assessment);

      // Reset form
      setTitle('');
      setDescription('');
      setSkill('');
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Templates Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] text-xs">
        <div className="flex items-center gap-2 text-[var(--text-secondary)]">
          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          <span className="font-medium text-[var(--text-primary)]">Quick Presets:</span>
          <span>Load verified university benchmark curriculum rubrics</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleLoadTemplate('sys-design')}
            className="px-2.5 py-1 rounded bg-[var(--bg-page)] border border-[var(--border)] hover:border-neutral-400 font-medium text-[var(--text-primary)] transition-all"
          >
            Raft Distributed Systems
          </button>
          <button
            type="button"
            onClick={() => handleLoadTemplate('nlp-attention')}
            className="px-2.5 py-1 rounded bg-[var(--bg-page)] border border-[var(--border)] hover:border-neutral-400 font-medium text-[var(--text-primary)] transition-all"
          >
            CS224N Attention & Transformers
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
          statusMsg.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' 
            : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
        }`}>
          {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <HelpCircle className="w-4 h-4 shrink-0" />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              Assessment Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Mid-Term Verification: Scaled Attention & PyTorch"
              className="w-full px-3 py-2 text-xs rounded-md bg-[var(--bg-page)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              Target Skill or Domain *
            </label>
            <input
              type="text"
              required
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              placeholder="e.g. PyTorch, Distributed Systems, React"
              className="w-full px-3 py-2 text-xs rounded-md bg-[var(--bg-page)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
            Assessment Instructions / Rubric Description
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Outline criteria, allowed reference material, and grading expectations..."
            className="w-full px-3 py-2 text-xs rounded-md bg-[var(--bg-page)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Target Batch / Class Targeting Grid */}
        <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-primary)]">
            <Filter className="w-3.5 h-3.5 text-blue-500" />
            <span>Target Class & Academic Audience Targeting</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="text-[11px] text-[var(--text-secondary)] block mb-1">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded bg-[var(--bg-page)] border border-[var(--border)] text-[var(--text-primary)]"
              >
                <option value="All">All Departments</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Data Science">Data Science</option>
                <option value="Electronics & Communication">Electronics & Communication</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-[var(--text-secondary)] block mb-1">Target Year</label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded bg-[var(--bg-page)] border border-[var(--border)] text-[var(--text-primary)]"
              >
                <option value="0">All Batches (1st - 4th Yr)</option>
                <option value="1">1st Year (Freshmen)</option>
                <option value="2">2nd Year (Sophomores)</option>
                <option value="3">3rd Year (Juniors)</option>
                <option value="4">4th Year (Seniors)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-[var(--text-secondary)] block mb-1">Duration (Min)</label>
              <input
                type="number"
                min="5"
                max="180"
                value={timeLimitMinutes}
                onChange={(e) => setTimeLimitMinutes(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded bg-[var(--bg-page)] border border-[var(--border)] text-[var(--text-primary)]"
              />
            </div>

            <div>
              <label className="text-[11px] text-[var(--text-secondary)] block mb-1">Passing Score (%)</label>
              <input
                type="number"
                min="30"
                max="100"
                value={passingScore}
                onChange={(e) => setPassingScore(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded bg-[var(--bg-page)] border border-[var(--border)] text-[var(--text-primary)]"
              />
            </div>
          </div>
        </div>

        {/* Questions Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider">
                Assessment Questions ({questions.length})
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleAddQuestion('mcq')}
                className="px-2.5 py-1 rounded border border-[var(--border)] bg-[var(--bg-page)] hover:bg-[var(--bg-subtle)] font-medium text-[var(--text-primary)] flex items-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5 text-blue-500" />
                <span>+ Add MCQ</span>
              </button>
              <button
                type="button"
                onClick={() => handleAddQuestion('conceptual')}
                className="px-2.5 py-1 rounded border border-[var(--border)] bg-[var(--bg-page)] hover:bg-[var(--bg-subtle)] font-medium text-[var(--text-primary)] flex items-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5 text-emerald-500" />
                <span>+ Conceptual</span>
              </button>
              <button
                type="button"
                onClick={() => handleAddQuestion('coding')}
                className="px-2.5 py-1 rounded border border-[var(--border)] bg-[var(--bg-page)] hover:bg-[var(--bg-subtle)] font-medium text-[var(--text-primary)] flex items-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5 text-purple-500" />
                <span>+ Coding</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {questions.map((q, idx) => (
              <div 
                key={idx} 
                className="p-4 rounded-lg border border-[var(--border)] bg-[var(--bg-page)] space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-[var(--bg-subtle)] text-[var(--text-primary)] font-bold text-[10px] flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                      {q.type.toUpperCase()} Question
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
                      <span>Points:</span>
                      <input
                        type="number"
                        min="5"
                        max="100"
                        value={q.points}
                        onChange={(e) => handleUpdateQuestion(idx, 'points', Number(e.target.value) || 25)}
                        className="w-12 px-1 py-0.5 text-center text-xs rounded bg-[var(--bg-subtle)] border border-[var(--border)] text-[var(--text-primary)]"
                      />
                    </div>
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(idx)}
                        className="text-[var(--text-tertiary)] hover:text-rose-500 transition-colors p-1"
                        title="Delete Question"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] text-[var(--text-secondary)]">Question Prompt *</label>
                  <textarea
                    rows={2}
                    required
                    value={q.question}
                    onChange={(e) => handleUpdateQuestion(idx, 'question', e.target.value)}
                    placeholder="Enter the problem statement or question..."
                    className="w-full px-3 py-2 text-xs rounded bg-[var(--bg-subtle)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-blue-500 font-sans"
                  />
                </div>

                {/* Question Type Specific Details */}
                {q.type === 'mcq' && (
                  <div className="space-y-2 pt-1">
                    <label className="text-[11px] text-[var(--text-secondary)] block">
                      Options (Select the radio of the correct answer)
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {q.options.map((opt, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`correct_${idx}`}
                            checked={q.correctAnswer === optIdx}
                            onChange={() => handleUpdateQuestion(idx, 'correctAnswer', optIdx)}
                            className="text-blue-600 focus:ring-0"
                          />
                          <input
                            type="text"
                            required
                            value={opt}
                            onChange={(e) => handleUpdateOption(idx, optIdx, e.target.value)}
                            placeholder={`Option ${optIdx + 1}`}
                            className="flex-1 px-2.5 py-1.5 text-xs rounded bg-[var(--bg-subtle)] border border-[var(--border)] text-[var(--text-primary)]"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="pt-2">
                      <label className="text-[11px] text-[var(--text-secondary)]">Explanation for Answer</label>
                      <input
                        type="text"
                        value={q.explanation || ''}
                        onChange={(e) => handleUpdateQuestion(idx, 'explanation', e.target.value)}
                        placeholder="Why is this option correct? (shown after submission)"
                        className="w-full px-2.5 py-1.5 text-xs rounded bg-[var(--bg-subtle)] border border-[var(--border)] text-[var(--text-primary)]"
                      />
                    </div>
                  </div>
                )}

                {q.type === 'conceptual' && (
                  <div className="space-y-1.5 pt-1">
                    <label className="text-[11px] text-[var(--text-secondary)]">Model Answer / Evaluation Rubric</label>
                    <textarea
                      rows={3}
                      value={q.sampleSolution || ''}
                      onChange={(e) => handleUpdateQuestion(idx, 'sampleSolution', e.target.value)}
                      placeholder="Expected conceptual points for AI or faculty grading..."
                      className="w-full px-3 py-2 text-xs rounded bg-[var(--bg-subtle)] border border-[var(--border)] text-[var(--text-primary)] font-mono"
                    />
                  </div>
                )}

                {q.type === 'coding' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1">
                      <label className="text-[11px] text-[var(--text-secondary)]">Starter Code (Template)</label>
                      <textarea
                        rows={4}
                        value={q.starterCode || ''}
                        onChange={(e) => handleUpdateQuestion(idx, 'starterCode', e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded bg-[var(--bg-subtle)] border border-[var(--border)] text-[var(--text-primary)] font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-[var(--text-secondary)]">Reference Solution</label>
                      <textarea
                        rows={4}
                        value={q.sampleSolution || ''}
                        onChange={(e) => handleUpdateQuestion(idx, 'sampleSolution', e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded bg-[var(--bg-subtle)] border border-[var(--border)] text-[var(--text-primary)] font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 rounded-md bg-[var(--text-primary)] text-[var(--bg-page)] text-xs font-semibold hover:opacity-90 disabled:opacity-50 transition-all shadow-sm flex items-center gap-2"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{submitting ? 'Publishing Benchmark...' : 'Publish Assessment to Target Cohort'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
