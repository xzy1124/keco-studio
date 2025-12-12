# Keco Studio 项目架构设计

## 整体架构

### 1. 路由结构设计

使用 Next.js App Router 的嵌套路由和动态路由功能：

```
app/
├── layout.tsx                    # 根布局（SupabaseProvider）
├── page.tsx                      # 首页（重定向到默认空间）
├── (dashboard)/                  # 路由组，所有需要认证的页面
│   ├── layout.tsx               # Dashboard 布局（Sidebar + TopBar）
│   ├── page.tsx                 # 默认页面（重定向到第一个空间）
│   ├── [spaceId]/               # 动态路由：空间ID
│   │   ├── page.tsx            # 空间详情页
│   │   ├── [projectId]/        # 动态路由：项目ID
│   │   │   ├── page.tsx       # 项目详情页
│   │   │   └── [libraryId]/   # 动态路由：库ID
│   │   │       └── page.tsx  # 库详情页（资源展示）
│   │   └── layout.tsx         # 空间布局（可选，用于空间级别的导航）
│   └── ...
└── auth/                         # 认证相关页面
    ├── login/
    └── register/
```

### 2. 组件层次结构

```
RootLayout (layout.tsx)
└── SupabaseProvider
    └── DashboardLayout (app/(dashboard)/layout.tsx)
        ├── Sidebar (左侧边栏)
        │   ├── UserProfile (用户信息)
        │   ├── SpaceList (空间列表)
        │   └── ProjectList (项目列表)
        └── MainContent
            ├── TopBar (顶部栏)
            │   ├── Breadcrumb (面包屑导航)
            │   └── ActionButtons (操作按钮)
            └── PageContent (页面内容)
                └── [动态内容，根据路由显示]
```

### 3. 状态管理方案

#### 3.1 路由状态（URL 驱动）
- 使用 Next.js 路由参数：`[spaceId]`, `[projectId]`, `[libraryId]`
- 面包屑从路由参数自动生成
- 支持浏览器前进/后退

#### 3.2 全局状态（Context API）
- `AuthContext`: 用户认证状态、用户信息
- `NavigationContext`: 当前路由信息、面包屑数据
- `DataContext`: 空间/项目/库的数据缓存（可选）

#### 3.3 本地状态（useState）
- 组件内部 UI 状态
- 表单状态
- 临时选择状态

### 4. 组件职责划分

#### 4.1 Layout 组件
- **RootLayout**: 提供全局 Provider，设置全局样式
- **DashboardLayout**: 提供 Sidebar + TopBar 布局，处理认证检查

#### 4.2 Sidebar 组件
- **职责**: 
  - 显示用户信息
  - 显示空间列表（点击切换空间）
  - 显示项目列表（点击切换项目）
  - 显示库列表（点击切换库）
- **交互**: 
  - 点击项目/库时，使用 Next.js `useRouter` 导航
  - 高亮当前选中的项目/库

#### 4.3 TopBar 组件
- **职责**:
  - 显示面包屑导航（从路由参数生成）
  - 提供操作按钮（新建、分享等）
- **交互**:
  - 面包屑可点击，导航到对应路径
  - 操作按钮触发相应功能

#### 4.4 页面组件
- **SpacePage**: 显示空间概览
- **ProjectPage**: 显示项目详情
- **LibraryPage**: 显示库的资源列表（当前的主要功能）

### 5. 数据流

```
URL 变化 
  ↓
Next.js Router 更新路由参数
  ↓
页面组件读取路由参数
  ↓
页面组件从 Supabase 获取数据
  ↓
更新 Sidebar 和 TopBar 的选中状态
  ↓
渲染页面内容
```

### 6. 关键设计决策

#### 6.1 为什么使用路由组 `(dashboard)`？
- 所有需要认证的页面共享同一个布局
- 可以统一处理认证检查
- 不影响其他路由（如 `/auth/login`）

#### 6.2 为什么使用动态路由？
- URL 反映应用状态，支持分享和书签
- 浏览器前进/后退正常工作
- SEO 友好（如果需要）

#### 6.3 为什么使用 Context API？
- 避免 prop drilling
- 认证状态和导航状态需要跨组件共享
- 不需要复杂的状态管理库（如 Redux）

## 实施步骤

1. ✅ 创建架构文档
2. ⏳ 创建 DashboardLayout 组件
3. ⏳ 重构路由结构
4. ⏳ 创建 NavigationContext
5. ⏳ 更新 Sidebar 组件，集成路由导航
6. ⏳ 更新 TopBar 组件，从路由生成面包屑
7. ⏳ 创建页面组件（SpacePage, ProjectPage, LibraryPage）

