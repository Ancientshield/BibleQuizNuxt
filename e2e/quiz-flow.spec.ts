import { test, expect } from '@playwright/test';

test.describe('Quiz Flow', () => {
  test('should load quiz page and display first question', async ({ page }) => {
    await page.goto('/start');
    await expect(page.locator('.quiz-page__question-area')).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('.option-btn')).toHaveCount(4);
  });

  test('should complete full 10-question quiz and show result board', async ({ page }) => {
    await page.goto('/start');
    await expect(page.locator('.quiz-page__question-area')).toBeVisible({ timeout: 10_000 });

    for (let i = 0; i < 10; i++) {
      const firstOption = page.locator('.option-btn').first();
      await expect(firstOption).toBeVisible();
      await expect(firstOption).toBeEnabled();
      await firstOption.click();

      if (i < 9) {
        await page.waitForTimeout(1800);
        await expect(page.locator('.option-btn').first()).toBeEnabled({ timeout: 3000 });
      }
    }

    await expect(page.locator('.result-board')).toBeVisible({ timeout: 5000 });
  });

  test('should show score and tagline on result board', async ({ page }) => {
    await page.goto('/start');
    await expect(page.locator('.quiz-page__question-area')).toBeVisible({ timeout: 10_000 });

    for (let i = 0; i < 10; i++) {
      const firstOption = page.locator('.option-btn').first();
      await expect(firstOption).toBeVisible();
      await expect(firstOption).toBeEnabled();
      await firstOption.click();

      if (i < 9) {
        await page.waitForTimeout(1800);
        await expect(page.locator('.option-btn').first()).toBeEnabled({ timeout: 3000 });
      }
    }

    await expect(page.locator('.result-board')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.result-board__ring-score')).toBeVisible();
    await expect(page.locator('.result-board__ring-divider')).toHaveText('/10');
    await expect(page.locator('.result-board__xp')).toContainText('XP');
    await expect(page.locator('.result-board__tagline')).toBeVisible();
  });

  test('should restart quiz when clicking restart button', async ({ page }) => {
    await page.goto('/start');
    await expect(page.locator('.quiz-page__question-area')).toBeVisible({ timeout: 10_000 });

    for (let i = 0; i < 10; i++) {
      const firstOption = page.locator('.option-btn').first();
      await expect(firstOption).toBeVisible();
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
    await expect(page.locator('.option-btn')).toHaveCount(4);
  });

  test('should show correct/wrong states after answering', async ({ page }) => {
    await page.goto('/start');
    await expect(page.locator('.quiz-page__question-area')).toBeVisible({ timeout: 10_000 });

    const firstOption = page.locator('.option-btn').first();
    await firstOption.click();

    await expect(page.locator('.option-btn--correct')).toBeVisible();

    const options = page.locator('.option-btn');
    const count = await options.count();
    for (let i = 0; i < count; i++) {
      await expect(options.nth(i)).toBeDisabled();
    }
  });

  test('should redirect to homepage if API fails', async ({ page }) => {
    await page.route('**/api/biblequiz/start', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    );

    await page.goto('/start');
    await page.waitForURL('**/', { timeout: 10_000 });
    expect(page.url()).not.toContain('/start');
  });
});
