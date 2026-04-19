/**
 * 自定义测试报告生成器
 * 
 * 功能：
 * 1. 收集测试结果数据
 * 2. 生成结构化 result.json  
 * 3. 生成可视化 HTML 报告
 * 
 * 使用方式：
 * 方式1: 在 playwright.config.ts 中配置
 *   reporter: [['./my-custom-reporter.ts']]
 * 方式2: 手动运行脚本
 *   npx ts-node my-custom-reporter.ts
 */

import * as fs from 'fs';
import * as path from 'path';

interface TestStepData {
  title: string;
  category: string;
  startTime: number;
  duration: number;
}

interface AttachmentData {
  name: string;
  path: string;
  contentType: string;
}

interface TestError {
  message: string;
  stack: string;
}

interface TestResult {
  status: 'passed' | 'failed' | 'skipped' | 'interrupted';
  errors: TestError[];
  attachments: AttachmentData[];
  steps: TestStepData[];
  duration: number;
}

interface TestInfo {
  title: string;
  file: string;
  line: number;
  result: TestResult;
}

interface ReporterStats {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  interrupted: number;
}

// 读取 Playwright 生成的 JSON 结果
function generateCustomReport() {
  const resultsDir = 'playwright-report';
  const outputDir = 'my-custom-report';
  
  // 确保输出目录存在
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 读取 Playwright 结果
  const resultsFile = path.join(resultsDir, 'results.json');
  if (!fs.existsSync(resultsFile)) {
    console.log('未找到 Playwright 结果文件');
    return;
  }

  const pwResults = JSON.parse(fs.readFileSync(resultsFile, 'utf-8'));
  
  // 提取测试数据
  const testInfos: TestInfo[] = [];
  let stats: ReporterStats = {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    interrupted: 0,
  };

  // 解析结果
  for (const file of pwResults.files || []) {
    for (const test of file.tests || []) {
      for (const result of test.results || []) {
        const status = result.status || 'unknown';
        
        testInfos.push({
          title: test.title,
          file: file.file,
          line: test.location?.line || 0,
          result: {
            status,
            errors: (result.errors || []).map((e: any) => ({
              message: e.message,
              stack: e.stack,
            })),
            attachments: (result.attachments || []).map((a: any) => ({
              name: a.name,
              path: a.path,
              contentType: a.contentType,
            })),
            steps: (result.steps || []).map((s: any) => ({
              title: s.title,
              category: s.category,
              startTime: s.startTime,
              duration: s.duration,
            })),
            duration: result.duration,
          },
        });

        stats.total++;
        switch (status) {
          case 'passed': stats.passed++; break;
          case 'failed': stats.failed++; break;
          case 'skipped': stats.skipped++; break;
          case 'interrupted': stats.interrupted++; break;
        }
      }
    }
  }

  const startTime = pwResults.metadata?.startTime || new Date().toISOString();
  const endTime = pwResults.metadata?.endTime || new Date().toISOString();
  const duration = pwResults.statistics?.duration || 0;

  // 生成 result.json
  const resultData = {
    stats,
    startTime,
    endTime,
    duration,
    tests: testInfos,
  };

  fs.writeFileSync(
    path.join(outputDir, 'result.json'),
    JSON.stringify(resultData, null, 2)
  );
  console.log(`✓ 测试结果已生成: ${outputDir}/result.json`);

  // 生成 HTML 报告
  const html = generateHTMLReport(resultData);
  fs.writeFileSync(path.join(outputDir, 'index.html'), html);
  console.log(`✓ HTML报告已生成: ${outputDir}/index.html`);
  console.log(`\n📊 报告位置: ${outputDir}/index.html`);
}

