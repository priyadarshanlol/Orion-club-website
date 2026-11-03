import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

/*
 * ORION — 3D celestial sphere background.
 *
 * A WebGL planetarium that sits behind the whole site:
 *  - a deep, parallaxing star volume with a Milky Way band and monochrome nebula haze
 *  - real constellations (Orion first) whose lines draw themselves in when they enter view
 *  - four-point "sparkle" stars like the Core Committee poster
 *  - scroll rotates the sky so each section reveals a new constellation, the mouse tilts the camera
 */

// ---------- Constellation data ----------
// Orion from real RA (hours) / Dec (degrees); the others are hand-traced shapes.
const ORION_STARS = [
  ['Betelgeuse', 5.919, 7.41, 0.5],
  ['Bellatrix', 5.419, 6.35, 1.6],
  ['Meissa', 5.585, 9.93, 3.4],
  ['Alnitak', 5.679, -1.94, 1.8],
  ['Alnilam', 5.604, -1.2, 1.7],
  ['Mintaka', 5.533, -0.3, 2.2],
  ['Saiph', 5.796, -9.67, 2.1],
  ['Rigel', 5.242, -8.2, 0.1],
  ['pi1', 4.909, 10.15, 4.6],
  ['pi2', 4.843, 8.9, 4.4],
  ['pi3', 4.83, 6.96, 3.2],
  ['pi4', 4.853, 5.6, 3.7],
  ['pi5', 4.904, 2.44, 3.7],
  ['pi6', 4.976, 1.71, 4.5],
  ['mu', 6.039, 9.65, 4.1],
  ['nu', 6.126, 14.77, 4.4],
  ['xi', 6.2, 14.21, 4.5],
  ['chi1', 5.906, 20.28, 4.4],
  ['chi2', 6.065, 20.14, 4.6],
  ['M42', 5.588, -5.39, 4.0],
];
const ORION_EDGES = [
  [2, 0], [2, 1], [0, 3], [1, 5], [3, 4], [4, 5], [3, 6], [5, 7],
  [1, 10], [8, 9], [9, 10], [10, 11], [11, 12], [12, 13],
  [0, 14], [14, 15], [15, 16], [14, 17], [17, 18],
];
const orionPoints = ORION_STARS.map(([, ra, dec, mag]) => [-(ra - 5.6) * 15, dec, mag]);

const CONSTELLATIONS = [
  { name: 'Orion', yaw: -24, pitch: 3, scale: 2.1, points: orionPoints, edges: ORION_EDGES },
  {
    name: 'Ursa Major', yaw: 38, pitch: 14, scale: 3.4,
    points: [[0, 0, 1.8], [1.2, 0.1, 2.4], [2.2, -0.2, 1.8], [3.2, -0.3, 3.3], [3.4, -1.3, 2.4], [4.6, -1.5, 1.8], [4.7, -0.4, 2.4]],
    edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 3]],
  },
  {
    name: 'Cassiopeia', yaw: 92, pitch: -6, scale: 4,
    points: [[0, 0, 2.3], [1, -1.1, 2.2], [2, -0.2, 2.5], [3, -1.2, 2.7], [4, 0.2, 3.4]],
    edges: [[0, 1], [1, 2], [2, 3], [3, 4]],
  },
  {
    name: 'Cygnus', yaw: 148, pitch: 10, scale: 3.3,
    points: [[0, 2.4, 1.2], [0, 0, 2.2], [0, -3.2, 3.1], [-1.7, 0.7, 2.5], [-3, 1.5, 3.2], [1.7, -0.6, 2.9], [2.9, -1.3, 3.9]],
    edges: [[0, 1], [1, 2], [1, 3], [3, 4], [1, 5], [5, 6]],
  },
  {
    name: 'Scorpius', yaw: 204, pitch: -8, scale: 2.6,
    points: [[-2.4, 2.4, 2.6], [-2, 1.4, 2.3], [-1.8, 0.4, 2.9], [-0.8, 0.6, 1.1], [0, 0.2, 2.8], [0.6, -0.6, 2.3], [0.9, -1.8, 2.3], [0.5, -2.9, 3], [-0.4, -3.5, 2.4], [-1.4, -3.4, 1.6], [-1.9, -2.7, 2.7]],
    edges: [[0, 1], [1, 2], [1, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [9, 10]],
  },
  {
    name: 'Lyra', yaw: 255, pitch: 12, scale: 3.8,
    points: [[0, 0, 0.0], [0.7, -0.6, 4.3], [0.5, -1.6, 3.5], [1.3, -1.8, 3.2], [1.5, -0.8, 4.2]],
    edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 1]],
  },
  {
    name: 'Crux', yaw: 300, pitch: -10, scale: 3.6,
    points: [[0, 1.6, 1.6], [0, -1.6, 0.8], [-1.1, 0.1, 1.3], [1, 0.4, 2.8]],
    edges: [[0, 1], [2, 3]],
  },
];

