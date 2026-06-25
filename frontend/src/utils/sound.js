let audioCtx = null;
let muted = false;

function initAudio() {
  if (typeof window === 'undefined') return;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

export const soundManager = {
  setMuted(val) {
    muted = val;
  },
  isMuted() {
    return muted;
  },
  playBeep(frequency = 800, type = 'sine', duration = 0.05, volume = 0.08) {
    if (muted) return;
    try {
      initAudio();
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);

      gain.gain.setValueAtTime(volume, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Fail silently (e.g. browser context restrictions)
    }
  },
  
  playHover() {
    // Elegant high-pitched hover sound (like glass contact)
    this.playBeep(1500, 'sine', 0.02, 0.012);
  },
  
  playClick() {
    // Sharp selective sound
    this.playBeep(2100, 'sine', 0.04, 0.04);
  },
  
  playSweep() {
    if (muted) return;
    try {
      initAudio();
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1800, audioCtx.currentTime + 1.2);

      gain.gain.setValueAtTime(0.03, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.2);

      osc.start();
      osc.stop(audioCtx.currentTime + 1.2);
    } catch (e) {}
  },
  
  playSuccess() {
    if (muted) return;
    try {
      initAudio();
      if (!audioCtx) return;
      const now = audioCtx.currentTime;
      // High-pitched pleasant glass chime arpeggio
      const notes = [659.25, 880.00, 1318.51]; // E5, A5, E6
      notes.forEach((freq, index) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + index * 0.08);
        gain.gain.setValueAtTime(0, now);
        gain.gain.setValueAtTime(0.03, now + index * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.08 + 0.35);

        osc.start(now + index * 0.08);
        osc.stop(now + index * 0.08 + 0.4);
      });
    } catch (e) {}
  },
  
  playWarning() {
    if (muted) return;
    try {
      initAudio();
      if (!audioCtx) return;
      const now = audioCtx.currentTime;
      // Distinct double tone alarm (higher and cleaner than a dark buzzer)
      const frequencies = [330, 392]; // E4, G4
      frequencies.forEach(freq => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.linearRampToValueAtTime(freq + 40, now + 0.12);
        osc.frequency.linearRampToValueAtTime(freq, now + 0.25);

        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

        osc.start();
        osc.stop(now + 0.4);
      });
    } catch (e) {}
  }
};
