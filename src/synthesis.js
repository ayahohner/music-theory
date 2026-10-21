export const frequency = (midi) => 440 * 2 ** ((midi - 69) / 12);
export function envelope(ctx, output, start, duration, level) {
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(level, start + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  gain.connect(output);
  return gain;
}
export function source(engine, node, nodes, start, duration) {
  engine.voices.add(node);
  node.onended = () => {
    engine.voices.delete(node);
    nodes.forEach((part) => {
      part.disconnect();
    });
  };
  node.start(start);
  node.stop(start + duration + 0.02);
}
export function electric(engine, note, start, duration) {
  const ctx = engine.context;
  const carrier = ctx.createOscillator();
  const modulator = ctx.createOscillator();
  const amount = ctx.createGain();
  const gain = envelope(ctx, engine.output, start, duration, 0.065);
  carrier.frequency.value = frequency(note);
  modulator.frequency.value = frequency(note) * 2;
  amount.gain.setValueAtTime(frequency(note) * 0.7, start);
  amount.gain.exponentialRampToValueAtTime(1, start + duration * 0.7);
  modulator.connect(amount).connect(carrier.frequency);
  carrier.connect(gain);
  source(engine, modulator, [modulator, amount], start, duration);
  source(engine, carrier, [carrier, gain], start, duration);
}
export function bass(engine, note, start, duration, wobble) {
  const ctx = engine.context;
  const osc = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain = envelope(ctx, engine.output, start, duration, 0.14);
  osc.type = 'sawtooth';
  osc.frequency.value = frequency(note);
  filter.type = 'lowpass';
  filter.Q.value = 2;
  filter.frequency.setValueAtTime(180, start);
  sweep(filter.frequency, start, duration, wobble);
  osc.connect(filter).connect(gain);
  source(engine, osc, [osc, filter, gain], start, duration);
}
function sweep(parameter, start, duration, wobble) {
  const cycles = Math.max(1, Math.round(wobble * 4));
  for (let i = 0; i < cycles; i++) {
    parameter.exponentialRampToValueAtTime(220 + wobble * 1800, start + (duration * (i + 0.45)) / cycles);
    parameter.exponentialRampToValueAtTime(90, start + (duration * (i + 1)) / cycles);
  }
}
export function kick(engine, start) {
  const ctx = engine.context;
  const osc = ctx.createOscillator();
  const gain = envelope(ctx, engine.output, start, 0.32, 0.32);
  osc.frequency.setValueAtTime(135, start);
  osc.frequency.exponentialRampToValueAtTime(42, start + 0.16);
  osc.connect(gain);
  source(engine, osc, [osc, gain], start, 0.32);
}
export function noiseHit(engine, start, snare) {
  const ctx = engine.context;
  const noise = ctx.createBufferSource();
  noise.buffer = engine.noise;
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = snare ? 1200 : 7500;
  const duration = snare ? 0.18 : 0.045;
  const gain = envelope(ctx, engine.output, start, duration, snare ? 0.16 : 0.045);
  noise.connect(filter).connect(gain);
  source(engine, noise, [noise, filter, gain], start, duration);
}
export function noiseBuffer(ctx) {
  const buffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const channel = buffer.getChannelData(0);
  for (let i = 0; i < channel.length; i++) channel[i] = Math.random() * 2 - 1;
  return buffer;
}
