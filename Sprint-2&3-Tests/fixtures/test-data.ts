// Generează un nume unic pe baza timestamp-ului
export function uniqueName(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

// Date folosite în testele de creare user
export const testData = {
  userFirstName: 'E2E',
  userLastName: 'Student',
  classDescription: 'Created by Playwright E2E test',
  courseDescription: 'Created by Playwright E2E test',
};
