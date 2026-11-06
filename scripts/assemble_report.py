# -*- coding: utf-8 -*-
"""
Master Report Assembly Script for FoodLink Platform
Kumaraguru College of Technology (KCT) Full Stack Project Report
Generates both DOCX and native Word PDF.
"""

import os
import sys
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.section import WD_SECTION

# Ensure current dir is in python path
sys.path.insert(0, os.path.dirname(__file__))

from generate_complete_docx import (
    PROJECT_DIR, DOCX_OUT, PDF_OUT, ASSETS_DIR, SCREENSHOTS_DIR
)
from report_content_front import build_front_matter
from report_content_ch1_ch2 import build_chapter_1, build_chapter_2
from report_content_ch3 import build_chapter_3
from report_content_ch4 import build_chapter_4
from report_content_ch5_ch6_ch7 import build_chapter_5, build_chapter_6, build_chapter_7

def generate_report():
    print("=" * 65)
    print("GENERATING FOODLINK FULL-STACK ACADEMIC PROJECT REPORT")
    print("=" * 65)

    template_path = os.path.join(PROJECT_DIR, "Full_Stack_Project_Report_Template.docx")
    if os.path.exists(template_path):
        print(f"Loading base styles from template: {template_path}")
        doc = docx.Document(template_path)
        # Clear template placeholder text
        for p in list(doc.paragraphs):
            p._element.getparent().remove(p._element)
        for t in list(doc.tables):
            t._element.getparent().remove(t._element)
    else:
        print("Creating fresh docx.Document...")
        doc = docx.Document()

    # Configure Section 1 (Front Matter)
    section = doc.sections[0]
    section.page_width = Inches(8.268)  # A4 Width
    section.page_height = Inches(11.693) # A4 Height
    section.top_margin = Inches(1.0)
    section.bottom_margin = Inches(1.0)
    section.left_margin = Inches(1.0)
    section.right_margin = Inches(1.0)

    print("Writing Front Matter (Cover, Abstract, TOC, Lists)...")
    build_front_matter(doc)

    print("Writing Chapter 1: Introduction...")
    build_chapter_1(doc)

    print("Writing Chapter 2: Requirement Analysis...")
    build_chapter_2(doc)

    print("Writing Chapter 3: System Design...")
    build_chapter_3(doc)

    print("Writing Chapter 4: Implementation...")
    build_chapter_4(doc)

    print("Writing Chapter 5: Deployment...")
    build_chapter_5(doc)

    print("Writing Chapter 6: Results and Discussion (Embedding 15 Screenshots)...")
    build_chapter_6(doc)

    print("Writing Chapter 7: Conclusion and Future Scope...")
    build_chapter_7(doc)

    print(f"Saving DOCX to: {DOCX_OUT}")
    doc.save(DOCX_OUT)
    print("[SUCCESS] DOCX saved successfully.")

    # Convert to PDF via Word COM
    print("\nAttempting native Microsoft Word COM PDF export...")
    try:
        import win32com.client
        word = win32com.client.Dispatch("Word.Application")
        word.Visible = False
        word.DisplayAlerts = False

        print(f"Opening {DOCX_OUT} in Microsoft Word...")
        wdoc = word.Documents.Open(os.path.abspath(DOCX_OUT))

        # Update all fields in document (Page numbers, TOC, references)
        print("Updating document fields and page numbers in Word...")
        try:
            wdoc.Fields.Update()
        except Exception as fe:
            print(f"Notice during fields update: {fe}")

        print(f"Exporting PDF to: {PDF_OUT}")
        # 17 represents wdFormatPDF
        wdoc.SaveAs(os.path.abspath(PDF_OUT), FileFormat=17)
        
        pages_count = wdoc.ComputeStatistics(2) # 2 = wdStatisticPages
        print(f"[INFO] Total Page Count in Word: {pages_count} pages")

        wdoc.Close(SaveChanges=False)
        word.Quit()
        print("[SUCCESS] Native PDF generated successfully.")
    except Exception as e:
        print(f"[WARNING] Notice on Word COM PDF export: {e}")
        print("DOCX is fully available.")

    print("\n" + "=" * 65)
    print("REPORT GENERATION COMPLETE")
    print(f"DOCX: {DOCX_OUT}")
    print(f"PDF:  {PDF_OUT}")
    print("=" * 65)

if __name__ == "__main__":
    generate_report()
