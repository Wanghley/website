import { useEffect, useState } from 'react';

// Runs a CMS read once on mount. `status` is loading | ready | error. Components
// render nothing for a section until it is ready, so a CMS outage leaves that
// section empty rather than showing copy that is not in the CMS.
export default function useCmsData(load) {
  const [state, setState] = useState({ status: 'loading', data: null });

  useEffect(() => {
    let alive = true;
    load()
      .then((data) => { if (alive) setState({ status: 'ready', data }); })
      .catch(() => { if (alive) setState({ status: 'error', data: null }); });
    return () => { alive = false; };
    // The loaders are module-level functions; the read happens once per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return state;
}
