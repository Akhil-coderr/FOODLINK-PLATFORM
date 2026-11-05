# 🍲 FoodLink – Food Donation & Redistribution Management System

> **A modern, full-stack redistribution ecosystem connecting institutional food donors with verified NGOs and dispatch volunteers to eradicate food wastage, feed vulnerable communities, and mitigate carbon emissions.**

---

## 🌟 Key Features & Capabilities

- **OAuth 2.0 & OpenID Connect Social Authentication**:
  - Direct integration with **Google Identity Services** (OpenID Connect code flow with cryptographically signed state verification).
  - Multi-provider database linking (`authProviders: [{ provider, providerId, email }]`) preserving existing password hashes and preventing duplicate accounts.
  - Controlled first-time onboarding for OAuth users restricting public roles to Donor, NGO, and Volunteer (strictly prohibiting OAuth admin creation).
- **Dedicated Administrator Control Center**:
  - Independent, enterprise-grade authentication interface at `/admin/login` with strict backend server-side role verification (rejecting non-admin users with 403 Forbidden).
  - Completely separate `AdminLayout` and 16-item navigation sidebar (Overview, Users, Donors, NGO Verification, Volunteers, Food Donations, Requests, Dispatch, Food Safety, Notifications, Messages, Analytics, Reports, Settings, Audit Logs, Logout).
- **Modernized Authentication UI**:
  - Password visibility toggle.
  - "Continue with Google" single sign-on action button.
  - Clean divider displaying "OR".
  - **Zero hardcoded demo credentials or autofill panels in the production login interface**.
- **Smart NGO Recommendation Engine**: Uses an intelligent multi-variable scoring model:
  $$\text{Score} = 35\% \times \text{Proximity} + 30\% \times \text{Category Match} + 20\% \times \text{Receiving Capacity} + 15\% \times \text{Operating Time Window}$$
- **Cryptographic QR Verification**: Handover workflows are authenticated with SHA-256 single-use tokens (`PK-XXXXXX` and `DL-XXXXXX`) to prevent duplicate claims, fraud, and misattribution.
- **Interactive Geospatial Mapping**: Powered by **Leaflet** and OpenStreetMap tiles. Visualizes donation locations, routing waypoints, and volunteer service radiuses without paid API keys.
- **Automated Expiry Monitor**: Background `node-cron` daemon continuously checks donations at **6-hour**, **3-hour**, and **1-hour** thresholds, triggering Socket.IO push alerts.
- **Environmental & Social Impact Telemetry**:
  - Automatically calculates **Meals Saved** ($2.2\text{--}2.5 \text{ meals/kg}$).
  - Quantifies **CO₂e Emissions Averted** ($2.5 \text{ kg CO}_2\text{e/kg}$ diverted from landfill decomposition).
- **Volunteer Gamification**: Awards 20 reward points per verified drop-off with dynamic leaderboard ranks and milestone badges.
- **Karma Rewards Store**: Volunteers can spend karma points on three seeded tiers — a free KCT campus visit with Akhil C (50 pts), a ₹100 Amazon/Flipkart coupon (400 pts), or a Chief Minister visit with a handshake and commemorative photo (100,000 pts). Coupons are issued instantly with a generated code; experience rewards become admin-approved requests. Rejected or cancelled requests automatically refund points.
- **Admin Reward Catalog**: Admins manage the live reward catalog from `/admin/rewards` — add, edit, re-price, archive/activate, or remove rewards, attach an image by URL or file upload, and track redemption counts. The catalog is stored in MongoDB, so changes go live for volunteers immediately.
- **Audit Logging & CSV Exports**: Platform administrators can inspect full MongoDB audit trails and download CSV reports for donations, user rosters, and impact records.

---

## 🛠️ Technology Stack

### Frontend

- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS, PostCSS, Lucide React icons
- **State & Routing**: React Context API, React Router DOM v6
- **Data Visualization**: Recharts (Area, Bar, Pie, Line charts)
- **Maps**: Leaflet, React Leaflet (OpenStreetMap tiles)
- **Real-Time Client**: Socket.IO Client
- **QR Utilities**: `qrcode.react` (generator), `html5-qrcode` (webcam & image scanner)
- **Feedback**: React Hot Toast

### Backend

