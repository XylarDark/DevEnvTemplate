#!/bin/bash
# Sync script to pull updates from DevEnvTemplate while preserving project-specific files
# Usage: ./scripts/sync-from-template.sh [template-path]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEVENV_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
PROJECT_ROOT="$(cd "$DEVENV_DIR/.." && pwd)"

# Default template path (relative to project root)
TEMPLATE_PATH="${1:-../../DevEnvTemplate}"

# Resolve absolute path
if [[ ! "$TEMPLATE_PATH" = /* ]]; then
  TEMPLATE_PATH="$(cd "$PROJECT_ROOT/$TEMPLATE_PATH" && pwd)"
fi

# Project-specific files to preserve (relative to .devenv)
PROJECT_FILES=(
  "health-report.json"
  "gaps-report.md"
  "stack-report.json"
  "health-before.json"
  "health-after.json"
  "input.txt"
)

echo -e "${GREEN}🔄 Syncing .devenv from DevEnvTemplate${NC}"
echo "Template path: $TEMPLATE_PATH"
echo "Devenv path: $DEVENV_DIR"
echo ""

# Check if template path exists
if [ ! -d "$TEMPLATE_PATH" ]; then
  echo -e "${RED}❌ Error: Template path does not exist: $TEMPLATE_PATH${NC}"
  exit 1
fi

# Check if we're in a git repository
if [ ! -d "$DEVENV_DIR/.git" ]; then
  echo -e "${RED}❌ Error: .devenv is not a git repository${NC}"
  echo "Initialize it with: cd .devenv && git init && git remote add origin <url>"
  exit 1
fi

# Create temporary directory for backups
BACKUP_DIR=$(mktemp -d)
echo -e "${YELLOW}📦 Backing up project-specific files...${NC}"

# Backup project-specific files
for file in "${PROJECT_FILES[@]}"; do
  if [ -f "$DEVENV_DIR/$file" ]; then
    mkdir -p "$BACKUP_DIR/$(dirname "$file")"
    cp "$DEVENV_DIR/$file" "$BACKUP_DIR/$file"
    echo "  ✓ Backed up: $file"
  fi
done

# Check current branch
CURRENT_BRANCH=$(cd "$DEVENV_DIR" && git rev-parse --abbrev-ref HEAD)
echo ""
echo -e "${YELLOW}📋 Current branch: $CURRENT_BRANCH${NC}"

# Check if there are uncommitted changes
if [ -n "$(cd "$DEVENV_DIR" && git status --porcelain)" ]; then
  echo -e "${YELLOW}⚠️  Uncommitted changes detected. Stashing...${NC}"
  cd "$DEVENV_DIR"
  git stash push -m "Sync backup $(date +%Y-%m-%d-%H%M%S)"
fi

# Fetch updates from template
echo ""
echo -e "${YELLOW}📥 Fetching updates from template...${NC}"
cd "$DEVENV_DIR"

# Add template as remote if it doesn't exist
if ! git remote | grep -q "^template$"; then
  git remote add template "$TEMPLATE_PATH"
  echo "  ✓ Added 'template' remote"
fi

# Update template remote URL in case it changed
git remote set-url template "$TEMPLATE_PATH"

# Fetch from template
TEMPLATE_BRANCH=$(cd "$TEMPLATE_PATH" && git rev-parse --abbrev-ref HEAD)
git fetch template "$TEMPLATE_BRANCH"

# Merge or rebase (prefer merge for safety)
echo ""
echo -e "${YELLOW}🔀 Merging updates...${NC}"
if git merge "template/$TEMPLATE_BRANCH" --no-edit; then
  echo -e "${GREEN}✓ Successfully merged updates${NC}"
else
  echo -e "${RED}❌ Merge conflicts detected!${NC}"
  echo "Resolve conflicts manually, then restore project files:"
  echo "  cp -r $BACKUP_DIR/* $DEVENV_DIR/"
  exit 1
fi

# Restore project-specific files
echo ""
echo -e "${YELLOW}♻️  Restoring project-specific files...${NC}"
for file in "${PROJECT_FILES[@]}"; do
  if [ -f "$BACKUP_DIR/$file" ]; then
    mkdir -p "$DEVENV_DIR/$(dirname "$file")"
    cp "$BACKUP_DIR/$file" "$DEVENV_DIR/$file"
    echo "  ✓ Restored: $file"
  fi
done

# Clean up backup
rm -rf "$BACKUP_DIR"

# Rebuild if needed
echo ""
echo -e "${YELLOW}🔨 Rebuilding...${NC}"
if [ -f "$DEVENV_DIR/package.json" ]; then
  cd "$DEVENV_DIR"
  npm install
  npm run build
  echo -e "${GREEN}✓ Build complete${NC}"
fi

echo ""
echo -e "${GREEN}✅ Sync complete!${NC}"
echo ""
echo "Project-specific files preserved:"
for file in "${PROJECT_FILES[@]}"; do
  if [ -f "$DEVENV_DIR/$file" ]; then
    echo "  ✓ $file"
  fi
done

