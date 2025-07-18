import { Send } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

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
	const [content, setContent] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const loading = isLoading || isSubmitting;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!content.trim() || loading) return;

		setIsSubmitting(true);
		try {
			await onSubmit?.(content);
			setContent("");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-lg">Add a Comment</CardTitle>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="flex space-x-3">
						<Avatar className="h-8 w-8">
							<AvatarImage src="/placeholder-user.jpg" />
							<AvatarFallback>U</AvatarFallback>
						</Avatar>
						<div className="flex-1">
							<Textarea
								placeholder={placeholder}
								value={content}
								onChange={(e) => setContent(e.target.value)}
								className="min-h-[100px] resize-none"
								disabled={loading}
							/>
						</div>
					</div>
					<div className="flex justify-end">
						<Button
							type="submit"
							disabled={!content.trim() || loading}
							className="flex items-center gap-2"
						>
							<Send className="h-4 w-4" />
							{loading ? "Posting..." : buttonText}
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
