import { Send } from "lucide-react";
import type React from "react";
import { z } from "zod";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFormedible } from "@/hooks/use-formedible";

const commentSchema = z.object({
	content: z.string().min(1, "Comment cannot be empty"),
});

type CommentFormValues = z.infer<typeof commentSchema>;

interface CommentFormProps {
	onSubmit?: (content: string) => void;
	isLoading?: boolean;
	placeholder?: string;
	buttonText?: string;
}

export function CommentForm({
	onSubmit,
	isLoading = false,
	placeholder = "Write a comment...",
	buttonText = "Post Comment",
}: CommentFormProps) {
	const { Form, form } = useFormedible<CommentFormValues>({
		schema: commentSchema,
		formOptions: {
			defaultValues: { content: "" },
			onSubmit: async ({ value, formApi }) => {
				await onSubmit?.(value.content);
				formApi.reset();
			},
		},
	});

	const loading = isLoading;

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-lg">Add a Comment</CardTitle>
			</CardHeader>
			<CardContent>
				<Form className="space-y-4">
					<div className="flex space-x-3">
						<Avatar className="h-8 w-8">
							<AvatarImage src="/placeholder-user.jpg" />
							<AvatarFallback>U</AvatarFallback>
						</Avatar>
						<div className="flex-1">
							<form.Field name="content">
								{(field) => (
									<textarea
										className="flex min-h-[100px] w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
										placeholder={placeholder}
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
										onBlur={field.handleBlur}
										disabled={loading}
									/>
								)}
							</form.Field>
						</div>
					</div>
					<div className="flex justify-end">
						<Button
							type="submit"
							disabled={loading}
							className="flex items-center gap-2"
						>
							<Send className="h-4 w-4" />
							{loading ? "Posting..." : buttonText}
						</Button>
					</div>
				</Form>
			</CardContent>
		</Card>
	);
}
