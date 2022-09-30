import { z } from 'zod';
import { Client } from 'twitter-api-sdk';
import { Tweet, TwitterUserSnapshot } from '@prisma/client';
import { TWITTER_BEARER_TOKEN } from '../config';
import type {
	findTweetById,
	TwitterParams,
} from 'twitter-api-sdk/dist/types';

const twitterClient = new Client(TWITTER_BEARER_TOKEN);

export const userSchema = z
	.object({
		data: z.object({
			id: z.string(),
			verified: z.boolean(),
			username: z.string(),
			pinned_tweet_id: z.string().optional(),
			created_at: z.string(),
			public_metrics: z.object({
				followers_count: z.number(),
				following_count: z.number(),
				tweet_count: z.number(),
				listed_count: z.number(),
			}),
			profile_image_url: z.string(),
			name: z.string(),
			description: z.string(),
			url: z.string(),
			location: z.string().optional(),
		}),
	})
	.transform((current): Omit<TwitterUserSnapshot, 'id'> => {
		const { data } = current;

		return {
			username: data.username,
			name: data.name,
			pinnedTweetId: data.pinned_tweet_id || null,
			followerCount: data.public_metrics.followers_count,
			followingCount: data.public_metrics.following_count,
			tweetCount: data.public_metrics.tweet_count,
			bio: data.description,
			location: data.location || null,
			website: data.url,
			createdAt: new Date(data.created_at),
			userId: data.id,
			verified: data.verified,
		};
	});

export async function userLookup(username: string) {
	const user = await twitterClient.users.findUserByUsername(
		username,
		{
			'user.fields': [
				'created_at',
				'description',
				'id',
				'name',
				'pinned_tweet_id',
				'profile_image_url',
				'public_metrics',
				'username',
				'verified',
				'location',
				'url',
			],
		},
	);

	const result = userSchema.safeParse(user);

	if (!result.success) {
		console.error(result.error);

		throw new Error('Unexpected data from twitter');
	}

	return result.data;
}

const tweetParams: TwitterParams<findTweetById> = {
	'tweet.fields': [
		'attachments',
		'author_id',
		'conversation_id',
		'created_at',
		'entities',
		'id',
		'in_reply_to_user_id',
		'lang',
		'public_metrics',
		'possibly_sensitive',
		'referenced_tweets',
		'reply_settings',
		'source',
		'text',
		'withheld',
	],
};

const tweetSchema = z
	.object({
		possibly_sensitive: z.boolean(),
		text: z.string(),
		public_metrics: z.object({
			retweet_count: z.number(),
			reply_count: z.number(),
			like_count: z.number(),
			quote_count: z.number(),
		}),
		entities: z
			.object({
				metions: z
					.array(
						z.object({
							id: z.string(),
						}),
					)
					.optional(),
				hashtags: z
					.array(
						z.object({
							tag: z.string(),
						}),
					)
					.optional(),
			})
			.optional(),
		attachments: z
			.object({
				media_keys: z.array(z.string()).optional(),
				poll_ids: z.array(z.string()).optional(),
			})
			.optional(),
		reply_settings: z.string(),
		created_at: z.string(),
		lang: z.string(),
		source: z.string(),
		conversation_id: z.string(),
		author_id: z.string(),
		id: z.string(),
		referenced_tweets: z
			.array(
				z.object({
					type: z.string(),
					id: z.string(),
				}),
			)
			.optional(),
	})
	.transform((current): Tweet => {
		const { entities, referenced_tweets, attachments } = current;
		const replyTo = referenced_tweets?.find(
			(t) => t.type === 'replied_to',
		);
		const quote = referenced_tweets?.find((t) => t.type === 'quoted');
		return {
			id: current.id,
			text: current.text,
			userId: current.author_id,
			hashtags: entities?.hashtags?.map((h) => h.tag) || [],
			mentions: entities?.metions?.map((m) => m.id) || [],
			media: attachments?.media_keys || [],
			polls: attachments?.poll_ids || [],
			source: current.source,
			lang: current.lang,
			createdAt: new Date(current.created_at),
			sensitive: current.possibly_sensitive,
			conversationId: current.conversation_id,
			quote: (quote && quote.id) || null,
			replayTo: (replyTo && replyTo.id) || null,
		};
	});

export const tweetLookupSchema = z
	.object({ data: tweetSchema })
	.transform((current) => {
		return current.data;
	});

export const tweetListSchema = z
	.object({
		data: z.array(tweetSchema).optional(),
		meta: z.object({
			next_token: z.string().optional(),
			result_count: z.number(),
			newest_id: z.string().optional(),
			oldest_id: z.string().optional(),
		}),
	})
	.transform((current) => {
		return {
			data: current.data ?? [],
			meta: {
				nextToken: current.meta.next_token,
				resultCount: current.meta.result_count,
				newestId: current.meta.newest_id,
				oldestId: current.meta.oldest_id,
			},
		};
	});

interface GetTweetsArgs {
	userId: string;
	last?: string;
	nextToken?: string | undefined;
}

export type TweetList = z.infer<typeof tweetListSchema>;

export async function getRecentTweetByUser(
	args: GetTweetsArgs,
): Promise<TweetList> {
	const { userId, last, nextToken } = args;

	const yesterday = new Date();
	yesterday.setDate(yesterday.getDate() - 1);

	const tweets = await twitterClient.tweets.tweetsRecentSearch({
		query: `from:${userId}`,
		sort_order: 'recency',
		since_id: last,
		// if there is not last tweet means it's the first time
		// and only tweets from yesterday are going to be registerd
		start_time: !last ? yesterday.toISOString() : undefined,
		next_token: nextToken,
		...tweetParams,
	});

	if (tweets.errors && tweets.errors.length !== 0) {
		throw tweets.errors;
	}

	const result = tweetListSchema.safeParse(tweets);

	if (!result.success) {
		console.error(result.error);

		throw new Error('Unexpected data from twitter');
	}

	return result.data;
}

export async function tweetLookup(id: string) {
	const lookupTweetById = await twitterClient.tweets.findTweetById(
		id,
		tweetParams,
	);

	if (lookupTweetById.errors && lookupTweetById.errors.length !== 0) {
		throw lookupTweetById.errors;
	}

	const result = tweetLookupSchema.safeParse(lookupTweetById);

	if (!result.success) {
		console.error('error with data', lookupTweetById);

		throw result.error;
	}

	return result.data;
}
