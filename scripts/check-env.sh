#!/bin/bash
# Environment Checker for Lunar Mining Simulator
# Checks that development environment is properly configured

set -e

echo "🔍 Checking development environment..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Check Python installation
echo -n "Checking Python... "
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
    echo -e "${GREEN}✓${NC} Python $PYTHON_VERSION"
else
    echo -e "${RED}✗${NC} Python not found"
    ERRORS=$((ERRORS + 1))
fi

# Check if package is installed
echo -n "Checking package installation... "
if python3 -c "import lunar_mining_sim" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Package installed"
else
    echo -e "${RED}✗${NC} Package not installed. Run: pip install -e ."
    ERRORS=$((ERRORS + 1))
fi

# Check for sys.path hacks
echo -n "Checking for sys.path hacks... "
if grep -r "sys.path.insert\|sys.path.append" scripts/ 2>/dev/null | grep -v ".pyc" | grep -v "__pycache__" > /dev/null; then
    echo -e "${YELLOW}⚠${NC} Found sys.path hacks in scripts/"
    WARNINGS=$((WARNINGS + 1))
else
    echo -e "${GREEN}✓${NC} No sys.path hacks found"
fi

# Check virtual environment
echo -n "Checking virtual environment... "
if [ -n "$VIRTUAL_ENV" ]; then
    echo -e "${GREEN}✓${NC} Virtual environment active: $VIRTUAL_ENV"
else
    echo -e "${YELLOW}⚠${NC} No virtual environment detected (recommended)"
    WARNINGS=$((WARNINGS + 1))
fi

# Check Node.js (for web-demo)
if [ -d "web-demo" ]; then
    echo -n "Checking Node.js... "
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        echo -e "${GREEN}✓${NC} Node.js $NODE_VERSION"
    else
        echo -e "${YELLOW}⚠${NC} Node.js not found (needed for web-demo)"
        WARNINGS=$((WARNINGS + 1))
    fi
    
    # Check if web-demo dependencies are installed
    if [ -d "web-demo/node_modules" ]; then
        echo -e "${GREEN}✓${NC} Web-demo dependencies installed"
    else
        echo -e "${YELLOW}⚠${NC} Web-demo dependencies not installed. Run: cd web-demo && npm install"
        WARNINGS=$((WARNINGS + 1))
    fi
fi

# Check environment variables
echo -n "Checking .env file... "
if [ -f ".env" ]; then
    echo -e "${GREEN}✓${NC} .env file exists"
else
    echo -e "${YELLOW}⚠${NC} .env file not found (optional)"
    WARNINGS=$((WARNINGS + 1))
fi

# Summary
echo ""
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed!${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ Checks passed with $WARNINGS warning(s)${NC}"
    exit 0
else
    echo -e "${RED}✗ Found $ERRORS error(s) and $WARNINGS warning(s)${NC}"
    exit 1
fi

