# Release 分支保护规则设置指南

本文档说明如何为 `release/*` 分支设置保护规则，确保发布质量。

## 🎯 目的

- ✅ 确保所有 release 分支在合并前通过 CI 测试
- ✅ 防止未经测试的代码进入 release 分支
- ✅ 保持 release 分支的稳定性和可靠性

## 📋 设置步骤

### 1. 访问分支保护规则页面

1. 打开 GitHub 仓库主页
2. 点击 **Settings**（设置）
3. 在左侧菜单中选择 **Branches**（分支）
4. 找到 **Branch protection rules**（分支保护规则）部分
5. 点击 **Add rule**（添加规则）按钮

### 2. 配置保护规则

#### 基本设置

**Branch name pattern**（分支名称模式）：
```
release/*
```

这将匹配所有以 `release/` 开头的分支，例如：
- `release/v0.1.0`
- `release/v0.2.0`
- `release/v1.0.0`

#### 必需的保护规则

勾选以下选项：

##### ✅ Require a pull request before merging
（合并前需要 Pull Request）

- **Required approvals**: 1
  - 至少需要 1 个审核者批准才能合并
  - 对于关键版本，可以设置为 2 个审核者

##### ✅ Require status checks to pass before merging
（合并前需要状态检查通过）

必须配置以下选项：

1. **勾选**: `Require branches to be up to date before merging`
   - 确保分支在合并前是最新的

2. **添加必需的状态检查**：
   在搜索框中输入并添加以下检查项：
   
   - `test` - Playwright 测试（来自 playwright.yml workflow）
   
   如果有其他 workflow，也可以添加：
   - `build` - 构建检查（如果有）
   - `lint` - 代码规范检查（如果有）

##### ✅ Require conversation resolution before merging
（合并前需要解决所有对话）

- 确保所有代码审查意见都已被处理

##### ✅ Do not allow bypassing the above settings
（不允许绕过以上设置）

- 即使是管理员也必须遵守这些规则
- 确保版本质量的最后防线

#### 可选的保护规则

根据团队需求，可以考虑启用：

##### ⭕ Require linear history
（需要线性历史）

- 强制使用 rebase 而不是 merge commit
- 保持提交历史清晰

##### ⭕ Require deployments to succeed before merging
（合并前需要部署成功）

- 如果配置了自动部署，可以启用此选项

##### ⭕ Lock branch
（锁定分支）

- **仅在正式发布后使用**
- 防止对已发布的 release 分支进行修改
- 例如：`release/v0.1.0` 发布后可以锁定

### 3. 保存规则

1. 滚动到页面底部
2. 点击 **Create**（创建）按钮
3. 规则将立即生效

## 🔄 Release 分支工作流程

### 创建 Release 分支

```bash
# 从最新的 main 分支创建
git checkout main
git pull origin main
git checkout -b release/v0.1.0
git push -u origin release/v0.1.0
```

### 开发和测试

```bash
# 在 release 分支上进行修改
git checkout release/v0.1.0

# 进行必要的修复或调整
# ... 编辑文件 ...

# 提交更改
git add .
git commit -m "fix: critical bug fix for v0.1.0"
git push origin release/v0.1.0
```

### CI 检查

推送后，GitHub Actions 会自动运行：
- ✅ Playwright 测试（使用本地 Supabase）
- ✅ 所有测试必须通过才能继续

### 合并到 Main（如果需要）

```bash
# 创建 Pull Request
# 从 release/v0.1.0 到 main

# 或使用命令行
git checkout main
git merge release/v0.1.0
git push origin main
```

### 打标签发布

```bash
# 只有在 CI 全绿后才打标签
git checkout release/v0.1.0
git tag -a v0.1.0 -m "Release version 0.1.0"
git push origin v0.1.0
```

### 创建 GitHub Release

1. 访问仓库的 **Releases** 页面
2. 点击 **Draft a new release**
3. 选择刚才创建的 tag `v0.1.0`
4. 填写 Release 标题和描述
5. 点击 **Publish release**

### 锁定 Release 分支（可选）

发布后，如果不再需要修改：

1. 回到 **Branch protection rules**
2. 编辑 `release/*` 规则
3. 勾选 **Lock branch**
4. 保存

## 📊 分支保护状态检查

### 查看保护状态

在 GitHub 仓库中：
1. 进入 **Settings** → **Branches**
2. 查看 **Branch protection rules** 列表
3. 应该看到 `release/*` 规则及其状态

### 测试保护规则

尝试以下操作，验证规则是否生效：

1. ❌ 直接推送到 release 分支（应该被阻止）
2. ✅ 创建 PR 但 CI 未通过（应该无法合并）
3. ✅ 创建 PR 且 CI 通过（应该可以合并）

## 🔧 Main 分支保护规则（推荐）

同样建议为 `main` 分支设置保护规则：

**Branch name pattern**: `main`

勾选相同的选项：
- ✅ Require a pull request before merging
- ✅ Require status checks to pass before merging
  - 添加状态检查：`test`
- ✅ Require conversation resolution before merging

## 📝 最佳实践

### Release 分支命名规范

```
release/v{major}.{minor}.{patch}
```

示例：
- `release/v0.1.0` - 初始发布
- `release/v0.2.0` - 新功能版本
- `release/v1.0.0` - 重大版本
- `release/v0.1.1` - 补丁版本

### Hotfix 流程

如果 release 分支需要紧急修复：

```bash
# 在 release 分支上修复
git checkout release/v0.1.0
git pull origin release/v0.1.0

# 进行修复
# ... 编辑文件 ...

# 提交并推送
git add .
git commit -m "hotfix: fix critical security issue"
git push origin release/v0.1.0

# 等待 CI 通过

# 将修复合并回 main
git checkout main
git cherry-pick <commit-hash>
# 或
git merge release/v0.1.0
git push origin main
```

### 版本号管理

确保 `package.json` 中的版本号与 release 分支一致：

```json
{
  "name": "keco-studio",
  "version": "0.1.0",
  ...
}
```

## ❓ 常见问题

### Q: 如果 CI 检查失败怎么办？

A: 
1. 查看 GitHub Actions 日志，找出失败原因
2. 在本地修复问题
3. 提交并推送修复
4. 等待 CI 重新运行并通过

### Q: 可以绕过 CI 检查吗？

A: 不建议。如果确实需要（紧急情况）：
1. 临时禁用分支保护规则
2. 进行必要的操作
3. **立即重新启用**保护规则

### Q: Release 分支应该保留多久？

A: 建议：
- 活跃维护的版本：保留
- 已废弃的版本：发布 6 个月后可以删除
- 或者使用 tag 保留历史，删除分支

### Q: Main 和 Release 的 Supabase Schema 会冲突吗？

A: 不会。因为：
- 每个分支的 CI 运行在独立的虚拟环境中
- 使用本地 Supabase 实例，互不影响
- Schema 通过 Git 管理的 migrations 文件控制

## 📚 相关文档

- [GitHub Actions 配置说明](.github/workflows/README.md)
- [Playwright CI 优化指南](PLAYWRIGHT_CI_OPTIMIZATION.md)
- [CI 测试指南](../CI_TEST_GUIDE.md)

## 🔗 有用的链接

- [GitHub 分支保护文档](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [GitHub Actions 状态检查](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/about-status-checks)
- [语义化版本规范](https://semver.org/lang/zh-CN/)

---

**更新日期**: 2026-01-07  
**版本**: 1.0.0

