import { PrismaClient } from '@prisma/client';
import { Result, to } from 'maybe-await-to';
import { NextApiRequest, NextApiResponse } from 'next';
import { saveTweet } from '../../entities/tweet';
import {
	getLastCheckedUser,
	makeSnapshot,
} from '../../entities/twitterUser';
import { getRecentTweetByUser, TweetList } from '../../utils/twitter';

const prisma = new PrismaClient();

interface Updates {
	errors: unknown[];
	ids: unknown[];
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<Updates>,
) {
	const lastCheckedUser = await getLastCheckedUser();

	if (!lastCheckedUser) {
		return res.status(200).json({
			errors: [],
			ids: [],
		});
	}

	const lastSavedTweet = lastCheckedUser.tweets[0];
	const lastSavedTweetId = lastSavedTweet?.id;

	const ids = [];
	const errors = [];
	let retries = 0;
	let nextToken: string | undefined = undefined;

	while (true) {
		// console.log('checking updates', {
		// 	username: lastCheckedUser.snapshots[0]?.username,
		// 	lastSavedTweetId,
		// 	errors: errors.length,
		// 	retries,
		// 	ids,
		// });

		const tweetsResult: Result<TweetList> = await to(
			getRecentTweetByUser({
				userId: lastCheckedUser.id,
				last: lastSavedTweetId,
				nextToken,
			}),
		);

		if (!tweetsResult.ok) {
			if (retries > 2) {
				console.error('error getting the tweets, last try done :(');
				errors.push(tweetsResult.error);
				return res.status(500).json({ errors, ids: ids });
			}

			console.error(
				`error getting the tweets, trying again (${retries})`,
			);

			retries += 1;
			continue;
		}

		const { data: tweets, meta } = tweetsResult.data as TweetList;

		// console.info(`${tweets.length} tweets got since`);

		for (let index = 0; index < tweets.length; index++) {
			const tweet = tweets[index];

			const result = await to(saveTweet(tweet));

			if (!result.ok) {
				console.error(
					`error saving tweet "${tweet.id}", trying again`,
					result.error,
				);
				errors.push(result.error);
			} else {
				// console.info(`tweet "${tweet.id}" saved`);

				ids.push(result.data.id);
			}
		}

		nextToken = meta.nextToken ?? '';
		retries = 0;

		// 10 is the max tweets that twitter api returns
		// if it's less than 10 means it's the last page
		if (meta.resultCount < 10 || !nextToken) {
			break;
		}
	}

	const result = await to(
		prisma.twitterUser.update({
			where: {
				id: lastCheckedUser.id,
			},
			data: {
				lastTimeChecked: new Date(),
			},
		}),
	);

	if (!result.ok) {
		errors.push(result.error);
	}

	const snapshotResult = await to(makeSnapshot(lastCheckedUser.id));

	if (!snapshotResult.ok) {
		errors.push(snapshotResult.error);
	}

	res.status(200).json({
		errors,
		ids: ids,
	});
}
