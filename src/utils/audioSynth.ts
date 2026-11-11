// Background music: every audio file in src/assets/music plays in filename order and the playlist loops.

const musicFiles = import.meta.glob('../assets/music/*.{mp3,m4a,aac,ogg,wav}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;
const playlist = Object.keys(musicFiles)
  .sort()
  .map((k) => musicFiles[k]);

// The track opens with about 2 s of silence, so every play (first start, loop, next track) skips it
const START_AT = 2;

class WeddingMelodyPlayer {
  private isPlaying = false;
  private audio: HTMLAudioElement | null = null;
  private trackIndex = 0;

  // Called inside the envelope tap: a silent play/pause there lets start() play later without a tap (iOS)
  public unlock() {
    if (playlist.length === 0) return;
    this.ensureAudio();
    const audio = this.audio!;
    audio.muted = true;
    void audio
      .play()
      .then(() => {
        if (!this.isPlaying) audio.pause();
      })
      .catch(() => {})
      .finally(() => {
        audio.muted = false;
      });
  }

  public start() {
    if (this.isPlaying || playlist.length === 0) return;
    this.isPlaying = true;
    this.ensureAudio();
    this.skipIntro();
    void this.audio!.play().catch(() => {
      this.isPlaying = false;
    });
  }

  // Jump past the silent intro (once the file's length is known)
  private skipIntro() {
    const audio = this.audio!;
    if (audio.readyState >= 1 && audio.currentTime < START_AT && audio.duration > START_AT) audio.currentTime = START_AT;
  }

  private ensureAudio() {
    if (!this.audio) {
      this.audio = new Audio();
      this.audio.volume = 0.6;
      // No native loop: it would restart at 0 (the silent part); 'ended' restarts past the intro instead
      this.audio.loop = false;
      this.audio.addEventListener('loadedmetadata', () => this.skipIntro());
      this.audio.addEventListener('ended', () => {
        const next = (this.trackIndex + 1) % playlist.length;
        if (next !== this.trackIndex) {
          this.trackIndex = next;
          this.audio!.src = playlist[next];
        } else {
          this.audio!.currentTime = START_AT;
        }
        if (this.isPlaying) void this.audio!.play().catch(() => {});
      });
      this.audio.src = playlist[0];
    }
  }

  public stop() {
    this.isPlaying = false;
    this.audio?.pause();
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    }
    this.start();
    return this.isPlaying;
  }
}

export const melodyPlayer = new WeddingMelodyPlayer();
