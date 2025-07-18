# Common LLM Errors and Solutions

This document tracks common errors encountered by LLMs while working on this codebase and their solutions.

## Drizzle ORM Query Chain Issues

**Error Pattern:**
```
Type error: Property 'where' is missing in type 'Omit<PgSelectBase<...>'
```

**Problem:** 
In Drizzle ORM, you cannot reassign query chains after calling methods like `.limit()` and `.offset()`. Once these methods are called, the query is considered "finalized" and additional methods like `.where()` cannot be chained.

**Incorrect Code:**
```typescript
let query = db
  .select({ ... })
  .from(user)
  .limit(limit)
  .offset(offset);

// This will cause a TypeScript error:
if (role) {
  query = query.where(eq(user.role, role));
}
```

**Correct Solutions:**

### Option 1: Build query conditionally before finalization
```typescript
const baseQuery = db
  .select({ ... })
  .from(user);

// Apply filters first
const query = role 
  ? baseQuery.where(eq(user.role, role)).limit(limit).offset(offset)
  : baseQuery.limit(limit).offset(offset);
```

### Option 2: Build complete query in one chain
```typescript
const query = db
  .select({ ... })
  .from(user)
  .where(role ? eq(user.role, role) : undefined)
  .limit(limit)
  .offset(offset);
```

**Files Fixed:**
- `apps/server/src/routers/admin.ts:212`
- `apps/server/src/routers/analytics.ts:52`

**Source:** Fixed on 2025-01-17

---

## Next.js App Router Params TypeScript Error

**Error Pattern:**
```
Type error: Type '{ params: { id: string; }; }' does not satisfy the constraint 'PageProps'.
```

**Problem:**
In Next.js App Router with TypeScript, dynamic route params are now Promise-based and must be awaited.

**Incorrect Code:**
```typescript
export default function Page({ params }: { params: { id: string } }) {
  // Using params.id directly
}
```

**Correct Code:**
```typescript
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Now use id
}
```

**Files Fixed:**
- `apps/web/src/app/admin/components/[id]/analytics/page.tsx`
- `apps/web/src/app/admin/components/[id]/edit/page.tsx`
- `apps/web/src/app/components/[id]/page.tsx`
- `apps/web/src/app/tools/[id]/page.tsx`

**Source:** Fixed on 2025-01-17

---

## TailwindCSS v4 Utility Class Issues

**Error Pattern:**
```
[Error: Cannot apply unknown utility class `border-border`]
```

**Problem:**
TailwindCSS v4 has different utility class patterns. Custom CSS properties need to be referenced directly rather than through utility classes like `border-border`.

**Incorrect Code:**
```css
@layer base {
  * {
    @apply border-border;
  }
}
```

**Correct Code:**
```css
@layer base {
  * {
    border-color: hsl(var(--border));
  }
}
```

**Files Fixed:**
- `apps/web/src/app/globals.css`

**Source:** Fixed on 2025-01-17

---

## shadcn/ui Chart Component TypeScript Issues

**Error Pattern:**
```
Type error: Property 'payload' does not exist on type 'Omit<Props<ValueType, NameType>...
```

**Problem:**
The chart tooltip component types were incorrectly defined for Recharts integration.

**Solution:**
Define proper TypeScript interface for chart tooltip props:

```typescript
}: {
  active?: boolean;
  payload?: Array<{
    value: any;
    dataKey: string;
    color?: string;
    name?: string;
    payload?: any;
  }>;
  label?: any;
  className?: string;
  hideLabel?: boolean;
  hideIndicator?: boolean;
  indicator?: "line" | "dot" | "dashed";
  nameKey?: string;
  labelKey?: string;
  labelFormatter?: (label: any, payload?: any[]) => React.ReactNode;
  labelClassName?: string;
  formatter?: (value: any, name: any, item: any, index: number, payload?: any[]) => React.ReactNode;
  color?: string;
}) {
```

**Files Fixed:**
- `apps/web/src/components/ui/chart.tsx`

**Source:** Fixed on 2025-01-17

---

## React Query Provider Missing

**Error Pattern:**
```
Error: No QueryClient set, use QueryClientProvider to set one
```

**Problem:**
tRPC with TanStack Query requires QueryClientProvider to be set up in the app layout, but it was missing.

**Solution:**
Ensure the layout uses the Providers component that includes QueryClientProvider:

```typescript
// apps/web/src/app/layout.tsx
import Providers from "@/components/providers"

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  )
}
```

**Files Fixed:**
- `apps/web/src/app/layout.tsx`

**Reference Files:**
- `apps/web/src/components/providers.tsx` (existing provider setup)
- `apps/web/src/utils/trpc.ts` (tRPC client configuration)

**Source:** Fixed on 2025-01-17