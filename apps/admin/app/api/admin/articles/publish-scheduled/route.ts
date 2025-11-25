import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@levendportret/db';

// This endpoint should be called by a cron job every few minutes
// to publish scheduled articles whose publishedAt has passed

export async function POST(request: NextRequest) {
  // Optional: verify cron secret
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();
    
    // Find all scheduled articles that should be published
    const articlesToPublish = await prisma.article.findMany({
      where: {
        status: 'SCHEDULED',
        publishedAt: {
          lte: now,
        },
      },
      select: {
        id: true,
        title: true,
        slug: true,
      },
    });

    if (articlesToPublish.length === 0) {
      return NextResponse.json({ message: 'No articles to publish', count: 0 });
    }

    // Update all to PUBLISHED
    const result = await prisma.article.updateMany({
      where: {
        id: {
          in: articlesToPublish.map(a => a.id),
        },
      },
      data: {
        status: 'PUBLISHED',
      },
    });

    console.log(`Published ${result.count} scheduled articles:`, articlesToPublish.map(a => a.title));

    return NextResponse.json({ 
      message: `Published ${result.count} articles`,
      count: result.count,
      articles: articlesToPublish,
    });
  } catch (error: any) {
    console.error('Error publishing scheduled articles:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Also allow GET for easy testing
export async function GET(request: NextRequest) {
  return POST(request);
}
