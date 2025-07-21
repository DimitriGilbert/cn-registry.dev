"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { AdminBreadcrumb } from "@/components/admin/admin-breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useFormedible } from "@/hooks/use-formedible";
import { trpc } from "@/utils/trpc";

const categorySchema = z.object({
	name: z.string().min(1, "Name is required").max(50, "Name too long"),
});

type CategoryFormData = z.infer<typeof categorySchema>;

export default function AdminCategoriesPage() {
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [editingCategory, setEditingCategory] = useState<{
		id: string;
		name: string;
	} | null>(null);

	const queryClient = useQueryClient();

	const { data: categories = [], isLoading } = useQuery(
		trpc.categories.getAll.queryOptions(),
	);

	const createMutation = useMutation(
		trpc.categories.create.mutationOptions({
			onSuccess: () => {
				toast.success("Category created successfully!");
				queryClient.invalidateQueries({
					queryKey: trpc.categories.getAll.queryKey(),
				});
				setCreateDialogOpen(false);
			},
			onError: (error) => {
				toast.error(error.message || "Failed to create category");
			},
		}),
	);

	const updateMutation = useMutation(
		trpc.categories.update.mutationOptions({
			onSuccess: () => {
				toast.success("Category updated successfully!");
				queryClient.invalidateQueries({
					queryKey: trpc.categories.getAll.queryKey(),
				});
				setEditDialogOpen(false);
				setEditingCategory(null);
			},
			onError: (error) => {
				toast.error(error.message || "Failed to update category");
			},
		}),
	);

	const deleteMutation = useMutation(
		trpc.categories.delete.mutationOptions({
			onSuccess: () => {
				toast.success("Category deleted successfully!");
				queryClient.invalidateQueries({
					queryKey: trpc.categories.getAll.queryKey(),
				});
			},
			onError: (error) => {
				toast.error(error.message || "Failed to delete category");
			},
		}),
	);

	const { Form: CreateForm } = useFormedible<CategoryFormData>({
		schema: categorySchema,
		fields: [
			{
				name: "name",
				type: "text",
				label: "Category Name",
				placeholder: "Enter category name",
			},
		],
		formOptions: {
			defaultValues: {
				name: "",
			},
			onSubmit: async ({ value }) => {
				createMutation.mutate(value);
			},
		},
		loading: createMutation.isPending,
		submitLabel: "Create Category",
	});

	const { Form: EditForm } = useFormedible<CategoryFormData>({
		schema: categorySchema,
		fields: [
			{
				name: "name",
				type: "text",
				label: "Category Name",
				placeholder: "Enter category name",
			},
		],
		formOptions: {
			defaultValues: {
				name: editingCategory?.name || "",
			},
			onSubmit: async ({ value }) => {
				if (!editingCategory) return;
				updateMutation.mutate({
					id: editingCategory.id,
					...value,
				});
			},
		},
		loading: updateMutation.isPending,
		submitLabel: "Update Category",
	});

	const handleEdit = (category: { id: string; name: string }) => {
		setEditingCategory(category);
		setEditDialogOpen(true);
	};

	const handleDelete = async (categoryId: string) => {
		if (confirm("Are you sure you want to delete this category?")) {
			deleteMutation.mutate({ id: categoryId });
		}
	};

	return (
		<div className="container mx-auto space-y-6 p-6">
			<AdminBreadcrumb
				items={[{ label: "Admin", href: "/admin" }, { label: "Categories" }]}
			/>

			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-bold text-3xl">Category Management</h1>
					<p className="text-muted-foreground">
						Organize components and tools with categories
					</p>
				</div>
				<Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
					<DialogTrigger asChild>
						<Button>
							<Plus className="mr-2 h-4 w-4" />
							Add Category
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Create New Category</DialogTitle>
							<DialogDescription>
								Add a new category to organize components and tools.
							</DialogDescription>
						</DialogHeader>
						<CreateForm />
					</DialogContent>
				</Dialog>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Categories ({categories.length})</CardTitle>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="flex items-center justify-center py-8">
							<div className="h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Name</TableHead>
									<TableHead>Components</TableHead>
									<TableHead>Tools</TableHead>
									<TableHead>Total Items</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{categories.map((category) => (
									<TableRow key={category.id}>
										<TableCell className="font-medium">
											{category.name}
										</TableCell>
										<TableCell>
											<Badge variant="secondary">
												{category.componentCount}
											</Badge>
										</TableCell>
										<TableCell>
											<Badge variant="secondary">{category.toolCount}</Badge>
										</TableCell>
										<TableCell>
											<Badge variant="outline">
												{category.componentCount + category.toolCount}
											</Badge>
										</TableCell>
										<TableCell className="text-right">
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button variant="ghost" size="sm">
														<MoreHorizontal className="h-4 w-4" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													<DropdownMenuItem
														onClick={() => handleEdit(category)}
													>
														<Edit className="mr-2 h-4 w-4" />
														Edit
													</DropdownMenuItem>
													<DropdownMenuItem
														onClick={() => handleDelete(category.id)}
														className="text-destructive"
														disabled={
															category.componentCount + category.toolCount > 0
														}
													>
														<Trash2 className="mr-2 h-4 w-4" />
														Delete
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</TableCell>
									</TableRow>
								))}
								{categories.length === 0 && (
									<TableRow>
										<TableCell colSpan={5} className="py-8 text-center">
											No categories found. Create one to get started.
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>

			<Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Edit Category</DialogTitle>
						<DialogDescription>
							Update the category information.
						</DialogDescription>
					</DialogHeader>
					{editingCategory && <EditForm key={editingCategory.id} />}
				</DialogContent>
			</Dialog>
		</div>
	);
}
