// src/server/admin-user.ts — manage RSVP admin accounts (table `admins`)
//   npm run admin:set -- <username>             add the admin, or change their password (asks for it twice)
//   npm run admin:set -- <username> --disable   block sign-in and end their sessions (--enable undoes it)
//   npm run admin:list                          list admins
// Without a terminal the password is read from the first line of stdin (e.g. for scripts).
import readline from 'readline';
import pool from './db';
import { hashPassword } from './auth';

const MIN_PASSWORD = 8;

function ask(question: string, hidden: boolean): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
  if (hidden) {
    // Echo nothing while the password is typed
    (rl as unknown as { _writeToOutput: (s: string) => void })._writeToOutput = (s: string) => {
      if (s.includes(question)) process.stdout.write(question);
    };
  }
  return new Promise((resolve) =>
    rl.question(question, (answer) => {
      rl.close();
      if (hidden) process.stdout.write('\n');
      resolve(answer);
    })
  );
}

async function readStdinLine(): Promise<string> {
  let data = '';
  for await (const chunk of process.stdin) data += chunk;
  return data.split(/\r?\n/)[0] ?? '';
}

async function readPassword(): Promise<string> {
  if (!process.stdin.isTTY) return readStdinLine();
  const first = await ask('New password: ', true);
  const again = await ask('Repeat password: ', true);
  if (first !== again) throw new Error('The passwords do not match.');
  return first;
}

async function listAdmins() {
  const [rows] = await pool.query(
    `SELECT a.username, a.active, a.last_login_at,
            (SELECT COUNT(*) FROM admin_sessions s WHERE s.admin_id = a.id AND s.expires_at > NOW()) AS sessions
     FROM admins a ORDER BY a.username`
  );
  console.table(rows);
}

async function setAdmin(username: string, flag: string | undefined) {
  if (!/^[A-Za-z0-9._-]{3,60}$/.test(username)) {
    throw new Error('Username: 3–60 letters, numbers, dot, dash or underscore.');
  }
  const [found] = await pool.query('SELECT id FROM admins WHERE username = ?', [username]);
  const existing = (found as { id: number }[])[0];

  if (flag === '--disable' || flag === '--enable') {
    if (!existing) throw new Error(`No admin named "${username}".`);
    const active = flag === '--enable' ? 1 : 0;
    await pool.query('UPDATE admins SET active = ? WHERE id = ?', [active, existing.id]);
    if (!active) await pool.query('DELETE FROM admin_sessions WHERE admin_id = ?', [existing.id]);
    console.log(`${username} is now ${active ? 'enabled' : 'disabled (signed out everywhere)'}.`);
    return;
  }
  if (flag) throw new Error(`Unknown option ${flag}.`);

  const password = await readPassword();
  if (password.length < MIN_PASSWORD) throw new Error(`Use at least ${MIN_PASSWORD} characters.`);
  const hash = await hashPassword(password);

  if (existing) {
    await pool.query('UPDATE admins SET password_hash = ?, active = 1 WHERE id = ?', [hash, existing.id]);
    // A new password ends every open session of that admin
    await pool.query('DELETE FROM admin_sessions WHERE admin_id = ?', [existing.id]);
    console.log(`Password changed for ${username}; their open sessions were signed out.`);
  } else {
    await pool.query('INSERT INTO admins (username, password_hash) VALUES (?, ?)', [username, hash]);
    console.log(`Admin ${username} created.`);
  }
}

async function main() {
  const [command, username, flag] = process.argv.slice(2);
  if (command === 'list') return listAdmins();
  if (command === 'set' && username) return setAdmin(username, flag);
  console.log('Usage: npm run admin:set -- <username> [--disable|--enable]   |   npm run admin:list');
  process.exitCode = 1;
}

main()
  .catch((error: Error) => {
    console.error(`Error: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
