import { PrismaClient, TwitterUserSnapshot } from '@prisma/client';
import { Optional } from 'utility-types';
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

async function isSnapshotUnique(
	userId: string,
	snapshot: Optional<TwitterUserSnapshot, 'id'>,
) {
	const lastSnapshot = await to(
		prisma.twitterUserSnapshot.findFirst({
			where: {
				userId,
			},
			orderBy: {
				createdAt: 'desc',
			},
		}),
	);
	if (!lastSnapshot.ok || !lastSnapshot.data) {
		// let's create the snapshot
		return true;
	}

	const { data } = lastSnapshot;

	return (
		snapshot.username !== data.username ||
		snapshot.name !== data.name ||
		snapshot.followerCount !== data.followerCount ||
		snapshot.followingCount !== data.followingCount ||
		snapshot.tweetCount !== data.tweetCount ||
		snapshot.pinnedTweetId !== data.pinnedTweetId ||
		snapshot.bio !== data.bio ||
		snapshot.location !== data.location ||
		snapshot.website !== data.website ||
		snapshot.verified !== data.verified
	);
}

export async function makeSnapshot(userId: string) {
	const snapshot = await to(userLookup(userId));

	if (snapshot.ok) {
		const { data } = snapshot;

		const isUnique = await isSnapshotUnique(userId, data);

		if (!isUnique) {
			return;
		}

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
