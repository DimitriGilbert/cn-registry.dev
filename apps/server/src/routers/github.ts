import { eq } from "drizzle-orm";
import { db } from "../db";
import { githubCache } from "../db/schema";
import { publicProcedure, router } from "../lib/trpc";
import { githubRepoSchema } from "../lib/validation";

export interface GitHubRepoData {
	name: string;
	description: string;
	stars: number;
	forks: number;
	issues: number;
	watchers: number;
	language: string;
	license: string | null;
	lastCommit: string;
	readme: string | null;
	topics: string[];
	homepage: string | null;
}

function extractRepoInfo(
	repoUrl: string,
): { owner: string; repo: string } | null {
	try {
		const url = new URL(repoUrl);
		if (url.hostname !== "github.com") {
			return null;
		}

		const pathParts = url.pathname.split("/").filter(Boolean);
		if (pathParts.length >= 2) {
			return {
				owner: pathParts[0],
				repo: pathParts[1].replace(".git", ""),
			};
		}
		return null;
	} catch {
		return null;
	}
}

async function fetchGitHubData(
	owner: string,
	repo: string,
): Promise<GitHubRepoData | null> {
	try {
		// Fetch repository data
		const repoResponse = await fetch(
			`https://api.github.com/repos/${owner}/${repo}`,
			{
				headers: {
					Accept: "application/vnd.github.v3+json",
					"User-Agent": "CN-Registry",
					...(process.env.GITHUB_TOKEN && {
						"Authorization": `Bearer ${process.env.GITHUB_TOKEN}`
					})
				},
			},
		);

		if (!repoResponse.ok) {
			const errorText = await repoResponse.text();
			console.error(`GitHub API error for ${owner}/${repo}: ${repoResponse.status} ${repoResponse.statusText}`, errorText);
			
			if (repoResponse.status === 403) {
				throw new Error(`GitHub API rate limit exceeded. Please wait and try again later.`);
			}
			if (repoResponse.status === 404) {
				throw new Error(`Repository ${owner}/${repo} not found.`);
			}
			throw new Error(`GitHub API error: ${repoResponse.status} ${repoResponse.statusText}`);
		}

		const repoData = await repoResponse.json();

		// Rate limiting delay before next API call
		await new Promise(resolve => setTimeout(resolve, process.env.GITHUB_TOKEN ? 500 : 1000));

		// Fetch README
		let readme: string | null = null;
		try {
			const readmeResponse = await fetch(
				`https://api.github.com/repos/${owner}/${repo}/readme`,
				{
					headers: {
						Accept: "application/vnd.github.v3+json",
						"User-Agent": "CN-Registry",
						...(process.env.GITHUB_TOKEN && {
							"Authorization": `Bearer ${process.env.GITHUB_TOKEN}`
						})
					},
				},
			);

			if (readmeResponse.ok) {
				const readmeData = await readmeResponse.json();
				readme = Buffer.from(readmeData.content, "base64").toString("utf-8");
			}
		} catch {
			// README fetch failed, continue without it
		}

		// Rate limiting delay before next API call
		await new Promise(resolve => setTimeout(resolve, process.env.GITHUB_TOKEN ? 500 : 1000));

		// Fetch latest commit
		let lastCommit = repoData.updated_at;
		try {
			const commitsResponse = await fetch(
				`https://api.github.com/repos/${owner}/${repo}/commits?per_page=1`,
				{
					headers: {
						Accept: "application/vnd.github.v3+json",
						"User-Agent": "CN-Registry",
						...(process.env.GITHUB_TOKEN && {
							"Authorization": `Bearer ${process.env.GITHUB_TOKEN}`
						})
					},
				},
			);

			if (commitsResponse.ok) {
				const commitsData = await commitsResponse.json();
				if (commitsData.length > 0) {
					lastCommit = commitsData[0].commit.committer.date;
				}
			}
		} catch {
			// Commits fetch failed, use updated_at
		}

		return {
			name: repoData.name,
			description: repoData.description || "",
			stars: repoData.stargazers_count,
			forks: repoData.forks_count,
			issues: repoData.open_issues_count,
			watchers: repoData.watchers_count,
			language: repoData.language || "",
			license: repoData.license?.name || null,
			lastCommit,
			readme,
			topics: repoData.topics || [],
			homepage: repoData.homepage,
		};
	} catch (error) {
		console.error("GitHub API error:", error);
		return null;
	}
}

