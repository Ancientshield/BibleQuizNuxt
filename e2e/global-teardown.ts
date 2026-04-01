import { execSync } from 'child_process';

const globalTeardown = async () => {
  // Delete quiz records first (foreign key constraint), then the user
  const sql = `
    DELETE FROM quiz_answer WHERE round_id IN (SELECT id FROM quiz_round WHERE user_id = (SELECT id FROM app_user WHERE email = 'test@biblequiz.cc'));
    DELETE FROM quiz_round WHERE user_id = (SELECT id FROM app_user WHERE email = 'test@biblequiz.cc');
    DELETE FROM app_user WHERE email = 'test@biblequiz.cc';
  `;

  try {
    execSync(`PGPASSWORD=pg1234 psql -U postgres -d postgres -c "${sql.replace(/\n/g, ' ')}"`, {
      stdio: 'pipe',
    });
    console.log('[global-teardown] Test user cleaned up');
  } catch {
    console.log('[global-teardown] Cleanup failed (user may not exist)');
  }
};

export default globalTeardown;
