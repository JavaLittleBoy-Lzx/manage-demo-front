#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import re
import os
import shutil

def remove_null_records(input_file, output_file):
    """
    Remove INSERT records with NULL values from SQL file
    """

    null_count = 0
    total_count = 0
    kept_lines = []

    print(f"Processing file: {input_file}")
    print("-" * 60)

    with open(input_file, 'r', encoding='utf-8') as f:
        for line_num, line in enumerate(f, 1):
            # Keep comments and USE statements
            if line.startswith('--') or line.strip().startswith('USE '):
                kept_lines.append(line)
                continue

            # Check if it's an INSERT statement
            if line.strip().upper().startswith('INSERT INTO'):
                total_count += 1
                # Check if VALUES contains NULL
                values_match = re.search(r'VALUES\s*\((.*?)\);', line, re.DOTALL)
                if values_match:
                    values_part = values_match.group(1)
                    # Check for NULL (case insensitive)
                    if re.search(r'\bNULL\b', values_part, re.IGNORECASE):
                        # Skip records with NULL
                        null_count += 1
                        print(f"Line {line_num}: NULL detected, skipped")
                        continue

                # No NULL, keep this line
                kept_lines.append(line)

    # Save modified file
    with open(output_file, 'w', encoding='utf-8') as f:
        f.writelines(kept_lines)

    print("=" * 60)
    print(f"Processing complete!")
    print(f"Total INSERT records: {total_count}")
    print(f"Deleted NULL records: {null_count}")
    print(f"Kept records: {total_count - null_count}")
    print(f"Output file: {output_file}")

    # Update file header comment
    if total_count - null_count > 0:
        with open(output_file, 'r', encoding='utf-8') as f:
            content = f.read()

        # Update comment with new total count
        content = re.sub(
            r'-- Total records: \d+ \(parsed: \d+, manual processing: \d+\)',
            f'-- Total records: {total_count - null_count} (removed {null_count} NULL records)',
            content
        )

        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(content)

        print(f"Updated file header comment")

if __name__ == "__main__":
    input_file = r"d:\PakingDemo\parking-demo/月票订单_20251121214212571001_fixed.sql"
    output_file = r"d:\PakingDemo\parking-demo/月票订单_20251121214212571001_fixed.sql"

    # Backup original file
    backup_file = input_file + ".bak"
    shutil.copy2(input_file, backup_file)
    print(f"Backup created: {backup_file}")

    # Process file
    remove_null_records(input_file, output_file)
