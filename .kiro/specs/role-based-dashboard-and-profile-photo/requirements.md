# Requirements Document

## Introduction

This feature covers three interconnected enhancements to the Mini ERP system (Spring Boot backend + Next.js frontend):

1. **Profile Photo — MySQL Storage**: Remove the Cloudinary dependency entirely. Profile images are stored as binary data directly in the MySQL `users` table. The backend exposes a multipart upload endpoint and a binary-serving endpoint. The frontend profile page calls the new backend endpoints instead of Cloudinary.

2. **Role-Based Navigation**: The sidebar and any navigation structure show only the links that the authenticated user is permitted to access, based on their assigned `RoleType`. Unauthenticated or unauthorised route access is blocked both client-side (route guard) and server-side (Spring Security).

3. **Role-Based Dashboard**: The dashboard `/dashboard` page returns data scoped to the calling user's role. Domain-specific users (e.g. `ROLE_SALES_USER`) see only the metrics relevant to their domain, and order counts for operations they created. Owners and admins retain the full global view. `PurchaseOrder` and `ManufacturingOrder` entities must gain a `createdBy` UUID field to support per-user scoping.

---

## Glossary

- **System**: The Mini ERP application (Spring Boot backend + Next.js frontend) as a whole.
- **Backend**: The Spring Boot REST API.
- **Frontend**: The Next.js App Router application.
- **ProfileImageStore**: The backend component responsible for storing and retrieving profile image binary data in the `users` MySQL table.
- **UserController**: The existing Spring Boot REST controller at `/user` that handles self-service user operations.
- **DashboardController**: The existing Spring Boot REST controller at `/dashboard` that returns aggregated statistics.
- **DashboardService**: The service layer backing `DashboardController`.
- **Sidebar**: The Next.js `Sidebar` component that renders the left-hand navigation for authenticated users.
- **RouteGuard**: The `useRouteGuard` hook that enforces client-side route access for authenticated users.
- **canApi**: The frontend utility (`accessibleApis.ts`) that maps role sets to permitted API calls.
- **canAccessRoute**: The frontend utility function (`roles.ts`) that maps role sets to permitted routes.
- **AuthContext**: The React context that holds the authenticated `User` object (including `roles`).
- **RoleType**: The enum `ROLE_ADMIN | ROLE_USER | ROLE_SALES_USER | ROLE_PURCHASE_USER | ROLE_MANUFACTURING_USER | ROLE_INVENTORY_MANAGER | ROLE_BUSINESS_OWNER`.
- **Privileged_Role**: Either `ROLE_ADMIN` or `ROLE_BUSINESS_OWNER`.
- **SalesOrder**: The JPA entity representing a sales order; already contains a `createdBy` UUID field.
- **PurchaseOrder**: The JPA entity representing a purchase order; currently lacks a `createdBy` UUID field.
- **ManufacturingOrder**: The JPA entity representing a manufacturing order; currently lacks a `createdBy` UUID field.
- **UserDTO**: The backend DTO returned by `/user/me`; currently contains `profileImageUrl` (String).
- **UpdateProfileRequest**: The backend DTO used by `PATCH /user/me`.
- **DashboardResponse**: The backend DTO returned by `GET /dashboard`.
- **RoleDashboardResponse**: A new backend DTO that wraps role-scoped statistics.
- **Low_Stock_Threshold**: Products whose `onHandQty` is less than 10 units are considered low-stock.
- **My_Orders**: Orders whose `createdBy` UUID matches the UUID of the currently authenticated user.

---

## Requirements

### Requirement 1: Remove Cloudinary — Add Backend Profile Image Storage

**User Story:** As a user, I want to upload a profile photo that is stored securely on the server, so that I am not dependent on an external service and my image persists regardless of external account status.

#### Acceptance Criteria

