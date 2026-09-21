import { test, expect } from '@playwright/test';
test('map filters and navigation', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'Your city. Your bike. A safer spot.' }),
  ).toBeVisible();
  await page.getByRole('textbox', { name: 'Search parking' }).fill('station');
  await expect(page.getByRole('button', { name: /Station bicycle parking Wyck/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Markt bicycle parking Centrum/ })).toHaveCount(0);
  await page.getByRole('button', { name: /Station bicycle parking Wyck/ }).click();
  await expect(page.getByRole('heading', { name: 'Station bicycle parking' })).toBeVisible();
  await page.getByRole('textbox', { name: 'Search parking' }).fill('missing');
  await expect(page.getByText('No parking matches.', { exact: false })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});
test('prepare, download, keep across navigation, and delete a report', async ({ page }) => {
  await page.goto('/reports');
  await page.getByLabel('Brand', { exact: false }).fill('Gazelle');
  await page.getByLabel('Color', { exact: false }).fill('Blue');
  await page.getByLabel('Location in Maastricht', { exact: false }).fill('Markt');
  await page.getByLabel('Last seen', { exact: false }).fill('2025-01-01T10:00');
  await page.getByLabel('Discovered missing', { exact: false }).fill('2025-01-01T11:00');
  await page.getByRole('button', { name: 'Prepare demo report' }).click();
  await expect(page.getByText('Your demo report is ready.')).toBeVisible();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download summary' }).click();
  expect((await download).suggestedFilename()).toContain('bikewatch-report');
  await page.getByRole('link', { name: 'Community', exact: true }).click();
  await page.getByRole('link', { name: 'Report a theft', exact: true }).click();
  await expect(page.getByText('Blue Gazelle')).toBeVisible();
  await page.getByRole('button', { name: 'Delete report for Gazelle' }).click();
  await expect(page.getByText('No reports yet.', { exact: false })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});
test('bike hunt find, confirm, and leaderboard', async ({ page }) => {
  await page.goto('/hunt');
  await expect(page.getByRole('heading', { name: /Stolen bikes/i })).toBeVisible();
  await page.getByRole('button', { name: 'I found this', exact: true }).first().click();
  await page.getByLabel('Your email or phone').fill('finder@demo.cycle-guard');
  await page.getByLabel('Where did you see it?').fill('Near the Maas bridge, locked to a rack.');
  await page.getByRole('button', { name: 'Share contact' }).click();
  await expect(page.getByRole('heading', { name: 'You’re in touch' })).toBeVisible();
  await page.getByRole('button', { name: 'Continue hunting' }).click();
  await page.getByRole('button', { name: /Review 1 sighting/ }).click();
  await page.getByRole('button', { name: 'Confirm they found it' }).click();
  await expect(page.getByText(/earns a leaderboard find/i)).toBeVisible();
  await page.getByRole('tab', { name: 'Leaderboard' }).click();
  await expect(page.getByRole('heading', { name: 'Finders who bring bikes home' })).toBeVisible();
  await expect(page.getByText('Elise Meijer')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});
test('community posts are session only and filterable', async ({ page }) => {
  await page.goto('/community');
  await page.getByRole('button', { name: 'Create a post' }).click();
  await page.getByLabel('Title', { exact: true }).fill('Evening ride');
  await page.getByLabel('Message', { exact: true }).fill('Meet at the station for a gentle loop.');
  await page.getByLabel('Post type').selectOption('meetup');
  await page.getByRole('button', { name: 'Add demo post' }).click();
  await expect(page.getByRole('heading', { name: 'Evening ride' })).toBeVisible();
  await page.getByRole('button', { name: 'Local tips', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Evening ride' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Meetups', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Evening ride' })).toBeVisible();
  await page.getByRole('button', { name: 'Delete', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Evening ride' })).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});
