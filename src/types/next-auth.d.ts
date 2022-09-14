import NextAuth, { DefaultSession } from 'next-auth';
import { Role } from '@prisma/client';

declare module 'next-auth' {
	// ℹ️: to extend/override the returned type by `useSession`, `getSession`
	//		and received as a prop on the `SessionProvider` React Context
	interface User {
		roles: Role;
		id: string;
	}

	interface Session {
		user: User & DefaultSession['user'];
	}
}
