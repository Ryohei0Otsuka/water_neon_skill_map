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
let dpr = Math.min(window.devicePixelRatio || 1, 2);

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

    if (isAlreadyActive) {
      return;
    }

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
      `translate(-50%, -48%) rotateY(${pointer.nx * 7}deg) rotateX(${-pointer.ny * 6}deg)`;
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
    if (event.key === "Escape") {
      closeCards();
    }
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

    this.radius = 1 + Math.random() * 4.8;
    this.speedY = 0.34 + Math.random() * 1.25;
    this.speedX = -0.28 + Math.random() * 0.56;
    this.alpha = 0.16 + Math.random() * 0.48;
    this.phase = Math.random() * Math.PI * 2;
    this.phaseSpeed = 0.01 + Math.random() * 0.03;
    this.glow = 6 + Math.random() * 20;
  }

  update() {
    this.phase += this.phaseSpeed;
    this.x += this.speedX + Math.sin(this.phase) * 0.24;
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
    gradient.addColorStop(0.35, `rgba(77, 252, 255, ${this.alpha * 0.5})`);
    gradient.addColorStop(1, "rgba(77, 252, 255, 0)");

    context.save();
    context.fillStyle = gradient;
    context.shadowBlur = this.glow;
    context.shadowColor = "rgba(77, 252, 255, 0.85)";
    context.beginPath();
    context.arc(this.x, this.y, this.radius * 2.4, 0, Math.PI * 2);
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
    this.speed = 0.002 + Math.random() * 0.006;
    this.radiusX = canvasWidth * (0.17 + Math.random() * 0.08);
    this.radiusY = canvasHeight * (0.1 + Math.random() * 0.05);
    this.size = 1 + Math.random() * 2.8;
    this.alpha = 0.22 + Math.random() * 0.6;
    this.offsetY = -14 + Math.random() * 28;
    this.purple = Math.random() > 0.84;
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
      ? "rgba(198, 145, 255, 0.9)"
      : "rgba(130, 250, 255, 0.94)";
    context.shadowBlur = 18;
    context.shadowColor = this.purple
      ? "rgba(178, 108, 255, 0.96)"
      : "rgba(77, 252, 255, 0.96)";
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
    this.speed = 1.4 + Math.random() * 1.4;
    this.scaleY = 0.25 + Math.random() * 0.09;
    this.lineWidth = 1.2 + Math.random() * 0.8;
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
    context.shadowBlur = 18;
    context.shadowColor = "rgba(77, 252, 255, 0.95)";
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
    const spread = 0.72;
    const power = (1.2 + Math.random() * 3.4) * powerBoost;

    this.x = x;
    this.y = y;
    this.vx = Math.cos(baseAngle + (Math.random() - 0.5) * spread) * power;
    this.vy = Math.sin(baseAngle + (Math.random() - 0.5) * spread) * power;
    this.life = 42 + Math.random() * 32;
    this.age = 0;
    this.size = 1 + Math.random() * 2.7;
    this.alpha = 0.44 + Math.random() * 0.52;
    this.color = color;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.046;
    this.age += 1;
    this.alpha *= 0.984;
  }

  draw(context) {
    const purple = this.color === "purple";

    context.save();
    context.globalAlpha = this.alpha;
    context.fillStyle = purple
      ? "rgba(195, 140, 255, 0.92)"
      : "rgba(130, 250, 255, 0.92)";
    context.shadowBlur = 16;
    context.shadowColor = purple
      ? "rgba(178, 108, 255, 0.98)"
      : "rgba(77, 252, 255, 0.98)";
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

    this.radius = 10 + Math.random() * 30;
    this.alpha = 0.018 + Math.random() * 0.05;
    this.vx = -0.18 + Math.random() * 0.36;
    this.vy = -0.12 - Math.random() * 0.28;
    this.life = 240 + Math.random() * 200;
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

/* =========================
   CANVAS SETUP
========================= */

function resizeCanvas() {
  const rect = mapArea.getBoundingClientRect();

  dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvasWidth = rect.width;
  canvasHeight = rect.height;

  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
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

  const bubbleCount = Math.max(72, Math.floor((canvasWidth * canvasHeight) / 16000));
  const orbitCount = Math.max(68, Math.floor(canvasWidth / 16));
  const mistCount = Math.max(28, Math.floor(canvasWidth / 34));

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

  for (let i = 0; i < 8; i += 1) {
    splashParticles.push(
      new SplashParticle(
        cx + (Math.random() - 0.5) * 26,
        baseY - 14,
        -Math.PI / 2,
        Math.random() > 0.86 ? "purple" : "cyan",
        1.05
      )
    );
  }
}

/* =========================
   CANVAS DRAWING
========================= */

function drawBackdropGlow(context, time) {
  const cx = canvasWidth * 0.5;
  const cy = canvasHeight * 0.51;
  const pulse = 0.94 + Math.sin(time * 0.0014) * 0.08;

  const glow = context.createRadialGradient(
    cx,
    cy,
    0,
    cx,
    cy,
    Math.min(canvasWidth, canvasHeight) * 0.36
  );

  glow.addColorStop(0, "rgba(77, 252, 255, 0.22)");
  glow.addColorStop(0.42, "rgba(28, 168, 255, 0.1)");
  glow.addColorStop(1, "rgba(28, 168, 255, 0)");

  context.save();
  context.globalAlpha = pulse;
  context.fillStyle = glow;
  context.fillRect(0, 0, canvasWidth, canvasHeight);
  context.restore();
}

function drawFlowLines(context, time) {
  context.save();

  for (let i = 0; i < 14; i += 1) {
    const baseY = canvasHeight * (0.71 + i * 0.02);
    const drift = Math.sin(time * 0.001 + i * 0.7) * 24;

    context.beginPath();
    context.moveTo(-80, baseY);

    for (let x = 0; x <= canvasWidth + 100; x += 70) {
      const waveY =
        baseY +
        Math.sin(x * 0.012 + time * 0.002 + i) * 8 +
        Math.cos(x * 0.004 - time * 0.0015) * 4;

      context.quadraticCurveTo(x - 22, waveY + drift * 0.03, x, waveY);
    }

    context.strokeStyle = `rgba(77, 252, 255, ${0.052 + i * 0.008})`;
    context.lineWidth = 1;
    context.shadowBlur = 10;
    context.shadowColor = "rgba(77, 252, 255, 0.45)";
    context.stroke();
  }

  context.restore();
}

function drawSideWaterArcs(context, time) {
  const cx = canvasWidth * 0.5;
  const cy = canvasHeight * 0.48;
  const w = canvasWidth;
  const h = canvasHeight;

  context.save();
  context.lineCap = "round";
  context.lineJoin = "round";

  for (let i = 0; i < 5; i += 1) {
    const side = i % 2 === 0 ? -1 : 1;
    const startX = cx + side * w * (0.21 + i * 0.018);
    const startY = cy + h * (0.02 + i * 0.012);
    const endX = cx + side * w * (0.36 + i * 0.012);
    const endY = cy - h * (0.27 - i * 0.018);
    const controlX = cx + side * w * (0.34 + i * 0.02);
    const controlY = cy - h * (0.16 + Math.sin(time * 0.001 + i) * 0.025);
    const alpha = 0.18 - i * 0.02;

    context.beginPath();
    context.moveTo(startX, startY);
    context.quadraticCurveTo(controlX, controlY, endX, endY);

    context.strokeStyle = side > 0
      ? `rgba(160, 105, 255, ${alpha})`
      : `rgba(77, 252, 255, ${alpha + 0.04})`;

    context.lineWidth = 6 - i * 0.7;
    context.shadowBlur = 20;
    context.shadowColor = side > 0
      ? "rgba(178, 108, 255, 0.7)"
      : "rgba(77, 252, 255, 0.72)";
    context.stroke();

    context.lineWidth = 1.2;
    context.strokeStyle = `rgba(230, 255, 255, ${alpha + 0.05})`;
    context.stroke();
  }

  context.restore();
}

function drawGlobeMist(context, time) {
  const cx = canvasWidth * 0.5;
  const cy = canvasHeight * 0.5;
  const radius = Math.min(canvasWidth, canvasHeight) * 0.245;

  context.save();

  for (let i = 0; i < 4; i += 1) {
    const r = radius + i * 12 + Math.sin(time * 0.0015 + i) * 6;

    context.beginPath();
    context.ellipse(
      cx,
      cy + Math.sin(time * 0.001 + i) * 8,
      r * 1.12,
      r * 0.72,
      Math.sin(time * 0.0007 + i) * 0.2,
      0,
      Math.PI * 2
    );

    context.strokeStyle = `rgba(77, 252, 255, ${0.11 - i * 0.018})`;
    context.lineWidth = 2;
    context.shadowBlur = 22;
    context.shadowColor = "rgba(77, 252, 255, 0.7)";
    context.stroke();
  }

  context.restore();
}

function drawSplashCrown(context, time) {
  const cx = canvasWidth * 0.5;
  const cy = canvasHeight * 0.45;
  const radius = Math.min(canvasWidth, canvasHeight) * 0.235;

  context.save();
  context.lineCap = "round";

  for (let i = 0; i < 16; i += 1) {
    const ratio = i / 15;
    const angle = Math.PI * (1.08 + ratio * 0.86);
    const wave = Math.sin(time * 0.002 + i * 0.8) * 12;

    const x1 = cx + Math.cos(angle) * radius * 1.04;
    const y1 = cy + Math.sin(angle) * radius * 0.7;
    const x2 = cx + Math.cos(angle) * (radius * 1.13 + wave);
    const y2 = cy + Math.sin(angle) * (radius * 0.78 + wave * 0.4) - 22;

    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);

    context.strokeStyle = `rgba(130, 250, 255, ${0.22 + Math.sin(time * 0.002 + i) * 0.05})`;
    context.lineWidth = 1.4 + Math.sin(time * 0.003 + i) * 0.4;
    context.shadowBlur = 14;
    context.shadowColor = "rgba(77, 252, 255, 0.8)";
    context.stroke();

    context.beginPath();
    context.arc(x2, y2, 1.2 + (i % 3), 0, Math.PI * 2);
    context.fillStyle = "rgba(180, 255, 255, 0.6)";
    context.fill();
  }

  context.restore();
}

