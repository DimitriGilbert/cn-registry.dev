#!/usr/bin/env bun

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { config } from "dotenv";
import { eq } from "drizzle-orm";
import { db } from "../apps/server/src/db";
import { components, tools, githubCache } from "../apps/server/src/db/schema";

// Load environment variables from server app
const envPath = resolve(__dirname, "../apps/server/.env");
const result = config({ path: envPath });

if (result.error) {
	console.error("❌ Error loading .env file:", result.error);
	process.exit(1);
}

// Verify DATABASE_URL is loaded
if (!process.env.DATABASE_URL) {
	console.error("❌ DATABASE_URL not found in environment variables");
	console.log(`Tried to load from: ${envPath}`);
	process.exit(1);
}

interface GitHubRepoData {
	name: string;
	description: string;
	stargazers_count: number;
	forks_count: number;
	open_issues_count: number;
	language: string;
	license?: { name: string };
	topics: string[];
	updated_at: string;
	pushed_at: string;
	html_url: string;
}

interface GitHubReadmeData {
	content: string;
	encoding: string;
}

function extractGitHubRepoUrl(url: string): string | null {
	const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
	if (!match) return null;
	return `https://github.com/${match[1]}/${match[2]}`;
}

async function fetchGitHubData(repoUrl: string): Promise<any> {
	const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
	if (!match) throw new Error("Invalid GitHub URL");
	
	const [, owner, repo] = match;
	const cleanRepo = repo.replace(/\.git$/, "");
	
	console.log(`📡 Fetching GitHub data for ${owner}/${cleanRepo}...`);
	
	// Fetch repository data
	const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${cleanRepo}`, {
		headers: {
			"User-Agent": "cn-registry-import",
			...(process.env.GITHUB_TOKEN && {
				"Authorization": `token ${process.env.GITHUB_TOKEN}`
			})
		}
	});
	
	if (!repoResponse.ok) {
		throw new Error(`GitHub API error: ${repoResponse.status} ${repoResponse.statusText}`);
	}
	
	const repoData: GitHubRepoData = await repoResponse.json();
	
	// Fetch README
	let readmeContent = "";
	try {
		const readmeResponse = await fetch(`https://api.github.com/repos/${owner}/${cleanRepo}/readme`, {
			headers: {
				"User-Agent": "cn-registry-import",
				...(process.env.GITHUB_TOKEN && {
					"Authorization": `token ${process.env.GITHUB_TOKEN}`
				})
			}
		});
		
		if (readmeResponse.ok) {
			const readmeData: GitHubReadmeData = await readmeResponse.json();
			readmeContent = Buffer.from(readmeData.content, readmeData.encoding as BufferEncoding).toString();
		}
	} catch (error) {
		console.log(`  ⚠️  Could not fetch README: ${error}`);
	}
	
	return {
		...repoData,
		readme: readmeContent,
		fetched_at: new Date().toISOString()
	};
}

async function updateGitHubCache(repoUrl: string, data: any): Promise<void> {
	const expiresAt = new Date();
	expiresAt.setHours(expiresAt.getHours() + 6); // Cache for 6 hours
	
	await db
		.insert(githubCache)
		.values({
			repoUrl,
			data: JSON.stringify(data),
			lastFetched: new Date(),
			expiresAt
		})
		.onConflictDoUpdate({
			target: githubCache.repoUrl,
			set: {
				data: JSON.stringify(data),
				lastFetched: new Date(),
				expiresAt
			}
		});
}

