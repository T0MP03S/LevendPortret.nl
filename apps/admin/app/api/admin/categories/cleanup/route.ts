import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@levendportret/auth';
import { prisma } from '@levendportret/db';

// POST /api/admin/categories/cleanup - Delete categories with no articles
export async function POST() {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Find categories with no articles
    const emptyCategories = await prisma.category.findMany({
      where: {
        articles: {
          none: {},
        },
      },
    });

    if (emptyCategories.length === 0) {
      return NextResponse.json({ deleted: 0, message: 'Geen lege categorieën gevonden' });
    }

    // Delete empty categories
    const result = await prisma.category.deleteMany({
      where: {
        id: {
          in: emptyCategories.map((c) => c.id),
        },
      },
    });

    return NextResponse.json({
      deleted: result.count,
      message: `${result.count} lege categorie(ën) verwijderd`,
    });
  } catch (e: any) {
    console.error('Cleanup categories error:', e);
    return NextResponse.json({ error: e?.message || 'Opschonen mislukt' }, { status: 500 });
  }
}
