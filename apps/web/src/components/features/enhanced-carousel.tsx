"use client";

import useEmblaCarousel, {
	type UseEmblaCarouselType,
} from "embla-carousel-react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type {
	EmblaCarouselType,
	EmblaEventType,
} from "embla-carousel";

type CarouselApi = UseEmblaCarouselType[1];
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];

type TweenEffect = "scale" | "opacity" | "grow-opacity" | null;

type CarouselProps = {
	opts?: CarouselOptions;
	plugins?: CarouselPlugin;
	orientation?: "horizontal" | "vertical";
	setApi?: (api: CarouselApi) => void;
	tweenEffect?: TweenEffect;
	pauseOnHover?: boolean;
};

type CarouselContextProps = {
	carouselRef: ReturnType<typeof useEmblaCarousel>[0];
	api: ReturnType<typeof useEmblaCarousel>[1];
	scrollPrev: () => void;
	scrollNext: () => void;
	canScrollPrev: boolean;
	canScrollNext: boolean;
} & CarouselProps;

type CarouselState = {
	isHovered: boolean;
	isAutoplayPaused: boolean;
};

const CarouselContext = React.createContext<CarouselContextProps | null>(null);

function useCarousel() {
	const context = React.useContext(CarouselContext);

	if (!context) {
		throw new Error("useCarousel must be used within a <Carousel />");
	}

	return context;
}

const TWEEN_FACTOR_BASE_SCALE = 0.2;
const TWEEN_FACTOR_BASE_OPACITY = 0.84;

const numberWithinRange = (number: number, min: number, max: number): number =>
	Math.min(Math.max(number, min), max);