- **Runtime**: Node.js & Express.js (MVC architecture)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT, HTTP-Only cookies, bcryptjs, Google OAuth 2.0 / OIDC
- **Real-Time Engine**: Socket.IO with authenticated user and role rooms
- **Task Scheduling**: `node-cron`
- **File Uploads**: Multer with Cloudinary CDN integration and local `/uploads` fallback
- **Security**: Helmet, CORS, Express Rate Limiters, Zod input validation
- **Testing**: Jest, Supertest

---

## 📂 Project Architecture

```text
foodlink/
├── client/                     # Vite + React Frontend Application
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/         # Common, Layout, Admin, MapView, QRScanner, StatCards
│   │   ├── constants/          # Enums, Food Categories, Units, Config
│   │   ├── context/            # AuthContext, SocketContext
│   │   ├── layouts/            # PublicLayout, DashboardLayout, AdminLayout
│   │   ├── pages/
│   │   │   ├── public/         # Home, About, How It Works, Food Listings, Impact, Contact
│   │   │   ├── auth/           # Login, Register, OAuthCallback, OAuthOnboarding, Reset Pass
│   │   │   ├── donor/          # Dashboard, Add Donation, My Donations, Requests, Analytics
│   │   │   ├── ngo/            # Dashboard, Browse, Smart Match, Claims, Deliveries, Impact
│   │   │   ├── volunteer/      # Dashboard, Tasks, Active Routes, Scan QR, Achievements, Rewards
│   │   │   └── admin/          # AdminLogin, Dashboard, Users, Donors, NGOs, NGODetails,
│   │   │                       # Volunteers, Donations, Requests, Assignments, Safety,
│   │   │                       # Notifications, Messages, Analytics, Reports, Settings, AuditLogs,
│   │   │                       # Reward Catalog, Reward Redemptions
│   │   ├── services/           # Axios REST API client modules
│   │   ├── App.jsx             # Master React Router DOM hierarchy
│   │   └── main.jsx
│   ├── .env.example
│   └── package.json
│
├── server/                     # Node.js + Express API Backend
│   ├── config/                 # MongoDB database, Cloudinary & default reward seed data
│   ├── controllers/            # Auth, Admin, Donations, NGOs, Volunteers, Assignments, Rewards, QR
│   ├── jobs/                   # Expiry alert & cleanup cron jobs
│   ├── middleware/             # JWT verify, RBAC, Multer upload, Central Error Handler
│   ├── models/                 # 14 Mongoose Schemas (User, Donation, Reward, Redemption, etc.)
│   ├── routes/                 # REST endpoints
│   ├── seeds/                  # Comprehensive demo database seeder
│   ├── services/               # OAuthService, Matching algorithm, Audit logger
│   ├── sockets/                # Socket.IO room subscriptions & real-time events
│   ├── tests/                  # Unit & Integration test suites (oauth_admin, api, utils)
│   ├── utils/                  # Token hashing, Haversine distance, mass conversion
│   ├── app.js                  # Express middleware & route composition
│   ├── server.js               # HTTP server & Socket.IO initialization
│   ├── .env.example
│   └── package.json
│
├── package.json                # Root package with npm workspaces
└── README.md
```

---

## 🚀 Quickstart Guide

### 1. Prerequisites

- **Node.js** (v18.0.0 or higher)
- **MongoDB** (Local instance on `mongodb://localhost:27017` or MongoDB Atlas URI)

### 2. Environment Configuration

#### Backend Configuration (`server/.env`)

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
FRONTEND_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/foodlink
JWT_ACCESS_SECRET=foodlink_access_secret_super_secure_key_2026
JWT_REFRESH_SECRET=foodlink_refresh_secret_super_secure_key_2026

# Google OAuth 2.0 Credentials (Optional - app remains functional without them)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://foodlink-platform.onrender.com/api/auth/google/callback

# Root Administrators
ADMIN_EMAILS=admin@foodlink.org

# Optional Cloudinary (Local disk uploads will be used automatically if omitted)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

#### Frontend Configuration (`client/.env`)

```env
VITE_API_URL=https://foodlink-platform.onrender.com/api
VITE_SOCKET_URL=https://foodlink-platform.onrender.com
```

### 3. Database Seeding

Populate the database with initial administrators, demo donors, verified NGOs, volunteers, and sample donations:

```bash
npm run seed
```

### 4. Running the Application

From the root directory, start both the Express backend and Vite frontend simultaneously:

```bash
npm run dev
```

- **Frontend Application**: `http://localhost:5173`
- **Administrator Login**: `http://localhost:5173/admin/login`
- **Backend API**: `https://foodlink-platform.onrender.com
`
- **API Health Check**: `https://foodlink-platform.onrender.com
/api/health`

