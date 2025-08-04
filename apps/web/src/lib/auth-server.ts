import "server-only";

import { cookies } from "next/headers";
import { auth } from "../../../server/src/lib/auth";

// Server-side session and user functions for RSC
export async function getSession() {
	try {
		const cookieStore = await cookies();
		const sessionCookie = cookieStore.get("better-auth-session");
		
		if (!sessionCookie) {
			return null;
		}

		// Create headers object for better-auth
		const headers = new Headers();
		headers.set("cookie", `better-auth-session=${sessionCookie.value}`);

		// Use better-auth to verify the session
		const session = await auth.api.getSession({
			headers,
		});

		return session;
	} catch (error) {
		console.error("Failed to get session:", error);
		return null;
	}
}

export async function getUser() {
	try {
		const session = await getSession();
		return session?.user || null;
	} catch (error) {
		console.error("Failed to get user:", error);
		return null;
	}
}

export async function requireAuth() {
	const user = await getUser();
	if (!user) {
		throw new Error("Authentication required");
	}
	return user;
}