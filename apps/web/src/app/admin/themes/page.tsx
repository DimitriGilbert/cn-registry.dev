"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, Edit, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Container } from "@/components/layout/container";
import { PageTitle } from "@/components/layout/page-title";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useFormedible } from "@/hooks/use-formedible";
import { trpc, type trpcClient } from "@/utils/trpc";

const themeSchema = z.object({
	name: z.string().min(1, "Theme name is required"),
	tokens: z.string().min(1, "Tokens are required"),
});

type ThemeFormValues = z.infer<typeof themeSchema>;

export default function ManageThemesPage() {
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const queryClient = useQueryClient();

	// Create theme mutation
	const createThemeMutation = useMutation(
		trpc.themes.create.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["themes", "getAll"] });
				toast.success("Theme created successfully");
				setIsCreateDialogOpen(false);
				form.reset();
			},
			onError: () => {
				toast.error("Failed to create theme");
			},
		}),
	);

	// Create theme form
	const { Form: CreateThemeForm, form } = useFormedible<ThemeFormValues>({
		schema: themeSchema,
		formOptions: {
			defaultValues: { name: "", tokens: "" },
			onSubmit: async ({ value }) => {
				// Parse tokens string to object
				let tokens: Record<string, string | number | boolean>;
				try {
					tokens = JSON.parse(value.tokens);
				} catch {
					toast.error("Invalid JSON in tokens field");
					return;
				}

				createThemeMutation.mutate({ name: value.name, tokens });
			},
		},
	});

	// Fetch themes
	const {
		data: themes,
		isLoading,
		error,
	} = useQuery(trpc.themes.getAll.queryOptions());

	// Delete theme mutation
	const deleteThemeMutation = useMutation(
		trpc.themes.delete.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["themes", "getAll"] });
				toast.success("Theme deleted successfully");
			},
			onError: () => {
				toast.error("Failed to delete theme");
			},
		}),
	);

	const handleDeleteTheme = (id: string, name: string) => {
		if (confirm(`Are you sure you want to delete "${name}"?`)) {
			deleteThemeMutation.mutate({ id });
		}
	};

	const handleCopyTheme = (
		theme: Awaited<ReturnType<typeof trpcClient.themes.getAll.query>>[number],
	) => {
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
							<CreateThemeForm className="space-y-4">
								<form.Field name="name">
									{(field) => (
										<div className="space-y-2">
											<label
												htmlFor={`theme-name-${field.name}`}
												className="font-medium text-sm"
											>
												Theme Name
											</label>
											<input
												id={`theme-name-${field.name}`}
												className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:font-medium file:text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
												value={field.state.value}
												onChange={(e) => field.handleChange(e.target.value)}
												onBlur={field.handleBlur}
												placeholder="e.g., Dark Purple"
											/>
											{field.state.meta.errors.length > 0 && (
												<div className="text-destructive text-sm">
													{field.state.meta.errors[0]}
												</div>
											)}
										</div>
									)}
								</form.Field>
								<form.Field name="tokens">
									{(field) => (
										<div className="space-y-2">
											<label
												htmlFor={`theme-tokens-${field.name}`}
												className="font-medium text-sm"
											>
												Theme Tokens (JSON)
											</label>
											<textarea
												id={`theme-tokens-${field.name}`}
												className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
												value={field.state.value}
												onChange={(e) => field.handleChange(e.target.value)}
												onBlur={field.handleBlur}
												placeholder='{"primary": "#000000", "secondary": "#ffffff"}'
											/>
											{field.state.meta.errors.length > 0 && (
												<div className="text-destructive text-sm">
													{field.state.meta.errors[0]}
												</div>
											)}
										</div>
									)}
								</form.Field>
							</CreateThemeForm>
						</DialogContent>
					</Dialog>
				</PageTitle>

				{isLoading ? (
					<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
						{Array.from({ length: 6 }).map((_, i) => (
							<Card key={`theme-loading-${i}`}>
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
