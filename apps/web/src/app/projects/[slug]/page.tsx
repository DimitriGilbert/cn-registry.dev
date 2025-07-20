"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	ArrowLeft,
	Calendar,
	Component,
	Copy,
	Download,
	Edit3,
	ExternalLink,
	Github,
	MoreVertical,
	Plus,
	Settings,
	Trash2,
	Users,
	X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Container } from "@/components/layout/container";
import { PageTitle } from "@/components/layout/page-title";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc, trpcClient } from "@/utils/trpc";

type ComponentCardProps = Awaited<
	ReturnType<typeof trpcClient.components.getAll.query>
>["components"][number] & {
	addedAt: string;
	onRemove: () => void;
	canEdit: boolean;
};

function ProjectComponentCard({
	id,
	name,
	description,
	categories,
	starsCount,
	githubUrl,
	websiteUrl,
	creator,
	addedAt,
	onRemove,
	canEdit,
}: ComponentCardProps) {
	return (
		<Card>
			<CardHeader>
				<div className="flex items-start justify-between">
					<div className="flex-1 space-y-1">
						<CardTitle className="text-lg">
							<Link href={`/components/${id}`} className="hover:underline">
								{name}
							</Link>
						</CardTitle>
						<CardDescription className="line-clamp-2">
							{description}
						</CardDescription>
					</div>
					{canEdit && (
						<Button
							variant="ghost"
							size="icon"
							onClick={onRemove}
							className="h-8 w-8 text-muted-foreground hover:text-destructive"
						>
							<X className="h-4 w-4" />
						</Button>
					)}
				</div>
				<div className="flex items-center gap-2">
					{categories
						?.filter(
							(category): category is NonNullable<typeof category> =>
								category !== null,
						)
						.map((category) => (
							<Badge key={category.id} variant="secondary">
								{category.name}
							</Badge>
						))}
				</div>
			</CardHeader>
			<CardContent>
				<div className="mb-4 flex items-center justify-between text-muted-foreground text-sm">
					<div className="flex items-center gap-4">
						<div>{starsCount} stars</div>
						{creator && <div>by {creator.name}</div>}
					</div>
					<div>Added {new Date(addedAt).toLocaleDateString()}</div>
				</div>
				<div className="flex items-center gap-2">
					<Button asChild size="sm" className="flex-1">
						<Link href={`/components/${id}`}>View Details</Link>
					</Button>
					{githubUrl && (
						<Button variant="outline" size="sm" asChild>
							<Link href={githubUrl} target="_blank">
								<Github className="h-3 w-3" />
							</Link>
						</Button>
					)}
					{websiteUrl && (
						<Button variant="outline" size="sm" asChild>
							<Link href={websiteUrl} target="_blank">
								<ExternalLink className="h-3 w-3" />
							</Link>
						</Button>
					)}
				</div>
			</CardContent>
		</Card>
	);
}

