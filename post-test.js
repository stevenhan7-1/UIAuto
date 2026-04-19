/**
 * 测试后处理脚本
 * 在 Playwright 测试完成后自动调用，生成自定义报告
 * 
 * 使用方式：
 * 1. 手动: node post-test.js
 * 2. 自动: 在 package.json 中配置 "posttest": "node post-test.js"
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('='.repeat(50));
console.log('🎯 开始生成自定义测试报告...');
console.log('='.repeat(50));

try {
  // 调用 generate-report.js
  execSync('node ' + path.join(__dirname, 'generate-report.js'), {
    cwd: __dirname,
    stdio: 'inherit',
    shell: true
  });
  
  console.log('\n✅ 测试报告生成完成!');
} catch (e) {
  console.error('\n❌ 生成报告失败:', e.message);
  process.exit(1);
}