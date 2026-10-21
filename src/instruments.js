import { envelope, frequency, source, electric } from './synthesis.js';
export const INSTRUMENTS = { felt: 'Soft piano', bell: 'Glass keys', organ: 'Drawbar organ', electric: 'FM electric' };
const PARTIALS = {
  felt: [
    [1, 0.065],
    [2, 0.018],
    [3, 0.004],
  ],
  bell: [
    [1, 0.055],
    [2, 0.018],
    [4, 0.008],
  ],
  organ: [
    [1, 0.045],
    [2, 0.022],
    [3, 0.014],
    [4, 0.008],
  ],
};
export function instrumentNote(engine, note, start, duration) {
  if (engine.instrument === 'electric') return electric(engine, note, start, duration);
  PARTIALS[engine.instrument].forEach(([ratio, level]) => {
    partial(engine, note, start, duration, ratio, level);
  });
}
function partial(engine, note, start, duration, ratio, level) {
  const osc = engine.context.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = frequency(note) * ratio;
  const gain = envelope(engine.context, engine.output, start, duration, level);
  osc.connect(gain);
  source(engine, osc, [osc, gain], start, duration);
}
