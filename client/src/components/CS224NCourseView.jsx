import React, { useState } from 'react';
import { 
  BookOpen, 
  Play, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  Award, 
  GraduationCap, 
  Layers, 
  FileText, 
  Code, 
  Sparkles,
  ChevronRight,
  ChevronDown,
  Star,
  Users,
  Compass
} from 'lucide-react';
import { CS224N_COURSE } from '../data/cs224nCourse';
import { VideoModal } from './VideoModal';

export const CS224NCourseView = ({ setActiveTab }) => {
  const [selectedModuleId, setSelectedModuleId] = useState('mod-1');
  const [selectedLecture, setSelectedLecture] = useState(CS224N_COURSE.modules[0].lectures[0]);
  const [activeVideo, setActiveVideo] = useState(null);
  const [completedLectures, setCompletedLectures] = useState(() => {
    try {
      const saved = localStorage.getItem('cs224n_completed');
      return saved ? JSON.parse(saved) : ['cs224n-lec-01'];
    } catch {
      return ['cs224n-lec-01'];
    }
  });

  const toggleCompleteLecture = (lectureId) => {
    setCompletedLectures(prev => {
      const next = prev.includes(lectureId)
        ? prev.filter(id => id !== lectureId)
        : [...prev, lectureId];
      localStorage.setItem('cs224n_completed', JSON.stringify(next));
      return next;
    });
  };

  const handleWatchLecture = (lecture) => {
    setActiveVideo({
      title: lecture.title,
      source: `Stanford CS224N (Lecture ${lecture.lectureNum})`,
      videoId: lecture.videoId,
      youtubeUrl: lecture.youtubeUrl,
      duration: lecture.duration,
      module: `Module: ${lecture.topics?.[0] || 'Deep Learning for NLP'}`,
      description: lecture.summary,
      topics: lecture.topics
    });
  };

  const currentModule = CS224N_COURSE.modules.find(m => m.id === selectedModuleId) || CS224N_COURSE.modules[0];
  const progressPercent = Math.round((completedLectures.length / CS224N_COURSE.totalLectures) * 100);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Video Modal Player */}
      {activeVideo && (
        <VideoModal video={activeVideo} onClose={() => setActiveVideo(null)} />
      )}

      {/* Stanford CS224N Course Hero Banner */}
      <div className="app-card p-6 md:p-8 border border-[#d97746]/25 bg-gradient-to-br from-[#161921] via-[#14171e] to-[#1a1816] relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#d97746]/20 border border-[#d97746]/40 text-[#d97746] text-xs font-mono font-bold uppercase tracking-wider">
                {CS224N_COURSE.code} • Stanford University
              </span>
              <span className="text-xs text-[#8c96a7] font-mono">
                {CS224N_COURSE.instructors.join(' & ')}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {CS224N_COURSE.title}
            </h1>

            <p className="text-xs sm:text-sm text-[#cbd2e0] leading-relaxed">
              {CS224N_COURSE.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-[#8c96a7] pt-2">
              <span className="flex items-center gap-1.5 font-mono">
                <Clock size={14} className="text-[#d97746]" /> {CS224N_COURSE.totalHours}
              </span>
              <span className="flex items-center gap-1.5 font-mono">
                <Layers size={14} className="text-[#9ed68c]" /> {CS224N_COURSE.modules.length} Core Modules
              </span>
              <span className="flex items-center gap-1.5 font-mono">
                <Star size={14} className="text-[#f3c46e]" fill="currentColor" /> {CS224N_COURSE.rating} / 5.0
              </span>
            </div>
          </div>

          {/* Course Progress Card */}
          <div className="p-5 rounded-2xl bg-[#0e1014] border border-white/5 space-y-3 w-full lg:w-72 shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-[#8c96a7]">Your Syllabus Progress</span>
              <span className="text-sm font-mono font-bold text-[#9ed68c]">{progressPercent}%</span>
            </div>

            <div className="w-full h-2 bg-[#1f242e] rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#d97746] to-[#9ed68c] transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#697284] font-mono">
              <span>{completedLectures.length} of {CS224N_COURSE.totalLectures} lectures done</span>
              <span>{CS224N_COURSE.difficulty}</span>
            </div>

            <button
              onClick={() => handleWatchLecture(selectedLecture)}
              className="w-full py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 shadow"
            >
              <Play size={13} fill="currentColor" /> Resume Lecture {selectedLecture.lectureNum}
            </button>
          </div>
        </div>
      </div>

      {/* Module Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CS224N_COURSE.modules.map((mod) => {
          const isSelected = selectedModuleId === mod.id;
          const completedCount = mod.lectures.filter(l => completedLectures.includes(l.id)).length;
          return (
            <button
              key={mod.id}
              onClick={() => {
                setSelectedModuleId(mod.id);
                setSelectedLecture(mod.lectures[0]);
              }}
              className={`px-4 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all border flex items-center gap-2 ${
                isSelected
                  ? 'bg-white text-black border-white shadow-md'
                  : 'bg-[#15181e] text-[#8e98aa] border-white/5 hover:border-white/20 hover:text-white'
              }`}
            >
              <span>{mod.number}: {mod.shortTitle}</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                isSelected ? 'bg-black/10 text-black' : 'bg-[#1f242e] text-[#cbd2e0]'
              }`}>
                {completedCount}/{mod.lectures.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Syllabus Workspace: Lecture List (Left 5 cols) vs Lecture Details & Player (Right 7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Lecture Navigator (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="px-2 py-1 flex items-center justify-between text-xs">
            <span className="font-bold text-white uppercase tracking-wider text-[11px]">
              {currentModule.title}
            </span>
            <span className="text-[#6d7788] font-mono text-[11px]">{currentModule.duration}</span>
          </div>

          <div className="space-y-2.5">
            {currentModule.lectures.map((lec) => {
              const isSelected = selectedLecture.id === lec.id;
              const isCompleted = completedLectures.includes(lec.id);

              return (
                <div
                  key={lec.id}
                  onClick={() => setSelectedLecture(lec)}
                  className={`app-card p-4 sm:p-5 cursor-pointer transition-all border space-y-3 ${
                    isSelected
                      ? 'border-[#d97746] bg-[#1a1e26] shadow-lg shadow-[#d97746]/5'
                      : 'hover:border-white/20 bg-[#14171d]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-[#d97746] uppercase">
                          Lecture {lec.lectureNum}
                        </span>
                        <span className="text-[10px] text-[#6e7787] font-mono">• {lec.duration}</span>
                      </div>
                      <h4 className="text-sm font-bold text-white line-clamp-1">{lec.title}</h4>
                      <p className="text-xs text-[#8c96a7] line-clamp-2">{lec.summary}</p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCompleteLecture(lec.id);
                      }}
                      title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
                      className={`p-1.5 rounded-xl border transition-colors shrink-0 ${
                        isCompleted
                          ? 'bg-[#1b271d] border-[#2e5233] text-[#9ed68c]'
                          : 'bg-[#181c24] border-white/5 text-[#5e6676] hover:text-white'
                      }`}
                    >
                      <CheckCircle2 size={16} />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/5">
                    {lec.topics.slice(0, 3).map((topic, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-[#1f242e] text-[#cbd2e0]">
                        {topic}
                      </span>
                    ))}
                    {lec.topics.length > 3 && (
                      <span className="text-[10px] px-1.5 py-0.5 text-[#5f6878]">
                        +{lec.topics.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Lecture Comprehensive Deep-Dive & Player (7 cols) */}
        <div className="lg:col-span-7">
          <div className="app-card p-6 md:p-8 space-y-6 sticky top-24">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-[#d97746] font-bold uppercase tracking-wider">
                    Stanford CS224N • Lecture {selectedLecture.lectureNum}
                  </span>
                  <span className="text-xs text-[#6e7787] font-mono">• {selectedLecture.duration}</span>
                </div>
                <h2 className="text-2xl font-bold text-white mt-1">{selectedLecture.title}</h2>
                <p className="text-xs text-[#8c96a7] mt-0.5">
                  Instructor: <span className="text-white font-medium">{selectedLecture.instructor}</span>
                </p>
              </div>

              <button
                onClick={() => handleWatchLecture(selectedLecture)}
                className="px-5 py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 shadow"
              >
                <Play size={13} fill="currentColor" /> Watch Lecture
              </button>
            </div>

            {/* Lecture Summary */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#7e8798]">Lecture Synopsis</h4>
              <p className="text-sm text-[#cbd2e0] leading-relaxed">
                {selectedLecture.summary}
              </p>
            </div>

            {/* Key Topics Explored */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#7e8798]">Key Topics & Core Concepts</h4>
              <div className="flex flex-wrap gap-2">
                {selectedLecture.topics.map((topic, idx) => (
                  <span 
                    key={idx}
                    className="px-3 py-1 rounded-xl bg-[#1b1f27] border border-[#2b313e] text-xs font-medium text-[#d1d7e2]"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            {/* Assignments & Hands-on Coding Labs */}
            {selectedLecture.assignments && (
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#7e8798] flex items-center gap-1.5">
                  <Code size={14} className="text-[#9ed68c]" /> Hands-on PyTorch Labs & Problem Sets
                </h4>
                <div className="space-y-2">
                  {selectedLecture.assignments.map((ass, i) => (
                    <div key={i} className="p-3 rounded-xl bg-[#111317] border border-[#1f242e] text-xs text-white flex items-center justify-between">
                      <span>{ass}</span>
                      <span className="text-[10px] font-mono text-[#9ed68c]">CS224N Core</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Readings */}
            {selectedLecture.readings && (
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#7e8798] flex items-center gap-1.5">
                  <BookOpen size={14} className="text-[#f3c46e]" /> Foundational Research Papers & Readings
                </h4>
                <div className="space-y-1.5">
                  {selectedLecture.readings.map((paper, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-[#111317] border border-[#1f242e] text-xs text-[#a0a9b8] flex items-center justify-between font-mono text-[11px]">
                      <span>📄 {paper}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action footer */}
            <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <a
                href={selectedLecture.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#8c96a7] hover:text-white flex items-center gap-1.5"
              >
                <ExternalLink size={13} /> View on Official Stanford Online YouTube
              </a>

              <button
                onClick={() => toggleCompleteLecture(selectedLecture.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-colors ${
                  completedLectures.includes(selectedLecture.id)
                    ? 'bg-[#1b271d] border-[#2e5233] text-[#9ed68c]'
                    : 'bg-[#1c202a] border-white/10 text-white hover:bg-[#252b38]'
                }`}
              >
                <CheckCircle2 size={13} />
                {completedLectures.includes(selectedLecture.id) ? 'Completed' : 'Mark as Completed'}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
