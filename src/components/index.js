import Navbar from "./Navbar";
import Contact from "./Contact";
import Footer from "./Footer";
import AboutText from "./About-text";
import NotFound from "./NotFound";

// Only components that pages actually pull from this barrel live here.
// Importing a component, even unused, pulls its CSS into the bundle, and CSS
// has no module scoping, so a stale export can restyle an unrelated page.
// Home sections live in components/home/* and are imported directly.
export {
    Navbar,
    Contact,
    Footer,
    AboutText,
    NotFound,
}
