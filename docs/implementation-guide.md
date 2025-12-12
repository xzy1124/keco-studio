# 实施指南

## 已完成的工作

### 1. 架构设计
- ✅ 创建了架构文档 (`docs/architecture.md`)
- ✅ 设计了路由结构
- ✅ 定义了组件层次结构

### 2. Context 提供者
- ✅ `AuthContext`: 管理用户认证状态
- ✅ `NavigationContext`: 管理路由和面包屑状态

### 3. 布局组件
- ✅ `DashboardLayout`: 主应用布局（Sidebar + TopBar + Content）
- ✅ 更新了 `Sidebar`: 集成路由导航，根据当前路由高亮选中项
- ✅ 更新了 `TopBar`: 支持点击面包屑导航

### 4. 路由结构
- ✅ 创建了 `(dashboard)` 路由组
- ✅ 实现了动态路由：`[spaceId]`, `[projectId]`, `[libraryId]`
- ✅ 创建了对应的页面组件

## 下一步工作

### 1. 数据集成
- [ ] 从 Supabase 获取实际的空间/项目/库数据
- [ ] 替换 Sidebar 中的硬编码数据
- [ ] 在 NavigationContext 中从数据库获取名称（而不是使用 ID）

### 2. 页面内容开发
- [ ] 完善 SpacePage：显示空间概览和项目列表
- [ ] 完善 ProjectPage：显示项目详情和库列表
- [ ] 完善 LibraryPage：根据库类型显示不同内容

### 3. 功能增强
- [ ] 实现 Sidebar 中的搜索功能
- [ ] 实现新建项目/库的功能（"+" 按钮）
- [ ] 实现 TopBar 中的操作按钮（Share、More 等）

### 4. 优化
- [ ] 添加加载状态
- [ ] 添加错误处理
- [ ] 优化性能（数据缓存、懒加载等）

## 使用示例

### 导航到项目
```typescript
import { useRouter } from 'next/navigation';

const router = useRouter();
router.push('/luo-space/pokemon');
```

### 获取当前路由信息
```typescript
import { useNavigation } from '@/lib/contexts/NavigationContext';

const { currentSpaceId, currentProjectId, currentLibraryId, breadcrumbs } = useNavigation();
```

### 获取用户信息
```typescript
import { useAuth } from '@/lib/contexts/AuthContext';

const { isAuthenticated, userProfile, signOut } = useAuth();
```

## 路由示例

- `/` → 重定向到 `/luo-space`
- `/luo-space` → 空间详情页
- `/luo-space/pokemon` → 项目详情页
- `/luo-space/pokemon/pokemon-library` → 库详情页（资源展示）

## 注意事项

1. **路由参数**: 当前使用 ID 作为路由参数，实际应该使用 slug 或更友好的标识符
2. **数据获取**: 所有页面组件都需要从 Supabase 获取数据，当前只是示例
3. **权限控制**: 需要添加权限检查，确保用户只能访问自己的空间/项目/库
4. **错误处理**: 需要处理路由不存在、数据加载失败等情况

