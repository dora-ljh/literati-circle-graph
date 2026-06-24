# 诗云星图 · literati-circle-graph

把宋代（及未来的唐代）诗人之间的赠答、寄怀、哀挽与提及关系，投影成一片可自由漫游的 3D 星空。每位诗人是一颗星，每一次唱和往来是一条连线——在星河中穿行，便能直观看见一个时代的文人交游网络。

## 亮点

- **3D 星空可视化**：基于 three.js 的真实景深星图，节点带辉光，背景缀满漫天星点，可自由旋转、缩放、平移。
- **关系即连线**：赠诗、寄怀、哀挽、提及等不同往来类型以连线呈现，连线越密的诗人越是交游网络的枢纽。
- **两种视图**
  - **散点视图**：d3-force-3d 力导向布局，按交往亲疏自然聚散。
  - **全景视图**：d3-hierarchy 风格的 3D 树状分层，自动旋转，俯瞰整体结构。
- **诗人详情面板**：点击任一星，右侧滑出该诗人的字号、生平与往来诗作列表。
- **古籍诗卡**：在面板中点选诗题，弹出仿古籍竖排金字诗卡，逐字品读原作。
- **朝代切换与搜索**：顶部在「唐 / 宋」之间切换数据集；搜索框模糊匹配姓名 / 字 / 号，快速定位。

## 交互速览

| 操作 | 结果 |
|---|---|
| 点击底部图例条目 | 相机平滑飞向该诗人，焦点星变亮 |
| 点击星图中的任一星 | 打开右侧「诗人详情面板」，底部图例文案切换为「赠诗最多」 |
| 在面板中点击诗题 | 弹出居中「古籍诗卡」模态（金字竖排） |
| 顶部 `唐 / 宋` Tab | 切换数据集，重置选中态 |
| 顶部搜索框 | 模糊匹配姓名 / 字 / 号，下拉选中等价点击 |
| `进入全景` 按钮 | 切到 3D 树状全景，自动旋转 |
| 全景下 4 个胶囊按钮 | 显示全部 / 横纵向切换 / Y 轴翻转 / 暂停旋转 |

## 技术栈

- **React 18 + TypeScript 5 + Vite 5** — 纯静态 SPA
- **three.js + @react-three/fiber + drei + @react-three/postprocessing** — 3D 渲染与辉光后期
- **d3-force-3d** 力导向（散点视图）+ **d3-hierarchy** 风格分层（全景视图）
- **framer-motion** — 面板与模态动效
- **zustand** — 应用状态，组件用 selector 订阅按需重渲染
- **simplex-noise** — 背景星空噪声扰动

## 本地运行

```bash
pnpm install
pnpm dev          # 开发服务器 http://localhost:5173
pnpm build        # 生产构建，产出 dist/
pnpm preview      # 本地预览构建产物
pnpm typecheck    # tsc --noEmit
pnpm lint         # eslint
pnpm lint:fix     # eslint --fix
```

## 项目结构

```
src/
├── data/          诗人与关系数据（song.ts / tang.ts / types.ts）
├── scene/         three / R3F 渲染层（星节点、连线、相机、背景、布局）
├── ui/            DOM 覆盖层（顶栏、图例、详情面板、诗卡模态、控制条）
├── state/         zustand 应用状态
├── utils/         配色、度数、分组等工具
├── styles/        设计令牌与可调参数（tokens.ts）
└── types/         类型声明
```

## 数据

- `src/data/song.ts` — 宋代核心诗人及其往来关系（手编精选）
- `src/data/tang.ts` — 唐代数据集

所有数据为内置静态数据，应用启动即用，无需任何后端或数据库。

## 开发约定

- 所有可调参数集中在 `src/styles/tokens.ts`，方便统一调色与布局微调。
- 图与 UI 严格分层：`src/scene/*` = three / R3F；`src/ui/*` = DOM 覆盖层。
- 应用状态全部在 `src/state/store.ts`，组件以 selector 订阅，避免无谓重渲染。

## 部署

`pnpm build` 产出的 `dist/` 为纯静态资源，可直接部署到 GitHub Pages / Cloudflare Pages / Vercel 等任意静态托管。

## 许可证

[MIT](./LICENSE)
