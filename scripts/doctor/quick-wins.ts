/**
 * Quick Wins Registry
 * 
 * Maps detected gaps to actionable fixes that can be completed in < 10 minutes.
 * Used by doctor mode to suggest and auto-apply improvements.
 */

export interface QuickWin {
  id: string;
  title: string;
  description: string;
  estimatedTime: string; // e.g., "2 min", "5 min"
  autoFixable: boolean;
  category: 'testing' | 'ci' | 'type-safety' | 'env-hygiene' | 'lint-format';
  frameworks?: ('nextjs' | 'vite' | 'express' | 'vanilla')[];
  detectCondition: (context: QuickWinContext) => boolean | Promise<boolean>;
  fixAction?: (context: QuickWinContext) => Promise<QuickWinResult>;
}

export interface QuickWinContext {
  rootDir: string;
  stack: any; // Stack detection result
  packageJson?: any;
  hasFile: (path: string) => Promise<boolean>;
  readFile: (path: string) => Promise<string>;
  writeFile: (path: string, content: string) => Promise<void>;
  updateJson: (path: string, updater: (obj: any) => any) => Promise<void>;
}

export interface QuickWinResult {
  success: boolean;
  message: string;
  filesCreated?: string[];
  filesModified?: string[];
  error?: string;
}

/**
 * Registry of all quick wins
 */
