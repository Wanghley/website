import React, { useRef, useState } from 'react';
import { usePostHog } from '../../../lib/analytics';
import useContact from '../../../hooks/useContact';

// Sends through Web3Forms with honeypot fields, a minimum fill time and length
// limits. One form for the home page, /contact and /about. `as` is the heading
// level (h1 when it opens a page), `head` clears the fixed nav for that case,
// `figure` shows the waving figure, and `source` tags the analytics event.
export default function ContactForm({ as: Title = 'h2', head = false, figure = true, source = 'home' }) {
  const posthog = usePostHog();
  const startedAt = useRef(Date.now());
  const [status, setStatus] = useState({ state: 'idle', message: '' });
  const { status: contactState, data: contact } = useContact();
  const mail = contact?.email || 'the address on this page';

  const onSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    const email = String(data.get('email') || '').trim();
    const message = String(data.get('message') || '').trim();
    const trap = ['botcheck', 'website', 'company'].some((k) => data.get(k));

    if (trap) return; // bots: silently ignore
    if (Date.now() - startedAt.current < 1500) {
      setStatus({ state: 'error', message: 'Please take a moment, then send again.' });
      return;
    }
    if (!name || name.length > 100) return setStatus({ state: 'error', message: 'Please add your name.' });
    if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 254) return setStatus({ state: 'error', message: 'That email address does not look right.' });
    if (message.length < 10 || message.length > 2000) return setStatus({ state: 'error', message: 'Please write a message of 10 to 2000 characters.' });

    const accessKey = process.env.REACT_APP_WEB3FORMS_ACCESS_KEY;
    if (!accessKey) return setStatus({ state: 'error', message: `The form is not set up. Please email ${mail}.` });

    setStatus({ state: 'sending', message: '' });
    data.set('access_key', accessKey);
    data.set('subject', `New message from ${name}`);
    data.set('from_name', name);
    data.set('submission_time_ms', String(Date.now() - startedAt.current));
    try {
      const res = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: data });
      const json = await res.json();
      if (json.success) {
        setStatus({ state: 'done', message: 'Thanks. I will reply soon.' });
        form.reset();
        posthog?.capture('contact_form_submitted', { source, message_length: message.length });
      } else {
        setStatus({ state: 'error', message: json.message || `Something went wrong. Please email ${mail}.` });
      }
    } catch {
      setStatus({ state: 'error', message: `Network error. Please try again, or email ${mail}.` });
    }
  };

  return (
    <section id="contact" className={`bp-sec${head ? ' bp-sec--head' : ''}`} aria-labelledby="contact-heading">
      <div className="bench-col hm-contact">
        <div className="hm-contact__text">
          {contactState === 'ready' && contact && (
            <>
              <Title id="contact-heading" className="bp-sec__title">{contact.heading}</Title>
              <p className="hm-about__lede">{contact.open}</p>
              {contact.email && <p><a className="bp-link" href={`mailto:${contact.email}`}>{contact.email}</a></p>}
              <ul className="hm-contact__links">
                {contact.links.map((l) => (
                  <li key={l.href}><a className="bp-link" href={l.href} target="_blank" rel="noopener noreferrer">{l.text} <span aria-hidden="true">↗</span></a></li>
                ))}
              </ul>
            </>
          )}
          {figure && <img className="hm-contact__figure" src="/hero/figure-wave.webp" width="640" height="640" alt="A figure of Wanghley waving" loading="lazy" decoding="async" />}
        </div>

        <form className="hm-form" onSubmit={onSubmit} noValidate>
          <input type="checkbox" name="botcheck" tabIndex={-1} aria-hidden="true" style={{ display: 'none' }} />
          <input type="text" name="website" tabIndex={-1} aria-hidden="true" autoComplete="off" style={{ display: 'none' }} />
          <input type="text" name="company" tabIndex={-1} aria-hidden="true" autoComplete="off" style={{ display: 'none' }} />
          <label className="hm-form__field">
            <span>Name</span>
            <input type="text" name="name" autoComplete="name" required maxLength={100} />
          </label>
          <label className="hm-form__field">
            <span>Email</span>
            <input type="email" name="email" autoComplete="email" required maxLength={254} />
          </label>
          <label className="hm-form__field">
            <span>Message</span>
            <textarea name="message" rows={6} required minLength={10} maxLength={2000} />
          </label>
          <button type="submit" className="btn btn--primary" disabled={status.state === 'sending'}>
            {status.state === 'sending' ? 'Sending…' : 'Send message'}
          </button>
          <p className={`hm-form__status hm-form__status--${status.state}`} role="status" aria-live="polite">{status.message}</p>
        </form>
      </div>
    </section>
  );
}
