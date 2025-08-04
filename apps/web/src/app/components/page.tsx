import { ComponentCard } from "@/components/features/component-card";
import { Container } from "@/components/layout/container";
import { PageTitle } from "@/components/layout/page-title";
import { getCachedComponents, getCachedCategories } from "@/lib/cache";
import { ComponentsSearchAndFilter } from "@/components/features/components-search-filter";
import { ComponentsPagination } from "@/components/features/components-pagination";
import { searchSchema } from "@/../../server/src/lib/validation";
import type { RouterOutputs } from "@/utils/trpc";

type Component = RouterOutputs["components"]["getAll"]["components"][number];
type Category = RouterOutputs["categories"]["getAll"][number];

// Force dynamic rendering
export const dynamic = 'force-dynamic';

interface ComponentsPageProps {
	searchParams: Promise<{
		q?: string;
		categoryId?: string;
		page?: string;
		sort?: string;
	}>;
}

export default async function ComponentsPage({ searchParams }: ComponentsPageProps) {
	// Parse search params
	const params = await searchParams;
	const query = params.q;
	const categoryId = params.categoryId;
	const page = parseInt(params.page || "1");
	const limit = 12;

	// Use the actual schema to validate sort
	const sortValidation = searchSchema.shape.sort.safeParse(params.sort);
	const sort = sortValidation.success ? sortValidation.data : "createdAt";

	// Fetch data server-side with error handling
	let componentsData: Awaited<ReturnType<typeof getCachedComponents>>;
	try {
		componentsData = await getCachedComponents({
			query: query || undefined,
			categoryId: categoryId || undefined,
			page,
			limit,
			sort,
		});
	} catch (error) {
		console.error("Failed to fetch components:", error);
		componentsData = { components: [], totalCount: 0, currentPage: 1, totalPages: 0 };
	}

	let categories: Awaited<ReturnType<typeof getCachedCategories>>;
	try {
		categories = await getCachedCategories();
	} catch (error) {
		console.error("Failed to fetch categories:", error);
		categories = [];
	}

	const { components, totalCount, totalPages, currentPage } = componentsData;

	return (
		<Container>
			<div className="py-12">
				<PageTitle
					title="Components"
					subtitle="Discover and explore beautiful shadcn/ui components for your projects"
				/>

				{/* Client-side search and filter */}
				<ComponentsSearchAndFilter
					categories={categories}
					currentQuery={query}
					currentCategory={categoryId}
					currentSort={sort || "createdAt"}
				/>

				{/* Results Summary - Server rendered */}
				<div className="mb-6 flex items-center justify-between text-muted-foreground text-sm">
					<p>
						{components.length > 0
							? `Showing ${components.length} of ${totalCount} components`
							: "No components found"}
						{query && ` for "${query}"`}
						{categoryId &&
							categories &&
							` in ${categories.find((c: Category) => c.id === categoryId)?.name}`}
					</p>
					{totalCount > 0 && (
						<p>
							Page {currentPage} of {totalPages}
						</p>
					)}
				</div>

				{/* Components Grid - Server rendered */}
				{components.length > 0 ? (
					<div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
						{components.map((component: Component, index: number) => (
							<div
								key={component.id}
								className="fade-in slide-in-from-bottom-4 animate-in duration-300"
								style={{ animationDelay: `${index * 0.1}s` }}
							>
								<ComponentCard 
									{...component}
								/>
							</div>
						))}
					</div>
				) : (
					<div className="py-24 text-center">
						<div className="mx-auto max-w-md space-y-6">
							<div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted/50">
								<svg
									className="h-10 w-10 text-muted-foreground"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={1.5}
										d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
									/>
								</svg>
							</div>
							<div>
								<h3 className="mb-2 font-semibold text-xl">No components found</h3>
								<p className="mb-4 text-muted-foreground">
									{query || categoryId
										? "Try adjusting your search criteria or filters."
										: "It looks like there are no components available yet."}
								</p>
							</div>
						</div>
					</div>
				)}

				{/* Client-side pagination */}
				{totalPages > 1 && (
					<ComponentsPagination
						currentPage={currentPage}
						totalPages={totalPages}
						currentQuery={query}
						currentCategory={categoryId}
						currentSort={sort || "createdAt"}
					/>
				)}
			</div>
		</Container>
	);
}
