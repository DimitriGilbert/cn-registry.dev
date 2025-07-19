# Component Registry Feature Roadmap

## 1. Component Cart & Saved Projects System

**Priority:** High  
**Estimated Effort:** Medium-Large

**Why:** Users need to collect components for projects and save these collections for future use. The cart provides immediate utility for multi-component installation, while saved projects enable long-term organization and collaboration.

**Architecture Overview:**

- **Cart**: Client-side temporary collection with localStorage persistence
- **Projects**: Server-side saved collections with collaboration features
- **Workflow**: Cart → Save as Project → Share/Manage

### Phase 1A: Component Installation Cart

1. **State Management (Client-side):**

   - Create `CartProvider` using React Context (`apps/web/src/components/providers/cart-provider.tsx`)
   - Context exposes: `cart`, `addToCart`, `removeFromCart`, `clearCart`, `isInCart`, `getCartTotal`
   - Wrap root layout with `CartProvider`
   - Persist cart state in localStorage across browser sessions

2. **UI Components:**

   - **Add/Remove Buttons:** On `ComponentCard` and `/components/[id]` pages
   - **Cart Popover:** Header cart icon with badge (`apps/web/src/components/features/cart.tsx`)
     - Component list with thumbnails
     - "Clear Cart", "Save as Project", "Generate Install File" buttons
     - Estimated total installation size

3. **Backend API:**
   - Add `getByIds` procedure to `componentsRouter`
   - Accept component IDs array, return optimized component data
   - Include dependency resolution and conflict detection

### Phase 1B: Project Persistence & Management

4. **Database Schema:**

   ```sql
   -- Simple project entity (no complex config)
   projects (
     id: uuid PRIMARY KEY,
     name: text NOT NULL,
     description: text,
     slug: text UNIQUE NOT NULL,
     userId: text REFERENCES user(id),
     visibility: text DEFAULT 'private', -- 'private', 'public'
     createdAt: timestamp,
     updatedAt: timestamp
   )

   -- Simple project-component relationship
   project_components (
     projectId: uuid REFERENCES projects(id) ON DELETE CASCADE,
     componentId: uuid REFERENCES components(id) ON DELETE CASCADE,
     addedAt: timestamp,
     PRIMARY KEY (projectId, componentId)
   )

   -- Basic collaboration (reuse from existing plan)
   project_collaborators (
     projectId: uuid REFERENCES projects(id) ON DELETE CASCADE,
     userId: text REFERENCES user(id) ON DELETE CASCADE,
     role: text DEFAULT 'viewer', -- 'owner', 'editor', 'viewer'
     addedAt: timestamp,
     PRIMARY KEY (projectId, userId)
   )
   ```

5. **API Layer - New `projectsRouter`:**

   ```typescript
   projectsRouter = router({
     // CRUD operations
     create: protectedProcedure.input(createProjectSchema),
     getAll: protectedProcedure, // user's projects
     getById: protectedProcedure.input(idSchema),
     update: protectedProcedure.input(updateProjectSchema),
     delete: protectedProcedure.input(idSchema),

     // Component management
     addComponents: protectedProcedure.input(addComponentsToProjectSchema), // bulk add from cart
     removeComponent: protectedProcedure.input(removeComponentSchema),
     getComponents: protectedProcedure.input(projectIdSchema),

     // Installation
     generateInstallConfig: protectedProcedure.input(projectIdSchema),
     generateCliCommand: protectedProcedure.input(projectIdSchema),

     // Sharing
     addCollaborator: protectedProcedure.input(addCollaboratorSchema),
     removeCollaborator: protectedProcedure.input(removeCollaboratorSchema),
     getPublicProject: publicProcedure.input(projectSlugSchema),
   });
   ```

6. **Frontend Integration:**

   - **Cart to Project Flow:** "Save as Project" button in cart popover
   - **Projects Dashboard:** `/projects` page with project grid
   - **Project Detail:** `/projects/[slug]` with component management
   - **Enhanced Dashboard:** Add project stats to existing dashboard

7. **Installation & Export:**
   - Generate `registry.json` for project components
   - CLI command generation: `npx shadcn@latest add comp1 comp2 comp3`
   - Support multiple package managers (npm, yarn, pnpm, bun)
   - Dependency conflict detection and resolution

---

## 2. GitHub Integration & Component Enrichment

**Priority:** Medium  
**Estimated Effort:** Medium

**Why:** Enhanced GitHub integration will automatically enrich component data, reduce creator workload, and provide users with up-to-date information about component quality and maintenance status.

**Implementation:**

1. **GitHub API Integration:**

   - New `githubRouter` with Octokit integration (`apps/server/src/routers/github.ts`)
   - Procedures: `getRepoStats`, `getReadme`, `getReleases`, `getIssues`
   - GitHub App authentication for higher rate limits

