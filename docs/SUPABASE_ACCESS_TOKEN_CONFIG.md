# Supabase Access Token 配置说明

## 📋 概述

本文档说明如何配置 `SUPABASE_ACCESS_TOKEN` 以支持双环境的数据库迁移。

---

## 🔑 SUPABASE_ACCESS_TOKEN 配置方案

### 方案 1: 使用一个 Token（推荐，适用于大多数情况）

**适用场景**：
- 两个 Supabase 项目在**同一个 Supabase 账号**下

**配置步骤**：
1. 只需要在 GitHub Secrets 中配置一个 `SUPABASE_ACCESS_TOKEN`
2. 这个 Token 可以访问同一账号下的所有项目
3. 工作流会根据分支自动选择对应的 `SUPABASE_PROJECT_REF`

**GitHub Secrets 配置**：
```
SUPABASE_ACCESS_TOKEN = [你的 Supabase Access Token]
SUPABASE_PROJECT_REF_PROD = ksqiyfmdiwfapxdrsfsl
SUPABASE_PROJECT_REF_PREVIEW = madmilqywjbkydxjzrrz
```

**工作流行为**：
- Main 分支 → 使用 `SUPABASE_PROJECT_REF_PROD` + `SUPABASE_ACCESS_TOKEN`
- Release 分支 → 使用 `SUPABASE_PROJECT_REF_PREVIEW` + `SUPABASE_ACCESS_TOKEN`

---

### 方案 2: 使用两个 Token（适用于不同账号的情况）

**适用场景**：
- 两个 Supabase 项目在**不同的 Supabase 账号**下
- 需要更严格的权限隔离

**配置步骤**：
1. 在 GitHub Secrets 中配置两个 Token：
   - `SUPABASE_ACCESS_TOKEN_PROD` - Production 项目的 Token
   - `SUPABASE_ACCESS_TOKEN_PREVIEW` - Preview 项目的 Token
2. （可选）保留 `SUPABASE_ACCESS_TOKEN` 作为备用

**GitHub Secrets 配置**：
```
SUPABASE_ACCESS_TOKEN = [通用 Token，可选]
SUPABASE_ACCESS_TOKEN_PROD = [Production 项目的 Token]
SUPABASE_ACCESS_TOKEN_PREVIEW = [Preview 项目的 Token]
SUPABASE_PROJECT_REF_PROD = ksqiyfmdiwfapxdrsfsl
SUPABASE_PROJECT_REF_PREVIEW = madmilqywjbkydxjzrrz
```

**工作流行为**：
- Main 分支 → 使用 `SUPABASE_PROJECT_REF_PROD` + `SUPABASE_ACCESS_TOKEN_PROD`
- Release 分支 → 使用 `SUPABASE_PROJECT_REF_PREVIEW` + `SUPABASE_ACCESS_TOKEN_PREVIEW`

---

## 🔍 如何判断使用哪个方案？

### 检查步骤

1. **登录 Supabase Dashboard**
   - 访问 https://app.supabase.com

2. **查看项目列表**
   - 在左侧导航栏查看所有项目
   - 确认 Production 和 Preview 项目是否在同一个账号下

3. **如果在同一个账号下**
   - ✅ 使用**方案 1**（一个 Token）
   - 一个 Access Token 可以访问账号下的所有项目

4. **如果在不同的账号下**
   - ✅ 使用**方案 2**（两个 Token）
   - 需要为每个账号生成单独的 Access Token

---

## 📝 如何获取 Supabase Access Token

### 步骤 1: 登录 Supabase Dashboard

访问 https://app.supabase.com 并登录

### 步骤 2: 进入 Account Settings

1. 点击右上角的头像
2. 选择 `Account Settings` 或 `Access Tokens`

### 步骤 3: 生成 Access Token

1. 找到 `Access Tokens` 部分
2. 点击 `Generate new token`
3. 输入 Token 名称（例如：`GitHub Actions - Production`）
4. 选择过期时间（建议：`Never expires` 或较长时间）
5. 点击 `Generate token`
6. **立即复制 Token**（只显示一次）

