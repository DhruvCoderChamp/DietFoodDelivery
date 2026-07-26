# My Morning: Backend Features & Architecture Guide

This document explains each backend feature implemented in the **My Morning** Spring Boot application, the technical rationale behind them ("why" they were used), and how they integrate with the React frontend, the PostgreSQL database, and the Docker deployment model.

---

## 1. Spring Boot & Spring Web (REST Controllers)

### What it is
Spring Boot is the foundation of our backend server, and Spring Web is used to expose RESTful HTTP endpoints (e.g. `/api/auth/*`, `/api/subscriptions/*`, `/api/orders/*`, and `/api/settings/*`).

### Why we used it
* **Rapid Development**: Spring Boot configures the server automatically (embedded Tomcat container), eliminating complex XML configuration.
* **Separation of Concerns**: Controllers only handle HTTP request routing and parameter mapping. Business logic is separated, making the code maintainable.
* **Frontend Connection**: Exposes standard JSON endpoints that the React frontend queries using `fetch` or Axios.
* **HTTP Status Mapping**: Utilizes `ResponseEntity<?>` to return standard REST HTTP status codes (200 OK, 201 Created, 401 Unauthorized, 403 Forbidden, 404 Not Found) so the frontend can handle errors gracefully.

---

## 2. Spring Security & Stateless JWT Authentication

### What it is
Spring Security intercepts all incoming requests to enforce authentication and authorization. We use stateless **JSON Web Tokens (JWT)** for session management.

### Why we used it
* **Stateless Scaling**: Since we deploy Nginx and Spring Boot in separate Docker containers, session affinity (cookies/sessions stored in RAM) would limit scaling. JWTs are stateless—they store session information directly inside the token, signed with a secret key.
* **Role-Based Authorization**: We use `@PreAuthorize("hasRole('ADMIN')")` on endpoints (like `/api/admin/*`) to prevent regular users from accessing administrative sheets or altering catalog pricing.
* **CORS Protection**: Enforces a strict Cross-Origin Resource Sharing (CORS) filter in `SecurityConfig.java` to prevent malicious websites from making requests to our backend.
* **Session Expiry Hook**: If a token is expired or altered, `JwtAuthenticationFilter` blocks the request and returns `401 Unauthorized`, prompting the React frontend to redirect the user to the `/login` page.

---

## 3. Spring Data JPA & Hibernate ORM

### What it is
Java Persistence API (JPA) with Hibernate acts as the Object-Relational Mapper (ORM), translating Java classes (e.g., `User`, `Subscription`, `Order`) into PostgreSQL database tables.

### Why we used it
* **DDL Auto-Update**: Using `spring.jpa.hibernate.ddl-auto=update` allows Hibernate to automatically modify PostgreSQL tables (adding columns, updating constraints) when the Java models change, avoiding manual SQL migration scripts.
* **SQL Injection Protection**: Hibernate automatically parameterizes all SQL queries. This completely neutralizes SQL injection attacks.
* **Hikari Connection Pooling**: Spring Boot automatically configures HikariCP. It dynamically creates, recycles, and monitors database connections. This is crucial for cloud databases like Neon Tech, which autosuspend connections during inactivity.
* **Query Abstraction**: Repositories (like `UserRepository` extending `JpaRepository`) let us write custom queries (such as `findFirstByPhone(String phone)`) without writing raw SQL.

---

## 4. Jackson JSON Processing (`ObjectMapper`)

### What it is
Jackson is Java's default JSON serializer/deserializer. We autowire it as `ObjectMapper` to parse complex JSON strings on the fly.

### Why we used it
* **Dynamic Workbook Storage**: The admin's 7-sheet interactive workbook contains dynamic arrays of data (Subscriptions, Pause Logs, Delivery Schedules). Instead of creating 5 new database tables with complex foreign keys, we store the entire workbook state as a single JSON text block under `excel_workbook` in `system_settings`.
* **Bi-Directional Parsing**: When a user saves a meal plan, the backend uses `objectMapper.readValue()` to parse their selected meals, groups them against the settings menu, updates the workbook JSON, and saves it. 
* **Edits Propagation**: When the admin edits the workbook, the `ObjectMapper` parses the sheets to reconstruct and update individual `subscriptions` rows in the database.

---

## 5. Spring CommandLineRunner

### What it is
A functional interface used to run a block of code immediately after the application context has fully loaded.

### Why we used it
* **Database Seeding**: In `MyMorningApplication.java`, we use `CommandLineRunner` to check if `system_settings` has the `excel_workbook` key. If the database is blank (e.g., during initial setup or database migration), it automatically inserts the default 7-sheet workbook JSON structure.
* **Avoid PostConstruct Races**: `@PostConstruct` runs before the database connection pool is fully initialized, which can cause connection errors. `CommandLineRunner` guarantees the database is ready for queries.

---

## 6. Externalized Configuration (`@Value`)

### What it is
Annotation used to inject values from properties files (`application.properties`) into Java variables.

### Why we used it
* **No Hardcoded Secrets**: By injecting variables:
  ```java
  @Value("${admin.email}")
  private String adminCheckEmail;
  ```
  we ensure that credentials like the admin email and password are not hardcoded in the compiled Java classes.
* **Environment Overrides**: Configured in `application.properties` as `${ADMIN_EMAIL:default}`, allowing us to pass custom variables in production (via Docker or host environment variables) to override local development defaults.

---

## 7. Integration: How Frontend, Backend, and Database Connect

```
[React Client] (Vite, Port 5173/Production)
      │
      ▼  (HTTP POST /api/subscriptions/save with Bearer JWT)
[Nginx Reverse Proxy] (Container Port 80/443)
      │
      ▼  (Proxies to port 8080)
[Spring Boot API] (Container Port 8080)
      │
      ├─► [Spring Security / JwtFilter] (Validates token and role)
      ├─► [SubscriptionController] (Maps body JSON to Java Subscription entity)
      ├─► [Jackson ObjectMapper] (Merges new subscription into excel_workbook JSON)
      │
      ▼  (Hikari Database Connection Pool)
[PostgreSQL Database] (Neon Tech Cloud / Local Port 5432)
```

1. **Client Action**: The customer builds their meal plan in React. Clicking "Confirm" triggers `authFetch`, sending a POST request to Nginx.
2. **Reverse Proxying**: Nginx routes the request internally to the Spring Boot Docker container.
3. **Security Interception**: Spring Security validates the JWT in the header. If valid, the request continues to `SubscriptionController`.
4. **Data Sync**: The backend writes the individual subscription to the `subscriptions` table and updates the admin's workbook JSON.
5. **Database Transaction**: Hibernate communicates with PostgreSQL using secure, pooled connections to commit the changes.
