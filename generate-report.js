const fs = require('fs');
const path = require('path');

// 生成日期文件夹名
const now = new Date();
const timestamp = now.getFullYear().toString() +
  String(now.getMonth() + 1).padStart(2, '0') +
  String(now.getDate()).padStart(2, '0') + '-' +
  String(now.getHours()).padStart(2, '0') +
  String(now.getMinutes()).padStart(2, '0') +
  String(now.getSeconds()).padStart(2, '0');

const resultsDir = 'playwright-report';
const outputDir = path.join('my-custom-report', timestamp);

// 创建带时间戳的输出目录
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const resultsFile = path.join(resultsDir, 'results.json');
if (!fs.existsSync(resultsFile)) {
  console.log('未找到 Playwright 结果文件');
  process.exit(1);
}

const pwResults = JSON.parse(fs.readFileSync(resultsFile, 'utf-8'));

const testInfos = [];
let stats = { total: 0, passed: 0, failed: 0, skipped: 0, interrupted: 0 };

// 解析 suites 结构（Playwright JSON 格式）
for (const suite of pwResults.suites || []) {
  for (const spec of suite.specs || []) {
    for (const test of spec.tests || []) {
      for (const result of test.results || []) {
        const status = result.status || 'unknown';
        testInfos.push({
          title: test.title,
          file: spec.file,
          line: test.location?.line || 0,
          result: {
            status,
            errors: (result.errors || []).map(e => ({ message: e.message, stack: e.stack })),
            // 从 stdout 提取步骤
            steps: (result.stdout || []).map(s => ({ title: s.text, category: 'log', duration: 0 })),
            duration: result.duration,
          },
        });
        stats.total++;
        if (status === 'passed') stats.passed++;
        else if (status === 'failed') stats.failed++;
        else if (status === 'skipped') stats.skipped++;
        else if (status === 'interrupted') stats.interrupted++;
      }
    }
  }
}

const startTime = pwResults.stats?.startTime || pwResults.metadata?.startTime || new Date().toISOString();
const endTime = pwResults.stats?.duration ? new Date(new Date(startTime).getTime() + pwResults.stats.duration * 1000).toISOString() : new Date().toISOString();

// Save JSON
fs.writeFileSync(path.join(outputDir, 'result.json'), JSON.stringify({ stats, startTime, endTime, tests: testInfos }, null, 2));
console.log('✓ Result JSON saved: ' + outputDir + '/result.json');

// Generate HTML
const testRows = testInfos.map((test, index) => {
  const sc = test.result.status;
  const st = sc === 'passed' ? '✓ 通过' : sc === 'failed' ? '✕ 失败' : '○ 跳过';
  const err = test.result.errors?.length > 0 ? '<div class="error-details"><div class="error-message">' + (test.result.errors[0].message || '').substring(0, 200) + '</div></div>' : '';
  const steps = test.result.steps?.map(s => '<div class="step-item"><span class="step-title">' + (s.title || '') + '</span><span class="step-duration">' + (s.duration < 1000 ? s.duration + 'ms' : (s.duration/1000).toFixed(1) + 's') + '</span></div>').join('') || '';
  return '<tr class="' + sc + '"><td><div class="test-title">' + (test.title || '') + '</div><div class="test-file">' + (test.file || '') + ':' + test.line + '</div>' + err + '</td><td><span class="status-badge ' + sc + '">' + st + '</span></td><td><span class="test-duration">' + (test.result.duration < 1000 ? test.result.duration + 'ms' : (test.result.duration/1000).toFixed(1) + 's') + '</span></td><td>' + (test.result.steps?.length > 0 ? '<button class="expand-btn" onclick="toggleSteps(' + index + ')">详情</button>' : '-') + '</td></tr><tr class="steps-row" id="steps-' + index + '" style="display:none;"><td colspan="4" class="steps-container">' + (steps || '<div class="empty-steps">无步骤记录</div>') + '</td></tr>';
}).join('');

