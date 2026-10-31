import React from 'react';

// 1. Bar Chart Visualizer matching the image's "Tokens for the same text - gpt2 / cl100k / o200k"
export const TokenBarChart = ({ compact = false }) => {
  const bars = [
    { label: 'English', h1: 45, h2: 78, h3: 35 },
    { label: 'Malay', h1: 65, h2: 30, h3: 50 },
    { label: 'Japanese', h1: 85, h2: 55, h3: 70 },
    { label: 'Arabic', h1: 90, h2: 60, h3: 80 },
    { label: 'Code', h1: 40, h2: 65, h3: 75 },
  ];

  return (
    <div className={`w-full max-w-full overflow-hidden bg-[#13151a] rounded-2xl p-3 sm:p-4 border border-[#20242e] flex flex-col justify-between ${compact ? 'h-36' : 'h-44'}`}>
      <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-[#717888] font-mono truncate gap-1">
        <span className="truncate">Tokens per sequence • GPT vs Llama</span>
        <span className="flex items-center gap-1.5 shrink-0">
          <span className="inline-block w-2 h-2 rounded-full bg-[#f3c46e]"></span>
          <span className="inline-block w-2 h-2 rounded-full bg-[#9ed68c]"></span>
        </span>
      </div>

      <div className="flex items-end justify-between gap-1.5 sm:gap-3 h-24 pt-2">
        {bars.map((item, idx) => (
          <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end min-w-0">
            <div className="w-full flex items-end justify-center gap-1 h-full">
              <div
                style={{ height: `${item.h1}%` }}
                className="w-1.5 sm:w-2 bg-[#f3c46e] rounded-t-sm transition-all duration-500"
              ></div>
              <div
                style={{ height: `${item.h2}%` }}
                className="w-1.5 sm:w-2 bg-[#9ed68c] rounded-t-sm transition-all duration-500"
              ></div>
              <div
                style={{ height: `${item.h3}%` }}
                className="w-1.5 sm:w-2 bg-[#708098] rounded-t-sm transition-all duration-500"
              ></div>
            </div>
            <span className="text-[9px] sm:text-[10px] text-[#636c7e] font-sans truncate w-full text-center">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// 2. Scatter / Embeddings Dimensionality Scatter Chart
export const EmbeddingsScatterChart = () => {
  const dots = [
    { x: 15, y: 70, color: '#f3c46e', size: 5 },
    { x: 22, y: 65, color: '#f3c46e', size: 7 },
    { x: 28, y: 75, color: '#f3a478', size: 5 },
    { x: 55, y: 35, color: '#9ed68c', size: 6 },
    { x: 62, y: 45, color: '#9ed68c', size: 8 },
    { x: 70, y: 30, color: '#6ca8f7', size: 6 },
    { x: 75, y: 50, color: '#9ed68c', size: 6 },
    { x: 82, y: 60, color: '#f3a478', size: 7 },
    { x: 45, y: 80, color: '#f3c46e', size: 5 },
  ];

  return (
    <div className="w-full max-w-full h-36 bg-[#13151a] rounded-2xl p-3 border border-[#20242e] relative overflow-hidden flex flex-col justify-between">
      <div className="text-[10px] text-[#677080] font-mono truncate">
        2D sentence vectors • PCA
      </div>
      <div className="relative flex-1 w-full my-1 overflow-hidden">
        {dots.map((d, i) => (
          <div
            key={i}
            className="absolute rounded-full transition-all duration-700 hover:scale-150 cursor-pointer shadow-sm"
            style={{
              left: `${d.x}%`,
              top: `${d.y}%`,
              width: `${d.size}px`,
              height: `${d.size}px`,
              backgroundColor: d.color,
              boxShadow: `0 0 6px ${d.color}66`
            }}
          />
        ))}
      </div>
      <div className="text-[9px] text-[#555d6e] flex justify-between font-mono">
        <span>Dim 1 (sem)</span>
        <span>Dim 2 (syn)</span>
      </div>
    </div>
  );
};

// 3. Attention Arc Visualization matching the exact reference screenshot
export const AttentionArcChart = () => {
  return (
    <div className="w-full max-w-full h-36 bg-[#13151a] rounded-2xl p-3 border border-[#20242e] flex flex-col justify-between overflow-hidden">
      <div className="text-[10px] text-[#677080] font-mono truncate">
        Q*K^T / √d_k • Softmax Arcs
      </div>
      
      {/* SVG Arcs */}
      <div className="w-full h-16 flex items-center justify-center overflow-hidden">
        <svg viewBox="0 0 200 60" className="w-full h-full max-w-full stroke-current" preserveAspectRatio="xMidYMid meet">
          <path
            d="M 25 55 A 40 40 0 0 1 175 55"
            fill="none"
            stroke="#d97746"
            strokeWidth="2.5"
            strokeDasharray="200"
            strokeDashoffset="0"
          />
          <path
            d="M 40 55 A 30 30 0 0 1 155 55"
            fill="none"
            stroke="#f3a478"
            strokeWidth="1.8"
            opacity="0.8"
          />
          <path
            d="M 60 55 A 20 20 0 0 1 135 55"
            fill="none"
            stroke="#f3c46e"
            strokeWidth="1.2"
            opacity="0.6"
          />
          {/* Base tokens */}
          <circle cx="25" cy="55" r="3" fill="#d97746" />
          <circle cx="60" cy="55" r="3" fill="#f3c46e" />
          <circle cx="100" cy="55" r="3" fill="#9ed68c" />
          <circle cx="135" cy="55" r="3" fill="#f3c46e" />
          <circle cx="175" cy="55" r="3" fill="#d97746" />
        </svg>
      </div>

      <div className="flex justify-between text-[9px] text-[#5a6273] font-mono px-1 truncate">
        <span>The</span>
        <span>model</span>
        <span>did</span>
        <span>not</span>
        <span>read</span>
        <span>text</span>
      </div>
    </div>
  );
};
