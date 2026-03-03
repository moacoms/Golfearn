# CLAUDE.md - Golfearn Development Guide

## Project Overview

**Golfearn** (Golf + Learn/Earn) is a full-stack golf community and SaaS platform targeting Korean golf beginners ("골린이", ages 35-55). The platform has pivoted from a Korea-only community to a **global AI Golf Swing Analytics** tool while retaining legacy Korean community features.

- **Live URL**: https://www.golfearn.com
- **Domain**: golfearn.com
- **Slogan**: "Your AI Golf Coach - Analyze, Improve, Track" / "늦게 시작해도 괜찮아, 함께라면"

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5.9 |
| UI Library | React 18.3 |
| Styling | Tailwind CSS 3.4 |
| Backend/DB | Supabase (PostgreSQL 17 + Auth + Storage + Realtime) |
| AI | Anthropic Claude API (`@anthropic-ai/sdk`) |
| i18n | next-intl 4.7 (English + Korean) |
| Charts | Recharts 3.7 |
| Maps | Google Maps API (`@react-google-maps/api`) |
| Payments | Lemon Squeezy |
| Content | react-markdown |
| Deployment | Vercel |

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev          # http://localhost:3000

# Build for production
npm run build

# Lint
npm run lint

# Generate Supabase types
npx supabase gen types typescript --local > types/database.ts
```

## Environment Variables

Required in `.env.local` (see `.env.example`):

```env
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# AI Analysis
ANTHROPIC_API_KEY=

# Maps & Places
GOOGLE_MAPS_API_KEY=
GOOGLE_CLOUD_PROJECT_ID=
GOOGLE_CLOUD_PRIVATE_KEY=
GOOGLE_CLOUD_CLIENT_EMAIL=

