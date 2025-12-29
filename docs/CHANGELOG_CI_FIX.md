# CI 修复更新日志

## 问题描述

GitHub Actions 中 Playwright 测试失败的原因：
1. 无法连接到 Supabase 数据库（IPv6 连接错误）
2. CI 环境拒绝 `@example.com` 等无效邮箱注册
3. 没有测试种子数据

## 解决方案

使用 Supabase Admin API 代替直接数据库连接，完全避免网络连接问题。

## 文件变更

### 新增文件

1. **`scripts/seed-via-api.ts`** ⭐
   - 通过 Supabase Admin API 创建测试用户
   - 支持创建项目和库
   - 幂等性操作（不会重复创建）
   - 详细的日志输出

2. **`docs/CI_SETUP.md`**
   - 完整的 CI 配置指南（中文）
   - 逐步设置说明
   - 常见问题解答

3. **`docs/ENVIRONMENT_SETUP.md`**
   - 环境变量配置详解
   - GitHub Secrets 配置说明
   - 测试用户列表

4. **`CHANGELOG_CI_FIX.md`**
   - 本文件，记录所有变更

### 修改文件

1. **`package.json`**
   ```diff
   + "tsx": "^4.19.2"  // 添加依赖
   + "seed:api": "tsx scripts/seed-via-api.ts"  // 新增脚本
   ```

2. **`.github/workflows/playwright.yml`**
   ```diff
   - SUPABASE_DB_URL: ${{ secrets.SUPABASE_DB_URL }}
   + SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
   
   - # 复杂的 PostgreSQL 连接和 IPv6 处理
   + # 简单的 API 调用
   + - name: Seed test users via Supabase Admin API
   +   run: npm run seed:api
   ```

3. **`tests/e2e/fixures/users.ts`**
   ```diff
   - @example.com
   + @mailinator.com  // 所有测试邮箱改为合法域名
   ```

4. **`scripts/README.md`**
   - 添加新的 API seed 方法文档
   - 标记旧方法为 legacy

5. **`.gitignore`**
   ```diff
   + !.env.example  // 允许 .env.example 文件
   ```

6. **`README.md`**
   - 添加文档链接

## 使用方法

### 本地测试

```bash
# 1. 创建 .env.local
cat > .env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
EOF

# 2. 安装依赖
npm install

# 3. 运行 seed
npm run seed:api

# 4. 运行测试
npm run test:e2e
```

### GitHub Actions

添加以下 Secrets：
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

然后推送代码即可自动运行测试。

## 测试用户

所有测试用户的邮箱从 `@example.com` 改为 `@mailinator.com`：

- seed-empty@mailinator.com
- seed-empty-2@mailinator.com
- seed-empty-3@mailinator.com
- seed-empty-4@mailinator.com
- seed-project@mailinator.com
- seed-library@mailinator.com

密码统一为：`Password123!`

## 兼容性

- ✅ 本地开发环境
- ✅ GitHub Actions
- ✅ 其他 CI/CD 平台
- ✅ Windows/macOS/Linux

## 迁移指南

如果你之前使用了 `SUPABASE_DB_URL`：

1. 在 GitHub Secrets 中添加 `SUPABASE_SERVICE_ROLE_KEY`
2. 可选：删除 `SUPABASE_DB_URL`（不再需要）
3. 重新运行 CI

旧的 `seed-remote.sh` 脚本仍然保留，但不建议使用。

## 性能提升

- ⚡ 更快的 seed 操作（无需等待数据库连接）
- ⚡ 更稳定的 CI 运行（无网络问题）
- ⚡ 更简单的配置（只需 3 个环境变量）

## 安全性

- 🔒 Service Role Key 存储在 GitHub Secrets（加密）
- 🔒 不会在日志中显示敏感信息
- 🔒 仅在 seed 时使用管理员权限

## 后续优化建议

1. 考虑为测试创建独立的 Supabase 项目
2. 定期轮换 Service Role Key
3. 在测试后清理测试用户（可选）
4. 添加更多测试场景的种子数据

## 参考资源

- [Supabase Admin API 文档](https://supabase.com/docs/reference/javascript/admin-api)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Playwright Testing 最佳实践](https://playwright.dev/docs/best-practices)

---

更新时间：2025-12-26

