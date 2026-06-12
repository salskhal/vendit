# Vendit — Vending Machine API

A vending machine REST API with a React frontend. Sellers manage products; buyers deposit coins and make purchases. Built with NestJS, PostgreSQL, and React + TanStack Router.

---

## Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL 15+

---

## Setup

**1. Clone and install dependencies**

```bash
# Backend
cd server
pnpm install

# Frontend
cd ../client
pnpm install
```

**2. Configure environment**

```bash
cd server
cp .env.example .env
```

Open `server/.env` and fill in your values:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=your_postgres_password
DB_NAME=vendit
DB_NAME_TEST=vendit_test

JWT_SECRET=a_long_random_secret_string

PORT=3000
NODE_ENV=development
```

**3. Create the databases**

```bash
psql -U postgres -c "CREATE DATABASE vendit;"
psql -U postgres -c "CREATE DATABASE vendit_test;"
```

The schema is auto-created on first boot via TypeORM `synchronize`.

---

## Running the App

**Backend** (port 3000)

```bash
cd server
pnpm start:dev
```

**Frontend** (port 5173)

```bash
cd client
pnpm dev
```

---

## Running Tests

```bash
cd server
pnpm test:e2e
```

Tests run against the `vendit_test` database and clean up after themselves.

---

## API Reference

### Auth

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/login` | No | Login — returns JWT |
| POST | `/auth/logout` | Yes | Invalidate current session |
| POST | `/auth/logout/all` | Yes | Invalidate all sessions |

### Users

| Method | Path | Auth | Role | Description |
|---|---|---|---|---|
| POST | `/user` | No | — | Register new account |
| GET | `/user/me` | Yes | Any | Get own profile |
| PUT | `/user/:id` | Yes | Own account | Update own account |
| DELETE | `/user/:id` | Yes | Own account | Delete own account |

### Products

| Method | Path | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/products` | No | Any | List all products |
| GET | `/products/:id` | No | Any | Get single product |
| POST | `/products` | Yes | seller | Create product |
| PUT | `/products/:id` | Yes | seller (own) | Update own product |
| DELETE | `/products/:id` | Yes | seller (own) | Delete own product |

### Vending

| Method | Path | Auth | Role | Description |
|---|---|---|---|---|
| POST | `/deposit` | Yes | buyer | Deposit a coin (5/10/20/50/100 cents) |
| POST | `/buy` | Yes | buyer | Purchase a product |
| POST | `/reset` | Yes | buyer | Reset deposit to 0 |

---

## Postman Collection

Import `server/postman/vendit.postman_collection.json` into Postman.

The collection uses variables `buyerToken` and `sellerToken` — run the **Login (buyer)** and **Login (seller)** requests first to populate them automatically via test scripts.
