import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login', { waitUntil: 'networkidle' });
  });

  test('should display login form by default', async ({ page }) => {
    await expect(page.locator('.login-page__title')).toHaveText('歡迎回來');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('.login-page__submit-text')).toHaveText('登入');
  });

  test('should toggle to register mode', async ({ page }) => {
    // Ensure Vue hydration is complete — click and verify, retry if needed
    await expect(async () => {
      await page.locator('.login-page__toggle').click();
      await expect(page.locator('.login-page__title')).toHaveText('建立帳號', { timeout: 2000 });
    }).toPass({ timeout: 10_000 });
    await expect(page.locator('.login-page__submit-text')).toHaveText('註冊');
    await expect(page.locator('.login-page__hint')).toHaveText('密碼至少 8 個字元');
  });

  test('should toggle back to login mode', async ({ page }) => {
    await page.locator('.login-page__toggle').click();
    await expect(page.locator('.login-page__title')).toHaveText('建立帳號');

    await page.locator('.login-page__toggle').click();
    await expect(page.locator('.login-page__title')).toHaveText('歡迎回來');
  });

  test('should have 4 social login buttons', async ({ page }) => {
    const socialBtns = page.locator('.login-page__social-btn');
    await expect(socialBtns).toHaveCount(4);
    await expect(socialBtns.nth(0)).toContainText('Google');
    await expect(socialBtns.nth(1)).toContainText('LINE');
    await expect(socialBtns.nth(2)).toContainText('GitHub');
    await expect(socialBtns.nth(3)).toContainText('X');
  });

  test('should have divider with "或" text', async ({ page }) => {
    await expect(page.locator('.login-page__divider-text')).toHaveText('或');
  });

  test('should have forgot password link in login mode', async ({ page }) => {
    await expect(page.locator('.login-page__forgot')).toHaveText('忘記密碼？');
  });

  test('should hide forgot password in register mode', async ({ page }) => {
    await page.locator('.login-page__toggle').click();
    await expect(page.locator('.login-page__title')).toHaveText('建立帳號');
    await expect(page.locator('.login-page__forgot')).toBeHidden();
  });

  test('should navigate to forgot-password page', async ({ page }) => {
    await page.locator('.login-page__forgot').click();
    await page.waitForURL('**/forgot-password', { timeout: 10_000 });
    expect(page.url()).toContain('/forgot-password');
  });

  test('should toggle password visibility', async ({ page }) => {
    const passwordInput = page.locator('input[autocomplete="current-password"]');
    await expect(passwordInput).toHaveAttribute('type', 'password');

    await page.locator('.login-page__eye').click();
    await expect(passwordInput).toHaveAttribute('type', 'text');

    await page.locator('.login-page__eye').click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('should show error on invalid login', async ({ page }) => {
    await page.locator('input[type="email"]').fill('wrong@example.com');
    await page.locator('input[autocomplete="current-password"]').fill('wrongpassword');
    await page.locator('.login-page__submit-text').click();

    await expect(page.locator('.login-page__error')).toBeVisible({ timeout: 10_000 });
  });

  test('should have footer text', async ({ page }) => {
    await expect(page.locator('.login-page__footer')).toContainText('服務條款');
  });
});
