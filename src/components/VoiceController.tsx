import React, { useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Sparkles } from 'lucide-react';
import { VoiceState } from '../types';

interface VoiceControllerProps {
  voiceState: VoiceState;
  subtitleText: string;
  onToggleMic: () => void;
  statusLabelText: string;
}

export const VoiceController: React.FC<VoiceControllerProps> = ({
  voiceState,
  subtitleText,
  onToggleMic,
  statusLabelText,
}) => {
  const isRecording = voiceState === 'listening';
  const isSpeaking = voiceState === 'speaking';
  const isThinking = voiceState === 'thinking';

  const subtitleRef = useRef<HTMLDivElement>(null);

  // Auto-scroll subtitle text container to bottom as typewriter text streams in
  useEffect(() => {
    if (subtitleRef.current) {
      subtitleRef.current.scrollTop = subtitleRef.current.scrollHeight;
    }
  }, [subtitleText]);

  return (
    <div className="fixed bottom-0 left-0 w-full px-4 sm:px-8 md:px-12 py-3 sm:py-5 md:py-7 grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 items-end z-40 bg-gradient-to-t from-black via-black/95 to-transparent pointer-events-auto">
      
      {/* 1. SOL SÜTUN (Responsive Title) */}
      <div className="hidden sm:flex flex-col justify-end text-left">
        <span className="text-[9px] sm:text-[10px] md:text-[11px] text-zinc-400 tracking-[0.2em] uppercase mb-1 font-mono">
          BURSA BÜYÜKŞEHİR BELEDİYESİ 700. YIL
        </span>
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-[4.5rem] font-black text-white leading-[0.98] tracking-tighter uppercase font-sans drop-shadow-md">
          TARİHİ<br />DİRİLT
        </h1>
      </div>

      {/* 2. ORTA SÜTUN (Mikrofon & Subtitle & Ses Dalgası) */}
      <div className="flex flex-col items-center justify-end text-center">
        
        {/* Mobile Mini Title Header (visible only on phone screens) */}
        <div className="sm:hidden flex items-center justify-center gap-1.5 mb-1">
          <span className="font-mono text-[9px] text-zinc-400 tracking-widest uppercase">
            BURSA 700. YIL •
          </span>
          <span className="font-sans text-xs font-black text-[#eebb55] tracking-tight">
            TARİHİ DİRİLT
          </span>
        </div>

        {/* Subtitle Output - Flowing Text Container */}
        <div 
          ref={subtitleRef}
          className="w-full max-w-xl max-h-[70px] sm:max-h-[90px] md:max-h-[105px] overflow-y-auto mb-2 px-3 py-1 text-center scrollbar-thin scrollbar-thumb-zinc-700/50"
        >
          <p className="font-mono text-xs sm:text-sm text-zinc-100 leading-relaxed text-center drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
            {subtitleText || <span className="text-zinc-500 italic">"Orhan Gazi ile konuşmak için mikrofona dokunun..."</span>}
            <span className="cursor-blink text-[#eebb55] ml-1">_</span>
          </p>
        </div>

        {/* Audio Soundwave Frequency Visualizer */}
        <div className={`flex items-center justify-center gap-1 sm:gap-1.5 h-6 sm:h-8 mb-2 px-4 sm:px-6 transition-all duration-300 ${
          isSpeaking
            ? 'sound-wave-speaking opacity-100 scale-100'
            : isRecording
            ? 'sound-wave-listening opacity-100 scale-100'
            : isThinking
            ? 'sound-wave-thinking opacity-90 scale-100'
            : 'sound-wave-idle opacity-50 scale-95'
        }`}>
          {[0.1, 0.3, 0.15, 0.45, 0.2, 0.5, 0.25, 0.6, 0.35, 0.2, 0.5, 0.15, 0.4, 0.1].map((delay, idx) => (
            <span
              key={idx}
              className="sound-wave-bar"
              style={{ animationDelay: `${delay}s` }}
            />
          ))}
        </div>

        {/* Microphone Button & Status Label */}
        <div className="flex flex-col items-center gap-2 sm:gap-3">
          <button
            onClick={onToggleMic}
            disabled={isThinking}
            className={`w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer z-50 relative border ${
              isRecording
                ? 'bg-red-600 border-red-400 text-white shadow-[0_0_40px_rgba(239,68,68,0.7)] animate-pulse'
                : isSpeaking
                ? 'bg-[#eebb55] border-[#ffdf88] text-black shadow-[0_0_40px_rgba(238,187,85,0.7)]'
                : isThinking
                ? 'bg-zinc-800 border-amber-400/50 text-amber-300 opacity-90 shadow-[0_0_20px_rgba(251,191,36,0.3)] cursor-wait'
                : 'bg-white border-white text-black shadow-[0_0_25px_rgba(255,255,255,0.25)] hover:bg-[#eebb55] hover:border-[#eebb55]'
            }`}
            title="Mikrofona Dokunarak Konuşun"
          >
            {isRecording ? (
              <MicOff className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
            ) : isSpeaking ? (
              <Volume2 className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 animate-bounce" />
            ) : isThinking ? (
              <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 animate-spin text-[#eebb55]" />
            ) : (
              <Mic className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
            )}
          </button>

          <span
            className={`font-mono text-[10px] sm:text-[11px] tracking-widest uppercase transition-colors ${
              isRecording
                ? 'text-red-400 font-bold animate-pulse'
                : isSpeaking || isThinking
                ? 'text-[#eebb55] font-bold'
                : 'text-zinc-400'
            }`}
          >
            {statusLabelText}
          </span>
        </div>
      </div>

      {/* 3. SAĞ SÜTUN */}
      <div className="hidden md:flex flex-col justify-end items-end text-right pb-1">
        <p className="text-xs sm:text-[13px] text-zinc-400 leading-relaxed max-w-[260px] font-sans">
          1326 yılına dijital bir köprü. Yapay zekâ devleti işler — vizyon ise insanındır.
        </p>
      </div>

    </div>
  );
};
