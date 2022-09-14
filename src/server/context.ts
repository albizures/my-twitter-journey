import * as trpc from '@trpc/server';
import { Session, unstable_getServerSession } from 'next-auth';
import * as trpcNext from '@trpc/server/adapters/next';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '../config/auth';

export async function createContext(
	args: trpcNext.CreateNextContextOptions,
) {
	const { req, res } = args;
	const prisma = new PrismaClient();

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
