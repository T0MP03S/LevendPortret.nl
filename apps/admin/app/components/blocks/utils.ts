// Utility functions for block editors

/**
 * Delete an image from R2 storage
 */
export async function deleteFromR2(url: string): Promise<void> {
  if (!url) return;
  
  try {
    await fetch('/api/admin/upload/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
  } catch (e) {
    console.error('Failed to delete from R2:', e);
  }
}
