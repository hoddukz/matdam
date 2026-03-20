<!-- Tag: docs -->
<!-- Path: README.md -->

# MatDam

> Discover, remix, and share Korean recipes with the world.

**[한국어 README](./README.ko.md)**

MatDam is a social Korean recipe platform where users can explore traditional and modern Korean dishes, remix existing recipes with their own twist, and share culinary experiences with a global community.

---

## Tech Stack

| Layer        | Technology                                   |
| ------------ | -------------------------------------------- |
| Framework    | Next.js 15 (App Router) + React 19           |
| Language     | TypeScript 5                                 |
| Styling      | Tailwind CSS 4 + Radix UI primitives         |
| Database     | Supabase (PostgreSQL + Auth + Storage + RLS) |
| i18n         | next-intl (Korean / English)                 |
| State        | Zustand                                      |
| Forms        | React Hook Form + Zod validation             |
| AI           | Anthropic Claude SDK (recipe translation)    |
| Monitoring   | Sentry (error tracking)                      |
| Analytics    | PostHog                                      |
| Monorepo     | pnpm Workspaces + Turborepo                  |
| CI/CD        | GitHub Actions                               |
| Code Quality | ESLint + Prettier + Husky (lint-staged)      |

---

## Monorepo Structure

```
mat_dam/
├── apps/
│   └── web/                        # Next.js web application
│       ├── src/
│       │   ├── app/
│       │   │   ├── [locale]/       # Locale-prefixed page routes
│       │   │   │   ├── explore/    # Recipe discovery & search
│       │   │   │   ├── recipe/     # Recipe detail & cooking mode
│       │   │   │   ├── create/     # Recipe editor
│       │   │   │   ├── glossary/   # Ingredient glossary
│       │   │   │   ├── fridge/     # Fridge-based recommendation
│       │   │   │   ├── community/  # Community board (coming soon)
│       │   │   │   └── ...
│       │   │   └── api/            # API routes
│       │   │       ├── recipe-translation/
│       │   │       ├── translate-announcement/
│       │   │       └── cron/
│       │   ├── components/
│       │   │   ├── ui/             # Design system primitives (button, card, dialog...)
│       │   │   ├── home/           # Homepage sections
│       │   │   ├── recipe/         # Recipe components (18+ files)
│       │   │   ├── comment/        # Shared comment system
│       │   │   ├── discussion/     # Community discussion (disabled)
│       │   │   ├── glossary/       # Glossary components
│       │   │   ├── explore/        # Explore page components
│       │   │   ├── fridge/         # Fridge components
│       │   │   ├── shopping/       # Shopping list components
│       │   │   ├── report/         # Content reporting
│       │   │   ├── user/           # User profile & rank badges
│       │   │   └── layout/         # GNB, footer, layout wrappers
│       │   └── lib/
│       │       ├── supabase/       # Supabase client (server + client)
│       │       ├── recipe/         # Recipe utilities & constants
│       │       ├── user/           # User helpers
│       │       └── validation/     # Validation schemas
│       └── messages/               # i18n translation files
│           ├── en.json
│           └── ko.json
├── packages/
│   ├── types/                      # Shared TypeScript interfaces
│   ├── utils/                      # Shared utility functions
│   └── supabase/                   # Supabase client configuration
├── supabase/
│   └── migrations/                 # PostgreSQL migrations (001–012)
└── docs/
    ├── design/                     # Design system docs
    ├── tech/                       # Technical architecture
    ├── work_order/                 # Task specifications
    └── research/                   # Market & feature research
```

---

## Features

### Recipe Management

| Feature              | Description                                                                                            |
| -------------------- | ------------------------------------------------------------------------------------------------------ |
| **Create & Edit**    | Full recipe editor with drag-and-drop step reordering, per-step images, timers, and tips               |
| **Ingredient Input** | Autocomplete ingredient search linked to the glossary database, with unit conversion (metric/imperial) |
| **Remix**            | Fork any published recipe to create your own variation, with automatic attribution to the original     |
| **Draft System**     | Save recipes as drafts before publishing                                                               |
| **Dietary Labels**   | Tag recipes with 10 dietary labels (vegan, gluten-free, halal, etc.)                                   |
| **Auto Translation** | AI-powered recipe translation between Korean and English via Claude                                    |
| **Recipe Lint**      | Pre-publish validation warns about unused ingredients, empty steps, missing timers                     |

### Cooking Experience

