# -*- coding: utf-8 -*-
"""
Front Matter Builder for FoodLink Report
Covers Cover Page, Title Page, Abstract, Keywords, TOC, List of Figures, List of Tables
"""

import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from generate_complete_docx import (
    set_cell_background, set_cell_margins, set_table_borders,
    add_heading_1, add_body_p
)

def build_front_matter(doc):
    # ========================================================
    # 1. COVER PAGE
    # ========================================================
    p_inst = doc.add_paragraph()
    p_inst.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_inst.paragraph_format.space_before = Pt(0)
    p_inst.paragraph_format.space_after = Pt(2)
    r = p_inst.add_run("KUMARAGURU COLLEGE OF TECHNOLOGY (KCT)")
    r.font.name = "Times New Roman"
    r.font.size = Pt(14)
    r.font.bold = True
    r.font.color.rgb = RGBColor(20, 83, 45) # Forest Green

    p_dept = doc.add_paragraph()
    p_dept.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_dept.paragraph_format.space_after = Pt(24)
    r = p_dept.add_run("DEPARTMENT OF ARTIFICIAL INTELLIGENCE AND DATA SCIENCE\nCOIMBATORE – 641049, TAMIL NADU")
    r.font.name = "Times New Roman"
    r.font.size = Pt(11)
    r.font.bold = True
    r.font.color.rgb = RGBColor(71, 85, 105)

    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_before = Pt(36)
    p_title.paragraph_format.space_after = Pt(12)
    p_title.paragraph_format.line_spacing = 1.2
    r = p_title.add_run("FOODLINK – FOOD DONATION AND REDISTRIBUTION PLATFORM")
    r.font.name = "Times New Roman"
    r.font.size = Pt(18)
    r.font.bold = True
    r.font.color.rgb = RGBColor(20, 83, 45)

    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.space_after = Pt(24)
    r = p_sub.add_run("A Full Stack Web Application using the MERN Stack\n(MongoDB, Express.js, React, Node.js)")
    r.font.name = "Times New Roman"
    r.font.size = Pt(12.5)
    r.font.italic = True
    r.font.color.rgb = RGBColor(51, 65, 85)

    p_req = doc.add_paragraph()
    p_req.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_req.paragraph_format.space_before = Pt(20)
    p_req.paragraph_format.space_after = Pt(4)
    r = p_req.add_run("Project Report submitted in partial fulfilment of the requirements for the course")
    r.font.name = "Times New Roman"
    r.font.size = Pt(11)
    r.font.color.rgb = RGBColor(71, 85, 105)

    p_course = doc.add_paragraph()
    p_course.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_course.paragraph_format.space_after = Pt(24)
    r = p_course.add_run("FULL STACK DEVELOPMENT (24CSI013)\nB.Tech. Artificial Intelligence and Data Science — V Semester / 2026")
    r.font.name = "Times New Roman"
    r.font.size = Pt(12)
    r.font.bold = True
    r.font.color.rgb = RGBColor(30, 41, 59)

    p_subby = doc.add_paragraph()
    p_subby.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_subby.paragraph_format.space_after = Pt(8)
    r = p_subby.add_run("Submitted by")
    r.font.name = "Times New Roman"
    r.font.size = Pt(11)
    r.font.bold = True

    # Student Table - 4 members
    tbl_team = doc.add_table(rows=5, cols=3)
    tbl_team.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(tbl_team, color="CBD5E1", sz="4")
    
    headers = ["Team Member Name", "Roll Number", "Role in Project"]
    for i, h in enumerate(headers):
        cell = tbl_team.cell(0, i)
        cell.text = h
        set_cell_background(cell, "14532D")
        set_cell_margins(cell, top=120, bottom=120, left=140, right=140)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        for r_run in p.runs:
            r_run.font.name = "Times New Roman"
            r_run.font.size = Pt(10)
            r_run.font.bold = True
            r_run.font.color.rgb = RGBColor(255, 255, 255)

    team_data = [
        ("AKHIL C", "24BAD007", "Frontend Architecture & System Integration"),
        ("SANJAY R", "24BAD407", "Backend REST API & Authentication Services"),
        ("SANTHOSH PRABHU S", "24BAD408", "Database Modeling & Mongoose Schemas"),
        ("KAMALESH M", "24BAD053", "Volunteer Logistics & Smart Matching Engine"),
    ]

    for idx, (name, roll, role) in enumerate(team_data):
        row = tbl_team.rows[idx + 1]
        bg = "F9FAFB" if idx % 2 == 1 else "FFFFFF"
        for c_idx, val in enumerate([name, roll, role]):
            cell = row.cells[c_idx]
            cell.text = val
            set_cell_background(cell, bg)
            set_cell_margins(cell, top=100, bottom=100, left=140, right=140)
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            p.paragraph_format.line_spacing = 1.15
            for r_run in p.runs:
                r_run.font.name = "Times New Roman"
                r_run.font.size = Pt(9.5)
                r_run.font.color.rgb = RGBColor(31, 41, 55)
                if c_idx == 0:
                    r_run.font.bold = True

    col_w = [2.2, 1.4, 2.8]
    for row in tbl_team.rows:
        for c_i, w in enumerate(col_w):
            row.cells[c_i].width = Inches(w)

    p_guide = doc.add_paragraph()
    p_guide.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_guide.paragraph_format.space_before = Pt(28)
    p_guide.paragraph_format.space_after = Pt(2)
    r = p_guide.add_run("Under the guidance of")
    r.font.name = "Times New Roman"
    r.font.size = Pt(11)
    r.font.italic = True

    p_guide_info = doc.add_paragraph()
    p_guide_info.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_guide_info.paragraph_format.space_after = Pt(18)
    r = p_guide_info.add_run("[Faculty Guide Name, Designation]\nDepartment of Artificial Intelligence and Data Science\nKumaraguru College of Technology, Coimbatore – 641049\nNovember, 2026")
    r.font.name = "Times New Roman"
    r.font.size = Pt(11)
    r.font.bold = True
    r.font.color.rgb = RGBColor(51, 65, 85)

    doc.add_page_break()

    # ========================================================
    # 2. ABSTRACT & KEYWORDS
    # ========================================================
    add_heading_1(doc, "Abstract")
    
    add_body_p(
        doc,
        "Every year, an estimated 68 million tonnes of edible food is wasted across India, while millions of vulnerable "
        "individuals face acute daily nutritional deficits. Commercial hospitality establishments—including banquet halls, "
        "hotels, restaurants, hostels, and corporate cafeterias—routinely generate predictable surplus edible food that is "
        "discarded due to lack of real-time coordination, rigorous verification protocols, and rapid local transport networks. "
        "This project presents FoodLink, a production-grade, multi-tier full-stack web platform built using the MERN stack "
        "(MongoDB Atlas, Express.js, React 18 with Vite, and Node.js v26) to systematically solve the food redistribution challenge. "
        "FoodLink provides a centralized, authenticated digital ecosystem serving four distinct user roles: Donors, Verified NGOs, "
        "Volunteer Logistics Couriers, and System Administrators. The platform incorporates an automated Weighted Smart Matching "
        "Engine that recommends optimal NGO recipients based on geospatial proximity (35%), dietary category compatibility (30%), "
        "recipient storage capacity (20%), and time to food expiry (15%). Food safety and chain-of-custody are rigorously guaranteed "
        "via a dual-handshake cryptographic QR verification protocol utilizing single-use SHA-256 tokens for pickup and delivery handovers. "
        "The system integrates real-time authenticated WebSocket notifications via Socket.IO, an automated background cron job that "
        "monitors perishable food expiry windows, and an impact analytics dashboard tracking kilograms of food rescued, community meals "
        "provided, and net carbon emissions offset. The platform has been fully deployed on Render with cloud database persistence on MongoDB "
        "Atlas, achieving 100% test pass rates across 53 unit and integration test suites, zero double-claiming through atomic reservation "
        "transactions, and dynamic responsive access across mobile, tablet, and desktop viewports."
    )
    
    p_kw = doc.add_paragraph()
    p_kw.paragraph_format.space_before = Pt(10)
    p_kw.paragraph_format.space_after = Pt(20)
    r_kw_label = p_kw.add_run("Keywords: ")
    r_kw_label.font.name = "Times New Roman"
    r_kw_label.font.size = Pt(11)
    r_kw_label.font.bold = True
    r_kw_label.font.color.rgb = RGBColor(20, 83, 45)

    r_kw = p_kw.add_run("MERN Stack, Food Redistribution Platform, Smart Matching Engine, Cryptographic QR Verification, Real-Time Socket.IO, Role-Based Access Control (RBAC).")
    r_kw.font.name = "Times New Roman"
    r_kw.font.size = Pt(11)
    r_kw.font.italic = True

    doc.add_page_break()

    # ========================================================
    # 3. TABLE OF CONTENTS
    # ========================================================
    add_heading_1(doc, "Table of Contents")
    
    toc_items = [
        ("Abstract", "ii"),
        ("Keywords", "ii"),
        ("List of Figures", "iv"),
        ("List of Tables", "v"),
        ("CHAPTER 1: INTRODUCTION", "1"),
        ("    1.1 Background", "1"),
        ("    1.2 Problem Statement", "2"),
        ("    1.3 Objectives", "2"),
        ("    1.4 Scope", "3"),
        ("    1.5 Existing Systems and Their Limitations", "4"),
        ("    1.6 Organisation of the Report", "5"),
        ("CHAPTER 2: REQUIREMENT ANALYSIS", "6"),
        ("    2.1 Functional Requirements (FR1 to FR16)", "6"),
        ("    2.2 Non-Functional Requirements", "9"),
        ("    2.3 User Roles and Permission Matrix", "10"),
        ("    2.4 Hardware and Software Requirements", "11"),
        ("CHAPTER 3: SYSTEM DESIGN", "13"),
        ("    3.1 System Architecture", "13"),
        ("    3.2 Use Case Diagram & Actor Analysis", "15"),
        ("    3.3 Data Flow Diagrams (Level 0 and Level 1)", "16"),
        ("    3.4 Database Design & Relational Document Model", "18"),
        ("    3.5 REST API Design & Specification", "22"),
        ("    3.6 UI Design & Component Hierarchy", "25"),
        ("CHAPTER 4: IMPLEMENTATION", "27"),
        ("    4.1 Project Folder Structure", "27"),
        ("    4.2 Frontend – HTML, CSS, and Tailwind Architecture", "29"),
        ("    4.3 Frontend – React SPA, Hooks, and State Contexts", "30"),
        ("    4.4 Backend – Node.js and Express.js REST Engine", "32"),
        ("    4.5 Database – MongoDB Atlas & Mongoose Modeling", "33"),
        ("    4.6 Integration of Frontend and Backend", "34"),
        ("    4.7 Key Source Code Excerpts", "35"),
        ("    4.8 Security Architecture & Compliance Measures", "38"),
        ("CHAPTER 5: DEPLOYMENT", "40"),
        ("    5.1 Deployment Platforms & Cloud Infrastructure", "40"),
        ("    5.2 Deployment Steps & Build Configurations", "40"),
        ("    5.3 Version Control & GitHub Repository Strategy", "41"),
        ("    5.4 Live Deployment & Production Links", "42"),
        ("CHAPTER 6: RESULTS AND DISCUSSION", "43"),
        ("    6.1 Application Screenshots & Functional Walkthrough", "43"),
        ("    6.2 Objectives Achieved Evaluation", "53"),
        ("    6.3 Performance Observations & Benchmarks", "54"),
        ("    6.4 Development Challenges Faced & Resolutions", "55"),
        ("CHAPTER 7: CONCLUSION AND FUTURE SCOPE", "56"),
        ("    7.1 Conclusion", "56"),
        ("    7.2 Future Scope & Planned Enhancements", "57"),
        ("    7.3 Individual Contribution Matrix", "58"),
    ]

    tbl_toc = doc.add_table(rows=len(toc_items), cols=2)
    tbl_toc.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(tbl_toc, color="E2E8F0", sz="2")

    for i, (title, pg) in enumerate(toc_items):
        r_row = tbl_toc.rows[i]
        c0, c1 = r_row.cells[0], r_row.cells[1]
        c0.text = title
        c1.text = pg
        set_cell_margins(c0, top=40, bottom=40, left=80, right=80)
        set_cell_margins(c1, top=40, bottom=40, left=80, right=80)
        
        p0 = c0.paragraphs[0]
        p0.paragraph_format.space_after = Pt(0)
        if title.startswith("CHAPTER") or title in ["Abstract", "Keywords", "List of Figures", "List of Tables"]:
            p0.runs[0].font.bold = True
            p0.runs[0].font.color.rgb = RGBColor(20, 83, 45)
        p0.runs[0].font.name = "Times New Roman"
        p0.runs[0].font.size = Pt(10.5)

        p1 = c1.paragraphs[0]
        p1.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        p1.paragraph_format.space_after = Pt(0)
        p1.runs[0].font.name = "Times New Roman"
        p1.runs[0].font.size = Pt(10.5)

    for row in tbl_toc.rows:
        row.cells[0].width = Inches(5.4)
        row.cells[1].width = Inches(0.9)

    doc.add_page_break()

    # ========================================================
    # 4. LIST OF FIGURES & LIST OF TABLES
    # ========================================================
    add_heading_1(doc, "List of Figures")
    
    figures_list = [
        ("Figure 3.1", "FoodLink Multi-Tier System Architecture and Socket Engine", "14"),
        ("Figure 3.2", "FoodLink Role-Based Use Case Model", "16"),
        ("Figure 3.3", "FoodLink Context Level 0 Data Flow Diagram", "17"),
        ("Figure 3.4", "FoodLink Level 1 Data Flow Diagram (Subsystem Decomposition)", "18"),
        ("Figure 3.5", "FoodLink MongoDB Relational Document Entity-Relationship Model", "21"),
        ("Figure 3.6", "FoodLink Surplus Food Donation and Redistribution State Machine", "24"),
        ("Figure 4.1", "Client-Server REST Request-Response Sequence & Transaction Flow", "35"),
        ("Figure 6.1", "Public Landing Page and Live Ecosystem Hero Banner", "44"),
        ("Figure 6.2", "Social and Role-Based User Registration Portal", "44"),
        ("Figure 6.3", "Universal Multi-Role Authentication Interface", "45"),
        ("Figure 6.4", "Food Donor Dashboard and Surplus Activity Overview", "46"),
        ("Figure 6.5", "Surplus Food Donation Creation and Publishing Form", "46"),
        ("Figure 6.6", "Public Available Food Catalog and Listing Details", "47"),
        ("Figure 6.7", "Verified NGO Discovery and Rescue Operations Dashboard", "48"),
        ("Figure 6.8", "Donation Claiming and Smart Matching Interface", "48"),
        ("Figure 6.9", "Volunteer Logistics and Task Dispatch Hub", "49"),
        ("Figure 6.10", "Pickup Assignment Tracking and OpenStreetMap Navigation", "50"),
        ("Figure 6.11", "Volunteer Karma Rewards Registry and Leaderboard", "50"),
        ("Figure 6.12", "Volunteer Achievements, Badges, and Coupon Redemption", "51"),
        ("Figure 6.13", "Central Administrator Governance Control Center", "52"),
        ("Figure 6.14", "Admin Donation Moderation and Food Safety Audit Portal", "52"),
        ("Figure 6.15", "Responsive Mobile View on iPhone Viewport", "53"),
    ]

    tbl_lof = doc.add_table(rows=len(figures_list), cols=3)
    tbl_lof.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(tbl_lof, color="E2E8F0", sz="2")

    for i, (f_num, f_title, f_pg) in enumerate(figures_list):
        r_row = tbl_lof.rows[i]
        c0, c1, c2 = r_row.cells[0], r_row.cells[1], r_row.cells[2]
        c0.text = f_num
        c1.text = f_title
        c2.text = f_pg
        set_cell_margins(c0, top=35, bottom=35, left=60, right=60)
        set_cell_margins(c1, top=35, bottom=35, left=60, right=60)
        set_cell_margins(c2, top=35, bottom=35, left=60, right=60)

        for cell in [c0, c1, c2]:
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            p.runs[0].font.name = "Times New Roman"
            p.runs[0].font.size = Pt(10)
        c0.paragraphs[0].runs[0].font.bold = True
        c2.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.RIGHT

    for row in tbl_lof.rows:
        row.cells[0].width = Inches(1.2)
        row.cells[1].width = Inches(4.3)
        row.cells[2].width = Inches(0.8)

    p_sp = doc.add_paragraph()
    p_sp.paragraph_format.space_before = Pt(16)

    add_heading_1(doc, "List of Tables")
    
    tables_list = [
        ("Table 1.1", "Comparative Analysis of Existing Food Redistribution Systems", "4"),
        ("Table 2.1", "FoodLink Role-Based Access Control (RBAC) Permission Matrix", "10"),
        ("Table 2.2", "System Hardware and Software Specification Environment", "12"),
        ("Table 3.1", "MongoDB Collections Schema & Field Constraints Specification", "19"),
        ("Table 3.2", "FoodLink REST API Endpoint Routing Specification", "23"),
        ("Table 6.1", "Evaluation of Project Objectives and Verification Status", "53"),
        ("Table 6.2", "Application Build and Production Runtime Performance Metrics", "54"),
        ("Table 7.1", "Team Member Roles, Modules Handled, and Contribution Matrix", "58"),
    ]

    tbl_lot = doc.add_table(rows=len(tables_list), cols=3)
    tbl_lot.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(tbl_lot, color="E2E8F0", sz="2")

    for i, (t_num, t_title, t_pg) in enumerate(tables_list):
        r_row = tbl_lot.rows[i]
        c0, c1, c2 = r_row.cells[0], r_row.cells[1], r_row.cells[2]
        c0.text = t_num
        c1.text = t_title
        c2.text = t_pg
        set_cell_margins(c0, top=35, bottom=35, left=60, right=60)
        set_cell_margins(c1, top=35, bottom=35, left=60, right=60)
        set_cell_margins(c2, top=35, bottom=35, left=60, right=60)

        for cell in [c0, c1, c2]:
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            p.runs[0].font.name = "Times New Roman"
            p.runs[0].font.size = Pt(10)
        c0.paragraphs[0].runs[0].font.bold = True
        c2.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.RIGHT

    for row in tbl_lot.rows:
        row.cells[0].width = Inches(1.2)
        row.cells[1].width = Inches(4.3)
        row.cells[2].width = Inches(0.8)

    doc.add_page_break()

print("Front matter module loaded.")
