# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Innovation Hub is a module inside **One Krungthai** — Krungthai Bank's internal employee platform (React + Bun + Ruby on Rails). It gives employees a space to propose ideas, support ideas with "hearts" (innovation budget), and follow sponsored projects through incubation. This is a POC built **within the One Krungthai monorepo**, with persona-based login simulation in place of SSO, and stubbed external integrations (SuccessFactors, Jira) in place of real API connections.

## Tech Stack

- **Frontend**: React (Bun as runtime/bundler), lives inside One Krungthai's frontend monorepo as a module
- **Backend**: Ruby on Rails API-only mode
- **Database**: PostgreSQL
- **Language**: Thai-first; i18n keys follow One Krungthai's existing multi-language system

## Common Commands

```bash
# Backend (Rails)
bin/rails db:create db:migrate db:seed
bin/rails server                    # starts on port 3000
bin/rails routes | grep api
bundle exec rspec                   # run all tests
bundle exec rspec spec/models/idea_spec.rb  # single test file

# Frontend (Bun)
bun install
bun run dev                         # starts dev server
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
  InnovationIdeas/           # idea listing, detail, create/edit
  InnovationClassroom/       # SuccessFactors-connected course listing
  IncubatorProjects/         # project workspace + public progress view
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
    incubator_projects_controller.rb
    project_updates_controller.rb
    classroom_courses_controller.rb
    notifications_controller.rb
    admin/                   # admin-only endpoints
  models/
    idea.rb
    idea_heart.rb            # join: user + idea + optional comment
    idea_comment.rb
    heart_budget.rb          # tracks monthly budget per user
    incubator_project.rb
    project_update.rb
    classroom_course.rb      # cached from SuccessFactors
    notification.rb
    admin_setting.rb         # key-value config (e.g., heart_budget_amount)
  services/
    success_factors/         # SuccessFactors Learning API integration
    jira/                    # optional Jira integration
    heart_budget_service.rb  # budget allocation and validation
```

## Roles & Authorization

Roles are stored on the `User` model and enforced via Pundit policies.

| Role | Capabilities |
|------|-------------|
| `employee` | Submit ideas, give hearts (1 per idea), view all content, follow projects |
| `admin` | All of above + approve/decline/edit/delete any idea, manage classroom content, manage heart budget periods, manage users |
| `sponsor` | All employee abilities + access to sponsorship analytics (heart counts, supporter comments) |
| `project_owner` | All employee abilities + post updates to an incubator project they own |

**POC auth**: No SSO. The login page shows persona buttons ("Login as Employee", "Login as Admin", "Login as Sponsor", "Login as Project Owner") that set a session with a pre-seeded user of that role.

## Key Business Rules

### Hearts (Innovation Budget)
- Each user has a monthly heart budget (default: `10`, configurable via `AdminSetting.heart_budget_amount`)
- A user can give **at most 1 heart** to any single idea
- Giving a heart optionally includes a short comment explaining why
- Budget periods are **manually triggered by admin** (not automatic cron). Triggering a new period creates a fresh `HeartBudget` record; unspent hearts do not roll over
- Unused budget does not carry over to the next period

### Idea Lifecycle

```
draft → pending_review → approved (published) | declined
                                   ↓
                              incubating
```

- Authors can edit/delete their own ideas while in `draft` or `pending_review`
- Admins can edit or delete any idea at any status
- Hearts can only be given to `approved` ideas
- Only an admin can move an idea to `incubating` (sponsorship decision)

### Incubator Project Statuses (startup-style)

`discovery → mvp → pilot → scaling → completed` (also: `on_hold`)

Project owners post updates with a milestone tag. All employees can view updates and discussions. The project workspace in One Krungthai is the primary interface; Jira is linked optionally via a stored Jira board URL for teams that want deeper tracking.

### Notifications (in-app only)
- Idea author notified when their idea is `approved` or moves to `incubating`
- No email or LINE at this stage

## External Integrations

Both integrations are **stubbed for POC** with seed/mock data. The service interfaces are designed to be swapped for real API clients later without changing controllers or frontend code.

### SuccessFactors (Innovation Classroom)
- **POC**: `classroom_courses` table is seeded with static mock courses. `SuccessFactors::CourseService` returns this seed data.
- **Production intent**: SAP SuccessFactors Learning API → cache in `classroom_courses` → background sync job
- `ClassroomCourse` stores `sf_course_id`, title, description, thumbnail URL, and deep-link URL back to SuccessFactors

### Jira (Incubator Projects, optional)
- **POC**: `IncubatorProject` stores `jira_board_url` and `jira_project_key` as plain strings; the workspace card shows them as a static link. `Jira::BoardService` is a stub returning placeholder data.
- **Production intent**: Jira REST API pulls open issue count and current sprint name for the workspace summary card. Display-only; no write-back.

## Public APIs for One Krungthai Integration

These endpoints allow One Krungthai's home feed and other pages to embed Innovation Hub data without navigating into the module:

```
GET /api/v1/innovation/summary          # trending ideas, active projects count
GET /api/v1/innovation/ideas/trending   # top N ideas by heart count this period
GET /api/v1/innovation/projects/active  # incubating projects with latest status
```

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

/* Answer option accents (Classroom / Quiz) */
--color-option-red:     #EF5350;
--color-option-green:   #4CAF50;
--color-option-blue:    #1B74E4;
--color-option-yellow:  #FFC107;
--color-option-selected-bg: #E8F5E9;
--color-option-selected-border: #4CAF50;
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

## Database Conventions

- All timestamps are `timestamptz` (UTC stored, displayed in ICT +07:00 on the frontend)
- Soft-delete (`discarded_at`) on `ideas` and `incubator_projects` via the `discard` gem
- Enum statuses stored as `string` columns with Rails `enum` mapping (not integers), for readability in the DB
