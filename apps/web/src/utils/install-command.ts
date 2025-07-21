interface InstallItem {
	installCommand?: string | null;
	installUrl?: string | null;
	name: string;
	githubUrl?: string | null;
	repoUrl?: string | null;
}

/**
 * Generate install command for a component
 */
export function generateInstallCommand(item: InstallItem): string {
	if (item.installCommand) {
		return item.installCommand;
	}
	
	if (item.installUrl) {
		return `npx shadcn@latest add ${item.installUrl}`;
	}
	
	return `# No install command available - check repository: ${item.githubUrl || item.repoUrl || 'repository not found'}`;
}

/**
 * Generate install command for a tool
 */
export function generateToolInstallCommand(item: InstallItem): string {
	if (item.installCommand) {
		return item.installCommand;
	}
	
	if (item.installUrl) {
		return `npm install ${item.installUrl}`;
	}
	
	return `# No install command available - check repository: ${item.githubUrl || item.repoUrl || 'repository not found'}`;
}

/**
 * Generate multiple install commands (for cart)
 */
export function generateMultipleInstallCommands(items: InstallItem[]): string {
	if (items.length === 0) return "";
	
	// Extract URLs from shadcn commands and separate other types
	const shadcnUrls: string[] = [];
	const otherCommands: string[] = [];
	const withoutInstall: InstallItem[] = [];
	
	items.forEach(item => {
		// Check if installCommand is a shadcn command we can extract URL from
		if (item.installCommand) {
			const shadcnMatch = item.installCommand.match(/npx shadcn(-ui)?@latest add (.+)/);
			if (shadcnMatch) {
				shadcnUrls.push(shadcnMatch[2].trim());
			} else {
				otherCommands.push(item.installCommand);
			}
		} else if (item.installUrl) {
			shadcnUrls.push(item.installUrl);
		} else {
			withoutInstall.push(item);
		}
	});
	
	const commands: string[] = [];
	
	// Single command for all shadcn URLs
	if (shadcnUrls.length > 0) {
		commands.push(`npx shadcn-ui@latest add ${shadcnUrls.join(' ')}`);
	}
	
	// Individual non-shadcn commands
	if (otherCommands.length > 0) {
		commands.push(...otherCommands);
	}
	
	// Comments for items without install methods
	if (withoutInstall.length > 0) {
		const comments = withoutInstall.map(item => 
			`# ${item.name} - check repository: ${item.githubUrl || item.repoUrl || 'repository not found'}`
		);
		commands.push(...comments);
	}
	
	return commands.join('\n');
}