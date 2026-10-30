import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Star, 
  Calendar, 
  CheckCircle, 
  MessageSquare, 
  Briefcase, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const MentorsView = ({ token, user }) => {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [matchedMsg, setMatchedMsg] = useState('');

  useEffect(() => {
    fetchMentors();
  }, [token]);

  const fetchMentors = async () => {
    try {
      const res = await fetch('/api/mentors', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setMentors(data.mentors);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleMatchMentor = async (mentorId, mentorName) => {
    try {
      const res = await fetch(`/api/mentors/match/${mentorId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setMatchedMsg(`Successfully matched with ${mentorName}!`);
        fetchMentors();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Industry Mentor Matching</h2>
        <p className="text-xs text-[#7e8798] mt-0.5">Connect 1-on-1 with experienced tech engineers to review projects and career paths</p>
      </div>

      {matchedMsg && (
        <div className="p-4 rounded-2xl bg-[#142318] border border-[#27482d] text-[#9ed68c] text-xs font-semibold flex items-center gap-2">
          <CheckCircle size={16} /> {matchedMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mentors.map((mentor) => (
          <div 
            key={mentor._id} 
            className={`app-card p-6 md:p-8 space-y-5 flex flex-col justify-between border ${
              mentor.isCurrentMentor 
                ? 'border-[#d97746] bg-[#161a22]' 
                : 'hover:border-white/20'
            }`}
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#2d3340] to-[#1f242e] border border-white/10 flex items-center justify-center font-bold text-white text-base">
                    {mentor.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{mentor.name}</h3>
                    <p className="text-xs text-[#8c96a7]">{mentor.title} at <span className="text-white font-medium">{mentor.company}</span></p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs font-mono text-[#f3c46e] px-2 py-1 rounded-lg bg-[#272016] border border-[#483822]">
                  <Star size={12} fill="currentColor" /> {mentor.rating}
                </div>
              </div>

              <p className="text-xs text-[#b0bac8] leading-relaxed">
                {mentor.bio}
              </p>

              {/* Matched Expertise */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6b7586]">Areas of Expertise:</span>
                <div className="flex flex-wrap gap-1.5">
                  {mentor.expertise.map((exp, idx) => {
                    const isMatched = mentor.matchedExpertise?.includes(exp);
                    return (
                      <span 
                        key={idx} 
                        className={`text-[10px] px-2.5 py-1 rounded-full border ${
                          isMatched 
                            ? 'bg-[#291e17] border-[#4a2e1d] text-[#f4ba98] font-semibold' 
                            : 'bg-[#15181f] border-white/5 text-[#8892a2]'
                        }`}
                      >
                        {isMatched ? '★ ' : ''}{exp}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs">
              <span className="text-[#6d7687] flex items-center gap-1 font-mono text-[11px]">
                <Calendar size={12} /> {mentor.availability}
              </span>

              {mentor.isCurrentMentor ? (
                <div className="px-4 py-2 rounded-xl bg-[#233526] border border-[#3b593f] text-[#9ed68c] font-bold text-xs flex items-center gap-1.5">
                  <CheckCircle size={13} /> Current Mentor
                </div>
              ) : (
                <button
                  onClick={() => handleMatchMentor(mentor._id, mentor.name)}
                  className="px-4 py-2 rounded-xl bg-white text-black font-bold text-xs hover:bg-gray-200 transition-colors flex items-center gap-1.5 shadow"
                >
                  <Sparkles size={13} /> Connect & Match
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
