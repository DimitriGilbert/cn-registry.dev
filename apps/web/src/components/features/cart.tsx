"use client";

import { useMutation } from "@tanstack/react-query";
import { Download, Save, ShoppingCart, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useCart } from "@/components/providers/cart-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { generateMultipleInstallCommands } from "@/utils/install-command";
import { trpc, trpcClient } from "@/utils/trpc";

interface SaveProjectDialogProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	componentIds: string[];
}

function SaveProjectDialog({
	isOpen,
	onOpenChange,
	componentIds,
}: SaveProjectDialogProps) {
	const [projectName, setProjectName] = useState("");
	const [description, setDescription] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const createProject = useMutation(
		trpc.projects.create.mutationOptions({
			onSuccess: (project) => {
				// Add components to the new project
				addComponents.mutate({
					projectId: project.id,
					componentIds,
				});
			},
			onError: (error) => {
				toast.error(`Failed to create project: ${error.message}`);
				setIsLoading(false);
			},
		}),
	);

	const addComponents = useMutation(
		trpc.projects.addComponents.mutationOptions({
			onSuccess: (result: { added: number; skipped: number }) => {
				toast.success(`Project created with ${result.added} components!`);
				onOpenChange(false);
				setProjectName("");
				setDescription("");
				setIsLoading(false);
			},
			onError: (error) => {
				toast.error(`Failed to add components: ${error.message}`);
				setIsLoading(false);
			},
		}),
	);

	const handleSave = () => {
		if (!projectName.trim()) {
			toast.error("Project name is required");
			return;
		}

		setIsLoading(true);
		const slug = projectName
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-+|-+$/g, "");

		createProject.mutate({
			name: projectName,
			description: description || undefined,
			slug,
			visibility: "private",
		});
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
			<Card className="mx-4 w-full max-w-md p-6">
				<h3 className="mb-4 font-semibold text-lg">Save as Project</h3>
				<div className="space-y-4">
					<div>
						<label
							htmlFor="projectName"
							className="mb-1 block font-medium text-sm"
						>
							Project Name
						</label>
						<input
							id="projectName"
							type="text"
							value={projectName}
							onChange={(e) => setProjectName(e.target.value)}
							placeholder="My Component Library"
							className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
							disabled={isLoading}
						/>
					</div>
					<div>
						<label
							htmlFor="description"
							className="mb-1 block font-medium text-sm"
						>
							Description (optional)
						</label>
						<textarea
							id="description"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="A collection of components for my project"
							rows={3}
							className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
							disabled={isLoading}
						/>
					</div>
					<div className="flex justify-end space-x-2">
						<Button
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={isLoading}
						>
							Cancel
						</Button>
						<Button onClick={handleSave} disabled={isLoading}>
							{isLoading ? "Saving..." : "Save Project"}
						</Button>
					</div>
				</div>
			</Card>
		</div>
	);
}

export function CartButton() {
	const { cart, getCartTotal } = useCart();
	const [isOpen, setIsOpen] = useState(false);

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				<Button variant="outline" size="icon" className="relative">
					<ShoppingCart className="h-4 w-4" />
					{getCartTotal() > 0 && (
						<Badge
							variant="destructive"
							className="-top-2 -right-2 absolute flex h-5 w-5 items-center justify-center p-0 text-xs"
						>
							{getCartTotal()}
						</Badge>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-96" align="end">
				<CartContent />
			</PopoverContent>
		</Popover>
	);
}

function CartContent() {
	const { cart, removeFromCart, clearCart, getCartTotal } = useCart();
	const [showSaveDialog, setShowSaveDialog] = useState(false);

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text);
		toast.success("Copied to clipboard!");
	};

	const downloadRegistry = () => {
		const registry = {
			name: "Cart Components Registry",
			items: cart.map((component) => ({
				name: component.name,
				type: "components:ui",
				files: [],
				dependencies: [],
				registryDependencies: [],
			})),
		};

		const blob = new Blob([JSON.stringify(registry, null, 2)], {
			type: "application/json",
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "registry.json";
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);

		toast.success("Registry file downloaded!");
	};

	if (cart.length === 0) {
		return (
			<div className="py-6 text-center">
				<ShoppingCart className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
				<p className="text-muted-foreground">Your cart is empty</p>
				<p className="text-muted-foreground text-sm">
					Add components to install them together
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h4 className="font-semibold">Component Cart</h4>
				<Badge variant="secondary">{getCartTotal()} items</Badge>
			</div>

			<ScrollArea className="h-64">
				<div className="space-y-2">
					{cart.map((component) => (
						<div
							key={component.id}
							className="flex items-center justify-between rounded-md border bg-card p-2"
						>
							<div className="min-w-0 flex-1">
								<p className="truncate font-medium text-sm">{component.name}</p>
								<p className="truncate text-muted-foreground text-xs">
									{component.description}
								</p>
							</div>
							<Button
								variant="ghost"
								size="icon"
								className="h-6 w-6 flex-shrink-0"
								onClick={() => removeFromCart(component.id)}
							>
								<X className="h-3 w-3" />
							</Button>
						</div>
					))}
				</div>
			</ScrollArea>

			<Separator />

			<div className="space-y-2">
				<Button
					variant="outline"
					className="w-full text-xs"
					onClick={() => copyToClipboard(generateMultipleInstallCommands(cart))}
				>
					<Download className="mr-2 h-3 w-3" />
					Copy CLI Command
				</Button>

				<div className="flex space-x-2">
					<Button
						variant="outline"
						className="flex-1 text-xs"
						onClick={downloadRegistry}
					>
						<Download className="mr-2 h-3 w-3" />
						Download Registry
					</Button>
					<Button
						className="flex-1 text-xs"
						onClick={() => setShowSaveDialog(true)}
					>
						<Save className="mr-2 h-3 w-3" />
						Save as Project
					</Button>
				</div>

				<Button
					variant="destructive"
					className="w-full text-xs"
					onClick={() => {
						clearCart();
						toast.success("Cart cleared!");
					}}
				>
					<Trash2 className="mr-2 h-3 w-3" />
					Clear Cart
				</Button>
			</div>

			<SaveProjectDialog
				isOpen={showSaveDialog}
				onOpenChange={setShowSaveDialog}
				componentIds={cart.map((c) => c.id)}
			/>
		</div>
	);
}
