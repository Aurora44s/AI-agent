/**
 * 简易速率限制器（内存版）
 * 同IP每60s最多3次，每小时最多20次
 */

const records = new Map<string, number[]>();

const WINDOW_SHORT = 60_000;   // 1分钟
const MAX_SHORT = 3;
const WINDOW_LONG = 3600_000;  // 1小时
const MAX_LONG = 20;

// 定时清理过期记录（每5分钟）
setInterval(() => {
  const now = Date.now();
  for (const [ip, times] of records) {
    const fresh = times.filter((t) => now - t < WINDOW_LONG);
    if (fresh.length === 0) records.delete(ip);
    else records.set(ip, fresh);
  }
}, 300_000);

function getClientIP(req: any): string {
  // 支持反向代理
  return (
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    "unknown"
  );
}

export function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  let times = records.get(ip) || [];

  // 统计短窗口内次数
  const shortCount = times.filter((t) => now - t < WINDOW_SHORT).length;
  if (shortCount >= MAX_SHORT) {
    const oldest = times.filter((t) => now - t < WINDOW_SHORT).sort()[0];
    const retryAfter = Math.ceil((oldest + WINDOW_SHORT - now) / 1000);
    return { allowed: false, retryAfter };
  }

  // 统计长窗口内次数
  const longCount = times.filter((t) => now - t < WINDOW_LONG).length;
  if (longCount >= MAX_LONG) return { allowed: false, retryAfter: 3600 };

  // 记录
  times.push(now);
  records.set(ip, times);
  return { allowed: true };
}

export { getClientIP };
