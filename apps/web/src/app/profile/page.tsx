"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Container } from "@/components/layout/container";
import { PageTitle } from "@/components/layout/page-title";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useFormedible } from "@/hooks/use-formedible";
import { trpc } from "@/utils/trpc";

const profileSchema = z.object({
	bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
	website: z
		.string()
		.url("Please enter a valid URL")
		.optional()
		.or(z.literal("")),
	location: z
		.string()
		.max(100, "Location must be less than 100 characters")
		.optional(),
	company: z
		.string()
		.max(100, "Company must be less than 100 characters")
		.optional(),
	github: z.string().optional(),
	twitter: z.string().optional(),
	linkedin: z.string().optional(),
	specialties: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

function ProfileSkeleton() {
	return (
		<Container>
			<div className="space-y-8 py-8">
				<div className="space-y-2">
					<Skeleton className="h-8 w-48" />
					<Skeleton className="h-4 w-96" />
				</div>
				<div className="max-w-2xl space-y-6">
					<Card>
						<CardHeader>
							<Skeleton className="h-6 w-32" />
						</CardHeader>
						<CardContent className="space-y-4">
							{Array.from({ length: 6 }).map((_, i) => (
								<div key={i} className="space-y-2">
									<Skeleton className="h-4 w-24" />
									<Skeleton className="h-10 w-full" />
								</div>
							))}
						</CardContent>
					</Card>
				</div>
			</div>
		</Container>
	);
}

export default function ProfilePage() {
	const queryClient = useQueryClient();

	const { data: profile, isLoading } = useQuery(
		trpc.creators.getMyProfile.queryOptions(),
	);

	const updateProfileMutation = useMutation(
		trpc.creators.updateProfile.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: ["creators", "getMyProfile"],
				});
				toast.success("Profile updated successfully!");
			},
			onError: (error) => {
				toast.error(`Failed to update profile: ${error.message}`);
			},
		}),
	);

	const { Form: ProfileForm } = useFormedible<ProfileFormValues>({
		schema: profileSchema,
		fields: [
			{
				name: "bio",
				type: "textarea",
				label: "Bio",
				placeholder: "Tell others about yourself...",
				textareaConfig: {
					rows: 4,
					maxLength: 500,
					showWordCount: true,
				},
			},
			{
				name: "location",
				type: "text",
				label: "Location",
				placeholder: "e.g., San Francisco, CA",
			},
			{
				name: "company",
				type: "text",
				label: "Company",
				placeholder: "e.g., Acme Corp",
			},
			{
				name: "website",
				type: "url",
				label: "Website",
				placeholder: "https://your-website.com",
			},
			{
				name: "github",
				type: "url",
				label: "GitHub URL",
				placeholder: "https://github.com/username",
			},
			{
				name: "twitter",
				type: "url",
				label: "Twitter URL",
				placeholder: "https://twitter.com/username",
			},
			{
				name: "linkedin",
				type: "url",
				label: "LinkedIn URL",
				placeholder: "https://linkedin.com/in/username",
			},
			{
				name: "specialties",
				type: "text",
				label: "Specialties",
				placeholder: "e.g., React, TypeScript, UI/UX (comma-separated)",
				description: "Enter your areas of expertise, separated by commas",
			},
		],
		formOptions: {
			defaultValues: {
				bio: profile?.bio || "",
				website: profile?.website || "",
				location: profile?.location || "",
				company: profile?.company || "",
				github: (profile?.socialLinks as Record<string, string>)?.github || "",
				twitter:
					(profile?.socialLinks as Record<string, string>)?.twitter || "",
				linkedin:
					(profile?.socialLinks as Record<string, string>)?.linkedin || "",
				specialties: profile?.specialties?.join(", ") || "",
			},
			onSubmit: async ({ value }) => {
				const socialLinks: Record<string, string> = {};

				if (value.github) socialLinks.github = value.github;
				if (value.twitter) socialLinks.twitter = value.twitter;
				if (value.linkedin) socialLinks.linkedin = value.linkedin;

				const specialties = value.specialties
					? value.specialties
							.split(",")
							.map((s) => s.trim())
							.filter(Boolean)
					: [];

				updateProfileMutation.mutate({
					bio: value.bio || undefined,
					website: value.website || undefined,
					location: value.location || undefined,
					company: value.company || undefined,
					socialLinks,
					specialties,
				});
			},
		},
		loading: updateProfileMutation.isPending,
		submitLabel: "Save Changes",
	});

	if (isLoading) {
		return <ProfileSkeleton />;
	}

	if (!profile) {
		return (
			<Container>
				<div className="py-8 text-center">
					<p className="text-destructive">
						Failed to load profile. Please try again.
					</p>
				</div>
			</Container>
		);
	}

	return (
		<Container>
			<div className="py-8">
				<PageTitle
					title="Profile Settings"
					subtitle="Customize your public creator profile"
				/>

				<div className="mt-8 max-w-2xl">
					{/* Current Profile Preview */}
					<Card className="mb-8">
						<CardHeader>
							<CardTitle>Profile Preview</CardTitle>
							<CardDescription>
								This is how your profile appears to others
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="flex items-start gap-4">
								<Avatar className="h-16 w-16">
									<AvatarImage
										src={profile.image || undefined}
										alt={profile.name}
									/>
									<AvatarFallback className="text-lg">
										{profile.name
											.split(" ")
											.map((n) => n[0])
											.join("")
											.slice(0, 2)}
									</AvatarFallback>
								</Avatar>
								<div className="flex-1">
									<h3 className="font-semibold text-lg">{profile.name}</h3>
									<p className="text-muted-foreground">@{profile.username}</p>
									{profile.bio && <p className="mt-2 text-sm">{profile.bio}</p>}
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Profile Form */}
					<Card>
						<CardHeader>
							<CardTitle>Edit Profile</CardTitle>
							<CardDescription>
								Update your public profile information
							</CardDescription>
						</CardHeader>
						<CardContent>
							<ProfileForm />
						</CardContent>
					</Card>
				</div>
			</div>
		</Container>
	);
}
