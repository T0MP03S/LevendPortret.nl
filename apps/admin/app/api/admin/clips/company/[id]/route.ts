import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@levendportret/auth";
import { prisma } from "@levendportret/db";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const company = await prisma.company.findUnique({
    where: { id: params.id },
    select: { id: true },
  });
  if (!company) {
    return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
  }

  const clips = await prisma.clip.findMany({
    where: { companyId: params.id },
    orderBy: { createdAt: "asc" },
    select: { id: true, vimeoShortId: true, status: true },
  });

  const published = clips.filter((c) => c.status === ("PUBLISHED" as any));
  return NextResponse.json({ clips: published.slice(0, 2) });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const company = await prisma.company.findUnique({
    where: { id: params.id },
    select: { id: true },
  });
  if (!company) {
    return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const raw = Array.isArray((body as any)?.vimeoIds) ? (body as any).vimeoIds : [];
  const vimeoIds = raw
    .map((x: any) => String(x ?? "").trim())
    .filter((x: string) => /^\d+$/.test(x));

  if (vimeoIds.length < 2) {
    return NextResponse.json({ error: "Voer twee geldige Vimeo IDs in" }, { status: 400 });
  }

  const existing = await prisma.clip.findMany({
    where: { companyId: params.id },
    orderBy: { createdAt: "asc" },
  });

  const ops: any[] = [];
  const ids: string[] = Array.from(new Set(vimeoIds)).slice(0, 2) as string[];

  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    if (existing[i]) {
      ops.push(
        prisma.clip.update({
          where: { id: existing[i].id },
          data: { vimeoShortId: id, status: "PUBLISHED" as any },
        })
      );
    } else {
      ops.push(
        prisma.clip.create({
          data: { companyId: params.id, vimeoShortId: id, status: "PUBLISHED" as any },
        })
      );
    }
  }

  if (existing.length > 2) {
    ops.push(
      prisma.clip.updateMany({
        where: {
          companyId: params.id,
          id: { in: existing.slice(2).map((c) => c.id) },
        },
        data: { status: "ARCHIVED" as any },
      })
    );
  }

  await prisma.$transaction(ops);

  return NextResponse.json({ ok: true });
}
