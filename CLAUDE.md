# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Innovation Hub is a module inside **One Krungthai** — Krungthai Bank's internal employee platform (React + Bun + Ruby on Rails). It gives employees a space to propose ideas, support ideas with "hearts" (limited budget), track whether ideas were applied in real work, and measure the impact those ideas created. This is a POC built **within the One Krungthai monorepo**, with persona-based login simulation in place of SSO, and stubbed external integrations (Org Chart API, Community API) in place of real connections.

**There is no incubator / project funding concept.** The focus is entirely on idea creation, approval, adoption, and impact measurement — with gamification to drive engagement.

## Tech Stack

- **Frontend**: React (Bun as runtime/bundler), lives inside One Krungthai's frontend monorepo as a module
- **Backend**: Ruby on Rails API-only mode
- **Database**: PostgreSQL
- **Language**: Thai-first; i18n keys follow One Krungthai's existing multi-language system

## Common Commands

```bash
# Backend (Rails)
bin/rails db:create db:migrate db:seed
bin/rails server                    # starts on port 4000
bin/rails routes | grep api
bundle exec rspec                   # run all tests
bundle exec rspec spec/models/idea_spec.rb  # single test file

# Frontend (Bun)
bun install
bun run dev                         # starts dev server on port 4001
bun run build
bun run test
bun run test src/modules/innovation_hub/IdeaCard.test.tsx  # single test
```

## Architecture

### Module Boundaries