function Carousel({
	orientation = "horizontal",
	opts,
	setApi,
	plugins,
	tweenEffect,
	pauseOnHover = true,
	className,
	children,
	...props
}: React.ComponentProps<"div"> & CarouselProps) {
	const [carouselRef, api] = useEmblaCarousel(
		{
			...opts,
			axis: orientation === "horizontal" ? "x" : "y",
		},
		plugins,
	);
	const [canScrollPrev, setCanScrollPrev] = React.useState(false);
	const [canScrollNext, setCanScrollNext] = React.useState(false);
	const [isHovered, setIsHovered] = React.useState(false);
	const tweenFactor = React.useRef(0);
	const tweenNodes = React.useRef<HTMLElement[]>([]);

	const setTweenNodes = React.useCallback((emblaApi: EmblaCarouselType): void => {
		tweenNodes.current = emblaApi.slideNodes().map((slideNode) => {
			const firstChild = slideNode.firstElementChild;
			if (!firstChild || !(firstChild instanceof HTMLElement)) {
				console.warn('Slide node missing HTMLElement child');
				return slideNode as HTMLElement; // fallback to the slide node itself
			}
			return firstChild;
		});
	}, []);

	const setTweenFactorScale = React.useCallback((emblaApi: EmblaCarouselType) => {
		tweenFactor.current = TWEEN_FACTOR_BASE_SCALE * emblaApi.scrollSnapList().length;
	}, []);

	const setTweenFactorOpacity = React.useCallback((emblaApi: EmblaCarouselType) => {
		tweenFactor.current = TWEEN_FACTOR_BASE_OPACITY * emblaApi.scrollSnapList().length;
	}, []);

	const tweenScale = React.useCallback(
		(emblaApi: EmblaCarouselType, eventName?: EmblaEventType) => {
			const engine = emblaApi.internalEngine();
			const scrollProgress = emblaApi.scrollProgress();
			const slidesInView = emblaApi.slidesInView();
			const isScrollEvent = eventName === 'scroll';

			emblaApi.scrollSnapList().forEach((scrollSnap, snapIndex) => {
				let diffToTarget = scrollSnap - scrollProgress;
				const slidesInSnap = engine.slideRegistry[snapIndex];

				slidesInSnap.forEach((slideIndex) => {
					if (isScrollEvent && !slidesInView.includes(slideIndex)) return;

					if (engine.options.loop) {
						engine.slideLooper.loopPoints.forEach((loopItem) => {
							const target = loopItem.target();

							if (slideIndex === loopItem.index && target !== 0) {
								const sign = Math.sign(target);

								if (sign === -1) {
									diffToTarget = scrollSnap - (1 + scrollProgress);
								}
								if (sign === 1) {
									diffToTarget = scrollSnap + (1 - scrollProgress);
								}
							}
						});
					}

					const tweenValue = 1 - Math.abs(diffToTarget * tweenFactor.current);
					const scale = numberWithinRange(tweenValue, 0, 1).toString();
					const tweenNode = tweenNodes.current[slideIndex];
					tweenNode.style.transform = `scale(${scale})`;
				});
			});
		},
		[]
	);

	const tweenOpacity = React.useCallback(
		(emblaApi: EmblaCarouselType, eventName?: EmblaEventType) => {
			const engine = emblaApi.internalEngine();
			const scrollProgress = emblaApi.scrollProgress();
			const slidesInView = emblaApi.slidesInView();
			const isScrollEvent = eventName === 'scroll';

			emblaApi.scrollSnapList().forEach((scrollSnap, snapIndex) => {
				let diffToTarget = scrollSnap - scrollProgress;
				const slidesInSnap = engine.slideRegistry[snapIndex];

				slidesInSnap.forEach((slideIndex) => {
					if (isScrollEvent && !slidesInView.includes(slideIndex)) return;

					if (engine.options.loop) {
						engine.slideLooper.loopPoints.forEach((loopItem) => {
							const target = loopItem.target();

							if (slideIndex === loopItem.index && target !== 0) {
								const sign = Math.sign(target);

								if (sign === -1) {
									diffToTarget = scrollSnap - (1 + scrollProgress);
								}
								if (sign === 1) {
									diffToTarget = scrollSnap + (1 - scrollProgress);
								}
							}
						});
					}

					const tweenValue = 1 - Math.abs(diffToTarget * tweenFactor.current);
					const opacity = numberWithinRange(tweenValue, 0, 1).toString();
					emblaApi.slideNodes()[slideIndex].style.opacity = opacity;
				});
			});
		},
		[]
	);

	const tweenGrowOpacity = React.useCallback(
		(emblaApi: EmblaCarouselType, eventName?: EmblaEventType) => {
			const engine = emblaApi.internalEngine();
			const scrollProgress = emblaApi.scrollProgress();
			const slidesInView = emblaApi.slidesInView();
			const isScrollEvent = eventName === 'scroll';

			emblaApi.scrollSnapList().forEach((scrollSnap, snapIndex) => {
				let diffToTarget = scrollSnap - scrollProgress;
				const slidesInSnap = engine.slideRegistry[snapIndex];

				slidesInSnap.forEach((slideIndex) => {
					if (isScrollEvent && !slidesInView.includes(slideIndex)) return;

					if (engine.options.loop) {
						engine.slideLooper.loopPoints.forEach((loopItem) => {
							const target = loopItem.target();

							if (slideIndex === loopItem.index && target !== 0) {
								const sign = Math.sign(target);

								if (sign === -1) {
									diffToTarget = scrollSnap - (1 + scrollProgress);
								}
								if (sign === 1) {
									diffToTarget = scrollSnap + (1 - scrollProgress);
								}
							}
						});
					}

					const tweenValue = 1 - Math.abs(diffToTarget * tweenFactor.current);
					const scale = numberWithinRange(tweenValue, 0, 1).toString();
					const opacity = numberWithinRange(tweenValue, 0, 1).toString();
					
					const tweenNode = tweenNodes.current[slideIndex];
					const slideNode = emblaApi.slideNodes()[slideIndex];
					
					tweenNode.style.transform = `scale(${scale})`;
					slideNode.style.opacity = opacity;
				});
			});
		},
		[]
	);

	const onSelect = React.useCallback((api: CarouselApi) => {
		if (!api) return;
		setCanScrollPrev(api.canScrollPrev());
		setCanScrollNext(api.canScrollNext());
	}, []);

	const scrollPrev = React.useCallback(() => {
		api?.scrollPrev();
	}, [api]);

	const scrollNext = React.useCallback(() => {
		api?.scrollNext();
	}, [api]);

	const handleKeyDown = React.useCallback(
		(event: React.KeyboardEvent<HTMLDivElement>) => {
			if (orientation === "horizontal") {
				if (event.key === "ArrowLeft") {
					event.preventDefault();
					scrollPrev();
				} else if (event.key === "ArrowRight") {
					event.preventDefault();
					scrollNext();
				}
			} else {
				if (event.key === "ArrowUp") {
					event.preventDefault();
					scrollPrev();
				} else if (event.key === "ArrowDown") {
					event.preventDefault();
					scrollNext();
				}
			}
		},
		[orientation, scrollPrev, scrollNext],
	);

	const handleMouseEnter = React.useCallback(() => {
		setIsHovered(true);
		if (pauseOnHover && api) {
			const autoplayPlugin = plugins?.find(plugin => plugin.name === 'autoplay');
			if (autoplayPlugin && 'stop' in autoplayPlugin) {
				(autoplayPlugin as any).stop();
			}
		}
	}, [pauseOnHover, api, plugins]);

	const handleMouseLeave = React.useCallback(() => {
		setIsHovered(false);
		if (pauseOnHover && api) {
			const autoplayPlugin = plugins?.find(plugin => plugin.name === 'autoplay');
			if (autoplayPlugin && 'play' in autoplayPlugin) {
				(autoplayPlugin as any).play();
			}
		}
	}, [pauseOnHover, api, plugins]);

	React.useEffect(() => {
		if (!api || !setApi) return;
		setApi(api);
	}, [api, setApi]);

	React.useEffect(() => {
		if (!api) return;
		onSelect(api);
		api.on("reInit", onSelect);
		api.on("select", onSelect);

		return () => {
			api?.off("reInit", onSelect);
			api?.off("select", onSelect);
		};
	}, [api, onSelect]);

	React.useEffect(() => {
		if (!api || !tweenEffect) return;

		if (tweenEffect === "scale") {
			setTweenNodes(api);
			setTweenFactorScale(api);
			tweenScale(api);

			api
				.on('reInit', setTweenNodes)
				.on('reInit', setTweenFactorScale)
				.on('reInit', tweenScale)
				.on('scroll', tweenScale)
				.on('slideFocus', tweenScale);

			return () => {
				api?.off('reInit', setTweenNodes);
				api?.off('reInit', setTweenFactorScale);
				api?.off('reInit', tweenScale);
				api?.off('scroll', tweenScale);
				api?.off('slideFocus', tweenScale);
			};
		} else if (tweenEffect === "opacity") {
			setTweenFactorOpacity(api);
			tweenOpacity(api);

			api
				.on('reInit', setTweenFactorOpacity)
				.on('reInit', tweenOpacity)
				.on('scroll', tweenOpacity)
				.on('slideFocus', tweenOpacity);

			return () => {
				api?.off('reInit', setTweenFactorOpacity);
				api?.off('reInit', tweenOpacity);
				api?.off('scroll', tweenOpacity);
				api?.off('slideFocus', tweenOpacity);
			};
		} else if (tweenEffect === "grow-opacity") {
			setTweenNodes(api);
			setTweenFactorScale(api);
			tweenGrowOpacity(api);

			api
				.on('reInit', setTweenNodes)
				.on('reInit', setTweenFactorScale)
				.on('reInit', tweenGrowOpacity)
				.on('scroll', tweenGrowOpacity)
				.on('slideFocus', tweenGrowOpacity);

			return () => {
				api?.off('reInit', setTweenNodes);
				api?.off('reInit', setTweenFactorScale);
				api?.off('reInit', tweenGrowOpacity);
				api?.off('scroll', tweenGrowOpacity);
				api?.off('slideFocus', tweenGrowOpacity);
			};
		}
	}, [api, tweenEffect, setTweenNodes, setTweenFactorScale, setTweenFactorOpacity, tweenScale, tweenOpacity, tweenGrowOpacity]);

	return (
		<CarouselContext.Provider
			value={{
				carouselRef,
				api: api,
				opts,
				orientation:
					orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
				scrollPrev,
				scrollNext,
				canScrollPrev,
				canScrollNext,
				tweenEffect,
			}}
		>
			<div
				onKeyDownCapture={handleKeyDown}
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
				className={cn("relative", className)}
				role="region"
				aria-roledescription="carousel"
				data-slot="carousel"
				{...props}
			>
				{children}
			</div>
		</CarouselContext.Provider>
	);
}

