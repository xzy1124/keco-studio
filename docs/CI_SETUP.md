# GitHub Actions CI Setup for Playwright Tests

## 问题说明

在 GitHub Actions 中运行 Playwright 测试时遇到的问题：

1. ❌ 无法直接连接 Supabase 数据库（IPv6 连接失败）
2. ❌ CI 环境拒绝 `@example.com` 等无效邮箱域名
3. ❌ 无法为测试创建必要的种子数据

## 解决方案

使用 **Supabase Admin API** 代替直接数据库连接来创建测试用户。

### 优势

- ✅ 完全避免数据库连接问题
- ✅ 使用官方 Supabase API，更可靠
- ✅ 支持合法的邮箱域名
- ✅ 在本地和 CI 环境中都能正常工作
- ✅ 不需要 SSH 隧道或复杂的网络配置

## 快速配置步骤

### 1. 获取 Supabase Service Role Key

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 进入 **Project Settings** → **API**
4. 找到 **Project API keys** 部分
5. 复制 `service_role` key（**⚠️ 保密！**）

### 2. 在 GitHub 添加 Secrets

1. 进入你的 GitHub 仓库
2. **Settings** → **Secrets and variables** → **Actions**
3. 点击 **New repository secret**
4. 添加以下 secrets：

```
NEXT_PUBLIC_SUPABASE_URL = https://xxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbG...（anon key）
SUPABASE_SERVICE_ROLE_KEY = eyJhbG...（service_role key）⚠️
```

### 3. 本地测试（可选）

在本地测试 seed 脚本：

```bash
# 1. 安装 tsx（如果还没安装）
npm install

# 2. 创建 .env.local 文件
cat > .env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
EOF

# 3. 运行 seed 脚本
npm run seed:api
```

### 4. 推送代码触发 CI

```bash
git add .
git commit -m "fix: use Supabase Admin API for seeding test users"
git push
```

GitHub Actions 将自动：
1. 安装依赖
2. 通过 API 创建测试用户
3. 运行 Playwright 测试

## 技术细节

### 邮箱域名更改

为什么使用 `@mailinator.com` 而不是 `@example.com`？

- GitHub Actions 和很多 CI 环境会验证邮箱域名的有效性
- `@example.com` 虽然是 RFC 保留域名，但会被某些系统拒绝
- `@mailinator.com` 是真实的临时邮箱服务，通过验证
- 如果需要，你可以在 https://www.mailinator.com/ 查看这些邮箱

### 创建的测试用户

| 邮箱 | 密码 | 用途 |
|------|------|------|
| seed-empty@mailinator.com | Password123! | 空账户（并行测试 1） |
| seed-empty-2@mailinator.com | Password123! | 空账户（并行测试 2） |
| seed-empty-3@mailinator.com | Password123! | 空账户（并行测试 3） |
| seed-empty-4@mailinator.com | Password123! | 空账户（并行测试 4） |
| seed-project@mailinator.com | Password123! | 有一个空项目 |
| seed-library@mailinator.com | Password123! | 有一个项目+一个库 |

### Workflow 变化

**之前（会失败）：**
```yaml
- name: Install PostgreSQL client and DNS tools
  run: sudo apt-get update && sudo apt-get install -y postgresql-client dnsutils
- name: Seed remote database with test users
  run: ./scripts/seed-remote.sh
```

**现在（可靠）：**
```yaml
- name: Seed test users via Supabase Admin API
  if: env.SUPABASE_SERVICE_ROLE_KEY != ''
  run: npm run seed:api
```

## 常见问题

### Q: 为什么不使用 SSH 隧道？

A: SSH 隧道虽然可行，但会增加复杂性：
- 需要在 GitHub Actions 和 Supabase 之间建立 SSH 连接
- 需要额外的 SSH 密钥管理
- 可能仍然受到防火墙限制
- Admin API 方案更简单、更可靠

### Q: Service Role Key 安全吗？

A: 只要你：
- ✅ 只在 GitHub Secrets 中存储（不提交到代码）
- ✅ 只在必要时使用（seed 脚本）
- ✅ 定期轮换密钥

就是安全的。GitHub Secrets 是加密的，不会在日志中显示。

### Q: 可以在生产环境使用这些测试用户吗？

A: **不建议！** 这些是测试用户，使用已知密码。建议：
- 在测试环境/项目中使用
- 或者使用独立的测试数据库
- 定期清理测试数据

### Q: 如何在本地开发时使用 @example.com？

A: 本地 Supabase 实例默认允许任何邮箱域名。这个问题只在云端/CI 环境中出现。

## 相关文件

- `scripts/seed-via-api.ts` - API seed 脚本
- `scripts/seed-remote.sh` - 旧的数据库连接方式（legacy）
- `.github/workflows/playwright.yml` - CI workflow
- `tests/e2e/fixures/users.ts` - 测试用户配置
- `docs/ENVIRONMENT_SETUP.md` - 详细的环境配置说明

## 下一步

1. ✅ 添加 GitHub Secrets
2. ✅ 推送代码
3. ✅ 检查 Actions 运行结果
4. ✅ 测试通过！🎉

如有问题，查看 GitHub Actions 日志中的详细输出。

