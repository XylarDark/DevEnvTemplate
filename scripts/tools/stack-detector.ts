#!/usr/bin/env node

/**
 * Stack Detector - CI-only utility
 *
 * Analyzes a repository to detect technology stack and configuration.
 * Used by DevEnvTemplate drop-in to understand the current project setup.
 */

import { promises as fs } from 'fs';
import path from 'path';
import { createLogger } from '../utils/logger';
import { createJsonParseError } from '../utils/error-helpers';
import type {
  StackReport,
  SecretsMetadata,
  ToolingFramework,
  EnvTemplateInfo,
  EnvLoaderInfo,
  DependencyAuditInfo
} from '../types/gaps';

type DetectorMode = 'fast' | 'full';

interface StackDetectorOptions {
  rootDir?: string;
  quiet?: boolean;
  mode?: DetectorMode;
  debug?: boolean;
}

interface CachedFileOptions {
  allowMissing?: boolean;
}

type FullSecretsMetadata = {
  envTemplate: EnvTemplateInfo;
  envIgnored: boolean;
  envLoader: EnvLoaderInfo;
  dependencyAudit: DependencyAuditInfo;
};

const DEFAULT_IGNORED_DIRS = [
  'node_modules',
  '.git',
  '.hg',
  '.svn',
  '.idea',
  '.vscode',
  '.turbo',
  '.parcel-cache',
  '.cache',
  '.next',
  'build',
  'dist',
  'out',
  '.devenv',
  '.venv',
  'venv',
  '.pytest_cache',
  '.mypy_cache',
  '__pycache__'
];

const FAST_ONLY_IGNORED_DIRS = [
  'coverage',
  '.nyc_output',
  'docs',
  'public',
  'tmp',
  'temp',
  'data',
  'datasets'
];

const WORKFLOW_SCAN_LIMIT = 50;
const FAST_WORKFLOW_SCAN_LIMIT = 12;

const args = process.argv.slice(2);
const jsonOutput = args.includes('--json');
const debugFlag = args.includes('--debug');
if (debugFlag && !process.env.LOG_LEVEL) {
  process.env.LOG_LEVEL = 'DEBUG';
}
const quietMode = jsonOutput || (!debugFlag && args.includes('--quiet'));
const modeArg = args.find(arg => arg.startsWith('--mode='));
const inlineFastFlag = args.includes('--fast') || args.includes('--shallow');
const requestedMode = modeArg ? modeArg.split('=')[1] : inlineFastFlag ? 'fast' : 'full';
const detectorMode: DetectorMode = requestedMode === 'fast' ? 'fast' : 'full';

const logger = createLogger({ context: 'stack-detector' });

const TECHNOLOGY_ALIASES: Record<string, string> = {
  python: 'Python',
  'python runtime': 'Python Runtime',
  pytorch: 'PyTorch',
  pychrono: 'PyChrono',
  numpy: 'NumPy',
  scipy: 'SciPy',
  pandas: 'Pandas',
  'scikit-learn': 'scikit-learn',
  sklearn: 'scikit-learn',
  matplotlib: 'Matplotlib',
  pytest: 'Pytest',
  black: 'Black',
  ruff: 'Ruff',
  mypy: 'Mypy',
  fastapi: 'FastAPI',
  django: 'Django',
  flask: 'Flask'
};

class StackDetector {
  private rootDir: string;
  private quiet: boolean;
  private projectManifest: Record<string, unknown> | null;
  private pyprojectContent: string | null;
  private requirementsContent: string | null;
  private packageJsonDeps: Record<string, string> | null;
  private stack: StackReport;
  private mode: DetectorMode;
  private fileCache: Map<string, string | null>;
  private ignoredDirectories: Set<string>;
  private workflowScanLimit: number;
  private debugMode: boolean;

  constructor(options: StackDetectorOptions = {}) {
    this.rootDir = options.rootDir || process.cwd();
    this.quiet = !!options.quiet;
    this.mode = options.mode || detectorMode;
    this.debugMode = !!options.debug;
    this.fileCache = new Map();
    this.ignoredDirectories = new Set(
      DEFAULT_IGNORED_DIRS.map(dir => dir.toLowerCase())
    );
    if (this.mode === 'fast') {
      FAST_ONLY_IGNORED_DIRS.forEach(dir => this.ignoredDirectories.add(dir.toLowerCase()));
    }
    this.workflowScanLimit = this.mode === 'fast'
      ? FAST_WORKFLOW_SCAN_LIMIT
      : WORKFLOW_SCAN_LIMIT;
    this.projectManifest = null;
    this.pyprojectContent = null;
    this.requirementsContent = null;
    this.packageJsonDeps = null;
    this.stack = {
      technologies: [],
      configurations: [],
      frameworks: {
        type: 'vanilla',
        version: null,
        dirs: []
      },
      tooling: {
        testing: { present: false, frameworks: [] },
        linting: { present: false, configs: [] },
        formatting: { present: false, configs: [] }
      },
      scripts: {
        detected: [],
        missing: []
      },
      files: {
        configs: [],
        key_patterns: []
      },
      quality: {
        linting: false,
        testing: false,
        typescript: false,
        security: false,
        formatting: false
      },
      ci: {
        present: false
      },
      secrets: {
        envTemplate: { present: false, files: [] },
        envIgnored: false,
        envLoader: { present: false, tools: [] },
        dependencyAudit: { present: false, tools: [] }
      },
      profiles: [],
      primaryProfile: null,
      languageProfile: 'agnostic',
      manifest: null,
      cursorRules: {
        present: false,
        existingFiles: [],
        coreFiles: [],
        conditionalFiles: [],
        projectSpecificFiles: [],
        needsIntegration: false
      }
    } as StackReport;

    this.logDebug('StackDetector initialized', {
      rootDir: this.rootDir,
      mode: this.mode
    });
  }

  private shouldSkipDirectory(name: string): boolean {
    return this.ignoredDirectories.has(name.toLowerCase());
  }

  private logDebug(message: string, meta: Record<string, unknown> = {}): void {
    if (this.debugMode) {
      logger.debug(message, meta);
    }
  }

