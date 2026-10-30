<script>
  import { onMount } from "svelte";
  import io from "socket.io-client";

  const socket = io(`http://${location.hostname || "localhost"}:3001`, {
    reconnection: true,
    timeout: 3000,
  });

  const overlayUrl = `${location.origin}/#/alerts`;

  let nick = "";
  let team = "radiant";
  let connected = false;
  let status = "Жду оверлей";
  let copied = false;

  const spawns = [
    { label: "Рошан появился", title: "ROSHAN", subtitle: "SPAWNED", kind: "roshan" },
    { label: "Рошан убит", title: "ROSHAN", subtitle: "KILLED", kind: "roshan", withNick: true },
    { label: "Торментор", title: "TORMENTOR", subtitle: "SPAWNED", kind: "tormentor" },
    { label: "Лотус", title: "LOTUS", subtitle: "SPAWNED", kind: "lotus" },
    { label: "Руна на реке", title: "RUNE", subtitle: "SPAWNED", kind: "rune" },
  ];

  const pickups = [
    { label: "Wisdom", title: "WISDOM", kind: "wisdom" },
    { label: "Bounty", title: "BOUNTY", kind: "bounty" },
    { label: "Haste", title: "HASTE", kind: "rune" },
    { label: "Double Damage", title: "DOUBLE DAMAGE", kind: "rune" },
    { label: "Arcane", title: "ARCANE", kind: "rune" },
    { label: "Regen", title: "REGEN", kind: "rune" },
    { label: "Illusion", title: "ILLUSION", kind: "rune" },
    { label: "Invis", title: "INVIS", kind: "rune" },
    { label: "Aegis", title: "AEGIS", kind: "aegis" },
  ];

  function send(cue, pickup = false) {
    const name = nick.trim();
    const payload = {
      kind: cue.kind,
      title: cue.title,
      subtitle: cue.subtitle || "",
      detail: "",
      team: null,
      hero: "",
    };
    if (pickup) {
      payload.subtitle = name || "TAKEN";
      payload.team = name ? team : null;
    } else if (cue.withNick && name) {
      payload.subtitle = name;
      payload.detail = "KILLED";
      payload.team = team;
    }
    socket.emit("alert-cue", payload);
    status = connected ? `На оверлее: ${payload.title}` : "Сервер оверлея не подключён";
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(overlayUrl);
      copied = true;
      setTimeout(() => {
        copied = false;
      }, 1400);
    } catch (error) {
      status = overlayUrl;
    }
  }

  onMount(() => {
    const onConnect = () => {
      connected = true;
      status = "Оверлей на связи";
    };
    const onDisconnect = () => {
      connected = false;
      status = "Нет связи с сервером :3001";
    };
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    if (socket.connected) onConnect();
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  });
</script>

<div class="desk">
  <header>
    <div>
      <p>OBS</p>
      <h1>ПУльт</h1>
    </div>
    <button class="link" on:click={copyLink}>{copied ? "СКОПИРОВАНО" : "КОПИРОВАТЬ ИСТОЧНИК"}</button>
  </header>
  <code>{overlayUrl}</code>
  <p class="status" class:on={connected}>{status}</p>

  <section>
    <h2>Спавн и Рошан</h2>
    <div class="grid">
      {#each spawns as cue}
        <button on:click={() => send(cue)}>{cue.label}</button>
      {/each}
    </div>
  </section>

  <section>
    <h2>Кто забрал</h2>
    <div class="who">
      <input bind:value={nick} placeholder="Ник" maxlength="24" />
      <div class="teams">
        <button class:hot={team === "radiant"} on:click={() => (team = "radiant")}>RADIANT</button>
        <button class="dire" class:hot={team === "dire"} on:click={() => (team = "dire")}>DIRE</button>
      </div>
    </div>
    <div class="grid">
      {#each pickups as cue}
        <button on:click={() => send(cue, true)}>{cue.label}</button>
      {/each}
    </div>
  </section>
</div>

<style>
  .desk {
    min-height: 100vh;
    padding: 28px 32px 48px;
    background:
      radial-gradient(ellipse at 50% 0%, #2a0840, #12010f 58%);
    color: #fff6ff;
    font-family: "Silkscreen", monospace;
  }

  header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 16px;
  }

  header p {
    margin: 0;
    font-size: 12px;
    letter-spacing: 0.18em;
    color: #ff4ad8;
  }

  h1 {
    margin: 4px 0 0;
    font-family: "PressStart", monospace;
    font-size: 28px;
    font-weight: 400;
  }

  h2 {
    margin: 28px 0 12px;
    font-size: 14px;
    letter-spacing: 0.14em;
    color: #d7c4ef;
  }

  code {
    display: block;
    margin-top: 14px;
    color: #d9fbff;
    font-size: 13px;
  }

  .status {
    margin: 10px 0 0;
    font-size: 13px;
    color: #ffb0d8;
  }

  .status.on {
    color: #bffbff;
  }

  .link,
  .grid button,
  .teams button {
    border: 3px solid #ff4ad8;
    background: #14081c;
    color: #fff6ff;
    font-family: "Silkscreen", monospace;
    cursor: pointer;
  }

  .link {
    padding: 12px 16px;
    font-size: 13px;
  }

  .who {
    display: flex;
    gap: 10px;
    margin-bottom: 12px;
    flex-wrap: wrap;
  }

  input {
    flex: 1;
    min-width: 180px;
    padding: 12px 14px;
    border: 3px solid #3de4ff;
    background: #07030f;
    color: #fff;
    font-family: "Silkscreen", monospace;
    font-size: 16px;
  }

  .teams {
    display: flex;
  }

  .teams button {
    padding: 12px 14px;
    font-size: 13px;
  }

  .teams button.hot {
    background: #3de4ff;
    color: #071018;
  }

  .teams button.dire.hot {
    background: #ff4ad8;
    color: #1a0414;
    border-color: #ff4ad8;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 10px;
  }

  .grid button {
    min-height: 72px;
    font-size: 15px;
  }

  .grid button:active {
    transform: translateY(2px);
  }
</style>