1. THE `ProfileImageStore` SHALL add a `profileImage` column of type `LONGBLOB` (byte array annotated with `@Lob`) to the `users` table, storing raw binary image data.
2. THE `ProfileImageStore` SHALL add a `profileImageContentType` column of type `VARCHAR(100)` to the `users` table, storing the MIME type of the uploaded image (e.g. `image/jpeg`, `image/png`).
3. THE `ProfileImageStore` SHALL retain the existing `profileImageUrl` column as `NULL` for any user who has not yet uploaded a backend-stored image, ensuring backward compatibility with existing rows.
4. WHEN a user submits a multipart `POST /user/me/profile-image` request with a valid image file, THE `UserController` SHALL store the binary content and MIME type in the `users` table row for that user.
5. WHEN the uploaded file's content type is not one of `image/jpeg`, `image/png`, `image/gif`, or `image/webp`, THE `UserController` SHALL reject the request with HTTP 400 and a descriptive error message.
6. WHEN the uploaded file exceeds 5 MB, THE `UserController` SHALL reject the request with HTTP 400 and a descriptive error message.
7. WHEN a `GET /user/me/profile-image` request is received for a user who has a stored profile image, THE `UserController` SHALL respond with HTTP 200, set the `Content-Type` header to the stored MIME type, and return the image binary in the response body.
8. WHEN a `GET /user/me/profile-image` request is received for a user who has no stored profile image, THE `UserController` SHALL respond with HTTP 404.
9. WHEN a `GET /users/{userId}/profile-image` request is received for a valid user ID, THE `UserController` SHALL respond with HTTP 200 and the stored image binary for that user, accessible to any authenticated user.
10. WHEN a `GET /users/{userId}/profile-image` request is received for a user ID that does not exist or has no stored image, THE `UserController` SHALL respond with HTTP 404.
11. THE `UserDTO` SHALL include a boolean field `hasProfileImage` that is `true` when the user has a stored profile image and `false` otherwise.
12. THE `UserDTO` SHALL NOT include the raw `profileImage` byte array or the `profileImageContentType` in serialised JSON responses, to avoid bloating auth responses.
13. WHEN a successful profile image upload completes, THE `UserController` SHALL clear the legacy `profileImageUrl` String field for that user, setting it to `null`.

### Requirement 2: Remove Cloudinary from the Frontend Profile Page

**User Story:** As a developer, I want the frontend profile page to upload images directly to the backend, so that there is no dependency on Cloudinary environment variables or external API calls.

#### Acceptance Criteria

1. THE Frontend SHALL remove the `uploadToCloudinary` function, the `CLOUD_NAME` constant, and the `UPLOAD_PRESET` constant from the profile page.
2. WHEN a user selects a profile photo in the profile page file input, THE Frontend SHALL send a `POST /user/me/profile-image` multipart request to the Backend with the selected file.
3. WHEN the Backend responds with HTTP 200 to the profile image upload, THE Frontend SHALL call `refreshUser()` to update `AuthContext` with the latest `UserDTO`.
4. WHEN the Backend responds with an error to the profile image upload, THE Frontend SHALL display the backend error message to the user without navigating away from the profile page.
5. THE Sidebar user card SHALL display the profile image by fetching `GET /user/me/profile-image` when `hasProfileImage` is `true` in the `AuthContext` user object.
6. WHEN `hasProfileImage` is `false` for the current user, THE Sidebar SHALL display the user's initials as the avatar placeholder.
7. THE Frontend profile page avatar preview SHALL use the `GET /user/me/profile-image` endpoint as the image source when `hasProfileImage` is `true`, replacing any previous use of `profileImageUrl`.
8. THE `UpdateProfileRequest` TypeScript type SHALL remove the `profileImageUrl` optional field, since profile image upload is now handled by a dedicated multipart endpoint.
9. THE `userApi` in `auth.api.ts` SHALL add an `uploadProfileImage(file: File)` function that sends a `POST /user/me/profile-image` multipart request.

### Requirement 3: Role-Based Sidebar Navigation

**User Story:** As a user, I want the sidebar to show only the links I am permitted to access, so that I am not confused or misled by navigation items I cannot use.

#### Acceptance Criteria

1. WHEN the authenticated user holds `ROLE_SALES_USER` (and no Privileged_Role), THE Sidebar SHALL display only the Customers and Sales Orders navigation links from the Operations and Catalog groups.
2. WHEN the authenticated user holds `ROLE_PURCHASE_USER` (and no Privileged_Role), THE Sidebar SHALL display only the Vendors and Purchase Orders navigation links.
3. WHEN the authenticated user holds `ROLE_MANUFACTURING_USER` (and no Privileged_Role), THE Sidebar SHALL display only the Manufacturing Orders and Bill of Materials navigation links.
4. WHEN the authenticated user holds `ROLE_INVENTORY_MANAGER` (and no Privileged_Role), THE Sidebar SHALL display only the Products and Stock Ledger navigation links.
5. WHEN the authenticated user holds a Privileged_Role (`ROLE_ADMIN` or `ROLE_BUSINESS_OWNER`), THE Sidebar SHALL display all navigation groups and links, including Audit Logs, Admin Panel, and all module links.
6. THE Sidebar SHALL always display the Settings (profile) link to any authenticated user, regardless of role.
7. THE Sidebar SHALL always display the Dashboard link to any authenticated user who holds at least one role other than `ROLE_USER`.
8. THE `accessibleRoutes` function in `roles.ts` SHALL return only the routes the current user is permitted to visit, matching the role-to-route mapping already defined in `ROUTE_ROLES`.
9. WHEN `ROUTE_ROLES` is updated to grant a role access to a route, THE Sidebar SHALL automatically surface the corresponding navigation link for users holding that role, without requiring additional code changes.

