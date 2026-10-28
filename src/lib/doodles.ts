// Doodle library: shapes drawn from Pradhi's notebook, returned as SVG markup strings.
// Every generator is seeded, so the same doodle looks the same on every visit and every build.

export type FlowerType =
  | 'star' | 'loopy' | 'spiky' | 'anemone' | 'splat' | 'tiny'
  | 'lotus' | 'dahlia' | 'marigold' | 'starhole' | 'starfish';
export type FrameKind = 'rings' | 'square' | 'octagon' | 'wobble';
export type DividerKind = 'coil' | 'beads' | 'squiggle';
type Pt = [number, number];

const TAU = Math.PI * 2;

function rng(a: number) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
let R = rng(1812);
export const seed = (s: number) => { R = rng(s); };
export const rand = () => R();

export function hashSeed(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

const j = (a: number) => (R() - 0.5) * 2 * a;
const f = (n: number) => Math.round(n * 10) / 10;
const P = (p: Pt) => `${f(p[0])},${f(p[1])}`;
const pol = (r: number, a: number): Pt => [Math.cos(a) * r, Math.sin(a) * r];
export const line = (pts: Pt[]) => pts.map((p, i) => (i ? 'L' : 'M') + P(p)).join('');

export function smooth(pts: Pt[], closed = false): string {
  const n = pts.length;
  let d = 'M' + P(pts[0]);
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = pts[closed ? (i - 1 + n) % n : Math.max(i - 1, 0)], p1 = pts[i];
    const p2 = pts[closed ? (i + 1) % n : i + 1], p3 = pts[closed ? (i + 2) % n : Math.min(i + 2, n - 1)];
    d += 'C' + P([p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]) + ' '
      + P([p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]) + ' ' + P(p2);
  }
  return d + (closed ? 'Z' : '');
}

export function blob(cx: number, cy: number, rx: number, ry: number, n = 14, w = 0.07): string {
  const pts: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i * TAU) / n, k = 1 + j(w);
    pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
  }
  return smooth(pts, true);
}

// ---------------------------------------------------------------- flowers

