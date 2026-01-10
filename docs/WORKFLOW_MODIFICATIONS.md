# GitHub Actions 工作流修改详细说明

## 📋 概述

本文档详细说明如何修改 `deploy-vercel.yml` 以支持双 Supabase 环境配置。

---

## 当前工作流分析

### 当前逻辑

1. **环境判断**（第 118-133 行）
   - Main/Master 分支 → `production` 环境
   - Release 分支 → `preview` 环境
   - 其他分支 → `preview` 环境

2. **构建步骤**（第 108-112 行）
   - 使用 GitHub Secrets 中的 Supabase 环境变量
   - **问题**：只使用了一套 Supabase 配置

3. **数据库迁移**（第 47-82 行）
   - 使用固定的 `SUPABASE_PROJECT_REF`
   - **问题**：无法区分不同环境

---

## 需要的修改

### 修改点 1: 构建步骤（可选，推荐不改）

**当前代码**：
```yaml
- name: Build project
  run: npm run build
  env:
    NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
    NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
```

**分析**：
- 这个步骤只是本地构建测试
- 实际部署时，Vercel 会使用自己在 Dashboard 中配置的环境变量
- **建议**：可以移除这里的环境变量，让 Vercel 的 `vercel pull` 自动拉取

**修改方案**（可选）：
```yaml
- name: Build project
  run: npm run build
  # 移除 env，因为 Vercel 会在部署时使用自己的环境变量
```

### 修改点 2: 数据库迁移任务（重要）

**当前代码**（第 47-82 行）：
```yaml
migrate-database:
  runs-on: ubuntu-latest
  name: Run Supabase Migrations
  needs: check-migrations
  if: github.repository == 'xzy1124/keco-studio' && needs.check-migrations.outputs.has-migrations == 'true'
  
  steps:
    # ...
    - name: Link to Supabase project
      run: |
        supabase link --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}
```

**问题**：
- 使用固定的 `SUPABASE_PROJECT_REF`
- 无法区分 Main 和 Release 分支应该迁移到哪个 Supabase 项目

**修改方案**：

#### 方案 A: 根据分支选择不同的项目（推荐）

```yaml
migrate-database:
  runs-on: ubuntu-latest
  name: Run Supabase Migrations
  needs: check-migrations
  if: github.repository == 'xzy1124/keco-studio' && needs.check-migrations.outputs.has-migrations == 'true'
  outputs:
    project-ref: ${{ steps.select-project.outputs.project-ref }}
    
  steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Install Supabase CLI
      run: npm install -g supabase@latest

    # 根据分支选择 Supabase 项目
    - name: Select Supabase Project
      id: select-project
      run: |
        if [[ "${{ github.ref }}" == "refs/heads/main" ]] || [[ "${{ github.ref }}" == "refs/heads/master" ]] || [[ "${{ github.ref }}" =~ ^refs/tags/v ]]; then
          echo "project-ref=${{ secrets.SUPABASE_PROJECT_REF_PROD }}" >> $GITHUB_OUTPUT
          echo "✅ 使用 Production Supabase 项目"
        else
          echo "project-ref=${{ secrets.SUPABASE_PROJECT_REF_PREVIEW }}" >> $GITHUB_OUTPUT
          echo "✅ 使用 Preview Supabase 项目 (Release 分支)"
        fi

    - name: Link to Supabase project
      run: |
        supabase link --project-ref ${{ steps.select-project.outputs.project-ref }}
      env:
        SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}

    - name: Push database migrations
      run: |
        echo "🚀 开始推送数据库迁移..."
        supabase db push
        echo "✅ 迁移完成"
      env:
        SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
      continue-on-error: false
```

**需要在 GitHub Secrets 中添加**：
- `SUPABASE_PROJECT_REF_PROD`: 原有项目的 Ref（如 `ksqiyfmdiwfapxdrsfsl`）
- `SUPABASE_PROJECT_REF_PREVIEW`: 新项目的 Ref（如 `madmilqywjbkydxjzrrz`）

#### 方案 B: 只在 Main 分支执行迁移（简单方案）

```yaml
migrate-database:
  runs-on: ubuntu-latest
  name: Run Supabase Migrations
  needs: check-migrations
  # 只在 Main 分支执行迁移
  if: github.repository == 'xzy1124/keco-studio' && needs.check-migrations.outputs.has-migrations == 'true' && (github.ref == 'refs/heads/main' || github.ref == 'refs/heads/master')
  
  steps:
    # ... 保持原有代码不变
```

