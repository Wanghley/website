import React from 'react';

// Long-form reading column. Wrap rendered markdown or article HTML in it; the
// type, lists, tables, code and footnote markers follow the band's theme.
export default function Prose({ as: Tag = 'div', className = '', children }) {
  return <Tag className={`bp-prose ${className}`.trim()}>{children}</Tag>;
}
