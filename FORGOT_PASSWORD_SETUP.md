# 忘记密码功能实现指南

## 使用 Supabase 默认邮件服务的完整流程

### 流程概览

1. **第一步（Verify）**：用户输入邮箱 → 点击"Send reset link" → Supabase 发送重置链接到邮箱
2. **第二步（Change password）**：用户点击邮件中的链接 → 跳转到 `/auth/reset-password` → 输入新密码 → 点击"Confirm" → 跳转到登录页面

### 详细流程说明

#### 第一步：发送重置链接（`/forgot-password`）

**页面功能：**
- ✅ 返回按钮
- ✅ 标题 "Forgot Your Password"
- ✅ 步骤指示器（显示步骤 1 为激活状态）
- ✅ Email or username 输入框
- ✅ "Send reset link" 按钮
- ✅ 成功/错误消息提示

**用户操作：**
1. 用户输入邮箱地址
2. 点击"Send reset link"按钮
3. Supabase 自动发送包含重置令牌的邮件到用户邮箱
4. 显示成功消息："Password reset email sent! Please check your inbox and click the link to reset your password."

**技术实现：**
```typescript
await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${window.location.origin}/auth/reset-password`,
});
```

#### 第二步：重置密码（`/auth/reset-password`）

**页面功能：**
- ✅ 返回按钮（返回到 `/forgot-password`）
- ✅ 标题 "Forgot Your Password"
- ✅ 步骤指示器（显示步骤 2 为激活状态）
- ✅ New password 输入框
- ✅ Confirm password 输入框
- ✅ "Confirm" 按钮
- ✅ 成功/错误消息提示

**用户操作：**
1. 用户点击邮件中的重置链接
2. 自动跳转到 `/auth/reset-password` 页面
3. Supabase 自动验证重置令牌（通过 URL 参数或 session）
4. 用户输入新密码和确认密码
5. 点击"Confirm"按钮
6. 密码重置成功后，显示成功消息并自动跳转到登录页面（`/?message=Password reset successfully`）

**技术实现：**
```typescript
// 验证重置令牌（自动处理）
const { data: { session } } = await supabase.auth.getSession();

// 更新密码
await supabase.auth.updateUser({
  password: newPassword,
});

// 跳转到登录页面
router.push('/?message=Password reset successfully');
```

## 静态页面已完成

忘记密码页面已创建：
- ✅ `/app/forgot-password/page.tsx` - 第一步：发送重置链接
- ✅ `/app/auth/reset-password/page.tsx` - 第二步：重置密码
- ✅ 返回按钮、标题、步骤指示器
- ✅ 右侧背景图片（与登录页一致）

## Supabase 配置步骤

### 1. 在 Supabase Dashboard 中配置邮箱验证

#### 步骤 1.1: 启用邮箱验证功能（Email Auth 设置）

**导航路径：**
1. 登录 [Supabase Dashboard](https://app.supabase.com)
2. 选择你的项目
3. 在左侧边栏，点击 **Authentication**（认证）
4. 在左侧边栏的 **CONFIGURATION**（配置）部分，点击 **Sign In / Providers**（登录/提供商）

**配置选项：**
5. 在页面中找到 **Email**（邮箱）部分（通常在页面顶部，在 OAuth 提供商列表之前）
6. 确保邮箱登录已启用（通常默认已启用）
7. （可选）**Enable email confirmations**（启用邮箱确认）
   - 这个选项控制用户注册后是否需要确认邮箱
   - 对于重置密码功能，这个设置不是必须的，但建议开启
8. （可选）**Enable email change confirmations**（启用邮箱更改确认）
   - 如果允许用户更改邮箱，可以开启此选项

**注意：** Email Auth 相关的设置都在 **Authentication** > **CONFIGURATION** > **Sign In / Providers** 页面中。

#### 步骤 1.2: 配置邮箱模板

**导航路径：**
1. 在左侧边栏，点击 **Authentication**（认证）
2. 在左侧边栏的 **NOTIFICATIONS** 部分，点击 **Email**（邮件）
3. 在页面顶部，确保 **Templates**（模板）标签页已选中
4. 在 **Authentication** 部分，找到 **Reset password**（重置密码）选项
5. 点击 **Reset password** 右侧的箭头图标，进入模板编辑页面

**配置内容：**

**Subject（主题）：**
- 可以自定义，例如：`Reset Your Password` 或 `重置您的密码`
- 建议使用清晰、友好的标题

**Body（正文）：**
- **必须包含** `{{ .ConfirmationURL }}` 作为重置链接
- 这是 Supabase 的占位符，会自动替换为实际的重置链接
- 可以自定义邮件内容，但必须保留这个占位符

**推荐模板：**
```html
<h2>Reset Password</h2>

