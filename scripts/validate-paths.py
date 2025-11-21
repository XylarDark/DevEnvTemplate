#!/usr/bin/env python3
"""
Path Validation Utility

Validates that all paths in the project use proper resolution utilities
instead of hardcoded relative paths or sys.path hacks.
"""

import ast
import re
from pathlib import Path
from typing import List, Tuple

# Colors for terminal output
RED = "\033[0;31m"
GREEN = "\033[0;32m"
YELLOW = "\033[1;33m"
NC = "\033[0m"  # No Color


def find_sys_path_hacks(file_path: Path) -> List[Tuple[int, str]]:
    """Find sys.path.insert or sys.path.append calls."""
    issues = []
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
            tree = ast.parse(content, filename=str(file_path))
            
            for node in ast.walk(tree):
                if isinstance(node, ast.Call):
                    if isinstance(node.func, ast.Attribute):
                        if isinstance(node.func.value, ast.Attribute):
                            if (node.func.value.attr == "path" and
                                node.func.value.value.id == "sys" and
                                node.func.attr in ("insert", "append")):
                                issues.append((node.lineno, "sys.path hack"))
    except Exception as e:
        return [(0, f"Parse error: {e}")]
    
    return issues


def find_hardcoded_paths(file_path: Path) -> List[Tuple[int, str]]:
    """Find hardcoded relative paths."""
    issues = []
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            for i, line in enumerate(f, 1):
                # Look for patterns like Path(__file__).parent.parent
                if re.search(r"Path\(__file__\)\.parent\.parent", line):
                    issues.append((i, "Hardcoded relative path"))
                # Look for hardcoded path strings
                if re.search(r"['\"].*[/\\](data|config|models|scripts)['\"]", line):
                    if "get_data_dir" not in line and "get_config_dir" not in line:
                        issues.append((i, "Potential hardcoded path"))
    except Exception as e:
        return [(0, f"Read error: {e}")]
    
    return issues


def validate_paths(project_root: Path) -> int:
    """Validate paths in all Python files."""
    errors = 0
    warnings = 0
    
    # Files to check
    python_files = list(project_root.rglob("*.py"))
    
    # Exclude certain directories
    exclude_dirs = {"__pycache__", ".git", "node_modules", "venv", ".venv", "dist", "build"}
    python_files = [
        f for f in python_files
        if not any(excluded in f.parts for excluded in exclude_dirs)
    ]
    
    print(f"🔍 Validating {len(python_files)} Python files...\n")
    
    for file_path in python_files:
        relative_path = file_path.relative_to(project_root)
        
        # Check for sys.path hacks
        sys_path_issues = find_sys_path_hacks(file_path)
        if sys_path_issues:
            print(f"{RED}✗{NC} {relative_path}")
            for line_num, issue in sys_path_issues:
                print(f"  Line {line_num}: {issue}")
                errors += 1
        
        # Check for hardcoded paths (only in scripts/)
        if "scripts" in file_path.parts:
            path_issues = find_hardcoded_paths(file_path)
            if path_issues:
                if not sys_path_issues:  # Don't print file twice
                    print(f"{YELLOW}⚠{NC} {relative_path}")
                for line_num, issue in path_issues:
                    print(f"  Line {line_num}: {issue}")
                    warnings += 1
    
    # Summary
    print()
    if errors == 0 and warnings == 0:
        print(f"{GREEN}✓ All path validations passed!{NC}")
        return 0
    elif errors == 0:
        print(f"{YELLOW}⚠ Found {warnings} warning(s){NC}")
        return 0
    else:
        print(f"{RED}✗ Found {errors} error(s) and {warnings} warning(s){NC}")
        print(f"\nFix sys.path hacks by installing package: pip install -e .")
        return 1


if __name__ == "__main__":
    project_root = Path(__file__).parent.parent.parent
    exit(validate_paths(project_root))

