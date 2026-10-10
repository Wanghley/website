import React from 'react';
import { Helmet } from 'react-helmet-async';
import BenchScene from '../components/home/bench/BenchScene';

// Capture harness for scripts/render-hero-assets.js: renders the exact live
// scene with a manual clock, so the hero poster and the mobile loop are
// frame-accurate copies of what desktop visitors see. Not linked anywhere.
export default function BenchCapture() {
  return (
    <div id="bench-capture" style={{ position: 'fixed', inset: 0, zIndex: 5000, background: 'transparent' }}>
      <Helmet>
        <meta name="robots" content="noindex" />
        <title>capture</title>
      </Helmet>
      <BenchScene capture />
    </div>
  );
}
