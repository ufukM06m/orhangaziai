import React from 'react';
import { X, Trash2, MessageSquare, Bot, User, Volume2 } from 'lucide-react';
import { ChatMessage } from '../types';

interface ChatHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onClearHistory: () => void;
  onReplaySpeech: (text: string) => void;
}

export const ChatHistoryDrawer: React.FC<ChatHistoryDrawerProps> = ({
  isOpen,
  onClose,
  messages,
  onClearHistory,
  onReplaySpeech,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md h-full bg-zinc-950 border-l border-[#eebb55]/30 shadow-2xl flex flex-col">
        
        {/* Drawer Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/40">
          <div className="flex items-center gap-2.5">
            <MessageSquare className="w-5 h-5 text-[#eebb55]" />
            <div>
              <h2 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
                KELÂM HÂFIZASI & GEÇMİŞ
              </h2>
              <p className="font-mono text-[11px] text-zinc-400">
                {messages.length} Muhavere Kaydı
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <button
                onClick={onClearHistory}
                className="p-2 text-zinc-400 hover:text-red-400 transition-colors cursor-pointer rounded-lg hover:bg-zinc-900"
                title="Geçmişi Temizle"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white transition-colors cursor-pointer rounded-lg hover:bg-zinc-900"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawer Messages List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-500 font-mono text-xs">
              <Bot className="w-10 h-10 text-zinc-700 mb-2" />
              Henüz bir kelâm gerçekleşmedi. Mikrofona dokunarak veya sual yazarak konuşmaya başlayabilirsiniz.
            </div>
          ) : (
            messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    {isUser ? (
                      <>
                        <span className="font-mono text-[10px] text-zinc-400">Siz</span>
                        <User className="w-3 h-3 text-zinc-400" />
                      </>
                    ) : (
                      <>
                        <Bot className="w-3 h-3 text-[#eebb55]" />
                        <span className="font-mono text-[10px] text-[#eebb55] font-bold">Orhan Gazi</span>
                        {msg.mode === 'gemini' ? (
                          <span className="font-mono text-[9px] px-1.5 py-0.2 rounded border border-emerald-500/40 text-emerald-400 bg-emerald-950/40 font-semibold ml-1">
                            ⚡ Gemini AI
                          </span>
                        ) : msg.mode === 'fallback' ? (
                          <span className="font-mono text-[9px] px-1.5 py-0.2 rounded border border-amber-500/30 text-amber-400/80 bg-amber-950/20 font-normal ml-1">
                            📜 Dahili Hafıza
                          </span>
                        ) : null}
                      </>
                    )}
                    <span className="font-mono text-[9px] text-zinc-600 ml-1">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div
                    className={`p-3.5 rounded-2xl max-w-[90%] font-mono text-xs leading-relaxed relative group ${
                      isUser
                        ? 'bg-zinc-800 text-zinc-100 rounded-tr-xs border border-zinc-700/60'
                        : 'bg-[#eebb55]/10 text-zinc-200 rounded-tl-xs border border-[#eebb55]/30'
                    }`}
                  >
                    {msg.text}

                    {!isUser && (
                      <button
                        onClick={() => onReplaySpeech(msg.text)}
                        className="mt-2 flex items-center gap-1 text-[10px] text-[#eebb55] hover:underline font-mono cursor-pointer opacity-80 group-hover:opacity-100 transition-opacity"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>Yeniden Seslendir</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950 font-mono text-[10px] text-zinc-500 text-center">
          Osmanlı Beyliği 1326 Pâyitaht Dijital Arşivi
        </div>

      </div>
    </div>
  );
};
