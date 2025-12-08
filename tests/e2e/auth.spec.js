import { test, expect } from '@playwright/test';

test('User can log in and view dashboard', async ({ page }) => {
  // 1. Go to the application root (Landing Page)
  await page.goto('/');

  // 2. Click the main Login button to open the Auth Modal
  // Note: Adjust selector if your button text is different (e.g. "Sign In")
  await page.click('button:has-text("Log-in")'); 

  // Wait for modal to open
  await expect(page.locator('text=Welcome to EnerGreen!')).toBeVisible();

  // 3. Fill in credentials
  // Ideally, use a dedicated test account in your Firebase Emulator or Project
  await page.fill('input[type="email"]', 'testuser@example.com');
  await page.fill('input[type="password"]', 'password123');

  // 4. Submit the login form
  // Looking for the submit button within the modal
  await page.click('button[type="submit"]');

  // 5. Wait for successful redirection
  // Based on your router, users go to '/home' after login
  await page.waitForURL('**/home');

  // 6. Verify a core element is visible to confirm dashboard loaded
  // Example: Checking for "Welcome" text or a specific chart
  await expect(page.locator('text=Total Energy Consumption')).toBeVisible();
});
