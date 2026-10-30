<script>
  import { videoSrc } from "../lib/heroes.js";

  export let hero = null;
  export let nick = "";
  export let active = false;

  let failed = false;

  $: label = hero ? hero.replace(/_/g, " ") : "";
  $: if (hero) failed = false;

  const sparks = [0, 1, 2, 3, 4, 5];
</script>

<div class="pick" class:active class:locked={!!hero} class:empty={!hero && !active}>
  <div class="window">
    {#if hero}
      {#key hero}
        {#if failed}
          <img class="hero pixel" src="icons/{hero}.png" alt={nick || label} />
        {:else}
          <video
            class="hero"
            autoplay
            muted
            loop
            playsinline
            on:error={() => (failed = true)}
          >
            <source src={videoSrc(hero)} type="video/webm" />
          </video>
        {/if}
        <div class="pixel-grid"></div>
        <div class="nameplate">
          {#if nick}
            <span class="nick" class:long={nick.length > 12}>{nick}</span>
          {/if}
          <span class="hero-name" class:solo={!nick}>{label}</span>
        </div>
      {/key}
    {:else}
      <div class="circuit"></div>
      <img class="watermark" src="assets/uni/shield.png" alt="" />
      {#if active}
        <div class="scan"></div>
        <div class="pick-tag">PICKING</div>
        {#each sparks as i}
          <img
            class="spark"
            src="assets/uni/spark.png"
            alt=""
            style="--x:{10 + i * 14}%; --d:{i * 0.22}s; --dx:{i % 2 ? 10 : -12}px"
          />
        {/each}
      {/if}
    {/if}
  </div>
  <img class="bezel" src="assets/uni/frame.png" alt="" />
</div>

<style>
  .pick {
    position: relative;
    width: 100%;
    aspect-ratio: 1 / 1;
    min-width: 0;
  }

  .window {
    position: absolute;
    left: 12.2%;
    top: 14.4%;
    width: 75.3%;
    height: 74.8%;
    overflow: hidden;
    background: #07030f;
    z-index: 1;
  }

  .bezel {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: fill;
    pointer-events: none;
    z-index: 3;
    image-rendering: pixelated;
  }

  .hero {
    position: absolute;
    left: 50%;
    top: 0;
    height: 100% !important;
    width: auto !important;
    max-width: none !important;
    transform: translateX(-50%);
    object-fit: cover;
    object-position: center center;
    display: block;
    animation: reveal 0.55s steps(7, end) both;
  }

  .hero.pixel {
    top: 42%;
    width: 72% !important;
    height: 72% !important;
    transform: translate(-50%, -50%);
    object-fit: contain !important;
    image-rendering: pixelated;
  }

  .pixel-grid {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background-image: linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
    background-size: 4px 4px;
    mix-blend-mode: overlay;
  }

  .nameplate {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 12px 4px 4px;
    text-align: center;
    background: linear-gradient(180deg, transparent, rgba(8, 2, 16, 0.94) 46%);
    animation: glitch 0.4s steps(2, end) both;
  }

  .nameplate .nick,
  .nameplate .hero-name {
    display: block;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-family: "Silkscreen", monospace;
    font-weight: 700;
    line-height: 1.15;
  }

  .nameplate .nick {
    font-size: 11px;
    letter-spacing: 0.02em;
    color: #fff6ff;
    text-shadow: -1px 0 #ff4ad8, 1px 0 #3de4ff;
  }

  .nameplate .nick.long {
    font-size: 8px;
  }

  .nameplate .hero-name {
    font-size: 8px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #d7c4ef;
  }

  .nameplate .hero-name.solo {
    font-size: 10px;
    color: #fff6ff;
    text-shadow: -1px 0 #ff4ad8, 1px 0 #3de4ff;
  }

  .circuit {
    position: absolute;
    inset: -8%;
    background: url("/assets/uni/circuit.jpg") center / 170% auto repeat;
    animation: drift 14s linear infinite;
    opacity: 0.85;
  }

  .empty .circuit {
    opacity: 0.45;
    filter: saturate(0.7) brightness(0.7);
  }

  .watermark {
    position: absolute;
    left: 50%;
    top: 46%;
    width: 46%;
    transform: translate(-50%, -50%);
    image-rendering: pixelated;
    opacity: 0.28;
    filter: drop-shadow(0 0 6px #ff4ad8);
    pointer-events: none;
  }

  .active .watermark {
    opacity: 0.9;
    animation: crest 1.4s ease-in-out infinite;
  }

  .scan {
    position: absolute;
    left: 0;
    right: 0;
    height: 38%;
    background: linear-gradient(
      180deg,
      transparent,
      rgba(61, 228, 255, 0.05) 30%,
      rgba(255, 74, 216, 0.72),
      rgba(61, 228, 255, 0.15),
      transparent
    );
    mix-blend-mode: screen;
    animation: scan 1.35s linear infinite;
    z-index: 2;
    pointer-events: none;
  }

  .pick-tag {
    position: absolute;
    left: 50%;
    bottom: 8px;
    transform: translateX(-50%);
    z-index: 3;
    padding: 3px 5px 2px;
    font-family: "Silkscreen", monospace;
    font-weight: 700;
    font-size: 11px;
    letter-spacing: 0.04em;
    color: #fff6ff;
    background: rgba(8, 0, 16, 0.82);
    box-shadow: 0 0 0 2px #ff4ad8, 0 0 0 4px #140816, 0 0 12px #ff4ad8;
    animation: tagBlink 0.9s steps(2, end) infinite;
    white-space: nowrap;
  }

  .spark {
    position: absolute;
    bottom: 8px;
    left: var(--x);
    width: 16px;
    height: 16px;
    z-index: 4;
    pointer-events: none;
    image-rendering: pixelated;
    animation: sparkFloat 1.7s linear infinite;
    animation-delay: var(--d);
  }

  .active {
    transform: translateY(-7px);
    z-index: 2;
  }

  .active .bezel {
    animation: bezelPulse 1.05s ease-in-out infinite;
  }

  @keyframes reveal {
    0% {
      clip-path: inset(0 100% 0 0);
      filter: brightness(2.6) saturate(1.5);
    }
    100% {
      clip-path: inset(0 0 0 0);
      filter: none;
    }
  }

  @keyframes glitch {
    0% {
      transform: translate(2px, 0);
      opacity: 0;
    }
    40% {
      transform: translate(-2px, 1px);
    }
    100% {
      transform: none;
      opacity: 1;
    }
  }

  @keyframes drift {
    from {
      background-position: 0 0;
    }
    to {
      background-position: 90px 140px;
    }
  }

  @keyframes crest {
    0%,
    100% {
      filter: drop-shadow(0 0 4px #ff4ad8) brightness(1);
    }
    50% {
      filter: drop-shadow(0 0 10px #3de4ff) brightness(1.35);
    }
  }

  @keyframes scan {
    0% {
      transform: translateY(-120%);
    }
    100% {
      transform: translateY(280%);
    }
  }

  @keyframes tagBlink {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.55;
    }
  }

  @keyframes sparkFloat {
    0% {
      transform: translateY(12px) scale(0.35);
      opacity: 0;
    }
    18% {
      opacity: 1;
    }
    100% {
      transform: translateY(-130px) translateX(var(--dx)) scale(1);
      opacity: 0;
    }
  }

  @keyframes bezelPulse {
    0%,
    100% {
      filter: drop-shadow(0 0 3px #ff4ad8) drop-shadow(0 0 7px #3de4ff);
    }
    50% {
      filter: drop-shadow(0 0 8px #ff4ad8) drop-shadow(0 0 14px #3de4ff);
    }
  }
</style>
