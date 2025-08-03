import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	output: "standalone",
	outputFileTracingRoot: require("path").join(__dirname, "../.."),
	async headers() {
		const corsOrigin = process.env.CORS_ORIGIN || "";
		const isDev = process.env.NODE_ENV === "development";
		const devConnections = isDev
			? " http://localhost:3001 http://localhost:3000"
			: "";

		return [
			{
				source: "/(.*)",
				headers: [
					{
						key: "X-Frame-Options",
						value: "DENY",
					},
					{
						key: "X-Content-Type-Options",
						value: "nosniff",
					},
					{
						key: "Referrer-Policy",
						value: "strict-origin-when-cross-origin",
					},
					{
						key: "X-XSS-Protection",
						value: "1; mode=block",
					},
					{
						key: "Strict-Transport-Security",
						value: "max-age=31536000; includeSubDomains",
					},
					{
						key: "Content-Security-Policy",
						value: `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.counter.dev; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' ${corsOrigin}${devConnections} https: wss: ws:; frame-ancestors 'none';`,
					},
				],
			},
		];
	},
};

export default nextConfig;
