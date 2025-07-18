"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, Edit, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Container } from "@/components/layout/container";
import { PageTitle } from "@/components/layout/page-title";
import { ThemePreview } from "@/components/theme/theme-preview";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc, trpcClient } from "@/utils/trpc";

export default function ManageThemesPage() {
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [newTheme, setNewTheme] = useState({
		name: "",
		tokens: {},
	});
	const queryClient = useQueryClient();

	// Fetch themes
	const {
		data: themes,
		isLoading,
		error,
	} = useQuery(trpc.themes.getAll.queryOptions());

	// Create theme mutation
	const createThemeMutation = useMutation({
		mutationFn: async (data: { name: string; tokens: Record<string, any> }) => {
			const result = await trpcClient.themes.create.mutate(data);
			return result;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["themes", "getAll"] });
			toast.success("Theme created successfully");
			setIsCreateDialogOpen(false);
			setNewTheme({ name: "", tokens: {} });
		},
		onError: () => {
			toast.error("Failed to create theme");
		},
	});

	// Delete theme mutation
	const deleteThemeMutation = useMutation({
		mutationFn: async (id: string) => {
			const result = await trpcClient.themes.delete.mutate({ id });
			return result;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["themes", "getAll"] });
			toast.success("Theme deleted successfully");
		},
		onError: () => {
			toast.error("Failed to delete theme");
		},
	});

	const handleCreateTheme = () => {
		if (!newTheme.name.trim()) {
			toast.error("Theme name is required");
			return;
		}
		createThemeMutation.mutate(newTheme);
	};

	const handleDeleteTheme = (id: string, name: string) => {
		if (confirm(`Are you sure you want to delete "${name}"?`)) {
			deleteThemeMutation.mutate(id);
		}
	};

	const handleCopyTheme = (theme: any) => {
		navigator.clipboard.writeText(JSON.stringify(theme.tokens, null, 2));
		toast.success("Theme tokens copied to clipboard");
	};

	const formatDate = (date: string) => {
		return new Date(date).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	return (
		<Container>
			<div className="py-8">
				<PageTitle
					title="Manage Themes"
					subtitle="Create and manage theme configurations"
				>
					<Dialog
						open={isCreateDialogOpen}
						onOpenChange={setIsCreateDialogOpen}
					>
						<DialogTrigger asChild>
							<Button>
								<Plus className="mr-2 h-4 w-4" />
								Create Theme
							</Button>
						</DialogTrigger>
						<DialogContent className="max-w-md">
							<DialogHeader>
								<DialogTitle>Create New Theme</DialogTitle>
								<DialogDescription>
									Create a new theme configuration for the registry.
								</DialogDescription>
							</DialogHeader>
							<div className="space-y-4">
								<div>
									<Label htmlFor="theme-name">Theme Name</Label>
									<Input
										id="theme-name"
										value={newTheme.name}
										onChange={(e) =>
											setNewTheme({ ...newTheme, name: e.target.value })
										}
										placeholder="e.g., Dark Purple"
									/>
								</div>
								<div>
									<Label htmlFor="theme-tokens">Theme Tokens (JSON)</Label>
									<textarea
										id="theme-tokens"
										className="min-h-[200px] w-full rounded-md border p-3"
										value={JSON.stringify(newTheme.tokens, null, 2)}
										onChange={(e) => {
											try {
												const tokens = JSON.parse(e.target.value);
												setNewTheme({ ...newTheme, tokens });
											} catch {
												// Invalid JSON, keep current state
											}
										}}
										placeholder='{"primary": "#000000", "secondary": "#ffffff"}'
									/>
								</div>
							</div>
							<DialogFooter>
								<Button
									variant="outline"
									onClick={() => setIsCreateDialogOpen(false)}
								>
									Cancel
								</Button>
								<Button
									onClick={handleCreateTheme}
									disabled={createThemeMutation.isPending}
								>
									{createThemeMutation.isPending
										? "Creating..."
										: "Create Theme"}
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</PageTitle>

				{isLoading ? (
					<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
						{Array.from({ length: 6 }).map((_, i) => (
							<Card key={i}>
								<CardHeader>
									<Skeleton className="h-5 w-32" />
									<Skeleton className="h-4 w-48" />
								</CardHeader>
								<CardContent>
									<Skeleton className="h-24 w-full" />
								</CardContent>
							</Card>
						))}
					</div>
				) : error ? (
					<div className="py-12 text-center">
						<p className="text-destructive">
							Error loading themes. Please try again.
						</p>
					</div>
				) : themes?.length === 0 ? (
					<div className="py-12 text-center">
						<p className="text-muted-foreground">
							No themes found. Create your first theme to get started.
						</p>
					</div>
				) : (
					<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
						{themes?.map((theme) => (
							<Card key={theme.id}>
								<CardHeader>
									<div className="flex items-center justify-between">
										<div>
											<CardTitle className="flex items-center gap-2">
												{theme.name}
												{theme.isDefault && (
													<span className="rounded bg-primary px-2 py-1 text-primary-foreground text-xs">
														Default
													</span>
												)}
											</CardTitle>
											<CardDescription>
												Created by {theme.creator?.name || "Unknown"} on{" "}
												{formatDate(theme.createdAt)}
											</CardDescription>
										</div>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="ghost" size="icon">
													<MoreHorizontal className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuItem
													onClick={() => handleCopyTheme(theme)}
												>
													<Copy className="mr-2 h-4 w-4" />
													Copy Tokens
												</DropdownMenuItem>
												<DropdownMenuItem>
													<Edit className="mr-2 h-4 w-4" />
													Edit
												</DropdownMenuItem>
												{!theme.isDefault && (
													<DropdownMenuItem
														className="text-destructive"
														onClick={() =>
															handleDeleteTheme(theme.id, theme.name)
														}
														disabled={deleteThemeMutation.isPending}
													>
														<Trash2 className="mr-2 h-4 w-4" />
														Delete
													</DropdownMenuItem>
												)}
											</DropdownMenuContent>
										</DropdownMenu>
									</div>
								</CardHeader>
								<CardContent>
									{/* <ThemePreview tokens={theme.tokens} /> */}
								</CardContent>
							</Card>
						))}
					</div>
				)}
			</div>
		</Container>
	);
}
