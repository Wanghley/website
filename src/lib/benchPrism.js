// Syntax-highlighting theme for react-syntax-highlighter (Prism), built from the
// Bench tokens: an ink panel, paper text, signal-blue keywords, copper for
// numbers and function names, the status green for strings. Every pair is at
// least 6:1 on the panel (#0E0F10). Shared by project and blog write-ups.
const PANEL = '#0E0F10';
const PAPER = '#F2EFE9';
const DIM = '#B9B5AC';
const MUTED = '#9A978F';
const SIGNAL = '#3AAFF1';
const COPPER = '#F0A460';
const OK = '#6FCF97';
const MONO = "'IBM Plex Mono', ui-monospace, 'SF Mono', Menlo, monospace";

const benchPrism = {
  'code[class*="language-"]': {
    color: PAPER, background: 'none', fontFamily: MONO, fontSize: '0.875rem', lineHeight: 1.6,
    textAlign: 'left', whiteSpace: 'pre', wordSpacing: 'normal', wordBreak: 'normal', wordWrap: 'normal',
    tabSize: 2, hyphens: 'none',
  },
  'pre[class*="language-"]': {
    color: PAPER, background: PANEL, fontFamily: MONO, fontSize: '0.875rem', lineHeight: 1.6,
    textAlign: 'left', whiteSpace: 'pre', wordSpacing: 'normal', wordBreak: 'normal', wordWrap: 'normal',
    tabSize: 2, hyphens: 'none', margin: 0, padding: '16px 18px', overflow: 'auto',
  },
  comment: { color: MUTED, fontStyle: 'italic' },
  prolog: { color: MUTED },
  doctype: { color: MUTED },
  cdata: { color: MUTED },
  punctuation: { color: DIM },
  namespace: { opacity: 0.8 },
  property: { color: SIGNAL },
  tag: { color: SIGNAL },
  selector: { color: SIGNAL },
  'attr-name': { color: COPPER },
  keyword: { color: SIGNAL },
  boolean: { color: COPPER },
  number: { color: COPPER },
  constant: { color: COPPER },
  symbol: { color: COPPER },
  function: { color: COPPER },
  'class-name': { color: COPPER },
  string: { color: OK },
  char: { color: OK },
  'attr-value': { color: OK },
  builtin: { color: OK },
  inserted: { color: OK },
  deleted: { color: '#F08A98' },
  operator: { color: DIM },
  entity: { color: DIM },
  url: { color: DIM },
  variable: { color: PAPER },
  regex: { color: OK },
  important: { color: COPPER, fontWeight: 'bold' },
  bold: { fontWeight: 'bold' },
  italic: { fontStyle: 'italic' },
};

export default benchPrism;
