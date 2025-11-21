#!/bin/sh
#
# Pre-commit hook: Documentation Organization Check
#
# Checks for new markdown files in project root that should be organized.
# Optionally auto-organizes files before commit.
#
# Installation: devenv doctor --install pre-commit-docs
#

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Get project root (parent of .git)
PROJECT_ROOT="$(git rev-parse --show-toplevel)"
cd "$PROJECT_ROOT" || exit 1

# Check if devenv organize-docs is available
DEVENV_CMD=""
if [ -f ".devenv/dist/scripts/tools/docs-organizer.js" ]; then
  DEVENV_CMD="node .devenv/dist/scripts/tools/docs-organizer.js"
elif [ -f "node_modules/.bin/devenv" ]; then
  DEVENV_CMD="npx devenv"
else
  # Try to find devenv in path
  if command -v devenv >/dev/null 2>&1; then
    DEVENV_CMD="devenv"
  else
    echo "${YELLOW}Warning: devenv not found. Skipping docs organization check.${NC}"
    exit 0
  fi
fi

# Get staged markdown files in root
STAGED_MD_FILES=$(git diff --cached --name-only --diff-filter=A | grep -E '^[^/]+\.md$')

if [ -z "$STAGED_MD_FILES" ]; then
  # No new markdown files staged, exit silently
  exit 0
fi

echo "${YELLOW}Checking documentation organization...${NC}"

# Run dry-run check
OUTPUT=$($DEVENV_CMD organize-docs --dry-run 2>&1)
EXIT_CODE=$?

if [ $EXIT_CODE -ne 0 ]; then
  echo "${RED}Error checking documentation organization${NC}"
  echo "$OUTPUT"
  exit 1
fi

# Check if there are files that need organization
if echo "$OUTPUT" | grep -q "Found.*file(s) that need organization"; then
  echo "${YELLOW}⚠️  New markdown files detected in project root${NC}"
  echo ""
  echo "$OUTPUT" | grep -A 20 "Found.*file(s)"
  echo ""
  echo "${YELLOW}These files should be organized into docs/ directory.${NC}"
  echo "${YELLOW}Run 'devenv organize-docs --auto-fix' to organize them.${NC}"
  echo ""
  
  # Check if auto-fix is enabled via environment variable
  if [ "$DEVENV_AUTO_ORGANIZE_DOCS" = "true" ]; then
    echo "${GREEN}Auto-organizing documentation files...${NC}"
    $DEVENV_CMD organize-docs --auto-fix
    if [ $? -eq 0 ]; then
      echo "${GREEN}✅ Documentation organized successfully${NC}"
      # Re-stage the moved files
      git add -u
    else
      echo "${RED}❌ Failed to organize documentation${NC}"
      exit 1
    fi
  else
    echo "${YELLOW}To auto-organize on commit, set DEVENV_AUTO_ORGANIZE_DOCS=true${NC}"
    echo "${YELLOW}Or run 'devenv organize-docs --auto-fix' manually${NC}"
    exit 1
  fi
fi

exit 0

