// ── Unicode Text Transforms ──
// Maps ASCII letters to Unicode mathematical/styled variants for use in
// platforms that don't support markdown (LinkedIn, Twitter, etc.)

// ── Code Point Ranges ──
// Mathematical styled characters live in contiguous Unicode blocks.
// We map A-Z and a-z by offset from the block start.

function fromCodePoints(start, count) {
  const chars = [];
  for (let i = 0; i < count; i++) {
    chars.push(String.fromCodePoint(start + i));
  }
  return chars;
}

// Mathematical Italic: U+1D434 (A) .. U+1D467 (z), with gap for h at U+210E
const ITALIC_UPPER = fromCodePoints(0x1D434, 26);
const ITALIC_LOWER = (() => {
  const arr = fromCodePoints(0x1D44E, 26);
  arr[7] = '\u210E'; // italic h is at a different code point
  return arr;
})();

// Mathematical Bold: U+1D400 (A) .. U+1D433 (z)
const BOLD_UPPER = fromCodePoints(0x1D400, 26);
const BOLD_LOWER = fromCodePoints(0x1D41A, 26);

// Mathematical Bold Italic: U+1D468 (A) .. U+1D49B (z)
const BOLD_ITALIC_UPPER = fromCodePoints(0x1D468, 26);
const BOLD_ITALIC_LOWER = fromCodePoints(0x1D482, 26);

// Mathematical Monospace: U+1D670 (A) .. U+1D6A3 (z)
const MONOSPACE_UPPER = fromCodePoints(0x1D670, 26);
const MONOSPACE_LOWER = fromCodePoints(0x1D68A, 26);

// Small Caps — no contiguous block, hand-mapped
const SMALL_CAPS_MAP = {
  a: '\u1D00', b: '\u0299', c: '\u1D04', d: '\u1D05', e: '\u1D07', f: '\uA730',
  g: '\u0262', h: '\u029C', i: '\u026A', j: '\uA7AD', k: '\u1D0B', l: '\u029F',
  m: '\u1D0D', n: '\u0274', o: '\u1D0F', p: '\u1D18', q: 'Q', r: '\u0280',
  s: '\uA731', t: '\u1D1B', u: '\u1D1C', v: '\u1D20', w: '\u1D21', x: 'x',
  y: '\u028F', z: '\u1D22',
};

// Upside Down — hand-mapped
const UPSIDE_DOWN_MAP = {
  a: '\u0250', b: 'q', c: '\u0254', d: 'p', e: '\u01DD', f: '\u025F',
  g: '\u0183', h: '\u0265', i: '\u1D09', j: '\u027E', k: '\u029E', l: 'l',
  m: '\u026F', n: 'u', o: 'o', p: 'd', q: 'b', r: '\u0279', s: 's',
  t: '\u0287', u: 'n', v: '\u028C', w: '\u028D', x: 'x', y: '\u028E', z: 'z',
  A: '\u2200', B: '\u1012', C: '\u0186', D: '\u15E1', E: '\u018E', F: '\u2132',
  G: '\u2141', H: 'H', I: 'I', J: '\u017F', K: '\u22CA', L: '\u02E5',
  M: 'W', N: 'N', O: 'O', P: '\u0500', Q: '\u038C', R: '\u1D3F',
  S: 'S', T: '\u22A5', U: '\u2229', V: '\u039B', W: 'M', X: 'X',
  Y: '\u2144', Z: 'Z',
  '1': '\u0196', '2': '\u1105', '3': '\u0190', '4': '\u152D', '5': '\u03DB',
  '6': '9', '7': '\u2220', '8': '8', '9': '6', '0': '0',
  '.': '\u02D9', ',': '\u02BB', '?': '\u00BF', '!': '\u00A1',
  "'": ',', '"': '\u201E',
  '(': ')', ')': '(', '[': ']', ']': '[', '{': '}', '}': '{',
  '<': '>', '>': '<', '&': '\u214B', '_': '\u203E',
};

// ── Transform Functions ──

function mapChars(text, upperMap, lowerMap) {
  return [...text].map((ch) => {
    const code = ch.codePointAt(0);
    if (code >= 65 && code <= 90) return upperMap[code - 65];
    if (code >= 97 && code <= 122) return lowerMap[code - 97];
    return ch;
  }).join('');
}

function toUnicodeItalic(text) {
  return mapChars(text, ITALIC_UPPER, ITALIC_LOWER);
}

function toUnicodeBold(text) {
  return mapChars(text, BOLD_UPPER, BOLD_LOWER);
}

function toUnicodeBoldItalic(text) {
  return mapChars(text, BOLD_ITALIC_UPPER, BOLD_ITALIC_LOWER);
}

function toUnicodeMonospace(text) {
  return mapChars(text, MONOSPACE_UPPER, MONOSPACE_LOWER);
}

function toSmallCaps(text) {
  return [...text].map((ch) => SMALL_CAPS_MAP[ch.toLowerCase()] || ch).join('');
}

function toStrikethrough(text) {
  // Combining long stroke overlay (U+0336) after each character
  return [...text].map((ch) => ch + '\u0336').join('');
}

function toUpsideDown(text) {
  return [...text].reverse().map((ch) => UPSIDE_DOWN_MAP[ch] || ch).join('');
}

function toUpperCase(text) {
  return text.toUpperCase();
}

function toLowerCase(text) {
  return text.toLowerCase();
}

function toTitleCase(text) {
  return text.replace(/\b\w/g, (ch) => ch.toUpperCase());
}

// ── Export ──

export const TEXT_TRANSFORMS = {
  unicodeItalic:     { label: 'Unicode Italic',          fn: toUnicodeItalic },
  unicodeBold:       { label: 'Unicode Bold',            fn: toUnicodeBold },
  unicodeBoldItalic: { label: 'Unicode Bold Italic',     fn: toUnicodeBoldItalic },
  unicodeMonospace:  { label: 'Unicode Monospace',        fn: toUnicodeMonospace },
  smallCaps:         { label: 'Small Caps',               fn: toSmallCaps },
  strikethroughText: { label: 'Strikethrough (Unicode)',  fn: toStrikethrough },
  upsideDown:        { label: 'Upside Down',             fn: toUpsideDown },
  uppercase:         { label: 'UPPERCASE',                fn: toUpperCase },
  lowercase:         { label: 'lowercase',                fn: toLowerCase },
  titleCase:         { label: 'Title Case',               fn: toTitleCase },
};
