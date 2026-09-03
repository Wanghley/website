import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { usePostHog } from '@posthog/react';
import { FaArrowRight, FaCalendarAlt } from 'react-icons/fa';
import SplitText from '../bits/SplitText';
import DecryptedText from '../bits/DecryptedText';
import Magnet from '../bits/Magnet';
import './css/ClosingTransmit.css';

export default function ClosingTransmit() {
  const posthog = usePostHog();
  const sectionRef = useRef(null);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setEntered(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setEntered(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="transmit"
      className="closing-transmit"
      aria-labelledby="transmit-heading"
    >
      <div className="closing-transmit__grid">
        <div className="closing-transmit__text">
          <span className="channel-mark channel-mark--dark">
            <span className="channel-mark__id">CH:04</span>
            <span className="channel-mark__sep" />
            <span className="channel-mark__title">CHANNEL OPEN</span>
          </span>

          <h2 className="closing-transmit__heading" id="transmit-heading">
            <SplitText
              as="span"
              mode="mask"
              text="Open the "
              className="closing-transmit__heading-part"
            />
            <SplitText
              as="span"
              mode="mask"
              text="channel."
              className="closing-transmit__heading-part closing-transmit__heading-part--accent"
              delay={0.12}
            />
          </h2>

          <div className="closing-transmit__meta">
            <span className="telemetry telemetry--dark">
              <DecryptedText text="FREQ 2.4 GHz" trigger={entered} speed={24} />
            </span>
            <span className="telemetry telemetry--dark">
              <span className="telemetry__dot" />
              <DecryptedText text="STATUS AVAILABLE" trigger={entered} speed={20} />
            </span>
            <span className="telemetry telemetry--dark">
              <DecryptedText text="LATENCY < 24h" trigger={entered} speed={26} />
            </span>
          </div>
        </div>

        <div className="closing-transmit__ctas">
          <Magnet
            as={motion.a}
            href="/contact"
            className="btn btn--primary closing-transmit__cta"
            onClick={() => posthog?.capture('home_transmit_contact_clicked')}
          >
            Send a Message
            <FaArrowRight aria-hidden="true" className="closing-transmit__cta-icon" />
          </Magnet>
          <Magnet
            as={motion.a}
            href="https://cal.com/wanghley"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--ghost closing-transmit__cta closing-transmit__cta--ghost"
            onClick={() => posthog?.capture('home_transmit_call_clicked')}
          >
            <FaCalendarAlt aria-hidden="true" className="closing-transmit__cta-icon" />
            Schedule a Call
          </Magnet>
        </div>
      </div>
    </section>
  );
}
