# 任务管理系统

一个功能完整的个人任务与时间管理应用，帮助用户高效管理任务、追踪时间并可视化工作成果。

## 功能特性

### 任务管理
- 创建、编辑、删除任务
- 任务分类（工作、个人、学习、健康、其他）
- 优先级设置（高、中、低）
- 截止日期管理
- 任务搜索和筛选功能
- 任务完成状态标记

### 番茄钟时间跟踪
- 标准番茄钟功能（可自定义工作/休息时长）
- 计时开始、暂停、重置控制
- 完成提示音和视觉提醒
- 记录每个任务的番茄钟使用情况

### 数据可视化
- 直观的统计图表展示每日/每周任务完成情况
- 可视化时间分配数据（不同类型任务的时间占比）
- 任务完成率、番茄钟使用效率等关键指标
- 响应式且交互友好的图表

### 数据存储
- LocalStorage 本地持久化存储
- 数据版本控制，确保应用升级时数据兼容性

### 用户体验
- 现代化 UI 设计，采用蓝色系配色
- 悬浮、阴影、圆角、渐变等交互效果
- 流畅的动画和过渡效果
- 响应式设计，适配不同设备
- 键盘快捷键支持

## 技术栈

- **Vite** - 高效的构建工具
- **React 19** + **TypeScript** - 类型安全的函数组件开发
- **Tailwind CSS v4** - 现代化的响应式设计
- **Recharts** - 数据可视化图表
- **date-fns** - 日期处理
- **lucide-react** - 图标库

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 键盘快捷键

| 快捷键 | 功能 |
|--------|------|
| Ctrl + N | 新建任务 |
| ? | 显示快捷键帮助 |
| Esc | 关闭弹窗 |

## 项目结构

```
task-manager/
├── src/
│   ├── components/       # React 组件
│   │   ├── TaskForm.tsx       # 任务表单
│   │   ├── TaskList.tsx       # 任务列表
│   │   ├── PomodoroTimer.tsx  # 番茄钟
│   │   └── Statistics.tsx     # 统计图表
│   ├── hooks/           # 自定义 Hooks
│   │   └── useKeyboardShortcuts.ts
│   ├── utils/           # 工具函数
│   │   └── storage.ts       # LocalStorage 封装
│   ├── types.ts          # TypeScript 类型定义
│   ├── App.tsx          # 主应用组件
│   └── main.tsx         # 应用入口
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## 浏览器支持

- Chrome (最新版)
- Firefox (最新版)
- Safari (最新版)
- Edge (最新版)

## 许可证

MIT
