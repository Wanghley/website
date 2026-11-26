import { newestFirst, orderProjects, placeTiles, projectSizes, postSizes, readingOrder, visibleChips } from './bento';

const project = (slug, startDate, extra = {}) => ({ slug, startDate, cover: { width: 2000 }, ...extra });

describe('orderProjects', () => {
  const list = [
    project('old', '2022-01-01'),
    project('b', '2024-05-01', { featured: true, sortOrder: 2 }),
    project('new', '2025-09-01'),
    project('a', '2023-03-01', { featured: true, sortOrder: 1 }),
  ];

  test('selected projects come first, in CMS order, then the rest newest first', () => {
    expect(orderProjects(list, { selectedFirst: true }).map((p) => p.slug)).toEqual(['a', 'b', 'new', 'old']);
  });

  test('with a search or filter on, it is plain newest first', () => {
    expect(orderProjects(list, { selectedFirst: false }).map((p) => p.slug)).toEqual(['new', 'b', 'a', 'old']);
  });

  test('a selected project with no sortOrder follows the ones that have one', () => {
    const rows = [project('x', '2025-01-01', { featured: true }), project('y', '2020-01-01', { featured: true, sortOrder: 3 })];
    expect(orderProjects(rows, { selectedFirst: true }).map((p) => p.slug)).toEqual(['y', 'x']);
  });

  test('does not change the list it is given', () => {
    const copy = list.map((p) => p.slug);
    orderProjects(list, { selectedFirst: true });
    expect(list.map((p) => p.slug)).toEqual(copy);
  });
});

describe('projectSizes', () => {
  test('first selected project with a sharp cover leads, other selected ones are wide, the rest standard', () => {
    const rows = [
      project('a', '2025-01-01', { featured: true }),
      project('b', '2025-01-01', { featured: true }),
      project('c', '2025-01-01'),
      project('d', '2025-01-01', { featured: true }),
    ];
    expect(projectSizes(rows)).toEqual(['lead', 'wide', 'std', 'wide']);
  });

  test('a selected project with a small cover stays standard and does not take the lead', () => {
    const rows = [
      project('soft', '2025-01-01', { featured: true, cover: { width: 473 } }),
      project('sharp', '2025-01-01', { featured: true }),
    ];
    expect(projectSizes(rows)).toEqual(['std', 'lead']);
  });

  test('a selected project with no cover stays standard', () => {
    expect(projectSizes([{ slug: 'x', featured: true }])).toEqual(['std']);
  });

  test('uniform: every tile is standard', () => {
    const rows = [project('a', '2025-01-01', { featured: true }), project('b', '2025-01-01', { featured: true })];
    expect(projectSizes(rows, { uniform: true })).toEqual(['std', 'std']);
  });

  test('later projects are widened, in order, so the rows come out whole', () => {
    // one lead, three wide, then twenty standard: 4 + 6 + 20 = 30 cells, whole rows already
    const rows = [
      ...['a', 'b', 'c', 'd'].map((slug) => project(slug, '2025-01-01', { featured: true })),
      ...Array.from({ length: 20 }, (_, i) => project(`p${i}`, '2024-01-01')),
    ];
    expect(projectSizes(rows).filter((s) => s !== 'std')).toHaveLength(4);
    // one more tile makes 31 cells: two later projects are widened (+1 cell each) to make 33
    const sizes = projectSizes([...rows, project('x', '2023-01-01')]);
    expect(sizes.filter((s) => s === 'wide')).toHaveLength(5);
    expect(emptyCells(sizes)).toBe(0);
  });

  test('a cover that is too small is never widened', () => {
    const rows = [
      project('lead', '2025-01-01', { featured: true }),
      ...Array.from({ length: 8 }, (_, i) => project(`s${i}`, '2024-01-01', { cover: { width: 500 } })),
    ];
    expect(projectSizes(rows).filter((s) => s === 'wide')).toHaveLength(0);
  });

  test('the real list: one lead, four selected wide, the rows whole', () => {
    // 24 projects as the CMS has them: 6 selected (the 5th with a small cover), 4 with no cover
    const selected = [1, 2, 3, 4, 5, 6].map((n) => project(`f${n}`, '2025-01-01', { featured: true, sortOrder: n, cover: { width: n === 5 ? 473 : 3000 } }));
    const rest = Array.from({ length: 18 }, (_, i) => (i >= 14 ? { slug: `n${i}`, startDate: '2020-01-01' } : project(`r${i}`, '2024-01-01')));
    const sizes = projectSizes([...selected, ...rest]);
    expect(sizes.slice(0, 6)).toEqual(['lead', 'wide', 'wide', 'wide', 'std', 'wide']);
    expect(emptyCells(sizes)).toBe(0);
  });
});

