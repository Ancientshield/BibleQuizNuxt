# BibleQuizNuxt

> 聖經問答遊戲 — Nuxt 4 前端。漸層動畫背景、玻璃擬態 UI、零延遲答題、四家社群登入、投稿審核後台，一份從零打到 production 的 SSG 站點。

[![Nuxt](https://img.shields.io/badge/Nuxt-4.4-00DC82?logo=nuxt.js&logoColor=white)](#)
[![Vue](https://img.shields.io/badge/Vue-3.5-4FC08D?logo=vue.js&logoColor=white)](#)
[![Pinia](https://img.shields.io/badge/Pinia-3.0-ffd859?logo=pinia&logoColor=black)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](#)
[![SCSS](https://img.shields.io/badge/SCSS-BEM-CC6699?logo=sass&logoColor=white)](#)
[![pnpm](https://img.shields.io/badge/pnpm-10.33-F69220?logo=pnpm&logoColor=white)](#)
[![License](https://img.shields.io/badge/license-MIT-informational)](#)

線上 demo：<https://biblequiz.cc>　後端 repo：<https://github.com/Ancientshield/BibleQuizJava>

---

## 專案介紹

BibleQuizNuxt 是 [BibleQuiz](https://biblequiz.cc) 的前端 SPA。使用者進入首頁，按下「開始挑戰」抽 10 題隨機聖經問答，答完看分數與作答回顧；登入後可以保留歷史、投稿題目、查看個人統計；管理者可進後台審核投稿。

技術上是一份 **Nuxt 4 SSG 站點**：開發時走 Vite + Nitro devProxy，部署時 `nuxt generate` 產出純靜態檔案，由 nginx 在 Docker container 內託管並反向代理 `/api` 到 Spring Boot 後端。整站沒有 SSR，沒有 Node runtime 在 production，部署成本接近於 host 靜態檔案。

---

## 技術棧

| 類別 | 選用 | 說明 |
| --- | --- | --- |
| 框架 | Nuxt 4.4 + Vue 3.5 | File-based routing、auto-import |
| 渲染模式 | **SSG**（`nuxt generate`） | 純靜態檔案，nginx 託管 |
| 狀態管理 | Pinia 3 + `@pinia/nuxt` | auth store 與 localStorage 同步 |
| 樣式 | SCSS（BEM）+ Tailwind utility | 視覺以 SCSS 為主，Tailwind 只保留 flex / spacing |
| 圖示 | `@nuxt/icon` + `@iconify-json/lucide` | 不在 Vue 檔內塞 inline SVG |
| 型別 | TypeScript（co-locate） | 型別跟著使用它的檔案走，不抽 `types/` |
| 套件管理 | pnpm 10.33 | 工作區 + 嚴格 hoist |
| Lint / Commit | Prettier + husky + lint-staged + commitlint | Conventional Commits 強制 |
| 部署 | Docker multi-stage：node build → nginx | image 體積最小化 |

刻意 **不用** UI 元件庫（Element Plus / Nuxt UI 等）。整套元件手刻 Atomic Design 三層，是為了把樣式控制權留在自己手上 —— 動畫節奏、漸層方向、玻璃擬態的模糊強度都要能逐 pixel 調整。

---

## 設計理念

**一、SSG 優先。** 內容公開、單人開發、不希望養 Node runtime —— SSG 是最划算的部署模式。SEO 友善、CDN 友善、Cloudflare 友善，nginx 一個 container 就能託管整個前端。

**二、前端本地驗答。** 後端 `GET /start` 一次回 10 題含 `correct` 旗標，整輪測驗中**不再打 API**。選答 → 比對 → 立刻動畫，零延遲。原本逐題 POST 的設計在 Phase E 被砍掉。這個架構決定來自一個簡單前提：題目和答案本來就要送到客戶端，再走一次 round-trip 純粹是延遲。

**三、Atomic Design 三層 + 元件 co-locate。** Atom（最小可見單位）→ Molecule（組合 atom 形成獨立功能）→ Organism（完整功能區塊，含內部狀態）。Pages 只負責「組裝 + 串資料」，業務邏輯永遠下沉到 organism 或 composable。

**四、SCSS over Tailwind。** Tailwind 適合快速搭起來，但 hover 漸變、玻璃擬態、進度環掃光這種需要連續調整的視覺，class string 撐起來太醜。專案以 SCSS + BEM 為主，Tailwind 只當 layout utility 用。

**五、型別 co-locate。** TypeScript 型別跟著使用它的檔案，不抽 `types/` 集中管理。`QuestionDTO` 寫在 `useQuiz.ts` 裡，`UserInfo` 寫在 `stores/auth.ts` 裡。閱讀時不用跳檔案。

**六、路由守衛三段分工。** `plugin` 啟動時讀 localStorage 進 store、`middleware` 每次導航檢查權限、`store` 只負責「狀態 + 同步」不知道誰會用它。三者各司其職，store 沒有寫死任何權限規則。

---

## 頁面與路由

```
/                           首頁（漸層背景 + 玻璃擬態卡片 + 開始挑戰）
/start                      答題頁（blank layout，無 Navbar，攔截返回）
/login                      Email 登入 + 四家 OAuth
/forgot-password            寄重設信
/reset-password             帶 token 重設密碼
/verify                     Email 驗證 callback
/oauth/callback             OAuth 完成後接 token → store → 回首頁
/my-history                 個人作答歷史
/my-history/[id]            單一回合詳情
/questions/create           投稿題目
/questions/submissions      自己的投稿列表（含審核狀態）
/questions/[id]             編輯自己的投稿
/admin/questions            管理者後台（題目審核 + 分類 CRUD）
```

`admin/*` 走 `middleware/admin.ts`，非 ADMIN 自動踢回首頁。需要登入的頁走 `middleware/auth.ts`。

---

## 元件架構（Atomic Design）

28 個元件，分三層：

```
atom/   (8)   最小可見單位，無內部狀態，純展示
  ├ AtomButton                  漸層按鈕，多 variant
  ├ AtomInput                   文字輸入框
  ├ AtomGradientBackground      漸層動畫背景 + 浮動粒子
  ├ AtomOptionBadge             A/B/C/D 選項代號徽章
  ├ AtomResultIcon              ✓ / ✗ 圖示
  ├ AtomBibleRefPill            聖經出處 pill
  ├ AtomPagination              分頁器
  └ AtomTable                   基礎表格

molecule/ (12) 組合 atom 形成有意義的單元
  ├ MoleculeAuthInput           label + AtomInput + error message
  ├ MoleculeGradientButton      AtomButton + 漸層 + loading
  ├ MoleculeSelect              下拉選單（書卷、分類用）
  ├ MoleculeDatePicker          日期選擇
  ├ MoleculeTabs                tab 切換
  ├ MoleculeSocialLoginButton   四家 OAuth 入口按鈕
  ├ MoleculeOptionButton        Badge + Icon + Ripple，答題用
  ├ MoleculeProgressHeader      進度條 + 題號 + XP 分數
  ├ MoleculeQuestionCard        玻璃擬態題目卡
  ├ MoleculeQuizItem            歷史回合列表項
  ├ MoleculeScoreRing           分數進度環（含掃光動畫）
  └ MoleculeStatCard            統計卡片

organism/ (8) 完整功能區塊，可含內部狀態與 API 呼叫
  ├ OrganismNavbar              漢堡選單 + 登入態切換
  ├ OrganismGlassCard           可重用玻璃擬態容器
  ├ OrganismFilterBar           後台複合篩選列
  ├ OrganismQuestionForm        投稿/編輯表單
  ├ OrganismResultBoard         結算畫面（進度環 + 掃光 + 感言）
  ├ OrganismPublishQuestionModal    審核發布 modal
  ├ OrganismEditQuestionModal       審核編輯 modal
  └ OrganismCategoriesManagerModal  分類 CRUD modal
```

頁面只負責組裝與資料流。例如 `start.vue` 把 `MoleculeProgressHeader + MoleculeQuestionCard + MoleculeOptionButton ×4 + OrganismResultBoard` 串起來，再從 `useQuiz` 拿 state，幾乎不寫 markup 邏輯。

---

## 答題資料流

```
1. 進入 /start
   └─▶ onMounted → useQuiz.fetchQuestions()
        └─▶ GET /api/biblequiz/start
             └─▶ 10 題 + 每題 4 選項 + correct 旗標進前端 state

2. 使用者選答
   └─▶ useQuiz.checkAnswer(optionId)
        ├─ 本地比對 correct（零延遲）
        ├─ 累計 score
        ├─ push 一筆 AnswerRecord（不含題目內容，只存 id 對應）
        └─ 1.2s 顯示對/錯動畫 → 0.3s 滑出 → next question

3. 答完 10 題
   └─▶ OrganismResultBoard 顯示分數
        ├─ 未登入：本地顯示 + 不寫 DB
        └─ 已登入：POST /api/user/quiz/submit
                  └─▶ 後端用 records 重算分數寫 quiz_round / quiz_answer_log

4. 返回攔截
   └─▶ onBeforeRouteLeave + window.confirm
        「確定要離開？測驗進度不會保留」
```

`AnswerRecord` 只送 `questionId / selectedOptionId / isCorrect` 給後端，題目內容不重送 —— 重算分數時後端拿 `questionId` 去查 `question_option`，**不信任前端的 `isCorrect`**，防止作弊。

---

## 認證資料流

```
─── Email 登入 ─────────────────────────────────────────
login.vue
  └─▶ useAuthApi.login(email, password)
       └─▶ POST /api/auth/login
            └─▶ { token, user } → authStore.setSession()
                 ├─ token / user 進 ref
                 ├─ token / user 同步 localStorage
                 └─▶ navigateTo('/')

─── OAuth 登入 ─────────────────────────────────────────
登入頁按 Google
  └─▶ window.location = '/oauth2/authorization/google'
       └─▶ Spring Security 接手導去 Google
            └─▶ 使用者同意
                 └─▶ Google callback /login/oauth2/code/google
                      └─▶ OAuth2SuccessHandler 簽 JWT
                           └─▶ redirect /oauth/callback?token=XXX
                                ├─ middleware/oauth-callback.global.ts 攔截
                                ├─ 解析 token → authStore.setSession()
                                └─▶ navigateTo('/')

─── App 啟動 ───────────────────────────────────────────
plugins/auth.client.ts
  └─▶ authStore.init()
       ├─ initialized flag 防重複
       ├─ 從 localStorage 讀 token / user
       └─ 寫回 store
```

關鍵設計：**OAuth callback 用 global middleware 而非 page setup**。SSG 下 `/oauth/callback?token=XXX` 走 hydration 過程，page 的 `onMounted` 有時來不及在 router 完成導航前抓到 query，token 會丟。改用 `oauth-callback.global.ts` 在 `beforeEach` 階段攔截，繞開這個 edge case。

`useAuthStore.init()` 不能寫成 `ref(localStorage.getItem('token'))`，因為 `nuxt generate` 預渲染跑在 Node，沒有 `localStorage`，會拋 `ReferenceError`。所以初始值寫死 `null`，等 client-side plugin 啟動時才從 localStorage 還原。

---

## API 串接策略

不用 `useFetch` / `useAsyncData`，全部用 `$fetch` —— 因為這站是 SSG + 全 client-side 邏輯，asyncData 那套主要服務 SSR 場景。

API 路徑全部用相對路徑（`/api/biblequiz/start`），不寫死 domain：

- **本機開發**：`nitro.devProxy` 把 `/api/*` 轉到 `http://localhost:8080/api/*`
- **正式環境**：nginx 反向代理 `/api/*` 到 backend container（同 origin，不跨域，不需 CORS）

Composables 按業務分檔：

| Composable | 職責 |
| --- | --- |
| `useQuiz.ts` | 答題狀態機（fetch / check / next / result / reset） |
| `useAuthApi.ts` | 註冊 / 登入 / 驗證 / 忘記密碼 |
| `useAuthFetch.ts` | `$fetch` wrapper，自動帶 `Authorization: Bearer` |
| `useQuestionApi.ts` | 使用者投稿 CRUD |
| `useAdminQuestionApi.ts` | 後台審核 |
| `useQuizHistoryApi.ts` | 個人歷史與統計 |
| `useQuizItems.ts` | 歷史列表呈現邏輯 |

---

## 視覺主題

整站走「夜空漸層 + 玻璃擬態 + 金色點綴」風格：

- 背景：CSS `linear-gradient` 多色漸層 + 浮動粒子（`@keyframes float`）
- 卡片：`backdrop-filter: blur(20px)` + 半透明白 + 細邊框
- 按鈕：漸層底 + hover 提升 + active 凹陷
- 結算：圓形進度環 `stroke-dasharray` 動畫 + 對角線掃光 `linear-gradient` + 不同分數區間的不同感言

SCSS 結構：

```
assets/scss/
├── main.scss           全域 reset + body 樣式
├── _variables.scss     色票、間距、breakpoint
└── _animations.scss    共用 keyframes（float / shimmer / ripple）
```

`_variables.scss` 透過 `vite.css.preprocessorOptions.scss.additionalData` 自動注入每個 SCSS block，每個元件 `<style lang="scss" scoped>` 內可以直接用 `$primary` `$radius-lg` 等變數，不用手動 `@use`。

---

## 目錄結構

```
BibleQuizNuxt/
├── app/
│   ├── app.vue                  <NuxtPage /> 入口
│   ├── pages/                   14 個 page，file-based routing
│   ├── layouts/
│   │   ├── default.vue          有 Navbar
│   │   └── blank.vue            無 Navbar（答題頁、登入頁）
│   ├── components/
│   │   ├── atom/                8 個
│   │   ├── molecule/            12 個
│   │   └── organism/            8 個
│   ├── composables/             7 個 API / 邏輯 composable
│   ├── stores/
│   │   └── auth.ts              Pinia auth store
│   ├── plugins/
│   │   └── auth.client.ts       app 啟動初始化 store
│   ├── middleware/
│   │   ├── auth.ts              未登入 → /login
│   │   ├── admin.ts             非 ADMIN → /
│   │   └── oauth-callback.global.ts   OAuth token 攔截
│   ├── utils/
│   │   └── bibleReference.ts    經文出處格式化
│   └── assets/scss/             樣式
├── public/                      favicon、robots
├── nginx/
│   └── default.conf             SSG 後 nginx 設定
├── Dockerfile                   multi-stage build
├── nuxt.config.ts
├── package.json
└── tsconfig.json
```

---

## 在本機跑起來

需要 Node 22+ 和 pnpm 10。後端需在 `localhost:8080`（見 [BibleQuizJava](https://github.com/Ancientshield/BibleQuizJava)）。

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

`nitro.devProxy` 自動把 `/api/*` 轉到後端，所以本機開發不會撞到 CORS。

### 其他指令

```bash
pnpm generate     # SSG 產出靜態檔案到 .output/public
pnpm build        # Nuxt build（一般 SSR/server 模式，本專案不用）
pnpm preview      # 預覽 generate 結果
pnpm cz commit    # commitizen 互動式 conventional commit
```

### Docker 部署

```bash
docker build -t biblequiz-nuxt .
docker run -p 80:80 biblequiz-nuxt
```

multi-stage build：

```
[build stage]   node:24-bookworm-slim
                pnpm install --frozen-lockfile
                pnpm run generate  → .output/public

[runtime stage] nginx:alpine
                COPY .output/public → /usr/share/nginx/html
                COPY nginx/default.conf
                EXPOSE 80
```

最終 image 大小由 nginx:alpine 決定（~50MB），node_modules 不會帶進去。

---

## Commit 品質管控

```
git commit
  ├─▶ husky pre-commit
  │     └─▶ lint-staged → prettier --write *.{ts,js,vue,css,scss}
  └─▶ husky commit-msg
        └─▶ commitlint → 強制 Conventional Commits
```

不符合 `type(scope): message` 格式的 commit 會被擋下。互動式產生 commit message：`pnpm cz commit`。

---

## License

MIT
