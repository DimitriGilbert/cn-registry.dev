import { initTRPC, TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { user } from "../db/schema";
import type { Context } from "./context";
import { adminRateLimit, apiRateLimit, authRateLimit } from "./rate-limit";

export const t = initTRPC.context<Context>().create();

export const router = t.router;

// Helper to get client IP from context
function getClientIP(ctx: Context): string {
	// In production, you might want to check X-Forwarded-For header
	return ctx.session?.user?.id || "anonymous";
}

export const publicProcedure = t.procedure.use(async ({ ctx, next }) => {
	const clientId = getClientIP(ctx);
	apiRateLimit(clientId);
	return next({ ctx });
});

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
	if (!ctx.session) {
		throw new TRPCError({
			code: "UNAUTHORIZED",
			message: "Authentication required",
			cause: "No session",
		});
	}

	// Apply auth rate limit
	authRateLimit(ctx.session.user.id);

	// Get user from database to include role and other info
	const dbUser = await db
		.select()
		.from(user)
		.where(eq(user.id, ctx.session.user.id))
		.limit(1);

	if (!dbUser[0]) {
		throw new TRPCError({
			code: "UNAUTHORIZED",
			message: "User not found",
		});
	}

	return next({
		ctx: {
			...ctx,
			session: ctx.session,
			user: dbUser[0],
		},
	});
});

export const creatorProcedure = protectedProcedure.use(({ ctx, next }) => {
	if (!["creator", "admin"].includes(ctx.user.role)) {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: "Creator role required",
		});
	}
	return next({ ctx });
});

export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
	if (ctx.user.role !== "admin") {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: "Admin role required",
		});
	}
	
	// Apply admin rate limit (higher limit)
	adminRateLimit(ctx.user.id);
	
	return next({ ctx });
});
