/**
 * 樱花花瓣飘落效果 —— Canvas 绘制
 * 花瓣缓慢旋转 + 正弦曲线左右飘动，粉白色系随机大小
 */

interface Petal {
  x: number;
  y: number;
  size: number;        // 花瓣缩放 0.4-1.2
  rotation: number;    // 当前角度
  rotSpeed: number;    // 旋转速度 rad/s
  swingAmp: number;    // 左右摆动幅度 px
  swingSpeed: number;  // 摆动频率
  swingPhase: number;  // 摆动初相
  speedY: number;      // 下落速度 px/s
  r: number; g: number; b: number;  // 粉色系
  opacity: number;
}

const PETAL_COUNT = 50;
const MIN_SIZE = 0.35;
const MAX_SIZE = 0.8;
const MIN_SPEED = 30;   // px/s
const MAX_SPEED = 80;
const MIN_ROT = 0.3;    // rad/s
const MAX_ROT = 1.5;
const MIN_SWING_AMP = 30;
const MAX_SWING_AMP = 80;
const MIN_SWING_SPEED = 0.5;
const MAX_SWING_SPEED = 1.5;

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function createPetal(canvasW: number, canvasH: number): Petal {
  // 粉色到白色范围
  const pinkness = Math.random(); // 0=白, 1=深粉
  return {
    x: Math.random() * canvasW,
    y: -20 - Math.random() * canvasH, // 从顶部上方随机位置开始
    size: rand(MIN_SIZE, MAX_SIZE),
    rotation: Math.random() * Math.PI * 2,
    rotSpeed: rand(MIN_ROT, MAX_ROT) * (Math.random() > 0.5 ? 1 : -1),
    swingAmp: rand(MIN_SWING_AMP, MAX_SWING_AMP),
    swingSpeed: rand(MIN_SWING_SPEED, MAX_SWING_SPEED),
    swingPhase: Math.random() * Math.PI * 2,
    speedY: rand(MIN_SPEED, MAX_SPEED),
    r: Math.floor(240 + pinkness * 15),       // 240-255
    g: Math.floor(140 + pinkness * 60),       // 140-200
    b: Math.floor(150 + pinkness * 60),       // 150-210
    opacity: rand(0.35, 0.85),
  };
}

function drawPetal(ctx: CanvasRenderingContext2D, p: Petal) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rotation);
  ctx.scale(p.size, p.size);
  ctx.globalAlpha = p.opacity;
  ctx.fillStyle = `rgb(${p.r},${p.g},${p.b})`;

  // 绘制5瓣樱花
  for (let i = 0; i < 5; i++) {
    ctx.rotate((Math.PI * 2) / 5);
    ctx.beginPath();
    // 每个瓣片是一个拉长的椭圆，向外偏移
    ctx.ellipse(3, 0, 5, 1.8, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // 中心小圆
  ctx.beginPath();
  ctx.arc(0, 0, 1.5, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(255,180,180,${p.opacity + 0.15})`;
  ctx.fill();

  ctx.restore();
}

export function useFallingParticles() {
  const canvas = document.createElement("canvas");
  canvas.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:100;";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d")!;
  let animId: number;
  let lastTime = performance.now();
  const petals: Petal[] = [];
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

  // 初始化花瓣池
  for (let i = 0; i < PETAL_COUNT; i++) {
    petals.push(createPetal(w, h));
  }

  function tick(now: number) {
    const dt = Math.min((now - lastTime) / 1000, 0.1); // 防止跳帧过大
    lastTime = now;

    ctx.clearRect(0, 0, w, h);

    for (const p of petals) {
      // 下落
      p.y += p.speedY * dt;
      // 旋转
      p.rotation += p.rotSpeed * dt;
      // 正弦摆动
      p.x += Math.sin(now * 0.001 * p.swingSpeed + p.swingPhase) * p.swingAmp * dt;

      // 超出底部或左右太远 → 回收
      if (p.y > h + 40 || p.x < -60 || p.x > w + 60) {
        p.y = -40 - Math.random() * 60;
        p.x = Math.random() * w;
        p.rotation = Math.random() * Math.PI * 2;
        p.swingPhase = Math.random() * Math.PI * 2;
      }

      drawPetal(ctx, p);
    }

    animId = requestAnimationFrame(tick);
  }

  animId = requestAnimationFrame(tick);

  return () => {
    cancelAnimationFrame(animId);
    window.removeEventListener("resize", resize);
    canvas.remove();
  };
}
