# ALIGNMENT_pc

## 项目概述
- 包名：`car-trading-pc`（二手车信息发布与交易 PC 端）
- 技术栈：Vue 3、TypeScript、Vite 7、Pinia 3、Vue Router 4、Element Plus、Axios、vue-i18n、Sass
- 运行方式：`pnpm i && pnpm dev`，开发端口动态分配（优先 3001），代理 `/api`、`/uploads` 至 `http://localhost:8000`

## 范围与边界
- 范围：页面路由与守卫、用户登录与会话、车源列表/详情/发布、订单创建/支付/取消/完成、品牌与系列选择、图片/视频上传、国际化与样式
- 边界：后端服务与数据模型由 `http://localhost:8000` 提供；本包仅负责前端展示与交互，不含后端实现

## 架构理解
- 入口初始化：`src/main.ts` 完成 Pinia / Router / i18n / ElementPlus 注册与挂载
- 根组件：`src/App.vue` 在 `onMounted` 恢复本地会话（Token + 用户信息）
- 路由与守卫：`src/router/index.ts` 使用 `requiresAuth` 元信息与 `beforeEach` 守卫做登录拦截；统一页面标题
- 网络层：`src/api/request.ts` 统一 Axios 实例与拦截器；为请求附加 `Bearer` Token；按状态码统一错误提示；`401` 清理会话并跳转登录
- 业务分层：`api/`(接口)、`stores/`(状态)、`views/`(页面)、`components/`(组件)、`composables/`(复用逻辑)、`services/`(领域服务)、`utils/`、`types/`、`locales/`、`layouts/`、`styles/`

## 依赖与约定
- 依赖管理：`pnpm`；`packageManager` 锁定版本，`vitest` 预置测试命令
- UI 与自动导入：`unplugin-auto-import` 与 `unplugin-vue-components` 配合 `Element Plus` 解析器
- 国际化：`vue-i18n`，提供 `zh-CN/en-US/ja-JP/ko-KR/zh-TW`，数字与日期格式按区域配置
- 样式：`scss` 预处理，`variables.scss` 通过 `additionalData` 注入全局

## 现状与问题
- Token 恢复：已在 `App.vue` 统一恢复，但需确认异常场景（损坏内容）处理与路由重定向一致性
- 图片类型定义：`types/index.ts` 与 `composables/useImageManager.ts` 存在重复类型，建议统一来源以避免漂移
- 422 校验提示：对复杂 `details` 结构的提示需统一与细化，保证用户可清晰定位问题
- 批量上传：当前为串行，后续可按并发/重试策略优化体验与效率

## 问题清单（待验证优先级）
1. 鉴权异常（Token 过期/损坏）时，路由守卫与拦截器的交互是否完全一致？
2. 国际化文案覆盖率与货币/日期格式是否在所有页面一致？
3. 批量上传在大文件与弱网场景的反馈与重试是否充分？
4. 列表分页在滚动加载场景下的状态与边界处理是否完备？

## 关键假设
- 后端接口遵循文档路径（如 `/cars`、`/orders`、`/auth` 等），并按响应模型返回数据
- 开发环境端口与代理可正常工作，不存在跨域与证书问题

