# School Equipment Lending Portal (MERN)

This repository hosts a full-stack School Equipment Lending Portal built with the MERN stack. The platform helps schools digitise their equipment lending workflow—students and teachers can request items, lab assistants approve/issue them, and administrators oversee inventory usage.

The coursework requires delivering two versions of the system:

- **Phase 1 – Manual build (baseline)**: foundational MERN implementation without AI assistance.
- **Phase 2 – AI-assisted build**: refactored and enhanced version produced with AI tooling (Cursor).

This repository contains end-phase codebase under active development. Phase 1 can be produced by cloning this repository and following the manual build notes in `docs/phase-plan.md`.

---

## Features

- **Authentication & Roles** – Token-based login with student, staff, and admin roles.
- **Equipment Inventory** – Admin CRUD for items with category, condition, and availability tracking.
- **Borrowing Requests** – Students/staff submit requests; staff/admin approve, issue, or mark returns.
- **Conflict Prevention** – Overlapping booking checks plus quantity validation.
- **Dashboards** – Responsive React UI with equipment catalogue, loan management tables, and admin panels.
- **Developer Experience** – RESTful API, React Query data layer, modular architecture, and env-configurable URLs.

---

## Project Structure

```
fsad-LMS-MERN/
├── backend/          # Express + MongoDB API
├── frontend/         # React (Vite + TypeScript) client
└── docs/             # Architecture, API, AI usage, and phase-planning docs
```

---

## Getting Started

### Prerequisites

- Node.js 18+ (Node 20 is recommended by Vite; Node 18 works with warnings)
- npm 9+
- MongoDB 6+ (local instance or Atlas cluster)

### Backend Setup

```bash
cd backend
cp env.example .env   # update PORT, MONGO_URI, JWT_SECRET
npm install
npm run dev
```

The API boots on `http://localhost:5000` by default.

### Frontend Setup

```bash
cd frontend
cp env.example .env   # update VITE_API_URL if backend differs
npm install
npm run dev
```

Vite serves the client on `http://localhost:5173`. Ensure CORS allows this origin (already permitted in the backend).

---


The documentation set is uploaded in required portal.

---

## Scripts

| Location  | Command          | Description                           |
|-----------|------------------|---------------------------------------|
| backend   | `npm run dev`    | Start Express API with Nodemon        |
| backend   | `npm start`      | Start API in production mode          |
| frontend  | `npm run dev`    | Launch Vite dev server                |
| frontend  | `npm run build`  | Build production-ready assets         |
| frontend  | `npm run preview`| Preview production build locally      |

---

## Testing & Next Steps

- Add automated tests (Jest + Supertest for API, React Testing Library for UI).
- Integrate Swagger or Postman collection exports in `docs/api`.
- Record the dual-phase demo video and link it in documentation.
- Capture manual vs AI-assisted reflections in `docs/ai-usage-log.md`.

---

## License

This coursework submission uses the MIT license. See `LICENSE` (to be added) or consult institutional guidelines for redistribution rules.