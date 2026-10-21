// Schedule on the audio clock ahead of time; timer jitter never sets note onset.
export class Transport {
  constructor(piano, onStep, onStop, timers = globalThis) {
    Object.assign(this, { piano, onStep, onStop, timers, timer: null, token: 0, displays: new Set() });
  }
  async start(chords, bpm, loop) {
    this.stop();
    const token = this.token;
    await this.piano.ready();
    if (token !== this.token) return false;
    this.sequence = { chords, duration: 240 / bpm, loop, index: 0, next: this.piano.context.currentTime + 0.04 };
    this.schedule();
    return true;
  }
  schedule() {
    const sequence = this.sequence;
    if (sequence.next < this.piano.context.currentTime + 0.12) this.queueBar();
    if (this.sequence) this.timer = this.timers.setTimeout(() => this.schedule(), 25);
  }
  queueBar() {
    const s = this.sequence;
    if (s.index === s.chords.length) return this.finishCycle();
    this.piano.bar(s.chords[s.index], s.duration, s.next);
    this.display(s.index, s.next);
    s.index += 1;
    s.next += s.duration;
  }
  display(index, time) {
    const id = this.timers.setTimeout(
      () => {
        this.displays.delete(id);
        this.onStep(index);
      },
      Math.max(0, time - this.piano.context.currentTime) * 1000,
    );
    this.displays.add(id);
  }
  finishCycle() {
    if (this.sequence.loop) {
      this.sequence.index = 0;
      this.queueBar();
      return;
    }
    const delay = Math.max(0, this.sequence.next - this.piano.context.currentTime) * 1000;
    this.sequence = null;
    const id = this.timers.setTimeout(() => {
      this.displays.delete(id);
      this.stop();
    }, delay);
    this.displays.add(id);
  }
  stop() {
    this.token += 1;
    this.timers.clearTimeout(this.timer);
    this.displays.forEach((id) => {
      this.timers.clearTimeout(id);
    });
    this.displays.clear();
    this.timer = null;
    this.sequence = null;
    this.piano.stop();
    this.onStop();
  }
}
