import { Code, Eye } from "lucide-react";
import type React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ShowcaseProps {
	component?: React.ReactNode;
	preview?: string | null;
	code: string;
	title?: string;
}

export function Showcase({
	component,
	preview,
	code,
	title = "Component Preview",
}: ShowcaseProps) {
	const hasPreview = component || preview;

	return (
		<Card>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
			</CardHeader>
			<CardContent>
				<Tabs defaultValue={hasPreview ? "preview" : "code"} className="w-full">
					<TabsList
						className={`grid w-full ${hasPreview ? "grid-cols-2" : "grid-cols-1"}`}
					>
						{hasPreview && (
							<TabsTrigger value="preview" className="flex items-center gap-2">
								<Eye className="h-4 w-4" />
								Preview
							</TabsTrigger>
						)}
						<TabsTrigger value="code" className="flex items-center gap-2">
							<Code className="h-4 w-4" />
							Code
						</TabsTrigger>
					</TabsList>
					{hasPreview && (
						<TabsContent value="preview" className="mt-4">
							<div className="rounded-lg border bg-background p-8">
								{component ||
									(preview && (
										<iframe
											src={preview}
											className="h-64 w-full border-none"
											title="Component Preview"
										/>
									))}
							</div>
						</TabsContent>
					)}
					<TabsContent value="code" className="mt-4">
						<pre className="overflow-x-auto rounded-lg bg-muted p-4 text-sm">
							<code>{code}</code>
						</pre>
					</TabsContent>
				</Tabs>
			</CardContent>
		</Card>
	);
}
