# Remote E2E Testing Guide

## 概述

本指南说明如何在远程 Supabase 环境中运行 E2E 测试。

## 数据库环境

### 本地环境（开发）
- 使用 `supabase start` 启动本地 Supabase
- 数据通过 `supabase/seed.sql` 自动填充
- 每次 `supabase db reset` 会重置所有数据

### 远程环境（CI/CD）
- 连接到远程 Supabase 项目
- 测试用户通过 `supabase/seed-remote.sql` 创建（只需运行一次）
- 测试数据需要在每次测试前清理

## 测试用户账号

`seed-remote.sql` 创建以下测试账号：

| 邮箱 | 密码 | 用途 |
|------|------|------|
| seed-empty@mailinator.com | Password123! | 空账号（主要测试账号） |
| seed-empty-2@mailinator.com | Password123! | 空账号（并行测试） |
| seed-empty-3@mailinator.com | Password123! | 空账号（并行测试） |
| seed-empty-4@mailinator.com | Password123! | 空账号（并行测试） |
| seed-project@mailinator.com | Password123! | 有一个空项目 |
| seed-library@mailinator.com | Password123! | 有一个项目和一个空库 |

## 问题：测试数据残留

### 问题描述
第一次运行测试后，测试账号中会保留测试数据（项目、库、资产等）。第二次运行测试时，会尝试创建同名的数据，导致失败。

### 解决方案

#### 方案 1：在测试前清理数据（推荐）

使用清理脚本：

```bash
# 清理远程测试数据
npm run clean:test-data

# 清理后运行测试
npm run test:e2e

# 或者一键清理并测试
npm run test:e2e:clean
```

#### 方案 2：在 CI/CD 中自动清理

在 GitHub Actions workflow 中：

```yaml
- name: Clean test data
  run: npm run clean:test-data
  env:
    NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
    SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}

- name: Run E2E tests
  run: npm run test:e2e
```

## 初始化远程数据库

### 1. 创建测试用户（只需运行一次）

```bash
# 方法 1: 使用 psql
psql $SUPABASE_DB_URL -f supabase/seed-remote.sql

# 方法 2: 在 Supabase Dashboard 的 SQL Editor 中运行
# 复制 seed-remote.sql 的内容并执行
```

### 2. 验证用户创建成功

```sql
SELECT email, created_at 
FROM auth.users 
WHERE email LIKE 'seed-%@mailinator.com'
ORDER BY email;
```

应该看到 6 个测试用户。

## 清理脚本说明

### `clean-test-data.ts`

这个脚本会：
1. 查找所有测试用户
2. 删除他们拥有的所有项目
3. 级联删除相关数据（文件夹、库、资产等）
4. **保留用户账号本身**（不需要重新创建）

### 清理的数据
- ✅ Projects（项目）
- ✅ Folders（文件夹）
- ✅ Libraries（库）
- ✅ Library Assets（资产）
- ✅ Library Field Definitions（字段定义）
- ✅ Library Asset Field Values（字段值）

### 不清理的数据
- ❌ Users（用户账号）
- ❌ Profiles（用户配置）

## 本地测试

### 本地 Supabase（推荐开发时使用）

```bash
# 重置本地数据库（会自动运行 seed.sql）
supabase db reset

# 运行测试
npm run test:e2e
```

### 连接远程 Supabase（测试 CI 环境）

```bash
# 1. 设置环境变量
export NEXT_PUBLIC_SUPABASE_URL="your-remote-url"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# 2. 清理测试数据
npm run clean:test-data

# 3. 运行测试
npm run test:e2e
```

## CI/CD 配置

### GitHub Actions 示例

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium
      
      - name: Clean test data
        run: npm run clean:test-data
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
      
      - name: Run E2E tests
        run: npm run test:e2e
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

## 常见问题

### Q: 为什么不在测试后清理数据？
A: 测试失败时可能不会执行清理，导致数据残留。在测试前清理更可靠。

### Q: 可以在测试中使用唯一名称吗？
A: 可以，但会导致数据库中积累大量测试数据。定期清理更干净。

### Q: 本地测试需要清理吗？
A: 不需要。本地使用 `supabase db reset` 即可重置所有数据。

### Q: seed-remote.sql 需要多次运行吗？
A: 不需要。只在首次设置时运行一次。之后只需要清理测试数据，不需要重新创建用户。

### Q: 清理脚本会删除用户吗？
A: 不会。清理脚本只删除测试数据（项目、库等），保留用户账号。

## 脚本命令总结

```bash
# 清理远程测试数据
npm run clean:test-data

# 运行 E2E 测试
npm run test:e2e

# 清理并测试（一键）
npm run test:e2e:clean

# 本地数据库重置
supabase db reset
```

## 相关文件

- `supabase/seed-remote.sql` - 创建测试用户（远程）
- `supabase/clean-test-data.sql` - 清理测试数据（SQL 版本）
- `scripts/clean-remote-test-data.ts` - 清理测试数据（TypeScript 版本）
- `tests/e2e/fixures/users.ts` - 测试用户凭据

