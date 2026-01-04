# 本地测试远程账号指南

## 问题场景

当 GitHub Actions CI 测试失败时，需要在本地验证远程 Supabase 中的账号数据是否正确创建。

## 账号区分

| 环境 | 数据库 | Email | Username | 用途 |
|------|--------|-------|----------|------|
| 本地开发 | 本地 Supabase | `seed-happy-path@mailinator.com` | `seed-happy-path` | 本地开发和测试 |
| CI/远程 | 远程 Supabase | `seed-happy-path-remote@mailinator.com` | `seed-happy-path-remote` | GitHub Actions CI |

## 在本地测试远程账号

### 步骤 1: 备份当前 .env.local

```bash
cp .env.local .env.local.backup
```

### 步骤 2: 修改 .env.local 连接到远程 Supabase

编辑 `.env.local`，将其修改为远程 Supabase 配置：

```env
# 远程 Supabase URL（从 Supabase Dashboard → Project Settings → API 获取）
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co

# 远程 Supabase Anon Key（从 Supabase Dashboard → Project Settings → API 获取）
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-remote-anon-key

# Service Role Key（用于 seeding，从 Supabase Dashboard → Project Settings → API 获取）
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 步骤 3: 运行 seed 脚本（可选 - 如果需要重新创建账号）

```bash
npm run seed:api
```

这会在远程 Supabase 中创建 `seed-happy-path-remote@mailinator.com` 账号及其数据。

### 步骤 4: 启动开发服务器

```bash
npm run dev
```

### 步骤 5: 登录测试

访问 http://localhost:3000，使用以下账号登录：

```
Email: seed-happy-path-remote@mailinator.com
Password: Password123!
```

### 步骤 6: 验证数据

登录后检查：
- ✅ 项目 "Livestock Management Project" 是否存在
- ✅ 项目下是否有 "Direct Folder"
- ✅ 项目下是否有 "Breed Library"（包含 "Black Goat Breed" 资产）
- ✅ 项目下是否有 "Direct Library"

### 步骤 7: 测试完成后恢复本地配置

```bash
# 恢复本地 Supabase 配置
mv .env.local.backup .env.local
```

## 快速切换脚本（可选）

可以创建两个配置文件方便切换：

### 创建 .env.local.local（本地配置）
```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-local-anon-key
```

### 创建 .env.local.remote（远程配置）
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-remote-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 切换命令
```bash
# 切换到远程
cp .env.local.remote .env.local

# 切换回本地
cp .env.local.local .env.local
```

## 调试 CI 失败的常见原因

1. **seed:api 脚本失败**
   - 检查 SUPABASE_SERVICE_ROLE_KEY 是否正确
   - 检查 GitHub Secrets 是否配置正确

2. **账号创建成功但数据不完整**
   - 在本地连接远程数据库后登录查看
   - 检查 seed-via-api.ts 中的数据创建逻辑

3. **测试找不到项目**
   - 确认 destructive.spec.ts 使用的是 `users.seedHappyPathRemote`
   - 确认项目名称完全匹配："Livestock Management Project"

4. **密码错误**
   - 所有测试账号密码统一为：`Password123!`

## 测试代码配置

### tests/e2e/fixures/users.ts

```typescript
// 本地测试账号
seedHappyPath: {
  email: 'seed-happy-path@mailinator.com',
  password: 'Password123!',
}

// 远程测试账号（CI）
seedHappyPathRemote: {
  email: 'seed-happy-path-remote@mailinator.com',
  password: 'Password123!',
}
```

### tests/e2e/specs/destructive.spec.ts

对于 GitHub Actions CI 测试，使用：

```typescript
await loginPage.login(users.seedHappyPathRemote);
```

对于本地测试（连接本地 Supabase），使用：

```typescript
await loginPage.login(users.seedHappyPath);
```

## 注意事项

⚠️ **重要**：
- `.env.local` 不要提交到 Git
- Service Role Key 是敏感信息，小心保管
- 测试完远程账号后记得切换回本地配置
- 远程账号和本地账号数据完全独立，互不影响

