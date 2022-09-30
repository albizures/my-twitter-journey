import { PrismaClient, Tweet } from '@prisma/client';
import { to } from 'maybe-await-to';
import { tweetLookup } from '../utils/twitter';

const prisma = new PrismaClient();

export async function saveTweet(tweet: Tweet) {
	// checking if the tweet is already save
	const checkTweet = await prisma.tweet.findFirst({
		where: {
			id: tweet.id,
		},
	});

	if (checkTweet) {
		return tweet;
	}

	if (tweet.conversationId && tweet.id !== tweet.conversationId) {
		const conversation = await prisma.tweet.findFirst({
			where: {
				id: tweet.conversationId,
			},
		});

		if (!conversation) {
			const result = await to(tweetLookup(tweet.conversationId));

			if (!result.ok) {
				console.error('error saving conversation of', tweet.id);
			} else {
				const { data: lookupTweet } = result;

				const user = await prisma.twitterUser.findFirst({
					where: {
						id: lookupTweet.userId,
					},
				});

				// only save tweet from tracked users
				if (user) {
					await prisma.tweet.create({
						data: lookupTweet,
					});
				}
			}
		}
	}

	return prisma.tweet.create({
		data: tweet,
	});
}
