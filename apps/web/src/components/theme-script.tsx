export function ThemeScript() {
	return (
		<script
			dangerouslySetInnerHTML={{
				__html: `
					(function() {
						function setTheme() {
							var theme = null;
							try {
								theme = localStorage.getItem('theme');
							} catch (e) {}
							
							var themeState;
							if (theme) {
								try {
									themeState = JSON.parse(theme);
								} catch (e) {
									themeState = { currentMode: theme === 'dark' ? 'dark' : 'light' };
								}
							} else {
								var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
								themeState = { currentMode: prefersDark ? 'dark' : 'light' };
							}
							
							var root = document.documentElement;
							root.classList.remove('light', 'dark');
							root.classList.add(themeState.currentMode);
						}
						
						setTheme();
					})();
				`,
			}}
		/>
	);
}
