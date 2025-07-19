"use client";

import { GripVertical, Plus, Trash2 } from "lucide-react";
import type React from "react";
import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import type { BaseFieldProps } from "@/lib/formedible/types";
import { FieldWrapper } from "./base-field-wrapper";
import { CheckboxField } from "./checkbox-field";
import { DateField } from "./date-field";
import { FileUploadField } from "./file-upload-field";
import { NumberField } from "./number-field";
import { ObjectField } from "./object-field";
import { SelectField } from "./select-field";
import { SliderField } from "./slider-field";
import { SwitchField } from "./switch-field";
import { TextField } from "./text-field";
import { TextareaField } from "./textarea-field";

// Map of field types to components
const fieldTypeComponents: Record<string, React.ComponentType<any>> = {
	text: TextField,
	email: TextField,
	password: TextField,
	url: TextField,
	tel: TextField,
	number: NumberField,
	textarea: TextareaField,
	select: SelectField,
	checkbox: CheckboxField,
	switch: SwitchField,
	date: DateField,
	slider: SliderField,
	file: FileUploadField,
	object: ObjectField,
};

export interface ArrayFieldSpecificProps extends BaseFieldProps {
	arrayConfig: {
		itemType: string;
		itemLabel?: string;
		itemPlaceholder?: string;
		itemValidation?: unknown;
		minItems?: number;
		maxItems?: number;
		addButtonLabel?: string;
		removeButtonLabel?: string;
		itemComponent?: React.ComponentType<any>;
		sortable?: boolean;
		defaultValue?: unknown;
		// Additional props to pass to item components
		itemProps?: Record<string, unknown>;
		// Object field configuration (when itemType is "object")
		objectConfig?: {
			title?: string;
			description?: string;
			fields: Array<{
				name: string;
				type: string;
				label?: string;
				placeholder?: string;
				description?: string;
				options?: Array<{ value: string; label: string }>;
				min?: number;
				max?: number;
				step?: number;
				[key: string]: unknown;
			}>;
			collapsible?: boolean;
			defaultExpanded?: boolean;
			showCard?: boolean;
			layout?: "vertical" | "horizontal" | "grid";
			columns?: number;
		};
	};
}

