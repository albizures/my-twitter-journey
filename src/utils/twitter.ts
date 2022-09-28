import ky from 'ky';
import { z } from 'zod';
import { Client } from 'twitter-api-sdk';
import { Tweet } from '@prisma/client';
import { TWITTER_BEARER_TOKEN } from '../config';
import type {
	findTweetById,
	TwitterParams,
} from 'twitter-api-sdk/dist/types';

const twitter = ky.create({
	prefixUrl: 'https://api.twitter.com/1.1',
	headers: {
		Authorization: `Bearer ${TWITTER_BEARER_TOKEN}`,
	},
});

const userSchema = z
	.object({
		id_str: z.string(),
		name: z.string(),
		screen_name: z.string(),
		location: z.string(),
		description: z.string(),
		entities: z.object({
			url: z.object({
				urls: z.array(
					z.object({
						expanded_url: z.string().url(),
					}),
				),
			}),
		}),
		followers_count: z.number(),
		friends_count: z.number(),
		verified: z.boolean(),
		statuses_count: z.number(),
		profile_banner_url: z.string().url(),
		profile_image_url_https: z.string().url(),
	})
	.transform((value) => {
		return {
			...value,
			profile_image_url_https: value.profile_image_url_https.replace(
				'_normal',
				'',
			),
		};
	});

const userListSchema = z.array(userSchema);

const tweetSchema = z.object({
	id: z.number(),
	created_at: z.string(),
	user: z.object({
		screen_name: z.string(),
	}),
	entities: z.object({
		hashtags: z.array(
			z.object({
				text: z.string(),
			}),
		),
		user_mentions: z.array(
			z.object({
				screen_name: z.string(),
			}),
		),
	}),
	in_reply_to_status_id: z.number().optional(),
});

export async function getTweet(id: number) {
	const payload = await twitter
		.get(`statuses/show/${id}`, {
			searchParams: {
				trim_user: 'true',
			},
		})
		.json();

	return tweetSchema.parse(payload);
}

export async function getTwitterUsers(ids: string[]) {
	const payload = await twitter
		.post('users/lookup.json', {
			searchParams: { user_id: ids.join(',') },
		})
		.json();

	return userListSchema.parse(payload);
}

export async function getTwitterUser(username: string) {
	const payload = await twitter
		.get('users/show.json', {
			searchParams: {
				screen_name: username,
			},
		})
		.json();

	return userSchema.parse(payload);
}

interface GetTweetsArgs {
	username: string;
	count: number;
	after: string;
	before: string;
}

export async function getTweets(args: GetTweetsArgs) {
	const { username, count, after, before } = args;

	if (count > 10) {
		console.warn(
			`Checking for user timeline with a count of ${count}, it might hangs`,
		);
	}

	const payload = await twitter
		.get(`statuses/user_timeline.json`, {
			searchParams: {
				max_id: before,
				screen_name: username,
				count,
				since_id: after,
				trim_user: 'true',
			},
		})
		.json();

	return payload;
}

const twitterClient = new Client(TWITTER_BEARER_TOKEN);

export const schema = z
	.object({
		data: z.object({
			possibly_sensitive: z.boolean(),
			text: z.string(),
			public_metrics: z.object({
				retweet_count: z.number(),
				reply_count: z.number(),
				like_count: z.number(),
				quote_count: z.number(),
			}),
			entities: z.object({
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
			}),
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
		}),
	})
	.transform((current): Tweet => {
		const { data } = current;
		const { entities, referenced_tweets, attachments } = data;
		const replyTo = referenced_tweets?.find(
			(t) => t.type === 'replied_to',
		);
		const quote = referenced_tweets?.find((t) => t.type === 'quoted');
		return {
			id: data.id,
			userId: data.author_id,
			hashtags: entities.hashtags?.map((h) => h.tag) || [],
			mentions: entities.metions?.map((m) => m.id) || [],
			media: attachments?.media_keys || [],
			polls: attachments?.poll_ids || [],
			source: data.source,
			lang: data.lang,
			createdAt: new Date(data.created_at),
			sensitive: data.possibly_sensitive,
			conversationId: data.conversation_id,
			quote: (quote && quote.id) || null,
			replayTo: (replyTo && replyTo.id) || null,
		};
	});

export async function tweetLookup(id: string) {
	const params: TwitterParams<findTweetById> = {
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

	const lookupTweetById = await twitterClient.tweets.findTweetById(
		id,
		params,
	);

	return schema.safeParse(lookupTweetById);
}