export const QUICK_WINS: QuickWin[] = [
  // ========================================
  // ENV HYGIENE
  // ========================================
  {
    id: 'add-env-example',
    title: 'Add .env.example file',
    description: 'Create .env.example to document required environment variables',
    estimatedTime: '2 min',
    autoFixable: true,
    category: 'env-hygiene',
    detectCondition: async (ctx) => {
      return !(await ctx.hasFile('.env.example')) && (await ctx.hasFile('.env') || await ctx.hasFile('.env.local'));
    },
    fixAction: async (ctx) => {
      const content = getEnvExampleTemplate(ctx.stack.frameworks?.type);
      await ctx.writeFile('.env.example', content);
      return {
        success: true,
        message: 'Created .env.example',
        filesCreated: ['.env.example']
      };
    }
  },
  {
    id: 'add-env-to-gitignore',
    title: 'Add .env to .gitignore',
    description: 'Ensure sensitive environment files are not committed',
    estimatedTime: '1 min',
    autoFixable: true,
    category: 'env-hygiene',
    detectCondition: async (ctx) => {
      if (!(await ctx.hasFile('.gitignore'))) return false;
      const gitignore = await ctx.readFile('.gitignore');
      return !gitignore.includes('.env') && (await ctx.hasFile('.env'));
    },
    fixAction: async (ctx) => {
      const gitignore = await ctx.readFile('.gitignore');
      const updated = gitignore + '\n# Environment variables\n.env\n.env.local\n.env.*.local\n';
      await ctx.writeFile('.gitignore', updated);
      return {
        success: true,
        message: 'Added .env patterns to .gitignore',
        filesModified: ['.gitignore']
      };
    }
  },

  // ========================================
  // TYPE SAFETY
  // ========================================
  {
    id: 'enable-ts-strict',
    title: 'Enable TypeScript strict mode',
    description: 'Enable strict type checking for better code quality',
    estimatedTime: '1 min',
    autoFixable: true,
    category: 'type-safety',
    detectCondition: async (ctx) => {
      if (!(await ctx.hasFile('tsconfig.json'))) return false;
      const tsconfig = JSON.parse(await ctx.readFile('tsconfig.json'));
      return tsconfig.compilerOptions && !tsconfig.compilerOptions.strict;
    },
    fixAction: async (ctx) => {
      await ctx.updateJson('tsconfig.json', (config) => {
        if (!config.compilerOptions) config.compilerOptions = {};
        config.compilerOptions.strict = true;
        return config;
      });
      return {
        success: true,
        message: 'Enabled TypeScript strict mode',
        filesModified: ['tsconfig.json']
      };
    }
  },
  {
    id: 'add-types-node',
    title: 'Install @types/node',
    description: 'Add Node.js type definitions for better TypeScript support',
    estimatedTime: '30 sec',
    autoFixable: true,
    category: 'type-safety',
    detectCondition: async (ctx) => {
      return ctx.packageJson && 
             ctx.packageJson.devDependencies?.typescript &&
             !ctx.packageJson.devDependencies?.['@types/node'] &&
             !ctx.packageJson.dependencies?.['@types/node'];
    }
  },

  // ========================================
  // LINT/FORMAT
  // ========================================
  {
    id: 'add-eslint-config',
    title: 'Add ESLint configuration',
    description: 'Set up ESLint for code quality and consistency',
    estimatedTime: '5 min',
    autoFixable: true,
    category: 'lint-format',
    frameworks: ['nextjs', 'vite', 'express', 'vanilla'],
    detectCondition: async (ctx) => {
      const eslintConfigs = [
        'eslint.config.js',
        '.eslintrc.js',
        '.eslintrc.json',
        '.eslintrc.yml'
      ];
      for (const config of eslintConfigs) {
        if (await ctx.hasFile(config)) return false;
      }
      return ctx.packageJson?.devDependencies?.eslint || false;
    }
  },
  {
    id: 'add-prettier-config',
    title: 'Add Prettier configuration',
    description: 'Set up Prettier for consistent code formatting',
    estimatedTime: '2 min',
    autoFixable: true,
    category: 'lint-format',
    detectCondition: async (ctx) => {
      const prettierConfigs = [
        '.prettierrc',
        '.prettierrc.json',
        '.prettierrc.js',
        'prettier.config.js'
      ];
      for (const config of prettierConfigs) {
        if (await ctx.hasFile(config)) return false;
      }
      return ctx.packageJson?.devDependencies?.prettier || false;
    }
  },
  {
    id: 'add-lint-script',
    title: 'Add lint script to package.json',
    description: 'Add npm script for running linter',
    estimatedTime: '30 sec',
    autoFixable: true,
    category: 'lint-format',
    detectCondition: async (ctx) => {
      return ctx.packageJson?.devDependencies?.eslint && !ctx.packageJson?.scripts?.lint;
    },
    fixAction: async (ctx) => {
      await ctx.updateJson('package.json', (pkg) => {
        if (!pkg.scripts) pkg.scripts = {};
        pkg.scripts.lint = 'eslint .';
        return pkg;
      });
      return {
        success: true,
        message: 'Added lint script to package.json',
        filesModified: ['package.json']
      };
    }
  },
  {
    id: 'add-format-script',
    title: 'Add format script to package.json',
    description: 'Add npm script for running formatter',
    estimatedTime: '30 sec',
    autoFixable: true,
    category: 'lint-format',
    detectCondition: async (ctx) => {
      return ctx.packageJson?.devDependencies?.prettier && !ctx.packageJson?.scripts?.format;
    },
    fixAction: async (ctx) => {
      await ctx.updateJson('package.json', (pkg) => {
        if (!pkg.scripts) pkg.scripts = {};
        pkg.scripts.format = 'prettier --write .';
        return pkg;
      });
      return {
        success: true,
        message: 'Added format script to package.json',
        filesModified: ['package.json']
      };
    }
  },

  // ========================================
  // TESTING
  // ========================================
  {
    id: 'add-test-script',
    title: 'Add test script to package.json',
    description: 'Add npm script for running tests',
    estimatedTime: '30 sec',
    autoFixable: true,
    category: 'testing',
    detectCondition: async (ctx) => {
      const hasTestFramework = ctx.packageJson?.devDependencies?.jest ||
                              ctx.packageJson?.devDependencies?.vitest ||
                              ctx.packageJson?.devDependencies?.['@playwright/test'];
      return hasTestFramework && !ctx.packageJson?.scripts?.test;
    },
    fixAction: async (ctx) => {
      await ctx.updateJson('package.json', (pkg) => {
        if (!pkg.scripts) pkg.scripts = {};
        // Detect which test framework to use
        if (pkg.devDependencies?.vitest) {
          pkg.scripts.test = 'vitest';
        } else if (pkg.devDependencies?.jest) {
          pkg.scripts.test = 'jest';
        } else if (pkg.devDependencies?.['@playwright/test']) {
          pkg.scripts.test = 'playwright test';
        } else {
          pkg.scripts.test = 'node --test';
        }
        return pkg;
      });
      return {
        success: true,
        message: 'Added test script to package.json',
        filesModified: ['package.json']
      };
    }
  },
  {
    id: 'add-typecheck-script',
    title: 'Add typecheck script to package.json',
    description: 'Add npm script for TypeScript type checking',
    estimatedTime: '30 sec',
    autoFixable: true,
    category: 'type-safety',
    detectCondition: async (ctx) => {
      return ctx.packageJson?.devDependencies?.typescript && 
             !ctx.packageJson?.scripts?.typecheck &&
             await ctx.hasFile('tsconfig.json');
    },
    fixAction: async (ctx) => {
      await ctx.updateJson('package.json', (pkg) => {
        if (!pkg.scripts) pkg.scripts = {};
        pkg.scripts.typecheck = 'tsc --noEmit';
        return pkg;
      });
      return {
        success: true,
        message: 'Added typecheck script to package.json',
        filesModified: ['package.json']
      };
    }
  },

  // ========================================
  // CI/CD
  // ========================================
  {
    id: 'add-github-actions',
    title: 'Add GitHub Actions CI workflow',
    description: 'Set up basic CI pipeline for automated testing',
    estimatedTime: '8 min',
    autoFixable: true,
    category: 'ci',
    detectCondition: async (ctx) => {
      return !(await ctx.hasFile('.github/workflows/ci.yml')) &&
             !(await ctx.hasFile('.github/workflows/indie-ci.yml'));
    }
  },
];

