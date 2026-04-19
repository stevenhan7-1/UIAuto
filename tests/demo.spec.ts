import { test, expect } from '@playwright/test';

test('demo: 访问Bing并搜索', async ({ page }) => {
  // 1. 打开Bing首页
  await page.goto('https://www.bing.com');
  
  // 2. 等待页面加载
  await page.waitForLoadState('domcontentloaded');
  
  // 3. 验证页面标题
  await expect(page).toHaveTitle(/Bing/);
  
  // 4. 找到搜索框并输入关键词
  const searchInput = page.locator('input[name="q"]');
  await searchInput.waitFor({ state: 'visible', timeout: 10000 });
  await searchInput.fill('Playwright automation');
  
  // 5. 按回车搜索
  await searchInput.press('Enter');
  
  // 6. 等待搜索结果加载
  await page.waitForLoadState('networkidle', { timeout: 15000 });
  
  // 7. 验证搜索结果页面
  await expect(page).toHaveTitle(/Playwright automation/, { timeout: 10000 });
  
  console.log('测试通过！');
});