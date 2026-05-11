// ---- MATH UTILITIES ----
export function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function dist(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

export function distSq(x1, y1, x2, y2) {
  return (x2 - x1) ** 2 + (y2 - y1) ** 2;
}

export function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randFloat(min, max) {
  return Math.random() * (max - min) + min;
}

export function randBool(chance = 0.5) {
  return Math.random() < chance;
}

// ---- SIMPLEX NOISE (simplified implementation) ----
// A compact 2D noise implementation for terrain generation
const grad3 = [
  [1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],
  [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
  [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]
];

const p = [];
const perm = [];

function initPermutation(seed) {
  p.length = 0;
  perm.length = 0;
  const arr = [];
  for (let i = 0; i < 256; i++) arr.push(i);
  // Seeded shuffle
  let s = seed || 0;
  for (let i = 255; i > 0; i--) {
    s = (s * 16807 + 0) % 2147483647;
    const j = s % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  for (let i = 0; i < 512; i++) {
    p[i] = arr[i & 255];
    perm[i] = p[i];
  }
}

function dot(g, x, y) {
  return g[0] * x + g[1] * y;
}

function fade(t) {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function lerpNoise(a, b, t) {
  return a + t * (b - a);
}

export function noise2D(x, y) {
  const F2 = 0.5 * (Math.sqrt(3) - 1);
  const G2 = (3 - Math.sqrt(3)) / 6;

  const s = (x + y) * F2;
  const i = Math.floor(x + s);
  const j = Math.floor(y + s);
  const t = (i + j) * G2;
  const X0 = i - t;
  const Y0 = j - t;
  const x0 = x - X0;
  const y0 = y - Y0;

  let i1, j1;
  if (x0 > y0) { i1 = 1; j1 = 0; }
  else { i1 = 0; j1 = 1; }

  const x1 = x0 - i1 + G2;
  const y1 = y0 - j1 + G2;
  const x2 = x0 - 1 + 2 * G2;
  const y2 = y0 - 1 + 2 * G2;

  const ii = i & 255;
  const jj = j & 255;
  const gi0 = perm[ii + perm[jj]] % 12;
  const gi1 = perm[ii + i1 + perm[jj + j1]] % 12;
  const gi2 = perm[ii + 1 + perm[jj + 1]] % 12;

  let n0 = 0, n1 = 0, n2 = 0;
  let t0 = 0.5 - x0 * x0 - y0 * y0;
  if (t0 >= 0) { t0 *= t0; n0 = t0 * t0 * dot(grad3[gi0], x0, y0); }
  let t1 = 0.5 - x1 * x1 - y1 * y1;
  if (t1 >= 0) { t1 *= t1; n1 = t1 * t1 * dot(grad3[gi1], x1, y1); }
  let t2 = 0.5 - x2 * x2 - y2 * y2;
  if (t2 >= 0) { t2 *= t2; n2 = t2 * t2 * dot(grad3[gi2], x2, y2); }

  return 70 * (n0 + n1 + n2);
}

export function setNoiseSeed(seed) {
  initPermutation(seed);
}

// ---- PERIODIC TIMER ----
export class Timer {
  constructor(interval) {
    this.interval = interval;
    this.elapsed = 0;
  }
  tick(dt) {
    this.elapsed += dt;
    if (this.elapsed >= this.interval) {
      this.elapsed = 0;
      return true;
    }
    return false;
  }
  reset() {
    this.elapsed = 0;
  }
}

// ---- DIRECTION ----
export function directionFromAngle(angle) {
  return { x: Math.cos(angle), y: Math.sin(angle) };
}

// ---- AABB overlap ----
export function aabbOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x &&
         a.y < b.y + b.h && a.y + a.h > b.y;
}

// ---- ID generator ----
let nextId = 1;
export function genId() {
  return nextId++;
}