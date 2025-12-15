#!/usr/bin/env python3
import re

null_count = 0
total_count = 0
kept_lines = []

input_file = "d:/PakingDemo/parking-demo/月票订单_20251121214212571001_fixed.sql"

print("Processing file...")
print("-" * 60)

with open(input_file, 'r', encoding='utf-8') as f:
    for line_num, line in enumerate(f, 1):
        if line.startswith('--') or line.strip().startswith('USE '):
            kept_lines.append(line)
            continue

        if line.strip().upper().startswith('INSERT INTO'):
            total_count += 1
            values_match = re.search(r'VALUES\s*\((.*?)\);', line, re.DOTALL)
            if values_match:
                values_part = values_match.group(1)
                if re.search(r'\bNULL\b', values_part, re.IGNORECASE):
                    null_count += 1
                    print(f"Line {line_num}: NULL detected, skipped")
                    continue

            kept_lines.append(line)

with open(input_file, 'w', encoding='utf-8') as f:
    f.writelines(kept_lines)

print("=" * 60)
print("Processing complete!")
print(f"Total INSERT records: {total_count}")
print(f"Deleted NULL records: {null_count}")
print(f"Kept records: {total_count - null_count}")
