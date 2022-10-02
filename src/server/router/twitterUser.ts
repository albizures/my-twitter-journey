import { prisma, Role } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { createRouter, getUserFromCtx, hasRole } from './utils';

export const twitterUser = createRouter()
	.query('count', {
		resolve(args) {
			const { ctx } = args;
			const { prisma } = ctx;

			return prisma.twitterUser.count();
		},
	})
	.query('find', {
		resolve(args) {
			// 📝: support pagination, search and trim properties
			const { ctx } = args;
			const { prisma } = ctx;

			if (!hasRole(ctx, Role.ADMIN)) {
				throw new TRPCError({ code: 'UNAUTHORIZED' });
			}

			return prisma.twitterUser.findMany({
				select: {
					id: true,
					lastTimeChecked: true,
					snapshots: {
						take: 1,
						orderBy: {
							createdAt: 'desc',
						},
					},
				},
			});
		},
	})
	.query('snapshopts', {
		input: z.object({
			id: z.string(),
		}),
		resolve(args) {
			const { ctx, input } = args;
			const { prisma } = ctx;
			return prisma.twitterUserSnapshot.findMany({
				where: {
					userId: input.id,
				},
			});
		},
	});
