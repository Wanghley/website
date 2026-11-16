import React, { useState } from 'react';
import { FaLink, FaShareAlt } from 'react-icons/fa';
import { usePostHog } from '../../lib/analytics';
import { copyToClipboard } from './utils';

// Uses the device share sheet when there is one, otherwise copies the link.
// `event` is the PostHog event (project_shared, blog_post_shared).
const ShareButton = React.memo(({ title, url, event }) => {
    const [copied, setCopied] = useState(false);
    const posthog = usePostHog();

    const handleShare = async () => {
        posthog?.capture(event, { title, url });
        if (navigator.share) {
            try {
                await navigator.share({ title, url });
            } catch (err) {
                console.log('Share cancelled');
            }
        } else {
            const success = await copyToClipboard(url);
            if (success) {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }
        }
    };

    return (
        <button type="button" className="btn btn--ghost" onClick={handleShare}>
            {copied ? <FaLink aria-hidden="true" /> : <FaShareAlt aria-hidden="true" />}
            <span role="status">{copied ? 'Link copied' : 'Share'}</span>
        </button>
    );
});

ShareButton.displayName = 'ShareButton';

export default ShareButton;
