// Web Audio Synthesizer for Ambient Music and SFX

class SoundEngine {
  private ctx: AudioContext | null = null;
  private ambienceGain: GainNode | null = null;
  private isAmbiencePlaying = false;
  private ambienceOscillators: OscillatorNode[] = [];

  private reverbNode: ConvolverNode | null = null;
  private masterSFXGain: GainNode | null = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.setupReverbAndSFXBus();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Generate acoustic 1.8s courtyard & hall impulse response (3D space resonance)
  private setupReverbAndSFXBus() {
    if (!this.ctx) return;
    try {
      this.masterSFXGain = this.ctx.createGain();
      this.masterSFXGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.masterSFXGain.connect(this.ctx.destination);

      // Procedural acoustic Impulse Response (1.6s exponential spatial decay)
      const sampleRate = this.ctx.sampleRate;
      const length = sampleRate * 1.6;
      const impulseBuffer = this.ctx.createBuffer(2, length, sampleRate);
      const left = impulseBuffer.getChannelData(0);
      const right = impulseBuffer.getChannelData(1);

      for (let i = 0; i < length; i++) {
        const decay = Math.exp(-i / (sampleRate * 0.35));
        left[i] = (Math.random() * 2 - 1) * decay;
        right[i] = (Math.random() * 2 - 1) * decay;
      }

      this.reverbNode = this.ctx.createConvolver();
      this.reverbNode.buffer = impulseBuffer;

      const reverbGain = this.ctx.createGain();
      reverbGain.gain.setValueAtTime(0.35, this.ctx.currentTime); // 35% Wet spatial reverb

      this.reverbNode.connect(reverbGain);
      reverbGain.connect(this.masterSFXGain);
    } catch (e) {
      console.warn('Reverb setup error:', e);
    }
  }

  // Connect a sound node to the spatial audio bus (Dry + Acoustic Reverb)
  private connectToSpatialBus(node: AudioNode, gainLevel = 1.0) {
    if (!this.ctx || !this.masterSFXGain) return;
    const gNode = this.ctx.createGain();
    gNode.gain.setValueAtTime(gainLevel, this.ctx.currentTime);
    
    // Direct Dry path
    gNode.connect(this.masterSFXGain);

    // Wet Spatial Reverb path
    if (this.reverbNode) {
      gNode.connect(this.reverbNode);
    }

    node.connect(gNode);
  }

  // Toggle ambient historical drone synthesizer
  toggleAmbience(): boolean {
    this.initCtx();
    if (!this.ctx) return false;

    if (this.isAmbiencePlaying) {
      this.stopAmbience();
      return false;
    } else {
      this.startAmbience();
      return true;
    }
  }

  private ambienceTimer: any = null;
  private rhythmicLoopTimer: any = null;
  private rhythmStep = 0;

  startAmbience() {
    if (!this.ctx || this.isAmbiencePlaying) return;

    try {
      const now = this.ctx.currentTime;
      this.ambienceGain = this.ctx.createGain();
      this.ambienceGain.gain.setValueAtTime(0.001, now);
      // Master volume set to rich 0.50 level
      this.ambienceGain.gain.exponentialRampToValueAtTime(0.50, now + 2);
      this.ambienceGain.connect(this.ctx.destination);

      const createdSources: Array<AudioNode & { stop?: () => void }> = [];

      // 1. BURSA HİSARI & OBA RÜZGÂRI (Warm sweeping wind)
      const bufferSize = this.ctx.sampleRate * 3;
      const windBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = windBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.06;
        b6 = white * 0.115926;
      }

      const windNoise = this.ctx.createBufferSource();
      windNoise.buffer = windBuffer;
      windNoise.loop = true;

      const windFilter = this.ctx.createBiquadFilter();
      windFilter.type = 'bandpass';
      windFilter.frequency.setValueAtTime(340, now);
      windFilter.Q.setValueAtTime(1.4, now);

      const windLfo = this.ctx.createOscillator();
      const windLfoGain = this.ctx.createGain();
      windLfo.frequency.setValueAtTime(0.05, now);
      windLfoGain.gain.setValueAtTime(180, now);
      windLfo.connect(windLfoGain);
      windLfoGain.connect(windFilter.frequency);
      windLfo.start();

      const windGain = this.ctx.createGain();
      windGain.gain.setValueAtTime(0.4, now);

      windNoise.connect(windFilter);
      windFilter.connect(windGain);
      windGain.connect(this.ambienceGain);
      windNoise.start();
      createdSources.push(windNoise, windLfo);

      // 2. OBA OCAK ATEŞİ (Continuous Ember Crackle)
      const fireBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const fireData = fireBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        if (Math.random() < 0.0025) {
          fireData[i] = (Math.random() * 2 - 1) * 0.55;
        } else {
          fireData[i] = 0;
        }
      }

