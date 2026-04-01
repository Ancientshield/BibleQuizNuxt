import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
  });

  test('should display title and subtitle', async ({ page }) => {
    await expect(page.locator('.home-page__title')).toHaveText('Bible Quiz');
    await expect(page.locator('.home-page__subtitle')).toHaveText('測試你的聖經知識');
  });

  test('should display stats (10 questions, 100 XP)', async ({ page }) => {
    const stats = page.locator('.home-page__stat-value');
    await expect(stats.nth(0)).toHaveText('10');
    await expect(stats.nth(1)).toHaveText('100');
  });

  test('should have start button with correct text', async ({ page }) => {
    await expect(page.locator('.home-page__start-btn')).toBeVisible();
    await expect(page.locator('.home-page__start-btn-text')).toContainText('開始挑戰');
  });

  test('should display footer text', async ({ page }) => {
    await expect(page.locator('.home-page__footer-text')).toHaveText('準備好了嗎？點擊開始測試你的聖經知識！');
  });

  test('should have floating particles', async ({ page }) => {
    const particles = page.locator('.home-page__particle');
    await expect(particles).toHaveCount(20);
  });

  test('should navigate to /start when start button clicked', async ({ page }) => {
    await page.locator('.home-page__start-btn').dispatchEvent('click');
    await page.waitForURL('**/start', { timeout: 10_000 });
    expect(page.url()).toContain('/start');
  });
});
