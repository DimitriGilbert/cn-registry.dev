import { type NextRequest, NextResponse } from "next/server";
import {
	invalidateCategories,
	invalidateComponent,
	invalidateComponents,
	invalidateCreator,
	invalidateCreators,
	invalidateProject,
	invalidateTool,
	invalidateTools,
} from "@/lib/cache";

// Secret key for cache invalidation (should be set in environment)
const REVALIDATION_SECRET =
	process.env.CACHE_REVALIDATION_SECRET || "dev-secret";

export async function POST(request: NextRequest) {
	try {
		// Verify secret
		const authHeader = request.headers.get("authorization");
		const providedSecret = authHeader?.replace("Bearer ", "");

		if (providedSecret !== REVALIDATION_SECRET) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Parse request body
		const body = await request.json();
		const { type, id } = body;

		// Handle different invalidation types
		switch (type) {
			case "components":
				if (id) {
					invalidateComponent(id);
				} else {
					invalidateComponents();
				}
				break;

			case "tools":
				if (id) {
					invalidateTool(id);
				} else {
					invalidateTools();
				}
				break;

			case "creators":
				if (id) {
					invalidateCreator(id);
				} else {
					invalidateCreators();
				}
				break;

			case "categories":
				invalidateCategories();
				break;

			case "projects":
				if (id) {
					invalidateProject(id);
				}
				// Note: No general projects invalidation since getAll is protected
				break;

			default:
				return NextResponse.json(
					{ error: `Unknown invalidation type: ${type}` },
					{ status: 400 },
				);
		}

		return NextResponse.json({
			success: true,
			message: `Invalidated ${type}${id ? ` (${id})` : ""}`,
		});
	} catch (error) {
		console.error("Cache invalidation error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
