import * as THREE from "https://unpkg.com/three@0.164.1/build/three.module.js";
import { groups } from "./data.js";

const containers = {
  problem: document.getElementById("problem-items"),
  work: document.getElementById("work-items"),
  tech: document.getElementById("tech-items"),
  projects: document.getElementById("project-items")
};

const detailPop = document.getElementById("detail-pop");
const detailTitle = document.getElementById("detail-title");
const detailText = document.getElementById("detail-text");

const mapArea = document.querySelector(".map-area");
const globeWrap = document.querySelector(".globe-wrap");
const globeSceneEl = document.getElementById("globe-scene");

const canvas = document.getElementById("water-canvas");
const ctx = canvas.getContext("2d");

const pointer = {
  x: 0,
  y: 0,
  nx: 0,
  ny: 0,
  active: false
};

let canvasWidth = 0;
let canvasHeight = 0;
let dpr = Math.min(window.devicePixelRatio || 1, 1.6);

const bubbles = [];
const orbitDrops = [];
const ripples = [];
const splashParticles = [];
const mistParticles = [];

let lastPointerRipple = 0;
let lastSplashEmit = 0;
let lastAutoRipple = 0;

/* =========================
   DOM
========================= */

function closeCards() {
  document
    .querySelectorAll(".skill-card, .project-card")
    .forEach((card) => card.classList.remove("active"));

  detailPop.classList.remove("visible");
}

function createBadge(text) {
  if (!text) return null;

  const badge = document.createElement("span");
  badge.className = "badge";
  badge.textContent = text;
  return badge;
}

function createGithubFlyout(item) {
  const flyout = document.createElement("div");
  flyout.className = "github-flyout";

  const title = document.createElement("p");
  title.className = "github-flyout-title";
  title.textContent = "PROJECTS";

  const list = document.createElement("ul");
  list.className = "github-list";

  item.works.forEach((work) => {
    const li = document.createElement("li");
    const link = document.createElement("a");

    link.href = work.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    link.addEventListener("click", (event) => {
      event.stopPropagation();
    });

    const icon = document.createElement("span");
    icon.className = "work-icon";
    icon.textContent = work.icon;

    const name = document.createElement("span");
    name.textContent = work.name;

    const external = document.createElement("span");
    external.className = "external";
    external.textContent = "↗";

    link.appendChild(icon);
    link.appendChild(name);
    link.appendChild(external);

    li.appendChild(link);
    list.appendChild(li);
  });

  flyout.appendChild(title);
  flyout.appendChild(list);

  return flyout;
}

function createCard(item, groupName) {
  const card = document.createElement("div");
  card.className = groupName === "projects" ? "project-card" : "skill-card";
  card.setAttribute("role", "button");
  card.setAttribute("tabindex", "0");

  if (item.type === "github") {
    card.classList.add("github-card");
  }

  const icon = document.createElement("span");
  icon.className = "card-icon";
  icon.textContent = item.icon;

  const name = document.createElement("span");
  name.className = "card-name";
  name.textContent = item.name;

  const score = document.createElement("span");
  score.className = "score";
  score.textContent = String(item.score);

  card.appendChild(icon);
  card.appendChild(name);
  card.appendChild(score);

  const badge = createBadge(item.badge);
  if (badge) card.appendChild(badge);

  if (item.type === "github") {
    card.appendChild(createGithubFlyout(item));
  }

  function activateCard(event) {
    event.stopPropagation();

    const isAlreadyActive = card.classList.contains("active");
    closeCards();

    if (isAlreadyActive) return;

    card.classList.add("active");

    if (item.type === "github") {
      detailPop.classList.remove("visible");
      return;
    }

    detailTitle.textContent = `${item.name} / ${item.score}`;
    detailText.textContent = item.detail;
    detailPop.classList.add("visible");
  }

  card.addEventListener("click", activateCard);

  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      activateCard(event);
    }
  });

  return card;
}

function renderCards() {
  Object.entries(groups).forEach(([groupName, items]) => {
    items.forEach((item) => {
      containers[groupName].appendChild(createCard(item, groupName));
    });
  });
}

/* =========================
   POINTER
========================= */