      const fireNoise = this.ctx.createBufferSource();
      fireNoise.buffer = fireBuffer;
      fireNoise.loop = true;

      const fireFilter = this.ctx.createBiquadFilter();
      fireFilter.type = 'highpass';
      fireFilter.frequency.setValueAtTime(1300, now);

      const fireGain = this.ctx.createGain();
      fireGain.gain.setValueAtTime(0.25, now);

      fireNoise.connect(fireFilter);
      fireFilter.connect(fireGain);
      fireGain.connect(this.ambienceGain);
      fireNoise.start();
      createdSources.push(fireNoise);

      // 3. OBA İNSAN / YAŞAM IRILDISI (Camp Murmur & Ambient Warmth)
      const murmurBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const murmurData = murmurBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        murmurData[i] = (Math.random() * 2 - 1) * 0.03;
      }
      const murmurNoise = this.ctx.createBufferSource();
      murmurNoise.buffer = murmurBuffer;
      murmurNoise.loop = true;
      const murmurFilter1 = this.ctx.createBiquadFilter();
      murmurFilter1.type = 'bandpass';
      murmurFilter1.frequency.setValueAtTime(450, now);
      murmurFilter1.Q.setValueAtTime(2.5, now);

      const murmurFilter2 = this.ctx.createBiquadFilter();
      murmurFilter2.type = 'bandpass';
      murmurFilter2.frequency.setValueAtTime(850, now);
      murmurFilter2.Q.setValueAtTime(3.0, now);

      const murmurGain = this.ctx.createGain();
      murmurGain.gain.setValueAtTime(0.25, now);

      murmurNoise.connect(murmurFilter1);
      murmurFilter1.connect(murmurFilter2);
      murmurFilter2.connect(murmurGain);
      murmurGain.connect(this.ambienceGain);
      murmurNoise.start();
      createdSources.push(murmurNoise);

      // 4. RAST MAKAMI NEY / OTAĞ DEMİ (D3 146.83Hz & A3 220Hz)
      const droneFreqs = [146.83, 220.0];
      droneFreqs.forEach((freq) => {
        const osc = this.ctx!.createOscillator();
        const lowpass = this.ctx!.createBiquadFilter();
        const dGain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        lowpass.type = 'lowpass';
        lowpass.frequency.setValueAtTime(420, now);

        dGain.gain.setValueAtTime(0.06, now);

        osc.connect(lowpass);
        lowpass.connect(dGain);
        dGain.connect(this.ambienceGain!);
        osc.start();
        createdSources.push(osc);
      });

      this.ambienceOscillators = createdSources as any;
      this.isAmbiencePlaying = true;
      this.rhythmStep = 0;

      // Start the synchronized Oba rhythm engine (Demirci örs dövme ritmi & devriye kudüm vuruşları)
      this.startSynchronizedObaRhythm();

    } catch (e) {
      console.error('Ambience start error:', e);
    }
  }

  // Ritmik Oba Çalışma Motoru (Demircilerin senkronize örs ritmi + kudüm devriyesi + kılıç talimi)
  private startSynchronizedObaRhythm() {
    if (!this.isAmbiencePlaying || !this.ctx) return;

    // 8-step synchronized Oba work loop (every 750ms step = 120bpm feel)
    const stepDuration = 750;

    const runRhythm = () => {
      if (!this.isAmbiencePlaying || !this.ctx) return;

      const step = this.rhythmStep % 16;
      this.rhythmStep++;

      // Step 0, 4, 8, 12: Demircinin Ağır Örs Vuruşu (Heavy Anvil Strike)
      if (step === 0 || step === 4 || step === 8 || step === 12) {
        this.playAnvilStrike();
      }
      // Step 1, 5, 9, 13: Demircinin Çekiç Sekme Tıkı (Rebound Tap)
      else if (step === 1 || step === 5 || step === 9 || step === 13) {
        this.playAnvilReboundTap();
      }

      // Step 0 & 8: Kudüm Devriye Ritmi (Rhythmic Kudüm Beat)
      if (step === 0 || step === 8) {
        this.playKudumHit();
      }

      // Step 6 & 14: Kılıç / Kalkan Talim Çınlaması (Periodic Sword Clash)
      if (step === 6 || step === 14) {
        if (Math.random() < 0.7) {
          this.playSwordClang();
        }
      }

      // Step 3 & 11: Hisar Kuş Cıvıltıları (Bird Chirps)
      if (step === 3 || step === 11) {
        if (Math.random() < 0.5) {
          this.playBursaBirdChirp();
        }
      }

      this.rhythmicLoopTimer = setTimeout(runRhythm, stepDuration);
    };

    runRhythm();
  }

  // Örs Üzerinde Çekiç Sekme Tıkı (Anvil Rebound Light Tap)
  playAnvilReboundTap() {
    this.initCtx();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(2100, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.08);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      this.connectToSpatialBus(gain, 0.4);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch (_) {}
  }

  // Örs & Demir Dövme Sesi (Blacksmith Anvil Strike - Multi-Modal Acoustic Iron Impact)
  playAnvilStrike() {
    this.initCtx();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const strikeGain = this.ctx.createGain();

      // 1. Hammer Impact Noise Transient
      const noiseBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.02, this.ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1);
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(2400, now);
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.5, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(strikeGain);
      noise.start(now);

      // 2. Heavy Iron Inharmonic Resonant Modes (940Hz, 1480Hz, 2150Hz, 3820Hz)
      const ironModes = [
        { freq: 940, gain: 0.6, decay: 0.7 },
        { freq: 1480, gain: 0.45, decay: 0.5 },
        { freq: 2150, gain: 0.35, decay: 0.35 },
        { freq: 3820, gain: 0.2, decay: 0.2 }
      ];

      ironModes.forEach((mode) => {
        const osc = this.ctx!.createOscillator();
        const g = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(mode.freq, now);
        g.gain.setValueAtTime(mode.gain, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + mode.decay);
        osc.connect(g);
        g.connect(strikeGain);
        osc.start(now);
        osc.stop(now + mode.decay + 0.05);
      });

      // 3. Low Iron Body Thud
      const bodyOsc = this.ctx.createOscillator();
      const bodyGain = this.ctx.createGain();
      bodyOsc.type = 'triangle';
      bodyOsc.frequency.setValueAtTime(180, now);
      bodyOsc.frequency.exponentialRampToValueAtTime(75, now + 0.15);
      bodyGain.gain.setValueAtTime(0.5, now);
      bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
      bodyOsc.connect(bodyGain);
      bodyGain.connect(strikeGain);
      bodyOsc.start(now);
      bodyOsc.stop(now + 0.18);

      // Route entire strike through Spatial Audio Bus (Reverb + Dry)
      this.connectToSpatialBus(strikeGain, 0.75);

    } catch (e) {
      console.error('Anvil strike error:', e);
    }
  }

  // Kudüm Vuruşu (Ottoman Resonant Kettle Drum Hit)
  playKudumHit() {
    this.initCtx();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const drumBus = this.ctx.createGain();
      
      // 1. Leather Stick Impact Click
      const noiseBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.012, this.ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1);
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.4, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.012);
      noise.connect(noiseGain);
      noiseGain.connect(drumBus);
      noise.start(now);

      // 2. Fundamental Membrane Pitch Drop (220 Hz to 68 Hz)
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(68, now + 0.28);
      gain.gain.setValueAtTime(0.75, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.connect(gain);
      gain.connect(drumBus);
      osc.start(now);
      osc.stop(now + 0.55);

      // 3. Membrane 1.59x Bessel Harmonic Overtone (110 Hz)
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(110, now);
      osc2.frequency.exponentialRampToValueAtTime(80, now + 0.35);
      gain2.gain.setValueAtTime(0.35, now);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc2.connect(gain2);
      gain2.connect(drumBus);
      osc2.start(now);
      osc2.stop(now + 0.45);

      // Connect drum to Spatial Bus
      this.connectToSpatialBus(drumBus, 0.85);

    } catch (e) {
      console.error('Kudum hit error:', e);
    }
  }

  // Kılıç & Kalkan Çınlaması (Realistic Sword & Shield Physical Acoustic Impact)
  playSwordClang() {
    this.initCtx();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const swordBus = this.ctx.createGain();
      const isShieldStrike = Math.random() > 0.4; // 60% shield strike, 40% blade parry

      // 1. Blade Air Swoosh (Swing before impact: -0.06s to 0s)
      const swooshBuffer = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * 0.08), this.ctx.sampleRate);
      const swooshData = swooshBuffer.getChannelData(0);
      for (let i = 0; i < swooshData.length; i++) {
        swooshData[i] = (Math.random() * 2 - 1) * Math.sin((i / swooshData.length) * Math.PI);
      }
      const swooshSrc = this.ctx.createBufferSource();
      swooshSrc.buffer = swooshBuffer;
      const swooshFilter = this.ctx.createBiquadFilter();
      swooshFilter.type = 'bandpass';
      swooshFilter.frequency.setValueAtTime(400, now);
      swooshFilter.frequency.exponentialRampToValueAtTime(1800, now + 0.07);
      const swooshGain = this.ctx.createGain();
      swooshGain.gain.setValueAtTime(0.4, now);
      swooshGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      swooshSrc.connect(swooshFilter);
      swooshFilter.connect(swooshGain);
      swooshGain.connect(swordBus);
      swooshSrc.start(now);

      // Impact timing (at now + 0.05s after swoosh starts)
      const t = now + 0.05;

      // 2. High Metallic Edge Scrape & Spark (Steel Friction Burst)
      const scrapeBuffer = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * 0.04), this.ctx.sampleRate);
      const scrapeData = scrapeBuffer.getChannelData(0);
      for (let i = 0; i < scrapeData.length; i++) {
        scrapeData[i] = (Math.random() * 2 - 1);
      }
      const scrapeSrc = this.ctx.createBufferSource();
      scrapeSrc.buffer = scrapeBuffer;
      const scrapeFilter = this.ctx.createBiquadFilter();
      scrapeFilter.type = 'highpass';
      scrapeFilter.frequency.setValueAtTime(3200, t);
      scrapeFilter.Q.setValueAtTime(2.5, t);
      const scrapeGain = this.ctx.createGain();
      scrapeGain.gain.setValueAtTime(0.7, t);
      scrapeGain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

      scrapeSrc.connect(scrapeFilter);
      scrapeFilter.connect(scrapeGain);
      scrapeGain.connect(swordBus);
      scrapeSrc.start(t);

      // 3. Forged Steel Blade Inharmonic Ringing Modes (Damascus / Yatağan Steel)
      const steelModes = isShieldStrike
        ? [
            { freq: 1680, gain: 0.55, decay: 0.4 },
            { freq: 2740, gain: 0.4, decay: 0.3 },
            { freq: 4120, gain: 0.25, decay: 0.2 }
          ]
        : [
            // Blade-on-Blade Parry (Richer metallic shimmer & long ring-down)
            { freq: 1850, gain: 0.6, decay: 0.65 },
            { freq: 2890, gain: 0.5, decay: 0.55 },
            { freq: 4350, gain: 0.35, decay: 0.4 },
            { freq: 5600, gain: 0.2, decay: 0.25 }
          ];

      steelModes.forEach((mode) => {
        const osc = this.ctx!.createOscillator();
        const g = this.ctx!.createGain();

        // Flexing Blade Vibrato LFO
        const vibrato = this.ctx!.createOscillator();
        const vibratoGain = this.ctx!.createGain();
        vibrato.frequency.setValueAtTime(42, t); // 42Hz steel blade flex vibration
        vibratoGain.gain.setValueAtTime(25, t);
        vibrato.connect(vibratoGain);
        vibratoGain.connect(osc.frequency);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(mode.freq, t);
        osc.frequency.exponentialRampToValueAtTime(mode.freq * 0.82, t + mode.decay);

        g.gain.setValueAtTime(mode.gain, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + mode.decay);

        vibrato.start(t);
        osc.connect(g);
        g.connect(swordBus);
        osc.start(t);
        osc.stop(t + mode.decay + 0.05);
        vibrato.stop(t + mode.decay + 0.05);
      });

      // 4. Heavy Oak Wood & Leather Shield Body Thud (if Shield strike)
      if (isShieldStrike) {
        const shieldThud = this.ctx.createOscillator();
        const thudGain = this.ctx.createGain();
        shieldThud.type = 'sine';
        shieldThud.frequency.setValueAtTime(190, t);
        shieldThud.frequency.exponentialRampToValueAtTime(48, t + 0.14);
        thudGain.gain.setValueAtTime(0.7, t);
        thudGain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

        shieldThud.connect(thudGain);
        thudGain.connect(swordBus);
        shieldThud.start(t);
        shieldThud.stop(t + 0.18);

        // Shield Leather Click Impact
        const clickBuffer = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * 0.015), this.ctx.sampleRate);
        const clickData = clickBuffer.getChannelData(0);
        for (let i = 0; i < clickData.length; i++) {
          clickData[i] = (Math.random() * 2 - 1);
        }
        const clickSrc = this.ctx.createBufferSource();
        clickSrc.buffer = clickBuffer;
        const clickFilter = this.ctx.createBiquadFilter();
        clickFilter.type = 'bandpass';
        clickFilter.frequency.setValueAtTime(950, t);
        const clickGain = this.ctx.createGain();
        clickGain.gain.setValueAtTime(0.5, t);
        clickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.015);

        clickSrc.connect(clickFilter);
        clickFilter.connect(clickGain);
        clickGain.connect(swordBus);
        clickSrc.start(t);
      }

      // Route through Spatial Reverberation Bus
      this.connectToSpatialBus(swordBus, 0.85);

    } catch (e) {
      console.error('Sword clang error:', e);
    }
  }

  // Bursa Kuş Sesleri (Nightingale FM Vibrato Chirps)
  playBursaBirdChirp() {
    this.initCtx();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const birdBus = this.ctx.createGain();
      const chirps = Math.floor(Math.random() * 3) + 2;

      for (let i = 0; i < chirps; i++) {
        const startTime = now + i * 0.13;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // Vibrato LFO
        const vibrato = this.ctx.createOscillator();
        const vibratoGain = this.ctx.createGain();
        vibrato.frequency.setValueAtTime(38, startTime);
        vibratoGain.gain.setValueAtTime(140, startTime);
        vibrato.connect(vibratoGain);

        osc.type = 'sine';
        const startFreq = 2600 + Math.random() * 500;
        osc.frequency.setValueAtTime(startFreq, startTime);
        osc.frequency.exponentialRampToValueAtTime(startFreq + 1000, startTime + 0.05);
        osc.frequency.exponentialRampToValueAtTime(startFreq - 100, startTime + 0.09);
        vibratoGain.connect(osc.frequency);

        gain.gain.setValueAtTime(0.2, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.09);

        vibrato.start(startTime);
        osc.connect(gain);
        gain.connect(birdBus);

        osc.start(startTime);
        osc.stop(startTime + 0.1);
        vibrato.stop(startTime + 0.1);
      }

      this.connectToSpatialBus(birdBus, 0.4);

    } catch (e) {
      console.error('Bird chirp error:', e);
    }
  }

  stopAmbience() {
    if (this.ambienceTimer) {
      clearTimeout(this.ambienceTimer);
      this.ambienceTimer = null;
    }
    if (this.rhythmicLoopTimer) {
      clearTimeout(this.rhythmicLoopTimer);
      this.rhythmicLoopTimer = null;
    }

    if (!this.ctx || !this.isAmbiencePlaying) return;

    if (this.ambienceGain) {
      this.ambienceGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.5);
      setTimeout(() => {
        this.ambienceOscillators.forEach((osc) => {
          try { osc.stop(); } catch (_) {}
        });
        this.ambienceOscillators = [];
        this.isAmbiencePlaying = false;
      }, 1500);
    } else {
      this.isAmbiencePlaying = false;
    }
  }

  playClick() {
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(220, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch (e) {
      // ignore
    }
  }
}

