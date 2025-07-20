"use client";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { trpc } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import {
	Bell,
	Component,
	Home,
	LogOut,
	Menu,
	Settings,
	Tags,
	Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

const adminNavItems = [
	{
		href: "/admin",
		label: "Dashboard",
		icon: Home,
	},
	{
		href: "/admin/components",
		label: "Components",
		icon: Component,
	},
	{
		href: "/admin/users",
		label: "Users",
		icon: Users,
	},
	{
		href: "/admin/categories",
		label: "Categories",
		icon: Tags,
	},
	{
		href: "/admin/notifications",
		label: "Notifications",
		icon: Bell,
	},
];

export default function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const pathname = usePathname();
	const router = useRouter();

	const { data: session, isLoading: sessionLoading } = useQuery(
		trpc.getSession.queryOptions()
	);

	// Redirect non-admin users
	useEffect(() => {
		if (!sessionLoading && (!session?.user || session.user.role !== "admin")) {
			toast.error("Admin access required");
			router.push("/");
		}
	}, [session, sessionLoading, router]);

	// Show loading while checking session
	if (sessionLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
			</div>
		);
	}

	// Don't render admin layout for non-admin users
	if (!session?.user || session.user.role !== "admin") {
		return null;
	}

	return (
		<div className="min-h-screen bg-background">
			{/* Admin Header */}
			<header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<div className="container mx-auto px-4 h-16 flex items-center justify-between">
					<div className="flex items-center gap-6">
						<Link href="/admin" className="font-bold text-xl">
							Admin Panel
						</Link>
						<nav className="hidden md:flex items-center gap-1">
							{adminNavItems.map((item) => {
								const Icon = item.icon;
								const isActive = pathname === item.href || 
									(item.href !== "/admin" && pathname.startsWith(item.href));
								
								return (
									<Link
										key={item.href}
										href={item.href}
										className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
											isActive
												? "bg-primary text-primary-foreground"
												: "hover:bg-muted"
										}`}
									>
										<Icon className="h-4 w-4" />
										{item.label}
									</Link>
								);
							})}
						</nav>
					</div>

					<div className="flex items-center gap-4">
						<Button variant="ghost" size="sm" asChild>
							<Link href="/">
								<Home className="h-4 w-4 mr-2" />
								Back to Site
							</Link>
						</Button>

						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" size="sm">
									<div className="flex items-center gap-2">
										{session.user.image && (
											<img
												src={session.user.image}
												alt={session.user.name || "Admin"}
												className="h-6 w-6 rounded-full"
											/>
										)}
										<span className="hidden sm:inline">
											{session.user.name || session.user.email}
										</span>
									</div>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem asChild>
									<Link href="/profile">
										<Settings className="h-4 w-4 mr-2" />
										Profile Settings
									</Link>
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem asChild>
									<Link href="/auth/logout">
										<LogOut className="h-4 w-4 mr-2" />
										Sign Out
									</Link>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>

						{/* Mobile menu */}
						<DropdownMenu>
							<DropdownMenuTrigger asChild className="md:hidden">
								<Button variant="ghost" size="sm">
									<Menu className="h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-48">
								{adminNavItems.map((item) => {
									const Icon = item.icon;
									return (
										<DropdownMenuItem key={item.href} asChild>
											<Link href={item.href}>
												<Icon className="h-4 w-4 mr-2" />
												{item.label}
											</Link>
										</DropdownMenuItem>
									);
								})}
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
			</header>

			{/* Admin Content */}
			<main>{children}</main>
		</div>
	);
}