export function flower(type: FlowerType, r: number, col = 0, hole = 0): string {
  const c = (k: number) => `pet p${(col + k) % 4}`;
  let s = '';
  const off = R() * TAU;

  if (type === 'star') { // pointed lily petals
    const n = R() < 0.35 ? 6 : 5, sp = Math.PI / n;
    for (let i = 0; i < n; i++) {
      const a = off + (i * TAU) / n + j(0.07);
      s += `<path class="${c(0)}" d="M${P(pol(r * 0.15, a - sp * 0.45))}Q${P(pol(r * 0.62, a - sp * 0.8))} ${P(pol(r * (0.92 + R() * 0.12), a + j(0.05)))}Q${P(pol(r * 0.62, a + sp * 0.8))} ${P(pol(r * 0.15, a + sp * 0.45))}Z"/><path class="vein" d="M${P(pol(r * 0.22, a))}L${P(pol(r * 0.55, a))}"/>`;
    }
  } else if (type === 'loopy') { // long rounded daisy petals
    const n = 10 + Math.floor(R() * 3);
    for (let i = 0; i < n; i++) {
      const a = off + (i * TAU) / n + j(0.05), L = r * (0.9 + R() * 0.12);
      s += `<path class="${c(0)}" d="M${P(pol(r * 0.12, a - 0.09))}C${P(pol(L * 0.8, a - 0.3))} ${P(pol(L * 1.03, a - 0.15))} ${P(pol(L, a))}C${P(pol(L * 1.03, a + 0.15))} ${P(pol(L * 0.8, a + 0.3))} ${P(pol(r * 0.12, a + 0.09))}Z"/>`;
    }
  } else if (type === 'spiky') { // sunflower ring around the hole
    const n = 14, pts: Pt[] = [];
    for (let i = 0; i < n * 2; i++) pts.push(pol(i % 2 ? r * 0.42 : r * (0.9 + R() * 0.15), off + (i * Math.PI) / n + j(0.04)));
    s += `<path class="${c(0)}" d="${line(pts)}Z"/>`;
    for (let i = 0; i < n; i++) { const a = off + (i * TAU) / n; s += `<path class="vein" d="M${P(pol(r * 0.44, a))}L${P(pol(r * 0.72, a))}"/>`; }
    s += `<circle class="${c(1)}" r="${f(r * 0.42)}"/>`;
  } else if (type === 'anemone') { // wavy tentacle petals with curled ends
    const n = 8 + Math.floor(R() * 3);
    for (let i = 0; i < n; i++) {
      const a = off + (i * TAU) / n + j(0.1), ph = R() * TAU, pts: Pt[] = [];
      for (let k = 0; k <= 8; k++) {
        const t = k / 8, rad = r * (0.28 + 0.72 * t), w = Math.sin(t * Math.PI * 2.4 + ph) * r * 0.08 * t, p = pol(rad, a);
        pts.push([p[0] - Math.sin(a) * w, p[1] + Math.cos(a) * w]);
      }
      const e = pts[pts.length - 1];
      s += `<path class="ink" d="${smooth(pts)}"/><circle class="${c(i % 2)}" cx="${f(e[0])}" cy="${f(e[1])}" r="${f(r * 0.09)}"/>`;
    }
    s += `<circle class="${c(2)}" r="${f(r * 0.3)}"/>`;
  } else if (type === 'splat') { // six soft lobes
    const pts: Pt[] = [];
    for (let i = 0; i < 60; i++) { const a = (i * TAU) / 60; pts.push(pol(r * (0.5 + 0.5 * Math.pow(Math.abs(Math.cos(3 * a)), 0.7)) * (1 + j(0.03)), a + off)); }
    s += `<path class="${c(0)}" d="${smooth(pts, true)}"/>`;
  } else if (type === 'lotus') { // two layers of pointed petals, dotted seed centre
    ([[r, 0], [r * 0.66, Math.PI / 8]] as const).forEach(([rr, o], layer) => {
      for (let i = 0; i < 8; i++) {
        const a = off + o + (i * TAU) / 8 + j(0.05), sp = Math.PI / 8;
        s += `<path class="${c(layer)}" d="M${P(pol(rr * 0.2, a - sp * 0.5))}Q${P(pol(rr * 0.66, a - sp * 0.95))} ${P(pol(rr, a + j(0.04)))}Q${P(pol(rr * 0.66, a + sp * 0.95))} ${P(pol(rr * 0.2, a + sp * 0.5))}Z"/>`;
      }
    });
    s += `<circle class="${c(2)}" r="${f(r * 0.3)}"/>`;
    for (let i = 0; i < 12; i++) { const p = pol(r * 0.23, (i * TAU) / 12); s += `<circle class="core" cx="${f(p[0])}" cy="${f(p[1])}" r="${f(Math.max(0.7, r * 0.025))}"/>`; }
  } else if (type === 'dahlia') { // rows of rounded scale petals
    for (let k = 0; k < 4; k++) {
      const rr = r * (1 - k * 0.2), n = 16 - k * 3, d = (Math.PI / n) * 1.05, o = off + k * 0.4;
      for (let i = 0; i < n; i++) {
        const a = o + (i * TAU) / n;
        s += `<path class="${c(k % 2)}" d="M${P(pol(rr * 0.7, a - d))}C${P(pol(rr * 1.02, a - d * 0.9))} ${P(pol(rr * 1.02, a + d * 0.9))} ${P(pol(rr * 0.7, a + d))}Z"/>`;
      }
    }
  } else if (type === 'marigold') { // ruffled square-ish petals
    for (let k = 0; k < 3; k++) {
      const rr = r * (1 - k * 0.24), n = 13 - k * 3, d = (Math.PI / n) * 0.95, o = off + k * 0.5;
      for (let i = 0; i < n; i++) {
        const a = o + (i * TAU) / n;
        s += `<path class="${c(k === 1 ? 1 : 0)}" d="M${P(pol(rr * 0.62, a - d * 0.9))}L${P(pol(rr * (1 + j(0.06)), a - d))}L${P(pol(rr * (1 + j(0.06)), a + d))}L${P(pol(rr * 0.62, a + d * 0.9))}Z"/>`;
      }
    }
  } else if (type === 'starhole') { // hand-drawn star around the hole
    const pts: Pt[] = [];
    for (let i = 0; i < 10; i++) pts.push(pol(i % 2 ? r * 0.45 : r * (0.95 + j(0.05)), off + (i * Math.PI) / 5));
    s += `<path class="${c(0)}" d="${line(pts)}Z"/>`;
  } else if (type === 'starfish') { // wavy-armed starburst
    const pts: Pt[] = [];
    for (let i = 0; i < 5; i++) {
      const a = off + (i * TAU) / 5, nx = -Math.sin(a), ny = Math.cos(a), ph = R() * TAU;
      const at = (t: number, sd: number): Pt => {
        const p = pol(r * (0.25 + 0.75 * t), a), w = sd * (r * 0.2 * (1 - t) + r * 0.03) + Math.sin(t * 9 + ph) * r * 0.05;
        return [p[0] + nx * w, p[1] + ny * w];
      };
      for (let k = 0; k <= 10; k++) pts.push(at(k / 10, -1));
      for (let k = 10; k >= 0; k--) pts.push(at(k / 10, 1));
    }
    s += `<path class="${c(0)}" d="${smooth(pts, true)}"/>`;
  } else { // tiny five-petal flower for the crowds
    for (let i = 0; i < 5; i++) { const p = pol(r * 0.5, off + (i * TAU) / 5); s += `<circle class="${c(0)}" cx="${f(p[0])}" cy="${f(p[1])}" r="${f(r * 0.4)}"/>`; }
  }

  if (hole) s += holeMark(hole);
  else s += `<circle class="core" r="${f(r * (type === 'tiny' ? 0.2 : 0.12))}"/>`;
  return s;
}

