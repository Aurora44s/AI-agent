/**
 * 彩色圆形粒子从页面顶部向下滑落，在页面中部淡出消失
 * 粒子持续生成，CSS @keyframes 驱动动画，GPU 加速
 */

const COLORS = [
  "#6366f1", // primary
  "#ec4899", // pink
  "#f59e0b", // amber
  "#14b8a6", // accent
  "#a855f7", // purple
  "#f43f5e", // rose
  "#0ea5e9", // sky
  "#84cc16", // lime
  "#f97316", // orange
];

const MIN_SIZE = 3;
const MAX_SIZE = 8;
const MIN_DURATION = 3; // 秒
const MAX_DURATION = 6;
const MIN_INTERVAL = 60; // 毫秒
const MAX_INTERVAL = 200;
const MAX_PARTICLES = 100;
const DRIFT_RANGE = 35; // 水平飘动范围 px

let styleInjected = false;

function injectKeyframes() {
  if (styleInjected) return;
  styleInjected = true;

  const style = document.createElement("style");
  style.textContent = `
    @keyframes fall-particle {
      0%   { opacity: 0;   transform: translateY(-20px) translateX(0); }
      15%  { opacity: 0.85; transform: translateY(15vh) translateX(calc(var(--drift) * 0.25)); }
      60%  { opacity: 0.6;  transform: translateY(40vh) translateX(calc(var(--drift) * 0.6)); }
      85%  { opacity: 0.2;  transform: translateY(52vh) translateX(calc(var(--drift) * 0.85)); }
      100% { opacity: 0;    transform: translateY(58vh) translateX(var(--drift)); }
    }
  `;
  document.head.appendChild(style);
}

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function spawnParticle() {
  // 限流
  const existing = document.querySelectorAll(".falling-particle");
  if (existing.length >= MAX_PARTICLES) return;

  const particle = document.createElement("span");
  particle.className = "falling-particle";

  const size = randomBetween(MIN_SIZE, MAX_SIZE);
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  const duration = randomBetween(MIN_DURATION, MAX_DURATION);
  const left = randomBetween(2, 98); // 视口宽度的百分比
  const drift = randomBetween(-DRIFT_RANGE, DRIFT_RANGE);

  particle.style.cssText = `
    position: fixed;
    top: -${size + 10}px;
    left: ${left}vw;
    width: ${size}px;
    height: ${size}px;
    border-radius: 50%;
    background: ${color};
    pointer-events: none;
    z-index: 9998;
    --drift: ${drift}px;
    animation: fall-particle ${duration}s linear forwards;
    box-shadow: 0 0 ${size * 0.8}px ${color}44;
  `;

  document.body.appendChild(particle);

  // 动画结束后移除
  particle.addEventListener("animationend", () => {
    particle.remove();
  });
}

export function useFallingParticles() {
  injectKeyframes();

  // 首次立即生成一批粒子
  for (let i = 0; i < 20; i++) {
    setTimeout(() => spawnParticle(), i * 50);
  }

  // 定时持续生成
  let timer: ReturnType<typeof setTimeout>;
  function scheduleNext() {
    timer = setTimeout(() => {
      spawnParticle();
      scheduleNext();
    }, randomBetween(MIN_INTERVAL, MAX_INTERVAL));
  }
  scheduleNext();

  // 返回清理函数
  return () => {
    clearTimeout(timer);
    document.querySelectorAll(".falling-particle").forEach((el) => el.remove());
  };
}
