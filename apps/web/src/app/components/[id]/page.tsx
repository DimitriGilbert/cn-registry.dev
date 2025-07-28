"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink, Github, ShoppingCart } from "lucide-react";
import Image from "next/image";
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
import { useCart } from "@/components/providers/cart-provider";
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
import { generateInstallCommand } from "@/utils/install-command";
import { trpc } from "@/utils/trpc";
import { getUserAvatarUrl } from "@/utils/user";

export default function ComponentDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(
		null,
	);
	const queryClient = useQueryClient();
	const { addToCart, removeFromCart, isInCart } = useCart();

	// Resolve params
	useEffect(() => {
		params.then(setResolvedParams);
	}, [params]);

	const id = resolvedParams?.id;

	// Fetch component data
	const {
		data: component,
		isLoading,
		error,
	} = useQuery({
		...trpc.components.getById.queryOptions({ id: id || "" }),
		enabled: !!id,
	});

	// Fetch comments
	const { data: comments = [] } = useQuery({
		...trpc.components.getComments.queryOptions({ id: id || "" }),
		enabled: !!id,
	});

	// Star mutation
	const starMutation = useMutation(
		trpc.components.toggleStar.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: ["components", "getById", { id }],
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
		trpc.components.addComment.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: ["components", "getComments", { id }],
				});
				toast.success("Comment added successfully");
			},
			onError: () => {
				toast.error("Failed to add comment");
			},
		}),
	);

	const handleAddComment = (content: string, parentId?: string) => {
		if (!id) return;
		addCommentMutation.mutate({
			itemId: id,
			content,
			parentId,
		});
	};

	const handleToggleStar = () => {
		if (!id) return;
		starMutation.mutate({ itemId: id });
	};

	const handleCartToggle = () => {
		if (!component) return;

		if (isInCart(component.id)) {
			removeFromCart(component.id);
			toast.success(`Removed ${component.name} from cart`);
		} else {
			addToCart(component);
			toast.success(`Added ${component.name} to cart`);
		}
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

	if (error || !component) {
		return (
			<Container>
				<div className="py-8">
					<div className="text-center">
						<h1 className="mb-2 font-bold text-2xl">Component Not Found</h1>
						<p className="mb-4 text-muted-foreground">
							The component you're looking for doesn't exist.
						</p>
						<Button asChild>
							<Link href="/components">
								<span className="flex items-center">
									<ArrowLeft className="mr-2 h-4 w-4" />
									Back to Components
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
								<BreadcrumbLink href="/components">Components</BreadcrumbLink>
							</BreadcrumbItem>
							<BreadcrumbSeparator />
							<BreadcrumbItem>
								<BreadcrumbPage>{component.name}</BreadcrumbPage>
							</BreadcrumbItem>
						</BreadcrumbList>
					</Breadcrumb>
				</div>

				<div className="mb-8">
					<PageTitle title={component.name} subtitle={component.description}>
						<div className="flex items-center gap-4">
							<div className="flex gap-2">
								{component.categories
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
									isStarred={component.isStarred || false}
									count={component.starsCount || 0}
									onToggle={handleToggleStar}
									isLoading={starMutation.isPending}
								/>
								<Button
									variant={isInCart(component.id) ? "default" : "outline"}
									size="sm"
									onClick={handleCartToggle}
								>
									<ShoppingCart className="mr-2 h-4 w-4" />
									{isInCart(component.id) ? "In Cart" : "Add to Cart"}
								</Button>
								{component.githubUrl && (
									<Button variant="outline" size="sm" asChild>
										<a
											href={component.githubUrl}
											target="_blank"
											rel="noopener noreferrer"
										>
											<Github className="mr-2 h-4 w-4" />
											GitHub
										</a>
									</Button>
								)}
								{component.websiteUrl && (
									<Button variant="outline" size="sm" asChild>
										<a
											href={component.websiteUrl}
											target="_blank"
											rel="noopener noreferrer"
										>
											<ExternalLink className="mr-2 h-4 w-4" />
											Demo
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
									content={component.readme || "No documentation available."}
								/>
							</TabsContent>

							<TabsContent value="showcase" className="space-y-4">
								<Showcase
									code={component.exampleCode || "// No example code available"}
									preview={component.previewUrl}
									enableSandbox={!!component.exampleCode}
								/>
							</TabsContent>

							<TabsContent value="comments" className="space-y-4">
								<CommentForm
									onSubmit={(content) => handleAddComment(content)}
									isLoading={addCommentMutation.isPending}
								/>
								<CommentList
									comments={comments}
									onReply={(parentId, content) =>
										handleAddComment(content, parentId)
									}
								/>
							</TabsContent>
						</Tabs>
					</div>

					<div className="space-y-6">
						<CopyInstallCommand command={generateInstallCommand(component)} />

						{component.githubUrl && (
							<RepoStats
								stars={component.starsCount || 0}
								forks={component.forksCount || 0}
								issues={component.issuesCount || 0}
								watchers={component.starsCount || 0}
							/>
						)}

						{component.creator && (component.creator.id || component.creator.name) && (
							<div className="space-y-4">
								<h3 className="font-semibold">Created by</h3>
								<div className="flex items-center gap-3">
									<Image
										src={getUserAvatarUrl(component.creator)}
										alt={component.creator.name || "Unknown"}
										className="h-10 w-10 rounded-full"
										width={40}
										height={40}
									/>
									<div>
										{component.creator.username ? (
											<Link
												href={`/creators/${component.creator.username}`}
												className="font-medium hover:underline"
											>
												{component.creator.name || "Unknown"}
											</Link>
										) : (
											<p className="font-medium">
												{component.creator.name || "Unknown"}
											</p>
										)}
										{component.creator.username && (
											<p className="text-muted-foreground text-sm">
												@{component.creator.username}
											</p>
										)}
									</div>
								</div>
							</div>
						)}

						{component.averageRating && (
							<div className="space-y-4">
								<h3 className="font-semibold">Rating</h3>
								<div className="flex items-center gap-2">
									<div
										className="flex"
										role="img"
										aria-label={`Rating: ${component.averageRating.toFixed(1)} out of 5 stars`}
									>
										{Array.from({ length: 5 }).map((_, i) => (
											<svg
												key={`star-${i}`}
												className={`h-4 w-4 ${i < Math.floor(component.averageRating || 0) ? "text-yellow-400" : "text-gray-300"}`}
												fill="currentColor"
												viewBox="0 0 20 20"
												aria-hidden="true"
											>
												<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
											</svg>
										))}
									</div>
									<span className="text-muted-foreground text-sm">
										{component.averageRating.toFixed(1)} out of 5
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