/**
 * Get .env.example template based on framework
 */
function getEnvExampleTemplate(framework?: string): string {
  const base = `# Environment Variables
# Copy this file to .env and fill in your values

# Application
NODE_ENV=development
PORT=3000
`;

  const templates: Record<string, string> = {
    nextjs: base + `
# Next.js
# NEXT_PUBLIC_API_URL=

# Database (if using)
# DATABASE_URL=

# Authentication (if using)
# NEXTAUTH_URL=http://localhost:3000
# NEXTAUTH_SECRET=

# API Keys
# API_KEY=
`,
    express: base + `
# Database
# DATABASE_URL=

# JWT/Authentication
# JWT_SECRET=

# API Keys
# API_KEY=

# Redis (if using)
# REDIS_URL=
`,
    vite: base + `
# API URL
# VITE_API_URL=http://localhost:3000

# Feature flags
# VITE_ENABLE_ANALYTICS=false

# API Keys (prefix with VITE_ to expose to client)
# VITE_PUBLIC_KEY=
`,
  };

  return templates[framework || 'vanilla'] || base;
}

/**
 * Filter quick wins by framework and current state
 */
export async function getApplicableQuickWins(
  context: QuickWinContext
): Promise<QuickWin[]> {
  const applicable: QuickWin[] = [];

  for (const quickWin of QUICK_WINS) {
    // Check if framework matches (if specified)
    if (quickWin.frameworks && quickWin.frameworks.length > 0) {
      const currentFramework = context.stack.frameworks?.type || 'vanilla';
      if (!quickWin.frameworks.includes(currentFramework)) {
        continue;
      }
    }

    // Check if detection condition is met
    try {
      const applies = await quickWin.detectCondition(context);
      if (applies) {
        applicable.push(quickWin);
      }
    } catch (error) {
      console.error(`Error checking quick win ${quickWin.id}:`, error);
    }
  }

  return applicable;
}

