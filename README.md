# Stock Trainer Pro

专业级股票交易训练桌面应用

![Electron](https://img.shields.io/badge/Electron-30+-47848F?logo=electron&logoColor=white) ![Vue3](https://img.shields.io/badge/Vue-3-42b883?logo=vuedotjs&logoColor=white) ![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white) ![pnpm](https://img.shields.io/badge/pnpm-8-F69220?logo=pnpm&logoColor=white) ![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)

一款用于 **股票技术分析训练 + 模拟交易 + 交易能力评估** 的跨平台桌面软件，帮助用户在 **无风险环境** 下系统训练与验证交易能力。

## 目录

- 简介
- 功能总览
- 快速上手
- 项目结构
- 技术栈与架构
- 配置说明
- 使用流程
- 路线图
- 常见问题
- 贡献
- License
- 免责声明

## 简介

Stock Trainer Pro 面向 **零基础股民 / 交易员 / 技术分析爱好者**，提供历史行情训练、模拟交易、绩效评估与排名机制。目标是提供一个可复现、可量化、可评估的训练闭环。

## 功能总览

- 历史K线训练：隐藏未来K线、逐根播放、随机股票训练、多周期（日/周/月/5m/15m）
- 技术指标：MA/EMA/BOLL/MACD/KDJ/RSI/VOL/ATR/OBV/CCI，支持叠加与参数自定义
- 技术画线：水平线/趋势线/通道/平行通道/矩形/斐波那契等
- 模拟交易：买入/卖出/加减仓/止损/止盈，支持 T+1、手续费、滑点模拟
- 账户与排行：用户账户、收益率统计、每日/每周/每月排行榜
- 比赛系统：周期性模拟赛，起始资金、周期与奖励可配置
- 创新玩法（规划中）：平台虚拟股票，撮合靠用户交易行为驱动

## 快速上手

### 环境要求

- Node.js ≥ 18
- pnpm ≥ 8
- macOS / Windows / Linux（跨平台）

### 安装

```bash
pnpm install
```

### 开发调试

```bash
pnpm dev
```

- 启动 Vite + Electron 开发环境（由 `vite-plugin-electron` 驱动）
- 首次运行会构建主进程与预加载脚本

### 构建打包

```bash
pnpm build
```

- 构建产物：
  - `dist/`：渲染进程打包产物
  - `dist-electron/`：主进程与预加载脚本
  - `release/`：各平台安装包（由 `electron-builder` 生成）

### 常用脚本

- 开发：`pnpm dev`
- 构建：`pnpm build`
- 预览（仅渲染进程）：`pnpm preview`

## 项目结构

```
.
├─ electron/                 # 主进程与预加载脚本（TypeScript）
│  ├─ main.ts
│  └─ preload.ts
├─ src/                      # 渲染进程（Vue 3 + TS）
│  ├─ components/
│  ├─ App.vue
│  └─ main.ts
├─ public/                   # 静态资源
├─ dist/                     # 渲染进程构建产物（构建后生成）
├─ dist-electron/            # 主进程构建产物（构建后生成）
├─ electron-builder.json5    # 打包配置
├─ vite.config.ts            # Vite 与 Electron 集成配置
├─ package.json              # 脚本与依赖
├─ tsconfig*.json            # TypeScript 配置
└─ README.md
```

## 技术栈与架构

- 桌面容器：Electron + `vite-plugin-electron`
- 前端框架：Vue 3 + TypeScript + Vite
- 图表组件：KLineCharts（已集成 `klinecharts`，可选用 `@klinecharts/pro`）
- 数据与后端：
  - 当前：本地渲染示例，无持久化方案强绑定
  - 规划：本地 SQLite（嵌入式）或云端 Supabase（`@supabase/supabase-js` 已添加依赖）
- 认证与账户：
  - 规划：JWT 或基于 Supabase 的认证体系

说明：本仓库当前以 Electron + Vue3 的工程化基座为主，后续将逐步接入数据层、交易引擎与评估模块。

## 配置说明

### 打包配置（electron-builder）

文件：`electron-builder.json5`

- `productName`：应用展示名称（请修改为你的产品名）
- `appId`：应用唯一标识（如 `com.yourcompany.stp`）
- `directories.output`：安装包输出路径（默认 `release/${version}`）
- `mac/win/linux.target`：各平台打包格式

调整以上字段后执行 `pnpm build` 生成对应平台安装包。

### 环境变量（.env）

项目支持从根目录 `.env` 系列文件读取配置，优先级：

`.env.[mode].local` > `.env.[mode]` > `.env.local` > `.env`

渲染进程需以 `VITE_` 前缀暴露变量；主进程可直接读取 `process.env`。

示例：

```
# 主进程
APP_NAME=Stock Trainer Pro

# 渲染进程
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

当前生效点：

- 主进程窗口标题：读取 `APP_NAME`，默认为 `Stock Trainer Pro`
- 渲染进程：可通过 `import.meta.env.VITE_*` 访问变量

可选变量说明：

- `VITE_SUPABASE_URL`：Supabase 项目 URL
- `VITE_SUPABASE_ANON_KEY`：Supabase 匿名 Key

注：未配置时应用仍可在纯本地模式下运行；接入云端能力后这些变量将启用。

## 使用流程

1. 注册账号（本地/云端，视实现方案）
2. 选择股票与周期
3. 开始训练（隐藏未来K线）
4. 技术分析（指标与画线）
5. 模拟交易（下单与仓位管理）
6. 查看收益率与排行榜

## 路线图

- 数据接入：本地 SQLite 与数据导入工具
- 云端账户：接入 Supabase 账户与同步
- 交易引擎：撮合与成交模型、滑点与费用更精细化
- 评估系统：收益率、最大回撤、夏普比率等指标
- 比赛体系：赛制模板、奖惩与回放
- AI 能力：交易行为分析与评分、策略建议
- 多市场支持：A股/美股/港股/加密货币

## 常见问题

- 开发时没有自动弹出应用窗口
  - 请确认 `pnpm dev` 正在运行；等待 Vite Dev Server 启动后 Electron 才会加载
- 打包后无法启动
  - 请检查 `electron-builder.json5` 中的 `productName/appId` 是否已正确设置
- 渲染进程无法访问 Node/Electron API
  - 相关能力应通过 `preload.ts` 暴露到 `window`，在渲染侧通过安全桥接访问

## 贡献

欢迎提交 Issue 与 Pull Request：

- 分支建议：`feat/*`、`fix/*`、`chore/*`
- 提交规范：建议使用 Conventional Commits（如 `feat: xxx` / `fix: yyy`）
- 代码风格：TypeScript + Vue SFC（Composition API）；建议在本地启用 ESLint/Prettier

## License

MIT License

## 免责声明

本项目仅用于技术研究与交易训练，不构成任何投资建议。应用中涉及的市场数据、示例或回测结果仅供学习参考，请自行承担使用风险。请确保遵守所在地区的法律法规与数据使用协议。
