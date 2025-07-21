"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { MoreHorizontal, Search, UserCheck, UserX } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { AdminBreadcrumb } from "@/components/admin/admin-breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { trpc } from "@/utils/trpc";

export default function AdminUsersPage() {
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState("");
	const [roleFilter, setRoleFilter] = useState<
		"user" | "creator" | "admin" | undefined
	>();

	const queryClient = useQueryClient();

	const { data, isLoading } = useQuery(
		trpc.admin.getUsersForManagement.queryOptions({
			page,
			search: search || undefined,
			role: roleFilter,
			limit: 20,
		}),
	);

	const updateRoleMutation = useMutation(
		trpc.admin.updateUserRole.mutationOptions({
			onSuccess: () => {
				toast.success("User role updated successfully");
				queryClient.invalidateQueries({
					queryKey: trpc.admin.getUsersForManagement.queryKey(),
				});
			},
			onError: (error) => {
				toast.error(error.message || "Failed to update user role");
			},
		}),
	);

	const suspendMutation = useMutation(
		trpc.admin.suspendUser.mutationOptions({
			onSuccess: () => {
				toast.success("User status updated successfully");
				queryClient.invalidateQueries({
					queryKey: trpc.admin.getUsersForManagement.queryKey(),
				});
			},
			onError: (error) => {
				toast.error(error.message || "Failed to update user status");
			},
		}),
	);

	const handleRoleChange = async (userId: string, newRole: string) => {
		updateRoleMutation.mutate({
			userId,
			role: newRole as "user" | "creator" | "admin",
		});
	};

	const handleSuspendUser = async (userId: string, suspended: boolean) => {
		suspendMutation.mutate({
			userId,
			suspended,
		});
	};

	const getRoleBadgeVariant = (role: string) => {
		switch (role) {
			case "admin":
				return "destructive";
			case "creator":
				return "default";
			case "user":
				return "secondary";
			default:
				return "outline";
		}
	};

	return (
		<div className="container mx-auto space-y-6 p-6">
			<AdminBreadcrumb
				items={[
					{ label: "Admin", href: "/admin" },
					{ label: "User Management" },
				]}
			/>

			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-bold text-3xl">User Management</h1>
					<p className="text-muted-foreground">
						Manage users, roles, and permissions
					</p>
				</div>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Users</CardTitle>
					<div className="flex gap-4">
						<div className="relative max-w-sm flex-1">
							<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-muted-foreground" />
							<Input
								placeholder="Search users..."
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								className="pl-10"
							/>
						</div>
						<Select
							value={roleFilter || "all"}
							onValueChange={(value) =>
								setRoleFilter(
									value === "all"
										? undefined
										: (value as "user" | "creator" | "admin"),
								)
							}
						>
							<SelectTrigger className="w-[180px]">
								<SelectValue placeholder="Filter by role" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Roles</SelectItem>
								<SelectItem value="user">User</SelectItem>
								<SelectItem value="creator">Creator</SelectItem>
								<SelectItem value="admin">Admin</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="flex items-center justify-center py-8">
							<div className="h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
						</div>
					) : (
						<>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>User</TableHead>
										<TableHead>Email</TableHead>
										<TableHead>Role</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Joined</TableHead>
										<TableHead className="text-right">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{data?.users.map((user) => (
										<TableRow key={user.id}>
											<TableCell>
												<div className="flex items-center gap-3">
													{user.image && (
														<Image
															src={user.image}
															alt={user.name || "User"}
															className="h-8 w-8 rounded-full"
															width={32}
															height={32}
														/>
													)}
													<div>
														<div className="font-medium">
															{user.name || "No name"}
														</div>
														<div className="text-muted-foreground text-sm">
															@{user.username || "no-username"}
														</div>
													</div>
												</div>
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-2">
													{user.email}
													{user.emailVerified && (
														<UserCheck className="h-4 w-4 text-green-600" />
													)}
													{!user.emailVerified && (
														<UserX className="h-4 w-4 text-orange-600" />
													)}
												</div>
											</TableCell>
											<TableCell>
												<Badge variant={getRoleBadgeVariant(user.role)}>
													{user.role}
												</Badge>
											</TableCell>
											<TableCell>
												<Badge variant="outline">Active</Badge>
											</TableCell>
											<TableCell>
												{formatDistanceToNow(new Date(user.createdAt), {
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
														<DropdownMenuItem
															onClick={() => handleRoleChange(user.id, "user")}
															disabled={user.role === "user"}
														>
															Make User
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={() =>
																handleRoleChange(user.id, "creator")
															}
															disabled={user.role === "creator"}
														>
															Make Creator
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={() => handleRoleChange(user.id, "admin")}
															disabled={user.role === "admin"}
														>
															Make Admin
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={() => handleSuspendUser(user.id, true)}
															className="text-destructive"
														>
															Suspend User
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>

							{data && data.totalPages > 1 && (
								<div className="mt-4 flex items-center justify-between">
									<div className="text-muted-foreground text-sm">
										Showing {(page - 1) * 20 + 1} to{" "}
										{Math.min(page * 20, data.totalCount)} of {data.totalCount}{" "}
										users
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
