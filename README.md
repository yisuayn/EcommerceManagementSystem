# EcommerceManagementSystem - 电商后台管理系统

<div align="center">

**品牌：星辰科技 | 现代化电商运营管理平台**

基于 **Vue 3 + TypeScript + Element Plus** 构建的全面电商后台管理系统，为电商运营提供一站式的数据看板、商品管理、订单处理、营销推广与系统管理解决方案。

</div>

---

## 📖 目录

- [项目简介](#项目简介)
- [技术栈](#技术栈)
- [项目结构](#项目结构)
- [功能模块](#功能模块)
- [路由一览](#路由一览)
- [快速开始](#快速开始)
- [开发指南](#开发指南)
- [构建部署](#构建部署)
- [API 接口](#api-接口)
- [权限体系](#权限体系)
- [环境变量](#环境变量)
- [浏览器支持](#浏览器支持)

---

## 项目简介

本项目是一个功能完善的电商后台管理系统前端应用，覆盖电商运营的十二大核心模块（含会员管理、物流系统、CMS 内容管理、财务管理、评价系统、通知系统等新增模块）。系统采用现代化的前端技术栈，提供了丰富的交互体验与数据可视化能力，目前处于前端开发阶段，所有页面均使用模拟数据展示，待对接后端 API 即可投入生产使用。

### 主要特性

- 🔒 **RBAC 权限控制** — 基于角色的访问控制，细粒度到页面级权限
- 📊 **数据可视化** — 集成 ECharts 6，支持折线图、柱状图、饼图、雷达图、散点图、仪表盘等多种图表
- 🎨 **现代化 UI** — Element Plus 组件库 + 毛玻璃效果 + 渐变色主题 + 交互动画
- 📝 **富文本编辑** — TipTap 编辑器，支持图文混排、标题、列表、代码块等
- 🔄 **状态持久化** — Pinia + `pinia-plugin-persistedstate`，登录状态持久化存储
- 🚀 **性能优化** — 路由懒加载、组件按需引入
- 📱 **响应式设计** — 适配不同屏幕尺寸
- 🛡️ **TypeScript 6** — 全量类型定义，严格的类型检查

---

## 技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| **前端框架** | Vue 3 (Composition API + `<script setup>`) | ^3.5.32 |
| **开发语言** | TypeScript | ~6.0.0 |
| **UI 组件库** | Element Plus | ^2.14.1 |
| **路由管理** | Vue Router (History 模式) | ^5.0.4 |
| **状态管理** | Pinia | ^3.0.4 |
| **HTTP 请求** | Axios | ^1.17.0 |
| **图表库** | ECharts | ^6.1.0 |
| **富文本编辑器** | TipTap (vue-3 扩展) | ^3.26.1 |
| **样式预处理** | SCSS (sass) | ^1.100.0 |
| **构建工具** | Vite | ^8.0.8 |
| **工具库** | @vueuse/core | ^14.3.0 |
| **图标库** | @element-plus/icons-vue | ^2.3.2 |
| **进度条** | nprogress | ^0.2.0 |
| **代码规范** | ESLint + Prettier + Oxlint | — |

---

## 项目结构

```
EcommerceManagementSystem/
│
├── index.html                         # HTML 入口
├── package.json                       # 项目配置与依赖
├── vite.config.ts                     # Vite 构建配置
├── tsconfig.json                      # TypeScript 根配置
├── tsconfig.app.json                  # TypeScript 应用配置
├── tsconfig.node.json                 # TypeScript Node 配置
├── env.d.ts                           # 环境类型声明
├── eslint.config.ts                   # ESLint 配置
│
└── src/
    ├── main.ts                        # 应用入口（注册 Router/Pinia/ElementPlus）
    ├── App.vue                        # 根组件
    │
    ├── assets/                        # 静态资源
    │   ├── logo.svg                   # Logo 图标
    │   ├── base.css                   # CSS 变量与样式重置
    │   ├── main.css                   # 主样式（引入 base.css）
    │   └── style/
    │       ├── login.scss             # 登录页样式
    │       └── register.scss          # 注册页样式
    │
    ├── router/
    │   ├── index.ts                   # 路由配置（懒加载 + History 模式）
    │   └── permission.ts             # 路由守卫（权限拦截 + NProgress）
    │
    ├── stores/
    │   ├── counter.ts                 # Pinia 实例（注册持久化插件）
    │   └── modules/
    │       └── user.ts                # 用户状态（token / userInfo / 登录/登出）
    │
    ├── api/
    │   ├── auth.ts                    # 认证 API（登录/注册/用户信息/退出）
    │   ├── dashboard.ts              # 看板数据 API
    │   ├── product.ts                # 商品相关 API
    │   ├── member.ts                 # 会员管理 API
    │   ├── logistics.ts              # 物流系统 API
    │   ├── cms.ts                    # 内容管理 API
    │   ├── finance.ts                # 财务管理 API
    │   ├── review.ts                 # 评价系统 API
    │   └── notification.ts           # 通知系统 API
    │
    ├── utils/
    │   ├── request.ts                 # Axios 封装（拦截器 / Token 注入 / 错误处理）
    │   └── auth.ts                    # 认证工具函数
    │
    ├── components/
    │   ├── Layout/
    │   │   ├── index.vue              # 主布局（Header + Sidebar + Main）
    │   │   └── layout.scss            # 布局样式
    │   ├── Header/
    │   │   └── index.vue              # 顶部导航栏（Logo / 搜索 / 通知 / 用户菜单）
    │   ├── Sidebar/
    │   │   ├── index.vue              # 侧边栏菜单（el-menu / 折叠 / 高亮）
    │   │   └── sidebar.scss           # 侧边栏样式
    │   ├── Dashboard/
    │   │   ├── index.vue              # 数据看板主页
    │   │   └── dashboard.scss         # 看板样式
    │   ├── echarts/
    │   │   └── index.vue              # 通用 ECharts 图表组件（6 种图表类型）
    │   ├── Footer/
    │   │   └── index.vue              # 页脚组件
    │   └── 404/
    │       └── index.vue              # 404 页面
    │
    └── views/
        ├── login/
        │   ├── Login.vue              # 登录页（邮箱+密码 / 第三方登录占位）
        │   └── Register.vue           # 注册页（完整表单验证）
        │
        ├── product/
        │   ├── productlist.vue        # 商品列表（搜索/分页/编辑抽屉）
        │   ├── productlaunch.vue      # 商品发布（多步骤表单/规格生成/富文本）
        │   ├── Inventory.vue          # 库存管理（入库/出库/盘点/记录）
        │   └── Datareport.vue         # 数据报表（多维度图表 + 销售明细）
        │
        ├── orders/
        │   ├── allorders.vue           # 订单列表（筛选/批量操作/发货/详情抽屉）
        │   ├── aftersales.vue          # 售后管理（审核/退货/退款/凭证）
        │   └── abnormal.vue            # 异常监控（分类/趋势/处理）
        │
        ├── member/                     # 会员管理
        │   ├── list.vue                # 会员列表（搜索/筛选/编辑抽屉/状态开关）
        │   ├── level.vue               # 会员等级（等级卡片/权益配置/折扣率）
        │   └── points.vue              # 积分管理（规则配置/积分流水查询）
        │
        ├── logistics/                  # 物流系统
        │   ├── template.vue            # 运费模板（按件/按重量/包邮门槛/地区）
        │   ├── company.vue             # 物流公司（顺丰/中通等配置管理）
        │   └── tracking.vue            # 物流追踪（运单查询/时间线/状态）
        │
        ├── cms/                        # 内容管理
        │   ├── banner.vue              # Banner 管理（轮播图/有效期/排序）
        │   └── article.vue             # 文章管理（公告/资讯/活动发布）
        │
        ├── finance/                    # 财务管理
        │   ├── transaction.vue         # 交易流水（资金明细/支付方式/状态）
        │   └── refund.vue              # 退款管理（退款审核/流程/统计）
        │
        ├── review/                     # 评价管理
        │   └── list.vue                # 评价列表（评分/审核/回复/屏蔽）
        │
        ├── notification/               # 通知系统
        │   ├── template.vue            # 通知模板（短信/邮件/站内信配置）
        │   └── log.vue                 # 发送记录（发送状态/失败原因/详情）
        │
        ├── marketing/
        │   ├── coupon.vue              # 优惠券管理（新建/发放/统计）
        │   └── seckill.vue             # 秒杀活动（时间轴/场次/商品管理）
        │
        └── system/
            ├── user.vue                # 管理员管理（CRUD / 角色分配 / 状态）
            ├── role.vue                # 角色权限管理（el-tree 权限树）
            └── log.vue                 # 操作日志（筛选/详情/JSON 展示）
```

---

## 功能模块

### 1. 🔑 用户认证系统

| 功能 | 说明 |
|------|------|
| **登录** | 邮箱 + 密码登录，支持"记住我"和密码可见切换 |
| **注册** | 完整字段（姓名/邮箱/手机/密码），前端表单验证 |
| **第三方登录** | Google / 微信 / GitHub 登录入口（占位待对接） |
| **权限拦截** | 路由守卫自动检测 token，未登录重定向至 `/login` |

### 2. 📊 数据看板

| 功能 | 说明 |
|------|------|
| **统计卡片** | 今日订单 (1,234)、商品总数 (8,942)、用户总数 (15,678)、今日收入 (¥89,234) |
| **图表类型** | 折线图（月度销售趋势）、柱状图（产品销售排行）、饼图（市场份额）、散点图、雷达图（能力评估）、仪表盘（完成率） |
| **图表切换** | 下拉选择 6 种图表即时切换 |

### 3. 📦 商品管理

| 功能 | 说明 |
|------|------|
| **商品列表** | 表格展示 SKU / 品牌 / 名称 / 价格 / 库存 / 销量 / 标签；分页支持 15/25/35/45 条/页 |
| **商品编辑** | 侧边抽屉表单，编辑所有商品字段（含上架/下架、热销/新品开关） |
| **商品发布** | 6 步骤表单：基础信息 → 商品属性 → 图片上传（5MB/5张） → 规格管理（动态生成 SKU） → 富文本详情（TipTap） → SEO 信息 |
| **库存管理** | 概览卡片 + 入库/出库/盘点/变动记录；低库存/缺货高亮提示 |
| **数据报表** | 日期范围筛选 + 5 类图表（销售趋势/销量排行/分类占比/用户来源/订单状态）+ 销售明细表 |

### 4. 🧑 会员管理（新增）

| 功能 | 说明 |
|------|------|
| **会员列表** | 表格展示：昵称/手机号/等级/积分/余额/订单数/累计消费；搜索筛选/状态开关/编辑 |
| **会员等级** | 等级卡片展示（普通/银卡/金卡/钻石），配置升级所需积分、折扣率、权益描述 |
| **积分管理** | Tab 切换：积分获取规则配置（注册/签到/消费/评价等比例）+ 积分变动流水查询 |

### 5. 📋 订单管理

| 功能 | 说明 |
|------|------|
| **订单列表** | 统计卡片（可点击筛选）+ 多维筛选（状态/支付/时间）+ 批量操作（发货/取消/导出） |
| **订单详情** | 抽屉展示：进度步骤条 + 商品信息 + 物流时间轴 + 支付信息 |
| **发货管理** | 选择物流公司 + 填写物流单号 |
| **售后管理** | 售后单全流程：待审核 → 审核通过 → 待退货 → 待收货 → 已完成/已拒绝 |
| **售后详情** | 进度步骤条 + 凭证图片 + 退货物流 + 审核意见 + 操作记录时间轴 |
| **异常监控** | 异常类型（订单/支付/库存/系统/物流）+ 级别（严重/警告/提示）+ 趋势图表 + 处理流程 |

### 6. 🚚 物流系统（新增）

| 功能 | 说明 |
|------|------|
| **运费模板** | 按件/按重量计价，地区运费差异化（全国/偏远地区），满额包邮规则 |
| **物流公司** | 物流公司启用/停用，编码、联系电话、追踪 URL 模板配置 |
| **物流追踪** | 运单号查询，展示物流公司及完整时间线，支持异常状态提示 |

### 7. 📰 内容管理 CMS（新增）

| 功能 | 说明 |
|------|------|
| **Banner 管理** | 首页轮播图：图片上传/预览、标题副标题、跳转链接、排序、上架/下架、有效期 |
| **文章管理** | 资讯/公告发布：标题、分类、封面、作者、内容编辑、发布/草稿状态 |

### 8. 💰 财务管理（新增）

| 功能 | 说明 |
|------|------|
| **交易流水** | 统计卡片（今日/本月交易额及笔数）+ 搜索筛选 + 交易明细表（金额/支付方式/类型/状态） |
| **退款管理** | 退款申请统计 + 审核流程（待审核→通过/拒绝→确认退款）+ 退款原因及金额明细 |

### 9. ⭐ 评价系统（新增）

| 功能 | 说明 |
|------|------|
| **评价管理** | 商品评价展示（评分/内容/图片），审核（通过/屏蔽），商家回复，统计卡片 |

### 10. 🔔 通知系统（新增）

| 功能 | 说明 |
|------|------|
| **通知模板** | 短信/邮件/站内信模板管理，支持变量占位符（{nickname}/{orderNo}等） |
| **发送记录** | 发送日志查询：收件人、类型、状态（成功/失败）、失败原因、发送时间 |

### 11. 🎯 营销中心

| 功能 | 说明 |
|------|------|
| **优惠券管理** | 满减券/折扣券/现金券/运费券；新建/编辑/发放/禁用；统计总数/进行中/今日发放/今日使用 |
| **秒杀活动** | 6 个场次时间轴（00:00~24:00）；秒杀商品卡片（倒计时/进度条）；活动 CRUD |

### 12. ⚙️ 系统设置

| 功能 | 说明 |
|------|------|
| **管理员管理** | CRUD 操作；头像/角色标签/状态开关/重置密码；查看详情（含 IP/创建时间等） |
| **角色权限** | 左右分栏：左侧角色列表（搜索/分页），右侧 el-tree 权限树（5 大模块细粒度权限） |
| **操作日志** | 多维度筛选（模块/类型/时间/操作人）+ 统计卡片 + 详情 JSON 展示 + 批量删除/导出 |

---

## 路由一览

| 路径 | 组件 | 说明 | 懒加载 |
|------|------|------|--------|
| `/login` | `Login.vue` | 登录页 | ✅ |
| `/register` | `Register.vue` | 注册页 | ✅ |
| `/` | `Layout/index.vue` | 主布局（重定向至 `/dashboard`） | ✅ |
| `/dashboard` | `Dashboard/index.vue` | 数据看板 | ✅ |
| `/orders/list` | `orders/allorders.vue` | 订单列表 | ✅ |
| `/orders/abnormal` | `orders/abnormal.vue` | 异常监控 | ✅ |
| `/orders/aftersales` | `orders/aftersales.vue` | 售后管理 | ✅ |
| `/product/list` | `product/productlist.vue` | 商品列表 | ✅ |
| `/product/datareport` | `product/Datareport.vue` | 数据报表 | ✅ |
| `/product/inventory` | `product/Inventory.vue` | 库存管理 | ✅ |
| `/product/launch` | `product/productlaunch.vue` | 商品发布 | ✅ |
| `/member/list` | `member/list.vue` | 会员列表 | ✅ |
| `/member/level` | `member/level.vue` | 会员等级 | ✅ |
| `/member/points` | `member/points.vue` | 积分管理 | ✅ |
| `/logistics/template` | `logistics/template.vue` | 运费模板 | ✅ |
| `/logistics/company` | `logistics/company.vue` | 物流公司 | ✅ |
| `/logistics/tracking` | `logistics/tracking.vue` | 物流追踪 | ✅ |
| `/cms/banner` | `cms/banner.vue` | Banner 管理 | ✅ |
| `/cms/article` | `cms/article.vue` | 文章管理 | ✅ |
| `/finance/transaction` | `finance/transaction.vue` | 交易流水 | ✅ |
| `/finance/refund` | `finance/refund.vue` | 退款管理 | ✅ |
| `/review/list` | `review/list.vue` | 评价管理 | ✅ |
| `/notification/template` | `notification/template.vue` | 通知模板 | ✅ |
| `/notification/log` | `notification/log.vue` | 发送记录 | ✅ |
| `/marketing/coupon` | `marketing/coupon.vue` | 优惠券管理 | ✅ |
| `/marketing/seckill` | `marketing/seckill.vue` | 秒杀活动 | ✅ |
| `/system/admin` | `system/user.vue` | 管理员管理 | ✅ |
| `/system/role` | `system/role.vue` | 角色权限 | ✅ |
| `/system/log` | `system/log.vue` | 操作日志 | ✅ |
| `/:pathMatch(.*)*` | `404/index.vue` | 404 页面 | ✅ |

---

## 快速开始

### 环境要求

- **Node.js** >= 20.19.0 或 >= 22.12.0
- **npm** >= 9.0.0

### 安装与运行

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器（支持热更新）
npm run dev

# 3. 浏览器访问
# 默认地址：http://localhost:5173
```

### 可用脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器（`--host` 支持局域网访问） |
| `npm run build` | 类型检查 + 生产构建 |
| `npm run build-only` | 仅生产构建（跳过类型检查） |
| `npm run preview` | 预览生产构建结果 |
| `npm run type-check` | 运行 TypeScript 类型检查 |
| `npm run lint` | 运行所有代码检查（Oxlint + ESLint） |
| `npm run format` | 使用 Prettier 格式化代码 |

---

## 开发指南

### 代码规范

项目使用 ESLint + Prettier + Oxlint 三重代码规范检查：

```bash
# 代码检查（自动修复）
npm run lint

# 代码格式化
npm run format

# 类型检查
npm run type-check
```

### 目录约定

```
src/
├── api/        # API 接口定义（按模块拆分）
├── assets/     # 静态资源（样式、图片等）
├── components/ # 公共组件（按模块目录组织）
├── router/     # 路由配置与守卫
├── stores/     # Pinia 状态管理
├── utils/      # 工具函数与 Axios 封装
└── views/      # 页面组件（按业务模块划分目录）
```

### 开发规范

- **组件命名**：多单词 PascalCase，与文件夹名保持一致
- **样式作用域**：使用 `<style scoped lang="scss">` 避免样式污染
- **API 调用**：统一通过 `src/api/` 下的模块调用，使用封装的 `request.ts`
- **状态管理**：全局状态使用 Pinia store，组件内部状态使用 `ref/reactive`
- **路由懒加载**：所有页面组件均使用动态 `import()` 方式导入

---

## 构建部署

```bash
# 生产构建
npm run build

# 构建产物位于 dist/ 目录
# 预览生产构建
npm run preview
```

### 部署说明

构建完成后，将 `dist/` 目录下的静态文件部署至 Web 服务器（Nginx / Apache / CDN）即可。

**推荐 Nginx 配置要点：**

```nginx
# 由于使用 History 模式路由，需配置 fallback 到 index.html
location / {
    try_files $uri $uri/ /index.html;
}
```

---

## API 接口

项目封装了统一的 Axios 请求实例（`src/utils/request.ts`），配置如下：

| 配置项 | 值 |
|--------|-----|
| baseURL | 环境变量 `VITE_API_BASE_URL`，默认 `/api` |
| 超时时间 | 10 秒 |
| 认证方式 | Bearer Token（自动从 localStorage 注入） |
| 错误处理 | 401 → 跳转登录；403/404/500 → 统一错误提示 |

### 现有接口定义

| 文件 | 函数 | 地址 | 方法 | 说明 |
|------|------|------|------|------|
| `api/auth.ts` | `loginApi` | `/auth/login` | POST | 用户登录 |
| `api/auth.ts` | `registerApi` | `/auth/register` | POST | 用户注册 |
| `api/auth.ts` | `getUserInfo` | `/userinfo` | GET | 获取用户信息 |
| `api/auth.ts` | `logout` | `/logout` | POST | 退出登录 |
| `api/dashboard.ts` | `dashboardApi` | `/getsaledata` | GET | 获取看板数据 |
| `api/product.ts` | `productApi` | `/admin/list` | GET | 获取商品列表 |
| `api/member.ts` | 5 个函数 | `/member/*` | GET/POST | 会员管理全量接口 |
| `api/logistics.ts` | 5 个函数 | `/logistics/*` | GET/POST/DELETE | 物流系统全量接口 |
| `api/cms.ts` | 6 个函数 | `/cms/*` | GET/POST/DELETE | 内容管理全量接口 |
| `api/finance.ts` | 3 个函数 | `/finance/*` | GET/POST | 财务管理全量接口 |
| `api/review.ts` | 4 个函数 | `/review/*` | GET/POST/DELETE | 评价系统全量接口 |
| `api/notification.ts` | 4 个函数 | `/notification/*` | GET/POST | 通知系统全量接口 |

---

## 权限体系

系统实现了基于角色的访问控制（RBAC），包含以下维度：

### 权限模块

| 一级模块 | 子权限 |
|---------|--------|
| 数据看板 | 查看、导出 |
| 商品管理 | 列表查看、商品发布、库存管理、分类管理 |
| 订单管理 | 列表查看、订单处理、售后管理、物流管理 |
| 会员管理 | 会员列表、等级管理、积分管理 |
| 物流系统 | 运费模板、物流公司、物流追踪 |
| 内容管理 CMS | Banner管理、文章管理 |
| 财务管理 | 交易流水、退款管理 |
| 评价系统 | 评价管理 |
| 通知系统 | 通知模板、发送记录 |
| 营销中心 | 优惠券管理、秒杀活动、促销管理 |
| 系统设置 | 管理员管理、角色管理、日志查看 |

### 预置角色

- **超级管理员** — 所有权限
- **商品管理员** — 商品管理相关权限
- **订单管理员** — 订单管理相关权限
- **财务管理员** — 订单与报表相关权限

### 权限控制层级

1. **路由层面** — `permission.ts` 路由守卫拦截未认证用户
2. **API 层面** — Axios 请求拦截器自动附加 Bearer Token
3. **UI 层面** — 角色权限管理页面支持为角色分配细粒度操作权限

---

## 环境变量

在项目根目录创建 `.env` 文件进行配置：

```env
# API 基础地址（默认 /api）
VITE_API_BASE_URL=/api
```

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `VITE_API_BASE_URL` | API 请求基础路径 | `/api` |

---

## 浏览器支持

| 浏览器 | 支持情况 |
|--------|---------|
| Chrome | ✅ 最新版及最近 2 个主要版本 |
| Edge | ✅ 最新版及最近 2 个主要版本 |
| Firefox | ✅ 最新版及最近 2 个主要版本 |
| Safari | ✅ 最新版及最近 2 个主要版本 |

---

## 许可证

本项目为私有项目，保留所有权利。

---

<div align="center">
  <sub>星辰科技 · 电商后台管理系统</sub>
</div>
