#!/usr/bin/env node

/**
 * Stack Detector - CI-only utility
 *
 * Analyzes a repository to detect technology stack and configuration.
 * Used by DevEnvTemplate drop-in to understand the current project setup.
 */

const fs = require('fs').promises;
const path = require('path');

class StackDetector {
  constructor() {
    this.rootDir = process.cwd();
    this.stack = {
      technologies: [],
      configurations: [],
      quality: {
        linting: false,
        testing: false,
        typescript: false,
        security: false
      },
      ci: {
        present: false,
        type: null
      }
    };
  }

  async detect() {
    console.log('🔍 Analyzing repository stack...');

    // Detect package managers and frameworks
    await this.detectPackageJson();
    await this.detectTypeScript();
    await this.detectFrameworks();
    await this.detectTesting();
    await this.detectLinting();
    await this.detectCI();
    await this.detectSecurity();

    return this.stack;
  }

  async detectPackageJson() {
    try {
      const packageJson = JSON.parse(await fs.readFile(path.join(this.rootDir, 'package.json'), 'utf8'));

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
      // No package.json found
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
      const tsconfig = await fs.readFile(path.join(this.rootDir, 'tsconfig.json'), 'utf8');
      const config = JSON.parse(tsconfig);

      this.stack.quality.typescript = true;
      this.stack.configurations.push({
        type: 'typescript',
        strict: config.compilerOptions?.strict || false,
        target: config.compilerOptions?.target || 'unknown'
      });
    } catch (error) {
      // No tsconfig.json
    }
  }

  async detectPython() {
    try {
      // Check for pyproject.toml (modern Python packaging)
      const pyprojectToml = await fs.readFile(path.join(this.rootDir, 'pyproject.toml'), 'utf8');
      const tomlData = this.parseTOML(pyprojectToml);

      this.stack.technologies.push({
        name: 'Python',
        version: tomlData.tool?.poetry?.version || 'detected',
        confidence: 'high',
        source: 'pyproject.toml'
      });

      // Check for Python version in pyproject.toml
      if (tomlData.tool?.poetry?.python) {
        this.stack.technologies.push({
          name: 'Python Runtime',
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
      }

    } catch (error) {
      // Try requirements.txt as fallback
      try {
        const requirements = await fs.readFile(path.join(this.rootDir, 'requirements.txt'), 'utf8');
        this.stack.technologies.push({
          name: 'Python',
          version: 'detected',
          confidence: 'medium',
          source: 'requirements.txt'
        });

        // Check for common frameworks in requirements
        if (requirements.includes('fastapi')) {
          this.stack.technologies.push({
            name: 'FastAPI',
            version: 'detected',
            confidence: 'medium',
            source: 'requirements.txt'
          });
        }

        if (requirements.includes('django')) {
          this.stack.technologies.push({
            name: 'Django',
            version: 'detected',
            confidence: 'medium',
            source: 'requirements.txt'
          });
        }

        if (requirements.includes('flask')) {
          this.stack.technologies.push({
            name: 'Flask',
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
    // Check for Next.js config
    try {
      await fs.access(path.join(this.rootDir, 'next.config.js'));
      this.stack.configurations.push({
        type: 'nextjs',
        configFile: 'next.config.js'
      });
    } catch (error) {
      // No Next.js config
    }

    // Check for Vite config
    try {
      await fs.access(path.join(this.rootDir, 'vite.config.ts'));
      this.stack.configurations.push({
        type: 'vite',
        configFile: 'vite.config.ts'
      });
    } catch (error) {
      try {
        await fs.access(path.join(this.rootDir, 'vite.config.js'));
        this.stack.configurations.push({
          type: 'vite',
          configFile: 'vite.config.js'
        });
      } catch (error) {
        // No Vite config
      }
    }
  }

  async detectTesting() {
    // Check for test directories
    try {
      await fs.access(path.join(this.rootDir, 'tests'));
      this.stack.quality.testing = true;
    } catch (error) {
      try {
        await fs.access(path.join(this.rootDir, '__tests__'));
        this.stack.quality.testing = true;
      } catch (error) {
        // Check for test files in src
        try {
          const files = await fs.readdir(path.join(this.rootDir, 'src'));
          if (files.some(f => f.includes('.test.') || f.includes('.spec.'))) {
            this.stack.quality.testing = true;
          }
        } catch (error) {
          // No tests detected
        }
      }
    }

    // Check for Playwright config
    try {
      await fs.access(path.join(this.rootDir, 'playwright.config.ts'));
      this.stack.configurations.push({
        type: 'playwright',
        configFile: 'playwright.config.ts'
      });
    } catch (error) {
      try {
        await fs.access(path.join(this.rootDir, 'playwright.config.js'));
        this.stack.configurations.push({
          type: 'playwright',
          configFile: 'playwright.config.js'
        });
      } catch (error) {
        // No Playwright config
      }
    }
  }

  async detectLinting() {
    // Check for ESLint config
    const eslintFiles = ['.eslintrc.js', '.eslintrc.json', '.eslintrc.ts', '.eslintrc.yml', '.eslintrc.yaml'];

    for (const file of eslintFiles) {
      try {
        await fs.access(path.join(this.rootDir, file));
        this.stack.quality.linting = true;
        this.stack.configurations.push({
          type: 'eslint',
          configFile: file
        });
        break;
      } catch (error) {
        // Continue checking
      }
    }
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
}

// Run the detector
if (require.main === module) {
  const detector = new StackDetector();
  detector.detect().then(result => {
    console.log(JSON.stringify(result, null, 2));
  }).catch(error => {
    console.error('Stack detection failed:', error.message);
    process.exit(1);
  });
}

module.exports = StackDetector;
