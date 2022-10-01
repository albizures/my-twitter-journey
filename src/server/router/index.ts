import superjson from 'superjson';
import { users } from './users';
import { twitterUser } from './twitterUser';
import { createRouter } from './utils';

export const serverRouter = createRouter()
	.merge('user.', users)
	.merge('twitterUser.', twitterUser)
	.transformer(superjson);

export type ServerRouter = typeof serverRouter;
