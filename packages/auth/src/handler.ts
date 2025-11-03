import NextAuth from 'next-auth';
import { authOptions } from './config';

export const handler = NextAuth(authOptions);
