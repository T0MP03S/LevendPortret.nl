#!/usr/bin/env node
/*
  R2 Deduplication Script
  - Groups objects by SHA-256 embedded in key (paths containing '/sha256/[hash].ext') or by ETag (MD5 for small objects)
  - Deletes oldest duplicates, keeps the most recent
  - Dry-run by default. Use --delete to actually remove.

  Usage (Windows PowerShell from repo root):
    dotenv -e .env.local -- pnpm -C apps/admin exec node scripts/r2-dedupe.js --prefix logos/ --prefix company-pages/ --prefix clips-thumbnails/
    dotenv -e .env.local -- pnpm -C apps/admin exec node scripts/r2-dedupe.js --prefix clips-thumbnails/ --delete
*/

const { S3Client, ListObjectsV2Command, DeleteObjectsCommand } = require('@aws-sdk/client-s3');

const R2_ENDPOINT = process.env.R2_ENDPOINT;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET = process.env.R2_BUCKET;

if (!R2_ENDPOINT || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET) {
  console.error('Missing R2 envs. Set R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET');
  process.exit(1);
}

const args = process.argv.slice(2);
const prefixes = [];
let doDelete = false;
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === '--delete') doDelete = true;
  if (a === '--prefix') {
    const v = args[i + 1];
    if (v) { prefixes.push(v); i++; }
  }
}
if (prefixes.length === 0) {
  prefixes.push('logos/','company-pages/','clips-thumbnails/');
}

const s3 = new S3Client({ region: 'auto', endpoint: R2_ENDPOINT, credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY }, forcePathStyle: true });

function groupKeyFor(obj) {
  const key = obj.Key || '';
  const m = key.match(/\/(?:sha256)\/([a-f0-9]{64})\./i);
  if (m) return `sha256:${m[1].toLowerCase()}`;
  const etag = (obj.ETag || '').replace(/"/g, '').toLowerCase();
  if (etag) return `etag:${etag}`;
  return null; // cannot dedupe confidently
}

async function listAll(prefix) {
  const out = [];
  let token = undefined;
  for (;;) {
    const res = await s3.send(new ListObjectsV2Command({ Bucket: R2_BUCKET, Prefix: prefix, ContinuationToken: token }));
    const items = res.Contents || [];
    for (const it of items) {
      out.push({ Key: it.Key, ETag: it.ETag, Size: it.Size, LastModified: it.LastModified });
    }
    if (!res.IsTruncated) break;
    token = res.NextContinuationToken;
  }
  return out;
}

async function dedupePrefix(prefix) {
  console.log(`\nScanning prefix: ${prefix}`);
  const objects = await listAll(prefix);
  console.log(`Found ${objects.length} objects`);
  const groups = new Map();
  for (const o of objects) {
    const gk = groupKeyFor(o);
    if (!gk) continue;
    if (!groups.has(gk)) groups.set(gk, []);
    groups.get(gk).push(o);
  }
  let dupCount = 0, deleteCandidates = [];
  for (const [gk, list] of groups.entries()) {
    if (list.length <= 1) continue;
    dupCount += (list.length - 1);
    // keep the newest (max LastModified)
    list.sort((a,b) => new Date(b.LastModified) - new Date(a.LastModified));
    const keep = list[0];
    const remove = list.slice(1);
    console.log(`Group ${gk}: keep ${keep.Key}, remove ${remove.length} older duplicates`);
    deleteCandidates.push(...remove.map(r => ({ Key: r.Key })));
  }
  console.log(`Duplicate objects detected: ${dupCount}`);
  if (deleteCandidates.length === 0) return;
  if (!doDelete) {
    console.log(`Dry-run: would delete ${deleteCandidates.length} objects. Re-run with --delete to apply.`);
    return;
  }
  // Delete in batches of 900
  let idx = 0;
  while (idx < deleteCandidates.length) {
    const chunk = deleteCandidates.slice(idx, idx + 900);
    await s3.send(new DeleteObjectsCommand({ Bucket: R2_BUCKET, Delete: { Objects: chunk, Quiet: true } }));
    console.log(`Deleted ${chunk.length} objects...`);
    idx += chunk.length;
  }
  console.log('Done deleting duplicates.');
}

(async () => {
  for (const p of prefixes) {
    await dedupePrefix(p);
  }
})();
