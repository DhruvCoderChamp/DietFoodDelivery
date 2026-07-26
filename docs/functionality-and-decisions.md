# My Morning Functionality and Technical Decisions

This document lists the functionality currently covered in this repository and records the main frontend, backend, and database decisions for the My Morning diet food delivery platform.

## Product Summary

My Morning is a meal delivery application with two primary experiences:

- A customer-facing React app for browsing meals, managing cart checkout, placing orders, and creating meal subscriptions.
- An admin-facing operations panel for managing products, orders, subscriptions, and the workbook-style delivery data used by the business team.

The repo is split into:

- `src/`: React/Vite frontend.
- `backend/`: Spring Boot REST API.
- `docs/`: project documentation.
- `Dockerfile`, `backend/Dockerfile`, `docker-compose.yml`, and `nginx.conf`: deployment assets.

## Functionality Covered

### Customer Frontend

- Home page with featured menu/product presentation.
- Menu browsing with product cards, categories/tags, availability display, cart actions, and paginated product loading from `/api/products`.
- Cart management with add, remove, quantity update, total item count, and total price calculation.
- Checkout flow for authenticated users.
- Delivery details capture, including customer details, address, location detection support, and delivery time slot generation.
- Payment page as part of the order flow.
- Order confirmation page after order placement.
- Customer order history page via authenticated order APIs.
- Subscription planner for meal plans.
- Legal/support pages:
  - Terms
  - Privacy
  - Refund
  - Contact
- Navbar and footer shared layout, hidden on admin/login flows where appropriate.

### Authentication and Session Handling

- Admin login through `/api/auth/login`.
- Customer phone login/registration through `/api/auth/phone`.
- Firebase client-side OTP support is present in the frontend setup.
- Backend returns JWT tokens after successful auth.
- `AuthContext` stores user and token in `localStorage`.
- `authFetch` automatically attaches `Authorization: Bearer <token>` to protected API requests.
- Expired or invalid sessions are handled by clearing auth state and redirecting users to `/login`.
- Role checks support admin-only frontend routes.

### Cart and Product State

- Cart state is stored in React context and persisted in `localStorage` under `mm_cart`.
- Manual logout clears cart state.
- Product data is stored in `ProductsContext`.
- Product first-page data is cached in `localStorage` under `mm_products_backup`.
- Product refresh is triggered through a custom `mm-products-updated` browser event after admin product changes.

### Admin Frontend

- Admin-only route at `/admin`.
- Admin product management:
  - Create products.
  - Edit product name, price, calories, protein, category, description, tags, badge, vegetarian flag, availability, image, and ordering.
  - Upload image data.
  - Reorder products with drag-and-drop support using `@dnd-kit`.
  - Delete products.
- Admin order management:
  - View all orders.
  - Update order status.
  - Delete all orders.
- Admin subscription management:
  - View subscriptions with customer names and phone numbers.
- Admin workbook operations:
  - Daily Orders
  - Customers
  - Subscriptions
  - Pause Log
  - Delivery Schedule
  - Meal Preferences
  - Settings
- Workbook calculations include subscription duration, pause-day handling, effective end dates, next delivery date, and today's delivery list.
- Workbook persistence uses `/api/admin/settings/excel_workbook`.
- Workbook export/import-style capability is supported through the `xlsx` dependency and workbook-shaped frontend state.

### Backend APIs

#### Health

- `GET /api/health`: backend health check.

#### Auth

- `POST /api/auth/login`: admin credential login and JWT issuance.
- `POST /api/auth/phone`: customer phone login/registration and JWT issuance.
- `GET /api/auth/me`: validates JWT and returns the current user.

#### Products

- `GET /api/products`: returns all menu items or a paginated product response when `page` and `size` are provided.
- `GET /api/products/{id}/image`: returns stored product image bytes or redirects to external image URLs.
- `POST /api/admin/products`: creates a menu item.
- `PUT /api/admin/products/{id}`: updates a menu item.
- `PUT /api/admin/products/reorder`: updates product display order.
- `DELETE /api/admin/products/{id}`: deletes a menu item.

#### Orders

- `GET /api/orders`: admin-only list of all orders.
- `GET /api/orders/{orderId}`: fetches one order by public order ID.
- `GET /api/orders/user/{userId}`: authenticated user order history.
- `POST /api/orders`: authenticated order creation.
- `PUT /api/admin/orders/{id}`: admin order status update.
- `DELETE /api/admin/orders/all`: admin bulk order deletion.

#### Subscriptions

- `POST /api/subscriptions/save`: creates or updates a user's subscription and syncs it into the workbook.
- `GET /api/subscriptions/user/{userId}`: fetches a user's subscription.
- `GET /api/admin/subscriptions/all`: admin list of all subscriptions with customer details.