export const soundEngine = new SoundEngine();

export interface VoiceConfig {
  useElevenLabs: boolean;
  elevenLabsApiKey: string;
  elevenLabsVoiceId: string;
  pitch: number; // 0.5 to 1.0 (default 0.70 for natural deep male Turkish tone)
  rate: number;  // 0.7 to 1.1 (default 0.82 for regal pacing)
}

export const defaultVoiceConfig: VoiceConfig = {
  useElevenLabs: false,
  elevenLabsApiKey: '',
  elevenLabsVoiceId: 'mF7tIc9VLrznhGooGjaT', // Seyfullah - Tok & Derin Erkek Sesi
  pitch: 0.85,
  rate: 0.84,  // Vakur & ağırbaşlı Osmanlı Bey hitabet ritmi (çok hızlı değil, çok yavaş da değil)
};

let currentAudio: HTMLAudioElement | null = null;

// Helper to stop any active speech or playback
export function stopAllSpeech() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

// Web Audio Context for deep male voice DSP processing
let deepVoiceAudioCtx: AudioContext | null = null;

function applyDeepMaleVoiceFilter(audioElement: HTMLAudioElement) {
  try {
    // Keep normal natural human speaking speed
    audioElement.playbackRate = 1.0;

    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) {
      if (!deepVoiceAudioCtx) {
        deepVoiceAudioCtx = new AudioCtx();
      }
      if (deepVoiceAudioCtx.state === 'suspended') {
        deepVoiceAudioCtx.resume();
      }

      const source = deepVoiceAudioCtx.createMediaElementSource(audioElement);

      // Subtle EQ warmth: high clarity up to 8000Hz so speech is crisp and crystal clear
      const lowpass = deepVoiceAudioCtx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.value = 8000;

      // Mild +2dB bass warmth
      const bassBoost = deepVoiceAudioCtx.createBiquadFilter();
      bassBoost.type = 'lowshelf';
      bassBoost.frequency.value = 120;
      bassBoost.gain.value = 2.0;

      source.connect(lowpass);
      lowpass.connect(bassBoost);
      bassBoost.connect(deepVoiceAudioCtx.destination);
    }
  } catch (e) {
    console.warn('Voice filter warning:', e);
    try {
      audioElement.playbackRate = 1.0;
    } catch (_) {}
  }
}

