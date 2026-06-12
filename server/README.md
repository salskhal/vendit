# VendIt — Backend

NestJS REST API for the VendIt vending machine.

## Tech stack

- **NestJS** with TypeScript
- **PostgreSQL** via TypeORM
- **JWT** authentication with per-session token tracking (`jti` stored in a `sessions` table)
- **bcryptjs** for password hashing
- **class-validator** for DTO validation

## Running locally

```bash
pnpm install
cp .env.example .env   # fill in DB credentials and JWT_SECRET
pnpm start:dev         # http://localhost:3000
```

The schema is created automatically via TypeORM `synchronize` on first boot.

## Environment variables

| Variable | Description |
|---|---|
| `DB_HOST` | PostgreSQL host (default `localhost`) |
| `DB_PORT` | PostgreSQL port (default `5432`) |
| `DB_USER` | Database user |
| `DB_PASS` | Database password |
| `DB_NAME` | Main database name |
| `DB_NAME_TEST` | Test database name |
| `JWT_SECRET` | Secret used to sign JWTs |
| `JWT_EXPIRES_IN` | Token lifetime e.g. `1d`, `2h` (default `1d`) |
| `PORT` | Server port (default `3000`) |

## Running tests

```bash
pnpm test:e2e
```

Integration tests run against `DB_NAME_TEST`, seed their own data, and clean up after each suite.

Tests cover `/deposit`, `/buy`, and the products CRUD endpoints.

## API summary

### Auth
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/login` | No | Login — returns JWT + user. Returns `warning` if another session is active |
| POST | `/auth/logout` | Yes | Invalidate current session (`jti`) |
| POST | `/auth/logout/all` | Yes | Invalidate all sessions for this user |

### Users
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/user` | No | Register |
| GET | `/user/me` | Yes | Get own profile |
| PUT | `/user/:id` | Yes (own) | Update own account |
| DELETE | `/user/:id` | Yes (own) | Delete own account |

### Products
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/products` | No | List all products |
| GET | `/products/:id` | No | Get one product |
| POST | `/products` | seller | Create product |
| PUT | `/products/:id` | seller (own) | Update own product |
| DELETE | `/products/:id` | seller (own) | Delete own product |

### Vending
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/deposit` | buyer | Deposit one coin (5 / 10 / 20 / 50 / 100 cents) |
| POST | `/buy` | buyer | Purchase a product — returns `totalSpent`, `products`, `change` array |
| POST | `/reset` | buyer | Reset deposit to 0 |

## Postman collection

Import `postman/vendit.postman_collection.json`. Run **Login (buyer)** and **Login (seller)** first — their test scripts auto-populate `buyerToken` and `sellerToken` collection variables.
