"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, FileText, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { AdminBreadcrumb } from "@/components/admin/admin-breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFormedible } from "@/hooks/use-formedible";
import { trpc } from "@/utils/trpc";

const importSchema = z.object({
	componentsJson: z.string().optional(),
	jsonFile: z.instanceof(File).optional(),
}).refine(
	(data) => data.componentsJson || data.jsonFile,
	{
		message: "Please either paste JSON content or upload a file",
		path: ["componentsJson"],
	}
);

type ImportFormData = z.infer<typeof importSchema>;

interface ComponentData {
	name: string;
	description?: string;
	repoUrl?: string;
	websiteUrl?: string;
	installUrl?: string;
	installCommand?: string;
	tags?: string[];
	status?: "published" | "draft" | "archived" | "suggested";
	categoryNames?: string[];
}

export default function ImportPage() {
	const queryClient = useQueryClient();

	const importMutation = useMutation(
		trpc.admin.importComponents.mutationOptions({
			onSuccess: (result) => {
				toast.success(`Successfully imported ${result.imported} components!`);
				if (result.skipped > 0) {
					toast.info(`Skipped ${result.skipped} existing components`);
				}
				queryClient.invalidateQueries({
					queryKey: trpc.components.getAll.queryKey(),
				});
			},
			onError: (error) => {
				toast.error(`Import failed: ${error.message}`);
			},
		}),
	);

	const downloadExample = () => {
		const exampleData: ComponentData[] = [
			{
				name: "example-button",
				description: "A beautiful button component",
				repoUrl: "https://github.com/user/repo",
				websiteUrl: "https://example.com/demo",
				installCommand: "npx shadcn@latest add button",
				tags: ["ui", "button", "form"],
				status: "suggested",
				categoryNames: ["Buttons", "Forms"],
			},
			{
				name: "example-card",
				description: "A flexible card component",
				tags: ["ui", "layout"],
				status: "suggested",
				categoryNames: ["Layout"],
			},
		];

		const blob = new Blob([JSON.stringify(exampleData, null, 2)], {
			type: "application/json",
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "components-example.json";
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};

	const { Form } = useFormedible<ImportFormData>({
		schema: importSchema,
		fields: [
			{
				name: "jsonFile",
				type: "file",
				label: "Upload JSON File",
				placeholder: "Choose a JSON file to upload",
				fileConfig: {
					accept: ".json,application/json",
					multiple: false,
				},
			},
			{
				name: "componentsJson",
				type: "textarea",
				label: "Or Paste JSON Content",
				placeholder: "Paste your JSON array of components here...",
				textareaConfig: {
					rows: 12,
				},
			},
		],
		formOptions: {
			defaultValues: {
				componentsJson: "",
				jsonFile: undefined,
			},
			onSubmit: async ({ value }) => {
				try {
					let content: any;
					
					if (value.jsonFile) {
						// Handle file upload
						const fileContent = await value.jsonFile.text();
						content = JSON.parse(fileContent);
					} else if (value.componentsJson) {
						// Handle textarea content
						content = JSON.parse(value.componentsJson);
					} else {
						throw new Error("Please provide JSON content either by file upload or textarea");
					}
					
					if (!Array.isArray(content)) {
						throw new Error("JSON must contain an array of components");
					}
					importMutation.mutate({ components: content });
				} catch (error) {
					toast.error("Invalid JSON format or structure");
				}
			},
		},
		loading: importMutation.isPending,
		submitLabel: "Import Components",
	});

	return (
		<div className="p-8">
			<AdminBreadcrumb
				items={[
					{ label: "Dashboard", href: "/admin" },
					{ label: "Import Components", href: "/admin/import" },
				]}
			/>

			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="font-bold text-3xl tracking-tight">
							Import Components
						</h1>
						<p className="text-muted-foreground">
							Bulk import components from JSON files
						</p>
					</div>
					<Button variant="outline" onClick={downloadExample}>
						<FileText className="mr-2 h-4 w-4" />
						Download Example
					</Button>
				</div>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Upload className="h-5 w-5" />
							Import Components
						</CardTitle>
						<p className="text-sm text-muted-foreground">
							Upload a JSON file or paste JSON content directly
						</p>
					</CardHeader>
					<CardContent>
						<Form />
					</CardContent>
				</Card>

				{/* Instructions */}
				<Card>
					<CardHeader>
						<CardTitle>JSON Format</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3 text-sm">
						<p>
							The JSON file should contain an array of component objects with
							the following structure:
						</p>
						<pre className="overflow-x-auto rounded-lg bg-muted p-4 text-xs">
							{`[
  {
    "name": "component-name",           // Required
    "description": "Component description",
    "repoUrl": "https://github.com/...",
    "websiteUrl": "https://example.com",
    "installCommand": "npx shadcn@latest add...",
    "tags": ["ui", "button"],
    "status": "suggested",              // suggested, draft, published, archived
    "categoryNames": ["Buttons", "Forms"]
  }
]`}
						</pre>
						<div className="flex items-start space-x-2">
							<CheckCircle className="mt-0.5 h-4 w-4 text-green-600" />
							<div>
								<p className="font-medium">Tips:</p>
								<ul className="list-inside list-disc space-y-1 text-muted-foreground">
									<li>
										Only the <code>name</code> field is required
									</li>
									<li>
										Categories will be created automatically if they don't exist
									</li>
									<li>Use "suggested" status for community contributions</li>
									<li>Download the example file to see the exact format</li>
								</ul>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
