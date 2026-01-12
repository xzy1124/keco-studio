/**
 * 测试已部署的 warmup 端点
 * 在设置 Cron-job.org 之前验证线上端点是否正常
 * 
 * 运行方式: npx tsx scripts/test-warmup-deployed.ts https://your-domain.vercel.app
 */

async function testDeployedWarmup() {
  const deployUrl = process.argv[2];

  if (!deployUrl) {
    console.error('❌ 错误: 请提供部署的 URL');
    console.error('\n使用方式:');
    console.error('  npx tsx scripts/test-warmup-deployed.ts https://your-domain.vercel.app');
    console.error('\n例如:');
    console.error('  npx tsx scripts/test-warmup-deployed.ts https://keco-release.vercel.app');
    process.exit(1);
  }

  // 移除末尾的斜杠
  const baseUrl = deployUrl.replace(/\/$/, '');

  console.log('🧪 测试已部署的 Warmup 端点\n');
  console.log(`🌐 目标 URL: ${baseUrl}\n`);

  try {
    // 测试 1: Health Check
    console.log('📋 测试 1: 健康检查端点');
    const healthStart = Date.now();
    const healthResponse = await fetch(`${baseUrl}/api/health`);
    const healthDuration = Date.now() - healthStart;
    const healthData = await healthResponse.json();

    console.log(`   ⏱️  耗时: ${healthDuration}ms`);
    console.log(`   📊 状态: ${healthResponse.status}`);
    console.log(`   📦 响应: ${JSON.stringify(healthData, null, 2)}`);

    if (healthResponse.ok) {
      console.log('   ✅ 健康检查通过\n');
    } else {
      console.log('   ❌ 健康检查失败\n');
      process.exit(1);
    }

    // 测试 2: Warmup 端点（不带认证）
    console.log('📋 测试 2: Warmup 端点（无认证）');
    const warmupStart = Date.now();
    const warmupResponse = await fetch(`${baseUrl}/api/warmup`);
    const warmupDuration = Date.now() - warmupStart;
    const warmupData = await warmupResponse.json();

    console.log(`   ⏱️  耗时: ${warmupDuration}ms`);
    console.log(`   📊 状态: ${warmupResponse.status}`);
    console.log(`   📦 响应: ${JSON.stringify(warmupData, null, 2)}`);

    if (warmupResponse.ok && warmupData.status === 'warmed') {
      console.log('   ✅ Warmup 端点工作正常\n');

      if (warmupDuration > 5000) {
        console.log('   ⚠️  首次请求较慢，这正是我们要解决的问题！');
        console.log('   设置定时 warmup 后会改善\n');
      }
    } else if (warmupResponse.status === 401) {
      console.log('   ⚠️  端点需要认证（已设置 CRON_SECRET）');
      console.log('   这是正常的，Cron-job.org 需要配置 Authorization header\n');
    } else {
      console.log('   ❌ Warmup 端点异常\n');
    }

    // 测试 3: 模拟冷启动后的 warmup
    console.log('📋 测试 3: 再次测试 Warmup（模拟定时任务）');
    await new Promise(resolve => setTimeout(resolve, 1000)); // 等待 1 秒
    
    const warmup2Start = Date.now();
    const warmup2Response = await fetch(`${baseUrl}/api/warmup`);
    const warmup2Duration = Date.now() - warmup2Start;
    const warmup2Data = await warmup2Response.json();

    console.log(`   ⏱️  耗时: ${warmup2Duration}ms`);
    console.log(`   📊 状态: ${warmup2Response.status}`);

    if (warmup2Response.ok && warmup2Data.status === 'warmed') {
      console.log('   ✅ 连续请求正常\n');

      if (warmup2Duration < warmupDuration) {
        console.log(`   🚀 第二次请求更快了！(${warmupDuration}ms → ${warmup2Duration}ms)`);
        console.log('   这证明 warmup 策略会有效\n');
      }
    }

    // 总结
    console.log('═══════════════════════════════════════════');
    console.log('✅ 测试完成！所有端点工作正常');
    console.log('═══════════════════════════════════════════\n');

    console.log('📋 下一步: 设置 Cron-job.org');
    console.log('   1. 访问 https://cron-job.org/');
    console.log('   2. 注册免费账号');
    console.log('   3. 创建 Cronjob:');
    console.log(`      - URL: ${baseUrl}/api/warmup`);
    console.log('      - 频率: Every 5 minutes');
    console.log('   4. （可选）如果设置了 CRON_SECRET，添加 Header:');
    console.log('      - Authorization: Bearer YOUR_SECRET\n');

    console.log('📖 详细步骤请查看: docs/QUICK_START_WARMUP.md\n');

  } catch (error) {
    console.error('\n❌ 测试失败!');
    console.error('错误信息:', error instanceof Error ? error.message : error);
    console.error('\n🔍 可能的原因:');
    console.error('   1. URL 不正确或应用未部署');
    console.error('   2. 网络连接问题');
    console.error('   3. Vercel 部署失败');
    console.error('\n💡 建议:');
    console.error('   1. 检查 URL 是否正确');
    console.error('   2. 访问浏览器检查网站是否可访问');
    console.error('   3. 查看 Vercel 部署日志');
    process.exit(1);
  }
}

// 运行测试
testDeployedWarmup();

