type Bucket = { timestamps: number[] };

const store = new Map<string, Bucket>();

// Optional Upstash Redis REST config
const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

export async function checkRateLimit(opts: { key: string; limit: number; windowMs: number }) {
  if (UPSTASH_URL && UPSTASH_TOKEN) {
    // Fixed window counter: key:rate:<key>:<window>
    const windowKey = `${opts.key}:${Math.floor(Date.now() / opts.windowMs)}`;
    const keyName = `rate:${windowKey}`;
    const headers = { Authorization: `Bearer ${UPSTASH_TOKEN}` } as any;
    // INCR and set EX with TTL if first
    const incrRes = await fetch(`${UPSTASH_URL}/incr/${encodeURIComponent(keyName)}`, { headers });
    const incrJson = (await incrRes.json()) as { result: number };
    const count = Number(incrJson.result || 0);
    if (count === 1) {
      // set expiry in seconds
      const ttlSec = Math.ceil(opts.windowMs / 1000);
      await fetch(`${UPSTASH_URL}/expire/${encodeURIComponent(keyName)}/${ttlSec}`, { headers });
    }
    const allowed = count <= opts.limit;
    const remaining = Math.max(0, opts.limit - count);
    const resetMs = 0; // optional: could fetch TTL via /ttl
    return { allowed, remaining, resetMs };
  }

  // In-memory fallback (dev)
  const now = Date.now();
  const bucket = store.get(opts.key) || { timestamps: [] };
  bucket.timestamps = bucket.timestamps.filter((t) => now - t < opts.windowMs);
  if (bucket.timestamps.length >= opts.limit) {
    return { allowed: false, remaining: 0, resetMs: opts.windowMs - (now - bucket.timestamps[0]) };
  }
  bucket.timestamps.push(now);
  store.set(opts.key, bucket);
  return { allowed: true, remaining: Math.max(0, opts.limit - bucket.timestamps.length), resetMs: 0 };
}
