import React, { useRef } from 'react';

// Tabs for choosing what a project page shows (see views.js). The panels they
// control are rendered by the page, with id `${idPrefix}-panel-${view.id}`.
export default function ViewSwitch({ views, active, onChange, idPrefix = 'project-view', label = 'What to show' }) {
  const refs = useRef({});

  const move = (event, index) => {
    const last = views.length - 1;
    const next = {
      ArrowRight: index === last ? 0 : index + 1,
      ArrowLeft: index === 0 ? last : index - 1,
      Home: 0,
      End: last,
    }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    const view = views[next];
    onChange(view.id);
    refs.current[view.id]?.focus();
  };

  return (
    <div className="article-views" role="tablist" aria-label={label}>
      {views.map((view, index) => (
        <button
          key={view.id}
          ref={(el) => { refs.current[view.id] = el; }}
          type="button"
          role="tab"
          id={`${idPrefix}-tab-${view.id}`}
          aria-selected={view.id === active}
          aria-controls={`${idPrefix}-panel-${view.id}`}
          tabIndex={view.id === active ? 0 : -1}
          onClick={() => onChange(view.id)}
          onKeyDown={(event) => move(event, index)}
        >
          {view.label}
        </button>
      ))}
    </div>
  );
}
