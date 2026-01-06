# 忘记密码功能实现指南

## 静态页面已完成

忘记密码页面已创建在 `/app/forgot-password/page.tsx`，包含以下功能：
- ✅ 返回按钮（使用 ForgetPasswordIcon1.svg）
- ✅ 标题 "Forgot Your Password"
- ✅ 两步流程指示器（① Verify 和 ② Change password）
- ✅ Email/Username 输入框
- ✅ Code 输入框
- ✅ "Verify code" 按钮
- ✅ "Resend code" 链接
- ✅ 右侧背景图片（与登录页一致）

## Supabase 配置步骤

### 1. 在 Supabase Dashboard 中配置邮箱验证

#### 步骤 1.1: 启用邮箱验证功能
1. 登录 [Supabase Dashboard](https://app.supabase.com)
2. 选择你的项目
3. 进入 **Authentication** > **Settings**
4. 在 **Email Auth** 部分，确保以下设置已启用：
   - ✅ Enable email confirmations
   - ✅ Enable email change confirmations

#### 步骤 1.2: 配置邮箱模板
1. 进入 **Authentication** > **Email Templates**
2. 找到 **Reset Password** 模板
3. 配置重置密码邮件模板：
   - **Subject**: `Reset Your Password`
   - **Body**: 可以自定义，但必须包含 `{{ .ConfirmationURL }}` 作为重置链接

#### 步骤 1.3: 配置重定向 URL
1. 进入 **Authentication** > **URL Configuration**
2. 在 **Redirect URLs** 中添加：
   - `http://localhost:3000/auth/reset-password` (开发环境)
   - `https://yourdomain.com/auth/reset-password` (生产环境)
3. 在 **Site URL** 中设置你的应用基础 URL

### 2. 实现交互逻辑

#### 步骤 2.1: 发送重置密码邮件
在 `forgot-password/page.tsx` 中实现发送重置密码邮件：

```typescript
import { useSupabase } from '@/lib/SupabaseContext';

const handleSendResetEmail = async (email: string) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    
    if (error) throw error;
    
    // 显示成功消息
    setMessage('Password reset email sent! Please check your inbox.');
  } catch (error: any) {
    setErrorMsg(error?.message || 'Failed to send reset email');
  }
};
```

#### 步骤 2.2: 验证重置令牌
当用户点击邮件中的链接时，Supabase 会自动处理令牌验证。你需要创建一个回调页面：

创建 `/app/auth/reset-password/page.tsx`：

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useSupabase } from '@/lib/SupabaseContext';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ResetPasswordPage() {
  const supabase = useSupabase();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 检查是否有有效的重置令牌
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/forgot-password');
      }
    };
    checkSession();
  }, [supabase, router]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      // 密码重置成功，重定向到登录页
      router.push('/?message=Password reset successfully');
    } catch (error: any) {
      setError(error?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* 实现重置密码表单 */}
    </div>
  );
}
```

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

### 3. 数据库表结构（如果使用验证码）

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

### 4. 环境变量配置

确保在 `.env.local` 中配置了 Supabase 相关变量：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. 测试流程

1. **测试发送重置邮件**：
   - 在忘记密码页面输入邮箱
   - 点击发送按钮
   - 检查邮箱是否收到重置链接

2. **测试重置密码**：
   - 点击邮件中的重置链接
   - 输入新密码
   - 确认密码重置成功

3. **测试验证码（如果实现）**：
   - 输入邮箱，接收验证码
   - 输入验证码进行验证
   - 验证成功后进入密码重置页面

## 下一步

1. ✅ 静态页面已完成
2. ⏳ 实现发送重置密码邮件功能
3. ⏳ 创建重置密码回调页面
4. ⏳ 实现验证码功能（可选）
5. ⏳ 添加错误处理和用户反馈
6. ⏳ 测试完整流程

## 注意事项

- Supabase 的 `resetPasswordForEmail` 会自动发送包含重置令牌的邮件
- 重置令牌在邮件链接中，用户点击后会自动验证
- 如果使用验证码，需要自己实现发送和验证逻辑
- 确保在生产环境中配置正确的重定向 URL
- 考虑添加速率限制以防止滥用