// Helper to try Free Microsoft Edge Neural Turkish Male Voice (tr-TR-AhmetNeural - Deep Wise Male Voice)
async function tryMicrosoftEdgeTts(
  text: string,
  onStart?: (durationSeconds?: number) => void,
  onEnd?: () => void,
  onError?: () => void
): Promise<boolean> {
  try {
    const response = await fetch('/api/edge-tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voice: 'tr-TR-AhmetNeural', pitch: '-14Hz', rate: '-8%' }),
    });

    if (response.ok) {
      const blob = await response.blob();
      if (blob.size < 100) return false;
      const blobUrl = URL.createObjectURL(blob);
      const audio = new Audio(blobUrl);
      currentAudio = audio;

      audio.onplay = () => {
        const duration = audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)
          ? audio.duration
          : text.length * 0.075;
        if (onStart) onStart(duration);
      };

      audio.onended = () => {
        currentAudio = null;
        if (onEnd) onEnd();
      };

      audio.onerror = () => {
        currentAudio = null;
        if (onError) onError();
      };

      await audio.play();
      return true;
    }
  } catch (e) {
    console.warn('Microsoft Edge TTS notice:', e);
  }
  return false;
}

// Helper to try official Google Cloud Text-to-Speech REST API (tr-TR-Wavenet-B / tr-TR-Neural2-B Male Voices)
async function tryGoogleCloudTts(
  text: string,
  onStart?: (durationSeconds?: number) => void,
  onEnd?: () => void,
  onError?: () => void
): Promise<boolean> {
  try {
    const response = await fetch('/api/google-tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (response.ok) {
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const audio = new Audio(blobUrl);
      currentAudio = audio;

      audio.onplay = () => {
        const duration = audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)
          ? audio.duration
          : text.length * 0.085;
        if (onStart) onStart(duration);
      };

      audio.onended = () => {
        currentAudio = null;
        if (onEnd) onEnd();
      };

      audio.onerror = () => {
        currentAudio = null;
        if (onError) onError();
      };

      await audio.play();
      return true;
    }
  } catch (e) {
    console.warn('Google Cloud TTS endpoint notice:', e);
  }
  return false;
}

