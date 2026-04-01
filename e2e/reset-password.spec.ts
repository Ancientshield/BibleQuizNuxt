import { test, expect } from '@playwright/test';

test.describe('Reset Password Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reset-password?token=test-token', { waitUntil: 'networkidle' });
  });

  test('should display page elements', async ({ page }) => {
    await expect(page.locator('.reset-page__title')).toHaveText('設定新密碼');
    await expect(page.locator('.reset-page__subtitle')).toHaveText('請輸入你的新密碼。');
    await expect(page.locator('input[placeholder="新密碼"]')).toBeVisible();
    await expect(page.locator('input[placeholder="確認新密碼"]')).toBeVisible();
    await expect(page.locator('.reset-page__submit-text')).toHaveText('設定新密碼');
  });

  test('should show hint text', async ({ page }) => {
    await expect(page.locator('.reset-page__hint')).toHaveText('密碼至少 8 個字元');
  });

  test('should have back to login link', async ({ page }) => {
    await expect(page.locator('.reset-page__back-link')).toContainText('返回登入');
  });

  test('should show error when passwords do not match', async ({ page }) => {
    await page.locator('input[placeholder="新密碼"]').fill('password123');
    await page.locator('input[placeholder="確認新密碼"]').fill('password456');
    await page.locator('.reset-page__submit-text').click();

    await expect(page.locator('.reset-page__error')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.reset-page__error')).toContainText('兩次密碼不一致');
  });

  test('should show error when password too short', async ({ page }) => {
    await page.locator('input[placeholder="新密碼"]').fill('short');
    await page.locator('input[placeholder="確認新密碼"]').fill('short');
    await page.locator('.reset-page__submit-text').click();

    await expect(page.locator('.reset-page__error')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.reset-page__error')).toContainText('至少 8 個字元');
  });

  test('should toggle password visibility', async ({ page }) => {
    const passwordInput = page.locator('input[placeholder="新密碼"]');
    await expect(passwordInput).toHaveAttribute('type', 'password');

    await page.locator('.reset-page__eye').click();
    await expect(passwordInput).toHaveAttribute('type', 'text');
  });

  test('should show error when token is missing', async ({ page }) => {
    await page.goto('/reset-password', { waitUntil: 'networkidle' });
    await page.locator('input[placeholder="新密碼"]').fill('validpass123');
    await page.locator('input[placeholder="確認新密碼"]').fill('validpass123');
    await page.locator('.reset-page__submit-text').click();

    await expect(page.locator('.reset-page__error')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.reset-page__error')).toContainText('缺少 token');
  });
});
