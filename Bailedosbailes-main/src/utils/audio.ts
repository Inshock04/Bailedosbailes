// Gerenciador de Áudio com Trilha Sonora Oficial American Horror Story: Hotel
// Executa o áudio enviado nos assets em loop infinito contínuo

class AudioManager {
  private ctx: AudioContext | null = null;
  private bgAudio: HTMLAudioElement | null = null;
  private isMusicPlaying = false;
  private isMuted = false;
  private hasUserInteracted = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.setupBgAudio();
    }
  }

  private setupBgAudio() {
    try {
      // Carrega o áudio oficial de American Horror Story Hotel localizado em public/audio
      this.bgAudio = new Audio('/audio/ahs_hotel_theme.mp3');
      this.bgAudio.loop = true; // Repetir em loop
      this.bgAudio.volume = 0.65; // Volume confortável para trilha ambiente
      this.bgAudio.preload = 'auto';

      // Garantia dupla de repetição contínua em loop para compatibilidade cross-browser
      this.bgAudio.addEventListener('ended', () => {
        if (this.isMusicPlaying && this.bgAudio) {
          this.bgAudio.currentTime = 0;
          this.bgAudio.play().catch(() => {});
        }
      });
    } catch (e) {
      console.warn('[Audio] Não foi possível inicializar o elemento de áudio:', e);
    }
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // 8-bit Square Wave Tone Generator para efeitos sonoros de interface (clique, hover, etc.)
  playTone(freq: number, duration: number, type: OscillatorType = 'square', gainLevel = 0.08) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(gainLevel, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Restrições de autoplay do navegador antes de interação
    }
  }

  // Efeitos Sonoros de UI
  playClick() {
    this.playTone(520, 0.06, 'square', 0.05);
  }

  playHover() {
    this.playTone(330, 0.03, 'triangle', 0.03);
  }

  playDoorOpen() {
    if (this.isMuted) return;
    this.playTone(180, 0.1, 'sawtooth', 0.06);
    setTimeout(() => this.playTone(220, 0.12, 'sawtooth', 0.06), 70);
    setTimeout(() => this.playTone(290, 0.25, 'triangle', 0.07), 150);
  }

  playCardFlip() {
    if (this.isMuted) return;
    this.playTone(440, 0.06, 'square', 0.05);
    setTimeout(() => this.playTone(660, 0.08, 'square', 0.06), 60);
    setTimeout(() => this.playTone(880, 0.15, 'triangle', 0.07), 120);
  }

  playSuccess() {
    if (this.isMuted) return;
    const notes = [440, 554, 659, 880];
    notes.forEach((note, idx) => {
      setTimeout(() => this.playTone(note, 0.18, 'square', 0.08), idx * 100);
    });
  }

  playError() {
    if (this.isMuted) return;
    this.playTone(220, 0.15, 'sawtooth', 0.09);
    setTimeout(() => this.playTone(175, 0.25, 'sawtooth', 0.09), 120);
  }

  /**
   * Alterna a reprodução da trilha sonora oficial de American Horror Story Hotel.
   * Quando ativa, roda em loop infinito ininterrupto.
   */
  toggleMusic(onStateChange?: (playing: boolean) => void): boolean {
    this.hasUserInteracted = true;
    this.initContext();

    if (this.isMusicPlaying) {
      this.stopMusic();
      if (onStateChange) onStateChange(false);
      return false;
    } else {
      this.startMusic();
      if (onStateChange) onStateChange(true);
      return true;
    }
  }

  getMusicState(): boolean {
    return this.isMusicPlaying;
  }

  /**
   * Inicia a reprodução do tema de AHS Hotel em loop contínuo
   */
  startMusic() {
    if (!this.bgAudio) {
      this.setupBgAudio();
    }

    if (!this.bgAudio) return;

    this.initContext();
    this.isMusicPlaying = true;
    this.bgAudio.loop = true;

    this.bgAudio.play().catch((err) => {
      console.log('[Audio] Autoplay bloqueado pelo navegador até o primeiro clique do usuário:', err);
      this.isMusicPlaying = false;
    });
  }

  /**
   * Pausa a trilha sonora
   */
  stopMusic() {
    this.isMusicPlaying = false;
    if (this.bgAudio) {
      this.bgAudio.pause();
    }
  }

  /**
   * Ajusta o volume da trilha (0.0 a 1.0)
   */
  setVolume(vol: number) {
    if (this.bgAudio) {
      this.bgAudio.volume = Math.max(0, Math.min(1, vol));
    }
  }
}

export const audioManager = new AudioManager();
