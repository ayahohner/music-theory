import { afterEach, expect, it, vi } from 'vitest';
import { Transport } from '../src/transport.js';
afterEach(() => vi.useRealTimers());
function setup() {
  vi.useFakeTimers();
  vi.setSystemTime(0);
  const piano = {
    ready: vi.fn().mockResolvedValue(),
    bar: vi.fn(),
    stop: vi.fn(),
    context: {
      get currentTime() {
        return Date.now() / 1000;
      },
    },
  };
  const step = vi.fn(),
    stop = vi.fn();
  return { piano, step, stop, transport: new Transport(piano, step, stop) };
}
it('schedules precisely on the audio clock ahead of each bar and loops', async () => {
  const { piano, step, transport } = setup();
  await transport.start([[60], [62]], 120, true);
  expect(piano.bar).toHaveBeenNthCalledWith(1, [60], 2, 0.04);
  expect(step).not.toHaveBeenCalled();
  vi.advanceTimersByTime(40);
  expect(step).toHaveBeenLastCalledWith(0);
  vi.advanceTimersByTime(1900);
  expect(piano.bar).toHaveBeenNthCalledWith(2, [62], 2, 2.04);
  vi.advanceTimersByTime(2100);
  expect(step).toHaveBeenLastCalledWith(0);
  expect(piano.bar).toHaveBeenNthCalledWith(3, [60], 2, 4.04);
  transport.stop();
  vi.advanceTimersByTime(10000);
  expect(piano.bar).toHaveBeenCalledTimes(3);
  expect(vi.getTimerCount()).toBe(0);
});
it('ends non-looping sequences at their musical endpoint', async () => {
  const { transport, step } = setup();
  await transport.start([[60]], 120, false);
  vi.advanceTimersByTime(2040);
  expect(transport.sequence).toBeNull();
  expect(transport.timer).toBeNull();
  expect(step).toHaveBeenCalledTimes(1);
  expect(vi.getTimerCount()).toBe(0);
});
it('cancels a pending resume and pending visual callbacks', async () => {
  const { piano, step, transport } = setup();
  let resume;
  piano.ready.mockImplementation(
    () =>
      new Promise((resolve) => {
        resume = resolve;
      }),
  );
  const pending = transport.start([[61]], 120, true);
  transport.stop();
  resume();
  expect(await pending).toBe(false);
  expect(piano.bar).not.toHaveBeenCalled();
  piano.ready.mockResolvedValue();
  await transport.start([[60]], 120, true);
  transport.stop();
  vi.advanceTimersByTime(500);
  expect(step).not.toHaveBeenCalled();
  expect(vi.getTimerCount()).toBe(0);
});
