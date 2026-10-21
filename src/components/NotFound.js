import { Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { PageHeader } from './bench';
import './css/notFound.css';

// "Eita! Sem sinal." is Portuguese for "Whoa! No signal." The readout mirrors
// the hero's instrument line: with nothing near the pad, the sensor reads zero.
const NotFound = () => {
  const { pathname } = useLocation();

  return (
    <main id="main" className="notfound-page">
      <Helmet>
        <title>404 | Wanghley Martins</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <section className="bp-sec bp-sec--head">
        <div className="bench-col">
          <PageHeader
            refdes="404"
            title="Eita! Sem sinal."
            lede={`Nothing answers at ${pathname}. The page may have moved, or the link may be mistyped.`}
            meta={['SENSE 0.00 pF', 'no signal']}
          >
            <div className="notfound-actions">
              <Link className="btn btn--primary" to="/">Back home</Link>
              <Link className="btn btn--ghost" to="/projects">Projects</Link>
              <Link className="btn btn--ghost" to="/curriculum-vitae">CV</Link>
            </div>
          </PageHeader>
        </div>
      </section>
    </main>
  );
};

export default NotFound;
