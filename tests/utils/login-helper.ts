/**
 * 自动登录工具 - 登录流程前置模块
 * 
 * 优化后的流程：
 * 1. 打开登录页 -> 切换账号登录 -> 输入账号 -> 获取验证码
 * 2. 遇到滑块验证 -> 提示用户手动完成
 * 3. 滑块验证完成后 -> 检查验证码是否回显
 * 4. 若验证码已回显 -> 自动点击登录
 * 5. 若验证码未回显 -> 提示用户手动输入 -> 自动点击登录
 * 
 * 使用方式：
 * import { autoLogin } from './utils/login-helper';
 * 
 * test('测试', async ({ page }) => {
 *   const loggedInPage = await autoLogin(page);
 *   // 自动检测登录状态
 * });
 */

import { Page } from '@playwright/test';
import { LoginPage } from '../pages/login-page';

/**
 * 测试账号配置
 */
export const testAccount = {
  phone: '',
};

/**
 * 登录辅助类
 */
export class LoginHelper {
  private page: Page;
  
  constructor(page: Page) {
    this.page = page;
  }
  
  /**
   * 执行完整的自动登录流程（优化版）
   */
  async login(): Promise<Page> {
    const loginPage = new LoginPage(this.page);
    
    console.log('\n========================================');
    console.log('       自动登录流程开始');
    console.log('========================================\n');
    console.log(`账号: ${testAccount.phone}`);
    console.log('');
    
    // ========== 步骤 1: 打开登录页 ==========
    await loginPage.goto();
    console.log('[步骤 1/6] 登录页已打开');
    
    // ========== 步骤 2: 切换到短信登录 ==========
    await loginPage.switchToSmsLogin();
    console.log('[步骤 2/6] 已切换到短信登录');
    
    // ========== 步骤 3: 输入手机号 ==========
    await loginPage.enterPhone(testAccount.phone);
    console.log('[步骤 3/6] 手机号已输入');
    
    // ========== 步骤 4: 点击获取验证码 ==========
    await loginPage.clickGetVerifyCode();
    console.log('[步骤 4/6] 已点击获取验证码');
    
    // ========== 步骤 5: 处理滑块验证（提示用户手动完成）==========
    await this.waitForSliderCaptchaComplete();
    console.log('[步骤 5/6] 滑块验证已完成');
    
    // ========== 步骤 6: 处理验证码（自动检测回显或手动输入）==========
    console.log('[步骤 6/6] 验证码处理...\n');
    
    // 等待验证码回显
    await this.handleVerificationCode(loginPage);
    
    // 等待登录完成
    await this.page.waitForTimeout(2000);
    
    console.log('========================================');
    console.log('       登录流程完成');
    console.log('========================================\n');
    console.log(`当前页面: ${this.page.url()}\n`);
    
    return this.page;
  }
  
  /**
   * 等待滑块验证完成（提示用户手动操作）
   */
  private async waitForSliderCaptchaComplete(): Promise<void> {
    console.log('  检测滑块验证...');
    
    // 等待滑块验证出现
    const sliderVisible = await this.page.waitForSelector(
      '.tencent-captcha-dy__slider-groove', 
      { timeout: 5000 }
    ).catch(() => null);
    
    if (!sliderVisible) {
      console.log('  无需滑块验证');
      return;
    }
    
    // 发现滑块验证，提示用户手动完成
    console.log('');
    console.log('  ========================================');
    console.log('  请手动完成滑块验证');
    console.log('  ========================================');
    console.log('  拖动滑块完成拼图验证');
    console.log('  验证完成后系统会自动继续\n');
    
    // 等待滑块验证消失（用户完成验证）
    let attempts = 0;
    const maxAttempts = 60; // 最多等待 60 秒
    
    while (attempts < maxAttempts) {
      const sliderGone = await this.page.$('.tencent-captcha-dy__slider-groove');
      if (!sliderGone) {
        console.log('  滑块验证已关闭 ✓\n');
        break;
      }
      
      // 检查是否验证成功
      const isSuccess = await this.page.$('.tencent-captcha-dy__verify-status-img--success');
      if (isSuccess) {
        console.log('  滑块验证成功 ✓\n');
        break;
      }
      
      await this.page.waitForTimeout(1000);
      attempts++;
    }
    
    if (attempts >= maxAttempts) {
      console.log('  滑块验证等待超时，请手动完成验证\n');
    }
  }
  