function generateHTMLReport(data: any): string {
  const { stats, tests, startTime, endTime } = data;
  
  // 生成测试行
  const testRows = tests.map((test: TestInfo, index: number) => {
    const statusClass = test.result.status;
    const statusText = statusClass === 'passed' ? '✓ 通过' : statusClass === 'failed' ? '✕ 失败' : '○ 跳过';
    
    const errorHtml = test.result.errors?.length > 0 ? `
      <div class="error-details">
        <div class="error-message">${escapeHtml(test.result.errors[0].message)}</div>
      </div>
    ` : '';

    const stepsHtml = test.result.steps?.length > 0 ? test.result.steps.map((step: TestStepData) => `
      <div class="step-item">
        <span class="step-title">${escapeHtml(step.title)}</span>
        <span class="step-duration">${formatDuration(step.duration)}</span>
      </div>
    `).join('') : '';

    return `
      <tr class="${statusClass}" data-index="${index}">
        <td>
          <div class="test-title">${escapeHtml(test.title)}</div>
          <div class="test-file">${escapeHtml(test.file)}:${test.line}</div>
          ${errorHtml}
        </td>
        <td><span class="status-badge ${statusClass}">${statusText}</span></td>
        <td><span class="test-duration">${formatDuration(test.result.duration)}</span></td>
        <td>
          ${test.result.steps?.length > 0 ? `<button class="expand-btn" onclick="toggleSteps(${index})">详情</button>` : '-'}
        </td>
      </tr>
      <tr class="steps-row" id="steps-${index}" style="display:none;">
        <td colspan="4" class="steps-container">
          ${stepsHtml || '<div class="empty-steps">无步骤记录</div>'}
        </td>
      </tr>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>测试报告 - MyCustomReporter</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f7fa; color: #333; }
    .container { max-width: 1400px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px; margin-bottom: 24px; }
    .header h1 { font-size: 28px; margin-bottom: 8px; }
    .header-time { opacity: 0.9; font-size: 14px; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .stat-card { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .stat-card.total { border-left: 4px solid #667eea; }
    .stat-card.passed { border-left: 4px solid #22c55e; }
    .stat-card.failed { border-left: 4px solid #ef4444; }
    .stat-card.skipped { border-left: 4px solid #f59e0b; }
    .stat-value { font-size: 32px; font-weight: bold; }
    .stat-label { font-size: 14px; color: #666; margin-top: 4px; }
    .stat-card.passed .stat-value { color: #22c55e; }
    .stat-card.failed .stat-value { color: #ef4444; }
    .stat-card.skipped .stat-value { color: #f59e0b; }
    .filter-bar { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
    .filter-btn { padding: 8px 16px; border: none; background: white; border-radius: 6px; cursor: pointer; font-size: 14px; }
    .filter-btn:hover { background: #f0f0f0; }
    .filter-btn.active { background: #667eea; color: white; }
    .test-table { background: white; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); overflow: hidden; }
    .table { width: 100%; border-collapse: collapse; }
    .table th { background: #f8fafc; padding: 14px 16px; text-align: left; font-weight: 600; font-size: 13px; color: #666; border-bottom: 1px solid #e5e7eb; }
    .table td { padding: 14px 16px; border-bottom: 1px solid #f0f0f0; vertical-align: top; }
    .table tr:hover { background: #f9fafb; }
    .table tr.failed { background: #fef2f2; }
    .table tr.passed { background: #f0fdf4; }
    .status-badge { display: inline-flex; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 500; }
    .status-badge.passed { background: #dcfce7; color: #166534; }
    .status-badge.failed { background: #fee2e2; color: #991b1b; }
    .status-badge.skipped { background: #fef3c7; color: #92400e; }
    .test-title { font-weight: 500; color: #1f2937; }
    .test-file { font-size: 12px; color: #9ca3af; margin-top: 4px; }
    .test-duration { font-size: 13px; color: #6b7280; }
    .expand-btn { background: none; border: none; color: #667eea; cursor: pointer; font-size: 13px; }
    .expand-btn:hover { text-decoration: underline; }
    .steps-container { padding: 16px; background: #f8fafc; }
    .step-item { padding: 8px 12px; margin: 4px 0; background: white; border-radius: 6px; border-left: 3px solid #22c55e; }
    .step-title { font-size: 13px; }
    .step-duration { font-size: 12px; color: #9ca3af; margin-left: 8px; }
    .error-details { padding: 12px; background: #fee2e2; border-radius: 6px; margin-top: 8px; font-size: 13px; color: #991b1b; }
    .empty-steps { color: #9ca3af; font-size: 13px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🧪 测试报告</h1>
      <div class="header-time">开始: ${startTime} | 结束: ${endTime}</div>
    </div>
    <div class="stats-grid">
      <div class="stat-card total"><div class="stat-value">${stats.total}</div><div class="stat-label">总用例</div></div>
      <div class="stat-card passed"><div class="stat-value">${stats.passed}</div><div class="stat-label">通过</div></div>
      <div class="stat-card failed"><div class="stat-value">${stats.failed}</div><div class="stat-label">失败</div></div>
      <div class="stat-card skipped"><div class="stat-value">${stats.skipped}</div><div class="stat-label">跳过</div></div>
    </div>
    <div class="filter-bar">
      <button class="filter-btn active" onclick="filterTests('all', this)">全部 (${stats.total})</button>
      <button class="filter-btn" onclick="filterTests('passed', this)">通过 (${stats.passed})</button>
      <button class="filter-btn" onclick="filterTests('failed', this)">失败 (${stats.failed})</button>
      <button class="filter-btn" onclick="filterTests('skipped', this)">跳过 (${stats.skipped})</button>
    </div>
    <div class="test-table">
      <table class="table">
        <thead>
          <tr><th style="width:60%">测试用例</th><th style="width:15%">状态</th><th style="width:15%">耗时</th><th style="width:10%">详情</th></tr>
        </thead>
        <tbody id="test-table-body">${testRows}</tbody>
      </table>
    </div>
  </div>
  <script>
    function toggleSteps(index) {
      const row = document.getElementById('steps-' + index);
      row.style.display = row.style.display === 'none' ? 'table-row' : 'none';
    }
    function filterTests(status, btn) {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const rows = document.querySelectorAll('#test-table-body tr');
      rows.forEach(row => {
        if (row.classList.contains('steps-row')) return;
        row.style.display = status === 'all' || row.classList.contains(status) ? 'table-row' : 'none';
      });
    }
  </script>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text?.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') || '';
}

function formatDuration(ms: number): string {
  if (ms < 1000) return ms + 'ms';
  return (ms / 1000).toFixed(1) + 's';
}

// 运行
generateCustomReport();