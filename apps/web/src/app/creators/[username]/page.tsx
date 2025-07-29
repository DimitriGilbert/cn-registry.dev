"use client";

import { useQuery } from "@tanstack/react-query";
import { CalendarDays, ExternalLink, Github, Globe, MapPin, Users, Star } from "lucide-react";
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
import { getUserAvatarUrl } from "@/utils/user";

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
						<Card key={`creator-stat-${i}`}>
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

	let socialLinks = (creator.socialLinks as Record<string, string>) || {};
	
	// If GitHub URL is in bio (bad data), extract it and add to socialLinks
	const githubMatch = creator.bio?.match(/GitHub:\s*(https?:\/\/github\.com\/[^\s]+)/);
	if (githubMatch && !socialLinks.github) {
		socialLinks = { ...socialLinks, github: githubMatch[1] };
	}
	
	// Clean bio by removing GitHub link
	const cleanBio = creator.bio?.replace(/GitHub:\s*https?:\/\/github\.com\/[^\s]+/g, '').trim();

	return (
		<Container>
			<div className="py-8">
				{/* Profile Header with Clean Design */}
				<div className="relative mb-12 overflow-hidden rounded-2xl border bg-card p-8 shadow-sm">
					{/* Very subtle background pattern */}
					<div className="absolute inset-0 bg-gradient-to-br from-primary/2 via-transparent to-muted/3 opacity-50" />
					
					<div className="relative flex flex-col items-start gap-8 md:flex-row">
						{/* Enhanced Avatar */}
						<div className="relative group">
							<Avatar className="h-32 w-32 ring-4 ring-background shadow-lg transition-transform duration-200 group-hover:scale-105">
								<AvatarImage src={getUserAvatarUrl(creator)} alt={creator.name} />
								<AvatarFallback className="text-3xl bg-primary text-primary-foreground">
									{creator.name
										.split(" ")
										.map((n) => n[0])
										.join("")
										.slice(0, 2)}
								</AvatarFallback>
							</Avatar>
							{/* Activity Indicator */}
							<div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-green-400 border-2 border-background shadow-sm animate-pulse" />
						</div>

						<div className="flex-1 space-y-6">
							{/* Name and Verification */}
							<div>
								<div className="mb-3 flex items-center gap-3">
									<h1 className="font-bold text-4xl text-foreground">
										{creator.name}
									</h1>
									{creator.verified && (
										<Badge className="bg-primary text-primary-foreground shadow-sm">
											<Star className="h-3 w-3 mr-1 fill-current" />
											Verified
										</Badge>
									)}
								</div>
								<p className="text-muted-foreground text-lg font-medium">@{creator.username}</p>
							</div>

							{/* Bio */}
							{cleanBio && (
								<div className="relative">
									<p className="text-lg leading-relaxed bg-card/50 backdrop-blur-sm rounded-lg p-4 border">
										{cleanBio}
									</p>
								</div>
							)}

							{/* Meta Information */}
							<div className="flex flex-wrap gap-6 text-muted-foreground">
								{creator.location && (
									<div className="flex items-center gap-2 bg-card/50 backdrop-blur-sm rounded-full px-3 py-1.5 border">
										<MapPin className="h-4 w-4 text-primary" />
										<span className="text-sm font-medium">{creator.location}</span>
									</div>
								)}
								{creator.company && (
									<div className="flex items-center gap-2 bg-card/50 backdrop-blur-sm rounded-full px-3 py-1.5 border">
										<Users className="h-4 w-4 text-accent" />
										<span className="text-sm font-medium">{creator.company}</span>
									</div>
								)}
								<div className="flex items-center gap-2 bg-card/50 backdrop-blur-sm rounded-full px-3 py-1.5 border">
									<CalendarDays className="h-4 w-4 text-purple-500" />
									<span className="text-sm font-medium">Joined {formatDate(creator.createdAt)}</span>
								</div>
							</div>

							{/* Social Links */}
							<div className="flex flex-wrap gap-3">
								{creator.website && (
									<Button variant="outline" size="sm" asChild className="bg-card/50 backdrop-blur-sm hover:bg-card transition-all duration-200 hover:scale-105">
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
									<Button key={platform} variant="outline" size="sm" asChild className="bg-card/50 backdrop-blur-sm hover:bg-card transition-all duration-200 hover:scale-105">
										<a href={url} target="_blank" rel="noopener noreferrer">
											{platform === 'github' ? (
												<>
													<Github className="mr-2 h-4 w-4" />
													GitHub
												</>
											) : (
												platform
											)}
											<ExternalLink className="ml-1 h-3 w-3" />
										</a>
									</Button>
								))}
							</div>

							{/* Specialties */}
							{creator.specialties && creator.specialties.length > 0 && (
								<div className="space-y-2">
									<h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Specialties</h3>
									<div className="flex flex-wrap gap-2">
										{creator.specialties.map((specialty, index) => (
											<Badge 
												key={specialty} 
												variant="secondary" 
												className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-all duration-200"
												style={{
													animationDelay: `${index * 0.1}s`
												}}
											>
												{specialty}
											</Badge>
										))}
									</div>
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Clean Stats Cards */}
				<div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-3">
					<Card className="border shadow-sm hover:shadow-md transition-all duration-200">
						<div className="absolute inset-0 bg-primary/2 opacity-0 hover:opacity-100 transition-opacity duration-200" />
						<CardContent className="relative p-6">
							<div className="flex items-center justify-between mb-2">
								<div className="p-2 rounded-lg bg-primary/10">
									<div className="w-6 h-6 rounded bg-primary/20" />
								</div>
								<div className="text-primary opacity-60">
									<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
										<path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
									</svg>
								</div>
							</div>
							<div className="font-bold text-3xl text-blue-600 dark:text-blue-400 mb-1">
								{statsLoading ? (
									<Skeleton className="h-8 w-16" />
								) : (
									stats?.componentCount || 0
								)}
							</div>
							<p className="text-muted-foreground font-medium">Components Created</p>
						</CardContent>
					</Card>
					
					<Card className="border shadow-sm hover:shadow-md transition-all duration-200">
						<div className="absolute inset-0 bg-accent/2 opacity-0 hover:opacity-100 transition-opacity duration-200" />
						<CardContent className="relative p-6">
							<div className="flex items-center justify-between mb-2">
								<div className="p-2 rounded-lg bg-accent/10">
									<Star className="w-6 h-6 text-accent-foreground fill-current" />
								</div>
								<div className="text-accent-foreground opacity-60">
									<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
										<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
									</svg>
								</div>
							</div>
							<div className="font-bold text-3xl text-yellow-600 dark:text-yellow-400 mb-1">
								{statsLoading ? (
									<Skeleton className="h-8 w-16" />
								) : (
									stats?.totalStars || 0
								)}
							</div>
							<p className="text-muted-foreground font-medium">Stars Received</p>
						</CardContent>
					</Card>
					
					<Card className="border shadow-sm hover:shadow-md transition-all duration-200">
						<div className="absolute inset-0 bg-secondary/2 opacity-0 hover:opacity-100 transition-opacity duration-200" />
						<CardContent className="relative p-6">
							<div className="flex items-center justify-between mb-2">
								<div className="p-2 rounded-lg bg-secondary/10">
									<div className="w-6 h-6 rounded bg-secondary/20" />
								</div>
								<div className="text-secondary-foreground opacity-60">
									<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
										<path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
									</svg>
								</div>
							</div>
							<div className="font-bold text-3xl text-green-600 dark:text-green-400 mb-1">
								{statsLoading ? (
									<Skeleton className="h-8 w-16" />
								) : (
									stats?.projectCount || 0
								)}
							</div>
							<p className="text-muted-foreground font-medium">Public Projects</p>
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
										isStarred={false}
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
