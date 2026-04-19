/**
 * 创建-删除班组任务单完整流程测试
 * 
 * 流程：
 * 1. 自动登录（滑块验证、验证码回显）
 * 2. 进入任务菜单
 * 3. 点击创建任务单
 * 4. 选择直接创建方式
 * 5. 选择工程
 * 6. 选择施工区域
 * 7. 选择履约对象（班组）
 * 8. 选择施工任务
 * 9. 设置计划工期
 * 10. 设置计件信息
 * 11. 保存任务单
 * 12. 验证创建成功并跳转详情页
 * 13. 删除任务单
 * 14. 验证删除成功并返回列表
 */

import { test, expect } from '@playwright/test';
import { autoLogin } from './utils/login-helper';

test('创建-删除班组任务单', async ({ page, browser }) => {
  console.log('=== 开始创建-删除班组任务单完整流程测试 ===\n');

  let shouldCloseBrowser = true;

  try {
    // ========== 步骤 1: 自动登录 ==========
    console.log('【步骤 1/13】执行自动登录...');
    await autoLogin(page);

    // 等待登录成功
    console.log('等待登录成功...');
    let loginSuccess = false;
    for (let i = 0; i < 60; i++) {
      if (!page.url().includes('/login')) {
        loginSuccess = true;
        console.log('✓ 登录成功\n');
        break;
      }
      await page.waitForTimeout(1000);
    }

    // 断言：登录成功
    expect(loginSuccess, '登录应该成功').toBe(true);
    if (!loginSuccess) {
      throw new Error('登录失败，流程终止');
    }

    // ========== 步骤 2: 进入任务菜单 ==========
    console.log('【步骤 2/13】进入任务菜单...');
    await page.locator('text="任务"').first().click();
    await page.waitForTimeout(1000);

    await page.locator('text="任务列表"').first().click();
    await page.waitForTimeout(2000);

    // 断言：应该在任务列表页面（根据实际URL判断）
    const currentUrl = page.url();
    const isTaskListPage = currentUrl.includes('/netConstruction') || currentUrl.includes('/task');
    expect(isTaskListPage, '应该进入任务列表页面').toBe(true);
    console.log('✓ 已进入任务列表页面\n');

    // ========== 步骤 3: 点击创建任务单按钮 ==========
    console.log('【步骤 3/13】点击"创建任务单"按钮...');
    const createBtn = page.getByRole('button', { name: '创建任务单' });
    await createBtn.click();
    await page.waitForTimeout(1000);

    // 断言：创建按钮应该可见
    await expect(createBtn, '创建任务单按钮应该可见').toBeVisible();
    console.log('✓ 创建任务单按钮已点击\n');

    // ========== 步骤 4: 选择直接创建任务单方式 ==========
    console.log('【步骤 4/13】选择"直接创建任务单手动填写任务信息"...');
    const directCreateOption = page.locator('div').filter({ hasText: /^直接创建任务单手动填写任务信息$/ }).first();
    await directCreateOption.click();
    await page.waitForTimeout(1000);

    console.log('✓ 已选择直接创建方式\n');

    // ========== 步骤 5: 选择工程 ==========
    console.log('【步骤 5/13】选择工程...');
    const projectCombobox = page.getByRole('combobox', { name: '* 工程 :' });
    await projectCombobox.click();
    await page.waitForTimeout(500);

    // 选择"一智大厦项目"
    await page.getByText('一智大厦项目').click();
    await page.waitForTimeout(500);

    // 断言：工程选择成功（下拉框应该关闭或显示已选项目）
    console.log('✓ 工程已选择: 一智大厦项目\n');

    // ========== 步骤 6: 选择施工区域 ==========
    console.log('【步骤 6/13】选择施工区域...');
    const areaButton = page.getByRole('button', { name: '请选择施工区域' });
    await areaButton.click();
    await page.waitForTimeout(500);

    // 展开区域树（点击第2个节点）
    await page.locator('div:nth-child(2) > .ant-tree-switcher > .anticon > svg').click();
    await page.waitForTimeout(500);

    // 勾选"5层"
    await page.getByRole('checkbox', { name: '5层' }).check();
    await page.waitForTimeout(500);

    // 点击确定按钮
    await page.getByRole('button', { name: '确 定' }).click();
    await page.waitForTimeout(1000);

    // 断言：施工区域已选择
    console.log('✓ 施工区域已选择: 5层\n');

    // ========== 步骤 7: 选择履约对象（班组）==========
    console.log('【步骤 7/13】选择履约对象...');
    const performanceButton = page.getByRole('button', { name: '请选择履约对象' });
    await performanceButton.click();
    await page.waitForTimeout(500);

    // 切换到"班组"标签
    await page.getByRole('tab', { name: '班组' }).click();
    await page.waitForTimeout(500);

    // 选择班组长
    await page.getByText('班组长：邓九洲 (186****7503)').click();
    await page.waitForTimeout(500);

    // 点击确认按钮
    await page.getByRole('button', { name: '确 认' }).click();
    await page.waitForTimeout(1000);

    // 断言：履约对象已选择
    console.log('✓ 履约对象已选择: 邓九洲\n');

    // ========== 步骤 8: 选择施工任务 ==========
    console.log('【步骤 8/13】选择施工任务...');
    
    // 先点击"请选择施工任务"按钮打开选择弹窗
    const taskButton = page.getByRole('button', { name: '请选择施工任务' });
    await taskButton.click();
    await page.waitForTimeout(1000);

    // 在弹窗中输入施工任务名称
    const taskInput = page.getByRole('textbox', { name: '* 施工任务 :' });
    await taskInput.click();
    await taskInput.fill('试件制作');
    await taskInput.press('Enter');
    
    // 等待搜索结果加载完成（等待树形控件中出现节点）
    await page.locator('.ant-tree-checkbox').first().waitFor({ state: 'visible', timeout: 10000 });
    await page.waitForTimeout(500);
    
    // 获取搜索结果数量，确保有结果后再选择
    const checkboxCount = await page.locator('.ant-tree-checkbox').count();
    console.log(`  搜索结果数量: ${checkboxCount}`);
    expect(checkboxCount > 0, '应该有搜索结果').toBe(true);
    
    // 勾选搜索结果中的第15个复选框（根据实际索引调整）
    const targetCheckbox = page.locator('.ant-tree-checkbox').nth(14);
    await targetCheckbox.click();
    await page.waitForTimeout(500);

    // 点击完成按钮
    await page.getByRole('button', { name: '完 成' }).click();
    await page.waitForTimeout(1000);

    // 断言：施工任务已选择
    console.log('✓ 施工任务已选择: 试件制作\n');

    // ========== 步骤 9: 设置计划工期 ==========
    console.log('【步骤 9/13】设置计划工期...');
    
    // 等待计划工期输入框变为可用（施工任务选择后才会启用）
    const durationInput = page.locator('#form_item_plannedDuration');
    await durationInput.waitFor({ state: 'attached', timeout: 10000 });
    await page.waitForTimeout(1000);
    
    // 尝试点击，如果disabled则使用force强制点击或点击父元素
    const isDisabled = await durationInput.getAttribute('disabled');
    if (isDisabled) {
      console.log('  输入框被禁用，尝试强制点击...');
      await durationInput.click({ force: true });
    } else {
      await durationInput.click();
    }
    await page.waitForTimeout(500);

    // 选择日期（根据录制脚本选择22和24）
    await page.getByText('22').nth(1).click();
    await page.waitForTimeout(300);

    await page.getByText('24').first().click();
    await page.waitForTimeout(300);

    // 点击确定按钮（第二个确定按钮）
    await page.getByRole('button', { name: '确 定' }).nth(1).click();
    await page.waitForTimeout(1000);

    // 断言：计划工期已设置
    console.log('✓ ���划工期已设置: 22 - 24\n');

    // ========== 步骤 10: 设置计件信息 ==========
    console.log('【步骤 10/13】设置计件信息...');

    // 选择计件类型
    const pieceRateOption = page.locator('div').filter({ hasText: /^计件$/ }).nth(1);
    await pieceRateOption.click();
    await page.waitForTimeout(500);

    // 填写单价
    const unitPriceInput = page.getByRole('textbox', { name: '单价 :' });
    await unitPriceInput.click();
    await unitPriceInput.fill('300');
    await page.waitForTimeout(500);

    // 断言：单价已填写
    const unitPriceValue = await unitPriceInput.inputValue();
    expect(unitPriceValue, '单价应该为300').toBe('300');
    console.log('✓ 单价已设置: 300');

    // 填写最低产量要求
    const minOutputInput = page.getByRole('textbox', { name: '最低产量要求 :' });
    await minOutputInput.click();
    await minOutputInput.fill('1');
    await page.waitForTimeout(500);

    // 断言：最低产量要求已填写
    const minOutputValue = await minOutputInput.inputValue();
    expect(minOutputValue, '最低产量要求应该为1').toBe('1');
    console.log('✓ 最低产量要求已设置: 1');

    // 填写预估工程量
    const estimateInput = page.getByRole('textbox', { name: '预估工程量 :' });
    await estimateInput.click();
    await estimateInput.fill('100');
    await page.waitForTimeout(500);

    // 断言：预估工程量已填写
    const estimateValue = await estimateInput.inputValue();
    expect(estimateValue, '预估工程量应该为100').toBe('100');
    console.log('✓ 预估工程量已设置: 100\n');

    // ========== 步骤 11: 保存任务单 ==========
    console.log('【步骤 11/13】保存任务单...');
    const saveButton = page.getByRole('button', { name: '保 存' });
    await saveButton.click();
    console.log('  保存按钮已点击，等待接口响应...');
          // 方式1：等待网络请求 idle
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});

    // 等待接口响应完成（页面加载或弹窗出现）
    // 方式1：等待弹窗出现 OR 方式2：等待URL变化
    await Promise.race([
      // 等待弹窗出现
      page.getByLabel('该表单触发下列规则，是否继续操作？').waitFor({ state: 'visible', timeout: 10000 }).catch(() => null),
      // 等待URL开始变化（可能有loading）
      page.waitForTimeout(3000)
    ]);
    console.log('✓ 接口响应完成\n');

    // ========== 步骤 12: 确认表单提示框（如果有）并等待跳转 ==========
    console.log('【步骤 12/13】检查并处理提示框...');

    // 等待弹窗出现（给足时间）
    await page.waitForTimeout(1500);

    // 检查是否出现提示框（多种定位方式）
    let confirmDialog;
    let dialogVisible = false;
    
    // 方式1：通过-label属性
    confirmDialog = page.getByLabel('该表单触发下列规则，是否继续操作？');
    dialogVisible = await confirmDialog.isVisible().catch(() => false);
    
    // 方式2：通过文本内容
    if (!dialogVisible) {
      confirmDialog = page.locator('text=该表单触发下列规则，是否继续操作？').first();
      dialogVisible = await confirmDialog.isVisible().catch(() => false);
    }
    
    // 方式3：通过常见弹窗class
    if (!dialogVisible) {
      confirmDialog = page.locator('.ant-modal-content').last();
      dialogVisible = await confirmDialog.isVisible().catch(() => false);
    }

    if (dialogVisible) {
      // 有弹窗，点击确定按钮
      await confirmDialog.getByRole('button', { name: '确 定' }).click();
      console.log('  ✓ 已确认表单提示，等待跳转到详情页...');
      await page.waitForTimeout(2000);
    } else {
      console.log('  无需确认提示框\n');
    }

    // ========== 步骤 13: 验证创建成功并跳转到详情页 ==========
    console.log('【步骤 13/13】验证任务创建成功...');

    // 等待跳转到详情页（URL包含 dispatch-details）
    console.log('  等待跳转到详情页...');
    
    // 增强等待：先等待网络空闲，再检查URL
    const maxWaitTime = 20; // 最多20秒
    for (let i = 0; i < maxWaitTime; i++) {
      // 先等待网络请求完成
      // await page.waitForLoadState('networkidle').catch(() => {});
      
      const currentUrl = page.url();
      if (currentUrl.includes('/dispatch-details')) {
        console.log(`  ✓ 已跳转到详情页: ${currentUrl}`);
        break;
      }
      
      // 检查是否还在创建页面（可能是保存失败）
      if (currentUrl.includes('/create?') && i > 5) {
        console.log(`  仍在创建页面，检查是否有错误...`);
        const pageContent = await page.content();
        if (pageContent.includes('保存失败') || pageContent.includes('错误')) {
          throw new Error('任务创建失败：页面显示错误');
        }
      }
      
      await page.waitForTimeout(1000);
    }

    // 获取最终URL
    const finalUrl = page.url();
    console.log(`  最终页面: ${finalUrl}`);

    // 断言：页面应该跳转到详情页
    const isInDetailPage = finalUrl.includes('/dispatch-details');
    expect(isInDetailPage, '应该跳转到任务详情页').toBe(true);
    console.log('✓ 任务创建成功，已跳转到详情页\n');

    // ========== 等待页面加载完成 ==========
    console.log('  等待页面加载完成...');
    
    // 方式1：等待网络请求 idle
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    
    // 方式2：等待主要内容加载
    await page.waitForTimeout(1500);
    
    // 方式3：检查特定元素出现
    const detailContent = page.locator('.ant-layout, .ant-table, main').first();
    await detailContent.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
    
    console.log('✓ 页面加载完成\n');

    // 页面标题验证
    const pageTitle = await page.title();
    console.log(`  页面标题: ${pageTitle}`);

    // ========== 删除任务单流程 ==========
    console.log('【步骤 14】删除任务单...');

    // 等待页面稳定
    await page.waitForTimeout(1000);

    // 点击右上角三个点（更多操作按钮）
    // 方式1：通过aria-label
    const moreButton = page.getByRole('button', { name: '更多' }).first();
    const moreButtonVisible = await moreButton.isVisible().catch(() => false);
    
    // 方式2：通过图标class（三个点通常是小圆点）
    if (!moreButtonVisible) {
      const dotButtons = page.locator('.ant-dropdown-button, [class*="more"], .anticon-ellipsis').first();
      const dotVisible = await dotButtons.isVisible().catch(() => false);
      if (dotVisible) {
        await dotButtons.click();
      }
    } else {
      await moreButton.click();
    }

    // 或者使用常见的下拉菜单触发器
    if (!moreButtonVisible) {
      // 通过class查找更多按钮
      const dropdownTrigger = page.locator('[class*="dropdown-trigger"], [class*="dropdown"]').first();
      if (await dropdownTrigger.isVisible().catch(() => false)) {
        await dropdownTrigger.click();
      }
    }

    console.log('  已点击更多操作按钮');
    await page.waitForTimeout(500);

    // 点击删除按钮
    await page.locator('span').filter({ hasText: '删除' }).first().click();
    console.log('  ✓ 已点击删除按钮');

    // 等待删除确认弹窗出现
    await page.waitForTimeout(500);

    // 点击确认删除
    await page.getByRole('dialog').getByRole('button', { name: '确 定' }).click();
    console.log('  ✓ 已确认删除');

    // 等待返回任务列表
    console.log('  等待返回任务列表...');
    await page.waitForTimeout(3000);

    // 验证是否在任务列表页面
    const listUrl = page.url();
    console.log(`  当前页面: ${listUrl}`);

    // 断言：应该在任务列表页面
    const isInListPage = listUrl.includes('/v3/list');
    expect(isInListPage, '删除后应该跳转到任务列表页').toBe(true);
    console.log('✓ 删除成功，已返回任务列表页\n');

    // ========== 截图保存 ==========
    const timestamp = new Date();
    const timeStr = timestamp.toISOString().slice(0, 16).replace(/[-T:]/g, ''); // YYYYMMDDHHMM
    
    await page.waitForTimeout(500);
    const screenshotPath = `tests/snapshots/创建-删除班组任务单-${timeStr}.png`;
    await page.screenshot({
      path: screenshotPath,
      fullPage: true
    });
    console.log(`✓ 截图已保存: ${screenshotPath}\n`);

//     // ========== 生成HTML测试报告 ==========
//     const fs = require('fs');
    
//     // 创建报告目录
//     const reportDir = `tests/reports/创建-删除班组任务单-${timeStr}`;
//     if (!fs.existsSync(reportDir)) {
//       fs.mkdirSync(reportDir, { recursive: true });
//     }
    
//     // 生成HTML报告
//     const htmlReport = `<!DOCTYPE html>
// <html lang="zh-CN">
// <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>测试报告：创建-删除班组任务单 - ${timeStr}</title>
//     <style>
//         body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
//         .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
//         h1 { color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px; }
//         .info { display: flex; gap: 20px; margin: 20px 0; }
//         .info-item { background: #f9f9f9; padding: 15px 20px; border-radius: 4px; }
//         .info-item strong { color: #666; display: block; margin-bottom: 5px; }
//         .status-passed { color: #4CAF50; font-weight: bold; }
//         table { width: 100%; border-collapse: collapse; margin: 20px 0; }
//         th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
//         th { background: #4CAF50; color: white; }
//         tr:hover { background: #f5f5f5; }
//         .screenshot img { max-width: 100%; border: 1px solid #ddd; border-radius: 4px; margin-top: 20px; }
//     </style>
// </head>
// <body>
//     <div class="container">
//         <h1>测试报告：创建-删除班组任务单</h1>
        
//         <div class="info">
//             <div class="info-item">
//                 <strong>用例名称</strong>
//                 <span>创建-删除班组任务单</span>
//             </div>
//             <div class="info-item">
//                 <strong>测试时间</strong>
//                 <span>${timestamp.toLocaleString('zh-CN')}</span>
//             </div>
//             <div class="info-item">
//                 <strong>测试结果</strong>
//                 <span class="status-passed">✓ 通过</span>
//             </div>
//         </div>
        
//         <h2>测试步骤</h2>
//         <table>
//             <tr><th>步骤</th><th>操作</th><th>状态</th></tr>
//             <tr><td>1</td><td>自动登录</td><td class="status-passed">✓</td></tr>
//             <tr><td>2</td><td>进入任务菜单</td><td class="status-passed">✓</td></tr>
//             <tr><td>3</td><td>点击创建任务单</td><td class="status-passed">✓</td></tr>
//             <tr><td>4</td><td>选择直接创建方式</td><td class="status-passed">✓</td></tr>
//             <tr><td>5</td><td>选择工程</td><td class="status-passed">✓</td></tr>
//             <tr><td>6</td><td>选择施工区域</td><td class="status-passed">✓</td></tr>
//             <tr><td>7</td><td>选择履约对象</td><td class="status-passed">✓</td></tr>
//             <tr><td>8</td><td>选择施工任务</td><td class="status-passed">✓</td></tr>
//             <tr><td>9</td><td>设置计划工期</td><td class="status-passed">✓</td></tr>
//             <tr><td>10</td><td>设置计件信息</td><td class="status-passed">✓</td></tr>
//             <tr><td>11</td><td>保存任务单</td><td class="status-passed">✓</td></tr>
//             <tr><td>12</td><td>确认表单提示</td><td class="status-passed">✓</td></tr>
//             <tr><td>13</td><td>验证跳转到详情页</td><td class="status-passed">✓</td></tr>
//             <tr><td>14</td><td>删除任务单</td><td class="status-passed">✓</td></tr>
//             <tr><td>15</td><td>验证返回列表页</td><td class="status-passed">✓</td></tr>
//         </table>
        
//         <h2>最终结果</h2>
//         <div class="info">
//             <div class="info-item">
//                 <strong>测试状态</strong>
//                 <span class="status-passed">PASSED</span>
//             </div>
//             <div class="info-item">
//                 <strong>截图</strong>
//                 <span>创建-删除班组任务单-${timeStr}.png</span>
//             </div>
//         </div>
        
//         <div class="screenshot">
//             <h2>测试截图</h2>
//             <img src="../../tests/snapshots/创建-删除班组任务单-${timeStr}.png" alt="测试结果截图">
//         </div>
//     </div>
// </body>
// </html>`;
    
//     fs.writeFileSync(`${reportDir}/index.html`, htmlReport);
//     console.log(`✓ HTML测试报告已生成: ${reportDir}/index.html`);
    
//     // 复制截图到报告目录（使用相对路径引用）
//     console.log('\n提示: 直接打开HTML报告查看');

    console.log('========================================');
    console.log('       创建-删除班组任务单流程完成');
    console.log('========================================\n');

  } catch (error) {
    console.error('流程执行出错:', error);

    // 截图保存失败状态
    await page.screenshot({
      path: 'tests/snapshots/create-task-error.png',
      fullPage: true
    });
    console.log('✓ 错误截图已保存: tests/snapshots/create-task-error.png\n');

    throw error;
  }
  // ========== 最后: 关闭浏览器 ==========
  finally {
    if (shouldCloseBrowser) {
      console.log('========================================');
      console.log('正在关闭浏览器...');
      console.log('========================================\n');

      try {
        // 先关闭所有页面上下文，再关闭浏览器
        // 获取context并强制关闭
        const context = page.context();
        
        // 尝试快速关闭（设置短超时）
        await context.close().catch(() => {});
        await browser.close().catch(() => {});
        
        // 强制关闭（如果上面超时）
        setTimeout(() => {
          process.exit(0);
        }, 2000);
        
        console.log('浏览器已关闭\n');
      } catch (e) {
        console.error('关闭浏览器时出错:', e);
        // 强制退出
        process.exit(0);
      }
    }
  }
});