# 双环境配置快速开始指南

## 🚀 5 分钟快速配置

### 第一步：确认分支名称（1 分钟）

检查你的 Release 分支名称：
```bash
git branch -a | grep release
```

- 如果是 `release/xxx`（带斜杠）→ ✅ 工作流已支持，跳过第二步
- 如果是 `release`（无斜杠）→ ❌ 需要修改工作流或重命名分支

详细说明请查看：[分支命名说明](./BRANCH_NAMING_CLARIFICATION.md)

---

### 第二步：配置 Vercel 环境变量（2 分钟）

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择你的项目 → `Settings` → `Environment Variables`

#### 配置 Production 环境（Main 分支使用）

点击 `Add New`，添加：
- **Name**: `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: `https://ksqiyfmdiwfapxdrsfsl.supabase.co`
- **Environment**: 选择 `Production` ✅
- 点击 `Save`

再次点击 `Add New`，添加：
- **Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value**: `[你的 Production Supabase Anon Key]`
- **Environment**: 选择 `Production` ✅
- 点击 `Save`

#### 配置 Preview 环境（Release 分支使用）

点击 `Add New`，添加：
- **Name**: `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: `https://madmilqywjbkydxjzrrz.supabase.co`
- **Environment**: 选择 `Preview` ✅
- 点击 `Save`

再次点击 `Add New`，添加：
- **Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value**: `[你的 Preview Supabase Anon Key]`
- **Environment**: 选择 `Preview` ✅
- 点击 `Save`

#### ⚠️ 重要：删除旧的 "All" 环境配置

找到之前设置为 `All (Production, Preview, Development)` 的变量，删除或修改为特定环境。

---

### 第三步：关于 GitHub Secrets 的重要说明

#### ⚠️ 重要：不需要在 GitHub Secrets 中配置 Supabase 环境变量

**为什么不需要？**

1. **Vercel 会自动拉取环境变量**：
   - 工作流中的 `vercel pull --environment=production` 或 `vercel pull --environment=preview` 会自动从 Vercel Dashboard 拉取对应环境的变量
   - 这些变量会被用于 `vercel build` 和 `vercel deploy` 命令

2. **环境变量已经配置在 Vercel Dashboard**：
   - 你在第二步中已经在 Vercel Dashboard 配置了 Production 和 Preview 的环境变量
   - 这些变量会自动被工作流使用，无需在 GitHub Secrets 中重复配置

3. **GitHub Secrets 中现有的 Supabase 变量可以保留或删除**：
   - `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 在工作流中已经不再使用
   - 如果这些变量在其他地方（如其他工作流）还在使用，可以保留
   - 如果不再需要，可以安全删除

#### 只需要保留的 GitHub Secrets

以下 Secrets 是必需的（用于 Vercel 部署和数据库迁移）：
- ✅ `VERCEL_TOKEN` - Vercel 部署令牌
- ✅ `VERCEL_ORG_ID` - Vercel 组织 ID
- ✅ `VERCEL_PROJECT_ID` - Vercel 项目 ID
- ✅ `SUPABASE_ACCESS_TOKEN` - Supabase 访问令牌（用于数据库迁移）
- ✅ `SUPABASE_PROJECT_REF` - Supabase 项目引用（用于数据库迁移，如果需要区分环境，见下一步）

---

### 第四步：配置 GitHub Secrets（仅数据库迁移需要，可选）

如果需要数据库迁移功能根据分支选择不同的 Supabase 项目：

1. 进入 GitHub 仓库 → `Settings` → `Secrets and variables` → `Actions`
2. 点击 `New repository secret`

添加以下 Secrets：

- **Name**: `SUPABASE_PROJECT_REF_PROD`
- **Value**: `ksqiyfmdiwfapxdrsfsl`（原有项目）

- **Name**: `SUPABASE_PROJECT_REF_PREVIEW`
- **Value**: `madmilqywjbkydxjzrrz`（新项目）

> **注意**：如果暂时不需要自动迁移功能，可以跳过这一步。手动迁移时再配置。

---

### 第五步：验证配置（1 分钟）

#### 测试 Main 分支部署

```bash
# 创建一个测试提交
echo "# Test" >> TEST.md
git add TEST.md
git commit -m "test: verify production deployment"
git push origin main
```

**验证点**：
1. 查看 [GitHub Actions](https://github.com/your-repo/actions) 是否触发
2. 工作流日志中应该显示 "✅ 部署到 Production 环境"
3. 在 Vercel Dashboard 中查看部署，应该使用 Production 环境变量

#### 测试 Release 分支部署

```bash
# 切换到 release 分支（或 release/xxx）
git checkout release  # 或 git checkout release/stable
echo "# Test" >> TEST2.md
git add TEST2.md
git commit -m "test: verify preview deployment"
git push origin release
```

**验证点**：
1. 查看 GitHub Actions 是否触发
2. 工作流日志中应该显示 "✅ 部署到 Preview 环境"
3. 在 Vercel Dashboard 中查看部署，应该使用 Preview 环境变量
4. 部署 URL 应该是预览 URL（不是固定域名）

---

## 📍 如何查看部署链接

### Main 分支（Production）部署链接

**方法 1: Vercel Dashboard**
1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择项目 → 点击 `Deployments`
3. 找到带有 `Production` 标签的部署
4. 点击部署，查看 URL（通常是 `https://your-project.vercel.app`）