// ---------- Helpers ----------
const deg = (d) => (d * Math.PI) / 180;

// Unit vector for a direction given yaw/pitch, where yaw 0 looks down -Z.
function dirFrom(yaw, pitch) {
  return new THREE.Vector3(
    -Math.sin(deg(yaw)) * Math.cos(deg(pitch)),
    Math.sin(deg(pitch)),
    -Math.cos(deg(yaw)) * Math.cos(deg(pitch))
  );
}

function gaussian() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function makeNebulaTexture(seed) {
  const size = 256;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  // Clumpy soft cloud from many overlapping radial blobs
  let s = seed * 9301 + 49297;
  const rand = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  for (let i = 0; i < 46; i++) {
    const r = 18 + rand() * 70;
    const ang = rand() * Math.PI * 2;
    const dist = Math.pow(rand(), 1.6) * 80;
    const x = size / 2 + Math.cos(ang) * dist;
    const y = size / 2 + Math.sin(ang) * dist * 0.7;
    const grd = g.createRadialGradient(x, y, 0, x, y, r);
    const a = 0.05 + rand() * 0.1;
    grd.addColorStop(0, `rgba(255,255,255,${a})`);
    grd.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, size, size);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// ---------- Shaders ----------
const starVertex = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  attribute vec3 aColor;
  uniform float uTime;
  uniform float uPixelRatio;
  varying float vAlpha;
  varying vec3 vColor;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    float tw = 0.65 + 0.35 * sin(uTime * (0.6 + aPhase * 1.7) + aPhase * 40.0);
    vAlpha = tw;
    vColor = aColor;
    gl_PointSize = clamp(aSize * uPixelRatio * (260.0 / -mv.z), 1.0, 9.0 * uPixelRatio);
  }
`;
const starFragment = /* glsl */ `
  varying float vAlpha;
  varying vec3 vColor;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float core = smoothstep(0.5, 0.0, d);
    float a = pow(core, 2.2) * vAlpha;
    if (a < 0.01) discard;
    gl_FragColor = vec4(vColor, a);
  }
`;

const sparkleVertex = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uReveal;
  varying float vAlpha;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    float pulse = 0.82 + 0.18 * sin(uTime * 1.3 + aPhase * 12.0);
    vAlpha = pulse * (0.35 + 0.65 * uReveal);
    gl_PointSize = aSize * uPixelRatio * (0.75 + 0.25 * uReveal) * pulse;
  }
`;
const sparkleFragment = /* glsl */ `
  varying float vAlpha;
  void main() {
    vec2 p = gl_PointCoord - 0.5;
    float d = length(p);
    float core = exp(-d * d * 180.0);
    float halo = exp(-d * d * 22.0) * 0.35;
    // four-point diffraction spikes
    float sx = exp(-abs(p.y) * 90.0) * smoothstep(0.5, 0.0, abs(p.x));
    float sy = exp(-abs(p.x) * 90.0) * smoothstep(0.5, 0.0, abs(p.y));
    float a = (core + halo + (sx + sy) * 0.85) * vAlpha;
    if (a < 0.01) discard;
    gl_FragColor = vec4(vec3(1.0), min(a, 1.0));
  }
`;

const lineVertex = /* glsl */ `
  attribute float aT;
  varying float vT;
  void main() {
    vT = aT;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const lineFragment = /* glsl */ `
  uniform float uReveal;
  uniform float uOpacity;
  varying float vT;
  void main() {
    float drawn = smoothstep(uReveal, uReveal - 0.02, vT);
    float a = drawn * uOpacity;
    if (a < 0.005) discard;
    gl_FragColor = vec4(vec3(0.92, 0.94, 1.0), a);
  }
