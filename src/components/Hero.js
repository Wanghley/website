import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import './css/Hero.css'
import { FaGithub, FaLinkedin } from 'react-icons/fa'
import { SiGooglescholar } from 'react-icons/si'
import profileImage from '../assets/54015060324_813dcb695e_o-2-3.jpg'
import EcgRibbon from './EcgRibbon'

const textContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.45 } },
}

const textItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } },
}

const Hero = () => {
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
    const [armed, setArmed] = useState(false);
    const canvasRef = useRef(null);

    useEffect(() => {
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        setPrefersReducedMotion(mq.matches);
        const handler = (e) => setPrefersReducedMotion(e.matches);
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);

    /* Arm reticle + scan-stripe animations after first paint */
    useEffect(() => {
        const id = setTimeout(() => setArmed(true), 220);
        return () => clearTimeout(id);
    }, []);

    // Three.js hero background animation
    useEffect(() => {
        if (prefersReducedMotion) return;
        const canvas = canvasRef.current;
        if (!canvas) return;

        let animId;
        let rendererRef = null;

        import('three').then((THREE) => {
            const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
            rendererRef = renderer;
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            renderer.setClearColor(0x09090F, 1);

            const scene  = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 200);
            camera.position.set(0, 5.5, 22);
            camera.lookAt(0, -1.5, -2);

            function resize() {
                const w = canvas.offsetWidth, h = canvas.offsetHeight;
                if (!w || !h) return;
                renderer.setSize(w, h, false);
                camera.aspect = w / h;
                camera.updateProjectionMatrix();
            }
            const ro = new ResizeObserver(resize);
            ro.observe(canvas);
            resize();

            // Signal functions
            const G = (x, u, s) => Math.exp(-0.5 * ((x - u) / s) ** 2);
            const ecg = t => {
                const u = ((t % 1) + 1) % 1;
                return 0.08*G(u,.14,.030) - 0.05*G(u,.32,.012)
                     + 0.52*G(u,.37,.018) - 0.09*G(u,.43,.012)
                     + 0.12*G(u,.62,.045);
            };
            const eeg = t => (
                0.045*Math.sin(t*Math.PI*12.8)
              + 0.030*Math.sin(t*Math.PI*20.4+1.3)
              + 0.018*Math.sin(t*Math.PI*6.4-0.7)
              + 0.012*Math.cos(t*Math.PI*30+0.5)
              + 0.006*Math.sin(t*Math.PI*42-1.1)
            );
            const ppg = t => {
                const u = ((t * 0.82) % 1 + 1) % 1;
                return 0.22*G(u,.26,.088) + 0.06*G(u,.46,.036) - 0.028;
            };
            const spiClk = t => { const u = ((t*9.5)%1+1)%1; return u<0.5?0.30:-0.30; };
            const pwm    = t => { const u = ((t*4.2)%1+1)%1; return u<0.65?0.28:-0.22; };
            const adcNoise = t => {
                const base = Math.sin(t*51)*0.03 + Math.cos(t*87+1.4)*0.02
                           + Math.sin(t*133-0.6)*0.012;
                return base + (Math.abs(Math.sin(t*0.75)) > 0.965 ? Math.sin(t*250)*0.32 : 0);
            };

            function layerConfig(i, total) {
                const t = i / (total - 1);
                if (t < 0.32) return { fn: ecg,           r:0.227, g:0.686, b:0.945, amp:3.4 };
                if (t < 0.52) return { fn: ppg,           r:0.120, g:0.780, b:0.600, amp:3.2 };
                if (t < 0.70) return { fn: eeg,           r:0.160, g:0.520, b:0.920, amp:2.8 };
                if (t < 0.84) return { fn: i%2?spiClk:pwm, r:0.100, g:0.600, b:0.720, amp:2.4 };
                return { fn: adcNoise, r:0.080, g:0.440, b:0.580, amp:2.0 };
            }

            const N_LAYERS=24, POINTS=320, SPAN=60, Z_FRONT=6, Z_BACK=-24, Y_BASE=-1.8;
            const layers = [];

            for (let i = 0; i < N_LAYERS; i++) {
                const t     = i / (N_LAYERS - 1);
                const z     = Z_FRONT + t * (Z_BACK - Z_FRONT);
                const cfg   = layerConfig(i, N_LAYERS);
                const fade  = (1 - t) * 0.80 + 0.04;
                const bright= 0.12 + (1 - t) * 0.88;

                const positions = new Float32Array(POINTS * 3);
                const geo = new THREE.BufferGeometry();
                geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
                const line = new THREE.Line(geo, new THREE.LineBasicMaterial({
                    color: new THREE.Color(cfg.r*bright, cfg.g*bright, cfg.b*bright),
                    transparent: true, opacity: fade
                }));
                scene.add(line);
                layers.push({ geo, positions, z, phase: i*0.14, fn: cfg.fn, amp: cfg.amp });
            }

            // Wireframe electronics
            const wireMat = op => new THREE.LineBasicMaterial({ color: 0x3AAFF1, transparent: true, opacity: op });
            const addWire = (geo, mat, pos, rot) => {
                const m = new THREE.LineSegments(new THREE.EdgesGeometry(geo), mat);
                m.position.set(...pos); m.rotation.set(...rot);
                scene.add(m); return m;
            };
            const pcb   = addWire(new THREE.BoxGeometry(14,0.25,9),    wireMat(0.10), [-16,-3.2,-13], [-0.15,0.3,0.05]);
            const chip  = addWire(new THREE.BoxGeometry(4.5,0.45,4.5), wireMat(0.14), [16,-2.5,-11],  [0.1,-0.4,0.08]);
            const board = addWire(new THREE.BoxGeometry(22,0.18,7),    wireMat(0.07), [1,-4,-20],      [-0.10,0,0]);

            // Particles
            const N_P = 260;
            const pP  = new Float32Array(N_P * 3);
            for (let i = 0; i < N_P; i++) {
                pP[i*3]   = (Math.random()-.5)*80;
                pP[i*3+1] = (Math.random()-.5)*40;
                pP[i*3+2] = Math.random()*(Z_FRONT-Z_BACK)+Z_BACK;
            }
            const pGeo = new THREE.BufferGeometry();
            pGeo.setAttribute('position', new THREE.BufferAttribute(pP, 3));
            scene.add(new THREE.Points(pGeo, new THREE.PointsMaterial({
                color: 0x3AAFF1, size: 0.055, transparent: true, opacity: 0.26
            })));

            const pl = new THREE.Mesh(
                new THREE.PlaneGeometry(90, 50).rotateX(-Math.PI/2),
                new THREE.MeshBasicMaterial({ color: 0x3AAFF1, transparent: true, opacity: 0.018, side: THREE.DoubleSide })
            );
            pl.position.y = -4.8;
            scene.add(pl);

            // Mouse parallax
            let mx=0, my=0, tmx=0, tmy=0;
            const onMouseMove = e => {
                tmx = (e.clientX / window.innerWidth  - 0.5) * 2;
                tmy = (e.clientY / window.innerHeight - 0.5) * 2;
            };
            window.addEventListener('mousemove', onMouseMove, { passive: true });

            let offset = 0, time = 0;
            const loop = () => {
                animId = requestAnimationFrame(loop);
                offset += 0.007; time += 0.003;
                mx += (tmx - mx) * 0.04;
                my += (tmy - my) * 0.04;
                camera.position.x = mx * 2.5;
                camera.position.y = 5.5 - my * 1.8;
                camera.lookAt(0, -1.5, -2);
                pcb.rotation.y   = time * 0.15;
                chip.rotation.y  = -time * 0.22;
                board.rotation.y = time * 0.08;
                layers.forEach(layer => {
                    const pos = layer.positions;
                    for (let i = 0; i < POINTS; i++) {
                        const t = (i / POINTS) * 7 + offset + layer.phase;
                        pos[i*3]   = (i / POINTS) * SPAN - SPAN/2;
                        pos[i*3+1] = layer.fn(t) * layer.amp + Y_BASE;
                        pos[i*3+2] = layer.z;
                    }
                    layer.geo.attributes.position.needsUpdate = true;
                });
                renderer.render(scene, camera);
            };
            loop();

            canvas._heroCleanup = () => {
                cancelAnimationFrame(animId);
                window.removeEventListener('mousemove', onMouseMove);
                ro.disconnect();
                renderer.dispose();
            };
        }).catch(() => { /* THREE not available, skip animation */ });

        return () => {
            if (canvas._heroCleanup) {
                canvas._heroCleanup();
                canvas._heroCleanup = null;
            } else if (animId) {
                cancelAnimationFrame(animId);
            }
            if (rendererRef) rendererRef.dispose();
        };
    }, [prefersReducedMotion]);

    const scrollToCh01 = () => {
        document.getElementById('about')?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    };

    const scrollToContact = () => {
        const el = document.getElementById('contact');
        const behavior = prefersReducedMotion ? 'auto' : 'smooth';
        if (el) {
            el.scrollIntoView({ behavior });
            try { el.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
            // update the URL hash without jumping
            if (window.history && window.history.replaceState) {
                window.history.replaceState(null, '', '#contact');
            }
        } else {
            // Not present (user might be on a different route) — navigate to home with hash
            window.location.href = '/' + '#contact';
        }
    };

    return (
        <section
            id="home"
            className={`hero hero--instrumented${armed ? ' hero--armed' : ''}`}
            aria-label="Introduction to Wanghley Martins"
        >
            <canvas ref={canvasRef} className="hero-bg-canvas" aria-hidden="true" />
            <div className="hero-topo" aria-hidden="true" />
            <div className="hero-orb hero-orb-1" aria-hidden="true" />
            <div className="hero-orb hero-orb-2" aria-hidden="true" />
            <div className="hero-orb hero-orb-3" aria-hidden="true" />

            {/* One-shot boot scan-line */}
            {!prefersReducedMotion && <div className="hero-scan-line" aria-hidden="true" />}

            {/* HUD telemetry strip — staggers in via hero--armed */}
            <div className="hero-telemetry-strip" aria-hidden="true">
                <div className="container hero-telemetry-strip__inner">
                    <span className="hero-telemetry-strip__seg hero-telemetry-strip__seg--id">
                        <span className="hero-telemetry-strip__id">CH:00</span>
                        <span className="hero-telemetry-strip__dash" />
                        ORIGIN
                    </span>
                    <span className="hero-telemetry-strip__seg hero-telemetry-strip__seg--loc">
                        LOC 36.0°N · 78.9°W
                    </span>
                    <span className="hero-telemetry-strip__seg hero-telemetry-strip__seg--status">
                        STATUS&nbsp;
                        <span className="hero-telemetry-strip__live">
                            <span className="hero-telemetry-strip__dot" />
                            NOMINAL
                        </span>
                    </span>
                </div>
            </div>

            <div className="container relative z-[2]">
                <div className="hero-grid">

                    {/* Left: text content — Framer Motion stagger */}
                    <motion.div
                        className="hero-text"
                        variants={textContainer}
                        initial={prefersReducedMotion ? false : 'hidden'}
                        animate="show"
                    >
                        <motion.div className="hero-credential" variants={textItem}>
                            <span className="hero-credential__sep" aria-hidden="true" />
                            Engineer<span className="dot">·</span>Researcher<span className="dot">·</span>Entrepreneur<span className="dot">·</span>Speaker
                        </motion.div>

                        <motion.div className="hero-name" variants={textItem}>
                            WANGHLEY
                            <span className="hero-name__subscript" aria-hidden="true">
                                SOARES MARTINS
                            </span>
                        </motion.div>

                        <motion.h1 className="hero-role" variants={textItem}>
                            Building Intelligent Systems
                        </motion.h1>

                        <motion.p className="hero-desc" variants={textItem}>
                            I project custom hardware, edge ML, and signal processing engineered to production standards and deployed where it matters.
                        </motion.p>

                        <motion.div className="hero-ctas" variants={textItem}>
                            <button
                                type="button"
                                className="btn btn-primary btn-cta"
                                aria-label="Contact me"
                                onClick={scrollToContact}
                            >
                                Contact Me
                                <span className="hero-cta__arrow">→</span>
                            </button>
                            <a
                                href="/projects"
                                className="btn btn-secondary"
                                aria-label="See my past projects"
                            >
                                See My Projects
                            </a>
                        </motion.div>

                        <motion.div className="hero-trust" variants={textItem}>
                            <span>Ph.D. Student @ Rice</span>
                            <span className="hero-trust__sep" aria-hidden="true" />
                            <span>ECE + CS @ Duke</span>
                            <span className="hero-trust__sep" aria-hidden="true" />
                            <span>Entrepreneur</span>
                        </motion.div>

                        <motion.nav className="hero-social" variants={textItem} aria-label="Social media links">
                            <a
                                href="https://github.com/wanghley"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="nav-icon"
                                title="GitHub"
                                aria-label="Visit my GitHub profile (opens in new tab)"
                            >
                                <FaGithub aria-hidden="true" />
                            </a>
                            <a
                                href="https://linkedin.com/in/wanghley"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="nav-icon"
                                title="LinkedIn"
                                aria-label="Visit my LinkedIn profile (opens in new tab)"
                            >
                                <FaLinkedin aria-hidden="true" />
                            </a>
                            <a
                                href="https://scholar.google.com/citations?user=sN2iKrkAAAAJ"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="nav-icon"
                                title="Google Scholar"
                                aria-label="Visit my Google Scholar profile (opens in new tab)"
                            >
                                <SiGooglescholar aria-hidden="true" />
                            </a>
                        </motion.nav>

                        <motion.div className="hero-hints" variants={textItem}>
                            <button className="hint eng" onClick={scrollToCh01} type="button">
                                Engineering <span className="hint-arrow">↓</span>
                            </button>
                            <span className="hint-sep" aria-hidden="true" />
                            <a href="/photography" className="hint photo">
                                Photography <span className="hint-arrow">→</span>
                            </a>
                        </motion.div>
                    </motion.div>

                    {/* Right: cinematic portrait — fades + scales in */}
                    <motion.div
                        className="hero-portrait-cinematic"
                        initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.15 }}
                        aria-hidden="true"
                    >
                        {/* Radial glow halo behind the portrait */}
                        <div className="hero-portrait-glow" />
                        <div className={`hero-portrait-scan${armed ? ' hero-portrait-scan--armed' : ''}`}>
                            <div
                                className="hero-portrait-scan__slice hero-portrait-scan__slice--1"
                                style={{ backgroundImage: `url(${profileImage})` }}
                            />
                            <div
                                className="hero-portrait-scan__slice hero-portrait-scan__slice--2"
                                style={{ backgroundImage: `url(${profileImage})` }}
                            />
                            <div
                                className="hero-portrait-scan__slice hero-portrait-scan__slice--3"
                                style={{ backgroundImage: `url(${profileImage})` }}
                            />
                        </div>

                        <div className={`hero-reticle${armed ? ' hero-reticle--armed' : ''}`}>
                            <span className="hero-reticle__corner hero-reticle__corner--tl" />
                            <span className="hero-reticle__corner hero-reticle__corner--tr" />
                            <span className="hero-reticle__corner hero-reticle__corner--bl" />
                            <span className="hero-reticle__corner hero-reticle__corner--br" />
                        </div>

                        {/* Side telemetry annotations on portrait */}
                        <span className="hero-portrait-annot hero-portrait-annot--top">
                            <span className="hero-portrait-annot__dash" />
                            SUBJECT · WSM
                        </span>
                        <span className="hero-portrait-annot hero-portrait-annot--bottom">
                            FRAME · 04.7
                            <span className="hero-portrait-annot__dash" />
                        </span>
                    </motion.div>

                </div>
            </div>

            {/* Full-bleed baseline waveform anchored to hero bottom */}
            <div className="hero-baseline" aria-hidden="true">
                <EcgRibbon height={28} />
            </div>
        </section>
    );
};

export default Hero;
