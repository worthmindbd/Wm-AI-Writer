import { test, expect } from '@playwright/test';

test.describe('Theme Colors Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
  });

  test('Light mode colors', async ({ page }) => {
    // Ensure we're in light mode
    await page.waitForLoadState('networkidle');

    // Check html element for dark class (should not have it in light mode)
    const htmlElement = page.locator('html');
    const hasDarkClass = await htmlElement.evaluate((el) => el.classList.contains('dark'));
    console.log('Has dark class in light mode:', hasDarkClass);
    expect(hasDarkClass).toBeFalsy();

    // Check computed background of the page (should be cream)
    const body = page.locator('body');
    const bgColor = await body.evaluate((el) => {
      return window.getComputedStyle(document.documentElement).backgroundColor;
    });
    console.log('Light mode background color:', bgColor);

    // Check if background is approximately cream color
    expect(bgColor).toBe('rgb(253, 252, 248)');

    // Check text color is dark earth brown (#3D3B35)
    const textColor = await body.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });
    console.log('Light mode text color:', textColor);
    expect(textColor).toBe('rgb(61, 59, 53)');

    // Check card backgrounds are white
    const card = page.locator('.card').first();
    const cardBg = await card.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    console.log('Light mode card background:', cardBg);
    expect(cardBg).toBe('rgb(255, 255, 255)');

    // Check primary buttons use forest green (#2D5016)
    const button = page.locator('.btn-primary').first();
    const buttonBg = await button.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    console.log('Light mode button background:', buttonBg);
    expect(buttonBg).toBe('rgb(45, 80, 22)');
  });

  test('Dark mode colors', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Click dark mode toggle
    const toggle = page.locator('[aria-label="Toggle theme"]');
    await toggle.click();

    // Wait for dark mode to apply
    await page.waitForTimeout(500);

    // Check background is dark earth (#1A1E18)
    const htmlElement = page.locator('html');
    const bgColor = await htmlElement.evaluate((el) => {
      return window.getComputedStyle(document.documentElement).backgroundColor;
    });
    console.log('Dark mode background color:', bgColor);
    expect(bgColor).toBe('rgb(26, 30, 24)');

    // Check text color is light cream (#E8E6DD)
    const textColor = await body.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });
    console.log('Dark mode text color:', textColor);
    expect(textColor).toBe('rgb(232, 230, 221)');

    // Check card backgrounds are darker earth (#252B23)
    const card = page.locator('.card').first();
    const cardBg = await card.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    console.log('Dark mode card background:', cardBg);
    expect(cardBg).toBe('rgb(37, 43, 35)');

    // Check primary buttons use light forest green (#4A7C2D)
    const button = page.locator('.btn-primary').first();
    const buttonBg = await button.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    console.log('Dark mode button background:', buttonBg);
    expect(buttonBg).toBe('rgb(74, 124, 45)');
  });

  test('Theme toggle works', async ({ page }) => {
    // Initial state should be light or based on localStorage
    const htmlElement = page.locator('html');
    const initialClass = await htmlElement.getAttribute('class');
    console.log('Initial html classes:', initialClass);

    // Click toggle
    const toggle = page.locator('[aria-label="Toggle theme"]');
    await toggle.click();
    await page.waitForTimeout(500);

    // Check dark class is added
    const afterFirstClick = await htmlElement.getAttribute('class');
    console.log('After first click html classes:', afterFirstClick);
    expect(afterFirstClick).toContain('dark');

    // Click toggle again
    await toggle.click();
    await page.waitForTimeout(500);

    // Check dark class is removed
    const afterSecondClick = await htmlElement.getAttribute('class');
    console.log('After second click html classes:', afterSecondClick);
    expect(afterSecondClick).not.toContain('dark');
  });
});
