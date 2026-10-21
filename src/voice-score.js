import { noteName } from './theory.js';
import { $, button } from './view.js';
export const VOICE_COLORS = ['#efbc68', '#cf9afa', '#67d8d0', '#9ab8ff'];
export function scoreRange(voicings) {
  const pitches = voicings.flat();
  return { low: Math.min(...pitches) - 2, high: Math.max(...pitches) + 2 };
}
export function pitchY(note, range) {
  return 12 + ((range.high - note) / (range.high - range.low)) * 204;
}
export function renderScore(voicings, selected, play) {
  const range = scoreRange(voicings),
    width = voicings.length * 160;
  const rows = pitchRows(range);
  $('pitch-axis').innerHTML = rows
    .map((note) => `<span style="top:${pitchY(note, range)}px">${noteName(note)}</span>`)
    .join('');
  const lines = rows.map((note) => `<path d="M0 ${pitchY(note, range)}H${width}" class="pitch-line"/>`).join('');
  const paths = [0, 1, 2, 3].map((voice) => voicePath(voicings, voice, range)).join('');
  $('voice-paths').innerHTML =
    `<svg viewBox="0 0 ${width} 228" preserveAspectRatio="none" aria-hidden="true">${lines}${paths}</svg>`;
  $('voice-paths').append(
    ...voicings.flatMap((notes, index) =>
      notes.map((note, voice) => noteButton(note, voice, index, voicings.length, range, selected, play)),
    ),
  );
}
function pitchRows(range) {
  return Array.from({ length: range.high - range.low + 1 }, (_, i) => range.low + i).filter((note) => note % 2 === 0);
}
function voicePath(voicings, voice, range) {
  const points = voicings
    .map((notes, index) => `${80 + index * 160 + (voice % 2 === 0 ? -20 : 20)},${pitchY(notes[voice], range)}`)
    .join(' ');
  return `<polyline points="${points}" fill="none" stroke="${VOICE_COLORS[voice]}" stroke-width="2" vector-effect="non-scaling-stroke"/>`;
}
function noteButton(note, voice, index, count, range, selected, play) {
  const node = button('score-note', noteName(note), () => play([note]));
  node.id = `voice-${index}-${voice}`;
  node.style.left = `${(((index + 0.5) * 160 + (voice % 2 === 0 ? -20 : 20)) / (count * 160)) * 100}%`;
  node.style.top = `${pitchY(note, range)}px`;
  node.style.setProperty('--voice', VOICE_COLORS[voice]);
  node.classList.toggle('selected', index === selected);
  node.setAttribute('aria-label', `Play ${noteName(note)}, voice ${voice + 1}, chord ${index + 1}`);
  return node;
}
