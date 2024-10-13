import { Redis as UpstashRedis } from "@upstash/redis";

export class Redis {
	private static instance: Redis;
	public client: UpstashRedis;
	private constructor() {
		if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
			throw new Error("UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set");
		}
		this.client = new UpstashRedis({
			url: process.env.UPSTASH_REDIS_REST_URL,
			token: process.env.UPSTASH_REDIS_REST_TOKEN,
		});
	}

	public static getInstance(): Redis {
		if (!Redis.instance) {
			Redis.instance = new Redis();
		}
		return Redis.instance; 
	}
}
