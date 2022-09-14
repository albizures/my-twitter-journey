import { Role } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { createRouter, getUserFromCtx, hasRole } from './utils';

export const users = createRouter()
	.query('find', {
		resolve(args) {
			// 📝: support pagination, search and trim properties
			const { ctx } = args;
			const { prisma } = ctx;

			if (!hasRole(ctx, Role.ADMIN)) {
				throw new TRPCError({ code: 'UNAUTHORIZED' });
			}

			return prisma.user.findMany();
		},
	})
	.mutation('update', {
		input: z.object({
			id: z.string(),
			name: z.string(),
			role: z.nativeEnum(Role).optional(),
		}),
		resolve: async ({ input, ctx }) => {
			const { id, ...data } = input;

			const user = getUserFromCtx(ctx);

			if (!hasRole(ctx, Role.ADMIN)) {
				if (id !== user.id) {
					throw new TRPCError({ code: 'UNAUTHORIZED' });
				}

				// ℹ️: only admins can change roles
				delete data.role;
			}

			return await ctx.prisma.user.update({
				where: { id },
				data: { ...data },
			});
		},
	});
