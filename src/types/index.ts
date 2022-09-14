export interface Entity {
	createdAt: string;
	updatedAt: string;
}

export interface Tweet extends Entity {
	id: number;
	twitterHandle: string;
	hashtags: string[];
	mentions: string[];
	replayToTweet?: number;
	hashMedia: boolean;
}

export interface TwitterSnapshot {
	createdAt: string;
	retweetCount: number;
	likeCount: number;
	text: string;
}
