import React, { useEffect, useState } from 'react';
import { VoiceState } from '../types';

interface SpatialSceneProps {
  voiceState: VoiceState;
  onPortalClick?: () => void;
}

export const SpatialScene: React.FC<SpatialSceneProps> = ({ voiceState, onPortalClick }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const xAxis = (window.innerWidth / 2 - e.clientX) / 45;
      const yAxis = (window.innerHeight / 2 - e.clientY) / 45;
      setMousePos({ x: xAxis, y: yAxis });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Spatial transforms
  const terrainTransform = `translateZ(-300px) scale(1.2) translate(${-mousePos.x * 0.6}px, ${-mousePos.y * 0.6}px)`;
  const portalTransform = `translate(-50%, -50%) rotateY(${-mousePos.x}deg) rotateX(${mousePos.y}deg)`;
  const codeLeftTransform = `translateZ(50px) translate(${mousePos.x * 1.5}px, ${mousePos.y * 1.5}px)`;
  const codeCenterTransform = `translateZ(-50px) translate(${mousePos.x * 0.8}px, ${mousePos.y * 0.8}px)`;
  const codeRightTransform = `translateZ(100px) translate(${mousePos.x * 2}px, ${mousePos.y * 2}px)`;

  return (
    <div id="scene" className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-1">
      <div id="scene-inner" className="relative w-full h-full transform-gpu">
        
        {/* Terrain Background Layer */}
        <div 
          className="absolute -top-[5%] -left-[5%] w-[110%] h-[110%] bg-cover bg-center transition-transform duration-100 ease-out pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(5,5,5,0.4) 0%, rgba(5,5,5,0.96) 100%), url('https://images.unsplash.com/photo-1617634667039-8e4cb277ab46?q=80&w=2000&auto=format&fit=crop')`,
            filter: 'grayscale(100%) contrast(140%) brightness(20%)',
            transform: terrainTransform,
          }}
        />

        {/* Background Atmosphere Glows */}
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-amber-600/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Floating Code Snippet 1 (Left) */}
        <div 
          className="floating-code code-left absolute top-[18%] left-[6%] font-mono text-[11px] text-zinc-400/50 leading-relaxed whitespace-pre transition-transform duration-100 ease-out hidden sm:block pointer-events-none"
          style={{ transform: codeLeftTransform }}
        >
          <span className="text-[#eebb55]">$ system.found("Ottoman Beylik")</span>{'\n'}
          &gt; initializing ORHAN_GAZI.core{'\n'}
          <span className="text-emerald-400/80">✓ data nodes synced [1299-1362]</span>{'\n'}
          [state] = "pâyitaht_ready"{'\n'}
          [location] = "Bursa Castle / Hisar"
        </div>

        {/* Floating Code Snippet 2 (High Top Center - away from speech text behind) */}
        <div 
          className="floating-code code-center absolute top-[7%] left-[40%] font-mono text-[11px] text-zinc-500/30 leading-relaxed whitespace-pre transition-transform duration-100 ease-out hidden md:block pointer-events-none"
          style={{ transform: codeCenterTransform }}
        >
          import &#123; State &#125; from "@ottoman/foundation";{'\n'}
          // Memory nodes parsed [1326 Bursa]
        </div>

        {/* Floating Code Snippet 3 (Right) */}
        <div 
          className="floating-code code-right absolute top-[20%] right-[6%] font-mono text-[11px] text-zinc-400/60 leading-relaxed whitespace-pre text-right transition-transform duration-100 ease-out hidden sm:block pointer-events-none"
          style={{ transform: codeRightTransform }}
        >
          <span className="text-emerald-400/80">✓ State Protocol active</span>{'\n'}
          &gt; memory_bank: FETH-İ BURSA{'\n'}
          &gt; State Mint: AKÇE_1327{'\n'}
          &gt; Army: YAYA_VE_MÜSELLEM{'\n'}
          <span className="text-[#eebb55]">[awaiting traveler query]</span>
        </div>

        {/* Central Portal Wrapper */}
        <div 
          className="absolute top-[25%] sm:top-[28%] left-1/2 w-[220px] h-[220px] sm:w-[260px] sm:h-[260px] md:w-[280px] md:h-[280px] transition-transform duration-100 ease-out pointer-events-auto cursor-pointer group"
          style={{ transform: portalTransform }}
          onClick={onPortalClick}
        >
          {/* Header Label above portal */}
          <div 
            className="absolute -top-8 left-1/2 -translate-x-1/2 font-mono text-[10px] sm:text-[11px] text-[#eebb55] tracking-[0.35em] uppercase w-full text-center font-semibold drop-shadow-[0_0_10px_rgba(238,187,85,0.5)]"
            style={{ transform: 'translateZ(30px)' }}
          >
            [ SULTAN ORHAN GAZİ ]
          </div>

          {/* Frame Box */}
          <div 
            className={`relative inset-0 w-full h-full rounded-2xl border transition-all duration-500 flex items-center justify-center overflow-hidden shadow-2xl ${
              voiceState === 'speaking'
                ? 'border-[#eebb55] shadow-[0_0_80px_rgba(238,187,85,0.45)] bg-gradient-to-b from-amber-950/60 to-black'
                : voiceState === 'listening'
                ? 'border-red-500 shadow-[0_0_80px_rgba(239,68,68,0.45)] bg-gradient-to-b from-red-950/60 to-black'
                : voiceState === 'thinking'
                ? 'border-amber-400/90 shadow-[0_0_60px_rgba(251,191,36,0.35)] bg-gradient-to-b from-amber-950/40 to-black'
                : 'border-[#eebb55]/40 shadow-[0_0_70px_rgba(238,187,85,0.2)] bg-gradient-to-b from-amber-950/30 to-black group-hover:border-[#eebb55]/80'
            }`}
            style={{ transform: 'translateZ(20px)' }}
          >
            {/* Orhan Gazi Sultan Portrait Artwork */}
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-70 group-hover:opacity-90 transition-all duration-700 mix-blend-luminosity hover:mix-blend-normal"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=1000&auto=format&fit=crop')`,
              }}
            />

            {/* Stylized Ottoman Sultan Orhan Gazi Vector Silhouette & Turban Illustration Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-t from-black via-black/40 to-amber-950/30 p-4">
              {/* Ottoman Turban & Bey Emblem */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border border-[#eebb55]/50 bg-black/60 backdrop-blur-md flex items-center justify-center shadow-[0_0_25px_rgba(238,187,85,0.25)] relative overflow-hidden group-hover:scale-105 transition-transform duration-300">
                <svg viewBox="0 0 100 100" className="w-16 h-16 text-[#eebb55] fill-current drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                  {/* Ottoman Turban & Sultan Crown Crest Silhouette */}
                  <path d="M50 12 C35 12 24 22 24 35 C24 45 32 52 42 55 C38 60 30 65 20 75 L80 75 C70 65 62 60 58 55 C68 52 76 45 76 35 C76 22 65 12 50 12 Z M50 20 C57 20 64 26 64 35 C64 42 58 48 50 48 C42 48 36 42 36 35 C36 26 43 20 50 20 Z" opacity="0.9" />
                  {/* Crescent Star Emblem */}
                  <path d="M50 24 A 8 8 0 1 0 54 38 A 10 10 0 1 1 50 24 Z" fill="#eebb55" />
                  <polygon points="58,30 60,33 63,33 61,35 62,38 59,36 57,38 58,35 55,33 58,33" fill="#eebb55" />
                </svg>
              </div>

              {/* Title & Date */}
              <div className="mt-3 text-center">
                <span className="block font-serif text-sm sm:text-base text-zinc-100 font-bold tracking-wide drop-shadow-md">
                  ORHAN GAZİ
                </span>
                <span className="block font-mono text-[10px] sm:text-[11px] tracking-widest text-[#eebb55] uppercase mt-0.5">
                  1326 • BURSA FÂTİHİ
                </span>
              </div>
            </div>

            {/* Subtle Ottoman Pattern Overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(238,187,85,0.15)_0%,transparent_75%)] pointer-events-none z-10" />

            {/* Audio Spectrum Equalizer Bars when active */}
            <div className={`audio-bars absolute inset-0 flex items-center justify-center gap-3 px-12 pointer-events-none z-30 ${voiceState}`}>
              <div className="bar transition-all duration-150" />
              <div className="bar transition-all duration-150" />
              <div className="bar transition-all duration-150" />
              <div className="bar transition-all duration-150" />
              <div className="bar transition-all duration-150" />
            </div>

            {/* Central Ottoman Crest when Idle */}
            {voiceState === 'idle' && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/70 border border-[#eebb55]/40 backdrop-blur-md shadow-sm pointer-events-none z-30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono text-[10px] tracking-widest text-[#eebb55] uppercase font-semibold">
                  1326 PÂYİTAHT
                </span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

