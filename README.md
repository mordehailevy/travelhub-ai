# TravelHub AI

Full-stack vacations platform — MongoDB · Node.js/Express (TypeScript) · React (TypeScript) · OpenAI.

Registered users browse vacations and like/unlike them; admins manage the catalog, view an engagement report,
and export it as CSV. Two AI features are included: a per-destination trip recommendation, and a natural-language
"ask the data" assistant backed by an in-process MCP server.

GitHub repository: https://github.com/mordehailevy/travelhub-ai

## Project structure

```
TravelHub AI/
├── Backend/    Express + TypeScript API, MongoDB models, MCP server, OpenAI integration
├── Frontend/   React + TypeScript client (Vite)
├── Database/   Mongo export (added at submission time, see below)
└── docker-compose.yml
```

## Prerequisites

- Node.js 20+
- MongoDB (local, or via Docker)
- An OpenAI API key (for the AI Recommendation page and the "Ask the data" MCP page)

## 1. Configure environment variables

```bash
cp Backend/.env.example Backend/.env
cp Frontend/.env.example Frontend/.env
```

Edit `Backend/.env` and set `OPENAI_API_KEY` to your own key (platform.openai.com/api-keys). Without it, every
other feature still works — only the two AI pages will return an error.

## 2. Run locally (without Docker)

```bash
# Backend
cd Backend
npm install
npm run seed   # creates 1 admin + 1 user + 14 sample vacations
npm run dev    # http://localhost:4000

# Frontend (in a second terminal)
cd Frontend
npm install
npm run dev    # http://localhost:5173
```

Seeded accounts:

| Role  | Email                | Password   |
| ----- | --------------------- | ---------- |
| Admin | admin@travelhub.ai    | admin1234  |
| User  | user@travelhub.ai     | user1234   |

## 3. Run with Docker

```bash
docker compose up -d --build
```

This starts MongoDB, the backend API (port 4000) and the frontend (port 5173). Run the seed script once against
the containerized database:

```bash
docker compose exec backend node dist/seed.js
```

## API

The full endpoint list and a Postman collection are documented under `Backend/`. Import
`Backend/postman-collection.json` into Postman to try every route.

## Notes on the MCP server

The "Ask the data" page is powered by a real MCP server (`Backend/src/mcp/server.ts`) exposing tools such as
`get_active_vacations_count`, `get_average_price`, `get_future_vacations` and `get_most_liked_vacations`. An
in-process MCP client (`Backend/src/mcp/client.ts`) connects to it over an in-memory transport, and
`POST /api/mcp/ask` lets OpenAI pick and call the right tool(s) before answering the user's question in natural
language.