<p>Follow this link to reset the password for your user:</p>

<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>

<p>If you didn't request this, you can safely ignore this email.</p>
```

**可用的占位符：**

**必须使用的占位符：**
- `{{ .ConfirmationURL }}` - **必须使用**，这是重置密码的链接，Supabase 会自动替换为实际的重置链接

**可选占位符（不需要填写）：**
- `{{ .Email }}` - 用户邮箱地址（可选，如果想在邮件中显示用户邮箱）
- `{{ .SiteURL }}` - 你的网站 URL（可选，Supabase 会自动从配置中获取）
- `{{ .RedirectTo }}` - 重定向 URL（可选，Supabase 会自动从代码中获取）
- `{{ .Token }}` - 重置令牌（不需要，已包含在链接中）
- `{{ .TokenHash }}` - 令牌哈希（不需要，已包含在链接中）
- `{{ .Data }}` - 额外数据（不需要）

**重要说明：**
- ✅ **只需要使用** `{{ .ConfirmationURL }}` 这一个占位符
- ✅ 其他占位符都是可选的，可以不填
- ✅ `{{ .SiteURL }}` 和 `{{ .RedirectTo }}` 不需要在邮件模板中填写，它们会自动从 Supabase 配置和代码中获取
- ✅ 最简单的模板只需要包含 `{{ .ConfirmationURL }}` 即可

**重要提示：**
- ⚠️ **必须包含** `{{ .ConfirmationURL }}`，否则用户无法重置密码
- 可以点击占位符按钮快速插入
- 可以在 **Preview** 标签页预览邮件效果
- 点击 **Save changes**（保存更改）保存模板

#### 步骤 1.3: 配置重定向 URL（重要！）

**导航路径：**
1. 在左侧边栏，点击 **Authentication**（认证）
2. 在左侧边栏的 **CONFIGURATION** 部分，点击 **URL Configuration**（URL 配置）

**配置 Redirect URLs（重定向 URL）：**

✅ **重要：可以同时配置多个 URL，支持本地开发和生产环境！**

**对于你的情况（本地开发 + Vercel 部署）：**

1. **保留现有的 Vercel 配置**（如果已有）：
   - `https://keco-studio.vercel.app/*` （通配符，支持所有路径）
   - 或者 `https://keco-studio.vercel.app/auth/reset-password` （精确路径）

2. **添加本地开发环境的 URL**：
   - 点击 **Add URL** 按钮
   - 输入：`http://localhost:3000/auth/reset-password`
   - 点击保存

3. **最终配置示例**（两个环境都支持）：
   ```
   https://keco-studio.vercel.app/*
   http://localhost:3000/auth/reset-password
   ```

**配置 Site URL（站点 URL）：**

- **设置为生产环境（Vercel）的 URL**：`https://keco-studio.vercel.app`
- 这个 URL 主要用于：
  - 生成邮件中的基础链接
  - 作为默认的重定向目标
- ⚠️ **注意**：即使设置为 Vercel 的 URL，本地开发仍然可以正常工作，因为 `Redirect URLs` 中已经包含了本地地址

**为什么这样配置？**

- ✅ **本地开发**：当你本地测试时，重置链接会跳转到 `http://localhost:3000/auth/reset-password`
- ✅ **生产环境**：产品经理测试时，重置链接会跳转到 `https://keco-studio.vercel.app/auth/reset-password`
- ✅ **Site URL 设置为 Vercel**：确保邮件中的链接默认指向生产环境，这是主要使用的环境
- ✅ **两个环境都支持**：Supabase 会根据实际请求的来源，自动选择正确的重定向 URL

**保存配置：**
- 点击 **Save changes**（保存更改）按钮保存所有配置

### 2. 实现交互逻辑（已完成）

#### 步骤 2.1: 发送重置密码邮件 ✅
已在 `forgot-password/page.tsx` 中实现：