### Requirement 4: Role-Based Route Guard

**User Story:** As a security-conscious developer, I want client-side route guards to prevent users from navigating to pages they are not authorised to access, so that the UI does not expose restricted content even if a user manually enters a URL.

#### Acceptance Criteria

1. WHEN an unauthenticated user attempts to access any route under `/(protected)`, THE `RouteGuard` SHALL redirect the user to `/login?redirect={currentPath}`.
2. WHEN an authenticated user navigates to a route they are not permitted to access (per `canAccessRoute`), THE `RouteGuard` SHALL redirect the user to the first route in the fallback list that they are permitted to access.
3. THE fallback route list SHALL be ordered as: `/dashboard`, `/sales`, `/purchases`, `/manufacturing`, `/bom`, `/products`, `/inventory`, `/profile`.
4. WHEN no fallback route is accessible for the authenticated user, THE `RouteGuard` SHALL redirect the user to `/profile`.
5. THE `ROUTE_ROLES` map in `roles.ts` SHALL include `/dashboard` as accessible to all roles except `ROLE_USER`, meaning `ROLE_SALES_USER`, `ROLE_PURCHASE_USER`, `ROLE_MANUFACTURING_USER`, `ROLE_INVENTORY_MANAGER`, `ROLE_BUSINESS_OWNER`, and `ROLE_ADMIN` may all access `/dashboard`.
6. THE Spring Security configuration SHALL enforce the same role-to-route access rules server-side, returning HTTP 403 for any authenticated request that lacks the required role.

### Requirement 5: Add `createdBy` to PurchaseOrder and ManufacturingOrder

**User Story:** As a developer, I want `PurchaseOrder` and `ManufacturingOrder` to record which user created them, so that the role-based dashboard can show per-user order counts.

#### Acceptance Criteria

1. THE `PurchaseOrder` entity SHALL add a `createdBy` column of type `UUID` (nullable) to the `purchase_orders` table, consistent with the existing pattern in `SalesOrder`.
2. THE `ManufacturingOrder` entity SHALL add a `createdBy` column of type `UUID` (nullable) to the `manufacturing_orders` table, consistent with the existing pattern in `SalesOrder`.
3. WHEN a new `PurchaseOrder` is created via the API, THE Backend SHALL populate `createdBy` with the UUID of the currently authenticated user.
4. WHEN a new `ManufacturingOrder` is created via the API, THE Backend SHALL populate `createdBy` with the UUID of the currently authenticated user.
5. THE `PurchaseOrderRepository` SHALL expose a method `countByCreatedByAndStatus(UUID createdBy, PurchaseOrderStatus status)` for use by `DashboardService`.
6. THE `ManufacturingOrderRepository` SHALL expose a method `countByCreatedByAndStatus(UUID createdBy, ManufacturingOrderStatus status)` for use by `DashboardService`.
7. WHEN existing `PurchaseOrder` or `ManufacturingOrder` rows have a `NULL` `createdBy`, THE Backend SHALL treat them as system-created orders and include them only in the global (Privileged_Role) dashboard counts, not in per-user counts.

### Requirement 6: Role-Scoped Dashboard — Backend

**User Story:** As a domain user, I want the dashboard API to return only the statistics relevant to my role, so that I see an accurate picture of my own work rather than unrelated global data.

#### Acceptance Criteria

1. THE `DashboardController` SHALL accept the authenticated user's principal from Spring Security and pass it to `DashboardService` to determine which statistics to return.
2. WHEN the authenticated user holds `ROLE_SALES_USER` (and no Privileged_Role), THE `DashboardService` SHALL return a `RoleDashboardResponse` containing: total customer count, and counts of `SalesOrder` records grouped by status where `createdBy` equals the authenticated user's UUID.
3. WHEN the authenticated user holds `ROLE_PURCHASE_USER` (and no Privileged_Role), THE `DashboardService` SHALL return a `RoleDashboardResponse` containing: total vendor count, and counts of `PurchaseOrder` records grouped by status where `createdBy` equals the authenticated user's UUID.
4. WHEN the authenticated user holds `ROLE_MANUFACTURING_USER` (and no Privileged_Role), THE `DashboardService` SHALL return a `RoleDashboardResponse` containing: total BOM count, and counts of `ManufacturingOrder` records grouped by status where `createdBy` equals the authenticated user's UUID.
5. WHEN the authenticated user holds `ROLE_INVENTORY_MANAGER` (and no Privileged_Role), THE `DashboardService` SHALL return a `RoleDashboardResponse` containing: total product count, count of low-stock products (onHandQty < 10), and total inventory value (sum of onHandQty × costPrice for all products).
6. WHEN the authenticated user holds a Privileged_Role (`ROLE_ADMIN` or `ROLE_BUSINESS_OWNER`), THE `DashboardService` SHALL return the existing global `DashboardResponse` containing all aggregate counts across all users and modules.
7. THE `RoleDashboardResponse` SHALL include a `role` field (String) indicating which role view was used, so the frontend can render the appropriate UI variant.
8. WHEN the authenticated user holds multiple non-privileged roles (e.g. both `ROLE_SALES_USER` and `ROLE_PURCHASE_USER`), THE `DashboardService` SHALL return combined statistics from all matching domain views.
9. WHEN the authenticated user holds only `ROLE_USER` (with no other role), THE `DashboardController` SHALL respond with HTTP 403.
10. IF the `DashboardService` encounters a repository exception while computing statistics, THEN THE `DashboardController` SHALL return HTTP 500 with a descriptive error message, and the exception SHALL be logged.

