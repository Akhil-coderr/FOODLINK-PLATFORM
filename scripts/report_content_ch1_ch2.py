# -*- coding: utf-8 -*-
"""
Chapter 1 (Introduction) and Chapter 2 (Requirement Analysis) Builder for FoodLink Report
"""

import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from generate_complete_docx import (
    add_heading_1, add_heading_2, add_heading_3,
    add_body_p, add_bullet_p, style_academic_table
)

def build_chapter_1(doc):
    add_heading_1(doc, "Chapter 1: Introduction")
    
    add_heading_2(doc, "1.1 Background")
    add_body_p(
        doc,
        "Food wastage represents one of the most critical socio-economic and ecological contradictions of modern civilization. "
        "According to the United Nations Environment Programme (UNEP) Food Waste Index Report, approximately 1.05 billion tonnes "
        "of edible food is wasted globally every year, accounting for nearly one-fifth of all food produced for human consumption. "
        "In India, an estimated 68.7 million tonnes of food is discarded annually across urban and suburban centers. Concurrently, "
        "India ranks 105th out of 127 countries on the Global Hunger Index, indicating severe, chronic, and episodic nutritional "
        "deficiencies among impoverished urban households, children in care homes, and unhoused citizens."
    )
    add_body_p(
        doc,
        "Commercial hospitality hubs, luxury hotels, convention banquet facilities, educational hostels, and corporate food service "
        "providers routinely prepare substantial meal reserves to guarantee service availability. When events conclude, tens or hundreds "
        "of kilograms of safe, freshly cooked, high-protein meals remain entirely unconsumed. Without an automated, trusted digital "
        "ecosystem capable of dynamically matching this surplus with nearby accredited non-governmental organizations (NGOs) and "
        "mobilizing rapid logistics, this surplus food is discarded into municipal landfills. There, anaerobic decomposition produces "
        "methane—a greenhouse gas with a global warming potential 28 times greater than carbon dioxide. FoodLink is engineered to "
        "directly align with the United Nations Sustainable Development Goals (SDG 2: Zero Hunger and SDG 12: Responsible Consumption "
        "and Production) by converting daily commercial surpluses into timely nutrition for hungry communities."
    )

    add_heading_2(doc, "1.2 Problem Statement")
    add_body_p(
        doc,
        "Current surplus food redistribution in urban India is fundamentally crippled by a severe coordination and information "
        "vacuum between commercial food donors and local charitable shelters. Commercial donors lack a frictionless, verified channel "
        "to broadcast time-sensitive surpluses without incurring burdensome legal liabilities or operational delays. Meanwhile, accredited "
        "NGOs and shelters operate with limited daily visibility into nearby surplus availability, frequently discovering available food "
        "only after it has surpassed safe consumption thresholds. Crucially, voluntary redistribution networks suffer from unverified "
        "chain-of-custody handovers, manual paper-based logging, duplicate claim conflicts, and an absence of structured incentives "
        "for volunteer couriers who provide rapid first-mile transport."
    )

    add_heading_2(doc, "1.3 Objectives")
    add_body_p(doc, "The primary objectives of the FoodLink full-stack platform are defined as follows:")
    add_bullet_p(doc, "Objective 1: Multi-Role Authentication & Onboarding: ", "Develop secure, role-based registration and authentication supporting standard credential hashing (bcrypt) and Google OAuth 2.0 / OpenID Connect with strict profile verification across four distinct personas: Donors, NGOs, Volunteers, and Administrators.")
    add_bullet_p(doc, "Objective 2: Dynamic Surplus Food Cataloging: ", "Enable food donors to publish structured surplus listings specifying food categories, quantity (kg/servings), storage temperatures (ambient, hot-holding, refrigerated), preparation timestamps, and algorithmic consumption expiry windows.")
    add_bullet_p(doc, "Objective 3: Weighted Smart Recommendation Engine: ", "Implement an automated multi-criteria matching algorithm that computes compatibility scores between available surpluses and verified NGOs based on geospatial proximity (35%), category preferences (30%), available capacity (20%), and expiry urgency (15%).")
    add_bullet_p(doc, "Objective 4: Cryptographic QR Delivery Handshake: ", "Ensure end-to-end food safety and tamper-proof chain-of-custody using single-use SHA-256 hashed cryptographic tokens embedded in dynamic QR codes scanned during donor pickup and NGO delivery handovers.")
    add_bullet_p(doc, "Objective 5: Volunteer Gamification & Karma Economy: ", "Incentivize voluntary urban logistics couriers through automated Karma Points, milestone achievement badges, verified digital service certificates, and redemptions for partner restaurant coupons.")
    add_bullet_p(doc, "Objective 6: Platform Governance & Real-Time Analytics: ", "Provide centralized administrator governance featuring NGO verification document approval, automated node-cron food expiry background monitoring, CSV audit reporting, and live environmental impact tracking.")

    add_heading_2(doc, "1.4 Scope")
    add_body_p(
        doc,
        "The scope of the FoodLink system encompasses a complete, production-grade full-stack web application designed for regional "
        "urban and peri-urban food donation and redistribution. The system encompasses donor surplus listing, verified NGO discovery, "
        "volunteer pickup task assignment, interactive route mapping via Leaflet OpenStreetMap, two-factor QR handshake verification, "
        "WebSocket notifications via Socket.IO, and administrative compliance audit registries.",
        bold_prefix="In-Scope Capabilities: "
    )
    add_body_p(
        doc,
        "Explicitly excluded from the current project scope are physical IoT hardware cold-chain temperature sensors, native binary mobile "
        "app store packaging (handled cleanly via responsive web design), integration of real-money fiat payment gateways, and autonomous "
        "drone delivery logistics. These capabilities remain designated for future long-term platform extensions.",
        bold_prefix="Out-of-Scope Boundaries: "
    )

    add_heading_2(doc, "1.5 Existing Systems and Their Limitations")
    add_body_p(
        doc,
        "To contextualize the architectural necessity of FoodLink, three major existing approaches and contemporary platforms "
        "were analyzed: informal voluntary networks (such as Robin Hood Army WhatsApp clusters), corporate charity aggregation apps "
        "(such as Feeding India by Zomato), and peer-to-peer neighborhood food sharing applications (such as Olio). Table 1.1 "
        "presents a rigorous comparative analysis against FoodLink."
    )

    # Table 1.1: Comparative Analysis
    t1_headers = ["Evaluation Criteria", "Informal Groups (e.g. RHA)", "Corporate Apps (Feeding India)", "P2P Apps (Olio)", "FoodLink Platform"]
    t1_data = [
        ["Coordination Medium", "Manual WhatsApp / Calls", "Centralized Fleet Only", "Decentralized Forum", "Automated Smart Matching Engine"],
        ["Role-Based Dashboards", "None (Ad-hoc chats)", "Restricted Corporate", "Single Generic User", "4 Dedicated Portals (Donor/NGO/Vol/Admin)"],
        ["Handshake Verification", "Trust-based / Unverified", "Manual Delivery Signoff", "Informal Chat Confirmation", "Cryptographic Single-Use QR (SHA-256)"],
        ["Capacity Locking", "Manual Estimation", "Pre-contracted Shelters", "No Capacity Guard", "Atomic Concurrency Capacity Reservation"],
        ["Courier Incentives", "Pure Altruism (High Churn)", "Salaried Drivers", "None", "Karma Points, Tier Badges & Partner Coupons"],
        ["Real-Time Alerts", "Noisy Group Notifications", "Internal Dispatch", "Push Notifications", "Targeted WebSocket Rooms by Role/User"],
        ["Governance Audit", "No Central Audit Log", "Proprietary Corporate DB", "Community Reporting", "Immutable Admin Audit Logs & CSV Exports"],
    ]
    tbl_comp = doc.add_table(rows=len(t1_data) + 1, cols=len(t1_headers))
    style_academic_table(tbl_comp, [1.4, 1.2, 1.3, 1.2, 1.4], t1_headers, t1_data)

    p_tcap = doc.add_paragraph()
    p_tcap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_tcap.paragraph_format.space_before = Pt(4)
    p_tcap.paragraph_format.space_after = Pt(12)
    rt = p_tcap.add_run("Table 1.1: ")
    rt.font.name = "Times New Roman"
    rt.font.size = Pt(10)
    rt.font.bold = True
    rt_desc = p_tcap.add_run("Comparative Analysis of Existing Food Redistribution Systems Against FoodLink")
    rt_desc.font.name = "Times New Roman"
    rt_desc.font.size = Pt(10)
    rt_desc.font.italic = True

    add_heading_2(doc, "1.6 Organisation of the Report")
    add_body_p(doc, "The remainder of this report is systematically structured into the following chapters:")
    add_bullet_p(doc, "Chapter 2 – Requirement Analysis: ", "Presents the formal functional requirements (FR1–FR16), non-functional constraints, actor permission matrices, and verified hardware/software operating specifications.")
    add_bullet_p(doc, "Chapter 3 – System Design: ", "Details the three-tier system architecture, role use cases, Level 0 and Level 1 Data Flow Diagrams, Mongoose database schemas, and complete REST API routing specifications.")
    add_bullet_p(doc, "Chapter 4 – Implementation: ", "Explains source code modularization across client and server, key implementation details of React, Node.js, and MongoDB, 5 critical source excerpts, and security measures.")
    add_bullet_p(doc, "Chapter 5 – Deployment: ", "Documents the cloud deployment architecture on Render Web Services and MongoDB Atlas, continuous integration with GitHub, and production URL endpoints.")
    add_bullet_p(doc, "Chapter 6 – Results and Discussion: ", "Presents 15 authentic application screenshots covering all portals, objective verification tables, performance benchmarks, and development challenge resolutions.")
    add_bullet_p(doc, "Chapter 7 – Conclusion and Future Scope: ", "Summarizes the full-stack engineering competencies demonstrated, outlines practical future enhancements, and details the individual team contribution breakdown.")

