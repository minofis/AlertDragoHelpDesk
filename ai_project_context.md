# AI Project Context — AlertDragoHelpDesk

## 1. Tech Stack

### Frontend
- **React 19**, **TypeScript 7**, **Vite 8** (build tool)
- CSS Modules for styling (no UI library)
- ESLint 10

### Backend
- **ASP.NET Core Web API** (.NET 10, C# 12)
- **Entity Framework Core 10** + **Npgsql** (PostgreSQL provider)
- Swashbuckle/Swagger for API docs
- Built-in DI container, `System.Text.Json` for serialization

### Telegram Bot
- **Python 3.12**, **aiogram 3** (Telegram Bot framework)
- **FastAPI** + **Uvicorn** (HTTP server for receiving backend notifications)
- **httpx** (async HTTP client)

### Infrastructure
- **PostgreSQL** (database)
- **Nginx** (reverse proxy: `/api/*` → backend, SPA fallback → frontend)
- **Docker Compose** (4 services: `postgresDb`, `api`, `frontend`, `bot`)

---

## 2. Project Structure

```
/
├── backend/DragoDeskHelp/
│   ├── DragoDeskHelp.Core/         # Domain layer: Entities, Enums, DTOs, Interfaces
│   ├── DragoDeskHelp.DAL/          # Data access: EF Core DbContext, Migrations
│   ├── DragoDeskHelp.BLL/          # Business logic: Services (TicketService, TelegramBotService)
│   └── DragoDeskHelp.API/          # Web API: Controllers, Program.cs, DI wiring
│
├── frontend/
│   └── src/
│       ├── models/ticket.ts        # Ticket TypeScript type
│       ├── components/
│       │   ├── CreateTicketForm/   # Ticket creation form component
│       │   └── TicketsTable/       # Ticket listing/filtering table component
│       └── App.tsx                 # Root component (form + table)
│
├── bot/
│   ├── main.py                     # Bot runner (aiogram + FastAPI in one loop)
│   ├── config.py                   # ENV config (BOT_TOKEN, API_BASE_URL, ALLOWED_IDS)
│   └── app/
│       ├── handlers/               # Bot command/menu handlers (empty, reserved)
│       └── services/               # Bot services (empty, reserved)
│
├── docker-compose.yml              # 4-service orchestration
├── nginx.conf                      # Reverse proxy config
└── README.md
```

---

## 3. Architecture & Patterns

- **Clean Architecture (Onion):** Core → DAL → BLL → API, with dependencies flowing inward. Core layer has zero external dependencies.
- **Service Layer Pattern:** Business logic lives in `BLL/Services/` (e.g., `TicketService`), consumed by API controllers.
- **EF Core as Repository/UoW:** `AppDbContext` acts directly as the data access layer; no separate repository interfaces.
- **DTO Mapping:** API contracts (Request/Response DTOs) are separate from domain entities.
- **Enum-based State Machine:** `TicketStatus` enum (New, InProgress, Resolved, Rejected) drives ticket lifecycle transitions.
- **State Management:** No external library — React `useState` + `refreshKey` pattern for re-fetching after mutations.
- **Dockerized Microservices:** 4 independent containers orchestrated via Docker Compose, communicating over HTTP.

---

## 4. Core Entities

| Entity | Location | Description |
|--------|----------|-------------|
| **Ticket** | `backend/.../Core/Entities/Ticket.cs` | Help desk ticket with room number, author, description, status, creation timestamp, and optional assignee Telegram ID |
| **TicketStatus** (enum) | `backend/.../Core/Enums/TicketStatus.cs` | Lifecycle states: `New` (0), `InProgress` (1), `Resolved` (2), `Rejected` (3) |
| **TicketRequestDto** | `backend/.../Core/DTOs/` | Payload for creating a ticket (RoomNumber, AuthorName, Description) |
| **TicketResponseDto** | `backend/.../Core/DTOs/` | API response shape with id, room, author, description, localized status text, Kyiv-time timestamp, assignee |
| **TicketStatusUpdateDto** | `backend/.../Core/DTOs/` | Payload for PATCH status updates (new status + optional assignee) |
| **PagedResponse\<T\>** | `backend/.../Core/DTOs/` | Generic paginated response wrapper |

---

## 5. Workflow Templates

> _Placeholder — copy your PR, issue, and task templates here as needed._

### PR Template
**Title:** `feat/fix/chore: [concise description]`

**What does this PR do?**
[1-2 sentences explaining the core changes and their purpose]

**Key Features & Changes:**
* 📦 **[Category]:** [Description of the change]
* ⚙️ **[Category]:** [Description of the change]
* 🎨 **[Category]:** [Description of the change]

**How to Test:**
1. [Step 1]
2. [Step 2]

**Closes #[Issue number]**

### Task / Issue Template

## Feature Request Template:
**Title:** `feat: [Short description]`

**User Story:**
As a [user type], I want to [action] so that [benefit/reason].

**Description:**
[Detailed explanation of the feature, business value, and technical context]

**Tasks:**
- [ ] [Actionable step 1]
- [ ] [Actionable step 2]
- [ ] [Actionable step 3]

**Acceptance Criteria:**
1. [Condition 1 that must be met]
2. [Condition 2]

## Bug Report Template
**Title:** `fix: [Short description of the problem]`

**Description:**
[Clear and concise description of what the bug is.]

**Steps to Reproduce:**
1. Go to '...'
2. Click on '....'
3. Enter '....'
4. See error

**Expected Behavior:**
[What you expected to happen]

**Actual Behavior / Logs:**
[What actually happened. Paste error logs, browser console output, or screenshots here]

### Commit Convention
We follow the standard Conventional Commits specification. Use the following prefixes:

* `feat:` A new feature for the user
* `fix:` A bug fix for the user
* `chore:` Routine tasks, maintenance, or dependency updates (no production code change)
* `refactor:` A code change that neither fixes a bug nor adds a feature
* `docs:` Documentation only changes
* `style:` Changes that do not affect the meaning of the code (formatting, missing semi-colons, etc.)

**Example:** `feat: add server-side pagination to tickets API`
