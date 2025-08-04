"use client";

import Autoplay from "embla-carousel-autoplay";
import Fade from "embla-carousel-fade";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/features/enhanced-carousel";

interface CollectionCarouselProps {
	children: React.ReactNode[];
	animationType?: "fade" | "scale" | "opacity" | "grow-opacity";
}

export function CollectionCarousel({
	children,
	animationType = "fade",
}: CollectionCarouselProps) {
	const plugins = [];
	let tweenEffect = null;

	if (animationType === "fade") {
		plugins.push(Fade());
	} else if (
		animationType === "scale" ||
		animationType === "opacity" ||
		animationType === "grow-opacity"
	) {
		tweenEffect = animationType;
	}

	plugins.push(Autoplay({ delay: 4000, stopOnInteraction: true }));

	return (
		<Carousel
			opts={{
				align: "start",
				loop: true,
			}}
			plugins={plugins}
			tweenEffect={tweenEffect}
			className="w-full"
		>
			<CarouselContent className="-ml-2 md:-ml-4">
				{children.map((child, index) => (
					<CarouselItem
						key={index}
						className="pl-2 md:basis-1/2 md:pl-4 lg:basis-1/3"
					>
						{child}
					</CarouselItem>
				))}
			</CarouselContent>
			<CarouselPrevious className="hidden md:flex" />
			<CarouselNext className="hidden md:flex" />
		</Carousel>
	);
}