function drawFountainBeam(context, time) {
  const cx = canvasWidth * 0.5;
  const baseY = canvasHeight * 0.78;
  const sway = Math.sin(time * 0.002) * 12;

  const beam = context.createLinearGradient(cx, baseY, cx, baseY - 250);
  beam.addColorStop(0, "rgba(77, 252, 255, 1)");
  beam.addColorStop(0.35, "rgba(77, 252, 255, 0.3)");
  beam.addColorStop(1, "rgba(77, 252, 255, 0)");

  context.save();
  context.strokeStyle = beam;
  context.lineWidth = 5;
  context.shadowBlur = 34;
  context.shadowColor = "rgba(77, 252, 255, 1)";

  context.beginPath();
  context.moveTo(cx, baseY);
  context.bezierCurveTo(
    cx - 26 + sway,
    baseY - 82,
    cx + 22 - sway,
    baseY - 168,
    cx,
    baseY - 248
  );
  context.stroke();
  context.restore();
}

function drawBaseGlow(context, time) {
  const cx = canvasWidth * 0.5;
  const cy = canvasHeight * 0.79;
  const pulse = 1 + Math.sin(time * 0.003) * 0.08;

  context.save();
  context.translate(cx, cy);
  context.scale(1.16 * pulse, 0.32 * pulse);

  const gradient = context.createRadialGradient(0, 0, 10, 0, 0, 165);
  gradient.addColorStop(0, "rgba(255, 255, 255, 0.28)");
  gradient.addColorStop(0.2, "rgba(77, 252, 255, 0.34)");
  gradient.addColorStop(0.7, "rgba(28, 168, 255, 0.14)");
  gradient.addColorStop(1, "rgba(28, 168, 255, 0)");

  context.fillStyle = gradient;
  context.beginPath();
  context.arc(0, 0, 165, 0, Math.PI * 2);
  context.fill();
  context.restore();
}

