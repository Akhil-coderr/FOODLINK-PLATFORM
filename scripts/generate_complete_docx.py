# -*- coding: utf-8 -*-
"""
FoodLink Master Academic Project Report Generator
Kumaraguru College of Technology (KCT) - Department of AI & DS
Course: Full Stack Development (24CSI013)
Authors: Akhil C, Sanjay R, Santhosh Prabhu S, Kamalesh M
"""

import os
import sys
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

PROJECT_DIR = r"D:\FSD_MINI_PROJECT"
DOCX_OUT = os.path.join(PROJECT_DIR, "FOODLINK_Full_Stack_Project_Report.docx")
PDF_OUT = os.path.join(PROJECT_DIR, "FOODLINK_Full_Stack_Project_Report.pdf")
ASSETS_DIR = os.path.join(PROJECT_DIR, "FOODLINK_Documentation_Assets")
SCREENSHOTS_DIR = os.path.join(PROJECT_DIR, "FOODLINK_Screenshots")

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=140, right=140):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def set_table_borders(table, color="CBD5E1", sz="4", val="single"):
    tblPr = table._tbl.tblPr
    borders = parse_xml(
        f'<w:tblBorders {nsdecls("w")}>'
        f'<w:top w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:bottom w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:insideH w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:insideV w:val="none"/>'
        f'<w:left w:val="none"/>'
        f'<w:right w:val="none"/>'
        f'</w:tblBorders>'
    )
    tblPr.append(borders)

