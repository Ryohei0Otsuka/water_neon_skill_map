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
const drops = [];
const ripples = [];

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

function createCard(item, groupName) {
  const card = document.createElement("button");
  card.type = "button";
  card.className = groupName === "projects" ? "project-card" : "skill-card";

  if (item.type === "github") {
    card.classList.add("github-card");
  }

  const icon = document.createElement("span");
  icon.className = "card-icon";
  icon.textContent = item.icon;

  const name = document.createElement("span");
  name.className = "card-name";
  name.textContent = item.name;

  const badge = document.createElement("span");
  badge.className = "badge";
  badge.textContent = item.badge || String(item.score ?? "");

  card.appendChild(icon);
  card.appendChild(name);
  card.appendChild(badge);

  if (item.type === "github") {
    const flyout = document.createElement("div");
    flyout.className = "github-flyout";

    const title = document.createElement("p");
    title.className = "github-flyout-title";
    title.textContent = "GITHUB WORKS";

    const list = document.createElement("ul");
    list.className = "github-list";

    item.works.forEach((work) => {
      const li = document.createElement("li");
      const link = document.createElement("a");

      link.href = work.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";

      const workIcon = document.createElement("span");
      workIcon.textContent = work.icon;

      const workName = document.createElement("span");
      workName.textContent = work.name;

      const external = document.createElement("span");
      external.className = "external";
      external.textContent = "↗";

      link.appendChild(workIcon);
      link.appendChild(workName);
      link.appendChild(external);
      li.appendChild(link);
      list.appendChild(li);
    });

    flyout.appendChild(title);
    flyout.appendChild(list);
    card.appendChild(flyout);
  }

  card.addEventListener("click", () => {
    document
      .querySelectorAll(".skill-card, .project-card")
      .forEach((el) => el.classList.remove("active"));

    card.classList.add("active");

    if (item.type === "github") {
      detailPop.classList.remove("visible");
      return;
    }

    detailTitle.textContent =
      typeof item.score === "number"
        ? `${item.name} / ${item.score}`
        : item.name;

    detailText.textContent = item.detail;
    detailPop.classList.add("visible");
  });

  return card;
}

function renderSkillCards() {
  Object.entries(groups).forEach(([groupName, items]) => {
    items.forEach((item) => {
      containers[groupName].appendChild(createCard(item, groupName));
    });
  });
}

function initPointer() {
  mapArea.addEventListener("mousemove", (event) => {
    const rect = mapArea.getBoundingClientRect();

    pointer.x = event.clientX - rect.left;
    pointer.y = event.clientY - rect.top;
    pointer.nx = pointer.x / rect.width - 0.5;
    pointer.ny = pointer.y / rect.height - 0.5;
    pointer.active = true;

    globeWrap.style.transform =
      `translate(-50%, -48%) rotateY(${pointer.nx * 7}deg) rotateX(${-pointer.ny * 6}deg)`;
  });

  mapArea.addEventListener("mouseleave", () => {
    pointer.active = false;
    pointer.nx = 0;
    pointer.ny = 0;

    globeWrap.style.transform =
      "translate(-50%, -48%) rotateY(0deg) rotateX(0deg)";
  });
}

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
  drops.length = 0;
  ripples.length = 0;

  for (let i = 0; i < 90; i += 1) {
    bubbles.push({
      x: Math.random() * canvasWidth,
      y: Math.random() * canvasHeight,
      r: 1 + Math.random() * 5,
      vy: 0.3 + Math.random() * 1.2,
      vx: -0.25 + Math.random() * 0.5,
      a: 0.15 + Math.random() * 0.5,
      p: Math.random() * Math.PI * 2
    });
  }

  for (let i = 0; i < 80; i += 1) {
    drops.push({
      angle: Math.random() * Math.PI * 2,
      speed: 0.002 + Math.random() * 0.006,
      rx: canvasWidth * (0.17 + Math.random() * 0.08),
      ry: canvasHeight * (0.1 + Math.random() * 0.05),
      size: 1 + Math.random() * 2.8,
      alpha: 0.24 + Math.random() * 0.68,
      purple: Math.random() > 0.84
    });
  }
}

