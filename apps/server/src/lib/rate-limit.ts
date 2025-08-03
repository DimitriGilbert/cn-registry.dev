import { TRPCError } from "@trpc/server";

interface RateLimitEntry {
	count: number;
	resetTime: number;
}

class InMemoryRateLimit {
	private store = new Map<string, RateLimitEntry>();

	// Clean up expired entries every 5 minutes
	constructor() {
		setInterval(
			() => {
				const now = Date.now();
				for (const [key, entry] of this.store.entries()) {
					if (now > entry.resetTime) {
						this.store.delete(key);
					}
				}
			},
			5 * 60 * 1000,
		);
	}

	check(key: string, limit: number, windowMs: number): boolean {
		const now = Date.now();
		const entry = this.store.get(key);

		if (!entry || now > entry.resetTime) {
			this.store.set(key, {
				count: 1,
				resetTime: now + windowMs,
			});
			return true;
		}

		if (entry.count >= limit) {
			return false;
		}

		entry.count++;
		return true;
	}
}

const rateLimiter = new InMemoryRateLimit();

export function createRateLimit(limit: number, windowMs: number) {
	return (identifier: string) => {
		const allowed = rateLimiter.check(identifier, limit, windowMs);

		if (!allowed) {
			throw new TRPCError({
				code: "TOO_MANY_REQUESTS",
				message: "Rate limit exceeded. Please try again later.",
			});
		}
	};
}

// Pre-configured rate limiters
export const apiRateLimit = createRateLimit(5000, 15 * 60 * 1000); // 5000 requests per 15 minutes
export const authRateLimit = createRateLimit(2000, 15 * 60 * 1000); // 2000 requests per 15 minutes
export const adminRateLimit = createRateLimit(10000, 15 * 60 * 1000); // 10000 requests per 15 minutes for admin
