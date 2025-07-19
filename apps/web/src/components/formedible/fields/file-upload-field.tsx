import { PaperclipIcon, UploadCloudIcon, XIcon } from "lucide-react";
import type React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { BaseFieldProps } from "@/lib/formedible/types";
import { cn } from "@/lib/utils";
import { FieldWrapper } from "./base-field-wrapper";

interface FileUploadFieldSpecificProps extends BaseFieldProps {
	accept?: string;
	className?: string;
}

export const FileUploadField: React.FC<FileUploadFieldSpecificProps> = ({
	fieldApi,
	label,
	description,
	placeholder,
	inputClassName,
	labelClassName,
	wrapperClassName,
	accept,
	className,
}) => {
	const name = fieldApi.name;
	const isDisabled = fieldApi.form?.state?.isSubmitting ?? false;
	const hasErrors =
		fieldApi.state?.meta?.isTouched && fieldApi.state?.meta?.errors?.length > 0;

	const file = fieldApi.state?.value as File | null;

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = e.target.files?.[0] ?? null;
		fieldApi.handleChange(selectedFile);
		fieldApi.handleBlur();
	};

	const handleRemoveFile = () => {
		fieldApi.handleChange(null);
		const inputElement = document.getElementById(name) as HTMLInputElement;
		if (inputElement) {
			inputElement.value = "";
		}
		fieldApi.handleBlur();
	};

	const triggerFileInput = () => {
		const inputElement = document.getElementById(name) as HTMLInputElement;
		inputElement?.click();
	};

	return (
		<FieldWrapper
			fieldApi={fieldApi}
			label={label}
			description={description}
			inputClassName={inputClassName}
			labelClassName={labelClassName}
			wrapperClassName={wrapperClassName}
		>
			<div className="space-y-1.5">
				<Input
					id={name}
					name={name}
					type="file"
					accept={accept}
					onChange={handleFileChange}
					className="hidden"
					disabled={isDisabled}
				/>
				{file ? (
					<div className="flex items-center justify-between rounded-lg border bg-muted/40 p-2.5 shadow-sm transition-shadow hover:shadow-md">
						<div className="flex items-center gap-2 overflow-hidden text-sm">
							<PaperclipIcon className="h-5 w-5 shrink-0 text-primary" />
							<span className="truncate" title={file.name}>
								{file.name}
							</span>
							<span className="whitespace-nowrap text-muted-foreground text-xs">
								({(file.size / 1024).toFixed(1)} KB)
							</span>
						</div>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							onClick={handleRemoveFile}
							className="h-7 w-7 shrink-0 text-destructive hover:bg-destructive/10"
							aria-label="Remove file"
							disabled={isDisabled}
						>
							<XIcon className="h-4 w-4" />
						</Button>
					</div>
				) : (
					<button
						type="button"
						onClick={triggerFileInput}
						className={cn(
							"flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed bg-background p-4 transition-colors hover:border-primary hover:bg-muted/50",
							className,
							hasErrors
								? "border-destructive hover:border-destructive"
								: "border-muted-foreground/50",
							isDisabled && "cursor-not-allowed opacity-50",
						)}
						disabled={isDisabled}
					>
						<UploadCloudIcon className="mb-2 h-8 w-8 text-muted-foreground" />
						<span className="font-medium text-muted-foreground text-sm">
							Click or drag and drop a file
						</span>
						{accept && (
							<span className="mt-1 text-muted-foreground/80 text-xs">
								Accepted types: {accept}
							</span>
						)}
					</button>
				)}
			</div>
		</FieldWrapper>
	);
};
