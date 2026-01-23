import pandas as pd
import os

file_path = "e:\\Development\\Vibe\\edumerslms\\.briefs\\Data Member KonsultanEdu 2026.xlsx"

try:
    # Read all sheets to see what's inside
    xls = pd.ExcelFile(file_path)
    # Print all sheet names explicitly
    print(f"All Sheet Names: {xls.sheet_names}")

    # Analyze 'DATA PERALIHAN NEW'
    print("\n\n=== ANALYZING: DATA PERALIHAN NEW ===")
    if 'DATA PERALIHAN NEW' in xls.sheet_names:
        df_peralihan = pd.read_excel(xls, sheet_name='DATA PERALIHAN NEW', header=0)
        print(df_peralihan.info())
        print(df_peralihan.head())
    else:
        print("Sheet 'DATA PERALIHAN NEW' not found.")

    # Analyze 'Data RDN' (Check exact name match from list)
    print("\n\n=== ANALYZING: Data RDN ===")
    # Try finding 'Data RDN' or similar
    rdn_sheet = next((s for s in xls.sheet_names if 'RDN' in s), None)
    if rdn_sheet:
        print(f"Found RDN sheet: {rdn_sheet}")
        df_rdn = pd.read_excel(xls, sheet_name=rdn_sheet, header=0)
        print(df_rdn.info())
        print(df_rdn.head())
    else:
        print("Sheet with 'RDN' not found.")


except Exception as e:
    print(f"Error processing file: {e}")
