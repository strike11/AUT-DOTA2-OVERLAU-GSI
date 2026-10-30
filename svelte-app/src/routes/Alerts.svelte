<script>
  import { onMount } from "svelte";
  import io from "socket.io-client";
  import { createAlertTracker } from "../lib/gameAlerts.js";

  const socket = io(`http://${location.hostname || "localhost"}:3001`, {
    reconnection: true,
    timeout: 3000,
  });
  const demoMode = location.hash.includes("demo");
  const tracker = createAlertTracker();

  const HOLD = 2800;
  const LEAVE = 420;

  const ALERT_ICONS = {
    ROSHAN: "assets/alerts/roshan.png",
    TORMENTOR: "assets/alerts/tormentor.png",
    LOTUS: "assets/alerts/lotus.png",
    WISDOM: "assets/alerts/wisdom.png",
    BOUNTY: "assets/alerts/bounty.png",
    HASTE: "assets/alerts/haste.png",
    "DOUBLE DAMAGE": "assets/alerts/double_damage.png",
    ARCANE: "assets/alerts/arcane.png",
    REGEN: "assets/alerts/regen.png",
    ILLUSION: "assets/alerts/illusion.png",
    INVIS: "assets/alerts/invis.png",
    AEGIS: "assets/alerts/aegis.png",
    "AEGIS SNATCHED": "assets/alerts/aegis.png",
    RUNE: "assets/alerts/haste.png",
    WATER: "assets/alerts/water.png",
    SHIELD: "assets/alerts/shield.png",
  };

  const demoScript = [
    { id: "d-roshan", kind: "roshan", title: "ROSHAN", subtitle: "SPAWNED", detail: "", team: null, hero: "" },
    { id: "d-wisdom", kind: "wisdom", title: "WISDOM", subtitle: "Yatoro", detail: "WEAVER", team: "dire", hero: "weaver" },
    { id: "d-haste", kind: "rune", title: "HASTE", subtitle: "dyrachyo", detail: "GYROCOPTER", team: "radiant", hero: "gyrocopter" },
    { id: "d-tormentor", kind: "tormentor", title: "TORMENTOR", subtitle: "SPAWNED", detail: "", team: null, hero: "" },
    { id: "d-bounty", kind: "bounty", title: "BOUNTY", subtitle: "Larl", detail: "PUCK", team: "dire", hero: "puck" },
    { id: "d-aegis", kind: "aegis", title: "AEGIS", subtitle: "Collapse", detail: "BEASTMASTER", team: "dire", hero: "beastmaster" },
  ];

  let live = false;
  let scale = 1;
  let current = null;
  let leaving = false;
  let queue = [];
  let demoIndex = 0;
  let failedHero = false;
  let failedIcon = false;
  let holdTimer = 0;
  let leaveTimer = 0;
  let demoTimer = 0;

  function fit() {
    scale = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
  }

  function pump() {
    if (current || !queue.length) return;
    current = queue.shift();
    failedHero = false;
    failedIcon = false;
    leaving = false;
    clearTimeout(holdTimer);
    clearTimeout(leaveTimer);
    holdTimer = setTimeout(() => {
      leaving = true;
    }, HOLD);
    leaveTimer = setTimeout(() => {
      current = null;
      leaving = false;
      if (queue.length) pump();
      else scheduleDemo();
    }, HOLD + LEAVE);
  }

  function enqueue(items) {
    if (!items.length) return;
    queue = queue.concat(items);
    pump();
  }

  function scheduleDemo() {
    if (!demoMode || live || current || queue.length) return;
    clearTimeout(demoTimer);
    demoTimer = setTimeout(() => {
      if (live) return;
      const item = demoScript[demoIndex % demoScript.length];
      demoIndex += 1;
      enqueue([{ ...item, id: `${item.id}-${demoIndex}` }]);
    }, 700);
  }

  socket.on("newdata", (data) => {
    if (!data?.map) return;
    const becameLive = !live;
    live = true;
    if (becameLive) clearTimeout(demoTimer);
    enqueue(tracker.digest(data));
  });

  socket.on("alert-cue", (cue) => {
    if (!cue?.title) return;
    enqueue([cue]);
  });

  $: label = current?.detail || "";
  $: icon = current ? ALERT_ICONS[current.title] || "" : "";

  onMount(() => {
    fit();
    if (demoMode) scheduleDemo();
    window.addEventListener("resize", fit);
    return () => {
      clearTimeout(holdTimer);
      clearTimeout(leaveTimer);
      clearTimeout(demoTimer);
      window.removeEventListener("resize", fit);
    };
  });