// Helper to try Free Google Neural Turkish TTS Endpoint with Deep Male Pitch Modulation
async function tryFreeGoogleTts(
  text: string,
  onStart?: (durationSeconds?: number) => void,
  onEnd?: () => void,
  onError?: () => void
): Promise<boolean> {
  try {
    const url = `/api/free-tts?text=${encodeURIComponent(text)}`;
    const response = await fetch(url);
    if (response.ok) {
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const audio = new Audio(blobUrl);
      currentAudio = audio;

      // Apply deep male baritone transformation filter
      applyDeepMaleVoiceFilter(audio);

      audio.onplay = () => {
        const duration = audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)
          ? audio.duration
          : text.length * 0.095;
        if (onStart) onStart(duration);
      };

      audio.onended = () => {
        currentAudio = null;
        if (onEnd) onEnd();
      };

      audio.onerror = () => {
        currentAudio = null;
        if (onError) onError();
      };

      await audio.play();
      return true;
    }
  } catch (e) {
    console.warn('Free Google TTS error:', e);
  }
  return false;
}

// Turkish Ottoman Phonetic Preprocessor for Natural Audio Intonation & Correct Dialect Reading
export function preprocessTurkishOttomanTTS(text: string): string {
  if (!text) return text;
  let t = text;

  // 1. Gazi -> Gaazi phonetic replacement for authentic oral Turkish pronunciation
  t = t.replace(/\b([Gg])azi\b/g, (m, g) => (g === "G" ? "Gaazi" : "gaazi"));
  t = t.replace(/\b([Gg])aziler\b/g, (m, g) => (g === "G" ? "Gaaziler" : "gaaziler"));
  t = t.replace(/\b([Gg])azileri\b/g, (m, g) => (g === "G" ? "Gaazileri" : "gaazileri"));
  t = t.replace(/\b([Gg])azilerimiz\b/g, (m, g) => (g === "G" ? "Gaazilerimiz" : "gaazilerimiz"));
  t = t.replace(/\b([Gg])azimizin\b/g, (m, g) => (g === "G" ? "Gaazimizin" : "gaazimizin"));
  t = t.replace(/\b([Gg])azimiz\b/g, (m, g) => (g === "G" ? "Gaazimiz" : "gaazimiz"));
  t = t.replace(/\b([Gg])azinin\b/g, (m, g) => (g === "G" ? "Gaazinin" : "gaazinin"));
  t = t.replace(/\b([Gg])aziye\b/g, (m, g) => (g === "G" ? "Gaaziye" : "gaaziye"));
  t = t.replace(/\b([Gg])aziden\b/g, (m, g) => (g === "G" ? "Gaaziden" : "gaaziden"));
  t = t.replace(/\b([Gg])aza\b/g, (m, g) => (g === "G" ? "Gaaza" : "gaaza"));
  t = t.replace(/\b([Gg])azam\b/g, (m, g) => (g === "G" ? "Gaazam" : "gaazam"));
  t = t.replace(/\b([Gg])azamız\b/g, (m, g) => (g === "G" ? "Gaazamız" : "gaazamız"));

  // 2. Fix English word collision in Turkish TTS engines: "nice" -> "niçe" (Turkish pronunciation instead of English "nays"/"nis")
  t = t.replace(/\b([Nn])ice\b/g, (m, n) => (n === "N" ? "Niçe" : "niçe"));

  // 3. Islam / İslâm -> Natural Turkish phonetic "İslam" (avoids 'islim' or mispronounced circumflexes)
  t = t.replace(/İsl[âa]m/g, "İslam");
  t = t.replace(/isl[âa]m/g, "islam");
  t = t.replace(/İsl[âa]mi/g, "İslami");
  t = t.replace(/isl[âa]mi/g, "islami");
  t = t.replace(/İsl[âa]mın/g, "İslamın");
  t = t.replace(/isl[âa]mın/g, "islamın");
  t = t.replace(/İsl[âa]ma/g, "İslama");
  t = t.replace(/isl[âa]ma/g, "islama");
  t = t.replace(/İsl[âa]mda/g, "İslamda");
  t = t.replace(/isl[âa]mda/g, "islamda");
  t = t.replace(/İsl[âa]mdan/g, "İslamdan");
  t = t.replace(/isl[âa]mdan/g, "islamdan");

  // 4. Normalize circumflexes so Edge / WebSpeech engines read naturally in local Turkish
  t = t.replace(/â/g, "a").replace(/Â/g, "A").replace(/î/g, "i").replace(/Î/g, "İ").replace(/û/g, "u").replace(/Û/g, "U");

  return t;
}

