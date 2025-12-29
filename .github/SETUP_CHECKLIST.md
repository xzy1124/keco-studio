# GitHub Actions E2E Testing Setup Checklist

## 前置准备

### 1. 远程 Supabase 项目设置

- [ ] 创建 Supabase 项目（如果还没有）
- [ ] 获取以下凭据：
  - `NEXT_PUBLIC_SUPABASE_URL` - 项目 URL
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Anon Key（公开密钥）
  - `SUPABASE_SERVICE_ROLE_KEY` - Service Role Key（管理员密钥）

在 Supabase Dashboard → Settings → API 中找到这些值。

### 2. 创建测试用户（首次设置）

**方法 1：使用 SQL Editor（推荐）**

1. 打开 Supabase Dashboard
2. 进入 SQL Editor
3. 复制 `supabase/seed-remote.sql` 的内容
4. 执行 SQL

**方法 2：使用 Admin API（自动）**

GitHub Actions 会自动运行 `npm run seed:api`，这会创建测试用户。

### 3. 配置 GitHub Secrets

在 GitHub 仓库中配置 Secrets：

**Settings → Secrets and variables → Actions → New repository secret**

需要添加以下 3 个 Secrets：

| Secret Name | 值 | 说明 |
|-------------|-----|------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | Supabase 项目 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbG...` | Anon Key（公开密钥） |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbG...` | Service Role Key（管理员密钥） |

⚠️ **注意**：不要将这些值提交到代码仓库！

## GitHub Actions Workflow 流程

当前的 `.github/workflows/playwright.yml` 执行以下步骤：

```yaml
1. 检出代码
2. 设置 Node.js
3. 安装依赖 (npm ci)
4. 创建测试用户 (npm run seed:api) ← 如果用户不存在
5. 清理测试数据 (npm run clean:test-data) ← 新增步骤
6. 安装 Playwright 浏览器
7. 运行 E2E 测试
8. 上传测试报告
```

## 验证配置

### 本地验证（可选）

在本地测试远程连接：

```bash
# 设置环境变量
export NEXT_PUBLIC_SUPABASE_URL="your-url"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# 清理测试数据
npm run clean:test-data

# 运行测试
npm run test:e2e
```

### GitHub Actions 验证

1. 推送代码到 GitHub
2. 检查 Actions 标签
3. 查看工作流运行日志
4. 确认所有步骤都成功

## 常见问题

### Q: Secrets 配置后测试还是失败？

**检查清单：**
- [ ] Secrets 名称拼写正确（区分大小写）
- [ ] 没有多余的空格或换行符
- [ ] Service Role Key 有正确的权限
- [ ] Supabase 项目没有被暂停

### Q: 测试用户创建失败？

**可能的原因：**
1. Service Role Key 不正确
2. 用户已存在（不是问题，会跳过）
3. 数据库权限问题

**解决方案：**
手动在 Supabase SQL Editor 中运行 `seed-remote.sql`

### Q: 清理数据失败？

**可能的原因：**
1. Service Role Key 不正确
2. 用户不存在（需要先创建）
3. 数据库外键约束问题

**解决方案：**
检查 Actions 日志中的详细错误信息

### Q: 如何查看测试报告？

1. 进入 GitHub Actions 运行详情
2. 在 Artifacts 部分下载 `playwright-report`
3. 解压后打开 `index.html`

或者使用：
```bash
npx playwright show-report /path/to/playwright-report
```

## 安全注意事项

### ✅ 推荐做法

- 使用 GitHub Secrets 存储敏感信息
- 不要在代码中硬编码凭据
- 使用单独的 Supabase 项目用于测试
- 定期轮换 Service Role Key

### ❌ 不要做

- 不要将 `.env` 文件提交到仓库
- 不要在 Pull Request 中暴露 Secrets
- 不要在生产数据库上运行测试
- 不要共享 Service Role Key

## 维护

### 定期任务

- [ ] 每月检查 Supabase 项目状态
- [ ] 查看测试覆盖率
- [ ] 清理过期的测试报告
- [ ] 更新依赖包

### 当测试失败时

1. 查看 GitHub Actions 日志
2. 下载测试报告和截图
3. 在本地复现问题
4. 修复后重新运行测试

## 相关文档

- [Playwright 文档](https://playwright.dev)
- [Supabase 文档](https://supabase.com/docs)
- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [远程测试指南](../../tests/e2e/REMOTE_TESTING_GUIDE.md)

## 完成检查

配置完成后，确认以下内容：

- [ ] GitHub Secrets 已配置
- [ ] 测试用户已创建（手动或自动）
- [ ] GitHub Actions workflow 可以成功运行
- [ ] 可以查看测试报告
- [ ] 团队成员了解测试流程

✅ 配置完成！现在可以推送代码触发 E2E 测试了。

