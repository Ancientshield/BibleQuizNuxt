import { execSync } from 'child_process';

const TEST_EMAIL = 'test@biblequiz.cc';
const TEST_PASSWORD = 'test1234';

const globalSetup = async () => {
  // Step 1: Register via API (Spring Security hashes the password with BCrypt $2a$)
  try {
    const res = await fetch('http://localhost:8080/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }),
    });
    const text = await res.text();
    console.log('[global-setup] Register response:', res.status, text);
  } catch {
    console.log('[global-setup] Register failed (user may already exist)');
  }

  // Step 2: Force email_verified = true via SQL (skip email verification)
  const sql = `UPDATE app_user SET email_verified = true WHERE email = '${TEST_EMAIL}';`;
  execSync(`PGPASSWORD=pg1234 psql -U postgres -d postgres -c "${sql}"`, {
    stdio: 'pipe',
  });

  console.log('[global-setup] Test user ready: ' + TEST_EMAIL);
};

export default globalSetup;
