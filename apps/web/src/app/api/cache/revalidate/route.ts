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

// Secret key for cache invalidation (must be set in environment)
const getRevalidationSecret = () => {
	const secret = process.env.CACHE_REVALIDATION_SECRET;
	if (!secret) {
		throw new Error("CACHE_REVALIDATION_SECRET environment variable is required");
	}
	return secret;
};

export async function POST(request: NextRequest) {
	try {
		// Verify secret
		const authHeader = request.headers.get("authorization");
		const providedSecret = authHeader?.replace("Bearer ", "");
		const revalidationSecret = getRevalidationSecret();

		if (providedSecret !== revalidationSecret) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Parse request body
		const body = await request.json();
		
		if (!body || typeof body !== 'object') {
			return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
		}
		
		const { type, id } = body;
		
		if (!type || typeof type !== 'string') {
			return NextResponse.json({ error: "Missing or invalid 'type' field" }, { status: 400 });
		}

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
