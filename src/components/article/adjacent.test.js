import { adjacent } from './adjacent';

const list = [{ slug: 'c' }, { slug: 'b' }, { slug: 'a' }]; // newest first

describe('adjacent', () => {
  test('a middle entry has a newer and an older one', () => {
    expect(adjacent(list, 'b')).toEqual({ newer: { slug: 'c' }, older: { slug: 'a' } });
  });

  test('the newest has no newer one', () => {
    expect(adjacent(list, 'c')).toEqual({ newer: null, older: { slug: 'b' } });
  });

  test('the oldest has no older one', () => {
    expect(adjacent(list, 'a')).toEqual({ newer: { slug: 'b' }, older: null });
  });

  test('a slug that is not in the list has neither', () => {
    expect(adjacent(list, 'zzz')).toEqual({ newer: null, older: null });
  });

  test('an empty list has neither', () => {
    expect(adjacent([], 'a')).toEqual({ newer: null, older: null });
  });
});
