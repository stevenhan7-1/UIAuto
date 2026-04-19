/**
 * 安心筑 CMS 登录测试套件
 * 
 * 测试覆盖:
 * - 页面加载
 * - 短信登录流程
 * - 完整登录流程
 * 
 * 执行方式: npx playwright test tests/suites/login-suite.spec.ts
 */

import { test, expect, describe } from '@playwright/test';
import { LoginPage } from '../pages/login-page';
import { testUsers, testConfig } from '../fixtures/test-data';

export { testUsers, testConfig };

/**
 * 测试套件: 登录功能测试
 */
describe('登录功能测试套件', () => {
  
  /**
   * 测试用例 1: 验证登录页面正常加载
   */
  test('01-登录页面正常加载', async ({ page }) => {
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
  test('02-切换到短信登录', async ({ page }) => {
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
  test('03-输入手机号', async ({ page }) => {
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
  test('04-点击获取验证码按钮', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    await loginPage.goto();
    await loginPage.switchToSmsLogin();
    await loginPage.enterPhone(testUsers.phone);
    await loginPage.clickGetVerifyCode();
    
    console.log('✓ 已点击获取验证码');
  });

  /**
   * 测试用例 5: 输入验证码
   */
  test('05-输入验证码', async ({ page }) => {
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
  test('06-点击登录按钮', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    await loginPage.goto();
    await loginPage.switchToSmsLogin();
    await loginPage.enterPhone(testUsers.phone);
    await loginPage.enterVerifyCode('123456');
    await loginPage.clickLogin();
    
    console.log('✓ 已点击登录按钮');
  });

  /**
   * 测试用例 7: 完整登录流程（需要手动输入验证码）
   * 注意: 此测试需要用户手动输入验证码后才能完成登录
   */
  test('07-完整登录流程-需验证码', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    console.log('=== 开始完整登录流程 ===');
    console.log('手机号:', testUsers.phone);
    console.log('注意: 需要手动输入收到的验证码');
    
    // 1. 打开登录页
    await loginPage.goto();
    console.log('1. 登录页打开成功');
    
    // 2. 切换到短信登录
    await loginPage.switchToSmsLogin();
    console.log('2. 已切换到短信登录');
    
    // 3. 输入手机号
    await loginPage.enterPhone(testUsers.phone);
    console.log('3. 手机号已输入');
    
    // 4. 点击获取验证码
    await loginPage.clickGetVerifyCode();
    console.log('4. 已发送验证码请求');
    console.log('   -> 请在手机上查看验证码并输入');
    
    // 5. 输入验证码（需要用户手动提供）
    // 这里留空，用户需要手动输入
    // await loginPage.enterVerifyCode('XXXXXX');
    
    // 6. 点击登录
    // await loginPage.clickLogin();
    
    console.log('=== 登录流程准备完成 ===');
    console.log('请手动输入验证码后完成登录');
  });
});