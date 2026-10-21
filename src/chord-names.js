import { Chord, Note, Pcset } from 'tonal';
import { QUALITIES, chordType } from './chord-catalog.js';
import { rootName, pitchClass, display } from './tonal.js';
function soundingNames(chord) {
  return [36 + chord.root, ...chord.notes].sort((a, b) => a - b).map(pitchClass);
}
function matchesProfile(notes, root, quality) {
  const expected = [root, ...QUALITIES[quality].map((interval) => root + interval)].map((n) => rootName(n % 12));
  return Pcset.isEqual(expected, [rootName(root), ...notes.map(pitchClass)]);
}
export function identify(notes, root) {
  return Object.keys(QUALITIES).find((quality) => matchesProfile(notes, root, quality));
}
function detectedSymbol(chord) {
  if (!chord.notes) return Chord.getChord(chordType(chord.quality), rootName(chord.root)).symbol;
  if (preservesProfile(chord))
    return Chord.getChord(chordType(chord.quality), rootName(chord.root), soundingNames(chord)[0]).symbol;
  const names = soundingNames(chord);
  const exact = Chord.detect(names);
  const candidates = exact.length ? exact : Chord.detect(names, { assumePerfectFifth: true });
  return preferred(candidates, chord.root) ?? upperChord(chord) ?? '';
}
function preservesProfile(chord) {
  return Object.hasOwn(QUALITIES, chord.quality) && matchesProfile(chord.notes, chord.root, chord.quality);
}
function preferred(candidates, root) {
  return candidates.find((symbol) => Note.chroma(parsedChord(symbol).tonic) === root) ?? candidates[0];
}
function upperChord(chord) {
  const upper = Chord.detect([...chord.notes].sort((a, b) => a - b).map(pitchClass))[0];
  if (!upper) return undefined;
  const detected = parsedChord(upper);
  return Chord.getChord(safeAlias(detected), detected.tonic, soundingNames(chord)[0]).symbol;
}
export function chordLabel(chord) {
  const symbol = chordSymbol(chord);
  if (!symbol) return `[${Pcset.notes(soundingNames(chord)).join(' ')}]`.replaceAll('b', '♭').replaceAll('#', '♯');
  const parsed = parsedChord(symbol);
  const type = safeAlias(parsed);
  return display(Chord.getChord(type, parsed.tonic, parsed.bass).symbol);
}
export function chordNotes(chord) {
  return parsedChord(chordSymbol(chord)).notes;
}
export function editedChord(chord, notes) {
  return { root: chord.root, quality: identify(notes, chord.root) ?? 'custom', notes: [...notes] };
}

function safeAlias(parsed) {
  if (parsed.type === 'major') return '';
  return parsed.aliases.find((alias) => !alias.includes('/')) ?? '';
}
function parsedChord(symbol) {
  const parsed = Chord.get(symbol);
  if (!parsed.empty) return parsed;
  const slash = symbol.lastIndexOf('/');
  const upper = Chord.get(symbol.slice(0, slash));
  if (upper.empty) return parsed;
  return Chord.getChord(safeAlias(upper), upper.tonic, symbol.slice(slash + 1));
}
export function harmonicRoot(chord) {
  return Note.chroma(parsedChord(chordSymbol(chord)).tonic) ?? chord.root;
}

export function chordSymbol(chord) {
  const raw = detectedSymbol(chord);
  const parsed = parsedChord(raw);
  if (parsed.empty) return '';
  return Chord.getChord(safeAlias(parsed), parsed.tonic, parsed.bass).symbol;
}
