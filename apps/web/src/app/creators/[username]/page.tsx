"use client";

import { useQuery } from "@tanstack/react-query";
import { CalendarDays, ExternalLink, Globe, MapPin, Users } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import React from "react";
import { ComponentCard } from "@/components/features/component-card";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/utils/trpc";

type PageProps = {
	params: Promise<{ username: string }>;
};

function CreatorProfileSkeleton() {
	return (
		<Container>
			<div className="space-y-6 py-8">
				<div className="flex items-start gap-6">
					<Skeleton className="h-24 w-24 rounded-full" />
					<div className="flex-1 space-y-3">
						<Skeleton className="h-8 w-48" />
						<Skeleton className="h-4 w-32" />
						<Skeleton className="h-4 w-96" />
						<div className="flex gap-2">
							<Skeleton className="h-6 w-16" />
							<Skeleton className="h-6 w-20" />
						</div>
					</div>
				</div>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
					{Array.from({ length: 3 }).map((_, i) => (
						<Card key={i}>
							<CardContent className="p-4">
								<Skeleton className="mb-2 h-8 w-16" />
								<Skeleton className="h-4 w-24" />
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</Container>
	);
}

export default function CreatorProfilePage({ params }: PageProps) {
	const { username } = React.use(params);

	const {
		data: creator,
		isLoading: creatorLoading,
		error: creatorError,
	} = useQuery(trpc.creators.getByUsername.queryOptions({ username }));

	const { data: stats, isLoading: statsLoading } = useQuery(
		trpc.creators.getStats.queryOptions({ username }),
	);

	const { data: components, isLoading: componentsLoading } = useQuery(
		trpc.creators.getComponents.queryOptions({ username, page: 1, limit: 12 }),
	);

	const { data: projects, isLoading: projectsLoading } = useQuery(
		trpc.creators.getProjects.queryOptions({ username, page: 1, limit: 12 }),
	);

	if (creatorLoading) {
		return <CreatorProfileSkeleton />;
	}

	if (creatorError || !creator) {
		notFound();
	}

	const formatDate = (date: string) => {
		return new Date(date).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
		});
	};

	const socialLinks = (creator.socialLinks as Record<string, string>) || {};

	return (
		<Container>
			<div className="py-8">
				{/* Profile Header */}
				<div className="mb-8 flex flex-col items-start gap-6 md:flex-row">
					<Avatar className="h-24 w-24">
						<AvatarImage src={creator.image || undefined} alt={creator.name} />
						<AvatarFallback className="text-2xl">
							{creator.name
								.split(" ")
								.map((n) => n[0])
								.join("")
								.slice(0, 2)}
						</AvatarFallback>
					</Avatar>

					<div className="flex-1 space-y-4">
						<div>
							<div className="mb-2 flex items-center gap-2">
								<h1 className="font-bold text-3xl">{creator.name}</h1>
								{creator.verified && (
									<Badge
										variant="secondary"
										className="bg-blue-100 text-blue-800"
									>
										Verified
									</Badge>
								)}
							</div>
							<p className="text-muted-foreground">@{creator.username}</p>
						</div>

						{creator.bio && (
							<p className="text-lg leading-relaxed">{creator.bio}</p>
						)}

						<div className="flex flex-wrap gap-4 text-muted-foreground text-sm">
							{creator.location && (
								<div className="flex items-center gap-1">
									<MapPin className="h-4 w-4" />
									{creator.location}
								</div>
							)}
							{creator.company && (
								<div className="flex items-center gap-1">
									<Users className="h-4 w-4" />
									{creator.company}
								</div>
							)}
							<div className="flex items-center gap-1">
								<CalendarDays className="h-4 w-4" />
								Joined {formatDate(creator.createdAt)}
							</div>
						</div>

						<div className="flex flex-wrap gap-2">
							{creator.website && (
								<Button variant="outline" size="sm" asChild>
									<Link
										href={creator.website}
										target="_blank"
										rel="noopener noreferrer"
									>
										<Globe className="mr-2 h-4 w-4" />
										Website
										<ExternalLink className="ml-1 h-3 w-3" />
									</Link>
								</Button>
							)}
							{Object.entries(socialLinks).map(([platform, url]) => (
								<Button key={platform} variant="outline" size="sm" asChild>
									<Link href={url} target="_blank" rel="noopener noreferrer">
										{platform}
										<ExternalLink className="ml-1 h-3 w-3" />
									</Link>
								</Button>
							))}
						</div>

						{creator.specialties && creator.specialties.length > 0 && (
							<div className="flex flex-wrap gap-2">
								{creator.specialties.map((specialty) => (
									<Badge key={specialty} variant="secondary">
										{specialty}
									</Badge>
								))}
							</div>
						)}
					</div>
				</div>

				{/* Stats Cards */}
				<div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
					<Card>
						<CardContent className="p-4">
							<div className="font-bold text-2xl">
								{statsLoading ? (
									<Skeleton className="h-8 w-16" />
								) : (
									stats?.componentCount || 0
								)}
							</div>
							<p className="text-muted-foreground">Components</p>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="p-4">
							<div className="font-bold text-2xl">
								{statsLoading ? (
									<Skeleton className="h-8 w-16" />
								) : (
									stats?.totalStars || 0
								)}
							</div>
							<p className="text-muted-foreground">Stars Received</p>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="p-4">
							<div className="font-bold text-2xl">
								{statsLoading ? (
									<Skeleton className="h-8 w-16" />
								) : (
									stats?.projectCount || 0
								)}
							</div>
							<p className="text-muted-foreground">Public Projects</p>
						</CardContent>
					</Card>
				</div>

				{/* Content Tabs */}
				<Tabs defaultValue="components" className="space-y-6">
					<TabsList>
						<TabsTrigger value="components">Components</TabsTrigger>
						<TabsTrigger value="projects">Projects</TabsTrigger>
					</TabsList>

					<TabsContent value="components" className="space-y-6">
						{componentsLoading ? (
							<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
								{Array.from({ length: 6 }).map((_, i) => (
									<Card key={i}>
										<CardHeader>
											<Skeleton className="h-6 w-3/4" />
											<Skeleton className="h-4 w-full" />
										</CardHeader>
										<CardContent>
											<Skeleton className="h-20 w-full" />
										</CardContent>
									</Card>
								))}
							</div>
						) : components && components.length > 0 ? (
							<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
								{components.map((component) => (
									<ComponentCard
										key={component.id}
										{...component}
										categories={[]}
										githubUrl={component.repoUrl}
										isStarred={false}
										forksCount={0}
										issuesCount={0}
										watchersCount={0}
										readme={null}
										exampleCode={null}
										previewUrl={null}
										creator={{
											id: creator.id,
											name: creator.name,
											username: creator.username,
											image: creator.image,
										}}
									/>
								))}
							</div>
						) : (
							<Card>
								<CardContent className="p-8 text-center">
									<p className="text-muted-foreground">
										No components published yet.
									</p>
								</CardContent>
							</Card>
						)}
					</TabsContent>

					<TabsContent value="projects" className="space-y-6">
						{projectsLoading ? (
							<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
								{Array.from({ length: 6 }).map((_, i) => (
									<Card key={i}>
										<CardHeader>
											<Skeleton className="h-6 w-3/4" />
											<Skeleton className="h-4 w-full" />
										</CardHeader>
									</Card>
								))}
							</div>
						) : projects && projects.length > 0 ? (
							<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
								{projects.map((project) => (
									<Card key={project.id}>
										<CardHeader>
											<CardTitle>
												<Link
													href={`/projects/${project.slug}`}
													className="hover:underline"
												>
													{project.name}
												</Link>
											</CardTitle>
											{project.description && (
												<CardDescription>{project.description}</CardDescription>
											)}
										</CardHeader>
										<CardContent>
											<p className="text-muted-foreground text-sm">
												Updated {formatDate(project.updatedAt)}
											</p>
										</CardContent>
									</Card>
								))}
							</div>
						) : (
							<Card>
								<CardContent className="p-8 text-center">
									<p className="text-muted-foreground">
										No public projects available.
									</p>
								</CardContent>
							</Card>
						)}
					</TabsContent>
				</Tabs>
			</div>
		</Container>
	);
}
