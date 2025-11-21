# Shell Aliases for Lunar Mining Simulator Development
# Source this file: source .devenv/config/shell-aliases.sh

# Python aliases
alias lms-check="python .devenv/scripts/validate-paths.py"
alias lms-test="pytest tests/ -v"
alias lms-test-cov="pytest tests/ --cov=lunar_mining_sim --cov-report=html"
alias lms-install="pip install -e ."
alias lms-install-all="pip install -e .[all]"

# Environment checking
alias lms-env=".devenv/scripts/check-env.sh"

# Quick demo
alias lms-demo="python scripts/quick_demo.py"

# Web demo (if exists)
if [ -d "web-demo" ]; then
    alias lms-web-dev="cd web-demo && npm run dev"
    alias lms-web-build="cd web-demo && npm run build"
fi

# Common development tasks
alias lms-format="ruff format lunar_mining_sim/"
alias lms-lint="ruff check lunar_mining_sim/"
alias lms-typecheck="mypy lunar_mining_sim/"

echo "✓ Lunar Mining Simulator aliases loaded"

