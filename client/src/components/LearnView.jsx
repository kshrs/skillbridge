import React, { useState, useEffect } from 'react';
import { 
  Search, 
  BookOpen, 
  Play, 
  CheckCircle, 
  FileText, 
  Sparkles, 
  ExternalLink, 
  Upload, 
  Clock, 
  Star, 
  ArrowLeft,
  GraduationCap,
  Terminal,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export function LearnView({ user, token, onActivityLogged }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [activeTab, setActiveTab] = useState('lectures'); // 'lectures', 'notes', 'project', 'quiz'

  // Filtering & search
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedUniversity, setSelectedUniversity] = useState('All');

  // Notes state
  const [noteContent, setNoteContent] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [noteStatus, setNoteStatus] = useState('');

  // Project state
  const [projectTitle, setProjectTitle] = useState('');
  const [projectRepo, setProjectRepo] = useState('');
  const [projectDemo, setProjectDemo] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [submittingProject, setSubmittingProject] = useState(false);
  const [projectStatus, setProjectStatus] = useState('');

  // Dynamic AI Quiz Generator state
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [quizResult, setQuizResult] = useState(null);

  // Fetch courses catalog
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/courses');
      const data = await res.json();
      const list = data.courses || data || [];
      setCourses(list);
    } catch (err) {
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch enrollment when course selected
  useEffect(() => {
    if (selectedCourse && token) {
      fetchEnrollment(selectedCourse._id);
    }
  }, [selectedCourse, token]);

  const fetchEnrollment = async (courseId) => {
    try {
      const res = await fetch(`/api/enrollment/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setEnrollment(data);
        if (data.notes && data.notes.length > 0) {
          setNoteContent(data.notes[0].content || '');
        }
      } else {
        setEnrollment(null);
      }
    } catch (err) {
      console.error('Error fetching enrollment:', err);
    }
  };

  // Handle Enrollment
  const handleEnroll = async (courseId) => {
    try {
      const res = await fetch(`/api/enrollment/${courseId}/enroll`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        }
      });
      if (res.ok) {
        const data = await res.json();
        setEnrollment(data.enrollment);
        if (onActivityLogged) onActivityLogged();
      }
    } catch (err) {
      console.error('Error enrolling:', err);
    }
  };

  // Mark lecture watched & sync progress
  const handleLectureProgress = async (lectureId, isComplete = true) => {
    if (!selectedCourse) return;
    try {
      const durationSeconds = selectedLecture?.durationSeconds || 3600;
      const res = await fetch(`/api/enrollment/${selectedCourse._id}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          lectureId,
          playedSeconds: isComplete ? durationSeconds : durationSeconds * 0.5,
          durationSeconds
        })
      });

      if (res.ok) {
        const data = await res.json();
        setEnrollment(prev => ({
          ...prev,
          progress: data.progress,
          completedLectures: data.completedLectures,
          lectureProgress: data.lectureProgress
        }));
        if (onActivityLogged) onActivityLogged();
      }
    } catch (err) {
      console.error('Error saving progress:', err);
    }
  };

  // Save notes
  const handleSaveNotes = async () => {
    if (!selectedCourse || !noteContent) return;
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
          moduleTitle: selectedCourse.modules?.[0]?.title || 'Module Notes',
          content: noteContent
        })
      });
      if (res.ok) {
        setNoteStatus('Notes saved to cloud portfolio!');
        setTimeout(() => setNoteStatus(''), 3000);
        if (onActivityLogged) onActivityLogged();
      }
    } catch (err) {
      console.error('Error saving notes:', err);
    } finally {
      setSavingNote(false);
    }
  };

  // Submit project artifact
  const handleSubmitProject = async (e) => {
    e.preventDefault();
    if (!selectedCourse || !projectTitle || !projectRepo) return;
    try {
      setSubmittingProject(true);
      const res = await fetch(`/api/enrollment/${selectedCourse._id}/artifacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: projectTitle,
          repoUrl: projectRepo,
          demoUrl: projectDemo,
          description: projectDesc
        })
      });
      if (res.ok) {
        const data = await res.json();
        setEnrollment(prev => ({ ...prev, projectArtifacts: data.artifacts }));
        setProjectTitle('');
        setProjectRepo('');
        setProjectDemo('');
        setProjectDesc('');
        setProjectStatus('Project artifact attached to institutional portfolio!');
        setTimeout(() => setProjectStatus(''), 4000);
        if (onActivityLogged) onActivityLogged();
      }
    } catch (err) {
      console.error('Error submitting project:', err);
    } finally {
      setSubmittingProject(false);
    }
  };

  // Generate On-Demand AI Module Quiz via Gemini Flash
  const handleGenerateModuleQuiz = async (module) => {
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
          moduleId: module.moduleId || module._id,
          moduleTitle: module.title,
          skillsCovered: module.skillsLearned || selectedCourse.skillsCovered
        })
      });

      if (res.ok) {
        const data = await res.json();
        setActiveQuiz(data.assessment);
        setActiveTab('quiz');
      }
    } catch (err) {
      console.error('Error generating quiz:', err);
    } finally {
      setGeneratingQuiz(false);
    }
  };

  // Submit Quiz Answers
  const handleSubmitQuiz = async () => {
    if (!activeQuiz) return;
    try {
      setSubmittingQuiz(true);
      const formattedAnswers = Object.entries(quizAnswers).map(([qId, val]) => {
        const q = activeQuiz.questions.find(item => item._id === qId);
        if (q?.type === 'mcq') {
          return { questionId: qId, type: 'mcq', selectedOption: val };
        } else {
          return { questionId: qId, type: q?.type || 'conceptual', textAnswer: val };
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

      if (res.ok) {
        const data = await res.json();
        setQuizResult(data.result);
        if (onActivityLogged) onActivityLogged();
      }
    } catch (err) {
      console.error('Error submitting quiz:', err);
    } finally {
      setSubmittingQuiz(false);
    }
  };

  // Filtering list of courses
  const filteredCourses = courses.filter(course => {
    const matchesSearch = !search || 
      course.title.toLowerCase().includes(search.toLowerCase()) ||
      course.code.toLowerCase().includes(search.toLowerCase()) ||
      course.instructor.toLowerCase().includes(search.toLowerCase()) ||
      (course.skillsCovered || []).some(s => s.toLowerCase().includes(search.toLowerCase()));

    const matchesUniv = selectedUniversity === 'All' || 
      (course.university && course.university.toLowerCase().includes(selectedUniversity.toLowerCase())) ||
      (course.provider && course.provider.toLowerCase().includes(selectedUniversity.toLowerCase()));

    const matchesCat = selectedCategory === 'All' || course.category === selectedCategory;

    return matchesSearch && matchesUniv && matchesCat;
  });

  const universities = ['All', 'Stanford Online', 'MIT OpenCourseWare', 'Harvard University', 'UC Berkeley', 'University of Helsinki'];
  const categories = ['All', 'Artificial Intelligence', 'Machine Learning', 'Computer Science Core', 'Deep Learning', 'Full Stack Development', 'Computer Systems'];

  // Detail View of a Course
  if (selectedCourse) {
    const isEnrolled = !!enrollment;
    const progress = enrollment?.progress || 0;
    const completedLectures = enrollment?.completedLectures || [];

    // Find default lecture if none selected
    const currentLecture = selectedLecture || selectedCourse.modules?.[0]?.lectures?.[0];

    return (
      <div className="space-y-6 animate-fadeIn pb-12">
        {/* Back Button & Course Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => { setSelectedCourse(null); setSelectedLecture(null); }}
            className="flex items-center gap-2 text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All 25 University Courses</span>
          </button>

          {!isEnrolled ? (
            <button
              onClick={() => handleEnroll(selectedCourse._id)}
              className="px-6 py-2.5 rounded-xl bg-[#d97746] hover:bg-[#c26233] text-white text-sm font-semibold transition-all shadow-md shadow-[#d97746]/20 flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>Enroll in Course</span>
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-xs text-[var(--text-muted)]">Course Progress:</span>
              <div className="w-32 bg-[var(--border-color)] h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-[#d97746] to-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs font-bold text-emerald-500">{progress}%</span>
            </div>
          )}
        </div>

        {/* Hero Meta Card */}
        <div className="rounded-3xl p-6 md:p-8 bg-[var(--card-bg)] border border-[var(--border-color)] shadow-xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-[#d97746]/10 text-[#d97746] border border-[#d97746]/20">
                  {selectedCourse.university || selectedCourse.provider}
                </span>
                <span className="text-xs font-mono text-[var(--text-muted)]">{selectedCourse.code}</span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {selectedCourse.difficulty}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--text-main)]">
                {selectedCourse.title}
              </h1>
              <p className="text-xs md:text-sm text-[var(--text-muted)] max-w-3xl leading-relaxed">
                {selectedCourse.description}
              </p>
              <p className="text-xs text-[var(--text-muted)] pt-1">
                Instructor: <strong className="text-[var(--text-main)]">{selectedCourse.instructor}</strong> • {selectedCourse.durationHours || 36} Hours
              </p>
            </div>

            {/* Skills Covered */}
            <div className="md:w-72 shrink-0 space-y-2">
              <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block">
                Target Competencies
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(selectedCourse.skillsCovered || []).map((skill, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2.5 py-1 rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-main)] font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Video Player & Tabs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area (Player / Notes / Artifacts) */}
          <div className="lg:col-span-2 space-y-4">
            {/* YouTube Player Container */}
            <div className="rounded-3xl overflow-hidden bg-black aspect-video border border-[var(--border-color)] shadow-2xl relative">
              {currentLecture ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${currentLecture.youtubeVideoId}?autoplay=0&enablejsapi=1&rel=0&modestbranding=1`}
                  title={currentLecture.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)]">
                  Select a lecture to begin streaming
                </div>
              )}
            </div>

            {/* Lecture Meta & Mark Watched */}
            {currentLecture && (
              <div className="p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--border-color)] flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h3 className="font-bold text-sm text-[var(--text-main)]">{currentLecture.title}</h3>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">{currentLecture.summary || 'University open lecture'}</p>
                </div>

                <button
                  onClick={() => handleLectureProgress(currentLecture.lectureId || currentLecture._id, true)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    completedLectures.includes(currentLecture.lectureId || currentLecture._id)
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                      : 'bg-[#d97746] hover:bg-[#c26233] text-white'
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>
                    {completedLectures.includes(currentLecture.lectureId || currentLecture._id)
                      ? 'Completed (+Progress)'
                      : 'Mark Lecture Complete'}
                  </span>
                </button>
              </div>
            )}

            {/* Module Tabs (Notes, Project Artifacts, AI Quiz) */}
            <div className="rounded-3xl p-6 bg-[var(--card-bg)] border border-[var(--border-color)] shadow-xl">
              <div className="flex border-b border-[var(--border-color)] pb-3 gap-6 text-sm font-semibold">
                <button
                  onClick={() => setActiveTab('lectures')}
                  className={`pb-1 transition-all ${activeTab === 'lectures' ? 'text-[#d97746] border-b-2 border-[#d97746]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                >
                  Overview & Readings
                </button>
                <button
                  onClick={() => setActiveTab('notes')}
                  className={`pb-1 transition-all flex items-center gap-1.5 ${activeTab === 'notes' ? 'text-[#d97746] border-b-2 border-[#d97746]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Module Notes</span>
                </button>
                <button
                  onClick={() => setActiveTab('project')}
                  className={`pb-1 transition-all flex items-center gap-1.5 ${activeTab === 'project' ? 'text-[#d97746] border-b-2 border-[#d97746]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                >
                  <Upload className="w-4 h-4" />
                  <span>Submit Artifact</span>
                </button>
                {activeQuiz && (
                  <button
                    onClick={() => setActiveTab('quiz')}
                    className={`pb-1 transition-all flex items-center gap-1.5 ${activeTab === 'quiz' ? 'text-[#d97746] border-b-2 border-[#d97746]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                  >
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>AI Module Quiz</span>
                  </button>
                )}
              </div>

              {/* Tab 1: Overview */}
              {activeTab === 'lectures' && (
                <div className="pt-4 space-y-4">
                  <div className="text-sm text-[var(--text-muted)] leading-relaxed">
                    This course curriculum is sourced directly from premier institutional lecture archives ({selectedCourse.university}). All lectures are embedded from verified university YouTube channels with live progress telemetry syncing with your GitHub learning activity heatmap.
                  </div>

                  <div className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)]">
                    <h4 className="text-xs font-bold text-[var(--text-main)] uppercase tracking-wider mb-2">
                      Academic Syllabus Summary
                    </h4>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                      {selectedCourse.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 2: Notes */}
              {activeTab === 'notes' && (
                <div className="pt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-[var(--text-main)]">Student Module Notes (Markdown Supported)</h4>
                      <p className="text-xs text-[var(--text-muted)]">Notes persist into your institutional student record and portfolio.</p>
                    </div>
                    {noteStatus && (
                      <span className="text-xs font-semibold text-emerald-500 animate-pulse">{noteStatus}</span>
                    )}
                  </div>

                  <textarea
                    rows={6}
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="Write key equations, algorithm invariants, or lecture takeaways here (e.g. # Lecture Takeaways, - Key theorems)..."
                    className="w-full p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] text-sm text-[var(--text-main)] focus:outline-none focus:border-[#d97746] font-mono leading-relaxed resize-none"
                  />

                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveNotes}
                      disabled={savingNote}
                      className="px-5 py-2 rounded-xl bg-[#d97746] hover:bg-[#c26233] text-white text-xs font-semibold flex items-center gap-2 transition-all"
                    >
                      {savingNote ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
                      <span>Save Notes (+Activity Log)</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 3: Project Artifact Submission */}
              {activeTab === 'project' && (
                <div className="pt-4 space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-[var(--text-main)]">Submit Problem Set / Project Artifact</h4>
                    <p className="text-xs text-[var(--text-muted)]">
                      Link your GitHub repository or live deployment to prove verified practical implementation.
                    </p>
                  </div>

                  {projectStatus && (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-500">
                      {projectStatus}
                    </div>
                  )}

                  <form onSubmit={handleSubmitProject} className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">Artifact / Assignment Title</label>
                        <input
                          type="text"
                          required
                          value={projectTitle}
                          onChange={(e) => setProjectTitle(e.target.value)}
                          placeholder="e.g. PyTorch Skip-Gram Implementation"
                          className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-main)] focus:outline-none focus:border-[#d97746]"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">GitHub Repository URL</label>
                        <input
                          type="url"
                          required
                          value={projectRepo}
                          onChange={(e) => setProjectRepo(e.target.value)}
                          placeholder="https://github.com/..."
                          className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-main)] focus:outline-none focus:border-[#d97746]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">Live Demo / Colab Notebook URL (Optional)</label>
                      <input
                        type="url"
                        value={projectDemo}
                        onChange={(e) => setProjectDemo(e.target.value)}
                        placeholder="https://colab.research.google.com/..."
                        className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-main)] focus:outline-none focus:border-[#d97746]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">Implementation Notes</label>
                      <textarea
                        rows={2}
                        value={projectDesc}
                        onChange={(e) => setProjectDesc(e.target.value)}
                        placeholder="Brief summary of models trained, loss curves, or benchmarks achieved..."
                        className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-main)] focus:outline-none focus:border-[#d97746] resize-none"
                      />
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="submit"
                        disabled={submittingProject}
                        className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-md shadow-emerald-600/20"
                      >
                        {submittingProject ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                        <span>Submit Project Artifact</span>
                      </button>
                    </div>
                  </form>

                  {/* Existing Artifacts */}
                  {enrollment?.projectArtifacts && enrollment.projectArtifacts.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-[var(--border-color)]">
                      <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-3">
                        Submitted Artifacts ({enrollment.projectArtifacts.length})
                      </span>
                      <div className="space-y-2">
                        {enrollment.projectArtifacts.map((art, idx) => (
                          <div key={idx} className="p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] flex items-center justify-between">
                            <div>
                              <h5 className="text-xs font-bold text-[var(--text-main)]">{art.title}</h5>
                              <a 
                                href={art.repoUrl} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="text-[11px] text-[#d97746] hover:underline flex items-center gap-1 mt-0.5"
                              >
                                {art.repoUrl} <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                              Verified
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 4: Active AI Quiz */}
              {activeTab === 'quiz' && activeQuiz && (
                <div className="pt-4 space-y-6">
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <h4 className="text-sm font-bold text-[var(--text-main)]">{activeQuiz.title}</h4>
                    </div>
                    <p className="text-xs text-[var(--text-muted)] mt-1">{activeQuiz.description}</p>
                  </div>

                  {/* Question Renderers */}
                  <div className="space-y-6">
                    {activeQuiz.questions.map((q, idx) => (
                      <div key={q._id || idx} className="p-5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-[var(--border-color)] text-[var(--text-muted)] uppercase">
                            Question {idx + 1} • {q.type.toUpperCase()}
                          </span>
                          <span className="text-xs font-mono text-emerald-500">{q.points || 25} pts</span>
                        </div>

                        <p className="text-sm font-semibold text-[var(--text-main)] leading-relaxed">
                          {q.question}
                        </p>

                        {/* MCQ Options */}
                        {q.type === 'mcq' && q.options && (
                          <div className="space-y-2 pt-1">
                            {q.options.map((opt, oIdx) => (
                              <label
                                key={oIdx}
                                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                                  quizAnswers[q._id] === oIdx
                                    ? 'bg-[#d97746]/10 border-[#d97746] text-[var(--text-main)] font-semibold'
                                    : 'bg-[var(--card-bg)] border-[var(--border-color)] text-[var(--text-muted)] hover:border-gray-500'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`question_${q._id}`}
                                  checked={quizAnswers[q._id] === oIdx}
                                  onChange={() => setQuizAnswers({ ...quizAnswers, [q._id]: oIdx })}
                                  className="accent-[#d97746]"
                                />
                                <span className="text-xs">{opt}</span>
                              </label>
                            ))}
                          </div>
                        )}

                        {/* Conceptual Text Box */}
                        {q.type === 'conceptual' && (
                          <textarea
                            rows={4}
                            value={quizAnswers[q._id] || ''}
                            onChange={(e) => setQuizAnswers({ ...quizAnswers, [q._id]: e.target.value })}
                            placeholder="Provide your in-depth technical explanation here (graded by Gemini 2.5 Flash against syllabus rubric)..."
                            className="w-full p-3 rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)] text-xs text-[var(--text-main)] focus:outline-none focus:border-[#d97746] resize-none"
                          />
                        )}

                        {/* Coding Problem Box */}
                        {q.type === 'coding' && (
                          <div className="space-y-2">
                            <textarea
                              rows={5}
                              value={quizAnswers[q._id] || q.starterCode || ''}
                              onChange={(e) => setQuizAnswers({ ...quizAnswers, [q._id]: e.target.value })}
                              className="w-full p-3 rounded-xl bg-[#0e1013] border border-[#242833] text-xs text-emerald-400 font-mono focus:outline-none focus:border-[#d97746] resize-none"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Submit Button */}
                  {!quizResult ? (
                    <div className="flex justify-end">
                      <button
                        onClick={handleSubmitQuiz}
                        disabled={submittingQuiz}
                        className="px-6 py-2.5 rounded-xl bg-[#d97746] hover:bg-[#c26233] text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-md shadow-[#d97746]/20"
                      >
                        {submittingQuiz ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                        <span>Submit for Neural AI Grading</span>
                      </button>
                    </div>
                  ) : (
                    /* Quiz Result Scorecard */
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/30 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider block">
                            Grading Complete
                          </span>
                          <h4 className="text-xl font-black text-[var(--text-main)]">
                            Final Score: {quizResult.totalScore} / {quizResult.maxPossibleScore} ({quizResult.percentage}%)
                          </h4>
                        </div>
                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                          quizResult.passed 
                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' 
                            : 'bg-amber-500 text-white'
                        }`}>
                          {quizResult.passed ? 'PASSED & SKILL VERIFIED' : 'REVIEW & RETRY'}
                        </span>
                      </div>

                      <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                        {quizResult.overallFeedback}
                      </p>

                      {quizResult.verifiedSkillCredited && (
                        <div className="p-3 rounded-xl bg-[var(--card-bg)] border border-emerald-500/40 flex items-center gap-2 text-xs font-semibold text-emerald-400">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Credited to profile: Verified competency in <strong>{quizResult.verifiedSkillCredited}</strong></span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Structured Course Modules & Lectures */}
          <div className="space-y-4">
            <div className="rounded-3xl p-5 bg-[var(--card-bg)] border border-[var(--border-color)] shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-[var(--text-main)]">Course Syllabus</h3>
                <span className="text-xs font-mono text-[var(--text-muted)]">
                  {selectedCourse.modules?.length || 0} Modules
                </span>
              </div>

              <div className="space-y-4 max-h-[700px] overflow-y-auto pr-1 scrollbar-thin">
                {(selectedCourse.modules || []).map((mod, mIdx) => (
                  <div key={mod.moduleId || mIdx} className="rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] overflow-hidden">
                    {/* Module Title & AI Assessment Trigger */}
                    <div className="p-3.5 bg-[var(--card-bg)]/60 border-b border-[var(--border-color)] flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-[#d97746] uppercase tracking-wider block">
                          Module {mIdx + 1}
                        </span>
                        <h4 className="text-xs font-bold text-[var(--text-main)] mt-0.5 line-clamp-1">
                          {mod.title}
                        </h4>
                      </div>

                      <button
                        onClick={() => handleGenerateModuleQuiz(mod)}
                        disabled={generatingQuiz}
                        title="Generate on-demand assessment via Gemini Flash"
                        className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/30 text-[10px] font-semibold flex items-center gap-1 transition-all shrink-0"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>AI Quiz</span>
                      </button>
                    </div>

                    {/* Lectures List */}
                    <div className="divide-y divide-[var(--border-color)]">
                      {(mod.lectures || []).map((lec, lIdx) => {
                        const isCurrent = currentLecture?.lectureId === lec.lectureId || currentLecture?._id === lec._id;
                        const isDone = completedLectures.includes(lec.lectureId || lec._id);

                        return (
                          <div
                            key={lec.lectureId || lIdx}
                            onClick={() => setSelectedLecture(lec)}
                            className={`p-3 flex items-start justify-between gap-3 cursor-pointer transition-all ${
                              isCurrent
                                ? 'bg-[#d97746]/10 border-l-2 border-[#d97746]'
                                : 'hover:bg-[var(--card-bg)]/50'
                            }`}
                          >
                            <div className="flex items-start gap-2.5 min-w-0">
                              <div className="mt-0.5">
                                {isDone ? (
                                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                ) : (
                                  <Play className={`w-3.5 h-3.5 ${isCurrent ? 'text-[#d97746]' : 'text-[var(--text-muted)]'} shrink-0`} />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className={`text-xs font-medium leading-tight truncate ${isCurrent ? 'text-[#d97746] font-bold' : 'text-[var(--text-main)]'}`}>
                                  {lec.title}
                                </p>
                                <span className="text-[10px] text-[var(--text-muted)] block mt-0.5">
                                  {lec.duration || '1 hr 15 min'}
                                </span>
                              </div>
                            </div>
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
      </div>
    );
  }

  // Course Catalog Grid View
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="rounded-3xl p-8 bg-[var(--card-bg)] border border-[var(--border-color)] shadow-xl relative overflow-hidden">
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#d97746]/15 text-[#d97746] border border-[#d97746]/30">
              Curated Open Courseware Catalog
            </span>
            <span className="text-xs text-[var(--text-muted)]">25 Major University Courses</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--text-main)] tracking-tight">
            World-Class University Curriculums
          </h1>
          <p className="text-xs md:text-sm text-[var(--text-muted)] leading-relaxed">
            Directly stream verified lecture series from Stanford Online, MIT OpenCourseWare, Harvard CS50, and UC Berkeley. Self-enroll to track watch progress into your GitHub-style activity heatmap, attach problem set repositories, and generate on-demand AI assessments powered by Google Gemini Flash.
          </p>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, university, instructor, or skill (e.g. Stanford, PyTorch, C++)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[var(--card-bg)] border border-[var(--border-color)] text-xs md:text-sm text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[#d97746]"
          />
        </div>

        {/* Institution Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {universities.map((univ) => (
            <button
              key={univ}
              onClick={() => setSelectedUniversity(univ)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedUniversity === univ
                  ? 'bg-[#d97746] text-white shadow-sm'
                  : 'bg-[var(--card-bg)] text-[var(--text-muted)] border border-[var(--border-color)] hover:border-gray-500'
              }`}
            >
              {univ}
            </button>
          ))}
        </div>
      </div>

      {/* Categories Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin text-xs">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-[var(--text-main)] text-[var(--bg-main)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Courses Catalog Grid */}
      {loading ? (
        <div className="p-16 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#d97746] mx-auto mb-2" />
          <p className="text-xs text-[var(--text-muted)]">Loading premier university open courses...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course._id}
              onClick={() => setSelectedCourse(course)}
              className="rounded-3xl bg-[var(--card-bg)] border border-[var(--border-color)] hover:border-[#d97746]/60 transition-all cursor-pointer group flex flex-col overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-1"
            >
              {/* Thumbnail Container */}
              <div className="aspect-video w-full overflow-hidden bg-black/40 relative">
                <img
                  src={course.thumbnailUrl || course.thumbnail || 'https://images.unsplash.com/photo-1516116211227-bbc04f141446?w=800&auto=format&fit=crop&q=80'}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                  <span className="font-bold px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm border border-white/10">
                    {course.code}
                  </span>
                  <span className="flex items-center gap-1 font-mono text-[11px] bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm">
                    <Clock className="w-3 h-3 text-[#d97746]" />
                    {course.durationHours || 36}h
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-[#d97746] uppercase tracking-wide">
                      {course.university || course.provider}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-muted)] font-medium">
                      {course.difficulty}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-[var(--text-main)] mt-1.5 group-hover:text-[#d97746] transition-colors line-clamp-2">
                    {course.title}
                  </h3>

                  <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>
                </div>

                <div className="space-y-3 pt-2 border-t border-[var(--border-color)]/60">
                  <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                    <span>Instructor: <strong className="text-[var(--text-main)]">{course.instructor}</strong></span>
                    <span className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star className="w-3 h-3 fill-amber-500" />
                      {course.rating || 4.9}
                    </span>
                  </div>

                  {/* Skills Pills */}
                  <div className="flex flex-wrap gap-1">
                    {(course.skillsCovered || []).slice(0, 3).map((sk, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-[var(--bg-main)] text-[var(--text-muted)] border border-[var(--border-color)]"
                      >
                        {sk}
                      </span>
                    ))}
                    {(course.skillsCovered || []).length > 3 && (
                      <span className="text-[10px] text-[var(--text-muted)] self-center">
                        +{(course.skillsCovered || []).length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
