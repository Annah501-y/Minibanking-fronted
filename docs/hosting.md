# Frontend hosting

The frontend is a static single-page application. The production build is written to `dist/`.

## Values required for a production build

Set these values in the hosting provider's build environment before building:

| Variable | Required | Example | Notes |
| --- | --- | --- | --- |
| `VITE_API_BASE_URL` | Yes | `https://api.example.com` | Public origin of the deployed Spring Boot API, with no trailing slash. It must use HTTPS in production. |
| `VITE_CURRENCY_CODE` | No | `TZS` | Defaults to Tanzanian shillings (`TZS`). |

Vite embeds `VITE_*` values into the generated browser files at build time. Changing a value in the host dashboard requires a new build and deployment. Do not put passwords, signing keys, database credentials, or other secrets in frontend environment variables.

## Static hosting requirements

- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm ci`
- Rewrite unknown application paths to `/index.html`. This is required for direct visits and refreshes on paths such as `/dashboard`, `/transactions`, and `/admin`.
- Keep static asset paths available under `/`.

## Spring Boot API requirements

- Deploy the API separately and provide its public HTTPS origin as `VITE_API_BASE_URL`.
- Configure Spring Security CORS to allow the exact frontend origin (for example, `https://bank.example.com`) and the methods/headers used by the API, including `Authorization` and `Content-Type`.
- The frontend sends bearer tokens in the `Authorization` header. The API must accept cross-origin `Authorization` requests and handle browser preflight `OPTIONS` requests.
- Keep authentication, authorization, and role checks enforced by the API. Hiding an admin link or page in the frontend is not an access-control boundary.
- Confirm the API's production OpenAPI URL and health endpoint after deployment. The frontend does not require Swagger to be publicly enabled.

## Deployment sequence

1. Deploy the Spring Boot API and database using the backend's deployment configuration.
2. Set the production CORS allowlist to the final frontend origin.
3. Set `VITE_API_BASE_URL` and `VITE_CURRENCY_CODE` in the frontend host's project settings.
4. Build and deploy the `dist/` directory using the host's static-site workflow.
5. Verify that direct navigation and refresh work on `/login`, `/register`, `/dashboard`, `/transactions`, and `/admin`.
6. Verify registration, login, account loading, and a transaction using a non-production account. Confirm the browser has no CORS or mixed-content errors.

The root `Dockerfile` and `nginx.conf` provide the container deployment configuration. They serve the production build on port 80, return a health response at `/healthz`, and route client-side application URLs back to `index.html`.
