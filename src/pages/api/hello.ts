// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { PrismaClient, Tweet } from '@prisma/client';
import assert from 'assert';
import { Result, to } from 'maybe-await-to';
import type { NextApiRequest, NextApiResponse } from 'next';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from '../../config/auth';
import {
	getRecentTweetByUser,
	userLookup,
	TweetList,
	tweetLookup,
} from '../../utils/twitter';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	// const user = await to(
	// 	userLookup((req.query.id as string) ?? 'tdinh_me'),
	// );
	// if (user.ok) {
	// const newUser = await prisma.twitterUser.create({
	// 	data: {
	// 		id: user.data.userId,
	// 		lastTimeChecked: new Date(),
	// 		snapshots: {
	// 			create: {
	// 				username: user.data.username,
	// 				name: user.data.name,
	// 				followerCount: user.data.followerCount,
	// 				followingCount: user.data.followingCount,
	// 				tweetCount: user.data.tweetCount,
	// 				pinnedTweetId: user.data.pinnedTweetId,
	// 				bio: user.data.bio,
	// 				location: user.data.location,
	// 				website: user.data.website,
	// 				createdAt: user.data.createdAt,
	// 				verified: user.data.verified,
	// 			},
	// 		},
	// 	},
	// });
	// const tweets = await to(
	// 	getRecentTweetByUser({
	// 		userId: user.data.userId,
	// 	}),
	// );
	// prisma.
	// if (tweets.ok) {
	// res.status(200).json(newUser);
	// } else {
	// 	res.status(500).json(tweets.error);
	// }
	// } else {
	// 	res.status(500).json(user.error);
	// }
}
