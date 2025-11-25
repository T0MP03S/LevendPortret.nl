#!/usr/bin/env node

// Dev script that runs turbo dev + scheduler together

const { spawn } = require('child_process');
const path = require('path');

const isWindows = process.platform === 'win32';

// Start turbo dev
const turbo = spawn(
  isWindows ? 'turbo.cmd' : 'turbo',
  ['run', 'dev'],
  { 
    stdio: 'inherit',
    shell: true,
    cwd: process.cwd()
  }
);

// Start scheduler after 10 seconds (give apps time to start)
console.log('\n📅 Scheduler will start in 10 seconds...\n');

setTimeout(() => {
  console.log('\n📅 Starting article scheduler (checks every 5 minutes)...\n');
  
  const schedulerPath = path.join(__dirname, 'scheduler.js');
  // Quote the path to handle spaces in directory names
  const scheduler = spawn(
    'node',
    [`"${schedulerPath}"`, '--watch'],
    { 
      stdio: 'inherit',
      shell: true,
      cwd: process.cwd()
    }
  );

  scheduler.on('error', (err) => {
    console.error('Scheduler error:', err);
  });
}, 10000);

// Handle exit
turbo.on('close', (code) => {
  process.exit(code);
});

process.on('SIGINT', () => {
  turbo.kill('SIGINT');
  process.exit(0);
});
