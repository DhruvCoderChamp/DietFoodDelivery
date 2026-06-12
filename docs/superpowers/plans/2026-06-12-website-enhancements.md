# My Morning Website Enhancements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver the approved SEO, category, mobile layout, subscription, reporting, homepage image, accordion, and contact improvements.

**Architecture:** Extend the existing Spring Boot API with subscription reporting and generic text settings, while keeping the React application responsible for image compression, grouped presentation, and Excel generation. Add small pure frontend helpers so category normalization, subscription payloads, and report formatting can be tested independently without restructuring the existing pages.

**Tech Stack:** React 19, Vite 8, CSS, SheetJS/xlsx, Spring Boot 3.2, Spring Data JPA, Spring Security, PostgreSQL, JUnit 5, MockMvc, Node test runner.

---

## File Map

- Create `backend/src/main/java/com/mymorning/model/SystemSetting.java`: persistent key/value settings.
- Create `backend/src/main/java/com/mymorning/repository/SystemSettingRepository.java`: setting lookup.
- Create `backend/src/main/java/com/mymorning/controller/SettingsController.java`: public reads and admin writes/deletes.
- Create `backend/src/main/java/com/mymorning/dto/AdminSubscriptionResponse.java`: enriched subscription report row.
- Create `backend/src/test/java/com/mymorning/controller/SettingsControllerTest.java`: settings behavior.
- Create `backend/src/test/java/com/mymorning/controller/SubscriptionControllerTest.java`: location persistence and reports.
- Modify `backend/src/main/java/com/mymorning/model/Subscription.java`: location fields.
- Modify `backend/src/main/java/com/mymorning/controller/SubscriptionController.java`: persist location and list admin reports.
- Modify `backend/src/main/java/com/mymorning/config/SecurityConfig.java`: public setting reads.
- Create `src/utils/categories.js`: normalized category definitions and grouping.
- Create `src/utils/subscriptions.js`: payload and report formatting.
- Create `src/utils/categories.test.js`: category helper tests.
- Create `src/utils/subscriptions.test.js`: subscription helper tests.
- Modify `package.json`: frontend test script.
- Modify `index.html`: SEO and JSON-LD.
- Modify `src/data/menuData.js`: normalized categories without Keto.
- Modify `src/pages/Home.jsx`: dynamic homepage image.
- Modify `src/pages/Home.css`: two-column featured cards on mobile.
- Modify `src/pages/Menu.css`: two-column menu cards on mobile.
- Modify `src/pages/Subscription.jsx`: location fields, persistence, API save, WhatsApp details, accordion.
- Modify `src/pages/Subscription.css`: setup and accordion styling.
- Modify `src/pages/Admin.jsx`: normalized categories, subscription reports, image management.
- Modify `src/pages/Admin.css`: report and image controls.
- Modify `src/components/Footer.jsx`: contact formatting and Bindu.
- Modify `src/pages/OrderConfirmation.jsx`: contact formatting and Bindu.
- Modify `src/pages/legal/Contact.jsx`: contact formatting and Bindu.

### Task 1: Backend subscription behavior

- [ ] **Step 1: Write failing controller tests**

Add tests that save a subscription with `deliveryArea` and `address`, update an existing subscription with those fields, and return enriched admin rows containing user name and phone.

- [ ] **Step 2: Run tests and verify RED**

Run: `mvn -Dtest=SubscriptionControllerTest test`

Expected: compilation or assertion failure because the fields and admin endpoint do not exist.

- [ ] **Step 3: Implement minimal backend changes**

Add the two fields, copy them during update, inject `UserRepository`, and map `repository.findAll()` into `AdminSubscriptionResponse` at `GET /api/admin/subscriptions/all`.

- [ ] **Step 4: Run tests and verify GREEN**

Run: `mvn -Dtest=SubscriptionControllerTest test`

Expected: PASS.

### Task 2: System settings API

- [ ] **Step 1: Write failing controller tests**

Cover missing public setting, existing public setting, admin upsert, blank-value rejection, oversized-value rejection, and delete.

- [ ] **Step 2: Run tests and verify RED**

Run: `mvn -Dtest=SettingsControllerTest test`

Expected: compilation failure because settings classes do not exist.

