import React from "react";
import { Helmet } from "react-helmet-async";
import ContactForm from '../components/home/sections/ContactForm';

// The same form as the home page, opening the page. The title is "Say hello."
const ContactPage = () => {
    return (
        <main id="main" className="contact-page">
            <Helmet>
                <title>Contact | Wanghley Martins</title>
                <meta name="description" content="Get in touch with Wanghley Martins about industry roles, research collaboration, speaking and mentoring." />
                <link rel="canonical" href="https://wanghley.com/contact" />
                <meta name="robots" content="index, follow" />

                <meta property="og:title" content="Contact | Wanghley Martins" />
                <meta property="og:description" content="Industry roles, research collaboration, speaking and mentoring." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://wanghley.com/contact" />
                <meta property="og:image" content="https://wanghley.com/og-image.png" />
            </Helmet>
            <ContactForm as="h1" head source="contact_page" />
        </main>
    );
};

export default ContactPage;
