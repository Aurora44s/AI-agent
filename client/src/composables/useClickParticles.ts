/**
 * 鼠标点击樱花效果 —— Canvas 绘制
 * 点击处扩散半透明圆 + 樱花花瓣向四周飞散
 */

interface ClickPetal {
  angle: number;
  distance: number;
  maxDist: number;
  size: number;
  rotation: number;
  rotSpeed: number;
  r: number; g: number; b: number;
}

interface ClickEffect {
  x: number;
  y: number;
  startTime: number;
  duration: number;       // ms
  rippleMaxR: number;     // 圆最大半径
  petals: ClickPetal[];
}

const RIPPLE_MAX = 70;     // 扩散圆最大半径 px
const PETAL_COUNT = 8;     // 每次点击花瓣数
const DURATION = 900;      // 动画时长 ms
const PETAL_MAX_DIST = 60; // 花瓣飞散最大距离

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function drawClickPetal(ctx: CanvasRenderingContext2D, p: ClickPetal, opacity: number) {
  ctx.save();
  const rad = (p.angle * Math.PI) / 180;
  const px = Math.cos(rad) * p.distance;
  const py = Math.sin(rad) * p.distance;
  ctx.translate(px, py);
  ctx.rotate(p.rotation);
  ctx.scale(p.size, p.size);
  ctx.globalAlpha = opacity;
  ctx.fillStyle = `rgb(${p.r},${p.g},${p.b})`;

  for (let i = 0; i < 5; i++) {
    ctx.rotate((Math.PI * 2) / 5);
    ctx.beginPath();
    ctx.ellipse(4, 0, 6, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function useClickParticles() {
  const canvas = document.createElement("canvas");
  canvas.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:101;";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d")!;
  const effects: ClickEffect[] = [];
  let animId: number;
  let w = 0, h = 0;

  function resize() {
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * devicePixelRatio;
    canvas.height = h * devicePixelRatio;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  }
  resize();
  window.addEventListener("resize", resize);

  function onClick(e: MouseEvent) {
    const petals: ClickPetal[] = [];
    const baseAngle = Math.random() * 360;
    for (let i = 0; i < PETAL_COUNT; i++) {
      const pinkness = Math.random();
      petals.push({
        angle: baseAngle + (360 / PETAL_COUNT) * i + rand(-10, 10),
        distance: 0,
        maxDist: rand(PETAL_MAX_DIST * 0.5, PETAL_MAX_DIST),
        size: rand(0.6, 1.2),
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: rand(1, 3) * (Math.random() > 0.5 ? 1 : -1),
        r: Math.floor(240 + pinkness * 15),
        g: Math.floor(140 + pinkness * 60),
        b: Math.floor(150 + pinkness * 60),
      });
    }

    effects.push({
      x: e.clientX,
      y: e.clientY,
      startTime: performance.now(),
      duration: DURATION,
      rippleMaxR: RIPPLE_MAX + rand(-10, 10),
      petals,
    });
  }

  function tick(now: number) {
    ctx.clearRect(0, 0, w, h);

    for (let i = effects.length - 1; i >= 0; i--) {
      const ef = effects[i];
      const elapsed = now - ef.startTime;
      if (elapsed > ef.duration) {
        effects.splice(i, 1);
        continue;
      }

      const progress = Math.max(0, Math.min(1, elapsed / ef.duration)); // 0 → 1
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out
      const fadeOut = 1 - progress; // 淡出

      // 扩散圆
      const rippleR = eased * ef.rippleMaxR;
      const rippleAlpha = fadeOut * 0.3;
      ctx.save();
      ctx.translate(ef.x, ef.y);
      ctx.beginPath();
      ctx.arc(0, 0, rippleR, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,180,200,${rippleAlpha})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(255,200,220,${rippleAlpha * 1.5})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      // 花瓣
      ctx.save();
      ctx.translate(ef.x, ef.y);
      for (const p of ef.petals) {
        p.distance = eased * p.maxDist;
        p.rotation += p.rotSpeed * 0.016;
        drawClickPetal(ctx, p, fadeOut * 0.85);
      }
      ctx.restore();
    }

    animId = requestAnimationFrame(tick);
  }

  animId = requestAnimationFrame(tick);
  document.addEventListener("click", onClick);

  return () => {
    cancelAnimationFrame(animId);
    document.removeEventListener("click", onClick);
    window.removeEventListener("resize", resize);
    canvas.remove();
  };
}
