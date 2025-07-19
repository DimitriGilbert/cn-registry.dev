import type React from "react";
import { Slider } from "@/components/ui/slider";
import type { BaseFieldProps } from "@/lib/formedible/types";
import { cn } from "@/lib/utils";
import { FieldWrapper } from "./base-field-wrapper";

export interface SliderFieldSpecificProps extends BaseFieldProps {
	sliderConfig?: {
		min?: number;
		max?: number;
		step?: number;
		// Value mapping between slider value (int) and display value (arbitrary)
		valueMapping?: Array<{
			sliderValue: number;
			displayValue: string | number;
			label?: string;
		}>;
		// Gradient colors for the slider
		gradientColors?: {
			start: string;
			end: string;
			direction?: "horizontal" | "vertical";
		};
		// Custom visualization component for each step
		visualizationComponent?: React.ComponentType<{
			value: number;
			displayValue: string | number;
			label?: string;
			isActive: boolean;
		}>;
		// Legacy support
		valueLabelPrefix?: string;
		valueLabelSuffix?: string;
		valueDisplayPrecision?: number;
		showRawValue?: boolean;
		showValue?: boolean;
		showTooltip?: boolean;
		orientation?: "horizontal" | "vertical";
		marks?: Array<{ value: number; label: string }>;
	};
	// Direct props for backwards compatibility
	min?: number;
	max?: number;
	step?: number;
	valueLabelPrefix?: string;
	valueLabelSuffix?: string;
	valueDisplayPrecision?: number;
	showRawValue?: boolean;
}

export const SliderField: React.FC<SliderFieldSpecificProps> = ({
	fieldApi,
	label,
	description,
	placeholder,
	inputClassName,
	labelClassName,
	wrapperClassName,
	sliderConfig,
	// Backwards compatibility props
	min: directMin = 0,
	max: directMax = 100,
	step: directStep = 1,
	valueLabelPrefix: directPrefix = "",
	valueLabelSuffix: directSuffix = "",
	valueDisplayPrecision: directPrecision = 0,
	showRawValue: directShowRaw = false,
}) => {
	const name = fieldApi.name;
	const isDisabled = fieldApi.form?.state?.isSubmitting ?? false;

	// Use sliderConfig if provided, otherwise use direct props
	const config = sliderConfig || {
		min: directMin,
		max: directMax,
		step: directStep,
		valueLabelPrefix: directPrefix,
		valueLabelSuffix: directSuffix,
		valueDisplayPrecision: directPrecision,
		showRawValue: directShowRaw,
	};

	const {
		min = 0,
		max = 100,
		step = 1,
		valueMapping,
		gradientColors,
		visualizationComponent: VisualizationComponent,
		valueLabelPrefix = "",
		valueLabelSuffix = "",
		valueDisplayPrecision = 0,
		showRawValue = false,
		showValue = true,
		marks = [],
	} = config;

	const fieldValue =
		typeof fieldApi.state?.value === "number" ? fieldApi.state?.value : min;

	// Get display value from mapping or calculate it
	const getDisplayValue = (sliderValue: number) => {
		if (valueMapping) {
			const mapping = valueMapping.find((m) => m.sliderValue === sliderValue);
			return mapping ? mapping.displayValue : sliderValue;
		}
		return sliderValue.toFixed(valueDisplayPrecision);
	};

	const displayValue = getDisplayValue(fieldValue);
	const mappingItem = valueMapping?.find((m) => m.sliderValue === fieldValue);

	const onValueChange = (valueArray: number[]) => {
		const newValue = valueArray[0];
		fieldApi.handleChange(newValue);
	};

	const onBlur = () => {
		fieldApi.handleBlur();
	};

	// Custom label with value display
	const customLabel =
		label && showValue
			? `${label} (${valueLabelPrefix}${displayValue}${valueLabelSuffix})`
			: label;

	// Generate gradient style if configured
	const sliderStyle = gradientColors
		? {
				background: `linear-gradient(${gradientColors.direction === "vertical" ? "to bottom" : "to right"}, ${gradientColors.start}, ${gradientColors.end})`,
			}
		: {};

	return (
		<FieldWrapper
			fieldApi={fieldApi}
			label={customLabel}
			description={description}
			inputClassName={inputClassName}
			labelClassName={labelClassName}
			wrapperClassName={wrapperClassName}
		>
			<div className="space-y-4">
				{showRawValue && (
					<div className="text-muted-foreground text-xs">
						Raw: {fieldApi.state?.value}
					</div>
				)}

				{/* Custom visualization component if provided */}
				{VisualizationComponent && valueMapping && (
					<div className="mb-2 flex items-center justify-between">
						{valueMapping.map((mapping, index) => (
							<VisualizationComponent
								key={index}
								value={mapping.sliderValue}
								displayValue={mapping.displayValue}
								label={mapping.label}
								isActive={fieldValue === mapping.sliderValue}
							/>
						))}
					</div>
				)}

				<div className="relative">
					<Slider
						id={name}
						name={name}
						value={[fieldValue]}
						onValueChange={onValueChange}
						onBlur={onBlur}
						disabled={isDisabled}
						min={min}
						max={max}
						step={step}
						className={cn(inputClassName)}
						style={sliderStyle}
					/>

					{/* Marks display */}
					{marks.length > 0 && (
						<div className="mt-2 flex justify-between text-muted-foreground text-xs">
							{marks.map((mark, index) => (
								<span key={index} className="text-center">
									{mark.label}
								</span>
							))}
						</div>
					)}
				</div>

				{/* Display current mapping info */}
				{mappingItem?.label && (
					<div className="text-center text-muted-foreground text-sm">
						{mappingItem.label}
					</div>
				)}
			</div>
		</FieldWrapper>
	);
};
