<script>
  import {
    getMe,
    fetchAvatarBlob,
    fetchGalleryBG,
    fetchAlbums,
    fetchMedia,
  } from "../lib/api.js";
  import { onMount } from "svelte";
  import { push, pop, replace } from "svelte-spa-router";

  let user = null;
  let useravatar = null;
  let galleryBackground = null;
  let albums = [];
  let error = "";
  console.log("Home.svelte");

  const handle401 = (error) => {
    if (error.response && error.response.status === 401) {
      console.log("Unauthorized, redirecting to login...");
      push("/login");
    }
  };

  onMount(async () => {
    console.log("onMount Home.svelte");
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
    try {
      galleryBackground = await fetchGalleryBG();
      console.log("galleryBackground", galleryBackground);
    } catch (error) {
      console.log("Error fetching gallery background:", error);
      galleryBackground = null;
    }

    try {
      const fetched = await fetchAlbums();
      albums = await Promise.all(
        fetched.slice(0, 3).map(async (album) => {
          try {
            const cover = await fetchMedia(album.cover_filename);
            return { ...album, cover };
          } catch (e) {
            console.log("Media fetch failed for", album.name);
            return null;
          }
        }),
      );
      albums = albums.filter(Boolean); // Remove nulls
    } catch (e) {
      console.log("Album fetch failed:", e);
    }
  });
</script>

<!-- Page -->
<main>
  <header>
    <img src="/src/assets/PetalFrame.svg" alt="Logo" class="logo" />
    <h2 class="logo-text">Frame</h2>
    {#if useravatar}
      <img src={useravatar} alt="User Avatar" class="navatar" />
    {:else if error}
      <p>{error}</p>
    {:else}
      <img src="/default-pfp.svg" alt="Default Avatar" class="navatar" />
    {/if}
  </header>

  {#if user}
    <h2 class="name">Hello {user},</h2>
  {:else if error}
    <h2 class="name">{error}</h2>
  {:else}
    <h2 class="name">Loading...</h2>
  {/if}
  <div class="containters">
    <div class="uploads container">
      <img
        src="/src/assets/icons/arrow-up-from-bracket-solid.svg"
        class="uploadicon"
        alt="Upload icon"
      />
      <h2 class="uploadtext">Upload</h2>
    </div>

    <div
      class="gallery container"
      style="background-image: url({galleryBackground})"
    >
      <div class="gallerygradient">
        <div class="galleryheader">
          <img
            src="/src/assets/icons/image-solid.svg"
            class="galleryicon"
            alt="Gallery icon"
          />
          <h2 class="gallerytext">Gallery</h2>
        </div>
      </div>
    </div>
    <div class="album container">
      <div class="albumheader">
        <img
          src="/src/assets/icons/images-solid.svg"
          class="galleryicon"
          alt="Album icon"
        />
        <h2 class="gallerytext">Albums</h2>
      </div>
      <div id="albumcontainer">
        {#each albums as album (album.id)}
          <div class="album-cover-container">
            <img src={album.cover} alt={album.name} class="album-cover" />
          </div>
        {/each}
      </div>
    </div>
  </div>
</main>

<style>
  /* Navbar! */
  .logo {
    width: 42px;
    height: 42px;
  }
  .logo-text {
    margin-left: 3%;
    font-size: 40px;
  }
  header {
    display: flex;
    align-items: center;
    position: fixed;
    top: 20px;
    left: 10px;
    right: 10px;
    height: 50px;
  }
  .navatar {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid #ccc;
    margin-left: auto;
  }
  /* Main Content */
  main {
    display: flex;
    flex-direction: column;
    margin-top: 50px;
    padding: 20px;
  }
  .name {
    font-size: 32px;
    margin-bottom: 0;
    text-align: left;
  }
  /* Global Containers */
  .container {
    border-radius: 31px;
    background-color: #323232;
    width: 86.7vw;
    margin-top: 22px;
  }
  /* Upload Container */
  .uploads {
    height: 70px;
    display: flex;
    align-items: center;
    justify-content: left;
  }
  .uploadtext {
    font-size: 24px;
    padding-left: 3%;
  }
  .uploadicon {
    height: 27px;
    width: height;
    margin-left: 5%;
    /* change svg color */
    filter: invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg)
      brightness(100%) contrast(100%);
  }
  /* Gallery Container */
  .gallery {
    height: 210px;
    background-size: cover;
    background-position: center;
  }
  .gallerygradient {
    background: linear-gradient(
      to bottom,
      /* stop position a is 19% with 36 opacity */ rgba(0, 0, 0, 0.36) 19%,
      rgba(0, 0, 0, 0)
    );
    height: 100%;
    width: 100%;
  }
  .galleryheader {
    display: flex;
    align-items: center;
    justify-content: left;
  }
  .galleryicon {
    height: 27px;
    width: height;
    margin-left: 5%;
    /* change svg color */
    filter: invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg)
      brightness(100%) contrast(100%);
  }
  .gallerytext {
    font-size: 24px;
    padding-left: 3%;
  }
  /* Album Container */
  .album {
    height: 220px;
  }
  .albumheader {
    display: flex;
    align-items: center;
    justify-content: left;
    height: 25%;
  }

  :global(#albumcontainer) {
    display: flex;
    justify-content: center;
    gap: 12px;
    padding: 0 2%;
  }

  :global(.album-cover-container) {
    flex: 1;
    height: 160px; /* fixed height */
    border-radius: 22px;
    overflow: hidden;
    display: flex;
  }

  :global(.album-cover) {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    border-radius: 22px;
    display: block;
  }
</style>
