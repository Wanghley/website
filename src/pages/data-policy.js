import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { PageHeader, Prose } from '../components/bench';
import './css/legal.css';

const DataPolicy = () => (
  <>
    <Helmet>
      <title>Data &amp; Cookie Policy | Wanghley Martins</title>
      <meta name="description" content="Data and cookie policy for wanghley.com — what cookies and tracking technologies are used and how to opt out." />
      <link rel="canonical" href="https://wanghley.com/data-policy" />
      <meta name="robots" content="noindex, follow" />
    </Helmet>

    <main id="main" className="legal-page">
      <section className="bp-sec bp-sec--head">
        <div className="bench-col">
          <PageHeader size="md" title="Data & Cookie Policy" meta={['Last updated: June 1, 2025', 'Effective immediately']} />
        </div>
      </section>

      <section className="bp-sec bp-sec--light">
        <div className="bench-col">
          <Prose as="article">

            <h2>1. Overview</h2>
            <p>
              This policy explains what cookies and similar tracking technologies are used
              on <strong>wanghley.com</strong> and how you can control them. This site is
              operated by Wanghley Soares Martins for personal and professional portfolio
              purposes.
            </p>

            <h2>2. What Are Cookies</h2>
            <p>
              Cookies are small text files stored in your browser when you visit a website.
              They help the site remember preferences and understand how visitors use it.
              This site uses a minimal set of cookies — only those essential for analytics.
            </p>

            <h2>3. Cookies and Tracking Technologies Used</h2>
            <div className="bp-scroll" tabIndex={0} role="group" aria-label="Cookies and tracking technologies">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Provider</th>
                  <th>Purpose</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>ph_*</code></td>
                  <td>PostHog</td>
                  <td>Analytics — tracks anonymous session and event data to understand site usage. No personally identifiable data is stored.</td>
                  <td>1 year</td>
                </tr>
                <tr>
                  <td><code>__session</code></td>
                  <td>Firebase</td>
                  <td>Hosting infrastructure — used by Google Firebase for CDN and DDoS protection. No user-level tracking.</td>
                  <td>Session</td>
                </tr>
              </tbody>
            </table>
            </div>
            <p>
              This site does <strong>not</strong> use advertising cookies, tracking pixels,
              social media cookies, or any third-party remarketing technologies.
            </p>

            <h2>4. Analytics in Detail</h2>
            <p>
              Analytics are powered by <strong>PostHog</strong> (US Cloud). PostHog collects:
            </p>
            <ul>
              <li>Pages visited and time spent</li>
              <li>Clicks on buttons and links (e.g. project cards, contact form)</li>
              <li>Browser type, OS, and screen resolution</li>
              <li>Country-level location (no precise geolocation)</li>
              <li>Referral source (how you arrived at the site)</li>
            </ul>
            <p>
              All analytics data is aggregated. IP addresses are not stored after processing.
              No data is shared with advertising networks.
            </p>

            <h2>5. How to Control or Opt Out</h2>
            <p>You have several options to limit or disable tracking:</p>
            <ul>
              <li>
                <strong>Browser settings</strong> — most browsers allow you to block or
                delete cookies via Settings → Privacy.
              </li>
              <li>
                <strong>Do Not Track</strong> — if your browser sends a DNT signal, PostHog
                will respect it and disable tracking.
              </li>
              <li>
                <strong>Ad blockers / privacy extensions</strong> — tools like uBlock Origin,
                Privacy Badger, or Brave's built-in blocker will prevent PostHog from loading.
              </li>
              <li>
                <strong>PostHog opt-out</strong> — you may request opt-out by emailing{' '}
                <a href="mailto:me@wanghley.com">me@wanghley.com</a>.
              </li>
            </ul>
            <p>
              Disabling analytics cookies does not affect the functionality of this site in
              any way.
            </p>

            <h2>6. Data Transfers</h2>
            <p>
              PostHog processes analytics data on servers in the United States (US Cloud
              region). By using this site, you consent to this transfer. PostHog complies
              with GDPR Standard Contractual Clauses for EU/EEA visitors.
            </p>

            <h2>7. Your Rights</h2>
            <p>
              Under the GDPR, CCPA, and LGPD, you have the right to access, correct, delete,
              or restrict processing of any data collected about you. To exercise these
              rights, email <a href="mailto:me@wanghley.com">me@wanghley.com</a>. Requests
              will be addressed within 30 days.
            </p>

            <h2>8. Changes to This Policy</h2>
            <p>
              This policy may be updated to reflect changes in technologies or legal
              requirements. The "Last updated" date at the top of the page will always
              reflect the most recent version.
            </p>

            <h2>9. Contact</h2>
            <p>
              Questions? Email <a href="mailto:me@wanghley.com">me@wanghley.com</a> or
              use the <Link to="/#contact">contact form</Link>.
            </p>

          </Prose>

          <p className="legal-page__footer">
            <Link to="/privacy" className="bp-link">← Privacy Policy</Link>
            <Link to="/" className="bp-link">Back to home →</Link>
          </p>
        </div>
      </section>
    </main>
  </>
);

export default DataPolicy;
