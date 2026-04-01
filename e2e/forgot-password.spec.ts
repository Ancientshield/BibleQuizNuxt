import { test, expect } from '@playwright/test';

test.describe('Forgot Password Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/forgot-password', { waitUntil: 'networkidle' });
  });

  test('should display page elements', async ({ page }) => {
    await expect(page.locator('.forgot-page__title')).toHaveText('忘記密碼');
    await expect(page.locator('.forgot-page__subtitle')).toContainText('輸入你的 Email');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('.forgot-page__submit-text')).toHaveText('寄送重設信');
  });

  test('should have back to login link', async ({ page }) => {
    await expect(page.locator('.forgot-page__back-link')).toContainText('返回登入');
  });

  test('should navigate back to login', async ({ page }) => {
    await page.locator('.forgot-page__back-link').click();
    await page.waitForURL('**/login');
    expect(page.url()).toContain('/login');
  });

  test('should submit form and show result', async ({ page }) => {
    await page.locator('input[type="email"]').fill('test@example.com');
    await page.locator('.forgot-page__submit-text').click();

    const result = page.locator('.forgot-page__success, .forgot-page__error');
    await expect(result).toBeVisible({ timeout: 10_000 });
  });
});
