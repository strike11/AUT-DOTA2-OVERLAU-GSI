<script>
  import { onMount } from "svelte";
  import io from "socket.io-client";

  const EMPTY = "assets/items/black_image.png";
  const socket = io("http://localhost:3001", {
    reconnection: true,
    timeout: 3000,
  });

  const RADIANT_COLORS = ["#3074F9", "#66FFC0", "#BD00B7", "#F8F50A", "#FF6901"];
  const DIRE_COLORS = ["#FF88C5", "#A2B349", "#63DAFA", "#01831F", "#9F6B00"];

  function demo(partial) {
    return {
      alive: true,
      respawn: 0,
      hp: 100,
      mana: 50,
      denies: 0,
      gold: 0,
      xpm: 0,
      neutral: null,
      ...partial,
    };
  }

  const demoRadiant = [
    demo({
      id: "r0",
      name: "tOfu",
      hero: "muerta",
      level: 18,
      hp: 81,
      mana: 46,
      kills: 8,
      deaths: 2,
      assists: 11,
      lastHits: 246,
      denies: 14,
      netWorth: 21480,
      gold: 1860,
      gpm: 684,
      xpm: 712,
      items: ["item_power_treads", "item_magic_wand", "item_maelstrom", "item_black_king_bar", "item_butterfly", "item_ultimate_scepter"],
      neutral: "item_apex",
    }),
    demo({
      id: "r1",
      name: "Quinn",
      hero: "pangolier",
      level: 16,
      hp: 64,
      mana: 38,
      kills: 4,
      deaths: 3,
      assists: 14,
      lastHits: 168,
      denies: 6,
      netWorth: 16220,
      gold: 940,
      gpm: 548,
      xpm: 610,
      items: ["item_arcane_boots", "item_magic_wand", "item_blink", "item_lotus_orb", "item_force_staff", "item_pipe"],
      neutral: "item_ballista",
    }),
    demo({
      id: "r2",
      name: "Ace",
      hero: "lone_druid",
      level: 17,
      hp: 92,
      mana: 22,
      kills: 6,
      deaths: 1,
      assists: 8,
      lastHits: 312,
      denies: 21,
      netWorth: 24110,
      gold: 2210,
      gpm: 742,
      xpm: 668,
      items: ["item_phase_boots", "item_magic_wand", "item_diffusal_blade", "item_basher", "item_manta", "item_desolator"],
      neutral: "item_avianas_feather",
    }),
    demo({
      id: "r3",
      name: "Seleri",
      hero: "silencer",
      level: 14,
      hp: 55,
      mana: 71,
      kills: 3,
      deaths: 4,
      assists: 16,
      lastHits: 42,
      denies: 3,
      netWorth: 10940,
      gold: 610,
      gpm: 318,
      xpm: 490,
      items: ["item_arcane_boots", "item_magic_wand", "item_glimmer_cape", "item_force_staff", "item_aether_lens", "item_ghost"],
      neutral: null,
    }),
    demo({
      id: "r4",
      name: "dyrachyo",
      hero: "gyrocopter",
      level: 17,
      hp: 73,
      mana: 34,
      kills: 7,
      deaths: 2,
      assists: 9,
      lastHits: 287,
      denies: 9,
      netWorth: 19860,
      gold: 1430,
      gpm: 656,
      xpm: 640,
      items: ["item_power_treads", "item_magic_wand", "item_maelstrom", "item_black_king_bar", "item_sange_and_yasha", "item_butterfly"],
      neutral: "item_ballista",
    }),
  ];

  const demoDire = [
    demo({
      id: "d0",
      name: "Yatoro",
      hero: "weaver",
      level: 17,
      hp: 48,
      mana: 61,
      kills: 5,
      deaths: 3,
      assists: 7,
      lastHits: 274,
      denies: 11,
      netWorth: 18940,
      gold: 760,
      gpm: 602,
      xpm: 655,
      items: ["item_power_treads", "item_magic_wand", "item_diffusal_blade", "item_manta", "item_butterfly", "item_black_king_bar"],
      neutral: "item_apex",
    }),
    demo({
      id: "d1",
      name: "Miposhka",
      hero: "treant",
      level: 13,
      hp: 100,
      mana: 80,
      kills: 2,
      deaths: 5,
      assists: 12,
      lastHits: 28,
      denies: 2,
      netWorth: 8640,
      gold: 420,
      gpm: 276,
      xpm: 430,
      items: ["item_arcane_boots", "item_magic_wand", "item_mekansm", "item_glimmer_cape", "item_force_staff", null],
      neutral: null,
    }),
    demo({
      id: "d2",
      name: "Larl",
      hero: "puck",
      level: 16,
      alive: false,
      respawn: 24,
      hp: 0,
      mana: 0,
      kills: 6,
      deaths: 4,
      assists: 10,
      lastHits: 154,
      denies: 5,
      netWorth: 15110,
      gold: 330,
      gpm: 512,
      xpm: 598,
      items: ["item_travel_boots", "item_magic_wand", "item_blink", "item_black_king_bar", "item_sheepstick", "item_ultimate_scepter"],
      neutral: "item_avianas_feather",
    }),
    demo({
      id: "d3",
      name: "Collapse",
      hero: "beastmaster",
      level: 15,
      hp: 69,
      mana: 41,
      kills: 4,
      deaths: 3,
      assists: 9,
      lastHits: 196,
      denies: 8,
      netWorth: 14380,
      gold: 880,
      gpm: 470,
      xpm: 540,
      items: ["item_phase_boots", "item_magic_wand", "item_blink", "item_black_king_bar", "item_crimson_guard", "item_pipe"],
      neutral: "item_ballista",
    }),
    demo({
      id: "d4",
      name: "Mira",
      hero: "tusk",
      level: 14,
      hp: 88,
      mana: 27,
      kills: 4,
      deaths: 4,
      assists: 13,
      lastHits: 71,
      denies: 4,
      netWorth: 11260,
      gold: 540,
      gpm: 364,
      xpm: 505,
      items: ["item_phase_boots", "item_magic_wand", "item_blink", "item_desolator", "item_black_king_bar", null],
      neutral: null,
    }),
  ];

  let scale = 1;
  let live = false;
  let paused = false;
  let clock = 18 * 60 + 42;
  let radiantScore = 28;
  let direScore = 21;
  let radiant = demoRadiant;
  let dire = demoDire;

  function gold(value) {
    const n = Math.round(Number(value) || 0);
    if (Math.abs(n) >= 1000) {
      const k = n / 1000;
      return `${k >= 10 ? Math.round(k) : k.toFixed(1).replace(/\.0$/, "")}k`;
    }
    return String(n);
  }

  function formatClock(seconds) {
    const neg = seconds < 0;
    const s = Math.abs(Math.floor(Number(seconds) || 0));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${neg ? "-" : ""}${m}:${r < 10 ? "0" : ""}${r}`;
  }

  function heroLabel(hero) {
    return (hero || "").replace(/_/g, " ");
  }

  function itemSrc(slot) {
    if (!slot) return EMPTY;
    const name = typeof slot === "string" ? slot : slot.name;
    if (!name || name === "empty") return EMPTY;
    if (name === "item_bottle") {
      const rune = typeof slot === "object" ? slot.contains_rune : "";
      if (rune && rune !== "empty") return `assets/items/item_bottle_${rune}.png`;
      const charges = typeof slot === "object" ? Number(slot.charges) : 3;
      if (charges === 2) return "assets/items/item_bottle_2.png";
      if (charges === 1) return "assets/items/item_bottle_1.png";
      if (!charges) return "assets/items/item_bottle_empty.png";
      return "assets/items/item_bottle.png";
    }
    return `assets/items/${name}.png`;
  }

  function hideBroken(event) {
    event.currentTarget.style.visibility = "hidden";
  }

  function readTeam(data, team, start) {
    const out = [];
    for (let i = 0; i < 5; i += 1) {
      const slot = start + i;
      const player = data.player?.[`team${team}`]?.[`player${slot}`];
      const hero = data.hero?.[`team${team}`]?.[`player${slot}`];
      const items = data.items?.[`team${team}`]?.[`player${slot}`];
      if (!player || !hero?.name) continue;
      out.push({
        id: `${team}-${slot}`,
        name: player.name || "PLAYER",
        hero: String(hero.name).replace(/^npc_dota_hero_/, ""),
        level: Number(hero.level) || 1,
        alive: hero.alive !== false,
        respawn: Number(hero.respawn_seconds) || 0,
        hp: Number(hero.health_percent) || 0,
        mana: Number(hero.mana_percent) || 0,
        kills: Number(player.kills) || 0,
        deaths: Number(player.deaths) || 0,
        assists: Number(player.assists) || 0,
        lastHits: Number(player.last_hits) || 0,
        denies: Number(player.denies) || 0,
        netWorth: Number(player.net_worth) || 0,
        gold: Number(player.gold) || 0,
        gpm: Number(player.gpm) || 0,
        xpm: Number(player.xpm) || 0,
        items: ["slot0", "slot1", "slot2", "slot3", "slot4", "slot5"].map(
          (key) => items?.[key] || null
        ),
        neutral: items?.neutral0 || null,
      });
    }
    return out;
  }

  function fit() {
    scale = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
  }

  $: radiantNW = radiant.reduce((sum, player) => sum + player.netWorth, 0);
  $: direNW = dire.reduce((sum, player) => sum + player.netWorth, 0);
  $: share = radiantNW / (radiantNW + direNW || 1);

  socket.on("newdata", (data) => {
    if (!data?.player?.team2 || !data?.hero?.team2) return;
    const nextRadiant = readTeam(data, 2, 0);
    const nextDire = readTeam(data, 3, 5);
    if (!nextRadiant.length && !nextDire.length) return;
    live = true;
    paused = !!data.map?.paused;
    if (data.map) {
      clock = Number(data.map.clock_time) || 0;
      radiantScore = Number(data.map.radiant_score) || 0;
      direScore = Number(data.map.dire_score) || 0;
    }
    if (nextRadiant.length) radiant = nextRadiant;
    if (nextDire.length) dire = nextDire;
  });

  onMount(() => {
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  });
</script>

<div class="viewport">
  <div class="scaler" style="width: {1920 * scale}px; height: {1080 * scale}px;">
    <div class="stage" style="transform: scale({scale})">
      <img class="ghost" src="assets/uni/shield.png" alt="" />
      {#if !live}
        <div class="demo-chip">DEMO</div>
      {/if}
      {#if paused}
        <div class="pause-chip">PAUSED</div>
      {/if}

      <header class="top">
        <div class="side-name radiant">
          <img src="assets/uni/shield.png" alt="" />
          <div>
            <b>RADIANT</b>
            <span>NW {gold(radiantNW)}</span>
          </div>
        </div>

        <div class="plate">
          <img class="chev" src="assets/uni/chevron.png" alt="" />
          <div class="score rad">{radiantScore}</div>
          <div class="clock">{formatClock(clock)}</div>
          <div class="score dire">{direScore}</div>
          <img class="chev flip" src="assets/uni/chevron.png" alt="" />
        </div>

        <div class="side-name dire">
          <div>
            <b>DIRE</b>
            <span>NW {gold(direNW)}</span>
          </div>
          <img src="assets/uni/shield.png" alt="" />
        </div>
      </header>

      <div class="versus" aria-hidden="true">
        {#each Array(36) as _, i}
          <i class:rad={i / 36 < share} class:dire={i / 36 >= share}></i>
        {/each}
      </div>

      <div class="board">
        <section class="col radiant">
          {#each radiant as player, index (player.id)}
            <article class="row" class:dead={!player.alive}>
              <div class="portrait" style="--slot:{RADIANT_COLORS[index]}">
                <img
                  src="icons/{player.hero}.png"
                  alt={heroLabel(player.hero)}
                  on:error={hideBroken}
                />
                {#if !player.alive}
                  <div class="dead-tag">{player.respawn}s</div>
                {/if}
              </div>
              <div class="who">
                <strong>{player.name}</strong>
                <em>LV {player.level} {heroLabel(player.hero)}</em>
                <div class="bars">
                  <i class="hp" style="--p:{player.hp}%"></i>
                  <i class="mp" style="--p:{player.mana}%"></i>
                </div>
              </div>
              <div class="kda">
                <span class="k">{player.kills}</span>
                <span class="d">{player.deaths}</span>
                <span class="a">{player.assists}</span>
              </div>
              <div class="econ">
                <span><small>NW</small>{gold(player.netWorth)}</span>
                <span><small>LH</small>{player.lastHits}/{player.denies}</span>
                <span><small>GPM</small>{player.gpm}</span>
              </div>
              <div class="items">
                {#each player.items as slot, slotIndex (`${player.id}-i${slotIndex}`)}
                  <img src={itemSrc(slot)} alt="" on:error={hideBroken} />
                {/each}
                <img class="neutral" src={itemSrc(player.neutral)} alt="" on:error={hideBroken} />
              </div>
            </article>
          {/each}
        </section>

        <section class="col dire">
          {#each dire as player, index (player.id)}
            <article class="row dire-row" class:dead={!player.alive}>
              <div class="portrait" style="--slot:{DIRE_COLORS[index]}">
                <img
                  src="icons/{player.hero}.png"
                  alt={heroLabel(player.hero)}
                  on:error={hideBroken}
                />
                {#if !player.alive}
                  <div class="dead-tag">{player.respawn}s</div>
                {/if}
              </div>
              <div class="who">
                <strong>{player.name}</strong>
                <em>LV {player.level} {heroLabel(player.hero)}</em>
                <div class="bars">
                  <i class="hp" style="--p:{player.hp}%"></i>
                  <i class="mp" style="--p:{player.mana}%"></i>
                </div>
              </div>
              <div class="kda">
                <span class="k">{player.kills}</span>
                <span class="d">{player.deaths}</span>
                <span class="a">{player.assists}</span>
              </div>
              <div class="econ">
                <span><small>NW</small>{gold(player.netWorth)}</span>
                <span><small>LH</small>{player.lastHits}/{player.denies}</span>
                <span><small>GPM</small>{player.gpm}</span>
              </div>
              <div class="items">
                {#each player.items as slot, slotIndex (`${player.id}-i${slotIndex}`)}
                  <img src={itemSrc(slot)} alt="" on:error={hideBroken} />
                {/each}
                <img class="neutral" src={itemSrc(player.neutral)} alt="" on:error={hideBroken} />
              </div>
            </article>
          {/each}
        </section>
      </div>
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
      radial-gradient(ellipse at 50% 112%, rgba(255, 30, 140, 0.48), transparent 46%),
      radial-gradient(ellipse at 50% -10%, #34104e 0%, #12010f 62%);
  }

  .viewport::before {
    content: "";
    position: absolute;
    left: -10%;
    right: -10%;
    bottom: -8%;
    height: 58%;
    background-image:
      linear-gradient(rgba(255, 80, 180, 0.24) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 80, 180, 0.24) 1px, transparent 1px);
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
    box-sizing: border-box;
    padding: 28px 32px 26px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .stage::after {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: repeating-linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.13) 0 1px,
      transparent 1px 3px
    );
    mix-blend-mode: multiply;
  }

  .ghost {
    position: absolute;
    left: 50%;
    top: 42%;
    width: 280px;
    transform: translate(-50%, -50%);
    opacity: 0.06;
    image-rendering: pixelated;
    pointer-events: none;
  }

  .demo-chip,
  .pause-chip {
    position: absolute;
    top: 18px;
    left: 18px;
    z-index: 5;
    font-family: "PressStart", monospace;
    font-size: 10px;
    color: #ffd6f6;
    padding: 8px 10px 7px;
    background: rgba(10, 2, 18, 0.8);
    box-shadow: 0 0 0 2px #ff4ad8, 0 0 0 4px #120816;
  }

  .pause-chip {
    left: auto;
    right: 18px;
    color: #fff6c8;
    box-shadow: 0 0 0 2px #ffe08a, 0 0 0 4px #120816;
    animation: blink 0.7s steps(2, end) infinite;
  }

  .top {
    position: relative;
    z-index: 2;
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 18px;
    min-height: 92px;
  }

  .side-name {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .side-name img {
    width: 54px;
    height: 54px;
    object-fit: contain;
    image-rendering: pixelated;
  }

  .side-name.radiant img {
    filter: drop-shadow(0 0 8px #3de4ff);
  }

  .side-name.dire {
    justify-content: flex-end;
    text-align: right;
  }

  .side-name.dire img {
    filter: drop-shadow(0 0 8px #ff4ad8);
  }

  .side-name b,
  .side-name span {
    display: block;
  }

  .side-name b {
    font-family: "PressStart", monospace;
    font-size: 16px;
    font-weight: 400;
    letter-spacing: 0.08em;
    color: #f4fbff;
  }

  .radiant b {
    text-shadow: -1px 0 #3de4ff, 1px 0 #ff4ad8;
  }

  .dire b {
    text-shadow: -1px 0 #ff4ad8, 1px 0 #3de4ff;
  }

  .side-name span {
    margin-top: 6px;
    font-family: "Silkscreen", monospace;
    font-size: 14px;
    letter-spacing: 0.08em;
    color: #d9fbff;
  }

  .dire span {
    color: #ffd6f6;
  }

  .plate {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    background: rgba(6, 2, 14, 0.88);
    box-shadow: 0 0 0 2px #ff4ad8, 0 0 0 4px #120818, 0 0 0 6px #3de4ff,
      0 0 18px rgba(255, 74, 216, 0.45);
  }

  .chev {
    width: 28px;
    height: 36px;
    object-fit: contain;
    image-rendering: pixelated;
    filter: drop-shadow(0 0 6px #3de4ff);
  }

  .flip {
    transform: scaleX(-1);
    filter: drop-shadow(0 0 6px #ff4ad8);
  }

  .score,
  .clock {
    font-family: "PressStart", monospace;
    line-height: 1;
    color: #f7fbff;
  }

  .score {
    min-width: 2.2ch;
    text-align: center;
    font-size: 28px;
  }

  .score.rad {
    color: #bff7ff;
    text-shadow: 0 0 10px #3de4ff;
  }

  .score.dire {
    color: #ffd0f4;
    text-shadow: 0 0 10px #ff4ad8;
  }

  .clock {
    min-width: 5.2ch;
    text-align: center;
    font-size: 18px;
    animation: chroma 1.6s steps(2, end) infinite;
  }

  .versus {
    position: relative;
    z-index: 2;
    display: flex;
    gap: 3px;
    height: 14px;
  }

  .versus i {
    flex: 1;
    background: #241033;
    box-shadow: inset 0 0 0 1px #3a1858;
  }

  .versus i.rad {
    background: linear-gradient(#bffbff, #1498c0);
    box-shadow: 0 0 6px #3de4ff;
  }

  .versus i.dire {
    background: linear-gradient(#ffb0f2, #d018b0);
    box-shadow: 0 0 6px #ff4ad8;
  }

  .board {
    position: relative;
    z-index: 2;
    flex: 1;
    min-height: 0;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }

  .col {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
    padding: 8px;
    background:
      linear-gradient(#100618, #100618) padding-box,
      linear-gradient(180deg, #3de4ff, #8a5cff) border-box;
    border: 3px solid transparent;
    box-shadow: 0 0 0 2px #0a0412;
  }

  .col.dire {
    background:
      linear-gradient(#100618, #100618) padding-box,
      linear-gradient(180deg, #ff4ad8, #8a5cff) border-box;
  }

  .row {
    flex: 1;
    min-height: 0;
    display: grid;
    grid-template-columns: 132px minmax(0, 1.15fr) 132px 108px 196px;
    gap: 8px;
    align-items: center;
    padding: 6px;
    background: rgba(8, 2, 16, 0.78);
    box-shadow: inset 0 0 0 2px #123048;
  }

  .col.dire .row {
    box-shadow: inset 0 0 0 2px #2a1248;
  }

  .row.dire-row {
    direction: rtl;
  }

  .dire-row .portrait,
  .dire-row .who,
  .dire-row .kda,
  .dire-row .econ,
  .dire-row .items {
    direction: ltr;
    unicode-bidi: isolate;
  }

  .portrait {
    position: relative;
    height: 100%;
    overflow: hidden;
    background: #07030f;
    box-shadow: inset 4px 0 0 var(--slot), 0 0 0 2px #3de4ff;
  }

  .col.dire .portrait {
    box-shadow: inset -4px 0 0 var(--slot), 0 0 0 2px #ff4ad8;
  }

  .portrait img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: center center;
    image-rendering: pixelated;
    padding: 4px;
    box-sizing: border-box;
    display: block;
  }

  .dead .portrait img {
    filter: grayscale(1) brightness(0.45);
  }

  .dead-tag {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    font-family: "PressStart", monospace;
    font-size: 12px;
    color: #fff;
    background: rgba(8, 0, 16, 0.82);
    padding: 5px 6px 4px;
    box-shadow: 0 0 0 2px #ff4ad8;
  }

  .who {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .dire-row .who {
    align-items: flex-end;
    text-align: right;
  }

  .who strong {
    font-family: "Silkscreen", monospace;
    font-size: 18px;
    font-weight: 700;
    letter-spacing: 0.04em;
    color: #fff;
    text-shadow: -1px 0 #ff4ad8, 1px 0 #3de4ff;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }

  .who em {
    font-family: "Silkscreen", monospace;
    font-style: normal;
    font-size: 12px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #d9c6ea;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }

  .bars {
    display: flex;
    flex-direction: column;
    gap: 3px;
    width: 100%;
    margin-top: 2px;
  }

  .dire-row .bars {
    align-items: flex-end;
  }

  .bars i {
    display: block;
    width: 100%;
    height: 6px;
    background: #241033;
    box-shadow: inset 0 0 0 1px #3a1858;
    position: relative;
    overflow: hidden;
  }

  .bars i::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: var(--p);
  }

  .dire-row .bars i::before {
    left: auto;
    right: 0;
  }

  .hp::before {
    background: linear-gradient(#d7ffb0, #3ecf4a);
    box-shadow: 0 0 6px #3ecf4a;
  }

  .dead .hp::before {
    width: 0;
  }

  .mp::before {
    background: linear-gradient(#d9e6ff, #3d7bff);
    box-shadow: 0 0 6px #3d7bff;
  }

  .kda {
    display: flex;
    justify-content: center;
    gap: 8px;
    font-family: "PressStart", monospace;
    font-size: 14px;
  }

  .k {
    color: #bff7ff;
    text-shadow: 0 0 8px #3de4ff;
  }

  .d {
    color: #ffb0f2;
    text-shadow: 0 0 8px #ff4ad8;
  }

  .a {
    color: #e4d4ff;
  }

  .econ {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-family: "Silkscreen", monospace;
    font-size: 13px;
    color: #f4e9ff;
  }

  .econ span {
    display: flex;
    align-items: baseline;
    gap: 6px;
  }

  .dire-row .econ {
    align-items: flex-end;
  }

  .econ small {
    font-size: 10px;
    color: #9a86aa;
  }

  .items {
    display: grid;
    grid-template-columns: repeat(3, 42px) 36px;
    grid-template-rows: 32px 32px;
    gap: 4px;
    align-content: center;
    justify-content: end;
  }

  .dire-row .items {
    justify-content: start;
  }

  .items img {
    width: 42px;
    height: 32px;
    object-fit: cover;
    background: #07030f;
    box-shadow: 0 0 0 1px #3a1858;
  }

  .items .neutral {
    grid-column: 4;
    grid-row: 1 / span 2;
    width: 36px;
    height: 68px;
    object-fit: cover;
    box-shadow: 0 0 0 2px #ffe08a;
  }

  @keyframes chroma {
    0%,
    100% {
      text-shadow: -2px 0 #ff4ad8, 2px 0 #3de4ff;
    }
    50% {
      text-shadow: -3px 0 #ff4ad8, 3px 0 #3de4ff, 0 0 10px #fff;
    }
  }

  @keyframes blink {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.45;
    }
  }
</style>
