// Pure helpers for the bento list pages (projects, blog): how big each tile is,
// in what order tiles run, and which category chips are worth showing.
// No React in here, so the rules are easy to test.

// A big tile is about 830 px wide on a desktop, so a cover narrower than 1000 px
// would be upscaled and go soft. It gets a standard tile instead.
export const BIG_COVER_MIN_WIDTH = 1000;

const hasBigCover = (item) => (item?.cover?.width ?? 0) >= BIG_COVER_MIN_WIDTH;

// Newest first. Date-only strings ("2024-01-01") and full timestamps both sort
// correctly as text. `dateOf` reads the date off an item.
export const newestFirst = (items, dateOf) =>
  [...items].sort((a, b) => String(dateOf(b) || '').localeCompare(String(dateOf(a) || '')));

// The project list as a visitor first meets it: the CMS's selected projects
// first, in the order the CMS gives them (`sortOrder`), then everything else
// newest first. While a search or a filter is on, plain newest first, so a
// handful of results is never held up behind projects that did not match.
export function orderProjects(projects, { selectedFirst }) {
  const byDate = newestFirst(projects, (p) => p.startDate);
  if (!selectedFirst) return byDate;
  const rank = (p) => (typeof p.sortOrder === 'number' ? p.sortOrder : Number.MAX_SAFE_INTEGER);
  const selected = byDate.filter((p) => p.featured).sort((a, b) => rank(a) - rank(b));
  return [...selected, ...byDate.filter((p) => !p.featured)];
}

const COLUMNS = 3;
const CELLS = { lead: 4, wide: 2, std: 1 };

// Widen standard tiles (1x1 to 2x1) until the tiles add up to whole rows of the
// three-column grid, so the list does not end on a lone tile. Each widened tile
// adds one cell. Tiles are taken in order from index `from`, never next to
// another wide tile, and only where `canWiden(i)` says the cover can take it.
function fillRows(sizes, canWiden, from) {
  const out = [...sizes];
  const cells = out.reduce((n, size) => n + CELLS[size], 0);
  let need = (COLUMNS - (cells % COLUMNS)) % COLUMNS;
  for (let i = from; i < out.length && need > 0; i += 1) {
    if (out[i] === 'std' && out[i - 1] !== 'wide' && canWiden(i)) {
      out[i] = 'wide';
      need -= 1;
    }
  }
  return out;
}

// Where the browser puts each tile on the three-column grid with
// `grid-auto-flow: dense`: every tile goes in the first free spot, scanning row
// by row. Returns [{ index, row, col, rows }] in the order the tiles were given.
const SPANS = { lead: [2, 2], wide: [2, 1], std: [1, 1] };
export function placeTiles(sizes) {
  const taken = [];
  const fits = (r, c, w, h) => {
    if (c + w > COLUMNS) return false;
    for (let i = r; i < r + h; i += 1) for (let j = c; j < c + w; j += 1) if (taken[i]?.[j]) return false;
    return true;
  };
  return sizes.map((size, index) => {
    const [w, h] = SPANS[size];
    for (let row = 0; ; row += 1) {
      const col = [0, 1, 2].find((c) => fits(row, c, w, h));
      if (col === undefined) continue;
      for (let i = row; i < row + h; i += 1) {
        taken[i] = taken[i] || [];
        for (let j = col; j < col + w; j += 1) taken[i][j] = true;
      }
      return { index, row, col, rows: h };
    }
  });
}

// The tile indices in the order a reader sees them: left to right, top to
// bottom. Rendering the tiles in this order keeps the markup, and so the tab
// order and a screen reader's order, the same as what is on screen.
export const readingOrder = (sizes) =>
  placeTiles(sizes).sort((a, b) => a.row - b.row || a.col - b.col).map((tile) => tile.index);

// 'lead' (2x2), 'wide' (2x1) or 'std' (1x1) for each project, in list order.
// Selected projects with a sharp enough cover are big: the first is the lead,
// the rest are wide. Then a few later projects with a sharp cover are widened
// so the rows come out whole. With `uniform` (search or filter on) every tile
// is std.
export function projectSizes(projects, { uniform = false } = {}) {
  if (uniform) return projects.map(() => 'std');
  let leadTaken = false;
  const sizes = projects.map((p) => {
    if (!p.featured || !hasBigCover(p)) return 'std';
    if (!leadTaken) { leadTaken = true; return 'lead'; }
    return 'wide';
  });
  const firstOther = projects.findIndex((p) => !p.featured);
  return fillRows(sizes, (i) => hasBigCover(projects[i]), firstOther === -1 ? projects.length : firstOther);
}

// Posts have no "selected" flag: the newest post leads, a few later ones are
// widened so the rows come out whole, the rest are standard. Seven posts fill
// the grid exactly (one 2x2, two 2x1, four 1x1).
export function postSizes(posts, { uniform = false } = {}) {
  if (uniform) return posts.map(() => 'std');
  const sizes = posts.map((_, i) => (i === 0 ? 'lead' : 'std'));
  return fillRows(sizes, () => true, 3);
}

// Chips for filtering: "All" always, then only the categories with at least
// `min` entries. A chip that filters down to a single entry is not a filter;
// that entry is still on the page under "All" and found by search.
export const visibleChips = (chips, min = 2) =>
  chips.filter((chip) => chip.name === 'All' || chip.count >= min);
