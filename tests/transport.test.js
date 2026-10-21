import { afterEach, expect, it, vi } from 'vitest';
import { Transport } from '../src/transport.js';
afterEach(() => vi.useRealTimers());
it('plays four beats per chord, loops, and cancels immediately', async () => {
  vi.useFakeTimers();
  const piano = { ready: vi.fn().mockResolvedValue(), play: vi.fn(), stop: vi.fn() },
    step = vi.fn(),
    stop = vi.fn();
  const transport = new Transport(piano, step, stop);
  await transport.start([[60], [62]], 120, true);
  expect(piano.play).toHaveBeenLastCalledWith([60], 1.8);
  vi.advanceTimersByTime(2000);
  expect(step).toHaveBeenLastCalledWith(1);
  vi.advanceTimersByTime(2000);
  expect(step).toHaveBeenLastCalledWith(0);
  transport.stop();
  vi.advanceTimersByTime(20000);
  expect(piano.play).toHaveBeenCalledTimes(3);
});
it('ends non-looping sequences and prevents a pending resume from restarting', async () => {
  vi.useFakeTimers();
  const piano = { ready: vi.fn().mockResolvedValue(), play: vi.fn(), stop: vi.fn() };
  const transport = new Transport(piano, vi.fn(), vi.fn());
  await transport.start([[60]], 120, false);
  vi.advanceTimersByTime(2000);
  expect(transport.timer).toBeNull();
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
  await pending;
  expect(piano.play).toHaveBeenCalledTimes(1);
});