#### Settings

- `GET /api/settings/{key}`: reads a named setting.
- `POST /api/admin/settings/{key}`: saves a named setting.
- `DELETE /api/admin/settings/{key}`: deletes a named setting.
- Saving the `excel_workbook` setting also syncs workbook subscription rows back into the relational `subscriptions` table.

### Backend Security

- Spring Security protects authenticated endpoints.
- JWT authentication filter validates bearer tokens.
- Role-based access control is used for admin actions.
- CORS is configured for the React frontend and production domain.
- Admin credentials are injected through properties/environment variables.
- Global exception handling exists for cleaner API errors.

### Database Functionality

The backend uses Spring Data JPA/Hibernate with PostgreSQL.

Current persisted entities:

- `users`
  - Stores customer identity, phone, name, role, created timestamp, and last login.
- `menu_item`
  - Stores product catalog data, nutrition fields, category, description, image data or image URL, tags, availability, vegetarian flag, badge, and display order.
- `orders`
  - Stores order ID, user/customer data, address, total amount, status, time slot, creation time, and order items.
- `order_item`
  - Stores product ID, item name, quantity, and price.
- `subscriptions`
  - Stores user plan type, status, delivery slot, delivery area, address, selected meals JSON, start date, and remaining days.
- `system_settings`
  - Stores key/value settings, including the `excel_workbook` JSON blob.

### Deployment and Operations

- Frontend builds with Vite.
- Production frontend is served through Nginx.
- Nginx reverse proxies `/api/*` requests to the backend container.
- Backend runs as a Spring Boot service on port `8080`.
- Docker Compose defines frontend and backend services on a shared bridge network.
- PostgreSQL is configured through environment variables and currently points to a Neon PostgreSQL database.
- Backup and migration helper scripts exist:
  - `backup-now.sh`
  - `backup-now.ps1`
  - `find-my-data.sh`
  - `migrate-data.sh`

## Frontend Decisions

### Framework

Decision: Use React with Vite.

Reason:

- The app is a single page application with several customer and admin screens.
- Vite gives fast local development and a simple production build.
- React Context is enough for current auth, cart, and product state without adding Redux or another state library.

### Routing

Decision: Use `react-router-dom`.

Reason:

- The app has clear route-level pages for customer, auth, admin, legal, and support flows.
- `RequireAuth` and `RequireAdmin` wrappers keep route protection simple.

### Styling

Decision: Use page/component CSS files.

Reason:

- The repo already follows vanilla CSS per page and component.
- This keeps the app lightweight and avoids introducing a design system dependency before the product needs it.

### State Management

Decision: Use React Context plus `localStorage`.

Reason:

- Auth, cart, and product cache are app-wide but not complex enough for a heavier global store.
- `localStorage` preserves cart and login state across refreshes.

Tradeoff:

- JWTs in `localStorage` are easy to use but more exposed to XSS than HttpOnly cookies. This should be revisited before scaling sensitive production usage.

### Product Loading

Decision: Use paginated `/api/products?page=<page>&size=6` loading with local first-page cache.

Reason:

- Keeps the first screen fast.
- Avoids repeatedly loading large image payloads.
- Backend image endpoint supports image loading separately.

### Admin UX

Decision: Keep admin operations in one admin dashboard.

Reason:

- The business workflow is operational and spreadsheet-like.
- A single dashboard reduces navigation cost for daily order and subscription management.

## Backend Decisions

### Framework

Decision: Use Spring Boot 3 with Java 17.

Reason:

- Strong fit for REST APIs, JPA persistence, security, validation, and Docker deployment.
- Existing codebase already uses Spring idioms cleanly through controllers, repositories, entities, and config classes.

### API Style

Decision: Use JSON REST endpoints under `/api`.

Reason:

- Works naturally with the React frontend.
- Keeps Nginx proxying simple.
- Makes endpoints easy to test and extend.

### Authentication

Decision: Use Firebase OTP on the frontend for customer phone verification, then issue backend JWTs for API access.

Reason:

- Firebase handles OTP delivery and verification complexity.
- Backend JWTs keep API authorization under application control.

### Admin Authentication

Decision: Use environment-backed admin email/password for the current admin login.

Reason:

- Fast and simple for a single-admin or early-stage operations model.

Next decision:

- Move admin users into the database with password hashing and account lifecycle management when multiple admin users, auditability, or password reset flows are needed.

### Authorization

Decision: Use Spring Security and `@PreAuthorize` for admin and authenticated endpoints.

Reason:

- Keeps authorization close to the API methods.
- Makes admin-only operations explicit.

### Product Images

