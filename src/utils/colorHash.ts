import { palette } from '../styles/tokens';

// 图例配色：核心诗人手动指定，其余按 hash 分配
// 颜色为手动校准的近似值
const MANUAL_COLORS: Record<string, string> = {
  // 核心诗人 18 位 + 紧邻节点
  sushi: '#E8625A',          // 朱红
  wanganshi: '#F7C548',      // 黄
  luyou: '#F89171',          // 暖橙
  zhuxi: '#7E80E8',          // 紫蓝
  yangwanli: '#6FC8E5',      // 青蓝
  jiangkui: '#E078B6',       // 粉红
  fanchengda: '#B98BE0',     // 紫
  fanghui: '#E5A85A',        // 橙黄
  hezhu: '#C8584F',          // 暗红
  zhangxian: '#E66D5A',      // 红
  zhoubangyan: '#F2E07F',    // 浅黄
  qinguan: '#5BC0BE',        // 青绿
  xinqiji: '#F8A271',        // 橙红
  zenggong: '#9BD173',       // 黄绿
  ouyangxiu: '#F49167',      // 橙
  liukezhuang: '#5BC8C0',    // 青
  // 苏轼朋友圈核心
  suzhe: '#D27059',          // 暖红
  huangtingjian: '#7FE3A8',  // 翠绿
  wentong: '#A0C870',        // 苔绿
  wanggong: '#9BD173',       // 黄绿
  zhanglei: '#E8C16C',       // 金黄
  chaobuzhi: '#B98BE0',      // 紫
  meiyaocheng: '#9BD173',    // 黄绿
  fanzhongyan: '#E8C16C',    // 金黄
  simaguang: '#7FE3A8',      // 翠绿
  // 南宋
  wentianxiang: '#7E80E8',   // 紫蓝
  yuefei: '#C8584F',         // 暗红
  // 江西诗派
  chenshidao: '#7FE3A8',     // 翠
  chenyuyi: '#A8D070',       // 绿黄
  lvbenzhong: '#6FC8E5',     // 青蓝
};

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function colorForPoet(id: string): string {
  return MANUAL_COLORS[id] ?? palette[hashStr(id) % palette.length];
}
