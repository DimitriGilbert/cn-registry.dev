"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AdminBreadcrumb } from "@/components/admin/admin-breadcrumb";
import { ItemForm, type ItemFormData } from "@/components/forms/item-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/utils/trpc";

export default function NewComponentPage() {
	const router = useRouter();
	const queryClient = useQueryClient();

	const { data: categories = [] } = useQuery(
		trpc.categories.getAll.queryOptions(),
	);

	const createMutation = useMutation(
		trpc.components.create.mutationOptions({
			onSuccess: (component) => {
				toast.success("Component created successfully!");
				queryClient.invalidateQueries({
					queryKey: trpc.components.getAll.queryKey(),
				});
				router.push(`/admin/components/${component.id}/edit`);
			},
			onError: (error) => {
				toast.error(error.message || "Failed to create component");
			},
		}),
	);

	const handleSubmit = (data: ItemFormData) => {
		createMutation.mutate(data);
	};

	return (
		<div className="container mx-auto space-y-6 p-6">
			<AdminBreadcrumb
				items={[
					{ label: "Admin", href: "/admin" },
					{ label: "Components", href: "/admin/components" },
					{ label: "New Component" },
				]}
			/>

			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-bold text-3xl">Create New Component</h1>
					<p className="text-muted-foreground">
						Add a new component to the registry
					</p>
				</div>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Component Details</CardTitle>
				</CardHeader>
				<CardContent>
					<ItemForm
						categories={categories}
						onSubmit={handleSubmit}
						loading={createMutation.isPending}
						submitLabel="Create Component"
						itemType="component"
					/>
				</CardContent>
			</Card>
		</div>
	);
}
