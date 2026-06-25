let audioCtx = null;
let muted = false;

// Safe init audio on user interaction to comply with autoplay policy
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
  playBeep(frequency = 800, type = 'sine', duration = 0.05, volume = 0.1) {
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
    this.playBeep(1300, 'sine', 0.02, 0.015);
  },
  
  playClick() {
    this.playBeep(1800, 'sine', 0.06, 0.05);
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

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(250, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1400, audioCtx.currentTime + 1.2);

      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
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
      // Synthesize a pleasant high-tech chime arpeggio
      const notes = [587.33, 783.99, 1174.66]; // D5, G5, D6
      notes.forEach((freq, index) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + index * 0.08);
        gain.gain.setValueAtTime(0, now);
        gain.gain.setValueAtTime(0.04, now + index * 0.08);
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
      // Low dual alarm alert tones
      const frequencies = [200, 240];
      frequencies.forEach(freq => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.linearRampToValueAtTime(freq + 30, now + 0.12);
        osc.frequency.linearRampToValueAtTime(freq, now + 0.25);

        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

        osc.start();
        osc.stop(now + 0.4);
      });
    } catch (e) {}
  }
};