| Feature             | Description                                                                                          |
| ------------------- | ---------------------------------------------------------------------------------------------------- |
| **Cooking Mode**    | Distraction-free step-by-step view with large text, ingredient highlights per step                   |
| **Built-in Timers** | Multiple concurrent timers with notification when done                                               |
| **Taste Profile**   | Aggregated community taste ratings across 9 dimensions (sweet, salty, spicy, sour, difficulty, etc.) |
| **Cook Log**        | "I Made This" button to track cooking history                                                        |
| **Cook Review**     | Rate recipes on overall taste, difficulty, and "would make again" + 6 detailed taste dimensions      |

### Discovery & Personalization

| Feature               | Description                                                                                                           |
| --------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Explore**           | Browse recipes with search, difficulty filter, dietary filter, and sort (newest/popular)                              |
| **Virtual Fridge**    | Select ingredients you have at home and get matching recipe recommendations                                           |
| **Shopping List**     | Auto-generated shopping list from bookmarked recipes, grouped by ingredient category                                  |
| **Glossary**          | Comprehensive ingredient dictionary with substitutes, descriptions, images, and community comments                    |
| **Pantry Guide**      | Essential ingredients by cuisine (Korean, Japanese, Chinese, Thai, Western, etc.)                                     |
| **Personalized Feed** | Recipe recommendations based on onboarding preferences (skill level, cuisine interests, dietary needs, taste profile) |
| **K-Drama Cravings**  | Curated recipes featured in Korean dramas                                                                             |

### Social & Community

| Feature             | Description                                                                                                         |
| ------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Comments**        | Recipe comments (requires "I Made This") + Glossary comments (login only), with nested replies (2 levels)           |
| **Voting**          | Upvote/downvote on recipes and comments with optimistic UI updates                                                  |
| **User Ranking**    | Activity-based ranking system: Apprentice → Novice Cook → Home Cook → Skilled Cook → Artisan → Master → Grandmaster |
| **Verified Badges** | Special badges for verified chefs and partner chefs                                                                 |
| **Report System**   | Report inappropriate content with auto-unpublish at 3 reports                                                       |
| **Bookmarks**       | Save recipes for later                                                                                              |
| **User Profiles**   | Public profile with published recipes, activity score, and rank badge                                               |
| **Community Board** | Discussion forum (coming soon)                                                                                      |

### Internationalization

| Feature                | Description                                                            |
| ---------------------- | ---------------------------------------------------------------------- |
| **Dual Language**      | Full UI in Korean and English                                          |
| **Locale Routing**     | URL-based locale prefix (`/ko/...`, `/en/...`) with cookie persistence |
| **Recipe Translation** | AI-powered translation of recipe title, description, steps, and tips   |
| **Language Switcher**  | GNB dropdown + settings page language selection                        |
| **Input Auto-detect**  | Automatically detects input language for recipe JSONB key assignment   |

---

## Getting Started

### Prerequisites

- **Node.js** 20.x (`>=20.0.0 <21.0.0`)
- **pnpm** 9.x
- **Supabase** project (cloud or local via Supabase CLI)

### Installation

```bash
# Clone the repository
git clone https://github.com/hoddukz/matdam.git
cd matdam

# Install dependencies
pnpm install

# Set up environment variables
cp apps/web/.env.local.example apps/web/.env.local
```

### Environment Variables

Create `apps/web/.env.local` with the following:

| Variable                        | Required | Description                                  |
| ------------------------------- | -------- | -------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Yes      | Supabase project URL                         |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes      | Supabase anonymous key                       |
| `SUPABASE_SERVICE_ROLE_KEY`     | Yes      | Supabase service role key (server-side only) |
| `ANTHROPIC_API_KEY`             | Yes      | Anthropic API key for recipe translation     |
| `NEXT_PUBLIC_SENTRY_DSN`        | No       | Sentry DSN for error tracking                |
| `NEXT_PUBLIC_POSTHOG_KEY`       | No       | PostHog API key for analytics                |
| `NEXT_PUBLIC_POSTHOG_HOST`      | No       | PostHog host URL                             |

### Development Commands

```bash
# Start dev server (all workspaces)
pnpm dev

# Start web app only
pnpm --filter @matdam/web dev

# Type check
pnpm turbo type-check

# Lint
pnpm turbo lint

# Production build
pnpm turbo build

# Clean build artifacts
pnpm turbo clean
```

---

## Database

### Architecture

MatDam uses Supabase (PostgreSQL) with Row Level Security (RLS) for data access control. All tables enforce RLS policies — users can only modify their own data, while published content is publicly readable.

### Core Tables

