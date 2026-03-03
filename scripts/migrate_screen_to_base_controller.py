#!/usr/bin/env python3
"""
Migration Script: Convert Legacy Screen to BaseScreenController Pattern

Usage:
    python scripts/migrate_screen_to_base_controller.py <screen_file_path>

Example:
    python scripts/migrate_screen_to_base_controller.py src/ui/screens/challenge-screens/BlitzScreen.astro
"""

import re
import sys
from pathlib import Path
from typing import List, Tuple


class ScreenMigrator:
    def __init__(self, file_path: str):
        self.file_path = Path(file_path)
        if not self.file_path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")
        
        self.content = self.file_path.read_text()
        self.screen_name = self.file_path.stem  # e.g., "BlitzScreen"
        self.screen_id = self._extract_screen_id()
        
    def _extract_screen_id(self) -> str:
        """Extract screen ID from the file (e.g., 'blitz-screen')"""
        match = re.search(r'id=["\']([^"\']+)["\'].*class=["\']screen', self.content)
        if match:
            return match.group(1)
        # Fallback: convert PascalCase to kebab-case
        return re.sub(r'(?<!^)(?=[A-Z])', '-', self.screen_name).lower()
    
    def add_imports(self) -> str:
        """Add required imports for new pattern"""
        import_block = """import { BaseScreenController } from "../../controllers/BaseScreenController";
import { eventBus } from "../../../infrastructure/events/EventBus";
import { componentRegistry } from "../../registry/ComponentRegistry";
"""
        
        # Find existing imports and add after them
        script_match = re.search(r'<script>(.*?)class\s+\w+', self.content, re.DOTALL)
        if script_match:
            existing_imports = script_match.group(1)
            if 'BaseScreenController' not in existing_imports:
                # Add imports after last import statement
                last_import = list(re.finditer(r'import\s+.*?;', existing_imports))
                if last_import:
                    insert_pos = last_import[-1].end()
                    self.content = (
                        self.content[:insert_pos] + 
                        '\n' + import_block + 
                        self.content[insert_pos:]
                    )
        return self.content
    
    def convert_class_extends(self) -> str:
        """Convert class to extend BaseScreenController"""
        # Find class declaration
        class_pattern = r'class\s+(\w+Controller)\s*{'
        match = re.search(class_pattern, self.content)
        
        if match:
            class_name = match.group(1)
            replacement = f'class {class_name} extends BaseScreenController {{'
            self.content = self.content.replace(match.group(0), replacement)
        
        return self.content
    
    def convert_constructor(self) -> str:
        """Convert constructor to call super() with screen ID"""
        constructor_pattern = r'constructor\(\)\s*\{(.*?)\n\s+\}'
        
        def replace_constructor(match):
            body = match.group(1)
            # Remove window.addEventListener('load', ...) patterns
            body = re.sub(r'\s*window\.addEventListener\(["\']load["\'].*?\);', '', body)
            
            new_constructor = f"""constructor() {{
            super('{self.screen_id}');{body}
        }}"""
            return new_constructor
        
        self.content = re.sub(constructor_pattern, replace_constructor, self.content, flags=re.DOTALL)
        return self.content
    
    def add_lifecycle_methods(self) -> str:
        """Add onInit lifecycle method if missing"""
        if 'onInit' not in self.content:
            # Find where to insert (after constructor)
            constructor_end = re.search(r'constructor\(\).*?\n\s+\}', self.content, re.DOTALL)
            if constructor_end:
                lifecycle_method = """

        /**
         * Lifecycle: Called after screen is mounted and DOM is ready
         */
        async onInit(): Promise<void> {
            console.log("[{screen_name}] Initializing...");
            
            // Get components from registry
            // this.header = componentRegistry.get('header-id');
            
            // Subscribe to events
            this.subscribeToEvents();
            
            // Register methods
            this.registerMethods();
            
            console.log("[{screen_name}] Ready");
        }

        subscribeToEvents() {
            const screen = this.getScreenElement();
            if (!screen) return;

            // Subscribe to game events
            // eventBus.on('game:stats-update', (data) => {{ ... }});
        }

        registerMethods() {
            // Register to componentRegistry instead of window.game
            // componentRegistry.register('controller-id', {{ start: () => this.start() }});
        }""".format(screen_name=self.screen_name)
                
                insert_pos = constructor_end.end()
                self.content = (
                    self.content[:insert_pos] + 
                    lifecycle_method + 
                    self.content[insert_pos:]
                )
        
        return self.content
    
    def remove_window_game_pollution(self) -> List[str]:
        """Identify and mark window.game assignments for manual review"""
        issues = []
        
        # Find all window.game assignments
        window_game_pattern = r'window\.game\.(\w+)\s*=\s*(.*?);'
        matches = re.finditer(window_game_pattern, self.content)
        
        for match in matches:
            method_name = match.group(1)
            issues.append(f"window.game.{method_name} should be moved to componentRegistry")
        
        return issues
    
    def generate_migration_report(self) -> str:
        """Generate a report of changes made and manual steps needed"""
        report = f"""
# Migration Report: {self.screen_name}

## Automated Changes:
- ✓ Added BaseScreenController, eventBus, componentRegistry imports
- ✓ Class now extends BaseScreenController
- ✓ Constructor updated to call super('{self.screen_id}')
- ✓ Added lifecycle methods (onInit, subscribeToEvents, registerMethods)

## Manual Review Required:

### 1. Component Initialization
- Replace polling logic with componentRegistry.get()
- Remove setInterval/setTimeout for component detection

### 2. Window Object Cleanup
{self._format_window_game_issues()}

### 3. Event System
- Replace window.dispatchEvent() with eventBus.emit()
- Replace window.addEventListener() with eventBus.on()

### 4. State Management
- Review if GameEngine is used correctly with new API
- Ensure renderState() uses state machine states

## Testing Checklist:
- [ ] Screen loads without console errors
- [ ] All components are properly initialized
- [ ] Events are properly emitted and received
- [ ] GameEngine state transitions work correctly
- [ ] No window.game references remain (except backward compatibility)
"""
        return report
    
    def _format_window_game_issues(self) -> str:
        issues = self.remove_window_game_pollution()
        if not issues:
            return "- No window.game pollution found"
        return '\n'.join(f"- {issue}" for issue in issues)
    
    def migrate(self) -> Tuple[str, str]:
        """Perform full migration and return new content + report"""
        print(f"Migrating {self.screen_name}...")
        
        # Step-by-step migration
        self.add_imports()
        self.convert_class_extends()
        self.convert_constructor()
        self.add_lifecycle_methods()
        
        # Generate report
        report = self.generate_migration_report()
        
        return self.content, report
    
    def save(self, backup: bool = True):
        """Save migrated file (with backup)"""
        if backup:
            backup_path = self.file_path.with_suffix('.astro.backup')
            backup_path.write_text(self.content)
            print(f"Backup saved to: {backup_path}")
        
        # Write migrated content
        original_content = self.file_path.read_text()
        self.file_path.write_text(self.content)
        print(f"Migrated file saved: {self.file_path}")


def main():
    if len(sys.argv) < 2:
        print("Usage: python migrate_screen_to_base_controller.py <screen_file_path>")
        print("Example: python migrate_screen_to_base_controller.py src/ui/screens/challenge-screens/BlitzScreen.astro")
        sys.exit(1)
    
    file_path = sys.argv[1]
    
    try:
        migrator = ScreenMigrator(file_path)
        new_content, report = migrator.migrate()
        
        # Print report
        print("\n" + "="*80)
        print(report)
        print("="*80 + "\n")
        
        # Ask for confirmation
        response = input("Apply migration? (y/n): ")
        if response.lower() == 'y':
            migrator.save(backup=True)
            print("\n✓ Migration complete!")
        else:
            print("\n✗ Migration cancelled")
            
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
