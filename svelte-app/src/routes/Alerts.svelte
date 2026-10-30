<script>
  import { onMount } from "svelte";
  import io from "socket.io-client";
  import { createAlertTracker } from "../lib/gameAlerts.js";
  import { alertFx } from "../lib/alertFx.js";

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
        {@const fx = alertFx(current.title)}
        {#key current.id}
          <div
            class="pop"
            class:leave={leaving}
            class:roshan={fx.motion === "roshan"}
            class:tormentor={fx.motion === "tormentor"}
            class:lotus={fx.motion === "lotus"}
            class:wisdom={fx.motion === "wisdom"}
            class:bounty={fx.motion === "bounty"}
            class:haste={fx.motion === "haste"}
            class:damage={fx.motion === "damage"}
            class:arcane={fx.motion === "arcane"}
            class:regen={fx.motion === "regen"}
            class:illusion={fx.motion === "illusion"}
            class:invis={fx.motion === "invis"}
            class:aegis={fx.motion === "aegis"}
            class:snatched={fx.motion === "snatched"}
            class:rune={fx.motion === "rune"}
            class:water={fx.motion === "water"}
            class:shielding={fx.motion === "shield"}
          >
            <div class="fx">
              {#each fx.bits as bit, i (i)}
                <span
                  class="bit"
                  class:orbit={bit.anim === "orbit"}
                  class:frame={bit.frame}
                  style="--w:{bit.w}px;--h:{bit.h}px;--c:{bit.c};--x0:{bit.x0}px;--y0:{bit.y0}px;--dx:{bit.dx}px;--dy:{bit.dy}px;--rot:{bit.rot};--d:{bit.delay}ms;--r:{bit.r}px;--a0:{bit.a0};--a1:{bit.a1}"
                ></span>
              {/each}
              <div class="plate" style="--plate:{fx.plate};--edge:{fx.edge}"></div>
            </div>
            <article class="card" class:dire={current.team === "dire"} class:radiant={current.team === "radiant"}>
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
          </div>
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

  .pop {
    position: absolute;
    top: 150px;
    left: 50%;
    width: 640px;
    height: 168px;
    margin-left: -320px;
  }

  .pop.leave {
    animation: leave 0.42s steps(6, end) both;
  }

  .fx {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .plate {
    position: absolute;
    left: -56px;
    right: -56px;
    top: -44px;
    bottom: -44px;
    z-index: 2;
    background-color: var(--plate);
    border: 8px solid var(--edge);
    animation: plate-pop 0.28s steps(5, end) both;
  }

  .bit {
    position: absolute;
    left: 50%;
    top: 50%;
    z-index: 1;
    width: var(--w);
    height: var(--h);
    margin: 0;
    padding: 0;
    background: var(--c);
    animation: fly 0.5s steps(6, end) both;
    animation-delay: var(--d);
  }

  .bit.orbit {
    animation-name: orbit;
    animation-duration: 0.64s;
  }

  .bit.frame {
    background: transparent;
    border: 8px solid var(--c);
    box-sizing: border-box;
  }

  .card {
    position: relative;
    z-index: 3;
    width: 100%;
    height: 100%;
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
      transform: translateY(-460px);
    }
  }

  @keyframes plate-pop {
    0% { transform: scale(0.35); }
    100% { transform: scale(1); }
  }

  @keyframes plate-up {
    0% { transform: translateY(56px) scale(0.92); }
    100% { transform: translateY(0) scale(1); }
  }

  @keyframes plate-x {
    0% { transform: scaleX(0.08); }
    100% { transform: scaleX(1); }
  }

  @keyframes plate-y {
    0% { transform: scaleY(0.08); }
    100% { transform: scaleY(1); }
  }

  @keyframes plate-flick {
    0% { transform: translate(-24px, 6px); }
    45% { transform: translate(18px, -4px); }
    100% { transform: translate(0, 0); }
  }

  @keyframes fly {
    0% {
      transform: translate(-50%, -50%) translate(var(--x0), var(--y0)) rotate(var(--rot));
    }
    100% {
      transform: translate(-50%, -50%) translate(var(--dx), var(--dy)) rotate(var(--rot));
    }
  }

  @keyframes orbit {
    0% {
      transform: translate(-50%, -50%) rotate(var(--a0)) scaleY(0.48) translateX(64px) scaleY(2.083) rotate(calc(var(--a0) * -1));
    }
    100% {
      transform: translate(-50%, -50%) rotate(var(--a1)) scaleY(0.48) translateX(var(--r)) scaleY(2.083) rotate(calc(var(--a1) * -1));
    }
  }

  .roshan .plate,
  .water .plate,
  .tormentor .plate {
    animation-name: plate-up;
  }

  .haste .plate,
  .rune .plate,
  .illusion .plate {
    animation-name: plate-x;
  }

  .damage .plate,
  .regen .plate,
  .aegis .plate,
  .snatched .plate {
    animation-name: plate-y;
  }

  .invis .plate {
    animation-name: plate-flick;
  }

  .roshan .plate {
    background-image: repeating-linear-gradient(90deg, #ff3b1f 0 12px, #ffb020 12px 20px, #2a0610 20px 34px);
    background-size: auto 16px;
    background-repeat: repeat-x;
    background-position: bottom;
  }

  .tormentor .plate {
    background-image: repeating-linear-gradient(90deg, #7ee7ff 0 10px, #071820 10px 24px);
    background-size: auto 14px;
    background-repeat: repeat-x;
    background-position: top;
  }

  .lotus .plate {
    background-image: repeating-linear-gradient(135deg, #ff7ad9 0 10px, #1a0820 10px 18px, #7ef6ff 18px 28px, #1a0820 28px 40px);
  }

  .wisdom .plate {
    background-image: radial-gradient(circle, #d7c4ff 0 4px, #5cefff 5px 7px, #14082a 8px);
    background-size: 28px 28px;
  }

  .bounty .plate {
    background-image: repeating-linear-gradient(90deg, #ffc83d 0 14px, #2a1a04 14px 28px);
    background-size: auto 14px;
    background-repeat: repeat-x;
    background-position: center;
  }

  .haste .plate {
    background-image: repeating-linear-gradient(#ff3b2f 0 8px, #2a0a0c 8px 24px);
  }

  .damage .plate {
    background-image: repeating-linear-gradient(90deg, #d7f4ff 0 8px, #0c1830 8px 28px);
  }

  .arcane .plate {
    background-image: repeating-linear-gradient(135deg, #c26bff 0 8px, #1a0830 8px 20px);
  }

  .regen .plate {
    background-image: repeating-linear-gradient(#ffe14a 0 8px, #241c08 8px 22px);
  }

  .invis .plate {
    background-image: radial-gradient(circle, #c9b6ff 0 3px, #160c22 4px);
    background-size: 22px 22px;
  }

  .aegis .plate {
    background-image: conic-gradient(#ffb020 0 12deg, #2a1004 12deg 26deg, #ff3b1f 26deg 34deg, #2a1004 34deg 52deg);
  }

  .snatched .plate {
    background-image: repeating-linear-gradient(28deg, #ff3030 0 10px, #2a0610 10px 22px, #ffb020 22px 28px, #2a0610 28px 44px);
  }

  .rune .plate {
    background-image: repeating-linear-gradient(90deg, #ff4ad8 0 12px, #3de4ff 12px 24px, #1a1040 24px 40px);
    background-size: auto 16px;
    background-repeat: repeat-x;
    background-position: bottom;
  }

  .water .plate {
    background-image: repeating-linear-gradient(90deg, #5cefff 0 8px, #062028 8px 20px);
    background-size: auto 18px;
    background-repeat: repeat-x;
    background-position: bottom;
  }

  .shielding .plate {
    box-shadow: inset 0 0 0 10px #071018, inset 0 0 0 16px #d5fff6;
  }
</style>
