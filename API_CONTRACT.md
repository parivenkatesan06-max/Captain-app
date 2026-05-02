# Captain App API Contract

This document describes the server-side contract for the API endpoints used by the Captain App frontend.

## Base configuration
- **Base URL:** `process.env.REACT_APP_API_URL`
- **Default headers:**
  - `Accept: application/json`
  - `Content-Type: application/json; charset=utf-8`
  - `X-Requested-With: XMLHttpRequest`
- **Authorization:**
  - Most requests include `Authorization: Bearer <accessToken>` via client interceptor.
  - `/admin/refresh-token` uses header `Authorization: Bearer <refreshToken>`.
  - `/admin/reset-password` uses header `Authorization: Bearer <info>` where `info` is a token from query parameters.

## Response conventions
- Most responses are consumed as `response.data.data`
- Error payloads are often read from `error.response.data.errors[0]`

---

## API Endpoints

### 1. Authentication and user management

#### POST /admin/login
- Purpose: authenticate admin or captain user
- Request body:
  - `email` (string)
  - `password` (string)
- Response:
  - `data.data` contains authenticated `userInfo`
  - expected fields include `clientGroupCode`, `clientCode`, `roleName`, etc.

#### POST /admin/register
- Purpose: register admin or user account
- Request body examples:
  - basic signup:
    - `email` (string)
    - `password` (string)
    - `role` (string)
  - create user from admin console:
    - `firstName` (string)
    - `lastName` (string)
    - `mobile` (string)
    - `email` (string)
    - `password` (string)
    - `roleCode` (string)
    - `clientGroupCode` (string)
    - `clientCode` (string)
    - `isTemporaryPassword` (number)
- Response:
  - likely a success message or created user object in `data.data`

#### POST /admin/logout
- Purpose: invalidate user session on logout
- Request body:
  - `token` (string) - access token
- Response:
  - success message or status

#### POST /admin/refresh-token
- Purpose: refresh expired access token
- Request headers:
  - `Authorization: Bearer <refreshToken>`
- Request body: `{}`
- Response:
  - `data.data.accessToken` contains new access token

#### POST /admin/forgot-password
- Purpose: request password reset link or email
- Request body:
  - `email` (string)
- Response:
  - `data.data.message` confirmation message

#### POST /admin/reset-password
- Purpose: complete password reset from email link
- Request headers:
  - `Authorization: Bearer <info>`
- Request body:
  - `password` (string)
- Response:
  - `data.data.message` confirmation message

#### POST /admin/reset-temporary-password
- Purpose: reset temporary password after forced reset
- Request body:
  - `email` (string)
  - `oldPassword` (string)
  - `password` (string)
- Response:
  - `data.data.message` confirmation

#### POST /admin/delete-user
- Purpose: delete a user account (frontend calls from Delete User page)
- Request body:
  - `email` (string)
  - `password` (string)
- Response:
  - expected success message in `data.data`

#### GET /admin/admin-users
- Purpose: fetch admin user list
- Query params:
  - `page` (number)
  - `itemsPerPage` (number)
  - `clientCode` (string)
  - `roleName` (string)
- Response:
  - `data.data` is a list of users

### 2. Client and screen metadata

#### GET /admin/client-entity
- Purpose: fetch client entities or screens for a client group
- Query params:
  - `clientCode` (string)
- Response:
  - `data.data` is an array of entity records

#### GET /admin/client/{clientCode}
- Purpose: fetch client information by client code
- Path parameter:
  - `{clientCode}` (string)
- Response:
  - `data.data` may be a single client object or array of client objects

### 3. QR code management

#### GET /admin/qrcode
- Purpose: list QR codes for an entity
- Query params:
  - `entityCode` (string)
  - `page` (number)
  - `itemsPerPage` (number)
- Response:
  - `data.data` is an array of QR code objects

#### POST /admin/qrcode
- Purpose: generate a new QR code
- Request body:
  - `clientCode` (string)
  - `entityCode` (string)
  - `seatCode` (string)
  - `redirectUrl` (string)
  - additional fields may be included by the frontend
- Response:
  - `data.data` contains generated QR details, including `qrcode`

#### DELETE /admin/qrcode
- Purpose: delete a QR code by seat code
- Query params:
  - `seatCode` (string)
- Response:
  - success status

#### Unused / declared QR endpoints
- `DELETE /admin/delete-qrcode` (defined but not referenced)
- `POST /admin/generate-qrcode` (defined but not referenced)

### 4. Menu management

#### GET /menu/menu
- Purpose: fetch menu items by category
- Query params:
  - `clientCode` (string)
  - `categoryCode` (string)
  - `page` (number)
  - `itemsPerPage` (number)
- Response:
  - `data.data` is an array of menu item objects

#### POST /menu/menu
- Purpose: create a menu item
- Request body:
  - `clientCode` (string)
  - `menuName` (string)
  - `categoryCode` (string)
  - `price` (number or string)
  - `menuImageUrl` (string)
  - `offerPct` (string or number)
  - `menuDescription` (string)
