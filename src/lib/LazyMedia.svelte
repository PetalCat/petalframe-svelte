<!-- LazyMedia.svelte -->
<script>
  import { onMount } from "svelte";
  import { fetchMedia } from "./api.js";

  export let filename = "";
  export let alt = "";

  let src = null;
  let observer;
  let el;

  onMount(() => {
    observer = new IntersectionObserver(async ([entry]) => {
      if (entry.isIntersecting) {
        observer.disconnect();
        try {
          src = await fetchMedia(filename);
        } catch (err) {
          console.warn("Preview load failed, trying fallback:", filename);
          const original = filename
            .replace(/^preview_/, "") // remove preview_ prefix
            .replace(/\.jpg$/, ".mp4"); // fallback to full file
          try {
            src = await fetchMedia(original);
          } catch (fallbackErr) {
            console.error("Fallback also failed:", fallbackErr);
          }
        }
      }
    });
    if (el) observer.observe(el);
  });
</script>

<div class="media-item" bind:this={el}>
  {#if src}
    <img {src} {alt} />
  {/if}
</div>

<style>
  .media-item {
    aspect-ratio: 1 / 1;
    width: 100%;
    overflow: hidden;
    border-radius: 6px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
</style>
