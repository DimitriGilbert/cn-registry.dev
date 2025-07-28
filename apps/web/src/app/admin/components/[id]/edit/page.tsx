"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Eye, Github, RefreshCw, Star, GitFork, AlertCircle, Calendar } from "lucide-react";
import Link from "next/link";
import { use } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Container } from "@/components/layout/container";
import { PageTitle } from "@/components/layout/page-title";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useFormedible } from "@/hooks/use-formedible";
import { trpc } from "@/utils/trpc";

const componentSchema = z.object({
	name: z.string().min(1, "Name is required"),
	description: z.string().min(1, "Description is required"),
	repoUrl: z
		.string()
		.refine(
			(val) => val === "" || z.url().safeParse(val).success,
			"Must be a valid URL or empty",
		),
	websiteUrl: z
		.string()
		.refine(
			(val) => val === "" || z.url().safeParse(val).success,
			"Must be a valid URL or empty",
		),
	installCommand: z.string().min(1, "Install command is required"),
	tags: z.array(z.string()),
	status: z.enum(["draft", "published", "archived"]),
	categoryIds: z.array(z.string()).optional(),
});

type ComponentFormValues = z.infer<typeof componentSchema>;

const statuses = [
	{ value: "draft", label: "Draft" },
	{ value: "published", label: "Published" },
	{ value: "archived", label: "Archived" },
];

