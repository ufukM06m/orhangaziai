import React, { useState, useEffect } from 'react';
import { X, Sliders, Volume2, Key, Sparkles, Check, Lock } from 'lucide-react';
import { VoiceConfig } from '../utils/audio';
import { speakText, stopAllSpeech } from '../utils/audio';

interface VoiceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: VoiceConfig;
  onSaveConfig: (newConfig: VoiceConfig) => void;
}

export const VoiceSettingsModal: React.FC<VoiceSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  const [localConfig, setLocalConfig] = useState<VoiceConfig>(config);
  const [isPlayingTest, setIsPlayingTest] = useState<boolean>(false);
  const [availableWebVoices, setAvailableWebVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    setLocalConfig(config);
  }, [config, isOpen]);

  useEffect(() => {
    if ('speechSynthesis' in window) {
      const updateVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableWebVoices(voices.filter((v) => v.lang.includes('tr') || v.lang.includes('TR')));
      };
      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  if (!isOpen) return null;

  const handleTestVoice = () => {
    if (isPlayingTest) {
      stopAllSpeech();
      setIsPlayingTest(false);
      return;
    }

    setIsPlayingTest(true);
    const sampleText = "Selamun aleykum ey evlat! Ben Osman oğlu Orhan Gazi. Bursa fatihi, gazi ve beylik yadigârıyım. Kelamımızı vakur dinleyesin.";

    speakText(
      sampleText,
      localConfig,
      () => setIsPlayingTest(true),
      () => setIsPlayingTest(false),
      () => setIsPlayingTest(false)
    );
  };

  const handleSave = () => {
    onSaveConfig(localConfig);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl border border-[#eebb55]/40 bg-zinc-950 p-6 shadow-[0_0_50px_rgba(238,187,85,0.2)] max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-5">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-[#eebb55]" />
            <div>
              <h2 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
                ORHAN GAZİ SES VE HİTABET AYARLARI
              </h2>
              <p className="font-mono text-[11px] text-zinc-400">
                Erkek Sesi ve ElevenLabs Yapay Zekâ Ses Ayarları
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white transition-colors cursor-pointer rounded-lg hover:bg-zinc-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6 font-mono text-xs">
          
          {/* ElevenLabs Section */}
          <div className="p-4 rounded-xl border border-[#eebb55]/30 bg-[#eebb55]/5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#eebb55]" />
                <span className="font-bold text-white text-xs">ElevenLabs Yapay Zekâ Erkek Sesi</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localConfig.useElevenLabs}
                  onChange={(e) =>
                    setLocalConfig({ ...localConfig, useElevenLabs: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#eebb55]"></div>
              </label>
            </div>

            {/* Fixed Voice Information Card */}
            <div className="p-3.5 rounded-xl border border-[#eebb55]/40 bg-black/60 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white font-bold text-xs">
                  <Lock className="w-3.5 h-3.5 text-[#eebb55]" />
                  <span>SABİT ANA SES: Orhan Gazi Tok Erkek Sesi</span>
                </div>
                <span className="text-[9px] px-2 py-0.5 rounded font-bold bg-[#eebb55] text-black uppercase tracking-wider">
                  TEK SABİT SES
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Tüm kullanıcılar için sistem genelinde tek bir özel ses tanımlanmıştır. Ses seçme seçeneği kaldırılmıştır.
              </p>
              <div className="pt-1 flex items-center justify-between text-[10px] text-amber-300 font-mono">
                <span>Ses Kimliği (Voice ID):</span>
                <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-[#eebb55] font-bold">
                  mF7tIc9VLrznhGooGjaT
                </span>
              </div>
            </div>

            {localConfig.useElevenLabs && (
              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-[10px] text-zinc-400 mb-1.5 uppercase tracking-wider flex items-center gap-1">
                    <Key className="w-3 h-3 text-[#eebb55]" />
                    Özel ElevenLabs API Key (İsteğe Bağlı)
                  </label>
                  <input
                    type="password"
                    value={localConfig.elevenLabsApiKey}
                    onChange={(e) =>
                      setLocalConfig({ ...localConfig, elevenLabsApiKey: e.target.value })
                    }
                    placeholder="Kendi xi-api-key'inizi girebilirsiniz..."
                    className="w-full rounded-lg bg-zinc-900 border border-zinc-700/80 p-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#eebb55]"
                  />
                  <span className="text-[10px] text-zinc-500 mt-1 block">
                    Boş bırakılırsa sunucudaki varsayılan API anahtarı kullanılır.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Fallback Web Speech Erkek Ton Modu */}
          <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-4">
            <h3 className="font-bold text-white text-xs flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-[#eebb55]" />
              Tarayıcı Erkek Tonu Ayarları (Web Speech Fallback)
            </h3>
            <p className="text-[11px] text-zinc-400">
              ElevenLabs kapalı olduğunda veya internet erişimi kısıtlıysa, tarayıcı sesi derin erkek frekansına (Pitch Shift: 0.52) düşürülerek Orhan Bey üslubuna uydurulur.
            </p>

            {/* Pitch Slider */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-zinc-300">Ses Derinliği (Pitch - Tok Erkek Tonu):</span>
                <span className="text-[#eebb55] font-bold">{localConfig.pitch.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.30"
                max="0.80"
                step="0.02"
                value={localConfig.pitch}
                onChange={(e) =>
                  setLocalConfig({ ...localConfig, pitch: parseFloat(e.target.value) })
                }
                className="w-full accent-[#eebb55] cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-zinc-500 mt-0.5">
                <span>Çok Tok / Kalın Bey Sesi (0.30)</span>
                <span>Standart (0.80)</span>
              </div>
            </div>

            {/* Speech Rate Slider */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-zinc-300">Hitabet Hızı (Rate):</span>
                <span className="text-[#eebb55] font-bold">{localConfig.rate.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.75"
                max="1.15"
                step="0.02"
                value={localConfig.rate}
                onChange={(e) =>
                  setLocalConfig({ ...localConfig, rate: parseFloat(e.target.value) })
                }
                className="w-full accent-[#eebb55] cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-zinc-500 mt-0.5">
                <span>Ağırbaşlı / Vakur (0.75)</span>
                <span>Akıcı (1.15)</span>
              </div>
            </div>

            {availableWebVoices.length > 0 && (
              <div>
                <span className="text-[10px] text-zinc-500 block mb-1">
                  Algılanan Türkçe Tarayıcı Sesleri ({availableWebVoices.length}):
                </span>
                <ul className="text-[10px] text-zinc-400 space-y-0.5 max-h-20 overflow-y-auto">
                  {availableWebVoices.map((v, i) => (
                    <li key={i} className="flex items-center gap-1">
                      <span className="text-emerald-400">✓</span> {v.name} ({v.lang})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Test & Save Actions */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleTestVoice}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-zinc-200 font-mono text-xs transition-colors cursor-pointer"
            >
              <Volume2 className={`w-3.5 h-3.5 text-[#eebb55] ${isPlayingTest ? 'animate-bounce' : ''}`} />
              <span>{isPlayingTest ? 'Durdur' : 'Sesi Dinle / Test Et'}</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#eebb55] hover:bg-[#ffc955] text-black font-bold font-mono text-xs transition-all shadow-[0_0_15px_rgba(238,187,85,0.3)] cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Ayarları Kaydet</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