function animateWater(time = 0) {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  drawBackdropGlow(ctx, time);
  drawSideWaterArcs(ctx, time);
  drawFlowLines(ctx, time);
  drawBaseGlow(ctx, time);
  drawGlobeMist(ctx, time);

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

  drawSplashCrown(ctx, time);
  drawFountainBeam(ctx, time);

  if (time - lastSplashEmit > 55) {
    emitFountainSplash();
    lastSplashEmit = time;
  }

  if (time - lastAutoRipple > 720) {
    spawnRipple(
      canvasWidth * 0.5 + (Math.random() - 0.5) * 80,
      canvasHeight * 0.79,
      10,
      0.5
    );
    lastAutoRipple = time;
  }

  if (pointer.active && time - lastPointerRipple > 58) {
    spawnRipple(pointer.x, pointer.y, 4, 0.42);
    spawnRipple(pointer.x, pointer.y, 15, 0.18);
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
  const size = 128;
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
  gradient.addColorStop(0.55, "rgba(77,252,255,0.32)");
  gradient.addColorStop(1, "rgba(77,252,255,0)");

  spriteCtx.fillStyle = gradient;
  spriteCtx.fillRect(0, 0, size, size);

  return new THREE.CanvasTexture(spriteCanvas);
}

function createEarthTexture() {
  const size = 1024;
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

  tctx.strokeStyle = "rgba(77, 252, 255, 0.24)";
  tctx.lineWidth = 1;

  for (let x = 0; x <= size; x += 48) {
    tctx.beginPath();
    tctx.moveTo(x, 0);
    tctx.lineTo(x, size / 2);
    tctx.stroke();
  }

  for (let y = 0; y <= size / 2; y += 36) {
    tctx.beginPath();
    tctx.moveTo(0, y);
    tctx.lineTo(size, y);
    tctx.stroke();
  }

  const landShapes = [
    [[180, 150], [230, 120], [290, 138], [322, 176], [286, 210], [230, 218], [188, 198]],
    [[420, 110], [468, 86], [540, 102], [590, 144], [570, 198], [510, 220], [452, 196], [400, 154]],
    [[590, 235], [660, 215], [720, 250], [710, 305], [650, 338], [602, 306]],
    [[740, 122], [802, 104], [876, 132], [914, 185], [884, 238], [808, 246], [756, 210]],
    [[810, 300], [854, 286], [912, 318], [930, 360], [882, 396], [820, 376]]
  ];

  landShapes.forEach((points) => {
    tctx.beginPath();

    points.forEach(([x, y], index) => {
      if (index === 0) {
        tctx.moveTo(x, y);
      } else {
        tctx.lineTo(x, y);
      }
    });

    tctx.closePath();

    tctx.fillStyle = "rgba(77, 252, 255, 0.42)";
    tctx.shadowBlur = 28;
    tctx.shadowColor = "rgba(77, 252, 255, 1)";
    tctx.fill();

    tctx.strokeStyle = "rgba(210, 255, 255, 0.78)";
    tctx.lineWidth = 2;
    tctx.stroke();
  });

  for (let i = 0; i < 420; i += 1) {
    const x = Math.random() * size;
    const y = Math.random() * size / 2;
    const r = Math.random() * 1.7;

    tctx.fillStyle = `rgba(155, 255, 255, ${0.08 + Math.random() * 0.25})`;
    tctx.beginPath();
    tctx.arc(x, y, r, 0, Math.PI * 2);
    tctx.fill();
  }

  return new THREE.CanvasTexture(textureCanvas);
}

function createRing(radius, tube, color, opacity) {
  const geometry = new THREE.TorusGeometry(radius, tube, 8, 180);
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

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(rect.width, rect.height);
  renderer.setClearColor(0x000000, 0);
  globeSceneEl.appendChild(renderer.domElement);

  globeGroup = new THREE.Group();
  scene.add(globeGroup);

  const earthTexture = createEarthTexture();

  const earthGeometry = new THREE.SphereGeometry(1.68, 128, 128);
  const earthMaterial = new THREE.MeshBasicMaterial({
    map: earthTexture,
    color: 0x9dfcff,
    transparent: true,
    opacity: 0.98,
    blending: THREE.AdditiveBlending
  });

  earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
  globeGroup.add(earthMesh);

  const wireGeometry = new THREE.SphereGeometry(1.7, 44, 30);
  const wireMaterial = new THREE.MeshBasicMaterial({
    color: 0x4dfcff,
    wireframe: true,
    transparent: true,
    opacity: 0.2,
    blending: THREE.AdditiveBlending
  });

  wireMesh = new THREE.Mesh(wireGeometry, wireMaterial);
  globeGroup.add(wireMesh);

  const atmosphereGeometry = new THREE.SphereGeometry(1.84, 128, 128);
  const atmosphereMaterial = new THREE.MeshBasicMaterial({
    color: 0x4dfcff,
    transparent: true,
    opacity: 0.14,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    depthWrite: false
  });

  atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
  globeGroup.add(atmosphereMesh);

  const liquidGeometry = new THREE.IcosahedronGeometry(1.98, 5);
  const liquidMaterial = new THREE.MeshBasicMaterial({
    color: 0x70ffff,
    transparent: true,
    opacity: 0.09,
    wireframe: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  liquidShell = new THREE.Mesh(liquidGeometry, liquidMaterial);
  globeGroup.add(liquidShell);

  ringA = createRing(2.12, 0.006, 0x4dfcff, 0.48);
  ringA.rotation.x = Math.PI * 0.52;
  ringA.rotation.z = Math.PI * 0.05;
  globeGroup.add(ringA);

  ringB = createRing(2.3, 0.005, 0xb26cff, 0.3);
  ringB.rotation.x = Math.PI * 0.48;
  ringB.rotation.z = Math.PI * 0.36;
  globeGroup.add(ringB);

  ringC = createRing(2.02, 0.004, 0x9cfaff, 0.34);
  ringC.rotation.x = Math.PI * 0.15;
  ringC.rotation.y = Math.PI * 0.62;
  globeGroup.add(ringC);

  ringD = createRing(1.86, 0.004, 0x4dfcff, 0.24);
  ringD.rotation.x = Math.PI * 0.28;
  ringD.rotation.y = Math.PI * 0.88;
  globeGroup.add(ringD);

  const particleCount = 960;
  const positions = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i += 1) {
    const radius = 2.02 + Math.random() * 0.68;
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
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  particleSystem = new THREE.Points(particleGeometry, particleMaterial);
  globeGroup.add(particleSystem);

  const lightA = new THREE.PointLight(0x4dfcff, 3, 8);
  lightA.position.set(2, 1.6, 3);
  scene.add(lightA);

  const lightB = new THREE.PointLight(0xb26cff, 1.8, 8);
  lightB.position.set(-2.5, -1.2, 2);
  scene.add(lightB);
}

function resizeThreeGlobe() {
  if (!renderer || !camera) return;

  const rect = globeSceneEl.getBoundingClientRect();

  camera.aspect = rect.width / rect.height;
  camera.updateProjectionMatrix();

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(rect.width, rect.height);
}

function animateThreeGlobe(time = 0) {
  if (!renderer) return;

  const t = time * 0.001;

  earthMesh.rotation.y += 0.0022;
  earthMesh.rotation.x = Math.sin(t * 0.42) * 0.04;

  wireMesh.rotation.y -= 0.0018;
  wireMesh.rotation.x = Math.sin(t * 0.35) * 0.08;

  atmosphereMesh.rotation.y += 0.0012;

  liquidShell.rotation.y -= 0.0027;
  liquidShell.rotation.x = Math.sin(t * 0.7) * 0.12;
  liquidShell.scale.setScalar(1 + Math.sin(t * 1.6) * 0.03);

  ringA.rotation.z += 0.003;
  ringB.rotation.z -= 0.0022;
  ringC.rotation.y += 0.0026;
  ringD.rotation.y -= 0.0031;

  particleSystem.rotation.y += 0.002;
  particleSystem.rotation.x = Math.sin(t * 0.5) * 0.08;

  globeGroup.rotation.y += (pointer.nx * 0.32 - globeGroup.rotation.y) * 0.045;
  globeGroup.rotation.x += (-pointer.ny * 0.22 - globeGroup.rotation.x) * 0.045;

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