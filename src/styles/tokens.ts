export const color = {
  bgDeep: '#02030A',
  bgFog: '#0A0B1F',
  focusCore: '#E8625A',
  focusGlow: '#FFE7C9',
  textPrimary: '#FFFFFF',
  textSecondary: '#E6E6E6',
  textMuted: '#9DA3B1',
  goldActive: '#F1C36B',
  goldText: '#8E2A1F',
  redAccent: '#FF5A4D',
  ancientText: '#E8C16C',
  panelBg: 'rgba(10, 12, 22, 0.85)',
  panelBorder: 'rgba(232, 193, 108, 0.15)',
  buttonBg: 'rgba(0, 0, 0, 0.55)',
  buttonBorder: 'rgba(255, 255, 255, 0.18)',
} as const;

export const palette = [
  '#F7C548',
  '#6FC8E5',
  '#7FE3A8',
  '#B98BE0',
  '#F2E07F',
  '#F89171',
  '#7E80E8',
  '#C8584F',
  '#5BC0BE',
  '#E078B6',
  '#9BD173',
  '#E5A85A',
] as const;

export const font = {
  uiSans: "'Inter', 'Noto Sans SC', 'PingFang SC', sans-serif",
  uiSerif: "'Noto Serif SC', 'Songti SC', serif",
  ancient: "'Noto Serif SC', 'STKaiti', 'KaiTi', serif",
} as const;

export const camera = {
  springStiffness: 120,
  springDamping: 22,
  defaultDistance: 350,      // 拉近：460 → 350
  flyDistance: 200,          // 聚焦也拉近：280 → 200
  globalDistance: 600,
  defaultLiftY: -130,        // 仰视加深：-75 → -130，仰角 ~20°
  flyDuration: 1.1,          // 飞行总时长（秒），与 dt 抖动解耦
} as const;

export const bloom = {
  intensity: 0.55,           // 降低 → 避免色彩被 bloom 洗白
  luminanceThreshold: 0.30,  // 只让最亮的核进 bloom，弱光晕保留本色
  luminanceSmoothing: 0.9,
  radius: 0.5,
} as const;

export const star = {
  // 核：基础值 + 权重 × 系数。基础小、系数大 → 小节点真的小、大节点大
  coreBase: 1.6,
  coreWeightScale: 0.45,
  // 晕：基础略大于核 + 强权重缩放 → 光晕始终显著大于核
  glowBase: 7.0,
  glowWeightScale: 2.40,
  // 焦点态：在节点自身基础尺寸上等比放大（不再固定值，避免高权重节点反而被"压小"）
  // 核放大明显（1.6×）→ 中心更亮；光晕克制（1.05×）→ 不会糊成大球
  focusSizeMul: 1.6,
  focusGlowSizeMul: 1.05,
  coreBoost: 0.85,
  glowOpacity: 0.42,
  // 有焦点时，未选中节点稍微压暗（让焦点更突出，但不至于看不见其它）
  dimCoreBoost: 0.65,
  dimGlowOpacity: 0.28,
  focusCoreBoostMul: 1.8,    // 焦点核亮度倍率（× coreBoost）
  focusGlowOpacity: 0.85,    // 焦点晕不透明度（之前 0.55，让区分更明显）
  // 名字显示阈值（按 weight），低于阈值不显示文字
  labelWeightThreshold: 7,
  // 重要诗人阈值，名字字体更大
  prominentWeightThreshold: 14,
} as const;

export const line = {
  // 采样段数：fBm noise 自带平滑，密集采样效果更好
  curveSegments: 80,
  // 主弓方向（hash 派生）的弧度幅度（× 直线距离）
  controlOffsetMin: 0.04,
  controlOffsetMax: 0.14,
  // fBm 噪声扰动总幅度（× 直线距离）—— 控制"蓬松"的强度
  noiseAmp: 0.05,
  // fBm 三层频率与振幅（自相似多频叠加）
  noiseFreq1: 2.0,  noiseAmp1: 1.0,
  noiseFreq2: 5.0,  noiseAmp2: 0.5,
  noiseFreq3: 11.0, noiseAmp3: 0.25,
  // 颜色档位（整条线统一）：
  //   选中某节点 → 该节点 source 的边用 focusBoost 高亮，其余 dimBoost 暗
  //   未选中     → 所有边用 normalBoost
  focusBoost: 0.95,
  normalBoost: 0.45,         // 整体抬亮：0.30 → 0.45
  dimBoost: 0.22,            // 焦点态非赠诗线：仍比 normal 暗，但能看见
  tailFalloffPower: 1.5,
  tailMin: 0.05,
  materialOpacity: 0.35,     // 材质透明度：0.25 → 0.35，所有线整体变亮
} as const;

export const backgroundStars = {
  // 远景：数量极多、极小、静止 —— 撑起密度
  tinyCount: 9000,
  tinySize: 1.6,             // 屏幕 px
  tinyAlphaMin: 0.18,
  tinyAlphaMax: 0.55,
  // 中景：适量、中等、缓慢闪烁
  midCount: 4000,
  midSize: 3.6,
  midAlphaMin: 0.35,
  midAlphaMax: 0.85,
  midTwinkleAmp: 0.32,       // ±32% 闪烁幅度
  midTwinkleFreq: 0.18,      // 周期数 / 秒（约 5.5 秒一次呼吸）
  // 近景亮星：稍多、更大、超亮触发 Bloom
  brightCount: 600,
  brightSize: 11.0,
  brightAlphaMin: 1.5,       // 超过 1 → HDR，触发 bloom 阈值
  brightAlphaMax: 2.6,
  brightTwinkleAmp: 0.55,
  brightTwinkleFreq: 0.32,   // 约 3 秒一次呼吸
  // 共用
  innerRadius: 280,          // 避开前景节点区
  outerRadius: 1300,
  hueJitter: 0.16,           // 颜色微变（白底 + 偏蓝/偏黄）
} as const;

export const rotation = {
  globalAuto: 0.6,
  flyEpsilon: 0.5,
  flyDecay: 3.5,
} as const;