function initPointer() {
  mapArea.addEventListener("pointermove", (event) => {
    const rect = mapArea.getBoundingClientRect();

    pointer.x = event.clientX - rect.left;
    pointer.y = event.clientY - rect.top;
    pointer.nx = pointer.x / rect.width - 0.5;
    pointer.ny = pointer.y / rect.height - 0.5;
    pointer.active = true;

    globeWrap.style.transform =
      `translate(-50%, -48%) rotateY(${pointer.nx * 6}deg) rotateX(${-pointer.ny * 5}deg)`;
  });

  mapArea.addEventListener("pointerleave", () => {
    pointer.active = false;
    pointer.nx = 0;
    pointer.ny = 0;
    globeWrap.style.transform =
      "translate(-50%, -48%) rotateY(0deg) rotateX(0deg)";
  });

  mapArea.addEventListener("click", () => {
    closeCards();
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeCards();
  });
}

/* =========================
   WATER
========================= */

class BubbleParticle {
  constructor(initial = false) {
    this.reset(initial);
  }

  reset(initial = false) {
    this.x = Math.random() * canvasWidth;
    this.y = initial
      ? Math.random() * canvasHeight
      : canvasHeight + Math.random() * 120;

    this.radius = 1 + Math.random() * 3.6;
    this.speedY = 0.25 + Math.random() * 0.95;
    this.speedX = -0.2 + Math.random() * 0.4;
    this.alpha = 0.14 + Math.random() * 0.36;
    this.phase = Math.random() * Math.PI * 2;
    this.phaseSpeed = 0.008 + Math.random() * 0.022;
    this.glow = 5 + Math.random() * 12;
  }

  update() {
    this.phase += this.phaseSpeed;
    this.x += this.speedX + Math.sin(this.phase) * 0.18;
    this.y -= this.speedY;

    if (this.y < -44 || this.x < -44 || this.x > canvasWidth + 44) {
      this.reset(false);
    }
  }

  draw(context) {
    const gradient = context.createRadialGradient(
      this.x - this.radius * 0.4,
      this.y - this.radius * 0.4,
      0,
      this.x,
      this.y,
      this.radius * 3
    );

    gradient.addColorStop(0, `rgba(255, 255, 255, ${this.alpha})`);
    gradient.addColorStop(0.38, `rgba(77, 252, 255, ${this.alpha * 0.46})`);
    gradient.addColorStop(1, "rgba(77, 252, 255, 0)");

    context.save();
    context.fillStyle = gradient;
    context.shadowBlur = this.glow;
    context.shadowColor = "rgba(77, 252, 255, 0.72)";
    context.beginPath();
    context.arc(this.x, this.y, this.radius * 2.2, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }
}

class OrbitDrop {
  constructor() {
    this.reset();
  }

  reset() {
    this.angle = Math.random() * Math.PI * 2;
    this.speed = 0.0015 + Math.random() * 0.004;
    this.radiusX = canvasWidth * (0.16 + Math.random() * 0.07);
    this.radiusY = canvasHeight * (0.09 + Math.random() * 0.045);
    this.size = 1 + Math.random() * 2.2;
    this.alpha = 0.18 + Math.random() * 0.48;
    this.offsetY = -14 + Math.random() * 28;
    this.purple = Math.random() > 0.86;
  }

  update() {
    this.angle += this.speed;
  }

  draw(context) {
    const cx = canvasWidth * 0.5;
    const cy = canvasHeight * 0.51 + this.offsetY;
    const x = cx + Math.cos(this.angle) * this.radiusX;
    const y = cy + Math.sin(this.angle) * this.radiusY;

    context.save();
    context.globalAlpha = this.alpha;
    context.fillStyle = this.purple
      ? "rgba(198, 145, 255, 0.88)"
      : "rgba(130, 250, 255, 0.9)";
    context.shadowBlur = 14;
    context.shadowColor = this.purple
      ? "rgba(178, 108, 255, 0.82)"
      : "rgba(77, 252, 255, 0.82)";
    context.beginPath();
    context.arc(x, y, this.size, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }
}

class Ripple {
  constructor(x, y, radius = 8, alpha = 0.45) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.alpha = alpha;
    this.speed = 1.2 + Math.random() * 1.2;
    this.scaleY = 0.24 + Math.random() * 0.09;
    this.lineWidth = 1 + Math.random() * 0.7;
  }

