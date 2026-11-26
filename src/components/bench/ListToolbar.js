import React, { useEffect, useRef } from 'react';

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

// Search and category chips for a list page (projects, blog), and the line that
// says what is showing. Cmd/Ctrl+K focuses the search; Escape clears it.
//
//   noun       'projects' | 'posts'   (labels and the results line)
//   chips      [{ name, count }] already trimmed; "All" first
//   onSearch   called with each new term (the page logs it)
//   onChip     called with the chip's name (the page logs it)
//   total / shown   counts before and after the filters
export default function ListToolbar({
  noun, status, searchTerm, onSearch, chips, activeCategory, onChip, total, shown,
}) {
  const inputRef = useRef(null);

  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        onSearch('');
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onSearch]);

  const term = searchTerm.trim();
  const filtering = Boolean(term) || activeCategory !== 'All';

  // The live region is always on the page so a screen reader hears each change;
  // it is only worded while something narrows the list (or the list is loading).
  let line = '';
  if (status === 'loading') line = `Loading ${noun}.`;
  else if (status === 'ready' && filtering) {
    line = `${shown} of ${total} ${noun}${activeCategory !== 'All' ? ` in ${activeCategory}` : ''}${term ? ` matching "${term}"` : ''}`;
  }

  return (
    <>
      <div className="list-toolbar">
        <div className="list-search">
          <label htmlFor={`${noun}-search`} className="sr-only">Search {noun}</label>
          <input
            id={`${noun}-search`}
            ref={inputRef}
            type="search"
            placeholder={`Search ${noun}`}
            autoComplete="off"
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
          />
          {searchTerm ? (
            <button type="button" className="list-search__clear" onClick={() => onSearch('')}>Clear</button>
          ) : (
            <kbd aria-hidden="true">{isMac ? '⌘K' : 'Ctrl K'}</kbd>
          )}
        </div>

        {chips.length > 1 && (
          <div className="list-filters" role="group" aria-label="Filter by category">
            {chips.map(({ name, count }) => (
              <button
                key={name}
                type="button"
                className="list-chip"
                aria-pressed={activeCategory === name}
                onClick={() => onChip(name)}
              >
                {name}<span className="list-chip__n">{count}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <p className="list-results" role="status" aria-live="polite">{line}</p>
    </>
  );
}
