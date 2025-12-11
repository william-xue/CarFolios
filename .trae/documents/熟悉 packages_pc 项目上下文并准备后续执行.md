## 目标
- 深入分析并熟悉 `packages/pc` 的整体架构、技术栈与关键模块，形成可执行的对齐方案与后续改进清单。

## 项目速览
- 技术栈：`Vue 3 + TypeScript + Vite 7 + Pinia 3 + Vue Router 4 + Element Plus + Axios + vue-i18n + Sass`。
- 入口与初始化：`src/main.ts` 完成 Pinia、Router、i18n、Element Plus 注册与挂载；根组件 `App.vue` 在 `onMounted` 时恢复用户会话。
- 架构分层：`api/`(接口封装)、`stores/`(状态)、`router/`(路由/守卫)、`views/`(页面)、`components/`(组件)、`composables/`(复用逻辑)、`services/`(领域服务)、`utils/`、`types/`、`locales/`、`layouts/`、`styles/`。
- 网络与鉴权：`src/api/request.ts` 统一 Axios 拦截器，附加 `Bearer` Token，标准化错误提示，`401` 清理会话并跳转登录；`vite.config.ts` 代理 `/api`、`/uploads` 至 `http://localhost:8000`。
- 路由与守卫：`src/router/index.ts` 配置分层路由，`requiresAuth` 元信息配合守卫进行登录拦截，统一标题。
- 国际化与样式：`locales/` 多语言配置，`scss` 预处理与全局变量注入。

## 验证计划
- 环境准备：使用 `pnpm`，建议 Node `>=18`（通过 `nvm use` 切换）；若网络慢，可执行 `proxy_on`。
- 本地运行：在 `packages/pc` 目录执行 `pnpm i` 后 `pnpm dev`，验证页面路由、登录流程、列表与详情数据、发布流程、上传与消息提示。
- 接口连通性：依赖后端服务 `http://localhost:8000`，确认 `vite` 代理工作正常（`/api`、`/uploads`）。

## 文档输出
- 生成对齐文档：`docs/pc/ALIGNMENT_pc.md`（范围、需求、架构理解、歧义与问题清单）。
- 生成共识文档：`docs/pc/CONSENSUS_pc.md`（明确验收标准、技术方案与约束、集成方案）。
- 生成设计文档：`docs/pc/DESIGN_pc.md`（架构图、模块依赖、接口契约、数据流、异常策略）。
- 生成任务拆分：`docs/pc/TASK_pc.md`（原子任务、依赖关系、验收标准，含 mermaid 依赖图）。

## 重点检查点
- 鉴权与会话：`localStorage` Token 恢复是否覆盖全部场景；路由守卫与 `401` 响应处理的一致性。
- 上传链路：图片/视频上传的进度、失败回滚与资源释放，批量上传的并发/队列策略。
- i18n 与格式化：文案键覆盖率、货币与时间格式的一致性。
- 可访问性与交互：输入组件（价格、地址等）的可用性与校验反馈。

## 后续改进建议（待确认）
- 统一图片类型定义（`types/` 与 `composables/useImageManager.ts` 目前存在重复定义）。
- 增强错误处理：对 `422` 复杂结构的校验细化与边界提示统一。
- 提升上传体验：批量上传并发控制、失败重试与整体事务化提交。

## 执行步骤
1. 按“验证计划”完成本地运行与端到端走查，记录问题与改进点。
2. 输出四类文档（对齐/共识/设计/任务），形成可执行的原子任务清单。
3. 按任务依赖顺序逐步实施与验证（含单元测试与文档同步）。

请确认是否按以上计划推进；确认后我将开始环境验证与文档生成，并进入执行阶段。