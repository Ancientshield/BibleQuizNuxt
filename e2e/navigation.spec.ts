import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('homepage → start → answer all → result → restart', async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page.locator('.home-page__title')).toHaveText('Bible Quiz');

    await page.locator('.home-page__start-btn').dispatchEvent('click');
    await page.waitForURL('**/start', { timeout: 10_000 });

    await expect(page.locator('.quiz-page__question-area')).toBeVisible({ timeout: 10_000 });

    for (let i = 0; i < 10; i++) {
      const firstOption = page.locator('.option-btn').first();
      await expect(firstOption).toBeEnabled();
      await firstOption.click();

      if (i < 9) {
        await page.waitForTimeout(1800);
        await expect(page.locator('.option-btn').first()).toBeEnabled({ timeout: 3000 });
      }
    }

    await expect(page.locator('.result-board')).toBeVisible({ timeout: 5000 });
    await page.locator('.result-board__restart').dispatchEvent('click');
    await expect(page.locator('.quiz-page__question-area')).toBeVisible({ timeout: 10_000 });
  });

  test('login → forgot password → back to login', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'networkidle' });
    await expect(page.locator('.login-page__title')).toHaveText('歡迎回來');

    await page.locator('.login-page__forgot').click();
    await page.waitForURL('**/forgot-password', { timeout: 10_000 });
    await expect(page.locator('.forgot-page__title')).toHaveText('忘記密碼');

    await page.locator('.forgot-page__back-link').click();
    await page.waitForURL('**/login', { timeout: 10_000 });
    await expect(page.locator('.login-page__title')).toHaveText('歡迎回來');
  });

  test('reset password → back to login', async ({ page }) => {
    await page.goto('/reset-password?token=test', { waitUntil: 'networkidle' });
    await expect(page.locator('.reset-page__title')).toHaveText('設定新密碼');

    await page.locator('.reset-page__back-link').click();
    await page.waitForURL('**/login', { timeout: 10_000 });
    await expect(page.locator('.login-page__title')).toHaveText('歡迎回來');
  });
});
