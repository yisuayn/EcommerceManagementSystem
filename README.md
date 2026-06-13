# EcommerceManagementSystem

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
# Ecommerce Management System - 电商后台管理系统

## 项目简介

基于 Vue 3 + TypeScript + Element Plus 开发的现代化电商后台管理系统，提供完整的商品管理、订单管理、营销中心、系统设置等功能模块。

## 技术栈

- **前端框架**: Vue 3.5+ (Composition API)
- **开发语言**: TypeScript 5.x
- **UI 组件库**: Element Plus 2.x
- **路由管理**: Vue Router 4.x
- **状态管理**: Pinia 2.x
- **HTTP 请求**: Axios
- **图表库**: ECharts 5.x
- **样式预处理**: SCSS
- **构建工具**: Vite 5.x
- **代码规范**: ESLint + Prettier + Oxlint

## 项目结构


## 功能模块

### 核心功能

- ✅ **数据看板** - 销售数据可视化、核心指标展示
- ✅ **商品管理** - 商品列表、商品发布、库存管理、数据报表
- ✅ **订单管理** - 订单列表、售后管理、异常监控
- ✅ **营销中心** - 优惠券管理、秒杀活动
- ✅ **系统设置** - 管理员管理、角色权限、操作日志
- ✅ **用户管理** - 用户信息、权限控制

### 技术特性

- 🔒 **权限控制** - 基于角色的访问控制 (RBAC)
- 📊 **数据可视化** - ECharts 图表展示
- 🎨 **主题定制** - 支持 SCSS 变量定制主题
- 📱 **响应式设计** - 适配不同屏幕尺寸
- 🚀 **性能优化** - 路由懒加载、组件按需引入
- 📝 **TypeScript** - 完整的类型定义

## 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0

### 安装步骤

1. **克隆项目**

```bash
git clone <repository-url>
cd EcommerceManagementSystem