`;

const trailVertex = /* glsl */ `
  attribute float aA;
  varying float vA;
  void main() {
    vA = aA;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const trailFragment = /* glsl */ `
  uniform float uOpacity;
  varying float vA;
  void main() { gl_FragColor = vec4(1.0, 1.0, 1.0, vA * uOpacity); }
`;

// ---------- Component ----------
export default function ConstellationBackground() {
  const mountRef = useRef(null);
  const [webgl, setWebgl] = useState(true);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch {
      setWebgl(false);
      return;
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isSmall = window.innerWidth < 768;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.75);

    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(isSmall ? 72 : 60, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(0, 0, 0);

    const sky = new THREE.Group();
    scene.add(sky);

    // ---- Star volume + Milky Way band ----
    const STAR_COUNT = isSmall ? 3800 : 7500;
    const positions = new Float32Array(STAR_COUNT * 3);
    const sizes = new Float32Array(STAR_COUNT);
    const phases = new Float32Array(STAR_COUNT);
    const colors = new Float32Array(STAR_COUNT * 3);
    const bandNormal = new THREE.Vector3(0.35, 1, 0.25).normalize();
    const tmp = new THREE.Vector3();
    const palette = [
      [1, 1, 1], [0.86, 0.9, 1], [0.78, 0.84, 1], [1, 0.96, 0.9], [0.92, 0.92, 0.95],
    ];

    for (let i = 0; i < STAR_COUNT; i++) {
      const inBand = Math.random() < 0.45;
      tmp.set(gaussian(), gaussian(), gaussian()).normalize();
      if (inBand) {
        // flatten onto the band's plane, keep a gaussian spread
        const h = tmp.dot(bandNormal);
        tmp.addScaledVector(bandNormal, -h + gaussian() * 0.09).normalize();
      }
      const r = 60 + Math.pow(Math.random(), 0.6) * 480;
      positions.set([tmp.x * r, tmp.y * r, tmp.z * r], i * 3);
      const bright = Math.random();
      sizes[i] = bright > 0.985 ? 3.2 + Math.random() * 2 : bright > 0.9 ? 1.9 + Math.random() : 0.8 + Math.random() * 1.1;
      phases[i] = Math.random();
      const c = palette[(Math.random() * palette.length) | 0];
      colors.set(c, i * 3);
    }

    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    starGeo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
    starGeo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
    const starMat = new THREE.ShaderMaterial({
      vertexShader: starVertex,
      fragmentShader: starFragment,
      uniforms: { uTime: { value: 0 }, uPixelRatio: { value: pixelRatio } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    sky.add(new THREE.Points(starGeo, starMat));

    // ---- Nebula haze along the band ----
    const nebulaTextures = [1, 2, 3, 4].map(makeNebulaTexture);
    const nebulae = [];
    const bandA = new THREE.Vector3(1, 0, 0).cross(bandNormal).normalize();
    const bandB = bandNormal.clone().cross(bandA).normalize();
    const NEBULA_COUNT = isSmall ? 14 : 24;
    for (let i = 0; i < NEBULA_COUNT; i++) {
      const t = (i / NEBULA_COUNT) * Math.PI * 2 + Math.random() * 0.2;
      const dir = bandA.clone().multiplyScalar(Math.cos(t)).addScaledVector(bandB, Math.sin(t))
        .addScaledVector(bandNormal, gaussian() * 0.08).normalize();
      const mat = new THREE.SpriteMaterial({
        map: nebulaTextures[i % nebulaTextures.length],
        color: i % 5 === 0 ? 0xb8c6ff : 0xffffff,
        transparent: true,
        opacity: 0.1 + Math.random() * 0.12,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const sp = new THREE.Sprite(mat);
      const r = 380 + Math.random() * 60;
      sp.position.copy(dir.multiplyScalar(r));
      const s = 170 + Math.random() * 190;
      sp.scale.set(s, s * (0.5 + Math.random() * 0.4), 1);
      mat.rotation = Math.random() * Math.PI;
      sp.userData.spin = (Math.random() - 0.5) * 0.01;
      sky.add(sp);
      nebulae.push(sp);
    }
    // Orion Nebula glow, kept close behind the sword
    const m42Mat = new THREE.SpriteMaterial({
      map: nebulaTextures[0], color: 0xdfe6ff, transparent: true, opacity: 0.45,
      depthWrite: false, blending: THREE.AdditiveBlending,
    });
    const m42 = new THREE.Sprite(m42Mat);

    // ---- Constellations ----
    const constellations = CONSTELLATIONS.map((c, ci) => {
      const group = new THREE.Group();
      // on phones Orion sits higher and more central so it isn't cropped off-screen
      const dir = ci === 0 && isSmall ? dirFrom(-6, 14) : dirFrom(c.yaw, c.pitch);
      const dist = ci === 0 ? 110 : 140;
      group.position.copy(dir.clone().multiplyScalar(dist));
      group.lookAt(0, 0, 0);

      // center the shape
      const cx = c.points.reduce((s, p) => s + p[0], 0) / c.points.length;
      const cy = c.points.reduce((s, p) => s + p[1], 0) / c.points.length;
      const pts = c.points.map(([x, y], i) => new THREE.Vector3(
        (x - cx) * c.scale,
        (y - cy) * c.scale,
        Math.sin(i * 12.9898 + ci) * 6 // depth jitter so the shape is truly 3D under parallax
      ));

      // sparkle stars
      const sp = new Float32Array(pts.length * 3);
      const ss = new Float32Array(pts.length);
      const sph = new Float32Array(pts.length);
      pts.forEach((p, i) => {
        sp.set([p.x, p.y, p.z], i * 3);
        const mag = c.points[i][2];
        ss[i] = Math.max(10, 44 - mag * 7.5) * (isSmall ? 0.8 : 1);
        sph[i] = Math.random();
      });
      const sGeo = new THREE.BufferGeometry();
      sGeo.setAttribute('position', new THREE.BufferAttribute(sp, 3));
      sGeo.setAttribute('aSize', new THREE.BufferAttribute(ss, 1));
      sGeo.setAttribute('aPhase', new THREE.BufferAttribute(sph, 1));
      const sMat = new THREE.ShaderMaterial({
        vertexShader: sparkleVertex,
        fragmentShader: sparkleFragment,
        uniforms: { uTime: { value: 0 }, uPixelRatio: { value: pixelRatio }, uReveal: { value: 0 } },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      group.add(new THREE.Points(sGeo, sMat));

      // lines with a per-vertex draw parameter so they trace themselves in order
      const lp = new Float32Array(c.edges.length * 6);
      const lt = new Float32Array(c.edges.length * 2);
      c.edges.forEach(([a, b], i) => {
        lp.set([pts[a].x, pts[a].y, pts[a].z, pts[b].x, pts[b].y, pts[b].z], i * 6);
        lt[i * 2] = i / c.edges.length;
        lt[i * 2 + 1] = (i + 1) / c.edges.length;
      });
      const lGeo = new THREE.BufferGeometry();
      lGeo.setAttribute('position', new THREE.BufferAttribute(lp, 3));
      lGeo.setAttribute('aT', new THREE.BufferAttribute(lt, 1));
      const lMat = new THREE.ShaderMaterial({
        vertexShader: lineVertex,
        fragmentShader: lineFragment,
        uniforms: { uReveal: { value: 0 }, uOpacity: { value: 0.55 } },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      group.add(new THREE.LineSegments(lGeo, lMat));

      if (ci === 0) {
        const m42Index = ORION_STARS.findIndex((s) => s[0] === 'M42');
        m42.position.copy(pts[m42Index]);
        m42.position.z -= 4;
        m42.scale.set(22, 28, 1);
        group.add(m42);
      }

      sky.add(group);
      return { group, dir, sMat, lMat, reveal: 0 };
    });

    // ---- Shooting stars ----
    const trails = [];
    const spawnTrail = () => {
      const seg = 24;
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(seg * 3);
      const al = new Float32Array(seg);
      for (let i = 0; i < seg; i++) al[i] = Math.pow(i / (seg - 1), 2.2);
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('aA', new THREE.BufferAttribute(al, 1));
      const mat = new THREE.ShaderMaterial({
        vertexShader: trailVertex, fragmentShader: trailFragment,
        uniforms: { uOpacity: { value: 1 } },
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      });
      const line = new THREE.Line(geo, mat);
      // start somewhere in front of the current view
      const fwd = new THREE.Vector3();
      camera.getWorldDirection(fwd);
      const start = fwd.multiplyScalar(160)
        .add(new THREE.Vector3((Math.random() - 0.5) * 220, 40 + Math.random() * 60, (Math.random() - 0.5) * 80));
      const vel = new THREE.Vector3(-(0.6 + Math.random() * 0.8), -(0.5 + Math.random() * 0.4), 0)
        .applyQuaternion(camera.quaternion).multiplyScalar(2.6);
      if (Math.random() < 0.5) vel.x *= -1;
      scene.add(line);
      trails.push({ line, geo, mat, head: start, vel, life: 0, seg });
    };

    // ---- Interaction state ----
    const target = { yaw: 0, pitch: 0, mx: 0, my: 0 };
    const current = { yaw: 0, pitch: 0, mx: 0, my: 0 };

    const readScroll = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const p = Math.min(1, Math.max(0, window.scrollY / max));
      target.yaw = p * 345;
      target.pitch = Math.sin(p * Math.PI * 2) * 7;
    };
    const onMouse = (e) => {
      target.mx = (e.clientX / window.innerWidth - 0.5) * 2;
      target.my = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      readScroll();
    };
    readScroll();
    window.addEventListener('scroll', readScroll, { passive: true });
    window.addEventListener('mousemove', onMouse, { passive: true });
    window.addEventListener('resize', onResize);

    // ---- Loop ----
    const clock = new THREE.Clock();
    let raf = 0;
    let running = true;
    let nextTrail = 2.5;
    const fwd = new THREE.Vector3();

    const frame = () => {
      if (!running) return;
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;

      const ease = 1 - Math.pow(0.0025, dt);
      current.yaw += (target.yaw - current.yaw) * ease;
      current.pitch += (target.pitch - current.pitch) * ease;
      current.mx += (target.mx - current.mx) * ease;
      current.my += (target.my - current.my) * ease;

      // planetarium camera: rotate to look around, translate a little for real parallax
      camera.rotation.order = 'YXZ';
      camera.rotation.y = deg(current.yaw) + current.mx * -0.06 + (reduceMotion ? 0 : Math.sin(t * 0.05) * 0.02);
      camera.rotation.x = deg(current.pitch) + current.my * -0.04;
      camera.position.set(current.mx * 9, -current.my * 6, 0);

      sky.rotation.z = reduceMotion ? 0 : t * 0.004;

      starMat.uniforms.uTime.value = t;
      nebulae.forEach((n) => { n.material.rotation += n.userData.spin * dt; });

      camera.getWorldDirection(fwd);
      constellations.forEach((c) => {
        const facing = fwd.dot(c.dir);
        const want = facing > 0.8 ? 1 : 0;
        const speed = want ? 0.45 : 1.2;
        c.reveal += Math.sign(want - c.reveal) * Math.min(Math.abs(want - c.reveal), dt * speed);
        const r = reduceMotion ? want : c.reveal;
        c.sMat.uniforms.uTime.value = t;
        c.sMat.uniforms.uReveal.value = r;
        c.lMat.uniforms.uReveal.value = r * 1.02;
      });

      if (!reduceMotion) {
        nextTrail -= dt;
        if (nextTrail <= 0) {
          spawnTrail();
          nextTrail = 3 + Math.random() * 6;
        }
      }
      for (let i = trails.length - 1; i >= 0; i--) {
        const tr = trails[i];
        tr.life += dt;
        tr.head.addScaledVector(tr.vel, dt * 60);
        const arr = tr.geo.attributes.position.array;
        for (let k = 0; k < tr.seg; k++) {
          const back = (tr.seg - 1 - k) * 1.5;
          arr[k * 3] = tr.head.x - tr.vel.x * back;
          arr[k * 3 + 1] = tr.head.y - tr.vel.y * back;
          arr[k * 3 + 2] = tr.head.z - tr.vel.z * back;
        }
        tr.geo.attributes.position.needsUpdate = true;
        tr.mat.uniforms.uOpacity.value = Math.max(0, Math.sin(Math.min(1, tr.life / 1.1) * Math.PI));
        if (tr.life > 1.1) {
          scene.remove(tr.line);
          tr.geo.dispose();
          tr.mat.dispose();
          trails.splice(i, 1);
        }
      }

      renderer.render(scene, camera);
      raf = requestAnimationFrame(frame);
    };

    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!running) {
        running = true;
        clock.getDelta();
        raf = requestAnimationFrame(frame);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    raf = requestAnimationFrame(frame);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', readScroll);
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) o.material.dispose();
      });
      nebulaTextures.forEach((tx) => tx.dispose());
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div aria-hidden="true" className="fixed inset-0 z-0 pointer-events-none">
      {/* deep space base + a soft silver glow like the poster's light core */}
      <div className="absolute inset-0 orion-space" />
      <div ref={mountRef} className={`absolute inset-0 ${webgl ? '' : 'orion-static-stars'}`} />
      <div className="absolute inset-0 orion-vignette" />
      <div className="absolute inset-0 orion-grain" />
    </div>
  );
}