def add_heading_1(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(22)
    p.paragraph_format.space_after = Pt(8)
    p.paragraph_format.keep_with_next = True
    run = p.add_run(text)
    run.font.name = "Times New Roman"
    run.font.size = Pt(14)
    run.font.bold = True
    run.font.color.rgb = RGBColor(20, 83, 45) # Primary Forest Green
    return p

def add_heading_2(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(14)
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.keep_with_next = True
    run = p.add_run(text)
    run.font.name = "Times New Roman"
    run.font.size = Pt(12.5)
    run.font.bold = True
    run.font.color.rgb = RGBColor(30, 41, 59)
    return p

def add_heading_3(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(10)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.keep_with_next = True
    run = p.add_run(text)
    run.font.name = "Times New Roman"
    run.font.size = Pt(12)
    run.font.bold = True
    run.font.color.rgb = RGBColor(71, 85, 105)
    return p

def add_body_p(doc, text, bold_prefix="", italic=False):
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.line_spacing = 1.5
    p.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    
    if bold_prefix:
        r_pre = p.add_run(bold_prefix)
        r_pre.font.name = "Times New Roman"
        r_pre.font.size = Pt(12)
        r_pre.font.bold = True
        r_pre.font.color.rgb = RGBColor(31, 41, 55)
        
    r = p.add_run(text)
    r.font.name = "Times New Roman"
    r.font.size = Pt(12)
    r.font.italic = italic
    r.font.color.rgb = RGBColor(31, 41, 55)
    return p

def add_bullet_p(doc, bold_prefix, text):
    try:
        p = doc.add_paragraph(style='List Paragraph')
    except Exception:
        p = doc.add_paragraph()
    p.paragraph_format.left_indent = Inches(0.25)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.line_spacing = 1.3
    
    r_bullet = p.add_run("• ")
    r_bullet.font.name = "Times New Roman"
    r_bullet.font.size = Pt(12)
    r_bullet.font.bold = True
    r_bullet.font.color.rgb = RGBColor(20, 83, 45)
    
    if bold_prefix:
        r_pre = p.add_run(bold_prefix)
        r_pre.font.name = "Times New Roman"
        r_pre.font.size = Pt(12)
        r_pre.font.bold = True
        r_pre.font.color.rgb = RGBColor(20, 83, 45)
        
    r = p.add_run(text)
    r.font.name = "Times New Roman"
    r.font.size = Pt(12)
    r.font.color.rgb = RGBColor(31, 41, 55)
    return p

def add_figure(doc, img_path, caption_num, caption_title, desc="", width_in=5.8):
    if os.path.exists(img_path):
        p_img = doc.add_paragraph()
        p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_img.paragraph_format.space_before = Pt(8)
        p_img.paragraph_format.space_after = Pt(4)
        run = p_img.add_run()
        run.add_picture(img_path, width=Inches(width_in))
    else:
        p_box = doc.add_paragraph()
        p_box.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p_box.add_run(f"[Figure {caption_num}: {caption_title}]")
        r.font.bold = True
        r.font.color.rgb = RGBColor(220, 38, 38)
        
    p_cap = doc.add_paragraph()
    p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_cap.paragraph_format.space_before = Pt(2)
    p_cap.paragraph_format.space_after = Pt(4)
    
    rc_bold = p_cap.add_run(f"Figure {caption_num}: ")
    rc_bold.font.name = "Times New Roman"
    rc_bold.font.size = Pt(10.5)
    rc_bold.font.bold = True
    
    rc_title = p_cap.add_run(caption_title)
    rc_title.font.name = "Times New Roman"
    rc_title.font.size = Pt(10.5)
    rc_title.font.italic = True
    
    if desc:
        p_desc = doc.add_paragraph()
        p_desc.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_desc.paragraph_format.space_after = Pt(10)
        rd = p_desc.add_run(desc)
        rd.font.name = "Times New Roman"
        rd.font.size = Pt(10)
        rd.font.color.rgb = RGBColor(100, 116, 139)

def add_code_snippet(doc, title, code_text, explanation, filename=""):
    p_title = doc.add_paragraph()
    p_title.paragraph_format.space_before = Pt(10)
    p_title.paragraph_format.space_after = Pt(2)
    rt = p_title.add_run(title)
    rt.font.name = "Times New Roman"
    rt.font.size = Pt(11)
    rt.font.bold = True
    rt.font.color.rgb = RGBColor(20, 83, 45)
    
    if filename:
        rf = p_title.add_run(f"  [{filename}]")
        rf.font.name = "Consolas"
        rf.font.size = Pt(9.5)
        rf.font.color.rgb = RGBColor(100, 116, 139)

    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = tbl.cell(0, 0)
    set_cell_background(cell, "F8FAFC")
    set_cell_margins(cell, top=120, bottom=120, left=160, right=160)
    set_table_borders(tbl, color="CBD5E1", sz="6")
    
    p_code = cell.paragraphs[0]
    p_code.paragraph_format.space_after = Pt(0)
    p_code.paragraph_format.line_spacing = 1.15
    rc = p_code.add_run(code_text.strip())
    rc.font.name = "Consolas"
    rc.font.size = Pt(9)
    rc.font.color.rgb = RGBColor(15, 23, 42)
    
    p_exp = doc.add_paragraph()
    p_exp.paragraph_format.space_before = Pt(4)
    p_exp.paragraph_format.space_after = Pt(12)
    p_exp.paragraph_format.line_spacing = 1.3
    re = p_exp.add_run(explanation)
    re.font.name = "Times New Roman"
    re.font.size = Pt(10.5)
    re.font.italic = True
    re.font.color.rgb = RGBColor(71, 85, 105)

def style_academic_table(table, col_widths, headers, data):
    set_table_borders(table, color="CBD5E1", sz="4")
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    
    # Header row
    hdr_cells = table.rows[0].cells
    for i, h in enumerate(headers):
        hdr_cells[i].text = h
        set_cell_background(hdr_cells[i], "14532D") # Dark Forest Green
        set_cell_margins(hdr_cells[i], top=120, bottom=120, left=140, right=140)
        p = hdr_cells[i].paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        for r in p.runs:
            r.font.name = "Times New Roman"
            r.font.size = Pt(10)
            r.font.bold = True
            r.font.color.rgb = RGBColor(255, 255, 255)
            
    # Data rows
    for r_idx, row_data in enumerate(data):
        row = table.rows[r_idx + 1]
        bg_color = "F9FAFB" if r_idx % 2 == 1 else "FFFFFF"
        for c_idx, val in enumerate(row_data):
            cell = row.cells[c_idx]
            cell.text = str(val)
            set_cell_background(cell, bg_color)
            set_cell_margins(cell, top=100, bottom=100, left=140, right=140)
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            p.paragraph_format.line_spacing = 1.15
            for r in p.runs:
                r.font.name = "Times New Roman"
                r.font.size = Pt(9.5)
                r.font.color.rgb = RGBColor(31, 41, 55)
                
    # Widths
    for row in table.rows:
        for idx, width in enumerate(col_widths):
            row.cells[idx].width = Inches(width)

print("Report generator core initialized.")