### 步骤 4: 添加到 GitHub Secrets

1. 进入 GitHub 仓库 → `Settings` → `Secrets and variables` → `Actions`
2. 点击 `New repository secret`
3. 输入名称和 Token 值
4. 保存

---

## ⚙️ 工作流自动选择逻辑

工作流已经实现了智能选择逻辑：

```yaml
# 如果配置了单独的环境 Token，优先使用
if [ -n "${{ secrets.SUPABASE_ACCESS_TOKEN_PROD }}" ]; then
  # 使用 SUPABASE_ACCESS_TOKEN_PROD
else
  # 回退到通用的 SUPABASE_ACCESS_TOKEN
fi
```

**优势**：
- ✅ 向后兼容：如果只配置了 `SUPABASE_ACCESS_TOKEN`，工作流仍能正常工作
- ✅ 灵活配置：如果配置了环境特定的 Token，会自动使用
- ✅ 无需修改工作流：根据 Secrets 的存在自动选择

---

## ✅ 推荐配置（快速开始）

对于大多数情况，推荐使用**方案 1**：

### GitHub Secrets 配置清单

**必需的 Secrets**：
- ✅ `SUPABASE_ACCESS_TOKEN` - Supabase 访问令牌
- ✅ `SUPABASE_PROJECT_REF_PROD` - Production 项目 Ref
- ✅ `SUPABASE_PROJECT_REF_PREVIEW` - Preview 项目 Ref

**可选的 Secrets**（如果项目在不同账号下）：
- ⚪ `SUPABASE_ACCESS_TOKEN_PROD` - Production 项目的 Token
- ⚪ `SUPABASE_ACCESS_TOKEN_PREVIEW` - Preview 项目的 Token

---

## 🔒 安全建议

1. **Token 权限最小化**：
   - 只授予必要的权限
   - 定期轮换 Token

2. **不要将 Token 提交到代码库**：
   - 始终使用 GitHub Secrets
   - 不要在代码中硬编码

3. **监控 Token 使用**：
   - 定期检查 Supabase Dashboard 中的访问日志
   - 发现异常及时撤销 Token

---

## ❓ 常见问题

### Q1: 我已经有 `SUPABASE_ACCESS_TOKEN`，还需要配置新的吗？

**A**: 
- 如果两个项目在同一个账号下：**不需要**，继续使用现有的 Token
- 如果两个项目在不同账号下：**需要**，配置 `SUPABASE_ACCESS_TOKEN_PROD` 和 `SUPABASE_ACCESS_TOKEN_PREVIEW`

### Q2: 如何验证 Token 是否正确？

**A**: 
1. 运行工作流
2. 查看 `Link to Supabase project` 步骤的日志
3. 如果成功链接，说明 Token 正确
4. 如果失败，检查 Token 是否有效，是否有项目访问权限

### Q3: Token 过期了怎么办？

**A**: 
1. 生成新的 Token
2. 在 GitHub Secrets 中更新 `SUPABASE_ACCESS_TOKEN`（或对应的环境 Token）
3. 重新运行工作流

### Q4: 工作流如何知道使用哪个 Token？

**A**: 
工作流会按以下顺序检查：
1. 首先检查是否存在环境特定的 Token（`SUPABASE_ACCESS_TOKEN_PROD` 或 `SUPABASE_ACCESS_TOKEN_PREVIEW`）
2. 如果存在，使用环境特定的 Token
3. 如果不存在，回退到通用的 `SUPABASE_ACCESS_TOKEN`

---

## 📚 相关文档

- [GitHub Actions 工作流修改说明](./WORKFLOW_MODIFICATIONS.md)
- [部署工作流原理说明](./DEPLOYMENT_WORKFLOW_EXPLANATION.md)
- [Supabase CLI 文档](https://supabase.com/docs/reference/cli)

---

**最后更新时间**: 2026-01-09

