Run inside Docker (recommended)
------------------------------

```bash
UID=$(id -u) GID=$(id -g) docker compose up --build
```

Local dev (without Docker)
--------------------------

```bash
cd frontend
npm install
npm run dev
```

