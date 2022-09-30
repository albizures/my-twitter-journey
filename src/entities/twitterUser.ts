import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ONE_DAY = 24 * 60 * 60 * 1000;

export async function getLastCheckedUser() {
	const user = await prisma.twitterUser.findFirst({
		select: {
			id: true,
			lastTimeChecked: true,
			snapshots: {
				take: 1,
				select: {
					username: true,
				},
			},
			tweets: {
				take: 1,
				orderBy: {
					createdAt: 'desc',
				},
				select: {
					id: true,
				},
			},
		},
		orderBy: {
			lastTimeChecked: 'asc',
		},
	});

	if (user) {
		const now = Date.now();
		const checked = user.lastTimeChecked.getTime();
		const diff = now - checked;

		return diff > ONE_DAY ? user : null;
	}

	return user;
}
