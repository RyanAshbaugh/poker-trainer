# poker-trainer
Poker Trainer – Next.js + Three.js + Flask
================================================

Quick start
-----------

1. Build with your host UID/GID so files are owned by you:

```bash
UID=$(id -u) GID=$(id -g) docker compose up --build
```

2. Open the app at `http://localhost:3000` (frontend). Backend health at `http://localhost:5000/healthz`.

Overview
--------

- Frontend: Next.js (React 18) with Three.js via `@react-three/fiber`.
- Backend: Flask with a placeholder `/api/coach` route.
- Docker: Non-root user inside containers mapped to host UID/GID (inspired by `habit-goal`).

Project structure
-----------------

- `frontend/`: Next.js app. `pages/index.tsx` renders the three areas: table (left), controls and chatbot, GTO panel (right).
- `backend/`: Flask API. Extend `server.py` for real logic/LLM.
- `docker-compose.yml`: builds and runs both services.

Notes
-----

- Environment: `NEXT_PUBLIC_BACKEND_URL` controls backend URL in the browser.
- Dev workflow: Edit code on host; volumes sync into containers.
