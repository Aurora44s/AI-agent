/**
 * 鼠标点击粒子扩散动画
 * 点击页面任意位置，彩色圆点向四周飞散
 */

const COLORS = [
  "#6366f1", // primary
  "#ec4899", // pink
  "#f59e0b", // amber
  "#14b8a6", // accent
  "#a855f7", // purple
  "#f43f5e", // rose
  "#0ea5e9", // sky
];

const PARTICLE_COUNT = 10;
const ANIMATION_DURATION = 700; // ms

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function useClickParticles() {
  function spawnParticles(x: number, y: number) {
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const particle = document.createElement("span");

      // 随机属性
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const angle = (360 / PARTICLE_COUNT) * i + randomBetween(-15, 15); // 均匀分布 + 随机偏移
      const distance = randomBetween(30, 60);
      const size = randomBetween(9, 18);
      const rad = (angle * Math.PI) / 180;
      const tx = Math.cos(rad) * distance;
      const ty = Math.sin(rad) * distance;

      // 基础样式
      particle.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: ${color};
        pointer-events: none;
        z-index: 9999;
        transform: translate(-50%, -50%) scale(0);
        opacity: 0.9;
        transition: transform ${ANIMATION_DURATION}ms cubic-bezier(0, 0.7, 0.3, 1), opacity ${ANIMATION_DURATION}ms ease-out;
      `;

      document.body.appendChild(particle);

      // 下一帧触发扩散动画
      requestAnimationFrame(() => {
        particle.style.transform = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(1)`;
        particle.style.opacity = "0";
      });

      // 动画结束后清除
      setTimeout(() => {
        particle.remove();
      }, ANIMATION_DURATION + 50);
    }
  }

  function onClick(e: MouseEvent) {
    spawnParticles(e.clientX, e.clientY);
  }

  document.addEventListener("click", onClick);

  // 返回清理函数
  return () => {
    document.removeEventListener("click", onClick);
  };
}
