import React, { useState } from 'react';
import { X, Mic, ShieldAlert, Smartphone, Globe, CheckCircle2, Keyboard, RefreshCw, AlertTriangle, ExternalLink } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface MobileMicHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetryMic: () => void;
  onOpenTextInput: () => void;
  errorMessage?: string;
}

export const MobileMicHelpModal: React.FC<MobileMicHelpModalProps> = ({
  isOpen,
  onClose,
  onRetryMic,
  onOpenTextInput,
  errorMessage,
}) => {
  const [activeTab, setActiveTab] = useState<'safari' | 'chrome' | 'general'>('safari');
  const [isTestingMic, setIsTestingMic] = useState(false);
  const [testResult, setTestResult] = useState<'idle' | 'success' | 'denied'>('idle');

  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

  if (!isOpen) return null;

  const handleOpenInNewTab = () => {
    soundEngine.playClick();
    window.open(window.location.href, '_blank');
  };

  const handleTestMicPermission = async () => {
    soundEngine.playClick();
    setIsTestingMic(true);
    setTestResult('idle');

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setTestResult('denied');
      setIsTestingMic(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop stream immediately after permission check
      stream.getTracks().forEach((track) => track.stop());
      setTestResult('success');
      setIsTestingMic(false);
      
      // Short delay before closing and starting recognition
      setTimeout(() => {
        onClose();
        onRetryMic();
      }, 700);
    } catch (err) {
      console.warn('Microphone permission test failed:', err);
      setTestResult('denied');
      setIsTestingMic(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl rounded-2xl border border-[#eebb55]/50 bg-zinc-950 p-5 sm:p-7 shadow-[0_0_60px_rgba(238,187,85,0.2)] max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700">
        
        {/* Close Button */}
        <button
          onClick={() => {
            soundEngine.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors cursor-pointer p-1 rounded-lg hover:bg-zinc-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-[#eebb55] shrink-0">
            <Mic className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-mono text-sm sm:text-base font-bold text-white uppercase tracking-wider">
                MOBİL MİKROFON VE SES İZNİ KILAVUZU
              </h2>
            </div>
            <p className="font-mono text-[11px] text-zinc-400">
              Google Chrome ve Safari tarayıcılarında mikrofon erişim çözümü
            </p>
          </div>
        </div>

        {/* Warning / Status Badge */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-800/60 text-red-200 text-xs font-mono flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-red-300">Tarayıcı Durumu: </span>
              {errorMessage}
            </div>
          </div>
        )}

        {/* Iframe Mobile Notice */}
        {isInIframe && (
          <div className="mb-4 p-3.5 rounded-xl bg-amber-950/70 border border-amber-600/70 text-amber-200 text-xs font-mono flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-start gap-2.5">
              <ExternalLink className="w-4 h-4 text-[#eebb55] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#eebb55]">Mobil İframe / Önizleme Kısıtlaması: </span>
                Mobil Safari ve Chrome, önizleme çerçevesi içinde ses mikrofona izin vermeyebilir. Doğrudan sekmede açarak tam mikrofona erişin.
              </div>
            </div>
            <button
              onClick={handleOpenInNewTab}
              className="w-full sm:w-auto px-3.5 py-1.5 rounded-lg bg-[#eebb55] hover:bg-[#ffc955] text-black font-bold text-xs whitespace-nowrap transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
            >
              <ExternalLink className="w-3.5 h-3.5 text-black" />
              <span>Yeni Sekmede Aç</span>
            </button>
          </div>
        )}

        {/* Tabs for Safari / Chrome / General */}
        <div className="flex items-center gap-2 mb-4 border-b border-zinc-800 pb-2 overflow-x-auto">
          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('safari');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs transition-all cursor-pointer ${
              activeTab === 'safari'
                ? 'bg-[#eebb55] text-black font-bold'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>iPhone (Safari)</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('chrome');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs transition-all cursor-pointer ${
              activeTab === 'chrome'
                ? 'bg-[#eebb55] text-black font-bold'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Android (Chrome)</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('general');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs transition-all cursor-pointer ${
              activeTab === 'general'
                ? 'bg-[#eebb55] text-black font-bold'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Diğer / İpuçları</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'safari' && (
          <div className="space-y-3 font-mono text-xs text-zinc-300 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/80 mb-5">
            <h3 className="font-bold text-[#eebb55] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              iPhone & iPad (Safari) İzin Adımları:
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-zinc-300 leading-relaxed pl-1">
              <li>
                Ekranın alt/üst kısmındaki adres çubuğunda yer alan <strong className="text-white border border-zinc-700 px-1 py-0.5 rounded bg-zinc-800">aA</strong> veya <strong className="text-white border border-zinc-700 px-1 py-0.5 rounded bg-zinc-800">🔒 Kilit</strong> ikonuna dokunun.
              </li>
              <li>
                Açılan menüde <strong className="text-white">Web Sitesi Ayarları</strong> (Website Settings) sekmesini seçin.
              </li>
              <li>
                <strong className="text-amber-300">Mikrofon</strong> seçeneğini <strong className="text-emerald-400">"İzin Ver" (Allow)</strong> olarak değiştirin.
              </li>
              <li>
                Aşağıdaki <strong className="text-[#eebb55]">"Mikrofon İznini Test Et & Başlat"</strong> butonuna dokunarak konuşmaya başlayın.
              </li>
            </ol>
          </div>
        )}

        {activeTab === 'chrome' && (
          <div className="space-y-3 font-mono text-xs text-zinc-300 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/80 mb-5">
            <h3 className="font-bold text-[#eebb55] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Android (Google Chrome) İzin Adımları:
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-zinc-300 leading-relaxed pl-1">
              <li>
                Adres çubuğundaki <strong className="text-white border border-zinc-700 px-1 py-0.5 rounded bg-zinc-800">🔒 Kilit</strong> ikonuna veya ayarlar simgesine dokunun.
              </li>
              <li>
                <strong className="text-white">İzinler (Permissions)</strong> başlığından <strong className="text-amber-300">Mikrofon</strong> seçeneğine girin.
              </li>
              <li>
                Mikrofon iznini <strong className="text-emerald-400">"İzin Ver" / "Açık"</strong> konumuna getirin.
              </li>
              <li>
                Sayfayı yenileyin veya aşağıdaki <strong className="text-[#eebb55]">"Mikrofon İznini Test Et & Başlat"</strong> butonuna dokunun.
              </li>
            </ol>
          </div>
        )}

        {activeTab === 'general' && (
          <div className="space-y-3 font-mono text-xs text-zinc-300 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/80 mb-5">
            <h3 className="font-bold text-[#eebb55] flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              iOS Chrome / Firefox veya İçiçe Tarayıcı Notu:
            </h3>
            <p className="leading-relaxed">
              Apple WebKit kuralları gereği, iPhone'daki <strong>Chrome</strong> veya <strong>Firefox</strong> gibi üçüncü parti tarayıcılarda ses tanıma API'si kısıtlanmış olabilir.
            </p>
            <p className="leading-relaxed text-amber-200">
              • Tam sesli iletişim için bu adresi <strong>Safari</strong> tarayıcısında açmanızı tavsiye ederiz.
            </p>
            <p className="leading-relaxed text-zinc-400">
              • Veyahut mikrofon kullanmadan <strong>"Yazılı Sual Sor"</strong> butonuna basarak Orhan Gazi ile kesintisiz yazışabilirsiniz.
            </p>
          </div>
        )}

        {/* Test Result Message */}
        {testResult === 'success' && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950 border border-emerald-700 text-emerald-300 font-mono text-xs flex items-center gap-2 animate-pulse">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Mikrofon izni başarıyla doğrulandı! Dinleme başlatılıyor...</span>
          </div>
        )}

        {testResult === 'denied' && (
          <div className="mb-4 p-3 rounded-xl bg-red-950 border border-red-800 text-red-300 font-mono text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span>Mikrofon izni henüz verilmedi. Lütfen tarayıcı ayarlarından mikrofona izin veriniz.</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-2">
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
              onOpenTextInput();
            }}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-zinc-200 font-mono text-xs transition-all cursor-pointer"
          >
            <Keyboard className="w-4 h-4 text-[#eebb55]" />
            <span>Yazılı Sual Sor (Alternatif)</span>
          </button>

          <button
            onClick={handleTestMicPermission}
            disabled={isTestingMic}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#eebb55] hover:bg-[#ffc955] text-black font-bold font-mono text-xs transition-all shadow-[0_0_20px_rgba(238,187,85,0.4)] disabled:opacity-50 cursor-pointer"
          >
            {isTestingMic ? (
              <RefreshCw className="w-4 h-4 animate-spin text-black" />
            ) : (
              <Mic className="w-4 h-4 text-black" />
            )}
            <span>{isTestingMic ? 'Test Ediliyor...' : 'Mikrofon İznini Test Et & Başlat'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
