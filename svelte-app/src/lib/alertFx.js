const SPECS = {
  ROSHAN: { motion: "roshan", plate: "#2a0610", fill: "#5a1424", edge: "#ff3b1f" },
  TORMENTOR: { motion: "tormentor", plate: "#071820", fill: "#0e3a4a", edge: "#7ee7ff" },
  LOTUS: { motion: "lotus", plate: "#1a0820", fill: "#4a1244", edge: "#ff7ad9" },
  WISDOM: { motion: "wisdom", plate: "#14082a", fill: "#2c1860", edge: "#b388ff" },
  BOUNTY: { motion: "bounty", plate: "#2a1a04", fill: "#5a3a08", edge: "#ffc83d" },
  HASTE: { motion: "haste", plate: "#2a0a0c", fill: "#5a1618", edge: "#ff3b2f" },
  "DOUBLE DAMAGE": { motion: "damage", plate: "#0c1830", fill: "#123058", edge: "#d7f4ff" },
  ARCANE: { motion: "arcane", plate: "#1a0830", fill: "#3a1468", edge: "#c26bff" },
  REGEN: { motion: "regen", plate: "#241c08", fill: "#4a3c08", edge: "#ffe14a" },
  ILLUSION: { motion: "illusion", plate: "#2a2208", fill: "#4a3e10", edge: "#ffe14a" },
  INVIS: { motion: "invis", plate: "#160c22", fill: "#2e1848", edge: "#c9b6ff" },
  AEGIS: { motion: "aegis", plate: "#2a1004", fill: "#5a2c08", edge: "#ffb020" },
  "AEGIS SNATCHED": { motion: "snatched", plate: "#2a0610", fill: "#5a101c", edge: "#ff3030" },
  RUNE: { motion: "rune", plate: "#1a1040", fill: "#2a1868", edge: "#ff4ad8" },
  WATER: { motion: "water", plate: "#062028", fill: "#084058", edge: "#5cefff" },
  SHIELD: { motion: "shield", plate: "#101820", fill: "#143840", edge: "#d5fff6" },
};

export function alertFx(title) {
  const spec = SPECS[title] || SPECS.RUNE;
  return {
    motion: spec.motion,
    plate: spec.plate,
    fill: spec.fill,
    edge: spec.edge,
  };
}
