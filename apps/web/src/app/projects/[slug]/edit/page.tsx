"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useFormedible } from "@/hooks/use-formedible";
import { trpc, trpcClient } from "@/utils/trpc";

const projectSchema = z.object({
	name: z.string().min(1, "Project name is required"),
	description: z.string().optional(),
	visibility: z.enum(["private", "public"]),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

export default function EditProjectPage({
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

	// Fetch project data
	const {
		data: project,
		isLoading,
		error,
	} = useQuery({
		...trpc.projects.getBySlugWithRole.queryOptions({ slug: slug! }),
		enabled: !!slug,
	});

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
		}),
	);

	const { Form: ProjectForm, form } = useFormedible<ProjectFormValues>({
		schema: projectSchema,
		fields: [
			{
				name: "name",
				type: "text",
				label: "Project Name *",
				placeholder: "My Component Library",
				description: "This will be used to generate your project URL",
			},
			{
				name: "description",
				type: "textarea",
				label: "Description",
				placeholder: "A collection of components for my project...",
				description: "Optional description of what this project contains",
				textareaConfig: { rows: 3 },
			},
			{
				name: "visibility",
				type: "radio",
				label: "Visibility",
				options: [
					{
						value: "private",
						label: "Private - Only you and collaborators can see this project",
					},
					{
						value: "public",
						label: "Public - Anyone can see this project and its components",
					},
				],
			},
		],
		formOptions: {
			defaultValues: {
				name: project?.name || "",
				description: project?.description || "",
				visibility: (project?.visibility as "private" | "public") || "private",
			},
			onSubmit: async ({ value }) => {
				updateProject.mutate({
					id: project!.id,
					name: value.name.trim(),
					description: value.description?.trim() || undefined,
					visibility: value.visibility,
				});
			},
		},
		submitLabel: updateProject.isPending ? "Updating..." : "Update Project",
		disabled: updateProject.isPending,
	});

	// Reset form when project loads
	useEffect(() => {
		if (project) {
			form.reset({
				name: project.name,
				description: project.description || "",
				visibility: project.visibility as "private" | "public",
			});
		}
	}, [project, form]);

	if (!slug || isLoading) {
		return (
			<Container>
				<div className="py-8">
					<Skeleton className="mb-4 h-8 w-64" />
					<Skeleton className="mb-8 h-4 w-96" />
					<div className="max-w-2xl">
						<Card>
							<CardHeader>
								<Skeleton className="mb-2 h-6 w-32" />
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
							The project you're trying to edit doesn't exist or you don't have
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
							<ArrowLeft className="mr-2 h-4 w-4" />
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
							<div className="space-y-6">
								<ProjectForm />
								<div className="flex justify-end space-x-2">
									<Button
										variant="outline"
										asChild
										disabled={updateProject.isPending}
									>
										<Link href={`/projects/${slug}`}>Cancel</Link>
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</Container>
	);
}