const holeMark = (h: number) =>
  `<circle class="hole" r="${f(h)}"/><path class="hole-lip" d="M${P(pol(h * 0.62, 3.5))}A${f(h * 0.62)},${f(h * 0.62)} 0 0 1 ${P(pol(h * 0.62, 5.1))}"/>`;

// holes that get a frame instead of a flower
export function framedHole(kind: FrameKind, h: number): string {
  let s = '';
  const sq = (k: number) => line(([[-k, -k], [k, -k], [k, k], [-k, k]] as Pt[]).map((p): Pt => [p[0] + j(1), p[1] + j(1)])) + 'Z';
  if (kind === 'rings') s += `<path class="ink" d="${blob(0, 0, h * 1.9, h * 1.9, 10, 0.05)}"/><path class="ink" d="${blob(0, 0, h * 2.7, h * 2.7, 12, 0.06)}"/>`;
  else if (kind === 'square') s += `<path class="ink" d="${sq(h * 2)}"/><path class="ink" d="${sq(h * 2.8)}"/>`;
  else if (kind === 'octagon') { const pts: Pt[] = []; for (let i = 0; i < 8; i++) pts.push(pol(h * 2.3 + j(0.6), (i * TAU) / 8 + Math.PI / 8)); s += `<path class="ink" d="${line(pts)}Z"/>`; }
  else s += `<path class="pet p1" d="${blob(0, 0, h * 2.6, h * 2.2, 9, 0.14)}"/><path class="ink" d="${blob(0, 0, h * 1.6, h * 1.6, 8, 0.08)}"/>`;
  return s + holeMark(h);
}

export function leaf(x: number, y: number, ang: number, len: number, cls = 'leaf'): string {
  return `<g transform="translate(${f(x)},${f(y)}) rotate(${f(ang)})"><path class="${cls}" d="M0,0Q${f(len * 0.45)},${f(-len * 0.34)} ${f(len)},0Q${f(len * 0.45)},${f(len * 0.34)} 0,0Z"/><path class="vein" d="M${f(len * 0.12)},0L${f(len * 0.78)},0"/></g>`;
}

export function coil(len: number, cy = 13): string {
  const pts: Pt[] = [];
  for (let t = 0; t <= len / 10; t += 0.04) pts.push([10 + t * 10 - 8 * Math.sin(t * TAU), cy - 8 * Math.cos(t * TAU)]);
  return line(pts);
}