// Speak text order: Microsoft Edge Neural Male TTS (100% Free, High Quality) -> Google Cloud TTS -> ElevenLabs -> Web Speech API
export async function speakText(
  rawText: string,
  config: VoiceConfig = defaultVoiceConfig,
  onStart?: (durationSeconds?: number) => void,
  onEnd?: () => void,
  onError?: () => void,
  onBoundary?: (charIndex: number, charLength?: number) => void
) {
  stopAllSpeech();

  const text = preprocessTurkishOttomanTTS(rawText);

  // 1. Try Free Microsoft Edge Neural Turkish Male Voice (tr-TR-AhmetNeural)
  const edgeSuccess = await tryMicrosoftEdgeTts(text, onStart, onEnd, onError);
  if (edgeSuccess) return;

  // 2. Try Free Google Neural Turkish TTS Endpoint (Server-side, guaranteed fallback)
  const freeGSuccess = await tryFreeGoogleTts(text, onStart, onEnd, onError);
  if (freeGSuccess) return;

  // 3. Try official Google Cloud TTS (Male Wavenet / Neural2 Turkish voice)
  const gTtsSuccess = await tryGoogleCloudTts(text, onStart, onEnd, onError);
  if (gTtsSuccess) return;

  // 2. Try ElevenLabs / Server-side TTS proxy endpoint if an API key is available
  const localKey = typeof window !== 'undefined' ? (localStorage.getItem('elevenlabs_api_key') || undefined) : undefined;
  const hasElevenKey = Boolean(config.elevenLabsApiKey || localKey);

  if (config.useElevenLabs && hasElevenKey) {
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          apiKey: config.elevenLabsApiKey || localKey || undefined,
          voiceId: 'mF7tIc9VLrznhGooGjaT', // Seyfullah Tok Erkek Sesi
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        currentAudio = audio;

        audio.onplay = () => {
          const duration = audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)
            ? audio.duration
            : text.length * 0.085;
          if (onStart) onStart(duration);
        };

        audio.onended = () => {
          currentAudio = null;
          if (onEnd) onEnd();
        };

        audio.onerror = () => {
          currentAudio = null;
          fallbackWebSpeech(text, config, onStart, onEnd, onError, onBoundary);
        };

        try {
          await audio.play();
          return;
        } catch (playErr) {
          console.warn('ElevenLabs audio play failed, resorting to WebSpeech:', playErr);
          fallbackWebSpeech(text, config, onStart, onEnd, onError, onBoundary);
          return;
        }
      }
    } catch (e) {
      console.warn('ElevenLabs API unavailable:', e);
    }
  }

  // 3. Fallback to Web Speech API with strict Turkish male voice matching
  fallbackWebSpeech(text, config, onStart, onEnd, onError, onBoundary);
}

