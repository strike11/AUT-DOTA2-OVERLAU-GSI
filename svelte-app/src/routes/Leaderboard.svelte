<script>
  import { onMount } from "svelte";

  const FALLBACK = {
    title: "AUT CUP",
    subtitle: "GROUP STAGE",
    teams: [
      { tag: "AUT", name: "AUT PRIME", w: 6, l: 0, form: ["W", "W", "W", "W", "W"] },
      { tag: "NXS", name: "NEXUS", w: 5, l: 1, form: ["W", "W", "L", "W", "W"] },
      { tag: "PNK", name: "PINK NOISE", w: 4, l: 2, form: ["W", "L", "W", "W", "L"] },
      { tag: "CYN", name: "CYAN WARD", w: 4, l: 2, form: ["L", "W", "W", "W", "L"] },
      { tag: "PIX", name: "PIXEL FORGE", w: 3, l: 3, form: ["W", "L", "W", "L", "W"] },
      { tag: "ARC", name: "NEON ARCH", w: 2, l: 4, form: ["L", "L", "W", "L", "W"] },
      { tag: "GLT", name: "GLITCH LAB", w: 1, l: 5, form: ["L", "W", "L", "L", "L"] },
      { tag: "SHD", name: "SHIELD UNIT", w: 0, l: 6, form: ["L", "L", "L", "L", "L"] },
    ],
  };

  let scale = 1;
  let title = FALLBACK.title;
  let subtitle = FALLBACK.subtitle;
  let teams = FALLBACK.teams;
  let tick = 0;

  function points(team) {
    return Math.max(0, Number(team.w) || 0) * 3;
  }

  function diff(team) {
    return (Number(team.w) || 0) - (Number(team.l) || 0);
  }

  function fit() {
    scale = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
  }

  $: ranked = [...teams]
    .map((team) => ({
      ...team,
      pts: points(team),
      delta: diff(team),
      form: Array.isArray(team.form) ? team.form.slice(0, 5) : [],
    }))
    .sort((a, b) => b.pts - a.pts || b.delta - a.delta || a.name.localeCompare(b.name));

  $: maxPts = Math.max(1, ...ranked.map((team) => team.pts));
  $: focus = ranked.length ? tick % ranked.length : 0;
  $: podium =
    ranked.length >= 3
      ? [
          { ...ranked[1], place: 2 },
          { ...ranked[0], place: 1 },
          { ...ranked[2], place: 3 },
        ]
      : ranked.map((team, index) => ({ ...team, place: index + 1 }));

  onMount(() => {
    fit();
    window.addEventListener("resize", fit);
    const pulse = setInterval(() => {
      tick += 1;
    }, 1700);

    const load = async () => {
      try {
        const res = await fetch("data/leaderboard.json", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (!Array.isArray(data.teams) || !data.teams.length) return;
        teams = data.teams;
        title = data.title || FALLBACK.title;
        subtitle = data.subtitle || FALLBACK.subtitle;
      } catch (err) {
        /* demo standings stay on screen */
      }
    };
    load();
    const refresh = setInterval(load, 4000);

    return () => {
      clearInterval(pulse);
      clearInterval(refresh);
      window.removeEventListener("resize", fit);
    };
  });
</script>

<div class="viewport">
  <div class="scaler" style="width: {1920 * scale}px; height: {1080 * scale}px;">
    <div class="stage" style="transform: scale({scale})">
      <img class="ghost" src="assets/uni/shield.png" alt="" />
      {#each [0, 1, 2, 3, 4] as i}
        <img
          class="spark"
          src="assets/uni/spark.png"
          alt=""
          style="--x:{12 + i * 18}%; --d:{i * 0.45}s"
        />
      {/each}

      <header class="top">
        <img class="chev" src="assets/uni/chevron.png" alt="" />
        <div class="titles">
          <div class="kicker">{title}</div>
          <h1>LEADERBOARD</h1>
          <div class="sub">{subtitle}</div>
        </div>
        <img class="chev flip" src="assets/uni/chevron.png" alt="" />
      </header>

      <section class="podium" aria-label="Top three">
        {#each podium as team (team.tag + team.place)}
          <article class="card p{team.place}" style="--place:{team.place}">
            {#if team.place === 1}
              <div class="arch-clip">
                <img class="arch" src="assets/uni/arch.png" alt="" />
              </div>
            {/if}
            <div class="place">{String(team.place).padStart(2, "0")}</div>
            <img class="shield" src="assets/uni/shield.png" alt="" />
            <div class="meta">
              <div class="tag">{team.tag}</div>
              <div class="name">{team.name}</div>
              <div class="line">
                <span class="rec">{team.w}-{team.l}</span>
                <span class="pts">{team.pts}<span>PTS</span></span>
              </div>
            </div>
          </article>
        {/each}
      </section>

      <section class="board">
        <div class="cols head">
          <span>#</span>
          <span>TEAM</span>
          <span>FORM</span>
          <span>W</span>
          <span>L</span>
          <span>+/-</span>
          <span>POINTS</span>
          <span>PTS</span>
        </div>
        {#each ranked as team, index (team.tag)}
          {#if index === 4}
            <div class="cutline"><i></i><span>PLAYOFF CUT</span><i></i></div>
          {/if}
          <div
            class="cols row"
            class:gold={index === 0}
            class:silver={index === 1}
            class:bronze={index === 2}
            class:hot={index === focus}
            style="--i:{index}"
          >
            <span class="rank">{String(index + 1).padStart(2, "0")}</span>
            <span class="who">
              <img src="assets/uni/shield.png" alt="" />
              <b>{team.tag}</b>
              <em>{team.name}</em>
            </span>
            <span class="form">
              {#each team.form as mark, fi (`${team.tag}-${fi}`)}
                <i class:win={mark === "W"} class:loss={mark === "L"}></i>
              {/each}
            </span>
            <span class="num">{team.w}</span>
            <span class="num dim">{team.l}</span>
            <span class="delta" class:up={team.delta > 0} class:down={team.delta < 0}>
              {team.delta > 0 ? "+" : ""}{team.delta}
            </span>
            <span class="meter">
              {#each Array(18) as _, seg}
                <i class:on={seg < Math.round((team.pts / maxPts) * 18)}></i>
              {/each}
            </span>
            <span class="score">{team.pts}</span>
          </div>
        {/each}
      </section>
    </div>
  </div>
</div>

<style>
  .viewport {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    display: grid;
    place-items: center;
    background:
      radial-gradient(ellipse at 50% 112%, rgba(255, 30, 140, 0.5), transparent 46%),
      radial-gradient(ellipse at 50% -10%, #34104e 0%, #12010f 62%);
  }

  .viewport::before {
    content: "";
    position: absolute;
    left: -10%;
    right: -10%;
    bottom: -8%;
    height: 62%;
    background-image:
      linear-gradient(rgba(255, 80, 180, 0.26) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 80, 180, 0.26) 1px, transparent 1px);
    background-size: 64px 64px;
    transform: perspective(520px) rotateX(58deg);
    transform-origin: center top;
    mask-image: linear-gradient(to top, rgba(0, 0, 0, 0.85), transparent 78%);
    pointer-events: none;
  }

  .scaler {
    position: relative;
    overflow: hidden;
    flex: none;
  }

  .stage {
    width: 1920px;
    height: 1080px;
    position: absolute;
    left: 0;
    top: 0;
    transform-origin: top left;
    padding: 42px 90px 36px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .stage::after {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: repeating-linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.14) 0 1px,
      transparent 1px 3px
    );
    mix-blend-mode: multiply;
  }

  .ghost {
    position: absolute;
    left: 50%;
    top: 86px;
    width: 340px;
    transform: translateX(-50%);
    opacity: 0.07;
    image-rendering: pixelated;
    filter: drop-shadow(0 0 24px #ff4ad8);
    pointer-events: none;
  }

  .spark {
    position: absolute;
    left: var(--x);
    bottom: 8%;
    width: 18px;
    height: 18px;
    image-rendering: pixelated;
    animation: rise 3.2s linear infinite;
    animation-delay: var(--d);
    pointer-events: none;
    z-index: 4;
  }

  .top {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 22px;
    position: relative;
    z-index: 2;
  }

  .chev {
    width: 42px;
    height: 54px;
    object-fit: contain;
    image-rendering: pixelated;
    filter: drop-shadow(0 0 8px #3de4ff);
    animation: nudge 0.8s steps(2, end) infinite;
  }

  .flip {
    transform: scaleX(-1);
    filter: drop-shadow(0 0 8px #ff4ad8);
    animation-name: nudge-flip;
  }

  .titles {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    min-width: 560px;
  }

  .kicker,
  .sub {
    font-family: "PressStart", monospace;
    font-size: 11px;
    letter-spacing: 0.18em;
    color: #ffd6f7;
    text-shadow: 0 0 8px #ff4ad8;
    background: rgba(8, 2, 16, 0.78);
    padding: 7px 10px 6px;
    box-shadow: 0 0 0 2px #ff4ad8, 0 0 0 4px #120816;
  }

  .sub {
    letter-spacing: 0.14em;
    color: #d9fbff;
    text-shadow: 0 0 8px #3de4ff;
    box-shadow: 0 0 0 2px #3de4ff, 0 0 0 4px #120816;
  }

  h1 {
    margin: 0;
    font-family: "PressStart", monospace;
    font-size: 34px;
    font-weight: 400;
    letter-spacing: 0.06em;
    color: #f7fbff;
    animation: chroma 1.6s steps(2, end) infinite;
  }

  .podium {
    height: 248px;
    display: grid;
    grid-template-columns: 1fr 1.18fr 1fr;
    gap: 18px;
    align-items: end;
    position: relative;
    z-index: 2;
  }

  .card {
    position: relative;
    height: 188px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    gap: 6px;
    padding: 12px 12px 12px;
    background:
      linear-gradient(#120818, #120818) padding-box,
      linear-gradient(90deg, #8a5cff, #ff4ad8) border-box;
    border: 3px solid transparent;
    box-shadow: 0 0 0 2px #0a0412, inset 0 0 24px rgba(90, 20, 140, 0.35);
    overflow: hidden;
    animation: cardIn 0.5s steps(6, end) both;
  }

  .card.p1 {
    height: 248px;
    justify-content: flex-end;
    background:
      linear-gradient(#100616, #100616) padding-box,
      linear-gradient(90deg, #ff4ad8, #ffe08a, #3de4ff, #ff4ad8) border-box;
    background-size: auto, 220% 100%;
    animation: cardIn 0.5s steps(6, end) both, borderFlow 5s linear infinite;
    box-shadow: 0 0 0 2px #0a0412, 0 0 28px rgba(255, 74, 216, 0.45);
  }

  .card.p2 {
    background:
      linear-gradient(#08141c, #08141c) padding-box,
      linear-gradient(90deg, #3de4ff, #8a5cff) border-box;
  }

  .arch-clip {
    position: absolute;
    left: 50%;
    top: 4px;
    width: 150px;
    height: 108px;
    transform: translateX(-50%);
    overflow: hidden;
    pointer-events: none;
    mask-image: linear-gradient(#000 70%, transparent);
  }

  .arch {
    width: 150px;
    height: auto;
    display: block;
    margin-top: -34px;
    image-rendering: pixelated;
    opacity: 0.95;
  }

  .place {
    position: absolute;
    top: 10px;
    left: 12px;
    font-family: "PressStart", monospace;
    font-size: 12px;
    color: #f4e9ff;
  }

  .p1 .place {
    color: #ffe7a8;
    text-shadow: 0 0 8px #ff4ad8;
  }

  .p2 .place {
    color: #bff7ff;
    text-shadow: 0 0 8px #3de4ff;
  }

  .shield {
    width: 54px;
    height: 54px;
    object-fit: contain;
    image-rendering: pixelated;
    position: relative;
    z-index: 1;
  }

  .p1 .shield {
    width: 78px;
    height: 78px;
    filter: drop-shadow(0 0 10px #ff4ad8);
    animation: crest 1.5s ease-in-out infinite;
  }

  .p2 .shield {
    filter: drop-shadow(0 0 8px #3de4ff);
  }

  .p3 .shield {
    filter: drop-shadow(0 0 8px #8a5cff);
  }

  .meta {
    position: relative;
    z-index: 1;
    width: min(100%, 280px);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    padding: 7px 10px 8px;
    background: rgba(6, 2, 14, 0.88);
    box-shadow: 0 0 0 2px #ff4ad8, 0 0 0 4px #120816;
  }

  .p2 .meta {
    box-shadow: 0 0 0 2px #3de4ff, 0 0 0 4px #081018;
  }

  .p3 .meta {
    box-shadow: 0 0 0 2px #b388ff, 0 0 0 4px #120816;
  }

  .tag,
  .name,
  .rec,
  .pts {
    font-family: "Silkscreen", monospace;
    letter-spacing: 0.08em;
  }

  .line {
    display: flex;
    align-items: baseline;
    gap: 12px;
  }

  .tag {
    font-weight: 700;
    font-size: 16px;
    color: #fff6ff;
    text-shadow: -1px 0 #ff4ad8, 1px 0 #3de4ff;
  }

  .name {
    font-size: 12px;
    color: #f4e9ff;
  }

  .rec {
    font-family: "PressStart", monospace;
    font-size: 11px;
    color: #d9fbff;
  }

  .pts {
    font-family: "PressStart", monospace;
    font-size: 16px;
    color: #fff;
  }

  .pts span {
    margin-left: 6px;
    font-size: 8px;
    color: #ffd6f7;
  }

  .board {
    position: relative;
    z-index: 2;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 14px 16px 16px;
    background:
      linear-gradient(rgba(10, 4, 18, 0.88), rgba(10, 4, 18, 0.88)) padding-box,
      linear-gradient(90deg, #ff4ad8, #8a5cff, #3de4ff, #ff4ad8) border-box;
    background-size: auto, 220% 100%;
    border: 3px solid transparent;
    box-shadow: 0 0 0 2px #0a0412, inset 0 0 40px rgba(90, 20, 140, 0.28);
    animation: borderFlow 5s linear infinite;
    overflow: hidden;
  }

  .board::before {
    content: "";
    position: absolute;
    inset: 0;
    background: url("assets/uni/circuit.jpg") center / 680px auto repeat;
    opacity: 0.12;
    animation: drift 18s linear infinite;
    pointer-events: none;
  }

  .board::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    height: 46px;
    background: linear-gradient(
      180deg,
      transparent,
      rgba(61, 228, 255, 0.05) 30%,
      rgba(255, 74, 216, 0.28),
      transparent
    );
    mix-blend-mode: screen;
    animation: scan 3.4s linear infinite;
    pointer-events: none;
  }

  .cols {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: 64px minmax(0, 1.5fr) 118px 48px 48px 72px minmax(160px, 1fr) 72px;
    align-items: center;
    gap: 8px;
    padding: 0 10px;
  }

  .head {
    height: 28px;
    font-family: "PressStart", monospace;
    font-size: 9px;
    letter-spacing: 0.06em;
    color: #d9c6ea;
  }

  .row {
    height: 52px;
    background: rgba(8, 2, 16, 0.72);
    box-shadow: inset 0 0 0 2px #2a1248;
    animation: rowIn 0.45s steps(6, end) both;
    animation-delay: calc(var(--i) * 60ms);
  }

  .row.hot {
    box-shadow: inset 0 0 0 2px #ff4ad8, 0 0 16px rgba(255, 74, 216, 0.35);
  }

  .row.gold {
    box-shadow: inset 0 0 0 2px #ffe08a, 0 0 12px rgba(255, 74, 216, 0.25);
  }

  .row.silver {
    box-shadow: inset 0 0 0 2px #3de4ff;
  }

  .row.bronze {
    box-shadow: inset 0 0 0 2px #b388ff;
  }

  .cutline {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    gap: 10px;
    height: 18px;
  }

  .cutline i {
    flex: 1;
    height: 2px;
    background: #ff4ad8;
    box-shadow: 0 0 8px #ff4ad8;
  }

  .cutline span {
    font-family: "PressStart", monospace;
    font-size: 8px;
    letter-spacing: 0.14em;
    color: #ffd6f7;
    text-shadow: 0 0 8px #ff4ad8;
  }

  .rank,
  .num,
  .delta,
  .score {
    font-family: "PressStart", monospace;
    font-size: 13px;
    color: #f4fbff;
  }

  .gold .rank {
    color: #ffe7a8;
    text-shadow: 0 0 8px #ff4ad8;
  }

  .silver .rank {
    color: #bff7ff;
    text-shadow: 0 0 8px #3de4ff;
  }

  .bronze .rank {
    color: #e4d4ff;
  }

  .who {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }

  .who img {
    width: 28px;
    height: 28px;
    object-fit: contain;
    image-rendering: pixelated;
    filter: drop-shadow(0 0 4px #ff4ad8);
  }

  .who b {
    font-family: "Silkscreen", monospace;
    font-size: 16px;
    font-weight: 700;
    color: #fff;
    letter-spacing: 0.06em;
  }

  .who em {
    font-family: "Silkscreen", monospace;
    font-style: normal;
    font-size: 13px;
    color: #d9c6ea;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .form {
    display: flex;
    gap: 4px;
  }

  .form i {
    width: 14px;
    height: 14px;
    background: #241033;
    box-shadow: inset 0 0 0 1px #3a1858;
  }

  .form i.win {
    background: linear-gradient(#bffbff, #1498c0);
    box-shadow: 0 0 6px #3de4ff;
  }

  .form i.loss {
    background: linear-gradient(#ffb0f2, #d018b0);
    box-shadow: 0 0 6px #ff4ad8;
  }

  .num.dim {
    color: #9a86aa;
  }

  .delta.up {
    color: #bff7ff;
    text-shadow: 0 0 8px #3de4ff;
  }

  .delta.down {
    color: #ffb0f2;
    text-shadow: 0 0 8px #ff4ad8;
  }

  .meter {
    display: flex;
    gap: 3px;
  }

  .meter i {
    flex: 1;
    height: 12px;
    background: #241033;
    box-shadow: inset 0 0 0 1px #3a1858;
  }

  .meter i.on {
    background: linear-gradient(#d7b6ff, #7a3cff);
    box-shadow: 0 0 6px #8a5cff;
  }

  .gold .meter i.on {
    background: linear-gradient(#ffe7a8, #ff4ad8);
    box-shadow: 0 0 6px #ff4ad8;
  }

  .silver .meter i.on {
    background: linear-gradient(#bffbff, #1498c0);
    box-shadow: 0 0 6px #3de4ff;
  }

  .score {
    text-align: right;
    color: #fff6ff;
    text-shadow: -1px 0 #ff4ad8, 1px 0 #3de4ff;
  }

  @keyframes chroma {
    0%,
    100% {
      text-shadow: -2px 0 #ff4ad8, 2px 0 #3de4ff;
    }
    50% {
      text-shadow: -3px 0 #ff4ad8, 3px 0 #3de4ff, 0 0 12px #fff;
    }
  }

  @keyframes borderFlow {
    from {
      background-position: 0 0, 0% 50%;
    }
    to {
      background-position: 0 0, 200% 50%;
    }
  }

  @keyframes rise {
    0% {
      transform: translateY(16px) scale(0.4);
      opacity: 0;
    }
    18% {
      opacity: 0.9;
    }
    100% {
      transform: translateY(-280px) scale(1);
      opacity: 0;
    }
  }

  @keyframes nudge {
    0%,
    100% {
      transform: translateX(0);
    }
    50% {
      transform: translateX(-4px);
    }
  }

  @keyframes nudge-flip {
    0%,
    100% {
      transform: scaleX(-1) translateX(0);
    }
    50% {
      transform: scaleX(-1) translateX(-4px);
    }
  }

  @keyframes crest {
    0%,
    100% {
      filter: drop-shadow(0 0 6px #ff4ad8) brightness(1);
    }
    50% {
      filter: drop-shadow(0 0 12px #3de4ff) brightness(1.3);
    }
  }

  @keyframes drift {
    from {
      background-position: 0 0;
    }
    to {
      background-position: 120px 180px;
    }
  }

  @keyframes scan {
    0% {
      transform: translateY(-40px);
    }
    100% {
      transform: translateY(560px);
    }
  }

  @keyframes rowIn {
    0% {
      clip-path: inset(0 100% 0 0);
      opacity: 0;
    }
    100% {
      clip-path: inset(0 0 0 0);
      opacity: 1;
    }
  }

  @keyframes cardIn {
    0% {
      transform: translateY(16px);
      opacity: 0;
    }
    100% {
      transform: none;
      opacity: 1;
    }
  }
</style>