function CarouselContent({ className, ...props }: React.ComponentProps<"div">) {
	const { carouselRef, orientation } = useCarousel();

	return (
		<div
			ref={carouselRef}
			className="overflow-hidden"
			data-slot="carousel-content"
		>
			<div
				className={cn(
					"flex",
					orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
					className,
				)}
				{...props}
			/>
		</div>
	);
}

function CarouselItem({ className, ...props }: React.ComponentProps<"div">) {
	const { orientation } = useCarousel();

	return (
		<div
			role="group"
			aria-roledescription="slide"
			data-slot="carousel-item"
			className={cn(
				"min-w-0 shrink-0 grow-0 basis-full",
				orientation === "horizontal" ? "pl-4" : "pt-4",
				className,
			)}
			{...props}
		/>
	);
}

function CarouselPrevious({
	className,
	variant = "outline",
	size = "icon",
	...props
}: React.ComponentProps<typeof Button>) {
	const { orientation, scrollPrev, canScrollPrev } = useCarousel();

	return (
		<Button
			data-slot="carousel-previous"
			variant={variant}
			size={size}
			className={cn(
				"absolute size-8 rounded-full",
				orientation === "horizontal"
					? "-left-12 -translate-y-1/2 top-1/2"
					: "-top-12 -translate-x-1/2 left-1/2 rotate-90",
				className,
			)}
			disabled={!canScrollPrev}
			onClick={scrollPrev}
			{...props}
		>
			<ArrowLeft />
			<span className="sr-only">Previous slide</span>
		</Button>
	);
}

function CarouselNext({
	className,
	variant = "outline",
	size = "icon",
	...props
}: React.ComponentProps<typeof Button>) {
	const { orientation, scrollNext, canScrollNext } = useCarousel();

	return (
		<Button
			data-slot="carousel-next"
			variant={variant}
			size={size}
			className={cn(
				"absolute size-8 rounded-full",
				orientation === "horizontal"
					? "-right-12 -translate-y-1/2 top-1/2"
					: "-bottom-12 -translate-x-1/2 left-1/2 rotate-90",
				className,
			)}
			disabled={!canScrollNext}
			onClick={scrollNext}
			{...props}
		>
			<ArrowRight />
			<span className="sr-only">Next slide</span>
		</Button>
	);
}

export {
	type CarouselApi,
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselPrevious,
	CarouselNext,
};