  /**
   * 处理验证码：检测回显或提示手动输入
   */
  private async handleVerificationCode(loginPage: LoginPage): Promise<void> {
    // 等待验证码回显
    console.log('  等待验证码回显...\n');
    await this.page.waitForTimeout(3000);
    
    // 检查验证码是否已回显
    const verifyCode = await this.getVerificationCode();
    
    if (verifyCode && verifyCode.length >= 4) {
      // 验证码已自动回显
      console.log(`  ✓ 检测到验证码已回显: ${verifyCode}`);
      console.log('  自动点击登录...\n');
      await loginPage.clickLogin();
    } else {
      // 验证码未回显，提示用户手动输入
      console.log('  ✗ 验证码未自动回显');
      console.log('');
      console.log('  ========================================');
      console.log('  请手动输入验证码');
      console.log('  ========================================');
      console.log('  1. 在手机上查看验证码');
      console.log('  2. 在页面验证码输入框中输入');
      console.log('  3. 系统会自动检测并点击登录\n');
      
      // 等待用户手动输入验证码
      await this.waitForCodeInputAndLogin(loginPage);
    }
  }
  
  /**
   * 等待用户手动输入验证码并自动点击登录
   */
  private async waitForCodeInputAndLogin(loginPage: LoginPage): Promise<void> {
    let attempts = 0;
    const maxAttempts = 120; // 最多等待 2 分钟
    
    while (attempts < maxAttempts) {
      // 检查验证码输入框是否有值
      const verifyCode = await this.getVerificationCode();
      
      if (verifyCode && verifyCode.length >= 4) {
        console.log(`  ✓ 检测到验证码已输入: ${verifyCode}`);
        console.log('  自动点击登录...\n');
        
        // 等待一小段时间确保输入完成
        await this.page.waitForTimeout(500);
        
        // 点击登录按钮
        await loginPage.clickLogin();
        return;
      }
      
      await this.page.waitForTimeout(1000);
      attempts++;
      
      // 每 30 秒提示一次
      if (attempts % 30 === 0) {
        console.log(`  仍在等待验证码输入... (${attempts}秒)`);
      }
    }
    
    console.log('  验证码输入等待超时');
  }
  
  /**
   * 获取验证码（多种方式尝试）
   */
  private async getVerificationCode(): Promise<string> {
    try {
      // 方式1: 直接从输入框获取
      const code = await this.page.evaluate(() => {
        const input = document.querySelector('#form_item_password') as HTMLInputElement;
        return input ? input.value : '';
      });
      
      if (code && /^\d{4,6}$/.test(code)) {
        return code;
      }
      
      // 方式2: 检查所有 input
      const allCode = await this.page.evaluate(() => {
        const inputs = document.querySelectorAll('input');
        for (const input of inputs) {
          const val = (input as HTMLInputElement).value;
          if (val && /^\d{4,6}$/.test(val)) {
            return val;
          }
        }
        return '';
      });
      
      return allCode;
    } catch (e) {
      return '';
    }
  }
  
  /**
   * 使用验证码完成登录
   * @param verifyCode 收到的验证码
   */
  async loginWithCode(verifyCode: string): Promise<Page> {
    const loginPage = new LoginPage(this.page);
    
    console.log(`使用验证码登录: ${verifyCode}`);
    await loginPage.enterVerifyCode(verifyCode);
    await loginPage.clickLogin();
    
    await this.page.waitForTimeout(3000);
    console.log('登录完成');
    console.log(`当前页面: ${this.page.url()}\n`);
    
    return this.page;
  }
  
  /**
   * 获取当前登录状态
   */
  async isLoggedIn(): Promise<boolean> {
    const currentUrl = this.page.url();
    return !currentUrl.includes('/login');
  }
}

/**
 * 快捷登录函数
 */
export async function autoLogin(page: Page): Promise<Page> {
  const loginHelper = new LoginHelper(page);
  return await loginHelper.login();
}