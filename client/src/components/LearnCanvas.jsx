

import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  BookOpen, 
  Play, 
  CheckCircle, 
  FileText, 
  Sparkles, 
  Paperclip, 
  ArrowLeft, 
  Clock, 
  Star,
  Compass,
  X,
  FileSpreadsheet,
  Loader2
} from 'lucide-react';

export function LearnCanvas({ user, token, onActivityUpdated }) {
  const [courses, setCourses] = useState([]);
  const [myEnrollments, setMyEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [enrollment, setEnrollment] = useState(null);

  // 'learning' vs 'explore'
  const [mode, setMode] = useState('learning');
  const [courseTab, setCourseTab] = useState('syllabus');

  // Search & filter
  const [search, setSearch] = useState('');
  const [selectedUniv, setSelectedUniv] = useState('All');

  // Notes & file upload
  const [noteContent, setNoteContent] = useState('');
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [savingNote, setSavingNote] = useState(false);
  const [noteStatus, setNoteStatus] = useState('');
  const fileInputRef = useRef(null);

  // Dynamic AI Quiz
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [quizResult, setQuizResult] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, [token]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [cRes, eRes] = await Promise.all([
        fetch('/api/courses'),
        token ? fetch('/api/enrollment/my', { headers: { Authorization: `Bearer ${token}` } }) : Promise.resolve(null)
      ]);

      if (cRes.ok) {
        const cData = await cRes.json();
        setCourses(Array.isArray(cData) ? cData : (cData.courses || []));
      }

      if (eRes && eRes.ok) {
        const eData = await eRes.json();
        setMyEnrollments(eData || []);
        if (!eData || eData.length === 0) setMode('explore');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCourse && token) {
      fetchCourseEnrollment(selectedCourse._id);
    }
  }, [selectedCourse, token]);

  const fetchCourseEnrollment = async (courseId) => {
    try {
      const res = await fetch(`/api/enrollment/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setEnrollment(data);
        if (data.notes && data.notes.length > 0) {
          setNoteContent(data.notes[0].content || '');
          setAttachedFiles(data.notes[0].attachedFiles || []);
        } else {
          setNoteContent('');
          setAttachedFiles([]);
        }
      } else {
        setEnrollment(null);
        setNoteContent('');
        setAttachedFiles([]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      const res = await fetch(`/api/enrollment/${courseId}/enroll`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setEnrollment(data.enrollment);
        fetchInitialData();
        if (onActivityUpdated) onActivityUpdated();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleProgress = async (lectureId) => {
    if (!selectedCourse) return;
    try {
      const duration = selectedLecture?.durationSeconds || 3600;
      const res = await fetch(`/api/enrollment/${selectedCourse._id}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ lectureId, playedSeconds: duration, durationSeconds: duration })
      });
      if (res.ok) {
        const data = await res.json();
        setEnrollment(prev => ({
          ...prev,
          progress: data.progress,
          completedLectures: data.completedLectures
        }));
        fetchInitialData();
        if (onActivityUpdated) onActivityUpdated();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        setAttachedFiles(prev => [...prev, {
          fileName: file.name,
          fileSize: `${(file.size / 1024).toFixed(1)} KB`,
          fileType: file.type || 'document',
          fileData: reader.result,
          uploadedAt: new Date()
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSaveNotes = async () => {
    if (!selectedCourse) return;
    try {
      setSavingNote(true);
      const res = await fetch(`/api/enrollment/${selectedCourse._id}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          moduleId: selectedCourse.modules?.[0]?.moduleId || 'm1',
          content: noteContent,
          attachedFiles
        })
      });
      if (res.ok) {
        setNoteStatus('Saved');
        setTimeout(() => setNoteStatus(''), 2500);
        if (onActivityUpdated) onActivityUpdated();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingNote(false);
    }
  };

  const handleGenerateQuiz = async (mod) => {
    try {
      setGeneratingQuiz(true);
      setActiveQuiz(null);
      setQuizResult(null);
      setQuizAnswers({});

      const res = await fetch('/api/assessments/generate-module-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          courseId: selectedCourse._id,
          moduleId: mod.moduleId,
          moduleTitle: mod.title,
          skillsCovered: mod.skillsLearned || selectedCourse.skillsCovered
        })
      });

      if (res.ok) {
        const data = await res.json();
        setActiveQuiz(data.assessment);
        setCourseTab('quiz');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGeneratingQuiz(false);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz) return;
    try {
      setSubmittingQuiz(true);
      const answers = activeQuiz.questions.map(q => {
        const val = quizAnswers[q._id];
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
        body: JSON.stringify({ answers })
      });

      if (res.ok) {
        const data = await res.json();
        setQuizResult(data.result);
        if (onActivityUpdated) onActivityUpdated();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingQuiz(false);
    }
  };

  const filteredCourses = courses.filter(c => {
    const univ = c.university || c.institution || '';
    const matchesSearch = !search || 
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      (c.instructor && c.instructor.toLowerCase().includes(search.toLowerCase()));

    const matchesUniv = selectedUniv === 'All' || univ.toLowerCase().includes(selectedUniv.toLowerCase());
    return matchesSearch && matchesUniv;
  });

  const universities = ['All', 'Stanford', 'MIT', 'Harvard', 'UC Berkeley', 'CMU', 'Georgia Tech'];

  // Detail View of Course
  if (selectedCourse) {
    const isEnrolled = !!enrollment;
    const progress = enrollment?.progressPercentage || enrollment?.progress || 0;
    const completedLectures = enrollment?.completedLectures || [];
    const firstLecture = selectedCourse.modules?.[0]?.lectures?.[0];
    const currentLecture = selectedLecture || firstLecture;
    const currentVideoId = currentLecture?.youtubeVideoId || currentLecture?.youtubeId;

    return (
      <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn py-4">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
          <button
            onClick={() => { setSelectedCourse(null); setSelectedLecture(null); }}
            className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Courses</span>
          </button>

          {!isEnrolled ? (
            <button
              onClick={() => handleEnroll(selectedCourse._id)}
              className="px-3 py-1.5 rounded-md bg-[var(--text-primary)] text-[var(--bg-page)] text-xs font-semibold hover:opacity-90"
            >
              Enroll in Curriculum
            </button>
          ) : (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[var(--text-tertiary)] font-mono">Progress:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">{progress}%</span>
            </div>
          )}
        </div>

        {/* Minimal Course Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--bg-subtle)] text-[var(--text-secondary)] border border-[var(--border)]">
              {selectedCourse.university} • {selectedCourse.code}
            </span>
            <span className="text-[10px] text-[var(--text-tertiary)]">{selectedCourse.instructor}</span>
          </div>

          <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
            {selectedCourse.title}
          </h2>

          <p className="text-xs text-[var(--text-secondary)] max-w-3xl leading-relaxed">
            {selectedCourse.description}
          </p>
        </div>

        {/* 2-Column Clean Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
          {/* Main Video & Module Tabs (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="aspect-video w-full rounded-xl overflow-hidden bg-black border border-[var(--border)] relative">
              {currentLecture && currentVideoId ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${currentVideoId}?autoplay=0&enablejsapi=1&rel=0`}
                  title={currentLecture.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-neutral-400">
                  Select a lecture to play
                </div>
              )}
            </div>

            {currentLecture && (
              <div className="p-3 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] flex items-center justify-between text-xs">
                <div className="min-w-0">
                  <h4 className="font-semibold text-[var(--text-primary)] truncate">{currentLecture.title}</h4>
                  <p className="text-[11px] text-[var(--text-tertiary)]">{currentLecture.summary || 'University open lecture'}</p>
                </div>

                <button
                  onClick={() => handleProgress(currentLecture.lectureId || currentLecture._id)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                    completedLectures.includes(currentLecture.lectureId || currentLecture._id)
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400'
                      : 'bg-[var(--text-primary)] text-[var(--bg-page)]'
                  }`}
                >
                  {completedLectures.includes(currentLecture.lectureId || currentLecture._id) ? 'Completed' : 'Mark Watched'}
                </button>
              </div>
            )}

            {/* Sub-tabs */}
            <div className="space-y-3 pt-2">
              <div className="flex border-b border-[var(--border)] pb-2 gap-4 text-xs">
                <button
                  onClick={() => setCourseTab('syllabus')}
                  className={`pb-1 transition-all ${courseTab === 'syllabus' ? 'border-b-2 border-[var(--text-primary)] font-semibold text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setCourseTab('notes')}
                  className={`pb-1 transition-all ${courseTab === 'notes' ? 'border-b-2 border-[var(--text-primary)] font-semibold text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}
                >
                  Notes & Files ({attachedFiles.length})
                </button>
                {activeQuiz && (
                  <button
                    onClick={() => setCourseTab('quiz')}
                    className={`pb-1 transition-all ${courseTab === 'quiz' ? 'border-b-2 border-[var(--text-primary)] font-semibold text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}
                  >
                    AI Quiz
                  </button>
                )}
              </div>

              {courseTab === 'notes' && (
                <div className="space-y-3 text-xs">
                  <textarea
                    rows={4}
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="Markdown notes, theorem proofs, formula references..."
                    className="w-full p-3 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)] resize-none font-mono"
                  />

                  {attachedFiles.length > 0 && (
                    <div className="space-y-1">
                      {attachedFiles.map((file, idx) => (
                        <div key={idx} className="p-2 rounded border border-[var(--border)] bg-[var(--bg-subtle)] flex items-center justify-between text-[11px]">
                          <div className="flex items-center gap-1.5 truncate">
                            <FileSpreadsheet className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span className="truncate">{file.fileName}</span>
                            <span className="text-[10px] text-[var(--text-tertiary)]">({file.fileSize})</span>
                          </div>
                          <button onClick={() => setAttachedFiles(prev => prev.filter((_, i) => i !== idx))}>
                            <X className="w-3 h-3 text-[var(--text-tertiary)] hover:text-rose-500" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      multiple
                      className="hidden"
                      accept=".pdf,.png,.jpg,.jpeg,.py,.ipynb,.txt"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1 rounded border border-[var(--border)] text-[11px] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] flex items-center gap-1.5"
                    >
                      <Paperclip className="w-3 h-3" />
                      <span>Attach Document / PDF</span>
                    </button>

                    <button
                      onClick={handleSaveNotes}
                      disabled={savingNote}
                      className="px-3 py-1 rounded bg-[var(--text-primary)] text-[var(--bg-page)] text-[11px] font-semibold"
                    >
                      {savingNote ? 'Saving...' : noteStatus || 'Save Notes'}
                    </button>
                  </div>
                </div>
              )}

              {courseTab === 'quiz' && activeQuiz && (
                <div className="space-y-4 text-xs pt-1">
                  <div className="p-3 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border)]">
                    <span className="font-semibold text-[var(--text-primary)] block">{activeQuiz.title}</span>
                    <span className="text-[11px] text-[var(--text-tertiary)]">{activeQuiz.description}</span>
                  </div>

                  <div className="space-y-3">
                    {activeQuiz.questions.map((q, idx) => (
                      <div key={q._id || idx} className="p-3 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] space-y-2">
                        <span className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase">
                          Question {idx + 1} • {q.type}
                        </span>
                        <p className="font-medium text-[var(--text-primary)]">{q.question}</p>

                        {q.type === 'mcq' && q.options && (
                          <div className="space-y-1">
                            {q.options.map((opt, oIdx) => (
                              <label
                                key={oIdx}
                                className={`flex items-center gap-2 p-2 rounded border cursor-pointer text-xs ${
                                  quizAnswers[q._id] === oIdx
                                    ? 'border-[var(--text-primary)] bg-[var(--bg-subtle)] font-medium'
                                    : 'border-[var(--border)]'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`q_${q._id}`}
                                  checked={quizAnswers[q._id] === oIdx}
                                  onChange={() => setQuizAnswers(prev => ({ ...prev, [q._id]: oIdx }))}
                                />
                                <span>{opt}</span>
                              </label>
                            ))}
                          </div>
                        )}

                        {q.type === 'conceptual' && (
                          <textarea
                            rows={3}
                            value={quizAnswers[q._id] || ''}
                            onChange={(e) => setQuizAnswers(prev => ({ ...prev, [q._id]: e.target.value }))}
                            placeholder="Type conceptual reasoning..."
                            className="w-full p-2 rounded border border-[var(--border)] bg-[var(--bg-page)] text-xs focus:outline-none"
                          />
                        )}

                        {q.type === 'coding' && (
                          <textarea
                            rows={4}
                            value={quizAnswers[q._id] || q.starterCode || ''}
                            onChange={(e) => setQuizAnswers(prev => ({ ...prev, [q._id]: e.target.value }))}
                            className="w-full p-2 rounded border border-[var(--border)] bg-[#0d0f12] text-emerald-400 font-mono text-xs focus:outline-none"
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  {!quizResult ? (
                    <div className="flex justify-end">
                      <button
                        onClick={handleSubmitQuiz}
                        disabled={submittingQuiz}
                        className="px-4 py-1.5 rounded bg-[var(--text-primary)] text-[var(--bg-page)] text-xs font-semibold"
                      >
                        {submittingQuiz ? 'Grading...' : 'Submit Answers'}
                      </button>
                    </div>
                  ) : (
                    <div className="p-3 rounded-lg border border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/40 text-xs space-y-1">
                      <span className="font-bold text-emerald-800 dark:text-emerald-300">
                        Score: {quizResult.totalScore} / {quizResult.maxPossibleScore} ({quizResult.percentage}%)
                      </span>
                      <p className="text-[11px] text-[var(--text-secondary)]">{quizResult.overallFeedback}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Syllabus Right Panel (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <span className="text-xs font-semibold text-[var(--text-primary)] block pb-1 border-b border-[var(--border)]">
              Modules & Lectures
            </span>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1 scrollbar-thin">
              {(selectedCourse.modules || []).map((mod, mIdx) => (
                <div key={mod.moduleId || mIdx} className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] overflow-hidden">
                  <div className="p-2 border-b border-[var(--border)] flex items-center justify-between gap-1">
                    <span className="text-xs font-medium text-[var(--text-primary)] truncate">{mod.title}</span>
                    <button
                      onClick={() => handleGenerateQuiz(mod)}
                      disabled={generatingQuiz}
                      className="px-1.5 py-0.5 rounded border border-[var(--border)] text-[9px] font-mono text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] shrink-0"
                    >
                      AI Quiz
                    </button>
                  </div>

                  <div className="divide-y divide-[var(--border)] text-xs">
                    {(mod.lectures || []).map((lec, lIdx) => {
                      const isCurrent = currentLecture?.lectureId === lec.lectureId || currentLecture?._id === lec._id;
                      const isDone = completedLectures.includes(lec.lectureId || lec._id);

                      return (
                        <div
                          key={lec.lectureId || lIdx}
                          onClick={() => setSelectedLecture(lec)}
                          className={`p-2 flex items-center justify-between cursor-pointer transition-colors ${
                            isCurrent ? 'bg-[var(--bg-subtle)] font-medium text-[var(--text-primary)]' : 'hover:bg-[var(--bg-subtle)] text-[var(--text-secondary)]'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 min-w-0">
                            {isDone ? (
                              <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0" />
                            ) : (
                              <Play className="w-3 h-3 opacity-40 shrink-0" />
                            )}
                            <span className="text-[11px] truncate">{lec.title}</span>
                          </div>
                          <span className="text-[9px] text-[var(--text-tertiary)] font-mono shrink-0 ml-1">
                            {lec.duration || '1h'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Course Hub (My Learning vs Explore)
  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn py-4">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
        <div>
          <h2 className="text-lg font-bold text-[var(--text-primary)]">University Learning Canvas</h2>
          <p className="text-xs text-[var(--text-tertiary)]">25 verified open courseware curriculums with YouTube telemetry</p>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center p-0.5 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] text-xs">
          <button
            onClick={() => setMode('learning')}
            className={`px-3 py-1 rounded-md transition-all font-medium ${
              mode === 'learning' ? 'bg-[var(--text-primary)] text-[var(--bg-page)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            My Learning ({myEnrollments.length})
          </button>
          <button
            onClick={() => setMode('explore')}
            className={`px-3 py-1 rounded-md transition-all font-medium ${
              mode === 'explore' ? 'bg-[var(--text-primary)] text-[var(--bg-page)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Explore Catalog ({courses.length})
          </button>
        </div>
      </div>

      {/* Mode 1: Active Enrolled Courses */}
      {mode === 'learning' && (
        <div className="space-y-3">
          {myEnrollments.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {myEnrollments.map((enr) => (
                <div
                  key={enr._id}
                  onClick={() => setSelectedCourse(enr.course)}
                  className="p-4 rounded-xl border border-[var(--border)] hover:border-[var(--text-secondary)] transition-all cursor-pointer space-y-3 bg-[var(--bg-surface)]"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-[var(--text-tertiary)] block">
                        {enr.course?.university} • {enr.course?.code}
                      </span>
                      <h4 className="text-xs font-semibold text-[var(--text-primary)] mt-0.5">
                        {enr.course?.title}
                      </h4>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {enr.progress || 0}%
                    </span>
                  </div>

                  <div className="w-full bg-[var(--bg-subtle)] h-1 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${enr.progress || 0}%` }} />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[var(--text-tertiary)] pt-1">
                    <span>{enr.completedLectures?.length || 0} lectures watched</span>
                    <span className="text-[var(--text-primary)] font-medium hover:underline">Resume &rarr;</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center border border-dashed border-[var(--border)] rounded-xl text-xs text-[var(--text-tertiary)] space-y-2">
              <p>No active courses enrolled yet.</p>
              <button
                onClick={() => setMode('explore')}
                className="px-3 py-1 rounded bg-[var(--text-primary)] text-[var(--bg-page)] text-xs font-medium"
              >
                Browse Explore Catalog
              </button>
            </div>
          )}
        </div>
      )}

      {/* Mode 2: Explore Courses */}
      {(mode === 'explore' || myEnrollments.length === 0) && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-tertiary)]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search catalog by title, instructor, or code..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)]"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-thin">
              {universities.map(u => (
                <button
                  key={u}
                  onClick={() => setSelectedUniv(u)}
                  className={`px-2.5 py-1 rounded text-[11px] whitespace-nowrap transition-all ${
                    selectedUniv === u
                      ? 'bg-[var(--text-primary)] text-[var(--bg-page)] font-medium'
                      : 'border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-[var(--text-tertiary)]">Loading catalog...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredCourses.map(c => (
                <div
                  key={c._id}
                  onClick={() => setSelectedCourse(c)}
                  className="p-3.5 rounded-xl border border-[var(--border)] hover:border-[var(--text-secondary)] transition-all cursor-pointer bg-[var(--bg-surface)] space-y-2 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-[10px] text-[var(--text-tertiary)] font-mono">
                      <span>{c.university}</span>
                      <span>{c.code}</span>
                    </div>

                    <h4 className="text-xs font-semibold text-[var(--text-primary)] mt-1 line-clamp-1 leading-snug">
                      {c.title}
                    </h4>

                    <p className="text-[11px] text-[var(--text-secondary)] mt-1 line-clamp-2 leading-relaxed">
                      {c.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between text-[10px] text-[var(--text-tertiary)]">
                    <span>{c.instructor}</span>
                    <span className="font-mono">{c.durationHours || 36}h</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
