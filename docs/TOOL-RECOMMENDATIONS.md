# Tool Recommendations for Enhanced DevEnv Capabilities

This document recommends tools that can enhance DevEnvTemplate's capabilities and improve developer experience.

## Development Environment Tools

### direnv

**Purpose:** Automatically load environment variables per directory

**Benefits:**
- No need to manually source `.env` files
- Automatic activation of virtual environments
- Project-specific environment configuration

**Installation:**
```bash
# macOS
brew install direnv

# Linux
sudo apt-get install direnv

# Windows (via WSL or Git Bash)
# Not natively supported, but can use alternatives
```

**Usage:**
```bash
# Create .envrc file
echo 'export API_KEY="your-key"' > .envrc
direnv allow
```

**Integration:** DevEnvTemplate could detect `.envrc` and provide setup guidance.

---

### asdf

**Purpose:** Universal version manager for multiple languages

**Benefits:**
- Manage Node.js, Python, Ruby, Go, etc. from one tool
- Per-project version pinning
- Consistent across team members

**Installation:**
```bash
# macOS/Linux
git clone https://github.com/asdf-vm/asdf.git ~/.asdf
```

**Usage:**
```bash
asdf plugin add nodejs
asdf install nodejs 20.10.0
asdf local nodejs 20.10.0
```

**Integration:** DevEnvTemplate could detect `.tool-versions` and verify versions match.

---

### pre-commit

**Purpose:** Git hooks for quality checks before commits

**Benefits:**
- Automatic linting, formatting, type checking
- Prevents bad code from being committed
- Consistent code quality across team

**Installation:**
```bash
pip install pre-commit
```

**Usage:**
```bash
# Create .pre-commit-config.yaml
pre-commit install
```

**Integration:** DevEnvTemplate could generate `.pre-commit-config.yaml` based on detected stack.

---

### watchman

**Purpose:** File watching service for faster rebuilds

**Benefits:**
- Faster file watching than native tools
- Better performance on large projects
- Cross-platform support

**Installation:**
```bash
# macOS
brew install watchman

# Linux
# See: https://facebook.github.io/watchman/docs/install
```

**Integration:** DevEnvTemplate could recommend watchman for large projects.

---

## Code Quality Tools

### ruff (Python)

**Purpose:** Fast Python linter and formatter

**Benefits:**
- 10-100x faster than black + flake8
- Replaces multiple tools (black, flake8, isort, etc.)
- Single tool for all Python code quality

**Installation:**
```bash
pip install ruff
```

**Usage:**
```bash
ruff check .
ruff format .
```

**Integration:** DevEnvTemplate could detect Python projects and recommend ruff.

---

### biome (JavaScript/TypeScript)

**Purpose:** Fast JavaScript/TypeScript formatter and linter

**Benefits:**
- Faster than Prettier + ESLint
- Single tool for formatting and linting
- Written in Rust for performance

**Installation:**
```bash
npm install --save-dev --save-exact @biomejs/biome
```

**Usage:**
```bash
npx @biomejs/biome format --write .
npx @biomejs/biome lint --write .
```

**Integration:** DevEnvTemplate could offer biome as alternative to Prettier/ESLint.

---

### vulture (Python)

**Purpose:** Find dead Python code

**Benefits:**
- Identifies unused functions, classes, variables
- Helps reduce codebase size
- Improves maintainability

**Installation:**
```bash
pip install vulture
```

**Usage:**
```bash
vulture lunar_mining_sim/
```

**Integration:** DevEnvTemplate could run vulture as part of gap analysis.

---

### depcheck (Node.js)

**Purpose:** Find unused npm dependencies

**Benefits:**
- Identifies unused packages
- Reduces bundle size
- Saves disk space

**Installation:**
```bash
npm install -g depcheck
```

**Usage:**
```bash
depcheck
```

**Integration:** DevEnvTemplate could detect unused dependencies in gap analysis.

---

## Testing & Validation

### playwright

**Purpose:** End-to-end testing for web applications

**Benefits:**
- Cross-browser testing (Chromium, Firefox, WebKit)
- Better than Selenium
- Modern API and good documentation

**Installation:**
```bash
npm install --save-dev @playwright/test
npx playwright install
```

**Usage:**
```typescript
import { test, expect } from '@playwright/test';

test('homepage loads', async ({ page }) => {
  await page.goto('https://example.com');
  await expect(page).toHaveTitle(/Example/);
});
```

**Integration:** DevEnvTemplate could detect web projects and suggest Playwright setup.

---

### mypy (Python)

**Purpose:** Static type checking for Python

**Benefits:**
- Catches type errors before runtime
- Improves code quality
- Better IDE support

**Installation:**
```bash
pip install mypy
```

**Usage:**
```bash
mypy lunar_mining_sim/
```

**Integration:** DevEnvTemplate could check for mypy configuration and suggest setup.

---

### zod (TypeScript)

**Purpose:** Runtime validation for TypeScript (matches Pydantic)

**Benefits:**
- Type-safe runtime validation
- Matches Pydantic patterns from Python
- Great for API validation

**Installation:**
```bash
npm install zod
```

**Usage:**
```typescript
import { z } from 'zod';

const Schema = z.object({
  name: z.string(),
  age: z.number().min(0),
});

const data = Schema.parse({ name: 'John', age: 30 });
```

