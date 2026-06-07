<div align="center">
  <a href="https://wanghley.com">
    <img src="src/assets/logo-colorful.png" alt="wanghley.com" width="120" />
  </a>

  <h1>wanghley.com</h1>

  <p>
    Personal portfolio of <strong>Wanghley Martins</strong> — Edge AI Engineer, Biomedical AI Researcher, TEDx Speaker.<br/>
    Built from silicon to cloud.
  </p>

  <p>
    <a href="https://wanghley.com"><strong>wanghley.com »</strong></a>
  </p>

  <p>
    <a href="https://github.com/Wanghley/website/issues/new?labels=bug">Report Bug</a>
    ·
    <a href="https://github.com/Wanghley/website/issues/new?labels=enhancement">Request Feature</a>
    ·
    <a href="https://wanghley.com/blog">Blog</a>
  </p>

  <br/>

  [![Release](https://img.shields.io/github/v/tag/Wanghley/website?label=release&style=flat-square&color=0f172a)](https://github.com/Wanghley/website/releases)
  [![Commits](https://img.shields.io/github/commit-activity/m/Wanghley/website?style=flat-square&color=0f172a)](https://github.com/Wanghley/website/commits/main)
  [![License](https://img.shields.io/github/license/Wanghley/website?style=flat-square&color=0f172a)](LICENSE)
  [![Stars](https://img.shields.io/github/stars/Wanghley/website?style=flat-square&color=0f172a)](https://github.com/Wanghley/website/stargazers)
  [![Deploy](https://img.shields.io/badge/hosted%20on-Firebase-FFCA28?style=flat-square&logo=firebase&logoColor=black)](https://firebase.google.com)

</div>

---

## Demo

<!-- ┌──────────────────────────────────────────────────────────────────────────┐
     │  DEMO VIDEO                                                              │
     │  Record a walkthrough (Loom / OBS / QuickTime) and upload to YouTube.   │
     │                                                                          │
     │  YouTube embed — replace YOUR_VIDEO_ID:                                 │
     │                                                                          │
     │  [![Demo](https://img.youtube.com/vi/YOUR_VIDEO_ID/maxresdefault.jpg)]  │
     │  (https://youtu.be/YOUR_VIDEO_ID)                                        │
     │                                                                          │
     │  Or embed a GIF/MP4 directly:                                            │
     │  <video src="docs/demo.mp4" autoplay loop muted width="100%"></video>    │
     └──────────────────────────────────────────────────────────────────────────┘ -->

> **Add a demo video here.** Record a 30–60 s walkthrough of the homepage and paste the YouTube embed or GIF above.

<br/>

## Screenshots

<!-- Replace the placeholder paths below once you capture real screenshots.
     Suggested workflow:
       yarn start → DevTools → device toolbar (1440 × 900) → right-click → "Capture screenshot"
     Save to docs/screenshots/ and commit. -->

| Homepage | About | CV |
|:---:|:---:|:---:|
| ![Homepage](docs/screenshots/homepage.png) | ![About](docs/screenshots/about.png) | ![CV](docs/screenshots/cv.png) |

| Projects | Blog | Contact |
|:---:|:---:|:---:|
| ![Projects](docs/screenshots/projects.png) | ![Blog](docs/screenshots/blog.png) | ![Contact](docs/screenshots/contact.png) |

> **To add screenshots:** run `yarn start`, capture each page at 1440 × 900, save to `docs/screenshots/`, and commit.

<br/>

## Features

- **3D Hero** — WebGL particle/neural-mesh animation via Three.js & React Three Fiber, with live ECG ribbon overlay
- **Fluid Animations** — page transitions, staggered reveals, and micro-interactions powered by Framer Motion
- **Rich Markdown** — blog posts and project write-ups with KaTeX math, Mermaid diagrams, GFM footnotes, and syntax highlighting
- **Interactive CV** — sticky section navigator, print-ready layout, and animated skill radar chart
- **Dark Design System** — cohesive `abyss` palette, Wikipedia-style About page, responsive typography
- **Contact via EmailJS** — serverless email delivery with no backend required
- **Analytics** — PostHog product analytics with first-party reverse proxy
- **SEO** — `react-helmet-async` meta tags, Open Graph, and auto-generated XML sitemaps per content type
- **Optimized Build** — code-split React SPA deployed to Firebase Hosting global CDN

<br/>

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [React 18](https://react.dev) · Create React App |
| **3D / Canvas** | [Three.js](https://threejs.org) · [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) · [Drei](https://github.com/pmndrs/drei) |
| **Animation** | [Framer Motion](https://www.framer.com/motion/) |
| **UI Library** | [MUI v7](https://mui.com) · [React Bootstrap](https://react-bootstrap.github.io) · [RSuite](https://rsuitejs.com) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com) · [Styled Components](https://styled-components.com) |
| **Markdown** | [react-markdown](https://github.com/remarkjs/react-markdown) · remark-gfm · rehype-katex · [Mermaid](https://mermaid.js.org) |
| **Charts** | [Chart.js](https://www.chartjs.org) · react-chartjs-2 |
| **Email** | [EmailJS](https://www.emailjs.com) |
| **Analytics** | [PostHog](https://posthog.com) |
| **Routing** | [React Router v6](https://reactrouter.com) |
| **Hosting** | [Firebase Hosting](https://firebase.google.com/docs/hosting) |

<br/>

## Getting Started

### Prerequisites

- **Node.js** ≥ 18 — [download](https://nodejs.org)
- **Yarn** 1.x — `npm install -g yarn`
- **Firebase CLI** (deploy only) — `npm install -g firebase-tools`

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Wanghley/website.git
cd website

# 2. Install dependencies
yarn install

# 3. Set up environment variables
cp .env.example .env.local
# → fill in your EmailJS and PostHog keys (see Configuration below)

# 4. Start the development server
yarn start
```

Open [http://localhost:3000](http://localhost:3000) — the app hot-reloads on save.

<br/>

## Configuration

Create a `.env.local` file at the project root with the following keys:

```env
# EmailJS  →  https://www.emailjs.com/docs
REACT_APP_EMAILJS_SERVICE_ID=your_service_id
REACT_APP_EMAILJS_TEMPLATE_ID=your_template_id
REACT_APP_EMAILJS_PUBLIC_KEY=your_public_key

# PostHog  →  https://posthog.com/docs
REACT_APP_POSTHOG_KEY=phc_your_project_key
REACT_APP_POSTHOG_HOST=https://us.i.posthog.com
```

> All keys are prefixed with `REACT_APP_` so Create React App inlines them at build time. **Never commit `.env.local`.**

<br/>

## Project Structure

```
website/
├── public/                 # Static assets & pre-generated sitemaps
├── src/
│   ├── api/                # Strapi CMS data-fetching utilities
│   ├── assets/             # Images, logos, fonts
│   ├── components/         # Reusable UI components
│   │   ├── Hero.js         # Three.js WebGL hero + ECG ribbon
│   │   ├── About.js        # Wikipedia-style dark card layout
│   │   ├── Skills.js       # Radar chart + filterable skill cards
│   │   ├── BlogPost.js     # Full markdown renderer (KaTeX, Mermaid)
│   │   ├── ProjectPost.js  # Project detail with media gallery
│   │   └── ...
│   ├── pages/              # Route-level page components
│   │   ├── index.js        # Homepage  (Hero → About → Skills → …)
│   │   ├── about.js        # /about
│   │   ├── cv.js           # /cv  (sticky nav + print)
│   │   ├── projects.js     # /projects
│   │   ├── blog.js         # /blog
│   │   └── contact.js      # /contact
│   ├── utils/              # Helpers (markdown, analytics, SEO)
│   ├── App.js              # Router + layout shell
│   └── index.js            # Entry point + PostHog init
├── firebase.json           # Firebase Hosting SPA rewrite rules
├── package.json
└── yarn.lock
```

<br/>

## Available Scripts

| Command | Description |
|---|---|
| `yarn start` | Development server at `localhost:3000` |
| `yarn build` | Production build → `build/` |
| `yarn test` | Run tests with React Testing Library |
| `yarn generate-sitemap` | Regenerate XML sitemaps from live Strapi data |

<br/>

## Deployment

The site deploys to **Firebase Hosting** via the Firebase CLI.

```bash
# 1. Build for production
yarn build

# 2. Authenticate (first time)
firebase login

# 3. Deploy
firebase deploy --only hosting
```

The `firebase.json` SPA rewrite rule sends all unmatched paths to `index.html` so React Router handles navigation on the client.

<br/>

## Roadmap

- [ ] Dark / light theme toggle
- [ ] CMS-driven project pages (full Strapi integration)
- [ ] Full-text search across blog and projects
- [ ] Internationalization (EN / PT-BR)
- [ ] Automated Lighthouse CI on every push

See [open issues](https://github.com/Wanghley/website/issues) for the full list of planned features and known bugs.

<br/>

## Contributing

Contributions are welcome — especially bug fixes and accessibility improvements.

```bash
# 1. Fork the repo and create a feature branch
git checkout -b fix/your-fix-name

# 2. Commit using Conventional Commits
git commit -m "fix: short description"

# 3. Push and open a Pull Request
git push origin fix/your-fix-name
```

Please follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) for all commit messages.

<br/>

## License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for details.

<br/>

## Contact

**Wanghley Martins** — [wanghley.com](https://wanghley.com) · [wanghleys@gmail.com](mailto:wanghleys@gmail.com)

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Wanghley-0077B5?style=flat-square&logo=linkedin)](https://linkedin.com/in/wanghley)
[![GitHub](https://img.shields.io/badge/GitHub-Wanghley-181717?style=flat-square&logo=github)](https://github.com/Wanghley)

<div align="right"><a href="#readme-top">↑ back to top</a></div>
