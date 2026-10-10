import React from 'react';
import { Helmet } from 'react-helmet-async';
import rubrica from '../assets/handwriting/rubrica.png';
import './css/styleguide.css';

const COLORS = [
  { token: '--ink', hex: '#121314', use: 'Page background', ratio: '16.7:1 with paper' },
  { token: '--surface', hex: '#1C1D1F', use: 'Cards, board, panels', ratio: '14.7:1 with paper' },
  { token: '--graphite', hex: '#313131', use: 'Brand dark, dividers', ratio: 'decorative' },
  { token: '--paper', hex: '#F2EFE9', use: 'Primary text', ratio: '16.7:1 on ink' },
  { token: '--paper-dim', hex: '#B9B5AC', use: 'Secondary text', ratio: '9.1:1 on ink' },
  { token: '--muted', hex: '#9A978F', use: 'Mono labels', ratio: '6.4:1 on ink' },
  { token: '--signal', hex: '#3AAFF1', use: 'Links, active, primary CTA', ratio: '7.5:1 on ink' },
  { token: '--copper', hex: '#D9853B', use: 'PCB copper, hover, focus', ratio: '6.5:1 on ink' },
  { token: '--copper-lit', hex: '#F0A460', use: 'Energised traces only', ratio: '9.0:1 on ink' },
  { token: '--ok', hex: '#6FCF97', use: 'Status only (NOMINAL)', ratio: '9.8:1 on ink' },
  { token: '--alert', hex: '#E84A5F', use: 'Errors only, never a CTA', ratio: '4.9:1 on ink' },
];

const OPTIONS = [
  {
    id: 'A',
    name: 'General Sans',
    source: 'Fontshare, free for commercial use. Already loaded as the provisional face.',
    family: "'General Sans', 'Helvetica Neue', sans-serif",
    note: 'Geometric with slightly squared curves. Calm and technical; the safest fit for engineering copy.',
  },
  {
    id: 'B',
    name: 'Bricolage Grotesque',
    source: 'Google Fonts, OFL. Variable, with an optical-size axis.',
    family: "'Bricolage Grotesque', 'Helvetica Neue', sans-serif",
    note: 'The most characterful: ink-trap quirks at display size, plain at text size. Fits "gambiarra" best.',
  },
  {
    id: 'C',
    name: 'Schibsted Grotesk',
    source: 'Google Fonts, OFL.',
    family: "'Schibsted Grotesk', 'Helvetica Neue', sans-serif",
    note: 'Editorial and sturdy, a little condensed. Reads like a lab notebook heading.',
  },
];

const SCALE = [
  ['--step-5', 'Hero name'],
  ['--step-4', 'Section headline'],
  ['--step-3', 'Sub-headline'],
  ['--step-2', 'Card title'],
  ['--step-1', 'Lead'],
  ['--step-0', 'Body'],
  ['--step--1', 'Caption'],
  ['--step--2', 'Mono label'],
];

