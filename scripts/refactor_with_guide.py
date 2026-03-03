import subprocess
import os
import sys

def main():
    repo = "AhmedNasser-bug/MOLD"
    guide_path = "docs/DEVELOPMENT_GUIDE.md"
    
    if not os.path.exists(guide_path):
        print(f"❌ Error: Guide file '{guide_path}' not found.")
        sys.exit(1)
        
    prompt = (
        f"Read the architecture and structural standards defined in {guide_path}. "
        "Audit the existing codebase (specifically focusing on UI components, Screen controllers, "
        "and AI pipeline adapters) and heavily refactor any files that violate these guidelines. "
        "Ensure strict adherence to the Zod Schema-Driven Prompting constraints and the pseudo-router view switching patterns mentioned."
    )
    
    command = f'jules new --repo {repo} "{prompt}"'
    
    print("=======================================================")
    print(f"🚀 Firing up Jules Refactoring Session...")
    print(f"Reference Standard: {guide_path}")
    print("=======================================================\n")
    
    try:
        subprocess.run(command, shell=True, check=True)
        print("\n✅ Successfully dispatched Jules refactoring session!")
        print("Wait for the session to finish in your Jules TUI, then pull the patch using:")
        print("`jules remote pull --session <ID> --apply`")
    except subprocess.CalledProcessError as e:
        print(f"\n❌ Failed to dispatch Jules session. Error code: {e.returncode}")

if __name__ == "__main__":
    main()
