import { test as base, Page } from '@playwright/test';
import { LoginPage } from '../pages/login-page';

/**
 * 测试账号配置
 */
export const testAccount = {
  phone: '19113235970',
};

/**
 * 创建带有登录 fixture 的测试
 * 使用方式:
 * 
 * import { test, expect } from './utils/test';
 * 
 * test('测试用例', async ({ page, loggedInPage }) => {
 *   // page - 原始 Page 对象
 *   // loggedInPage - 已登录的 Page 对象
 * });
 */
export const test = base.extend<{
  loggedInPage: Page;
}>({
  loggedInPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    
    // 执行完整登录流程
    console.log('=== 执行自动登录流程 ===');
    console.log('账号:', testAccount.phone);
    
    // 1. 打开登录页
    await loginPage.goto();
    console.log('1. 登录页打开成功');
    
    // 2. 切换到短信登录
    await loginPage.switchToSmsLogin();
    console.log('2. 已切换到短信登录');
    
    // 3. 输入手机号
    await loginPage.enterPhone(testAccount.phone);
    console.log('3. 手机号已输入');
    
    // 4. 点击获取验证码（验证码会自动回显）
    await loginPage.clickGetVerifyCode();
    console.log('4. 已发送验证码请求');
    
    // 等待验证码自动回显
    await page.waitForTimeout(3000);
    
    // 5. 获取自动回显的验证码
    const verifyCode = await loginPage.verifyCodeInput.inputValue();
    console.log('5. 验证码已回显:', verifyCode);
    
    // 6. 点击登录按钮
    await loginPage.clickLogin();
    console.log('6. 已点击登录按钮');
    
    // 等待登录完成
    await page.waitForTimeout(2000);
    
    console.log('=== 登录完成 ===');
    
    // 将已登录的 page 传递给测试
    await use(page);
  },
});

export { expect } from '@playwright/test';
export { Page } from '@playwright/test';