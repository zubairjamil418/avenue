# Technology Stack & Standards

The Sellzy platform leverages a high-performance, modern technology stack to deliver optimal scalability and developer experience. The project is organized as a **Monorepo** using **pnpm workspaces** and **TurboRepo** to encapsulate the Web Storefront, Admin Dashboard, API Backend, and shared packages cleanly.

## 1. Monorepo Architecture
- **Package Manager**: `pnpm` (v10+), guaranteeing strict installation structures and extremely fast dependency resolution.
- **Monorepo Tooling**: `turbo` (TurboRepo), enabling fine-grained cache execution, rapid parallel builds, and simplified cross-app script running (e.g. `turbo run dev`).

## 2. Storefront (Web App)
Built for optimal end-user speed, SEO adherence, and dynamic interface rendering.
- **Core Framework**: `Next.js 16` (App Router base, Turbopack).
- **React**: Version 19, exploiting Server Server/Client Components architectures (isomorphic design).
- **Styling Architecture**: `Tailwind CSS 4.0` taking advantage of deep integration for zero-runtime utility styling. 
- **Component Primitives**: Highly accessible base components constructed with `Radix UI`.
- **Form Management & Validation**: `react-hook-form` coupled closely with `Zod` schema definitions.
- **State Management**: `Zustand` for lightweight, localized client-state synchronizations.
- **Animations & Interactivity**: `Framer Motion` and `Tailwind Animate` for polished UI transitions and micro-interactions.
- **Internationalization (i18n)**: `next-intl` configuring complex routing strategies for localization.

## 3. Admin Dashboard
A robust Single-Page Application tuned for massive data interaction, dashboards, and intensive forms.
- **Core Framework**: `Vite` (v7+) paired with `React 19`.
- **Routing**: Client-side state managed securely via `React Router v7`.
- **Data Visualizations**: `Recharts` providing responsive, customizable SVG charts for backend analytics.
- **UI & Layout Configuration**: `Radix UI` toolsets combined with `shadcn-ui`-style component patterns.
- **Complex Capabilities**:  
  - Rich Text Input utilizing `react-quill-new`.
  - Advanced Drag and Drop functionality handled by `@dnd-kit/core`.
  - Media & Document utilities such as `html2canvas` and `jspdf` for instantaneous front-end report generation.

## 4. Backend (API Layer)
A hardened configuration of NodeJS for heavy transactional traffic.
- **Runtime Environment**: `Node.js` (>=18) powered by `Express 5+`.
- **Language Standard**: Fully configured `TypeScript` maintaining rigid payload and schema type assurances.
- **Database & ODM**: `Mongoose 9` connected to MongoDB clusters (Atlas) forming the data layer of truth.
- **Security Primitives**:
  - `bcryptjs` & `jsonwebtoken (JWT)` powering authentication models.
  - `helmet`, `hpp`, `express-mongo-sanitize`, and `express-rate-limit` explicitly incorporated against malicious traffic.
- **Media Transcoding & Storage**:
  - Direct integration pipelines utilizing `Multer`, `Sharp` (resizing workflows), `ImageKit`, and cloud fallbacks (`Cloudinary`).
- **External Webhooks & Payments**: Comprehensive `Stripe` SDK event listening alongside `SSLCommerz` implementations.
- **API Documentation Output**: Auto-generated Swagger definitions populated via `swagger-jsdoc` scaling out to `swagger-ui-express`.

## 5. Standard Practices & Tooling
- **Type Safety**: Strictly enforced `TypeScript` across every workspace edge.
- **Linting & Formatting**: Sync configuration of `ESLint v9` paired explicitly with `Prettier` (managed by Turbo pipelines).
- **Script Integrations**: High quality local database bridging implemented via internal `.ts` scripts (`db:export`, `importSeed.ts`).

### Development Setup Standards
Because of the optimized Toolset architecture, development revolves around localized commands utilizing modern caching:
- Standard local run: execution of `pnpm dev` triggers the `Turbo` registry to orchestrate the API, Web, and Admin packages simultaneously resolving internal network ports automatically via `.env` bridging files.
- `tsx` replaces older `ts-node` or `nodemon` compiling limits for significantly faster direct execution of TypeScript in Node.
