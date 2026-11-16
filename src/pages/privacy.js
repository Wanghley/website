import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { PageHeader, Prose } from '../components/bench';
import './css/legal.css';

const Privacy = () => (
  <>
    <Helmet>
      <title>Privacy Policy | Wanghley Martins</title>
      <meta name="description" content="Privacy policy for wanghley.com — how personal data is collected, used, and protected." />
      <link rel="canonical" href="https://wanghley.com/privacy" />
      <meta name="robots" content="noindex, follow" />
    </Helmet>

    <main id="main" className="legal-page">
      <section className="bp-sec bp-sec--head">
        <div className="bench-col">
          <PageHeader size="md" title="Privacy Policy" meta={['Last updated: June 1, 2025', 'Effective immediately']} />
        </div>
      </section>

      <section className="bp-sec bp-sec--light">
        <div className="bench-col">
          <Prose as="article">

            <h2>1. Who We Are</h2>
            <p>
              This website, <strong>wanghley.com</strong>, is the personal portfolio of
              Wanghley Soares Martins, an engineer and researcher based at Duke University,
              Durham, NC, United States. For any privacy-related matter, contact:
              <a href="mailto:me@wanghley.com"> me@wanghley.com</a>.
            </p>

            <h2>2. What Data We Collect</h2>
            <p>This site collects only the minimum data necessary to operate and improve it:</p>
            <ul>
              <li>
                <strong>Analytics data</strong> — page views, session duration, browser type,
                country-level location, and click events, collected via PostHog. This data is
                aggregated and does not personally identify you.
              </li>
              <li>
                <strong>Contact form submissions</strong> — name, email address, and message
                content you voluntarily submit through the contact form. This data is processed
                via Web3Forms and forwarded directly to me by email. It is not stored in any
                database on this site.
              </li>
              <li>
                <strong>Newsletter subscriptions</strong> — if you choose to subscribe, your
                email address is handled by Substack under their own privacy policy.
              </li>
            </ul>
            <p>We do <strong>not</strong> collect:</p>
            <ul>
              <li>Sensitive personal data (health, financial, biometric)</li>
              <li>Data from minors under 16 years of age</li>
              <li>Data through third-party advertising networks</li>
            </ul>

            <h2>3. How We Use Your Data</h2>
            <p>Data collected is used solely to:</p>
            <ul>
              <li>Understand how visitors interact with the site (analytics)</li>
              <li>Respond to messages and inquiries sent through the contact form</li>
              <li>Improve content and user experience</li>
            </ul>
            <p>
              Your data is <strong>never sold, rented, or shared</strong> with third parties
              for marketing purposes.
            </p>

            <h2>4. Legal Basis for Processing</h2>
            <p>
              Processing is based on <strong>legitimate interest</strong> (site analytics,
              security) and <strong>consent</strong> (contact form submission, newsletter
              sign-up). You may withdraw consent at any time by contacting us.
            </p>

            <h2>5. Data Retention</h2>
            <p>
              Analytics data is retained for up to 12 months in PostHog. Contact form data
              is retained only for as long as necessary to respond to your inquiry.
              Newsletter subscriptions are managed by Substack — you may unsubscribe at
              any time.
            </p>

            <h2>6. Third-Party Services</h2>
            <div className="bp-scroll" tabIndex={0} role="group" aria-label="Cookies and tracking technologies">
            <table>
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Purpose</th>
                  <th>Privacy Policy</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>PostHog</td>
                  <td>Product analytics &amp; session insights</td>
                  <td><a href="https://posthog.com/privacy" target="_blank" rel="noopener noreferrer">posthog.com/privacy</a></td>
                </tr>
                <tr>
                  <td>Web3Forms</td>
                  <td>Contact form processing</td>
                  <td><a href="https://web3forms.com/privacy" target="_blank" rel="noopener noreferrer">web3forms.com/privacy</a></td>
                </tr>
                <tr>
                  <td>Firebase</td>
                  <td>Website hosting (Google)</td>
                  <td><a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener noreferrer">firebase.google.com/support/privacy</a></td>
                </tr>
                <tr>
                  <td>Substack</td>
                  <td>Newsletter</td>
                  <td><a href="https://substack.com/privacy" target="_blank" rel="noopener noreferrer">substack.com/privacy</a></td>
                </tr>
              </tbody>
            </table>
            </div>

            <h2>7. Your Rights</h2>
            <p>
              Depending on your jurisdiction, you have the right to access, correct, delete,
              or restrict processing of your personal data. This includes rights under the
              EU <strong>GDPR</strong>, the California <strong>CCPA</strong>, and the
              Brazilian <strong>LGPD</strong>.
            </p>
            <p>
              To exercise any of these rights, email <a href="mailto:me@wanghley.com">me@wanghley.com</a>.
              Requests will be addressed within 30 days.
            </p>

            <h2>8. Security</h2>
            <p>
              This site is served over HTTPS. We apply reasonable technical and organisational
              measures to protect data against unauthorised access or disclosure. No method
              of transmission over the internet is 100% secure.
            </p>

            <h2>9. Changes to This Policy</h2>
            <p>
              This policy may be updated from time to time. Material changes will be
              reflected by updating the "Last updated" date at the top of this page.
              Continued use of the site constitutes acceptance of the revised policy.
            </p>

            <h2>10. Contact</h2>
            <p>
              Questions about this privacy policy? Email{' '}
              <a href="mailto:me@wanghley.com">me@wanghley.com</a> or use the{' '}
              <Link to="/#contact">contact form</Link>.
            </p>

          </Prose>

          <p className="legal-page__footer">
            <Link to="/" className="bp-link">← Back to home</Link>
            <Link to="/data-policy" className="bp-link">Data &amp; Cookie Policy →</Link>
          </p>
        </div>
      </section>
    </main>
  </>
);

export default Privacy;
