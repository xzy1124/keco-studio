# 部署工作流原理说明

## 📋 概述

本文档详细解释 GitHub Actions 工作流如何适配双 Supabase 环境（Production 和 Preview）。

---

## 🔑 核心原理

### 为什么不需要在 GitHub Secrets 中配置 Supabase 环境变量？

**关键点**：Vercel 会根据部署环境（Production 或 Preview）自动从 Vercel Dashboard 拉取对应的环境变量。

### 工作流执行流程

```
1. 推送代码到分支（main 或 release/xxx）
   ↓
2. GitHub Actions 触发
   ↓
3. 确定部署环境（根据分支判断）
   - main/master → production
   - release/xxx → preview
   ↓
4. 执行 vercel pull --environment=production/preview
   ↓
5. Vercel CLI 从 Dashboard 拉取对应环境的变量
   - Production 环境 → 使用 Vercel Dashboard 中 Production 环境的变量
   - Preview 环境 → 使用 Vercel Dashboard 中 Preview 环境的变量
   ↓
6. 执行 vercel build（自动使用拉取的变量）
   ↓
7. 执行 vercel deploy（部署到对应环境）
```

---

## 📝 工作流修改详解

### 修改前的问题

**原始代码**（第 108-112 行）：
```yaml
- name: Build project
  run: npm run build
  env:
    NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
    NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
```

**问题**：
1. 使用 GitHub Secrets 中的 Supabase 变量，无法区分 Production 和 Preview
2. 即使添加两套变量（`NEXT_PUBLIC_SUPABASE_URL_PROD` 和 `NEXT_PUBLIC_SUPABASE_URL_PREVIEW`），也需要在工作流中根据环境手动选择
3. 这个构建步骤只是本地验证，实际的构建由 Vercel 完成

### 修改后的方案

**新代码**：
```yaml
# 移除了本地构建步骤中的 Supabase 环境变量
# 实际的构建由 Vercel 完成，会自动使用正确的环境变量

- name: Pull Vercel Environment Information
  run: vercel pull --yes --environment=${{ steps.env.outputs.environment }} --token=${{ secrets.VERCEL_TOKEN }}
  # 这个命令会根据环境自动拉取对应的变量：
  # - environment=production → 拉取 Vercel Dashboard 中 Production 环境的变量
  # - environment=preview → 拉取 Vercel Dashboard 中 Preview 环境的变量
```

**优势**：
1. ✅ 自动使用正确的环境变量，无需手动区分
2. ✅ 环境变量统一在 Vercel Dashboard 管理，更易维护
3. ✅ 减少 GitHub Secrets 的配置复杂度
4. ✅ 符合 Vercel 的最佳实践

---

## 🔄 环境变量使用流程

### 1. 环境判断阶段

```yaml
- name: Determine deployment environment
  id: env
  run: |
    if [[ "${{ github.ref }}" == "refs/heads/main" ]]; then
      echo "environment=production" >> $GITHUB_OUTPUT
    elif [[ "${{ github.ref }}" =~ ^refs/heads/release/ ]]; then
      echo "environment=preview" >> $GITHUB_OUTPUT
    fi
```

**输出**：
- Main 分支 → `environment=production`
- Release 分支 → `environment=preview`

### 2. 拉取环境变量阶段

```yaml
- name: Pull Vercel Environment Information
  run: vercel pull --yes --environment=${{ steps.env.outputs.environment }}
```

**执行结果**：
- 当 `environment=production` 时：
  - 从 Vercel Dashboard 拉取 **Production** 环境的变量
  - 包括：`NEXT_PUBLIC_SUPABASE_URL=https://ksqiyfmdiwfapxdrsfsl.supabase.co`
  - 包括：`NEXT_PUBLIC_SUPABASE_ANON_KEY=[Production Key]`

- 当 `environment=preview` 时：
  - 从 Vercel Dashboard 拉取 **Preview** 环境的变量
  - 包括：`NEXT_PUBLIC_SUPABASE_URL=https://madmilqywjbkydxjzrrz.supabase.co`
  - 包括：`NEXT_PUBLIC_SUPABASE_ANON_KEY=[Preview Key]`

