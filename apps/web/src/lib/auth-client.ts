import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { auth } from "../../../server/src/lib/auth";

const baseURL = process.env.NEXT_PUBLIC_SERVER_URL || "https://api.cn-registry.dev";

if (process.env.NODE_ENV === "development") {
	console.log("AUTH CLIENT URL:", baseURL);
}

export const authClient = createAuthClient({
	baseURL,
	plugins: [inferAdditionalFields<typeof auth>()],
});
