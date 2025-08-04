import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	output: "standalone",
	outputFileTracingRoot: require("path").join(__dirname, "../.."),
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "github.com",
				port: "",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "avatars.githubusercontent.com",
				port: "",
				pathname: "/**",
			},
		],
	},
	async headers() {
		const serverUrl =
			process.env.NEXT_PUBLIC_SERVER_URL || "https://api.cn-registry.dev";
		const isDev = process.env.NODE_ENV === "development";
		const devConnections = isDev
			? " http://localhost:3002 http://localhost:3001"
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
						value: `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.counter.dev; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: avatars.githubusercontent.com github.com; font-src 'self' data:; connect-src 'self' ${serverUrl}${devConnections} https: wss: ws:; frame-ancestors 'none';`,
					},
				],
			},
		];
	},
};

export default nextConfig;
