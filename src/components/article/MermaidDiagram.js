import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

// Initialize Mermaid once, outside the component. Diagrams are drawn in the
// Bench light palette because they sit on the paper band.
let mermaidInitialized = false;
const initializeMermaid = () => {
    if (mermaidInitialized) return;

    mermaid.initialize({
        startOnLoad: false,
        theme: 'neutral',
        securityLevel: 'loose',
        fontFamily: '"Bricolage Grotesque", "Helvetica Neue", Arial, sans-serif',
        flowchart: { useMaxWidth: true, htmlLabels: true, curve: 'basis' },
        sequence: { useMaxWidth: true },
        themeVariables: {
            primaryColor: '#E7E3DB',
            primaryTextColor: '#121314',
            primaryBorderColor: '#8F4F1C',
            lineColor: '#44423D',
            secondaryColor: '#F2EFE9',
            tertiaryColor: '#E7E3DB',
            background: '#F2EFE9',
            mainBkg: '#E7E3DB',
            nodeBorder: '#625F59',
            clusterBkg: '#F2EFE9',
            clusterBorder: '#625F59',
            titleColor: '#121314',
            edgeLabelBackground: '#F2EFE9',
        },
    });
    mermaidInitialized = true;
};

const MermaidDiagram = React.memo(({ code }) => {
    const [svg, setSvg] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const idRef = useRef(`mermaid-${Math.random().toString(36).substr(2, 9)}`);

    useEffect(() => {
        if (!code) {
            setIsLoading(false);
            return;
        }

        let isMounted = true;

        const renderDiagram = async () => {
            try {
                initializeMermaid();

                // Clear any previous diagram with the same ID
                const existingElement = document.getElementById(idRef.current);
                if (existingElement) {
                    existingElement.remove();
                }

                const { svg: renderedSvg } = await mermaid.render(idRef.current, code.trim());

                if (isMounted) {
                    setSvg(renderedSvg);
                    setError(null);
                }
            } catch (err) {
                console.error('Mermaid rendering error:', err);
                if (isMounted) {
                    setError(err.message || 'Failed to render diagram');
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        // Small delay to prevent blocking
        const timeoutId = setTimeout(renderDiagram, 50);

        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
        };
    }, [code]);

    if (isLoading) {
        return <div className="article-mermaid article-mermaid--note" role="status">Rendering diagram.</div>;
    }

    if (error) {
        return (
            <div className="article-mermaid article-mermaid--note">
                <p>This diagram did not render.</p>
                <details>
                    <summary>Show the error</summary>
                    <pre>{error}</pre>
                </details>
            </div>
        );
    }

    if (!svg) {
        return null;
    }

    // Mermaid sets aria-roledescription but no role, which assistive tech rejects
    const labelled = svg.replace('<svg', '<svg role="img" aria-label="Diagram"');
    return <div className="article-mermaid" dangerouslySetInnerHTML={{ __html: labelled }} />;
});

MermaidDiagram.displayName = 'MermaidDiagram';

export default MermaidDiagram;