async function importGitHubDataForComponents(): Promise<void> {
	console.log("🔍 Finding components with GitHub URLs...");
	
	const componentsWithGitHub = await db
		.select()
		.from(components)
		.where(eq(components.repoUrl, components.repoUrl)); // Get all components with repoUrl
	
	const githubComponents = componentsWithGitHub.filter(component => 
		component.repoUrl && component.repoUrl.includes("github.com")
	);
	
	console.log(`📦 Found ${githubComponents.length} components with GitHub URLs`);
	
	let successCount = 0;
	let errorCount = 0;
	
	for (const component of githubComponents) {
		try {
			const repoUrl = extractGitHubRepoUrl(component.repoUrl!);
			if (!repoUrl) {
				console.log(`⚠️  Invalid GitHub URL for ${component.name}: ${component.repoUrl}`);
				errorCount++;
				continue;
			}
			
			// Check if we have recent cached data
			const cached = await db
				.select()
				.from(githubCache)
				.where(eq(githubCache.repoUrl, repoUrl))
				.limit(1);
			
			if (cached.length > 0 && new Date(cached[0].expiresAt) > new Date()) {
				console.log(`📋 Using cached data for ${component.name}`);
				successCount++;
				continue;
			}
			
			// Fetch fresh data
			const githubData = await fetchGitHubData(repoUrl);
			await updateGitHubCache(repoUrl, githubData);
			
			console.log(`✅ Updated GitHub data for ${component.name} (⭐ ${githubData.stargazers_count})`);
			successCount++;
			
			// Rate limiting - GitHub allows 60 requests per hour without token, 5000 with token
			await new Promise(resolve => setTimeout(resolve, process.env.GITHUB_TOKEN ? 1500 : 3000));
			
		} catch (error) {
			console.error(`❌ Failed to fetch GitHub data for ${component.name}:`, error);
			errorCount++;
		}
	}
	
	console.log(`\n📊 Components GitHub import completed:`);
	console.log(`  ✅ Success: ${successCount}`);
	console.log(`  ❌ Errors: ${errorCount}`);
}

async function importGitHubDataForTools(): Promise<void> {
	console.log("🔍 Finding tools with GitHub URLs...");
	
	const toolsWithGitHub = await db
		.select()
		.from(tools)
		.where(eq(tools.repoUrl, tools.repoUrl)); // Get all tools with repoUrl
	
	const githubTools = toolsWithGitHub.filter(tool => 
		tool.repoUrl && tool.repoUrl.includes("github.com")
	);
	
	console.log(`🛠️  Found ${githubTools.length} tools with GitHub URLs`);
	
	let successCount = 0;
	let errorCount = 0;
	
	for (const tool of githubTools) {
		try {
			const repoUrl = extractGitHubRepoUrl(tool.repoUrl!);
			if (!repoUrl) {
				console.log(`⚠️  Invalid GitHub URL for ${tool.name}: ${tool.repoUrl}`);
				errorCount++;
				continue;
			}
			
			// Check if we have recent cached data
			const cached = await db
				.select()
				.from(githubCache)
				.where(eq(githubCache.repoUrl, repoUrl))
				.limit(1);
			
			if (cached.length > 0 && new Date(cached[0].expiresAt) > new Date()) {
				console.log(`📋 Using cached data for ${tool.name}`);
				successCount++;
				continue;
			}
			
			// Fetch fresh data
			const githubData = await fetchGitHubData(repoUrl);
			await updateGitHubCache(repoUrl, githubData);
			
			console.log(`✅ Updated GitHub data for ${tool.name} (⭐ ${githubData.stargazers_count})`);
			successCount++;
			
			// Rate limiting
			await new Promise(resolve => setTimeout(resolve, process.env.GITHUB_TOKEN ? 1500 : 3000));
			
		} catch (error) {
			console.error(`❌ Failed to fetch GitHub data for ${tool.name}:`, error);
			errorCount++;
		}
	}
	
	console.log(`\n📊 Tools GitHub import completed:`);
	console.log(`  ✅ Success: ${successCount}`);
	console.log(`  ❌ Errors: ${errorCount}`);
}

async function main() {
	const targetType = process.argv[2];
	
	console.log("🚀 Starting GitHub data import...");
	
	if (!process.env.GITHUB_TOKEN) {
		console.log("⚠️  No GITHUB_TOKEN found. Rate limiting will be more restrictive.");
		console.log("   Add GITHUB_TOKEN to your .env file for better performance.");
	}
	
	try {
		console.log("🔌 Testing database connection...");
		await db.select().from(components).limit(1);
		console.log("✅ Database connection successful");
		
		if (!targetType || targetType === "components") {
			await importGitHubDataForComponents();
		}
		
		if (!targetType || targetType === "tools") {
			await importGitHubDataForTools();
		}
		
		console.log("\n🎉 GitHub data import completed!");
		console.log("💡 GitHub data is cached for 6 hours to avoid rate limiting.");
		
	} catch (error) {
		console.error("❌ Error during GitHub import:", error);
		
		if (error instanceof Error && error.message.includes("rate limit")) {
			console.log("\n💡 GitHub rate limit exceeded. Try:");
			console.log("   1. Wait an hour and try again");
			console.log("   2. Add GITHUB_TOKEN to your .env file");
		}
		
		process.exit(1);
	}
}

main();