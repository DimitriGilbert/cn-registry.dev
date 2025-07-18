import { ArrowLeft, Home, Search } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export default function NotFound() {
	return (
		<Container>
			<div className="py-16">
				<div className="mx-auto max-w-md text-center">
					<Card>
						<CardHeader>
							<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
								<span className="font-bold text-2xl text-muted-foreground">
									404
								</span>
							</div>
							<CardTitle>Page Not Found</CardTitle>
							<CardDescription>
								The page you're looking for doesn't exist or has been moved.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex flex-col gap-2 sm:flex-row">
								<Button asChild className="flex-1">
									<Link href="/">
										<Home className="mr-2 h-4 w-4" />
										Go Home
									</Link>
								</Button>
								<Button
									variant="outline"
									asChild
									className="flex-1 bg-transparent"
								>
									<Link href="/search">
										<Search className="mr-2 h-4 w-4" />
										Search
									</Link>
								</Button>
							</div>
							<Button variant="ghost" asChild className="w-full">
								<Link href="javascript:history.back()">
									<ArrowLeft className="mr-2 h-4 w-4" />
									Go Back
								</Link>
							</Button>
						</CardContent>
					</Card>
				</div>
			</div>
		</Container>
	);
}
