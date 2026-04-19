import { test, expect } from '@playwright/test';

test('分析短信登录页面', async ({ page }) => {
  // 1. 打开登录页 - 使用 domcontentloaded 避免超时
  await page.goto('https://cms.axzo.cn/login', { timeout: 15000 });
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(3000);
  
  // 2. 截图登录页
  await page.screenshot({ path: 'tests/snapshots/login-page.png', fullPage: true });
  
  // 3. 查找并点击"短信登录"
  console.log('查找短信登录入口...');
  
  // 尝试多种方式找到短信登录按钮
  const smsLoginLink = page.locator('text=短信登录').first();
  if (await smsLoginLink.isVisible({ timeout: 5000 }).catch(() => false)) {
    await smsLoginLink.click();
    console.log('已点击短信登录');
    await page.waitForTimeout(2000);
  } else {
    console.log('未找到短信登录链接');
  }
  
  // 3. 截图当前页面
  await page.screenshot({ path: 'tests/snapshots/after-click-sms.png', fullPage: true });
  
  // 4. 分析页面元素
  const elements = await page.evaluate(() => {
    const result: string[] = [];
    
    // 获取所有 input
    document.querySelectorAll('input').forEach((el: any) => {
      result.push(`INPUT: id="${el.id}" name="${el.name}" type="${el.type}" placeholder="${el.placeholder}"`);
    });
    
    // 获取所有按钮
    document.querySelectorAll('button').forEach((el: any) => {
      result.push(`BUTTON: text="${el.textContent?.trim().substring(0, 20)}" class="${el.className}"`);
    });
    
    // 获取所有可点击的链接
    document.querySelectorAll('a').forEach((el: any) => {
      const text = el.textContent?.trim();
      if (text && text.length < 20) {
        result.push(`LINK: text="${text}"`);
      }
    });
    
    return result;
  });
  
  console.log('页面元素分析:');
  elements.forEach(e => console.log(e));
  
  // 5. 获取页面可见文本
  const visibleText = await page.evaluate(() => {
    return document.body.innerText.substring(0, 1000);
  });
  
  console.log('\n=== 页面可见文本 ===');
  console.log(visibleText);
});