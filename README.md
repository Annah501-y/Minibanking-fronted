# Mini Banking System Frontend

React and Vite frontend for the Mini Banking System Spring Boot API. It includes registration and login, an authenticated account overview, deposit/withdraw/transfer flows, filtered transaction history, account profile details, and the admin customer/account console.

## Run locally

Requirements: Node.js 20.19+ or 22.12+, and the Spring Boot API running at `http://localhost:8080`.

```powershell
npm install
npm run dev
```

Vite proxies `/api` requests to `http://localhost:8080`. Open the local URL printed by Vite. The registration page is `/register`; protected pages include `/dashboard`, `/deposit`, `/withdraw`, `/transfer`, `/transactions`, `/profile`, and `/admin`.

## API endpoints currently used

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Create a customer and their initial account |
| `POST` | `/api/auth/login` | Authenticate and receive a bearer token |
| `GET` | `/api/auth/me` | Read the signed-in user's role (`USER` or `ADMIN`) |
| `POST` | `/api/admin/admins` | Create an administrator from the protected admin dashboard |
| `GET` | `/api/account` | Load the signed-in customer's account holder, number, and balance |
| `GET` | `/api/account/transactions?page=0&size=5` | Load recent activity for the overview |
| `POST` | `/api/account/deposit` | Deposit an amount into the signed-in account |
| `POST` | `/api/account/withdraw` | Withdraw an amount from the signed-in account |
| `POST` | `/api/account/transfer` | Transfer an amount to a 10-digit recipient account |
| `GET` | `/api/account/transactions?page={page}&size={size}&type={type}&from={date-time}&to={date-time}` | Paginated, optionally filtered transaction history |
| `GET` | `/api/admin/users?page={page}&size={size}` | Paginated administrator customer directory |
| `GET` | `/api/admin/accounts?page={page}&size={size}` | Paginated administrator account directory |

Registration validates the OpenAPI requirements: full name up to 150 characters, email up to 255 characters, E.164 phone number, and password 8 to 72 characters. Deposit and withdrawal amounts must be at least `0.01`; transfer recipient account numbers must contain 10 digits. The access token is stored in browser local storage. Authenticated API `401` responses clear the session.

After login, the frontend calls `GET /api/auth/me` and routes `USER` accounts to `/dashboard` and `ADMIN` accounts to `/admin`. Saved sessions are checked through the same endpoint before protected pages render. Public registration uses `/api/auth/register` to create a normal user, then signs them in and directs them to their user dashboard. The admin dashboard submits administrator creation to `POST /api/admin/admins`; backend authorization decides which signed-in administrators may create other administrators.

## Currency

The backend account schema returns a numeric balance without a currency field. The frontend displays Tanzanian shillings using `TZS` and the `TSh` symbol. Set `VITE_CURRENCY_CODE` in `.env.local` if the backend currency changes.

The profile page uses the fields returned by `GET /api/account`. The API documentation currently does not define a separate profile endpoint or return email and phone number from the account response, so the frontend does not display or edit those fields.

## Environment and hosting

See `.env.example` for local values and [docs/hosting.md](docs/hosting.md) for production build settings, SPA route rewrites, API CORS requirements, and a deployment checklist. `VITE_API_BASE_URL` can be set to a public Spring Boot API origin for deployment; keep it empty for local Vite proxying. `VITE_CURRENCY_CODE` defaults to `TZS`. These values are public frontend configuration and must not contain secrets.

Build the deployable static site with `npm run build`; Vite writes it to `dist/`. The root `Dockerfile` is the configured production hosting option for a container platform.

### Docker container hosting

The root `Dockerfile` builds the React app and serves it with Nginx. The Nginx config includes a health endpoint and SPA fallback for direct route navigation.

Build the image from PowerShell, passing the public URL of the deployed backend API:

```powershell
docker build --build-arg VITE_API_BASE_URL="https://api.example.com" --build-arg VITE_CURRENCY_CODE="TZS" -t minibanking-frontend:latest .
```

Run it locally:

```powershell
docker run --rm -p 8081:80 minibanking-frontend:latest
```

Open `http://localhost:8081`. Check `http://localhost:8081/healthz` for the container health response. Replace `https://api.example.com` with the actual public HTTPS API origin before building the production image. The frontend image contains no backend secrets. Configure backend CORS to allow the final frontend origin as described in [docs/hosting.md](docs/hosting.md).
