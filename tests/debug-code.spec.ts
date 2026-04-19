import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login-page';

test('深度调试验证码回显', async ({ page }) => {
  const loginPage = new LoginPage(page);
  
  // 1. 打开登录页
  await loginPage.goto();
  await page.waitForTimeout(1000);
  
  // 2. 切换到短信登录
  await loginPage.switchToSmsLogin();
  
  // 3. 输入手机号
  await loginPage.enterPhone('19113235970');
  
  // 4. 点击获取验证码
  await loginPage.clickGetVerifyCode();
  console.log('已点击获取验证码');
  
  // 等待滑块出现
  await page.waitForTimeout(2000);
  
  // 处理滑块
  const sliderBlock = await page.$('.tencent-captcha-dy__slider-block');
  const sliderGroove = await page.$('.tencent-captcha-dy__slider-groove');
  
  if (sliderBlock && sliderGroove) {
    console.log('处理滑块验证...');
    const blockBox = await sliderBlock.boundingBox();
    const grooveBox = await sliderGroove.boundingBox();
    
    if (blockBox && grooveBox) {
      const dragDistance = grooveBox.width - blockBox.width;
      const startX = blockBox.x + blockBox.width / 2;
      const startY = blockBox.y + blockBox.height / 2;
      
      await page.mouse.move(startX, startY);
      await page.mouse.down();
      
      const steps = 15;
      const stepDistance = dragDistance / steps;
      
      for (let i = 0; i < steps; i++) {
        await page.mouse.move(startX + stepDistance * (i + 1), startY);
        await page.waitForTimeout(50);
      }
      
      await page.mouse.up();
    }
  }
  
  // 等待更长时间让验证码回显
  console.log('等待验证码回显 (等待15秒)...');
  for (let i = 0; i < 15; i++) {
    await page.waitForTimeout(1000);
    console.log(`  ${i+1}秒...`);
  }
  
  // 检查验证码输入框
  const code1 = await page.evaluate(() => {
    const input = document.querySelector('#form_item_password') as HTMLInputElement;
    return input ? input.value : '';
  });
  console.log('输入框值:', code1);
  
  // 检查页面上所有可见的数字
  const pageNumbers = await page.evaluate(() => {
    const bodyText = document.body.innerText;
    // 查找4-6位数字
    const matches = bodyText.match(/\b\d{4,6}\b/g);
    return matches || [];
  });
  console.log('页面上的数字:', pageNumbers);
  
  // 监听网络请求，看看验证码是否通过接口返回
  console.log('\n监听网络请求...');
  const codes: string[] = [];
  
  await page.route('**/*', async route => {
    const response = route.request();
    const url = response.url();
    const method = response.method();
    
    // 检查响应中是否包含验证码
    if (method === 'GET' || method === 'POST') {
      try {
        const responseData = await route.response();
        if (responseData) {
          const body = await responseData.text();
          if (body && /\d{4,6}/.test(body) && !url.includes('css') && !url.includes('js')) {
            console.log('可能包含验证码的响应:', url);
            const match = body.match(/\d{4,6}/);
            if (match) {
              codes.push(match[0]);
            }
          }
        }
      } catch (e) {}
    }
    
    await route.continue();
  });
  
  console.log('捕获的验证码:', codes);
  
  // 最终再检查一次输入框
  const finalCode = await page.evaluate(() => {
    const input = document.querySelector('#form_item_password') as HTMLInputElement;
    return input ? input.value : '';
  });
  console.log('最终输入框值:', finalCode);
  
  // 截图
  await page.screenshot({ path: 'tests/snapshots/debug-code2.png', fullPage: true });
});