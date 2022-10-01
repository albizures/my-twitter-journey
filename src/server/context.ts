import * as trpc from '@trpc/server';
import { Session, unstable_getServerSession } from 'next-auth';
import * as trpcNext from '@trpc/server/adapters/next';

import { authOptions } from '../config/auth';
import { prisma } from './prisma';
import { PrismaClient } from '@prisma/client';

export async function createContext(
	args: trpcNext.CreateNextContextOptions,
) {
	const { req, res } = args;

	const session = await unstable_getServerSession(
		req,
		res,
		authOptions,
	);

	return { prisma, session };
}

export type ContextWithSession = trpc.inferAsyncReturnType<
	() => Promise<{
		prisma: PrismaClient;
		session: Session;
	}>
>;

export type Context = trpc.inferAsyncReturnType<typeof createContext>;
