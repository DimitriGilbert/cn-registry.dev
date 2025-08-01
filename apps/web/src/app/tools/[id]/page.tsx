"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink, Github } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CommentForm } from "@/components/features/comment-form";
import { CommentList } from "@/components/features/comment-list";
import { CopyInstallCommand } from "@/components/features/copy-install-command";
import { ReadmeViewer } from "@/components/features/readme-viewer";
import { RepoStats } from "@/components/features/repo-stats";
import { Showcase } from "@/components/features/showcase";
import { StarButton } from "@/components/features/star-button";
import { Container } from "@/components/layout/container";
import { PageTitle } from "@/components/layout/page-title";
import { Badge } from "@/components/ui/badge";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generateToolInstallCommand } from "@/utils/install-command";
import { trpc, trpcClient } from "@/utils/trpc";

export default function ToolDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(
		null,
	);
	const queryClient = useQueryClient();

	// Resolve params
	useEffect(() => {
		params.then(setResolvedParams);
	}, [params]);

	const id = resolvedParams?.id;

	// Fetch tool data
	const {
		data: tool,
		isLoading,
		error,
	} = useQuery({
		...trpc.tools.getById.queryOptions({ id: id! }),
		enabled: !!id,
	});

	// Fetch comments
	const { data: comments = [] } = useQuery({
		...trpc.tools.getComments.queryOptions({ id: id! }),
		enabled: !!id,
	});

	// Star mutation
	const starMutation = useMutation(
		trpc.tools.toggleStar.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: ["tools", "getById", { id }],
				});
				toast.success("Star toggled successfully");
			},
			onError: () => {
				toast.error("Failed to toggle star");
			},
		}),
	);

	// Add comment mutation
	const addCommentMutation = useMutation(
		trpc.tools.addComment.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: ["tools", "getComments", { id }],
				});
				toast.success("Comment added successfully");
			},
			onError: () => {
				toast.error("Failed to add comment");
			},
		}),
	);

	const handleAddComment = (content: string, parentId?: string) => {
		addCommentMutation.mutate({
			itemId: id!,
			content,
			parentId,
		});
	};

	const handleToggleStar = () => {
		starMutation.mutate({ itemId: id! });
	};

	if (!id || isLoading) {
		return (
			<Container>
				<div className="py-8">
					<div className="mb-6">
						<Skeleton className="mb-2 h-4 w-64" />
					</div>
					<div className="mb-6">
						<Skeleton className="mb-2 h-8 w-96" />
						<Skeleton className="h-4 w-full max-w-2xl" />
					</div>
					<div className="space-y-4">
						<Skeleton className="h-32 w-full" />
						<Skeleton className="h-64 w-full" />
					</div>
				</div>
			</Container>
		);
	}

	if (error || !tool) {
		return (
			<Container>
				<div className="py-8">
					<div className="text-center">
						<h1 className="mb-2 font-bold text-2xl">Tool Not Found</h1>
						<p className="mb-4 text-muted-foreground">
							The tool you're looking for doesn't exist.
						</p>
						<Button asChild>
							<Link href="/tools">
								<span className="flex items-center">
									<ArrowLeft className="mr-2 h-4 w-4" />
									Back to Tools
								</span>
							</Link>
						</Button>
					</div>
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
								<BreadcrumbLink href="/tools">Tools</BreadcrumbLink>
							</BreadcrumbItem>
							<BreadcrumbSeparator />
							<BreadcrumbItem>
								<BreadcrumbPage>{tool.name}</BreadcrumbPage>
							</BreadcrumbItem>
						</BreadcrumbList>
					</Breadcrumb>
				</div>

				<div className="mb-8">
					<PageTitle title={tool.name} subtitle={tool.description}>
						<div className="flex items-center gap-4">
							<div className="flex gap-2">
								{tool.categories
									?.filter(
										(category): category is NonNullable<typeof category> =>
											Boolean(category),
									)
									.map((category) => (
										<Badge key={category.id} variant="secondary">
											{category.name}
										</Badge>
									))}
							</div>
							<div className="flex items-center gap-2">
								<StarButton
									isStarred={tool.isStarred || false}
									count={tool.starsCount || 0}
									onToggle={handleToggleStar}
									isLoading={starMutation.isPending}
								/>
								{tool.githubUrl && (
									<Button variant="outline" size="sm" asChild>
										<a
											href={tool.githubUrl}
											target="_blank"
											rel="noopener noreferrer"
										>
											<Github className="mr-2 h-4 w-4" />
											GitHub
										</a>
									</Button>
								)}
								{tool.websiteUrl && (
									<Button variant="outline" size="sm" asChild>
										<a
											href={tool.websiteUrl}
											target="_blank"
											rel="noopener noreferrer"
										>
											<ExternalLink className="mr-2 h-4 w-4" />
											Website
										</a>
									</Button>
								)}
							</div>
						</div>
					</PageTitle>
				</div>

				<div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
					<div className="lg:col-span-2">
						<Tabs defaultValue="readme" className="w-full">
							<TabsList className="grid w-full grid-cols-3">
								<TabsTrigger value="readme">Documentation</TabsTrigger>
								<TabsTrigger value="showcase">Examples</TabsTrigger>
								<TabsTrigger value="comments">Comments</TabsTrigger>
							</TabsList>

							<TabsContent value="readme" className="space-y-4">
								<ReadmeViewer
									content={tool.readme || "No documentation available."}
								/>
							</TabsContent>

							<TabsContent value="showcase" className="space-y-4">
								<Showcase
									code={tool.exampleCode || "// No example code available"}
									preview={tool.previewUrl}
								/>
							</TabsContent>

							<TabsContent value="comments" className="space-y-4">
								<CommentForm
									onSubmit={(content) => handleAddComment(content)}
									isLoading={addCommentMutation.isPending}
								/>
								<CommentList
									comments={comments}
									onReply={(parentId: string, content: string) =>
										handleAddComment(content, parentId)
									}
								/>
							</TabsContent>
						</Tabs>
					</div>

					<div className="space-y-6">
						<CopyInstallCommand command={generateToolInstallCommand(tool)} />

						{tool.githubUrl && (
							<RepoStats
								stars={tool.starsCount || 0}
								forks={tool.forksCount || 0}
								issues={tool.issuesCount || 0}
								githubStars={tool.watchersCount || 0}
							/>
						)}

						<div className="space-y-4">
							<h3 className="font-semibold">Created by</h3>
							<div className="flex items-center gap-3">
								<img
									src={tool.creator?.image || "/placeholder-user.jpg"}
									alt={tool.creator?.name || "Unknown"}
									className="h-10 w-10 rounded-full"
								/>
								<div>
									<p className="font-medium">
										{tool.creator?.name || "Unknown"}
									</p>
									<p className="text-muted-foreground text-sm">
										{tool.creator?.username ? `@${tool.creator.username}` : ""}
									</p>
								</div>
							</div>
						</div>

						{tool.averageRating && (
							<div className="space-y-4">
								<h3 className="font-semibold">Rating</h3>
								<div className="flex items-center gap-2">
									<div className="flex">
										{Array.from({ length: 5 }).map((_, i) => (
											<svg
												key={i}
												className={`h-4 w-4 ${i < Math.floor(tool.averageRating || 0) ? "text-yellow-400" : "text-gray-300"}`}
												fill="currentColor"
												viewBox="0 0 20 20"
											>
												<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
											</svg>
										))}
									</div>
									<span className="text-muted-foreground text-sm">
										{tool.averageRating.toFixed(1)} out of 5
									</span>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</Container>
	);
}