function stairs(x: number, y: number, step: number, n: number): string {
  let d = `M${x},${y}`;
  for (let i = 0; i < n; i++) d += i % 4 < 2 ? `h${step}v${-step}` : `h${step}v${step}`;
  return d;
}

function plusField(x: number, y: number, cols: number, rows: number, gap: number): string {
  let d = '';
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const px = x + c * gap + (r % 2) * gap / 2 + j(1.5), py = y + r * gap + j(1.5);
    d += `M${f(px - 3)},${f(py)}h6M${f(px)},${f(py - 3)}v6`;
  }
  return `<path class="ink thin" d="${d}"/>`;
}

// ---------------------------------------------------------------- page pieces

/** Wavy contour bands for the top and bottom of every page (viewBox 0 0 1200 110). */
export function waves(s: number): string {
  seed(s);
  const lines: Pt[][] = [];
  for (let k = 0; k < 7; k++) {
    const pts: Pt[] = [], a1 = R() * TAU, a2 = R() * TAU;
    for (let x = -20; x <= 1220; x += 12) pts.push([x, 10 + k * 13 + Math.sin(x / 110 + a1) * 7 + Math.sin(x / 41 + a2) * 3.5]);
    lines.push(pts);
  }
  const band = (a: number, b: number, cls: string) =>
    `<path class="${cls}" d="${line(lines[a])}${[...lines[b]].reverse().map((p) => 'L' + P(p)).join('')}Z"/>`;
  return band(1, 2, 'band-sky') + band(3, 4, 'band-peach') + band(5, 6, 'band-lilac')
    + lines.map((l) => `<path class="wave-line" d="${line(l)}"/>`).join('');
}

/** Section dividers (viewBox 0 0 190 26). */
export function divider(kind: DividerKind, s = 8): string {
  seed(s);
  if (kind === 'coil') return `<path class="ink" d="${coil(170)}"/>`;
  if (kind === 'beads') {
    const y = (x: number) => 13 + Math.sin(x / 9) * 4, pts: Pt[] = [];
    for (let x = 4; x <= 186; x += 6) pts.push([x, y(x)]);
    let out = `<path class="ink" d="${smooth(pts)}"/>`;
    for (let x = 12, i = 0; x < 186; x += 16, i++) out += `<ellipse class="pet p${i % 4}" cx="${x}" cy="${f(y(x))}" rx="4.4" ry="3.3"/>`;
    return out;
  }
  const pts: Pt[] = [];
  for (let x = 4; x <= 186; x += 5) pts.push([x, 13 + Math.sin(x / 7) * 6 * Math.sin(x / 60 + 0.5)]);
  return `<path class="ink" d="${smooth(pts)}"/>`;
}

/** A bubble packed with tiny flowers. */
export function crowd(w: number, h: number, count: number, col: number, s: number): string {
  seed(s);
  const cx = w / 2, cy = h / 2, rx = cx - 10, ry = cy - 10;
  let out = `<path class="crowd-fill" d="${blob(cx, cy, rx, ry)}"/>`;
  const placed: Pt[] = [];
  for (let t = 0; t < 600 && placed.length < count; t++) {
    const x = cx + (R() * 2 - 1) * rx * 0.8, y = cy + (R() * 2 - 1) * ry * 0.74;
    if (((x - cx) / (rx * 0.8)) ** 2 + ((y - cy) / (ry * 0.74)) ** 2 > 1) continue;
    if (placed.some((p) => Math.hypot(p[0] - x, p[1] - y) < 24)) continue;
    placed.push([x, y]);
    out += `<g transform="translate(${f(x)},${f(y)})">${flower('tiny', 9 + R() * 2.5, col + (R() < 0.2 ? 2 : 0))}</g>`;
  }
  return out;
}

/** Hand-drawn stars (viewBox 0 0 160 120). */
export function stars(s = 31): string {
  seed(s);
  let out = '';
  ([[40, 30, 16], [96, 18, 10], [126, 56, 18], [70, 82, 12], [140, 104, 8]] as const).forEach(([x, y, r], i) => {
    const o = -Math.PI / 2 + j(0.3), pts: Pt[] = [];
    for (let k = 0; k < 10; k++) {
      const rr = k % 2 ? r * 0.45 : r;
      pts.push([x + Math.cos(o + (k * Math.PI) / 5) * rr + j(0.8), y + Math.sin(o + (k * Math.PI) / 5) * rr + j(0.8)]);
    }
    out += `<path class="${i % 2 ? 'ink' : 'pet p0'}" d="${line(pts)}Z"/>`;
  });
  return out;
}

