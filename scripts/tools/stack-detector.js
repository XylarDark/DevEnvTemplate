#!/usr/bin/env node

/**
 * Stack Detector - CI-only utility
 *
 * Analyzes a repository to detect technology stack and configuration.
 * Used by DevEnvTemplate drop-in to understand the current project setup.
 */

const fs = require('fs').promises;
const path = require('path');
const { createLogger } = require('../../scripts/utils/logger');

const args = process.argv.slice(2);
const jsonOutput = args.includes('--json');
const quietMode = jsonOutput || args.includes('--quiet');

const logger = createLogger({ context: 'stack-detector' });

const TECHNOLOGY_ALIASES = {
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
  constructor(options = {}) {
    this.rootDir = options.rootDir || process.cwd();
    this.quiet = !!options.quiet;
    this.projectManifest = null;
    this.pyprojectContent = null;
    this.requirementsContent = null;
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
        present: false,
        type: null
      },
      profiles: [],
      primaryProfile: null,
      languageProfile: 'agnostic',
      manifest: null
    };
  }

  async detect() {
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
    this.assignProfiles();

    return this.stack;
  }

  async loadProjectManifest() {
    const manifestPath = path.join(this.rootDir, 'project.manifest.json');
    try {
      const manifest = await readJsonFile(manifestPath);
      this.projectManifest = manifest;
      this.stack.manifest = manifest;
      this.applyManifestTechnologies();
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
      this.projectManifest = null;
    }
  }

  async detectPackageJson() {
    const packagePath = path.join(this.rootDir, 'package.json');
    try {
      const packageJson = await readJsonFile(packagePath);

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

    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
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

  async detectTypeScript() {
    try {
      const config = await readJsonFile(path.join(this.rootDir, 'tsconfig.json'));

      this.stack.quality.typescript = true;
      this.stack.configurations.push({
        type: 'typescript',
        strict: config.compilerOptions?.strict || false,
        target: config.compilerOptions?.target || 'unknown'
      });
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }

  async detectPython() {
    try {
      // Check for pyproject.toml (modern Python packaging)
      const pyprojectToml = await fs.readFile(path.join(this.rootDir, 'pyproject.toml'), 'utf8');
      this.pyprojectContent = pyprojectToml;
      const tomlData = this.parseTOML(pyprojectToml);
      const pyprojectLower = pyprojectToml.toLowerCase();

      this.addTechnology('Python', {
        version: tomlData.tool?.poetry?.version || 'detected',
        confidence: 'high',
        source: 'pyproject.toml'
      });

      // Check for Python version in pyproject.toml
      if (tomlData.tool?.poetry?.python) {
        this.addTechnology('Python Runtime', {
          version: tomlData.tool.poetry.python,
          confidence: 'high',
          source: 'pyproject.toml'
        });
      }

      // Detect Python framework
      if (tomlData.tool?.poetry?.dependencies) {
        const deps = tomlData.tool.poetry.dependencies;

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

    } catch (error) {
      // Try requirements.txt as fallback
      try {
        const requirements = await fs.readFile(path.join(this.rootDir, 'requirements.txt'), 'utf8');
        this.requirementsContent = requirements;
        this.addTechnology('Python', {
          version: 'detected',
          confidence: 'medium',
          source: 'requirements.txt'
        });

        // Check for common frameworks in requirements
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

      } catch (error2) {
        // No Python project detected
      }
    }
  }

  async detectGo() {
    try {
      const goMod = await fs.readFile(path.join(this.rootDir, 'go.mod'), 'utf8');
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

    } catch (error) {
      // No Go project detected
    }
  }

  async detectJava() {
    try {
      // Check for pom.xml (Maven)
      const pomXml = await fs.readFile(path.join(this.rootDir, 'pom.xml'), 'utf8');

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

    } catch (error) {
      // Try Gradle as fallback
      try {
        const buildGradle = await fs.readFile(path.join(this.rootDir, 'build.gradle'), 'utf8');

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

      } catch (error2) {
        // No Java project detected
      }
    }
  }

  async detectDotNet() {
    try {
      // Check for .csproj files
      const csprojFiles = await this.findFiles('*.csproj');

      if (csprojFiles.length > 0) {
        // Read first .csproj file
        const csprojContent = await fs.readFile(csprojFiles[0], 'utf8');

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

    } catch (error) {
      // No .NET project detected
    }
  }

  async findFiles(pattern) {
    // Simple file finder - in a real implementation, you'd use glob
    try {
      const files = await fs.readdir(this.rootDir);
      return files.filter(file => file.endsWith(pattern.replace('*', '')));
    } catch {
      return [];
    }
  }

  parseTOML(content) {
    // Simple TOML parser for basic pyproject.toml structure
    // In a real implementation, you'd use a proper TOML parser
    const result = {};

    try {
      // Very basic parsing - just extract tool.poetry section
      const toolSection = content.match(/\[tool\.poetry\]([\s\S]*?)(?=\[|$)/);
      if (toolSection) {
        const lines = toolSection[1].split('\n');
        const poetry = {};

        lines.forEach(line => {
          const match = line.match(/(\w+)\s*=\s*"([^"]+)"/);
          if (match) {
            poetry[match[1]] = match[2];
          }
        });

        result.tool = { poetry };
      }
    } catch (error) {
      // Parsing failed
    }

    return result;
  }

  async detectFrameworks() {
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
        const dirs = [];
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
        break;
      } catch (error) {
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
        break;
      } catch (error) {
        // Continue checking
      }
    }
  }

  async detectScripts() {
    try {
      const packageJson = await readJsonFile(path.join(this.rootDir, 'package.json'));
      const scripts = packageJson.scripts || {};
      
      // Essential scripts we look for
      const essentialScripts = ['dev', 'build', 'test', 'lint', 'format', 'typecheck'];
      const detected = [];
      const missing = [];
      
      for (const scriptName of essentialScripts) {
        if (scripts[scriptName]) {
          detected.push({ name: scriptName, command: scripts[scriptName] });
        } else {
          missing.push(scriptName);
        }
      }
      
      this.stack.scripts = { detected, missing };
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }

  async detectExpress() {
    // Check for Express patterns
    const expressFiles = ['server.js', 'server.ts', 'app.js', 'app.ts', 'index.js', 'index.ts'];
    
    for (const file of expressFiles) {
      try {
        const filePath = path.join(this.rootDir, file);
        const content = await fs.readFile(filePath, 'utf8');
        
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
      } catch (error) {
        // File doesn't exist or can't be read
      }
    }
  }

  async detectPrisma() {
    try {
      await fs.access(path.join(this.rootDir, 'prisma', 'schema.prisma'));
      this.stack.files.configs.push('prisma/schema.prisma');
      this.stack.files.key_patterns.push('prisma/schema.prisma (Prisma ORM)');
      this.stack.configurations.push({
        type: 'prisma',
        configFile: 'prisma/schema.prisma'
      });
    } catch (error) {
      // Also check root level
      try {
        await fs.access(path.join(this.rootDir, 'schema.prisma'));
        this.stack.files.configs.push('schema.prisma');
        this.stack.files.key_patterns.push('schema.prisma (Prisma ORM)');
        this.stack.configurations.push({
          type: 'prisma',
          configFile: 'schema.prisma'
        });
      } catch (error2) {
        // No Prisma schema
      }
    }
  }

  async detectTailwind() {
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
      } catch (error) {
        // Continue checking
      }
    }
  }

  async detectTesting() {
    const testingFrameworks = [];
    
    // Check for test directories
    try {
      await fs.access(path.join(this.rootDir, 'tests'));
      this.stack.quality.testing = true;
      this.stack.files.key_patterns.push('tests/ (test directory)');
    } catch (error) {
      try {
        await fs.access(path.join(this.rootDir, '__tests__'));
        this.stack.quality.testing = true;
        this.stack.files.key_patterns.push('__tests__/ (test directory)');
      } catch (error) {
        // Check for test files in src
        try {
          const files = await fs.readdir(path.join(this.rootDir, 'src'));
          if (files.some(f => f.includes('.test.') || f.includes('.spec.'))) {
            this.stack.quality.testing = true;
            this.stack.files.key_patterns.push('src/**/*.test.* (test files)');
          }
        } catch (error) {
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
      } catch (error) {
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
      } catch (error) {
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
      } catch (error) {
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
    } catch (error) {
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

  async detectLinting() {
    const lintConfigs = [];
    
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
      } catch (error) {
        // Continue checking
      }
    }

    // Check for package.json eslintConfig
    try {
      const packageJson = await readJsonFile(path.join(this.rootDir, 'package.json'));
      if (packageJson.eslintConfig) {
        this.stack.quality.linting = true;
        this.stack.configurations.push({
          type: 'eslint',
          configFile: 'package.json'
        });
        lintConfigs.push('package.json (eslintConfig)');
      }
    } catch (error) {
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
    } catch (error) {
      try {
        await fs.access(path.join(this.rootDir, '.ruff.toml'));
        ruffDetected = true;
        lintConfigs.push('.ruff.toml');
      } catch (error2) {
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

  async detectFormatting() {
    const formatConfigs = [];
    
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
      } catch (error) {
        // Continue checking
      }
    }

    // Check for package.json prettier config
    try {
      const packageJson = await readJsonFile(path.join(this.rootDir, 'package.json'));
      if (packageJson.prettier) {
        this.stack.quality.formatting = true;
        this.stack.configurations.push({
          type: 'prettier',
          configFile: 'package.json'
        });
        formatConfigs.push('package.json (prettier)');
      }
    } catch (error) {
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

  async detectCI() {
    // Check for GitHub Actions
    try {
      await fs.access(path.join(this.rootDir, '.github', 'workflows'));
      this.stack.ci.present = true;
      this.stack.ci.type = 'github-actions';
    } catch (error) {
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
      } catch (error) {
        // Continue checking
      }
    }
  }

  async detectSecurity() {
    // Check for security-related files
    const securityFiles = ['.env', '.env.local', '.env.production'];

    for (const file of securityFiles) {
      try {
        await fs.access(path.join(this.rootDir, file));
        this.stack.quality.security = true;
        break;
      } catch (error) {
        // Continue checking
      }
    }

    // Check for CSP or security headers
    if (this.stack.configurations.some(c => c.type === 'nextjs')) {
      try {
        const nextConfig = await fs.readFile(path.join(this.rootDir, 'next.config.js'), 'utf8');
        if (nextConfig.includes('Content-Security-Policy') || nextConfig.includes('headers')) {
          this.stack.quality.security = true;
        }
      } catch (error) {
        // Cannot read Next.js config
      }
    }
  }

  async saveReport(report) {
    const devenvDir = path.join(this.rootDir, '.devenv');
    await fs.mkdir(devenvDir, { recursive: true });
    const reportPath = path.join(devenvDir, 'stack-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf8');
    if (!this.quiet) {
      logger.info(`Stack report saved to ${reportPath}`);
    }
  }

  assignProfiles() {
    const profiles = new Set();
    const techNames = this.stack.technologies.map(t => t.name.toLowerCase());
    const manifestTechs = Array.isArray(this.projectManifest?.technologies)
      ? this.projectManifest.technologies.map(tech => String(tech).toLowerCase())
      : [];
    const packageManager = (this.projectManifest?.packageManager || '').toLowerCase();

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

  hasTechnology(name) {
    const needle = name.toLowerCase();
    return this.stack.technologies.some(t => t.name.toLowerCase() === needle);
  }

  addTechnology(name, meta = {}) {
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

  applyManifestTechnologies() {
    if (!this.projectManifest?.technologies) {
      return;
    }

    for (const tech of this.projectManifest.technologies) {
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

  formatTechnologyName(value) {
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
  const detector = new StackDetector({ quiet: quietMode });
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

module.exports = StackDetector;

async function readJsonFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw error;
    }
    if (error instanceof SyntaxError) {
      const parseError = new Error(`Invalid JSON in ${filePath}: ${error.message}`);
      parseError.code = 'JSON_PARSE_ERROR';
      throw parseError;
    }
    throw error;
  }
}
