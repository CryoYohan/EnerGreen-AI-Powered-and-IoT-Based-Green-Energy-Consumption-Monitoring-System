import { test, expect } from '@playwright/test';

test.describe('User Dashboard', () => {

  // credentials to use - REPLACE THESE WITH REAL TEST DATA
  const TEST_EMAIL = 'kbbryan.amaro@gmail.com';
  const TEST_PASSWORD = 'Kobe12345;';

  test('should allow user to log in and view dashboard', async ({ page }) => {
    await page.goto('/');

    // 1. Open Login Modal
    await page.locator('header button', { hasText: 'Log-in' }).first().click();

    // 2. Fill Form
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);

    // 3. Submit
    await page.click('button[type="submit"]');

    // 4. Verify Redirect or Error
    try {
      // Wait for URL to be /home OR /adminhome
      await page.waitForURL(/.*\/home|.*\/adminhome/, { timeout: 10000 });
    } catch (error) {
      console.log('Redirect failed. Current URL:', page.url());

      // Check if an error message is visible
      const errorAlert = page.locator('.swal2-popup, .alert, text=Error');
      if (await errorAlert.isVisible()) {
        console.log('Login Error found:', await errorAlert.textContent());
        throw new Error('Login failed: UI showed an error message.');
      }

      throw error; // Re-throw timeout if no error message found
    }

    // 5. Verify Dashboard Content
    // We check for elements we KNOW exist in Home.vue
    await expect(page.getByRole('heading', { name: /Welcome/i })).toBeVisible();
    await expect(page.locator('text=Current Cost').or(page.locator('text=System Overview'))).toBeVisible();
  });

});
