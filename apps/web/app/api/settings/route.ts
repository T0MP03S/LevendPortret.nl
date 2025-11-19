import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@levendportret/auth';
import { prisma } from '@levendportret/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = (await getServerSession(authOptions as any)) as any;
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    let me = await prisma.user.findUnique({
      where: { id: (session.user as any).id },
      select: {
        id: true, name: true, email: true, status: true, phone: true, passwordHash: true,
        company: { select: { id: true, name: true, address: true, houseNumber: true, zipCode: true, city: true, workPhone: true, workEmail: true, kvkNumber: true, website: true, description: true, logoUrl: true } },
      }
    });
    if (!me) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const meId = (me as any).id as string;
    const meName = (me as any).name as string | null;
    const meEmail = (me as any).email as string;
    let company = (me as any).company as any | null;
    // Ensure a company exists so PENDING users (e.g., Google signup) see fields prefilled instead of an empty page
    if (!company) {
      try {
        const created = await prisma.company.create({
          data: {
            ownerId: meId,
            name: meName ? `Bedrijf van ${meName}` : 'Nieuw bedrijf',
            city: '',
            address: '',
            zipCode: '',
            houseNumber: '',
            workPhone: null,
            workEmail: meEmail || null,
            kvkNumber: null,
            website: null,
            slug: `${(meName || 'bedrijf').toLowerCase().replace(/\s+/g,'-')}-${Date.now()}`,
          },
          select: { id: true, name: true, address: true, houseNumber: true, zipCode: true, city: true, workPhone: true, workEmail: true, kvkNumber: true, website: true, description: true, logoUrl: true },
        });
        company = created as any;
      } catch (ex: any) {
        // Unique constraint might have been created concurrently; fallback to find by ownerId
        const existing = await prisma.company.findUnique({
          where: { ownerId: meId },
          select: { id: true, name: true, address: true, houseNumber: true, zipCode: true, city: true, workPhone: true, workEmail: true, kvkNumber: true, website: true, description: true, logoUrl: true },
        });
        company = (existing as any) || null;
      }
    }
    let fullAccess = false;
    if (company?.id) {
      const mems = await prisma.membership.findMany({ where: { userId: meId, companyId: company.id, status: 'ACTIVE' as any } });
      const hasClips = mems.some((m:any)=> m.product === 'CLIPS');
      fullAccess = hasClips;
    }
    const canChangePassword = !!(me as any).passwordHash;
    return NextResponse.json({ user: { id: meId, name: meName, email: meEmail, status: (me as any).status, phone: (me as any).phone || null }, company: company || null, fullAccess, canChangePassword });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Er ging iets mis bij het laden van de instellingen' }, { status: 500 });
  }
}
