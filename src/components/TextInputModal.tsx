import React, { useState } from 'react';
import { X, Send, Sparkles } from 'lucide-react';

interface TextInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (text: string) => void;
  disabled?: boolean;
}

export const TextInputModal: React.FC<TextInputModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  disabled,
}) => {
  const [inputVal, setInputVal] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || disabled) return;
    onSubmit(inputVal.trim());
    setInputVal('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-xl border border-[#eebb55]/40 bg-zinc-950 p-6 shadow-[0_0_50px_rgba(238,187,85,0.15)]">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-[#eebb55]" />
          <h2 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
            HÜNKÂR ORHAN GAZİ'YE SUAL
          </h2>
        </div>

        <p className="font-mono text-xs text-zinc-400 mb-4 leading-relaxed">
          Devletleşme dönemi, Bursa'nın fethi, teşkilatlanma veya ilk medrese hakkında merak ettiklerinizi doğrudan yazınız:
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <textarea
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Orhan Gazi'ye sualinizi buraya yazınız..."
              rows={3}
              autoFocus
              className="w-full rounded-lg bg-zinc-900/90 border border-zinc-700/80 p-3 font-mono text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#eebb55] focus:ring-1 focus:ring-[#eebb55] transition-all resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-zinc-500">
              Göndermek için Enter'a basınız
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-zinc-300 font-mono text-xs transition-colors cursor-pointer"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                disabled={!inputVal.trim() || disabled}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#eebb55] hover:bg-[#ffc955] text-black font-bold font-mono text-xs transition-all shadow-[0_0_15px_rgba(238,187,85,0.3)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Suali Arz Et</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
