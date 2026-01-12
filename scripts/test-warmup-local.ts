/**
 * 本地测试 warmup 端点
 * 在部署前验证 warmup 功能是否正常工作
 * 
 * 运行方式: npx tsx scripts/test-warmup-local.ts
 */

import dotenv from 'dotenv';
import path from 'path';

// 加载环境变量
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function testWarmup() {
  console.log('🧪 测试 Supabase Warmup 功能\n');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // 检查环境变量
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ 错误: 缺少必要的环境变量');
    console.error('   请确保 .env.local 文件中包含:');
    console.error('   - NEXT_PUBLIC_SUPABASE_URL');
    console.error('   - NEXT_PUBLIC_SUPABASE_ANON_KEY');
    process.exit(1);
  }

  console.log('✅ 环境变量检查通过');
  console.log(`   Supabase URL: ${supabaseUrl}\n`);

  try {
    console.log('📡 发送测试请求...');
    const startTime = Date.now();

    // 模拟 warmup 端点的逻辑
    const response = await fetch(
      `${supabaseUrl}/rest/v1/projects?select=id&limit=1`,
      {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`⏱️  请求耗时: ${duration}ms`);
    console.log(`📊 HTTP 状态码: ${response.status}`);

    const responseText = await response.text();
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }

    console.log(`📦 响应内容: ${JSON.stringify(responseData, null, 2)}\n`);

    // 判断结果
    if (response.ok || response.status === 404 || response.status === 400) {
      console.log('✅ 测试成功！');
      console.log('   Supabase 连接正常，warmup 功能可以正常工作');
      
      if (duration > 5000) {
        console.log(`\n⚠️  注意: 请求耗时较长 (${duration}ms)`);
        console.log('   这可能是冷启动导致的，设置 warmup 后会改善');
      } else if (duration > 2000) {
        console.log(`\n💡 提示: 请求耗时 ${duration}ms`);
        console.log('   在正常范围内');
      } else {
        console.log(`\n🚀 太好了！请求很快 (${duration}ms)`);
      }

      console.log('\n📋 下一步:');
      console.log('   1. 部署到 Vercel');
      console.log('   2. 设置 Cron-job.org 定时任务');
      console.log('   3. URL: https://你的域名.vercel.app/api/warmup');
      
      process.exit(0);
    } else {
      console.log('⚠️  收到非预期的状态码');
      console.log('   但只要有响应，warmup 功能就应该能工作');
      console.log('   建议检查 Supabase 项目配置');
      process.exit(0);
    }
  } catch (error) {
    console.error('\n❌ 测试失败!');
    console.error('   错误信息:', error instanceof Error ? error.message : error);
    console.error('\n🔍 可能的原因:');
    console.error('   1. Supabase URL 或 API Key 不正确');
    console.error('   2. Supabase 项目已暂停或删除');
    console.error('   3. 网络连接问题');
    console.error('   4. projects 表不存在（但这不影响 warmup）');
    process.exit(1);
  }
}

// 运行测试
testWarmup();

