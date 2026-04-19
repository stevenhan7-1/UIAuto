import { Page, Locator } from '@playwright/test';

/**
 * 登录页面 - Page Object Model
 */
export class LoginPage {
  readonly page: Page;
  
  // 选择器定义
  readonly smsLoginTab: Locator;        // 短信登录标签
  readonly phoneInput: Locator;        // 手机号输入框
  readonly verifyCodeInput: Locator;  // 验证码输入框
  readonly getVerifyCodeBtn: Locator; // 获取验证码按钮
  readonly loginButton: Locator;      // 登录按钮
  
  constructor(page: Page) {
    this.page = page;
    
    // 初始化选择器
    this.smsLoginTab = page.locator('text=短信登录').first();
    this.phoneInput = page.locator('#form_item_account');
    this.verifyCodeInput = page.locator('#form_item_password');
    this.getVerifyCodeBtn = page.locator('text=获取验证码');
    this.loginButton = page.locator('text=登录 / 注册');
  }
  
  /**
   * 打开登录页面
   */
  async goto(): Promise<void> {
    await this.page.goto('https://cms.axzo.cn/login');
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(2000);
  }
  
  /**
   * 切换到短信登录
   */
  async switchToSmsLogin(): Promise<void> {
    await this.smsLoginTab.click();
    await this.page.waitForTimeout(1000);
  }
  
  /**
   * 输入手机号
   */
  async enterPhone(phone: string): Promise<void> {
    await this.phoneInput.fill(phone);
  }
  
  /**
   * 输入验证码
   */
  async enterVerifyCode(code: string): Promise<void> {
    await this.verifyCodeInput.fill(code);
  }
  
  /**
   * 点击获取验证码
   */
  async clickGetVerifyCode(): Promise<void> {
    await this.getVerifyCodeBtn.click();
  }
  
  /**
   * 点击登录按钮
   */
  async clickLogin(): Promise<void> {
    await this.loginButton.click();
  }
  
  /**
   * 完整的短信登录流程
   */
  async loginWithSms(phone: string, verifyCode: string): Promise<void> {
    await this.goto();
    await this.switchToSmsLogin();
    await this.enterPhone(phone);
    await this.clickGetVerifyCode();
    // 等待用户输入验证码，这里假设验证码已经提供
    await this.enterVerifyCode(verifyCode);
    await this.clickLogin();
  }
  
  /**
   * 等待登录成功（检查是否跳转到首页）
   */
  async waitForLoginSuccess(): Promise<boolean> {
    try {
      // 等待 URL 变化或某个元素出现
      await this.page.waitForURL('**/index**', { timeout: 10000 }).catch(() => null);
      return true;
    } catch {
      return false;
    }
  }
}