export const ArrayField: React.FC<ArrayFieldSpecificProps> = ({
	fieldApi,
	label,
	description,
	placeholder,
	inputClassName,
	labelClassName,
	wrapperClassName,
	arrayConfig,
}) => {
	const name = fieldApi.name;
	const isDisabled = fieldApi.form?.state?.isSubmitting ?? false;

	const value = useMemo(
		() => (fieldApi.state?.value as unknown[]) || [],
		[fieldApi.state?.value],
	);

	const {
		itemType,
		itemLabel,
		itemPlaceholder,
		minItems = 0,
		maxItems = 10,
		addButtonLabel = "Add Item",
		removeButtonLabel = "Remove",
		itemComponent: CustomItemComponent,
		sortable = false,
		defaultValue = "",
		itemProps = {},
		objectConfig,
	} = arrayConfig || {};

	// Get the component for rendering items
	const ItemComponent =
		CustomItemComponent || fieldTypeComponents[itemType || "text"] || TextField;

	const addItem = useCallback(() => {
		if (value.length >= maxItems) return;

		const newValue = [...value, defaultValue];
		fieldApi.handleChange(newValue);
	}, [value, maxItems, defaultValue, fieldApi]);

	const removeItem = useCallback(
		(index: number) => {
			if (value.length <= minItems) return;

			const newValue = value.filter((_, i) => i !== index);
			fieldApi.handleChange(newValue);
			fieldApi.handleBlur();
		},
		[value, minItems, fieldApi],
	);

	const updateItem = useCallback(
		(index: number, newItemValue: unknown) => {
			const newValue = [...value];
			newValue[index] = newItemValue;
			fieldApi.handleChange(newValue);
		},
		[value, fieldApi],
	);

	const moveItem = useCallback(
		(fromIndex: number, toIndex: number) => {
			if (!sortable) return;
			if (fromIndex === toIndex) return;

			const newValue = [...value];
			const [movedItem] = newValue.splice(fromIndex, 1);
			newValue.splice(toIndex, 0, movedItem);
			fieldApi.handleChange(newValue);
		},
		[value, fieldApi, sortable],
	);

	const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

	// Create a mock field API for each item
	const createItemFieldApi = useCallback(
		(index: number) => {
			return {
				name: `${name}[${index}]`,
				state: {
					value: value[index],
					meta: {
						errors: [],
						isTouched: false,
						isValidating: false,
					},
				},
				handleChange: (newValue: unknown) => updateItem(index, newValue),
				handleBlur: () => fieldApi.handleBlur(),
				form: fieldApi.form,
			};
		},
		[name, value, updateItem, fieldApi],
	);

	const canAddMore = value.length < maxItems;
	const canRemove = value.length > minItems;

	return (
		<FieldWrapper
			fieldApi={fieldApi}
			label={label}
			description={description}
			inputClassName={inputClassName}
			labelClassName={labelClassName}
			wrapperClassName={wrapperClassName}
		>
			<div className="space-y-4">
				<div className="space-y-3">
					{value.map((_, index) => (
						<div
							key={index}
							className="flex items-start gap-2 rounded-lg border bg-card p-3"
							onDragOver={
								sortable
									? (e) => {
											e.preventDefault();
											e.dataTransfer.dropEffect = "move";
										}
									: undefined
							}
							onDrop={
								sortable
									? (e) => {
											e.preventDefault();
											if (draggedIndex !== null && draggedIndex !== index) {
												moveItem(draggedIndex, index);
											}
										}
									: undefined
							}
						>
							{sortable && (
								<button
									type="button"
									className="mt-2 cursor-grab rounded p-1 hover:bg-muted active:cursor-grabbing"
									draggable
									onDragStart={(e) => {
										setDraggedIndex(index);
										e.dataTransfer.effectAllowed = "move";
									}}
									onDragEnd={() => {
										setDraggedIndex(null);
									}}
									disabled={isDisabled}
								>
									<GripVertical className="h-4 w-4 text-muted-foreground" />
								</button>
							)}

							<div className="flex-1">
								<ItemComponent
									fieldApi={createItemFieldApi(index)}
									label={itemLabel ? `${itemLabel} ${index + 1}` : undefined}
									placeholder={itemPlaceholder}
									wrapperClassName="mb-0"
									{...itemProps}
									// Pass specific props based on item type
									{...(itemType === "select" && {
										options: itemProps.options || [],
									})}
									{...(itemType === "number" && {
										min: itemProps.min,
										max: itemProps.max,
										step: itemProps.step,
									})}
									{...(itemType === "slider" && {
										min: itemProps.min,
										max: itemProps.max,
										step: itemProps.step,
									})}
									{...(itemType === "file" && {
										accept: itemProps.accept,
										multiple: itemProps.multiple,
									})}
									{...(itemType === "date" &&
									typeof itemProps.dateProps === "object" &&
									itemProps.dateProps
										? itemProps.dateProps
										: {})}
									{...(["text", "email", "password", "url", "tel"].includes(
										itemType,
									) && {
										type: itemType,
										datalist: itemProps.datalist,
									})}
									{...(itemType === "object" &&
										objectConfig && { objectConfig })}
								/>
							</div>

							{canRemove && (
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => removeItem(index)}
									className="mt-2 h-8 w-8 p-0 text-destructive hover:text-destructive"
									title={removeButtonLabel}
									disabled={isDisabled}
								>
									<Trash2 className="h-4 w-4" />
								</Button>
							)}
						</div>
					))}

					{value.length === 0 && (
						<div className="rounded-lg border-2 border-dashed py-8 text-center text-muted-foreground">
							<p className="text-sm">No items added yet</p>
							<p className="mt-1 text-xs">
								Click &quot;{addButtonLabel}&quot; to add your first item
							</p>
						</div>
					)}
				</div>

				{canAddMore && (
					<Button
						type="button"
						variant="outline"
						onClick={addItem}
						className="w-full"
						disabled={isDisabled}
					>
						<Plus className="mr-2 h-4 w-4" />
						{addButtonLabel}
					</Button>
				)}

				{minItems > 0 && value.length < minItems && (
					<p className="text-muted-foreground text-xs">
						Minimum {minItems} item{minItems !== 1 ? "s" : ""} required
					</p>
				)}
			</div>
		</FieldWrapper>
	);
};