| Table                | Description                                                                                        |
| -------------------- | -------------------------------------------------------------------------------------------------- |
| `users`              | User profiles (extends Supabase Auth) with display_name, avatar, preferences, activity_score, tier |
| `recipes`            | Recipes with JSONB title/description/steps, taste_profile, dietary_tags, remix chain               |
| `ingredients`        | Ingredient master data with multilingual names, category, dietary_flags, substitutes               |
| `recipe_ingredients` | Many-to-many recipe-ingredient join with amount, unit, note                                        |
| `cook_logs`          | "I Made This" records                                                                              |
| `cook_reviews`       | Taste/difficulty ratings per cook_log (9 dimensions)                                               |
| `comments`           | Comments for recipes (requires cook_log) and ingredients (login only)                              |
| `comment_votes`      | Upvote/downvote on comments                                                                        |
| `recipe_votes`       | Upvote/downvote on recipes                                                                         |
| `bookmarks`          | User bookmarks                                                                                     |
| `reports`            | Content reports with auto-threshold trigger                                                        |
| `announcements`      | Admin announcements/news                                                                           |
| `discussions`        | Community discussion threads (not yet active)                                                      |

### Migrations

Migration files are in `supabase/migrations/`, numbered sequentially:

| #   | File                                    | Description                                                    |
| --- | --------------------------------------- | -------------------------------------------------------------- |
| 001 | `schema.sql`                            | Core schema (users, recipes, ingredients, units)               |
| 002 | `seed_ingredients.sql`                  | Ingredient seed data                                           |
| 003 | `storage_bucket.sql`                    | Supabase Storage bucket setup                                  |
| 004 | `rpc_functions.sql`                     | PostgreSQL RPC functions                                       |
| 005 | `social_tables.sql`                     | Social tables (cook_logs, reviews, comments, votes, bookmarks) |
| 006 | `reports.sql`                           | Report table + auto-unpublish trigger                          |
| 007 | `indexes.sql`                           | Performance indexes                                            |
| 008 | `seed_recipes.sql`                      | Recipe seed data                                               |
| 009 | `user_ranking.sql`                      | User ranking system (activity_score triggers)                  |
| 010 | `announcements.sql`                     | Announcements table                                            |
| 011 | `seed_recipes_2.sql`                    | Additional recipe seed data                                    |
| 012 | `glossary_comments_and_discussions.sql` | Glossary comments + discussions table                          |

```bash
# Reset database and apply all migrations
supabase db reset

# Apply pending migrations only
supabase migration up
```

---

## Page Routes

All routes are prefixed with `[locale]` (e.g., `/ko/explore`, `/en/explore`).

| Route            | Page                                                                    | Auth Required           |
| ---------------- | ----------------------------------------------------------------------- | ----------------------- |
| `/`              | Homepage — popular recipes, recommendations, K-Drama cravings           | No                      |
| `/explore`       | Recipe discovery — search, filters (difficulty, dietary), sort          | No                      |
| `/recipe/[slug]` | Recipe detail — ingredients, steps, cooking mode, comments, reviews     | No (actions need auth)  |
| `/create`        | Recipe editor — create new recipe                                       | Yes                     |
| `/glossary`      | Ingredient glossary — browse, search, filter by category/cuisine        | No                      |
| `/glossary/[id]` | Ingredient detail — description, substitutes, related recipes, comments | No (comments need auth) |
| `/fridge`        | Virtual fridge — select ingredients, find matching recipes              | No                      |
| `/shopping-list` | Shopping list — combined ingredients from bookmarked recipes            | Yes                     |
| `/profile`       | My profile — published/draft/bookmarked recipes                         | Yes                     |
| `/user/[id]`     | User profile — public recipe list, rank badge                           | No                      |
| `/news`          | Announcements — admin news, updates                                     | No                      |
| `/community`     | Community board (coming soon)                                           | —                       |
| `/settings`      | User settings — profile, preferences, language                          | Yes                     |
| `/login`         | OAuth login (Google, Apple, Facebook)                                   | No                      |
| `/onboarding`    | New user setup — skill level, cuisines, dietary, taste                  | Yes                     |

### API Routes

| Endpoint                      | Method | Description                            |
| ----------------------------- | ------ | -------------------------------------- |
| `/api/recipe-translation`     | POST   | Translate recipe content via Claude AI |
| `/api/translate-announcement` | POST   | Translate announcement content         |
| `/api/cron`                   | GET    | Scheduled maintenance tasks            |

---

## CI/CD

### GitHub Actions

On every push to `main` and pull request:

1. Checkout code
2. Setup Node.js 20 + pnpm
3. Install dependencies (frozen lockfile)
4. Run `pnpm turbo lint`
5. Run `pnpm turbo type-check`

### Pre-commit Hooks

Via Husky + lint-staged:

- `*.{ts,tsx}` → ESLint auto-fix
- `*.{ts,tsx,json,css,md}` → Prettier format

---

## License

Private repository. All rights reserved.
