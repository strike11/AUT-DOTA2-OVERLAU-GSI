<script>
  export let hero = "";
  export let nick = "";
  export let team = "radiant";
  export let kind = "pick";
  export let phase = "in";
  export let box = { x: 0, y: 0, w: 300, h: 300, dx: 0, dy: 0, s: 1 };

  let failed = false;

  $: label = hero ? hero.replace(/_/g, " ") : "";
  $: if (hero) failed = false;
  $: stamp = kind === "ban" ? "BAN" : "PICK";

  const sparks = [0, 1, 2, 3, 4, 5];
</script>

<div
  class="fly"
  class:dire={team === "dire"}
  class:ban={kind === "ban"}
  class:down={phase === "down"}
  style="
    left:{box.x}px;
    top:{box.y}px;
    width:{box.w}px;
    height:{box.h}px;
    --dx:{box.dx}px;
    --dy:{box.dy}px;
    --s:{box.s};
  "
>
  <div class="window">
    {#key hero}
      {#if !failed}
        <video class="hero video" autoplay muted loop playsinline on:error={() => (failed = true)}>
          <source src="videos/npc_dota_hero_{hero}.webm" type="video/webm" />
        </video>
      {/if}
      <img class="hero still" src="portraits/{hero}.png" alt={nick || label} />
    {/key}
    <div class="scan"></div>
    <div class="flash"></div>
    <div class="shade"></div>
    {#if kind === "ban"}
      <img class="cross" src="assets/uni/ban-x.png" alt="" />
    {/if}
    <div class="caption">
      <b class="stamp">{stamp}</b>
      {#if nick}<span class="nick">{nick}</span>{/if}
      <span class="hero-name">{label}</span>
    </div>
    {#each sparks as i}
      <img
        class="spark"
        src="assets/uni/spark.png"
        alt=""
        style="--x:{8 + i * 15}%; --d:{i * 0.12}s"
      />
    {/each}
  </div>
  <img class="bezel" src="assets/uni/frame.png" alt="" />
  <i class="arrow"></i>
</div>

<style>
  .fly {
    position: absolute;
    z-index: 8;
    pointer-events: none;
    transform-origin: center center;
    animation: slam 0.48s steps(7, end) both;
    filter: drop-shadow(0 0 18px rgba(61, 228, 255, 0.55));
  }

  .fly.dire {
    filter: drop-shadow(0 0 18px rgba(255, 74, 216, 0.6));
  }

  .fly.down {
    animation: drop 0.8s steps(10, end) both;
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
    z-index: 3;
    image-rendering: pixelated;
  }

  .hero {
    position: absolute;
    inset: 0;
    width: 100% !important;
    height: 100% !important;
    max-width: none !important;
    object-fit: cover;
    object-position: center 16%;
    display: block;
  }

  .hero.still {
    z-index: 0;
  }

  video.hero {
    z-index: 1;
  }

  .ban .hero {
    filter: grayscale(1) brightness(0.62) sepia(0.5) hue-rotate(250deg) saturate(2.4);
  }

  .scan {
    position: absolute;
    left: 0;
    right: 0;
    height: 22%;
    z-index: 2;
    background: linear-gradient(180deg, transparent, rgba(61, 228, 255, 0.55), transparent);
    mix-blend-mode: screen;
    animation: sweep 0.9s linear infinite;
  }

  .dire .scan {
    background: linear-gradient(180deg, transparent, rgba(255, 74, 216, 0.6), transparent);
  }

  .flash {
    position: absolute;
    inset: 0;
    z-index: 4;
    background: #fff6ff;
    mix-blend-mode: screen;
    animation: flash 0.36s steps(4, end) both;
  }

  .shade {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 48%;
    z-index: 2;
    background: linear-gradient(180deg, transparent, rgba(6, 1, 14, 0.94));
  }

  .cross {
    position: absolute;
    left: 50%;
    top: 42%;
    width: 58%;
    height: 58%;
    object-fit: contain;
    image-rendering: pixelated;
    z-index: 5;
    filter: drop-shadow(0 0 8px #ff4ad8);
    animation: slamx 0.34s steps(4, end) 0.12s both;
  }

  .caption {
    position: absolute;
    left: 4px;
    right: 4px;
    bottom: 6px;
    z-index: 5;
    text-align: center;
    line-height: 1.15;
  }

  .stamp,
  .nick,
  .hero-name {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-family: "Silkscreen", monospace;
  }

  .stamp {
    font-weight: 700;
    font-size: 28px;
    letter-spacing: 0.12em;
    color: #e9fdff;
    text-shadow: -2px 0 #3de4ff, 2px 0 #ff4ad8;
    animation: pop 0.32s steps(4, end) 0.18s both;
  }

  .dire .stamp {
    color: #ffe8f8;
  }

  .ban .stamp {
    color: #ffd0f2;
  }

  .nick {
    font-size: 22px;
    color: #fff;
    text-shadow: 0 2px 0 #120416;
  }

  .hero-name {
    font-size: 14px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #d7c4ef;
  }

  .spark {
    position: absolute;
    left: var(--x);
    bottom: 8px;
    width: 16px;
    height: 16px;
    z-index: 5;
    image-rendering: pixelated;
    animation: float 0.9s linear infinite;
    animation-delay: var(--d);
  }

  .down .spark {
    animation: fall 0.64s steps(6, end) both;
  }

  .arrow {
    position: absolute;
    left: 50%;
    bottom: -14px;
    width: 14px;
    height: 10px;
    transform: translateX(-50%);
    z-index: 4;
    background: #3de4ff;
    clip-path: polygon(0 0, 100% 0, 50% 100%);
    filter: drop-shadow(0 0 6px #3de4ff);
  }

  .dire .arrow,
  .ban .arrow {
    background: #ff4ad8;
    filter: drop-shadow(0 0 6px #ff4ad8);
  }

  @keyframes slam {
    0% {
      transform: translateY(-150px) scale(1.16);
      opacity: 0;
    }
    55% {
      transform: translateY(12px) scale(0.98);
      opacity: 1;
    }
    100% {
      transform: translateY(0) scale(1);
      opacity: 1;
    }
  }

  @keyframes drop {
    0% {
      transform: translate(0, 0) scale(1);
      opacity: 1;
    }
    16% {
      transform: translate(0, -26px) scale(1.05);
      opacity: 1;
    }
    100% {
      transform: translate(var(--dx), var(--dy)) scale(var(--s));
      opacity: 0;
    }
  }

  @keyframes sweep {
    0% {
      transform: translateY(-140%);
    }
    100% {
      transform: translateY(420%);
    }
  }

  @keyframes flash {
    0% {
      opacity: 0.9;
    }
    100% {
      opacity: 0;
    }
  }

  @keyframes pop {
    0% {
      transform: scale(2.2);
      opacity: 0;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  @keyframes slamx {
    0% {
      transform: translate(-50%, -50%) scale(2.4);
      opacity: 0;
    }
    100% {
      transform: translate(-50%, -50%) scale(1);
      opacity: 1;
    }
  }

  @keyframes float {
    0% {
      transform: translateY(10px) scale(0.4);
      opacity: 0;
    }
    25% {
      opacity: 1;
    }
    100% {
      transform: translateY(-150px) scale(1);
      opacity: 0;
    }
  }

  @keyframes fall {
    0% {
      transform: translateY(0);
      opacity: 1;
    }
    100% {
      transform: translateY(80px);
      opacity: 0;
    }
  }
</style>
