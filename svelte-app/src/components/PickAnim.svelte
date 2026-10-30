<script>
  export let hero = null;
  export let nick = "";
  export let active = false;

  let failed = false;

  $: label = hero ? hero.replace(/_/g, " ") : "";
  $: if (hero) failed = false;

  const sparks = [0, 1, 2, 3];
</script>

<div class="anim" class:active class:locked={!!hero} class:empty={!hero && !active}>
  {#if hero}
    {#key hero}
      <div class="clip">
        {#if !failed}
          <video class="media" autoplay muted loop playsinline on:error={() => (failed = true)}>
            <source src="videos/npc_dota_hero_{hero}.webm" type="video/webm" />
          </video>
        {/if}
        <img class="media still" src="portraits/{hero}.png" alt={nick || label} />
        <div class="shade"></div>
        <div class="tag">
          {#if nick}<b>{nick}</b>{/if}
          <span>{label}</span>
        </div>
      </div>
    {/key}
  {:else if active}
    <div class="clip waiting">
      <div class="scan"></div>
      <img class="mark" src="assets/uni/shield.png" alt="" />
      <span class="wait">PICK</span>
      {#each sparks as i}
        <img
          class="spark"
          src="assets/uni/spark.png"
          alt=""
          style="--x:{12 + i * 22}%; --d:{i * 0.28}s"
        />
      {/each}
    </div>
  {:else}
    <div class="clip vacant"></div>
  {/if}
</div>

<style>
  .anim {
    min-width: 0;
  }

  .clip {
    position: relative;
    width: 100%;
    aspect-ratio: 1 / 1;
    overflow: hidden;
    background:
      linear-gradient(#07030f, #07030f) padding-box,
      linear-gradient(180deg, #ff4ad8, #7a5cff 55%, #3de4ff) border-box;
    border: 2px solid transparent;
    box-shadow: 0 8px 0 rgba(8, 2, 16, 0.35);
  }

  .media {
    position: absolute;
    left: 50%;
    top: 0;
    height: 100% !important;
    width: auto !important;
    max-width: none !important;
    transform: translateX(-50%);
    animation: rise 0.45s steps(6, end) both;
  }

  .media.still {
    z-index: 0;
  }

  video.media {
    z-index: 1;
  }

  .shade {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 42%;
    background: linear-gradient(180deg, transparent, rgba(6, 1, 14, 0.92));
    z-index: 2;
    pointer-events: none;
  }

  .tag {
    position: absolute;
    left: 4px;
    right: 4px;
    bottom: 4px;
    z-index: 3;
    text-align: center;
    line-height: 1.15;
  }

  .tag b,
  .tag span {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-family: "Silkscreen", monospace;
  }

  .tag b {
    font-size: 11px;
    color: #fff6ff;
    text-shadow: -1px 0 #ff4ad8, 1px 0 #3de4ff;
  }

  .tag span {
    font-size: 8px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #d7c4ef;
  }

  .vacant {
    opacity: 0.28;
    background:
      linear-gradient(rgba(10, 4, 20, 0.35), rgba(10, 4, 20, 0.35)) padding-box,
      linear-gradient(180deg, rgba(255, 74, 216, 0.45), rgba(61, 228, 255, 0.45)) border-box;
  }

  .waiting {
    background:
      linear-gradient(#120818, #120818) padding-box,
      linear-gradient(180deg, #ff4ad8, #3de4ff) border-box;
    animation: pulse 1s steps(2, end) infinite;
  }

  .waiting .mark {
    position: absolute;
    left: 50%;
    top: 42%;
    width: 42%;
    transform: translate(-50%, -50%);
    image-rendering: pixelated;
    opacity: 0.85;
    animation: crest 1.2s ease-in-out infinite;
  }

  .scan {
    position: absolute;
    left: 0;
    right: 0;
    height: 28%;
    background: linear-gradient(180deg, transparent, rgba(255, 74, 216, 0.65), transparent);
    mix-blend-mode: screen;
    animation: sweep 1.2s linear infinite;
  }

  .wait {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 8px;
    text-align: center;
    font-family: "Silkscreen", monospace;
    font-weight: 700;
    font-size: 12px;
    color: #fff;
    text-shadow: 0 0 8px #ff4ad8;
    z-index: 2;
  }

  .spark {
    position: absolute;
    left: var(--x);
    bottom: 10px;
    width: 14px;
    height: 14px;
    image-rendering: pixelated;
    animation: float 1.5s linear infinite;
    animation-delay: var(--d);
    z-index: 2;
  }

  .active .clip {
    box-shadow: 0 0 16px rgba(255, 74, 216, 0.55), 0 8px 0 rgba(8, 2, 16, 0.35);
  }

  @keyframes rise {
    0% {
      clip-path: inset(100% 0 0 0);
      filter: brightness(2.2);
    }
    100% {
      clip-path: inset(0 0 0 0);
      filter: none;
    }
  }

  @keyframes sweep {
    0% {
      transform: translateY(-120%);
    }
    100% {
      transform: translateY(360%);
    }
  }

  @keyframes pulse {
    0%,
    100% {
      filter: brightness(1);
    }
    50% {
      filter: brightness(1.35);
    }
  }

  @keyframes crest {
    0%,
    100% {
      filter: drop-shadow(0 0 4px #ff4ad8);
    }
    50% {
      filter: drop-shadow(0 0 10px #3de4ff);
    }
  }

  @keyframes float {
    0% {
      transform: translateY(8px) scale(0.4);
      opacity: 0;
    }
    20% {
      opacity: 1;
    }
    100% {
      transform: translateY(-110px) scale(1);
      opacity: 0;
    }
  }
</style>
