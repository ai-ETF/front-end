# 智能ETF分析系统前端

## 项目概述

智能ETF分析系统是一个基于Vue 3和Supabase构建的前端应用，旨在为金融从业者和投资者提供智能化的ETF数据分析服务。该系统集成了用户认证、文件管理、AI对话等功能，支持与AI服务集成进行数据分析。

## 功能特性

- **用户认证**：支持邮箱密码注册/登录，使用Supabase身份验证
- **文件管理**：支持文件浏览、上传、删除，展示为列表和网格视图
- **AI对话**：在聊天室中向AI发送问题并接收响应
- **数据持久化**：利用Pinia + persistedstate插件实现状态本地存储
- **响应式布局**：适配不同设备屏幕尺寸
- **Markdown渲染**：使用markdown-it + highlight.js渲染消息内容
- **安全处理**：使用dompurify防止XSS攻击

## 技术栈

- **前端框架**: Vue 3.5.22 (Composition API + `<script setup>`)
- **构建工具**: Vite 7.1.7
- **语言**: TypeScript ~5.9.0
- **状态管理**: Pinia 3.0.3 + pinia-plugin-persistedstate
- **路由**: Vue Router 4.5.1
- **UI库**: Ant Design Vue 4.2.6 + @ant-design/icons-vue
- **代码规范**: ESLint + Prettier
- **TypeScript工具**: vue-tsc
- **HTTP客户端**: @supabase/supabase-js 2.76.1
- **Markdown解析**: markdown-it + highlight.js
- **安全过滤**: dompurify

## 系统架构

```
前端(Vue 3 + Vite) → Supabase (Auth/Storage/DB) ↔ Edge Functions (AI Service)
```

### 分层架构

- **Views层**: 负责页面展示逻辑
- **Components层**: 可复用UI组件
- **Composables层**: 封装可复用逻辑
- **Services层**: 实现业务逻辑
- **Stores层**: 全局状态管理（Pinia）
- **Lib层**: 基础库与客户端配置
- **Utils层**: 通用工具函数

## 环境要求

- **Node.js**: ^20.19.0 || >=22.12.0
- **npm / yarn / pnpm**
- **Git**

## 项目安装与运行

1. **克隆项目**

```bash
git clone <repository-url>
cd /home/sing/smartAnalysisOfETF/front-end
```

2. **安装依赖**

```bash
npm install
```

3. **环境配置**

创建 `.env` 文件并配置 Supabase 相关信息：

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **启动开发服务器**

```bash
npm run dev
```

5. **构建生产版本**

```bash
npm run build
```

6. **预览构建结果**

```bash
npm run preview
```

## 代码质量与规范

- **类型检查**: `npm run type-check`
- **代码格式化**: `npm run format`
- **代码检查与修复**: `npm run lint`

## 主要功能模块

### 用户认证模块

使用 Supabase Auth 实现安全的用户注册/登录功能，支持邮箱密码认证。

### 文件管理模块

提供直观的文件上传与管理界面，支持文件列表和网格视图，与 Supabase Storage 集成。

### AI对话模块

支持与AI模型的对话式交互以获取ETF分析结果，使用流式响应实现实时交互体验。

### 调试功能

- `/debug-ai-question`: AI问答调试页面，包含预设问题
- `/debug-ingest`: 文档处理调试功能

## 项目配置说明

### Supabase配置

项目使用Supabase作为后端服务，包括：
- 用户认证（Auth）
- 文件存储（Storage）
- 数据库（Database）
- 边缘函数（Edge Functions）

### AI服务集成

项目通过Supabase Edge Functions与AI服务集成，支持流式响应和实时数据处理。

### 状态管理

使用Pinia进行状态管理，包括：
- [auth](file:///home/sing/smartAnalysisOfETF/front-end/src/stores/auth.ts#L3-L23) store: 用户认证状态
- [chat](file:///home/sing/smartAnalysisOfETF/front-end/src/stores/chat.ts#L17-L119) store: 聊天记录和消息
- [file](file:///home/sing/smartAnalysisOfETF/front-end/src/stores/file.ts#L3-L25) store: 文件管理状态
- [sidebar](file:///home/sing/smartAnalysisOfETF/front-end/src/stores/sidebar.ts#L1-L15) store: 侧边栏状态

## 开发规范

1. **代码风格**: 使用ESLint + Prettier统一代码风格
2. **类型安全**: 强制使用TypeScript
3. **组件命名**: 采用PascalCase
4. **调试日志**: 使用`console.debug()`输出调试信息
5. **参数校验**: 实施多层级参数校验机制
6. **安全性**: 所有用户输入需经过sanitize处理

## 部署说明

### 构建命令

```bash
npm run build
```

### 部署建议

- 静态托管（如Netlify、Vercel、S3 + CloudFront）
- 确保HTTPS生产部署
- 配置正确的环境变量

### Supabase部署

边缘函数需要单独部署到Supabase平台：

```bash
supabase functions deploy
```

## 已知问题

1. 存在[useSupabaseAuth-issue.md](file:///home/sing/smartAnalysisOfETF/front-end/note/useSupabaseAuth-issue.md)文档记录的身份验证相关问题待解决
2. Edge Functions需要确保部署到兼容Deno的运行时环境
3. 大量文件列表需考虑虚拟滚动优化（当前未实现）

## 贡献指南

1. Fork项目
2. 创建功能分支
3. 提交更改
4. 确保代码质量和测试通过
5. 提交Pull Request

## 许可证

[MIT](LICENSE)