import subprocess
import os
import sys

def main():
    repo = "AhmedNasser-bug/MOLD"
    spec_path = "specs/001-master-problem-list/spec.md"
    checklist_path = "specs/001-master-problem-list/checklists/architecture.md"

    # Ensure files exist before launching sessions
    if not os.path.exists(spec_path):
        print(f"Error: Spec file {spec_path} not found.")
        sys.exit(1)
    if not os.path.exists(checklist_path):
        print(f"Error: Checklist file {checklist_path} not found.")
        sys.exit(1)

    prompt = (
        f"Review {spec_path} against {checklist_path} and identify any missing requirements, "
        "ambiguities, or gaps. Act as a meticulous technical product manager and architect, and "
        "provide suggestions on how to improve the spec to clear the checklist criteria."
    )

    # We use parallel 3 to sample different LLM temperatures and insights
    command = f'jules new --repo {repo} --parallel 3 "{prompt}"'

    print("=======================================================")
    print("🚀 Firing up Jules AI Sessions...")
    print(f"Directory: {os.getcwd()}")
    print(f"Targeting: {spec_path} + {checklist_path}")
    print("=======================================================\n")

    try:
        # shell=True ensures the Windows PATH resolves 'jules.exe' wrappers correctly
        result = subprocess.run(command, shell=True, check=True)
        print("\n✅ Successfully dispatched 3 parallel Jules sessions!")
        print("Wait for the sessions to finish in your Jules TUI.")
        print("You can pull the results using 'jules remote pull --session <ID>'")
    except subprocess.CalledProcessError as e:
        print(f"\n❌ Failed to dispatch Jules sessions. Error code: {e.returncode}")
        print("Make sure your GitHub repository is connected via https://jules.google/docs")
        print("If the error persists, you can copy/paste this exact command into the TUI prompt:")
        print(f"\n/new --parallel 3 {prompt}")

if __name__ == "__main__":
    main()
