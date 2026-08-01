import { useState, useEffect, useRef } from 'react';
import { ChatMessage, VoiceState } from './types';
import { SpatialScene } from './components/SpatialScene';
import { TopHeaderNav } from './components/TopHeaderNav';
import { VoiceController } from './components/VoiceController';
import { PromptChips } from './components/PromptChips';
import { TextInputModal } from './components/TextInputModal';
import { HistoricalArchivesModal } from './components/HistoricalArchivesModal';
import { ChatHistoryDrawer } from './components/ChatHistoryDrawer';
import { soundEngine, speakText, defaultVoiceConfig, VoiceConfig } from './utils/audio';

export default function App() {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [subtitleText, setSubtitleText] = useState<string>(
    '> Ben Osman oğlu Orhan. Bursa Fatihi, Beylik yadigârı sana hitap ediyor. Konuşmak için mikrofona dokun...'
  );
  const [statusLabelText, setStatusLabelText] = useState<string>('SESLİ İLETİŞİM');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [voiceConfig, setVoiceConfig] = useState<VoiceConfig>(defaultVoiceConfig);

  // Modals & Drawers
  const [isAmbienceActive, setIsAmbienceActive] = useState<boolean>(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isTextInputOpen, setIsTextInputOpen] = useState<boolean>(false);

  // Speech Recognition Ref
  const recognitionRef = useRef<any>(null);
  const typeIntervalRef = useRef<any>(null);

  useEffect(() => {
    // Initialize Speech Recognition if supported
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.lang = 'tr-TR';
      rec.interimResults = false;
      rec.maxAlternatives = 1;

      rec.onresult = async (event: any) => {
        const userSpeech = event.results[0][0]?.transcript;
        if (!userSpeech) return;

        soundEngine.playClick();
        handleUserMessage(userSpeech);
      };

      rec.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setVoiceState('idle');

        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setStatusLabelText('MİKROFON İZNİ VERİLMEDİ');
          typeWriterInstant('> Mobil tarayıcı mikrofon izni vermedi. Lütfen adres çubuğundaki kilit ikonuna basıp mikrofona izin veriniz.');
        } else if (event.error === 'network') {
          setStatusLabelText('BAĞLANTI UYARISI');
          typeWriterInstant('> Ses tanıma ağına ulaşılamadı. "Yazı İle Sual Sor" seçeneğini kullanabilirsiniz.');
        } else if (event.error === 'no-speech') {
          setStatusLabelText('SES ALINAMADI');
          typeWriterInstant('> Mikrofondan ses alınamadı. Lütfen daha yakın ve yüksek sesle söyleyiniz...');
        } else {
          setStatusLabelText('SES ALINAMADI');
          typeWriterInstant('> Sualiniz tam anlaşılamadı. Dilerseniz mikrofona tekrar basın veya yazarak iletin...');
        }

        setTimeout(() => {
          setStatusLabelText('SESLİ İLETİŞİM');
        }, 4000);
      };

      rec.onend = () => {
        // Managed by handleUserMessage or reset
      };

      recognitionRef.current = rec;
    }

    return () => {
      if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, []);

  // Synced typewriter effect helper matching spoken audio duration
  const typeWriterSynced = (fullText: string, durationSeconds?: number) => {
    if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
    
    const targetText = `> ${fullText}`;
    let i = 0;
    setSubtitleText('');

    const textLength = targetText.length;
    // Calculate ms per character to match audio duration
    const estDurationMs = (durationSeconds && durationSeconds > 0)
      ? durationSeconds * 1000
      : textLength * 70;

    const intervalMs = Math.max(18, Math.floor(estDurationMs / textLength));

    typeIntervalRef.current = setInterval(() => {
      if (i <= targetText.length) {
        setSubtitleText(targetText.substring(0, i));
        i++;
      } else {
        if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
      }
    }, intervalMs);
  };

  const typeWriterInstant = (text: string) => {
    if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
    setSubtitleText(text);
  };

  // Process user question (from voice or text input)
  const handleUserMessage = async (userText: string) => {
    // Stop recording if active
    if (recognitionRef.current && voiceState === 'listening') {
      try { recognitionRef.current.stop(); } catch (_) {}
    }

    const newUserMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: userText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setVoiceState('thinking');
    setStatusLabelText('HÜNKÂR DÜŞÜNÜYOR...');
    typeWriterInstant(`> "${userText}"`);

    try {
      // Send request to server-side Gemini API route
      const historyPayload = messages.map((m) => ({
        role: m.role,
        parts: [{ text: m.text }],
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: historyPayload,
        }),
      });

      const data = await res.json();
      const replyText = data.reply || 'Sözümüz vakte takıldı ey gazi. Sualini bir kez daha yöneltesin.';

      const newModelMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: replyText,
        timestamp: new Date(),
        mode: data.mode === 'gemini' ? 'gemini' : 'fallback',
      };

      setMessages((prev) => [...prev, newModelMsg]);

      // Prepare speech synthesis & start typewriter ONLY when audio actually begins playing
      typeWriterInstant('> Hünkâr kelâmını hitap ediyor...');

      speakText(
        replyText,
        voiceConfig,
        (durationSeconds) => {
          // EXECUTED EXACTLY WHEN AUDIO SOUND STARTS IN SPEAKER
          setVoiceState('speaking');
          setStatusLabelText('HÜNKÂR HİTAP EDİYOR');
          typeWriterSynced(replyText, durationSeconds);
        },
        () => {
          // EXECUTED WHEN AUDIO SPEECH FINISHES
          if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
          setSubtitleText(`> ${replyText}`);
          setVoiceState('idle');
          setStatusLabelText('SESLİ İLETİŞİM');
        },
        () => {
          // FALLBACK / ERROR
          if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
          setSubtitleText(`> ${replyText}`);
          setVoiceState('idle');
          setStatusLabelText('SESLİ İLETİŞİM');
        },
        (charIndex, charLength) => {
          // REAL-TIME VOICE-TEXT BOUNDARY SYNCHRONIZATION
          if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
          const currentBoundaryText = replyText.substring(0, charIndex + (charLength || 4));
          setSubtitleText(`> ${currentBoundaryText}`);
        }
      );
    } catch (err) {
      console.error('API Error:', err);
      setVoiceState('error');
      setStatusLabelText('BAĞLANTI AKSADI');
      typeWriterInstant('> Bağlantıda bir aksaklık oldu. Tekrar sual edebilirsiniz.');

      setTimeout(() => {
        setVoiceState('idle');
        setStatusLabelText('SESLİ İLETİŞİM');
      }, 3500);
    }
  };

  // Toggle Microphone with Mobile Permission Prompt Support
  const handleToggleMic = async () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    soundEngine.playClick();

    if (voiceState === 'listening') {
      try {
        recognitionRef.current?.stop();
      } catch (_) {}
      setVoiceState('idle');
      setStatusLabelText('SESLİ İLETİŞİM');
      return;
    }

    // Step 1: Explicitly request browser microphone permission via getUserMedia
    // This triggers native iOS Safari and Android Chrome permission dialogs
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Permission granted! Stop dummy stream tracks immediately so speech recognition can use mic
        stream.getTracks().forEach((track) => track.stop());
      } catch (err: any) {
        console.warn('Microphone permission error:', err);
        setStatusLabelText('MİKROFON İZNİ GEREKLİ');
        typeWriterInstant('> Mobil cihazınızda mikrofon izni verilmedi. Lütfen adres çubuğundaki kilit simgesinden mikrofona izin veriniz.');
        setVoiceState('idle');
        return;
      }
    }

    // Step 2: Fallback SpeechRecognition initialization if not set
    if (!recognitionRef.current) {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.lang = 'tr-TR';
        rec.interimResults = false;
        rec.maxAlternatives = 1;
        rec.onresult = async (event: any) => {
          const userSpeech = event.results[0][0]?.transcript;
          if (!userSpeech) return;
          soundEngine.playClick();
          handleUserMessage(userSpeech);
        };
        rec.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setVoiceState('idle');
          if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            setStatusLabelText('MİKROFON İZNİ VERİLMEDİ');
            typeWriterInstant('> Mobil tarayıcı mikrofon izni vermedi.');
          } else {
            setStatusLabelText('SES ALINAMADI');
            typeWriterInstant('> Mikrofondan ses alınamadı. Lütfen tekrar deneyiniz...');
          }
          setTimeout(() => setStatusLabelText('SESLİ İLETİŞİM'), 3500);
        };
        recognitionRef.current = rec;
      } else {
        setStatusLabelText('SES DESTEKLENMİYOR');
        typeWriterInstant('> Bu mobil tarayıcıda ses tanıma desteklenmiyor. "Yazı İle Sual Sor" kutusuna yönlendiriliyorsunuz...');
        setTimeout(() => setIsTextInputOpen(true), 1200);
        return;
      }
    }

    try {
      // Abort previous instances if active
      try { recognitionRef.current.abort(); } catch (_) {}

      setTimeout(() => {
        try {
          recognitionRef.current?.start();
          setVoiceState('listening');
          setStatusLabelText('SİZİ DİNLİYOR...');
          typeWriterInstant('> Sizi dinliyoruz, sualinizi mikrofona iletiniz...');
        } catch (e) {
          console.warn('Recognition start exception:', e);
          setVoiceState('listening');
          setStatusLabelText('SİZİ DİNLİYOR...');
        }
      }, 80);
    } catch (e) {
      console.error('Mic toggle error:', e);
    }
  };

  const handleToggleAmbience = () => {
    soundEngine.playClick();
    const active = soundEngine.toggleAmbience();
    setIsAmbienceActive(active);
  };

  const handleClearHistory = () => {
    soundEngine.playClick();
    setMessages([]);
  };

  const handleReplaySpeech = (text: string) => {
    soundEngine.playClick();
    setVoiceState('thinking');
    setStatusLabelText('HÜNKÂR HİTAP EDİYOR...');
    typeWriterInstant('> Hünkâr kelâmını hitap ediyor...');
    speakText(
      text,
      voiceConfig,
      (durationSeconds) => {
        setVoiceState('speaking');
        setStatusLabelText('HÜNKÂR HİTAP EDİYOR');
        typeWriterSynced(text, durationSeconds);
      },
      () => {
        if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
        setSubtitleText(`> ${text}`);
        setVoiceState('idle');
        setStatusLabelText('SESLİ İLETİŞİM');
      },
      () => {
        if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
        setSubtitleText(`> ${text}`);
        setVoiceState('idle');
        setStatusLabelText('SESLİ İLETİŞİM');
      },
      (charIndex, charLength) => {
        if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
        const currentBoundaryText = text.substring(0, charIndex + (charLength || 4));
        setSubtitleText(`> ${currentBoundaryText}`);
      }
    );
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#050505] text-white select-none">
      
      {/* Top Header Navigation */}
      <TopHeaderNav
        isAmbienceActive={isAmbienceActive}
        onToggleAmbience={handleToggleAmbience}
        onOpenArchives={() => {
          soundEngine.playClick();
          setIsArchiveOpen(true);
        }}
        onOpenHistory={() => {
          soundEngine.playClick();
          setIsHistoryOpen(true);
        }}
        onOpenTextInput={() => {
          soundEngine.playClick();
          setIsTextInputOpen(true);
        }}
        historyCount={messages.length}
      />

      {/* 3D Interactive Parallax Scene */}
      <SpatialScene
        voiceState={voiceState}
        onPortalClick={() => {
          soundEngine.playClick();
          setIsTextInputOpen(true);
        }}
      />

      {/* Floating Prompt Chips over scene */}
      <div className="fixed bottom-36 sm:bottom-40 left-0 w-full z-30 pointer-events-auto">
        <PromptChips
          onSelectPrompt={handleUserMessage}
          disabled={voiceState === 'listening' || voiceState === 'thinking'}
        />
      </div>

      {/* Bottom Voice & Subtitle Controller Bar */}
      <VoiceController
        voiceState={voiceState}
        subtitleText={subtitleText}
        onToggleMic={handleToggleMic}
        statusLabelText={statusLabelText}
      />

      {/* Text Input Modal */}
      <TextInputModal
        isOpen={isTextInputOpen}
        onClose={() => setIsTextInputOpen(false)}
        onSubmit={handleUserMessage}
        disabled={voiceState === 'thinking'}
      />

      {/* Historical Archives Modal */}
      <HistoricalArchivesModal
        isOpen={isArchiveOpen}
        onClose={() => setIsArchiveOpen(false)}
        onAskMilestoneQuestion={handleUserMessage}
      />

      {/* Conversation History Drawer */}
      <ChatHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        messages={messages}
        onClearHistory={handleClearHistory}
        onReplaySpeech={handleReplaySpeech}
      />

    </div>
  );
}