function CollaboratorCard({
	userId,
	role,
	user,
	addedAt,
	onRemove,
	onRoleChange,
	canManage,
	isOwner,
}: {
	userId: string;
	role: string;
	user: { id: string; name: string; username?: string; image?: string };
	addedAt: string;
	onRemove: () => void;
	onRoleChange: (newRole: string) => void;
	canManage: boolean;
	isOwner: boolean;
}) {
	return (
		<Card>
			<CardContent className="pt-6">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<img
							src={user.image || "/placeholder-user.jpg"}
							alt={user.name}
							className="h-10 w-10 rounded-full"
						/>
						<div>
							<p className="font-medium">{user.name}</p>
							<p className="text-muted-foreground text-sm">
								{user.username ? `@${user.username}` : ""}
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<Badge variant={role === "owner" ? "default" : "secondary"}>
							{role}
						</Badge>
						{canManage && !isOwner && (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" size="icon" className="h-8 w-8">
										<MoreVertical className="h-4 w-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuItem onClick={() => onRoleChange("viewer")}>
										Make Viewer
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => onRoleChange("editor")}>
										Make Editor
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem
										onClick={onRemove}
										className="text-destructive"
									>
										Remove
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

export default function ProjectDetailPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const [resolvedParams, setResolvedParams] = useState<{ slug: string } | null>(
		null,
	);
	const router = useRouter();
	const queryClient = useQueryClient();

	// Resolve params
	useState(() => {
		params.then(setResolvedParams);
	});

	const slug = resolvedParams?.slug;

	// Fetch project data by slug
	const {
		data: project,
		isLoading: projectLoading,
		error: projectError,
	} = useQuery({
		...trpc.projects.getBySlugWithRole.queryOptions({ slug: slug! }),
		enabled: !!slug,
	});

	// Fetch project components
	const { data: components = [], isLoading: componentsLoading } = useQuery({
		...trpc.projects.getComponents.queryOptions({ projectId: project?.id! }),
		enabled: !!project?.id,
	});

	// Remove component mutation
	const removeComponent = useMutation(
		trpc.projects.removeComponent.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: ["projects", "getComponents", { projectId: project!.id }],
				});
				toast.success("Component removed from project");
			},
			onError: (error) => {
				toast.error(`Failed to remove component: ${error.message}`);
			},
		}),
	);

	// Generate install config function
	const handleGenerateConfig = async (
		format: "registry" | "cli" | "package-json",
	) => {
		try {
			const data = await trpcClient.projects.generateInstallConfig.query({
				projectId: project!.id,
				format,
			});

			if (format === "cli") {
				navigator.clipboard.writeText((data as { command: string }).command);
				toast.success("CLI command copied to clipboard!");
			} else if (format === "registry") {
				const blob = new Blob([JSON.stringify(data, null, 2)], {
					type: "application/json",
				});
				const url = URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				a.download = "registry.json";
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
				URL.revokeObjectURL(url);
				toast.success("Registry file downloaded!");
			} else {
				const blob = new Blob([JSON.stringify(data, null, 2)], {
					type: "application/json",
				});
				const url = URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				a.download = "package.json";
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
				URL.revokeObjectURL(url);
				toast.success("Package.json downloaded!");
			}
		} catch (error) {
			toast.error(
				`Failed to generate config: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	};

	if (!slug || projectLoading) {
		return (
			<Container>
				<div className="py-8">
					<Skeleton className="mb-4 h-8 w-64" />
					<Skeleton className="mb-8 h-4 w-96" />
					<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
						{Array.from({ length: 6 }).map((_, i) => (
							<Skeleton key={i} className="h-48" />
						))}
					</div>
				</div>
			</Container>
		);
	}

	if (projectError || !project) {
		return (
			<Container>
				<div className="py-8">
					<div className="text-center">
						<h1 className="mb-2 font-bold text-2xl">Project Not Found</h1>
						<p className="mb-4 text-muted-foreground">
							The project you're looking for doesn't exist or you don't have
							access to it.
						</p>
						<Button asChild>
							<Link href="/projects">
								<ArrowLeft className="mr-2 h-4 w-4" />
								Back to Projects
							</Link>
						</Button>
					</div>
				</div>
			</Container>
		);
	}

	const canEdit = project.role === "owner" || project.role === "editor";
	const isOwner = project.role === "owner";

	return (
		<Container>
			<div className="py-8">
				<div className="mb-6">
					<Button variant="ghost" asChild className="mb-4">
						<Link href="/projects">
							<ArrowLeft className="mr-2 h-4 w-4" />
							Back to Projects
						</Link>
					</Button>

					<PageTitle
						title={project.name}
						subtitle={project.description || "No description"}
					>
						<div className="flex items-center gap-2">
							<Badge
								variant={
									project.visibility === "public" ? "default" : "secondary"
								}
							>
								{project.visibility}
							</Badge>
							{canEdit && (
								<Button variant="outline" asChild>
									<Link href={`/projects/${slug}/edit`}>
										<Edit3 className="mr-2 h-4 w-4" />
										Edit
									</Link>
								</Button>
							)}
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="outline">
										<Download className="mr-2 h-4 w-4" />
										Export
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuItem
										onClick={() => handleGenerateConfig("cli")}
										disabled={components.length === 0}
									>
										<Copy className="mr-2 h-4 w-4" />
										Copy CLI Command
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={() => handleGenerateConfig("registry")}
										disabled={components.length === 0}
									>
										<Download className="mr-2 h-4 w-4" />
										Download Registry
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={() => handleGenerateConfig("package-json")}
										disabled={components.length === 0}
									>
										<Download className="mr-2 h-4 w-4" />
										Download Dependencies
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</PageTitle>
				</div>

				<Tabs defaultValue="components" className="w-full">
					<TabsList>
						<TabsTrigger value="components">
							<Component className="mr-2 h-4 w-4" />
							Components ({components.length})
						</TabsTrigger>
						<TabsTrigger value="collaborators">
							<Users className="mr-2 h-4 w-4" />
							Collaborators ({project.collaborators?.length || 0})
						</TabsTrigger>
						{isOwner && (
							<TabsTrigger value="settings">
								<Settings className="mr-2 h-4 w-4" />
								Settings
							</TabsTrigger>
						)}
					</TabsList>

					<TabsContent value="components" className="mt-6">
						<div className="mb-6 flex items-center justify-between">
							<h3 className="font-semibold text-lg">Components</h3>
							{canEdit && (
								<Button asChild>
									<Link href="/components">
										<Plus className="mr-2 h-4 w-4" />
										Add Components
									</Link>
								</Button>
							)}
						</div>

						{componentsLoading ? (
							<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
								{Array.from({ length: 6 }).map((_, i) => (
									<Skeleton key={i} className="h-48" />
								))}
							</div>
						) : components.length === 0 ? (
							<div className="py-12 text-center">
								<Component className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
								<h3 className="mb-2 font-semibold text-lg">
									No components yet
								</h3>
								<p className="mb-4 text-muted-foreground">
									Add components to this project to get started.
								</p>
								{canEdit && (
									<Button asChild>
										<Link href="/components">
											<Plus className="mr-2 h-4 w-4" />
											Browse Components
										</Link>
									</Button>
								)}
							</div>
						) : (
							<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
								{components.map((component) => (
									<ProjectComponentCard
										key={component.id}
										{...component}
										categories={component.categories.filter(
											(cat): cat is NonNullable<typeof cat> => cat !== null,
										)}
										githubUrl={component.githubUrl}
										websiteUrl={component.websiteUrl}
										creator={component.creator}
										onRemove={() =>
											removeComponent.mutate({
												projectId: project.id,
												componentId: component.id,
											})
										}
										canEdit={canEdit}
									/>
								))}
							</div>
						)}
					</TabsContent>

					<TabsContent value="collaborators" className="mt-6">
						<div className="mb-6 flex items-center justify-between">
							<h3 className="font-semibold text-lg">Collaborators</h3>
							{isOwner && (
								<Button>
									<Plus className="mr-2 h-4 w-4" />
									Add Collaborator
								</Button>
							)}
						</div>

						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							{project.collaborators?.map((collaborator) => (
								<CollaboratorCard
									key={collaborator.userId}
									{...collaborator}
									user={{
										...collaborator.user,
										username: collaborator.user.username || undefined,
										image: collaborator.user.image || undefined,
									}}
									onRemove={() => {
										// TODO: Implement remove collaborator
									}}
									onRoleChange={(newRole) => {
										// TODO: Implement role change
									}}
									canManage={isOwner}
									isOwner={collaborator.role === "owner"}
								/>
							))}
						</div>
					</TabsContent>

					{isOwner && (
						<TabsContent value="settings" className="mt-6">
							<div className="max-w-2xl">
								<Card>
									<CardHeader>
										<CardTitle>Project Settings</CardTitle>
										<CardDescription>
											Manage your project settings and danger zone.
										</CardDescription>
									</CardHeader>
									<CardContent className="space-y-6">
										<div>
											<h4 className="mb-2 font-medium">Danger Zone</h4>
											<p className="mb-4 text-muted-foreground text-sm">
												These actions cannot be undone.
											</p>
											<Button variant="destructive">
												<Trash2 className="mr-2 h-4 w-4" />
												Delete Project
											</Button>
										</div>
									</CardContent>
								</Card>
							</div>
						</TabsContent>
					)}
				</Tabs>
			</div>
		</Container>
	);
}