- Response:
  - success message or created menu item in `data.data`

#### PUT /menu/menu/{menuId}
- Purpose: update a menu item
- Path parameter:
  - `{menuId}` (string or number)
- Request body:
  - same fields as menu creation
- Response:
  - success message or updated item in `data.data`

#### DELETE /menu/menu
- Purpose: delete a menu item
- Query params:
  - `menuId` (string or number)
- Response:
  - success message

#### GET /menu/menu-category
- Purpose: fetch menu categories
- Query params:
  - `clientCode` (string)
  - `page` (number)
  - `itemsPerPage` (number)
- Response:
  - `data.data` is an array of categories

#### POST /menu/menu-category
- Purpose: create a menu category
- Request body:
  - `clientCode` (string)
  - `name` (string)
- Response:
  - success message in `data.data.message`

#### DELETE /menu/menu-category
- Purpose: delete a menu category
- Query params:
  - `categoryCode` (string)
- Response:
  - success message

#### PATCH /menu/menu-category
- Purpose: update a menu category
- Query params:
  - `categoryCode` (string)
- Request body:
  - `name` (string)
  - `categoryCode` (string)
- Response:
  - success message

#### POST /menu/{clientCode}/image-upload
- Purpose: upload menu image file
- Request content-type: `multipart/form-data`
- Request body:
  - file field(s) for image upload
- Response:
  - `data.data.fileUrl` points to uploaded file path

#### Unused / declared menu endpoints
- `POST /menu/addnew-menu` (declared but not referenced)
- `GET /menu/get-all-menus` (declared but not referenced)

### 5. Inventory management

#### POST /add-inventory
- Purpose: upload inventory items for an entity
- Query params:
  - `entity` (string)
- Request body:
  - array of inventory records, each containing fields such as `Item Name`, `Item Category`, `Unit Price`, `Quantity`
- Response:
  - response data in `data.data`

#### GET /get-inventory
- Purpose: fetch inventory list for an entity
- Query params:
  - `entity` (string)
- Response:
  - `data.data` is the inventory array

### 6. Order processing

#### POST /order/order
- Purpose: create a customer or counter order
- Request body: order payload built by client
- Response:
  - `data.data.orderReferenceNumber` is used by client

#### GET /order/order
- Purpose: fetch order history
- Query params:
  - `counterSale=1` or omitted
  - `page` (number)
  - `itemsPerPage` (number)
  - `clientCode` (string) when counter sale selected
  - `entityCode` (string) when listing by entity
- Response:
  - `data.data` is the order list array

#### POST /order/rzp-create-order
- Purpose: create a Razorpay payment order
- Request body:
  - `amount` (number)
  - `currency` (string)
- Response:
  - `data.data.order_id` and `data.data.amount`

#### POST /order/rzp-save-order
- Purpose: save Razorpay payment result and complete order
- Request body: Razorpay payment result data
- Response:
  - success object and `data.success` flag

### 7. Reporting

#### GET /admin/report/orders
- Purpose: fetch order report summary
- Query params:
  - `clientCode` (string)
  - `selectedDate` (YYYY-MM-DD)
  - `frequency` (string)
- Response:
  - `data.data` is report result data

### 8. Table and screen data

#### GET /table-status
- Purpose: fetch table status list
- Response:
  - `data.data` is table status data

#### GET /screens
- Purpose: fetch screen metadata (endpoint declared but not referenced by current code)
- Response:
  - `data.data` is screen list data

---

## Notes for server implementation
- Use consistent response wrapping so frontend can access fields under `data.data`.
- Authorization should be enforced at the server for protected endpoints.
- For email reset, accept bearer token from `Authorization` header, not request body.
- `/service/image-upload` uses `multipart/form-data` and returns a file path used by frontend.
- The frontend often treats `client/{clientCode}` as either a single object or array; server can return an array when multiple clients exist.
- Pagination is handled with `page` and `itemsPerPage` query parameters.

---

## Summary of declared endpoints in code
The app uses the following endpoint constants in `src/utility/EndPoints.js`:
- `/admin/register`
- `/admin/login`
- `/admin/logout`
- `/menu/addnew-menu`
- `/admin/generate-qrcode`
- `/table-status`
- `/screens`
- `/admin/admin-users`
- `/admin/delete-user`
- `/add-inventory`
- `/get-inventory`
- `/admin/report/orders`
- `/admin/delete-qrcode`
- `/image-upload`
- `/admin/qrcode`
- `/menu/menu`
- `/admin/refresh-token`
- `/menu/menu-category`
- `/menu/get-all-menus`
- `/order/order`
- `/admin/client-entity`
- `/admin/seat`
- `/admin/forgot-password`
- `/admin/reset-password`
- `/admin/reset-temporary-password`
- `/order/rzp-create-order`
- `/order/rzp-save-order`
- `/admin/client`

> Note: Some endpoint constants are declared but not currently used in the frontend.
