"use client";

import { useQuery } from "@tanstack/react-query";
import { Calendar, Component, Plus, Users } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { PageTitle } from "@/components/layout/page-title";
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
import { trpc, type trpcClient } from "@/utils/trpc";

type ProjectCardProps = Awaited<
	ReturnType<typeof trpcClient.projects.getAll.query>
>[number];

function ProjectCard(project: ProjectCardProps) {
	const {
		id,
		name,
		description,
		slug,
		visibility,
		componentCount,
		collaboratorCount,
		role,
		createdAt,
		updatedAt,
	} = project;
	const formattedDate = new Date(updatedAt).toLocaleDateString();

	return (
		<Card className="group transition-shadow hover:shadow-md">
			<CardHeader>
				<div className="flex items-start justify-between">
					<div className="flex-1 space-y-1">
						<CardTitle className="text-lg">
							<Link href={`/projects/${slug}`} className="hover:underline">
								{name}
							</Link>
						</CardTitle>
						{description && (
							<CardDescription className="line-clamp-2">
								{description}
							</CardDescription>
						)}
					</div>
					<div className="flex items-center gap-2">
						<Badge variant={visibility === "public" ? "default" : "secondary"}>
							{visibility}
						</Badge>
						<Badge variant="outline">{role}</Badge>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<div className="mb-4 flex items-center justify-between text-muted-foreground text-sm">
					<div className="flex items-center gap-4">
						<div className="flex items-center gap-1">
							<Component className="h-3 w-3" />
							{componentCount} components
						</div>
						<div className="flex items-center gap-1">
							<Users className="h-3 w-3" />
							{collaboratorCount}{" "}
							{collaboratorCount === 1 ? "collaborator" : "collaborators"}
						</div>
					</div>
					<div className="flex items-center gap-1">
						<Calendar className="h-3 w-3" />
						{formattedDate}
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Button asChild size="sm" className="flex-1">
						<Link href={`/projects/${slug}`}>View Project</Link>
					</Button>
					<Button variant="outline" size="sm" asChild>
						<Link href={`/projects/${slug}/edit`}>Edit</Link>
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}

function ProjectGrid({ projects }: { projects: ProjectCardProps[] }) {
	if (projects.length === 0) {
		return (
			<div className="py-12 text-center">
				<Component className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
				<h3 className="mb-2 font-semibold text-lg">No projects yet</h3>
				<p className="mb-4 text-muted-foreground">
					Create your first project to organize and share your component
					collections.
				</p>
				<Button asChild>
					<Link href="/projects/new">
						<Plus className="mr-2 h-4 w-4" />
						Create Project
					</Link>
				</Button>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
			{projects.map((project) => (
				<ProjectCard key={project.id} {...project} />
			))}
		</div>
	);
}

function LoadingSkeleton() {
	return (
		<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
			{Array.from({ length: 6 }).map((_, i) => (
				<Card key={i}>
					<CardHeader>
						<Skeleton className="mb-2 h-6 w-3/4" />
						<Skeleton className="h-4 w-full" />
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-8 w-full" />
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}

export default function ProjectsPage() {
	const {
		data: projects = [],
		isLoading,
		error,
	} = useQuery(trpc.projects.getAll.queryOptions());

	return (
		<Container>
			<div className="py-8">
				<PageTitle
					title="Projects"
					subtitle="Organize your components into reusable project collections"
				>
					<Button asChild>
						<Link href="/projects/new">
							<Plus className="mr-2 h-4 w-4" />
							New Project
						</Link>
					</Button>
				</PageTitle>

				<div className="mt-8">
					{isLoading ? (
						<LoadingSkeleton />
					) : error ? (
						<div className="py-12 text-center">
							<h3 className="mb-2 font-semibold text-lg">
								Error loading projects
							</h3>
							<p className="text-muted-foreground">
								There was an error loading your projects. Please try again.
							</p>
						</div>
					) : (
						<ProjectGrid projects={projects} />
					)}
				</div>
			</div>
		</Container>
	);
}