/** The "now" mind-map: a wobbly blob with words written just inside its edge (viewBox 0 0 420 360). */
export function nowMap(words: string[], s = 26): string {
  seed(s);
  const cx = 210, cy = 180, ph1 = R() * TAU, ph2 = R() * TAU;
  const m = (a: number) => 1 + 0.13 * Math.sin(3 * a + ph1) + 0.08 * Math.sin(5 * a + ph2);
  const at = (a: number, k: number): Pt => [cx + Math.cos(a) * 172 * k * m(a), cy + Math.sin(a) * 146 * k * m(a)];
  const outline: Pt[] = [];
  for (let i = 0; i < 16; i++) outline.push(at((i * TAU) / 16, 1 + j(0.04)));
  const b = smooth(outline, true);

  let defs = `<clipPath id="nowclip-${s}"><path d="${b}"/></clipPath>`;
  let out = `<path class="blob-fill draw" d="${b}"/><g clip-path="url(#nowclip-${s})">`;
  for (let k = 0; k < 3; k++) { // maze squiggles in the middle
    const x = cx - 75 + k * 42 + j(12), y = cy - 58 + j(18), w = 46 + R() * 34, g = 6 + R() * 3, rows = 3 + Math.floor(R() * 2);
    let d = `M${f(x)},${f(y)}`;
    for (let r = 0; r < rows; r++) { const ww = w * (0.6 + R() * 0.6); d += `h${f(ww)}a${f(g)},${f(g)} 0 0 1 0,${f(2 * g)}h${f(-ww)}a${f(g)},${f(g)} 0 0 0 0,${f(2 * g)}`; }
    out += `<path class="ink draw" d="${d}" transform="rotate(${f(j(35))} ${f(x)} ${f(y)})"/>`;
  }
  out += '</g>';

  // each word gets its own short arc just inside the outline; bottom words run the other way so they stay upright
  const n = words.length;
  words.forEach((word, i) => {
    const a = -1.15 + (i * TAU) / n, lower = Math.sin(a) > 0.35, k = lower ? 0.8 : 0.7;
    const radius = 150 * k * m(a), span = (word.length * 10.5) / radius + 0.25;
    const arc: Pt[] = [];
    for (let q = 0; q <= 12; q++) {
      const t = q / 12, aa = lower ? a + span / 2 - t * span : a - span / 2 + t * span;
      arc.push(at(aa, k));
    }
    const id = `now-${s}-${i}`;
    defs += `<path id="${id}" d="${smooth(arc)}" fill="none"/>`;
    out += `<text class="nowword"><textPath href="#${id}" startOffset="50%" text-anchor="middle">${escapeXml(word)}</textPath></text>`;
  });

  // shaded spiral rosettes beside the blob
  ([[352, 312, 15], [384, 300, 12], [378, 334, 11]] as const).forEach(([x, y, r0]) => {
    const sp: Pt[] = [];
    for (let q = 0; q <= 50; q++) { const t = q / 50, aa = t * TAU * 3.2; sp.push([x + Math.cos(aa) * r0 * t, y + Math.sin(aa) * r0 * t]); }
    out += `<circle class="graphite" cx="${x}" cy="${y}" r="${r0}"/><path class="ink" d="${smooth(sp)}"/>`;
  });
  out += `<path class="ink" d="${coil(60, 0)}" transform="translate(338,40) rotate(90)"/>`;
  return `<defs>${defs}</defs>${out}`;
}

