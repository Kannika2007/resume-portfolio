/* =========================================================
   KANNIKA M PORTFOLIO - SCROLL FRAME ENGINE
========================================================= */

const TOTAL_FRAMES = 192;
const FRAME_FOLDER = "frames/";
const FRAME_PREFIX = "img_";
const FRAME_EXT = ".jpg";

const canvas = document.getElementById("frameCanvas");
const ctx = canvas.getContext("2d", { alpha: false });

const loader = document.getElementById("loader");
const loaderProgress = document.getElementById("loaderProgress");
const scrollProgress = document.getElementById("scrollProgress");

const images = [];

let currentFrame = 0;
let targetFrame = 0;
let canvasW = 0;
let canvasH = 0;

/* Create frame path: img_00001.jpg ... img_00192.jpg */
function framePath(index) {
  return FRAME_FOLDER +
    FRAME_PREFIX +
    String(index + 1).padStart(5, "0") +
    FRAME_EXT;
}

/* Load all frames */
function loadFrames() {
  return new Promise(resolve => {
    let completed = 0;

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      img.decoding = "async";

      img.onload = () => {
        completed++;
        const percent = Math.round(completed / TOTAL_FRAMES * 100);
        loaderProgress.style.width = percent + "%";

        if (completed === TOTAL_FRAMES) resolve();
      };

      img.onerror = () => {
        completed++;
        console.warn("Could not load:", framePath(i));

        if (completed === TOTAL_FRAMES) resolve();
      };

      img.src = framePath(i);
      images[i] = img;
    }
  });
}

/* Canvas resize */
function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  canvasW = window.innerWidth;
  canvasH = window.innerHeight;

  canvas.width = canvasW * dpr;
  canvas.height = canvasH * dpr;

  canvas.style.width = canvasW + "px";
  canvas.style.height = canvasH + "px";

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  drawFrame(Math.round(currentFrame));
}

/* Draw image without heavy cropping */
function drawFrame(index) {
  const img = images[index];

  if (!img || !img.complete || !img.naturalWidth) return;

  ctx.clearRect(0, 0, canvasW, canvasH);

  const imageRatio = img.naturalWidth / img.naturalHeight;
  const screenRatio = canvasW / canvasH;

  let width;
  let height;

  if (imageRatio > screenRatio) {
    width = canvasW;
    height = canvasW / imageRatio;
  } else {
    height = canvasH;
    width = canvasH * imageRatio;
  }

  const x = (canvasW - width) / 2;
  const y = (canvasH - height) / 2;

  ctx.drawImage(img, x, y, width, height);
}

/* Convert page scroll to frame number */
function updateScroll() {
  const maxScroll =
    document.documentElement.scrollHeight - window.innerHeight;

  const progress =
    maxScroll > 0 ? window.scrollY / maxScroll : 0;

  targetFrame = progress * (TOTAL_FRAMES - 1);

  scrollProgress.style.width =
    (progress * 100) + "%";
}

/* Smooth frame interpolation */
function animate() {
  currentFrame += (targetFrame - currentFrame) * 0.16;

  const frameIndex = Math.max(
    0,
    Math.min(TOTAL_FRAMES - 1, Math.round(currentFrame))
  );

  drawFrame(frameIndex);

  requestAnimationFrame(animate);
}

/* Active section navigation */
const navLinks = document.querySelectorAll(".nav a");
const sections = document.querySelectorAll("section");

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;

    navLinks.forEach(link => {
      link.classList.toggle(
        "active",
        link.dataset.section === entry.target.id
      );
    });
  });
}, { threshold: 0.45 });

sections.forEach(section => observer.observe(section));

window.addEventListener("scroll", updateScroll, { passive: true });
window.addEventListener("resize", resizeCanvas);

/* Start */
async function init() {
  await loadFrames();

  resizeCanvas();
  updateScroll();
  animate();

  requestAnimationFrame(() => {
    loader.classList.add("hidden");
  });
}

init();
