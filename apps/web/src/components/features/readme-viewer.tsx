"use client";

import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Import highlight.js CSS
import "highlight.js/styles/github-dark.css";

interface ReadmeViewerProps {
	content?: string;
	isLoading?: boolean;
}

export function ReadmeViewer({
	content,
	isLoading = false,
}: ReadmeViewerProps) {
	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>README</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<Skeleton className="h-4 w-3/4" />
					<Skeleton className="h-4 w-1/2" />
					<Skeleton className="h-32 w-full" />
					<Skeleton className="h-4 w-2/3" />
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>README</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="prose prose-sm dark:prose-invert max-w-none">
					{content ? (
						<ReactMarkdown
							remarkPlugins={[remarkGfm]}
							rehypePlugins={[rehypeHighlight, rehypeRaw]}
							components={{
								// Custom components for better styling
								code: ({
									node,
									inline,
									className,
									children,
									...props
								}: any) => {
									const match = /language-(\w+)/.exec(className || "");
									return !inline && match ? (
										<code className={className} {...props}>
											{children}
										</code>
									) : (
										<code
											className="rounded bg-muted px-1 py-0.5 font-mono text-sm"
											{...props}
										>
											{children}
										</code>
									);
								},
								pre: ({ children, ...props }: any) => (
									<pre
										className="overflow-x-auto rounded-lg bg-muted p-4 text-sm"
										{...props}
									>
										{children}
									</pre>
								),
								blockquote: ({ children, ...props }: any) => (
									<blockquote
										className="border-muted-foreground/20 border-l-4 pl-4 text-muted-foreground italic"
										{...props}
									>
										{children}
									</blockquote>
								),
								table: ({ children, ...props }: any) => (
									<div className="overflow-x-auto">
										<table
											className="w-full border-collapse border border-border"
											{...props}
										>
											{children}
										</table>
									</div>
								),
								th: ({ children, ...props }: any) => (
									<th
										className="border border-border bg-muted px-3 py-2 text-left font-medium"
										{...props}
									>
										{children}
									</th>
								),
								td: ({ children, ...props }: any) => (
									<td className="border border-border px-3 py-2" {...props}>
										{children}
									</td>
								),
								a: ({ children, href, ...props }: any) => (
									<a
										href={href}
										className="text-primary hover:underline"
										target="_blank"
										rel="noopener noreferrer"
										{...props}
									>
										{children}
									</a>
								),
							}}
						>
							{content}
						</ReactMarkdown>
					) : (
						<p className="text-muted-foreground">No README available.</p>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