Decision: Store product images as either external URLs or base64/text data and serve them through `/api/products/{id}/image`.

Reason:

- Keeps product editing simple for the admin flow.
- Allows current catalog management without a separate object storage service.

Tradeoff:

- Base64 image data in PostgreSQL can grow quickly. For larger catalogs, move image files to object storage and keep URLs/metadata in the database.

### Workbook Sync

Decision: Store the admin workbook as JSON in `system_settings.excel_workbook` and sync it with subscription rows.

Reason:

- The business workflow is spreadsheet-shaped and likely to change.
- JSON avoids frequent schema migrations for workbook tabs and columns.
- The backend keeps customer subscription data and admin workbook data in sync both directions.

Tradeoff:

- Large JSON blobs are harder to query, validate, diff, and audit than normalized tables.

## Database Decisions

### Database

Decision: Use PostgreSQL.

Reason:

- Relational data fits users, orders, order items, menu items, and subscriptions.
- PostgreSQL also handles text/JSON-like settings storage well.
- Neon PostgreSQL supports managed cloud hosting.

### ORM

Decision: Use Spring Data JPA/Hibernate.

Reason:

- Reduces boilerplate for CRUD operations.
- Gives repository abstractions like `findFirstByPhone`, `findByUserId`, and `findByOrderId`.
- Parameterized ORM queries reduce SQL injection risk.

### Schema Management

Decision: Use `spring.jpa.hibernate.ddl-auto=update`.

Reason:

- Convenient during active development.
- Lets entity changes update tables automatically.

Production decision:

- Replace `ddl-auto=update` with explicit migrations using Flyway or Liquibase before the schema becomes business-critical.

### Workbook Data Model

Decision: Keep operational workbook data in `system_settings` as a single JSON text value.

Reason:

- Flexible for seven-sheet admin workflows.
- Supports quick iteration on columns and admin calculations.

Future migration point:

- Normalize workbook sheets into dedicated tables when filtering, reporting, audit history, or concurrent edits become important.

### Current Tables and Ownership

- `users`: owned by authentication/customer identity.
- `menu_item`: owned by admin catalog management.
- `orders` and `order_item`: owned by checkout/order flow.
- `subscriptions`: owned by customer subscription planner and admin subscription tools.
- `system_settings`: owned by global settings and workbook persistence.

## Infrastructure Decisions

### Containers

Decision: Use Docker for frontend and backend.

Reason:

- Keeps deployment repeatable.
- Separates Nginx static serving from Spring Boot API execution.

### Reverse Proxy

Decision: Use Nginx in front of the app.

Reason:

- Serves compiled frontend assets efficiently.
- Proxies `/api/*` to backend.
- Supports HTTPS certificate mounting.

### Configuration

Decision: Read backend database and admin config from environment-backed Spring properties.

Reason:

- Allows local and production values to differ without code changes.

Risk to fix:

- `docker-compose.yml` currently contains database credentials in plain text. Move them into an ignored `.env` file, Docker secrets, or server-managed environment variables and rotate the exposed credentials.

## Testing Covered

Frontend tests:

- `src/utils/categories.test.js`
- `src/utils/subscriptions.test.js`

Backend tests:

- `SubscriptionControllerTest`
- `SettingsControllerTest`
- `AdminSubscriptionControllerTest`

Current test focus:

- Subscription and settings synchronization behavior.
- Utility behavior for frontend subscription/category helpers.

Recommended next test coverage:

- Auth controller login and phone registration flows.
- Menu product CRUD and image endpoint behavior.
- Order creation and status updates.
- Admin route authorization failures.
- Workbook JSON validation and malformed payload handling.

## Key Risks and Next Decisions

1. Move secrets out of `docker-compose.yml` and rotate database credentials.
2. Replace admin hardcoded/default credentials with database-backed admin users and hashed passwords.
3. Move JWT storage from `localStorage` to HttpOnly secure cookies if XSS risk becomes a priority.
4. Add request validation DTOs for order, product, settings, and subscription payloads.
5. Add database migrations with Flyway or Liquibase.
6. Move large product images to object storage if image volume grows.
7. Normalize workbook tabs into relational tables when reporting, concurrency, or audit requirements increase.
8. Add rate limiting for auth and admin endpoints.
9. Add audit logging for admin changes to orders, products, and workbook settings.
10. Improve API response consistency with shared error response shapes.

## Final Architecture Decision

Keep the current architecture as a decoupled React/Vite frontend, Spring Boot REST backend, and PostgreSQL database.

This is the right decision for the current product because it supports customer ordering, subscription planning, admin operations, and production deployment without adding unnecessary infrastructure. The main near-term work should be hardening: secrets management, migrations, request validation, stronger admin identity, and broader automated tests.
