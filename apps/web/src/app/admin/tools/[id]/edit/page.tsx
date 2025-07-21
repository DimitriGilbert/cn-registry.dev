"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { use } from "react";
import { toast } from "sonner";
import { AdminBreadcrumb } from "@/components/admin/admin-breadcrumb";
import { ItemForm, type ItemFormData } from "@/components/forms/item-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/utils/trpc";

export default function EditToolPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = use(params);
	const _router = useRouter();
	const queryClient = useQueryClient();

	const { data: tool, isLoading } = useQuery(
		trpc.tools.getById.queryOptions({ id }),
	);

	const { data: categories = [] } = useQuery(
		trpc.categories.getAll.queryOptions(),
	);

	const updateMutation = useMutation(
		trpc.tools.update.mutationOptions({
			onSuccess: () => {
				toast.success("Tool updated successfully!");
				queryClient.invalidateQueries({
					queryKey: trpc.tools.getById.queryKey({ id }),
				});
				queryClient.invalidateQueries({
					queryKey: trpc.tools.getAll.queryKey(),
				});
			},
			onError: (error) => {
				toast.error(error.message || "Failed to update tool");
			},
		}),
	);

	const handleSubmit = (data: ItemFormData) => {
		updateMutation.mutate({
			id,
			...data,
		});
	};

	if (isLoading) {
		return (
			<div className="container mx-auto space-y-6 p-6">
				<Skeleton className="h-8 w-96" />
				<Card>
					<CardHeader>
						<Skeleton className="h-6 w-32" />
					</CardHeader>
					<CardContent className="space-y-4">
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-20 w-full" />
						<Skeleton className="h-10 w-full" />
					</CardContent>
				</Card>
			</div>
		);
	}

	if (!tool) {
		return (
			<div className="container mx-auto p-6">
				<div className="text-center">
					<h1 className="mb-2 font-bold text-2xl">Tool Not Found</h1>
					<p className="mb-4 text-muted-foreground">
						The tool you're looking for doesn't exist.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto space-y-6 p-6">
			<AdminBreadcrumb
				items={[
					{ label: "Admin", href: "/admin" },
					{ label: "Tools", href: "/admin/tools" },
					{ label: tool.name },
				]}
			/>

			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-bold text-3xl">Edit Tool</h1>
					<p className="text-muted-foreground">
						Update tool information and settings
					</p>
				</div>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Tool Details</CardTitle>
				</CardHeader>
				<CardContent>
					<ItemForm
						categories={categories}
						onSubmit={handleSubmit}
						loading={updateMutation.isPending}
						submitLabel="Update Tool"
						itemType="tool"
						defaultValues={{
							name: tool.name,
							description: tool.description,
							repoUrl: tool.repoUrl || "",
							websiteUrl: tool.websiteUrl || "",
							installUrl: tool.installUrl || "",
							installCommand: tool.installCommand || "",
							tags: tool.tags || [],
							status: tool.status as
								| "published"
								| "draft"
								| "archived"
								| "suggested",
							categoryIds:
								tool.categories
									?.map((cat) => cat?.id)
									.filter((id): id is string => Boolean(id)) || [],
						}}
					/>
				</CardContent>
			</Card>
		</div>
	);
}
