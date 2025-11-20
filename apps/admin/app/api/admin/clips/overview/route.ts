import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@levendportret/auth';
import { prisma } from '@levendportret/db';

export async function GET() {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Tab 1: Companies that already have an external website
  const websiteCompanies = await prisma.company.findMany({
    where: { website: { not: null } },
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      city: true,
      website: true,
      owner: { select: { id: true, status: true, email: true, name: true } },
    }
  });

  // Tab 2a: Requests met status IN_REVIEW
  const inReview = await prisma.companyPage.findMany({
    where: {
      status: 'IN_REVIEW' as any,
      company: {
        website: null,
        owner: { status: 'ACTIVE' as any },
        memberships: {
          some: {
            product: 'CLIPS' as any,
            status: 'ACTIVE' as any,
          },
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      status: true,
      companyId: true,
      slug: true,
      updatedAt: true,
      company: {
        select: {
          id: true,
          name: true,
          city: true,
          website: true,
          owner: { select: { id: true, status: true, name: true, email: true } },
        }
      }
    }
  });

  // Tab 2b: PUBLISHED pagina's met ingediende update-aanvragen (Moderation SUBMITTED)
  const updateCandidates = await prisma.companyPage.findMany({
    where: {
      status: 'PUBLISHED' as any,
      company: {
        website: null,
        owner: { status: 'ACTIVE' as any },
        memberships: {
          some: {
            product: 'CLIPS' as any,
            status: 'ACTIVE' as any,
          },
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      status: true,
      companyId: true,
      slug: true,
      updatedAt: true,
      company: {
        select: {
          id: true,
          name: true,
          city: true,
          website: true,
          owner: { select: { id: true, status: true, name: true, email: true } },
        },
      },
    },
  });

  const updateModerations = updateCandidates.length
    ? await prisma.moderation.findMany({
        where: {
          resourceType: 'COMPANY' as any,
          status: 'SUBMITTED' as any,
          resourceId: { in: updateCandidates.map((p) => p.id) },
        },
        orderBy: { createdAt: 'desc' },
      })
    : [];

  const lastNoteByPage = new Map<string, string>();
  for (const m of updateModerations) {
    if (!lastNoteByPage.has(m.resourceId)) {
      lastNoteByPage.set(m.resourceId, m.notes || '');
    }
  }

  const inReviewWithNotes = inReview.map((p) => ({ ...p, lastRequestNotes: null as string | null }));

  // Externe kandidaten: bedrijven met eigen website + logo, eigenaar ACTIVE, CLIPS membership actief, en nog geen gepubliceerde clips
  const externalCandidates = await prisma.company.findMany({
    where: {
      website: { not: null },
      logoUrl: { not: null } as any,
      owner: { status: 'ACTIVE' as any },
      memberships: { some: { product: 'CLIPS' as any, status: 'ACTIVE' as any } },
      clips: { none: { status: 'PUBLISHED' as any } },
    },
    orderBy: { name: 'asc' },
    select: { id: true, name: true, city: true, updatedAt: true },
  });
  const externalAanvragen = externalCandidates.map((c) => ({
    id: `company:${c.id}`,
    status: 'IN_REVIEW' as any,
    companyId: c.id,
    slug: '',
    updatedAt: c.updatedAt,
    lastRequestNotes: null as string | null,
    company: { id: c.id, name: c.name, city: c.city, website: true as any },
    isCompany: true,
  }));

  const updates = updateCandidates
    .filter((p) => lastNoteByPage.has(p.id))
    .map((p) => ({ ...p, lastRequestNotes: lastNoteByPage.get(p.id) || '' }));

  const aanvragen = [...inReviewWithNotes, ...externalAanvragen];

  // Tab 3: Published — includes internal pages and companies with external website that have PUBLISHED clips
  const internalPublished = await prisma.companyPage.findMany({
    where: {
      status: 'PUBLISHED' as any,
    },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      status: true,
      companyId: true,
      slug: true,
      updatedAt: true,
      company: { select: { id: true, name: true, city: true, website: true } },
    }
  });

  // Add companies that have an external website and at least one PUBLISHED clip
  const externalWithClips = await prisma.company.findMany({
    where: {
      website: { not: null },
      clips: { some: { status: 'PUBLISHED' as any } },
    },
    orderBy: { updatedAt: 'desc' },
    select: { id: true, name: true, city: true, updatedAt: true, companyPage: { select: { id: true, slug: true, status: true } } },
  });

  const internalCompanyIds = new Set(internalPublished.map((p) => p.companyId));
  const externalPublished = externalWithClips
    .filter((c) => !internalCompanyIds.has(c.id))
    .map((c) => ({
      id: (c.companyPage?.id as string) || `company:${c.id}`,
      status: (c.companyPage?.status as any) || ('PUBLISHED' as any),
      companyId: c.id,
      slug: (c.companyPage?.slug as string) || '',
      updatedAt: c.updatedAt,
      company: { id: c.id, name: c.name, city: c.city, website: (true as any) },
      isExternal: true,
    }));

  const published = [
    ...internalPublished.map((p) => ({ ...p, isExternal: false } as any)),
    ...externalPublished,
  ];

  return NextResponse.json({ aanvragen, updates, published });
}