function drawBubble(bubble) {
  const gradient = ctx.createRadialGradient(
    bubble.x - bubble.r * 0.4,
    bubble.y - bubble.r * 0.4,
    0,
    bubble.x,
    bubble.y,
    bubble.r * 3
  );

  gradient.addColorStop(0, `rgba(255,255,255,${bubble.a})`);
  gradient.addColorStop(0.35, `rgba(77,252,255,${bubble.a * 0.5})`);
  gradient.addColorStop(1, "rgba(77,252,255,0)");

  ctx.save();
  ctx.fillStyle = gradient;
  ctx.shadowBlur = 18;
  ctx.shadowColor = "rgba(77,252,255,.85)";
  ctx.beginPath();
  ctx.arc(bubble.x, bubble.y, bubble.r * 2.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawFlowLines(time) {
  ctx.save();

  for (let i = 0; i < 14; i += 1) {
    const baseY = canvasHeight * (0.71 + i * 0.02);

    ctx.beginPath();
    ctx.moveTo(-80, baseY);

    for (let x = 0; x <= canvasWidth + 100; x += 70) {
      const y =
        baseY +
        Math.sin((x * 0.012) + time * 0.002 + i) * 8 +
        Math.cos((x * 0.004) - time * 0.0015) * 4;

      ctx.quadraticCurveTo(x - 22, y, x, y);
    }

    ctx.strokeStyle = `rgba(77,252,255,${0.052 + i * 0.008})`;
    ctx.lineWidth = 1;
    ctx.shadowBlur = 10;
    ctx.shadowColor = "rgba(77,252,255,.45)";
    ctx.stroke();
  }

  ctx.restore();
}

function animateWater(time = 0) {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  const glow = ctx.createRadialGradient(
    canvasWidth * 0.5,
    canvasHeight * 0.51,
    0,
    canvasWidth * 0.5,
    canvasHeight * 0.51,
    Math.min(canvasWidth, canvasHeight) * 0.36
  );

  glow.addColorStop(0, "rgba(77,252,255,.2)");
  glow.addColorStop(1, "rgba(28,168,255,0)");

  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  drawFlowLines(time);

  bubbles.forEach((bubble) => {
    bubble.p += 0.02;
    bubble.x += bubble.vx + Math.sin(bubble.p) * 0.2;
    bubble.y -= bubble.vy;

    if (
      bubble.y < -40 ||
      bubble.x < -40 ||
      bubble.x > canvasWidth + 40
    ) {
      bubble.x = Math.random() * canvasWidth;
      bubble.y = canvasHeight + Math.random() * 120;
    }

    drawBubble(bubble);
  });

  drops.forEach((drop) => {
    drop.angle += drop.speed;

    const x = canvasWidth * 0.5 + Math.cos(drop.angle) * drop.rx;
    const y = canvasHeight * 0.51 + Math.sin(drop.angle) * drop.ry;

    ctx.save();
    ctx.globalAlpha = drop.alpha;
    ctx.fillStyle = drop.purple
      ? "rgba(198,145,255,.9)"
      : "rgba(130,250,255,.94)";
    ctx.shadowBlur = 18;
    ctx.shadowColor = drop.purple
      ? "rgba(178,108,255,.96)"
      : "rgba(77,252,255,.96)";
    ctx.beginPath();
    ctx.arc(x, y, drop.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  if (Math.floor(time / 720) !== Math.floor((time - 16) / 720)) {
    ripples.push({
      x: canvasWidth * 0.5,
      y: canvasHeight * 0.79,
      r: 10,
      a: 0.5
    });
  }

  for (let i = ripples.length - 1; i >= 0; i -= 1) {
    const ripple = ripples[i];

    ripple.r += 2;
    ripple.a *= 0.965;

    ctx.save();
    ctx.translate(ripple.x, ripple.y);
    ctx.scale(1, 0.28);
    ctx.strokeStyle = `rgba(77,252,255,${ripple.a})`;
    ctx.lineWidth = 1.5;
    ctx.shadowBlur = 14;
    ctx.shadowColor = "rgba(77,252,255,.82)";
    ctx.beginPath();
    ctx.arc(0, 0, ripple.r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    if (ripple.a < 0.02) {
      ripples.splice(i, 1);
    }
  }

  requestAnimationFrame(animateWater);
}

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
  gradient.addColorStop(0.22, "rgba(125,255,255,.9)");
  gradient.addColorStop(0.55, "rgba(77,252,255,.32)");
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
  bg.addColorStop(0, "rgba(5,60,95,.35)");
  bg.addColorStop(0.5, "rgba(3,28,54,.5)");
  bg.addColorStop(1, "rgba(5,60,95,.35)");

  tctx.fillStyle = bg;
  tctx.fillRect(0, 0, size, size / 2);

  tctx.strokeStyle = "rgba(77,252,255,.24)";
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

    tctx.fillStyle = "rgba(77,252,255,.42)";
    tctx.shadowBlur = 28;
    tctx.shadowColor = "rgba(77,252,255,1)";
    tctx.fill();

    tctx.strokeStyle = "rgba(210,255,255,.78)";
    tctx.lineWidth = 2;
    tctx.stroke();
  });

  for (let i = 0; i < 420; i += 1) {
    const x = Math.random() * size;
    const y = Math.random() * size / 2;
    const r = Math.random() * 1.7;

    tctx.fillStyle = `rgba(155,255,255,${0.08 + Math.random() * 0.25})`;
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

  camera = new THREE.PerspectiveCamera(
    42,
    rect.width / rect.height,
    0.1,
    100
  );

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

  earthMesh = new THREE.Mesh(
    new THREE.SphereGeometry(1.68, 128, 128),
    new THREE.MeshBasicMaterial({
      map: createEarthTexture(),
      color: 0x9dfcff,
      transparent: true,
      opacity: 0.98,
      blending: THREE.AdditiveBlending
    })
  );

  globeGroup.add(earthMesh);

  wireMesh = new THREE.Mesh(
    new THREE.SphereGeometry(1.7, 44, 30),
    new THREE.MeshBasicMaterial({
      color: 0x4dfcff,
      wireframe: true,
      transparent: true,
      opacity: 0.2,
      blending: THREE.AdditiveBlending
    })
  );

  globeGroup.add(wireMesh);

  atmosphereMesh = new THREE.Mesh(
    new THREE.SphereGeometry(1.84, 128, 128),
    new THREE.MeshBasicMaterial({
      color: 0x4dfcff,
      transparent: true,
      opacity: 0.14,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false
    })
  );

  globeGroup.add(atmosphereMesh);

  liquidShell = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.98, 5),
    new THREE.MeshBasicMaterial({
      color: 0x70ffff,
      transparent: true,
      opacity: 0.09,
      wireframe: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  );

  globeGroup.add(liquidShell);

  ringA = createRing(2.12, 0.006, 0x4dfcff, 0.48);
  ringA.rotation.x = Math.PI * 0.52;
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
  particleGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );

  particleSystem = new THREE.Points(
    particleGeometry,
    new THREE.PointsMaterial({
      map: createGlowSpriteTexture(),
      color: 0x95ffff,
      size: 0.052,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  );

  globeGroup.add(particleSystem);
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

function init() {
  renderSkillCards();
  initPointer();

  resizeCanvas();
  buildWaterScene();

  initThreeGlobe();
  resizeThreeGlobe();

  const first = document.querySelector(".skill-card");
  if (first) {
    first.click();
  }

  requestAnimationFrame(animateWater);
  requestAnimationFrame(animateThreeGlobe);
}

window.addEventListener("resize", () => {
  resizeCanvas();
  buildWaterScene();
  resizeThreeGlobe();
});

init();