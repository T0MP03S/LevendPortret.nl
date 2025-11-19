import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@levendportret/auth';
import { prisma } from '@levendportret/db';
import nodemailer from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';

export const runtime = 'nodejs';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const page = await prisma.companyPage.findUnique({
    where: { id: params.id },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          city: true,
          address: true,
          zipCode: true,
          houseNumber: true,
          workPhone: true,
          workEmail: true,
          kvkNumber: true,
          website: true,
          logoUrl: true,
          ownerId: true,
        }
      }
    }
  });
  if (!page) return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 });
  const clips = await prisma.clip.findMany({ where: { companyId: page.companyId }, orderBy: { createdAt: 'asc' }, select: { id: true, vimeoShortId: true, status: true } });
  const moderations = await prisma.moderation.findMany({
    where: { resourceType: 'COMPANY' as any, resourceId: params.id },
    orderBy: { createdAt: 'desc' },
    select: { id: true, status: true, notes: true, createdAt: true },
  });
  return NextResponse.json({ page, clips, moderations });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const action = String(body?.action || '').toUpperCase();
  if (!['PUBLISH','REJECT','REVERT_TO_REVIEW','UPDATE'].includes(action)) {
    return NextResponse.json({ error: 'Ongeldige actie' }, { status: 400 });
  }
  const page = await prisma.companyPage.findUnique({ where: { id: params.id }, select: { id: true, companyId: true, status: true } });
  if (!page) return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 });

  if (action === 'PUBLISH') {
    const vimeoIds = Array.isArray(body?.vimeoIds) ? body.vimeoIds.map((x: any)=> String(x||'').trim()).filter((x: string)=>/^\d+$/.test(x)) : [];
    if (vimeoIds.length < 2) return NextResponse.json({ error: 'Voer 2 geldige Vimeo IDs in' }, { status: 400 });
    // Upsert two clips for the company, set to PUBLISHED
    const existing = await prisma.clip.findMany({ where: { companyId: page.companyId }, orderBy: { createdAt: 'asc' } });
    const ops: any[] = [];
    // Ensure unique set of up to 2 IDs
    const ids: string[] = Array.from(new Set(vimeoIds)).slice(0,2) as string[];
    // Replace or create first two
    for (let i=0;i<ids.length;i++) {
      const id = ids[i];
      if (existing[i]) {
        ops.push(prisma.clip.update({ where: { id: existing[i].id }, data: { vimeoShortId: id, status: 'PUBLISHED' as any } }));
      } else {
        ops.push(prisma.clip.create({ data: { companyId: page.companyId, vimeoShortId: id, status: 'PUBLISHED' as any } }));
      }
    }
    // Archive any other existing clips beyond the first two
    if (existing.length > 2) {
      ops.push(prisma.clip.updateMany({ where: { companyId: page.companyId, id: { in: existing.slice(2).map(c=>c.id) } }, data: { status: 'ARCHIVED' as any } }));
    }
    await prisma.$transaction(ops);
    await prisma.companyPage.update({ where: { id: params.id }, data: { status: 'PUBLISHED' as any, longVideoVimeoId: ids[1] || null } });
    // Mark any submitted update requests as approved so they no longer appear in the dashboard
    await prisma.moderation.updateMany({
      where: { resourceType: 'COMPANY' as any, resourceId: params.id, status: 'SUBMITTED' as any },
      data: { status: 'APPROVED' as any },
    });
    // Notify the company owner that the page is published
    try {
      const company = await prisma.company.findUnique({ where: { id: page.companyId }, select: { ownerId: true, name: true } });
      if (company?.ownerId) {
        const owner = await prisma.user.findUnique({ where: { id: company.ownerId }, select: { email: true, name: true } });
        if (owner?.email) {
          const server: SMTPTransport.Options = {
            host: process.env.EMAIL_SERVER_HOST,
            port: process.env.EMAIL_SERVER_PORT ? Number(process.env.EMAIL_SERVER_PORT) : undefined,
            secure: process.env.EMAIL_SERVER_SECURE === 'true',
            auth: process.env.EMAIL_SERVER_USER && process.env.EMAIL_SERVER_PASSWORD ? {
              user: process.env.EMAIL_SERVER_USER,
              pass: process.env.EMAIL_SERVER_PASSWORD,
            } : undefined,
          };
          const tx = nodemailer.createTransport(server);
          const subject = 'Je webpagina is gepubliceerd';
          const coral = '#ff546b';
          const webUrl = process.env.NEXT_PUBLIC_WEB_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
          const html = `<!doctype html><html><body style="font-family:Montserrat,Arial,sans-serif;color:#111">
            <h2>Je webpagina staat live</h2>
            <p>Goed nieuws! Je bedrijfspagina is zojuist gepubliceerd op Levend Portret.</p>
            <p style="margin-top:16px"><a href="${webUrl}" style="display:inline-block;background:${coral};color:#fff;text-decoration:none;padding:10px 16px;border-radius:8px;font-weight:600">Bekijk je pagina</a></p>
          </body></html>`;
          const text = 'Je webpagina is gepubliceerd op Levend Portret.';
          await tx.sendMail({
            to: owner.email,
            from: process.env.EMAIL_FROM || 'Levend Portret <noreply@example.com>',
            replyTo: process.env.EMAIL_REPLY_TO || 'Levend Portret <info@levendportret.nl>',
            subject,
            html,
            text,
          });
        }
      }
    } catch (e) {
      if (process.env.NODE_ENV !== 'production') console.warn('publish mail failed', e);
    }
    return NextResponse.json({ id: params.id, status: 'PUBLISHED' });
  }

  if (action === 'REJECT') {
    const notes = String(body?.notes || '').trim();
    if (!notes) return NextResponse.json({ error: 'Geef een reden mee' }, { status: 400 });
    await prisma.moderation.create({ data: { resourceType: 'COMPANY' as any, resourceId: page.id, status: 'REJECTED' as any, notes } });
    await prisma.companyPage.update({ where: { id: params.id }, data: { status: 'DRAFT' as any } });
    return NextResponse.json({ id: params.id, status: 'DRAFT' });
  }

  // REVERT_TO_REVIEW
  if (action === 'REVERT_TO_REVIEW') {
    await prisma.companyPage.update({ where: { id: params.id }, data: { status: 'IN_REVIEW' as any } });
    return NextResponse.json({ id: params.id, status: 'IN_REVIEW' });
  }

  // UPDATE basic fields
  const allowed = ['aboutLong','gallery','accentColor','titleFont','bodyFont','roundedCorners','showCompanyNameNextToLogo','socials','showContactPage','clipsThumbnailUrl','longVideoVimeoId'] as const;
  const data: any = {};
  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(body, key)) {
      (data as any)[key] = (body as any)[key];
    }
  }
  // Normalize longVideoVimeoId if present: accept numeric ID or Vimeo URL
  if (typeof data.longVideoVimeoId !== 'undefined') {
    const raw = String(data.longVideoVimeoId || '').trim();
    if (!raw) {
      data.longVideoVimeoId = null;
    } else if (/^\d+$/.test(raw)) {
      data.longVideoVimeoId = raw;
    } else {
      try {
        const u = new URL(raw);
        if (u.hostname.includes('vimeo.com')) {
          const parts = u.pathname.split('/').filter(Boolean);
          const last = parts[parts.length - 1];
          data.longVideoVimeoId = last && /^\d+$/.test(last) ? last : null;
        } else {
          data.longVideoVimeoId = null;
        }
      } catch {
        data.longVideoVimeoId = null;
      }
    }
  }
  // Basic validation for clipsThumbnailUrl (optional, must be an image URL)
  if (typeof data.clipsThumbnailUrl !== 'undefined') {
    const url = String(data.clipsThumbnailUrl || '').trim();
    if (!url) {
      data.clipsThumbnailUrl = null;
    } else {
      try {
        const u = new URL(url);
        const ok = /\.(png|jpe?g|webp)$/i.test(u.pathname);
        if (!ok) return NextResponse.json({ error: 'Thumbnail moet een PNG/JPG/WEBP URL zijn (9x16 aanbevolen).' }, { status: 400 });
        data.clipsThumbnailUrl = url;
      } catch {
        return NextResponse.json({ error: 'Ongeldige thumbnail-URL' }, { status: 400 });
      }
    }
  }
  if (Object.keys(data).length === 0) return NextResponse.json({ error: 'Geen wijzigingen' }, { status: 400 });
  await prisma.companyPage.update({ where: { id: params.id }, data });
  return NextResponse.json({ id: params.id, ok: true });
}