const femaleVoiceKeywords = [
  'yelda', 'filiz', 'female', 'zira', 'susan', 'viki', 'google',
  'deniz', 'seda', 'gül', 'ece', 'sibel', 'dilek', 'hande', 'hazal', 'yoldaş',
  'gökçe', 'woman', 'lady', 'girl', 'helena', 'catherine', 'eva', 'kadin', 'kadın',
  'victoria', 'samantha', 'karen', 'fiona', 'veena', 'yuri', 'monica',
  'linda', 'laura', 'amlie', 'anna', 'alice', 'joana', 'luciana', 'cortana', 'siri'
];

function isFemaleVoiceName(name: string): boolean {
  const lower = name.toLowerCase();
  return femaleVoiceKeywords.some((kw) => lower.includes(kw));
}

function fallbackWebSpeech(
  text: string,
  config: VoiceConfig,
  onStart?: (durationSeconds?: number) => void,
  onEnd?: () => void,
  onError?: () => void,
  onBoundary?: (charIndex: number, charLength?: number) => void
) {
  if (!('speechSynthesis' in window)) {
    if (onStart) onStart(text.length * 0.085);
    if (onEnd) onEnd();
    return;
  }

  window.speechSynthesis.cancel();

  const speakWithVoice = () => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'tr-TR';

    const voices = window.speechSynthesis.getVoices();
    const turkishVoices = voices.filter((v) => v.lang.toLowerCase().startsWith('tr'));

    const maleKeywords = ['ahmet', 'tolga', 'cem', 'hakan', 'emre', 'davut', 'murat', 'ali', 'can', 'male', 'erkek'];

    let selectedVoice = turkishVoices.find((v) =>
      maleKeywords.some((kw) => v.name.toLowerCase().includes(kw))
    );

    // If no explicit male named voice found, pick any turkish voice NOT matching female keywords
    if (!selectedVoice) {
      selectedVoice = turkishVoices.find((v) => !isFemaleVoiceName(v.name));
    }

    if (!selectedVoice && turkishVoices.length > 0) {
      selectedVoice = turkishVoices[0];
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    // Deep male pitch modulation (0.55 if female voice detected, 0.85 if male voice detected)
    utterance.pitch = selectedVoice ? (isFemaleVoiceName(selectedVoice.name) ? 0.55 : 0.85) : 0.60;
    utterance.rate = 0.95;

    utterance.onstart = () => {
      const estDuration = text.length * 0.07;
      if (onStart) onStart(estDuration);
    };

    utterance.onboundary = (event: SpeechSynthesisEvent) => {
      if (onBoundary) {
        const idx = event.charIndex;
        const len = event.charLength || 0;
        onBoundary(idx, len);
      }
    };

    utterance.onend = () => {
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      if (onError) onError();
    };

    window.speechSynthesis.speak(utterance);
  };

  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.onvoiceschanged = () => {
      speakWithVoice();
      window.speechSynthesis.onvoiceschanged = null;
    };
  } else {
    speakWithVoice();
  }
}
