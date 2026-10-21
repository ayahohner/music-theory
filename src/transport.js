export class Transport {
  constructor(piano, onStep, onStop, timers = globalThis) {
    Object.assign(this, { piano, onStep, onStop, timers, timer: null, token: 0 });
  }
  async start(chords, bpm, loop) {
    this.stop();
    const token = this.token;
    await this.piano.ready();
    if (token !== this.token) return;
    this.tick(chords, 0, 240000 / bpm, loop);
  }
  tick(chords, index, duration, loop) {
    this.onStep(index);
    this.piano.play(chords[index], (duration / 1000) * 0.9);
    this.timer = this.timers.setTimeout(() => this.advance(chords, index, duration, loop), duration);
  }
  advance(chords, index, duration, loop) {
    const next = (index + 1) % chords.length;
    if (next === 0 && !loop) return this.stop();
    this.tick(chords, next, duration, loop);
  }
  stop() {
    this.token += 1;
    this.timers.clearTimeout(this.timer);
    this.timer = null;
    this.piano.stop();
    this.onStop();
  }
}
