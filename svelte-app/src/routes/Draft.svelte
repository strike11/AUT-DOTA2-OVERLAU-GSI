<script>
  import { onMount } from "svelte";
  import io from "socket.io-client";
  import HeroPick2 from "../components/HeroPick2.svelte";
  import HeroBans2 from "../components/HeroBans2.svelte";
  import CenterScreen2 from "../components/CenterScreen2.svelte";
  import LastAction from "../components/LastAction.svelte";
  import {
    playBan,
    playExpire,
    playLock,
    playPick,
    playTick,
    playTurn,
    unlockAudio,
  } from "../lib/sounds.js";

  const socket = io("http://localhost:3001", {
    reconnection: true,
    timeout: 3000,
  });

  const RESERVE_MAX = 130;
  const DEMO_TURN = 12;
  const OPENING_TURN = 5;
  const REVEAL_HOLD = 1300;
  const REVEAL_RELEASE = 580;
  const REVEAL_DONE = 800;

  let live = false;
  let scale = 1;
  let stageEl;
  let activeTeam = "radiant";
  let phase = "ban";
  let seconds = OPENING_TURN;
  let radiantReserve = 78;
  let direReserve = 46;

  let radiantPicks = ["muerta", "pangolier", "lone_druid", null, null];
  let direPicks = ["weaver", "treant", "puck", null, null];
  let radiantBans = [
    "bristleback",
    "spirit_breaker",
    "magnataur",
    "primal_beast",
    "grimstroke",
    "dark_willow",
    null,
  ];
  let direBans = [
    "chen",
    "chaos_knight",
    "kunkka",
    "bloodseeker",
    "furion",
    "terrorblade",
    null,
  ];

  const demoScript = [
    { team: "radiant", kind: "ban", hero: "invoker" },
    { team: "dire", kind: "ban", hero: "morphling" },
    { team: "radiant", kind: "pick", hero: "silencer" },
    { team: "dire", kind: "pick", hero: "beastmaster" },
    { team: "radiant", kind: "pick", hero: "gyrocopter" },
    { team: "dire", kind: "pick", hero: "tusk" },
  ];
  let scriptIndex = 0;
  let demoHold = false;

  const demoNicks = {
    muerta: "tOfu",
    pangolier: "Quinn",
    lone_druid: "Ace",
    silencer: "Seleri",
    gyrocopter: "dyrachyo",
    weaver: "Yatoro",
    treant: "Miposhka",
    puck: "Larl",
    beastmaster: "Collapse",
    tusk: "Mira",
  };

  let nickMap = { ...demoNicks };
  let soundBaseline = null;
  let soundSilent = false;
  let soundOn = false;
  let actionBaseline = null;
  let actionSilent = false;
  let actionLive = false;
  let actionSeq = 1;
  let actionQueue = [];
  let actionStarting = false;
  let concealed = {};
  let landed = "";
  let reveal = null;
  let revealPhase = "in";
  let fly = { x: 0, y: 0, w: 300, h: 300, dx: 0, dy: 0, s: 1 };
  let holdTimer = 0;
  let releaseTimer = 0;
  let doneTimer = 0;

  function nicksFromState(data) {
    const map = {};
    for (const team of ["team2", "team3"]) {
      const players = data?.player?.[team];
      const heroes = data?.hero?.[team];
      if (!players || !heroes) continue;
      for (const key of Object.keys(heroes)) {
        const heroName = heroes[key]?.name || "";
        const cls = heroName.replace(/^npc_dota_hero_/, "");
        const nick = players[key]?.name;
        if (cls && nick) map[cls] = nick;
      }
    }
    return map;
  }

  function formatTime(value) {
    const s = Math.max(0, Math.floor(Number(value) || 0));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${r < 10 ? "0" : ""}${r}`;
  }

  function firstEmpty(list) {
    return list.findIndex((slot) => !slot);
  }

  function slots(team, key, count) {
    const out = [];
    for (let i = 0; i < count; i += 1) {
      out.push(team?.[`${key}${i}_class`] || null);
    }
    return out;
  }

  function resetDemo() {
    soundSilent = true;
    actionSilent = true;
    demoHold = false;
    clearReveal();
    radiantPicks = ["muerta", "pangolier", "lone_druid", null, null];
    direPicks = ["weaver", "treant", "puck", null, null];
    radiantBans = [
      "bristleback",
      "spirit_breaker",
      "magnataur",
      "primal_beast",
      "grimstroke",
      "dark_willow",
      null,
    ];
    direBans = [
      "chen",
      "chaos_knight",
      "kunkka",
      "bloodseeker",
      "furion",
      "terrorblade",
      null,
    ];
    scriptIndex = 0;
    activeTeam = "radiant";
    phase = "ban";
    seconds = DEMO_TURN;
    radiantReserve = 78;
    direReserve = 46;
  }

  function writeSlot(step) {
    const kind = step.kind === "ban" ? "Bans" : "Picks";
    const current =
      step.team === "radiant"
        ? kind === "Bans"
          ? radiantBans
          : radiantPicks
        : kind === "Bans"
          ? direBans
          : direPicks;
    const index = firstEmpty(current);
    if (index === -1) return;
    const next = [...current];
    next[index] = step.hero;
    if (step.team === "radiant" && kind === "Picks") radiantPicks = next;
    if (step.team === "dire" && kind === "Picks") direPicks = next;
    if (step.team === "radiant" && kind === "Bans") radiantBans = next;
    if (step.team === "dire" && kind === "Bans") direBans = next;
  }

  function advanceDemo() {
    if (scriptIndex >= demoScript.length) return;
    writeSlot(demoScript[scriptIndex]);
    scriptIndex += 1;
    const next = demoScript[scriptIndex];
    if (!next) {
      demoHold = true;
      playLock();
      setTimeout(() => {
        if (!live) resetDemo();
      }, 2200);
      return;
    }
    activeTeam = next.team;
    phase = next.kind;
    seconds = DEMO_TURN;
  }

  function consumeSounds() {
    const next = {
      picks: [...radiantPicks, ...direPicks],
      bans: [...radiantBans, ...direBans],
      team: activeTeam,
      phase,
      seconds,
    };
    if (soundSilent || !soundBaseline) {
      soundBaseline = next;
      soundSilent = false;
      return;
    }
    const prev = soundBaseline;
    const newPicks = next.picks.filter((hero, index) => hero && hero !== prev.picks[index]).length;
    const newBans = next.bans.filter((hero, index) => hero && hero !== prev.bans[index]).length;
    if (newBans) playBan();
    if (newPicks) playPick();
    if (next.team !== prev.team) {
      const team = next.team;
      if (newPicks || newBans) setTimeout(() => playTurn(team), 460);
      else playTurn(team);
    }
    if (
      next.seconds < prev.seconds &&
      next.seconds > 0 &&
      next.seconds <= 5 &&
      !newPicks &&
      !newBans
    ) {
      playTick(next.seconds);
    }
    if (prev.seconds > 0 && next.seconds === 0 && !newPicks && !newBans) playExpire();
    soundBaseline = next;
  }

  function slotKey(kind, team, index) {
    return `${kind}-${team}-${index}`;
  }

  function measure(name) {
    if (!stageEl) return null;
    const el = stageEl.querySelector(`[data-slot="${name}"], [data-row="${name}"]`);
    if (!el) return null;
    const stage = stageEl.getBoundingClientRect();
    const box = el.getBoundingClientRect();
    const s = scale || 1;
    return {
      x: (box.left - stage.left) / s,
      y: (box.top - stage.top) / s,
      w: box.width / s,
      h: box.height / s,
    };
  }

  function placeAbove(ev) {
    const size = ev.kind === "pick" ? 500 : 360;
    const row = measure(`picks-${ev.team}`);
    const slot = measure(slotKey(ev.kind, ev.team, ev.index));
    const anchor = slot || row;
    let x = ev.team === "dire" ? 1920 - size - 80 : 80;
    if (anchor) x = anchor.x + anchor.w / 2 - size / 2;
    if (row) x = Math.max(row.x, Math.min(row.x + row.w - size, x));
    x = Math.max(16, Math.min(1920 - size - 16, x));
    const headerTop = row ? row.y - 36 : 820;
    const y = ev.kind === "pick"
      ? Math.min(48, Math.max(36, headerTop - size - 28))
      : Math.max(24, headerTop - size - 12);
    return { x, y, w: size, h: size, dx: 0, dy: 0, s: 1 };
  }

  function clearTimers() {
    clearTimeout(holdTimer);
    clearTimeout(releaseTimer);
    clearTimeout(doneTimer);
  }

  function clearReveal() {
    clearTimers();
    actionQueue = [];
    actionStarting = false;
    reveal = null;
    revealPhase = "in";
    concealed = {};
    landed = "";
  }

  function releaseSlot(ev) {
    const key = slotKey(ev.kind, ev.team, ev.index);
    if (concealed[key]) {
      const next = { ...concealed };
      delete next[key];
      concealed = next;
    }
    landed = key;
    setTimeout(() => {
      if (landed === key) landed = "";
    }, 420);
  }

  function finishReveal(ev) {
    releaseSlot(ev);
    if (reveal && reveal.id === ev.id) {
      reveal = null;
      revealPhase = "in";
    }
    pumpReveal();
  }

  function beginDrop(ev, start) {
    if (!reveal || reveal.id !== ev.id) return;
    const land = measure(slotKey(ev.kind, ev.team, ev.index));
    if (land) {
      const scx = start.x + start.w / 2;
      const scy = start.y + start.h / 2;
      const tcx = land.x + land.w / 2;
      const tcy = land.y + land.h / 2;
      const s = (ev.kind === "ban" ? land.h : Math.min(land.w, land.h)) / start.w;
      fly = {
        ...start,
        dx: tcx - scx,
        dy: tcy - scy,
        s: Math.max(0.12, s),
      };
    } else {
      fly = { ...start, dx: 0, dy: 180, s: 0.28 };
    }
    revealPhase = "down";
    releaseTimer = setTimeout(() => releaseSlot(ev), REVEAL_RELEASE);
    doneTimer = setTimeout(() => finishReveal(ev), REVEAL_DONE);
  }

  function pumpReveal() {
    if (reveal || actionStarting || !actionQueue.length) return;
    const ev = actionQueue[0];
    actionStarting = true;
    requestAnimationFrame(() => {
      actionStarting = false;
      if (reveal || !actionQueue.length || actionQueue[0] !== ev) return;
      actionQueue = actionQueue.slice(1);
      const start = placeAbove(ev);
      reveal = ev;
      fly = start;
      revealPhase = "in";
      clearTimers();
      holdTimer = setTimeout(() => beginDrop(ev, start), REVEAL_HOLD);
    });
  }

  function presentMany(events) {
    if (!events.length) return;
    const nextHidden = { ...concealed };
    for (const ev of events) nextHidden[slotKey(ev.kind, ev.team, ev.index)] = true;
    concealed = nextHidden;
    actionQueue = actionQueue.concat(events);
    pumpReveal();
  }

  function actionSnapshot() {
    return {
      radiantPicks: [...radiantPicks],
      direPicks: [...direPicks],
      radiantBans: [...radiantBans],
      direBans: [...direBans],
    };
  }

  function consumeActions() {
    const next = actionSnapshot();
    if (actionSilent || !actionBaseline || (live && !actionLive)) {
      actionBaseline = next;
      actionSilent = false;
      if (live) {
        actionLive = true;
        clearReveal();
      }
      return;
    }
    const pairs = [
      ["pick", "radiant", actionBaseline.radiantPicks, next.radiantPicks],
      ["pick", "dire", actionBaseline.direPicks, next.direPicks],
      ["ban", "radiant", actionBaseline.radiantBans, next.radiantBans],
      ["ban", "dire", actionBaseline.direBans, next.direBans],
    ];
    const events = [];
    for (const [kind, team, prev, curr] of pairs) {
      for (let i = 0; i < curr.length; i += 1) {
        if (curr[i] && curr[i] !== prev[i]) {
          events.push({
            id: actionSeq++,
            kind,
            team,
            index: i,
            hero: curr[i],
            nick: kind === "pick" ? nickMap[curr[i]] || "" : "",
          });
        }
      }
    }
    actionBaseline = next;
    presentMany(events);
  }

  function fit() {
    scale = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
  }

  socket.on("newdata", (data) => {
    const draft = data?.draft;
    if (!draft?.team2 || !draft?.team3) return;
    live = true;
    phase = draft.pick ? "pick" : "ban";
    if (draft.activeteam === 2) activeTeam = "radiant";
    else if (draft.activeteam === 3) activeTeam = "dire";
    seconds = Number(draft.activeteam_time_remaining) || 0;
    radiantReserve = Number(draft.radiant_bonus_time) || 0;
    direReserve = Number(draft.dire_bonus_time) || 0;
    radiantPicks = slots(draft.team2, "pick", 5);
    direPicks = slots(draft.team3, "pick", 5);
    radiantBans = slots(draft.team2, "ban", 7);
    direBans = slots(draft.team3, "ban", 7);
    const mapped = nicksFromState(data);
    if (Object.keys(mapped).length) nickMap = mapped;
  });

  $: clock = formatTime(seconds);
  $: phaseLabel = phase === "pick" ? "PICK" : "BAN";
  $: radiantActivePick =
    phase === "pick" && activeTeam === "radiant" ? firstEmpty(radiantPicks) : -1;
  $: direActivePick =
    phase === "pick" && activeTeam === "dire" ? firstEmpty(direPicks) : -1;
  $: radiantActiveBan =
    phase === "ban" && activeTeam === "radiant" ? firstEmpty(radiantBans) : -1;
  $: direActiveBan =
    phase === "ban" && activeTeam === "dire" ? firstEmpty(direBans) : -1;
  $: soundSignature = [
    radiantPicks.join("|"),
    direPicks.join("|"),
    radiantBans.join("|"),
    direBans.join("|"),
    activeTeam,
    phase,
    seconds,
  ].join("~");
  $: if (soundSignature) {
    consumeSounds();
    consumeActions();
  }

  onMount(() => {
    fit();
    unlockAudio().then((ok) => {
      soundOn = ok;
    });
    const armSound = () => {
      if (soundOn) return;
      unlockAudio().then((ok) => {
        soundOn = ok;
      });
    };
    window.addEventListener("resize", fit);
    window.addEventListener("pointerdown", armSound);
    const intro = setTimeout(() => {
      if (live) return;
      playPick();
      presentMany([
        {
          id: actionSeq++,
          kind: "pick",
          team: "dire",
          index: 2,
          hero: "puck",
          nick: nickMap.puck || "Larl",
        },
      ]);
    }, 700);
    const timer = setInterval(() => {
      if (live || demoHold) return;
      seconds -= 1;
      if (activeTeam === "radiant" && radiantReserve > 0 && seconds < 0) {
        radiantReserve -= 1;
      }
      if (activeTeam === "dire" && direReserve > 0 && seconds < 0) {
        direReserve -= 1;
      }
      if (seconds <= 0) advanceDemo();
    }, 1000);
    return () => {
      clearInterval(timer);
      clearTimeout(intro);
      clearReveal();
      window.removeEventListener("resize", fit);
      window.removeEventListener("pointerdown", armSound);
    };
  });
</script>

<div class="viewport" class:demo={!live}>
  <div class="scaler" style="width: {1920 * scale}px; height: {1080 * scale}px;">
  <div class="stage" bind:this={stageEl} style="transform: scale({scale})">
    {#if !live}
      <img class="ghost-shield" src="assets/uni/shield.png" alt="" />
    {/if}
    {#if reveal}
      {#key reveal.id}
        <LastAction
          hero={reveal.hero}
          nick={reveal.nick}
          team={reveal.team}
          kind={reveal.kind}
          phase={revealPhase}
          box={fly}
        />
      {/key}
    {/if}

    <div class="hud">
      <section class="side radiant" class:hot={activeTeam === "radiant"}>
        <header class="team-head">
          <img src="assets/uni/shield.png" alt="" />
          <span>RADIANT</span>
        </header>
        <div class="picks" data-row="picks-radiant">
          {#each radiantPicks as pick, index (`r-${index}`)}
            <div class="slot" class:land={landed === `pick-radiant-${index}`} data-slot="pick-radiant-{index}">
              <HeroPick2
                hero={concealed[`pick-radiant-${index}`] ? null : pick}
                nick={pick ? nickMap[pick] || "" : ""}
                active={index === radiantActivePick && !concealed[`pick-radiant-${index}`]}
              />
            </div>
          {/each}
        </div>
        <div class="bans">
          {#each radiantBans as ban, index (`rb-${index}`)}
            <div class="slot" class:land={landed === `ban-radiant-${index}`} data-slot="ban-radiant-{index}">
              <HeroBans2
                hero={concealed[`ban-radiant-${index}`] ? null : ban}
                active={index === radiantActiveBan && !concealed[`ban-radiant-${index}`]}
              />
            </div>
          {/each}
        </div>
        <div class="reserve">
          <div class="reserve-top">
            <span>RESERVE</span>
            <b>{formatTime(radiantReserve)}</b>
          </div>
          <div class="segs">
            {#each Array(14) as _, i}
              <i class:on={i < Math.round((radiantReserve / RESERVE_MAX) * 14)}></i>
            {/each}
          </div>
        </div>
      </section>

      <div class="core">
        <CenterScreen2 {seconds} {clock} turn={activeTeam} phase={phaseLabel} />
      </div>

      <section class="side dire" class:hot={activeTeam === "dire"}>
        <header class="team-head">
          <span>DIRE</span>
          <img src="assets/uni/shield.png" alt="" />
        </header>
        <div class="picks" data-row="picks-dire">
          {#each direPicks as pick, index (`d-${index}`)}
            <div class="slot" class:land={landed === `pick-dire-${index}`} data-slot="pick-dire-{index}">
              <HeroPick2
                hero={concealed[`pick-dire-${index}`] ? null : pick}
                nick={pick ? nickMap[pick] || "" : ""}
                active={index === direActivePick && !concealed[`pick-dire-${index}`]}
              />
            </div>
          {/each}
        </div>
        <div class="bans">
          {#each direBans as ban, index (`db-${index}`)}
            <div class="slot" class:land={landed === `ban-dire-${index}`} data-slot="ban-dire-{index}">
              <HeroBans2
                hero={concealed[`ban-dire-${index}`] ? null : ban}
                active={index === direActiveBan && !concealed[`ban-dire-${index}`]}
              />
            </div>
          {/each}
        </div>
        <div class="reserve">
          <div class="reserve-top">
            <span>RESERVE</span>
            <b>{formatTime(direReserve)}</b>
          </div>
          <div class="segs">
            {#each Array(14) as _, i}
              <i class:on={i < Math.round((direReserve / RESERVE_MAX) * 14)}></i>
            {/each}
          </div>
        </div>
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
    display: flex;
    align-items: flex-end;
    justify-content: center;
    background: transparent;
  }

  .viewport.demo {
    background:
      radial-gradient(ellipse at 50% 108%, rgba(255, 30, 140, 0.55), transparent 42%),
      radial-gradient(ellipse at 50% 0%, #2a0840 0%, #12010f 58%);
  }

  .viewport.demo::before {
    content: "";
    position: absolute;
    left: -10%;
    right: -10%;
    bottom: -8%;
    height: 58%;
    background-image:
      linear-gradient(rgba(255, 80, 180, 0.28) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 80, 180, 0.28) 1px, transparent 1px);
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
  }

  .ghost-shield {
    position: absolute;
    left: 50%;
    top: 18%;
    width: 280px;
    transform: translateX(-50%);
    opacity: 0.09;
    image-rendering: pixelated;
    filter: drop-shadow(0 0 24px #ff4ad8);
    pointer-events: none;
  }

  .hud {
    position: absolute;
    left: 28px;
    right: 28px;
    bottom: 0;
    height: 430px;
    display: grid;
    grid-template-columns: minmax(0, 1fr) 300px minmax(0, 1fr);
    gap: 16px;
    align-items: end;
    z-index: 2;
  }

  .hud::before {
    content: "";
    position: absolute;
    left: -8px;
    right: -8px;
    bottom: 0;
    height: 268px;
    z-index: -1;
    background:
      linear-gradient(#100618, #100618) padding-box,
      linear-gradient(90deg, #ff4ad8, #8a5cff, #3de4ff, #ff4ad8) border-box;
    background-size: auto, 220% 100%;
    border: 3px solid transparent;
    box-shadow: 0 0 0 2px #0a0412, inset 0 0 40px rgba(90, 20, 140, 0.35),
      0 -18px 40px rgba(255, 40, 160, 0.12);
    animation: borderFlow 5s linear infinite;
  }

  .hud::after {
    content: "";
    position: absolute;
    left: -8px;
    right: -8px;
    bottom: 0;
    height: 268px;
    pointer-events: none;
    background: repeating-linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.18) 0 1px,
      transparent 1px 3px
    );
    mix-blend-mode: multiply;
  }

  .side {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
    position: relative;
  }

  .team-head {
    display: flex;
    align-items: center;
    gap: 8px;
    height: 28px;
    font-family: "PressStart", monospace;
    font-size: 11px;
    letter-spacing: 0.06em;
    color: #d9fbff;
    text-shadow: -1px 0 #3de4ff, 1px 0 #ff4ad8;
  }

  .team-head img {
    height: 26px;
    width: auto;
    image-rendering: pixelated;
    filter: drop-shadow(0 0 6px #3de4ff);
  }

  .dire .team-head {
    justify-content: flex-end;
    color: #ffd6f6;
  }

  .dire .team-head img {
    filter: drop-shadow(0 0 6px #ff4ad8);
  }

  .hot .team-head span {
    animation: hotText 1s steps(2, end) infinite;
  }

  .picks,
  .bans {
    display: grid;
    gap: 8px;
  }

  .slot {
    min-width: 0;
  }

  .slot.land {
    animation: landFlash 0.4s steps(3, end);
  }

  .picks {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }

  .bans {
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: 5px;
  }

  .dire .picks,
  .dire .bans,
  .dire .segs {
    direction: rtl;
  }

  .dire .picks > :global(*),
  .dire .bans > :global(*),
  .dire .segs > :global(*) {
    direction: ltr;
  }

  .reserve {
    display: flex;
    flex-direction: column;
    gap: 5px;
    padding: 6px 8px 7px;
    background: rgba(8, 2, 16, 0.88);
    box-shadow: inset 0 0 0 2px #2a1248, 0 0 0 2px #ff4ad8;
  }

  .dire .reserve {
    box-shadow: inset 0 0 0 2px #123048, 0 0 0 2px #3de4ff;
  }

  .reserve-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-family: "Silkscreen", monospace;
    font-size: 11px;
    letter-spacing: 0.08em;
    color: #f4e9ff;
  }

  .dire .reserve-top {
    direction: rtl;
  }

  .dire .reserve-top span,
  .dire .reserve-top b {
    direction: ltr;
  }

  .reserve-top b {
    font-family: "PressStart", monospace;
    font-size: 11px;
    font-weight: 400;
    color: #bff7ff;
    text-shadow: 0 0 8px #3de4ff;
  }

  .dire .reserve-top b {
    color: #ffd0f4;
    text-shadow: 0 0 8px #ff4ad8;
  }

  .segs {
    display: flex;
    gap: 3px;
  }

  .segs i {
    flex: 1;
    height: 8px;
    background: #241033;
    box-shadow: inset 0 0 0 1px #3a1858;
  }

  .radiant .segs i.on {
    background: linear-gradient(#bffbff, #1498c0);
    box-shadow: 0 0 6px #3de4ff;
  }

  .dire .segs i.on {
    background: linear-gradient(#ffb0f2, #d018b0);
    box-shadow: 0 0 6px #ff4ad8;
  }

  .core {
    height: 430px;
    position: relative;
    z-index: 3;
  }

  .hot.radiant .picks {
    filter: drop-shadow(0 0 10px rgba(61, 228, 255, 0.25));
  }

  .hot.dire .picks {
    filter: drop-shadow(0 0 10px rgba(255, 74, 216, 0.28));
  }

  @keyframes borderFlow {
    from {
      background-position: 0 0, 0% 50%;
    }
    to {
      background-position: 0 0, 200% 50%;
    }
  }

  @keyframes landFlash {
    0% {
      filter: brightness(2.1);
    }
    100% {
      filter: none;
    }
  }

  @keyframes hotText {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.55;
    }
  }
</style>
