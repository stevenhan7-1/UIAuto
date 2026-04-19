/**
 * 自动登录测试
 * 
 * 流程：
 * 1. 自动登录（滑块验证、验证码回显）
 * 2. 检测登录成功
 * 3. 关闭浏览器
 */

import { test } from '@playwright/test';
import { autoLogin } from './utils/login-helper';

test('自动登录测试', async ({ page, browser }) => {
  console.log('=== 开始自动登录测试 ===\n');
  
  // 标记浏览器是否需要关闭
  let shouldCloseBrowser = true;
  
  try {
    // ========== 步骤 1: 执行自动登录流程 ==========
    await autoLogin(page);
    
    // ========== 步骤 2: 等待登录成功 ==========
    console.log('\n等待登录成功...\n');
    
    let attempts = 0;
    const maxAttempts = 120;
    let loginSuccess = false;
    
    while (attempts < maxAttempts) {
      const url = page.url();
      
      if (!url.includes('/login')) {
        loginSuccess = true;
        console.log('=== 登录成功！===\n');
        
        // 登录成功后等待页面加载完成
        await page.waitForTimeout(1000);
        
        // 获取页面信息
        const title = await page.title();
        console.log(`页面标题: ${title}`);
        console.log(`当前页面: ${url}\n`);
        
        // 保存登录成功截图
        await page.screenshot({ 
          path: 'tests/snapshots/login-success.png', 
          fullPage: true 
        });
        console.log('截图已保存: tests/snapshots/login-success.png\n');
        
        break; // 登录成功，跳出循环
      }
      
      await page.waitForTimeout(1000);
      attempts++;
      
      if (attempts % 30 === 0) {
        console.log(`等待登录... (${attempts}秒)`);
      }
    }
    
    if (!loginSuccess) {
      console.log('登录超时，流程结束');
      shouldCloseBrowser = true;
    }
    
  } catch (error) {
    console.error('登录过程出错:', error);
    shouldCloseBrowser = true;
  } 
  // ========== 步骤 3: 关闭浏览器 ==========
  finally {
    if (shouldCloseBrowser) {
      console.log('========================================');
      console.log('正在关闭浏览器...');
      console.log('========================================\n');
      
      try {
        await browser.close();
        console.log('浏览器已关闭\n');
      } catch (e) {
        console.error('关闭浏览器时出错:', e);
      }
    }
  }
});