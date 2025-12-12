# 组件设计总结

## 架构概述

基于 Next.js App Router 的嵌套路由和组件化设计，实现了清晰的职责分离和可维护的代码结构。

## 核心设计理念

### 1. URL 驱动的状态管理
- 使用 Next.js 动态路由参数 (`[spaceId]`, `[projectId]`, `[libraryId]`) 来反映应用状态
- URL 变化自动触发页面更新
- 支持浏览器前进/后退、书签、分享等功能

### 2. Context API 管理全局状态
- **AuthContext**: 统一管理用户认证状态，避免在多个组件中重复逻辑
- **NavigationContext**: 自动从路由参数生成面包屑，提供当前路由信息

### 3. 组件职责分离
- **Layout 组件**: 负责页面结构（Sidebar + TopBar）
- **页面组件**: 负责具体内容展示
- **业务逻辑**: 集中在 Context 和 Service 层

## 组件层次结构

```
RootLayout (app/layout.tsx)
├── SupabaseProvider (数据库客户端)
├── AuthProvider (认证状态)
└── NavigationProvider (路由状态)
    └── DashboardLayout (app/(dashboard)/layout.tsx)
        ├── Sidebar
        │   ├── UserProfile (用户信息)
        │   ├── ProjectsList (项目列表，可点击导航)
        │   └── LibrariesList (库列表，可点击导航)
        └── MainContent
            ├── TopBar
            │   ├── Breadcrumb (自动生成，可点击)
            │   └── ActionButtons (操作按钮)
            └── PageContent (根据路由动态显示)
                ├── SpacePage
                ├── ProjectPage
                └── LibraryPage
```

## 关键组件说明

### DashboardLayout
**位置**: `src/components/layout/DashboardLayout.tsx`

**职责**:
- 提供统一的布局结构（Sidebar + TopBar + Content）
- 处理认证检查（未登录时显示登录表单）
- 从 NavigationContext 获取面包屑信息并传递给 TopBar

**特点**:
- 使用 Context 获取状态，避免 prop drilling
- 自动处理认证状态

### Sidebar
**位置**: `src/components/layout/Sidebar.tsx`

**职责**:
- 显示用户信息（头像、名称）
- 显示项目列表（点击后导航到项目页面）
- 显示库列表（点击后导航到库页面）
- 根据当前路由高亮选中的项目/库

**交互**:
- 点击项目：`router.push('/${spaceId}/${projectId}')`
- 点击库：`router.push('/${spaceId}/${projectId}/${libraryId}')`
- 使用 `useNavigation()` 获取当前路由，判断是否高亮

### TopBar
**位置**: `src/components/layout/TopBar.tsx`

**职责**:
- 显示面包屑导航（从 NavigationContext 自动生成）
- 提供操作按钮（Share、More、Add）

**交互**:
- 点击面包屑项：导航到对应路径
- 最后一个面包屑项不可点击（当前页面）

### NavigationContext
**位置**: `src/lib/contexts/NavigationContext.tsx`

**职责**:
- 从 Next.js 路由参数自动生成面包屑
- 提供当前路由信息（spaceId, projectId, libraryId）

**特点**:
- 完全基于 URL，无需手动管理状态
- 自动同步路由变化

### AuthContext
**位置**: `src/lib/contexts/AuthContext.tsx`

**职责**:
- 管理用户认证状态
- 获取用户 profile 信息
- 提供登出功能

**特点**:
- 统一管理认证逻辑，避免重复代码
- 自动监听 Supabase auth 状态变化

## 路由结构

```
app/
├── layout.tsx                    # 根布局（Providers）
├── page.tsx                      # 首页（可选，重定向）
└── (dashboard)/                  # 路由组（所有需要认证的页面）
    ├── layout.tsx               # Dashboard 布局
    ├── page.tsx                 # 默认页面（重定向）
    └── [spaceId]/               # 动态路由：空间
        ├── page.tsx            # 空间详情页
        └── [projectId]/        # 动态路由：项目
            ├── page.tsx       # 项目详情页
            └── [libraryId]/   # 动态路由：库
                └── page.tsx  # 库详情页
```

## 数据流

```
1. 用户点击 Sidebar 中的项目/库
   ↓
2. 调用 router.push() 更新 URL
   ↓
3. Next.js Router 更新路由参数
   ↓
4. NavigationContext 检测到路由变化，更新面包屑
   ↓
5. 页面组件读取路由参数，从 Supabase 获取数据
   ↓
6. Sidebar 根据当前路由高亮选中项
   ↓
7. TopBar 显示更新后的面包屑
   ↓
8. 页面内容更新
```

## 优势

1. **可维护性**: 清晰的组件职责分离，易于理解和修改
2. **可扩展性**: 易于添加新的路由和页面
3. **用户体验**: URL 反映应用状态，支持浏览器导航
4. **代码复用**: Context 和 Layout 组件可在多个页面复用
5. **类型安全**: TypeScript 提供完整的类型检查

## 后续优化方向

1. **数据缓存**: 使用 React Query 或 SWR 缓存数据
2. **加载状态**: 添加 Suspense 和加载指示器
3. **错误处理**: 统一的错误边界和错误处理
4. **权限控制**: 在路由层面添加权限检查
5. **SEO 优化**: 如果需要，添加元数据和结构化数据

