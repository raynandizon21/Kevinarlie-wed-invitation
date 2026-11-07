// Background music: every audio file in src/assets/music plays in filename order and the playlist loops.
// With the folder empty, the synthesized melody below plays instead.

const musicFiles = import.meta.glob('../assets/music/*.{mp3,m4a,aac,ogg,wav}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;
const playlist = Object.keys(musicFiles)
  .sort()
  .map((k) => musicFiles[k]);

class WeddingMelodyPlayer {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private timer: number | null = null;
  private noteIndex = 0;
  private audio: HTMLAudioElement | null = null;
  private trackIndex = 0;

  private playTrack() {
    if (!this.audio) {
      this.audio = new Audio();
      this.audio.volume = 0.6;
      this.audio.loop = playlist.length === 1;
      this.audio.addEventListener('ended', () => {
        this.trackIndex = (this.trackIndex + 1) % playlist.length;
        this.audio!.src = playlist[this.trackIndex];
        if (this.isPlaying) void this.audio!.play().catch(() => {});
      });
      this.audio.src = playlist[0];
    }
    void this.audio.play().catch(() => {
      this.isPlaying = false;
    });
  }

  // Gentle pentatonic romantic melody notes in Hz (C major / A minor warm gentle chord progression)
  // C4, E4, G4, B4, C5, E5, D5, B4, A4, G4, E4, D4
  private melody = [
    { freq: 261.63, dur: 0.8 }, // C4
    { freq: 329.63, dur: 0.8 }, // E4
    { freq: 392.00, dur: 0.8 }, // G4
    { freq: 493.88, dur: 1.2 }, // B4
    { freq: 523.25, dur: 1.4 }, // C5
    { freq: 392.00, dur: 0.8 }, // G4
    { freq: 329.63, dur: 0.8 }, // E4
    { freq: 293.66, dur: 1.0 }, // D4
    { freq: 261.63, dur: 1.2 }, // C4
    { freq: 220.00, dur: 0.8 }, // A3
    { freq: 261.63, dur: 0.8 }, // C4
    { freq: 329.63, dur: 1.0 }, // E4
    { freq: 392.00, dur: 1.4 }, // G4
    { freq: 349.23, dur: 0.8 }, // F4
    { freq: 329.63, dur: 0.8 }, // E4
    { freq: 293.66, dur: 1.6 }, // D4
  ];

  public start() {
    if (this.isPlaying) return;
    if (playlist.length > 0) {
      this.isPlaying = true;
      this.playTrack();
      return;
    }
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!this.ctx) {
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      this.isPlaying = true;
      this.playNextNote();
    } catch {
      // Audio not supported or blocked by policy
    }
  }

  public stop() {
    this.isPlaying = false;
    this.audio?.pause();
    if (this.timer) {
      window.clearTimeout(this.timer);
      this.timer = null;
    }
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  private playNextNote() {
    if (!this.isPlaying || !this.ctx) return;

    const note = this.melody[this.noteIndex % this.melody.length];
    this.noteIndex++;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Warm soft acoustic sine/triangle blend
    osc.type = 'sine';
    osc.frequency.setValueAtTime(note.freq, now);

    // Warm envelope: soft attack, gentle decay
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.07, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + note.dur);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + note.dur + 0.05);

    // Add gentle overtone
    const overtone = this.ctx.createOscillator();
    const overGain = this.ctx.createGain();
    overtone.type = 'triangle';
    overtone.frequency.setValueAtTime(note.freq * 2, now);
    overGain.gain.setValueAtTime(0.0001, now);
    overGain.gain.exponentialRampToValueAtTime(0.015, now + 0.08);
    overGain.gain.exponentialRampToValueAtTime(0.0001, now + note.dur * 0.7);

    overtone.connect(overGain);
    overGain.connect(this.ctx.destination);
    overtone.start(now);
    overtone.stop(now + note.dur);

    this.timer = window.setTimeout(() => {
      this.playNextNote();
    }, (note.dur * 0.9) * 1000);
  }

  // Soft romantic chime when envelope seal opens
  public playOpenEnvelopeSound() {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!this.ctx) {
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      const now = this.ctx.currentTime;
      // Elegant sparkling harmonic chord (E5, G#5, B5, E6)
      const freqs = [659.25, 830.61, 987.77, 1318.51];
      freqs.forEach((f, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + idx * 0.08);

        gain.gain.setValueAtTime(0.0001, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.04, now + idx * 0.08 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 1.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 1.25);
      });
    } catch {
      // Audio not permitted
    }
  }
}

export const melodyPlayer = new WeddingMelodyPlayer();

