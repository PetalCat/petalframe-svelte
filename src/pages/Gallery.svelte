<!-- Gallery.svelte -->
<script>
  import { onMount } from "svelte";
  import { getMe, fetchAvatarBlob } from "../lib/api.js";
  import Router, { push } from "svelte-spa-router";
  import Media from "../lib/Media.svelte";

  let media = [];
  let user = null;
  let useravatar = null;
  let scope = null;

  const handle401 = (error) => {
    if (error.response && error.response.status === 401) {
      console.log("Unauthorized, redirecting to login...");
      push("#/login");
    }
  };

  onMount(async () => {
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
  });
</script>

<main>
  <h2>Gallery</h2>
  <!-- Media Component -->
  <Media {scope} />
</main>

<style>
  main {
    padding: 20px;
  }
  h2 {
    font-size: 28px;
    margin-bottom: 16px;
  }
</style>
