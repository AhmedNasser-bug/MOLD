#!/usr/bin/env python3
"""
Cleanup Script: Remove window.game pollution across the codebase

This script identifies and reports all window.game usage, providing
recommendations for migration to componentRegistry pattern.

Usage:
    python scripts/remove_window_game_pollution.py [--fix] [--path src/ui/screens]
"""

import re
import argparse
from pathlib import Path
from typing import List, Dict, Set
from collections import defaultdict


class WindowGameAnalyzer:
    def __init__(self, base_path: str = "src"):
        self.base_path = Path(base_path)
        self.files_with_issues: Dict[str, List[Dict]] = defaultdict(list)
        self.all_methods: Set[str] = set()
        
    def scan_directory(self) -> Dict[str, List[Dict]]:
        """Scan all TypeScript/Astro files for window.game usage"""
        patterns = ["**/*.ts", "**/*.tsx", "**/*.astro"]
        
        for pattern in patterns:
            for file_path in self.base_path.rglob(pattern):
                if "node_modules" in str(file_path) or "MoldV1" in str(file_path):
                    continue
                self.analyze_file(file_path)
        
        return self.files_with_issues
    
    def analyze_file(self, file_path: Path):
        """Analyze a single file for window.game patterns"""
        try:
            content = file_path.read_text()
        except Exception as e:
            print(f"Error reading {file_path}: {e}")
            return
        
        # Pattern 1: window.game.methodName = ...
        assignment_pattern = r'window\.game\.(\w+)\s*=\s*([^;]+);'
        assignments = re.finditer(assignment_pattern, content)
        
        for match in assignments:
            method_name = match.group(1)
            assignment = match.group(2)
            line_num = content[:match.start()].count('\n') + 1
            
            self.all_methods.add(method_name)
            self.files_with_issues[str(file_path)].append({
                'type': 'assignment',
                'method': method_name,
                'line': line_num,
                'code': match.group(0),
                'severity': 'high'
            })
        
        # Pattern 2: window.game?.methodName() or window.game.methodName()
        call_pattern = r'window\.game\??\.(\w+)\s*\('
        calls = re.finditer(call_pattern, content)
        
        for match in calls:
            method_name = match.group(1)
            line_num = content[:match.start()].count('\n') + 1
            
            self.files_with_issues[str(file_path)].append({
                'type': 'call',
                'method': method_name,
                'line': line_num,
                'code': match.group(0),
                'severity': 'medium'
            })
        
        # Pattern 3: if (window.game) checks
        check_pattern = r'if\s*\(\s*window\.game'
        checks = re.finditer(check_pattern, content)
        
        for match in checks:
            line_num = content[:match.start()].count('\n') + 1
            
            self.files_with_issues[str(file_path)].append({
                'type': 'check',
                'method': 'N/A',
                'line': line_num,
                'code': match.group(0),
                'severity': 'low'
            })
    
    def generate_report(self) -> str:
        """Generate comprehensive analysis report"""
        total_issues = sum(len(issues) for issues in self.files_with_issues.values())
        
        report = f"""
# Window.game Pollution Analysis Report

## Summary
- Total files affected: {len(self.files_with_issues)}
- Total issues found: {total_issues}
- Unique methods registered: {len(self.all_methods)}

## Registered Methods
{self._format_methods_list()}

## Files with Issues
{self._format_file_issues()}

## Migration Strategy

### Phase 1: Create Controller Registry (DONE ✓)
- ComponentRegistry pattern implemented
- BaseScreenController created

### Phase 2: Migrate Screen Controllers
For each screen file:
1. Extend BaseScreenController
2. Move window.game.methodName to componentRegistry.register()
3. Update callers to use componentRegistry.get()

### Phase 3: Update Callers
Replace:
```typescript
if (window.game.startSpeedrun) {{
    window.game.startSpeedrun();
}}
```

With:
```typescript
const controller = componentRegistry.get('speedrun-controller');
if (controller) {{
    controller.start();
}}
```

### Phase 4: Cleanup
- Remove all window.game references
- Add TypeScript strict mode compliance
"""
        return report
    
    def _format_methods_list(self) -> str:
        if not self.all_methods:
            return "- No methods found"
        return '\n'.join(f"- {method}" for method in sorted(self.all_methods))
    
    def _format_file_issues(self) -> str:
        lines = []
        
        for file_path, issues in sorted(self.files_with_issues.items()):
            lines.append(f"\n### {file_path}")
            lines.append(f"Issues: {len(issues)}\n")
            
            # Group by type
            by_type = defaultdict(list)
            for issue in issues:
                by_type[issue['type']].append(issue)
            
            for issue_type, issue_list in sorted(by_type.items()):
                lines.append(f"**{issue_type.capitalize()}s:** {len(issue_list)}")
                for issue in issue_list[:5]:  # Show first 5
                    lines.append(f"  - Line {issue['line']}: {issue['method']} ({issue['severity']})")
                
                if len(issue_list) > 5:
                    lines.append(f"  ... and {len(issue_list) - 5} more")
        
        return '\n'.join(lines)
    
    def generate_migration_checklist(self) -> str:
        """Generate per-file migration checklist"""
        checklist = "# Window.game Migration Checklist\n\n"
        
        for file_path, issues in sorted(self.files_with_issues.items()):
            file_name = Path(file_path).name
            checklist += f"## {file_name}\n"
            checklist += f"- [ ] Extend BaseScreenController\n"
            
            # Get unique methods
            methods = set(issue['method'] for issue in issues if issue['type'] == 'assignment')
            for method in sorted(methods):
                if method != 'N/A':
                    checklist += f"- [ ] Move window.game.{method} to componentRegistry\n"
            
            checklist += f"- [ ] Update all callers in this file\n"
            checklist += f"- [ ] Test screen functionality\n"
            checklist += "\n"
        
        return checklist


