/**
 * 菜单导航自动化测试 - 选择任务菜单
 * 
 * 流程：
 * 1. 登录
 * 2. 切换项目（如需要）
 * 3. 点击一级菜单"任务"
 * 4. 点击二级菜单"任务列表"
 * 5. 进入任务列表页面
 */

import { test, expect } from '@playwright/test';
import { autoLogin } from './utils/login-helper';
import { TasksPage } from './pages/tasks-page';

test.describe('菜单导航 - 任务菜单', () => {
  
  test('选择"任务"一级菜单 进入"任务列表"', async ({ page }) => {
    console.log('\n========================================');
    console.log('    菜单导航自动化 - 任务菜单');
    console.log('========================================\n');
    
    // ========== 步骤 1: 登录 ==========
    console.log('[步骤 1/6] 登录中...');
    await autoLogin(page);
    
    // 等待登录成功
    let loginSuccess = false;
    for (let i = 0; i < 30; i++) {
      if (!page.url().includes('/login')) {
        loginSuccess = true;
        break;
      }
      await page.waitForTimeout(1000);
    }
    
    expect(loginSuccess, '登录失败').toBe(true);
    console.log('✓ 登录成功\n');
    await page.waitForTimeout(2000);
    
    // 截图登录后页面
    await page.screenshot({ path: 'tests/snapshots/after-login.png', fullPage: true });
    
    // ========== 步骤 2: 切换项目（如需要）==========
    console.log('[步骤 2/6] 检查当前项目...');
    
    // 获取当前页面显示的项目名称
    const currentProject = await page.evaluate(() => {
      const headerText = document.querySelector('[class*="header"]')?.innerText || '';
      return headerText;
    });
    
    console.log('当前项目:', currentProject);
    
    // 目标项目
    const targetProjectName = '一智科技演示专用项目（勿动）';
    const targetCompanyName = '一智科技（成都）有限公司';
    
    const isTargetProject = currentProject.includes(targetProjectName) && 
                         currentProject.includes(targetCompanyName);
    
    if (!isTargetProject) {
      console.log('[步骤 3/6] 切换项目...\n');
      
      // 点击项目下拉
      const projectTriggerSelectors = [
        '[class*="header-left"]',
        '[class*="project-name"]',
        '.ant-dropdown-trigger',
        'text=一智科技'
      ];
      
      for (const selector of projectTriggerSelectors) {
        const element = page.locator(selector).first();
        if (await element.isVisible().catch(() => false)) {
          console.log(`点击元素: ${selector}`);
          await element.click();
          await page.waitForTimeout(1000);
          break;
        }
      }
      
      // 选择目标项目
      const targetProjectFullName = '一智科技（成都）有限公司-智科技演示专用项目（勿动）';
      const targetProjectOption = page.locator(`text="${targetProjectFullName}"`).first();
      
      if (await targetProjectOption.isVisible().catch(() => false)) {
        console.log(`选择项目: ${targetProjectFullName}`);
        await targetProjectOption.click();
        await page.waitForTimeout(2000);
      }
      
      console.log('✓ 项目切换成功\n');
    } else {
      console.log('✓ 当前已是目标项目\n');
    }
    
    // ========== 步骤 3: 点击一级菜单"任务" ==========
    console.log('[步骤 4/6] 点击一级菜单: 任务\n');
    
    const tasksPage = new TasksPage(page);
    await tasksPage.clickFirstLevelMenu();
    
    console.log('✓ 已点击"任务"一级菜单');
    await page.waitForTimeout(1500);
    
    // 截图菜单展开状态
    await page.screenshot({ path: 'tests/snapshots/menu-expanded.png', fullPage: true });
    
    // ========== 步骤 4: 点击二级菜单"任务列表" ==========
    console.log('[步骤 5/6] 点击二级菜单: 任务列表\n');
    
    await tasksPage.clickSecondLevelMenu();
    
    console.log('✓ 已点击"任务列表"二级菜单');
    await page.waitForTimeout(2000);
    
    // ========== 步骤 5: 验证进入任务列表页面 ==========
    console.log('[步骤 6/6] 验证任务列表页面...\n');
    
    // 截图最终页面
    await page.screenshot({ path: 'tests/snapshots/task-list.png', fullPage: true });
    
    console.log('========================================');
    console.log('     菜单导航自动化完成！');
    console.log('========================================\n');
    console.log('当前页面 URL:', page.url());
    console.log('截图已保存: tests/snapshots/task-list.png\n');
    
    // 验证进入任务列表页面（通过页面标题或内容）
    const pageContent = await page.evaluate(() => {
      // 获取页面标题
      const title = document.querySelector('[class*="title"]')?.textContent || '';
      // 获取面包屑或表头
      const header = document.querySelector('[class*="breadcrumb"]')?.textContent || '';
      return { title, header, url: window.location.href };
    });
    
    console.log('页面信息:', pageContent);
    
    // 检查页面是否包含任务列表相关内容
    const isTaskListPage = pageContent.title.includes('任务') || 
                          pageContent.header.includes('任务') ||
                          pageContent.url.includes('/netConstruction');
    expect(isTaskListPage, '未进入任务列表页面').toBe(true);
    
    console.log('✓ 验证成功：已到达任务列表页面\n');
    
    // 保持浏览器打开（调试用）
    console.log('浏览器保持打开，等待后续调试...\n');
    await new Promise(() => {});
  });
  
});