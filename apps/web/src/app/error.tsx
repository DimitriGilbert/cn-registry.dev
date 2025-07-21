"use client";

import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export default function ErrorPage({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<Container>
			<div className="py-16">
				<div className="mx-auto max-w-md text-center">
					<Card>
						<CardHeader>
							<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
								<AlertTriangle className="h-8 w-8 text-destructive" />
							</div>
							<CardTitle>Something went wrong!</CardTitle>
							<CardDescription>
								An unexpected error occurred. Please try again or contact
								support if the problem persists.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex flex-col gap-2 sm:flex-row">
								<Button onClick={reset} className="flex-1">
									<RefreshCw className="mr-2 h-4 w-4" />
									Try Again
								</Button>
								<Button
									variant="outline"
									asChild
									className="flex-1 bg-transparent"
								>
									<Link href="/">
										<Home className="mr-2 h-4 w-4" />
										Go Home
									</Link>
								</Button>
							</div>
							{error.digest && (
								<div className="text-muted-foreground text-xs">
									Error ID: {error.digest}
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</Container>
	);
}
