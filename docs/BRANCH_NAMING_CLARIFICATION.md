# 分支命名与部署环境对应关系说明

## 📋 重要提示

根据你的工作流配置，当前支持以下分支模式：

### 当前工作流配置的分支模式

```yaml
branches:
  - main
  - master
  - 'release/**'    # 注意：这是 release/xxx 模式
  - 'preview/**'    # 注意：这是 preview/xxx 模式
```

### 分支名称匹配规则

1. **`main` 或 `master`** → Production 环境
   - 完全匹配
   - 例如：`main`, `master`

2. **`release/**`** → Preview 环境
   - 匹配所有以 `release/` 开头的分支
   - 例如：`release/v1.0`, `release/stable`, `release/testing`
   - **不匹配**：单独的 `release` 分支（没有斜杠）

3. **`preview/**`** → Preview 环境
   - 匹配所有以 `preview/` 开头的分支
   - 例如：`preview/feature-x`

---

## 如果你的分支是 `release`（不带斜杠）

### 问题

如果你的分支名称就是 `release`（而不是 `release/xxx`），那么当前工作流**不会触发部署**。

### 解决方案

#### 方案 1: 修改分支名称为 `release/stable`（推荐）

```bash
git branch -m release release/stable
git push origin release/stable
git push origin --delete release
```

#### 方案 2: 修改工作流配置支持 `release` 分支

在工作流的 `on.push.branches` 和 `on.pull_request.branches` 中添加 `release`：

```yaml
on:
  push:
    branches:
      - main
      - master
      - release          # 添加这一行，支持单独的 release 分支
      - 'release/**'
      - 'preview/**'
```

同时在环境判断逻辑中也需要添加：

```yaml
- name: Determine deployment environment
  id: env
  run: |
    if [[ "${{ github.ref }}" == "refs/heads/main" ]] || [[ "${{ github.ref }}" == "refs/heads/master" ]] || [[ "${{ github.ref }}" =~ ^refs/tags/v ]]; then
      echo "environment=production" >> $GITHUB_OUTPUT
      echo "is_prod=true" >> $GITHUB_OUTPUT
      echo "✅ 部署到 Production 环境"
    elif [[ "${{ github.ref }}" == "refs/heads/release" ]] || [[ "${{ github.ref }}" =~ ^refs/heads/release/ ]]; then
      # 添加对 release 分支的支持
      echo "environment=preview" >> $GITHUB_OUTPUT
      echo "is_prod=false" >> $GITHUB_OUTPUT
      echo "✅ 部署到 Preview 环境 (Release 分支)"
    else
      echo "environment=preview" >> $GITHUB_OUTPUT
      echo "is_prod=false" >> $GITHUB_OUTPUT
      echo "✅ 部署到 Preview 环境"
    fi
```

---

## 如何检查你的分支名称

### 方法 1: 使用 Git 命令

```bash
# 查看当前分支
git branch

# 查看所有分支（包括远程）
git branch -a

# 查看当前分支的完整引用
git rev-parse --abbrev-ref HEAD
```

### 方法 2: 在 GitHub 上查看

1. 进入 GitHub 仓库页面
2. 点击 `Branches` 标签
3. 查看所有分支列表

### 方法 3: 查看工作流触发情况

1. 进入 GitHub 仓库
2. 点击 `Actions` 标签
3. 查看最近的工作流运行
4. 如果 `release` 分支的推送没有触发工作流，说明分支名称不匹配

---

## 推荐的分支命名策略

### 策略 1: 使用版本号

```
main                    → Production
release/v1.0.0         → Preview (Staging)
release/v1.1.0-beta    → Preview (Testing)
```

### 策略 2: 使用环境名称

```
main                    → Production
release/stable         → Preview (Stable)
release/testing        → Preview (Testing)
```

### 策略 3: 简单命名（需要修改工作流）

```
main                    → Production
release                 → Preview
```

---

## 部署环境对应表

| 分支名称 | 匹配规则 | 部署环境 | Vercel 环境 | Supabase 项目 |
|---------|---------|---------|------------|--------------|
| `main` | 完全匹配 | Production | Production | 原有项目 |
| `master` | 完全匹配 | Production | Production | 原有项目 |
| `release/v1.0` | `release/**` 模式 | Preview | Preview | 新项目 |
| `release/stable` | `release/**` 模式 | Preview | Preview | 新项目 |
| `release` | ❌ 不匹配（需添加） | - | - | - |
| `preview/xxx` | `preview/**` 模式 | Preview | Preview | 新项目 |
| 其他分支 | 默认 | Preview | Preview | 新项目 |

---

## 下一步行动

1. **确认你的分支名称**：
   - 如果使用 `release`（无斜杠）→ 需要修改工作流或重命名分支
   - 如果使用 `release/xxx` → 工作流已支持，无需修改

2. **如果分支名称是 `release`**：
   - 选择方案 1 或方案 2 进行修改
   - 建议使用方案 1（重命名分支），因为这样可以支持多个 Release 版本

3. **验证配置**：
   - 推送到对应分支
   - 检查 GitHub Actions 是否触发
   - 检查部署环境是否正确

---

**最后更新时间**: 2026-01-09

