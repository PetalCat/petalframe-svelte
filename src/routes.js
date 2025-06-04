import Login from "./pages/Login.svelte";
import Home from "./pages/Home.svelte";
import Gallery from "./pages/Gallery.svelte";
import Lightbox from "./lib/Lightbox.svelte";

const routes = {
  "/login": Login,
  "/home": Home,
  "/gallery": Gallery,
  "/lightbox": Lightbox,
};

export default routes;
