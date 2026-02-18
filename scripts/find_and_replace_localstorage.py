#!/usr/bin/env python3
"""
Migration Script: Replace localStorage with Database Repository Pattern

This script finds all localStorage usage and provides recommendations
for database repository replacements.

Usage:
    python scripts/find_and_replace_localstorage.py [--fix] [--path src]
"""

import re
import argparse
from pathlib import Path
from typing import List, Dict, Tuple
from collections import defaultdict


class LocalStorageAnalyzer:
    def __init__(self, base_path: str = "src"):
        self.base_path = Path(base_path)
        self.usage_patterns: Dict[str, List[Dict]] = defaultdict(list)
        self.storage_keys: set = set()
        
    def scan_directory(self):
        """Scan all files for localStorage usage"""
        patterns = ["**/*.ts", "**/*.tsx", "**/*.astro", "**/*.js"]
        
        for pattern in patterns:
            for file_path in self.base_path.rglob(pattern):
                if "node_modules" in str(file_path) or "MoldV1" in str(file_path):
                    continue
                self.analyze_file(file_path)
    
    def analyze_file(self, file_path: Path):
        """Analyze a file for localStorage patterns"""
        try:
            content = file_path.read_text()
        except Exception:
            return
        
        # Pattern 1: localStorage.getItem()
        get_pattern = r'localStorage\.getItem\([\'"]([^\'"]+)[\'"]\)'
        for match in re.finditer(get_pattern, content):
            key = match.group(1)
            line_num = content[:match.start()].count('\n') + 1
            self.storage_keys.add(key)
            
            self.usage_patterns[str(file_path)].append({
                'type': 'get',
                'key': key,
                'line': line_num,
                'code': match.group(0),
                'recommendation': self._get_repository_recommendation(key)
            })
        
        # Pattern 2: localStorage.setItem()
        set_pattern = r'localStorage\.setItem\([\'"]([^\'"]+)[\'"],\s*([^)]+)\)'
        for match in re.finditer(set_pattern, content):
            key = match.group(1)
            value = match.group(2)
            line_num = content[:match.start()].count('\n') + 1
            self.storage_keys.add(key)
            
            self.usage_patterns[str(file_path)].append({
                'type': 'set',
                'key': key,
                'value': value,
                'line': line_num,
                'code': match.group(0),
                'recommendation': self._get_repository_recommendation(key)
            })
        
        # Pattern 3: localStorage.removeItem()
        remove_pattern = r'localStorage\.removeItem\([\'"]([^\'"]+)[\'"]\)'
        for match in re.finditer(remove_pattern, content):
            key = match.group(1)
            line_num = content[:match.start()].count('\n') + 1
            self.storage_keys.add(key)
            
            self.usage_patterns[str(file_path)].append({
                'type': 'remove',
                'key': key,
                'line': line_num,
                'code': match.group(0),
                'recommendation': self._get_repository_recommendation(key)
            })
        
        # Pattern 4: localStorage.clear()
        if 'localStorage.clear()' in content:
            line_num = content.find('localStorage.clear()').count('\n', 0, content.find('localStorage.clear()')) + 1
            
            self.usage_patterns[str(file_path)].append({
                'type': 'clear',
                'key': 'ALL',
                'line': line_num,
                'code': 'localStorage.clear()',
                'recommendation': 'Use MigrationService.clearAllData() or specific repository methods'
            })
    
    def _get_repository_recommendation(self, key: str) -> str:
        """Determine which repository to use based on storage key"""
        key_lower = key.lower()
        
        if 'achievement' in key_lower:
            return "Use AchievementRepository"
        elif 'flashcard' in key_lower or 'fc_' in key_lower:
            return "Use FlashcardProgressRepository (to be created)"
        elif 'history' in key_lower or 'run' in key_lower:
            return "Use GameHistoryRepository"
        elif 'player' in key_lower or 'progress' in key_lower:
            return "Use PlayerRepository"
        elif 'subject' in key_lower:
            return "Use SubjectRepository"
        else:
            return "Create appropriate repository or use SettingsRepository"
    
    def generate_report(self) -> str:
        """Generate analysis report"""
        total_files = len(self.usage_patterns)
        total_usages = sum(len(usages) for usages in self.usage_patterns.values())
        
        report = f"""# LocalStorage Migration Analysis

## Summary
- Total files with localStorage: {total_files}
- Total localStorage operations: {total_usages}
- Unique storage keys: {len(self.storage_keys)}

## Storage Keys Found
{self._format_storage_keys()}

## Migration Guide

### Priority Order
1. **High Priority** - User data (achievements, progress, history)
2. **Medium Priority** - Settings and preferences
3. **Low Priority** - Temporary UI state

### Files Requiring Migration
{self._format_file_details()}

## Recommended Repositories

### Existing Repositories
- **PlayerRepository** - Player data, stats, experience
- **GameHistoryRepository** - Game runs, scores, timestamps
- **AchievementRepository** - Achievement unlocks
- **SubjectRepository** - Subject data and questions

### Repositories to Create
- **FlashcardProgressRepository** - Flashcard mastery tracking
- **SettingsRepository** - User preferences
- **UIStateRepository** - Temporary UI state (optional)

## Migration Steps

1. **Backup Data**: MigrationService handles this automatically
2. **Create Missing Repositories**: Implement FlashcardProgressRepository
3. **Update Code**: Replace localStorage calls with repository methods
4. **Test**: Verify data persistence and retrieval
5. **Remove localStorage**: Clean up old code

## Code Examples

### Before (localStorage)
```typescript
const progress = localStorage.getItem('subject_blockchain_progress');
const data = progress ? JSON.parse(progress) : {{}};
```

### After (Repository)
```typescript
const historyRepo = GameHistoryRepository.getInstance();
const stats = await historyRepo.getPlayerStats(playerId, 'blockchain');
```
"""
        return report
    
    def _format_storage_keys(self) -> str:
        if not self.storage_keys:
            return "- No keys found"
        
        lines = []
        for key in sorted(self.storage_keys):
            recommendation = self._get_repository_recommendation(key)
            lines.append(f"- `{key}` → {recommendation}")
        return '\n'.join(lines)
    
    def _format_file_details(self) -> str:
        lines = []
        
        for file_path, usages in sorted(self.usage_patterns.items()):
            file_name = Path(file_path).name
            lines.append(f"\n### {file_path}")
            lines.append(f"Operations: {len(usages)}\n")
            
            for usage in usages:
                lines.append(
                    f"- **Line {usage['line']}**: {usage['type'].upper()} "
                    f"key=`{usage.get('key', 'N/A')}` → {usage['recommendation']}"
                )
        
        return '\n'.join(lines)
    
    def generate_migration_script(self) -> str:
        """Generate specific migration script for each file"""
        script = "# LocalStorage Migration Scripts\n\n"
        
        for file_path, usages in sorted(self.usage_patterns.items()):
            script += f"## {file_path}\n\n"
            script += "```typescript\n"
            
            # Determine repositories needed
            repos_needed = set()
            for usage in usages:
                if 'Achievement' in usage['recommendation']:
                    repos_needed.add('AchievementRepository')
                elif 'GameHistory' in usage['recommendation']:
                    repos_needed.add('GameHistoryRepository')
                elif 'Player' in usage['recommendation']:
                    repos_needed.add('PlayerRepository')
                elif 'Flashcard' in usage['recommendation']:
                    repos_needed.add('FlashcardProgressRepository')
            
            # Generate imports
            for repo in sorted(repos_needed):
                script += f"import {{ {repo} }} from '.../{repo}';\n"
            
            script += "\n// Replace localStorage calls:\n\n"
            
            # Generate replacements
            for usage in usages:
                script += f"// Line {usage['line']}: {usage['code']}\n"
                script += self._generate_replacement_code(usage)
                script += "\n\n"
            
            script += "```\n\n"
        
        return script
    
    def _generate_replacement_code(self, usage: Dict) -> str:
        """Generate replacement code for a localStorage operation"""
        op_type = usage['type']
        key = usage.get('key', '')
        
        if 'Achievement' in usage['recommendation']:
            repo = 'AchievementRepository.getInstance()'
            if op_type == 'get':
                return f"const achievements = await {repo}.getPlayerAchievements(playerId);"
            elif op_type == 'set':
                return f"await {repo}.unlockAchievement(playerId, achievementId);"
        
        elif 'GameHistory' in usage['recommendation']:
            repo = 'GameHistoryRepository.getInstance()'
            if op_type == 'get':
                return f"const history = await {repo}.getSubjectHistory(playerId, subjectId);"
            elif op_type == 'set':
                return f"await {repo}.saveGame(playerId, subjectId, gameData);"
        
        elif 'Player' in usage['recommendation']:
            repo = 'PlayerRepository.getInstance()'
            if op_type == 'get':
                return f"const player = await {repo}.getPlayer(playerId);"
            elif op_type == 'set':
                return f"await {repo}.updatePlayer(playerId, playerData);"
        
        return f"// TODO: Implement repository method for {key}"


def main():
    parser = argparse.ArgumentParser(description="Analyze and migrate localStorage usage")
    parser.add_argument('--path', default='src', help="Base path to scan")
    parser.add_argument('--report', default='localstorage_migration_report.md', help="Output report file")
    parser.add_argument('--script', default='localstorage_migration_script.md', help="Migration script file")
    
    args = parser.parse_args()
    
    print(f"Scanning {args.path} for localStorage usage...")
    analyzer = LocalStorageAnalyzer(args.path)
    analyzer.scan_directory()
    
    # Generate reports
    report = analyzer.generate_report()
    script = analyzer.generate_migration_script()
    
    # Save to files
    Path(args.report).write_text(report)
    Path(args.script).write_text(script)
    
    print(f"\n✓ Report saved to: {args.report}")
    print(f"✓ Migration script saved to: {args.script}")
    
    # Print summary
    total_files = len(analyzer.usage_patterns)
    total_usages = sum(len(usages) for usages in analyzer.usage_patterns.values())
    print(f"\nFound {total_usages} localStorage operations across {total_files} files")
    print(f"Unique storage keys: {len(analyzer.storage_keys)}")


if __name__ == "__main__":
    main()
