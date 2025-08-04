import "server-only";

import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";

export async function POST(req: NextRequest): Promise<NextResponse> {
	const secret = req.headers.get("x-revalidate-secret");
	const envSecret = process.env.NEXT_REVALIDATE_SECRET;
	
	if (
		!envSecret ||
		!secret ||
		!timingSafeEqual(Buffer.from(secret), Buffer.from(envSecret))
	) {
		return NextResponse.json({ ok: false }, { status: 401 });
	}
	
	const body = (await req.json().catch(() => null)) as {
		tags?: string[];
	} | null;
	
	if (!body || typeof body !== 'object') {
		return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
	}
	
	const tags = body?.tags?.filter(Boolean) ?? [];
	
	// Validate and limit tags
	const validTags = tags
		.filter(tag => typeof tag === 'string' && tag.length > 0 && tag.length <= 100)
		.slice(0, 50); // Limit to 50 tags per request
	
	for (const tag of validTags) revalidateTag(tag);
	return NextResponse.json({ ok: true, revalidated: validTags });
}