  update() {
    this.radius += this.speed;
    this.alpha *= 0.965;
  }

  draw(context) {
    context.save();
    context.translate(this.x, this.y);
    context.scale(1, this.scaleY);
    context.strokeStyle = `rgba(77, 252, 255, ${this.alpha})`;
    context.lineWidth = this.lineWidth;
    context.shadowBlur = 16;
    context.shadowColor = "rgba(77, 252, 255, 0.9)";
    context.beginPath();
    context.arc(0, 0, this.radius, 0, Math.PI * 2);
    context.stroke();
    context.restore();
  }

  get dead() {
    return this.alpha < 0.02;
  }
}

class SplashParticle {
  constructor(x, y, baseAngle, color = "cyan", powerBoost = 1) {
    const spread = 0.7;
    const power = (1 + Math.random() * 2.4) * powerBoost;

    this.x = x;
    this.y = y;
    this.vx = Math.cos(baseAngle + (Math.random() - 0.5) * spread) * power;
    this.vy = Math.sin(baseAngle + (Math.random() - 0.5) * spread) * power;
    this.life = 36 + Math.random() * 24;
    this.age = 0;
    this.size = 1 + Math.random() * 2.1;
    this.alpha = 0.34 + Math.random() * 0.42;
    this.color = color;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.045;
    this.age += 1;
    this.alpha *= 0.984;
  }

  draw(context) {
    const purple = this.color === "purple";

    context.save();
    context.globalAlpha = this.alpha;
    context.fillStyle = purple
      ? "rgba(195, 140, 255, 0.9)"
      : "rgba(130, 250, 255, 0.9)";
    context.shadowBlur = 12;
    context.shadowColor = purple
      ? "rgba(178, 108, 255, 0.84)"
      : "rgba(77, 252, 255, 0.84)";
    context.beginPath();
    context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }

  get dead() {
    return this.age >= this.life || this.alpha < 0.03;
  }
}

class MistParticle {
  constructor(initial = false) {
    this.reset(initial);
  }

  reset(initial = false) {
    const cx = canvasWidth * 0.5;
    const cy = canvasHeight * 0.47;

    this.x = cx + (Math.random() - 0.5) * canvasWidth * 0.34;
    this.y = initial
      ? cy + (Math.random() - 0.5) * canvasHeight * 0.32
      : canvasHeight * 0.75 + Math.random() * 40;

    this.radius = 9 + Math.random() * 24;
    this.alpha = 0.014 + Math.random() * 0.038;
    this.vx = -0.14 + Math.random() * 0.28;
    this.vy = -0.1 - Math.random() * 0.22;
    this.life = 260 + Math.random() * 180;
    this.age = 0;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.age += 1;

    if (this.age > this.life || this.y < canvasHeight * 0.14) {
      this.reset(false);
    }
  }

