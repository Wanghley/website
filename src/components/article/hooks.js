import { useEffect, useRef, useState } from 'react';

// The id of the heading nearest the top of the screen, for the table of contents.
export function useActiveHeading(ready) {
    const [activeId, setActiveId] = useState('');

    useEffect(() => {
        if (!ready) return undefined;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) setActiveId(entry.target.id);
                });
            },
            { rootMargin: '-100px 0px -60% 0px', threshold: 0 }
        );

        // the write-up renders a moment after the data arrives
        const timer = setTimeout(() => {
            document.querySelectorAll('.article-content :is(h2, h3, h4)[id]').forEach((heading) => observer.observe(heading));
        }, 300);

        return () => {
            clearTimeout(timer);
            observer.disconnect();
        };
    }, [ready]);

    return activeId;
}

// Calls `onDone` once when the reader gets to 90% of the page.
export function useReadCompletion(ready, onDone) {
    const fired = useRef(false);

    useEffect(() => {
        if (!ready) return undefined;
        fired.current = false;
        const onScroll = () => {
            if (fired.current) return;
            const scrolled = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight;
            if (scrolled >= 0.9) {
                fired.current = true;
                onDone();
            }
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ready]);
}
