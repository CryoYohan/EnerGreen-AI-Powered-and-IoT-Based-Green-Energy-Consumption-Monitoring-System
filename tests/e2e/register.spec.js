import { test, expect } from '@playwright/test';

test.describe('User Registration', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should allow a new user to sign up', async ({ page }) => {
    // 1. Generate a unique email to avoid "Email already in use" errors
    const uniqueId = Date.now();
    const testEmail = `e2e_test_${uniqueId}@energreen.com`;
    const testPass = 'TestPass123!';

    // 2. Open Login Modal
    await page.locator('header button', { hasText: 'Sign-up' }).first().click();

    // 3. Verify we are in Register mode (or switch to it if using Login button)
    // Since we clicked "Sign-up" button in header, prop initialMode='register' should be passed.
    // Let's verify the heading.
    await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible();

    // 4. Fill out the form
    await page.fill('input[type="text"]', 'E2E Test User'); // Full Name (first text input)
    
    // Use specific locators for others to avoid ambiguity
    // Note: AuthModal has multiple text inputs. We need to be careful.
    // Full Name is the first text input in register mode.
    // We can rely on labels if they have `for` attributes or text association, 
    // but the code uses: <label class="block text-white">Full Name</label> <input ...>
    // Playwright's `getByLabel` works best if inputs are nested or have `id`/`for`.
    // In AuthModal.vue, inputs are NOT inside labels and most don't have ids.
    // We'll use layout order or generic selectors combined with filtering.

    const modal = page.locator('.fixed.inset-0'); // Scope to modal

    await modal.getByText('Full Name').locator('..').locator('input').fill('E2E Test User');
    await modal.getByText('Email').locator('..').locator('input').fill(testEmail);
    await modal.getByText('Phone Number').locator('..').locator('input').fill('09123456789');
    await modal.getByText('Address').locator('..').locator('input').fill('123 Test St, Cebu City');
    
    // Select Provider
    await modal.locator('select').selectOption('veco');

    // Password (needs complex validation: 8 chars, upper, lower, number, special)
    // 'TestPass123!' meets criteria.
    // There are two password fields (Password and Confirm).
    // We can find them by placeholder (if any) or order.
    // The code: label "Password" -> input id="password"
    // The code: label "Confirm Password" -> input id="confirmPassword"
    
    await modal.locator('#password').fill(testPass);
    await modal.locator('#confirmPassword').fill(testPass);

    // 5. Submit
    await modal.getByRole('button', { name: 'Sign up' }).click();

    // 6. Verify Success State
    // The modal should transition to "Verify Email"
    await expect(page.getByRole('heading', { name: 'Verify Email' })).toBeVisible({ timeout: 15000 });
    await expect(page.locator(`text=${testEmail}`)).toBeVisible();
  });

  test('should validate password complexity', async ({ page }) => {
    await page.locator('header button', { hasText: 'Sign-up' }).first().click();
    
    const modal = page.locator('.fixed.inset-0');
    const passwordInput = modal.locator('#password');

    // Enter weak password
    await passwordInput.fill('weak');
    
    // Check for error message (Realtime validation)
    await expect(modal.getByText('Password must be at least 8 characters long.')).toBeVisible();

    // Enter password without special char
    await passwordInput.fill('WeakPassword123');
    await expect(modal.getByText('Must contain at least one special character')).toBeVisible();
  });

});
