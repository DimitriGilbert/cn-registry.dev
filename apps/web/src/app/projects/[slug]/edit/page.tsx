"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Container } from "@/components/layout/container";
import { PageTitle } from "@/components/layout/page-title";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { trpc, trpcClient } from "@/utils/trpc";

export default function EditProjectPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const [resolvedParams, setResolvedParams] = useState<{ slug: string } | null>(null);
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [visibility, setVisibility] = useState<"private" | "public">("private");
	const router = useRouter();
	const queryClient = useQueryClient();

	// Resolve params
	useState(() => {
		params.then(setResolvedParams);
	});

	const slug = resolvedParams?.slug;

	// Fetch project data
	const {
		data: project,
		isLoading,
		error,
	} = useQuery({
		...trpc.projects.getBySlugWithRole.queryOptions({ slug: slug! }),
		enabled: !!slug,
	});

	// Set form values when project loads
	useEffect(() => {
		if (project) {
			setName(project.name);
			setDescription(project.description || "");
			setVisibility(project.visibility as "private" | "public");
		}
	}, [project]);

	const updateProject = useMutation(
		trpc.projects.update.mutationOptions({
			onSuccess: (updatedProject) => {
				toast.success("Project updated successfully!");
				queryClient.invalidateQueries({ queryKey: ["projects"] });
				
				// If the name changed, the slug might have changed too
				if (updatedProject.slug !== slug) {
					router.push(`/projects/${updatedProject.slug}`);
				} else {
					router.push(`/projects/${slug}`);
				}
			},
			onError: (error) => {
				toast.error(`Failed to update project: ${error.message}`);
			},
		})
	);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		
		if (!name.trim()) {
			toast.error("Project name is required");
			return;
		}

		updateProject.mutate({
			id: project!.id,
			name: name.trim(),
			description: description.trim() || undefined,
			visibility,
		});
	};

	if (!slug || isLoading) {
		return (
			<Container>
				<div className="py-8">
					<Skeleton className="h-8 w-64 mb-4" />
					<Skeleton className="h-4 w-96 mb-8" />
					<div className="max-w-2xl">
						<Card>
							<CardHeader>
								<Skeleton className="h-6 w-32 mb-2" />
								<Skeleton className="h-4 w-64" />
							</CardHeader>
							<CardContent className="space-y-6">
								<Skeleton className="h-20 w-full" />
								<Skeleton className="h-32 w-full" />
								<Skeleton className="h-24 w-full" />
							</CardContent>
						</Card>
					</div>
				</div>
			</Container>
		);
	}

	if (error || !project) {
		return (
			<Container>
				<div className="py-8">
					<div className="text-center">
						<h1 className="mb-2 font-bold text-2xl">Project Not Found</h1>
						<p className="mb-4 text-muted-foreground">
							The project you're trying to edit doesn't exist or you don't have access to it.
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

	if (!canEdit) {
		return (
			<Container>
				<div className="py-8">
					<div className="text-center">
						<h1 className="mb-2 font-bold text-2xl">Access Denied</h1>
						<p className="mb-4 text-muted-foreground">
							You don't have permission to edit this project.
						</p>
						<Button asChild>
							<Link href={`/projects/${slug}`}>
								<ArrowLeft className="mr-2 h-4 w-4" />
								Back to Project
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
					<Button variant="ghost" asChild className="mb-4">
						<Link href={`/projects/${slug}`}>
							<ArrowLeft className="h-4 w-4 mr-2" />
							Back to Project
						</Link>
					</Button>

					<PageTitle
						title={`Edit ${project.name}`}
						subtitle="Update your project settings and information"
					/>
				</div>

				<div className="max-w-2xl">
					<Card>
						<CardHeader>
							<CardTitle>Project Details</CardTitle>
							<CardDescription>
								Update your project name, description, and visibility settings.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<form onSubmit={handleSubmit} className="space-y-6">
								<div className="space-y-2">
									<Label htmlFor="name">Project Name *</Label>
									<Input
										id="name"
										value={name}
										onChange={(e) => setName(e.target.value)}
										placeholder="My Component Library"
										required
										disabled={updateProject.isPending}
									/>
									<p className="text-muted-foreground text-sm">
										Changing the name may update your project URL
									</p>
								</div>

								<div className="space-y-2">
									<Label htmlFor="description">Description</Label>
									<Textarea
										id="description"
										value={description}
										onChange={(e) => setDescription(e.target.value)}
										placeholder="A collection of components for my project..."
										rows={3}
										disabled={updateProject.isPending}
									/>
									<p className="text-muted-foreground text-sm">
										Optional description of what this project contains
									</p>
								</div>

								<div className="space-y-3">
									<Label>Visibility</Label>
									<RadioGroup 
										value={visibility} 
										onValueChange={(value: "private" | "public") => setVisibility(value)}
										disabled={updateProject.isPending}
									>
										<div className="flex items-center space-x-2">
											<RadioGroupItem value="private" id="private" />
											<Label htmlFor="private" className="flex-1 cursor-pointer">
												<div>
													<div className="font-medium">Private</div>
													<div className="text-muted-foreground text-sm">
														Only you and collaborators can see this project
													</div>
												</div>
											</Label>
										</div>
										<div className="flex items-center space-x-2">
											<RadioGroupItem value="public" id="public" />
											<Label htmlFor="public" className="flex-1 cursor-pointer">
												<div>
													<div className="font-medium">Public</div>
													<div className="text-muted-foreground text-sm">
														Anyone can see this project and its components
													</div>
												</div>
											</Label>
										</div>
									</RadioGroup>
								</div>

								<div className="flex justify-end space-x-2">
									<Button 
										variant="outline" 
										asChild
										disabled={updateProject.isPending}
									>
										<Link href={`/projects/${slug}`}>Cancel</Link>
									</Button>
									<Button 
										type="submit"
										disabled={updateProject.isPending || !name.trim()}
									>
										{updateProject.isPending ? "Saving..." : "Save Changes"}
									</Button>
								</div>
							</form>
						</CardContent>
					</Card>
				</div>
			</div>
		</Container>
	);
}