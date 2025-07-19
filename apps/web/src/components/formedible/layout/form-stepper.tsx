"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Step {
	id: string;
	title: string;
	description?: string;
	content: React.ReactNode;
	optional?: boolean;
}

interface FormStepperProps {
	children?: React.ReactNode;
	steps: Step[];
	currentStep?: number;
	onStepChange?: (stepIndex: number) => void;
	onComplete?: () => void;
	className?: string;
	allowSkip?: boolean;
	showStepNumbers?: boolean;
}

export const FormStepper: React.FC<FormStepperProps> = ({
	children,
	steps,
	currentStep = 0,
	onStepChange,
	onComplete,
	className,
	allowSkip = false,
	showStepNumbers = true,
}) => {
	const [activeStep, setActiveStep] = useState(currentStep);
	const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

	const handleStepChange = (stepIndex: number) => {
		setActiveStep(stepIndex);
		onStepChange?.(stepIndex);
	};

	const markStepComplete = (stepIndex: number) => {
		setCompletedSteps((prev) => new Set(prev).add(stepIndex));
	};

	const handleNext = () => {
		// Mark current step as completed when moving to next
		markStepComplete(activeStep);

		if (activeStep < steps.length - 1) {
			handleStepChange(activeStep + 1);
		} else {
			onComplete?.();
		}
	};

	const handlePrevious = () => {
		if (activeStep > 0) {
			handleStepChange(activeStep - 1);
		}
	};

	const handleSkip = () => {
		if (allowSkip && steps[activeStep]?.optional) {
			handleNext();
		}
	};

	const canGoToStep = (stepIndex: number) => {
		// Can go to current step, previous steps, or next step if current is completed
		return stepIndex <= activeStep || completedSteps.has(stepIndex - 1);
	};

	const isStepCompleted = (stepIndex: number) => {
		return completedSteps.has(stepIndex);
	};

	const isStepActive = (stepIndex: number) => {
		return stepIndex === activeStep;
	};

	return (
		<div className={cn("space-y-6", className)}>
			{children}

			{/* Step indicator */}
			<div className="flex items-center justify-between">
				{steps.map((step, index) => (
					<React.Fragment key={step.id}>
						<div className="flex flex-col items-center">
							<button
								type="button"
								onClick={() => canGoToStep(index) && handleStepChange(index)}
								disabled={!canGoToStep(index)}
								aria-label={`Go to step ${index + 1}: ${step.title}`}
								aria-current={isStepActive(index) ? "step" : undefined}
								tabIndex={canGoToStep(index) ? 0 : -1}
								className={cn(
									"flex h-10 w-10 items-center justify-center rounded-full border-2 font-medium text-sm transition-colors",
									isStepActive(index) &&
										"border-primary bg-primary text-primary-foreground",
									isStepCompleted(index) &&
										!isStepActive(index) &&
										"border-primary bg-primary text-primary-foreground",
									!isStepActive(index) &&
										!isStepCompleted(index) &&
										"border-muted-foreground text-muted-foreground",
									canGoToStep(index) && "cursor-pointer hover:border-primary",
									!canGoToStep(index) && "cursor-not-allowed opacity-50",
								)}
							>
								{isStepCompleted(index)
									? "✓"
									: showStepNumbers
										? index + 1
										: "○"}
							</button>

							<div className="mt-2 text-center">
								<div
									className={cn(
										"font-medium text-sm",
										isStepActive(index) && "text-primary",
										!isStepActive(index) && "text-muted-foreground",
									)}
								>
									{step.title}
									{step.optional && (
										<span className="ml-1 text-muted-foreground text-xs">
											(optional)
										</span>
									)}
								</div>
								{step.description && (
									<div className="mt-1 text-muted-foreground text-xs">
										{step.description}
									</div>
								)}
							</div>
						</div>

						{/* Connector line */}
						{index < steps.length - 1 && (
							<div
								className={cn(
									"mx-4 h-0.5 flex-1",
									isStepCompleted(index) ? "bg-primary" : "bg-muted",
								)}
							/>
						)}
					</React.Fragment>
				))}
			</div>

			{/* Step content */}
			<div className="min-h-[200px]">{steps[activeStep]?.content}</div>

			{/* Navigation buttons */}
			<div className="flex justify-between">
				<Button
					type="button"
					variant="outline"
					onClick={handlePrevious}
					disabled={activeStep === 0}
				>
					Previous
				</Button>

				<div className="flex gap-2">
					{allowSkip && steps[activeStep]?.optional && (
						<Button type="button" variant="ghost" onClick={handleSkip}>
							Skip
						</Button>
					)}

					<Button type="button" onClick={handleNext}>
						{activeStep === steps.length - 1 ? "Complete" : "Next"}
					</Button>
				</div>
			</div>
		</div>
	);
};
