import { test, expect } from '@playwright/test';

const TEST_EMAIL = 'test@biblequiz.cc';
const TEST_PASSWORD = 'test1234';

/** Submit button 有 position: absolute 的裝飾層，直接點文字 span 繞過 */
const clickSubmit = async (page: import('@playwright/test').Page) => {
  await page.locator('.login-page__submit-text').click();
};

test.describe('Auth Flow (Email Login)', () => {
  test('should login with test account and redirect to homepage', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'networkidle' });

    await page.locator('input[type="email"]').fill(TEST_EMAIL);
    await page.locator('input[autocomplete="current-password"]').fill(TEST_PASSWORD);
    await clickSubmit(page);

    await page.waitForURL('**/', { timeout: 10_000 });
    expect(page.url()).not.toContain('/login');
  });

  test('should show user info after login', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'networkidle' });
    await page.locator('input[type="email"]').fill(TEST_EMAIL);
    await page.locator('input[autocomplete="current-password"]').fill(TEST_PASSWORD);
    await clickSubmit(page);

    await page.waitForURL('**/', { timeout: 10_000 });

    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeTruthy();
  });

  test('should show error with wrong password', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'networkidle' });
    await page.locator('input[type="email"]').fill(TEST_EMAIL);
    await page.locator('input[autocomplete="current-password"]').fill('wrongpassword');
    await clickSubmit(page);

    await expect(page.locator('.login-page__error')).toBeVisible({ timeout: 10_000 });
  });

  test('should show error with non-existent email', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'networkidle' });
    await page.locator('input[type="email"]').fill('nonexistent@example.com');
    await page.locator('input[autocomplete="current-password"]').fill('somepassword');
    await clickSubmit(page);

    await expect(page.locator('.login-page__error')).toBeVisible({ timeout: 10_000 });
  });

  test('should complete quiz while logged in', async ({ page }) => {
    test.setTimeout(60_000);

    await page.goto('/login', { waitUntil: 'networkidle' });
    await page.locator('input[type="email"]').fill(TEST_EMAIL);
    await page.locator('input[autocomplete="current-password"]').fill(TEST_PASSWORD);
    await clickSubmit(page);
    await page.waitForURL('**/', { timeout: 10_000 });

    await page.waitForLoadState('networkidle');
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
    await expect(page.locator('.result-board__ring-score')).toBeVisible();
  });
});
