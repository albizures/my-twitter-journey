import { Role } from '@prisma/client';
import * as trpc from '@trpc/server';
import { TRPCError } from '@trpc/server';
import { Context, ContextWithSession } from '../context';

export function createRouter() {
	return trpc.router<Context>();
}

export function checkSession(
	context: Context,
): asserts context is ContextWithSession {
	const { session } = context;
	if (!session) {
		throw new TRPCError({
			code: 'UNAUTHORIZED',
			message: 'Session not found',
		});
	}
}

export function hasRole(context: Context, role: Role) {
	checkSession(context);
	const { session } = context;

	return session.user.roles.includes(role);
}

export function getUserFromCtx(context: Context) {
	checkSession(context);
	const { session } = context;

	return session.user;
}
