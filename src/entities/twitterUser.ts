import { PrismaClient } from '@prisma/client';
import { to } from 'maybe-await-to';
import { userLookup } from '../utils/twitter';

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

export async function makeSnapshot(userId: string) {
	const snapshot = await to(userLookup(userId));

	if (snapshot.ok) {
		const { data } = snapshot;
		await prisma.twitterUserSnapshot.create({
			data: {
				userId,
				username: data.username,
				name: data.name,
				followerCount: data.followerCount,
				followingCount: data.followingCount,
				tweetCount: data.tweetCount,
				pinnedTweetId: data.pinnedTweetId,
				bio: data.bio,
				location: data.location,
				website: data.website,
				createdAt: new Date(),
				verified: data.verified,
			},
		});
	} else {
		throw snapshot.error;
	}
}