const escapeXml = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Project card art (viewBox 0 0 250 112). */
export function projectArt(kind: 'code' | 'design' | 'writing' | 'sprout', s = 5): string {
  seed(s);
  if (kind === 'code') {
    const st = stairs(22, 86, 16, 13);
    return `<path class="stair-ink" d="${st}"/><path class="stair-fill" d="${st}"/>${plusField(26, 16, 7, 2, 14)}<g transform="translate(222,26)">${flower('tiny', 11, 0)}</g>`;
  }
  if (kind === 'design') {
    return `<path class="vine" d="M58,50C98,118 150,118 192,54"/>${leaf(96, 86, 150, 22)}${leaf(150, 88, -20, 22)}<g transform="translate(58,48)">${flower('star', 40, 0, 7)}</g><g transform="translate(192,52)">${flower('spiky', 38, 3, 7)}</g>`;
  }
  if (kind === 'writing') {
    const pb = blob(125, 56, 112, 44);
    let out = `<defs><clipPath id="pebclip-${s}"><path d="${pb}"/></clipPath></defs><path class="crowd-fill lilac" d="${pb}"/><g clip-path="url(#pebclip-${s})">`;
    for (let row = 0, y = 10; y < 104; row++, y += 9) for (let x = 10; x < 92; x += 11) out += `<ellipse class="ink thin" cx="${f(x + (row % 2) * 5 + j(1.5))}" cy="${f(y + j(1))}" rx="3.6" ry="2.4"/>`;
    for (let y = 8; y < 106; y += 4) out += `<path class="vein" d="M${f(100 + j(2))},${y}L${f(150 + j(2))},${f(y + j(1))}"/>`;
    for (let row = 0, y = 10; y < 104; row++, y += 7) for (let x = 162; x < 242; x += 7) out += `<circle class="core" cx="${f(x + (row % 2) * 3.5)}" cy="${y}" r="1.4"/>`;
    return out + `<path class="ink" d="M96,0C92,30 104,60 96,112M156,0C150,40 162,70 154,112"/></g><g transform="translate(232,18)">${flower('starfish', 17, 0)}</g>`;
  }
  // sprout: something's growing here
  const stem = `M125,104C122,86 130,70 125,46`;
  return `<path class="ink" d="M70,104h110"/>${plusField(84, 96, 6, 1, 14)}<path class="vine" d="${stem}"/>${leaf(126, 82, -35, 26, 'leaf shaded')}${leaf(124, 66, 205, 22, 'leaf shaded')}<circle class="bud" cx="125" cy="34" r="12"/><path class="ink" d="M117,28q8,-10 16,0"/>`;
}

/** Spiral binding across a strip (viewBox 0 0 W 38). */
export function binding(w: number, s = 55): string {
  seed(s);
  let out = '';
  for (let x = 18, i = 0; x < w - 12; x += 26, i++) {
    if (i % 6 === 3) out += `<g transform="translate(${x},26)">${flower('tiny', 10, i % 4)}</g>`;
    out += `<circle class="hole" cx="${x}" cy="26" r="3.6"/><path class="coil-wire" d="M${x - 1},26C${x - 3},6 ${x + 9},2 ${x + 10},14"/>`;
  }
  return out;
}

/** Jagged double frame drawn around a box of size w x h (svg sized w+20 x h+20). */
export function jagFrame(w: number, h: number, s = 21): string {
  seed(s);
  const o = 10, pts: Pt[] = [];
  const push = (x: number, y: number, nx: number, ny: number) => { const k = R() < 0.16 ? 6 + R() * 8 : R() * 2.5; pts.push([x + nx * k, y + ny * k]); };
  for (let x = o; x < o + w; x += 16) push(x, o, 0, -1);
  for (let y = o; y < o + h; y += 16) push(o + w, y, 1, 0);
  for (let x = o + w; x > o; x -= 16) push(x, o + h, 0, 1);
  for (let y = o + h; y > o; y -= 16) push(o, y, -1, 0);
  const inner: Pt[] = [[o + 9 + j(2), o + 9 + j(2)], [o + w - 9 + j(2), o + 9 + j(2)], [o + w - 9 + j(2), o + h - 9 + j(2)], [o + 9 + j(2), o + h - 9 + j(2)]];
  return `<path class="jag-fill" d="${line(pts)}Z"/><path class="jag-inner" d="${line(inner)}Z"/>`;
}

// ---------------------------------------------------------------- the margin vine