- 用户输入邮箱
- 点击"Send reset link"按钮
- 调用 `supabase.auth.resetPasswordForEmail()` 发送重置链接
- 显示成功/错误消息

#### 步骤 2.2: 重置密码页面 ✅
已创建 `/app/auth/reset-password/page.tsx`：

**功能：**
- 自动验证重置令牌（从邮件链接）
- 显示重置密码表单
- 验证密码匹配和长度
- 更新密码后跳转到登录页面

**流程：**
1. 用户点击邮件中的重置链接
2. 跳转到 `/auth/reset-password?token=xxx&type=recovery`
3. 页面自动验证令牌并创建 session
4. 用户输入新密码和确认密码
5. 点击"Confirm"按钮
6. 调用 `supabase.auth.updateUser({ password })` 更新密码
7. 显示成功消息："Password reset successfully! Redirecting to login..."
8. 1.5 秒后自动跳转到登录页面：`/?message=Password reset successfully`

#### 步骤 2.3: 处理验证码（可选）
如果你想要使用验证码而不是直接通过邮件链接重置，你需要：

1. **使用 Supabase Edge Functions** 或 **第三方服务**（如 Twilio、SendGrid）发送验证码
2. 在数据库中存储验证码和过期时间
3. 验证用户输入的验证码

示例实现：

```typescript
// 发送验证码
const sendVerificationCode = async (email: string) => {
  // 生成 6 位随机验证码
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  
  // 存储验证码到数据库（需要创建 verification_codes 表）
  const { error } = await supabase
    .from('verification_codes')
    .insert({
      email,
      code,
      expires_at: new Date(Date.now() + 10 * 60 * 1000), // 10 分钟后过期
    });

  if (error) throw error;

  // 发送邮件（使用 Supabase Edge Function 或第三方服务）
  // TODO: 实现邮件发送逻辑
};

// 验证验证码
const verifyCode = async (email: string, code: string) => {
  const { data, error } = await supabase
    .from('verification_codes')
    .select('*')
    .eq('email', email)
    .eq('code', code)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error || !data) {
    throw new Error('Invalid or expired code');
  }

  // 验证成功，可以继续重置密码流程
  return true;
};
```

### 3. Supabase 邮件服务说明

#### 3.1 Supabase 默认邮件服务的特点

**Supabase 默认发送的是链接，不是验证码：**

1. **Reset Password（重置密码）**：
   - Supabase 发送包含重置令牌的链接
   - 用户点击链接后，Supabase 自动验证令牌
   - 不需要手动输入验证码

2. **Confirm Sign Up（确认注册）**：
   - 发送确认链接
   - 用户点击链接完成邮箱验证

3. **Magic Link（魔法链接）**：
   - 发送登录链接
   - 用户点击链接直接登录

#### 3.2 SMTP 服务是什么？

**SMTP（Simple Mail Transfer Protocol）** 是邮件传输协议，用于发送邮件。

在 Supabase Dashboard 中：
- **内置邮件服务**：Supabase 提供的默认邮件服务
  - 有速率限制（不适合生产环境）
  - 免费但功能有限
  - 主要用于开发和测试

- **自定义 SMTP**：配置你自己的邮件服务器
  - 使用第三方邮件服务（如 SendGrid、Mailgun、AWS SES 等）
  - 无速率限制（取决于你的邮件服务商）
  - 适合生产环境
  - 可以自定义邮件内容和样式

#### 3.3 如何实现验证码功能？

**Supabase 默认不支持发送验证码**，如果需要验证码功能，需要自己实现：

**方案 1：使用 Supabase Edge Functions + 第三方邮件服务**

1. 创建 Edge Function 发送验证码邮件
2. 使用 SendGrid、Mailgun 等发送邮件
3. 在数据库中存储验证码

**方案 2：使用 Supabase Edge Functions + 自定义 SMTP**

1. 在 Supabase Dashboard 配置自定义 SMTP
2. 创建 Edge Function 使用 SMTP 发送验证码
3. 在数据库中存储验证码

**方案 3：使用第三方服务（推荐）**

1. 使用 Twilio（短信验证码）或 SendGrid（邮件验证码）
2. 在应用后端调用 API 发送验证码
3. 在数据库中存储验证码

