"use client";

import { useQuery } from "@tanstack/react-query";
import { Search, Star, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { z } from "zod";
import { Pagination } from "@/components/ui/pagination";
import { Container } from "@/components/layout/container";
import { PageTitle } from "@/components/layout/page-title";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFormedible } from "@/hooks/use-formedible";
import { trpc } from "@/utils/trpc";
import { getUserAvatarUrl } from "@/utils/user";

function CreatorCard({ creator }: { creator: any }) {
	return (
		<Card className="group transition-shadow hover:shadow-md">
			<CardHeader>
				<div className="flex items-start gap-4">
					<Avatar className="h-12 w-12">
						<AvatarImage src={getUserAvatarUrl(creator)} alt={creator.name} />
						<AvatarFallback>
							{creator.name
								.split(" ")
								.map((n: string) => n[0])
								.join("")
								.slice(0, 2)}
						</AvatarFallback>
					</Avatar>
					<div className="min-w-0 flex-1">
						<div className="mb-1 flex items-center gap-2">
							<CardTitle className="text-lg leading-tight">
								<Link
									href={`/creators/${creator.username}`}
									className="hover:underline"
								>
									{creator.name}
								</Link>
							</CardTitle>
							{creator.verified && (
								<Badge
									variant="secondary"
									className="bg-blue-100 text-blue-800 text-xs"
								>
									Verified
								</Badge>
							)}
						</div>
						<p className="text-muted-foreground text-sm">@{creator.username}</p>
						{creator.bio && (
							<CardDescription className="mt-2 line-clamp-2">
								{creator.bio}
							</CardDescription>
						)}
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<div className="mb-4 flex items-center justify-between text-muted-foreground text-sm">
					<div className="flex items-center gap-4">
						<div className="flex items-center gap-1">
							<Users className="h-3 w-3" />
							{creator.componentCount} components
						</div>
						{creator.totalStars > 0 && (
							<div className="flex items-center gap-1">
								<Star className="h-3 w-3" />
								{creator.totalStars} stars
							</div>
						)}
					</div>
				</div>

				{creator.location && (
					<p className="mb-3 text-muted-foreground text-sm">
						{creator.location}
					</p>
				)}

				{creator.specialties && creator.specialties.length > 0 && (
					<div className="mb-3 flex flex-wrap gap-1">
						{creator.specialties.slice(0, 3).map((specialty: string) => (
							<Badge key={specialty} variant="outline" className="text-xs">
								{specialty}
							</Badge>
						))}
						{creator.specialties.length > 3 && (
							<Badge variant="outline" className="text-xs">
								+{creator.specialties.length - 3}
							</Badge>
						)}
					</div>
				)}

				<Button asChild size="sm" className="w-full">
					<Link href={`/creators/${creator.username}`}>View Profile</Link>
				</Button>
			</CardContent>
		</Card>
	);
}

function CreatorsSkeleton() {
	return (
		<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
			{Array.from({ length: 9 }).map((_, i) => (
				<Card key={`creator-list-${i}`}>
					<CardHeader>
						<div className="flex items-start gap-4">
							<Skeleton className="h-12 w-12 rounded-full" />
							<div className="flex-1 space-y-2">
								<Skeleton className="h-5 w-32" />
								<Skeleton className="h-4 w-24" />
								<Skeleton className="h-4 w-full" />
							</div>
						</div>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							<Skeleton className="h-4 w-48" />
							<div className="flex gap-1">
								<Skeleton className="h-5 w-16" />
								<Skeleton className="h-5 w-12" />
							</div>
							<Skeleton className="h-8 w-full" />
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}

const searchSchema = z.object({
	query: z.string(),
});

export default function CreatorsPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [trendingPage, setTrendingPage] = useState(1);
	const [searchPage, setSearchPage] = useState(1);

	const { Form: SearchForm } = useFormedible({
		schema: searchSchema,
		fields: [
			{
				name: "query",
				type: "text",
				placeholder: "Search creators by name...",
			},
		],
		formOptions: {
			defaultValues: { query: "" },
			onSubmit: async ({ value }) => {
				setSearchQuery(value.query);
				setSearchPage(1); // Reset to first page on new search
			},
		},
		showSubmitButton: false,
	});

	const { data: searchResults, isLoading: searchLoading } = useQuery(
		trpc.creators.search.queryOptions({
			query: searchQuery || undefined,
			page: searchPage,
			limit: 12,
		}),
	);

	const { data: trendingData, isLoading: trendingLoading } = useQuery(
		trpc.creators.getTrending.queryOptions({
			period: "month",
			page: trendingPage,
			limit: 12,
		}),
	);

	return (
		<Container>
			<div className="py-8">
				<PageTitle
					title="Creators"
					subtitle="Discover talented creators building amazing components and tools"
				/>

				<div className="mt-8">
					<Tabs defaultValue="trending" className="space-y-6">
						<TabsList>
							<TabsTrigger value="trending">Trending</TabsTrigger>
							<TabsTrigger value="search">Search</TabsTrigger>
						</TabsList>

						<TabsContent value="trending" className="space-y-6">
							<div className="mb-8 space-y-2 text-center">
								<h2 className="font-semibold text-2xl">Trending Creators</h2>
								<p className="text-muted-foreground">
									Popular creators based on stars received this month
								</p>
							</div>

							{trendingLoading ? (
								<CreatorsSkeleton />
							) : trendingData?.creators && trendingData.creators.length > 0 ? (
								<>
									<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
										{trendingData.creators.map((creator) => (
											<CreatorCard key={creator.id} creator={creator} />
										))}
									</div>
									{trendingData.totalPages > 1 && (
										<div className="flex justify-center mt-8">
											<Pagination
												currentPage={trendingPage}
												totalPages={trendingData.totalPages}
												onPageChange={setTrendingPage}
											/>
										</div>
									)}
								</>
							) : (
								<Card>
									<CardContent className="p-8 text-center">
										<p className="text-muted-foreground">
											No trending creators found.
										</p>
									</CardContent>
								</Card>
							)}
						</TabsContent>

						<TabsContent value="search" className="space-y-6">
							<div className="mx-auto max-w-md">
								<SearchForm />
							</div>

							{searchQuery && (
								<div className="mb-6 text-center">
									<p className="text-muted-foreground">
										Search results for "{searchQuery}"
									</p>
								</div>
							)}

							{searchLoading ? (
								<CreatorsSkeleton />
							) : searchResults?.creators && searchResults.creators.length > 0 ? (
								<>
									<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
										{searchResults.creators.map((creator) => (
											<CreatorCard key={creator.id} creator={creator} />
										))}
									</div>
									{searchResults.totalPages > 1 && (
										<div className="flex justify-center mt-8">
											<Pagination
												currentPage={searchPage}
												totalPages={searchResults.totalPages}
												onPageChange={setSearchPage}
											/>
										</div>
									)}
								</>
							) : searchQuery ? (
								<Card>
									<CardContent className="p-8 text-center">
										<p className="text-muted-foreground">
											No creators found matching "{searchQuery}".
										</p>
									</CardContent>
								</Card>
							) : !searchQuery ? (
								<Card>
									<CardContent className="p-8 text-center">
										<p className="text-muted-foreground">
											Enter a search term to find creators.
										</p>
									</CardContent>
								</Card>
							) : null}
						</TabsContent>
					</Tabs>
				</div>
			</div>
		</Container>
	);
}
