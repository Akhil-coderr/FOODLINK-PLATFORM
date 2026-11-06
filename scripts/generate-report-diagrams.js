const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const OUT_DIR = path.resolve(__dirname, '../FOODLINK_Documentation_Assets');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const diagrams = [
  {
    id: 'Figure_3_1_System_Architecture',
    title: 'Figure 3.1: FoodLink Multi-Tier System Architecture',
    html: `
      <div style="width: 1000px; padding: 30px; font-family: 'Segoe UI', Arial, sans-serif; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; box-sizing: border-box;">
        <h3 style="text-align: center; color: #1e293b; margin-top: 0; margin-bottom: 25px; font-size: 20px;">FoodLink Three-Tier Architecture & Real-Time Engine</h3>
        
        <div style="display: flex; justify-content: space-between; gap: 20px;">
          <!-- Client Tier -->
          <div style="flex: 1; border: 2px solid #22c55e; border-radius: 8px; background: #f0fdf4; padding: 16px;">
            <div style="font-weight: bold; color: #15803d; font-size: 16px; margin-bottom: 12px; text-align: center; border-bottom: 2px solid #bbf7d0; padding-bottom: 6px;">1. Client Presentation Tier</div>
            <div style="background: white; border: 1px solid #86efac; border-radius: 6px; padding: 10px; margin-bottom: 10px; font-size: 13px;">
              <strong>React 18 SPA + Vite 6</strong><br/>
              • Tailwind CSS Styling<br/>
              • React Router DOM v6 (Role Guards)<br/>
              • Context API State Management
            </div>
            <div style="background: white; border: 1px solid #86efac; border-radius: 6px; padding: 10px; margin-bottom: 10px; font-size: 13px;">
              <strong>Specialized Interfaces</strong><br/>
              • Donor Portal (Donation CRUD)<br/>
              • NGO Portal (Smart Matching)<br/>
              • Volunteer Logistics (QR Scanner)<br/>
              • Admin Governance Dashboard
            </div>
            <div style="background: white; border: 1px solid #86efac; border-radius: 6px; padding: 10px; font-size: 13px;">
              <strong>Client Communication</strong><br/>
              • Axios HTTP Client with JWT Interceptors<br/>
              • Socket.IO Real-Time Client
            </div>
          </div>

          <!-- Network Flow Arrows -->
          <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; width: 100px;">
            <div style="text-align: center; font-size: 11px; font-weight: bold; color: #0284c7; margin-bottom: 8px;">HTTPS / REST<br/>JSON Requests</div>
            <div style="width: 80px; height: 3px; background: #0284c7; position: relative;">
              <div style="position: absolute; right: 0; top: -5px; width: 0; height: 0; border-top: 6px solid transparent; border-bottom: 6px solid transparent; border-left: 10px solid #0284c7;"></div>
            </div>
            <div style="width: 80px; height: 3px; background: #0284c7; margin-top: 15px; position: relative;">
              <div style="position: absolute; left: 0; top: -5px; width: 0; height: 0; border-top: 6px solid transparent; border-bottom: 6px solid transparent; border-right: 10px solid #0284c7;"></div>
            </div>
            <div style="text-align: center; font-size: 11px; font-weight: bold; color: #0284c7; margin-top: 8px;">JSON Responses</div>

            <div style="margin-top: 30px; text-align: center; font-size: 11px; font-weight: bold; color: #f59e0b;">WebSocket / WSS</div>
            <div style="width: 80px; height: 3px; background: #f59e0b; margin-top: 6px; position: relative;">
              <div style="position: absolute; right: 0; top: -5px; width: 0; height: 0; border-top: 6px solid transparent; border-bottom: 6px solid transparent; border-left: 10px solid #f59e0b;"></div>
              <div style="position: absolute; left: 0; top: -5px; width: 0; height: 0; border-top: 6px solid transparent; border-bottom: 6px solid transparent; border-right: 10px solid #f59e0b;"></div>
            </div>
            <div style="text-align: center; font-size: 10px; color: #d97706;">Live Notifications</div>
          </div>

          <!-- Application Server Tier -->
          <div style="flex: 1.1; border: 2px solid #0284c7; border-radius: 8px; background: #f0f9ff; padding: 16px;">
            <div style="font-weight: bold; color: #0369a1; font-size: 16px; margin-bottom: 12px; text-align: center; border-bottom: 2px solid #bae6fd; padding-bottom: 6px;">2. Application Logic Tier</div>
            <div style="background: white; border: 1px solid #7dd3fc; border-radius: 6px; padding: 10px; margin-bottom: 10px; font-size: 13px;">
              <strong>Node.js v26 + Express.js v4 REST API</strong><br/>
              • Helmet Security & CORS Policy<br/>
              • Rate Limiting & Cookie Parser<br/>
              • JWT Auth & Role-Based Middleware (RBAC)
            </div>
            <div style="background: white; border: 1px solid #7dd3fc; border-radius: 6px; padding: 10px; margin-bottom: 10px; font-size: 13px;">
              <strong>Core Engine Controllers</strong><br/>
              • Donation Management & Expiry Monitor<br/>
              • Smart NGO Matching (Weighted Algorithm)<br/>
              • QR Crypto Verification (SHA-256 Token)<br/>
              • Volunteer Karma & Rewards Engine
            </div>
            <div style="background: white; border: 1px solid #7dd3fc; border-radius: 6px; padding: 10px; font-size: 13px;">
              <strong>Real-Time & Integration Services</strong><br/>
              • Socket.IO Server (Rooms per User/Role)<br/>
              • Google OAuth 2.0 / OpenID Connect<br/>
              • Nodemailer SMTP Service
            </div>
          </div>

          <!-- DB Flow Arrows -->
          <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; width: 80px;">
            <div style="text-align: center; font-size: 11px; font-weight: bold; color: #16a34a; margin-bottom: 6px;">Mongoose<br/>ODM</div>
            <div style="width: 60px; height: 3px; background: #16a34a; position: relative;">
              <div style="position: absolute; right: 0; top: -5px; width: 0; height: 0; border-top: 6px solid transparent; border-bottom: 6px solid transparent; border-left: 10px solid #16a34a;"></div>
            </div>
            <div style="width: 60px; height: 3px; background: #16a34a; margin-top: 15px; position: relative;">
              <div style="position: absolute; left: 0; top: -5px; width: 0; height: 0; border-top: 6px solid transparent; border-bottom: 6px solid transparent; border-right: 10px solid #16a34a;"></div>
            </div>
            <div style="text-align: center; font-size: 11px; color: #16a34a; margin-top: 6px;">BSON Docs</div>
          </div>

          <!-- Database Tier -->
          <div style="flex: 0.9; border: 2px solid #16a34a; border-radius: 8px; background: #f0fdf4; padding: 16px;">
            <div style="font-weight: bold; color: #15803d; font-size: 16px; margin-bottom: 12px; text-align: center; border-bottom: 2px solid #bbf7d0; padding-bottom: 6px;">3. Data Storage Tier</div>
            <div style="background: white; border: 1px solid #86efac; border-radius: 6px; padding: 10px; margin-bottom: 10px; font-size: 13px;">
              <strong>MongoDB Atlas Cloud</strong><br/>
              Cluster: <code>fsd.k8pb063.mongodb.net</code><br/>
              Database: <code>foodlink</code><br/>
              • TLS/SSL Encrypted Wire Protocol<br/>
              • High Availability Sharded Replica
            </div>
            <div style="background: white; border: 1px solid #86efac; border-radius: 6px; padding: 10px; font-size: 13px;">
              <strong>Core Mongoose Collections</strong><br/>
              • Users & Profiles (Donor/NGO/Vol)<br/>
              • Donations & Pickup Requests<br/>
              • Assignments & QR Deliveries<br/>
              • Rewards, Redemptions & Points<br/>
              • Notifications, Impact & Audit Logs
            </div>
          </div>
        </div>
      </div>
    `
  },
  {
    id: 'Figure_3_2_Use_Case_Diagram',
    title: 'Figure 3.2: FoodLink Use Case Diagram Across User Roles',
    html: `
      <div style="width: 1000px; padding: 25px; font-family: 'Segoe UI', Arial, sans-serif; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; box-sizing: border-box;">
        <h3 style="text-align: center; color: #1e293b; margin-top: 0; margin-bottom: 20px; font-size: 20px;">FoodLink Role-Based Use Case Model</h3>
        
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px;">
          <!-- Donor Role -->
          <div style="border: 2px solid #14532d; border-radius: 8px; padding: 12px; background: #f0fdf4;">
            <div style="text-align: center; font-weight: bold; color: #14532d; font-size: 15px; margin-bottom: 8px;">👤 Donor Role</div>
            <div style="font-size: 11px; color: #475569; text-align: center; margin-bottom: 12px;">(Hotels, Banquets, Restaurants)</div>
            <div style="background: white; border: 1px solid #86efac; border-radius: 6px; padding: 8px; margin-bottom: 6px; font-size: 12px;">• Register & Verify Organization</div>
            <div style="background: white; border: 1px solid #86efac; border-radius: 6px; padding: 8px; margin-bottom: 6px; font-size: 12px;">• Create Food Surplus Listing</div>
            <div style="background: white; border: 1px solid #86efac; border-radius: 6px; padding: 8px; margin-bottom: 6px; font-size: 12px;">• Specify Expiry Window & Servings</div>
            <div style="background: white; border: 1px solid #86efac; border-radius: 6px; padding: 8px; margin-bottom: 6px; font-size: 12px;">• Review & Accept NGO Requests</div>
            <div style="background: white; border: 1px solid #86efac; border-radius: 6px; padding: 8px; margin-bottom: 6px; font-size: 12px;">• Generate Handover Pickup QR Code</div>
            <div style="background: white; border: 1px solid #86efac; border-radius: 6px; padding: 8px; font-size: 12px;">• View Food Rescue Analytics</div>
          </div>

          <!-- NGO Role -->
          <div style="border: 2px solid #0284c7; border-radius: 8px; padding: 12px; background: #f0f9ff;">
            <div style="text-align: center; font-weight: bold; color: #0369a1; font-size: 15px; margin-bottom: 8px;">🏢 NGO Role</div>
            <div style="font-size: 11px; color: #475569; text-align: center; margin-bottom: 12px;">(Shelters, Orphanages, Trust Homes)</div>
            <div style="background: white; border: 1px solid #7dd3fc; border-radius: 6px; padding: 8px; margin-bottom: 6px; font-size: 12px;">• Submit Trust Reg. & Capacity</div>
            <div style="background: white; border: 1px solid #7dd3fc; border-radius: 6px; padding: 8px; margin-bottom: 6px; font-size: 12px;">• Discover Available Surplus Meals</div>
            <div style="background: white; border: 1px solid #7dd3fc; border-radius: 6px; padding: 8px; margin-bottom: 6px; font-size: 12px;">• Smart Matching Recommendations</div>
            <div style="background: white; border: 1px solid #7dd3fc; border-radius: 6px; padding: 8px; margin-bottom: 6px; font-size: 12px;">• Claim Food with Capacity Lock</div>
            <div style="background: white; border: 1px solid #7dd3fc; border-radius: 6px; padding: 8px; margin-bottom: 6px; font-size: 12px;">• Verify Delivery via Crypto QR</div>
            <div style="background: white; border: 1px solid #7dd3fc; border-radius: 6px; padding: 8px; font-size: 12px;">• Track Impact & Community Meals</div>
          </div>

          <!-- Volunteer Role -->
          <div style="border: 2px solid #d97706; border-radius: 8px; padding: 12px; background: #fffbeb;">
            <div style="text-align: center; font-weight: bold; color: #b45309; font-size: 15px; margin-bottom: 8px;">🛵 Volunteer Role</div>
            <div style="font-size: 11px; color: #475569; text-align: center; margin-bottom: 12px;">(Transport Riders, Community Heroes)</div>
            <div style="background: white; border: 1px solid #fde68a; border-radius: 6px; padding: 8px; margin-bottom: 6px; font-size: 12px;">• Register Vehicle & Service Radius</div>
            <div style="background: white; border: 1px solid #fde68a; border-radius: 6px; padding: 8px; margin-bottom: 6px; font-size: 12px;">• Accept Food Dispatch Task</div>
            <div style="background: white; border: 1px solid #fde68a; border-radius: 6px; padding: 8px; margin-bottom: 6px; font-size: 12px;">• View Optimized Route on Map</div>
            <div style="background: white; border: 1px solid #fde68a; border-radius: 6px; padding: 8px; margin-bottom: 6px; font-size: 12px;">• Scan Donor Pickup QR Code</div>
            <div style="background: white; border: 1px solid #fde68a; border-radius: 6px; padding: 8px; margin-bottom: 6px; font-size: 12px;">• Scan NGO Delivery Receipt QR</div>
            <div style="background: white; border: 1px solid #fde68a; border-radius: 6px; padding: 8px; font-size: 12px;">• Earn Karma Points & Badges</div>
          </div>

          <!-- Admin Role -->
          <div style="border: 2px solid #7c3aed; border-radius: 8px; padding: 12px; background: #faf5ff;">
            <div style="text-align: center; font-weight: bold; color: #6d28d9; font-size: 15px; margin-bottom: 8px;">🛡️ Administrator</div>
            <div style="font-size: 11px; color: #475569; text-align: center; margin-bottom: 12px;">(Platform Governance & Audit)</div>
            <div style="background: white; border: 1px solid #ddd6fe; border-radius: 6px; padding: 8px; margin-bottom: 6px; font-size: 12px;">• Master Security Control Center</div>
            <div style="background: white; border: 1px solid #ddd6fe; border-radius: 6px; padding: 8px; margin-bottom: 6px; font-size: 12px;">• Verify & Approve NGO Credentials</div>
            <div style="background: white; border: 1px solid #ddd6fe; border-radius: 6px; padding: 8px; margin-bottom: 6px; font-size: 12px;">• Food Safety Compliance Audit</div>
            <div style="background: white; border: 1px solid #ddd6fe; border-radius: 6px; padding: 8px; margin-bottom: 6px; font-size: 12px;">• Manual Volunteer Dispatch</div>
            <div style="background: white; border: 1px solid #ddd6fe; border-radius: 6px; padding: 8px; margin-bottom: 6px; font-size: 12px;">• Manage Reward Coupon Registry</div>
            <div style="background: white; border: 1px solid #ddd6fe; border-radius: 6px; padding: 8px; font-size: 12px;">• Export CSV Reports & Audit Logs</div>
          </div>
        </div>
      </div>
    `
  },
  {
    id: 'Figure_3_3_DFD_Level_0',
    title: 'Figure 3.3: Data Flow Diagram (Level 0 – Context Diagram)',
    html: `
      <div style="width: 1000px; padding: 30px; font-family: 'Segoe UI', Arial, sans-serif; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; box-sizing: border-box;">
        <h3 style="text-align: center; color: #1e293b; margin-top: 0; margin-bottom: 30px; font-size: 20px;">FoodLink Context Level 0 Data Flow Diagram</h3>
        
        <div style="display: flex; justify-content: space-between; align-items: center; position: relative;">
          <!-- Left Entities (Donor & Volunteer) -->
          <div style="width: 200px; display: flex; flex-direction: column; gap: 40px;">
            <div style="border: 2px solid #14532d; background: #f0fdf4; border-radius: 8px; padding: 16px; text-align: center;">
              <strong style="color: #14532d; font-size: 16px;">External Entity:<br/>DONOR</strong>
              <div style="font-size: 11px; color: #64748b; margin-top: 6px;">Hotels, Caterers, Hostels</div>
            </div>
            <div style="border: 2px solid #d97706; background: #fffbeb; border-radius: 8px; padding: 16px; text-align: center;">
              <strong style="color: #b45309; font-size: 16px;">External Entity:<br/>VOLUNTEER</strong>
              <div style="font-size: 11px; color: #64748b; margin-top: 6px;">Riders & Transporters</div>
            </div>
          </div>

          <!-- Central System Bubble -->
          <div style="width: 320px; height: 320px; border-radius: 50%; border: 4px solid #16a34a; background: #f0fdf4; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; padding: 25px; box-sizing: border-box; box-shadow: 0 4px 12px rgba(22, 163, 74, 0.15);">
            <div style="font-size: 14px; font-weight: bold; color: #166534; margin-bottom: 6px;">PROCESS 0.0</div>
            <h2 style="margin: 0 0 10px 0; color: #14532d; font-size: 22px;">FOODLINK PLATFORM SYSTEM</h2>
            <div style="font-size: 12px; color: #334155; line-height: 1.4;">
              • Surplus Food Matching<br/>
              • Dynamic Reservation Engine<br/>
              • Single-Use QR Crypto Protocol<br/>
              • Real-time Socket Dispatches<br/>
              • Karma Points Ledger
            </div>
          </div>

          <!-- Right Entities (NGO & Admin) -->
          <div style="width: 200px; display: flex; flex-direction: column; gap: 40px;">
            <div style="border: 2px solid #0284c7; background: #f0f9ff; border-radius: 8px; padding: 16px; text-align: center;">
              <strong style="color: #0369a1; font-size: 16px;">External Entity:<br/>NGO RECIPIENT</strong>
              <div style="font-size: 11px; color: #64748b; margin-top: 6px;">Shelters, Care Homes</div>
            </div>
            <div style="border: 2px solid #7c3aed; background: #faf5ff; border-radius: 8px; padding: 16px; text-align: center;">
              <strong style="color: #6d28d9; font-size: 16px;">External Entity:<br/>ADMINISTRATOR</strong>
              <div style="font-size: 11px; color: #64748b; margin-top: 6px;">Platform Governance</div>
            </div>
          </div>
        </div>

        <div style="margin-top: 25px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; font-size: 12px; color: #475569; text-align: center;">
          <strong>Data Inflows:</strong> Donation Specifications, Claim Requests, GPS Locations, QR Scans, Verification Docs.<br/>
          <strong>Data Outflows:</strong> Surplus Catalog, Real-Time Socket Notifications, Delivery Routing Maps, Karma Rewards, Audit Reports.
        </div>
      </div>
    `
  },
  {
    id: 'Figure_3_4_DFD_Level_1',
    title: 'Figure 3.4: Data Flow Diagram (Level 1 – Subsystem Decomposition)',
    html: `
      <div style="width: 1000px; padding: 25px; font-family: 'Segoe UI', Arial, sans-serif; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; box-sizing: border-box;">
        <h3 style="text-align: center; color: #1e293b; margin-top: 0; margin-bottom: 20px; font-size: 20px;">FoodLink Level 1 Data Flow Diagram (Detailed Decomposition)</h3>
        
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 15px;">
          <div style="border: 2px solid #0284c7; border-radius: 8px; padding: 12px; background: #f0f9ff;">
            <div style="font-weight: bold; color: #0284c7; font-size: 14px; margin-bottom: 6px;">Process 1.0: Auth & RBAC</div>
            <div style="font-size: 12px; color: #334155;">
              • Credential Hashing (bcrypt)<br/>
              • Google OAuth 2.0 State Flow<br/>
              • JWT Access/Refresh Generation<br/>
              • Role Permission Verification
            </div>
            <div style="margin-top: 8px; font-size: 11px; color: #0284c7; font-weight: bold;">➜ Target: [D1: Users Store]</div>
          </div>

          <div style="border: 2px solid #16a34a; border-radius: 8px; padding: 12px; background: #f0fdf4;">
            <div style="font-weight: bold; color: #16a34a; font-size: 14px; margin-bottom: 6px;">Process 2.0: Donation Lifecycle</div>
            <div style="font-size: 12px; color: #334155;">
              • Surplus Publishing & Photos<br/>
              • Expiry Window Auto-Calculation<br/>
              • Status Progression Controller<br/>
              • Background Expiry Monitor Job
            </div>
            <div style="margin-top: 8px; font-size: 11px; color: #16a34a; font-weight: bold;">➜ Target: [D2: Donations Store]</div>
          </div>

          <div style="border: 2px solid #d97706; border-radius: 8px; padding: 12px; background: #fffbeb;">
            <div style="font-weight: bold; color: #d97706; font-size: 14px; margin-bottom: 6px;">Process 3.0: Smart Matching</div>
            <div style="font-size: 12px; color: #334155;">
              • Geospatial Distance Engine (35%)<br/>
              • Category Compatibility (30%)<br/>
              • Capacity Availability (20%)<br/>
              • Atomic Capacity Reservation
            </div>
            <div style="margin-top: 8px; font-size: 11px; color: #d97706; font-weight: bold;">➜ Target: [D3: Requests Store]</div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
          <div style="border: 2px solid #8b5cf6; border-radius: 8px; padding: 12px; background: #f5f3ff;">
            <div style="font-weight: bold; color: #8b5cf6; font-size: 14px; margin-bottom: 6px;">Process 4.0: Dispatch & Route</div>
            <div style="font-size: 12px; color: #334155;">
              • Volunteer Radius Filtering<br/>
              • Pickup Task Assignment<br/>
              • OpenStreetMap / Leaflet Route<br/>
              • Socket Dispatch Broadcast
            </div>
            <div style="margin-top: 8px; font-size: 11px; color: #8b5cf6; font-weight: bold;">➜ Target: [D4: Assignments Store]</div>
          </div>

          <div style="border: 2px solid #ef4444; border-radius: 8px; padding: 12px; background: #fef2f2;">
            <div style="font-weight: bold; color: #ef4444; font-size: 14px; margin-bottom: 6px;">Process 5.0: QR Verification</div>
            <div style="font-size: 12px; color: #334155;">
              • Single-Use Nonce Generation<br/>
              • SHA-256 Cryptographic Hash<br/>
              • Donor Pickup Token Verification<br/>
              • NGO Receipt Token Handshake
            </div>
            <div style="margin-top: 8px; font-size: 11px; color: #ef4444; font-weight: bold;">➜ Target: [D5: QR Verification]</div>
          </div>

          <div style="border: 2px solid #0d9488; border-radius: 8px; padding: 12px; background: #f0fdfa;">
            <div style="font-weight: bold; color: #0d9488; font-size: 14px; margin-bottom: 6px;">Process 6.0: Karma & Governance</div>
            <div style="font-size: 12px; color: #334155;">
              • Volunteer Points & Badges<br/>
              • Partner Coupon Redemption<br/>
              • Food Safety Moderation Audit<br/>
              • Carbon & Meals Impact Analytics
            </div>
            <div style="margin-top: 8px; font-size: 11px; color: #0d9488; font-weight: bold;">➜ Target: [D6: Rewards & Impact]</div>
          </div>
        </div>
      </div>
    `
  },
  {
    id: 'Figure_3_5_Database_ER_Diagram',
    title: 'Figure 3.5: FoodLink Entity-Relationship Database Schema',
    html: `
      <div style="width: 1000px; padding: 25px; font-family: 'Segoe UI', Arial, sans-serif; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; box-sizing: border-box;">
        <h3 style="text-align: center; color: #1e293b; margin-top: 0; margin-bottom: 20px; font-size: 20px;">FoodLink MongoDB Relational Document Model</h3>
        
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;">
          <!-- User Model -->
          <div style="border: 2px solid #1e293b; border-radius: 6px; font-size: 11px;">
            <div style="background: #1e293b; color: white; padding: 6px; font-weight: bold; text-align: center;">Collection: User</div>
            <div style="padding: 8px; background: #f8fafc; line-height: 1.5;">
              🔑 _id: ObjectId<br/>
              • name: String<br/>
              • email: String (unique)<br/>
              • passwordHash: String<br/>
              • role: donor|ngo|volunteer|admin<br/>
              • location: GeoJSON Point<br/>
              • accountStatus: active|pending<br/>
              • authProviders: Array
            </div>
          </div>

          <!-- Donor Profile -->
          <div style="border: 2px solid #14532d; border-radius: 6px; font-size: 11px;">
            <div style="background: #14532d; color: white; padding: 6px; font-weight: bold; text-align: center;">DonorProfile</div>
            <div style="padding: 8px; background: #f0fdf4; line-height: 1.5;">
              🔑 _id: ObjectId<br/>
              🔗 userId ➜ User._id<br/>
              • organizationName: String<br/>
              • organizationType: String<br/>
              • verificationStatus: String<br/>
              • totalFoodDonatedKg: Number<br/>
              • totalDonations: Number
            </div>
          </div>

          <!-- NGO Profile -->
          <div style="border: 2px solid #0369a1; border-radius: 6px; font-size: 11px;">
            <div style="background: #0369a1; color: white; padding: 6px; font-weight: bold; text-align: center;">NGOProfile</div>
            <div style="padding: 8px; background: #f0f9ff; line-height: 1.5;">
              🔑 _id: ObjectId<br/>
              🔗 userId ➜ User._id<br/>
              • organizationName: String<br/>
              • registrationNumber: String<br/>
              • receivingCapacityKg: Number<br/>
              • currentReservedCapacityKg: Number<br/>
              • verificationStatus: approved|pending
            </div>
          </div>

          <!-- Volunteer Profile -->
          <div style="border: 2px solid #b45309; border-radius: 6px; font-size: 11px;">
            <div style="background: #b45309; color: white; padding: 6px; font-weight: bold; text-align: center;">VolunteerProfile</div>
            <div style="padding: 8px; background: #fffbeb; line-height: 1.5;">
              🔑 _id: ObjectId<br/>
              🔗 userId ➜ User._id<br/>
              • transportType: String<br/>
              • maximumCapacityKg: Number<br/>
              • totalPoints: Number<br/>
              • completedTasks: Number<br/>
              • achievements: Array[String]
            </div>
          </div>

          <!-- Donation -->
          <div style="border: 2px solid #15803d; border-radius: 6px; font-size: 11px;">
            <div style="background: #15803d; color: white; padding: 6px; font-weight: bold; text-align: center;">Collection: Donation</div>
            <div style="padding: 8px; background: #f0fdf4; line-height: 1.5;">
              🔑 _id: ObjectId<br/>
              🔗 donorId ➜ User._id<br/>
              • foodTitle: String<br/>
              • foodCategory: String<br/>
              • quantity: { amount, unit }<br/>
              • estimatedServings: Number<br/>
              • status: available|reserved|completed<br/>
              • expiryTime: Date<br/>
              • pickupAddress: String
            </div>
          </div>

          <!-- Pickup Request -->
          <div style="border: 2px solid #0284c7; border-radius: 6px; font-size: 11px;">
            <div style="background: #0284c7; color: white; padding: 6px; font-weight: bold; text-align: center;">PickupRequest</div>
            <div style="padding: 8px; background: #f0f9ff; line-height: 1.5;">
              🔑 _id: ObjectId<br/>
              🔗 donationId ➜ Donation._id<br/>
              🔗 ngoId ➜ User._id<br/>
              • status: pending|approved|rejected<br/>
              • quantityRequested: Number<br/>
              • requiresTransport: Boolean<br/>
              • requestedAt: Date
            </div>
          </div>

          <!-- Assignment -->
          <div style="border: 2px solid #d97706; border-radius: 6px; font-size: 11px;">
            <div style="background: #d97706; color: white; padding: 6px; font-weight: bold; text-align: center;">Collection: Assignment</div>
            <div style="padding: 8px; background: #fffbeb; line-height: 1.5;">
              🔑 _id: ObjectId<br/>
              🔗 requestId ➜ PickupRequest._id<br/>
              🔗 donationId ➜ Donation._id<br/>
              🔗 volunteerId ➜ User._id<br/>
              • status: assigned|picked_up|delivered<br/>
              • pickupVerification: { codeHash }<br/>
              • deliveryVerification: { codeHash }
            </div>
          </div>

          <!-- Reward & Impact -->
          <div style="border: 2px solid #7c3aed; border-radius: 6px; font-size: 11px;">
            <div style="background: #7c3aed; color: white; padding: 6px; font-weight: bold; text-align: center;">Reward & Impact</div>
            <div style="padding: 8px; background: #faf5ff; line-height: 1.5;">
              🔑 _id: ObjectId<br/>
              🔗 volunteerId ➜ User._id<br/>
              • pointsSpent / Earned: Number<br/>
              • couponCode: String<br/>
              • foodSavedKg: Number<br/>
              • mealsProvided: Number<br/>
              • carbonEmissionsOffsetKg: Number
            </div>
          </div>
        </div>
      </div>
    `
  },
  {
    id: 'Figure_3_6_Food_Donation_Workflow',
    title: 'Figure 3.6: Surplus Food Donation and Redistribution State Machine',
    html: `
      <div style="width: 1000px; padding: 25px; font-family: 'Segoe UI', Arial, sans-serif; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; box-sizing: border-box;">
        <h3 style="text-align: center; color: #1e293b; margin-top: 0; margin-bottom: 25px; font-size: 20px;">FoodLink End-to-End Surplus Redistribution Lifecycle</h3>
        
        <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px;">
          <div style="flex: 1; border: 2px solid #16a34a; background: #f0fdf4; border-radius: 8px; padding: 10px; text-align: center;">
            <div style="font-weight: bold; color: #166534; font-size: 13px;">1. Post Surplus</div>
            <div style="font-size: 11px; color: #475569; margin-top: 4px;">Donor lists edible meals with expiry time</div>
            <div style="margin-top: 6px; background: #22c55e; color: white; padding: 3px 6px; border-radius: 4px; font-size: 10px; font-weight: bold;">STATUS: available</div>
          </div>

          <div style="font-size: 18px; color: #94a3b8;">➔</div>

          <div style="flex: 1; border: 2px solid #0284c7; background: #f0f9ff; border-radius: 8px; padding: 10px; text-align: center;">
            <div style="font-weight: bold; color: #0369a1; font-size: 13px;">2. Smart Matching</div>
            <div style="font-size: 11px; color: #475569; margin-top: 4px;">Weighted matching algorithm alerts NGOs</div>
            <div style="margin-top: 6px; background: #0284c7; color: white; padding: 3px 6px; border-radius: 4px; font-size: 10px; font-weight: bold;">STATUS: requested</div>
          </div>

          <div style="font-size: 18px; color: #94a3b8;">➔</div>

          <div style="flex: 1; border: 2px solid #f59e0b; background: #fffbeb; border-radius: 8px; padding: 10px; text-align: center;">
            <div style="font-weight: bold; color: #b45309; font-size: 13px;">3. Claim & Lock</div>
            <div style="font-size: 11px; color: #475569; margin-top: 4px;">Donor approves request, lock capacity</div>
            <div style="margin-top: 6px; background: #f59e0b; color: white; padding: 3px 6px; border-radius: 4px; font-size: 10px; font-weight: bold;">STATUS: reserved</div>
          </div>

          <div style="font-size: 18px; color: #94a3b8;">➔</div>

          <div style="flex: 1; border: 2px solid #8b5cf6; background: #f5f3ff; border-radius: 8px; padding: 10px; text-align: center;">
            <div style="font-weight: bold; color: #6d28d9; font-size: 13px;">4. Volunteer Pickup</div>
            <div style="font-size: 11px; color: #475569; margin-top: 4px;">Volunteer scans Donor QR (crypto hash)</div>
            <div style="margin-top: 6px; background: #8b5cf6; color: white; padding: 3px 6px; border-radius: 4px; font-size: 10px; font-weight: bold;">STATUS: in_transit</div>
          </div>

          <div style="font-size: 18px; color: #94a3b8;">➔</div>

          <div style="flex: 1; border: 2px solid #10b981; background: #ecfdf5; border-radius: 8px; padding: 10px; text-align: center;">
            <div style="font-weight: bold; color: #047857; font-size: 13px;">5. Delivery & Karma</div>
            <div style="font-size: 11px; color: #475569; margin-top: 4px;">NGO scans Delivery QR, points awarded</div>
            <div style="margin-top: 6px; background: #10b981; color: white; padding: 3px 6px; border-radius: 4px; font-size: 10px; font-weight: bold;">STATUS: completed</div>
          </div>
        </div>
      </div>
    `
  },
  {
    id: 'Figure_4_1_Request_Response_Lifecycle',
    title: 'Figure 4.1: End-to-End Client-Server REST & Real-Time Lifecycle',
    html: `
      <div style="width: 1000px; padding: 25px; font-family: 'Segoe UI', Arial, sans-serif; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; box-sizing: border-box;">
        <h3 style="text-align: center; color: #1e293b; margin-top: 0; margin-bottom: 20px; font-size: 20px;">FoodLink Request-Response Sequence & Transaction Flow</h3>
        
        <div style="display: flex; justify-content: space-between; gap: 12px;">
          <div style="flex: 1; border: 1px solid #cbd5e1; border-radius: 6px; padding: 12px; background: #f8fafc;">
            <strong style="color: #0f172a; font-size: 13px;">Step 1: Client Submission</strong>
            <p style="font-size: 11px; color: #475569; margin: 6px 0 0 0; line-height: 1.4;">
              Donor fills donation form in React. Axios interceptor injects <code>Authorization: Bearer &lt;JWT&gt;</code> and dispatches <code>POST /api/donations</code>.
            </p>
          </div>

          <div style="flex: 1; border: 1px solid #cbd5e1; border-radius: 6px; padding: 12px; background: #f8fafc;">
            <strong style="color: #0f172a; font-size: 13px;">Step 2: Security & RBAC</strong>
            <p style="font-size: 11px; color: #475569; margin: 6px 0 0 0; line-height: 1.4;">
              Express middleware authenticates JWT signature, verifies expiration, and checks that user role is <code>donor</code>.
            </p>
          </div>

          <div style="flex: 1; border: 1px solid #cbd5e1; border-radius: 6px; padding: 12px; background: #f8fafc;">
            <strong style="color: #0f172a; font-size: 13px;">Step 3: Database Commit</strong>
            <p style="font-size: 11px; color: #475569; margin: 6px 0 0 0; line-height: 1.4;">
              Donation controller validates payload, computes GeoJSON coordinates, and writes to MongoDB Atlas collection.
            </p>
          </div>

          <div style="flex: 1; border: 1px solid #cbd5e1; border-radius: 6px; padding: 12px; background: #f8fafc;">
            <strong style="color: #0f172a; font-size: 13px;">Step 4: Real-Time Dispatch</strong>
            <p style="font-size: 11px; color: #475569; margin: 6px 0 0 0; line-height: 1.4;">
              Smart engine computes compatibility scores and triggers <code>socket.to('role_ngo').emit('NEW_SURPLUS_FOOD')</code>.
            </p>
          </div>
        </div>
      </div>
    `
  }
];

async function generateDiagrams() {
  console.log('📊 Rendering professional vector diagram images...');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();

  for (const diag of diagrams) {
    console.log(`Rendering ${diag.id}...`);
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { margin: 0; padding: 20px; background: #f1f5f9; display: flex; justify-content: center; }
          </style>
        </head>
        <body>
          ${diag.html}
        </body>
      </html>
    `);
    await page.waitForTimeout(500);
    const element = await page.$('div');
    const outPath = path.join(OUT_DIR, `${diag.id}.png`);
    await element.screenshot({ path: outPath });
    console.log(`Saved: ${outPath}`);
  }

  await browser.close();
  console.log('✅ All 7 professional diagrams rendered successfully in:', OUT_DIR);
}

generateDiagrams().catch(err => {
  console.error('Error generating diagrams:', err);
  process.exit(1);
});
