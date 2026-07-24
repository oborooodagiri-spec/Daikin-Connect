import pandas as pd
import sys

file_path = r"C:\Users\D22AGRI-EPL\Desktop\daikin-connect-clean\Data Project\live data\2\2026Pipeline DASI Service.xlsx"

try:
    df = pd.read_excel(file_path, sheet_name="PIC", header=None)
    print("=== Sheet: PIC ===")
    print(df.head(15).to_string())
except Exception as e:
    print(f"Error reading PIC sheet: {e}")
