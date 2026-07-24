import pandas as pd
import sys

file_path = r"C:\Users\D22AGRI-EPL\Desktop\daikin-connect-clean\Data Project\live data\2\2026Pipeline DASI Service.xlsx"

try:
    xl = pd.ExcelFile(file_path)
    print("Available sheets:", xl.sheet_names)
    
    for sheet in ['industry', 'commercial', 'Industry', 'Commercial']:
        if sheet in xl.sheet_names:
            print(f"\n--- Sheet: {sheet} ---")
            df = pd.read_excel(file_path, sheet_name=sheet, nrows=20)
            print("Columns:")
            print(list(df.columns))
            print("\nFirst few rows:")
            print(df.head(10).to_string())
except Exception as e:
    print("Error:", e)