  private async readFileCached(filePath: string, options: CachedFileOptions = {}): Promise<string | null> {
    const allowMissing = options.allowMissing !== false;
    const absPath = path.isAbsolute(filePath) ? filePath : path.join(this.rootDir, filePath);
    if (this.fileCache.has(absPath)) {
      return this.fileCache.get(absPath) ?? null;
    }
    try {
      const content = await fs.readFile(absPath, 'utf8');
      this.fileCache.set(absPath, content);
      return content;
    } catch (error: any) {
      if (!allowMissing || error.code !== 'ENOENT') {
        throw error;
      }
      this.fileCache.set(absPath, null);
      return null;
    }
  }

  private async readJsonFile(filePath: string): Promise<any> {
    const absPath = path.isAbsolute(filePath) ? filePath : path.join(this.rootDir, filePath);
    const content = await this.readFileCached(absPath, { allowMissing: false });
    if (content === null) {
      throw new Error(`File not found: ${absPath}`);
    }
    try {
      return JSON.parse(content);
    } catch (error: any) {
      if (error instanceof SyntaxError) {
        // Use improved error helper for better error messages
        throw createJsonParseError(error, absPath);
      }
      throw error;
    }
  }

  async detect(): Promise<StackReport> {
    this.logDebug('Starting stack detection run', { mode: this.mode });
    if (!this.quiet) {
      logger.info('🔍 Analyzing repository stack...');
    }

    await this.loadProjectManifest();
    // Detect package managers and frameworks
    await this.detectPackageJson();
    await this.detectScripts();
    await this.detectTypeScript();
    await this.detectFrameworks();
    await this.detectExpress();
    await this.detectPrisma();
    await this.detectTailwind();
    await this.detectTesting();
    await this.detectLinting();
    await this.detectFormatting();
    await this.detectCI();
    await this.detectSecurity();
    await this.detectSecretsHygiene();
    await this.detectCursorRules();
    this.assignProfiles();

    return this.stack;
  }

  async loadProjectManifest(): Promise<void> {
    try {
      const manifest = await this.readJsonFile('project.manifest.json');
      this.projectManifest = manifest;
      this.stack.manifest = manifest;
      this.applyManifestTechnologies();
      this.logDebug('Loaded project.manifest.json', { keys: Object.keys(manifest) });
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
      this.projectManifest = null;
      this.logDebug('project.manifest.json not found');
    }
  }

  async detectPackageJson(): Promise<void> {
    try {
      const packageJson = await this.readJsonFile('package.json');

      // Node.js version
      if (packageJson.engines?.node) {
        this.stack.technologies.push({
          name: 'Node.js',
          version: packageJson.engines.node,
          confidence: 'high',
          source: 'engines'
        });
      } else {
        this.stack.technologies.push({
          name: 'Node.js',
          version: 'detected',
          confidence: 'medium',
          source: 'presence'
        });
      }

      // Dependencies
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      this.packageJsonDeps = deps;
      this.logDebug('Parsed package.json', {
        dependencies: Object.keys(packageJson.dependencies || {}).length,
        devDependencies: Object.keys(packageJson.devDependencies || {}).length
      });

      // React
      if (deps.react) {
        this.stack.technologies.push({
          name: 'React',
          version: deps.react,
          confidence: 'high',
          source: 'dependency'
        });
      }

      // Next.js
      if (deps.next) {
        this.stack.technologies.push({
          name: 'Next.js',
          version: deps.next,
          confidence: 'high',
          source: 'dependency'
        });
      }

      // Vite
      if (deps.vite) {
        this.stack.technologies.push({
          name: 'Vite',
          version: deps.vite,
          confidence: 'high',
          source: 'dependency'
        });
      }

      // Express
      if (deps.express) {
        this.stack.technologies.push({
          name: 'Express',
          version: deps.express,
          confidence: 'high',
          source: 'dependency'
        });
      }

      // Prisma
      if (deps.prisma || deps['@prisma/client']) {
        this.stack.technologies.push({
          name: 'Prisma',
          version: deps.prisma || deps['@prisma/client'],
          confidence: 'high',
          source: 'dependency'
        });
      }

      // Tailwind CSS
      if (deps.tailwindcss) {
        this.stack.technologies.push({
          name: 'Tailwind CSS',
          version: deps.tailwindcss,
          confidence: 'high',
          source: 'dependency'
        });
      }

      // Vitest
      if (deps.vitest) {
        this.stack.technologies.push({
          name: 'Vitest',
          version: deps.vitest,
          confidence: 'high',
          source: 'dependency'
        });
      }

      // Prettier
      if (deps.prettier) {
        this.stack.technologies.push({
          name: 'Prettier',
          version: deps.prettier,
          confidence: 'high',
          source: 'dependency'
        });
      }

      // Playwright
      if (deps['@playwright/test']) {
        this.stack.technologies.push({
          name: 'Playwright',
          version: deps['@playwright/test'],
          confidence: 'high',
          source: 'dependency'
        });
      }

      // Jest
      if (deps.jest) {
        this.stack.technologies.push({
          name: 'Jest',
          version: deps.jest,
          confidence: 'high',
          source: 'dependency'
        });
      }

      // ESLint
      if (deps.eslint) {
        this.stack.technologies.push({
          name: 'ESLint',
          version: deps.eslint,
          confidence: 'high',
          source: 'dependency'
        });
      }

      // TypeScript
      if (deps.typescript) {
        this.stack.technologies.push({
          name: 'TypeScript',
          version: deps.typescript,
          confidence: 'high',
          source: 'dependency'
        });
      }

      // Python-related packages (if in a Node project with Python tooling)
      if (deps['@types/python-shell'] || deps['python-shell']) {
        this.stack.technologies.push({
          name: 'Python Integration',
          version: deps['@types/python-shell'] || deps['python-shell'],
          confidence: 'medium',
          source: 'dependency'
        });
      }

    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
      this.logDebug('package.json not found');
    }

    // Detect Python
    await this.detectPython();

    // Detect Go
    await this.detectGo();

    // Detect Java
    await this.detectJava();

    // Detect .NET
    await this.detectDotNet();
  }

