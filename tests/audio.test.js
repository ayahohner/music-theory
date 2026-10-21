import { expect, it, vi } from 'vitest';
import { Piano } from '../src/audio.js';
function parameter() {
  return {
    value: 0,
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
    setTargetAtTime: vi.fn(),
  };
}
function fakeContext() {
  const nodes = [];
  function node() {
    const n = {
      gain: parameter(),
      frequency: parameter(),
      Q: parameter(),
      connect: vi.fn((target) => target),
      disconnect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };
    nodes.push(n);
    return n;
  }
  return {
    nodes,
    currentTime: 1,
    sampleRate: 100,
    destination: node(),
    resume: vi.fn(),
    createGain: node,
    createOscillator: node,
    createBiquadFilter: node,
    createBufferSource: node,
    createDynamicsCompressor: node,
    createBuffer: () => ({ getChannelData: () => new Float32Array(100) }),
  };
}
it('creates one output graph, synthesizes FM notes, and releases all audio nodes', async () => {
  const context = fakeContext(),
    create = vi.fn(() => context),
    piano = new Piano(create);
  await piano.ready();
  await piano.ready();
  expect(create).toHaveBeenCalledTimes(1);
  piano.play([69]);
  const oscillators = [...piano.voices];
  expect(oscillators.map((n) => n.frequency.value)).toEqual([880, 440]);
  expect(oscillators[1].start).toHaveBeenCalledWith(1);
  oscillators.forEach((n) => {
    n.onended();
  });
  expect(piano.voices.size).toBe(0);
  expect(oscillators.every((n) => n.disconnect.mock.calls.length === 1)).toBe(true);
  piano.play([60]);
  const active = [...piano.voices];
  piano.stop();
  expect(active.every((n) => n.stop.mock.calls.length === 2)).toBe(true);
});
it('schedules each groove with bass and drums and cancels future sources', async () => {
  const piano = new Piano(fakeContext);
  await piano.ready();
  for (const groove of ['hold', 'pocket', 'broken']) {
    piano.groove = groove;
    piano.bar([36, 60, 64, 67, 71], 2, 3);
    expect([...piano.voices].every((n) => n.start.mock.calls[0][0] >= 3)).toBe(true);
    const voices = [...piano.voices];
    piano.stop();
    voices.forEach((n) => {
      n.onended();
    });
    expect(piano.voices.size).toBe(0);
  }
});
it('sets volume before and after audio activation', async () => {
  const piano = new Piano(fakeContext);
  piano.setVolume(0.2);
  await piano.ready();
  expect(piano.output.gain.value).toBe(0.2);
  piano.setVolume(0.6);
  expect(piano.output.gain.setTargetAtTime).toHaveBeenCalledWith(0.6, 1, 0.02);
});