### 5. Database Troubleshooting

If the server stops with `MONGODB CONNECTION ERROR`, the improved error output now distinguishes the real cause:

| Error                                                                             | Meaning                                                                      | Fix                                                                                                                                                               |
| --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bad auth : authentication failed`                                                | Atlas rejected the username/password. This is **not** an IP whitelist issue. | Reset the password of the database user in **Atlas → Database Access**, then update `MONGODB_URI`. Use the database user password, not your Atlas login password. |
| `IP ... is not whitelisted` / `network access`                                    | Your public IP is not allowed.                                               | Add it in **Atlas → Network Access** (use `0.0.0.0/0` only for local development).                                                                                |
| `ENOTFOUND` / `querySrv`                                                          | The cluster hostname cannot be resolved.                                     | Check the hostname in `MONGODB_URI` and your internet connection.                                                                                                 |
| `ECONNREFUSED`                                                                    | Nothing is listening on that address.                                        | Start local MongoDB, or check that the Atlas cluster is not paused.                                                                                               |
| `socket disconnected before secure TLS connection was established` / `ECONNRESET` | A firewall, antivirus, VPN, or IPv6/NAT64 route is interrupting TLS.         | The server now forces IPv4, recycles idle sockets, and retries automatically. If it persists, disable TLS-inspecting antivirus/VPN or switch networks.            |

No extra `.env` file is needed for MongoDB. Only `server/.env` is read by the backend, and `client/.env` is read by Vite. JWT secrets, OAuth, SMTP, and Cloudinary are optional for local development.

If you need to run the app immediately without a real MongoDB instance, add this to `server/.env`:

```env
USE_IN_MEMORY_DB=true
```

The app will start with a temporary in-memory database. Data is lost when the server stops, so use this for demos/tests only. Alternatively, `ALLOW_IN_MEMORY_FALLBACK=true` keeps the real database as the primary option and only falls back to memory when it is unreachable (development only).

---

## 🔑 Administrative Access & Seed Credentials

Admin accounts must never be created through public registration or OAuth. An initial administrator account is provisioned via the seed script:

- **Admin Login Route**: `http://localhost:5173/admin/login`
- **Admin Email**: `admin@foodlink.org`
- **Password**: `Admin@123`

_Note: If a non-admin user (donor, NGO, or volunteer) attempts to log in through `/admin/login`, the portal strictly denies access with an error message: "Access denied. This portal is restricted to authorized administrators."_

---

## 🎁 Karma Rewards Store

Volunteers earn **20 karma points** for every verified pickup + delivery. Those points can be spent in the volunteer portal at `/volunteer/rewards`.

### Reward Tiers

| Points      | Reward                                                         | Fulfillment                                                               |
| ----------- | -------------------------------------------------------------- | ------------------------------------------------------------------------- |
| **50**      | Free KCT visit with **Akhil C**                                | Experience request → admin approval → team schedules the visit            |
| **400**     | **₹100 Amazon or Flipkart** coupon                             | Instant coupon code (`FOODLINK-AMZ-XXXXXX` / `FOODLINK-FLP-XXXXXX`)       |
| **100,000** | Visit the **Chief Minister** — handshake & commemorative photo | Experience request → admin approval → team coordinates security clearance |

### How It Works

1. The catalog and current balance are loaded from `GET /api/rewards/catalog`.
2. On redemption, points are deducted **atomically** with `findOneAndUpdate` so two simultaneous requests cannot overspend the balance.
3. Coupons are marked `FULFILLED` immediately and the code is returned in the response and shown in the volunteer's redemption history.
4. Experience rewards are created as `PENDING`. Admins review them at `/admin/redemptions` and can `APPROVE`, mark `FULFILLED`, or `REJECT`.
5. Volunteers can cancel a `PENDING` request. Cancelling or rejecting refunds the points exactly once (`pointsRefunded` guard).
6. Every redemption and status change is written to the audit log, and the volunteer receives an in-app notification.

### Managing Rewards (Admin)

The catalog is **database-backed** (the `Reward` collection). Admins manage it in the admin panel at **`/admin/rewards`** — no code changes or redeploys required. The page supports:

