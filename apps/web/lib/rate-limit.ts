type Bucket = { timestamps: number[] };

const store = new Map<string, Bucket>();

export function checkRateLimit(opts: { key: string; limit: number; windowMs: number }) {
  const now = Date.now();
  const bucket = store.get(opts.key) || { timestamps: [] };
  // discard old
  bucket.timestamps = bucket.timestamps.filter((t) => now - t < opts.windowMs);
  if (bucket.timestamps.length >= opts.limit) {
    return { allowed: false, remaining: 0, resetMs: opts.windowMs - (now - bucket.timestamps[0]) };
  }
  bucket.timestamps.push(now);
  store.set(opts.key, bucket);
  return { allowed: true, remaining: Math.max(0, opts.limit - bucket.timestamps.length), resetMs: 0 };
}
