import { prisma, Role } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { createRouter, getUserFromCtx, hasRole } from './utils';

export const tweet = createRouter().query('count', {
	resolve(args) {
		const { ctx } = args;
		const { prisma } = ctx;

		return prisma.tweet.count();
	},
});
