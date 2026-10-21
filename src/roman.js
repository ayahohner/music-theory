import { Chord, Note, Progression } from 'tonal';
import { chordSymbol } from './chord-names.js';
import { scaleFor } from './scales.js';
import { display, rootName } from './tonal.js';
function degree(tonic, key, scale) {
  const spelling = scaleFor(key, scale).notes.find((note) => Note.chroma(note) === Note.chroma(tonic)) ?? tonic;
  return Progression.toRomanNumerals(rootName(key), [spelling])[0];
}
function qualitySuffix(parsed, symbol) {
  const suffix = symbol.slice(parsed.tonic.length).split('/')[0];
  if (parsed.type === 'half-diminished') return 'ø7';
  if (parsed.quality === 'Diminished') return suffix.replace('dim', '°');
  if (parsed.quality === 'Minor') return suffix.replace(/^m/, '');
  return suffix;
}
export function roman(chord, key, scale = 'major') {
  const symbol = chordSymbol(chord);
  const parsed = Chord.get(symbol);
  if (parsed.empty) return '—';
  let numeral = degree(parsed.tonic, key, scale);
  if (['Minor', 'Diminished'].includes(parsed.quality)) numeral = numeral.toLowerCase();
  const bass = parsed.bass ? `/${parsed.bass}` : '';
  return display(`${numeral}${qualitySuffix(parsed, symbol)}${bass}`);
}