  async detectTypeScript(): Promise<void> {
    try {
      const config = await this.readJsonFile('tsconfig.json');

      this.stack.quality.typescript = true;
      this.stack.configurations.push({
        type: 'typescript',
        strict: config.compilerOptions?.strict || false,
        target: config.compilerOptions?.target || 'unknown'
      });
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }

  async detectPython(): Promise<void> {
    const pyprojectToml = await this.readFileCached('pyproject.toml');
    if (pyprojectToml) {
      this.pyprojectContent = pyprojectToml;
      const tomlData = this.parseTOML(pyprojectToml);
      const pyprojectLower = pyprojectToml.toLowerCase();

      this.addTechnology('Python', {
        version: tomlData.tool?.poetry?.version || 'detected',
        confidence: 'high',
        source: 'pyproject.toml'
      });
      if (tomlData.tool?.poetry?.python) {
        this.addTechnology('Python Runtime', {
          version: tomlData.tool.poetry.python,
          confidence: 'high',
          source: 'pyproject.toml'
        });
      }

      const deps = tomlData.tool?.poetry?.dependencies as Record<string, any> | undefined;
      this.logDebug('Detected pyproject.toml', {
        hasDependencies: Boolean(deps),
        pythonVersion: tomlData.tool?.poetry?.python
      });
      if (deps) {

        if (deps.fastapi) {
          this.stack.technologies.push({
            name: 'FastAPI',
            version: deps.fastapi,
            confidence: 'high',
            source: 'pyproject.toml'
          });
        }

        if (deps.django) {
          this.stack.technologies.push({
            name: 'Django',
            version: deps.django,
            confidence: 'high',
            source: 'pyproject.toml'
          });
        }

        if (deps.flask) {
          this.stack.technologies.push({
            name: 'Flask',
            version: deps.flask,
            confidence: 'high',
            source: 'pyproject.toml'
          });
        }

        if (deps.pytest) {
          this.addTechnology('Pytest', {
            version: deps.pytest,
            confidence: 'high',
            source: 'pyproject.toml'
          });
        }

        if (deps.black) {
          this.addTechnology('Black', {
            version: deps.black,
            confidence: 'high',
            source: 'pyproject.toml'
          });
        }

        if (deps.ruff) {
          this.addTechnology('Ruff', {
            version: deps.ruff,
            confidence: 'high',
            source: 'pyproject.toml'
          });
        }

        if (deps.mypy) {
          this.addTechnology('Mypy', {
            version: deps.mypy,
            confidence: 'high',
            source: 'pyproject.toml'
          });
        }
      }

      if (pyprojectLower.includes('[tool.mypy') || pyprojectLower.includes('mypy>=')) {
        this.addTechnology('Mypy', {
          version: 'detected',
          confidence: 'medium',
          source: 'pyproject.toml'
        });
      }
    } else {
      this.pyprojectContent = null;
      const requirements = await this.readFileCached('requirements.txt');
      if (requirements) {
        this.requirementsContent = requirements;
        this.addTechnology('Python', {
          version: 'detected',
          confidence: 'medium',
          source: 'requirements.txt'
        });
        this.logDebug('Detected requirements.txt for Python signals');

        if (requirements.includes('fastapi')) {
          this.addTechnology('FastAPI', {
            version: 'detected',
            confidence: 'medium',
            source: 'requirements.txt'
          });
        }

        if (requirements.includes('django')) {
          this.addTechnology('Django', {
            version: 'detected',
            confidence: 'medium',
            source: 'requirements.txt'
          });
        }

        if (requirements.includes('flask')) {
          this.addTechnology('Flask', {
            version: 'detected',
            confidence: 'medium',
            source: 'requirements.txt'
          });
        }

        if (requirements.includes('pytest')) {
          this.addTechnology('Pytest', {
            version: 'detected',
            confidence: 'medium',
            source: 'requirements.txt'
          });
        }

        if (requirements.includes('black')) {
          this.addTechnology('Black', {
            version: 'detected',
            confidence: 'medium',
            source: 'requirements.txt'
          });
        }

        if (requirements.includes('ruff')) {
          this.addTechnology('Ruff', {
            version: 'detected',
            confidence: 'medium',
            source: 'requirements.txt'
          });
        }

        if (requirements.includes('mypy')) {
          this.addTechnology('Mypy', {
            version: 'detected',
            confidence: 'medium',
            source: 'requirements.txt'
          });
        }
      } else {
        this.requirementsContent = null;
      }
    }
  }

  async detectGo(): Promise<void> {
    const goMod = await this.readFileCached('go.mod');
    if (goMod) {
      const lines = goMod.split('\n');

      // Extract module name and Go version
      const moduleLine = lines.find(line => line.startsWith('module '));
      const goLine = lines.find(line => line.startsWith('go '));

      if (moduleLine) {
        this.stack.technologies.push({
          name: 'Go',
          version: goLine ? goLine.replace('go ', '').trim() : 'detected',
          confidence: 'high',
          source: 'go.mod'
        });
      }

      // Check for common Go frameworks
      const requireLines = lines.filter(line => line.includes('require') || line.trim().startsWith('\t'));
      const deps = requireLines.join('\n');

      if (deps.includes('gin-gonic/gin')) {
        this.stack.technologies.push({
          name: 'Gin',
          version: 'detected',
          confidence: 'high',
          source: 'go.mod'
        });
      }

      if (deps.includes('gorilla/mux')) {
        this.stack.technologies.push({
          name: 'Gorilla Mux',
          version: 'detected',
          confidence: 'high',
          source: 'go.mod'
        });
      }

      if (deps.includes('echo')) {
        this.stack.technologies.push({
          name: 'Echo',
          version: 'detected',
          confidence: 'high',
          source: 'go.mod'
        });
      }

    }
  }

  async detectJava(): Promise<void> {
    const pomXml = await this.readFileCached('pom.xml');
    if (pomXml) {

      this.stack.technologies.push({
        name: 'Java',
        version: 'detected',
        confidence: 'high',
        source: 'pom.xml'
      });

      // Extract Maven version and dependencies
      const mavenVersion = pomXml.match(/<maven\.compiler\.source>([^<]+)</)?.[1];
      if (mavenVersion) {
        this.stack.technologies.push({
          name: 'Java Compiler',
          version: mavenVersion,
          confidence: 'high',
          source: 'pom.xml'
        });
      }

      // Check for common Java frameworks
      if (pomXml.includes('spring-boot')) {
        this.stack.technologies.push({
          name: 'Spring Boot',
          version: 'detected',
          confidence: 'high',
          source: 'pom.xml'
        });
      }

      if (pomXml.includes('quarkus')) {
        this.stack.technologies.push({
          name: 'Quarkus',
          version: 'detected',
          confidence: 'high',
          source: 'pom.xml'
        });
      }

      if (pomXml.includes('micronaut')) {
        this.stack.technologies.push({
          name: 'Micronaut',
          version: 'detected',
          confidence: 'high',
          source: 'pom.xml'
        });
      }

    } else {
      const buildGradle = await this.readFileCached('build.gradle');
      if (buildGradle) {

        this.stack.technologies.push({
          name: 'Java',
          version: 'detected',
          confidence: 'high',
          source: 'build.gradle'
        });

        // Check for Gradle plugins/frameworks
        if (buildGradle.includes('org.springframework.boot')) {
          this.stack.technologies.push({
            name: 'Spring Boot',
            version: 'detected',
            confidence: 'high',
            source: 'build.gradle'
          });
        }

        if (buildGradle.includes('quarkus')) {
          this.stack.technologies.push({
            name: 'Quarkus',
            version: 'detected',
            confidence: 'high',
            source: 'build.gradle'
          });
        }
      }
    }
  }

  async detectDotNet(): Promise<void> {
    try {
      // Check for .csproj files
      const csprojFiles = await this.findFiles('*.csproj');

      if (csprojFiles.length > 0) {
        // Read first .csproj file
        const csprojContent = await this.readFileCached(csprojFiles[0]);
        if (!csprojContent) {
          return;
        }

        this.stack.technologies.push({
          name: '.NET',
          version: 'detected',
          confidence: 'high',
          source: '.csproj'
        });

        // Extract .NET version
        const targetFramework = csprojContent.match(/<TargetFramework>([^<]+)</)?.[1];
        if (targetFramework) {
          this.stack.technologies.push({
            name: '.NET Runtime',
            version: targetFramework,
            confidence: 'high',
            source: '.csproj'
          });
        }

        // Check for ASP.NET Core
        if (csprojContent.includes('Microsoft.AspNetCore') || csprojContent.includes('AspNetCore')) {
          this.stack.technologies.push({
            name: 'ASP.NET Core',
            version: 'detected',
            confidence: 'high',
            source: '.csproj'
          });
        }

        // Check for Entity Framework
        if (csprojContent.includes('EntityFramework') || csprojContent.includes('Microsoft.EntityFrameworkCore')) {
          this.stack.technologies.push({
            name: 'Entity Framework',
            version: 'detected',
            confidence: 'high',
            source: '.csproj'
          });
        }
      }

    } catch (error: any) {
      // No .NET project detected
    }
  }

  async findFiles(pattern: string): Promise<string[]> {
    // Simple file finder - in a real implementation, you'd use glob
    try {
      const files = await fs.readdir(this.rootDir);
      return files.filter(file => file.endsWith(pattern.replace('*', '')));
    } catch {
      return [];
    }
  }

  parseTOML(content: string): Record<string, any> {
    // Simple TOML parser for basic pyproject.toml structure
    // In a real implementation, you'd use a proper TOML parser
    const result: Record<string, any> = {};

    try {
      // Very basic parsing - just extract tool.poetry section
      const toolSection = content.match(/\[tool\.poetry\]([\s\S]*?)(?=\[|$)/);
      if (toolSection) {
        const lines = toolSection[1].split('\n');
        const poetry: Record<string, string> = {};

        lines.forEach(line => {
          const match = line.match(/(\w+)\s*=\s*"([^"]+)"/);
          if (match) {
            poetry[match[1]] = match[2];
          }
        });

        result.tool = { poetry };
      }
    } catch (error: any) {
      // Parsing failed
    }

    return result;
  }

  async detectFrameworks(): Promise<void> {
    // Check for Next.js - config files and directories
    const nextConfigFiles = ['next.config.js', 'next.config.mjs', 'next.config.ts'];
    for (const configFile of nextConfigFiles) {
      try {
        await fs.access(path.join(this.rootDir, configFile));
        this.stack.configurations.push({
          type: 'nextjs',
          configFile
        });
        this.stack.files.configs.push(configFile);
        
        // Detect Next.js type (app dir vs pages dir)
        const dirs: string[] = [];
        try {
          await fs.access(path.join(this.rootDir, 'app'));
          dirs.push('app');
          this.stack.files.key_patterns.push('app/ (Next.js app directory)');
        } catch {}
        try {
          await fs.access(path.join(this.rootDir, 'pages'));
          dirs.push('pages');
          this.stack.files.key_patterns.push('pages/ (Next.js pages directory)');
        } catch {}
        
        const nextVersion = this.stack.technologies.find(t => t.name === 'Next.js')?.version;
        this.stack.frameworks = {
          type: 'nextjs',
          version: nextVersion || 'detected',
          dirs
        };
        this.logDebug('Detected Next.js framework', { dirs });
        break;
      } catch (error: any) {
        // Continue checking
      }
    }

    // Check for Vite config
    const viteConfigFiles = ['vite.config.ts', 'vite.config.js', 'vite.config.mjs'];
    for (const configFile of viteConfigFiles) {
      try {
        await fs.access(path.join(this.rootDir, configFile));
        this.stack.configurations.push({
          type: 'vite',
          configFile
        });
        this.stack.files.configs.push(configFile);
        
        const viteVersion = this.stack.technologies.find(t => t.name === 'Vite')?.version;
        this.stack.frameworks = {
          type: 'vite',
          version: viteVersion || 'detected',
          dirs: ['src']
        };
        this.logDebug('Detected Vite framework');
        break;
      } catch (error: any) {
        // Continue checking
      }
    }
  }

  async detectScripts(): Promise<void> {
    try {
      const packageJson = await this.readJsonFile('package.json');
      const scripts = packageJson.scripts || {};
      
      // Essential scripts we look for
      const essentialScripts = ['dev', 'build', 'test', 'lint', 'format', 'typecheck'];
      const detected: Array<{ name: string; command: string }> = [];
      const missing: string[] = [];
      
      for (const scriptName of essentialScripts) {
        if (scripts[scriptName]) {
          detected.push({ name: scriptName, command: scripts[scriptName] });
        } else {
          missing.push(scriptName);
        }
      }
      
      this.stack.scripts = { detected, missing };
      this.logDebug('Script detection complete', {
        detected: detected.map(script => script.name),
        missing
      });
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }

  async detectExpress(): Promise<void> {
    // Check for Express patterns
    const expressFiles = ['server.js', 'server.ts', 'app.js', 'app.ts', 'index.js', 'index.ts'];
    
    for (const file of expressFiles) {
      try {
        const filePath = path.join(this.rootDir, file);
        const content = await this.readFileCached(filePath);
        if (!content) {
          continue;
        }
        
        // Look for express patterns
        if (content.includes('express()') || content.includes('require(\'express\')') || content.includes('from \'express\'')) {
          this.stack.files.key_patterns.push(`${file} (Express server)`);
          
          // Only set framework if not already set to Next.js or Vite
          if (this.stack.frameworks.type === 'vanilla') {
            const expressVersion = this.stack.technologies.find(t => t.name === 'Express')?.version;
            this.stack.frameworks = {
              type: 'express',
              version: expressVersion || 'detected',
              dirs: [path.dirname(file) || '.']
            };
          }
          break;
        }
      } catch (error: any) {
        // File doesn't exist or can't be read
      }
    }
  }

  async detectPrisma(): Promise<void> {
    try {
      await fs.access(path.join(this.rootDir, 'prisma', 'schema.prisma'));
      this.stack.files.configs.push('prisma/schema.prisma');
      this.stack.files.key_patterns.push('prisma/schema.prisma (Prisma ORM)');
      this.stack.configurations.push({
        type: 'prisma',
        configFile: 'prisma/schema.prisma'
      });
    } catch (error: any) {
      // Also check root level
      try {
        await fs.access(path.join(this.rootDir, 'schema.prisma'));
        this.stack.files.configs.push('schema.prisma');
        this.stack.files.key_patterns.push('schema.prisma (Prisma ORM)');
        this.stack.configurations.push({
          type: 'prisma',
          configFile: 'schema.prisma'
        });
      } catch (error2: any) {
        // No Prisma schema
      }
    }
  }

  async detectTailwind(): Promise<void> {
    const tailwindConfigs = ['tailwind.config.js', 'tailwind.config.ts', 'tailwind.config.cjs', 'tailwind.config.mjs'];
    
    for (const configFile of tailwindConfigs) {
      try {
        await fs.access(path.join(this.rootDir, configFile));
        this.stack.files.configs.push(configFile);
        this.stack.files.key_patterns.push(`${configFile} (Tailwind CSS)`);
        this.stack.configurations.push({
          type: 'tailwind',
          configFile
        });
        break;
      } catch (error: any) {
        // Continue checking
      }
    }
  }

  async detectTesting(): Promise<void> {
    const testingFrameworks: ToolingFramework[] = [];
    
    // Check for test directories
    try {
      await fs.access(path.join(this.rootDir, 'tests'));
      this.stack.quality.testing = true;
      this.stack.files.key_patterns.push('tests/ (test directory)');
    } catch (error: any) {
      try {
        await fs.access(path.join(this.rootDir, '__tests__'));
        this.stack.quality.testing = true;
        this.stack.files.key_patterns.push('__tests__/ (test directory)');
      } catch (error: any) {
        // Check for test files in src
        try {
          const files = await fs.readdir(path.join(this.rootDir, 'src'));
          if (files.some(f => f.includes('.test.') || f.includes('.spec.'))) {
            this.stack.quality.testing = true;
            this.stack.files.key_patterns.push('src/**/*.test.* (test files)');
          }
        } catch (error: any) {
          // No tests detected
        }
      }
    }

    // Check for Jest config
    const jestConfigs = ['jest.config.js', 'jest.config.ts', 'jest.config.json'];
    for (const configFile of jestConfigs) {
      try {
        await fs.access(path.join(this.rootDir, configFile));
        this.stack.configurations.push({
          type: 'jest',
          configFile
        });
        this.stack.files.configs.push(configFile);
        testingFrameworks.push({ name: 'Jest', config: configFile });
        break;
      } catch (error: any) {
        // Continue checking
      }
    }

    // Check for Vitest config
    const vitestConfigs = ['vitest.config.ts', 'vitest.config.js'];
    for (const configFile of vitestConfigs) {
      try {
        await fs.access(path.join(this.rootDir, configFile));
        this.stack.configurations.push({
          type: 'vitest',
          configFile
        });
        this.stack.files.configs.push(configFile);
        testingFrameworks.push({ name: 'Vitest', config: configFile });
        break;
      } catch (error: any) {
        // Continue checking
      }
    }

    // Check for Playwright config
    const playwrightConfigs = ['playwright.config.ts', 'playwright.config.js'];
    for (const configFile of playwrightConfigs) {
      try {
        await fs.access(path.join(this.rootDir, configFile));
        this.stack.configurations.push({
          type: 'playwright',
          configFile
        });
        this.stack.files.configs.push(configFile);
        testingFrameworks.push({ name: 'Playwright', config: configFile });
        break;
      } catch (error: any) {
        // Continue checking
      }
    }

    this.stack.tooling.testing = {
      present: this.stack.quality.testing || testingFrameworks.length > 0,
      frameworks: testingFrameworks
    };

    // Detect Pytest via config files or dependencies
    let pytestConfig = null;
    try {
      await fs.access(path.join(this.rootDir, 'pytest.ini'));
      pytestConfig = 'pytest.ini';
    } catch (error: any) {
      if (this.pyprojectContent && this.pyprojectContent.toLowerCase().includes('pytest')) {
        pytestConfig = 'pyproject.toml';
      } else if (this.requirementsContent && this.requirementsContent.toLowerCase().includes('pytest')) {
        pytestConfig = 'requirements.txt';
      }
    }

    if (pytestConfig) {
      if (!testingFrameworks.some(f => f.name === 'Pytest')) {
        testingFrameworks.push({ name: 'Pytest', config: pytestConfig });
      }
      this.stack.quality.testing = true;
      this.stack.tooling.testing.present = true;
    }
  }

  async detectLinting(): Promise<void> {
    const lintConfigs: string[] = [];
    
    // Check for ESLint config (various formats)
    const eslintFiles = [
      'eslint.config.js',
      'eslint.config.mjs',
      '.eslintrc.js',
      '.eslintrc.cjs', 
      '.eslintrc.json',
      '.eslintrc.ts',
      '.eslintrc.yml',
      '.eslintrc.yaml'
    ];

    for (const file of eslintFiles) {
      try {
        await fs.access(path.join(this.rootDir, file));
        this.stack.quality.linting = true;
        this.stack.configurations.push({
          type: 'eslint',
          configFile: file
        });
        this.stack.files.configs.push(file);
        lintConfigs.push(file);
        break;
      } catch (error: any) {
        // Continue checking
      }
    }

    // Check for package.json eslintConfig
    try {
      const packageJson = await this.readJsonFile('package.json');
      if (packageJson.eslintConfig) {
        this.stack.quality.linting = true;
        this.stack.configurations.push({
          type: 'eslint',
          configFile: 'package.json'
        });
        lintConfigs.push('package.json (eslintConfig)');
      }
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }

    // Detect Ruff for Python projects
    let ruffDetected = false;
    try {
      await fs.access(path.join(this.rootDir, 'ruff.toml'));
      ruffDetected = true;
      lintConfigs.push('ruff.toml');
    } catch (error: any) {
      try {
        await fs.access(path.join(this.rootDir, '.ruff.toml'));
        ruffDetected = true;
        lintConfigs.push('.ruff.toml');
      } catch (error2: any) {
        if (this.pyprojectContent && this.pyprojectContent.toLowerCase().includes('[tool.ruff')) {
          ruffDetected = true;
          lintConfigs.push('pyproject.toml (ruff)');
        }
      }
    }

    if (ruffDetected) {
      this.stack.quality.linting = true;
      this.addTechnology('Ruff', {
        version: 'detected',
        confidence: 'medium',
        source: 'ruff-config'
      });
    }

    this.stack.tooling.linting = {
      present: this.stack.quality.linting,
      configs: lintConfigs
    };
  }

  async detectFormatting(): Promise<void> {
    const formatConfigs: string[] = [];
    
    // Check for Prettier config
    const prettierFiles = [
      '.prettierrc',
      '.prettierrc.json',
      '.prettierrc.js',
      '.prettierrc.cjs',
      '.prettierrc.mjs',
      '.prettierrc.yml',
      '.prettierrc.yaml',
      'prettier.config.js',
      'prettier.config.cjs',
      'prettier.config.mjs'
    ];

    for (const file of prettierFiles) {
      try {
        await fs.access(path.join(this.rootDir, file));
        this.stack.quality.formatting = true;
        this.stack.configurations.push({
          type: 'prettier',
          configFile: file
        });
        this.stack.files.configs.push(file);
        formatConfigs.push(file);
        break;
      } catch (error: any) {
        // Continue checking
      }
    }

    // Check for package.json prettier config
    try {
      const packageJson = await this.readJsonFile('package.json');
      if (packageJson.prettier) {
        this.stack.quality.formatting = true;
        this.stack.configurations.push({
          type: 'prettier',
          configFile: 'package.json'
        });
        formatConfigs.push('package.json (prettier)');
      }
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }

    // Detect Black formatter for Python projects
    let blackDetected = false;
    if (this.pyprojectContent && this.pyprojectContent.toLowerCase().includes('[tool.black')) {
      blackDetected = true;
      formatConfigs.push('pyproject.toml (black)');
    } else if (this.requirementsContent && this.requirementsContent.toLowerCase().includes('black')) {
      blackDetected = true;
      formatConfigs.push('requirements.txt (black)');
    }

    if (blackDetected) {
      this.stack.quality.formatting = true;
      this.addTechnology('Black', {
        version: 'detected',
        confidence: 'medium',
        source: 'black-config'
      });
    }

    this.stack.tooling.formatting = {
      present: this.stack.quality.formatting,
      configs: formatConfigs
    };
  }

  async detectCI(): Promise<void> {
    // Check for GitHub Actions
    try {
      await fs.access(path.join(this.rootDir, '.github', 'workflows'));
      this.stack.ci.present = true;
      this.stack.ci.type = 'github-actions';
    } catch (error: any) {
      // No GitHub Actions
    }

    // Check for other CI systems
    const ciFiles = ['.travis.yml', '.gitlab-ci.yml', 'azure-pipelines.yml', 'Jenkinsfile'];

    for (const file of ciFiles) {
      try {
        await fs.access(path.join(this.rootDir, file));
        this.stack.ci.present = true;
        this.stack.ci.type = file.replace('.', '').replace('-', '');
        break;
      } catch (error: any) {
        // Continue checking
      }
    }
    this.logDebug('CI detection complete', {
      present: this.stack.ci.present,
      type: this.stack.ci.type
    });
  }

  async detectSecurity(): Promise<void> {
    // Check for security-related files
    const securityFiles = ['.env', '.env.local', '.env.production'];

    for (const file of securityFiles) {
      try {
        await fs.access(path.join(this.rootDir, file));
        this.stack.quality.security = true;
        break;
      } catch (error: any) {
        // Continue checking
      }
    }

    // Check for CSP or security headers
    if (this.stack.configurations.some(c => c.type === 'nextjs')) {
      const nextConfig = await this.readFileCached('next.config.js');
      if (nextConfig && (nextConfig.includes('Content-Security-Policy') || nextConfig.includes('headers'))) {
        this.stack.quality.security = true;
      }
    }
    this.logDebug('Security detection complete', {
      securityFiles: this.stack.quality.security
    });
  }

  async detectSecretsHygiene(): Promise<void> {
    const secrets: FullSecretsMetadata = {
      envTemplate: { present: false, files: [] as string[] },
      envIgnored: false,
      envLoader: { present: false, tools: [] as string[] },
      dependencyAudit: { present: false, tools: [] as string[] }
    };

    const templateCandidates = [
      '.env.example',
      '.env.sample',
      '.env.template',
      'env.example',
      'env-example.txt',
      'env-example.env'
    ];

    for (const candidate of templateCandidates) {
      const candidatePath = path.join(this.rootDir, candidate);
      try {
        await fs.access(candidatePath);
        secrets.envTemplate.files.push(candidate);
      } catch (error: any) {
        // File missing - skip
      }
    }
    secrets.envTemplate.present = secrets.envTemplate.files.length > 0;

    const gitignore = await this.readFileCached('.gitignore');
    if (gitignore) {
      const gitignoreLower = gitignore.toLowerCase();
      if (gitignoreLower.includes('.env')) {
        secrets.envIgnored = true;
      }
    }

    const loaderTools = new Set<string>();
    if (this.packageJsonDeps) {
      const nodeLoaders = ['dotenv', 'dotenv-flow', 'dotenv-expand', 'env-cmd', '@next/env'];
      for (const loader of nodeLoaders) {
        if (this.packageJsonDeps[loader]) {
          loaderTools.add(loader);
        }
      }
    }
    const pythonLoaderPatterns = ['python-dotenv', 'pydantic-settings', 'django-environ', 'dynaconf'];
    if (this.pyprojectContent) {
      const lower = this.pyprojectContent.toLowerCase();
      for (const pattern of pythonLoaderPatterns) {
        if (lower.includes(pattern)) {
          loaderTools.add(pattern);
        }
      }
    }
    if (this.requirementsContent) {
      const lower = this.requirementsContent.toLowerCase();
      for (const pattern of pythonLoaderPatterns) {
        if (lower.includes(pattern)) {
          loaderTools.add(pattern);
        }
      }
    }

    let envLoaderPresent = loaderTools.size > 0;
    if (!envLoaderPresent) {
      const helperCandidates = [
        'scripts/check_env.py',
        'scripts/check-env.py',
        'scripts/check_env.js',
        'scripts/check-env.js'
      ];
      for (const helper of helperCandidates) {
        if (await this.fileExists(helper)) {
          loaderTools.add('env-check-script');
          envLoaderPresent = true;
          break;
        }
      }
    }
    secrets.envLoader.tools = Array.from(loaderTools);
    secrets.envLoader.present = secrets.envLoader.tools.length > 0;

    const auditTools = new Set<string>();
    const workflowFiles = await this.collectWorkflowFiles();
    if (workflowFiles.length > 0) {
      const auditPatterns = [
        { tool: 'pip-audit', patterns: ['pip-audit'] },
        { tool: 'bandit', patterns: ['bandit'] },
        { tool: 'safety', patterns: ['safety check', 'pip install safety'] },
        { tool: 'npm audit', patterns: ['npm audit'] },
        { tool: 'pnpm audit', patterns: ['pnpm audit'] },
        { tool: 'yarn audit', patterns: ['yarn audit'] }
      ];

      for (const workflowFile of workflowFiles) {
        const content = await this.readFileCached(workflowFile);
        if (!content) {
          continue;
        }
        const lowerContent = content.toLowerCase();
        for (const { tool, patterns } of auditPatterns) {
          if (patterns.some(pattern => lowerContent.includes(pattern))) {
            auditTools.add(tool);
          }
        }
      }
    }
    secrets.dependencyAudit.tools = Array.from(auditTools);
    secrets.dependencyAudit.present = secrets.dependencyAudit.tools.length > 0;

    const hasCompleteHygiene =
      secrets.envTemplate.present &&
      secrets.envIgnored &&
      secrets.envLoader.present &&
      secrets.dependencyAudit.present;

    if (hasCompleteHygiene) {
      this.stack.quality.security = true;
    }

    this.stack.secrets = secrets;
    this.logDebug('Secrets hygiene signals', {
      template: secrets.envTemplate.present,
      ignored: secrets.envIgnored,
      loader: secrets.envLoader.present,
      audit: secrets.dependencyAudit.present
    });
  }

  async collectWorkflowFiles(): Promise<string[]> {
    const workflowDir = path.join(this.rootDir, '.github', 'workflows');
    const yamlFiles: string[] = [];
    try {
      await this.collectYamlFiles(workflowDir, yamlFiles);
    } catch (error: any) {
      // No workflows directory
    }
    return yamlFiles;
  }

  async collectYamlFiles(directory: string, results: string[]): Promise<void> {
    if (results.length >= this.workflowScanLimit) {
      return;
    }
    const entries = await fs.readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
      if (results.length >= this.workflowScanLimit) {
        break;
      }
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        if (this.shouldSkipDirectory(entry.name)) {
          continue;
        }
        await this.collectYamlFiles(entryPath, results);
      } else if (entry.isFile() && (entry.name.endsWith('.yml') || entry.name.endsWith('.yaml'))) {
        results.push(entryPath);
      }
    }
  }

