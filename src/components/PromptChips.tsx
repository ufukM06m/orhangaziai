import React from 'react';
import { MessageSquarePlus } from 'lucide-react';

interface PromptChipsProps {
  onSelectPrompt: (promptText: string) => void;
  disabled?: boolean;
}

const SUGGESTED_QUESTIONS = [
  { label: 'Bursa Fethi & Vasiyet', question: 'Bursa\'nın fethi ve pederiniz Osman Gazi\'nin vasiyeti nasıldı hünkârım?' },
  { label: 'Nilüfer Hatun & Aile', question: 'Zevceniz Nilüfer Hatun ve aileniz hakkında bilgi verir misiniz?' },
  { label: 'İlk Gümüş Akçe', question: 'İlk Osmanlı gümüş akçesini neden bastırdınız ve iktisadi önemi nedir?' },
  { label: 'İznik & İlim Medresesi', question: 'İznik Medresesi\'ni kurup Davud-i Kayserî\'yi atama gayeniz neydi?' },
  { label: 'Düzenli Ordu & Börk', question: 'Yaya ve Müsellem teşkilatını ve ak börk usulünü nasıl getirdiniz?' },
  { label: 'Rumeli & Çimpe Kalesi', question: 'Şehzade Süleyman Paşa önderliğinde Rumeli\'ye ilk geçiş nasıl oldu?' },
];

export const PromptChips: React.FC<PromptChipsProps> = ({ onSelectPrompt, disabled }) => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-1 sm:flex-wrap justify-start sm:justify-center">
        <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest hidden sm:inline mr-1 shrink-0">
          SUALLER:
        </span>
        {SUGGESTED_QUESTIONS.map((item, idx) => (
          <button
            key={idx}
            disabled={disabled}
            onClick={() => onSelectPrompt(item.question)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900/95 hover:bg-zinc-800 border border-zinc-700/60 hover:border-[#eebb55]/80 text-zinc-200 hover:text-[#eebb55] font-mono text-xs transition-all cursor-pointer shadow-md shrink-0 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MessageSquarePlus className="w-3.5 h-3.5 text-[#eebb55]" />
            <span className="whitespace-nowrap">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
