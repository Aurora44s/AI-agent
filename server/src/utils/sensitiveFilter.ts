/**
 * 敏感词过滤工具
 * - 匹配前归一化：全角转半角、去除干扰符
 * - 不返回具体匹配词，只返回统一错误消息
 * - 命中时日志记录来源
 */

// ===== 广告推广 =====
const AD_WORDS = [
  "加微信", "加我微信", "加微", "加V信", "加扣扣",
  "兼职", "日结", "刷单", "代发", "代购",
  "推广", "引流", "涨粉", "刷粉", "全网最低",
  "免费领取", "点击领取", "限时优惠", "优惠券",
  "加群", "拉群", "进群", "扫码进",
  "赚钱", "躺赚", "日赚", "月入",
  "微商", "直销", "代理", "加盟",
  "包邮", "特价", "清仓", "甩卖",
  "复制这条", "打开淘宝", "打开拼多多",
  "贷款", "办卡", "套现", "信用卡",
  "炒股", "荐股", "牛股", "内幕",
  "六合彩", "彩票", "下注", "赌博",
  "裸聊", "约炮", "一夜情", "上门服务",
  "找小姐", "按摩服务", "看片", "福利资源", "私密视频",
  "黄色网站", "色情", "成人网站", "激情视频",
];

// ===== 辱骂/攻击（只保留核心词根，归一化后匹配） =====
const ABUSE_WORDS = [
  "傻逼", "脑残", "白痴", "弱智", "智障",
  "草泥马", "草拟吗", "操你", "操尼",
  "去死", "死全家", "废物",
  "贱人", "婊子", "狗日的", "龟儿子",
  "妈逼", "你妈", "他妈", "你麻痹",
  "滚蛋", "滚出去", "滚开",
  "fuck",
];

const SENSITIVE_WORDS = [...AD_WORDS, ...ABUSE_WORDS];

// ===== 正则检测（在原始文本上执行） =====
const URL_REGEX = /https?:\/\/(?!localhost|127\.0\.0\.1|172\.|10\.|192\.168\.)/i;
const REPEAT_REGEX = /(.)\1{9,}/;

// ===== 全角→半角映射 =====
function fullToHalf(str: string): string {
  let result = "";
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (code >= 0xff01 && code <= 0xff5e) {
      result += String.fromCharCode(code - 0xfee0);
    } else if (code === 0x3000) {
      result += " "; // 全角空格→半角空格
    } else {
      result += str[i];
    }
  }
  return result;
}

// ===== 归一化：去干扰符，只保留连续有意义字符 =====
function normalize(text: string): string {
  // 1. 全角转半角
  let t = fullToHalf(text);
  // 2. 转小写
  t = t.toLowerCase();
  // 3. 去掉所有间隔符（空格、标点、特殊符号），让敏感词无处可藏
  // 保留：中文(一-鿿)、英文(a-z)、数字(0-9)
  t = t.replace(/[^一-鿿a-z0-9]/g, "");
  return t;
}

export interface FilterResult {
  ok: boolean;
}

export const FILTER_ERROR_MSG = "内容包含违规信息，请修改后重试";

export function filterContent(
  text: string,
  meta?: { ip?: string; nickname?: string }
): FilterResult {
  if (!text || !text.trim()) return { ok: true };

  const raw = text.trim();

  // 1. 正则检测（在原始文本上）
  if (URL_REGEX.test(raw)) {
    console.warn(`[敏感词] URL外链 | IP=${meta?.ip || "?"} 昵称=${meta?.nickname || "?"} | ${raw.slice(0, 80)}`);
    return { ok: false };
  }
  if (REPEAT_REGEX.test(raw)) {
    console.warn(`[敏感词] 灌水刷屏 | IP=${meta?.ip || "?"} 昵称=${meta?.nickname || "?"} | ${raw.slice(0, 80)}`);
    return { ok: false };
  }

  // 2. 归一化后精确匹配
  const clean = normalize(raw);
  for (const word of SENSITIVE_WORDS) {
    if (clean.includes(normalize(word))) {
      console.warn(`[敏感词] 命中 | IP=${meta?.ip || "?"} 昵称=${meta?.nickname || "?"} | ${raw.slice(0, 80)}`);
      return { ok: false };
    }
  }

  return { ok: true };
}
