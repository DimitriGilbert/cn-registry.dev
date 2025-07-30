/** biome-ignore-all lint/suspicious/noArrayIndexKey: <explanation> */
"use client";

import Autoplay from "embla-carousel-autoplay";
import Fade from "embla-carousel-fade";
import { ArrowRight, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { ComponentCard } from "@/components/features/component-card";
import { ToolCard } from "@/components/features/tool-card";
import { Button } from "@/components/ui/button";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/features/enhanced-carousel";
import { Skeleton } from "@/components/ui/skeleton";

type AnimationType = "default" | "fade" | "scale" | "opacity";

interface CollectionSectionProps {
	title: string;
	icon: LucideIcon;
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
	icon: Icon,
	items = [],
	isLoading,
	viewAllLink,
	itemType,
	layout = "carousel",
	emptyMessage,
	skeletonCount = 4,
	animationType = "default",
}: CollectionSectionProps) {
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
							return <ComponentCard key={item.id} {...item} disableHoverEffects={false} />;
						}
						return <ToolCard key={item.id} {...item} disableHoverEffects={false} />;
					})}
				</div>
			);
		}


		const plugins = [
			Autoplay({
				delay: 5000,
			}),
			...(animationType === "fade" ? [Fade()] : []),
		];

		const tweenEffect = animationType === "scale" || animationType === "opacity" ? animationType : null;

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
								<ComponentCard {...item} disableHoverEffects={true} />
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

	const renderEmptyState = () => (
		<div className="py-12 text-center">
			<p className="text-muted-foreground">
				{emptyMessage || `No ${itemType}s available yet.`}
			</p>
			<Button variant="outline" className="mt-4" asChild>
				<Link href={viewAllLink}>
					Browse {itemType === "component" ? "Components" : "Tools"}
				</Link>
			</Button>
		</div>
	);

	return (
		<section className="mb-16">
			<div className="mb-6 flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Icon className="h-5 w-5 text-primary" />
					<h2 className="font-bold text-2xl">{title}</h2>
				</div>
				<Button variant="outline" asChild>
					<Link href={viewAllLink}>
						<span className="flex items-center gap-2">
							View All
							<ArrowRight className="h-4 w-4" />
						</span>
					</Link>
				</Button>
			</div>

			{isLoading
				? renderSkeleton()
				: items.length > 0
					? renderItems()
					: renderEmptyState()}
		</section>
	);
}