  draw(context) {
    const gradient = context.createRadialGradient(
      this.x,
      this.y,
      0,
      this.x,
      this.y,
      this.radius
    );

    gradient.addColorStop(0, `rgba(120, 255, 255, ${this.alpha})`);
    gradient.addColorStop(0.45, `rgba(77, 252, 255, ${this.alpha * 0.5})`);
    gradient.addColorStop(1, "rgba(77, 252, 255, 0)");

    context.save();
    context.fillStyle = gradient;
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }
}

function resizeCanvas() {
  const rect = mapArea.getBoundingClientRect();

  dpr = Math.min(window.devicePixelRatio || 1, 1.6);
  canvasWidth = rect.width;
  canvasHeight = rect.height;

  canvas.width = Math.floor(rect.width * dpr);
  canvas.height = Math.floor(rect.height * dpr);
  canvas.style.width = `${rect.width}px`;
  canvas.style.height = `${rect.height}px`;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function buildWaterScene() {
  bubbles.length = 0;
  orbitDrops.length = 0;
  ripples.length = 0;
  splashParticles.length = 0;
  mistParticles.length = 0;

  const bubbleCount = Math.max(42, Math.floor((canvasWidth * canvasHeight) / 26000));
  const orbitCount = Math.max(34, Math.floor(canvasWidth / 30));
  const mistCount = Math.max(16, Math.floor(canvasWidth / 60));

  for (let i = 0; i < bubbleCount; i += 1) {
    bubbles.push(new BubbleParticle(true));
  }

  for (let i = 0; i < orbitCount; i += 1) {
    orbitDrops.push(new OrbitDrop());
  }

  for (let i = 0; i < mistCount; i += 1) {
    mistParticles.push(new MistParticle(true));
  }
}

function spawnRipple(x, y, radius = 8, alpha = 0.45) {
  ripples.push(new Ripple(x, y, radius, alpha));
}

function emitFountainSplash() {
  const cx = canvasWidth * 0.5;
  const baseY = canvasHeight * 0.78;

  for (let i = 0; i < 5; i += 1) {
    splashParticles.push(
      new SplashParticle(
        cx + (Math.random() - 0.5) * 24,
        baseY - 14,
        -Math.PI / 2,
        Math.random() > 0.88 ? "purple" : "cyan",
        0.95
      )
    );
  }
}

function drawBackdropGlow(context, time) {
  const cx = canvasWidth * 0.5;
  const cy = canvasHeight * 0.51;
  const pulse = 0.92 + Math.sin(time * 0.0012) * 0.07;

  const glow = context.createRadialGradient(
    cx,
    cy,
    0,
    cx,
    cy,
    Math.min(canvasWidth, canvasHeight) * 0.34
  );

  glow.addColorStop(0, "rgba(77, 252, 255, 0.18)");
  glow.addColorStop(0.45, "rgba(28, 168, 255, 0.08)");
  glow.addColorStop(1, "rgba(28, 168, 255, 0)");

  context.save();
  context.globalAlpha = pulse;
  context.fillStyle = glow;
  context.fillRect(0, 0, canvasWidth, canvasHeight);
  context.restore();
}

function drawFlowLines(context, time) {
  context.save();

  for (let i = 0; i < 10; i += 1) {
    const baseY = canvasHeight * (0.72 + i * 0.022);

    context.beginPath();
    context.moveTo(-80, baseY);

    for (let x = 0; x <= canvasWidth + 100; x += 90) {
      const waveY =
        baseY +
        Math.sin(x * 0.011 + time * 0.0017 + i) * 7 +
        Math.cos(x * 0.004 - time * 0.0012) * 3;

      context.quadraticCurveTo(x - 28, waveY, x, waveY);
    }

    context.strokeStyle = `rgba(77, 252, 255, ${0.04 + i * 0.006})`;
    context.lineWidth = 1;
    context.shadowBlur = 8;
    context.shadowColor = "rgba(77, 252, 255, 0.35)";
    context.stroke();
  }

  context.restore();
}

function drawGlobeMist(context, time) {
  const cx = canvasWidth * 0.5;
  const cy = canvasHeight * 0.5;
  const radius = Math.min(canvasWidth, canvasHeight) * 0.23;

  context.save();

  for (let i = 0; i < 3; i += 1) {
    const r = radius + i * 14 + Math.sin(time * 0.0014 + i) * 5;

    context.beginPath();
    context.ellipse(
      cx,
      cy + Math.sin(time * 0.001 + i) * 7,
      r * 1.08,
      r * 0.68,
      Math.sin(time * 0.0007 + i) * 0.18,
      0,
      Math.PI * 2
    );

    context.strokeStyle = `rgba(77, 252, 255, ${0.08 - i * 0.014})`;
    context.lineWidth = 2;
    context.shadowBlur = 16;
    context.shadowColor = "rgba(77, 252, 255, 0.52)";
    context.stroke();
  }

  context.restore();
}

function drawFountainBeam(context, time) {
  const cx = canvasWidth * 0.5;
  const baseY = canvasHeight * 0.78;
  const sway = Math.sin(time * 0.002) * 10;

  const beam = context.createLinearGradient(cx, baseY, cx, baseY - 230);
  beam.addColorStop(0, "rgba(77, 252, 255, 0.76)");
  beam.addColorStop(0.38, "rgba(77, 252, 255, 0.22)");
  beam.addColorStop(1, "rgba(77, 252, 255, 0)");

  context.save();
  context.strokeStyle = beam;
  context.lineWidth = 4;
  context.shadowBlur = 24;
  context.shadowColor = "rgba(77, 252, 255, 0.75)";

  context.beginPath();
  context.moveTo(cx, baseY);
  context.bezierCurveTo(
    cx - 22 + sway,
    baseY - 78,
    cx + 20 - sway,
    baseY - 150,
    cx,
    baseY - 230
  );
  context.stroke();
  context.restore();
}

function drawBaseGlow(context, time) {
  const cx = canvasWidth * 0.5;
  const cy = canvasHeight * 0.79;
  const pulse = 1 + Math.sin(time * 0.003) * 0.07;

  context.save();
  context.translate(cx, cy);
  context.scale(1.12 * pulse, 0.3 * pulse);

  const gradient = context.createRadialGradient(0, 0, 10, 0, 0, 150);
  gradient.addColorStop(0, "rgba(255, 255, 255, 0.2)");
  gradient.addColorStop(0.22, "rgba(77, 252, 255, 0.26)");
  gradient.addColorStop(0.72, "rgba(28, 168, 255, 0.1)");
  gradient.addColorStop(1, "rgba(28, 168, 255, 0)");

  context.fillStyle = gradient;
  context.beginPath();
  context.arc(0, 0, 150, 0, Math.PI * 2);
  context.fill();
  context.restore();
}

function animateWater(time = 0) {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  drawBackdropGlow(ctx, time);
  drawFlowLines(ctx, time);
  drawBaseGlow(ctx, time);
  drawGlobeMist(ctx, time);
  drawFountainBeam(ctx, time);

  mistParticles.forEach((particle) => {
    particle.update();
    particle.draw(ctx);
  });

  bubbles.forEach((bubble) => {
    bubble.update();
    bubble.draw(ctx);
  });

  orbitDrops.forEach((drop) => {
    drop.update();
    drop.draw(ctx);
  });

  if (time - lastSplashEmit > 80) {
    emitFountainSplash();
    lastSplashEmit = time;
  }

  if (time - lastAutoRipple > 950) {
    spawnRipple(
      canvasWidth * 0.5 + (Math.random() - 0.5) * 80,
      canvasHeight * 0.79,
      10,
      0.38
    );
    lastAutoRipple = time;
  }

  if (pointer.active && time - lastPointerRipple > 48) {
    spawnRipple(pointer.x, pointer.y, 4, 0.48);
    spawnRipple(pointer.x, pointer.y, 15, 0.2);
    lastPointerRipple = time;
  }

  for (let i = splashParticles.length - 1; i >= 0; i -= 1) {
    const particle = splashParticles[i];
    particle.update();
    particle.draw(ctx);

    if (particle.dead) splashParticles.splice(i, 1);
  }

  for (let i = ripples.length - 1; i >= 0; i -= 1) {
    const ripple = ripples[i];
    ripple.update();
    ripple.draw(ctx);

    if (ripple.dead) ripples.splice(i, 1);
  }

  requestAnimationFrame(animateWater);
}

/* =========================
   THREE GLOBE
========================= */

let renderer;
let scene;
let camera;
let globeGroup;
let earthMesh;
let wireMesh;
let atmosphereMesh;
let liquidShell;
let particleSystem;
let ringA;
let ringB;
let ringC;
let ringD;

function createGlowSpriteTexture() {
  const size = 96;
  const spriteCanvas = document.createElement("canvas");
  spriteCanvas.width = size;
  spriteCanvas.height = size;

  const spriteCtx = spriteCanvas.getContext("2d");
  const gradient = spriteCtx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2
  );

  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.22, "rgba(125,255,255,0.9)");
  gradient.addColorStop(0.55, "rgba(77,252,255,0.28)");
  gradient.addColorStop(1, "rgba(77,252,255,0)");

