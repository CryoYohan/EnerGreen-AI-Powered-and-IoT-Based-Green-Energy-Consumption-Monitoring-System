import { test, expect } from '@playwright/test';

test('User can register and log in to view dashboard', async ({ page }) => {
  // 1. Generate unique credentials
  const uniqueId = Date.now();
  const email = `test-${uniqueId}@energreen.test`;
  const password = 'Password123!'; // Meets complexity requirements

  // 2. Go to the application root
  await page.goto('/');

  // 3. Open Sign-up Modal
  await page.click('button:has-text("Sign-up")');
  await expect(page.locator('text=Create Account')).toBeVisible();

  // 4. Fill Registration Form
  await page.fill('input[type="text"]', 'Test User'); // Full Name (first text input)
  // Specific selectors based on AuthModal structure
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="tel"]').fill('09123456789');
  
  // Address is the text input after phone, but let's be more specific if possible or rely on order if classes are same
  // Looking at AuthModal, Address is after Phone. 
  // We can use placeholders if they existed, but they don't.
  // We'll target by label text to be robust.
  await page.locator('label:has-text("Address") + input').fill('123 Test St');
  
  await page.selectOption('select', 'veco'); // Electricity Provider

  // Password fields
  await page.locator('label:has-text("Password") + input').fill(password);
  await page.locator('label:has-text("Confirm Password") + input').fill(password);

  // 5. Submit Registration
  await page.click('button:has-text("Sign up")');

  // 6. Wait for "Verify Email" screen (indicates success)
  await expect(page.locator('text=Verify Email')).toBeVisible({ timeout: 10000 });
  await expect(page.locator(`text=${email}`)).toBeVisible();

  // 7. Go to Login
  // The verification screen has a "Resend" button, but we want to switch to login.
  // The modal has a toggle at the bottom, or we can close and re-open.
  // Actually, AuthModal logic shows "Verify Email" state which might hide the "Log in" toggle.
  // But wait, the "Verify Email" block in AuthModal.vue DOES NOT have a "Go to Login" button immediately visible
  // unless we use the toggle at the bottom if it's rendered, OR if we rely on the implementation.
  // Looking at AuthModal code: 
  // <template v-else-if="isVerifyingEmail"> ... </template> -> This block replaces the form.
  // It does NOT show the "Already have an account? Log in" button.
  // Users typically close the modal or click a back button? 
  // WAIT: "isVerifyingEmail" block has NO back button in the code I read.
  // Users must close the modal.
  
  await page.click('.fixed.inset-0'); // Click backdrop to close
  // OR click the close button if it exists? The modal uses @click.self="closeModal" on the backdrop.
  // Let's force a reload or click backdrop.
  await page.mouse.click(10, 10); // Click top-left corner (backdrop)
  
  // 8. Open Login Modal
  await page.click('button:has-text("Log-in")');
  await expect(page.locator('text=Log in Account')).toBeVisible();

  // 9. Fill Login Credentials
  await page.locator('input[type="email"]').fill(email);
  await page.locator('label:has-text("Password") + input').fill(password);

  // 10. Submit Login
  await page.click('button:has-text("Log in")');

  // 11. Wait for redirection to Home
  await page.waitForURL('**/home', { timeout: 15000 });

  // 12. Verify Dashboard
  // Check for a unique element on the Home page
  await expect(page.locator('text=Energy Consumption')).toBeVisible();
});
