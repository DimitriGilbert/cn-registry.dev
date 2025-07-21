import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { auth } from "../../../server/src/lib/auth";

console.log(
	"AUTH CLIENT URL:",
	process.env.NEXT_PUBLIC_SERVER_URL || "https://api.cn-registry.dev",
);

export const authClient = createAuthClient({
	baseURL: process.env.NEXT_PUBLIC_SERVER_URL || "https://api.cn-registry.dev",
	plugins: [inferAdditionalFields<typeof auth>()],
});