export default function EditComponentPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = use(params);
	const queryClient = useQueryClient();

	// Fetch component data
	const { data: component, isLoading: isLoadingComponent } = useQuery(
		trpc.components.getById.queryOptions({ id }),
	);

	// Fetch categories for dropdown
	const { data: categories = [] } = useQuery(
		trpc.categories.getAll.queryOptions(),
	);

	// Fetch GitHub data ONLY when manually triggered
	const { data: githubData, isLoading: isLoadingGithub, refetch: refetchGithub } = useQuery(
		{
			...trpc.github.getRepoData.queryOptions({
				repoUrl: component?.repoUrl || ""
			}),
			enabled: false, // NEVER auto-fetch on page load
			staleTime: 5 * 60 * 1000, // 5 minutes
		}
	);

	// Update mutation
	const updateMutation = useMutation(
		trpc.components.update.mutationOptions({
			onSuccess: () => {
				toast.success("Component updated successfully!");
				queryClient.invalidateQueries({
					queryKey: trpc.components.getById.queryKey({ id }),
				});
				queryClient.invalidateQueries({
					queryKey: trpc.components.getAll.queryKey(),
				});
			},
			onError: (error) => {
				toast.error(error.message || "Failed to update component");
			},
		}),
	);

	// GitHub refresh mutation
	const githubRefreshMutation = useMutation(
		trpc.admin.importGitHubData.mutationOptions({
			onSuccess: () => {
				toast.success("GitHub data refreshed successfully");
				refetchGithub();
			},
			onError: (error) => {
				toast.error(`GitHub refresh failed: ${error.message}`);
			},
		}),
	);

	// Prepare form data
	const defaultValues = component
		? {
				name: component.name,
				description: component.description,
				repoUrl: component.repoUrl || "",
				websiteUrl: component.websiteUrl || "",
				installCommand: component.installCommand || "",
				tags: component.tags || [],
				status: component.status as "draft" | "published" | "archived",
				categoryIds:
					component.categories
						?.map((c) => c?.id)
						.filter((id): id is string => Boolean(id)) || [],
			}
		: {
				name: "",
				description: "",
				repoUrl: "",
				websiteUrl: "",
				installCommand: "",
				tags: [],
				status: "draft" as const,
				categoryIds: [],
			};

	const { Form } = useFormedible<ComponentFormValues>({
		schema: componentSchema,
		fields: [
			{ name: "name", type: "text", label: "Name" },
			{
				name: "description",
				type: "textarea",
				label: "Description",
				textareaConfig: { rows: 3 },
			},
			{
				name: "categoryIds",
				type: "multiSelect",
				label: "Categories",
				options: categories.map((cat) => ({
					value: cat.id,
					label: cat.name,
				})),
			},
			{
				name: "installCommand",
				type: "text",
				label: "Install Command",
				placeholder: "npx shadcn@latest add component-name",
			},
			{
				name: "repoUrl",
				type: "url",
				label: "Repository URL",
				placeholder: "https://github.com/username/repo",
			},
			{
				name: "websiteUrl",
				type: "url",
				label: "Website URL",
				placeholder: "https://example.com",
			},
			{ name: "status", type: "select", label: "Status", options: statuses },
		],
		formOptions: {
			defaultValues,
			onSubmit: async ({ value }) => {
				// Transform empty strings to undefined for optional URL fields
				const submitData = {
					...value,
					repoUrl: value.repoUrl === "" ? undefined : value.repoUrl,
					websiteUrl: value.websiteUrl === "" ? undefined : value.websiteUrl,
				};
				updateMutation.mutate({ id, ...submitData });
			},
		},
		loading: updateMutation.isPending || isLoadingComponent,
		submitLabel: "Save Changes",
	});

	if (isLoadingComponent) {
		return (
			<Container>
				<div className="py-8">
					<div className="text-center">Loading component...</div>
				</div>
			</Container>
		);
	}

	if (!component) {
		return (
			<Container>
				<div className="py-8">
					<div className="text-center">Component not found</div>
				</div>
			</Container>
		);
	}

	return (
		<Container>
			<div className="py-8">
				<div className="mb-6">
					<Breadcrumb>
						<BreadcrumbList>
							<BreadcrumbItem>
								<BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
							</BreadcrumbItem>
							<BreadcrumbSeparator />
							<BreadcrumbItem>
								<BreadcrumbLink href="/admin/components">
									Components
								</BreadcrumbLink>
							</BreadcrumbItem>
							<BreadcrumbSeparator />
							<BreadcrumbItem>
								<BreadcrumbPage>Edit {component.name}</BreadcrumbPage>
							</BreadcrumbItem>
						</BreadcrumbList>
					</Breadcrumb>
				</div>

				<PageTitle
					title={`Edit ${component.name}`}
					subtitle="Update component information and settings"
				>
					<div className="flex gap-2">
						<Button variant="outline" asChild>
							<Link href={`/components/${id}`}>
								<Eye className="mr-2 h-4 w-4" />
								View Component
							</Link>
						</Button>
						{component.repoUrl && component.repoUrl.includes("github.com") && (
							<Button
								variant="outline"
								onClick={() => {
									refetchGithub();
								}}
								disabled={isLoadingGithub}
							>
								<RefreshCw className={`mr-2 h-4 w-4 ${isLoadingGithub ? 'animate-spin' : ''}`} />
								{isLoadingGithub ? "Loading..." : "Load GitHub Data"}
							</Button>
						)}
						<Button variant="outline" asChild>
							<Link href="/admin/components">
								<ArrowLeft className="mr-2 h-4 w-4" />
								Back to Components
							</Link>
						</Button>
					</div>
				</PageTitle>

				{/* GitHub Data Section */}
				{component.repoUrl && component.repoUrl.includes("github.com") && (
					<Card className="mb-8">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Github className="h-5 w-5" />
								GitHub Information
							</CardTitle>
						</CardHeader>
						<CardContent>
							{!githubData && !isLoadingGithub ? (
								<div className="flex items-center gap-2 text-muted-foreground">
									<Github className="h-4 w-4" />
									Click "Load GitHub Data" to fetch repository information
								</div>
							) : isLoadingGithub ? (
								<div className="flex items-center gap-2 text-muted-foreground">
									<RefreshCw className="h-4 w-4 animate-spin" />
									Loading GitHub data...
								</div>
							) : githubData ? (
								<div className="space-y-4">
									<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
										<div className="flex items-center gap-2">
											<Star className="h-4 w-4 text-yellow-500" />
											<span className="font-medium">{githubData.stars}</span>
											<span className="text-muted-foreground text-sm">stars</span>
										</div>
										<div className="flex items-center gap-2">
											<GitFork className="h-4 w-4 text-blue-500" />
											<span className="font-medium">{githubData.forks}</span>
											<span className="text-muted-foreground text-sm">forks</span>
										</div>
										<div className="flex items-center gap-2">
											<AlertCircle className="h-4 w-4 text-red-500" />
											<span className="font-medium">{githubData.issues}</span>
											<span className="text-muted-foreground text-sm">issues</span>
										</div>
										<div className="flex items-center gap-2">
											<Calendar className="h-4 w-4 text-green-500" />
											<span className="text-muted-foreground text-sm">
												{githubData.lastCommit ? new Date(githubData.lastCommit).toLocaleDateString() : 'N/A'}
											</span>
										</div>
									</div>
									
									{githubData.language && (
										<div>
											<Badge variant="secondary">{githubData.language}</Badge>
										</div>
									)}
									
									{githubData.topics && githubData.topics.length > 0 && (
										<div>
											<h4 className="text-sm font-medium mb-2">Topics:</h4>
											<div className="flex flex-wrap gap-1">
												{githubData.topics.map((topic: string) => (
													<Badge key={topic} variant="outline" className="text-xs">
														{topic}
													</Badge>
												))}
											</div>
										</div>
									)}
									
									{githubData.license && (
										<div>
											<span className="text-sm text-muted-foreground">License: </span>
											<Badge variant="outline">{githubData.license}</Badge>
										</div>
									)}
									
									<div className="text-xs text-muted-foreground">
										Last fetched: Just now
									</div>
								</div>
							) : (
								<div className="flex items-center gap-2 text-destructive">
									<AlertCircle className="h-4 w-4" />
									Failed to load GitHub data. This could be due to rate limiting, network issues, or invalid repository URL.
								</div>
							)}
						</CardContent>
					</Card>
				)}

				<Card>
					<CardHeader>
						<CardTitle>Component Details</CardTitle>
					</CardHeader>
					<CardContent>
						<Form />
					</CardContent>
				</Card>
			</div>
		</Container>
	);
}
