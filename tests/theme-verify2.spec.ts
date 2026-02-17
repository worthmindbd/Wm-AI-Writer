import { test, expect } from '@playwright/test';

test.describe('Theme Colors Verification', () => {
  test('Light mode colors', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');

    // Ensure light mode
    const htmlElement = page.locator('html');
    const hasDarkClass = await htmlElement.evaluate((el) => el.classList.contains('dark'));
    if (hasDarkClass) {
      const toggle = page.locator('[aria-label="Toggle theme"]');
      await toggle.click();
      await page.waitForTimeout(500);
    }

    // Check that dark class is not present
    const finalHasDark = await htmlElement.evaluate((el) => el.classList.contains('dark'));
    expect(finalHasDark).toBeFalsy();

    // The background is transparent, so we need to check the actual rendered background
    // Get the computed background color of the main container (has bg-cream class)
    const mainBg = await page.locator('.min-h-screen').evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    console.log('Light mode main container background:', mainBg);
    // Should be cream #FDFCF8
    expect(mainBg).toBe('rgb(253, 252, 248)');

    // Check text color on main container
    const mainText = await page.locator('.min-h-screen').evaluate((el) => {
      return window.getComputedStyle(el).color;
    });
    console.log('Light mode main container text:', mainText);
    // Should be dark earth brown #3D3B35
    expect(mainText).toBe('rgb(61, 59, 53)');

    // Check button uses forest green
    const button = page.locator('.btn-primary').first();
    const buttonBg = await button.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    console.log('Light mode button background:', buttonBg);
    expect(buttonBg).toBe('rgb(45, 80, 22)'); // #2D5016

    // Check hero heading color
    const heading = page.locator('h1').first();
    const headingColor = await heading.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });
    console.log('Light mode heading color:', headingColor);
    expect(headingColor).toBe('rgb(45, 80, 22)'); // forest green
  });

  test('Dark mode colors', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');

    // Click to dark mode
    const toggle = page.locator('[aria-label="Toggle theme"]');
    await toggle.click();
    await page.waitForTimeout(500);

    // Check dark class is present
    const htmlElement = page.locator('html');
    const hasDarkClass = await htmlElement.evaluate((el) => el.classList.contains('dark'));
    expect(hasDarkClass).toBeTruthy();

    // Check main container background is dark earth
    const mainBg = await page.locator('.min-h-screen').evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    console.log('Dark mode main container background:', mainBg);
    // Should be dark earth #1A1E18
    expect(mainBg).toBe('rgb(26, 30, 24)');

    // Check text color is light cream
    const mainText = await page.locator('.min-h-screen').evaluate((el) => {
      return window.getComputedStyle(el).color;
    });
    console.log('Dark mode main container text:', mainText);
    // Should be light cream #E8E6DD
    expect(mainText).toBe('rgb(232, 230, 221)');

    // Check button uses light forest green in dark mode
    const button = page.locator('.btn-primary').first();
    const buttonBg = await button.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    console.log('Dark mode button background:', buttonBg);
    // In dark mode, button should use forest-light (#4A7C2D)
    expect(buttonBg).toBe('rgb(74, 124, 45)');

    // Check hero heading color in dark mode
    const heading = page.locator('h1').first();
    const headingColor = await heading.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });
    console.log('Dark mode heading color:', headingColor);
    expect(headingColor).toBe('rgb(74, 124, 45)'); // forest-light
  });

  test('Toggle functionality', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');

    const htmlElement = page.locator('html');
    const toggle = page.locator('[aria-label="Toggle theme"]');

    // Get initial state
    const initialDark = await htmlElement.evaluate((el) => el.classList.contains('dark'));
    console.log('Initial dark state:', initialDark);

    // Toggle to dark
    await toggle.click();
    await page.waitForTimeout(500);
    const afterFirstClick = await htmlElement.evaluate((el) => el.classList.contains('dark'));
    console.log('After first click dark state:', afterFirstClick);
    expect(afterFirstClick).toBeTruthy();

    // Toggle back to light
    await toggle.click();
    await page.waitForTimeout(500);
    const afterSecondClick = await htmlElement.evaluate((el) => el.classList.contains('dark'));
    console.log('After second click dark state:', afterSecondClick);
    expect(afterSecondClick).toBeFalsy();

    // Verify colors actually changed
    const mainBg = await page.locator('.min-h-screen').evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    console.log('Final main container background (should be light):', mainBg);
    expect(mainBg).toBe('rgb(253, 252, 248)'); // Back to cream
  });
});
