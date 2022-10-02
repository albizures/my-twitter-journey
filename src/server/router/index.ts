import superjson from 'superjson';
import { users } from './users';
import { twitterUser } from './twitterUser';
import { createRouter } from './utils';
import { tweet } from './tweet';

export const serverRouter = createRouter()
	.merge('user.', users)
	.merge('twitterUser.', twitterUser)
	.merge('tweet.', tweet)
	.transformer(superjson);

export type ServerRouter = typeof serverRouter;
