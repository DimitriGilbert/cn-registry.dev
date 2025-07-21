"use client";

import { ItemForm, type ItemFormData } from "@/components/forms/item-form";
import { Container } from "@/components/layout/container";
import { PageTitle } from "@/components/layout/page-title";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/utils/trpc";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function SuggestComponentPage() {
	const router = useRouter();
	const queryClient = useQueryClient();

	const { data: categories = [] } = useQuery(
		trpc.categories.getAll.queryOptions()
	);

	const createMutation = useMutation(
		trpc.components.create.mutationOptions({
			onSuccess: () => {
				toast.success("Component suggestion submitted successfully! We'll review it soon.");
				router.push("/");
			},
			onError: (error) => {
				toast.error(error.message || "Failed to submit suggestion");
			},
		})
	);

	const handleSubmit = (data: ItemFormData) => {
		// Force status to 'suggested' for public suggestions
		createMutation.mutate({
			...data,
			status: "suggested",
		});
	};

	return (
		<Container>
			<div className="py-8">
				<div className="mb-6">
					<Button variant="ghost" asChild className="mb-4">
						<Link href="/">
							<ArrowLeft className="mr-2 h-4 w-4" />
							Back to Home
						</Link>
					</Button>

					<PageTitle
						title="Suggest a Component"
						subtitle="Help grow our registry by suggesting new components for the community"
					/>
				</div>

				<div className="max-w-2xl">
					<Card>
						<CardHeader>
							<CardTitle>Component Suggestion</CardTitle>
							<CardDescription>
								Share details about a component you'd like to see in our registry.
								Our team will review your suggestion and may add it to the collection.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<ItemForm
								categories={categories}
								onSubmit={handleSubmit}
								loading={createMutation.isPending}
								submitLabel="Submit Suggestion"
								showStatusField={false}
								defaultValues={{
									status: "suggested",
								}}
								itemType="component"
							/>
						</CardContent>
					</Card>
				</div>
			</div>
		</Container>
	);
}