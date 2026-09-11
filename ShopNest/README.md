# ShopNest — Full-Stack E-Commerce Portfolio Project

ShopNest is a professional mini-commerce application ("mini Amazon").

## Technology

- **Backend:** ASP.NET Core Web API on .NET 9
- **Data:** Entity Framework Core 10 + SQL Server
- **Security:** ASP.NET Core Identity password hashing + JWT bearer authentication + role authorization
- **Frontend:** React 19.3 + Vite 8 + React Router
- **Architecture:** REST API, DTOs, service layer for token creation, controller-based endpoints, client contexts for auth/cart

## Working features

### Customer

- Registration and login
- JWT session and protected routes
- Product catalog
- Search by product/category/description
- Category filters
- Price/name/newest sorting
- Product details
- Persistent browser cart
- Quantity and stock limits
- Mock checkout
- Server-side stock validation
- Order creation
- My Orders page
- Detailed order page
- Visual tracking: Placed → Confirmed → Packed → Shipped → Out for delivery → Delivered

### Admin

- Admin-only API routes using `[Authorize(Roles = "Admin")]`
- Dashboard metrics: revenue, orders, products, users, pending orders, low stock
- Add products
- Edit products
- Feature/unfeature products
- Activate/deactivate products
- View all orders
- Filter orders by status
- Update fulfilment status
- Cancelling an order restores stock

## Seeded demo accounts

These accounts are created only for the local demo database:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@shopnest.local` | `Admin@123!` |
| Customer | `customer@shopnest.local` | `Customer@123!` |

> **Security note:** The JWT key and demo passwords in this repository are intentionally local-development values. Replace them with secrets/environment variables before any real deployment.

---

# Run locally on Windows

## Prerequisites

Install:

1. **.NET 9 SDK**
2. **SQL Server Express/Developer + LocalDB** (Visual Studio workloads commonly install LocalDB)
3. **Node.js 22+**
4. Optional: Visual Studio 2022/2026 or VS Code

The default API connection string uses SQL Server LocalDB:

```text
Server=(localdb)\mssqllocaldb;Database=ShopNestDb;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True
```

The API automatically creates and seeds the local development database at startup with `EnsureCreatedAsync()` so you can demo it quickly without running migrations.

## 1. Start the ASP.NET Core API

Open a terminal:

```powershell
cd server\ShopNest.Api
dotnet restore
dotnet run --launch-profile http
```

API base URL:

```text
http://localhost:5098/api
```

OpenAPI JSON in Development:

```text
http://localhost:5098/openapi/v1.json
```

## 2. Start React

Open a second terminal:

```powershell
cd client
copy .env.example .env
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

---

# Alternative SQL Server with Docker

A `docker-compose.yml` is included. Start SQL Server:

```powershell
docker compose up -d
```

Then change `ConnectionStrings:DefaultConnection` in `server/ShopNest.Api/appsettings.json` to:

```text
Server=localhost,1433;Database=ShopNestDb;User Id=sa;Password=ShopNest_Strong!2026;TrustServerCertificate=True
```

For real applications, keep database passwords in User Secrets/environment variables rather than source control.

---

# API map to explain in the

## Authentication

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

## Products

```text
GET    /api/products
GET    /api/products/categories
GET    /api/products/{id}
GET    /api/products/admin/all            [Admin]
POST   /api/products                      [Admin]
PUT    /api/products/{id}                 [Admin]
DELETE /api/products/{id}                 [Admin]
```

Example catalog query:

```text
GET /api/products?search=wireless&category=Electronics&sort=price_asc&page=1&pageSize=12
```

## Orders

```text
POST  /api/orders/checkout                [Authenticated]
GET   /api/orders/mine                    [Authenticated]
GET   /api/orders/{id}                    [Owner or Admin]
GET   /api/orders/admin/all               [Admin]
PATCH /api/orders/admin/{id}/status       [Admin]
GET   /api/orders/admin/dashboard         [Admin]
```

---

# Architecture

```text
React UI
   |
   | HTTP + JSON + JWT
   v
ASP.NET Core Controllers
   |
   +--> ASP.NET Core Identity / Role Authorization
   |
   +--> Business validation
   |
   v
Entity Framework Core
   |
   v
SQL Server
```

Checkout example:

```text
Customer clicks Place Order
        ↓
React sends POST /api/orders/checkout + JWT
        ↓
JWT middleware authenticates user
        ↓
OrdersController validates requested products
        ↓
EF Core loads current inventory from SQL Server
        ↓
API rejects insufficient stock OR deducts stock
        ↓
Order + OrderItems saved in one DB transaction
        ↓
API returns order JSON
        ↓
React clears cart and opens tracking page
```

---

