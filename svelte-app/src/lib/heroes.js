const PORTRAIT = {
  antimage: "anti-mage",
  nevermore: "shadow_fiend",
  obsidian_destroyer: "outworld_destroyer",
  queenofpain: "queen_of_pain",
  rattletrap: "clockwerk",
};

export function portraitSrc(hero) {
  if (!hero) return "";
  return `portraits/${PORTRAIT[hero] || hero}.png`;
}

export function videoSrc(hero) {
  if (!hero) return "";
  return `videos/npc_dota_hero_${hero}.webm`;
}
