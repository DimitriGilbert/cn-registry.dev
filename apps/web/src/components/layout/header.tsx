"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { CartButton } from "@/components/features/cart";
import { Container } from "@/components/layout/container";
import { ThemeSelector } from "@/components/theme-selector";
import { ThemeToggle } from "@/components/theme-toggle";
import { Input } from "@/components/ui/input";
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import UserMenu from "@/components/user-menu";
import { authClient } from "@/lib/auth-client";

export function Header() {
	const { data: session } = authClient.useSession();
	const isAdmin = session?.user?.role === "admin";

	return (
		<header className="sticky top-0 z-50 w-full border-b bg-background backdrop-blur supports-[backdrop-filter]:bg-background/95">
			<Container>
				<div className="flex h-16 items-center justify-between">
					<div className="flex items-center space-x-6">
						<Link href="/" className="flex items-center space-x-2">
							<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
								<span className="font-bold text-primary-foreground text-sm">
									cn
								</span>
							</div>
							<span className="font-bold text-xl">registry</span>
						</Link>

						<NavigationMenu>
							<NavigationMenuList>
								<NavigationMenuItem>
									<NavigationMenuLink asChild>
										<Link
											href="/"
											className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 font-medium text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
										>
											Home
										</Link>
									</NavigationMenuLink>
								</NavigationMenuItem>
								<NavigationMenuItem>
									<NavigationMenuLink asChild>
										<Link
											href="/components"
											className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 font-medium text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
										>
											Components
										</Link>
									</NavigationMenuLink>
								</NavigationMenuItem>
								<NavigationMenuItem>
									<NavigationMenuLink asChild>
										<Link
											href="/tools"
											className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 font-medium text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
										>
											Tools
										</Link>
									</NavigationMenuLink>
								</NavigationMenuItem>
								<NavigationMenuItem>
									<NavigationMenuLink asChild>
										<Link
											href="/creators"
											className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 font-medium text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
										>
											Creators
										</Link>
									</NavigationMenuLink>
								</NavigationMenuItem>
								{isAdmin && (
									<NavigationMenuItem>
										<NavigationMenuTrigger>Admin</NavigationMenuTrigger>
										<NavigationMenuContent>
											<div className="grid w-[400px] gap-3 p-6">
												<Link
													href="/admin"
													className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
												>
													<div className="font-medium text-sm leading-none">
														Dashboard
													</div>
													<p className="line-clamp-2 text-muted-foreground text-sm leading-snug">
														View analytics and manage content
													</p>
												</Link>
												<Link
													href="/admin/components"
													className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
												>
													<div className="font-medium text-sm leading-none">
														Components
													</div>
													<p className="line-clamp-2 text-muted-foreground text-sm leading-snug">
														Manage component registry
													</p>
												</Link>
												<Link
													href="/admin/tools"
													className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
												>
													<div className="font-medium text-sm leading-none">
														Tools
													</div>
													<p className="line-clamp-2 text-muted-foreground text-sm leading-snug">
														Manage developer tools
													</p>
												</Link>
												<Link
													href="/admin/themes"
													className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
												>
													<div className="font-medium text-sm leading-none">
														Themes
													</div>
													<p className="line-clamp-2 text-muted-foreground text-sm leading-snug">
														Manage theme configurations
													</p>
												</Link>
											</div>
										</NavigationMenuContent>
									</NavigationMenuItem>
								)}
							</NavigationMenuList>
						</NavigationMenu>
					</div>

					<div className="flex items-center space-x-4">
						<div className="relative">
							<Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
							<Input
								type="search"
								placeholder="Search components..."
								className="w-[300px] pl-8"
							/>
						</div>
						<CartButton />
						<ThemeSelector />
						<ThemeToggle />
						<UserMenu />
					</div>
				</div>
			</Container>
		</header>
	);
}
