export class Piano {
  constructor(create = () => new AudioContext()) {
    this.create = create;
    this.context = null;
    this.voices = new Set();
  }
  async ready() {
    this.context ??= this.create();
    await this.context.resume();
  }
  play(notes, duration = 1.4) {
    notes.forEach((note) => {
      this.tone(note, duration);
    });
  }
  tone(note, duration) {
    const ctx = this.context;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    const start = ctx.currentTime;
    oscillator.type = 'triangle';
    oscillator.frequency.value = 440 * 2 ** ((note - 69) / 12);
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.055, start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
    oscillator.connect(gain).connect(ctx.destination);
    this.voices.add(oscillator);
    oscillator.onended = () => {
      this.voices.delete(oscillator);
      oscillator.disconnect();
      gain.disconnect();
    };
    oscillator.start(start);
    oscillator.stop(start + duration + 0.05);
  }
  stop() {
    this.voices.forEach((oscillator) => {
      oscillator.stop();
    });
    this.voices.clear();
  }
}