**方法 2: 固定域名**
- Production 部署通常使用固定域名
- 可以在 `Settings` → `Domains` 中查看

### Release 分支（Preview）部署链接

**方法 1: Vercel Dashboard**
1. 进入 `Deployments` 页面
2. 找到带有 `Preview` 标签的部署
3. 点击部署，查看 URL（格式：`https://your-project-[hash]-[team].vercel.app`）

**方法 2: GitHub Actions 日志**
1. 进入 GitHub Actions 页面
2. 找到对应的部署工作流
3. 展开 `Deploy Project Artifacts to Vercel` 步骤
4. 查看输出中的部署 URL

---

## ❓ 常见问题快速解答

### Q: 为什么部署页面显示的是 "HEAD" 而不是分支名？

**A**: 这是正常现象。当通过 GitHub Actions 部署时，Vercel 使用 Git 提交 SHA 来标识部署。分支信息可以在部署的 Metadata 或 GitHub 提交记录中查看。

### Q: 如何区分 Main 和 Release 的部署？

**A**: 
- 在 Vercel Dashboard 的 `Deployments` 页面，查看部署的标签：
  - `Production` 标签 = Main 分支部署
  - `Preview` 标签 = Release 分支部署
- 或者通过 URL：
  - 固定域名 = Production
  - 临时预览 URL = Preview

### Q: Deploy Hooks 需要配置吗？

**A**: **不需要**。你的 GitHub Actions 已经配置了自动部署，推送到分支时会自动触发。Deploy Hooks 主要用于手动触发或外部系统集成。

### Q: 环境变量配置为 "All" 可以吗？

**A**: **不建议**。因为 Main 和 Release 需要使用不同的 Supabase 项目，应该分别配置：
- Production 环境 → 原有 Supabase 项目
- Preview 环境 → 新 Supabase 项目

这样可以确保环境隔离，测试不会影响生产数据。

### Q: 如果我的分支是 `release`（无斜杠）怎么办？

**A**: 
1. **推荐**：重命名分支为 `release/stable` 或 `release/v1.0`
2. **或者**：修改工作流配置支持 `release` 分支

详细说明：[分支命名说明](./BRANCH_NAMING_CLARIFICATION.md)

---

## 📚 详细文档

- [完整配置指南](./VERCEL_DUAL_ENVIRONMENT_SETUP.md) - 详细的环境配置说明
- [工作流修改说明](./WORKFLOW_MODIFICATIONS.md) - GitHub Actions 修改细节
- [分支命名说明](./BRANCH_NAMING_CLARIFICATION.md) - 分支命名规则和匹配逻辑

---

## ✅ 配置检查清单

在开始使用前，确认以下项都已配置：

- [ ] Vercel Production 环境变量已配置（原有 Supabase 项目）
- [ ] Vercel Preview 环境变量已配置（新 Supabase 项目）
- [ ] 已删除或更新旧的 "All" 环境变量
- [ ] GitHub Secrets 已配置（如需要数据库迁移功能）
- [ ] 分支名称符合工作流配置要求
- [ ] Main 分支部署测试通过
- [ ] Release 分支部署测试通过
- [ ] 确认两个部署连接到正确的 Supabase 项目

---

**最后更新时间**: 2026-01-09