### 4. 数据库表结构（如果使用验证码）

如果需要使用验证码功能，创建以下表：

```sql
-- 创建验证码表
CREATE TABLE verification_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX idx_verification_codes_email ON verification_codes(email);
CREATE INDEX idx_verification_codes_expires ON verification_codes(expires_at);
```

### 5. 两种实现方案对比

#### 方案 A：使用 Supabase 默认重置链接（推荐，简单）

**优点：**
- ✅ 实现简单，无需额外配置
- ✅ Supabase 自动处理令牌验证
- ✅ 安全性高（令牌有时效性）
- ✅ 无需存储验证码

**缺点：**
- ❌ 用户需要点击邮件中的链接
- ❌ 不能直接在页面输入验证码

**实现步骤：**
1. 调用 `supabase.auth.resetPasswordForEmail()`
2. Supabase 自动发送重置链接
3. 用户点击链接，跳转到重置密码页面
4. 自动验证令牌，用户输入新密码

#### 方案 B：使用验证码（需要自定义实现）

**优点：**
- ✅ 用户体验更好（直接在页面输入验证码）
- ✅ 不需要跳转到邮件

**缺点：**
- ❌ 需要自己实现发送验证码逻辑
- ❌ 需要配置 SMTP 或使用第三方服务
- ❌ 需要存储和管理验证码
- ❌ 实现复杂度更高

**实现步骤：**
1. 生成 6 位随机验证码
2. 存储到数据库（设置过期时间）
3. 使用 Edge Function 或第三方服务发送邮件
4. 用户输入验证码，验证后进入重置密码页面

### 4. 环境变量配置

确保在 `.env.local` 中配置了 Supabase 相关变量：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. 完整用户流程测试

#### 测试步骤 1：发送重置链接
1. 访问 `/forgot-password` 页面
2. 输入已注册的邮箱地址
3. 点击"Send reset link"按钮
4. 应该看到成功消息："Password reset email sent! Please check your inbox and click the link to reset your password."
5. 检查邮箱，应该收到来自 Supabase 的重置密码邮件

#### 测试步骤 2：重置密码
1. 打开邮箱中的重置密码邮件
2. 点击邮件中的重置链接
3. 应该自动跳转到 `/auth/reset-password` 页面
4. 页面应该显示步骤 2（Change password）为激活状态
5. 输入新密码（至少 6 个字符）
6. 输入确认密码（必须与新密码一致）
7. 点击"Confirm"按钮
8. 应该看到成功消息："Password reset successfully! Redirecting to login..."
9. 1.5 秒后自动跳转到登录页面（`/`）
10. 使用新密码登录，确认可以正常登录

#### 错误情况测试
1. **无效的重置链接**：
   - 使用过期或无效的链接
   - 应该显示错误消息："Invalid or expired reset link. Please request a new one."
   - 提供"Request New Reset Link"按钮

2. **密码不匹配**：
   - 输入不同的新密码和确认密码
   - 应该显示错误："Passwords do not match"

3. **密码太短**：
   - 输入少于 6 个字符的密码
   - 应该显示错误："Password must be at least 6 characters"

## 实现状态

1. ✅ 静态页面已完成
2. ✅ 实现发送重置密码邮件功能
3. ✅ 创建重置密码回调页面
4. ✅ 添加错误处理和用户反馈
5. ⏳ 配置 Supabase Dashboard（重定向 URL）
6. ⏳ 测试完整流程

## 重要配置检查清单

在测试之前，请确保：

- [ ] 在 Supabase Dashboard 中配置了重定向 URL：`/auth/reset-password`
- [ ] 在 Supabase Dashboard 中设置了 Site URL
- [ ] 检查了邮件模板（可选，可以自定义邮件内容）
- [ ] 测试了发送重置链接功能
- [ ] 测试了点击邮件链接跳转功能
- [ ] 测试了重置密码功能
- [ ] 测试了跳转到登录页面功能

## 注意事项

- Supabase 的 `resetPasswordForEmail` 会自动发送包含重置令牌的邮件
- 重置令牌在邮件链接中，用户点击后会自动验证
- 如果使用验证码，需要自己实现发送和验证逻辑
- 确保在生产环境中配置正确的重定向 URL
- 考虑添加速率限制以防止滥用

