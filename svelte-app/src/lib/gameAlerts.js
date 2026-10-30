const WISDOM_FIRST = 7 * 60;
const WISDOM_EVERY = 7 * 60;
const WISDOM_WINDOW = 50;
const TORMENTOR_FIRST = 20 * 60;
const TORMENTOR_EVERY = 10 * 60;

const RUNE_TITLES = {
  double_damage: "DOUBLE DAMAGE",
  haste: "HASTE",
  illusion: "ILLUSION",
  invisibility: "INVIS",
  invis: "INVIS",
  regen: "REGEN",
  arcane: "ARCANE",
  shield: "SHIELD",
  water: "WATER",
  bounty: "BOUNTY",
};

let seq = 1;

function nextId() {
  seq += 1;
  return seq;
}

function heroClass(name) {
  return (name || "").replace(/^npc_dota_hero_/, "");
}

function prettyHero(hero) {
  return hero ? hero.replace(/_/g, " ").toUpperCase() : "";
}

function bottleRune(data, teamKey, index) {
  const items = data?.items?.[teamKey]?.[`player${index}`];
  if (!items) return "";
  for (const key of Object.keys(items)) {
    if (!key.startsWith("slot")) continue;
    const rune = items[key]?.contains_rune;
    if (rune && rune !== "empty") return rune;
  }
  return "";
}

function playersFrom(data) {
  const out = [];
  const sides = [
    ["team2", "radiant", 0],
    ["team3", "dire", 5],
  ];
  for (const [teamKey, team, base] of sides) {
    const group = data?.player?.[teamKey];
    if (!group) continue;
    for (let index = 0; index < 5; index += 1) {
      const raw = group[`player${index}`];
      if (!raw) continue;
      const hero = heroClass(data?.hero?.[teamKey]?.[`player${index}`]?.name);
      out.push({
        key: `${teamKey}-${index}`,
        id: base + index,
        teamSlot: index,
        team,
        name: raw.name || "",
        runes: Number(raw.runes_activated) || 0,
        hero,
        bottle: bottleRune(data, teamKey, index),
      });
    }
  }
  return out;
}

function findPlayer(players, id, team) {
  if (id == null || id === "") return null;
  const n = Number(id);
  if (Number.isNaN(n)) return null;
  if (team) {
    const side = players.filter((player) => player.team === team);
    const hit = side.find((player) => player.teamSlot === n || player.id === n);
    if (hit) return hit;
  }
  return players.find((player) => player.id === n) || null;
}

function eventKey(event) {
  return [
    event.event_type,
    event.game_time,
    event.player_id,
    event.killer_player_id,
    event.owning_player_id,
  ].join(":");
}

function wisdomSpawn(clock) {
  if (clock < WISDOM_FIRST) return -1;
  const step = Math.floor((clock - WISDOM_FIRST) / WISDOM_EVERY);
  return WISDOM_FIRST + step * WISDOM_EVERY;
}

function tormentorMark(clock) {
  if (clock < TORMENTOR_FIRST) return -1;
  return Math.floor((clock - TORMENTOR_FIRST) / TORMENTOR_EVERY);
}

function hasMiniboss(data) {
  const minimap = data?.minimap;
  if (!minimap) return false;
  return Object.values(minimap).some((point) => {
    const name = `${point?.unitname || ""} ${point?.image || ""}`.toLowerCase();
    return name.includes("miniboss") || name.includes("tormentor");
  });
}

function card(kind, title, player, detail) {
  return {
    id: nextId(),
    kind,
    title,
    subtitle: player?.name || detail || "",
    detail: player ? prettyHero(player.hero) : detail || "",
    team: player?.team || null,
    hero: player?.hero || "",
  };
}

export function createAlertTracker() {
  let ready = false;
  let roshan = null;
  let runes = {};
  let bottles = {};
  let seenEvents = new Set();
  let wisdomCount = {};
  let tormentor = null;
  let miniboss = false;
  let lastTormentorAt = -9999;

  function announceTormentor(alerts, clock) {
    if (clock - lastTormentorAt < 25) return;
    lastTormentorAt = clock;
    alerts.push({
      id: nextId(),
      kind: "tormentor",
      title: "TORMENTOR",
      subtitle: "SPAWNED",
      detail: "",
      team: null,
      hero: "",
    });
  }

  return function digest(data) {
    const alerts = [];
    const clock = Number(data?.map?.clock_time);
    if (!Number.isFinite(clock)) return alerts;
    const players = playersFrom(data);
    const events = Array.isArray(data?.events) ? data.events : [];

    if (!ready) {
      ready = true;
      roshan = data?.map?.roshan_state || (data?.roshan?.alive ? "alive" : "");
      for (const player of players) {
        runes[player.key] = player.runes;
        bottles[player.key] = player.bottle;
      }
      for (const event of events) seenEvents.add(eventKey(event));
      tormentor = tormentorMark(clock);
      miniboss = hasMiniboss(data);
      return alerts;
    }

    const nextRoshan = data?.map?.roshan_state || (data?.roshan?.alive ? "alive" : roshan);
    if (nextRoshan === "alive" && roshan && roshan !== "alive") {
      alerts.push({
        id: nextId(),
        kind: "roshan",
        title: "ROSHAN",
        subtitle: "SPAWNED",
        detail: "",
        team: null,
        hero: "",
      });
    }
    if (nextRoshan) roshan = nextRoshan;

    const mark = tormentorMark(clock);
    if (tormentor != null && mark > tormentor) announceTormentor(alerts, clock);
    tormentor = mark;

    const boss = hasMiniboss(data);
    if (boss && !miniboss) announceTormentor(alerts, clock);
    miniboss = boss;

    const bountyKeys = new Set();
    for (const event of events) {
      const key = eventKey(event);
      if (seenEvents.has(key)) continue;
      seenEvents.add(key);
      if (event.event_type === "bounty_rune_pickup") {
        const player = findPlayer(players, event.player_id, event.team);
        if (player) bountyKeys.add(player.key);
        alerts.push(card("bounty", "BOUNTY", player, "RUNE"));
      } else if (event.event_type === "aegis_picked_up") {
        const player = findPlayer(players, event.player_id);
        alerts.push(card("aegis", event.snatched ? "AEGIS SNATCHED" : "AEGIS", player, ""));
      }
    }

    const spawn = wisdomSpawn(clock);
    for (const player of players) {
      const prevRunes = runes[player.key] ?? player.runes;
      const prevBottle = bottles[player.key] || "";
      const gained = player.runes - prevRunes;
      runes[player.key] = player.runes;

      if (player.bottle && player.bottle !== prevBottle) {
        const title = RUNE_TITLES[player.bottle] || player.bottle.replace(/_/g, " ").toUpperCase();
        alerts.push(card("rune", title, player, ""));
      }

      let left = gained;
      if (bountyKeys.has(player.key)) left -= 1;
      if (prevBottle && prevBottle !== "empty" && !player.bottle) left -= 1;
      bottles[player.key] = player.bottle;

      while (left > 0) {
        left -= 1;
        const inWindow = spawn >= 0 && clock >= spawn && clock - spawn <= WISDOM_WINDOW;
        const used = wisdomCount[spawn] || 0;
        if (inWindow && used < 2) {
          wisdomCount[spawn] = used + 1;
          alerts.push(card("wisdom", "WISDOM", player, ""));
        } else {
          alerts.push(card("rune", "RUNE", player, ""));
        }
      }
    }

    return alerts;
  };
}
