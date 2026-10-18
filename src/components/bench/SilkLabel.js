import React from 'react';

// A reference designator as printed on a board (U2, J1, TP3). Decoration: it
// never repeats what the heading says, so assistive tech skips it.
export default function SilkLabel({ refdes }) {
  return <span className="bp-silk" aria-hidden="true">{refdes}</span>;
}

// A hairline that ends in a designator. Sits at the top of a section or a
// page header, where it reads as a marking on the board, not as a kicker.
export function SilkRule({ refdes }) {
  return (
    <div className="bp-rule" aria-hidden="true">
      {refdes && <SilkLabel refdes={refdes} />}
    </div>
  );
}
