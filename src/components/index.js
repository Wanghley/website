import Navbar from "./Navbar";
import Contact from "./Contact";
import Footer from "./Footer";
import AboutText from "./About-text";
import NotFound from "./NotFound";
import ProjectCard from "./ProjectCard";
import ProjectCardGrid from "./ProjectCardGrid";
import Card from "./Card";
import CardGrid from "./CardGrid";
import ProjectPost from "./ProjectPost";
import TechArchitecture from "./TechArchitecture";
import SignatureProject from "./SignatureProject";
import ChannelRail from "./ChannelRail";
import SectionDivider from "./SectionDivider";
import EcgRibbon from "./EcgRibbon";
import Timeline from "./Timeline";
import HeroChamber from "./home/HeroChamber";
import SignalChain from "./home/SignalChain";
import VentureShowcase from "./home/VentureShowcase";
import SkillField from "./home/SkillField";
import ClosingTransmit from "./home/ClosingTransmit";

// Hero, About, Skills, GridFeatured, GridFeaturedBlog, GambiarraImpact,
// IdentityFocus, and TechMatrix (pass-1/pass-2 homepage sections superseded
// by the home/* components below — IdentityFocus by SignalChain, TechMatrix
// by SkillField) are deliberately NOT imported here. They're pure dead code
// with zero remaining consumers anywhere in the app — but CSS has no module
// scoping, so importing a component even unused is enough to pull its CSS
// into the main bundle and collide with a same-id/same-class replacement
// (e.g. Hero.css's `#home { align-items: center }` fought HeroChamber
// purely because both sections share id="home"). Left as standalone files
// (not deleted) in case their ported copy is needed again.
export {
    Navbar,
    Contact,
    Footer,
    AboutText,
    NotFound,
    ProjectCard,
    ProjectCardGrid,
    Card,
    CardGrid,
    ProjectPost,
    TechArchitecture,
    SignatureProject,
    ChannelRail,
    SectionDivider,
    EcgRibbon,
    Timeline,
    HeroChamber,
    SignalChain,
    VentureShowcase,
    SkillField,
    ClosingTransmit,
}