Innovation Hub is a **self-contained frontend module** mounted at `src/modules/innovation_hub/` within One Krungthai. It exposes:
- A root `InnovationHubModule` component (lazy-loaded from One Krungthai's home menu)
- A set of public REST APIs (`/api/v1/innovation/...`) that One Krungthai can call to display summary widgets on other pages (e.g., trending ideas on the home feed)

### Frontend Structure

```
src/modules/innovation_hub/
  index.tsx                  # module entry + router
  InnovationIdeas/           # idea listing, detail, create/edit, impact reporting
  Community/                 # community-filtered idea browsing (synced from One Krungthai)
  Leaderboard/               # points rankings, badges, category leaders
  Admin/                     # moderation dashboard (admin role only)
  Notifications/             # in-app notification panel
  shared/                    # hooks, types, api clients
```

### Backend Structure (Rails)

```
app/
  controllers/api/v1/innovation/
    ideas_controller.rb
    hearts_controller.rb
    comments_controller.rb
    comment_votes_controller.rb      # upvote/downvote comments
    idea_applications_controller.rb  # record that someone applied an idea
    idea_impacts_controller.rb       # report measurable impact from an application
    communities_controller.rb        # synced from One Krungthai community API
    leaderboard_controller.rb
    notifications_controller.rb
    admin/                           # admin-only endpoints
  models/
    idea.rb
    idea_heart.rb            # join: user + idea; enforces 1-per-idea + budget check
    idea_comment.rb
    idea_comment_vote.rb     # upvote on comments (1 per user per comment)
    heart_budget.rb          # tracks monthly budget per user
    idea_application.rb      # record: employee applied this idea in their work
    idea_impact.rb           # measurable outcome reported against an application
    community.rb             # cached from One Krungthai community API
    idea_community_tag.rb    # join: idea ↔ community (many-to-many)
    innovation_point.rb      # point ledger per user per action
    user_badge.rb            # badges earned by users
    notification.rb
    admin_setting.rb         # key-value config (e.g., heart_budget_amount)
  services/
    org_chart/               # org chart API integration (stub: hardcoded seed data)
    community/               # One Krungthai community API sync (stub: seeded communities)
    heart_budget_service.rb  # budget allocation and validation
    points_service.rb        # award points and check badge unlock conditions
```

## Roles & Authorization

Roles are stored on the `User` model and enforced via Pundit policies.

| Role | Capabilities |
|------|-------------|
| `employee` | Submit ideas, give hearts (budget-limited), comment + upvote comments, report idea applications and impacts, join communities, view leaderboard |
| `manager` | All employee abilities + approve / decline / return ideas from direct reports (routing via org chart) |
| `sponsor` | Same approval rights as manager + can approve cross-department ideas |
| `admin` | All of above + edit/delete any idea at any status, manage heart budget periods, manage badge definitions, manage users |

**POC auth**: No SSO. The login page shows persona buttons ("Login as Employee", "Login as Admin", "Login as Sponsor", "Login as Manager") that set a session with a pre-seeded user of that role.

## Key Business Rules

### Hearts (Innovation Budget)
- Each user has a monthly heart budget (default: `10`, configurable via `AdminSetting.heart_budget_amount`)
- A user can give **at most 1 heart** to any single idea — budget exists to prevent mindless voting on everything
- Budget periods are **manually triggered by admin** (not automatic cron). Triggering a new period creates a fresh `HeartBudget` record; unspent hearts do not roll over
- Hearts can only be given to `approved` ideas

### Idea Lifecycle

```
draft → submitted → under_review → approved | declined
                         ↑               |
                      returned  ←────────┘ (manager returns with comment)
                         │
                   employee revises → resubmits → back to same approver
```

- Approval is routed automatically via the org chart: submitting an idea creates an `ApprovalRequest` pointing to the employee's direct manager (or sponsor if cross-department)
- Authors can edit/delete their own ideas while in `draft`, `submitted`, or `returned`
- Admins can edit or delete any idea at any status
- **No incubating status** — ideas stop at `approved`; real-world adoption is tracked separately via `IdeaApplication`

### Idea Application & Impact (separate from idea status)
- Any employee can record "I applied this idea" → creates an `IdeaApplication`; idea status is unaffected
- The first person to apply an idea earns a bonus point award
- An `IdeaImpact` report is attached to an `IdeaApplication` and contains:
  - `reported_by_user_id` — shown publicly so attribution is transparent
  - `people_affected` (integer, required)
  - `time_saved_hours` (decimal, optional)
  - `cost_saved_thb` (decimal, optional)
  - `impact_type` enum: `time | cost | people | process | other`
  - `description` (text)
  - `evidence_url` (optional)
- One idea can have multiple applications and multiple impact reports

### Comment Upvotes
- Any employee can upvote a comment (1 upvote per user per comment, no downvote)
- Upvote counts are displayed on comments
- Comment authors earn points when their comment is upvoted (drives quality engagement)

### Gamification — Points

Points are recorded in `innovation_points` (ledger table, never mutated — append only).

| Action | Points |
|--------|--------|
| Submit idea | 5 |
| Idea approved | 20 |
| Idea applied by someone else (per application) | 30 |
| Heart received on own idea | 2 |
| Comment upvoted | 3 |
| Report impact with metrics | 15 |
| First adopter bonus | 10 |

Points are stored for potential future integration with One Krungthai's existing coin/redemption system. **Do not connect to the coin system yet** — store only.

### Gamification — Badges

Badges are awarded automatically by `PointsService` when conditions are met.

| Badge key | Condition |
|-----------|-----------|
| `first_idea` | Creates first idea |
| `approved_innovator` | First idea approved |
| `trendsetter` | Idea reaches 10+ hearts |
| `serial_innovator` | 5+ approved ideas |
| `impact_maker` | Submits first impact report |
| `adoption_driver` | Own idea applied by 3+ different people |
| `community_builder` | 20+ comments written |
| `top_contributor` | Enters top 10 leaderboard in any period |

### Leaderboard

Five ranked categories, each filterable by month / quarter / all-time. Public to all employees.

| Category | Ranked by |
|----------|-----------|
| Top Innovator | count of approved ideas |
| Impact Champion | weighted score: people_affected + time_saved + cost_saved |
| Community Catalyst | hearts given to others + comments written |
| Idea Adopter | count of ideas applied + impact reports submitted |
| Rising Star | points growth % vs previous period |

### Notifications (in-app only)
- Idea author notified: idea approved, declined, or returned
- Idea author notified: someone applied their idea
- Idea author notified: an impact report is filed on their idea
- Manager notified: new idea pending approval in their queue
- Employee notified: new idea tagged in a community they follow
- No email or LINE at this stage

## External Integrations

Both integrations are **stubbed for POC** with seed data. The service interfaces are designed to be swapped for real API clients later without changing controllers or frontend code.

### Org Chart (Approval Routing)
- **POC**: `OrgChart::ReportingService` reads a hardcoded hash in the stub, returning a manager user for any given employee user.
- **Production intent**: Query One Krungthai's org chart API to resolve the direct manager at idea submission time; cache result on the `ApprovalRequest`.

### One Krungthai Community API
- **POC**: `Community::SyncService` seeds static communities. The `communities` table stores `external_id`, `name`, `description`, `member_count`, `avatar_url`, `synced_at`.
- **Production intent**: Periodic background job calls One Krungthai's community API and upserts records. Employee community membership is read from the same API (not stored locally).

## Public APIs for One Krungthai Integration

```
GET /api/v1/innovation/summary            # trending ideas + total impact stats
GET /api/v1/innovation/ideas/trending     # top N ideas by heart count this period
GET /api/v1/innovation/leaderboard/top    # top 3 per category for home feed widget
```

## Analytics (Admin/Sponsor Dashboard)

Key metrics surfaced in the admin panel:

| Metric | Measures |
|--------|----------|
| Ideas submitted over time | platform engagement trend |
| Approval rate | idea quality signal |
| Application rate | % of approved ideas that get applied |
| Total people affected | org-wide reach of ideas |
| Total time / cost saved | quantified ROI |
| Community → idea conversion | which communities generate most ideas |
| Engagement funnel | submitted → approved → applied → impact reported |

## Database Conventions

- All timestamps are `timestamptz` (UTC stored, displayed in ICT +07:00 on the frontend)
- Soft-delete (`discarded_at`) on `ideas` only (no incubator projects) via the `discard` gem
- Enum statuses stored as `string` columns with Rails `enum` mapping (not integers), for readability in the DB
- `innovation_points` is an **append-only ledger** — never update or delete rows; compute totals via aggregation

## Design System (One Krungthai Theme)

All Innovation Hub UI must match the One Krungthai visual language exactly. Reference the screenshots in `/docs/design/` for context.

### Color Tokens

```css
/* Brand */
--color-primary:        #1B74E4;   /* buttons, active tabs, links, FAB */
--color-primary-hover:  #1565C0;
--color-primary-shadow: rgba(27, 116, 228, 0.25); /* blue glow on buttons */

/* Page background — light blue tint body, vivid gradient header */
--color-bg-body:        #EBF7FF;
--color-bg-surface:     #FFFFFF;   /* card / sheet background */
--color-bg-badge:       #E8F0FB;   /* question-count badge, number chips */
--color-bg-disabled:    #F0F0F0;

/* Gradient used on page header / hero sections */
--gradient-header: linear-gradient(180deg, #5BC8F5 0%, #2BA5E0 60%, #EBF7FF 100%);

/* Text */
--color-text-primary:   #1A2038;
--color-text-secondary: #8A96A8;
--color-text-disabled:  #BDBDBD;
--color-text-link:      #1B74E4;
--color-text-on-primary:#FFFFFF;

/* Accents */
--color-heart:          #FF4D6D;   /* heart / like icon */
--color-coin:           #F5A623;   /* ONE Coin gold */
--color-heart-empty:    #C7C7CC;   /* unspent heart budget */

/* Borders */
--color-border:         #E8EDF5;
--color-border-input:   #D1D9E6;
--color-border-dashed:  #A8C4E8;   /* "add item" dashed outline */
```

### Shadows

```css
--shadow-card:   0 2px 12px rgba(0, 0, 0, 0.06);
--shadow-button: 0 4px 12px var(--color-primary-shadow);
--shadow-fab:    0 4px 16px rgba(27, 116, 228, 0.35);
```

### Border Radius

```css
--radius-card:   16px;   /* content cards, sheets */
--radius-button: 24px;   /* primary pill buttons */
--radius-tab:    20px;   /* segmented tab pills */
--radius-input:  12px;   /* text inputs */
--radius-badge:  8px;    /* number badges */
--radius-chip:   100px;  /* back button pill */
```

### Spacing

```css
--spacing-page-x:    16px;   /* horizontal page padding */
--spacing-card-pad:  16px;
--spacing-gap-card:  8px;    /* vertical gap between list cards */
--spacing-gap-section: 24px; /* gap between page sections */
```

### Typography

Font: **Prompt** (Thai + Latin, Google Fonts) — matches One Krungthai's Thai-first typographic style.

| Role | Weight | Size | Color |
|------|--------|------|-------|
| Page title / Hero | 700 | 24px | text-primary |
| Section heading | 700 | 18px | text-primary |
| Card title | 600 | 16px | text-primary |
| Body | 400 | 14px | text-primary |
| Caption / meta | 400 | 12px | text-secondary |
| Link / CTA text | 500 | 14px | color-primary |

### Component Patterns

**Page layout**: White/light-blue body. Top hero area uses `--gradient-header` behind the page title and tab row. Below the gradient, content sits on `--color-bg-body`.

**Cards**: White surface, `--radius-card`, `--shadow-card`. No visible border — shadow provides separation.

**Primary button**: Full-width pill, `--color-primary` fill, white text, `--shadow-button`. Disabled state uses `--color-bg-disabled` fill + `--color-text-disabled` text.

**Segmented tabs**: Pill-shaped container in light blue-gray. Active segment = `--color-primary` fill + white text. Inactive = transparent + `--color-text-primary`.

**Back button**: Small rounded pill (`--radius-chip`) with left-arrow icon + "กลับ" label. Background is white/translucent.

**FAB (+)**: Circle, `--color-primary`, `--shadow-fab`, placed top-right of page header.

**Number badge** (e.g., question count): `--color-bg-badge` background, `--radius-badge`, small bold number + Thai unit label below.

**Dashed add placeholder**: `2px dashed --color-border-dashed`, `--radius-card`, centered "+" icon + Thai label in `--color-primary`.

**Heart icon** (Innovation Hub–specific): Filled = `--color-heart`, empty/remaining = `--color-heart-empty`.
