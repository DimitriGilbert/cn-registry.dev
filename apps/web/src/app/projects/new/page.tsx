"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Container } from "@/components/layout/container";
import { PageTitle } from "@/components/layout/page-title";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/utils/trpc";

export default function NewProjectPage() {
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [visibility, setVisibility] = useState<"private" | "public">("private");
	const router = useRouter();
	const queryClient = useQueryClient();

	const createProject = useMutation(
		trpc.projects.create.mutationOptions({
			onSuccess: (project) => {
				toast.success("Project created successfully!");
				queryClient.invalidateQueries({ queryKey: ["projects", "getAll"] });
				router.push(`/projects/${project.slug}`);
			},
			onError: (error) => {
				toast.error(`Failed to create project: ${error.message}`);
			},
		})
	);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		
		if (!name.trim()) {
			toast.error("Project name is required");
			return;
		}

		const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
		createProject.mutate({
			name: name.trim(),
			description: description.trim() || undefined,
			visibility,
			slug,
		});
	};

	return (
		<Container>
			<div className="py-8">
				<div className="mb-6">
					<Button variant="ghost" asChild className="mb-4">
						<Link href="/projects">
							<ArrowLeft className="h-4 w-4 mr-2" />
							Back to Projects
						</Link>
					</Button>

					<PageTitle
						title="Create New Project"
						subtitle="Organize your components into a reusable project collection"
					/>
				</div>

				<div className="max-w-2xl">
					<Card>
						<CardHeader>
							<CardTitle>Project Details</CardTitle>
							<CardDescription>
								Set up your new project with a name, description, and visibility settings.
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
										disabled={createProject.isPending}
									/>
									<p className="text-muted-foreground text-sm">
										This will be used to generate your project URL
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
										disabled={createProject.isPending}
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
										disabled={createProject.isPending}
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
										disabled={createProject.isPending}
									>
										<Link href="/projects">Cancel</Link>
									</Button>
									<Button 
										type="submit"
										disabled={createProject.isPending || !name.trim()}
									>
										{createProject.isPending ? "Creating..." : "Create Project"}
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