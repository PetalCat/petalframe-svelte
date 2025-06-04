<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { fetchMedia } from "./api.js";

  export let mediaList = []; // [{ filename, caption, ... }]
  export let startIndex = 0;
  export let onClose = () => {};

  let albumEl: HTMLDivElement;
  let currentIndex = 0;

  const buffer = 2;
  const visible = 5;

  let cache = new Map(); // index -> blob URL
  let lastPreloadRange: [number, number] = [-1, -1];
  let jumpInProgress = false;

  async function preload(index: number) {
    if (index < 0 || index >= mediaList.length) return;
    if (cache.has(index)) return;

    const filename = mediaList[index]?.filename;
    if (!filename) return;

    console.log("[fetching]", index, filename);

    try {
      const blob = await fetchMedia(filename);
      cache.set(index, blob); // No eviction — keep loaded content
    } catch (err) {
      console.warn("Failed to load:", filename, err);
    }
  }

  function preloadWindow() {
    const min = Math.max(0, currentIndex - buffer);
    const max = Math.min(mediaList.length - 1, currentIndex + visible + buffer);

    if (min >= lastPreloadRange[0] && max <= lastPreloadRange[1]) return;

    const indices: number[] = [];
    for (let offset = 0; offset <= max - min; offset++) {
      const left = currentIndex - offset;
      const right = currentIndex + offset;
      if (left >= min) indices.push(left);
      if (right <= max && right !== left) indices.push(right);
    }

    for (const i of indices) {
      preload(i);
    }

    lastPreloadRange = [min, max];
  }

  function updateCurrentIndex() {
    if (jumpInProgress || !albumEl) return;

    const scrollLeft = albumEl.scrollLeft;
    const itemWidth = albumEl.clientWidth;
    const newIndex = Math.floor(scrollLeft / itemWidth);
    if (newIndex !== currentIndex) {
      currentIndex = newIndex;
      preloadWindow();
    }
  }

  let scrollTimeout;
  function handleScroll() {
    if (scrollTimeout) clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(updateCurrentIndex, 10);
  }

  function scrollToElementAtIndex(index: number) {
    const container = albumEl;
    const children = container?.querySelectorAll<HTMLElement>(
      ".photo, .placeholder",
    );

    if (!children || index < 0 || index >= children.length) return;

    const el = children[index];
    jumpInProgress = true;
    el.scrollIntoView({
      behavior: "instant",
      block: "nearest",
      inline: "center",
    });

    setTimeout(() => {
      currentIndex = index;
      jumpInProgress = false;
      preloadWindow();
    }, 50);
  }

  onMount(() => {
    const interval = setInterval(() => {
      if (!albumEl) return;

      const children = albumEl.querySelectorAll(".photo, .placeholder");
      if (children.length >= startIndex + 1) {
        clearInterval(interval);
        scrollToElementAtIndex(startIndex);
      }
    }, 10);

    window.addEventListener("beforeunload", onUnload);
  });

  onDestroy(() => {
    for (const url of blobUrlCache.values()) {
      URL.revokeObjectURL(url);
    }
    blobUrlCache.clear();
  });

  function onUnload() {
    console.log("Unloading Lightbox");
  }
</script>

<!-- Fullscreen overlay -->
<div class="lightbox-overlay" on:click={onClose}>
  <div
    class="album"
    bind:this={albumEl}
    on:scroll={handleScroll}
    on:click|stopPropagation
  >
    <!-- Left spacer -->
    <div
      class="spacer"
      style="width: {Math.max(0, currentIndex - buffer) * 100}vw;"
    ></div>

    <!-- Visible items -->
    {#each mediaList.slice(Math.max(0, currentIndex - buffer), currentIndex + visible + buffer) as item, i (currentIndex - buffer + i)}
      {#if cache.has(currentIndex - buffer + i)}
        <img
          class="photo"
          src={cache.get(currentIndex - buffer + i)}
          alt={item.caption}
          data-id={currentIndex - buffer + i}
        />
      {:else}
        <div class="photo placeholder" data-id={currentIndex - buffer + i}>
          Loading...
        </div>
      {/if}
    {/each}

    <!-- Right spacer -->
    <div
      class="spacer"
      style="width: {Math.max(
        0,
        mediaList.length - (currentIndex + visible + buffer),
      ) * 100}vw;"
    ></div>
  </div>
</div>

<style>
  .lightbox-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.95);
    z-index: 1000;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .album {
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
    height: 100%;
    width: 100%;
    padding: 1rem;
    gap: 1rem;
  }

  .photo {
    flex: 0 0 auto;
    width: 100vw;
    height: 90vh;
    border-radius: 12px;
    cursor: pointer;
    scroll-snap-align: center;
    object-fit: contain;
    background: #111;
  }

  .placeholder {
    background: #333;
    color: #888;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    width: 100vw;
    height: 90vh;
    border-radius: 12px;
    scroll-snap-align: center;
  }

  .spacer {
    flex: 0 0 auto;
    height: 1px;
  }
</style>