  spriteCtx.fillStyle = gradient;
  spriteCtx.fillRect(0, 0, size, size);

  return new THREE.CanvasTexture(spriteCanvas);
}

function createEarthTexture() {
  const size = 768;
  const textureCanvas = document.createElement("canvas");
  textureCanvas.width = size;
  textureCanvas.height = size / 2;

  const tctx = textureCanvas.getContext("2d");

  const bg = tctx.createLinearGradient(0, 0, 0, size / 2);
  bg.addColorStop(0, "rgba(5, 60, 95, 0.35)");
  bg.addColorStop(0.5, "rgba(3, 28, 54, 0.5)");
  bg.addColorStop(1, "rgba(5, 60, 95, 0.35)");

  tctx.fillStyle = bg;
  tctx.fillRect(0, 0, size, size / 2);

  tctx.strokeStyle = "rgba(77, 252, 255, 0.22)";
  tctx.lineWidth = 1;

  for (let x = 0; x <= size; x += 44) {
    tctx.beginPath();
    tctx.moveTo(x, 0);
    tctx.lineTo(x, size / 2);
    tctx.stroke();
  }

  for (let y = 0; y <= size / 2; y += 34) {
    tctx.beginPath();
    tctx.moveTo(0, y);
    tctx.lineTo(size, y);
    tctx.stroke();
  }

  const landShapes = [
    [[130, 118], [176, 92], [224, 108], [250, 140], [218, 166], [176, 170], [138, 152]],
    [[315, 86], [352, 66], [408, 78], [445, 110], [430, 154], [388, 172], [344, 152], [302, 116]],
    [[442, 180], [500, 164], [548, 194], [540, 238], [492, 264], [452, 234]],
    [[560, 94], [612, 80], [668, 104], [700, 144], [676, 184], [616, 190], [574, 162]]
  ];

  landShapes.forEach((points) => {
    tctx.beginPath();

    points.forEach(([x, y], index) => {
      if (index === 0) tctx.moveTo(x, y);
      else tctx.lineTo(x, y);
    });

    tctx.closePath();

    tctx.fillStyle = "rgba(77, 252, 255, 0.38)";
    tctx.shadowBlur = 22;
    tctx.shadowColor = "rgba(77, 252, 255, 0.9)";
    tctx.fill();

    tctx.strokeStyle = "rgba(210, 255, 255, 0.7)";
    tctx.lineWidth = 2;
    tctx.stroke();
  });

  for (let i = 0; i < 260; i += 1) {
    const x = Math.random() * size;
    const y = Math.random() * size / 2;
    const r = Math.random() * 1.4;

    tctx.fillStyle = `rgba(155, 255, 255, ${0.08 + Math.random() * 0.22})`;
    tctx.beginPath();
    tctx.arc(x, y, r, 0, Math.PI * 2);
    tctx.fill();
  }

  return new THREE.CanvasTexture(textureCanvas);
}

