/** biome-ignore-all lint/suspicious/noArrayIndexKey: <explanation> */
"use client";

import Autoplay from "embla-carousel-autoplay";
import Fade from "embla-carousel-fade";
import {
	ArrowRight,
	Clock,
	type LucideIcon,
	Sparkles,
	TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { ComponentCard } from "@/components/features/component-card";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/features/enhanced-carousel";
import { ToolCard } from "@/components/features/tool-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type AnimationType = "fade" | "scale" | "opacity" | "grow-opacity";

interface CollectionSectionProps {
	title: string;
	items?: any[];
	isLoading: boolean;
	viewAllLink: string;
	itemType: "component" | "tool";
	layout: "carousel" | "grid";
	emptyMessage?: string;
	skeletonCount?: number;
	animationType?: AnimationType;
}

export function CollectionSection({
	title,
	items = [],
	isLoading,
	viewAllLink,
	itemType,
	layout = "carousel",
	emptyMessage,
	skeletonCount = 4,
	animationType = "scale",
}: CollectionSectionProps) {
	// Hardcode the icons based on title
	const Icon = title.includes("Latest")
		? Clock
		: title.includes("Popular")
			? TrendingUp
			: Sparkles;
	const renderSkeleton = () => {
		if (layout === "grid") {
			return (
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					{Array.from({ length: skeletonCount }).map((_, i) => (
						<div key={i} className="space-y-3">
							<Skeleton className="h-[200px] w-full rounded-xl" />
							<div className="space-y-2">
								<Skeleton className="h-4 w-[250px]" />
								<Skeleton className="h-4 w-[200px]" />
							</div>
						</div>
					))}
				</div>
			);
		}

		return (
			<div className="flex gap-4 overflow-hidden">
				{Array.from({ length: skeletonCount }).map((_, i) => (
					<div key={i} className="min-w-[300px] space-y-3">
						<Skeleton className="h-[200px] w-full rounded-xl" />
						<div className="space-y-2">
							<Skeleton className="h-4 w-[250px]" />
							<Skeleton className="h-4 w-[200px]" />
						</div>
					</div>
				))}
			</div>
		);
	};

	const renderItems = () => {
		if (layout === "grid") {
			return (
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					{items.map((item) => {
						if (itemType === "component") {
							return (
								<ComponentCard
									key={item.id}
									{...item}
									createdAt={item.createdAt?.toISOString?.() || item.createdAt}
									updatedAt={item.updatedAt?.toISOString?.() || item.updatedAt}
									disableHoverEffects={false}
								/>
							);
						}
						return (
							<ToolCard key={item.id} {...item} disableHoverEffects={false} />
						);
					})}
				</div>
			);
		}

		const plugins = [
			Autoplay({
				delay: 10000,
				stopOnInteraction: false,
				stopOnMouseEnter: true,
			}),
			...(animationType === "fade" ? [Fade()] : []),
		];

		const tweenEffect =
			animationType === "scale" ||
			animationType === "opacity" ||
			animationType === "grow-opacity"
				? animationType
				: null;

		return (
			<Carousel
				opts={{
					align: "center",
					loop: true,
					slidesToScroll: 1,
				}}
				className="w-full"
				plugins={plugins}
				tweenEffect={tweenEffect}
			>
				<CarouselContent className="-ml-2 md:-ml-4">
					{items.map((item) => (
						<CarouselItem
							key={item.id}
							className="pl-2 md:basis-1/2 md:pl-4 lg:basis-1/3"
						>
							{itemType === "component" ? (
								<ComponentCard
									{...item}
									createdAt={item.createdAt?.toISOString?.() || item.createdAt}
									updatedAt={item.updatedAt?.toISOString?.() || item.updatedAt}
									disableHoverEffects={true}
								/>
							) : (
								<ToolCard {...item} disableHoverEffects={true} />
							)}
						</CarouselItem>
					))}
				</CarouselContent>
				<CarouselPrevious />
				<CarouselNext />
			</Carousel>
		);
	};

	return (
		<section className="relative mb-20">
			<div className="mb-8 flex items-center justify-between">
				<div className="flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
						<Icon className="h-5 w-5 text-primary" />
					</div>
					<div>
						<h2 className="font-bold text-2xl tracking-tight">{title}</h2>
					</div>
				</div>
				<Button asChild variant="ghost" className="group">
					<Link href={viewAllLink}>
						View all
						<ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
					</Link>
				</Button>
			</div>

			{isLoading ? (
				renderSkeleton()
			) : items.length === 0 ? (
				<div className="py-12 text-center">
					<p className="text-muted-foreground">
						{emptyMessage || "No items to display."}
					</p>
				</div>
			) : (
				renderItems()
			)}
		</section>
	);
}
