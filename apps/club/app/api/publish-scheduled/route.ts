import { NextResponse } from 'next/server';
import { prisma } from '@levendportret/db';

// This endpoint publishes any scheduled articles whose publishedAt has passed
// It's called automatically when the club site loads

export async function GET() {
  try {
    const now = new Date();
    
    // Find and update all scheduled articles that should be published
    const result = await prisma.article.updateMany({
      where: {
        status: 'SCHEDULED',
        publishedAt: {
          lte: now,
        },
      },
      data: {
        status: 'PUBLISHED',
      },
    });

    return NextResponse.json({ 
      published: result.count,
      timestamp: now.toISOString(),
    });
  } catch (error: any) {
    console.error('Error publishing scheduled articles:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
