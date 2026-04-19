import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login-page';
import { testUsers, testConfig } from '../fixtures/test-data';

export { testUsers, testConfig };

/**
 * 测试用例 1: 验证登录页面正常加载
 */
test('登录页面正常加载', async ({ page }) => {
  const loginPage = new LoginPage(page);
  
  await loginPage.goto();
  await loginPage.switchToSmsLogin();
  
  // 验证页面标题
  await expect(page).toHaveTitle(/安心筑/);
  
  // 验证页面主要元素存在
  await expect(loginPage.smsLoginTab).toBeVisible();
  await expect(loginPage.loginButton).toBeVisible();
  
  console.log('✓ 登录页面加载正常');
});

/**
 * 测试用例 2: 切换到短信登录
 */
test('切换到短信登录', async ({ page }) => {
  const loginPage = new LoginPage(page);
  
  await loginPage.goto();
  await loginPage.switchToSmsLogin();
  
  // 验证短信登录表单元素出现
  await expect(loginPage.phoneInput).toBeVisible();
  await expect(loginPage.verifyCodeInput).toBeVisible();
  await expect(loginPage.getVerifyCodeBtn).toBeVisible();
  
  console.log('✓ 短信登录切换成功');
});

/**
 * 测试用例 3: 输入手机号
 */
test('输入手机号', async ({ page }) => {
  const loginPage = new LoginPage(page);
  
  await loginPage.goto();
  await loginPage.switchToSmsLogin();
  await loginPage.enterPhone(testUsers.phone);
  
  // 验证手机号已填入
  await expect(loginPage.phoneInput).toHaveValue(testUsers.phone);
  
  console.log('✓ 手机号输入成功:', testUsers.phone);
});

/**
 * 测试用例 4: 获取验证码
 */
test('点击获取验证码按钮', async ({ page }) => {
  const loginPage = new LoginPage(page);
  
  await loginPage.goto();
  await loginPage.switchToSmsLogin();
  await loginPage.enterPhone(testUsers.phone);
  await loginPage.clickGetVerifyCode();
  
  // 按钮点击后会有倒计时或其他反馈
  console.log('✓ 已点击获取验证码');
});

/**
 * 测试用例 5: 输入验证码
 */
test('输入验证码', async ({ page }) => {
  const loginPage = new LoginPage(page);
  
  await loginPage.goto();
  await loginPage.switchToSmsLogin();
  await loginPage.enterPhone(testUsers.phone);
  await loginPage.enterVerifyCode('123456');
  
  // 验证验证码已填入
  await expect(loginPage.verifyCodeInput).toHaveValue('123456');
  
  console.log('✓ 验证码输入成功');
});

/**
 * 测试用例 6: 点击登录按钮
 */
test('点击登录按钮', async ({ page }) => {
  const loginPage = new LoginPage(page);
  
  await loginPage.goto();
  await loginPage.switchToSmsLogin();
  await loginPage.enterPhone(testUsers.phone);
  await loginPage.enterVerifyCode('123456');
  await loginPage.clickLogin();
  
  console.log('✓ 已点击登录按钮');
});