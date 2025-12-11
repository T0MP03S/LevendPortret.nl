#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const root = process.cwd();
const apps = [
  { name: 'web', port: 3000 },
  { name: 'club', port: 3001 },
  { name: 'fund', port: 3002 },
  { name: 'admin', port: 3003 },
];

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function checkScripts(pkgPath, expected) {
  const pkg = readJson(pkgPath);
  const s = pkg.scripts || {};
  const problems = [];
  const dev = `dotenv -e ../../.env.local -- next dev -p ${expected.port}`;
  const build = `next build`;
  const startNumeric = `next start -p ${expected.port}`;
  const startEnv = `next start -p $PORT`;

  if (s.dev !== dev) problems.push(`dev script mismatch: expected "${dev}", got "${s.dev || ''}"`);
  if (s.build !== build) problems.push(`build script mismatch: expected "${build}", got "${s.build || ''}"`);
  if (!(s.start === startNumeric || s.start === startEnv)) problems.push(`start script mismatch: expected "${startNumeric}" or "${startEnv}", got "${s.start || ''}"`);

  // No dotenv or NEXTAUTH_URL in build/start
  ['build', 'start'].forEach((k) => {
    const v = s[k] || '';
    if (/dotenv\s+-e/i.test(v)) problems.push(`${k} should not use dotenv`);
    if (/NEXTAUTH_URL/i.test(v)) problems.push(`${k} should not set NEXTAUTH_URL; use EnvironmentFile`);
  });

  return problems;
}

function scanDeps(pkgPath) {
  const pkg = readJson(pkgPath);
  const deps = Object.assign({}, pkg.dependencies, pkg.devDependencies);
  const issues = [];
  if (deps.bcrypt) issues.push(`uses bcrypt (should be bcryptjs)`);
  if (deps['@types/bcrypt']) issues.push(`uses @types/bcrypt (remove)`);
  return issues;
}

let errors = [];

// Check app scripts
for (const app of apps) {
  const p = path.join(root, 'apps', app.name, 'package.json');
  if (!fs.existsSync(p)) continue;
  const problems = checkScripts(p, app);
  if (problems.length) {
    errors.push(`apps/${app.name}/package.json:`);
    errors = errors.concat(problems.map((x) => `  - ${x}`));
  }
}

// Check deps for bcrypt usage in apps and packages
const globs = [
  path.join(root, 'apps'),
  path.join(root, 'packages'),
];
for (const base of globs) {
  if (!fs.existsSync(base)) continue;
  for (const dir of fs.readdirSync(base)) {
    const pkgPath = path.join(base, dir, 'package.json');
    if (!fs.existsSync(pkgPath)) continue;
    const issues = scanDeps(pkgPath);
    if (issues.length) {
      errors.push(`${path.relative(root, pkgPath)}:`);
      errors = errors.concat(issues.map((x) => `  - ${x}`));
    }
  }
}

if (errors.length) {
  console.error('\nScript validation failed:\n' + errors.join('\n') + '\n');
  process.exit(1);
}

console.log('✓ Scripts and dependencies validated.');
