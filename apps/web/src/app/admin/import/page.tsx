"use client";

import { useState, useEffect } from "react";
import { FileText, CheckCircle, Upload } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { AdminBreadcrumb } from "@/components/admin/admin-breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFormedible } from "@/hooks/use-formedible";
import { trpc } from "@/utils/trpc";
import { toast } from "sonner";

const importSchema = z.object({
	componentsJson: z.string().min(1, "Please paste the JSON content"),
});

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
		})
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
				categoryNames: ["Buttons", "Forms"]
			},
			{
				name: "example-card",
				description: "A flexible card component",
				tags: ["ui", "layout"],
				status: "suggested",
				categoryNames: ["Layout"]
			}
		];

		const blob = new Blob([JSON.stringify(exampleData, null, 2)], {
			type: "application/json"
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
				name: "componentsJson",
				type: "textarea",
				label: "Components JSON",
				placeholder: "Paste your JSON array of components here...",
				textareaConfig: {
					rows: 12,
				},
			},
		],
		formOptions: {
			defaultValues: {
				componentsJson: "",
			},
			onSubmit: async ({ value }) => {
				try {
					const content = JSON.parse(value.componentsJson);
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
		<div className="py-8">
			<AdminBreadcrumb
				items={[
					{ label: "Dashboard", href: "/admin" },
					{ label: "Import Components", href: "/admin/import" },
				]}
			/>

			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold tracking-tight">Import Components</h1>
						<p className="text-muted-foreground">
							Bulk import components from JSON files
						</p>
					</div>
					<Button
						variant="outline"
						onClick={downloadExample}
					>
						<FileText className="h-4 w-4 mr-2" />
						Download Example
					</Button>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>Import Components</CardTitle>
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
						<p>The JSON file should contain an array of component objects with the following structure:</p>
						<pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
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
							<CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
							<div>
								<p className="font-medium">Tips:</p>
								<ul className="list-disc list-inside space-y-1 text-muted-foreground">
									<li>Only the <code>name</code> field is required</li>
									<li>Categories will be created automatically if they don't exist</li>
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