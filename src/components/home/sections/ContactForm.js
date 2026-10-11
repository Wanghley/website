import React, { useRef, useState } from 'react';
import { usePostHog } from '../../../lib/analytics';
import { CONTACT } from '../../../data/home';

// Sends through Web3Forms, same service and checks as the /contact page:
// honeypot fields, a minimum fill time, length limits.
export default function ContactForm() {
  const posthog = usePostHog();
  const startedAt = useRef(Date.now());
  const [status, setStatus] = useState({ state: 'idle', message: '' });

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
    if (!accessKey) return setStatus({ state: 'error', message: `The form is not set up. Please email ${CONTACT.email}.` });

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
        posthog?.capture('contact_form_submitted', { source: 'home', message_length: message.length });
      } else {
        setStatus({ state: 'error', message: json.message || `Something went wrong. Please email ${CONTACT.email}.` });
      }
    } catch {
      setStatus({ state: 'error', message: `Network error. Please try again, or email ${CONTACT.email}.` });
    }
  };

  return (
    <section id="contact" className="hm-sec" aria-labelledby="contact-heading">
      <div className="bench-col hm-contact">
        <div className="hm-contact__text">
          <h2 id="contact-heading" className="hm-sec__title">{CONTACT.heading}</h2>
          <p className="hm-about__lede">{CONTACT.open}</p>
          <p><a className="hm-link" href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></p>
          <ul className="hm-contact__links">
            {CONTACT.links.map((l) => (
              <li key={l.href}><a className="hm-link" href={l.href} target="_blank" rel="noopener noreferrer">{l.text} <span aria-hidden="true">↗</span></a></li>
            ))}
          </ul>
          <img className="hm-contact__figure" src="/hero/figure-wave.webp" width="640" height="640" alt="A figure of Wanghley waving" loading="lazy" decoding="async" />
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