export const githubRouter = router({
	// Get repository stats and data
	getRepoData: publicProcedure
		.input(githubRepoSchema)
		.query(async ({ input }) => {
			const { repoUrl } = input;

			// Check cache first
			const cached = await db
				.select()
				.from(githubCache)
				.where(eq(githubCache.repoUrl, repoUrl))
				.limit(1);

			const now = new Date();

			// Return cached data if not expired
			if (cached[0] && new Date(cached[0].expiresAt) > now) {
				try {
					return JSON.parse(cached[0].data) as GitHubRepoData;
				} catch {
					// Invalid cached data, continue to fetch
				}
			}

			// Extract repository info
			const repoInfo = extractRepoInfo(repoUrl);
			if (!repoInfo) {
				throw new Error("Invalid GitHub repository URL");
			}

			// Fetch fresh data
			const data = await fetchGitHubData(repoInfo.owner, repoInfo.repo);
			if (!data) {
				throw new Error("Failed to fetch repository data");
			}

			// Cache the data
			const expiresAt = new Date(now.getTime() + 6 * 60 * 60 * 1000); // 6 hours
			await db
				.insert(githubCache)
				.values({
					repoUrl,
					data: JSON.stringify(data),
					lastFetched: now,
					expiresAt,
				})
				.onConflictDoUpdate({
					target: [githubCache.repoUrl],
					set: {
						data: JSON.stringify(data),
						lastFetched: now,
						expiresAt,
					},
				});

			return data;
		}),

	// Get README content only
	getReadme: publicProcedure
		.input(githubRepoSchema)
		.query(async ({ input }) => {
			const { repoUrl } = input;

			// Check cache first
			const cached = await db
				.select()
				.from(githubCache)
				.where(eq(githubCache.repoUrl, repoUrl))
				.limit(1);

			if (cached[0] && new Date(cached[0].expiresAt) > new Date()) {
				try {
					const data = JSON.parse(cached[0].data) as GitHubRepoData;
					return { readme: data.readme };
				} catch {
					// Continue to fetch fresh data
				}
			}

			// Extract repository info
			const repoInfo = extractRepoInfo(repoUrl);
			if (!repoInfo) {
				throw new Error("Invalid GitHub repository URL");
			}

			// Fetch README only
			try {
				const readmeResponse = await fetch(
					`https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/readme`,
					{
						headers: {
							Accept: "application/vnd.github.v3+json",
							"User-Agent": "CN-Registry",
							...(process.env.GITHUB_TOKEN && {
								"Authorization": `Bearer ${process.env.GITHUB_TOKEN}`
							})
						},
					},
				);

				if (!readmeResponse.ok) {
					return { readme: null };
				}

				const readmeData = await readmeResponse.json();
				const readme = Buffer.from(readmeData.content, "base64").toString(
					"utf-8",
				);

				return { readme };
			} catch {
				return { readme: null };
			}
		}),

	// Get repository stats only (lightweight)
	getRepoStats: publicProcedure
		.input(githubRepoSchema)
		.query(async ({ input }) => {
			const { repoUrl } = input;

			// Check cache first
			const cached = await db
				.select()
				.from(githubCache)
				.where(eq(githubCache.repoUrl, repoUrl))
				.limit(1);

			if (cached[0] && new Date(cached[0].expiresAt) > new Date()) {
				try {
					const data = JSON.parse(cached[0].data) as GitHubRepoData;
					return {
						stars: data.stars,
						forks: data.forks,
						issues: data.issues,
						watchers: data.watchers,
						language: data.language,
						lastCommit: data.lastCommit,
					};
				} catch {
					// Continue to fetch fresh data
				}
			}

			// Extract repository info
			const repoInfo = extractRepoInfo(repoUrl);
			if (!repoInfo) {
				throw new Error("Invalid GitHub repository URL");
			}

			// Fetch repository stats
			try {
				const repoResponse = await fetch(
					`https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}`,
					{
						headers: {
							Accept: "application/vnd.github.v3+json",
							"User-Agent": "CN-Registry",
							...(process.env.GITHUB_TOKEN && {
								"Authorization": `Bearer ${process.env.GITHUB_TOKEN}`
							})
						},
					},
				);

				if (!repoResponse.ok) {
					const errorText = await repoResponse.text();
					console.error(`GitHub API error: ${repoResponse.status} ${repoResponse.statusText}`, errorText);
					
					if (repoResponse.status === 403) {
						throw new Error(`GitHub API rate limit exceeded. Please wait and try again later.`);
					}
					if (repoResponse.status === 404) {
						throw new Error(`Repository not found.`);
					}
					throw new Error(`GitHub API error: ${repoResponse.status} ${repoResponse.statusText}`);
				}

				const repoData = await repoResponse.json();

				return {
					stars: repoData.stargazers_count,
					forks: repoData.forks_count,
					issues: repoData.open_issues_count,
					watchers: repoData.watchers_count,
					language: repoData.language || "",
					lastCommit: repoData.updated_at,
				};
			} catch {
				throw new Error("Failed to fetch repository stats");
			}
		}),
});
