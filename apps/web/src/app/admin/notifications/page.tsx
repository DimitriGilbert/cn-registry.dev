"use client";

import { AdminBreadcrumb } from "@/components/admin/admin-breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useFormedible } from "@/hooks/use-formedible";
import { trpc } from "@/utils/trpc";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import {
	Bell,
	CheckCircle,
	MoreHorizontal,
	Plus,
	Trash2,
	Check,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

const notificationSchema = z.object({
	title: z.string().min(1, "Title is required").max(200, "Title too long"),
	message: z
		.string()
		.min(1, "Message is required")
		.max(1000, "Message too long"),
	type: z.enum(["info", "warning", "error", "success"]).default("info"),
});

type NotificationFormData = z.infer<typeof notificationSchema>;

export default function AdminNotificationsPage() {
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [page, setPage] = useState(1);

	const queryClient = useQueryClient();

	const { data, isLoading } = useQuery(
		trpc.admin.getNotifications.queryOptions({
			page,
			limit: 20,
		})
	);

	const createMutation = useMutation(
		trpc.admin.createNotification.mutationOptions({
			onSuccess: () => {
				toast.success("Notification created successfully!");
				queryClient.invalidateQueries({ queryKey: trpc.admin.getNotifications.queryKey() });
				setCreateDialogOpen(false);
			},
			onError: (error) => {
				toast.error(error.message || "Failed to create notification");
			},
		})
	);

	const markAsReadMutation = useMutation(
		trpc.admin.markNotificationAsRead.mutationOptions({
			onSuccess: () => {
				toast.success("Notification marked as read");
				queryClient.invalidateQueries({ queryKey: trpc.admin.getNotifications.queryKey() });
			},
			onError: (error) => {
				toast.error(error.message || "Failed to mark as read");
			},
		})
	);

	const markAllAsReadMutation = useMutation(
		trpc.admin.markAllNotificationsAsRead.mutationOptions({
			onSuccess: () => {
				toast.success("All notifications marked as read");
				queryClient.invalidateQueries({ queryKey: trpc.admin.getNotifications.queryKey() });
			},
			onError: (error) => {
				toast.error(error.message || "Failed to mark all as read");
			},
		})
	);

	const deleteMutation = useMutation(
		trpc.admin.deleteNotification.mutationOptions({
			onSuccess: () => {
				toast.success("Notification deleted successfully!");
				queryClient.invalidateQueries({ queryKey: trpc.admin.getNotifications.queryKey() });
			},
			onError: (error) => {
				toast.error(error.message || "Failed to delete notification");
			},
		})
	);

	const { Form } = useFormedible<NotificationFormData>({
		schema: notificationSchema,
		fields: [
			{
				name: "title",
				type: "text",
				label: "Title",
				placeholder: "Notification title",
			},
			{
				name: "message",
				type: "textarea",
				label: "Message",
				placeholder: "Notification message...",
				textareaConfig: {
					rows: 4,
					maxLength: 1000,
					showWordCount: true,
				},
			},
			{
				name: "type",
				type: "select",
				label: "Type",
				options: [
					{ value: "info", label: "Info" },
					{ value: "success", label: "Success" },
					{ value: "warning", label: "Warning" },
					{ value: "error", label: "Error" },
				],
			},
		],
		formOptions: {
			defaultValues: {
				title: "",
				message: "",
				type: "info" as const,
			},
			onSubmit: async ({ value }) => {
				createMutation.mutate(value);
			},
		},
		loading: createMutation.isPending,
		submitLabel: "Create Notification",
	});

	const handleMarkAsRead = async (notificationId: string) => {
		markAsReadMutation.mutate({ id: notificationId });
	};

	const handleDelete = async (notificationId: string) => {
		if (confirm("Are you sure you want to delete this notification?")) {
			deleteMutation.mutate({ id: notificationId });
		}
	};

	const getTypeBadgeVariant = (type: string) => {
		switch (type) {
			case "error":
				return "destructive";
			case "warning":
				return "secondary";
			case "success":
				return "default";
			case "info":
			default:
				return "outline";
		}
	};

	const unreadCount =
		data?.notifications.filter((n) => !n.isRead).length || 0;

	return (
		<div className="container mx-auto p-6 space-y-6">
			<AdminBreadcrumb
				items={[
					{ label: "Admin", href: "/admin" },
					{ label: "Notifications" },
				]}
			/>

			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">Notifications Management</h1>
					<p className="text-muted-foreground">
						Manage system notifications and announcements
					</p>
				</div>
				<div className="flex gap-2">
					{unreadCount > 0 && (
						<Button
							variant="outline"
							onClick={() => markAllAsReadMutation.mutate()}
							disabled={markAllAsReadMutation.isPending}
						>
							<Check className="h-4 w-4 mr-2" />
							Mark All Read ({unreadCount})
						</Button>
					)}
					<Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
						<DialogTrigger asChild>
							<Button>
								<Plus className="h-4 w-4 mr-2" />
								Create Notification
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Create New Notification</DialogTitle>
								<DialogDescription>
									Send a notification to admin dashboard.
								</DialogDescription>
							</DialogHeader>
							<Form />
						</DialogContent>
					</Dialog>
				</div>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Bell className="h-5 w-5" />
						Notifications
						{data && (
							<Badge variant="secondary">
								{data.totalCount} total
							</Badge>
						)}
						{unreadCount > 0 && (
							<Badge variant="destructive">{unreadCount} unread</Badge>
						)}
					</CardTitle>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="flex items-center justify-center py-8">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
						</div>
					) : (
						<>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Status</TableHead>
										<TableHead>Title</TableHead>
										<TableHead>Type</TableHead>
										<TableHead>Message</TableHead>
										<TableHead>Created</TableHead>
										<TableHead className="text-right">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{data?.notifications.map((notification) => (
										<TableRow
											key={notification.id}
											className={notification.isRead ? "opacity-60" : ""}
										>
											<TableCell>
												{notification.isRead ? (
													<CheckCircle className="h-4 w-4 text-green-600" />
												) : (
													<div className="h-2 w-2 bg-blue-600 rounded-full"></div>
												)}
											</TableCell>
											<TableCell className="font-medium">
												{notification.title}
											</TableCell>
											<TableCell>
												<Badge variant={getTypeBadgeVariant(notification.type)}>
													{notification.type}
												</Badge>
											</TableCell>
											<TableCell className="max-w-xs truncate">
												{notification.message}
											</TableCell>
											<TableCell>
												{formatDistanceToNow(new Date(notification.createdAt), {
													addSuffix: true,
												})}
											</TableCell>
											<TableCell className="text-right">
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button variant="ghost" size="sm">
															<MoreHorizontal className="h-4 w-4" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														{!notification.isRead && (
															<DropdownMenuItem
																onClick={() =>
																	handleMarkAsRead(notification.id)
																}
															>
																<CheckCircle className="h-4 w-4 mr-2" />
																Mark as Read
															</DropdownMenuItem>
														)}
														<DropdownMenuItem
															onClick={() => handleDelete(notification.id)}
															className="text-destructive"
														>
															<Trash2 className="h-4 w-4 mr-2" />
															Delete
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</TableCell>
										</TableRow>
									))}
									{data?.notifications.length === 0 && (
										<TableRow>
											<TableCell colSpan={6} className="text-center py-8">
												No notifications found.
											</TableCell>
										</TableRow>
									)}
								</TableBody>
							</Table>

							{data && data.totalPages > 1 && (
								<div className="flex items-center justify-between mt-4">
									<div className="text-sm text-muted-foreground">
										Showing {(page - 1) * 20 + 1} to{" "}
										{Math.min(page * 20, data.totalCount)} of {data.totalCount}{" "}
										notifications
									</div>
									<div className="flex gap-2">
										<Button
											variant="outline"
											size="sm"
											disabled={page === 1}
											onClick={() => setPage(page - 1)}
										>
											Previous
										</Button>
										<Button
											variant="outline"
											size="sm"
											disabled={page === data.totalPages}
											onClick={() => setPage(page + 1)}
										>
											Next
										</Button>
									</div>
								</div>
							)}
						</>
					)}
				</CardContent>
			</Card>
		</div>
	);
}