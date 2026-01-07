import React, { useState, useEffect } from 'react';
import './css/Contact.css';
import { 
  FaEnvelope, 
  FaPaperPlane, 
  FaCalendarAlt, 
  FaLinkedin, 
  FaGithub, 
  FaTwitter,
  FaCheckCircle,
  FaArrowRight,
  FaLightbulb,
  FaRocket,
  FaHandshake
} from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [contactFormStartedAt, setContactFormStartedAt] = useState(Date.now());
  const [newsletterStartedAt, setNewsletterStartedAt] = useState(Date.now());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    const section = document.getElementById('contact');
    if (section) observer.observe(section);

    return () => {
      if (section) observer.unobserve(section);
    };
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    // Basic timing check: block too-fast submissions (likely bots)
    const elapsedMs = Date.now() - contactFormStartedAt;
    if (elapsedMs < 2000) {
      setSubmitError('Please wait a moment before submitting.');
      setIsSubmitting(false);
      return;
    }

    // Capture and sanitize values
    const formEl = e.target;
    const formDataObj = new FormData(formEl);

    // Honeypot checks: any value in these means bot
    const honeypots = ['botcheck', 'website', 'company'];
    for (const hp of honeypots) {
      const v = (formDataObj.get(hp) || '').toString().trim();
      if (v) {
        setSubmitError('Spam check failed.');
        setIsSubmitting(false);
        return;
      }
    }

    // Sanitize fields
    const name = (formDataObj.get('name') || '').toString().trim();
    const email = (formDataObj.get('email') || '').toString().trim().toLowerCase();
    const message = (formDataObj.get('message') || '').toString().trim();

    // Client-side validation
    if (name.length < 2 || name.length > 80) {
      setSubmitError('Please enter a valid name (2-80 chars).');
      setIsSubmitting(false);
      return;
    }
    if (email.length > 254) {
      setSubmitError('Email is too long.');
      setIsSubmitting(false);
      return;
    }
    if (message.length < 10 || message.length > 2000) {
      setSubmitError('Please include a message (10-2000 chars).');
      setIsSubmitting(false);
      return;
    }

    const accessKey = process.env.REACT_APP_WEB3FORMS_ACCESS_KEY;
    if (!accessKey) {
      setSubmitError(
        'Missing Web3Forms access key. Please set REACT_APP_WEB3FORMS_ACCESS_KEY in your environment (Amplify Hosting -> App settings -> Environment variables) and rebuild.'
      );
      setIsSubmitting(false);
      return;
    }

    // Rebuild form payload with sanitized values
    formDataObj.set('name', name);
    formDataObj.set('email', email);
    formDataObj.set('message', message);
    formDataObj.set('access_key', accessKey);
    formDataObj.set('subject', `New message from ${name}`);
    formDataObj.set('from_name', name);
    // Optionally include elapsed time for server-side heuristics
    formDataObj.set('submission_time_ms', String(elapsedMs));

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formDataObj
      });

      const data = await response.json();

      if (data.success) {
        setIsSubmitted(true);
        setFormData({ name: '', email: '', message: '' });
        setSubmitError(null);
      } else {
        // Surface API-level errors (e.g., invalid key or SMTP misconfig)
        const msg = data.message || 'Submission failed.';
        console.error("Web3Forms Error:", msg, data);
        setSubmitError(msg);
      }
    } catch (error) {
      console.error('Network Error:', error);
      setSubmitError('Network error. Please try again later or email me directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    const formEl = e.target;
    const formDataObj = new FormData(formEl);

    // Timing check
    const elapsedMs = Date.now() - newsletterStartedAt;
    if (elapsedMs < 1500) {
      setSubmitError('Please wait a moment before subscribing.');
      return;
    }

    // Honeypot check
    const hp = (formDataObj.get('confirm_email') || '').toString().trim();
    if (hp) {
      setSubmitError('Spam check failed.');
      return;
    }

    // Validate and normalize email
    const email = (formDataObj.get('email') || '').toString().trim().toLowerCase();
    if (!email || email.length > 254) {
      setSubmitError('Please enter a valid email address.');
      return;
    }

    // Redirect to Substack subscribe with pre-filled email
    window.open(`https://wanghley.substack.com/?email=${encodeURIComponent(email)}&utm_campaign=contact_form_subscribe_portfolio`, '_blank', 'noopener');
  };

  const benefits = [
    { icon: <FaLightbulb />, text: "Get expert insights on Edge AI & Health Tech" },
    { icon: <FaRocket />, text: "Explore collaboration opportunities" },
    { icon: <FaHandshake />, text: "Connect for speaking & consulting" }
  ];

  const quickLinks = [
    { 
      icon: <FaCalendarAlt />, 
      label: "Schedule a Call", 
      href: "https://cal.com/wanghley",
      description: "30-min intro call"
    },
    { 
      icon: <FaEnvelope />, 
      label: "Email Directly", 
      href: "mailto:me@wanghley.com",
      description: "me@wanghley.com"
    }
  ];

  const socials = [
    { icon: <FaLinkedin />, href: "https://linkedin.com/in/wanghley", label: "LinkedIn" },
    { icon: <FaGithub />, href: "https://github.com/wanghley", label: "GitHub" },
    { icon: <FaTwitter />, href: "https://twitter.com/wanghley", label: "Twitter" }
  ];

  return (
    <section 
      className={`contact-section ${isVisible ? 'contact-section--visible' : ''}`} 
      id="contact"
      aria-label="Contact"
    >
      {/* Background Elements */}
      <div className="contact-section__bg" aria-hidden="true">
        <div className="contact-section__gradient contact-section__gradient--1" />
        <div className="contact-section__gradient contact-section__gradient--2" />
        <div className="contact-section__grid" />
      </div>

      <div className="contact-section__container">
        {/* Header */}
        <header className="contact-section__header">
          <span className="contact-section__label">
            <HiSparkles aria-hidden="true" />
            Let's Connect
          </span>
          <h2 className="contact-section__title">
            Ready to Build Something<br />
            <span className="contact-section__title-accent">Extraordinary?</span>
          </h2>
          <p className="contact-section__subtitle">
            Whether you have a project in mind, want to collaborate, or just want to say hi—I'd love to hear from you.
          </p>
        </header>

        <div className="contact-section__content">
          {/* Left Column - Value Props + Quick Actions */}
          <div className="contact-section__left">
            {/* Benefits */}
            <div className="contact-section__benefits">
              <h3 className="contact-section__benefits-title">Why Reach Out?</h3>
              <ul className="contact-section__benefits-list">
                {benefits.map((benefit, index) => (
                  <li key={index} className="contact-section__benefit">
                    <span className="contact-section__benefit-icon">{benefit.icon}</span>
                    <span className="contact-section__benefit-text">{benefit.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Action Cards */}
            <div className="contact-section__quick-actions">
              {quickLinks.map((link, index) => (
                <a 
                  key={index}
                  href={link.href}
                  target={link.href.startsWith('http') ? '_blank' : undefined}
                  rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="contact-section__quick-card"
                >
                  <div className="contact-section__quick-icon">{link.icon}</div>
                  <div className="contact-section__quick-info">
                    <span className="contact-section__quick-label">{link.label}</span>
                    <span className="contact-section__quick-desc">{link.description}</span>
                  </div>
                  <FaArrowRight className="contact-section__quick-arrow" aria-hidden="true" />
                </a>
              ))}
            </div>

            {/* Social Links */}
            <div className="contact-section__socials">
              <span className="contact-section__socials-label">Or find me on</span>
              <div className="contact-section__socials-list">
                {socials.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-section__social-link"
                    aria-label={social.label}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Contact Form */}
          <div className="contact-section__right">
            <div className="contact-section__form-card">
              {!isSubmitted ? (
                <>
                  <div className="contact-section__form-header">
                    <h3 className="contact-section__form-title">Send a Message</h3>
                    <p className="contact-section__form-subtitle">
                      I typically respond within 24 hours
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="contact-section__form">
                    {/* Honeypots */}
                    <input type="checkbox" name="botcheck" style={{ display: "none" }} tabIndex={-1} aria-hidden="true" />
                    <input type="text" name="website" style={{ display: 'none' }} tabIndex={-1} aria-hidden="true" autoComplete="off" />
                    <input type="text" name="company" style={{ display: 'none' }} tabIndex={-1} aria-hidden="true" autoComplete="off" />
                    {/* Optional timestamp field */}
                    <input type="hidden" name="form_started_at" value={contactFormStartedAt} />
                    <div className={`contact-section__field ${focusedField === 'name' ? 'is-focused' : ''} ${formData.name ? 'has-value' : ''}`}>
                      <label htmlFor="contact-name" className="contact-section__label-text">
                        Your Name
                      </label>
                      <input
                        type="text"
                        id="contact-name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('name')}
                        onBlur={() => setFocusedField(null)}
                        required
                        minLength={2}
                        maxLength={80}
                        className="contact-section__input"
                        autoComplete="name"
                        placeholder="John Doe"
                      />
                    </div>

                    <div className={`contact-section__field ${focusedField === 'email' ? 'is-focused' : ''} ${formData.email ? 'has-value' : ''}`}>
                      <label htmlFor="contact-email" className="contact-section__label-text">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="contact-email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        required
                        maxLength={254}
                        className="contact-section__input"
                        autoComplete="email"
                        placeholder="john@example.com"
                      />
                    </div>

                    <div className={`contact-section__field ${focusedField === 'message' ? 'is-focused' : ''} ${formData.message ? 'has-value' : ''}`}>
                      <label htmlFor="contact-message" className="contact-section__label-text">
                        Your Message
                      </label>
                      <textarea
                        id="contact-message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('message')}
                        onBlur={() => setFocusedField(null)}
                        required
                        minLength={10}
                        maxLength={2000}
                        className="contact-section__textarea"
                        autoComplete="off"
                        placeholder="Tell me about your project or idea..."
                        rows={4}
                      />
                    </div>

                    <button 
                      type="submit" 
                      className={`contact-section__submit ${isSubmitting ? 'is-submitting' : ''}`}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="contact-section__spinner" aria-hidden="true" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <FaPaperPlane aria-hidden="true" />
                          Send Message
                        </>
                      )}
                    </button>

                    <p className="contact-section__privacy">
                      Your information is safe. I never share or sell your data.
                    </p>
                    {submitError && (
                      <p className="contact-section__error" role="alert">
                        Error sending message: {submitError}
                      </p>
                    )}
                  </form>
                </>
              ) : (
                <div className="contact-section__success">
                  <div className="contact-section__success-icon">
                    <FaCheckCircle aria-hidden="true" />
                  </div>
                  <h3 className="contact-section__success-title">Message Sent!</h3>
                  <p className="contact-section__success-text">
                    Thanks for reaching out! I'll get back to you within 24 hours.
                  </p>
                  <button 
                    className="contact-section__success-btn"
                    onClick={() => setIsSubmitted(false)}
                  >
                    Send Another Message
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom CTA - Newsletter/Quick Email */}
        <div className="contact-section__newsletter">
          <div className="contact-section__newsletter-content">
            <div className="contact-section__newsletter-text">
              <h3 className="contact-section__newsletter-title">
                Stay in the Loop
              </h3>
              <p className="contact-section__newsletter-desc">
                Get occasional updates on Edge AI, health tech, and engineering insights.
              </p>
            </div>
            <form className="contact-section__newsletter-form" onSubmit={handleNewsletterSubmit}>
              {/* Honeypot and timestamp */}
              <input type="text" name="confirm_email" style={{ display: 'none' }} tabIndex={-1} aria-hidden="true" autoComplete="off" />
              <input type="hidden" name="newsletter_started_at" value={newsletterStartedAt} />
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                className="contact-section__newsletter-input"
                aria-label="Email for newsletter"
                required
                maxLength={254}
                autoComplete="email"
              />
              <button type="submit" className="contact-section__newsletter-btn">
                Subscribe
                <FaArrowRight aria-hidden="true" /> 
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;