**Integration:** DevEnvTemplate could suggest zod for API projects.

---

### vitest

**Purpose:** Fast unit test runner (alternative to Jest)

**Benefits:**
- Faster than Jest
- Native ESM support
- Better TypeScript support

**Installation:**
```bash
npm install -D vitest
```

**Usage:**
```typescript
import { test, expect } from 'vitest';

test('example', () => {
  expect(1 + 1).toBe(2);
});
```

**Integration:** DevEnvTemplate could offer vitest as alternative to Jest.

---

## Documentation & Developer Experience

### typedoc

**Purpose:** TypeScript API documentation generator

**Benefits:**
- Auto-generates docs from TypeScript types
- Better than JSDoc alone
- Modern documentation site

**Installation:**
```bash
npm install --save-dev typedoc
```

**Usage:**
```bash
typedoc --out docs src/
```

**Integration:** DevEnvTemplate could suggest typedoc for TypeScript projects.

---

### mkdocs

**Purpose:** Python documentation generator

**Benefits:**
- Markdown-based documentation
- Easy to maintain
- Good for Python projects

**Installation:**
```bash
pip install mkdocs mkdocs-material
```

**Usage:**
```bash
mkdocs new .
mkdocs serve
```

**Integration:** DevEnvTemplate could suggest mkdocs for Python projects.

---

### commitlint

**Purpose:** Enforce commit message format

**Benefits:**
- Consistent commit messages
- Better changelog generation
- Follows conventional commits

**Installation:**
```bash
npm install --save-dev @commitlint/cli @commitlint/config-conventional
```

**Usage:**
```bash
# Create commitlint.config.js
echo "module.exports = { extends: ['@commitlint/config-conventional'] }" > commitlint.config.js
```

**Integration:** DevEnvTemplate could generate commitlint config.

---

### conventional-changelog

**Purpose:** Auto-generate changelogs from git commits

**Benefits:**
- Automatic changelog generation
- Based on commit messages
- Saves time

**Installation:**
```bash
npm install --save-dev conventional-changelog-cli
```

**Usage:**
```bash
conventional-changelog -p angular -i CHANGELOG.md -s
```

**Integration:** DevEnvTemplate could set up conventional-changelog workflow.

---

## Monitoring & Observability

### sentry

**Purpose:** Error tracking and performance monitoring

**Benefits:**
- Free tier available
- Great error tracking
- Performance monitoring
- Source map support

**Installation:**
```bash
npm install @sentry/nextjs
```

**Usage:**
```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
});
```

**Integration:** DevEnvTemplate could suggest Sentry setup for production apps.

---

### lighthouse-ci

**Purpose:** Performance monitoring and auditing

**Benefits:**
- Automated performance testing
- CI/CD integration
- Tracks performance over time

**Installation:**
```bash
npm install -g @lhci/cli
```

**Usage:**
```bash
lhci autorun
```

**Integration:** DevEnvTemplate could add lighthouse-ci to CI workflows.

---

### dependabot

**Purpose:** Automated dependency updates

**Benefits:**
- Automatic PRs for dependency updates
- Security vulnerability alerts
- Free on GitHub

**Setup:**
Create `.github/dependabot.yml`:
```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
```

**Integration:** DevEnvTemplate could generate dependabot config.

---

### renovate

**Purpose:** Alternative to dependabot with more control

**Benefits:**
- More configuration options
- Better grouping of updates
- Self-hosted option

**Installation:**
```bash
# GitHub App: https://github.com/apps/renovate
```

**Integration:** DevEnvTemplate could suggest Renovate for advanced dependency management.

---

## Implementation Priority

### High Priority (Immediate Value)

1. **ruff** - Fast Python linting (replaces multiple tools)
2. **pre-commit** - Git hooks for quality (prevents bad commits)
3. **dependabot** - Automated dependency updates (security)
4. **mypy** - Python type checking (catches errors early)

### Medium Priority (Nice to Have)

1. **direnv** - Environment management (better DX)
2. **asdf** - Version management (consistency)
3. **playwright** - E2E testing (better than Selenium)
4. **vitest** - Fast test runner (better than Jest)

### Low Priority (Future Enhancement)

1. **watchman** - File watching (performance)
2. **biome** - JS/TS formatter (alternative to Prettier)
3. **typedoc/mkdocs** - Documentation (nice but not critical)
4. **sentry** - Error tracking (production feature)

---

## Integration with DevEnvTemplate

DevEnvTemplate could:

1. **Detect tools**: Check if recommended tools are installed
2. **Suggest setup**: Recommend tools based on detected stack
3. **Generate configs**: Auto-generate configuration files
4. **Add to CI**: Integrate tools into CI workflows
5. **Document usage**: Provide examples and best practices

Example integration:
```typescript
// In stack detector
if (detectsPython) {
  suggestTool('ruff', 'Fast Python linter/formatter');
  suggestTool('mypy', 'Static type checking');
}

if (detectsNode) {
  suggestTool('vitest', 'Fast test runner');
  suggestTool('playwright', 'E2E testing');
}
```

---

## Related Documentation

- [Best Practices](BEST-PRACTICES.md) - Development best practices
- [Troubleshooting](TROUBLESHOOTING.md) - Common issues and solutions
- [Usage Guide](USAGE.md) - How to use DevEnvTemplate