- **Add** a reward (name, description, points cost, category, accent color, fallback emoji, variants, fulfillment note, display order).
- **Edit** any reward. The reward ID (slug) is fixed after creation because redemption history references it.
- **Archive / activate** a reward to hide or restore it in the volunteer store.
- **Remove** a reward. If it has no redemptions it is deleted permanently; if it has redemption history it is archived instead so past records stay intact.
- **Images** via an external `http(s)://` URL or a direct upload (JPEG, PNG, or WEBP up to 5 MB). Uploads use Cloudinary when configured, otherwise they are served from `/uploads`.

### Seeded Defaults

`server/config/rewards.js` contains only the `DEFAULT_REWARDS` seed data. `npm run seed` clears the collection and inserts these defaults:

```js
{
  slug: 'kct_visit',
  name: 'Free KCT Visit with Akhil C',
  pointsCost: 50,
  category: 'experience', // 'experience' requires approval; 'coupon' is instant
  requiresApproval: true,
  imageUrl: 'https://images.unsplash.com/...',
  // ...
}
```

After seeding, edit rewards from the admin UI — re-running the seed resets the catalog to these defaults.

> The seeded volunteer `volunteer@foodlink.org` starts with **80 points**, so the 50-point KCT reward can be tested immediately. The 400 and 100,000 tiers remain locked until more deliveries are completed.

---

## 🔐 Google OAuth Configuration Guide

The application is fully functional using standard email and password authentication even when OAuth credentials are not yet supplied. When the Google OAuth button is clicked without configured credentials, the user receives an informative alert without crashing the platform.

### Google Cloud Console Setup

1. Navigate to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project named **FoodLink**.
3. Go to **APIs & Services** > **OAuth consent screen**:
   - User Type: **External**.
   - App Name: `FoodLink Food Redistribution`.
   - User Support Email: your email.
   - Scopes: `.../auth/userinfo.email`, `.../auth/userinfo.profile`, `openid`.
4. Go to **APIs & Services** > **Credentials**:
   - Click **Create Credentials** > **OAuth client ID**.
   - Application type: **Web application**.
   - Name: `FoodLink Web Client`.
   - **Authorized JavaScript origins**:
     - `http://localhost:5173`
   - **Authorized redirect URIs**: - `https://foodlink-platform.onrender.com
/api/auth/google/callback`
5. Copy your **Client ID** and **Client Secret** into `server/.env`.

---

## 📡 API Reference Overview

### Authentication (`/api/auth`)

- `POST /register/donor` - Register commercial or institutional donor
- `POST /register/ngo` - Register NGO organization (pending verification)
- `POST /register/volunteer` - Register volunteer profile
- `POST /login` - General stakeholder login (Donor, NGO, Volunteer)
- `POST /admin/login` - Dedicated administrator login with strict role validation
- `GET /google` - Initiate Google OAuth authorization code flow
- `GET /google/callback` - Validate Google OAuth state & tokens
- `POST /oauth/onboard` - Controlled role selection for new OAuth users (Donor, NGO, Volunteer only)
- `GET /me` - Fetch authenticated user profile and nested role records
- `POST /logout` - Clear session cookie

### Admin Control Center (`/api/admin`)

- `GET /dashboard` - Dashboard stats (users, NGOs, donors, mass rescued, meals saved, safety reports)
- `GET /users` - List all registered users with role and status filters
- `PATCH /users/:id/status` - Suspend or reactivate user accounts
- `GET /donors` - List registered donor establishments with category filters
- `GET /ngos` - List NGOs and verification statuses
- `GET /ngos/:id` - NGO dossier details
- `PATCH /ngos/:id/approve` - Approve and accredit NGO
- `PATCH /ngos/:id/reject` - Reject NGO verification with reason
- `GET /volunteers` - Volunteer fleet, transport modes, and points leaderboard
- `GET /donations` - All donations across platform
- `PATCH /donations/:id/flag` - Flag donation for safety review
- `DELETE /donations/:id` - Administrative removal of donation
- `GET /requests` - All NGO pickup requests
- `GET /assignments` - Volunteer dispatch assignments
- `GET /analytics` - Aggregate monthly trends and category distributions
- `GET /reports` - Download regulatory CSV exports (`donations`, `impact`)
- `GET /messages` - Helpdesk contact inquiries
- `PATCH /messages/:id/status` - Update message status
- `GET /audit-logs` - Platform security audit trail
- `GET /rewards` - List every reward (active and archived) with redemption counts and catalog stats
- `POST /rewards` - Create a reward (name, `pointsCost`, `category`, optional image, variants, etc.)
- `PATCH /rewards/:id` - Update a reward (name, price, image, visibility, order, ...)
- `DELETE /rewards/:id` - Delete a reward, or archive it automatically when redemption history exists
- `POST /rewards/upload-image` - Upload a reward image (multipart field `image`, JPEG/PNG/WEBP ≤5 MB)
- `GET /redemptions` - List reward redemptions with status filters and pending/approved/fulfilled stats
- `PATCH /redemptions/:id/status` - Approve, fulfill, reject, or cancel a redemption (reject/cancel refunds points)

