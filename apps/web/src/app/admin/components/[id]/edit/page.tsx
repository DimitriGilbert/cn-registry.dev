"use client";
import { use } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { useFormedible } from "@/hooks/use-formedible";
import { trpc } from "@/utils/trpc";

const componentSchema = z.object({
	name: z.string().min(1, "Name is required"),
	description: z.string().min(1, "Description is required"),
	repoUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
	websiteUrl: z
		.string()
		.url("Must be a valid URL")
		.optional()
		.or(z.literal("")),
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
	const router = useRouter();
	const queryClient = useQueryClient();

	// Fetch component data
	const { data: component, isLoading: isLoadingComponent } = useQuery(
		trpc.components.getById.queryOptions({ id })
	);

	// Fetch categories for dropdown
	const { data: categories = [] } = useQuery(
		trpc.categories.getAll.queryOptions()
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
		})
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
				categoryIds: component.categories?.map((c) => c?.id).filter((id): id is string => Boolean(id)) || [],
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
				updateMutation.mutate({ id, ...value });
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
					title="Edit Component"
					subtitle="Update component information and settings"
				>
					<Button variant="outline" asChild>
						<Link href="/admin/components">
							<span className="flex items-center">
								<ArrowLeft className="mr-2 h-4 w-4" />
								Back to Components
							</span>
						</Link>
					</Button>
				</PageTitle>

				<Form />
			</div>
		</Container>
	);
}