def build_chapter_2(doc):
    add_heading_1(doc, "Chapter 2: Requirement Analysis")
    
    add_heading_2(doc, "2.1 Functional Requirements")
    add_body_p(
        doc,
        "The functional requirements of FoodLink define the discrete operational services that the platform provides to its "
        "stakeholders. Each requirement has been verified against the production codebase and tagged with a formal identifier:"
    )

    frs = [
        ("FR1: User Registration & Persona Selection", "The system shall allow new users to register an account by providing basic contact details, geographical coordinates, and selecting one of three operating personas: Food Donor, Verified NGO, or Volunteer Courier."),
        ("FR2: Multi-Method Authentication", "The system shall support secure local credential login using bcrypt password hashing (10 rounds) and third-party social single sign-on via Google OAuth 2.0 / OpenID Connect."),
        ("FR3: Role-Based Authorization & Session Guarding", "The system shall issue cryptographically signed JWT access tokens (15m expiry) and refresh tokens (7d expiry) via HTTP-only cookies, strictly enforcing route guards across client and server routes."),
        ("FR4: Surplus Food Listing Management", "Donors shall be able to create, update, and manage surplus food listings with details including food category, quantity (kg/servings), preparation timestamp, storage conditions, and consumption expiry window."),
        ("FR5: Public Available Food Catalog", "The system shall provide a public-facing surplus food discovery directory supporting full-text keyword search, dietary category filters, status filtering, and real-time urgency indicators."),
        ("FR6: Weighted Smart Matching Engine", "The system shall compute dynamic compatibility scores between new donations and verified NGOs using a multi-parameter weighted scoring model incorporating location distance, food preferences, and capacity."),
        ("FR7: Concurrency-Safe Food Claiming", "Accredited NGOs shall be able to claim surplus donations with atomic database updates that lock available quantities and prevent duplicate claiming or race conditions."),
        ("FR8: Volunteer Task Discovery & Self-Dispatch", "Available volunteer couriers within a configured service radius (km) shall receive real-time dispatch alerts and have the ability to accept food pickup assignments."),
        ("FR9: Interactive Leaflet Route Visualization", "Volunteers shall be presented with an interactive Leaflet OpenStreetMap displaying pickup coordinates, destination NGO drop-off coordinates, estimated distance (km), and route instructions."),
        ("FR10: Dual-Handshake Cryptographic QR Verification", "The system shall enforce tamper-proof handovers by generating single-use SHA-256 verification tokens. Donors scan volunteer QR for pickup confirmation; NGOs scan delivery QR for drop-off confirmation."),
        ("FR11: Real-Time WebSocket Alerts (Socket.IO)", "The system shall establish authenticated WebSocket connections grouped by user ID and role rooms, broadcasting instant alerts for donation claims, pickup dispatch, and delivery completion."),
        ("FR12: Automated Background Expiry Job", "A scheduled node-cron background task shall execute every 5 minutes, scanning active listings, marking expired items as 'expired', and alerting donors and claimers at 6h, 3h, and 1h thresholds."),
        ("FR13: Volunteer Karma Points & Gamification", "The system shall credit Karma Points to volunteers upon confirmed deliveries, automatically unlocking milestone achievement badges ('First Rescue', 'Food Hero', 'Century Champion')."),
        ("FR14: Partner Coupon Redemption", "Volunteers shall be able to redeem accumulated Karma Points for partner restaurant dining vouchers and download cryptographically stamped digital certificates of community service."),
        ("FR15: Environmental Impact Ledger", "The system shall maintain an immutable impact registry computing total food saved (kg), human meals provided (using a standard 0.45 kg/meal conversion factor), and CO2 carbon offset (using a 2.5 kg CO2e/kg food factor)."),
        ("FR16: Administrative Governance & Audit Reporting", "Platform administrators shall possess master controls to verify NGO legal trust certificates, suspend non-compliant accounts, moderate listings, and export complete system audit registries in CSV format."),
    ]

    for fid, fdesc in frs:
        add_bullet_p(doc, f"{fid}: ", fdesc)

    add_heading_2(doc, "2.2 Non-Functional Requirements")
    add_body_p(doc, "The non-functional requirements establish the quality, security, and architectural constraints of the platform:")
    add_bullet_p(doc, "Performance: ", "The backend REST API endpoints shall respond within 250 milliseconds under standard load conditions. Client SPA initial page load shall complete in under 2.0 seconds utilizing Vite code-chunking.")
    add_bullet_p(doc, "Security: ", "Passwords shall be irreversibly hashed using bcrypt with 10 salt rounds. Tokens shall be stored in HTTP-only, secure, SameSite cookies. Helmet.js shall enforce strict HTTP headers, and CORS shall whitelist verified domains.")
    add_bullet_p(doc, "Reliability & Availability: ", "The application shall target 99.9% operational availability on Render cloud infrastructure, utilizing automatic process resurrection via nodemon in dev and Render health monitors in production.")
    add_bullet_p(doc, "Usability & Accessibility: ", "The user interface shall adhere to modern WCAG 2.1 AA accessibility guidelines, featuring high-contrast Tailwind forest green branding, intuitive form validation messages, and responsive touch controls.")
    add_bullet_p(doc, "Maintainability: ", "The codebase shall strictly follow the Model-View-Controller (MVC) architectural separation on the server and feature-based modular folder decomposition on the React frontend.")
    add_bullet_p(doc, "Scalability: ", "The MongoDB document store shall support horizontal scaling via sharded clusters on MongoDB Atlas, while Socket.IO architecture allows multi-room concurrency.")

    add_heading_2(doc, "2.3 User Roles and Permission Matrix")
    add_body_p(
        doc,
        "FoodLink defines four primary authenticated user roles and one guest role. Table 2.1 specifies the granular Role-Based Access "
        "Control (RBAC) permission matrix enforced across both frontend React Route Guards and backend Express middleware."
    )

    t2_headers = ["Platform Feature / Module", "Guest", "Donor", "NGO Recipient", "Volunteer Courier", "System Admin"]
    t2_data = [
        ["View Public Catalog & Impact", "Read-Only", "Full Access", "Full Access", "Full Access", "Full Access"],
        ["Create Surplus Donation Listing", "No Access", "Create / Edit", "No Access", "No Access", "Moderation / Admin"],
        ["Smart Matching & Food Claiming", "No Access", "Approve / Reject", "Search & Claim", "No Access", "Manage All"],
        ["Pickup Dispatch & Leaflet Routing", "No Access", "View Assigned", "View Courier", "Accept & Navigate", "Manual Dispatch"],
        ["Scan Handshake QR Verification", "No Access", "Display Handover", "Display Receipt", "In-Browser Scan", "Manual Override"],
        ["Karma Points & Coupon Registry", "No Access", "No Access", "No Access", "Earn & Redeem", "Manage Coupons"],
        ["NGO Legal Verification Review", "No Access", "No Access", "Submit Docs", "No Access", "Approve / Reject"],
        ["Export CSV Audit Logs & Reports", "No Access", "No Access", "No Access", "No Access", "Full CSV Export"],
    ]
    tbl_rbac = doc.add_table(rows=len(t2_data) + 1, cols=len(t2_headers))
    style_academic_table(tbl_rbac, [1.8, 0.8, 1.0, 1.0, 1.1, 1.0], t2_headers, t2_data)

    p_tcap2 = doc.add_paragraph()
    p_tcap2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_tcap2.paragraph_format.space_before = Pt(4)
    p_tcap2.paragraph_format.space_after = Pt(12)
    rt2 = p_tcap2.add_run("Table 2.1: ")
    rt2.font.name = "Times New Roman"
    rt2.font.size = Pt(10)
    rt2.font.bold = True
    rt_desc2 = p_tcap2.add_run("FoodLink Role-Based Access Control (RBAC) Permission Matrix")
    rt_desc2.font.name = "Times New Roman"
    rt_desc2.font.size = Pt(10)
    rt_desc2.font.italic = True

    add_heading_2(doc, "2.4 Hardware and Software Requirements")
    add_body_p(
        doc,
        "Table 2.2 documents the exact hardware environment, development runtime specifications, and production library versions "
        "extracted directly from the FoodLink workspace configuration."
    )

    t3_headers = ["Category", "Requirement Specification", "Actual Version Installed / Used"]
    t3_data = [
        ["Development Operating System", "Windows 11 Professional (64-bit)", "Build 26100.x64 (PowerShell 5.1)"],
        ["Runtime Environment", "Node.js JavaScript Engine", "v26.8.1 (LTS Release Track)"],
        ["Package Manager", "Node Package Manager (npm)", "11.19.0 (Workspace Monorepo Support)"],
        ["Frontend UI Library", "React.js Component Engine", "v18.3.1 (Virtual DOM with Concurrent Mode)"],
        ["Client Bundler & Dev Server", "Vite Next-Gen Tooling", "v6.0.3 (ESM HMR with Rollup Production Builder)"],
        ["Client Routing Framework", "React Router DOM", "v6.28.0 (BrowserRouter with Nested Route Guards)"],
        ["Styling Framework", "Tailwind CSS + PostCSS", "v3.4.16 (Utility-First Responsive Styling)"],
        ["Backend Web Framework", "Express.js Application Server", "v4.21.2 (MVC Routing & Middleware Pipeline)"],
        ["Database Management System", "MongoDB Atlas Cloud Cluster", "MongoDB v8.0.x (Sharded Replica Set Cluster)"],
        ["Object Data Modeling (ODM)", "Mongoose ODM for Node.js", "v8.9.0 (Schema Validation & Geospatial Indexes)"],
        ["Real-Time Engine", "Socket.IO (Client & Server)", "v4.8.1 (WebSocket Transport with Polling Fallback)"],
        ["Interactive Mapping", "Leaflet + React Leaflet", "Leaflet v1.9.4 / React-Leaflet v4.2.1"],
        ["Data Visualization", "Recharts Charting Library", "v2.15.0 (Declarative SVG Charts with ResponsiveContainer)"],
        ["QR Verification Codecs", "html5-qrcode & qrcode.react", "html5-qrcode v2.3.8 / qrcode.react v4.2.0"],
        ["Security & Cryptography", "bcryptjs, jsonwebtoken, helmet", "bcryptjs v2.4.3 / JWT v9.0.2 / Helmet v8.0.0"],
        ["Form Validation Engine", "React Hook Form + Zod", "react-hook-form v7.54.1 / Zod v3.24.1"],
        ["HTTP Client Engine", "Axios HTTP Client", "v1.7.9 (Request & Response Interceptors)"],
        ["Task Scheduler", "node-cron Background Runner", "v3.0.3 (5-minute Perishable Expiry Auditor)"],
        ["Integrated Development Env.", "Visual Studio Code", "v1.96.x (with ESLint, Prettier & GitLens)"],
        ["Version Control System", "Git Source Control & GitHub", "Git v2.48.x (Remote: GitHub Cloud Repository)"],
    ]
    tbl_req = doc.add_table(rows=len(t3_data) + 1, cols=len(t3_headers))
    style_academic_table(tbl_req, [1.8, 2.7, 2.2], t3_headers, t3_data)

    p_tcap3 = doc.add_paragraph()
    p_tcap3.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_tcap3.paragraph_format.space_before = Pt(4)
    p_tcap3.paragraph_format.space_after = Pt(12)
    rt3 = p_tcap3.add_run("Table 2.2: ")
    rt3.font.name = "Times New Roman"
    rt3.font.size = Pt(10)
    rt3.font.bold = True
    rt_desc3 = p_tcap3.add_run("System Hardware and Software Specification Environment")
    rt_desc3.font.name = "Times New Roman"
    rt_desc3.font.size = Pt(10)
    rt_desc3.font.italic = True

print("Chapter 1 & 2 module loaded.")
