/**
 * 任务页面 - Page Object 模型
 * 
 * 包含任务相关页面的元素定位器和操作方法
 */

import { Page } from '@playwright/test';

/**
 * 任务菜单页面对象
 */
export class TasksPage {
  private page: Page;
  
  constructor(page: Page) {
    this.page = page;
  }
  
  /**
   * 一级菜单定位器 - "任务"
   */
  get firstLevelMenuTask() {
    return this.page.locator('text="任务"').first();
  }
  
  /**
   * 二级菜单定位器 - "任务列表"
   */
  get secondLevelMenuTaskList() {
    return this.page.locator('text="任务列表"').first();
  }
  
  /**
   * 点击一级菜单 "任务"
   */
  async clickFirstLevelMenu() {
    await this.firstLevelMenuTask.click();
    await this.page.waitForTimeout(1000);
  }
  
  /**
   * 点击二级菜单 "任务列表"
   */
  async clickSecondLevelMenu() {
    await this.secondLevelMenuTaskList.click();
    await this.page.waitForTimeout(2000);
  }
  
  /**
   * 选择任务菜单并进入任务列表
   */
  async navigateToTaskList() {
    await this.clickFirstLevelMenu();
    await this.clickSecondLevelMenu();
  }
  
  /**
   * 验证是否在任务列表页面
   */
  async isOnTaskListPage(): Promise<boolean> {
    const url = this.page.url();
    return url.includes('/task') || url.includes('/Task');
  }
}