const html = '<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>测试报告 - MyCustomReporter</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:#f5f7fa;color:#333}.container{max-width:1400px;margin:0 auto;padding:20px}.header{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#fff;padding:30px;border-radius:12px;margin-bottom:24px}.header h1{font-size:28px;margin-bottom:8px}.header-time{opacity:0.9;font-size:14px}.stats-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px;margin-bottom:24px}.stat-card{background:#fff;padding:20px;border-radius:10px;box-shadow:0 2px 8px rgba(0,0,0,0.08)}.stat-card.total{border-left:4px solid #667eea}.stat-card.passed{border-left:4px solid #22c55e}.stat-card.failed{border-left:4px solid #ef4444}.stat-card.skipped{border-left:4px solid #f59e0b}.stat-value{font-size:32px;font-weight:bold}.stat-label{font-size:14px;color:#666;margin-top:4px}.stat-card.passed .stat-value{color:#22c55e}.stat-card.failed .stat-value{color:#ef4444}.stat-card.skipped .stat-value{color:#f59e0b}.filter-bar{display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap}.filter-btn{padding:8px 16px;border:none;background:#fff;border-radius:6px;cursor:pointer;font-size:14px}.filter-btn:hover{background:#f0f0f0}.filter-btn.active{background:#667eea;color:#fff}.test-table{background:#fff;border-radius:10px;box-shadow:0 2px 8px rgba(0,0,0,0.08)}.table{width:100%;border-collapse:collapse}.table th{background:#f8fafc;padding:14px 16px;text-align:left;font-weight:600;font-size:13px;color:#666;border-bottom:1px solid #e5e7eb}.table td{padding:14px 16px;border-bottom:1px solid #f0f0f0;vertical-align:top}.table tr:hover{background:#f9fafb}.table tr.failed{background:#fef2f2}.table tr.passed{background:#f0fdf4}.status-badge{display:inline-flex;padding:4px 10px;border-radius:20px;font-size:12px;font-weight:500}.status-badge.passed{background:#dcfce7;color:#166534}.status-badge.failed{background:#fee2e2;color:#991b1b}.status-badge.skipped{background:#fef3c7;color:#92400e}.test-title{font-weight:500;color:#1f2937}.test-file{font-size:12px;color:#9ca3af;margin-top:4px}.test-duration{font-size:13px;color:#6b7280}.expand-btn{background:none;border:none;color:#667eea;cursor:pointer;font-size:13px}.steps-container{padding:16px;background:#f8fafc}.step-item{padding:8px 12px;margin:4px 0;background:#fff;border-radius:6px;border-left:3px solid #22c55e}.step-title{font-size:13px}.step-duration{font-size:12px;color:#9ca3af;margin-left:8px}.error-details{padding:12px;background:#fee2e2;border-radius:6px;margin-top:8px;font-size:13px;color:#991b1b}.empty-steps{color:#9ca3af;font-size:13px}</style></head><body><div class="container"><div class="header"><h1>🧪 测试报告</h1><div class="header-time">开始: ' + startTime + ' | 结束: ' + endTime + '</div></div><div class="stats-grid"><div class="stat-card total"><div class="stat-value">' + stats.total + '</div><div class="stat-label">总用例</div></div><div class="stat-card passed"><div class="stat-value">' + stats.passed + '</div><div class="stat-label">通过</div></div><div class="stat-card failed"><div class="stat-value">' + stats.failed + '</div><div class="stat-label">失败</div></div><div class="stat-card skipped"><div class="stat-value">' + stats.skipped + '</div><div class="stat-label">跳过</div></div></div><div class="filter-bar"><button class="filter-btn active" onclick="filterTests(\'all\',this)">全部 (' + stats.total + ')</button><button class="filter-btn" onclick="filterTests(\'passed\',this)">通过 (' + stats.passed + ')</button><button class="filter-btn" onclick="filterTests(\'failed\',this)">失败 (' + stats.failed + ')</button><button class="filter-btn" onclick="filterTests(\'skipped\',this)">跳过 (' + stats.skipped + ')</button></div><div class="test-table"><table class="table"><thead><tr><th style="width:60%">测试用例</th><th style="width:15%">状态</th><th style="width:15%">耗时</th><th style="width:10%">详情</th></tr></thead><tbody id="test-table-body">' + testRows + '</tbody></table></div></div><script>function toggleSteps(index){var row=document.getElementById("steps-"+index);row.style.display=row.style.display==="none"?"table-row":"none"}function filterTests(status,btn){document.querySelectorAll(".filter-btn").forEach(function(b){b.classList.remove("active")});btn.classList.add("active");document.querySelectorAll("#test-table-body tr").forEach(function(row){if(row.classList.contains("steps-row"))return;row.style.display=status==="all"||row.classList.contains(status)?"table-row":"none"})}</script></body></html>';

fs.writeFileSync(path.join(outputDir, 'index.html'), html);
console.log('✓ HTML report saved: ' + path.join(outputDir, 'index.html'));

// 复制最新的截图到报告目录
const snapshotsDir = 'tests/snapshots';
if (fs.existsSync(snapshotsDir)) {
  const files = fs.readdirSync(snapshotsDir).filter(f => f.endsWith('.png')).sort().reverse();
  if (files.length > 0) {
    const latestScreenshot = files[0];
    const srcPath = path.join(snapshotsDir, latestScreenshot);
    const destPath = path.join(outputDir, 'screenshot.png');
    fs.copyFileSync(srcPath, destPath);
    console.log('✓ Screenshot copied: ' + path.join(outputDir, 'screenshot.png'));
  }
}

console.log('\n📊 报告位置: ' + outputDir);
console.log('   - result.json');
console.log('   - index.html');
console.log('   - screenshot.png');