- [ ] **Step 3: Implement entity, repository, controller, and security rule**

Store `settingKey` as a unique column and `value` as `TEXT`. Return `{ "key": ..., "value": ... }`, cap values at 10 MB, and permit `/api/settings/**`.

- [ ] **Step 4: Run tests and verify GREEN**

Run: `mvn -Dtest=SettingsControllerTest test`

Expected: PASS.

### Task 3: Frontend pure helpers

- [ ] **Step 1: Add failing Node tests**

Test normalization of legacy names such as `Protein Bowl`, grouping available products in the approved order, selected counts, subscription payload construction, and readable meal export formatting.

- [ ] **Step 2: Run tests and verify RED**

Run: `npm test`

Expected: module-not-found failures for the helper modules.

- [ ] **Step 3: Implement helpers and test script**

Use dependency-free ES modules compatible with Node's built-in test runner.

- [ ] **Step 4: Run tests and verify GREEN**

Run: `npm test`

Expected: PASS.

### Task 4: Categories, SEO, and responsive cards

- [ ] **Step 1: Update category data and admin choices**

Use lowercase category values and remove Keto.

- [ ] **Step 2: Add SEO metadata**

Add canonical URL, expanded Open Graph fields, Twitter card metadata, geo metadata, and JSON-LD for My Morning.

- [ ] **Step 3: Update mobile card CSS**

At `max-width: 600px`, keep two columns and compact image heights, gaps, bodies, descriptions, metadata, prices, and buttons. Add a narrower fallback only when necessary below 360px.

- [ ] **Step 4: Run static verification**

Run: `npm run lint`

Expected: no new lint errors.

### Task 5: Subscription experience

- [ ] **Step 1: Integrate tested helpers and persisted location fields**

Restore and save plan, mode, meals, delivery area, exact address, and delivery slot in `mm_sub_data`.

- [ ] **Step 2: Add confirmation persistence**

Validate login/location, POST the tested payload, handle errors, and only then open the WhatsApp URL containing location and slot details.

- [ ] **Step 3: Replace the flat list with category accordions**

Keep search and quantity controls while grouping only active products. Show selected counts in headers and support independent expand/collapse state.

- [ ] **Step 4: Add premium responsive styling**

Style location inputs, accordion headers, selected counts, item rows, and saving state.

- [ ] **Step 5: Run tests and lint**

Run: `npm test`

Run: `npm run lint`

Expected: PASS with no new errors.

### Task 6: Admin subscription reports and homepage image

- [ ] **Step 1: Fetch subscriptions and current image**

Load admin subscriptions with the existing authenticated fetch and load the public image setting.

- [ ] **Step 2: Add subscription report UI and export**

Display a compact table and export all approved fields using `formatMealsForReport`.

- [ ] **Step 3: Add image upload, preview, save, and delete**

Validate image MIME/size, resize to a maximum width of 1600 px, compress as JPEG, POST `{ value: dataUrl }`, and DELETE to reset.

- [ ] **Step 4: Load the image on the homepage**

Fetch `homepage_image` on mount and use the fallback when absent or invalid.

- [ ] **Step 5: Run tests and lint**

Run: `npm test`

Run: `npm run lint`

Expected: PASS with no new errors.

### Task 7: Contact details

- [ ] **Step 1: Update all three contact surfaces**

Display `Vivek:`, `Thejesh:`, and `Bindu:` with their approved phone numbers and matching `tel:` links.

- [ ] **Step 2: Run lint**

Run: `npm run lint`

Expected: no new errors.

### Task 8: Full verification

- [ ] **Step 1: Run backend suite**

Run: `mvn test`

Expected: BUILD SUCCESS.

- [ ] **Step 2: Run frontend suite**

Run: `npm test`

Run: `npm run lint`

Run: `npm run build`

Expected: all tests pass and Vite produces `dist`.

- [ ] **Step 3: Browser verification**

Open the local frontend and verify homepage fallback/image replacement, menu two-column mobile layout, subscription validation/save/accordion, admin subscription export/image controls, and contact labels.

- [ ] **Step 4: Review final diff**

Run: `git diff --check`

Run: `git status --short`

Expected: no whitespace errors and only intended files changed.
