import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login-page';

test('分析滑块验证和验证码回显', async ({ page }) => {
  const loginPage = new LoginPage(page);
  
  // 1. 打开登录页
  await loginPage.goto();
  
  // 2. 切换到短信登录
  await loginPage.switchToSmsLogin();
  
  // 3. 输入手机号
  await loginPage.enterPhone('19113235970');
  
  // 4. 点击获取验证码
  await loginPage.clickGetVerifyCode();
  console.log('已点击获取验证码');
  
  // 等待页面反应
  await page.waitForTimeout(2000);
  
  // 5. 分析当前页面元素
  const elements = await page.evaluate(() => {
    const result: string[] = [];
    
    // 查找所有可能的验证码相关元素
    const patterns = [
      '[class*="code"]', 
      '[class*="verify"]',
      '[class*="captcha"]',
      '[class*="slider"]',
      '[class*="puzzle"]'
    ];
    
    patterns.forEach(sel => {
      const found = document.querySelectorAll(sel);
      if (found.length > 0) {
        result.push(`Pattern "${sel}": found ${found.length} elements`);
        found.forEach((el: any, i) => {
          result.push(`  ${i}: ${el.className}, text: ${el.textContent?.substring(0, 50)}`);
        });
      }
    });
    
    // 查找验证码输入框附近的元素
    const verifyInput = document.querySelector('#form_item_password');
    if (verifyInput) {
      const parent = verifyInput.parentElement;
      const grandparent = parent?.parentElement;
      result.push(`\n验证码输入框父元素: ${parent?.className}`);
      result.push(`验证码输入框祖父元素: ${grandparent?.className}`);
      result.push(`验证码输入框附近文本: ${parent?.innerText?.substring(0, 200)}`);
    }
    
    // 查找滑块相关元素
    const sliderPatterns = ['.slider', '[class*="slider"]', '[class*="drag"]', '[class*="verify"]'];
    sliderPatterns.forEach(sel => {
      const found = document.querySelectorAll(sel);
      if (found.length > 0) {
        result.push(`\n滑块元素 "${sel}": ${found.length} 个`);
        found.forEach((el: any, i) => {
          result.push(`  ${i}: ${el.className}, visible: ${el.style.display !== 'none'}`);
        });
      }
    });
    
    // 获取整个页面的 class 列表
    const allClasses = new Set<string>();
    document.querySelectorAll('*').forEach(el => {
      el.classList.forEach(c => allClasses.add(c));
    });
    result.push(`\n页面所有 class (前50): ${Array.from(allClasses).slice(0, 50).join(', ')}`);
    
    return result;
  });
  
  console.log('=== 页面元素分析 ===');
  elements.forEach(e => console.log(e));
  
  // 6. 截图
  await page.screenshot({ path: 'tests/snapshots/verify-required.png', fullPage: true });
  console.log('截图已保存');
});