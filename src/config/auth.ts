import { NextAuthOptions } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import TwitterProvider from 'next-auth/providers/twitter';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { TWITTER_API_KEY, TWITTER_API_SECRET } from '../config';

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
	adapter: PrismaAdapter(prisma),
	providers: [
		TwitterProvider({
			clientId: TWITTER_API_KEY,
			clientSecret: TWITTER_API_SECRET,
		}),
	],
	callbacks: {
		async session({ session, user }) {
			session.user.roles = user.roles;
			session.user.id = user.id;

			return session;
		},
	},
};
