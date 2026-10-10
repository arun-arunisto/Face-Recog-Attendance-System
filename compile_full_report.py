import os
import sys
import time
from report_builder_core import ReportBuilder, OUTPUT_FILE
from report_part1 import build_part_1
from report_part2 import build_part_2
from report_part3 import build_part_3
from report_part4 import build_part_4

def main():
    print("=" * 70)
    print("STARTING FULL MASTER COMPILATION: FINAL YEAR PROJECT REPORT")
    print("SMART FACE RECOGNITION ATTENDANCE SYSTEM")
    print("=" * 70)

    start_time = time.time()
    rb = ReportBuilder()

    print("\n--> [1/4] Compiling Preliminary Pages and Chapters 1 to 5...")
    build_part_1(rb)

    print("\n--> [2/4] Compiling Chapters 6 to 10 (UML, DFDs, DB Schema, UI Showcase, Backend)...")
    build_part_2(rb)

    print("\n--> [3/4] Compiling Chapters 11 to 15 (Computer Vision, Attendance, Admin/Student, APIs)...")
    build_part_3(rb)

    print("\n--> [4/4] Compiling Chapters 16 to 22, References, and Appendices A to I...")
    build_part_4(rb)

    print("\n--> Saving Master Word Document to disk...")
    rb.save()

    elapsed = time.time() - start_time
    file_size_mb = os.path.getsize(OUTPUT_FILE) / (1024 * 1024)

    print("\n" + "=" * 70)
    print("COMPILATION FINISHED SUCCESSFULLY!")
    print(f"File Path: {OUTPUT_FILE}")
    print(f"File Size: {file_size_mb:.2f} MB")
    print(f"Figures Inserted: {rb.figure_count}")
    print(f"Tables Inserted: {rb.table_count}")
    print(f"Elapsed Time: {elapsed:.2f} seconds")
    print("=" * 70)

if __name__ == '__main__':
    main()
