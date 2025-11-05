import { NextResponse } from "next/server";
import { prisma, Prisma } from "@levendportret/db";
import { hash } from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json({ message: "Ongeldige invoer" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ message: "Wachtwoord moet minimaal 8 tekens zijn" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ message: "E-mailadres is al in gebruik" }, { status: 409 });
    }

    const passwordHash = await hash(password, 10);

    const data: Prisma.UserCreateInput = { email, passwordHash } as Prisma.UserCreateInput;
    await prisma.user.create({ data });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("/api/register error", err);
    return NextResponse.json({ message: "Er ging iets mis" }, { status: 500 });
  }
}
