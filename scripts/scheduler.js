#!/usr/bin/env node

// Article Scheduler Script
// 
// This script checks for scheduled articles and publishes them when their
// publishedAt date has passed.
// 
// Usage:
//   node scripts/scheduler.js
// 
// For production, set up a cron job to run this every 5 minutes
// Or use PM2: pm2 start scripts/scheduler.js --cron "every 5 minutes" --no-autorestart

const ADMIN_URL = process.env.ADMIN_URL || 'http://localhost:3003';
const CRON_SECRET = process.env.CRON_SECRET || '';

async function publishScheduledArticles() {
  console.log(`[${new Date().toISOString()}] Checking for scheduled articles...`);
  console.log(`   Admin URL: ${ADMIN_URL}`);
  
  try {
    const response = await fetch(`${ADMIN_URL}/api/admin/articles/publish-scheduled`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`,
        'Content-Type': 'application/json',
      },
    });
    
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.error('❌ Server returned non-JSON response. Is the admin server running?');
      console.error('   Response:', text.substring(0, 200));
      return;
    }
    
    if (response.ok) {
      if (data.count > 0) {
        console.log(`✅ Published ${data.count} article(s):`);
        data.articles?.forEach(a => console.log(`   - ${a.title}`));
      } else {
        console.log('ℹ️  No articles to publish');
      }
    } else {
      console.error('❌ Error:', data.error || 'Unknown error');
    }
  } catch (error) {
    console.error('❌ Failed to connect:', error.message);
    console.error('   Make sure the admin server is running (pnpm dev)');
  }
}

// Run immediately
publishScheduledArticles();

// If --watch flag is passed, run every 5 minutes
if (process.argv.includes('--watch')) {
  console.log('👀 Watching mode enabled - checking every 5 minutes');
  setInterval(publishScheduledArticles, 5 * 60 * 1000);
}
