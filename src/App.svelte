<script>
  import Router from "svelte-spa-router";
  import routes from "./routes.js";
  import { push } from "svelte-spa-router";
  import { getMe, fetchAvatarBlob } from "./lib/api.js";
  import { onMount } from "svelte";

  let user = null;
  let useravatar = null;

  onMount(() => {
    if (!localStorage.getItem("token") && location.pathname !== "/login") {
      push("#/login");
    } else {
      fetchUserData();
    }
  });

  const handle401 = (error) => {
    console.error("Unauthorized error:", error);
    push("#/login");
  };

  const fetchUserData = async () => {
    try {
      const response = await getMe();
      user = response.username;
      try {
        useravatar = await fetchAvatarBlob(response.avatar);
      } catch {
        useravatar = null;
      }
    } catch (error) {
      console.error("Error in getMe:", error);
      handle401(error);
    }
  };
</script>

<main>
  <Router {routes} />
  <div class="navbar">
    <nav>
      <a href="#/gallery"
        ><img
          src="/src/assets/icons/image-solid.svg"
          class="icon"
          alt="Gallery"
        /></a
      >
      <a href="#/albums"
        ><img
          src="/src/assets/icons/images-solid.svg"
          class="icon"
          alt="Albums"
        /></a
      >
      <a href="#/home"
        ><img
          src="/src/assets/icons/house-solid.svg"
          class="icon"
          alt="Home"
        /></a
      >
      <a href="#/users"
        ><img
          src="/src/assets/icons/users-solid.svg"
          class="icon"
          alt="Groups"
        /></a
      >
      <a href="#/profile">
        <img src={useravatar} class="useravatar" alt="Profile" />
      </a>
    </nav>
  </div>
</main>

<style>
  .icon {
    height: 27px;
    width: height;
    /* change svg color */
    filter: invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg)
      brightness(100%) contrast(100%);
  }
  .useravatar {
    height: 27px;
    width: height;
    border-radius: 50%;
    border: 1px solid white;
  }
  .navbar {
    background-color: #151515;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 10px 0;
  }
  nav {
    display: flex;
    justify-content: space-around;
    align-items: center;
  }

  nav a {
    flex: 1;
    text-align: center;
  }
  main {
    width: 100vw;
  }
</style>
