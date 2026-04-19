/**
 * 登录后切换项目自动化
 * 流程：
 * 1. 登录
 * 2. 点击左上角项目名称后的小三角
 * 3. 展开选择公司项目
 * 4. 选择：一智科技（成都）有限公司-智科技演示专用项目（勿动）
 * 5. 进入项目首页
 */

import { test, expect } from '@playwright/test';
import { autoLogin } from './utils/login-helper';

test('切换项目自动化', async ({ page }) => {
  console.log('=== 开始切换项目自动化 ===\n');
  
  // ========== 步骤 1: 登录 ==========
  console.log('[步骤 1] 登录中...');
  await autoLogin(page);
  
  // 等待登录成功
  console.log('[步骤 2] 等待登录成功...\n');
  let loginSuccess = false;
  for (let i = 0; i < 30; i++) {
    if (!page.url().includes('/login')) {
      loginSuccess = true;
      break;
    }
    await page.waitForTimeout(1000);
  }
  
  expect(loginSuccess, '登录失败').toBe(true);
  console.log('登录成功！\n');
  await page.waitForTimeout(2000);
  
  // 截图当前页面
  await page.screenshot({ path: 'tests/snapshots/after-login.png', fullPage: true });
  
  // ========== 步骤 2: 检查当前项目 ==========
  console.log('[步骤 3] 检查当前项目...\n');
  
  // 获取当前页面显示的项目名称
  const currentProject = await page.evaluate(() => {
    // 查找 header 中显示的项目信息
    const headerText = document.querySelector('[class*="header"]')?.innerText || '';
    return headerText;
  });
  
  console.log('当前页面内容:', currentProject);
  
  // 检查是否已经是目标项目
  const targetProjectName = '一智科技演示专用项目（勿动）';
  const targetCompanyName = '一智科技（成都）有限公司';
  const targetProjectFullName = '一智科技（成都）有限公司-智科技演示专用项目（勿动）';
  
  const isTargetProject = currentProject.includes(targetProjectName) && 
                         currentProject.includes(targetCompanyName);
  
  if (isTargetProject) {
    console.log('✓ 当前已选中目标项目\n');
  } else {
    // ========== 步骤 3: 需要切换项目 ==========
    console.log('[步骤 4] 需要切换项目，点击项目下拉...\n');
    
    // 尝试点击项目名称区域打开下拉菜单
    const projectTriggerSelectors = [
      '[class*="header-left"]',
      '[class*="project-name"]',
      '.ant-dropdown-trigger',
      'text=一智科技'
    ];
    
    let foundTrigger = false;
    for (const selector of projectTriggerSelectors) {
      const element = page.locator(selector).first();
      if (await element.isVisible().catch(() => false)) {
        console.log(`点击元素: ${selector}`);
        await element.click();
        await page.waitForTimeout(1000);
        foundTrigger = true;
        break;
      }
    }
    
    // 等待下拉菜单出现
    await page.waitForTimeout(1000);
    
    // 截图下拉菜单
    await page.screenshot({ path: 'tests/snapshots/project-dropdown.png', fullPage: true });
    
    // 获取下拉菜单中所有项目选项
    const allProjectsInDropdown = await page.evaluate(() => {
      const projects: string[] = [];
      const selectors = [
        '[class*="dropdown"] a',
        '[class*="dropdown"] div',
        '[class*="select"] [class*="option"]',
        '[class*="menu"] [class*="item"]',
        '.ant-select-item'
      ];
      
      selectors.forEach(sel => {
        document.querySelectorAll(sel).forEach((el: any) => {
          const text = el.textContent?.trim();
          if (text && text.length > 5 && text.length < 50) {
            projects.push(text);
          }
        });
      });
      return projects;
    });
    
    console.log('下拉菜单中的所有项目:');
    allProjectsInDropdown.forEach((p, i) => console.log(`  ${i + 1}. ${p}`));
    
    // 精确查找目标项目
    const targetProjectOption = page.locator(`text="${targetProjectFullName}"`).first();
    
    if (await targetProjectOption.isVisible().catch(() => false)) {
      console.log(`✓ 找到精确匹配的目标项目: ${targetProjectFullName}`);
      await targetProjectOption.click();
      await page.waitForTimeout(2000);
    } else {
      // 查找相似项目
      const similarProjects = allProjectsInDropdown.filter(p => 
        p.includes('一智科技') || p.includes('演示专用')
      );
      
      console.log('相似项目:', similarProjects);
      
      if (similarProjects.length > 1) {
        console.log('⚠️ 发现多个相似项目');
        console.log(`目标项目应为: ${targetProjectFullName}`);
        throw new Error(`发现多个相似项目，无法确定目标项目！\n相似项目: ${similarProjects.join(', ')}`);
      } else if (similarProjects.length === 1) {
        console.log(`找到唯一相似项目: ${similarProjects[0]}`);
        const option = page.locator(`text=${similarProjects[0]}`).first();
        await option.click();
        await page.waitForTimeout(2000);
      } else {
        throw new Error(`未找到目标项目 "${targetProjectFullName}"`);
      }
    }
    
    console.log('项目选择成功！\n');
  }
  
  // ========== 步骤 4: 验证已进入项目首页 ==========
  console.log('[步骤 5] 验证项目首页...\n');
  
  // 截图最终页面
  await page.screenshot({ path: 'tests/snapshots/project-home.png', fullPage: true });
  
  console.log('========================================');
  console.log('切换项目自动化流程完成！');
  console.log('当前页面:', page.url());
  console.log('========================================\n');
  
  // 保持浏览器打开
  await new Promise(() => {});
});