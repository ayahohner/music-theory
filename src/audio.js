import { barEvents } from './groove.js';
import { bass, electric, kick, noiseBuffer, noiseHit } from './synthesis.js';
export class Piano {
  constructor(create = () => new AudioContext()) {
    Object.assign(this, { create, context: null, voices: new Set(), groove: 'pocket', wobble: 0.4, volume: 0.55 });
  }
  async ready() {
    if (!this.context) this.initialize();
    await this.context.resume();
  }
  initialize() {
    this.context = this.create();
    this.output = this.context.createGain();
    this.compressor = this.context.createDynamicsCompressor();
    this.output.gain.value = this.volume;
    this.output.connect(this.compressor).connect(this.context.destination);
    this.noise = noiseBuffer(this.context);
  }
  setVolume(value) {
    this.volume = value;
    if (this.output) this.output.gain.setTargetAtTime(value, this.context.currentTime, 0.02);
  }
  play(notes, duration = 1.4) {
    notes.forEach((note) => {
      electric(this, note, this.context.currentTime, duration);
    });
  }
  bar(notes, duration, start) {
    const events = barEvents(notes, duration, this.groove);
    events.forEach((event) => {
      this.hit(event, start, duration);
    });
  }
  hit(event, start, duration) {
    const at = start + event.at;
    const handlers = {
      chord: () => this.chord(event.notes, at, duration),
      bass: () => bass(this, event.notes[0], at, duration / 5, this.wobble),
      kick: () => kick(this, at),
      snare: () => noiseHit(this, at, true),
      hat: () => noiseHit(this, at, false),
    };
    handlers[event.kind]();
  }
  chord(notes, start, duration) {
    const length = this.groove === 'hold' ? duration * 0.9 : duration / 4;
    notes.forEach((note) => {
      electric(this, note, start, length);
    });
  }
  stop() {
    this.voices.forEach((oscillator) => {
      oscillator.stop();
    });
    this.voices.clear();
  }
}
