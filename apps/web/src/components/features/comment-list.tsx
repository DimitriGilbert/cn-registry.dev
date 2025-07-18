"use client";

import { MessageCircle, Reply, ThumbsUp } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface Comment {
	id: string;
	user: {
		id: string;
		name: string;
		username: string | null;
		image: string | null;
	} | null;
	content: string;
	createdAt: string;
	parentId: string | null;
	replies?: Comment[];
}

interface CommentListProps {
	comments: Comment[];
	onReply?: (parentId: string, content: string) => void;
}

export function CommentList({ comments, onReply }: CommentListProps) {
	const [replyingTo, setReplyingTo] = useState<string | null>(null);
	const [replyContent, setReplyContent] = useState("");

	const handleReply = (parentId: string) => {
		if (replyContent.trim()) {
			onReply?.(parentId, replyContent);
			setReplyContent("");
			setReplyingTo(null);
		}
	};

	const CommentItem = ({
		comment,
		isReply = false,
	}: {
		comment: Comment;
		isReply?: boolean;
	}) => (
		<Card className={isReply ? "mt-2 ml-8" : ""}>
			<CardHeader className="pb-2">
				<div className="flex items-center space-x-3">
					<Avatar className="h-8 w-8">
						<AvatarImage src={comment.user?.image || "/placeholder.svg"} />
						<AvatarFallback>
							{comment.user?.name?.charAt(0).toUpperCase() || "U"}
						</AvatarFallback>
					</Avatar>
					<div>
						<p className="font-medium text-sm">
							{comment.user?.name || "Unknown"}
						</p>
						<p className="text-muted-foreground text-xs">
							{new Date(comment.createdAt).toLocaleDateString()}
						</p>
					</div>
				</div>
			</CardHeader>
			<CardContent className="pt-0">
				<p className="mb-3 text-sm">{comment.content}</p>
				<div className="flex items-center space-x-2">
					{!isReply && (
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setReplyingTo(comment.id)}
							className="h-8 px-2"
						>
							<Reply className="mr-1 h-3 w-3" />
							Reply
						</Button>
					)}
				</div>

				{replyingTo === comment.id && (
					<div className="mt-3 space-y-2">
						<Textarea
							placeholder="Write a reply..."
							value={replyContent}
							onChange={(e) => setReplyContent(e.target.value)}
							className="min-h-[80px]"
						/>
						<div className="flex gap-2">
							<Button size="sm" onClick={() => handleReply(comment.id)}>
								Reply
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={() => {
									setReplyingTo(null);
									setReplyContent("");
								}}
							>
								Cancel
							</Button>
						</div>
					</div>
				)}

				{comment.replies?.map((reply) => (
					<CommentItem key={reply.id} comment={reply} isReply />
				))}
			</CardContent>
		</Card>
	);

	return (
		<div className="space-y-4">
			<div className="flex items-center gap-2">
				<MessageCircle className="h-5 w-5" />
				<h3 className="font-semibold text-lg">Comments ({comments.length})</h3>
			</div>

			{comments.map((comment) => (
				<CommentItem key={comment.id} comment={comment} />
			))}

			{comments.length === 0 && (
				<Card>
					<CardContent className="py-8 text-center">
						<MessageCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
						<p className="text-muted-foreground">
							No comments yet. Be the first to comment!
						</p>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
