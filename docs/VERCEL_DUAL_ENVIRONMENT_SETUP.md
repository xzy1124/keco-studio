# Vercel 双环境配置指南（Main 和 Release 分支）

## 📋 目录
1. [环境概述](#环境概述)
2. [Vercel 环境变量配置](#vercel-环境变量配置)
3. [GitHub Actions 工作流修改](#github-actions-工作流修改)
4. [Deploy Hooks 说明](#deploy-hooks-说明)
5. [部署链接查看方法](#部署链接查看方法)
6. [常见问题解答](#常见问题解答)

---

## 环境概述

### 双 Supabase 项目配置
- **Production 环境（Main 分支）**: 使用原有的 Supabase 项目
  - URL: `https://ksqiyfmdiwfapxdrsfsl.supabase.co`
  - 用于生产环境

- **Preview 环境（Release 分支）**: 使用新创建的 Supabase 项目
  - Project Ref: `madmilqywjbkydxjzrrz`
  - 用于发布前测试环境

---

## Vercel 环境变量配置

### 配置步骤

1. **登录 Vercel Dashboard**
   - 进入项目设置：`Settings` → `Environment Variables`

2. **配置 Production 环境变量**
   - 点击 `Add New` 按钮
   - 在 `Environment` 下拉菜单中选择 `Production`
   - 添加以下变量：
     ```
     NEXT_PUBLIC_SUPABASE_URL = https://ksqiyfmdiwfapxdrsfsl.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY = [原有的 anon key]
     ```
   - 点击 `Save`

3. **配置 Preview 环境变量**
   - 点击 `Add New` 按钮
   - 在 `Environment` 下拉菜单中选择 `Preview`
   - 添加以下变量（使用新的 Supabase 项目）：
     ```
     NEXT_PUBLIC_SUPABASE_URL = https://madmilqywjbkydxjzrrz.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY = [新项目的 anon key]
     ```
   - 点击 `Save`

4. **删除 `All` 环境的配置**
   - 找到之前设置为 `All (Production, Preview, Development)` 的变量
   - 点击删除或修改为特定环境
   - **重要**：删除后，每个环境都需要单独配置

### 环境变量配置示意图
```
Production Environment:
├── NEXT_PUBLIC_SUPABASE_URL → 原有项目 URL
└── NEXT_PUBLIC_SUPABASE_ANON_KEY → 原有项目 Key

Preview Environment:
├── NEXT_PUBLIC_SUPABASE_URL → 新项目 URL
└── NEXT_PUBLIC_SUPABASE_ANON_KEY → 新项目 Key
```

---

## GitHub Actions 工作流修改

### 需要修改的地方

#### 1. 修改环境变量传递逻辑

**当前问题**：工作流在构建时使用了 GitHub Secrets 中的环境变量，但 Vercel 会在部署时使用自己配置的环境变量。我们需要区分环境来设置正确的 Supabase 配置。

**解决方案**：修改 `deploy-vercel.yml` 中的环境变量设置步骤。

#### 2. 修改数据库迁移任务

**当前问题**：`migrate-database` 任务总是使用同一个 Supabase 项目，需要根据分支选择不同的项目。

**解决方案**：根据分支判断使用哪个 Supabase 项目进行迁移。

### 具体修改方案

#### 方案 A：使用 Vercel 环境变量（推荐）
Vercel 会在 `vercel pull` 时自动拉取对应环境的环境变量，所以不需要在工作流中手动设置。

#### 方案 B：在构建时传递环境变量
如果需要在构建时使用不同的 Supabase 配置，可以在工作流中根据分支设置环境变量。

### 推荐的修改点

1. **Build 步骤**（第 108-112 行）
   - 移除硬编码的环境变量
   - 让 Vercel 在 `vercel pull` 时自动拉取对应环境的环境变量

2. **数据库迁移步骤**（第 47-82 行）
   - 根据分支选择不同的 `SUPABASE_PROJECT_REF`
   - Main 分支使用原有项目
   - Release 分支使用新项目

---

## Deploy Hooks 说明

### 什么是 Deploy Hooks？

Deploy Hooks 是 Vercel 提供的唯一 URL，允许你**手动触发**指定分支的部署，而无需推送到 Git。

### 与自动部署的区别

- **自动部署**：当你推送到 Git 分支时，Vercel 会自动触发部署
- **Deploy Hooks**：通过 HTTP 请求手动触发特定分支的部署

### 是否需要配置 Deploy Hooks？

**不需要**，因为：
1. 你的 GitHub Actions 工作流已经配置了自动部署
2. 推送到 `main` 或 `release` 分支时会自动触发部署
3. Deploy Hooks 主要用于外部系统集成（如 CI/CD 工具、Webhook 触发等）

### 何时需要使用 Deploy Hooks？

- 需要从外部系统（非 Git）触发部署
- 需要手动重新部署某个分支
- 需要集成第三方服务触发部署

---

## 部署链接查看方法

### 为什么部署页面显示的是 "HEAD" 而不是分支名？

**原因**：当你通过 GitHub Actions 使用 `vercel deploy` 命令时，Vercel 会根据当前 Git 提交的 SHA 来标识部署，而不是分支名。这是正常行为。

### 如何区分 Main 和 Release 的部署？

#### 方法 1：通过 Vercel Dashboard

1. **查看 Production 部署（Main 分支）**
   - 登录 Vercel Dashboard
   - 进入项目页面
   - 点击左侧菜单的 `Deployments`
   - 找到 `Production` 标签的部署
   - 或者在 `Settings` → `Git` 中查看 Production 分支配置

2. **查看 Preview 部署（Release 分支）**
   - 在 `Deployments` 页面
   - 找到 `Preview` 标签的部署
   - 点击部署详情，查看 `Source` 信息，会显示触发部署的分支或提交

#### 方法 2：通过部署 URL 区分

Vercel 为每个部署生成唯一的 URL：
- **Production URL**（固定）：`https://keco-studio.vercel.app` 或你的自定义域名
- **Preview URL**（动态）：`https://keco-studio-[hash]-[team].vercel.app`
  - 每个预览部署都有唯一的 URL
  - 可以在部署详情页面查看

#### 方法 3：通过 GitHub Actions 日志

1. 在 GitHub 仓库中，点击 `Actions` 标签
2. 查看最近的工作流运行记录
3. 在 `Deploy Project Artifacts to Vercel` 步骤的输出中，会显示部署 URL

#### 方法 4：查看部署的 Metadata

在部署详情页面，可以查看：
- **Source**: 显示触发部署的 Git 提交（如 `60a59c8 Merge pull request #38`）
- **Branch**: 在部署的 Metadata 中会显示分支名
- **Environment**: 显示是 `Production` 还是 `Preview`

### 如何快速查找特定分支的部署？

1. **在 Vercel Dashboard**
   - 进入 `Deployments` 页面
   - 使用搜索框或过滤器
   - 根据提交信息或时间筛选

2. **通过 Git 提交信息**
   - 在部署详情中查看 `Source` 字段
   - 点击提交 SHA，会跳转到 GitHub 查看该提交
   - 在 GitHub 中可以看到该提交属于哪个分支

---

## 常见问题解答

### Q1: 为什么环境变量要分别配置 Production 和 Preview？

**A**: 因为 Main 和 Release 分支需要使用不同的 Supabase 项目：
- Main（Production）使用生产环境的 Supabase 数据库
- Release（Preview）使用测试环境的 Supabase 数据库

这样可以确保：
- 测试不会影响生产数据
- 两个环境完全隔离
- 可以安全地在 Release 环境中测试新功能

### Q2: 如果我在 Vercel 中配置了环境变量，还需要在 GitHub Secrets 中配置吗？

**A**: 
- **不需要**在 GitHub Secrets 中配置 Supabase 的环境变量（如果使用 Vercel 的环境变量）
- **仍然需要**在 GitHub Secrets 中配置：
  - `VERCEL_TOKEN`
  - `VERCEL_ORG_ID`
  - `VERCEL_PROJECT_ID`
  - `SUPABASE_ACCESS_TOKEN`（用于数据库迁移）
  - `SUPABASE_PROJECT_REF`（如果迁移任务需要区分环境，可能需要多个）

### Q3: Release 分支的部署会覆盖 Main 分支的部署吗？

**A**: **不会**。它们是完全独立的：
- Main 分支部署到 Production 环境，使用固定域名
- Release 分支部署到 Preview 环境，使用临时预览 URL
- 两者互不影响

### Q4: 如何确保 Release 分支使用新的 Supabase 项目？

**A**: 
1. 在 Vercel 的 Preview 环境变量中配置新的 Supabase URL 和 Key
2. 当 Release 分支触发部署时，Vercel 会自动使用 Preview 环境的变量
3. 确认方法：在 Release 分支的部署日志中查看使用的环境变量

### Q5: 数据库迁移应该应用到哪个环境？

**A**: 
- **Main 分支的迁移**：应用到 Production Supabase 项目
- **Release 分支的迁移**：可以应用到 Preview Supabase 项目（用于测试）或 Production（如果确认无误）

建议：
- 先在 Release 环境的 Supabase 中测试迁移
- 确认无误后，再在 Main 分支中应用到 Production

### Q6: 如果我想查看当前部署使用的是哪个 Supabase 项目，该怎么办？

**A**: 
1. 在部署的应用中，打开浏览器控制台
2. 执行：`console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)`
3. 或者在应用的某个页面显示环境变量（仅用于调试）

---

## 实施检查清单

### Vercel 配置
- [ ] 在 Vercel Dashboard 中配置 Production 环境变量（原有 Supabase 项目）
- [ ] 在 Vercel Dashboard 中配置 Preview 环境变量（新 Supabase 项目）
- [ ] 删除或更新之前设置为 "All" 的环境变量
- [ ] 验证两个环境的变量都已正确保存

### GitHub Actions 配置
- [ ] 检查工作流是否能够正确识别 Main 和 Release 分支
- [ ] 确认 `vercel pull` 步骤使用正确的环境参数
- [ ] 确认数据库迁移任务（如需要）能够区分环境

### 验证步骤
- [ ] 推送到 Main 分支，验证部署使用 Production 环境变量
- [ ] 推送到 Release 分支，验证部署使用 Preview 环境变量
- [ ] 检查两个部署的 Supabase 连接是否指向正确的项目
- [ ] 验证功能在两个环境中都正常工作

---

## 注意事项

1. **环境隔离**：确保 Production 和 Preview 环境完全隔离，避免数据混淆

2. **安全性**：不要在代码中硬编码环境变量，始终使用 Vercel 的环境变量配置

3. **数据库迁移**：在应用迁移到 Production 之前，先在 Preview 环境中充分测试

4. **回滚策略**：如果 Release 环境测试失败，确保有快速回滚到 Main 分支的机制

5. **监控**：建议为两个环境都配置监控和日志收集，方便问题排查

---

## 相关链接

- [Vercel 环境变量文档](https://vercel.com/docs/concepts/projects/environment-variables)
- [Vercel 部署预览文档](https://vercel.com/docs/concepts/deployments/preview-deployments)
- [GitHub Actions 文档](https://docs.github.com/en/actions)

---

**最后更新时间**: 2026-01-09

