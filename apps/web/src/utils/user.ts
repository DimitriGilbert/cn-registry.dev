/**
 * Utility functions for user data processing
 */

/**
 * Extract GitHub username from GitHub URL
 */
function extractGithubUsername(githubUrl: string): string | null {
	try {
		const url = new URL(githubUrl);
		if (url.hostname !== "github.com") return null;

		const parts = url.pathname.split("/").filter(Boolean);
		return parts[0] || null;
	} catch {
		return null;
	}
}

/**
 * Get user avatar URL with fallback to GitHub avatar if available
 */
export function getUserAvatarUrl(user: {
	image?: string | null;
	socialLinks?: Record<string, string> | null;
}): string {
	// If user has a direct image URL, use it
	if (user.image) {
		return user.image;
	}

	// Try to get GitHub avatar
	const socialLinks = user.socialLinks as Record<string, string> | null;
	if (socialLinks?.github) {
		const githubUsername = extractGithubUsername(socialLinks.github);
		if (githubUsername) {
			return `https://github.com/${githubUsername}.png`;
		}
	}

	// Fallback to placeholder
	return "/placeholder-user.jpg";
}
