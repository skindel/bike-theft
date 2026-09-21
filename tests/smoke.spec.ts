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
test('validate, save, download, keep across navigation, and remove a report summary', async ({
  page,
}) => {
  await page.route('**/api/reports', async (route) => {
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        report: {
          id: '42',
          createdAt: '2025-01-01T11:01:00.000Z',
          location: 'Markt 1, 6211CH Maastricht',
          neighbourhood: 'Binnenstad',
        },
      }),
    });
  });
  await page.goto('/reports');
  await page.getByLabel('Brand', { exact: false }).fill('Gazelle');
  await page.getByLabel('Color', { exact: false }).fill('Blue');
  await page.getByLabel('Location in Maastricht', { exact: false }).fill('Markt 1');
  await page.getByLabel('Last seen', { exact: false }).fill('2025-01-01T10:00');
  await page.getByLabel('Discovered missing', { exact: false }).fill('2025-01-01T11:00');
  await page.getByRole('button', { name: 'Save report' }).click();
  await expect(page.getByText('Your report has been saved.')).toBeVisible();
  await expect(page.getByText(/Binnenstad/)).toBeVisible();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download summary' }).click();
  expect((await download).suggestedFilename()).toContain('bikewatch-report');
  await page.getByRole('link', { name: 'Community', exact: true }).click();
  await page.getByRole('link', { name: 'Report a theft', exact: true }).click();
  await expect(page.getByText('Blue Gazelle')).toBeVisible();
  await page.getByRole('button', { name: 'Remove report summary for Gazelle' }).click();
  await expect(page.getByText('No reports yet.', { exact: false })).toBeVisible();
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
test('a stolen bike alert needs an area and a past date, and can carry a photo', async ({
  page,
}) => {
  await page.goto('/community');
  await page.getByRole('button', { name: 'Stolen bikes', exact: true }).click();
  await expect(page.getByRole('heading', { name: /Dark green Gazelle/ })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Sunday miles & good coffee' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Create a post' }).click();
  await page.getByLabel('Post type').selectOption('stolen');
  await page.getByLabel('Title', { exact: true }).fill('Blue Batavus missing from Sint Pieter');
  await page.getByLabel('Message', { exact: true }).fill('Blue city bike with a front basket.');
  await page.getByRole('button', { name: 'Post demo alert' }).click();
  await expect(page.getByText('Name an area people can watch')).toBeVisible();
  await expect(page.getByText('Enter the date it went missing')).toBeVisible();
  await expect(page.getByRole('heading', { name: /Blue Batavus/ })).toHaveCount(0);
  await page.getByLabel('Area to watch').fill('Sint Pieter');
  await page.getByLabel('Last seen on').fill('2099-01-01');
  await page.getByRole('button', { name: 'Post demo alert' }).click();
  await expect(page.getByText('Cannot be in the future')).toBeVisible();
  await page.getByLabel('Last seen on').fill('2025-06-01');
  await page.setInputFiles('#stolen-photo', {
    name: 'bike.png',
    mimeType: 'image/png',
    // Smallest valid PNG: enough to prove the preview and post image render.
    buffer: Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64',
    ),
  });
  await expect(page.getByRole('img', { name: 'Photo of the missing bike' })).toBeVisible();
  await page.getByRole('button', { name: 'Post demo alert' }).click();
  await expect(page.getByRole('heading', { name: /Blue Batavus/ })).toBeVisible();
  await expect(page.getByText('Watch around Sint Pieter')).toBeVisible();
  await expect(page.getByText('Last seen 1 Jun 2025')).toBeVisible();
  await expect(page.getByRole('img', { name: 'Photo of the missing bike' })).toBeVisible();
  await page.getByRole('button', { name: 'Local tips', exact: true }).click();
  await expect(page.getByRole('heading', { name: /Blue Batavus/ })).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});
test('a rejected photo explains why and is not attached', async ({ page }) => {
  await page.goto('/community');
  await page.getByRole('button', { name: 'Create a post' }).click();
  await page.getByLabel('Post type').selectOption('stolen');
  await page.setInputFiles('#stolen-photo', {
    name: 'notes.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('not an image'),
  });
  await expect(page.getByText('Use a JPEG, PNG or WebP image.')).toBeVisible();
  await expect(page.getByRole('img', { name: 'Photo of the missing bike' })).toHaveCount(0);
});