  async fileExists(relativePath: string): Promise<boolean> {
    try {
      await fs.access(path.join(this.rootDir, relativePath));
      return true;
    } catch (error: any) {
      return false;
    }
  }

  async saveReport(report: StackReport): Promise<void> {
    const devenvDir = path.join(this.rootDir, '.devenv');
    await fs.mkdir(devenvDir, { recursive: true });
    const reportPath = path.join(devenvDir, 'stack-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf8');
    if (!this.quiet) {
      logger.info(`Stack report saved to ${reportPath}`);
    }
  }

  async detectCursorRules(): Promise<void> {
    const cursorRulesDir = path.join(this.rootDir, '.cursor', 'rules');
    
    try {
      await fs.access(cursorRulesDir);
      this.stack.cursorRules!.present = true;
      
      // Read all .mdc files
      const entries = await fs.readdir(cursorRulesDir, { withFileTypes: true });
      const mdcFiles: string[] = [];
      
      for (const entry of entries) {
        if (entry.isFile() && entry.name.endsWith('.mdc')) {
          mdcFiles.push(entry.name);
        }
      }
      
      this.stack.cursorRules!.existingFiles = mdcFiles.sort();
      
      // Categorize files
      const coreFiles: string[] = [];
      const conditionalFiles: string[] = [];
      const projectSpecificFiles: string[] = [];
      
      // Standard DevEnvTemplate core files (00-08)
      const standardCoreFiles = [
        '00-core-principles.mdc',
        '01-code-quality.mdc',
        '02-security.mdc',
        '03-testing.mdc',
        '04-git-workflow.mdc',
        '05-error-handling.mdc',
        '06-documentation.mdc',
        '07-ai-agent-behavior.mdc',
        '08-project-context.mdc'
      ];
      
      // Standard conditional files (10+)
      const standardConditionalFiles = [
        '10-typescript.mdc',
        '11-javascript.mdc',
        '12-python.mdc',
        '13-markdown.mdc',
        '14-json-yaml.mdc',
        '15-shell-scripts.mdc',
        '20-frontend-frameworks.mdc'
      ];
      
      for (const file of mdcFiles) {
        if (standardCoreFiles.includes(file)) {
          coreFiles.push(file);
        } else if (standardConditionalFiles.includes(file)) {
          conditionalFiles.push(file);
        } else {
          // Project-specific file
          projectSpecificFiles.push(file);
        }
      }
      
      this.stack.cursorRules!.coreFiles = coreFiles;
      this.stack.cursorRules!.conditionalFiles = conditionalFiles;
      this.stack.cursorRules!.projectSpecificFiles = projectSpecificFiles;
      
      // Determine if integration is needed
      // Integration needed if:
      // 1. Missing core files
      // 2. Has project-specific files (might need merging)
      // 3. Has conditional files that don't match detected stack
      const missingCoreFiles = standardCoreFiles.filter(f => !coreFiles.includes(f));
      const needsIntegration = missingCoreFiles.length > 0 || projectSpecificFiles.length > 0;
      
      this.stack.cursorRules!.needsIntegration = needsIntegration;
      
      this.logDebug('Cursor rules detection complete', {
        present: true,
        totalFiles: mdcFiles.length,
        coreFiles: coreFiles.length,
        conditionalFiles: conditionalFiles.length,
        projectSpecificFiles: projectSpecificFiles.length,
        needsIntegration
      });
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        // .cursor/rules/ doesn't exist
        this.stack.cursorRules!.present = false;
        this.stack.cursorRules!.needsIntegration = true; // Needs initial setup
        this.logDebug('Cursor rules directory not found');
      } else {
        // Other error - log but don't fail
        this.logDebug('Error detecting cursor rules', { error: error.message });
      }
    }
  }

  assignProfiles(): void {
    const profiles = new Set<string>();
    const techNames = this.stack.technologies.map(t => t.name.toLowerCase());
    const manifest = this.projectManifest as Record<string, any> | null;
    const manifestTechs = Array.isArray(manifest?.technologies)
      ? (manifest!.technologies as unknown[]).map(tech => String(tech).toLowerCase())
      : [];
    const rawPackageManager = manifest?.packageManager;
    const packageManager =
      typeof rawPackageManager === 'string' ? rawPackageManager.toLowerCase() : '';

    const nodeSignals = ['node.js', 'node', 'react', 'next.js', 'nextjs', 'vite', 'express', 'typescript', 'javascript', 'svelte'];
    const pythonSignals = ['python', 'fastapi', 'django', 'flask', 'pytest', 'black', 'ruff', 'mypy', 'pytorch', 'pychrono', 'numpy', 'scipy', 'pandas'];

    const nodePackageManagers = ['npm', 'pnpm', 'yarn', 'bun'];
    const pythonPackageManagers = ['pip', 'pipenv', 'poetry', 'uv'];

    const hasNodeSignals =
      techNames.some(name => nodeSignals.includes(name)) ||
      manifestTechs.some(name => nodeSignals.includes(name)) ||
      nodePackageManagers.includes(packageManager);

    const hasPythonSignals =
      techNames.some(name => pythonSignals.includes(name)) ||
      manifestTechs.some(name => pythonSignals.includes(name)) ||
      pythonPackageManagers.includes(packageManager);

    if (hasNodeSignals) {
      profiles.add('node');
    }
    if (hasPythonSignals) {
      profiles.add('python');
    }

    if (profiles.size === 0) {
      profiles.add('agnostic');
    }

    this.stack.profiles = Array.from(profiles);
    this.stack.primaryProfile = this.stack.profiles[0];
    if (profiles.has('node') && profiles.has('python')) {
      this.stack.languageProfile = 'python+node';
    } else if (profiles.has('node')) {
      this.stack.languageProfile = 'node';
    } else if (profiles.has('python')) {
      this.stack.languageProfile = 'python';
    } else {
      this.stack.languageProfile = 'agnostic';
    }
  }

  hasTechnology(name: string): boolean {
    const needle = name.toLowerCase();
    return this.stack.technologies.some(t => t.name.toLowerCase() === needle);
  }

  addTechnology(name: string, meta: Record<string, any> = {}): void {
    const normalizedName = this.formatTechnologyName(name);
    const needle = normalizedName.toLowerCase();
    const existingIndex = this.stack.technologies.findIndex(
      t => t.name.toLowerCase() === needle
    );

    if (existingIndex !== -1) {
      const existing = this.stack.technologies[existingIndex];
      const isManifestPlaceholder = existing.source === 'project.manifest.json';
      const isStrongerSource =
        meta.source && meta.source !== existing.source;

      if (isManifestPlaceholder && isStrongerSource) {
        this.stack.technologies[existingIndex] = {
          ...existing,
          ...meta,
          name: normalizedName
        };
      }
      return;
    }
    this.stack.technologies.push({
      name: normalizedName,
      ...meta
    });
  }

  applyManifestTechnologies(): void {
    const manifest = this.projectManifest as Record<string, any> | null;
    if (!manifest?.technologies) {
      return;
    }

    const technologies = Array.isArray(manifest.technologies)
      ? (manifest.technologies as unknown[])
      : [];

    for (const tech of technologies) {
      const formatted = this.formatTechnologyName(String(tech));
      if (!formatted) {
        continue;
      }
      this.addTechnology(formatted, {
        version: 'manifest',
        confidence: 'medium',
        source: 'project.manifest.json'
      });
    }
  }

  formatTechnologyName(value: string): string {
    if (!value) {
      return '';
    }
    const trimmed = String(value).trim();
    if (!trimmed) {
      return '';
    }
    const lower = trimmed.toLowerCase();
    if (TECHNOLOGY_ALIASES[lower]) {
      return TECHNOLOGY_ALIASES[lower];
    }
    return trimmed
      .split(/[-_\s]+/)
      .filter(Boolean)
      .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(' ');
  }
}

// Run the detector
if (require.main === module) {
  const detector = new StackDetector({ quiet: quietMode, mode: detectorMode, debug: debugFlag });
  detector.detect().then(async (result) => {
    if (jsonOutput) {
      process.stdout.write(JSON.stringify(result));
    } else {
      logger.info(JSON.stringify(result, null, 2));
    }
    await detector.saveReport(result);
  }).catch(error => {
    if (jsonOutput) {
      process.stderr.write(
        JSON.stringify({ error: 'Stack detection failed', message: error.message }) + '\n'
      );
    } else {
      logger.error('Stack detection failed:', { error: error.message, stack: error.stack });
    }
    process.exit(1);
  });
}

export = StackDetector;
