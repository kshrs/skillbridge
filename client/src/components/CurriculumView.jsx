import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  Sparkles, 
  BookOpen, 
  Clock, 
  Star, 
  ExternalLink, 
  CheckCircle2, 
  ArrowRight,
  Filter
} from 'lucide-react';
import { TokenBarChart, EmbeddingsScatterChart, AttentionArcChart } from './DataVisualizations';

export const CurriculumView = ({ token, skillGap, user }) => {
  const [courses, setCourses] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [filterSkill, setFilterSkill] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
    if (token) fetchRecommendations();
  }, [token]);

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/courses');
      const data = await res.json();
      if (data.success) {
        setCourses(data.courses);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const res = await fetch('/api/courses/recommendations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setRecommendations(data.recommendedCourses || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredCourses = filterSkill === 'All' 
    ? courses 
    : courses.filter(c => c.targetSkill?.toLowerCase() === filterSkill.toLowerCase());

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Curriculum & Course Recommendations</h2>
        <p className="text-xs text-[#7e8798] mt-0.5">Targeted learning modules to bridge your skill gap for {user?.targetRole || 'Full Stack Developer'}</p>
      </div>

      {/* AI Gap recommendation banner */}
      <div className="app-card p-6 border border-[#d97746]/25 bg-gradient-to-r from-[#171a21] via-[#15171e] to-[#1a1816] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#d97746]/15 border border-[#d97746]/30 flex items-center justify-center text-[#d97746]">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Personalized Course Recommendations</h3>
              <p className="text-xs text-[#8c95a6]">
                Curated specifically from your detected missing skills: {skillGap?.missingSkills?.slice(0, 3).join(', ') || 'Node.js, Express, Docker'}
              </p>
            </div>
          </div>
          <div className="text-xs font-mono text-[#f3c46e] px-3 py-1.5 rounded-full bg-[#271e16] border border-[#483321] self-start sm:self-auto">
            {recommendations.length} Tailored Courses Available
          </div>
        </div>

        {recommendations.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {recommendations.map(course => (
              <div key={course._id} className="p-4 rounded-2xl bg-[#0f1115] border border-[#202530] flex flex-col justify-between gap-3 hover:border-white/20 transition-all">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-[#f3a478] bg-[#2a1b15] px-2 py-0.5 rounded-md">
                      Bridge: {course.targetSkill}
                    </span>
                    <span className="text-xs font-mono text-white flex items-center gap-1">
                      <Star size={12} className="text-[#f3c46e]" fill="currentColor" /> {course.rating}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{course.title}</h4>
                  <p className="text-xs text-[#7e8797] line-clamp-2">{course.summary}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-[#697284]">
                  <span>{course.duration} • {course.modulesCount} modules</span>
                  <button className="text-xs font-semibold text-white hover:text-[#d97746] flex items-center gap-1">
                    Start Learning <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Interactive Curriculum Modules (Tokenization, Embeddings, Attention) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Featured Architecture Tracks</h3>
          <span className="text-xs text-[#70798a]">Interactive Lab Modules</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Track 1: Tokenization */}
          <div className="app-card p-5 space-y-4 hover:border-white/20 transition-all">
            <TokenBarChart compact />
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-[#d97746] uppercase">Module 01 • Topic 1</span>
              <h4 className="text-base font-bold text-white">Tokenization Pipelines</h4>
              <p className="text-xs text-[#8c96a7] leading-relaxed">
                Understand how BPE tokenizers decompose raw character strings into token IDs, vocabulary tables, and tensor indices.
              </p>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs text-[#70798a]">
              <span>18 min • Beginner</span>
              <span className="text-[#9ed68c] font-mono font-bold">1 / 8 Completed</span>
            </div>
          </div>

          {/* Track 2: Embeddings */}
          <div className="app-card p-5 space-y-4 hover:border-white/20 transition-all">
            <EmbeddingsScatterChart />
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-[#d97746] uppercase">Module 01 • Topic 2</span>
              <h4 className="text-base font-bold text-white">Embeddings & Vector Spaces</h4>
              <p className="text-xs text-[#8c96a7] leading-relaxed">
                Project dense semantic dimensions, cosine distance matrices, and vector stores for similarity retrieval.
              </p>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs text-[#70798a]">
              <span>20 min • Beginner</span>
              <span className="text-[#656e7f] font-mono">0 / 8 Completed</span>
            </div>
          </div>

          {/* Track 3: Attention Mechanism */}
          <div className="app-card p-5 space-y-4 hover:border-white/20 transition-all">
            <AttentionArcChart />
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-[#d97746] uppercase">Module 01 • Topic 3</span>
              <h4 className="text-base font-bold text-white">Self-Attention Weights</h4>
              <p className="text-xs text-[#8c96a7] leading-relaxed">
                Inspect scaled dot-product attention queries, keys, values, and multi-head context integration.
              </p>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs text-[#70798a]">
              <span>22 min • Beginner</span>
              <span className="text-[#656e7f] font-mono">0 / 8 Completed</span>
            </div>
          </div>
        </div>
      </div>

      {/* All Available Courses Catalog */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-lg font-bold text-white">All Platform Curriculums</h3>

          {/* Skills filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {['All', 'Node.js', 'Docker', 'MongoDB', 'Tokenization'].map(skill => (
              <button
                key={skill}
                onClick={() => setFilterSkill(skill)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  filterSkill === skill
                    ? 'bg-white text-black border-white font-semibold'
                    : 'bg-[#15181e] border-[#252b36] text-[#8e98aa] hover:border-white/20'
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCourses.map(course => (
            <div key={course._id} className="app-card p-5 space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-[#d97746]">{course.provider}</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#1e232d] text-[#8d97a8] text-[10px]">
                    {course.level}
                  </span>
                </div>
                <h4 className="text-base font-bold text-white">{course.title}</h4>
                <p className="text-xs text-[#8a94a5] leading-relaxed">{course.summary}</p>

                {/* Topics list */}
                {course.topics && course.topics.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[10px] font-bold uppercase text-[#697284] block mb-1">Key Topics:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {course.topics.map((t, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-[#13161c] border border-white/5 text-[#a1abbb]">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/5 text-xs text-[#70798a]">
                <span>{course.duration}</span>
                <button className="px-3.5 py-1.5 rounded-xl bg-[#202530] hover:bg-[#282f3d] text-white text-xs font-semibold border border-[#2d3444] transition-colors">
                  Enroll in Track
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
