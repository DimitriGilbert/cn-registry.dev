import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";

interface BreadcrumbItem {
	label: string;
	href?: string;
}

interface AdminBreadcrumbProps {
	items: BreadcrumbItem[];
}

export function AdminBreadcrumb({ items }: AdminBreadcrumbProps) {
	return (
		<Breadcrumb>
			<BreadcrumbList>
				{items.map((item, index) => (
					<BreadcrumbItem key={index}>
						{index < items.length - 1 ? (
							<>
								{item.href ? (
									<BreadcrumbLink asChild>
										<Link href={item.href}>{item.label}</Link>
									</BreadcrumbLink>
								) : (
									<span>{item.label}</span>
								)}
								<BreadcrumbSeparator />
							</>
						) : (
							<BreadcrumbPage>{item.label}</BreadcrumbPage>
						)}
					</BreadcrumbItem>
				))}
			</BreadcrumbList>
		</Breadcrumb>
	);
}