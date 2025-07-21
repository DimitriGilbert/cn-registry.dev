"use client";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
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

const componentSchema = z.object({
	name: z.string().min(1, "Name is required"),
	description: z.string().min(1, "Description is required"),
	category: z.string().min(1, "Category is required"),
	githubUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
	websiteUrl: z
		.string()
		.url("Must be a valid URL")
		.optional()
		.or(z.literal("")),
	installCommand: z.string().min(1, "Install command is required"),
	tags: z.array(z.string()),
	status: z.enum(["draft", "published", "archived"]),
});

type ComponentFormValues = z.infer<typeof componentSchema>;

// Mock data
const componentData = {
	id: "1",
	name: "Advanced Data Table",
	description:
		"A powerful data table with sorting, filtering, and pagination built with shadcn/ui components",
	category: "Tables",
	githubUrl: "https://github.com/example/data-table",
	websiteUrl: "https://example.com/data-table",
	installCommand: "npx shadcn@latest add data-table",
	tags: ["table", "sorting", "filtering", "pagination"],
	status: "published" as const,
};

const categories = [
	"Tables",
	"Forms",
	"Charts",
	"Input",
	"Navigation",
	"Layout",
	"Feedback",
	"Data Display",
	"Other",
];

const statuses = [
	{ value: "draft", label: "Draft" },
	{ value: "published", label: "Published" },
	{ value: "archived", label: "Archived" },
];

export default async function EditComponentPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id: _id } = await params;
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
				name: "category",
				type: "select",
				label: "Category",
				options: categories,
			},
			{
				name: "installCommand",
				type: "text",
				label: "Install Command",
				placeholder: "npx shadcn@latest add component-name",
			},
			{
				name: "githubUrl",
				type: "url",
				label: "GitHub URL",
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
			defaultValues: componentData,
			onSubmit: async ({ value }) => {
				// Simulate API call
				await new Promise((resolve) => setTimeout(resolve, 1000));
				console.log("Component saved:", value);
				// In real app, would redirect or show success message
			},
		},
		submitLabel: "Save Changes",
	});

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
								<BreadcrumbPage>Edit {componentData.name}</BreadcrumbPage>
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