class WindowGameFixer:
    """Automated fixer for simple window.game patterns"""
    
    def __init__(self, file_path: Path):
        self.file_path = file_path
        self.content = file_path.read_text()
        self.changes_made = []
    
    def fix_optional_chaining(self) -> str:
        """Convert window.game?.method() to safer patterns"""
        # Replace window.game?.method() with componentRegistry checks
        pattern = r'window\.game\?\.(\w+)\s*\((.*?)\)'
        
        def replacer(match):
            method = match.group(1)
            args = match.group(2)
            self.changes_made.append(f"Fixed optional chaining for {method}")
            
            return f"""(() => {{
                const ctrl = componentRegistry.get('game-controller');
                if (ctrl && ctrl.{method}) ctrl.{method}({args});
            }})()"""
        
        self.content = re.sub(pattern, replacer, self.content)
        return self.content
    
    def add_deprecation_warnings(self) -> str:
        """Add console warnings for window.game usage"""
        pattern = r'(window\.game\.(\w+)\s*=\s*)'
        
        def replacer(match):
            method = match.group(2)
            return match.group(0) + f'\nconsole.warn("[Deprecated] window.game.{method} - Use componentRegistry instead");\n'
        
        self.content = re.sub(pattern, replacer, self.content)
        return self.content
    
    def save(self):
        """Save fixed content"""
        backup = self.file_path.with_suffix('.backup')
        backup.write_text(self.file_path.read_text())
        self.file_path.write_text(self.content)
        print(f"Fixed: {self.file_path}")
        for change in self.changes_made:
            print(f"  - {change}")


def main():
    parser = argparse.ArgumentParser(description="Analyze and fix window.game pollution")
    parser.add_argument('--fix', action='store_true', help="Apply automated fixes")
    parser.add_argument('--path', default='src', help="Base path to scan")
    parser.add_argument('--report', default='window_game_report.md', help="Output report file")
    
    args = parser.parse_args()
    
    # Analyze
    print(f"Scanning {args.path} for window.game usage...")
    analyzer = WindowGameAnalyzer(args.path)
    results = analyzer.scan_directory()
    
    # Generate reports
    report = analyzer.generate_report()
    checklist = analyzer.generate_migration_checklist()
    
    # Save reports
    Path(args.report).write_text(report + "\n\n" + checklist)
    print(f"\n✓ Report saved to: {args.report}")
    
    # Print summary
    total_files = len(results)
    total_issues = sum(len(issues) for issues in results.values())
    print(f"\nFound {total_issues} issues across {total_files} files")
    
    # Apply fixes if requested
    if args.fix:
        print("\nApplying automated fixes...")
        for file_path in results.keys():
            fixer = WindowGameFixer(Path(file_path))
            fixer.add_deprecation_warnings()
            fixer.save()
        print("\n✓ Automated fixes applied")


if __name__ == "__main__":
    main()