</script>

<div class="viewport">
  <div class="scaler" style="width: {1920 * scale}px; height: {1080 * scale}px;">
    <div class="stage" style="transform: scale({scale})">
      {#if current}
        {#key current.id}
          <article class="card" class:dire={current.team === "dire"} class:radiant={current.team === "radiant"} class:leave={leaving}>
            <div class="art">
              {#if icon && !failedIcon}
                <img class="glyph" src={icon} alt="" on:error={() => (failedIcon = true)} />
              {:else if current.hero && !failedHero}
                <img src="portraits/{current.hero}.png" alt="" on:error={() => (failedHero = true)} />
              {:else}
                <img class="shield" src="assets/uni/shield.png" alt="" />
              {/if}
            </div>
            <div class="copy">
              <b>{current.title}</b>
              {#if current.subtitle}<span>{current.subtitle}</span>{/if}
              {#if label}<small>{label}</small>{/if}
            </div>
          </article>
        {/key}
      {/if}
    </div>
  </div>
</div>

<style>
  :global(html),
  :global(body),
  :global(main) {
    background: #00ff00 !important;
  }

  .viewport {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    background: #00ff00;
  }

  .scaler {
    position: relative;
    overflow: hidden;
    flex: none;
    background: #00ff00;
  }

  .stage {
    width: 1920px;
    height: 1080px;
    position: absolute;
    left: 0;
    top: 0;
    transform-origin: top left;
    background: #00ff00;
  }

  .card {
    position: absolute;
    top: 72px;
    left: 50%;
    width: 640px;
    height: 168px;
    margin-left: -320px;
    display: flex;
    align-items: stretch;
    background: #14081c;
    border: 6px solid #ff4ad8;
    color: #fff6ff;
    animation: slam 0.36s steps(6, end) both;
  }

  .card.radiant {
    border-color: #3de4ff;
  }

  .card.leave {
    animation: leave 0.42s steps(6, end) both;
  }

  .art {
    width: 168px;
    flex: none;
    background: #07030f;
    border-right: 6px solid #ff4ad8;
    overflow: hidden;
    position: relative;
  }

  .radiant .art {
    border-right-color: #3de4ff;
  }

  .art img {
    position: absolute;
    left: 0;
    top: 0;
    width: 100% !important;
    height: 100% !important;
    max-width: none !important;
    object-fit: cover;
    object-position: center 18%;
  }

  .glyph {
    object-fit: contain !important;
    object-position: center !important;
    padding: 10px;
    box-sizing: border-box;
  }

  .shield {
    object-fit: contain !important;
    object-position: center !important;
    padding: 28px;
    box-sizing: border-box;
    image-rendering: pixelated;
  }

  .copy {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 0 28px;
    gap: 6px;
  }

  .copy b,
  .copy span,
  .copy small {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-family: "Silkscreen", monospace;
  }

  .copy b {
    font-size: 34px;
    letter-spacing: 0.08em;
    color: #fff6ff;
  }

  .copy span {
    font-size: 26px;
    color: #ffd6f6;
  }

  .radiant .copy span {
    color: #d9fbff;
  }

  .copy small {
    font-size: 16px;
    letter-spacing: 0.12em;
    color: #d7c4ef;
  }

  @keyframes slam {
    0% {
      transform: translateY(-220px);
    }
    70% {
      transform: translateY(10px);
    }
    100% {
      transform: translateY(0);
    }
  }

  @keyframes leave {
    0% {
      transform: translateY(0);
    }
    100% {
      transform: translateY(-240px);
    }
  }
</style>
