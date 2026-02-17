import { test } from '@playwright/test';

test('Dump all styles', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await page.waitForLoadState('networkidle');

  // Dump html element styles
  const htmlStyles = await page.evaluate(() => {
    const html = document.documentElement;
    const styles = window.getComputedStyle(html);
    return {
      classList: Array.from(html.classList),
      background: styles.backgroundColor,
      color: styles.color,
    };
  });
  console.log('HTML element:', JSON.stringify(htmlStyles, null, 2));

  // Dump body styles
  const bodyStyles = await page.evaluate(() => {
    const body = document.body;
    const styles = window.getComputedStyle(body);
    return {
      classList: Array.from(body.classList),
      background: styles.backgroundColor,
      color: styles.color,
    };
  });
  console.log('Body element:', JSON.stringify(bodyStyles, null, 2));

  // Dump card styles
  const cardStyles = await page.evaluate(() => {
    const card = document.querySelector('.card');
    if (!card) return null;
    const styles = window.getComputedStyle(card);
    return {
      background: styles.backgroundColor,
      color: styles.color,
      border: styles.border,
    };
  });
  console.log('Card element:', JSON.stringify(cardStyles, null, 2));

  // Dump button styles
  const buttonStyles = await page.evaluate(() => {
    const button = document.querySelector('.btn-primary');
    if (!button) return null;
    const styles = window.getComputedStyle(button);
    return {
      background: styles.backgroundColor,
      color: styles.color,
    };
  });
  console.log('Button element:', JSON.stringify(buttonStyles, null, 2));

  // Now click toggle and dump dark mode styles
  const toggle = page.locator('[aria-label="Toggle theme"]');
  await toggle.click();
  await page.waitForTimeout(500);

  console.log('\n=== AFTER CLICKING DARK MODE ===\n');

  // Dump html element styles in dark mode
  const htmlStylesDark = await page.evaluate(() => {
    const html = document.documentElement;
    const styles = window.getComputedStyle(html);
    return {
      classList: Array.from(html.classList),
      background: styles.backgroundColor,
      color: styles.color,
    };
  });
  console.log('HTML element (dark):', JSON.stringify(htmlStylesDark, null, 2));

  // Dump body styles in dark mode
  const bodyStylesDark = await page.evaluate(() => {
    const body = document.body;
    const styles = window.getComputedStyle(body);
    return {
      classList: Array.from(body.classList),
      background: styles.backgroundColor,
      color: styles.color,
    };
  });
  console.log('Body element (dark):', JSON.stringify(bodyStylesDark, null, 2));

  // Dump card styles in dark mode
  const cardStylesDark = await page.evaluate(() => {
    const card = document.querySelector('.card');
    if (!card) return null;
    const styles = window.getComputedStyle(card);
    return {
      background: styles.backgroundColor,
      color: styles.color,
      border: styles.border,
    };
  });
  console.log('Card element (dark):', JSON.stringify(cardStylesDark, null, 2));

  // Dump button styles in dark mode
  const buttonStylesDark = await page.evaluate(() => {
    const button = document.querySelector('.btn-primary');
    if (!button) return null;
    const styles = window.getComputedStyle(button);
    return {
      background: styles.backgroundColor,
      color: styles.color,
    };
  });
  console.log('Button element (dark):', JSON.stringify(buttonStylesDark, null, 2));
});
