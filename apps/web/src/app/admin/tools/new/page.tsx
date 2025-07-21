"use client";

import { AdminBreadcrumb } from "@/components/admin/admin-breadcrumb";
import { ItemForm, type ItemFormData } from "@/components/forms/item-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/utils/trpc";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function NewToolPage() {
	const router = useRouter();
	const queryClient = useQueryClient();

	const { data: categories = [] } = useQuery(
		trpc.categories.getAll.queryOptions()
	);

	const createMutation = useMutation(
		trpc.tools.create.mutationOptions({
			onSuccess: (tool) => {
				toast.success("Tool created successfully!");
				queryClient.invalidateQueries({ queryKey: trpc.tools.getAll.queryKey() });
				router.push(`/admin/tools/${tool.id}/edit`);
			},
			onError: (error) => {
				toast.error(error.message || "Failed to create tool");
			},
		})
	);

	const handleSubmit = (data: ItemFormData) => {
		createMutation.mutate(data);
	};

	return (
		<div className="container mx-auto p-6 space-y-6">
			<AdminBreadcrumb
				items={[
					{ label: "Admin", href: "/admin" },
					{ label: "Tools", href: "/admin/tools" },
					{ label: "New Tool" },
				]}
			/>

			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">Create New Tool</h1>
					<p className="text-muted-foreground">
						Add a new tool to the registry
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
						loading={createMutation.isPending}
						submitLabel="Create Tool"
						itemType="tool"
					/>
				</CardContent>
			</Card>
		</div>
	);
}