const VINE_FLOWERS: FlowerType[] = ['star', 'loopy', 'spiky', 'anemone', 'dahlia', 'lotus', 'marigold', 'starhole'];
const FRAMES: FrameKind[] = ['rings', 'square', 'octagon', 'wobble'];

const cubicAt = (p0: Pt, p1: Pt, p2: Pt, p3: Pt, t: number): Pt => {
  const u = 1 - t;
  return [0, 1].map((k) => u * u * u * p0[k] + 3 * u * u * t * p1[k] + 3 * u * t * t * p2[k] + t * t * t * p3[k]) as Pt;
};

/** Punched holes down the margin, joined by a thin wavy stem with shaded leaves. */
export function marginVine(W: number, H: number, s = 1812): string {
  seed(s);
  const cx = W / 2, step = W < 60 ? 150 : 132, r = W * 0.4, hole = Math.max(4.5, W * 0.085), bow = W * 0.2;
  const ys: number[] = [];
  for (let y = 70; y < H - 40; y += step) ys.push(y);
  if (!ys.length) return '';
  let vine = `M${f(cx)},${ys[0]}`, leaves = '';
  for (let i = 0; i < ys.length - 1; i++) {
    const y0 = ys[i], y1 = ys[i + 1], sd = i % 2 ? -1 : 1;
    const p0: Pt = [cx, y0], p1: Pt = [cx + sd * bow, y0 + step * 0.33], p2: Pt = [cx - sd * bow, y0 + step * 0.66], p3: Pt = [cx, y1];
    vine += `C${P(p1)} ${P(p2)} ${P(p3)}`;
    ([[0.36, sd], [0.64, -sd]] as const).forEach(([t, side]) => {
      const q = cubicAt(p0, p1, p2, p3, t);
      leaves += leaf(q[0], q[1], side > 0 ? -38 + j(12) : 218 + j(12), W * 0.28, 'leaf shaded');
    });
  }
  let g = `<path class="vine" d="${vine}"/><g class="leaves">${leaves}</g>`;
  let prevFrame = true;
  ys.forEach((y) => {
    const framed = !prevFrame && R() < 0.3;
    prevFrame = framed;
    const art = framed
      ? framedHole(FRAMES[Math.floor(R() * FRAMES.length)], hole)
      : flower(VINE_FLOWERS[Math.floor(R() * VINE_FLOWERS.length)], r * (0.85 + R() * 0.25), Math.floor(R() * 4), hole);
    g += `<g transform="translate(${f(cx)},${y})"><g class="bloom">${art}</g></g>`;
  });
  return g;
}

// ---------------------------------------------------------------- stickers

export interface Sticker { id: string; type: FlowerType; col: number; hole: boolean; seed: number; }

export const STICKERS: Sticker[] = [
  { id: 'lotus', type: 'lotus', col: 0, hole: true, seed: 101 },
  { id: 'dahlia', type: 'dahlia', col: 1, hole: true, seed: 102 },
  { id: 'star', type: 'star', col: 2, hole: false, seed: 103 },
  { id: 'starhole', type: 'starhole', col: 0, hole: true, seed: 104 },
  { id: 'anemone', type: 'anemone', col: 3, hole: false, seed: 105 },
  { id: 'loopy', type: 'loopy', col: 2, hole: false, seed: 106 },
  { id: 'marigold', type: 'marigold', col: 0, hole: true, seed: 107 },
  { id: 'starfish', type: 'starfish', col: 1, hole: false, seed: 108 },
];

/** A sticker drawn at radius 26 (viewBox -32 -32 64 64). */
export function stickerSvg(st: Sticker): string {
  seed(st.seed);
  return flower(st.type, 26, st.col, st.hole ? 5 : 0);
}

/** A flower picked from the set by a string (e.g. a post slug), so each post keeps the same flower. */
export function flowerFor(key: string, r = 26): string {
  const h = hashSeed(key);
  seed(h);
  return flower(VINE_FLOWERS[h % VINE_FLOWERS.length], r, h % 4);
}

export const SPROUT_TYPES: FlowerType[] = ['star', 'loopy', 'tiny', 'splat', 'spiky', 'dahlia', 'lotus', 'starfish', 'starhole'];
