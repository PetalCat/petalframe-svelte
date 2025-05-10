<script>
  import Router from "svelte-spa-router";
  import routes from "./routes.js";
  import { push, pop, replace } from "svelte-spa-router";
  import { getMe, fetchAvatarBlob } from "./lib/api.js";
  if (localStorage.getItem("token")) {
    push("/home");
  } else {
    push("/login");
  }
  // navbar push logic
  const handlePush = (path) => {
    push(path);
  };
  let user = null;
  let useravatar = null;

  const handle401 = (error) => {
    console.error("Unauthorized error:", error);
    push("/login");
  };
  const fetchUserData = async () => {
    try {
      console.log("getMe");
      const response = await getMe();
      console.log("response", response);
      user = response.username;
      try {
        useravatar = await fetchAvatarBlob(response.avatar);
      } catch (error) {
        console.log("Error fetching avatar:", error);
        useravatar = null;
      }
    } catch (error) {
      console.log("Error in getMe:", error);
      handle401(error);
      error = "Error fetching user data";
    }
  };

  fetchUserData();
</script>

<main>
  <Router {routes} />
  <div class="navbar">
    <nav>
      <a href="/gallery" on:click={() => handlePush("/gallery")}
        ><img
          src="/src/assets/icons/image-solid.svg"
          class="icon"
          alt="Gallery"
        /></a
      >
      <a href="/albums" on:click={() => handlePush("/albums")}
        ><img
          src="/src/assets/icons/images-solid.svg"
          class="icon"
          alt="Albums"
        /></a
      >
      <a href="/home" on:click={() => handlePush("/home")}
        ><img
          src="/src/assets/icons/house-solid.svg"
          class="icon"
          alt="Home"
        /></a
      >
      <a href="/users" on:click={() => handlePush("/users")}
        ><img
          src="/src/assets/icons/users-solid.svg"
          class="icon"
          alt="Groups"
        /></a
      >
      <a href="/profile" on:click={() => handlePush("/profile")}>
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
</style>
