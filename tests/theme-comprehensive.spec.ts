import { test, expect } from '@playwright/test';

test.describe('Comprehensive Theme Colors', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');

    // Click "Start Creating Content" to get to the input page with cards
    const startButton = page.locator('text=Start Creating Content');
    if (await startButton.isVisible()) {
      await startButton.click();
      await page.waitForTimeout(500);
    }
  });

  test('Light mode complete color scheme', async ({ page }) => {
    // Ensure light mode
    const htmlElement = page.locator('html');
    const hasDarkClass = await htmlElement.evaluate((el) => el.classList.contains('dark'));
    if (hasDarkClass) {
      const toggle = page.locator('[aria-label="Toggle theme"]');
      await toggle.click();
      await page.waitForTimeout(500);
    }

    // Main container
    const mainBg = await page.locator('.min-h-screen').evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    console.log('Light mode main bg:', mainBg);
    expect(mainBg).toBe('rgb(253, 252, 248)'); // cream #FDFCF8

    // Main text
    const mainText = await page.locator('.min-h-screen').evaluate((el) => {
      return window.getComputedStyle(el).color;
    });
    console.log('Light mode main text:', mainText);
    expect(mainText).toBe('rgb(61, 59, 53)'); // earth-dark #3D3B35

    // Card background (if visible)
    const card = page.locator('.card').first();
    if (await card.isVisible()) {
      const cardBg = await card.evaluate((el) => {
        return window.getComputedStyle(el).backgroundColor;
      });
      console.log('Light mode card bg:', cardBg);
      expect(cardBg).toBe('rgb(255, 255, 255)'); // white

      const cardBorder = await card.evaluate((el) => {
        return window.getComputedStyle(el).borderColor;
      });
      console.log('Light mode card border:', cardBorder);
      // Should be green-border #C5D4BC
      expect(cardBorder).toContain('197'); // R value for #C5D4BC
    }

    // Primary button
    const button = page.locator('.btn-primary').first();
    const buttonBg = await button.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    console.log('Light mode button bg:', buttonBg);
    expect(buttonBg).toBe('rgb(45, 80, 22)'); // forest #2D5016

    // Heading colors (h2 is shown in compact mode, h1 may not be visible)
    const h2 = page.locator('h2').first();
    if (await h2.isVisible()) {
      const h2Color = await h2.evaluate((el) => {
        return window.getComputedStyle(el).color;
      });
      console.log('Light mode h2 color:', h2Color);
      expect(h2Color).toBe('rgb(45, 80, 22)'); // forest
    }

    // Check h1 if it exists
    const h1 = page.locator('h1').first();
    if (await h1.isVisible()) {
      const h1Color = await h1.evaluate((el) => {
        return window.getComputedStyle(el).color;
      });
      console.log('Light mode h1 color:', h1Color);
      expect(h1Color).toBe('rgb(45, 80, 22)'); // forest
    }
  });

  test('Dark mode complete color scheme', async ({ page }) => {
    // Switch to dark mode
    const toggle = page.locator('[aria-label="Toggle theme"]');
    await toggle.click();
    await page.waitForTimeout(500);

    // Main container
    const mainBg = await page.locator('.min-h-screen').evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    console.log('Dark mode main bg:', mainBg);
    expect(mainBg).toBe('rgb(26, 30, 24)'); // dark-earth #1A1E18

    // Main text
    const mainText = await page.locator('.min-h-screen').evaluate((el) => {
      return window.getComputedStyle(el).color;
    });
    console.log('Dark mode main text:', mainText);
    expect(mainText).toBe('rgb(232, 230, 221)'); // light-cream #E8E6DD

    // Card background (if visible)
    const card = page.locator('.card').first();
    if (await card.isVisible()) {
      const cardBg = await card.evaluate((el) => {
        return window.getComputedStyle(el).backgroundColor;
      });
      console.log('Dark mode card bg:', cardBg);
      expect(cardBg).toBe('rgb(37, 43, 35)'); // dark-earth-lighter #252B23

      const cardBorder = await card.evaluate((el) => {
        return window.getComputedStyle(el).borderColor;
      });
      console.log('Dark mode card border:', cardBorder);
      // Should be dim-green #3D4A3D
      expect(cardBorder).toContain('61'); // R value for #3D4A3D
    }

    // Primary button
    const button = page.locator('.btn-primary').first();
    const buttonBg = await button.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    console.log('Dark mode button bg:', buttonBg);
    expect(buttonBg).toBe('rgb(74, 124, 45)'); // forest-light #4A7C2D

    // Heading colors (h2 is shown in compact mode, h1 may not be visible)
    const h2 = page.locator('h2').first();
    if (await h2.isVisible()) {
      const h2Color = await h2.evaluate((el) => {
        return window.getComputedStyle(el).color;
      });
      console.log('Dark mode h2 color:', h2Color);
      expect(h2Color).toBe('rgb(74, 124, 45)'); // forest-light
    }

    // Check h1 if it exists
    const h1 = page.locator('h1').first();
    if (await h1.isVisible()) {
      const h1Color = await h1.evaluate((el) => {
        return window.getComputedStyle(el).color;
      });
      console.log('Dark mode h1 color:', h1Color);
      expect(h1Color).toBe('rgb(74, 124, 45)'); // forest-light
    }
  });

  test('Input field colors in both modes', async ({ page }) => {
    // Test in light mode first
    const htmlElement = page.locator('html');
    const hasDarkClass = await htmlElement.evaluate((el) => el.classList.contains('dark'));
    if (hasDarkClass) {
      const toggle = page.locator('[aria-label="Toggle theme"]');
      await toggle.click();
      await page.waitForTimeout(500);
    }

    // Find an input field
    const input = page.locator('.input-field').first();
    if (await input.isVisible()) {
      // Light mode input
      const inputBgLight = await input.evaluate((el) => {
        return window.getComputedStyle(el).backgroundColor;
      });
      console.log('Light mode input bg:', inputBgLight);
      expect(inputBgLight).toBe('rgb(255, 255, 255)'); // white

      const inputTextLight = await input.evaluate((el) => {
        return window.getComputedStyle(el).color;
      });
      console.log('Light mode input text:', inputTextLight);
      expect(inputTextLight).toBe('rgb(61, 59, 53)'); // earth-dark

      const inputBorderLight = await input.evaluate((el) => {
        return window.getComputedStyle(el).borderColor;
      });
      console.log('Light mode input border:', inputBorderLight);
      // Should be green-border
      expect(inputBorderLight).toContain('197'); // R for #C5D4BC

      // Switch to dark mode
      const toggle = page.locator('[aria-label="Toggle theme"]');
      await toggle.click();
      await page.waitForTimeout(500);

      // Dark mode input
      const inputBgDark = await input.evaluate((el) => {
        return window.getComputedStyle(el).backgroundColor;
      });
      console.log('Dark mode input bg:', inputBgDark);
      expect(inputBgDark).toBe('rgb(26, 30, 24)'); // dark-earth

      const inputTextDark = await input.evaluate((el) => {
        return window.getComputedStyle(el).color;
      });
      console.log('Dark mode input text:', inputTextDark);
      expect(inputTextDark).toBe('rgb(232, 230, 221)'); // light-cream

      const inputBorderDark = await input.evaluate((el) => {
        return window.getComputedStyle(el).borderColor;
      });
      console.log('Dark mode input border:', inputBorderDark);
      // Should be dim-green
      expect(inputBorderDark).toContain('61'); // R for #3D4A3D
    }
  });
});
