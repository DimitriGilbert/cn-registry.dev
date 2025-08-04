"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "./button";

export function BackButton() {
	return (
		<Button
			variant="ghost"
			className="w-full"
			onClick={() => window.history.back()}
		>
			<span className="flex items-center">
				<ArrowLeft className="mr-2 h-4 w-4" />
				Go Back
			</span>
		</Button>
	);
}
