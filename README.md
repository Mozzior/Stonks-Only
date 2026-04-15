# Stocks Only Monorepo

`Stocks Only` 已升级为 `pnpm workspace` Monorepo，用来统一管理桌面端、手机端与共享模块。

## 目录结构

```text
.
├─ apps/
│  ├─ desktop/      # Electron + Vue 3 桌面端
│  ├─ mobile/       # Expo + React Native 手机端
│  └─ server/       # Appwrite Functions / Docker / 服务端脚本
├─ packages/
│  └─ shared/       # 跨端共享模块（文案、翻译工具、配置解析）
├─ docs/
└─ pnpm-workspace.yaml
```

## 开发命令

```bash
pnpm install
pnpm dev
pnpm dev:mobile
```

## 手机端命令

```bash
pnpm mobile:ios
pnpm mobile:android
pnpm mobile:web
```

## 构建与检查

```bash
pnpm build
pnpm build:desktop
pnpm typecheck
```

## 应用说明

- `apps/desktop`：保留原有电脑端交易训练能力，适合深度图表、复盘和复杂交互
- `apps/mobile`：采用 `Expo + React Native`，适合真机查看训练状态、账户概览和轻量操作
- `apps/server`：统一放置 Appwrite Functions、`docker-compose.yml`、部署脚本，以及后续服务端内容
- `packages/shared`：沉淀跨端可复用模块，避免重复维护

## 服务端命令

```bash
pnpm server:appwrite:up
pnpm server:appwrite:down
pnpm server:appwrite:logs
pnpm server:appwrite:functions:install
pnpm server:appwrite:deploy
```

## 环境变量

- 桌面端：将环境变量放到 `apps/desktop/.env`、`apps/desktop/.env.development`、`apps/desktop/.env.production`
- 手机端：将 Expo 变量放到 `apps/mobile/.env`
- 服务端：将 Appwrite 私密变量放到 `apps/server/.env`
- 参考示例：
- `apps/desktop/.env.example`
- `apps/mobile/.env.example`
- `apps/server/.env.example`
- 桌面端使用 `VITE_*`
- 手机端使用：
- `EXPO_PUBLIC_APPWRITE_ENDPOINT`
- `EXPO_PUBLIC_APPWRITE_PROJECT_ID`
- `EXPO_PUBLIC_APPWRITE_DATABASE_ID`
- `EXPO_PUBLIC_APPWRITE_PLATFORM_ID`
- `EXPO_PUBLIC_APPWRITE_USER_PROFILE_COLLECTION_ID`
- `EXPO_PUBLIC_APPWRITE_TRAINING_BALANCE_LEDGER_COLLECTION_ID`
- `EXPO_PUBLIC_APPWRITE_TRAINING_SESSION_COLLECTION_ID`
- `EXPO_PUBLIC_APPWRITE_TRAINING_TRADE_LOG_COLLECTION_ID`
- 服务端使用：
- `APPWRITE_ENDPOINT`
- `APPWRITE_PROJECT_ID`
- `APPWRITE_API_KEY`