### Karma Rewards (`/api/rewards`)

- `GET /catalog` - Active reward catalog plus the volunteer's current point balance
- `GET /redemptions` - The authenticated volunteer's redemption history and coupon codes
- `POST /redeem` - Redeem a reward (`rewardId`, optional `variant`, `contactPhone`, `note`)
- `PATCH /redemptions/:id/cancel` - Cancel a pending experience request and refund points

### Password Recovery & Verification (`/api/auth`)

- `POST /forgot-password` - Request password reset email (rate limited, enumeration-resistant)
- `GET /verify-reset-token/:token` - Verify validity and expiration of 32-byte recovery token
- `POST /reset-password` - Update password using validated token and strong password regex rules

---

## 🔒 Git Security & Setup Instructions

### Initializing Git & Safe Commits

The repository includes a comprehensive, multi-layered root `.gitignore` protecting sensitive credentials, environment variables, build outputs, and runtime uploads:

```bash
# Check repository status and verify ignored files
git status
git status --ignored --short
```

### Git Security Invariants

- **Never commit `.env` or `.env.*` files**: Real credentials (`MONGODB_URI`, `JWT_ACCESS_SECRET`, `GOOGLE_CLIENT_SECRET`, `SMTP_PASSWORD`) reside only in local uncommitted `.env` files.
- **Example templates**: Keep `.env.example` updated with variable placeholders (without real values) for deployment documentation.
- **Runtime artifacts**: `server/uploads/` and `server/logs/` are strictly ignored while preserving source assets and public images.
- **If credentials were historically committed to an external remote**: Rotate all exposed secrets immediately (MongoDB Atlas passwords, JWT secrets, OAuth client secrets, and email app passwords).

---

## 📧 Email Password Reset & SMTP Configuration

FoodLink features an email password recovery system with SHA-256 token hashing, 15-minute single-use link expiration, and timing-attack/account-enumeration resistance.

### 1. SMTP Credentials Setup (`server/.env`)

Add your email provider credentials to `server/.env`:

```env
# Email / SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-16-character-app-password
EMAIL_FROM="FoodLink Security" <noreply@foodlink.org>
```

### 2. Generating a Google/Gmail App Password

If using Gmail as your SMTP server:

1. Log in to your Google Account and navigate to **Security** (`https://myaccount.google.com/security`).
2. Ensure **2-Step Verification** is turned ON.
3. Search for **App passwords** in the search bar.
4. Name the application `FoodLink Mailer` and click **Create**.
5. Copy the generated 16-character passcode and paste it into `SMTP_PASSWORD` in `server/.env` (without spaces).

### 3. Local Development Simulation Fallback

If SMTP credentials are not yet configured or left blank:

- The backend automatically detects the absence of `SMTP_USER`/`SMTP_PASSWORD`.
- Instead of crashing, it logs the simulated email dispatch, recipient address, and direct password reset link directly to the server terminal:
  ```text
  ======================================================
  [SMTP DEV MODE - NO CREDENTIALS CONFIGURED]
  Simulated email to: user@example.com
  Password reset link: http://localhost:5173/reset-password/<32-byte-raw-token>
  ======================================================
  ```
- Developers can click the link in the terminal to test password recovery without configuring external mail servers.

---

## 🧪 Testing

Run the automated backend test suites:

```bash
npm test
```

```text
PASS tests/password_recovery.test.js
PASS tests/oauth_admin.test.js
PASS tests/integration/api.test.js
PASS tests/unit/utils.test.js

Test Suites: 4 passed, 4 total
Tests:       43 passed, 43 total
Snapshots:   0 total
Time:        2.091 s
```

Run the frontend production build verification:

```bash
npm run build
```

```text
✓ 2452 modules transformed.
dist/index.html                     1.47 kB │ gzip:   0.87 kB
dist/assets/index-sjzLQQw0.css     52.18 kB │ gzip:   8.65 kB
dist/assets/index-AisyGW9f.js   1,704.17 kB │ gzip: 461.84 kB
✓ built in 12.79s
```

---

## 📄 License

This project is open-source under the **MIT License**.
