import React from 'react';
import { X, ExternalLink, Youtube, BookOpen } from 'lucide-react';

export const VideoModal = ({ video, onClose }) => {
  if (!video) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="app-card w-full max-w-4xl bg-[#121419] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#15181e]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-red-600/20 text-red-500 border border-red-500/30 flex items-center justify-center">
              <Youtube size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#d97746]">
                  {video.source}
                </span>
                <span className="text-[10px] text-[#717b8c] font-mono">• {video.duration}</span>
              </div>
              <h3 className="text-sm font-bold text-white line-clamp-1">{video.title}</h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={video.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl text-[#7c8697] hover:text-white hover:bg-white/5 transition-colors"
              title="Open directly on YouTube"
            >
              <ExternalLink size={16} />
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#7c8697] hover:text-white hover:bg-white/5 transition-colors"
              title="Close Player"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Video Player Embed */}
        <div className="relative aspect-video w-full bg-black">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${video.videoId}?autoplay=1&rel=0`}
            title={video.title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>

        {/* Video Description & Learning Notes */}
        <div className="p-6 bg-[#121419] border-t border-white/5 space-y-3 overflow-y-auto">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <BookOpen size={14} className="text-[#d97746]" /> Recommended Lecture Synopsis
            </span>
            <span className="text-[11px] font-mono text-[#9ed68c] px-2.5 py-0.5 rounded-full bg-[#1b261d] border border-[#2b442f]">
              {video.module}
            </span>
          </div>

          <p className="text-xs text-[#a0aab8] leading-relaxed">
            {video.description}
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-[#697284]">
            <span className="font-semibold text-[#8a94a6]">Topics covered:</span>
            {video.topics?.map((topic, i) => (
              <span key={i} className="px-2 py-0.5 rounded-md bg-[#181c25] border border-white/5 text-[#cbd2e0]">
                {topic}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
