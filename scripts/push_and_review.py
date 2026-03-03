import subprocess
import os
import sys

def run_command(command, shell=True):
    try:
        subprocess.run(command, shell=shell, check=True)
    except subprocess.CalledProcessError as e:
        print(f"❌ Command failed: {command}\nError code: {e.returncode}")
        sys.exit(1)

def main():
    repo = "AhmedNasser-bug/MOLD"

    print("=======================================================")
    print("🚀 Pushing Changes & Triggering Jules/CodeRabbit Pipeline...")
    print("=======================================================\n")

    # 1. Stage, Commit, and Push changes to trigger CodeRabbit webhook (assuming PR exists)
    print("Step 1: Staging and Pushing code to trigger remote hooks...")
    subprocess.run("git add .", shell=True)
    # Using capture_output so it doesn't fail loudly if there's nothing to commit
    subprocess.run('git commit -m "chore: auto-push for code review"', shell=True, capture_output=True)
    run_command("git push")
    print("✅ Push successful.\n")

    # 2. Dispatch Jules session to address CodeRabbit feedback
    print("Step 2: Dispatching Jules to analyze & resolve CodeRabbit suggestions...")
    prompt_cr = (
        "Review the latest CodeRabbit feedback and review comments on the current active Pull Request. "
        "Analyze the suggestions and automatically apply the necessary refactoring/fixes to the codebase to resolve them."
    )
    run_command(f'jules new --repo {repo} "{prompt_cr}"')
    print("✅ Jules CodeRabbit Review session dispatched.\n")

    # 3. Fire three automated testing sessions (spec validation logic from jules_tester.py)
    print("Step 3: Firing 3 parallel Jules testing sessions for Spec Validation...")
    spec_path = "specs/001-master-problem-list/spec.md"
    checklist_path = "specs/001-master-problem-list/checklists/architecture.md"

    if os.path.exists(spec_path) and os.path.exists(checklist_path):
        prompt_test = (
            f"Review {spec_path} against {checklist_path} and identify any missing requirements, "
            "ambiguities, or gaps. Act as a meticulous technical product manager and architect, and "
            "provide suggestions on how to improve the spec to clear the checklist criteria."
        )
        run_command(f'jules new --repo {repo} --parallel 3 "{prompt_test}"')
        print("✅ 3 Parallel Jules spec testing sessions dispatched.\n")
    else:
        print(f"⚠️ Skipping Step 3: Could not find '{spec_path}' or '{checklist_path}'")

    print("=======================================================")
    print("✅ Pipeline complete! Monitor your Jules TUI for the active sessions.")
    print("Run `jules remote list --session` to check their status.")

if __name__ == "__main__":
    main()
