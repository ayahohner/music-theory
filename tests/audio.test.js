import { expect, it, vi } from 'vitest';
import { Piano } from '../src/audio.js';
it('synthesizes correctly tuned notes and releases all audio nodes', async () => {
  const gain = {
    gain: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
    connect: vi.fn(),
    disconnect: vi.fn(),
  };
  const oscillator = { frequency: {}, connect: vi.fn(() => gain), start: vi.fn(), stop: vi.fn(), disconnect: vi.fn() };
  const context = { resume: vi.fn(), currentTime: 1, createGain: () => gain, createOscillator: () => oscillator };
  const create = vi.fn(() => context),
    piano = new Piano(create);
  await piano.ready();
  await piano.ready();
  expect(create).toHaveBeenCalledTimes(1);
  piano.play([69]);
  expect(oscillator.frequency.value).toBe(440);
  expect(oscillator.start).toHaveBeenCalledWith(1);
  oscillator.onended();
  expect(piano.voices.size).toBe(0);
  expect(gain.disconnect).toHaveBeenCalled();
  piano.play([60]);
  piano.stop();
  expect(piano.voices.size).toBe(0);
});