2. **Smart Caching System:**

   ```sql
   github_cache (
     repoUrl: text PRIMARY KEY,
     data: jsonb NOT NULL,
     lastFetched: timestamp,
     expiresAt: timestamp
   )
   ```

   - 6-hour background refresh with `node-cron`
   - Stale-while-revalidate pattern for better UX

3. **Enhanced Component Display:**

   - `GitHubStats` component: stars, forks, issues, last updated
   - `MarkdownRenderer` with syntax highlighting for READEs
   - Repository health indicators and quality scoring
   - Automatic version detection from GitHub releases

4. **Creator Benefits:**
   - Automatic README synchronization
   - Release notes integration
   - Reduced manual maintenance of component descriptions

---

## 3. Creator Profiles & Community Features

**Priority:** Medium  
**Estimated Effort:** Medium

**Why:** Enhanced creator profiles will build community, recognize contributions, and help users discover quality components from trusted creators.

**Implementation:**

1. **Enhanced User Schema:**

   ```sql
   -- Extend existing user table
   ALTER TABLE user ADD COLUMN bio text;
   ALTER TABLE user ADD COLUMN website text;
   ALTER TABLE user ADD COLUMN location text;
   ALTER TABLE user ADD COLUMN company text;
   ALTER TABLE user ADD COLUMN socialLinks jsonb DEFAULT '{}';
   ALTER TABLE user ADD COLUMN verified boolean DEFAULT false;
   ALTER TABLE user ADD COLUMN specialties text[];
   ```

2. **Public Creator Pages (`/creators/[username]`):**

   - Portfolio showcase with featured components/tools
   - Creator stats dashboard (components, stars received, downloads)
   - Activity timeline and contribution history
   - Social links and sponsorship integration

3. **Creator Dashboard Enhancements:**

   - Analytics: component views, stars, downloads
   - Portfolio management: featured components
   - Profile customization settings
   - Community achievements and badges

4. **Discovery Features:**
   - Creator search and filtering by specialties
   - "Trending Creators" section on homepage
   - Creator recommendation engine based on user interests

---

## 4. Developer Tools & Integrations

**Priority:** Medium  
**Estimated Effort:** Medium

**Why:** Developer tools and integrations will increase adoption by fitting into existing workflows and enabling automation.

**Implementation:**

1. **Public API Layer:**

   - REST API endpoints for public data (components, tools, projects)
   - API key authentication for third-party integrations
   - Rate limiting and comprehensive documentation
   - Built on existing tRPC infrastructure for consistency

2. **Developer Integrations:**

   - VS Code extension for component browsing and installation
   - GitHub Actions for automated component publishing
   - Webhook system for notifications (component updates, new releases)
   - npm package integration for seamless installation

---

## 5. Team Collaboration & Organizations

**Priority:** Medium-Low  
**Estimated Effort:** Large

**Why:** Teams need shared component libraries, collaboration workflows, and organizational control for enterprise adoption.

**Implementation:**

1. **Organization System:**

   ```sql
   organizations (
     id: uuid PRIMARY KEY,
     name: text NOT NULL,
     slug: text UNIQUE NOT NULL,
     description: text,
     settings: jsonb DEFAULT '{}',
     createdAt: timestamp
   )

   organization_members (
     orgId: uuid REFERENCES organizations(id),
     userId: text REFERENCES user(id),
     role: text NOT NULL, -- 'owner', 'admin', 'member'
     joinedAt: timestamp,
     PRIMARY KEY (orgId, userId)
   )
   ```

2. **Shared Resources:**

   - Organization-owned components and tools
   - Shared project collections within teams
   - Team-specific component libraries
   - Centralized approval workflows for component publishing

3. **Enterprise Features (Future):**
   - SSO integration (SAML, OAuth)
   - Private component registries
   - Advanced analytics and usage tracking
   - Custom branding and white-labeling
   - Audit logs for compliance

---

## Implementation Roadmap

### **Immediate Priority (Phase 1):**

1. **Component Cart System** - Essential for user workflow improvement
2. **Project Persistence** - Save cart contents as named projects

### **Short Term (Phase 2):**

3. **GitHub Integration** - Enrich component data automatically
4. **Creator Profiles** - Build community and discovery

### **Medium Term (Phase 3):**

5. **Developer Tools** - API, VS Code extension
6. **Team Collaboration** - Organizations and shared projects

### **Technical Integration Strategy:**

- **Cart → Projects**: Natural progression from temporary to persistent collections
- **Existing Features**: Maintain stars, comments, ratings as global features
- **Backward Compatibility**: All new features are additive, don't break existing workflows
- **Database Design**: Simple, focused schemas that avoid over-engineering

### **Key Success Metrics:**

- **User Engagement**: Increased time on site, return visits
- **Component Discovery**: Improved component installation rates
- **Creator Satisfaction**: More component submissions and updates
- **Developer Adoption**: API usage, CLI downloads, VS Code extension installs
