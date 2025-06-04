<!-- Media.svelte -->
<script>
  import { onMount } from "svelte";
  import { getMedia } from "./media.js";
  import LazyMedia from "./LazyMedia.svelte";
  import Lightbox from "./Lightbox.svelte";

  export let scope = "global";
  export let user = null;
  export let album = null;

  let mediaItems = {};
  let flatList = [];
  let showLightbox = false;
  let clickedIndex = 0;

  onMount(async () => {
    if (!scope) scope = "global";
    if (
      scope === "global" ||
      (scope === "user" && user) ||
      (scope === "album" && album)
    ) {
      mediaItems = await getMedia(scope, user, album);
      flatList = Object.entries(mediaItems)
        .sort((a, b) => toDate(b[0]).getTime() - toDate(a[0]).getTime())
        .map(([_, items]) => items)
        .flat();
    } else {
      console.warn("Media.svelte: Skipping getMedia due to missing params");
    }
  });

  const toDate = (label) => {
    const [month, year] = label.split(" ");
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return new Date(Number(year), months.indexOf(month));
  };

  const closeLightbox = () => {
    showLightbox = false;
  };
</script>

{#if Object.keys(mediaItems).length > 0}
  {#each Object.entries(mediaItems).sort((a, b) => toDate(b[0]).getTime() - toDate(a[0]).getTime()) as [group, items]}
    <h2 class="group-header">{group}</h2>
    <div class="media-grid">
      {#each items as item}
        <LazyMedia
          filename={`preview_${item.filename.replace(/\.[^/.]+$/, "")}.jpg`}
          alt={item.caption || "Media item"}
          startIndex={flatList.indexOf(item)}
          on:open={(e) => {
            clickedIndex = e.detail.index;
            showLightbox = true;
          }}
        />
      {/each}
    </div>
  {/each}
{:else}
  <p class="fallback">No media available or loading failed.</p>
{/if}

{#if showLightbox}
  <Lightbox
    mediaList={flatList}
    startIndex={clickedIndex}
    on:close={closeLightbox}
  />
{/if}

<style>
  .media-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
    gap: 0.5rem;
  }

  .fallback {
    text-align: center;
    margin-top: 2rem;
    color: #888;
  }

  .group-header {
    font-size: 1.25rem;
    margin: 2rem 0 1rem;
    text-align: left;
    color: #ccc;
  }
</style>
