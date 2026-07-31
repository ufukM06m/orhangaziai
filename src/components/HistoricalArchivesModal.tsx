import React, { useState } from 'react';
import { X, Castle, Coins, BookOpen, Shield, Flag, Scroll, MapPin, Users } from 'lucide-react';
import { HISTORICAL_MILESTONES } from '../data/history';

interface HistoricalArchivesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAskMilestoneQuestion: (question: string) => void;
}

export const HistoricalArchivesModal: React.FC<HistoricalArchivesModalProps> = ({
  isOpen,
  onClose,
  onAskMilestoneQuestion,
}) => {
  const [selectedId, setSelectedId] = useState<string>(HISTORICAL_MILESTONES[0].id);
  const [mobileTab, setMobileTab] = useState<'list' | 'detail'>('list');

  if (!isOpen) return null;

  const activeMilestone = HISTORICAL_MILESTONES.find((m) => m.id === selectedId) || HISTORICAL_MILESTONES[0];

  const getIcon = (name: string) => {
    switch (name) {
      case 'Castle': return <Castle className="w-5 h-5 text-[#eebb55]" />;
      case 'Coins': return <Coins className="w-5 h-5 text-[#eebb55]" />;
      case 'BookOpen': return <BookOpen className="w-5 h-5 text-[#eebb55]" />;
      case 'Shield': return <Shield className="w-5 h-5 text-[#eebb55]" />;
      case 'Flag': return <Flag className="w-5 h-5 text-[#eebb55]" />;
      default: return <Scroll className="w-5 h-5 text-[#eebb55]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl h-[92vh] sm:h-[85vh] rounded-2xl border border-[#eebb55]/40 bg-zinc-950 shadow-[0_0_60px_rgba(238,187,85,0.2)] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#eebb55]/10 border border-[#eebb55]/30 flex items-center justify-center shrink-0">
              <Scroll className="w-4 h-4 sm:w-5 sm:h-5 text-[#eebb55]" />
            </div>
            <div>
              <h2 className="font-mono text-xs sm:text-base font-bold text-white uppercase tracking-wider">
                ORHAN GAZİ DEVRİ FERMAN VE TARIHÇE (1281 - 1362)
              </h2>
              <p className="font-mono text-[10px] sm:text-xs text-zinc-400 hidden sm:block">
                Osmanlı Devleti'nin Müesses Kuruluş Devri ve Abbâsî-İlhanlı Sonrası Devletleşme Adımları
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 text-zinc-400 hover:text-white transition-colors cursor-pointer rounded-lg hover:bg-zinc-800"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Mobile View Selector Bar (visible only on mobile screens < 768px) */}
        <div className="flex md:hidden border-b border-zinc-800 bg-zinc-900/80 p-1">
          <button
            onClick={() => setMobileTab('list')}
            className={`flex-1 py-1.5 text-center font-mono text-xs font-bold rounded-lg transition-all ${
              mobileTab === 'list'
                ? 'bg-[#eebb55] text-black shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Kronoloji ({HISTORICAL_MILESTONES.length})
          </button>
          <button
            onClick={() => setMobileTab('detail')}
            className={`flex-1 py-1.5 text-center font-mono text-xs font-bold rounded-lg transition-all ${
              mobileTab === 'detail'
                ? 'bg-[#eebb55] text-black shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Ferman & Detay
          </button>
        </div>

        {/* Modal Body: Split view on Desktop / Tabbed view on Mobile */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          
          {/* Left Navigation Items */}
          <div className={`md:col-span-5 border-r border-zinc-800/80 p-3 sm:p-4 space-y-2 overflow-y-auto bg-zinc-900/30 ${
            mobileTab === 'list' ? 'block' : 'hidden md:block'
          }`}>
            {HISTORICAL_MILESTONES.map((item) => {
              const isActive = item.id === selectedId;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedId(item.id);
                    setMobileTab('detail');
                  }}
                  className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                    isActive
                      ? 'border-[#eebb55] bg-[#eebb55]/10 text-white shadow-[0_0_15px_rgba(238,187,85,0.15)]'
                      : 'border-zinc-800/80 bg-zinc-950/60 hover:bg-zinc-800/50 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <div className="mt-0.5 p-2 rounded-lg bg-black/40 border border-zinc-800 shrink-0">
                    {getIcon(item.iconName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs font-bold text-[#eebb55]">
                        {item.year}
                      </span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                        {item.badge}
                      </span>
                    </div>
                    <h3 className="font-sans text-xs sm:text-sm font-semibold truncate text-white">
                      {item.title}
                    </h3>
                    <p className="font-mono text-[10px] sm:text-[11px] text-zinc-400 truncate mt-0.5">
                      {item.subtitle}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Detail Pane */}
          <div className={`md:col-span-7 p-4 sm:p-6 overflow-y-auto flex flex-col justify-between bg-zinc-950 ${
            mobileTab === 'detail' ? 'block' : 'hidden md:flex'
          }`}>
            <div>
              {/* Badge & Year */}
              <div className="flex items-center gap-3 mb-3">
                <span className="font-mono text-xl sm:text-2xl font-black text-[#eebb55]">
                  {activeMilestone.year}
                </span>
                <span className="font-mono text-[10px] sm:text-xs px-2.5 py-1 rounded bg-[#eebb55]/20 text-[#eebb55] border border-[#eebb55]/40 uppercase tracking-wider">
                  {activeMilestone.badge}
                </span>
              </div>

              {/* Title & Subtitle */}
              <h3 className="font-sans text-lg sm:text-xl font-bold text-white mb-1">
                {activeMilestone.title}
              </h3>
              <p className="font-mono text-xs text-zinc-400 mb-3 pb-2">
                {activeMilestone.subtitle}
              </p>

              {/* Metadata Badges (Location & Key Figures) */}
              <div className="flex flex-wrap gap-2 mb-4 pb-3 border-b border-zinc-800/80">
                {activeMilestone.location && (
                  <span className="inline-flex items-center gap-1 font-mono text-[10px] sm:text-[11px] px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300">
                    <MapPin className="w-3 h-3 text-[#eebb55]" />
                    <span>{activeMilestone.location}</span>
                  </span>
                )}
                {activeMilestone.region && (
                  <span className="inline-flex items-center gap-1 font-mono text-[10px] sm:text-[11px] px-2.5 py-1 rounded-md bg-amber-950/40 border border-amber-800/40 text-amber-200">
                    <span>{activeMilestone.region}</span>
                  </span>
                )}
              </div>

              {/* Overview */}
              <div className="space-y-4 font-sans text-xs sm:text-sm text-zinc-300 leading-relaxed mb-4">
                <p className="bg-zinc-900/80 p-3.5 sm:p-4 rounded-xl border border-zinc-800 text-zinc-200">
                  {activeMilestone.description}
                </p>
                
                <h4 className="font-mono text-xs font-bold text-[#eebb55] uppercase tracking-wider pt-1">
                  TÂRİHÎ TAHRİR VE ŞERH
                </h4>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  {activeMilestone.details}
                </p>
              </div>

              {/* Key Figures */}
              {activeMilestone.keyFigures && activeMilestone.keyFigures.length > 0 && (
                <div className="mb-4">
                  <span className="inline-flex items-center gap-1 font-mono text-[10px] text-zinc-400 uppercase tracking-wider mb-2">
                    <Users className="w-3 h-3 text-[#eebb55]" />
                    ÖNEMLİ ŞAHSİYETLER:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeMilestone.keyFigures.map((fig, idx) => (
                      <span key={idx} className="font-mono text-[10px] px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
                        {fig}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Orhan Gazi Royal Quote */}
              <div className="p-3.5 sm:p-4 rounded-xl border border-[#eebb55]/30 bg-[#eebb55]/5 relative">
                <div className="absolute -top-3 left-4 px-2 bg-zinc-950 font-mono text-[10px] text-[#eebb55] uppercase">
                  ORHAN GAZİ KELÂMI
                </div>
                <p className="font-mono text-xs italic text-zinc-200 leading-relaxed">
                  "{activeMilestone.quote}"
                </p>
              </div>
            </div>

            {/* Action to ask Orhan Gazi about this milestone */}
            <div className="pt-4 sm:pt-6 border-t border-zinc-800 mt-4 sm:mt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
              <button
                onClick={() => setMobileTab('list')}
                className="w-full sm:w-auto md:hidden px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono text-xs text-center"
              >
                ← Listeye Dön
              </button>
              <button
                onClick={() => {
                  onAskMilestoneQuestion(`Hünkârım, ${activeMilestone.year} yılındaki ${activeMilestone.title} hakkında detaylı bilgi verir misiniz?`);
                  onClose();
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#eebb55] hover:bg-[#ffc955] text-black font-bold font-mono text-xs transition-all shadow-[0_0_20px_rgba(238,187,85,0.25)] cursor-pointer"
              >
                <span>Hünkâra Bu Hususu Sual Et</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
