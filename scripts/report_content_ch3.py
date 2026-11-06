# -*- coding: utf-8 -*-
"""
Chapter 3 (System Design) Builder for FoodLink Report
Covers System Architecture, Use Case Model, DFD Level 0 & Level 1,
Database Schemas (12 Collections), REST API Specifications, and UI Hierarchy.
"""

import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from generate_complete_docx import (
    add_heading_1, add_heading_2, add_heading_3,
    add_body_p, add_bullet_p, add_figure, style_academic_table,
    ASSETS_DIR
)

def build_chapter_3(doc):
    add_heading_1(doc, "Chapter 3: System Design")
    
    add_heading_2(doc, "3.1 System Architecture")
    add_body_p(
        doc,
        "FoodLink is engineered following a clean, loosely coupled three-tier client-server architectural paradigm enhanced "
        "by a bidirectional asynchronous WebSocket event subsystem. As depicted in Figure 3.1, the three architectural tiers comprise "
        "the Client Presentation Tier (React SPA), the Application Logic Tier (Express/Node.js REST Engine), and the Data Storage Tier "
        "(MongoDB Atlas Cloud Cluster)."
    )
    
    fig31_path = os.path.join(ASSETS_DIR, "Figure_3_1_System_Architecture.png")
    add_figure(
        doc, fig31_path, "3.1",
        "FoodLink Multi-Tier System Architecture and Real-Time Socket Engine",
        "Depicts the decoupling between the React 18 client, Express/Node.js REST controllers, Socket.IO rooms, and MongoDB Atlas data layer."
    )

    add_body_p(
        doc,
        "1. Presentation Tier (Client SPA): Built with React 18 and Vite 6, the client functions as a Single-Page Application (SPA) "
        "rendering user interfaces dynamically without full-page browser reloads. Client routing is orchestrated by React Router DOM v6, "
        "which encapsulates routes within Role-Based Route Guards (`ProtectedRoute` and `RoleBasedRoute`). State management is handled "
        "by modular React Context Providers (`AuthContext`, `SocketContext`, and `NotificationContext`), while Axios interceptors "
        "automatically inject bearer authentication tokens and handle error transitions.",
        bold_prefix="Architectural Tier Analysis: "
    )
    add_body_p(
        doc,
        "2. Application Tier (Node.js & Express.js REST API): The backend web server executes on Node.js v26 using Express.js v4. "
        "Incoming requests pass through a security and logging middleware pipeline comprising Helmet (HTTP headers), CORS origin guards, "
        "express-rate-limit (DDoS and brute-force protection), cookie-parser, and Morgan request logging. Business controllers implement "
        "the core application logic including surplus food validation, weighted smart matching, atomic capacity locking, and single-use "
        "cryptographic QR hash validation. Concurrently, a Socket.IO server establishes persistent duplex WebSocket connections, enabling "
        "instantaneous event broadcasting to targeted role and user rooms."
    )
    add_body_p(
        doc,
        "3. Data Tier (MongoDB Atlas Cloud): Data persistence is managed by MongoDB Atlas, an enterprise-grade cloud NoSQL document "
        "database. The data model utilizes Mongoose v8.9.0 Object Data Modeling (ODM) to enforce strict schema constraints, automatic "
        "type conversions, pre-save validation hooks, and geospatial indexes (2dsphere) for millisecond-latency geographical proximity queries."
    )

    add_heading_2(doc, "3.2 Use Case Diagram & Actor Analysis")
    add_body_p(
        doc,
        "The interaction between human stakeholders and the platform is formally modeled in Figure 3.2. Four primary authenticated actors "
        "interact with distinct functional domains of the FoodLink system."
    )

    fig32_path = os.path.join(ASSETS_DIR, "Figure_3_2_Use_Case_Diagram.png")
    add_figure(
        doc, fig32_path, "3.2",
        "FoodLink Role-Based Use Case Model",
        "Illustrates the discrete use cases and functional privileges accessible to Donors, NGOs, Volunteers, and System Administrators."
    )

    add_bullet_p(doc, "Donor Actor: ", "Authenticates via email/password or Google OAuth; registers commercial organization profile; lists food surplus specifying categories, servings, and expiry; reviews and approves NGO claim requests; and displays the dynamic pickup QR code during volunteer handover.")
    add_bullet_p(doc, "NGO Actor: ", "Submits legal trust registration documents; configures maximum receiving capacity (kg); browses surplus catalog; receives smart matching recommendations; claims food with atomic capacity deduction; and displays receipt delivery QR code.")
    add_bullet_p(doc, "Volunteer Actor: ", "Configures vehicle transport mode and service radius (km); receives real-time dispatch alerts; views pickup/dropoff coordinates on Leaflet maps; performs in-browser camera scans of pickup and delivery QR tokens; and earns Karma Points for coupon redemption.")
    add_bullet_p(doc, "Administrator Actor: ", "Monitors platform metrics; reviews and approves pending NGO trust certifications; conducts food safety compliance audits; performs manual courier dispatches; manages the reward voucher registry; and exports CSV audit reports.")

    add_heading_2(doc, "3.3 Data Flow Diagrams (Level 0 and Level 1)")
    add_body_p(
        doc,
        "The movement of information across system boundaries is modeled through structured Data Flow Diagrams (DFDs). Figure 3.3 "
        "illustrates the Level 0 Context DFD, representing FoodLink as a single central process interacting with external entities."
    )

    fig33_path = os.path.join(ASSETS_DIR, "Figure_3_3_DFD_Level_0.png")
    add_figure(
        doc, fig33_path, "3.3",
        "FoodLink Context Level 0 Data Flow Diagram",
        "Depicts high-level external data inflows (donations, claims, QR scans) and outflows (alerts, routing maps, impact reports)."
    )

    add_body_p(
        doc,
        "Figure 3.4 decomposes the primary system into six functional sub-processes at Level 1: Process 1.0 (Authentication & RBAC), "
        "Process 2.0 (Donation Lifecycle Management), Process 3.0 (Smart Matching Engine), Process 4.0 (Dispatch & Route Navigation), "
        "Process 5.0 (Cryptographic QR Handshake), and Process 6.0 (Karma Economy & Administrative Governance)."
    )

    fig34_path = os.path.join(ASSETS_DIR, "Figure_3_4_DFD_Level_1.png")
    add_figure(
        doc, fig34_path, "3.4",
        "FoodLink Level 1 Data Flow Diagram (Subsystem Decomposition)",
        "Shows internal data movement between sub-processes, data stores (D1 to D6), and external user roles."
    )

    add_heading_2(doc, "3.4 Database Design & Relational Document Model")
    add_body_p(
        doc,
        "FoodLink leverages MongoDB's flexible BSON document model while maintaining rigorous relational integrity through Mongoose "
        "ObjectId cross-references (`ref`). Figure 3.5 illustrates the complete Entity-Relationship diagram across all 12 core collections."
    )

    fig35_path = os.path.join(ASSETS_DIR, "Figure_3_5_Database_ER_Diagram.png")
    add_figure(
        doc, fig35_path, "3.5",
        "FoodLink MongoDB Relational Document Entity-Relationship Model",
        "Visualizes primary keys (_id), foreign key references, and one-to-one/one-to-many associations among database collections."
    )

    add_body_p(
        doc,
        "Table 3.1 provides the comprehensive data dictionary detailing the field structures, data types, constraints, foreign key references, "
        "and architectural responsibilities for all collections in the `foodlink` database."
    )

    # Table 3.1: Complete Database Dictionary
    t4_headers = ["Collection Name", "Field Name", "BSON Type", "Constraints / Validation", "Description & Relationships"]
    t4_data = [
        ["User", "_id", "ObjectId", "Primary Key, Auto", "Unique immutable user identity"],
        ["User", "email", "String", "Required, Unique, Lowercase", "User login email address"],
        ["User", "passwordHash", "String", "Required (Local Auth)", "10-round bcrypt salted password hash"],
        ["User", "role", "String", "Enum: donor, ngo, volunteer, admin", "Role defining system-wide permissions"],
        ["User", "location", "GeoJSON Point", "Type: 'Point', coordinates: [lng, lat]", "2dsphere indexed geographical coordinate"],
        ["User", "accountStatus", "String", "Enum: active, pending, suspended", "Administrative moderation status"],
        ["User", "authProviders", "Array[Subdoc]", "provider, providerId, linkedAt", "Linked social accounts (Google OAuth 2.0)"],
        ["DonorProfile", "userId", "ObjectId", "Required, Ref: User._id", "One-to-one foreign key to donor User record"],
        ["DonorProfile", "organizationName", "String", "Required, Trimmed", "Official legal business or banquet title"],
        ["DonorProfile", "organizationType", "String", "Enum: hotel, restaurant, hostel, etc.", "Operational category of food establishment"],
        ["DonorProfile", "totalFoodDonatedKg", "Number", "Default: 0, Min: 0", "Cumulative food rescued in kilograms"],
        ["NGOProfile", "userId", "ObjectId", "Required, Ref: User._id", "One-to-one foreign key to NGO User record"],
        ["NGOProfile", "registrationNumber", "String", "Required, Unique", "Government NGO trust certification number"],
        ["NGOProfile", "receivingCapacityKg", "Number", "Required, Min: 10", "Maximum daily food storage/intake limit"],
        ["NGOProfile", "currentReservedCapacityKg", "Number", "Default: 0, Min: 0", "Capacity temporarily locked for claimed meals"],
        ["NGOProfile", "verificationStatus", "String", "Enum: pending, approved, rejected", "Admin approval status for trust document"],
        ["VolunteerProfile", "userId", "ObjectId", "Required, Ref: User._id", "One-to-one foreign key to volunteer User record"],
        ["VolunteerProfile", "transportType", "String", "Enum: bike, car, van, foot", "Mode of transport for dispatch matching"],
        ["VolunteerProfile", "totalPoints", "Number", "Default: 0, Min: 0", "Cumulative Karma Points earned"],
        ["VolunteerProfile", "achievements", "Array[String]", "Default: ['First Steps']", "List of unlocked gamification badge keys"],
        ["Donation", "_id", "ObjectId", "Primary Key, Auto", "Unique surplus donation record identifier"],
        ["Donation", "donorId", "ObjectId", "Required, Ref: User._id", "Foreign key to donor User record"],
        ["Donation", "foodTitle", "String", "Required, Trimmed, Max: 100", "Descriptive meal title (e.g. Veg Biryani)"],
        ["Donation", "foodCategory", "String", "Enum: Cooked Meals, Bakery, Raw, etc.", "Nutritional/dietary classification"],
        ["Donation", "quantity", "Object", "amount: Number, unit: String", "Numerical weight/portion measure (kg/servings)"],
        ["Donation", "status", "String", "Enum: available, reserved, completed, expired", "Current lifecycle progression state"],
        ["Donation", "expiryTime", "Date", "Required, Future Date", "Algorithmic safety threshold for consumption"],
        ["PickupRequest", "_id", "ObjectId", "Primary Key, Auto", "Unique claim transaction identifier"],
        ["PickupRequest", "donationId", "ObjectId", "Required, Ref: Donation._id", "Foreign key to targeted surplus donation"],
        ["PickupRequest", "ngoId", "ObjectId", "Required, Ref: User._id", "Foreign key to requesting NGO User record"],
        ["PickupRequest", "status", "String", "Enum: pending, approved, rejected, cancelled", "Donor approval progression status"],
        ["Assignment", "_id", "ObjectId", "Primary Key, Auto", "Unique courier dispatch task identifier"],
        ["Assignment", "volunteerId", "ObjectId", "Required, Ref: User._id", "Foreign key to assigned volunteer courier"],
        ["Assignment", "pickupVerification", "Object", "codeHash: String, verifiedAt: Date", "SHA-256 hash of single-use donor pickup token"],
        ["Assignment", "deliveryVerification", "Object", "codeHash: String, verifiedAt: Date", "SHA-256 hash of single-use NGO receipt token"],
        ["Reward", "_id", "ObjectId", "Primary Key, Auto", "Unique reward voucher listing identifier"],
        ["Reward", "pointsCost", "Number", "Required, Min: 10", "Karma Points required to redeem coupon"],
        ["Redemption", "voucherCode", "String", "Required, Unique", "Cryptographically generated 8-char redemption token"],
        ["ImpactRecord", "carbonEmissionsOffsetKg", "Number", "Required, Formula: kg * 2.5", "Net CO2 emissions diverted from landfill"],
        ["AuditLog", "action", "String", "Required, Indexed", "Security event tag (e.g. USER_SUSPENDED)"],
    ]
    tbl_db = doc.add_table(rows=len(t4_data) + 1, cols=len(t4_headers))
    style_academic_table(tbl_db, [1.2, 1.3, 1.1, 1.4, 1.8], t4_headers, t4_data)

    p_tcap4 = doc.add_paragraph()
    p_tcap4.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_tcap4.paragraph_format.space_before = Pt(4)
    p_tcap4.paragraph_format.space_after = Pt(12)
    rt4 = p_tcap4.add_run("Table 3.1: ")
    rt4.font.name = "Times New Roman"
    rt4.font.size = Pt(10)
    rt4.font.bold = True
    rt_desc4 = p_tcap4.add_run("MongoDB Collections Schema & Field Constraints Specification")
    rt_desc4.font.name = "Times New Roman"
    rt_desc4.font.size = Pt(10)
    rt_desc4.font.italic = True

    add_heading_2(doc, "3.5 REST API Design & Specification")
    add_body_p(
        doc,
        "FoodLink provides a comprehensive, stateless RESTful HTTP API mounted under `/api/*`. Table 3.2 documents the 32 primary "
        "production endpoints, their HTTP verb methods, URI paths, descriptions, authentication requirements, and payload expectations."
    )

    t5_headers = ["HTTP Verb", "API Endpoint URI", "Functional Description", "Auth Guard", "Request Payload / Parameters"]
    t5_data = [
        ["POST", "/api/auth/register/donor", "Register new commercial donor account", "Public", "{ name, email, password, phone, organizationName }"],
        ["POST", "/api/auth/register/ngo", "Register charitable NGO care home", "Public", "{ name, email, password, registrationNumber, capacity }"],
        ["POST", "/api/auth/register/volunteer", "Register volunteer courier profile", "Public", "{ name, email, password, transportType, radius }"],
        ["POST", "/api/auth/login", "Authenticate credentials & issue JWT", "Public", "{ email, password }"],
        ["GET", "/api/auth/google", "Initiate Google OAuth 2.0 flow", "Public", "Query params (auto-redirect)"],
        ["GET", "/api/auth/google/callback", "Handle Google OAuth token callback", "Public", "Query: { code, state }"],
        ["GET", "/api/auth/me", "Fetch current authenticated user profile", "Bearer JWT", "None (reads req.user from JWT)"],
        ["POST", "/api/auth/logout", "Revoke cookie session & logout", "Bearer JWT", "None (clears foodlink_token cookie)"],
        ["POST", "/api/donations", "Publish new surplus food donation", "Donor Role", "{ foodTitle, foodCategory, quantity, expiryTime }"],
        ["GET", "/api/donations", "Query public available food catalog", "Public", "Query: { category, search, page, limit }"],
        ["GET", "/api/donations/:id", "Retrieve specific donation details", "Public", "URL Param: { id }"],
        ["PUT", "/api/donations/:id", "Update surplus donation details", "Donor Role", "{ quantity, expiryTime, notes }"],
        ["DELETE", "/api/donations/:id", "Cancel surplus donation listing", "Donor Role", "URL Param: { id }"],
        ["GET", "/api/donations/donor/my", "Fetch all donations by current donor", "Donor Role", "Query: { status, page }"],
        ["POST", "/api/requests", "NGO submits food claim request", "NGO Role", "{ donationId, quantityRequested, requiresTransport }"],
        ["GET", "/api/requests/ngo/my", "Fetch claim history of current NGO", "NGO Role", "Query: { status }"],
        ["PATCH", "/api/requests/:id/status", "Donor approves/rejects claim", "Donor Role", "URL Param: { id }, Body: { status: 'approved' }"],
        ["GET", "/api/ngos/matching", "Compute smart matching recommendations", "NGO Role", "Query: { radiusKm } (Calculates compatibility)"],
        ["GET", "/api/volunteers/available", "List open courier delivery tasks", "Volunteer", "Query: { maxDistanceKm }"],
        ["POST", "/api/assignments/claim", "Volunteer self-dispatches task", "Volunteer", "{ requestId }"],
        ["GET", "/api/assignments/my", "Fetch active courier assignments", "Volunteer", "None"],
        ["POST", "/api/qr/generate", "Generate single-use QR nonce token", "Donor / NGO", "{ assignmentId, type: 'pickup'|'delivery' }"],
        ["POST", "/api/qr/verify", "Scan & verify crypto QR handshake", "Volunteer", "{ assignmentId, token, scanType }"],
        ["GET", "/api/rewards", "List redeemable partner reward vouchers", "Volunteer", "None"],
        ["POST", "/api/rewards/:id/redeem", "Redeem Karma Points for coupon", "Volunteer", "URL Param: { id }"],
        ["GET", "/api/impact/summary", "Retrieve platform impact totals", "Public", "None (Returns food kg, meals, CO2 offset)"],
        ["POST", "/api/contact", "Submit public contact inquiry", "Public", "{ name, email, subject, message }"],
        ["GET", "/api/admin/users", "Query all platform user profiles", "Admin Role", "Query: { role, status, page, search }"],
        ["PATCH", "/api/admin/users/:id/status", "Suspend or activate user account", "Admin Role", "URL Param: { id }, Body: { status }"],
        ["PATCH", "/api/admin/ngos/:id/verify", "Approve or reject NGO certificate", "Admin Role", "URL Param: { id }, Body: { verificationStatus }"],
        ["GET", "/api/admin/reports/csv", "Export full system audit logs as CSV", "Admin Role", "Query: { type: 'donations'|'users'|'audit' }"],
        ["GET", "/api/health", "Server operational health check", "Public", "None (Returns uptime, system status, timestamp)"],
    ]
    tbl_api = doc.add_table(rows=len(t5_data) + 1, cols=len(t5_headers))
    style_academic_table(tbl_api, [0.8, 1.8, 1.8, 1.0, 1.8], t5_headers, t5_data)

    p_tcap5 = doc.add_paragraph()
    p_tcap5.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_tcap5.paragraph_format.space_before = Pt(4)
    p_tcap5.paragraph_format.space_after = Pt(12)
    rt5 = p_tcap5.add_run("Table 3.2: ")
    rt5.font.name = "Times New Roman"
    rt5.font.size = Pt(10)
    rt5.font.bold = True
    rt_desc5 = p_tcap5.add_run("FoodLink REST API Endpoint Routing Specification")
    rt_desc5.font.name = "Times New Roman"
    rt_desc5.font.size = Pt(10)
    rt_desc5.font.italic = True

    add_heading_2(doc, "3.6 UI Design & Component Hierarchy")
    add_body_p(
        doc,
        "The FoodLink frontend is organized around a hierarchical layout structure ensuring brand consistency and unified navigation. "
        "Figure 3.6 illustrates the surplus food state machine that dictates page transitions and status badges across the client."
    )

    fig36_path = os.path.join(ASSETS_DIR, "Figure_3_6_Food_Donation_Workflow.png")
    add_figure(
        doc, fig36_path, "3.6",
        "FoodLink Surplus Food Donation and Redistribution State Machine",
        "Details the sequential status progression: available ➔ requested ➔ reserved ➔ in_transit ➔ completed (or expired)."
    )

    add_body_p(
        doc,
        "The React UI component hierarchy is structured into three primary layout wrappers:",
        bold_prefix="Layout Hierarchy Structure: "
    )
    add_bullet_p(doc, "PublicLayout (`PublicLayout.jsx`): ", "Encapsulates public-facing pages (`HomePage`, `AboutPage`, `AvailableFoodPage`, `PublicImpactPage`, `ContactPage`, `LoginPage`, `RegisterPage`). Provides the global top navbar with live surplus counters, responsive mobile slide-out drawer, quick donate modal trigger, and university/SDG compliant footer.")
    add_bullet_p(doc, "DashboardLayout (`DashboardLayout.jsx`): ", "Standardized responsive layout for authenticated Donor, NGO, and Volunteer portals. Features a persistent collapsable sidebar navigation, role status badges, dynamic breadcrumb tracking, live Socket.IO notification bell with dropdown tray, and account profile avatar menu.")
    add_bullet_p(doc, "AdminLayout (`AdminLayout.jsx`): ", "High-security dark/light hybrid control center layout for Administrators. Provides real-time platform system health monitoring, rapid filters for moderation alerts, tabular pagination controls, and one-click CSV report generators.")

print("Chapter 3 module loaded.")