// The number of empty cells left in the rows the tiles use.
function emptyCells(sizes) {
  const placed = placeTiles(sizes);
  const rows = Math.max(0, ...placed.map((tile) => tile.row + tile.rows));
  const used = sizes.reduce((n, size) => n + { lead: 4, wide: 2, std: 1 }[size], 0);
  return rows * 3 - used;
}

describe('postSizes', () => {
  test('the newest post leads, the rest are standard', () => {
    expect(postSizes([{}, {}, {}])).toEqual(['lead', 'std', 'std']);
  });

  test('seven posts: one lead, two wide, four standard', () => {
    const sizes = postSizes(Array.from({ length: 7 }, () => ({})));
    expect(sizes.filter((s) => s === 'lead')).toHaveLength(1);
    expect(sizes.filter((s) => s === 'wide')).toHaveLength(2);
    expect(sizes[0]).toBe('lead');
  });

  test('from five posts up, the rows always come out whole', () => {
    for (let n = 5; n <= 24; n += 1) {
      expect({ n, empty: emptyCells(postSizes(Array.from({ length: n }, () => ({})))) }).toEqual({ n, empty: 0 });
    }
  });

  test('uniform: every tile is standard', () => {
    expect(postSizes([{}, {}], { uniform: true })).toEqual(['std', 'std']);
  });

  test('an empty list is empty', () => {
    expect(postSizes([])).toEqual([]);
  });
});

describe('visibleChips', () => {
  const chips = [
    { name: 'All', count: 7 },
    { name: 'Insights', count: 5 },
    { name: 'Career', count: 2 },
    { name: 'Lifestyle', count: 1 },
  ];

  test('keeps All and the chips with two or more entries', () => {
    expect(visibleChips(chips).map((c) => c.name)).toEqual(['All', 'Insights', 'Career']);
  });

  test('keeps All even when it has a single entry', () => {
    expect(visibleChips([{ name: 'All', count: 1 }])).toEqual([{ name: 'All', count: 1 }]);
  });
});

describe('newestFirst', () => {
  test('sorts by the date the caller reads, with a missing date last', () => {
    const rows = [{ id: 1, d: '2024-01-01' }, { id: 2 }, { id: 3, d: '2025-06-18T21:00:00.000Z' }];
    expect(newestFirst(rows, (r) => r.d).map((r) => r.id)).toEqual([3, 1, 2]);
  });
});

describe('placeTiles and readingOrder', () => {
  test('a lead takes two columns and two rows; standard tiles fill beside it', () => {
    const placed = placeTiles(['lead', 'std', 'std', 'wide']);
    expect(placed.map(({ row, col }) => [row, col])).toEqual([[0, 0], [0, 2], [1, 2], [2, 0]]);
  });

  test('a standard tile fills the gap a wide tile cannot use', () => {
    // lead, then a wide tile (no room beside the lead), then a standard tile: the standard one jumps ahead
    const sizes = ['lead', 'wide', 'std'];
    expect(placeTiles(sizes).map(({ row, col }) => [row, col])).toEqual([[0, 0], [2, 0], [0, 2]]);
    expect(readingOrder(sizes)).toEqual([0, 2, 1]);
  });

  test('with every tile standard the order is unchanged', () => {
    expect(readingOrder(['std', 'std', 'std', 'std'])).toEqual([0, 1, 2, 3]);
  });
});
