<!-- PROJECT SHIELDS -->
<a name="readme-top"></a>
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]
[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://www.buymeacoffee.com/wanghley)

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://wanghley.com">
    <img src="src/assets/logo-colorful.png" alt="Logo" width="200">
  </a>

  <h3 align="center">wanghley.com</h3>

  <p align="center">
    Personal portfolio of Wanghley Martins — Edge AI Engineer, Biomedical AI Researcher & TEDx Speaker.
    <br />
    <a href="https://wanghley.com"><strong>Visit the site »</strong></a>
    <br />
    <br />
    <a href="https://github.com/Wanghley/website/issues/new?labels=bug">Report Bug</a>
    ·
    <a href="https://github.com/Wanghley/website/issues/new?labels=enhancement">Request Feature</a>
    ·
    <a href="https://wanghley.com/blog">Blog</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li><a href="#about-the-project">About The Project</a></li>
    <li><a href="#built-with">Built With</a></li>
    <li><a href="#getting-started">Getting Started</a></li>
    <li><a href="#project-structure">Project Structure</a></li>
    <li><a href="#configuration">Configuration</a></li>
    <li><a href="#deployment">Deployment</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

---

<!-- ABOUT THE PROJECT -->
## About The Project

<!-- ┌─────────────────────────────────────────────────────────────────────┐
     │  DEMO VIDEO / SCREENSHOT                                            │
     │  Replace the block below with a real embed once you have one.       │
     │                                                                     │
     │  YouTube:                                                           │
     │  [![Demo](https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg)]  │
     │  (https://youtu.be/VIDEO_ID)                                        │
     │                                                                     │
     │  Or a direct screenshot:                                            │
     │  [![Product screenshot][product-screenshot]](https://wanghley.com) │
     └─────────────────────────────────────────────────────────────────────┘ -->

> **Add a screenshot or demo video above** — capture the homepage at 1440 × 900 and save it to `docs/screenshots/homepage.png`, then uncomment the screenshot line.

This is the source code for [wanghley.com](https://wanghley.com), a fully custom personal portfolio built from scratch. The site covers research, projects, a Markdown-powered blog, an interactive CV, and a contact form — all wrapped in a cohesive dark design system with a WebGL hero and fluid animations.

Key highlights:

- **3D WebGL Hero** — particle/neural-mesh animation rendered with Three.js & React Three Fiber, overlaid with a live ECG ribbon
- **Rich Markdown content** — blog posts and project write-ups with KaTeX math, Mermaid diagrams, GFM footnotes, and syntax highlighting
- **Interactive CV** — sticky section navigator, print-ready layout, animated skill radar chart
- **Zero-backend contact form** — delivered through EmailJS, no server needed
- **First-party analytics** — PostHog with a reverse proxy to avoid ad-blocker interference
- **Auto-generated XML sitemaps** — one per content type, built from live Strapi CMS data

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

<!-- BUILT WITH -->
## Built With

<img src="https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" style="vertical-align:top; margin:4px">
<img src="https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=three.js&logoColor=white" alt="Three.js" style="vertical-align:top; margin:4px">
<img src="https://img.shields.io/badge/Framer_Motion-EF0082?style=for-the-badge&logo=framer&logoColor=white" alt="Framer Motion" style="vertical-align:top; margin:4px">
<img src="https://img.shields.io/badge/MUI_v7-007FFF?style=for-the-badge&logo=mui&logoColor=white" alt="MUI" style="vertical-align:top; margin:4px">
<img src="https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" style="vertical-align:top; margin:4px">
<img src="https://img.shields.io/badge/React_Router_v6-CA4245?style=for-the-badge&logo=react-router&logoColor=white" alt="React Router" style="vertical-align:top; margin:4px">
<img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase" style="vertical-align:top; margin:4px">
<img src="https://img.shields.io/badge/PostHog-F54E00?style=for-the-badge&logo=posthog&logoColor=white" alt="PostHog" style="vertical-align:top; margin:4px">
<img src="https://img.shields.io/badge/EmailJS-EA4335?style=for-the-badge&logo=gmail&logoColor=white" alt="EmailJS" style="vertical-align:top; margin:4px">

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

<!-- GETTING STARTED -->
## Getting Started

### Prerequisites

- **Node.js** ≥ 18 — [download](https://nodejs.org)
- **Yarn** 1.x

  ```sh
  npm install -g yarn
  ```

- **Firebase CLI** *(deploy only)*

  ```sh
  npm install -g firebase-tools
  ```

### Installation

1. Clone the repository
   ```sh
   git clone https://github.com/Wanghley/website.git
   ```
2. Install dependencies
   ```sh
   cd website
   yarn install
   ```
3. Create your environment file
   ```sh
   cp .env.example .env.local
   ```
   Fill in your EmailJS and PostHog keys — see [Configuration](#configuration).

4. Start the development server
   ```sh
   yarn start
   ```
   Open [http://localhost:3000](http://localhost:3000). The app hot-reloads on every save.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

<!-- PROJECT STRUCTURE -->
## Project Structure

```
website/
├── public/               # Static assets & pre-generated sitemaps
├── src/
│   ├── api/              # Strapi CMS data-fetching utilities
│   ├── assets/           # Images, logos, fonts
│   ├── components/       # Reusable UI components
│   │   ├── Hero.js       # Three.js WebGL hero + ECG ribbon
│   │   ├── About.js      # Wikipedia-style dark card layout
│   │   ├── Skills.js     # Radar chart + filterable skill cards
│   │   ├── BlogPost.js   # Markdown renderer (KaTeX, Mermaid)
│   │   └── ...
│   ├── pages/            # Route-level page components
│   │   ├── index.js      # Homepage (Hero → About → Skills → …)
│   │   ├── about.js      # /about
│   │   ├── cv.js         # /cv  (sticky nav + print)
│   │   ├── projects.js   # /projects
│   │   ├── blog.js       # /blog
│   │   └── contact.js    # /contact
│   ├── utils/            # Helpers (markdown, analytics, SEO)
│   ├── App.js            # Router + layout shell
│   └── index.js          # Entry point + PostHog init
├── .github/workflows/    # Firebase Hosting CI/CD
├── firebase.json         # SPA rewrite rules
└── package.json
```

### Available Scripts

| Command | Description |
|---|---|
| `yarn start` | Development server at `localhost:3000` |
| `yarn build` | Production build → `build/` |
| `yarn test` | Run tests with React Testing Library |
| `yarn generate-sitemap` | Regenerate XML sitemaps from live Strapi data |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

<!-- CONFIGURATION -->
## Configuration

Create `.env.local` at the project root:

```env
# EmailJS  →  https://www.emailjs.com/docs
REACT_APP_EMAILJS_SERVICE_ID=your_service_id
REACT_APP_EMAILJS_TEMPLATE_ID=your_template_id
REACT_APP_EMAILJS_PUBLIC_KEY=your_public_key

# PostHog  →  https://posthog.com/docs
REACT_APP_POSTHOG_KEY=phc_your_project_key
REACT_APP_POSTHOG_HOST=https://us.i.posthog.com

# Strapi CMS  →  https://strapi.io/documentation
REACT_APP_cms_base_url=https://your-strapi-instance.com
REACT_APP_cms_api_token=your_api_token
```

> All keys are prefixed with `REACT_APP_` so Create React App inlines them at build time. **Never commit `.env.local`.**

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

<!-- DEPLOYMENT -->
## Deployment

The site is hosted on **Firebase Hosting** and deploys automatically on every push to `main` via GitHub Actions.

To deploy manually:

1. Build for production
   ```sh
   yarn build
   ```
2. Authenticate with Firebase *(first time only)*
   ```sh
   firebase login
   ```
3. Deploy
   ```sh
   firebase deploy --only hosting
   ```

The `firebase.json` SPA rewrite rule sends all unmatched paths to `index.html` so React Router handles client-side navigation.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

<!-- ROADMAP -->
## Roadmap

- [x] 3D WebGL hero with ECG ribbon overlay
- [x] Markdown blog with KaTeX and Mermaid support
- [x] Interactive CV with sticky navigator and radar chart
- [x] PostHog analytics with first-party reverse proxy
- [x] Auto-generated XML sitemaps per content type
- [ ] Dark / light theme toggle
- [ ] Full-text search across blog and projects
- [ ] CMS-driven project pages (full Strapi integration)
- [ ] Internationalization (EN / PT-BR)
- [ ] Automated Lighthouse CI on every push

See the [open issues](https://github.com/Wanghley/website/issues) for a full list of proposed features and known bugs.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

<!-- CONTRIBUTING -->
## Contributing

Contributions are welcome — especially bug fixes and accessibility improvements.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes using [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) (`git commit -m 'feat: add AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

<!-- CONTACT -->
## Contact

Wanghley Soares Martins — [@wanghley](https://instagram.com/wanghley) — wanghleys@gmail.com

Project Link: [https://github.com/Wanghley/website](https://github.com/Wanghley/website)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

<!-- ACKNOWLEDGMENTS -->
## Acknowledgments

* [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) — Three.js in React, made easy
* [Framer Motion](https://www.framer.com/motion/) — production-grade animation library
* [PostHog](https://posthog.com) — open-source product analytics
* [EmailJS](https://www.emailjs.com) — client-side email without a backend
* [Shields.io](https://shields.io) — badge generation
* [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) — commit message standard
* [Firebase Hosting](https://firebase.google.com/docs/hosting) — global CDN & SPA hosting

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

<!-- MARKDOWN LINKS & IMAGES -->
[contributors-shield]: https://img.shields.io/github/contributors/Wanghley/website?style=for-the-badge
[contributors-url]: https://github.com/Wanghley/website/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/Wanghley/website?style=for-the-badge
[forks-url]: https://github.com/Wanghley/website/network/members
[stars-shield]: https://img.shields.io/github/stars/Wanghley/website?style=for-the-badge
[stars-url]: https://github.com/Wanghley/website/stargazers
[issues-shield]: https://img.shields.io/github/issues/Wanghley/website?style=for-the-badge
[issues-url]: https://github.com/Wanghley/website/issues
[license-shield]: https://img.shields.io/github/license/Wanghley/website?style=for-the-badge
[license-url]: https://github.com/Wanghley/website/blob/main/LICENSE
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/wanghley
[product-screenshot]: docs/screenshots/homepage.png
