import React, { useState, useEffect, useRef } from 'react';
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
  Paperclip,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  X,
  Compass,
  Layers
} from 'lucide-react';

export function LearnView({ user, token, onActivityLogged }) {
  const [courses, setCourses] = useState([]);
  const [myEnrollments, setMyEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [enrollment, setEnrollment] = useState(null);

  // Main Learn Portal Sub-tab: 'learning' (Active courses) vs 'explore' (Catalog)
  const [portalMode, setPortalMode] = useState('learning'); // 'learning' | 'explore'
  const [courseTab, setCourseTab] = useState('lectures'); // 'lectures', 'notes', 'project', 'quiz'

  // Filtering & search
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedUniversity, setSelectedUniversity] = useState('All');

  // Notes & File Upload state
  const [noteContent, setNoteContent] = useState('');
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [savingNote, setSavingNote] = useState(false);
  const [noteStatus, setNoteStatus] = useState('');
  const fileInputRef = useRef(null);

  // Project Artifact state
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

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [coursesRes, enrollRes] = await Promise.all([
        fetch('/api/courses'),
        token ? fetch('/api/enrollment/my', { headers: { Authorization: `Bearer ${token}` } }) : Promise.resolve(null)
      ]);

      if (coursesRes.ok) {
        const cData = await coursesRes.json();
        setCourses(cData.courses || cData || []);
      }

      if (enrollRes && enrollRes.ok) {
        const eData = await enrollRes.json();
        setMyEnrollments(eData || []);
        // If student has no enrollments yet, default to explore mode
        if (!eData || eData.length === 0) {
          setPortalMode('explore');
        }
      }
    } catch (err) {
      console.error('Error loading courses:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch individual enrollment when course is selected
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
    } catch (err) {
      console.error('Error fetching enrollment:', err);
    }
  };

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
        fetchData();
        if (onActivityLogged) onActivityLogged();
      }
    } catch (err) {
      console.error('Error enrolling:', err);
    }
  };

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
        fetchData();
        if (onActivityLogged) onActivityLogged();
      }
    } catch (err) {
      console.error('Error saving progress:', err);
    }
  };

  // Handle Note File Upload
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const newFileObj = {
          fileName: file.name,
          fileSize: `${(file.size / 1024).toFixed(1)} KB`,
          fileType: file.type || 'document',
          fileData: reader.result,
          uploadedAt: new Date()
        };
        setAttachedFiles(prev => [...prev, newFileObj]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAttachedFile = (index) => {
    setAttachedFiles(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSaveNotes = async () => {
    if (!selectedCourse || (!noteContent && attachedFiles.length === 0)) return;
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
          content: noteContent,
          attachedFiles
        })
      });
      if (res.ok) {
        setNoteStatus('Notes & files saved successfully!');
        setTimeout(() => setNoteStatus(''), 3000);
        if (onActivityLogged) onActivityLogged();
      }
    } catch (err) {
      console.error('Error saving notes:', err);
    } finally {
      setSavingNote(false);
    }
  };

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
        setProjectStatus('Project artifact attached to institutional student record!');
        setTimeout(() => setProjectStatus(''), 4000);
        if (onActivityLogged) onActivityLogged();
      }
    } catch (err) {
      console.error('Error submitting project:', err);
    } finally {
      setSubmittingProject(false);
    }
  };

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
        setCourseTab('quiz');
      }
    } catch (err) {
      console.error('Error generating quiz:', err);
    } finally {
      setGeneratingQuiz(false);
    }
  };

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
    const currentLecture = selectedLecture || selectedCourse.modules?.[0]?.lectures?.[0];

    return (
      <div className="space-y-5 animate-fadeIn pb-12">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => { setSelectedCourse(null); setSelectedLecture(null); }}
            className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Learn</span>
          </button>

          {!isEnrolled ? (
            <button
              onClick={() => handleEnroll(selectedCourse._id)}
              className="px-4 py-2 rounded-xl bg-[#d97746] hover:bg-[#c26233] text-white text-xs font-semibold transition-all shadow-sm flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Enroll in Course</span>
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-[var(--text-muted)]">Course Completion:</span>
              <div className="w-28 bg-[var(--border-color)] h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-[#d97746] to-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs font-bold text-emerald-500 font-mono">{progress}%</span>
            </div>
          )}
        </div>

        {/* Minimal Course Header Banner */}
        <div className="p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--border-color)] space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#d97746]/10 text-[#d97746] border border-[#d97746]/20">
              {selectedCourse.university || selectedCourse.provider}
            </span>
            <span className="text-xs font-mono text-[var(--text-muted)]">{selectedCourse.code}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400">
              {selectedCourse.difficulty}
            </span>
          </div>

          <h1 className="text-lg md:text-xl font-bold text-[var(--text-main)]">
            {selectedCourse.title}
          </h1>

          <p className="text-xs text-[var(--text-muted)] max-w-4xl leading-relaxed">
            {selectedCourse.description}
          </p>

          <div className="flex items-center gap-4 text-xs text-[var(--text-muted)] pt-1 flex-wrap">
            <span>Instructor: <strong className="text-[var(--text-main)]">{selectedCourse.instructor}</strong></span>
            <span>Duration: <strong>{selectedCourse.durationHours || 36}h</strong></span>
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
              {selectedCourse.rating || 4.9}
            </span>
          </div>
        </div>

        {/* Video Player & Syllabus Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Main Video & Module Tabs (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Embedded YouTube Player */}
            <div className="rounded-2xl overflow-hidden bg-black aspect-video border border-[var(--border-color)] shadow-xl relative">
              {currentLecture ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${currentLecture.youtubeVideoId}?autoplay=0&enablejsapi=1&rel=0&modestbranding=1`}
                  title={currentLecture.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-[var(--text-muted)]">
                  Select a lecture from the right syllabus to start streaming
                </div>
              )}
            </div>

            {/* Lecture Bar & Status */}
            {currentLecture && (
              <div className="p-3.5 rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)] flex items-center justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <h3 className="font-semibold text-xs text-[var(--text-main)] truncate">{currentLecture.title}</h3>
                  <p className="text-[11px] text-[var(--text-muted)]">{currentLecture.summary || 'University open lecture'}</p>
                </div>

                <button
                  onClick={() => handleLectureProgress(currentLecture.lectureId || currentLecture._id, true)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    completedLectures.includes(currentLecture.lectureId || currentLecture._id)
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                      : 'bg-[#d97746] hover:bg-[#c26233] text-white'
                  }`}
                >
                  <CheckCircle className="w-3 h-3" />
                  <span>
                    {completedLectures.includes(currentLecture.lectureId || currentLecture._id)
                      ? 'Watched'
                      : 'Mark Watched'}
                  </span>
                </button>
              </div>
            )}

            {/* Tabs (Notes + File Uploads, Projects, AI Quiz) */}
            <div className="rounded-2xl p-5 bg-[var(--card-bg)] border border-[var(--border-color)] space-y-4">
              <div className="flex border-b border-[var(--border-color)] pb-2.5 gap-5 text-xs font-semibold">
                <button
                  onClick={() => setCourseTab('lectures')}
                  className={`pb-1 transition-all ${courseTab === 'lectures' ? 'text-[#d97746] border-b-2 border-[#d97746]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                >
                  Syllabus Overview
                </button>
                <button
                  onClick={() => setCourseTab('notes')}
                  className={`pb-1 transition-all flex items-center gap-1.5 ${courseTab === 'notes' ? 'text-[#d97746] border-b-2 border-[#d97746]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Notes & Attachments ({attachedFiles.length})</span>
                </button>
                <button
                  onClick={() => setCourseTab('project')}
                  className={`pb-1 transition-all flex items-center gap-1.5 ${courseTab === 'project' ? 'text-[#d97746] border-b-2 border-[#d97746]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Submit Artifact</span>
                </button>
                {activeQuiz && (
                  <button
                    onClick={() => setCourseTab('quiz')}
                    className={`pb-1 transition-all flex items-center gap-1.5 ${courseTab === 'quiz' ? 'text-[#d97746] border-b-2 border-[#d97746]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>AI Module Quiz</span>
                  </button>
                )}
              </div>

              {/* Tab 1: Overview */}
              {courseTab === 'lectures' && (
                <div className="text-xs text-[var(--text-muted)] space-y-2 leading-relaxed">
                  <p>
                    All lectures and problem sets are archived directly from verified university channels ({selectedCourse.university}). Video progress updates dynamically stream into your GitHub activity heatmap and qualification profile.
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {(selectedCourse.skillsCovered || []).map((sk, idx) => (
                      <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-main)]">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 2: Notes & File Uploads */}
              {courseTab === 'notes' && (
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[var(--text-main)]">Student Notes & Solution PDFs</span>
                    {noteStatus && <span className="text-[11px] text-emerald-500 font-semibold">{noteStatus}</span>}
                  </div>

                  <textarea
                    rows={5}
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="Type key formulas, lecture invariants, or algorithmic proofs..."
                    className="w-full p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-main)] focus:outline-none focus:border-[#d97746] font-mono resize-none leading-relaxed"
                  />

                  {/* Attached Files List */}
                  {attachedFiles.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">Attached Documents</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {attachedFiles.map((file, idx) => (
                          <div key={idx} className="p-2 rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] flex items-center justify-between text-[11px]">
                            <div className="flex items-center gap-1.5 truncate">
                              <FileSpreadsheet className="w-3.5 h-3.5 text-[#d97746] shrink-0" />
                              <span className="truncate">{file.fileName}</span>
                              <span className="text-[10px] text-[var(--text-muted)] font-mono">({file.fileSize})</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeAttachedFile(idx)}
                              className="text-[var(--text-muted)] hover:text-rose-400 p-0.5"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    {/* Hidden file input */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      multiple
                      className="hidden"
                      accept=".pdf,.png,.jpg,.jpeg,.py,.ipynb,.txt,.zip"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg bg-[var(--bg-main)] hover:bg-[var(--border-color)] border border-[var(--border-color)] text-xs text-[var(--text-main)] flex items-center gap-1.5 transition-colors"
                    >
                      <Paperclip className="w-3 h-3 text-[#d97746]" />
                      <span>Upload Notes / Solution PDF</span>
                    </button>

                    <button
                      onClick={handleSaveNotes}
                      disabled={savingNote}
                      className="px-4 py-1.5 rounded-lg bg-[#d97746] hover:bg-[#c26233] text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
                    >
                      {savingNote ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileText className="w-3 h-3" />}
                      <span>Save Notes (+Activity Log)</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 3: Artifact Submission */}
              {courseTab === 'project' && (
                <form onSubmit={handleSubmitProject} className="space-y-3 text-xs">
                  {projectStatus && (
                    <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-semibold">
                      {projectStatus}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-[var(--text-muted)] block mb-1">Project / Artifact Title</label>
                      <input
                        type="text"
                        required
                        value={projectTitle}
                        onChange={(e) => setProjectTitle(e.target.value)}
                        placeholder="e.g. PyTorch Skip-Gram Model"
                        className="w-full px-3 py-1.5 rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-main)] focus:outline-none focus:border-[#d97746]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-[var(--text-muted)] block mb-1">GitHub Repo URL</label>
                      <input
                        type="url"
                        required
                        value={projectRepo}
                        onChange={(e) => setProjectRepo(e.target.value)}
                        placeholder="https://github.com/..."
                        className="w-full px-3 py-1.5 rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-main)] focus:outline-none focus:border-[#d97746]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-[var(--text-muted)] block mb-1">Notes / Benchmarks Achieved</label>
                    <textarea
                      rows={2}
                      value={projectDesc}
                      onChange={(e) => setProjectDesc(e.target.value)}
                      placeholder="Brief implementation summary..."
                      className="w-full px-3 py-1.5 rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-main)] focus:outline-none focus:border-[#d97746] resize-none"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={submittingProject}
                      className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1.5 shadow-sm"
                    >
                      {submittingProject ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                      <span>Attach Artifact</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Tab 4: AI Quiz */}
              {courseTab === 'quiz' && activeQuiz && (
                <div className="space-y-4 text-xs">
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <span className="font-bold text-amber-500 block">{activeQuiz.title}</span>
                    <span className="text-[11px] text-[var(--text-muted)]">{activeQuiz.description}</span>
                  </div>

                  <div className="space-y-4">
                    {activeQuiz.questions.map((q, idx) => (
                      <div key={q._id || idx} className="p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold uppercase text-[var(--text-muted)]">Q{idx + 1} • {q.type}</span>
                          <span className="font-mono text-emerald-500">{q.points || 25} pts</span>
                        </div>
                        <p className="font-semibold text-[var(--text-main)] leading-relaxed">{q.question}</p>

                        {q.type === 'mcq' && q.options && (
                          <div className="space-y-1.5 pt-1">
                            {q.options.map((opt, oIdx) => (
                              <label
                                key={oIdx}
                                className={`flex items-center gap-2.5 p-2 rounded-lg border cursor-pointer text-xs transition-all ${
                                  quizAnswers[q._id] === oIdx
                                    ? 'bg-[#d97746]/10 border-[#d97746] text-[var(--text-main)] font-semibold'
                                    : 'bg-[var(--card-bg)] border-[var(--border-color)] text-[var(--text-muted)]'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`question_${q._id}`}
                                  checked={quizAnswers[q._id] === oIdx}
                                  onChange={() => setQuizAnswers({ ...quizAnswers, [q._id]: oIdx })}
                                  className="accent-[#d97746]"
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
                            onChange={(e) => setQuizAnswers({ ...quizAnswers, [q._id]: e.target.value })}
                            placeholder="Detail your conceptual reasoning..."
                            className="w-full p-2.5 rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)] text-xs text-[var(--text-main)] focus:outline-none focus:border-[#d97746] resize-none"
                          />
                        )}

                        {q.type === 'coding' && (
                          <textarea
                            rows={4}
                            value={quizAnswers[q._id] || q.starterCode || ''}
                            onChange={(e) => setQuizAnswers({ ...quizAnswers, [q._id]: e.target.value })}
                            className="w-full p-2.5 rounded-lg bg-[#0e1013] border border-[#242833] text-xs font-mono text-emerald-400 focus:outline-none resize-none"
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
                        className="px-4 py-2 rounded-xl bg-[#d97746] hover:bg-[#c26233] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                      >
                        {submittingQuiz ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                        <span>Submit for Neural Grading</span>
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-[var(--text-main)]">
                          Score: {quizResult.totalScore} / {quizResult.maxPossibleScore} ({quizResult.percentage}%)
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          quizResult.passed ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                        }`}>
                          {quizResult.passed ? 'PASSED & SKILL VERIFIED' : 'NEEDS RETRY'}
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">{quizResult.overallFeedback}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Structured Syllabus Accordion (4 cols) */}
          <div className="lg:col-span-4 rounded-2xl p-4 bg-[var(--card-bg)] border border-[var(--border-color)] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border-color)]">
              <span className="text-xs font-bold text-[var(--text-main)]">Course Syllabus</span>
              <span className="text-[10px] font-mono text-[var(--text-muted)]">{selectedCourse.modules?.length || 0} Modules</span>
            </div>

            <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1 scrollbar-thin">
              {(selectedCourse.modules || []).map((mod, mIdx) => (
                <div key={mod.moduleId || mIdx} className="rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] overflow-hidden">
                  <div className="p-2.5 bg-[var(--card-bg)]/80 border-b border-[var(--border-color)] flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-[9px] font-bold text-[#d97746] uppercase block">Module {mIdx + 1}</span>
                      <h4 className="text-xs font-bold text-[var(--text-main)] truncate mt-0.5">{mod.title}</h4>
                    </div>
                    <button
                      onClick={() => handleGenerateModuleQuiz(mod)}
                      disabled={generatingQuiz}
                      title="Generate dynamic AI quiz"
                      className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/30 text-[9px] font-bold flex items-center gap-1 shrink-0 hover:bg-amber-500/20"
                    >
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>Quiz</span>
                    </button>
                  </div>

                  <div className="divide-y divide-[var(--border-color)] text-xs">
                    {(mod.lectures || []).map((lec, lIdx) => {
                      const isCurrent = currentLecture?.lectureId === lec.lectureId || currentLecture?._id === lec._id;
                      const isDone = completedLectures.includes(lec.lectureId || lec._id);

                      return (
                        <div
                          key={lec.lectureId || lIdx}
                          onClick={() => setSelectedLecture(lec)}
                          className={`p-2.5 flex items-start justify-between gap-2 cursor-pointer transition-colors ${
                            isCurrent ? 'bg-[#d97746]/10 border-l-2 border-[#d97746]' : 'hover:bg-[var(--card-bg)]/40'
                          }`}
                        >
                          <div className="flex items-start gap-2 min-w-0">
                            {isDone ? (
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            ) : (
                              <Play className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${isCurrent ? 'text-[#d97746]' : 'text-[var(--text-muted)]'}`} />
                            )}
                            <div className="min-w-0">
                              <p className={`text-[11px] leading-tight truncate ${isCurrent ? 'text-[#d97746] font-bold' : 'text-[var(--text-main)]'}`}>
                                {lec.title}
                              </p>
                              <span className="text-[9px] text-[var(--text-muted)] block mt-0.5">{lec.duration || '1 hr 15 min'}</span>
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
    );
  }

  // Learn Portal Hub with Modes: 'learning' vs 'explore'
  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner - Modular & Downsized Typography */}
      <div className="p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--border-color)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#d97746]/10 text-[#d97746] border border-[#d97746]/20">
              Curated Open Courseware
            </span>
            <span className="text-xs text-[var(--text-muted)] font-mono">{courses.length} University Courses</span>
          </div>
          <h1 className="text-base font-bold text-[var(--text-main)] mt-1">
            University Curriculums & Deep Learning Laboratories
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5 max-w-2xl">
            Stream verified university video lectures from Stanford, MIT, Harvard, and UC Berkeley. Self-enroll, sync watch time to your GitHub activity heatmap, attach problem set code, and trigger on-demand Gemini Flash evaluations.
          </p>
        </div>

        {/* Portal Mode Switcher */}
        <div className="flex items-center p-1 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] shrink-0 text-xs">
          <button
            onClick={() => setPortalMode('learning')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
              portalMode === 'learning'
                ? 'bg-[#d97746] text-white shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>My Learning ({myEnrollments.length})</span>
          </button>
          <button
            onClick={() => setPortalMode('explore')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
              portalMode === 'explore'
                ? 'bg-[#d97746] text-white shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Explore Courses ({courses.length})</span>
          </button>
        </div>
      </div>

      {/* Mode 1: Active Learning (Enrolled courses with progress & resume) */}
      {portalMode === 'learning' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-main)]">Active University Enrollments</span>
            <button
              onClick={() => setPortalMode('explore')}
              className="text-xs text-[#d97746] hover:underline flex items-center gap-1"
            >
              Browse Full Catalog &rarr;
            </button>
          </div>

          {myEnrollments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myEnrollments.map((enr) => (
                <div
                  key={enr._id}
                  onClick={() => setSelectedCourse(enr.course)}
                  className="p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--border-color)] hover:border-[#d97746]/50 transition-all cursor-pointer group space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#d97746]/10 text-[#d97746]">
                          {enr.course?.university || 'Stanford Online'}
                        </span>
                        <span className="text-xs font-mono text-[var(--text-muted)]">{enr.course?.code}</span>
                      </div>
                      <h3 className="font-bold text-sm text-[var(--text-main)] mt-1 group-hover:text-[#d97746] transition-colors">
                        {enr.course?.title}
                      </h3>
                      <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                        {enr.course?.instructor}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-base font-black text-emerald-500 font-mono">{enr.progress || 0}%</span>
                      <span className="text-[9px] text-[var(--text-muted)] block uppercase">progress</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-[var(--bg-main)] h-1.5 rounded-full overflow-hidden border border-[var(--border-color)]">
                    <div
                      className="bg-gradient-to-r from-[#d97746] to-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${enr.progress || 0}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] pt-1 border-t border-[var(--border-color)]/60">
                    <span>{enr.completedLectures?.length || 0} lectures completed</span>
                    <span className="text-[#d97746] font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      Resume Video &rarr;
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center rounded-2xl bg-[var(--card-bg)] border border-[var(--border-color)] space-y-2">
              <BookOpen className="w-8 h-8 text-[var(--text-muted)] mx-auto opacity-40" />
              <p className="text-xs font-semibold text-[var(--text-main)]">No Active Courses Enrolled Yet</p>
              <p className="text-[11px] text-[var(--text-muted)] max-w-sm mx-auto">
                Explore the 25 university courses below and click &quot;Enroll&quot; to begin tracking your video progress.
              </p>
              <button
                onClick={() => setPortalMode('explore')}
                className="mt-2 px-4 py-1.5 rounded-xl bg-[#d97746] text-white text-xs font-semibold hover:bg-[#c26233]"
              >
                Browse Explore Catalog
              </button>
            </div>
          )}
        </div>
      )}

      {/* Mode 2: Explore Catalog */}
      {(portalMode === 'explore' || myEnrollments.length === 0) && (
        <div className="space-y-4">
          {/* Search & Filter Controls */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, university, instructor, or skill..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)] text-xs text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[#d97746]"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin text-xs">
              {universities.map((univ) => (
                <button
                  key={univ}
                  onClick={() => setSelectedUniversity(univ)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all ${
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
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2 py-0.5 rounded-md text-[11px] font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-[var(--text-main)] text-[var(--bg-main)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Course Cards Grid */}
          {loading ? (
            <div className="p-12 text-center text-xs text-[var(--text-muted)]">
              <Loader2 className="w-6 h-6 animate-spin text-[#d97746] mx-auto mb-2" />
              <span>Loading 25 university curriculums...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCourses.map((course) => (
                <div
                  key={course._id}
                  onClick={() => setSelectedCourse(course)}
                  className="rounded-2xl bg-[var(--card-bg)] border border-[var(--border-color)] hover:border-[#d97746]/60 transition-all cursor-pointer group flex flex-col overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5"
                >
                  {/* Thumbnail */}
                  <div className="aspect-video w-full overflow-hidden bg-black/40 relative">
                    <img
                      src={course.thumbnailUrl || course.thumbnail || 'https://images.unsplash.com/photo-1516116211227-bbc04f141446?w=800&auto=format&fit=crop&q=80'}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-white text-[10px]">
                      <span className="font-bold px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm border border-white/10">
                        {course.code}
                      </span>
                      <span className="flex items-center gap-1 font-mono bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-sm">
                        <Clock className="w-3 h-3 text-[#d97746]" />
                        {course.durationHours || 36}h
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold text-[#d97746] uppercase">
                          {course.university || course.provider}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-muted)]">
                          {course.difficulty}
                        </span>
                      </div>

                      <h3 className="font-bold text-xs text-[var(--text-main)] mt-1 group-hover:text-[#d97746] transition-colors line-clamp-2">
                        {course.title}
                      </h3>

                      <p className="text-[11px] text-[var(--text-muted)] mt-0.5 line-clamp-2 leading-relaxed">
                        {course.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[var(--border-color)]/60 flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                      <span>{course.instructor}</span>
                      <span className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star className="w-3 h-3 fill-amber-500" />
                        {course.rating || 4.9}
                      </span>
                    </div>
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
