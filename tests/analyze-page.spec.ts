/**
 * 登录后页面结构分析
 * 分析首页的菜单、按钮、功能区域
 */

import { test } from '@playwright/test';
import { autoLogin } from './utils/login-helper';

test('分析登录后页面结构', async ({ page }) => {
  console.log('=== 登录并分析页面结构 ===\n');
  
  // 执行登录
  await autoLogin(page);
  
  // 等待登录成功
  console.log('等待页面加载...\n');
  await page.waitForTimeout(3000);
  
  // 分析页面结构
  const pageInfo = await page.evaluate(() => {
    const result: any = {
      title: document.title,
      url: window.location.href,
    };
    
    // 获取所有菜单项
    const menuItems: string[] = [];
    const menuSelectors = [
      'a[href]', 
      '.menu a', 
      '[class*="menu"] a',
      'nav a',
      '[class*="nav"] a',
      '.sidebar a',
      '.header a',
      '[class*="header"] a'
    ];
    
    menuSelectors.forEach(sel => {
      document.querySelectorAll(sel).forEach((el: any) => {
        const text = el.textContent?.trim();
        const href = el.href;
        if (text && text.length < 50 && href) {
          menuItems.push(`文本: ${text} | 链接: ${href}`);
        }
      });
    });
    result.menuItems = [...new Set(menuItems)];
    
    // 获取所有按钮
    const buttons: string[] = [];
    document.querySelectorAll('button, a[class*="btn"], [class*="button"]').forEach((el: any) => {
      const text = el.textContent?.trim();
      if (text && text.length < 30) {
        buttons.push(text);
      }
    });
    result.buttons = [...new Set(buttons)];
    
    // 获取主要功能区域
    const sections: string[] = [];
    const sectionSelectors = [
      '[class*="card"]',
      '[class*="panel"]',
      '[class*="box"]',
      '[class*="module"]',
      '[class*="section"]'
    ];
    
    sectionSelectors.forEach(sel => {
      document.querySelectorAll(sel).forEach((el: any, i) => {
        const text = el.textContent?.trim().substring(0, 100);
        if (text) {
          sections.push(`${sel}: ${text}`);
        }
      });
    });
    result.sections = sections.slice(0, 10);
    
    // 获取页面可见文本（前2000字符）
    result.pageText = document.body.innerText.substring(0, 2000);
    
    return result;
  });
  
  console.log('========== 页面结构分析 ==========\n');
  console.log(`页面标题: ${pageInfo.title}`);
  console.log(`URL: ${pageInfo.url}\n`);
  
  console.log('--- 菜单导航 ---');
  pageInfo.menuItems.forEach((item: string) => console.log(item));
  console.log('');
  
  console.log('--- 按钮 ---');
  pageInfo.buttons.forEach((btn: string) => console.log(btn));
  console.log('');
  
  console.log('--- 功能区域 ---');
  pageInfo.sections.forEach((sec: string) => console.log(sec));
  console.log('');
  
  console.log('--- 页面文本 ---');
  console.log(pageInfo.pageText);
  
  // 截图
  await page.screenshot({ path: 'tests/snapshots/page-structure.png', fullPage: true });
  console.log('\n截图已保存: tests/snapshots/page-structure.png');
  
  // 保持浏览器打开
  console.log('\n浏览器保持打开，请查看分析结果');
  await new Promise(() => {});
});