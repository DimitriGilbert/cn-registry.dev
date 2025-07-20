"use client";

import { useFormedible } from "@/hooks/use-formedible";
import { z } from "zod";

export const componentFormSchema = z.object({
	name: z.string().min(1, "Name is required").max(100, "Name too long"),
	description: z
		.string()
		.min(1, "Description is required")
		.max(500, "Description too long"),
	repoUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
	websiteUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
	installUrl: z.string().optional(),
	installCommand: z.string().optional(),
	tags: z.array(z.string()).default([]),
	status: z.enum(["published", "draft", "archived", "suggested"]).default("draft"),
	categoryIds: z.array(z.string().uuid()).default([]),
});

export type ComponentFormData = z.infer<typeof componentFormSchema>;

interface ComponentFormProps {
	categories: Array<{ id: string; name: string }>;
	onSubmit: (data: ComponentFormData) => void;
	loading?: boolean;
	submitLabel?: string;
	defaultValues?: Partial<ComponentFormData>;
	showStatusField?: boolean;
}

export function ComponentForm({
	categories,
	onSubmit,
	loading = false,
	submitLabel = "Submit",
	defaultValues = {},
	showStatusField = true,
}: ComponentFormProps) {
	const statusOptions = [
		{ value: "draft", label: "Draft" },
		{ value: "published", label: "Published" },
		{ value: "archived", label: "Archived" },
		{ value: "suggested", label: "Suggested" },
	];

	const { Form } = useFormedible<ComponentFormData>({
		schema: componentFormSchema,
		fields: [
			{
				name: "name",
				type: "text",
				label: "Component Name",
				placeholder: "My Awesome Component",
			},
			{
				name: "description",
				type: "textarea",
				label: "Description",
				placeholder: "A brief description of what this component does...",
				textareaConfig: {
					rows: 4,
					maxLength: 500,
					showWordCount: true,
				},
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
			{
				name: "installUrl",
				type: "text",
				label: "Install URL",
				placeholder: "Custom installation URL",
			},
			{
				name: "installCommand",
				type: "text",
				label: "Install Command",
				placeholder: "npm install @your/component",
			},
			...(showStatusField
				? [
						{
							name: "status" as const,
							type: "select" as const,
							label: "Status",
							options: statusOptions,
						},
					]
				: []),
			{
				name: "categoryIds",
				type: "multiSelect",
				label: "Categories",
				options: categories.map((category) => ({
					value: category.id,
					label: category.name,
				})),
				multiSelectConfig: {
					searchable: true,
				},
			},
			{
				name: "tags",
				type: "array",
				label: "Tags",
				arrayConfig: {
					itemType: "text",
					itemPlaceholder: "Add tag...",
				},
			},
		],
		formOptions: {
			defaultValues: {
				name: "",
				description: "",
				repoUrl: "",
				websiteUrl: "",
				installUrl: "",
				installCommand: "",
				tags: [],
				status: "draft" as const,
				categoryIds: [],
				...defaultValues,
			},
			onSubmit: async ({ value }) => {
				// Clean up empty strings for optional URL fields
				const cleanedData = {
					...value,
					repoUrl: value.repoUrl || undefined,
					websiteUrl: value.websiteUrl || undefined,
					installUrl: value.installUrl || undefined,
					installCommand: value.installCommand || undefined,
				};
				onSubmit(cleanedData);
			},
		},
		loading,
		submitLabel,
	});

	return <Form />;
}