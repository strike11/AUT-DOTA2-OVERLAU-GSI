function bit(opts) {
  return {
    anim: "fly",
    frame: false,
    w: 12,
    h: 12,
    c: "#fff6ff",
    x0: 0,
    y0: 0,
    dx: 0,
    dy: 0,
    rot: "0deg",
    delay: 0,
    r: 340,
    a0: "0deg",
    a1: "70deg",
    ...opts,
  };
}

function range(n, fn) {
  const out = [];
  for (let i = 0; i < n; i += 1) out.push(fn(i));
  return out;
}

function ring(count, distX, distY, colorAt, sizeAt) {
  return range(count, (i) => {
    const a = (i / count) * Math.PI * 2 - Math.PI / 2;
    const size = sizeAt(i);
    return bit({
      w: size,
      h: size,
      c: colorAt(i),
      x0: Math.round(Math.cos(a) * 36),
      y0: Math.round(Math.sin(a) * 16),
      dx: Math.round(Math.cos(a) * distX),
      dy: Math.round(Math.sin(a) * distY),
      delay: (i % 4) * 30,
    });
  });
}

const SPECS = {
  ROSHAN: {
    motion: "roshan",
    plate: "#2a0610",
    edge: "#ff3b1f",
    bits: () => [
      ...range(14, (i) => {
        const side = i % 2 === 0 ? -1 : 1;
        return bit({
          w: i % 3 === 0 ? 20 : 12,
          h: i % 3 === 0 ? 20 : 12,
          c: ["#ff3b1f", "#ffb020", "#ffd27a", "#8a140c"][i % 4],
          x0: side * (24 + (i % 4) * 16),
          y0: 20,
          dx: side * (440 + (i % 5) * 16),
          dy: -178 - (i % 4) * 12,
          delay: (i % 5) * 35,
        });
      }),
      ...range(8, (i) => bit({
        w: 14,
        h: 14,
        c: i % 2 ? "#ffb020" : "#ff4a1a",
        x0: (i - 4) * 28,
        y0: 36,
        dx: (i - 3.5) * 70,
        dy: 170 + (i % 3) * 16,
        delay: 50 + (i % 4) * 30,
      })),
    ],
  },
  TORMENTOR: {
    motion: "tormentor",
    plate: "#071820",
    edge: "#7ee7ff",
    bits: () => range(12, (i) => {
      const x = -260 + (i % 6) * 104;
      const down = i < 6;
      return bit({
        w: 12,
        h: 28 + (i % 3) * 14,
        c: ["#e8fbff", "#7ee7ff", "#3d7cff", "#b9fff6"][i % 4],
        x0: x / 4,
        y0: 0,
        dx: x,
        dy: down ? 188 + (i % 3) * 18 : -176 - (i % 3) * 12,
        delay: (i % 4) * 40,
      });
    }),
  },
  LOTUS: {
    motion: "lotus",
    plate: "#1a0820",
    edge: "#ff7ad9",
    bits: () => range(16, (i) => {
      const side = i % 2 === 0 ? -1 : 1;
      return bit({
        w: 14,
        h: 14,
        c: ["#ff7ad9", "#7ef6ff", "#ffd0f0", "#ffffff"][i % 4],
        rot: "45deg",
        x0: side * 20,
        y0: 8,
        dx: side * (360 + (i % 5) * 36),
        dy: i % 3 === 0 ? 180 + (i % 4) * 14 : -172 - (i % 4) * 12,
        delay: (i % 5) * 32,
      });
    }),
  },
  WISDOM: {
    motion: "wisdom",
    plate: "#14082a",
    edge: "#b388ff",
    bits: () => range(10, (i) => bit({
      anim: "orbit",
      w: i % 2 ? 16 : 10,
      h: i % 2 ? 16 : 10,
      c: i % 2 ? "#c9a6ff" : "#5cefff",
      r: 410 + (i % 3) * 24,
      a0: `${i * 36}deg`,
      a1: `${i * 36 + 80}deg`,
      delay: (i % 5) * 28,
    })),
  },
  BOUNTY: {
    motion: "bounty",
    plate: "#2a1a04",
    edge: "#ffc83d",
    bits: () => ring(
      16,
      460,
      188,
      (i) => (i % 2 ? "#ffd45a" : "#fff1b0"),
      (i) => (i % 4 === 0 ? 18 : 12),
    ),
  },
  HASTE: {
    motion: "haste",
    plate: "#2a0a0c",
    edge: "#ff3b2f",
    bits: () => range(12, (i) => {
      const side = i % 2 === 0 ? -1 : 1;
      return bit({
        w: 48 + (i % 4) * 18,
        h: 8,
        c: i % 3 === 0 ? "#fff1a8" : "#ff3b2f",
        x0: side * 48,
        y0: -48 + (i % 6) * 20,
        dx: side * (460 + (i % 3) * 28),
        dy: -48 + (i % 6) * 20,
        delay: (i % 4) * 28,
      });
    }),
  },
  "DOUBLE DAMAGE": {
    motion: "damage",
    plate: "#0c1830",
    edge: "#d7f4ff",
    bits: () => range(12, (i) => {
      const x = -280 + (i % 6) * 112;
      const up = i < 6;
      return bit({
        w: 10,
        h: 36 + (i % 3) * 16,
        c: i % 2 ? "#f4fbff" : "#8fd0ff",
        x0: Math.round(x / 5),
        y0: 0,
        dx: x,
        dy: up ? -176 - (i % 3) * 12 : 188 + (i % 3) * 16,
        delay: (i % 4) * 30,
      });
    }),
  },
  ARCANE: {
    motion: "arcane",
    plate: "#1a0830",
    edge: "#c26bff",
    bits: () => range(9, (i) => bit({
      anim: "orbit",
      w: 14,
      h: 14,
      c: ["#c26bff", "#f0d0ff", "#7a4dff"][i % 3],
      r: 400 + (i % 3) * 22,
      a0: `${200 - i * 28}deg`,
      a1: `${120 - i * 28}deg`,
      delay: (i % 4) * 36,
    })),
  },
  REGEN: {
    motion: "regen",
    plate: "#241c08",
    edge: "#ffe14a",
    bits: () => range(7, (i) => {
      const side = i % 2 === 0 ? -1 : 1;
      const x = side * (400 + (i % 3) * 28);
      const y = i % 3 === 0 ? 186 : -176 - (i % 2) * 14;
      const c = i % 2 ? "#ffe14a" : "#fff3b0";
      return [
        bit({ w: 26, h: 8, c, x0: side * 20, y0: 12, dx: x, dy: y, delay: i * 30 }),
        bit({ w: 8, h: 26, c, x0: side * 20, y0: 12, dx: x, dy: y, delay: i * 30 }),
      ];
    }).flat(),
  },
  ILLUSION: {
    motion: "illusion",
    plate: "#2a2208",
    edge: "#ffe14a",
    bits: () => [
      bit({ frame: true, w: 760, h: 250, c: "#ffe14a", x0: 0, y0: 0, dx: -78, dy: 22, delay: 40 }),
      bit({ frame: true, w: 760, h: 250, c: "#fff6c2", x0: 0, y0: 0, dx: 86, dy: 36, delay: 90 }),
      ...range(8, (i) => {
        const side = i % 2 === 0 ? -1 : 1;
        return bit({
          w: 12,
          h: 12,
          c: "#ffe14a",
          x0: side * 30,
          y0: (i - 4) * 10,
          dx: side * (430 + (i % 3) * 20),
          dy: -40 + (i % 5) * 36,
          delay: 70 + (i % 3) * 30,
        });
      }),
    ],
  },
  INVIS: {
    motion: "invis",
    plate: "#160c22",
    edge: "#c9b6ff",
    bits: () => range(18, (i) => {
      const side = i % 2 === 0 ? -1 : 1;
      return bit({
        w: i % 3 === 0 ? 16 : 8,
        h: i % 3 === 0 ? 16 : 8,
        c: ["#c9b6ff", "#6e5a90", "#efe8ff"][i % 3],
        x0: side * 16,
        y0: (i % 5) * 6 - 12,
        dx: side * (420 + (i % 4) * 22),
        dy: i % 3 === 0 ? -180 : 150 + (i % 4) * 16,
        delay: (i % 6) * 24,
      });
    }),
  },
  AEGIS: {
    motion: "aegis",
    plate: "#2a1004",
    edge: "#ffb020",
    bits: () => ring(
      18,
      470,
      196,
      (i) => (i % 3 === 0 ? "#ff3b1f" : i % 3 === 1 ? "#ffb020" : "#fff1b0"),
      () => 10,
    ).map((item, i) => ({
      ...item,
      w: 22,
      h: 8,
      rot: `${Math.round((i / 18) * 360 - 90)}deg`,
    })),
  },
  "AEGIS SNATCHED": {
    motion: "snatched",
    plate: "#2a0610",
    edge: "#ff3030",
    bits: () => [
      ...range(8, (i) => bit({
        w: 36,
        h: 8,
        c: i % 2 ? "#ff3030" : "#ffb020",
        rot: "28deg",
        x0: -20,
        y0: 10,
        dx: -460 + i * 8,
        dy: -120 + i * 34,
        delay: i * 20,
      })),
      ...range(8, (i) => bit({
        w: 36,
        h: 8,
        c: "#ffd27a",
        rot: "-32deg",
        x0: 20,
        y0: -10,
        dx: 440 - i * 6,
        dy: -140 + i * 36,
        delay: 40 + i * 18,
      })),
    ],
  },
  RUNE: {
    motion: "rune",
    plate: "#1a1040",
    edge: "#ff4ad8",
    bits: () => range(12, (i) => {
      const side = i % 2 === 0 ? -1 : 1;
      return bit({
        w: 16,
        h: 28,
        c: ["#ff3b2f", "#d7f4ff", "#c26bff", "#ffe14a", "#c9b6ff", "#7ef6ff"][i % 6],
        x0: side * 24,
        y0: -20 + (i % 4) * 14,
        dx: side * (420 + (i % 3) * 24),
        dy: -20 + (i % 4) * 48,
        delay: (i % 4) * 30,
      });
    }),
  },
  WATER: {
    motion: "water",
    plate: "#062028",
    edge: "#5cefff",
    bits: () => range(14, (i) => bit({
      w: 10,
      h: i % 2 ? 22 : 14,
      c: i % 2 ? "#7ef6ff" : "#e8fdff",
      x0: -240 + i * 36,
      y0: 24,
      dx: -250 + i * 38,
      dy: 176 + (i % 4) * 18,
      delay: (i % 5) * 32,
    })),
  },
  SHIELD: {
    motion: "shield",
    plate: "#101820",
    edge: "#d5fff6",
    bits: () => {
      const corners = [
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ];
      return corners.flat(([sx, sy], n) => [
        bit({
          w: 54,
          h: 10,
          c: "#e7fff8",
          x0: sx * 520,
          y0: sy * 210,
          dx: sx * 430,
          dy: sy * 188,
          delay: n * 30,
        }),
        bit({
          w: 10,
          h: 54,
          c: "#9ee7ff",
          x0: sx * 520,
          y0: sy * 210,
          dx: sx * 454,
          dy: sy * 168,
          delay: n * 30,
        }),
      ]);
    },
  },
};

export function alertFx(title) {
  const spec = SPECS[title] || SPECS.RUNE;
  return {
    motion: spec.motion,
    plate: spec.plate,
    edge: spec.edge,
    bits: spec.bits(),
  };
}