function createRing(radius, tube, color, opacity) {
  const geometry = new THREE.TorusGeometry(radius, tube, 8, 144);
  const material = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  return new THREE.Mesh(geometry, material);
}

function initThreeGlobe() {
  const rect = globeSceneEl.getBoundingClientRect();

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(42, rect.width / rect.height, 0.1, 100);
  camera.position.set(0, 0, 6.2);

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
  renderer.setSize(rect.width, rect.height);
  renderer.setClearColor(0x000000, 0);
  globeSceneEl.appendChild(renderer.domElement);

  globeGroup = new THREE.Group();
  scene.add(globeGroup);

  const earthTexture = createEarthTexture();

  const earthGeometry = new THREE.SphereGeometry(1.68, 96, 96);
  const earthMaterial = new THREE.MeshBasicMaterial({
    map: earthTexture,
    color: 0x9dfcff,
    transparent: true,
    opacity: 0.96,
    blending: THREE.AdditiveBlending
  });

  earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
  globeGroup.add(earthMesh);

  const wireGeometry = new THREE.SphereGeometry(1.7, 34, 24);
  const wireMaterial = new THREE.MeshBasicMaterial({
    color: 0x4dfcff,
    wireframe: true,
    transparent: true,
    opacity: 0.18,
    blending: THREE.AdditiveBlending
  });

  wireMesh = new THREE.Mesh(wireGeometry, wireMaterial);
  globeGroup.add(wireMesh);

  const atmosphereGeometry = new THREE.SphereGeometry(1.84, 96, 96);
  const atmosphereMaterial = new THREE.MeshBasicMaterial({
    color: 0x4dfcff,
    transparent: true,
    opacity: 0.12,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    depthWrite: false
  });

  atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
  globeGroup.add(atmosphereMesh);

  const liquidGeometry = new THREE.IcosahedronGeometry(1.98, 4);
  const liquidMaterial = new THREE.MeshBasicMaterial({
    color: 0x70ffff,
    transparent: true,
    opacity: 0.075,
    wireframe: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  liquidShell = new THREE.Mesh(liquidGeometry, liquidMaterial);
  globeGroup.add(liquidShell);

  ringA = createRing(2.12, 0.006, 0x4dfcff, 0.42);
  ringA.rotation.x = Math.PI * 0.52;
  ringA.rotation.z = Math.PI * 0.05;
  globeGroup.add(ringA);

  ringB = createRing(2.3, 0.005, 0xb26cff, 0.26);
  ringB.rotation.x = Math.PI * 0.48;
  ringB.rotation.z = Math.PI * 0.36;
  globeGroup.add(ringB);

  ringC = createRing(2.02, 0.004, 0x9cfaff, 0.3);
  ringC.rotation.x = Math.PI * 0.15;
  ringC.rotation.y = Math.PI * 0.62;
  globeGroup.add(ringC);

  ringD = createRing(1.86, 0.004, 0x4dfcff, 0.2);
  ringD.rotation.x = Math.PI * 0.28;
  ringD.rotation.y = Math.PI * 0.88;
  globeGroup.add(ringD);

  const particleCount = 540;
  const positions = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i += 1) {
    const radius = 2.02 + Math.random() * 0.64;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.cos(phi) * 0.72;
    positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
  }

  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const particleMaterial = new THREE.PointsMaterial({
    map: createGlowSpriteTexture(),
    color: 0x95ffff,
    size: 0.052,
    transparent: true,
    opacity: 0.82,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  particleSystem = new THREE.Points(particleGeometry, particleMaterial);
  globeGroup.add(particleSystem);
}

function resizeThreeGlobe() {
  if (!renderer || !camera) return;

  const rect = globeSceneEl.getBoundingClientRect();

  camera.aspect = rect.width / rect.height;
  camera.updateProjectionMatrix();

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
  renderer.setSize(rect.width, rect.height);
}

function animateThreeGlobe(time = 0) {
  if (!renderer) return;

  const t = time * 0.001;

  earthMesh.rotation.y += 0.002;
  earthMesh.rotation.x = Math.sin(t * 0.42) * 0.035;

  wireMesh.rotation.y -= 0.0015;
  wireMesh.rotation.x = Math.sin(t * 0.35) * 0.07;

  atmosphereMesh.rotation.y += 0.001;

  liquidShell.rotation.y -= 0.0023;
  liquidShell.rotation.x = Math.sin(t * 0.7) * 0.1;
  liquidShell.scale.setScalar(1 + Math.sin(t * 1.6) * 0.025);

  ringA.rotation.z += 0.0026;
  ringB.rotation.z -= 0.0019;
  ringC.rotation.y += 0.0023;
  ringD.rotation.y -= 0.0027;

  particleSystem.rotation.y += 0.0017;
  particleSystem.rotation.x = Math.sin(t * 0.5) * 0.07;

  globeGroup.rotation.y += (pointer.nx * 0.28 - globeGroup.rotation.y) * 0.04;
  globeGroup.rotation.x += (-pointer.ny * 0.2 - globeGroup.rotation.x) * 0.04;

  renderer.render(scene, camera);

  requestAnimationFrame(animateThreeGlobe);
}

/* =========================
   INIT
========================= */

function handleResize() {
  resizeCanvas();
  buildWaterScene();
  resizeThreeGlobe();
}

function init() {
  renderCards();
  initPointer();

  resizeCanvas();
  buildWaterScene();

  initThreeGlobe();
  resizeThreeGlobe();

  requestAnimationFrame(animateWater);
  requestAnimationFrame(animateThreeGlobe);
}

window.addEventListener("resize", handleResize);
init();