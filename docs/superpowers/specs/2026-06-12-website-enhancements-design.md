# My Morning Website Enhancements Design

## Goal

Improve SEO, menu categorization, mobile layouts, subscription persistence and reporting, daily homepage image management, subscription meal selection, and displayed contact details.

## Scope

### SEO and Homepage

- Update `index.html` with stronger description, keyword, Open Graph, canonical, and local-service metadata.
- Add JSON-LD describing My Morning as a Bangalore food delivery service.
- Keep the current approved marketing copy until Vicky provides replacement text.
- Load the hero image from the public `homepage_image` setting, with the existing Unsplash image as the fallback.

### Categories and Mobile Layout

- Normalize product category identifiers to `bowls`, `smoothies`, `combos`, `breakfast`, and `eggitarian`.
- Remove Keto from customer and admin category choices.
- Use two product cards per row at widths up to 600px for the menu and homepage featured menu.
- Reduce mobile card gaps, image heights, padding, typography, badges, metadata, prices, and button sizes to prevent overlap.

### Subscription Location and Persistence

- Add `deliveryArea` and `address` string columns to `Subscription`.
- Include both fields when creating or updating a subscription.
- Add delivery area, exact address, and delivery slot controls to the subscription setup.
- Persist plan, mode, meals, delivery area, address, and delivery slot under `mm_sub_data`.
- Require a logged-in user, delivery area, and exact address before confirming a routine.
- POST the routine to `/api/subscriptions/save` before opening WhatsApp.
- Include delivery area, exact address, and delivery slot in the WhatsApp message.
- Preserve the current routine locally if the backend request fails and show a clear error instead of opening WhatsApp.

### Subscription Accordion

- Group available products by normalized category.
- Render Bowls, Smoothies, Combos, Breakfast, and Eggitarian in that order.
- Each category header toggles its item list and shows the number of selected items in that category.
- Search filters products inside the grouped accordion.
- At least the first category containing products is expanded initially; users can independently expand or collapse categories.
- Existing quantity add/remove behavior remains unchanged.

### Subscription Reports

- Add admin-only `GET /api/admin/subscriptions/all`.
- Return subscription records enriched with customer name and phone from the user repository.
- Fetch subscription data when the admin area loads.
- Add a dedicated subscription report card/table and Excel export in the Reports tab.
- Export customer name, phone, plan, status, delivery slot, selected meals, delivery area, exact address, start date, and remaining days.
- Convert `mealsJson` into readable day-and-item text when valid; retain the raw value if parsing fails.

### Homepage Image Setting

- Add a `SystemSetting` entity with a unique string key and a text value.
- Add a standard JPA repository.
- Add public `GET /api/settings/{key}` and admin-only POST/DELETE endpoints at `/api/admin/settings/{key}`.
- Permit `/api/settings/**` in Spring Security while retaining the existing admin protection for writes.
- The admin selects an image file through a file input. The frontend validates that it is an image, resizes it to a practical hero width, compresses it as JPEG, and saves the resulting data URL as `homepage_image`.
- The Reports tab contains the current preview, upload/replace action, and delete/reset action.
- Deleting the setting immediately restores the default homepage image.
- Reject empty values and values larger than the configured request limit.

### Contact Details

Display these contacts consistently:

- `Vivek: +91 91875 32042`
- `Thejesh: +91 91875 42042`
- `Bindu: +91 91777 82042`

Update the footer, order confirmation help panel, and contact page. Remove role brackets and use `Name: Phone`.

## Data Flow

### Subscription Confirmation

1. The customer selects a plan, meals, delivery area, exact address, and delivery slot.
2. The browser writes the complete draft to `mm_sub_data`.
3. Confirmation serializes the meal plan into `mealsJson` and posts the subscription with the authenticated user's ID.
4. The backend creates or updates the user's subscription.
5. Only after a successful save does the browser open the prepared WhatsApp message.

### Homepage Image

1. An admin selects an image.
2. The browser validates, resizes, and compresses it into a data URL.
3. The admin POST endpoint upserts `homepage_image`.
4. The homepage reads the public setting and displays its value.
5. Deletion removes the row, causing the homepage fallback to be used.

## Error Handling

- Public setting reads return 404 when a key is absent; the homepage treats this as normal fallback behavior.
- Admin setting writes return 400 for blank or oversized values.
- Subscription confirmation displays validation or network errors and does not launch WhatsApp until persistence succeeds.
- Admin reports tolerate missing users and malformed historical meal JSON.
- Image preview and controls expose loading/saving states and preserve the previous image when an update fails.

## Testing

- Backend controller tests cover public setting reads, admin setting upsert/delete authorization behavior, subscription field persistence, and admin subscription listing.
- Frontend helper tests cover category normalization/grouping, selected counts, meal export formatting, and subscription payload construction where the current toolchain permits focused tests.
- Run Maven tests, ESLint, and the Vite production build.
- Verify the homepage, menu, subscription planner, admin reports/image controls, and contact displays in the browser at desktop and mobile widths.

## Non-Goals

- No external object-storage integration.
- No image history or scheduling; only the current homepage image is stored.
- No replacement marketing description beyond the currently approved copy.
- No unrelated admin-panel refactor.
