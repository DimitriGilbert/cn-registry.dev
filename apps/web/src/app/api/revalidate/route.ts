import "server-only";

import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	const secret = req.headers.get("x-revalidate-secret");
	if (
		!process.env.NEXT_REVALIDATE_SECRET ||
		secret !== process.env.NEXT_REVALIDATE_SECRET
	) {
		return NextResponse.json({ ok: false }, { status: 401 });
	}
	const body = (await req.json().catch(() => null)) as {
		tags?: string[];
	} | null;
	const tags = body?.tags?.filter(Boolean) ?? [];
	for (const tag of tags) revalidateTag(tag);
	return NextResponse.json({ ok: true, revalidated: tags });
}
