<script>
  import { onMount } from "svelte";
  import { getMedia } from "./media.js";
  import LazyMedia from "./LazyMedia.svelte";

  export let scope = "global";
  export let user = null;
  export let album = null;

  let mediaItems = [];

  onMount(async () => {
    if (!scope) scope = "global";
    if (
      scope === "global" ||
      (scope === "user" && user) ||
      (scope === "album" && album)
    ) {
      mediaItems = await getMedia(scope, user, album);
    } else {
      console.warn("Media.svelte: Skipping getMedia due to missing params");
    }
  });
</script>

{#if Object.keys(mediaItems).length > 0}
  {#each Object.entries(mediaItems).sort((a, b) => {
    const parse = (label) => {
      const [month, year] = label.split(" ");
      const monthIndex = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].indexOf(month);
      return new Date(Number(year), monthIndex);
    };
    return (parse(b[0])?.getTime() || 0) - (parse(a[0])?.getTime() || 0);
  }) as [group, items]}
    <h2 class="group-header">{group}</h2>
    <div class="media-grid">
      {#each items as item}
        <LazyMedia
          filename={`preview_${item.filename.replace(/\.[^/.]+$/, "")}.jpg`}
          alt={item.caption || "Media item"}
        />
      {/each}
    </div>
  {/each}
{:else}
  <p class="fallback">No media available or loading failed.</p>
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
