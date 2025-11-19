import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@levendportret/auth';
import { prisma } from '@levendportret/db';

export default async function PostAuthRouter() {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.user?.email) {
    redirect('/inloggen');
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    redirect('/inloggen');
  }

  // ACTIVE users go home, all others go to pending page
  if ((user as any).status === 'ACTIVE') {
    redirect('/');
  }
  // If not ACTIVE: route to onboarding when company is missing or incomplete (required basics empty)
  const company = await prisma.company.findUnique({ where: { ownerId: user.id }, select: { id: true, address: true, city: true, zipCode: true } });
  if (!company || !company.address || !company.city || !company.zipCode) {
    redirect('/onboarding/bedrijf');
  }
  redirect('/in-behandeling');
}