**说明**：
- Release 分支的迁移需要手动执行
- 或者仅在 Production 环境应用迁移

---

## 推荐的完整修改方案

### 修改 1: 移除构建步骤中的硬编码环境变量

**原因**：Vercel 会在部署时自动使用 Dashboard 中配置的环境变量，这里的变量只用于本地构建测试，可能会造成混淆。

**修改位置**：第 108-112 行

**修改后**：
```yaml
- name: Build project
  run: npm run build
  # 注意：实际部署时，Vercel 会使用 Dashboard 中配置的环境变量
  # 这里的构建仅用于本地验证，不包含 Supabase 连接
```

### 修改 2: 数据库迁移任务根据分支选择项目

**修改位置**：第 47-82 行

**完整修改后的代码**：
```yaml
migrate-database:
  runs-on: ubuntu-latest
  name: Run Supabase Migrations
  needs: check-migrations
  if: github.repository == 'xzy1124/keco-studio' && needs.check-migrations.outputs.has-migrations == 'true'
  
  steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Install Supabase CLI
      run: npm install -g supabase@latest

    # 根据分支选择 Supabase 项目
    - name: Select Supabase Project
      id: select-project
      run: |
        if [[ "${{ github.ref }}" == "refs/heads/main" ]] || [[ "${{ github.ref }}" == "refs/heads/master" ]] || [[ "${{ github.ref }}" =~ ^refs/tags/v ]]; then
          echo "project-ref=${{ secrets.SUPABASE_PROJECT_REF_PROD }}" >> $GITHUB_OUTPUT
          echo "environment=production" >> $GITHUB_OUTPUT
          echo "✅ 使用 Production Supabase 项目"
        else
          echo "project-ref=${{ secrets.SUPABASE_PROJECT_REF_PREVIEW }}" >> $GITHUB_OUTPUT
          echo "environment=preview" >> $GITHUB_OUTPUT
          echo "✅ 使用 Preview Supabase 项目 (Release 分支)"
        fi

    - name: Link to Supabase project
      run: |
        echo "🔗 链接到 Supabase 项目: ${{ steps.select-project.outputs.environment }}"
        supabase link --project-ref ${{ steps.select-project.outputs.project-ref }}
      env:
        SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}

    - name: Push database migrations
      run: |
        echo "🚀 开始推送数据库迁移到 ${{ steps.select-project.outputs.environment }} 环境..."
        supabase db push
        echo "✅ 迁移完成"
      env:
        SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
      continue-on-error: false
```

---

## GitHub Secrets 配置清单

### 必需的新 Secrets

1. **SUPABASE_PROJECT_REF_PROD**
   - 值：原有 Supabase 项目的 Ref（如 `ksqiyfmdiwfapxdrsfsl`）
   - 用途：Main 分支的数据库迁移

2. **SUPABASE_PROJECT_REF_PREVIEW**
   - 值：新 Supabase 项目的 Ref（如 `madmilqywjbkydxjzrrz`）
   - 用途：Release 分支的数据库迁移

### 配置步骤

1. 进入 GitHub 仓库
2. 点击 `Settings` → `Secrets and variables` → `Actions`
3. 点击 `New repository secret`
4. 添加上述两个 Secrets

---

## 验证修改

### 测试 Main 分支部署

1. 创建一个测试提交并推送到 Main 分支
2. 查看 GitHub Actions 日志：
   - `Select Supabase Project` 步骤应该显示 "使用 Production Supabase 项目"
   - `Link to Supabase project` 应该链接到 Production 项目
   - 部署应该使用 Production 环境的 Vercel 变量

### 测试 Release 分支部署

1. 创建一个测试提交并推送到 Release 分支
2. 查看 GitHub Actions 日志：
   - `Select Supabase Project` 步骤应该显示 "使用 Preview Supabase 项目"
   - `Link to Supabase project` 应该链接到 Preview 项目
   - 部署应该使用 Preview 环境的 Vercel 变量

---

## 注意事项

1. **向后兼容**：如果暂时不想修改迁移任务，可以先保持原有逻辑，仅配置 Vercel 环境变量。迁移任务只会在 Main 分支执行。

2. **安全性**：确保 GitHub Secrets 中的项目 Ref 和 Access Token 正确配置，并且有适当的访问权限。

3. **迁移顺序**：建议先在 Preview 环境的 Supabase 中测试迁移，确认无误后再在 Main 分支应用。

4. **回滚准备**：修改工作流前，确保有回滚方案。可以在 Release 分支先测试修改后的工作流。

---

**最后更新时间**: 2026-01-09

