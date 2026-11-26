// The entries either side of one in a list that runs newest first: the newer
// one and the older one, or null at an end (or when the slug is not in the list).
export function adjacent(items, slug) {
  const i = items.findIndex((item) => item.slug === slug);
  if (i === -1) return { newer: null, older: null };
  return { newer: items[i - 1] ?? null, older: items[i + 1] ?? null };
}