# Payments
LEMON_SQUEEZY_API_KEY=
LEMON_SQUEEZY_STORE_ID=
LEMON_SQUEEZY_WEBHOOK_SECRET=
```

## Project Structure

```
/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx                # Root layout (metadata, globals)
│   ├── page.tsx                  # Landing page (/)
│   ├── globals.css               # Global styles
│   ├── robots.ts                 # SEO
│   ├── sitemap.ts                # SEO
│   │
│   ├── (auth)/                   # Auth pages (login, signup)
│   ├── (main)/                   # Legacy Korean-only pages
│   │   ├── admin/                #   Admin dashboard & club management
│   │   ├── club-catalog/         #   Golf club catalog
│   │   ├── club-recommend/       #   AI club recommendation
│   │   ├── community/            #   Forum (QnA, free, reviews)
│   │   ├── golf-courses/         #   Golf course directory
│   │   ├── guide/                #   Beginner guides
│   │   ├── join/                 #   Golf round matching
│   │   ├── lesson-pro/           #   Lesson pro directory
│   │   ├── market/               #   Used equipment marketplace
│   │   ├── mypage/               #   User dashboard
│   │   └── practice-range/       #   Practice range finder
│   │
│   ├── [locale]/                 # Internationalized pages (en, ko)
│   │   ├── analysis/             #   AI swing analysis (premium)
│   │   ├── pricing/              #   Subscription pricing
│   │   ├── checkout/             #   Payment flow
│   │   └── mypage/subscription/  #   Subscription management
│   │
│   ├── api/                      # API routes
│   │   ├── analysis/             #   AI analysis & OCR endpoints
│   │   ├── checkout/             #   Lemon Squeezy checkout
│   │   ├── cron/                 #   Scheduled tasks
│   │   ├── naver-shopping/       #   Price comparison
│   │   ├── places/               #   Google Places proxy
│   │   ├── subscription/         #   Subscription management
│   │   └── webhooks/             #   Payment webhooks
│   │
│   └── auth/callback/            # OAuth/email verification callback
│
├── components/                   # React components
│   ├── analysis/                 # Chart components (Recharts)
│   ├── club/                     # Club catalog cards & selectors
│   ├── golf-courses/             # Course review UI
│   ├── i18n/                     # Language switcher, locale header
│   ├── join/                     # Join matching cards
│   ├── layout/                   # Header.tsx, Footer.tsx
│   ├── location/                 # Location modals, filters, pickers
│   └── ui/                       # Shared UI (Button, Card, Input)
│
├── lib/                          # Business logic & utilities
│   ├── actions/                  # Server Actions (21 modules)
│   ├── supabase/                 # Supabase clients (client, server, middleware)
│   ├── i18n/                     # i18n config (locales: en, ko)
│   ├── guides.ts                 # Embedded guide content
│   ├── lemonsqueezy.ts           # Payment SDK wrapper
│   ├── google-maps.ts            # Maps API wrapper
│   └── utils.ts                  # Helpers (cn, formatDate, calculateDistance, etc.)
│
├── types/                        # TypeScript type definitions
│   ├── database.ts               # Supabase generated types
│   ├── club.ts                   # Club catalog types
│   └── supabase.ts               # Full Supabase schema types
│
├── content/guides/               # MDX guide content (placeholder)
├── messages/                     # i18n translation files
│   ├── en.json                   # English translations
│   └── ko.json                   # Korean translations
│
├── supabase/migrations/          # 20+ SQL migration files
├── scripts/                      # Data import & seed scripts
├── docs/                         # Work summaries & feature docs
├── marketing-outputs/            # Generated marketing content
├── public/images/                # Static assets
├── middleware.ts                 # Auth + i18n + routing middleware
└── claude.md                     # Legacy project reference (detailed history)
```

## Architecture & Routing

### Dual Routing System

The app has two routing systems coexisting:

1. **Legacy routes** (`app/(main)/...`) - Korean-only community features. No locale prefix.
   - `/community`, `/market`, `/join`, `/lesson-pro`, `/practice-range`, `/mypage`, `/guide`, `/golf-courses`, `/admin`

2. **Internationalized routes** (`app/[locale]/...`) - New global features using `next-intl`.
   - `/en/analysis`, `/ko/analysis`, `/en/pricing`, `/ko/pricing`

The `middleware.ts` handles routing between these two systems:
- Detects locale from URL, headers, or cookies
- Redirects legacy paths with locale prefix back to non-prefixed versions
- Manages Supabase auth session refresh
- Handles OAuth callbacks

### Server Actions Pattern

Business logic lives in `lib/actions/*.ts` using Next.js Server Actions (`'use server'`). Each module handles a specific domain:

```
lib/actions/
├── auth.ts              # Login, signup, logout
├── products.ts          # Marketplace CRUD
├── posts.ts             # Community forum CRUD
├── join.ts              # Join matching management
├── golf-analysis.ts     # AI swing analysis
├── club-catalog.ts      # Club search & filter
├── club-recommendation.ts  # AI club recommendation
├── points.ts            # Points/rewards system
├── referrals.ts         # Referral code management
├── notifications.ts     # User notifications
├── profile.ts           # User profile management
├── location.ts          # Geolocation services
├── chat.ts              # Product messaging
├── join-chat.ts         # Join group chat
├── lesson-pros.ts       # Lesson pro directory
├── practice-ranges.ts   # Practice range operations
├── club-price.ts        # Price history
├── club-reviews.ts      # Club reviews
├── golf-course-reviews.ts  # Course reviews
├── events.ts            # Event tracking
└── admin-clubs.ts       # Admin club management
```

### Supabase Client Usage

- **Browser (Client Components)**: `import { createClient } from '@/lib/supabase/client'`
- **Server (Server Components/Actions)**: `import { createClient } from '@/lib/supabase/server'`
- **Middleware**: `import { createClient } from '@/lib/supabase/middleware'`

## Key Conventions

### Code Style

- **Language**: TypeScript with strict mode enabled
- **Components**: React functional components with hooks
- **Styling**: Tailwind CSS utility classes; use `cn()` from `lib/utils.ts` for conditional classes
- **Path aliases**: `@/*` maps to project root (e.g., `@/lib/utils`, `@/components/ui/Button`)
- **Exports**: UI components use barrel exports via `index.ts` files
- **Fonts**: Pretendard (Korean), Inter (English)

### Component Patterns

- **UI Components** (`components/ui/`): Reusable primitives (Button, Card, Input) with variant props
- **Feature Components** (`components/[feature]/`): Domain-specific, often receive data as props
- **Layout Components** (`components/layout/`): Header, Footer
- **Page Components** (`app/.../page.tsx`): Data fetching in server components, delegation to client components for interactivity

### TypeScript Types

- Supabase types are auto-generated into `types/database.ts` and `types/supabase.ts`
- Custom domain types in `types/club.ts`
- When Supabase types don't match, `as any` casting is used (technical debt)
- Regenerate types: `npx supabase gen types typescript --local > types/database.ts`

### Internationalization (i18n)

- Translations in `messages/en.json` and `messages/ko.json`
- Use `useTranslations()` hook in client components
- Use `t.raw()` for complex nested translation values (arrays, objects)
- Locale config in `lib/i18n/config.ts` (supported: `['en', 'ko']`, default: `'en'`)
- Only `[locale]/` routes use i18n; legacy `(main)/` routes are Korean-only

### Design System

```
Colors:
  --primary:      #10B981  (emerald green - golf theme)
  --primary-dark: #059669
  --secondary:    #3B82F6  (blue)
  --background:   #F9FAFB
  --foreground:   #111827
  --muted:        #6B7280
  --border:       #E5E7EB

Tone: Friendly, warm, beginner-approachable, clean/modern, no excess decoration
Mobile-first responsive design
```

### Database (Supabase)

Key table groups:

| Group | Tables |
|-------|--------|
| Users | `profiles`, `point_wallets`, `user_experience`, `user_badges` |
| Community | `posts`, `comments`, `post_likes`, `post_bookmarks` |
| Marketplace | `products`, `favorites`, `messages` |
| Join Matching | `join_posts`, `join_participants`, `join_chat_messages` |
| Lessons | `lesson_pros`, `lesson_pro_reviews`, `lesson_inquiries` |
| Golf Resources | `golf_clubs`, `golf_club_brands`, `practice_ranges`, `golf_course_reviews` |
| AI Analysis | `user_golf_profiles`, `swing_sessions`, `shot_data`, `swing_analyses` |
| Business | `subscriptions`, `referral_codes`, `point_transactions`, `events` |
| Admin | `pending_clubs`, `admin_notifications` |

- RLS (Row Level Security) is enabled on all tables
- Public read for profiles, posts, courses; authenticated write for personal data
- Database functions: `increment_post_view()`, `increment_product_view()`, `handle_new_user()`, `approve_pending_club()`, `reject_pending_club()`

### API Routes

| Endpoint | Purpose |
|----------|---------|
| `POST /api/analysis/analyze` | AI swing analysis (Claude API) |
| `POST /api/analysis/ocr` | Launch monitor OCR (Claude Vision) |
| `POST /api/checkout` | Create Lemon Squeezy checkout |
| `POST /api/subscription/cancel` | Cancel subscription |
| `GET /api/subscription/portal` | Customer portal URL |
| `POST /api/webhooks/lemonsqueezy` | Payment webhook handler |
| `GET /api/cron/search-new-clubs` | Weekly club search (Vercel Cron) |
| `GET /api/places/search` | Google Places search proxy |
| `GET /api/places/nearby` | Nearby golf courses |
| `GET /api/places/details` | Course details |
| `GET /api/naver-shopping` | Price comparison |

### Deployment

- **Platform**: Vercel
- **Cron**: `/api/cron/search-new-clubs` runs Mondays at 9 AM (configured in `vercel.json`)
- **Domains**: golfearn.com (production)
- **Payments**: Lemon Squeezy store at `golfearn.lemonsqueezy.com`

## Important Patterns & Gotchas

### Build & Compatibility

- The project uses `next.config.mjs` (ESM) with `createNextIntlPlugin` wrapper
- Remote images from Supabase are allowed via `next.config.mjs` image config
- Some components use `'use client'` directive for interactivity (maps, charts, forms)
- Recharts and Google Maps components should be dynamically imported to avoid SSR issues

### Known Technical Debt

- Some Supabase table accesses use `as any` type casting where generated types don't match
- Guide content is embedded in `lib/guides.ts` rather than using a CMS or MDX files
- `content/guides/` directory exists but is currently empty (placeholder)
- Legacy routes and internationalized routes coexist, adding routing complexity

### Security Notes

- Supabase RLS policies are required on all tables
- API routes validate auth via Supabase session
- Webhook endpoints verify signatures (Lemon Squeezy)
- Environment variables with secrets must never be exposed client-side (only `NEXT_PUBLIC_*` prefixed vars are safe)
- Admin features check `is_admin` flag on user profiles

### SEO

- Server-side rendering is used for public pages
- `robots.ts` and `sitemap.ts` at app root for search engines
- OpenGraph and Twitter Card metadata in root `layout.tsx`

## Marketing Content System

The project includes a content marketing pipeline with specialized Claude agents (`.claude/agents/`):

| Agent | Purpose |
|-------|---------|
| `golfearn-planner` | Content brief creation from URLs/topics |
| `golfearn-reviewer` | Quality review of marketing content |
| `instagram-writer` | Instagram card news (5-7 slides) + Reels scripts |
| `youtube-writer` | YouTube scripts, Shorts storyboards, thumbnails |
| `thread-writer` | X/Twitter threads (10 tweets) |
| `blog-writer` | SEO-optimized blog posts (Naver/Tistory) |
| `cafe-writer` | Naver Cafe community posts |

Marketing outputs are saved to `marketing-outputs/` organized by channel.

## File Reference

| File | Purpose |
|------|---------|
| `claude.md` | Legacy detailed project history & business plan (1250+ lines) |
| `middleware.ts` | Auth session + i18n + routing middleware |
| `lib/utils.ts` | `cn()`, `formatDate()`, `formatPrice()`, `calculateDistance()`, etc. |
| `lib/guides.ts` | Embedded beginner guide content (10 articles) |
| `lib/lemonsqueezy.ts` | Payment API wrapper |
| `lib/google-maps.ts` | Maps API configuration |
| `vercel.json` | Cron job schedule |
| `tailwind.config.js` | Custom theme (colors, fonts) |
| `supabase/migrations/` | All database schema changes |
| `scripts/` | Data import scripts (ranges, clubs, lesson pros) |
