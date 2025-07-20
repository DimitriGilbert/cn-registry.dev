"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { Textarea } from "@/components/ui/textarea";
import { useFormedible } from "@/hooks/use-formedible";
import { trpc } from "@/utils/trpc";

const projectSchema = z.object({
	name: z.string().min(1, "Project name is required"),
	description: z.string().optional(),
	visibility: z.enum(["private", "public"]),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

export default function NewProjectPage() {
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
		}),
	);

	const { Form: ProjectForm } = useFormedible<ProjectFormValues>({
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
				name: "",
				description: "",
				visibility: "private",
			},
			onSubmit: async ({ value }) => {
				const slug = value.name
					.trim()
					.toLowerCase()
					.replace(/[^a-z0-9]+/g, "-")
					.replace(/^-+|-+$/g, "");
				createProject.mutate({
					name: value.name.trim(),
					description: value.description?.trim() || undefined,
					slug,
					visibility: value.visibility,
				});
			},
		},
		submitLabel: createProject.isPending ? "Creating..." : "Create Project",
		disabled: createProject.isPending,
	});

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
						title="Create New Project"
						subtitle="Organize your components into a reusable project collection"
					/>
				</div>

				<div className="max-w-2xl">
					<Card>
						<CardHeader>
							<CardTitle>Project Details</CardTitle>
							<CardDescription>
								Set up your new project with a name, description, and visibility
								settings.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-6">
								<ProjectForm />
								<div className="flex justify-end space-x-2">
									<Button
										variant="outline"
										asChild
										disabled={createProject.isPending}
									>
										<Link href="/projects">Cancel</Link>
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
