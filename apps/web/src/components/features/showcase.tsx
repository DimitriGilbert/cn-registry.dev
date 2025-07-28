import { Code, Eye, Play } from "lucide-react";
import type React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SimpleSandbox } from "./code-sandbox";

interface ShowcaseProps {
	component?: React.ReactNode;
	preview?: string | null;
	code: string;
	title?: string;
	enableSandbox?: boolean; // New option to enable interactive sandbox
}

export function Showcase({
	component,
	preview,
	code,
	title = "Component Preview",
	enableSandbox = false,
}: ShowcaseProps) {
	const hasPreview = component || preview;
	const hasSandbox = enableSandbox && code;

	// Determine tabs needed
	const tabs = [];
	if (hasPreview) tabs.push("preview");
	if (hasSandbox) tabs.push("sandbox");
	tabs.push("code");

	const defaultTab = hasPreview ? "preview" : hasSandbox ? "sandbox" : "code";

	return (
		<Card>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
			</CardHeader>
			<CardContent>
				<Tabs defaultValue={defaultTab} className="w-full">
					<TabsList
						className={`grid w-full ${
							tabs.length === 1
								? "grid-cols-1"
								: tabs.length === 2
									? "grid-cols-2"
									: "grid-cols-3"
						}`}
					>
						{hasPreview && (
							<TabsTrigger value="preview" className="flex items-center gap-2">
								<Eye className="h-4 w-4" />
								Preview
							</TabsTrigger>
						)}
						{hasSandbox && (
							<TabsTrigger value="sandbox" className="flex items-center gap-2">
								<Play className="h-4 w-4" />
								Interactive
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

					{hasSandbox && (
						<TabsContent value="sandbox" className="mt-4">
							<SimpleSandbox code={code} />
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