export default function Styleguide() {
  return (
    <main className="sg" id="main">
      <Helmet>
        <title>Style tile | Wanghley</title>
        <meta name="robots" content="noindex" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..700&family=Schibsted+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Helmet>

      <header className="sg__head container">
        <p className="sg__label">STYLE TILE · PHASE 1</p>
        <h1 className="sg__title">The Bench</h1>
        <p className="sg__lede">
          Graphite surfaces, copper traces, signal-blue for what is alive. Pick a text face in section 2.
        </p>
      </header>

      <section className="sg__section container" aria-labelledby="sg-color">
        <h2 id="sg-color" className="sg__h2">1. Colour</h2>
        <ul className="sg__swatches">
          {COLORS.map((c) => (
            <li key={c.token} className="sg__swatch">
              <span className="sg__chip" style={{ background: c.hex }} aria-hidden="true" />
              <span className="sg__swatch-name">{c.token}</span>
              <span className="sg__mono">{c.hex}</span>
              <span className="sg__swatch-use">{c.use}</span>
              <span className="sg__mono sg__dim">{c.ratio}</span>
            </li>
          ))}
          <li className="sg__swatch">
            <span className="sg__chip sg__chip--logo" aria-hidden="true" />
            <span className="sg__swatch-name">--logo-grad</span>
            <span className="sg__mono">#14242C → #2770B5 → #46AAE0</span>
            <span className="sg__swatch-use">Logo and rare hero accents only</span>
          </li>
        </ul>
        <p className="sg__note">
          Alert on a surface card measures 4.5:1, so it is reserved for status text at 16px and up. No navy, no neon
          glow on text. Glow is allowed only on energised traces.
        </p>
      </section>

      <section className="sg__section container" aria-labelledby="sg-type">
        <h2 id="sg-type" className="sg__h2">2. Type: choose the text face</h2>
        <div className="sg__options">
          {OPTIONS.map((o) => (
            <article key={o.id} className="sg__option" style={{ '--sample': o.family }}>
              <p className="sg__label">OPTION {o.id}</p>
              <h3 className="sg__option-name">{o.name}</h3>
              <p className="sg__sample-h">I put the intelligence inside the sensor.</p>
              <p className="sg__sample-p">
                PhD at Rice building wearable biosensors and the microwatt AI that runs on them. I treat 38 µW and 0.4
                ms as product constraints, not paper metrics.
              </p>
              <p className="sg__sample-p sg__sample-p--small">Gambiarra: fixing it with what is on the bench. 0123456789</p>
              <p className="sg__note">{o.note}</p>
              <p className="sg__mono sg__dim">{o.source}</p>
            </article>
          ))}
        </div>
        <p className="sg__note">
          Neue Montreal and Söhne are not shown: neither can be served from a free CDN, and both need a paid licence
          and self-hosting. Say so if you own one and want it added.
        </p>

        <div className="sg__pair">
          <div>
            <p className="sg__label">WORDMARK FACE · NAME AND LOGO ONLY</p>
            <p className="sg__wordmark">WANGHLEY</p>
          </div>
          <div>
            <p className="sg__label">MONO · IBM PLEX MONO · INSTRUMENT LABELS, UNDER 10% OF TEXT</p>
            <p className="sg__mono sg__mono--lg">HOUSTON 29.72°N 95.40°W · SENSE 0.18 pF</p>
          </div>
        </div>

        <h3 className="sg__h3">Fluid scale (clamp)</h3>
        <ul className="sg__scale">
          {SCALE.map(([token, role]) => (
            <li key={token} style={{ fontSize: `var(${token})` }}>
              <span className="sg__scale-sample">{role}</span>
              <span className="sg__mono sg__dim">{token}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="sg__section container" aria-labelledby="sg-ui">
        <h2 id="sg-ui" className="sg__h2">3. Buttons, cards, focus</h2>
        <div className="sg__row">
          <a className="btn btn--primary" href="#sg-ui">See my work</a>
          <a className="btn btn--ghost" href="#sg-ui">Get in touch</a>
          <a className="sg__link" href="#sg-ui">Text link</a>
          <button type="button" className="btn btn--primary" disabled>Disabled</button>
        </div>
        <p className="sg__note">
          Primary is signal-blue with no glow. Hover is copper on ghost. Tab through these: focus is a copper ring
          with an ink gap.
        </p>

        <div className="sg__cards">
          <article className="sg__card">
            <p className="sg__label">NON-CONTACT CAPACITIVE SENSOR V3</p>
            <h3 className="sg__card-title">Reads a hand without touching it.</h3>
            <dl className="sg__facts">
              <div><dt>Constraint</dt><dd className="sg__mono">[[PLACEHOLDER: µW / ms / $ BOM]]</dd></div>
              <div><dt>Result</dt><dd className="sg__mono">[[PLACEHOLDER: number]]</dd></div>
              <div><dt>My role</dt><dd>[[PLACEHOLDER]]</dd></div>
            </dl>
          </article>
          <article className="sg__card sg__card--note">
            <p className="sg__label">HANDWRITING LAYER</p>
            <img className="sg__rubrica" src={rubrica} alt="" width="311" height="158" />
            <p className="sg__note">
              Rubrica only. It will draw in once, on contact and in the notebook-style cards. Never a handwriting font.
            </p>
          </article>
        </div>
      </section>

      <section className="sg__section container" aria-labelledby="sg-motion">
        <h2 id="sg-motion" className="sg__h2">4. Motion tokens</h2>
        <ul className="sg__tokens sg__mono">
          <li>--dur-micro 120ms · --dur-ui 240ms · --dur-reveal 480ms · --dur-set 900ms</li>
          <li>--ease-out cubic-bezier(.2,.7,.1,1) · --ease-in-out cubic-bezier(.65,0,.35,1)</li>
          <li>--stagger 48ms · Nothing bounces except the Funko</li>
          <li>Reduced motion: animations off globally, and each set piece gets a designed still</li>
        </ul>
      </section>
    </main>
  );
}