### Requirement 7: Role-Scoped Dashboard — Frontend

**User Story:** As a domain user, I want the dashboard page to display only the widgets and KPI cards relevant to my role, so that the page is focused and actionable for my work.

#### Acceptance Criteria

1. WHEN the authenticated user holds `ROLE_SALES_USER` (and no Privileged_Role), THE Frontend dashboard page SHALL display: a Customers KPI card, and a Sales Orders status breakdown showing only `My_Orders` counts grouped by status.
2. WHEN the authenticated user holds `ROLE_PURCHASE_USER` (and no Privileged_Role), THE Frontend dashboard page SHALL display: a Vendors KPI card, and a Purchase Orders status breakdown showing only `My_Orders` counts grouped by status.
3. WHEN the authenticated user holds `ROLE_MANUFACTURING_USER` (and no Privileged_Role), THE Frontend dashboard page SHALL display: a BOM count KPI card, and a Manufacturing Orders status breakdown showing only `My_Orders` counts grouped by status.
4. WHEN the authenticated user holds `ROLE_INVENTORY_MANAGER` (and no Privileged_Role), THE Frontend dashboard page SHALL display: a Total Products KPI card, a Low Stock alert KPI card (highlighted in red when low-stock count > 0), and a Total Inventory Value banner.
5. WHEN the authenticated user holds a Privileged_Role, THE Frontend dashboard page SHALL display all KPI summary cards (Total Products, Customers, Vendors, Low Stock), the Inventory Value banner, and the full Operations Overview with all three order sections (Sales, Purchase, Manufacturing), each showing both "All" and "My orders" chip rows.
6. WHEN `canApi.readDashboard(user)` returns `false` for the current user, THE Frontend dashboard page SHALL NOT call `GET /dashboard` and SHALL render a role-specific view using only data from permitted module endpoints.
7. THE `canApi.readDashboard` function SHALL be updated to return `true` for all roles except `ROLE_USER`, enabling domain-role users to call `GET /dashboard` and receive their scoped statistics.
8. WHEN the `role` field in the dashboard API response indicates a domain role, THE Frontend SHALL suppress KPI cards and order sections unrelated to that role.
9. WHEN the dashboard API response contains `My_Orders` counts for a domain-role user, THE Frontend SHALL display those counts as the primary data (not nested under an "All" row), clearly labelled with the user's name or "My Orders".
10. THE Quick Actions strip at the bottom of the dashboard SHALL show only the action links whose corresponding module is accessible to the current user (using existing `canApi` checks).

### Requirement 8: Backend Security Configuration Update

**User Story:** As a developer, I want the Spring Security configuration to permit domain-role users to access the `/dashboard` endpoint, so that the backend enforces the same expanded access rules as the frontend.

#### Acceptance Criteria

1. THE `SecurityConfig` SHALL grant `GET /dashboard` access to `ROLE_ADMIN`, `ROLE_BUSINESS_OWNER`, `ROLE_SALES_USER`, `ROLE_PURCHASE_USER`, `ROLE_MANUFACTURING_USER`, and `ROLE_INVENTORY_MANAGER`.
2. THE `SecurityConfig` SHALL continue to deny `GET /dashboard` to `ROLE_USER` (unauthenticated users are already denied by the global authentication requirement).
3. THE `SecurityConfig` SHALL add `POST /user/me/profile-image` as a permitted endpoint for any authenticated user.
4. THE `SecurityConfig` SHALL add `GET /user/me/profile-image` as a permitted endpoint for any authenticated user.
5. THE `SecurityConfig` SHALL add `GET /users/{userId}/profile-image` as a permitted endpoint for any authenticated user.
6. WHEN a request to any of the profile image endpoints is made without a valid JWT, THE `SecurityConfig` SHALL return HTTP 401.
