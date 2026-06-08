import React, { useEffect, useRef, useState } from 'react'
import './css/GambiarraImpact.css'

const STATS = [
    {
        value: "$800K+",
        target: 800,
        prefix: "$",
        suffix: "K+",
        label: "Grants Secured",
        detail: "Duke, Karsh, Estudar Foundation, BMO & more",
        timestamp: "REC · 2024-11-12",
        spark: [0.2, 0.35, 0.5, 0.6, 0.65, 0.8, 0.9, 1.0]
    },
    {
        value: "100K+",
        target: 100,
        prefix: "",
        suffix: "K+",
        label: "Lives Impacted",
        detail: "Via entrepreneurship, research & volunteering",
        timestamp: "REC · 2024-10-30",
        spark: [0.1, 0.18, 0.3, 0.42, 0.55, 0.7, 0.85, 1.0]
    },
    {
        value: "13",
        target: 13,
        prefix: "",
        suffix: "",
        label: "Publications",
        detail: "Peer-reviewed · Biomedical engineering",
        timestamp: "REC · 2025-Q1",
        spark: [0.15, 0.25, 0.4, 0.5, 0.55, 0.7, 0.85, 1.0]
    },
    {
        value: "92%",
        target: 92,
        prefix: "",
        suffix: "%",
        label: "Pilot Satisfaction",
        detail: "From users in production deployments",
        timestamp: "REC · 2025-03-08",
        spark: [0.5, 0.55, 0.62, 0.7, 0.78, 0.82, 0.88, 0.92]
    },
];

const TICKER_ITEMS = [
    'DUKE UNIVERSITY',
    'KARSH SCHOLAR · FULL MERIT',
    'ESTUDAR FOUNDATION',
    'BMO · IMPACT GRANT',
    'TEDxDUKE 2023',
    'AMBULIS INC. · CO-FOUNDER',
    'BIG IDEAs LAB',
    'FEBRACE GOLD · 2021',
    'ISEF FINALIST · J&J',
    'BELGRADE GOLD · 29th IYNT',
    '100K LIVES IMPACTED',
    '$800K GRANTS SECURED',
    '13 PUBLICATIONS',
    '92% PILOT SATISFACTION',
];

/* Build a tiny inline SVG sparkline from a 0..1 array */
const Sparkline = ({ points, color = 'currentColor' }) => {
    const w = 64, h = 18;
    const step = w / (points.length - 1);
    const path = points
        .map((v, i) => `${i === 0 ? 'M' : 'L'}${(i * step).toFixed(1)},${(h - v * h).toFixed(1)}`)
        .join(' ');
    const lastX = (points.length - 1) * step;
    const lastY = h - points[points.length - 1] * h;
    return (
        <svg className="gi__spark" viewBox={`0 0 ${w} ${h}`} width={w} height={h} aria-hidden="true">
            <path d={path} fill="none" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={lastX} cy={lastY} r="2" fill={color} />
        </svg>
    );
};

/* Format a number based on prefix/suffix definition */
const formatStat = (val, stat) => {
    const intPart = Math.round(val);
    return `${stat.prefix}${intPart.toLocaleString()}${stat.suffix}`;
};

/* Count-up child component (runs animation only once on first visibility) */
const StatValue = ({ stat, run, reduced }) => {
    const [display, setDisplay] = useState(reduced ? stat.value : formatStat(0, stat));
    const startedRef = useRef(false);

    useEffect(() => {
        if (!run || reduced || startedRef.current) return;
        startedRef.current = true;

        const duration = 1200;
        const start = performance.now();
        const ease = (t) => 1 - Math.pow(1 - t, 3); // cubic-out
        let raf;

        const tick = (now) => {
            const t = Math.min(1, (now - start) / duration);
            const eased = ease(t);
            setDisplay(formatStat(eased * stat.target, stat));
            if (t < 1) raf = requestAnimationFrame(tick);
            else setDisplay(stat.value);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [run, reduced, stat]);

    return <span className="gi__stat-value count-up" aria-label={stat.value}>{display}</span>;
};

const GambiarraImpact = () => {
    const [visible, setVisible] = useState(false);
    const [reduced, setReduced] = useState(false);
    const sectionRef = useRef(null);

    useEffect(() => {
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        setReduced(mq.matches);
        const handler = (e) => setReduced(e.matches);
        mq.addEventListener('change', handler);

        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setVisible(true); },
            { threshold: 0.15 }
        );
        const node = sectionRef.current;
        if (node) observer.observe(node);

        return () => {
            mq.removeEventListener('change', handler);
            if (node) observer.unobserve(node);
        };
    }, []);

    return (
        <section
            ref={sectionRef}
            id="impact"
            className={`gi ${visible ? 'gi--visible' : ''} ${reduced ? 'gi--reduced-motion' : ''}`}
            aria-labelledby="gi-heading"
        >
            <div className="gi__blueprint" aria-hidden="true" />
            <div className="gi__orb" aria-hidden="true" />

            <div className="gi__container">
                {/* Mission-log left pillar */}
                <aside className="gi__pillar" aria-hidden="true">
                    <span className="gi__pillar-id">MISSION LOG</span>
                    <span className="gi__pillar-bar" />
                    <span className="gi__pillar-status">
                        <span className="gi__pillar-dot" />
                        STATUS · ACTIVE
                    </span>
                    <span className="gi__pillar-coord">REC · LIVE</span>
                </aside>

                <div className="gi__main">
                    <header className="gi__header">
                        <span className="gi__channel">
                            <span className="gi__channel-id">CH:02</span>
                            <span className="gi__channel-sep" />
                            IMPACT TELEMETRY
                        </span>
                        <h2 className="gi__heading" id="gi-heading">
                            Gambiarra at Scale
                        </h2>
                        <p className="gi__subheading">
                            Resourcefulness forged on a Brazilian farm, applied to real systems.
                            These numbers don&apos;t come from a slide deck.
                        </p>
                    </header>

                    <ul className="gi__grid" aria-label="Impact statistics">
                        {STATS.map((stat, i) => (
                            <li
                                className="gi__stat"
                                key={stat.label}
                                style={{ '--gi-delay': `${i * 0.12}s` }}
                            >
                                <div className="gi__stat-top">
                                    <span className="gi__stat-channel">CH:{String(i + 1).padStart(2, '0')}</span>
                                    <Sparkline points={stat.spark} color="#3AAFF1" />
                                </div>
                                <StatValue stat={stat} run={visible} reduced={reduced} />
                                <span className="gi__stat-label">{stat.label}</span>
                                <span className="gi__stat-time">{stat.timestamp}</span>
                                <span className="gi__stat-detail">{stat.detail}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Telemetry ticker */}
            <div className="gi__ticker-wrap">
                <div className="ticker">
                    <div className="ticker__track">
                        {[...TICKER_ITEMS, ...TICKER_ITEMS].map((it, idx) => (
                            <span className="ticker__item" key={`${it}-${idx}`}>
                                {it}
                                <span className="ticker__sep">·</span>
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default GambiarraImpact;
