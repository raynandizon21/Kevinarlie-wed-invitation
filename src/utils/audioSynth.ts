// Background music: every audio file in src/assets/music plays in filename order and the playlist loops.

const musicFiles = import.meta.glob('../assets/music/*.{mp3,m4a,aac,ogg,wav}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;
const playlist = Object.keys(musicFiles)
  .sort()
  .map((k) => musicFiles[k]);

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
    void this.audio!.play().catch(() => {
      this.isPlaying = false;
    });
  }

  private ensureAudio() {
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
