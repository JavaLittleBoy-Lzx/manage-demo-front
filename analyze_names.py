#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import re
import sys

def analyze_owner_names(file_path):
    """
    分析车主姓名，检查是否符合格式要求：
    只允许大写字母(A-Z)、数字(0-9)和连字符(-)
    """

    # 正则表达式：只包含大写字母、数字和连字符
    valid_pattern = re.compile(r'^[A-Z0-9-]+$')

    invalid_names = []
    valid_names = []
    total_count = 0

    print(f"正在分析文件: {file_path}")
    print("-" * 60)

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            for line_num, line in enumerate(f, 1):
                # 跳过表头行
                if line.startswith('| 月票订单') or line.startswith('|:'):
                    continue
                if line.startswith('| 车主姓名'):
                    continue

                # 提取表格行
                if line.strip().startswith('|'):
                    parts = line.split('|')
                    if len(parts) > 1:
                        # 获取车主姓名（第一列数据，trim whitespace）
                        owner_name = parts[1].strip()
                        total_count += 1

                        # 检查是否符合格式
                        if valid_pattern.match(owner_name):
                            valid_names.append(owner_name)
                        else:
                            invalid_names.append({
                                'line': line_num,
                                'name': owner_name,
                                'phone': parts[2].strip() if len(parts) > 2 else 'N/A'
                            })

    except Exception as e:
        print(f"读取文件时出错: {e}")
        return

    # 输出结果
    print(f"\n分析完成！")
    print(f"总记录数: {total_count}")
    print(f"符合格式的记录: {len(valid_names)}")
    print(f"不符合格式的记录: {len(invalid_names)}")
    print("=" * 60)

    if invalid_names:
        print(f"\n不符合格式要求的 {len(invalid_names)} 条记录：\n")
        for idx, item in enumerate(invalid_names, 1):
            print(f"{idx}. 行{item['line']}: {item['name']} (手机号: {item['phone']})")

        # 保存到文件
        output_file = file_path.replace('.md', '_不符合格式的记录.txt')
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write("月票订单文件：车主姓名格式检查结果\n")
            f.write("=" * 60 + "\n\n")
            f.write(f"分析文件: {file_path}\n")
            f.write(f"总记录数: {total_count}\n")
            f.write(f"符合格式的记录: {len(valid_names)}\n")
            f.write(f"不符合格式的记录: {len(invalid_names)}\n")
            f.write("=" * 60 + "\n\n")

            f.write("不符合格式要求的记录列表：\n\n")
            for idx, item in enumerate(invalid_names, 1):
                f.write(f"{idx}. 行{item['line']}: {item['name']} (手机号: {item['phone']})\n")

        print(f"\n结果已保存到: {output_file}")
    else:
        print("\n所有记录都符合格式要求！")

if __name__ == "__main__":
    file_path = r"d:\PakingDemo\parking-demo/月票订单_20251121214212571001.md"
    analyze_owner_names(file_path)