**变量存储位置**：
- 变量会被写入 `.vercel/.env.production` 或 `.vercel/.env.preview` 文件
- 这些文件会被后续的 `vercel build` 和 `vercel deploy` 命令自动使用

### 3. 构建阶段

```yaml
- name: Build Project Artifacts
  run: vercel build --prod  # 或 vercel build
```

**自动行为**：
- `vercel build` 会自动读取 `.vercel/.env.*` 文件中的环境变量
- 不需要手动传递环境变量
- 构建会使用正确的 Supabase 配置

### 4. 部署阶段

```yaml
- name: Deploy Project Artifacts to Vercel
  run: vercel deploy --prebuilt --prod  # 或 vercel deploy --prebuilt
```

**自动行为**：
- 部署的构建产物已经包含了正确的环境变量
- 部署到对应的环境（Production 或 Preview）

---

## ❓ 常见问题

### Q1: 为什么移除了本地构建步骤中的环境变量？

**A**: 
- 本地构建（`npm run build`）只是验证代码能否编译，不依赖真实的 Supabase 连接
- 实际的构建由 Vercel 完成（`vercel build`），会使用正确的环境变量
- 移除后可以避免在 GitHub Secrets 中区分 Production 和 Preview 的复杂性

### Q2: 如果本地构建确实需要 Supabase 变量怎么办？

**A**: 
如果代码在构建时就需要 Supabase 变量（例如，构建时生成静态内容），有两种方案：

**方案 1（推荐）**：使用占位符
```yaml
- name: Build project
  run: npm run build
  env:
    NEXT_PUBLIC_SUPABASE_URL: "https://placeholder.supabase.co"
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "placeholder-key"
```

**方案 2**：移除本地构建步骤
```yaml
# 完全移除本地构建步骤，只使用 Vercel 的构建
# 这样更符合 Vercel 的最佳实践
```

### Q3: GitHub Secrets 中的 Supabase 变量可以删除吗？

**A**: 
- **可以删除**，如果这些变量只用于部署工作流
- **保留**，如果这些变量还在其他工作流或脚本中使用
- **建议**：检查其他工作流和脚本，确认不再使用后再删除

### Q4: 如何验证环境变量是否正确使用？

**A**: 
1. 查看 GitHub Actions 日志：
   - `Pull Vercel Environment Information` 步骤会显示拉取的环境
   - `Build Project Artifacts` 步骤的构建日志会显示使用的变量（部分）

2. 在部署的应用中验证：
   - 在浏览器控制台执行：`console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)`
   - 应该显示对应环境的 Supabase URL

3. 检查 Vercel Dashboard：
   - 进入部署详情
   - 查看 "Environment Variables" 部分，确认使用了正确的变量

---

## 🔍 调试技巧

### 查看拉取的环境变量

在 `vercel pull` 步骤后添加调试步骤：

```yaml
- name: Debug Environment Variables
  run: |
    echo "Environment: ${{ steps.env.outputs.environment }}"
    if [ -f ".vercel/.env.${{ steps.env.outputs.environment }}" ]; then
      echo "✅ 环境变量文件已创建"
      # 注意：不要直接打印敏感变量值
      echo "文件路径: .vercel/.env.${{ steps.env.outputs.environment }}"
    else
      echo "❌ 环境变量文件未找到"
    fi
```

### 验证构建使用的变量

在构建步骤中添加：

```yaml
- name: Build Project Artifacts
  run: |
    echo "Building for environment: ${{ steps.env.outputs.environment }}"
    # 构建会使用 .vercel/.env.* 中的变量
    vercel build --prod
```

---

## 📚 相关文档

- [Vercel 环境变量文档](https://vercel.com/docs/concepts/projects/environment-variables)
- [Vercel CLI 文档](https://vercel.com/docs/cli)
- [GitHub Actions 工作流修改说明](./WORKFLOW_MODIFICATIONS.md)

---

**最后更新时间**: 2026-01-09

