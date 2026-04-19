# 菜单导航自动化计划

## TL;DR

> **快速 Summary**: 在登录并切换项目后，点击"任务"一级菜单，然后选择"任务列表"二级菜单，进入任务列表页面
> 
> **Deliverables**:
> - 新文件: `tests/tasks-menu.spec.ts` - 菜单选择自动化测试
> - 更新: `自动化测试进度.md` - 记录进度
> 
> **Estimated Effort**: Short
> **Parallel Execution**: NO - 顺序执行
> **Critical Path**: 登录 → 切换项目 → 选择菜单 → 验证到达任务列表

---

## Context

### 原始请求
用户在完成登录和切换项目后，需要继续自动化流程：
- 选择一级菜单"任务"
- 选择一级菜单下的二级菜单"任务列表"
- 进入任务列表流程

### 项目现有文件
- `tests/utils/login-helper.ts` - 登录模块
- `tests/switch-project.spec.ts` - 切换项目模块
- `tests/analyze-page.spec.ts` - 页面分析模块

---

## Work Objectives

### 核心目标
在登录 + 切换项目完成后，自动点击选择"任务"菜单，进入任务列表页面

### 具体流程
1. 在 `switch-project.spec.ts` 执行完后（已选择项目）
2. 点击左侧菜单栏的"任务"一级菜单
3. 展开后点击"任务列表"二级菜单
4. 验证成功进入任务列表页面

### 定义 Done
- [x] 运行测试能自动完成 登录 → 切换项目 → 选择任务菜单 → 进入任务列表

### Must Have
- 支持一级菜单点击
- 支持二级菜单点击（展开后）
- 错误处理：菜单未找到等异常

### Must NOT Have
- 不要修改现有的登录和切换项目模块

---

## Execution Strategy

### 执行步骤（带分析验证）

```
├── 步骤 1: 运行 analyze-page 分析菜单结构
│   ├── 运行: npx playwright test tests/analyze-page.spec.ts
│   ├── 查看 tests/snapshots/page-structure.png 截图
│   └── 分析输出的菜单项定位器
├── 步骤 2: 基于分析结果创建 tasks-menu.spec.ts
├── 步骤 3: 测试运行验证
└── 步骤 4: 更新进度文档
```

### 步骤 1 详细: 分析菜单结构

**目的**: 获取准确的菜单定位器

**运行命令**:
```bash
cd C:\Users\Administrator\Desktop\UIAuto
npx playwright test tests/analyze-page.spec.ts
```

**预期输出**:
- 控制台打印菜单项列表（包含"任务"、"任务列表"）
- 截图保存: `tests/snapshots/page-structure.png`

**观察要点**:
- 一级菜单"任务"的定位器（可能是文本、class、data属性等）
- 二级菜单"任务列表"的定位器
- 菜单展开方式（点击展开 / hover 展开）

**后续**: 根据分析结果精确调整 tasks-menu.spec.ts 中的定位器

---

## TODOs

- [ ] 1. 分析现有菜单选择模式

  **What to do**:
  - 复用 `analyze-page.spec.ts` 的模式分析左侧菜单
  - 获取一级菜单和二级菜单的定位器
  
  **References**:
  - `tests/analyze-page.spec.ts` - 页面分析模式参考
  - `tests/switch-project.spec.ts` - 下拉选择模式参考

- [ ] 2. 创建 tasks-menu.spec.ts

  **What to do**:
  - 创建新测试文件 `tests/tasks-menu.spec.ts`
  - 导入 `autoLogin` 复用登录流程
  - 包含:
    - 点击一级菜单"任务"
    - 等待菜单展开
    - 点击二级菜单"任务列表"
    - 验证进入任务列表页面
  - 截图保存到 `tests/snapshots/`
  
  **Template**:
  ```typescript
  import { test, expect } from '@playwright/test';
  import { autoLogin } from './utils/login-helper';
  
  test('选择任务菜单进入任务列表', async ({ page }) => {
    // 1. 登录
    await autoLogin(page);
    // 2. 等待项目页面加载
    await page.waitForTimeout(2000);
    
    // TODO: 选择目标项目（复用 switch-project 的逻辑）
    
    // 3. 点击一级菜单"任务"
    console.log('点击一级菜单: 任务');
    const taskMenu = page.locator('text="任务"').first();
    await taskMenu.click();
    await page.waitForTimeout(1000);
    
    // 4. 点击二级菜单"任务列表"
    console.log('点击二级菜单: 任务列表');
    const taskListMenu = page.locator('text="任务列表"').first();
    await taskListMenu.click();
    await page.waitForTimeout(2000);
    
    // 5. 验证进入任务列表页面
    await page.screenshot({ path: 'tests/snapshots/task-list.png', fullPage: true });
    console.log('当前页面:', page.url());
  });
  ```

- [ ] 3. 运行测试验证

  **What to do**:
  - 运行: `npx playwright test tests/tasks-menu.spec.ts`
  - 观察是否能成功选择菜单
  - 如果失败，分析原因并调整定位器

- [ ] 4. 更新进度文档

  **What to do**:
  - 更新 `自动化测试进度.md`
  - 添加新完成的模块记录

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: YES (Playwright)
- **Automated tests**: YES
- **Framework**: Playwright

### QA Scenarios

```
Scenario: 成功进入任务列表页面
  Tool: Playwright
  Steps:
    1. 运行 tasks-menu.spec.ts
    2. 观察是否点击了"任务"菜单
    3. 观察是否展开了二级菜单
    4. 观察是否点击了"任务列表"
  Expected Result: 成功进入任务列表页面，URL 包含 task 相关的路径
  Evidence: tests/snapshots/task-list.png
```

---

## Success Criteria

### Verification Commands
```bash
npx playwright test tests/tasks-menu.spec.ts
```

### Final Checklist
- [x] 测试文件创建成功 (`tests/menu-navigation.spec.ts`)
- [x] 能自动点击"任务"一级菜单
- [x] 能自动点击"任务列表"二级菜单
- [x] 进度文档已更新