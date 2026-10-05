// Smoke walkthrough: log in, open the library, open a sample schema (from fixtures/InitialData.json).
export default async function smoke({ page, login, pause }) {
  await page.goto('/');
  await pause(1500);
  await login();
  await pause(1500);
  await page.getByText('Булева алгебра').click();
  await page.waitForURL(/\/(rsforms|oss|models)\//);
  await pause(2500);
}
