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
	socialLinks?: unknown;
	username?: string | null;
	name?: string;
}): string {
	// If user has a direct image URL, use it
	if (user.image) {
		return user.image;
	}

	// Try to get GitHub avatar from username (if it looks like a GitHub username)
	if (user.username) {
		return `https://github.com/${user.username}.png`;
	}

	// Try to get GitHub avatar from social links
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
