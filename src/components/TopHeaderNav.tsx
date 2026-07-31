import React from 'react';
import { Volume2, VolumeX, BookOpen, History, Keyboard, Sparkles, Anvil, ShieldAlert, Drum, Bird } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface TopHeaderNavProps {
  isAmbienceActive: boolean;
  onToggleAmbience: () => void;
  onOpenArchives: () => void;
  onOpenHistory: () => void;
  onOpenTextInput: () => void;
  historyCount: number;
}

export const TopHeaderNav: React.FC<TopHeaderNavProps> = ({
  isAmbienceActive,
  onToggleAmbience,
  onOpenArchives,
  onOpenHistory,
  onOpenTextInput,
  historyCount,
}) => {
  return (
    <header className="fixed top-0 left-0 w-full px-4 sm:px-8 py-4 flex flex-col z-40 bg-gradient-to-b from-black/95 via-black/75 to-transparent backdrop-blur-xs">
      <div className="flex items-center justify-between w-full">
        {/* Brand & System Status */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#eebb55]/10 border border-[#eebb55]/40 flex items-center justify-center text-[#eebb55] shadow-[0_0_12px_rgba(238,187,85,0.2)]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold tracking-wider text-white uppercase">
                ORHAN GAZİ AI
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-mono bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1" />
                1326 PÂYİTAHT
              </span>
            </div>
            <p className="font-mono text-[10px] text-zinc-400 hidden sm:block">
              Osmanlı Devleti 2. Hükümdarı • Sesli Yapay Zekâ Sistemi
            </p>
          </div>
        </div>

        {/* Control Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Text Query */}
          <button
            onClick={onOpenTextInput}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/60 text-zinc-200 text-xs font-mono transition-all hover:border-[#eebb55]/50 cursor-pointer shadow-sm"
            title="Yazılı Sual Sor"
          >
            <Keyboard className="w-3.5 h-3.5 text-[#eebb55]" />
            <span className="hidden md:inline">Yazılı Sual</span>
          </button>

          {/* Historical Archives */}
          <button
            onClick={onOpenArchives}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/60 text-zinc-200 text-xs font-mono transition-all hover:border-[#eebb55]/50 cursor-pointer shadow-sm"
            title="Tarihî Kronoloji ve Fermanlar"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#eebb55]" />
            <span className="hidden sm:inline">Tarihçe</span>
          </button>

          {/* Conversation History */}
          <button
            onClick={onOpenHistory}
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/60 text-zinc-200 text-xs font-mono transition-all hover:border-[#eebb55]/50 cursor-pointer shadow-sm"
            title="Kelâm Geçmişi"
          >
            <History className="w-3.5 h-3.5 text-[#eebb55]" />
            <span className="hidden sm:inline">Geçmiş</span>
            {historyCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#eebb55] text-black">
                {historyCount}
              </span>
            )}
          </button>

          {/* Ambient Sound Toggle */}
          <button
            onClick={onToggleAmbience}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all cursor-pointer shadow-sm ${
              isAmbienceActive
                ? 'bg-[#eebb55]/20 border-[#eebb55] text-[#eebb55] shadow-[0_0_12px_rgba(238,187,85,0.3)]'
                : 'bg-zinc-900/80 border-zinc-700/60 text-zinc-400 hover:text-zinc-200'
            }`}
            title={isAmbienceActive ? 'Ortam Sesini Kapat' : 'Tarihî Ortam Sesini Aç'}
          >
            {isAmbienceActive ? (
              <Volume2 className="w-3.5 h-3.5 animate-pulse" />
            ) : (
              <VolumeX className="w-3.5 h-3.5" />
            )}
            <span className="hidden md:inline">
              {isAmbienceActive ? 'Ortam Açık' : 'Ortam'}
            </span>
          </button>
        </div>
      </div>

      {/* Interactive Sound Effects Quick Triggers Bar when Ambience is Active */}
      {isAmbienceActive && (
        <div className="mt-3 pt-2.5 border-t border-zinc-800/60 flex items-center justify-between gap-2 overflow-x-auto pb-1 animate-fade-in">
          <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#eebb55] animate-ping mr-1" />
            Otağ Ses Efektleri:
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => soundEngine.playAnvilStrike()}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-amber-200 hover:text-white text-[11px] font-mono transition-all cursor-pointer active:scale-95"
              title="Örsü ve Demir Dövme Sesini Çal"
            >
              <Anvil className="w-3 h-3 text-[#eebb55]" />
              <span>Demir & Örs</span>
            </button>

            <button
              onClick={() => soundEngine.playSwordClang()}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-amber-200 hover:text-white text-[11px] font-mono transition-all cursor-pointer active:scale-95"
              title="Kılıç ve Kalkan Çınlama Sesini Çal"
            >
              <ShieldAlert className="w-3 h-3 text-[#eebb55]" />
              <span>Kılıç & Kalkan</span>
            </button>

            <button
              onClick={() => soundEngine.playKudumHit()}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-amber-200 hover:text-white text-[11px] font-mono transition-all cursor-pointer active:scale-95"
              title="Kudüm Vuruşu Sesini Çal"
            >
              <Drum className="w-3 h-3 text-[#eebb55]" />
              <span>Kudüm Sesi</span>
            </button>

            <button
              onClick={() => soundEngine.playBursaBirdChirp()}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-amber-200 hover:text-white text-[11px] font-mono transition-all cursor-pointer active:scale-95"
              title="Bursa Hisar Kuş Seslerini Çal"
            >
              <Bird className="w-3 h-3 text-[#eebb55]" />
              <span>Hisar Kuşları</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
