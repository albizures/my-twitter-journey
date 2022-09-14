import { users } from './users';
import { createRouter } from './utils';

export const serverRouter = createRouter().merge('user.', users);

export type ServerRouter = typeof serverRouter;
