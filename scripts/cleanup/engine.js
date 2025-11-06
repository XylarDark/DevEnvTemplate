#!/usr/bin/env node

/**
 * Template Cleanup Engine
 *
 * Stack-agnostic engine for removing template-only code after scaffolding.
 * Processes declarative rules from YAML config to clean files, blocks, lines, and dependencies.
 */

const fs = require("fs").promises;
const path = require("path");
const { glob } = require("glob");
const yaml = require("yaml");
const { resolveConfigPath } = require("../utils/path-resolver");

// Default file extensions for code files (used by block/line marker rules)
const CODE_EXTENSIONS = [
  "**/*.js",
  "**/*.ts",
  "**/*.jsx",
  "**/*.tsx",
  "**/*.py",
  "**/*.rb",
  "**/*.go",
  "**/*.rs",
  "**/*.java",
  "**/*.cs",
  "**/*.cpp",
  "**/*.c",
  "**/*.h",
  "**/*.php",
  "**/*.scala",
  "**/*.kt",
  "**/*.swift",
  "**/*.dart",
  "**/*.sh",
  "**/*.bash",
  "**/*.zsh",
  "**/*.ps1",
  "**/*.sql",
  "**/*.html",
  "**/*.xml",
];

/**
 * Main cleanup engine class
 */
class CleanupEngine {
  constructor(options = {}) {
    this.config = null;
    this.profile = options.profile || "common";
    this.features = new Set(options.features || []);
    this.configPath = options.configPath || "cleanup.config.yaml";
    this.workingDir = options.workingDir || process.cwd();
    this.dryRun = options.dryRun !== false; // default true for safety
    this.failOnActions = options.failOnActions || false;

    // Rule filtering options
    this.onlyRules = options.onlyRules ? new Set(options.onlyRules) : null;
    this.excludeRules = options.excludeRules ? new Set(options.excludeRules) : null;
    this.excludeGlobs = options.excludeGlobs || [];
    this.keepFiles = options.keepFiles
      ? new Set(options.keepFiles.map(f => path.resolve(this.workingDir, f)))
      : null;

    // Performance optimizations
    this.excludeGlobCache = new Map(); // Cache for exclude glob matching

    this.report = {
      timestamp: new Date().toISOString(),
      profile: this.profile,
      features: Array.from(this.features),
      dryRun: this.dryRun,
      actions: [],
      errors: [],
      summary: {},
    };
  }

  /**
   * Load and validate configuration
   */
  async loadConfig() {
    try {
      const configPath = resolveConfigPath(this.configPath, this.workingDir);
      const configContent = await fs.readFile(configPath, "utf8");
      this.config = yaml.parse(configContent);

      // Validate config structure
      if (!this.config.profiles || !this.config.profiles[this.profile]) {
        throw new Error(`Profile '${this.profile}' not found in config`);
      }

      // Set defaults
      this.config.comment_syntax = this.config.comment_syntax || {};
      this.config.markers = this.config.markers || {};

      // Merge default features
      if (this.config.features) {
        this.config.features.forEach(f => this.features.add(f));
      }

      return this.config;
    } catch (error) {
      throw new Error(`Failed to load config from ${this.configPath}: ${error.message}`);
    }
  }

  /**
   * Get resolved rules for current profile, handling extends and conditionals
   */
  getRules() {
    const profile = this.config.profiles[this.profile];
    const rules = [];

    // Handle extends (recursive)
    const collectRules = profileName => {
      const prof = this.config.profiles[profileName];
      if (!prof) return;

      if (prof.extends) {
        collectRules(prof.extends);
      }

      if (prof.rules) {
        rules.push(...prof.rules);
      }
    };

    collectRules(this.profile);

    // Add conditional rules - they are evaluated based on their individual conditions
    if (this.config.conditional_rules) {
      for (const [feature, conditionalRules] of Object.entries(this.config.conditional_rules)) {
        rules.push(...conditionalRules);
      }
    }

    return rules;
  }

  /**
   * Execute all rules
   */
  async execute() {
    const rules = this.getRules();

    for (const rule of rules) {
      try {
        await this.executeRule(rule);
      } catch (error) {
        this.report.errors.push({
          rule: rule.id,
          error: error.message,
          stack: error.stack,
        });
      }
    }

    // Calculate summary
    this.calculateSummary();

    return this.report;
  }

  /**
   * Check if a rule should be executed based on only/exclude filters
   */
  shouldExecuteRule(rule) {
    // If onlyRules is specified, only include rules in that set
    if (this.onlyRules && !this.onlyRules.has(rule.id)) {
      return false;
    }

    // If excludeRules is specified, exclude rules in that set
    if (this.excludeRules && this.excludeRules.has(rule.id)) {
      return false;
    }

    return true;
  }

  /**
   * Check if a file should be processed (not excluded by globs or keep list)
   */
  shouldProcessFile(filePath) {
    const absolutePath = path.resolve(this.workingDir, filePath);
    // Normalize path for cross-platform compatibility (Windows case-insensitive)
    const normalizedPath = this.normalizePath(absolutePath);

    // Check keep files (normalized absolute paths)
    if (this.keepFiles) {
      for (const keepPath of this.keepFiles) {
        if (normalizedPath === this.normalizePath(keepPath)) {
          return false;
        }
      }
    }

    // Check exclude globs (with caching for performance)
    for (const pattern of this.excludeGlobs) {
      let matches = this.excludeGlobCache.get(pattern);
      if (!matches) {
        matches = glob.sync(pattern, {
          cwd: this.workingDir,
          absolute: true,
        });
        this.excludeGlobCache.set(pattern, matches);
      }
      if (matches.some(match => normalizedPath.startsWith(this.normalizePath(match)))) {
        return false;
      }
    }

    return true;
  }

  /**
   * Normalize path for cross-platform compatibility
   */
  normalizePath(filePath) {
    // Convert to forward slashes and normalize case on Windows
    let normalized = path.normalize(filePath).replace(/\\/g, "/");
    if (process.platform === "win32") {
      normalized = normalized.toLowerCase();
    }
    return normalized;
  }

  /**
   * Execute a single rule
   */
  async executeRule(rule) {
    // Check rule filtering
    if (!this.shouldExecuteRule(rule)) {
      return;
    }

    const ruleType = rule.type;
    const handler = this.getRuleHandler(ruleType);

    if (!handler) {
      throw new Error(`Unknown rule type: ${ruleType}`);
    }

    const actions = await handler.call(this, rule);
    if (actions && actions.length > 0) {
      this.report.actions.push(...actions);
    }
  }

  /**
   * Get handler function for rule type
   */
  getRuleHandler(type) {
    const handlers = {
      file_glob_delete: this.handleFileGlobDelete.bind(this),
      block_markers: this.handleBlockMarkers.bind(this),
      line_tag: this.handleLineTag.bind(this),
      conditional_block: this.handleConditionalBlock.bind(this),
      prune_empty: this.handlePruneEmpty.bind(this),
      package_prune: this.handlePackagePrune.bind(this),
      custom: this.handleCustomRule.bind(this),
    };

    return handlers[type];
  }

  /**
   * Get comment syntax for file extension
   */
  getCommentSyntax(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const syntax = this.config.comment_syntax[ext];

    if (!syntax) {
      // Default to single-line comment
      return { single: "//", block: null };
    }

    if (typeof syntax === "string") {
      return { single: syntax, block: null };
    }

    if (Array.isArray(syntax) && syntax.length === 2) {
      return { single: null, block: { start: syntax[0], end: syntax[1] } };
    }

    return { single: "//", block: null };
  }

  /**
   * Detect if line contains a marker
   */
  detectMarker(line, marker, commentSyntax) {
    const trimmed = line.trim();

    // Check single-line comments
    if (commentSyntax.single && trimmed.startsWith(commentSyntax.single)) {
      const comment = trimmed.slice(commentSyntax.single.length).trim();
      return comment.includes(marker);
    }

    // Check block comments
    if (commentSyntax.block) {
      const { start, end } = commentSyntax.block;
      if (trimmed.includes(start) && trimmed.includes(end)) {
        const startIdx = trimmed.indexOf(start);
        const endIdx = trimmed.indexOf(end, startIdx + start.length);
        if (startIdx !== -1 && endIdx !== -1) {
          const comment = trimmed.slice(startIdx + start.length, endIdx).trim();
          return comment.includes(marker);
        }
      }
    }

    return false;
  }

  /**
   * Parse file content for template markers
   */
  parseFileContent(content, filePath) {
    const lines = content.split("\n");
    const commentSyntax = this.getCommentSyntax(filePath);
    const blocks = [];
    const taggedLines = [];

    let inBlock = false;
    let blockStart = -1;
    let blockType = null;
    let blockMarker = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Check for line tags
      if (this.config.markers.line_tag && trimmed.includes(this.config.markers.line_tag)) {
        taggedLines.push(i);
        continue;
      }

      // Check for block markers
      if (!inBlock) {
        // Look for start markers
        for (const [type, markerConfig] of Object.entries(this.config.markers)) {
          if (type === "line_tag") continue;

          if (this.detectMarker(line, markerConfig.start, commentSyntax)) {
            inBlock = true;
            blockStart = i;
            blockType = type;
            blockMarker = markerConfig;
            break;
          }
        }
      } else {
        // Look for end marker
        if (this.detectMarker(line, blockMarker.end, commentSyntax)) {
          blocks.push({
            type: blockType,
            start: blockStart,
            end: i,
            marker: blockMarker,
          });
          inBlock = false;
          blockStart = -1;
          blockType = null;
          blockMarker = null;
        }
      }
    }

    return { blocks, taggedLines };
  }

  /**
   * Handle file glob delete rule
   */
  async handleFileGlobDelete(rule) {
    const actions = [];
    const globs = Array.isArray(rule.globs) ? rule.globs : [rule.globs];
    const exclude = [...(rule.exclude || []), ...this.excludeGlobs];

    for (const pattern of globs) {
      const files = await glob(pattern, {
        cwd: this.workingDir,
        absolute: true,
        ignore: exclude,
      });

      for (const file of files) {
        const relativePath = path.relative(this.workingDir, file);

        // Check file filtering
        if (!this.shouldProcessFile(relativePath)) {
          continue;
        }

        if (!this.dryRun) {
          await fs.rm(file, { recursive: true, force: true });
        }

        actions.push({
          type: "file_delete",
          rule: rule.id,
          path: relativePath,
          dryRun: this.dryRun,
        });
      }
    }

    return actions;
  }

  /**
   * Handle block markers rule
   */
  async handleBlockMarkers(rule) {
    const actions = [];
    const globs = rule.include_globs || CODE_EXTENSIONS;
    const excludeGlobs = [...(rule.exclude_globs || []), ...this.excludeGlobs];
    const targetMarker = rule.markers || this.config.markers.template_only;

    for (const pattern of globs) {
      const files = await glob(pattern, {
        cwd: this.workingDir,
        absolute: true,
        ignore: excludeGlobs,
        nodir: true,
      });

      for (const file of files) {
        const relativePath = path.relative(this.workingDir, file);

        // Check file filtering
        if (!this.shouldProcessFile(relativePath)) {
          continue;
        }
        try {
          const content = await fs.readFile(file, "utf8");
          const { blocks } = this.parseFileContent(content, file);

          const templateBlocks = blocks.filter(b => b.type === "template_only");

          if (templateBlocks.length > 0) {
            let newContent = content;
            const lines = newContent.split("\n");

            // Remove blocks in reverse order to maintain line numbers
            templateBlocks.reverse().forEach(block => {
              lines.splice(block.start, block.end - block.start + 1);
            });

            newContent = lines.join("\n");

            if (!this.dryRun) {
              await fs.writeFile(file, newContent);
            }

            actions.push({
              type: "block_remove",
              rule: rule.id,
              path: path.relative(this.workingDir, file),
              blocksRemoved: templateBlocks.length,
              dryRun: this.dryRun,
            });
          }
        } catch (error) {
          this.report.errors.push({
            rule: rule.id,
            file: path.relative(this.workingDir, file),
            error: `Failed to process file: ${error.message}`,
          });
        }
      }
    }

    return actions;
  }

  /**
   * Handle line tag rule
   */
  async handleLineTag(rule) {
    const actions = [];
    const globs = rule.include_globs || CODE_EXTENSIONS;
    const excludeGlobs = [...(rule.exclude_globs || []), ...this.excludeGlobs];
    const tag = rule.tag || this.config.markers.line_tag;

    for (const pattern of globs) {
      const files = await glob(pattern, {
        cwd: this.workingDir,
        absolute: true,
        ignore: excludeGlobs,
        nodir: true,
      });

      for (const file of files) {
        const relativePath = path.relative(this.workingDir, file);

        // Check file filtering
        if (!this.shouldProcessFile(relativePath)) {
          continue;
        }
        try {
          const content = await fs.readFile(file, "utf8");
          const lines = content.split("\n");
          const { taggedLines } = this.parseFileContent(content, file);

          if (taggedLines.length > 0) {
            // Remove tagged lines in reverse order
            taggedLines.reverse().forEach(lineIndex => {
              lines.splice(lineIndex, 1);
            });

            const newContent = lines.join("\n");

            if (!this.dryRun) {
              await fs.writeFile(file, newContent);
            }

            actions.push({
              type: "line_remove",
              rule: rule.id,
              path: path.relative(this.workingDir, file),
              linesRemoved: taggedLines.length,
              dryRun: this.dryRun,
            });
          }
        } catch (error) {
          this.report.errors.push({
            rule: rule.id,
            file: path.relative(this.workingDir, file),
            error: `Failed to process file: ${error.message}`,
          });
        }
      }
    }

    return actions;
  }

  /**
   * Handle conditional block rule
   */
  async handleConditionalBlock(rule) {
    const actions = [];
    const condition = rule.condition;
    const shouldRemove = this.evaluateCondition(condition);

    if (!shouldRemove) {
      return actions; // Keep the blocks
    }

    const globs = rule.include_globs || ["**/*"];
    const excludeGlobs = [...(rule.exclude_globs || []), ...this.excludeGlobs];
    const targetMarker = rule.markers || this.config.markers.conditional;

    for (const pattern of globs) {
      const files = await glob(pattern, {
        cwd: this.workingDir,
        absolute: true,
        ignore: excludeGlobs,
        nodir: true,
      });

      for (const file of files) {
        const relativePath = path.relative(this.workingDir, file);

        // Check file filtering
        if (!this.shouldProcessFile(relativePath)) {
          continue;
        }
        try {
          const content = await fs.readFile(file, "utf8");
          const { blocks } = this.parseFileContent(content, file);

          const conditionalBlocks = blocks.filter(b => b.type === "conditional");

          if (conditionalBlocks.length > 0) {
            let newContent = content;
            const lines = newContent.split("\n");

            // Remove blocks in reverse order
            conditionalBlocks.reverse().forEach(block => {
              lines.splice(block.start, block.end - block.start + 1);
            });

            newContent = lines.join("\n");

            if (!this.dryRun) {
              await fs.writeFile(file, newContent);
            }

            actions.push({
              type: "block_remove",
              rule: rule.id,
              path: path.relative(this.workingDir, file),
              blocksRemoved: conditionalBlocks.length,
              condition: condition,
              dryRun: this.dryRun,
            });
          }
        } catch (error) {
          this.report.errors.push({
            rule: rule.id,
            file: path.relative(this.workingDir, file),
            error: `Failed to process file: ${error.message}`,
          });
        }
      }
    }

    return actions;
  }

  /**
   * Evaluate conditional expression
   */
  evaluateCondition(condition) {
    if (!condition) return false;

    // Simple feature-based conditions: "feature" or "!feature"
    if (condition.startsWith("!")) {
      const feature = condition.slice(1);
      return !this.features.has(feature);
    } else {
      return this.features.has(condition);
    }
  }

  /**
   * Handle prune empty rule
   */
  async handlePruneEmpty(rule) {
    const actions = [];
    const removeEmptyFiles = rule.remove_empty_files !== false;
    const removeEmptyDirs = rule.remove_empty_dirs !== false;

    // Collect all files and directories
    const allFiles = await glob("**/*", {
      cwd: this.workingDir,
      absolute: true,
    });

    const files = [];
    const dirs = [];

    for (const file of allFiles) {
      try {
        const stat = await fs.stat(file);
        if (stat.isDirectory()) {
          dirs.push(file);
        } else {
          files.push(file);
        }
      } catch (error) {
        // Skip files that can't be accessed
      }
    }

    dirs.reverse(); // Process subdirs first

    // Remove empty files
    if (removeEmptyFiles) {
      for (const file of files) {
        try {
          const content = await fs.readFile(file, "utf8");
          if (content.trim() === "") {
            if (!this.dryRun) {
              await fs.unlink(file);
            }
            actions.push({
              type: "file_delete",
              rule: rule.id,
              path: path.relative(this.workingDir, file),
              reason: "empty file",
              dryRun: this.dryRun,
            });
          }
        } catch (error) {
          // File might not exist or be readable, skip
        }
      }
    }

    // Remove empty directories
    if (removeEmptyDirs) {
      for (const dir of dirs) {
        try {
          const contents = await fs.readdir(dir);
          if (contents.length === 0) {
            if (!this.dryRun) {
              await fs.rmdir(dir);
            }
            actions.push({
              type: "file_delete",
              rule: rule.id,
              path: path.relative(this.workingDir, dir),
              reason: "empty directory",
              dryRun: this.dryRun,
            });
          }
        } catch (error) {
          // Directory might not exist or be readable, skip
        }
      }
    }

    return actions;
  }

  /**
   * Handle package prune rule
   */
  async handlePackagePrune(rule) {
    const actions = [];
    const manager = rule.manager || "npm";
    const handler = this.getPackageManagerHandler(manager);

    if (!handler) {
      throw new Error(`Unsupported package manager: ${manager}`);
    }

    try {
      const result = await handler.call(this, rule);
      if (result && result.actions) {
        actions.push(...result.actions);
      }
    } catch (error) {
      this.report.errors.push({
        rule: rule.id,
        error: `Package pruning failed: ${error.message}`,
      });
    }

    return actions;
  }

  /**
   * Get package manager handler
   */
  getPackageManagerHandler(manager) {
    const handlers = {
      npm: this.handleNpmPrune.bind(this),
      yarn: this.handleYarnPrune.bind(this),
      pnpm: this.handlePnpmPrune.bind(this),
      pip: this.handlePipPrune.bind(this),
      poetry: this.handlePoetryPrune.bind(this),
      go: this.handleGoPrune.bind(this),
      nuget: this.handleNugetPrune.bind(this),
      maven: this.handleMavenPrune.bind(this),
      gradle: this.handleGradlePrune.bind(this),
    };

    return handlers[manager];
  }

  /**
   * Handle NPM package pruning
   */
  async handleNpmPrune(rule) {
    const actions = [];
    const packageJsonPath = path.join(this.workingDir, "package.json");
    const packageLockPath = path.join(this.workingDir, "package-lock.json");

    try {
      // Read package.json
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, "utf8"));
      let modified = false;

      // Remove dependencies
      if (rule.remove_deps && packageJson.dependencies) {
        rule.remove_deps.forEach(dep => {
          if (packageJson.dependencies[dep]) {
            delete packageJson.dependencies[dep];
            modified = true;
            actions.push({
              type: "dependency_remove",
              rule: rule.id,
              manager: "npm",
              dependency: dep,
              section: "dependencies",
              dryRun: this.dryRun,
            });
          }
        });
      }

      // Remove dev dependencies
      if (rule.remove_dev_deps && packageJson.devDependencies) {
        rule.remove_dev_deps.forEach(dep => {
          if (packageJson.devDependencies[dep]) {
            delete packageJson.devDependencies[dep];
            modified = true;
            actions.push({
              type: "dependency_remove",
              rule: rule.id,
              manager: "npm",
              dependency: dep,
              section: "devDependencies",
              dryRun: this.dryRun,
            });
          }
        });
      }

      // Write back if modified
      if (modified && !this.dryRun) {
        await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
      }

      // Remove package-lock.json if it exists
      if (!this.dryRun) {
        try {
          await fs.access(packageLockPath);
          await fs.unlink(packageLockPath);
          actions.push({
            type: "file_delete",
            rule: rule.id,
            path: "package-lock.json",
            reason: "package lock file after dependency changes",
            dryRun: false,
          });
        } catch (error) {
          // package-lock.json doesn't exist, skip
        }
      }
    } catch (error) {
      throw new Error(`Failed to process package.json: ${error.message}`);
    }

    return { actions };
  }

  /**
   * Handle Yarn package pruning
   */
  async handleYarnPrune(rule) {
    // Similar to NPM but check for yarn.lock
    const actions = [];
    const packageJsonPath = path.join(this.workingDir, "package.json");
    const yarnLockPath = path.join(this.workingDir, "yarn.lock");

    try {
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, "utf8"));
      let modified = false;

      // Same dependency removal logic as NPM
      if (rule.remove_deps && packageJson.dependencies) {
        rule.remove_deps.forEach(dep => {
          if (packageJson.dependencies[dep]) {
            delete packageJson.dependencies[dep];
            modified = true;
            actions.push({
              type: "dependency_remove",
              rule: rule.id,
              manager: "yarn",
              dependency: dep,
              section: "dependencies",
              dryRun: this.dryRun,
            });
          }
        });
      }

      if (rule.remove_dev_deps && packageJson.devDependencies) {
        rule.remove_dev_deps.forEach(dep => {
          if (packageJson.devDependencies[dep]) {
            delete packageJson.devDependencies[dep];
            modified = true;
            actions.push({
              type: "dependency_remove",
              rule: rule.id,
              manager: "yarn",
              dependency: dep,
              section: "devDependencies",
              dryRun: this.dryRun,
            });
          }
        });
      }

      if (modified && !this.dryRun) {
        await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
        // Remove yarn.lock
        try {
          await fs.access(yarnLockPath);
          await fs.unlink(yarnLockPath);
          actions.push({
            type: "file_delete",
            rule: rule.id,
            path: "yarn.lock",
            reason: "yarn lock file after dependency changes",
            dryRun: false,
          });
        } catch (error) {
          // yarn.lock doesn't exist
        }
      }
    } catch (error) {
      throw new Error(`Failed to process package.json: ${error.message}`);
    }

    return { actions };
  }

  /**
   * Handle PNPM package pruning
   */
  async handlePnpmPrune(rule) {
    // Similar to NPM/Yarn
    const actions = [];
    const packageJsonPath = path.join(this.workingDir, "package.json");
    const pnpmLockPath = path.join(this.workingDir, "pnpm-lock.yaml");

    try {
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, "utf8"));
      let modified = false;

      if (rule.remove_deps && packageJson.dependencies) {
        rule.remove_deps.forEach(dep => {
          if (packageJson.dependencies[dep]) {
            delete packageJson.dependencies[dep];
            modified = true;
            actions.push({
              type: "dependency_remove",
              rule: rule.id,
              manager: "pnpm",
              dependency: dep,
              section: "dependencies",
              dryRun: this.dryRun,
            });
          }
        });
      }

      if (rule.remove_dev_deps && packageJson.devDependencies) {
        rule.remove_dev_deps.forEach(dep => {
          if (packageJson.devDependencies[dep]) {
            delete packageJson.devDependencies[dep];
            modified = true;
            actions.push({
              type: "dependency_remove",
              rule: rule.id,
              manager: "pnpm",
              dependency: dep,
              section: "devDependencies",
              dryRun: this.dryRun,
            });
          }
        });
      }

      if (modified && !this.dryRun) {
        await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
        try {
          await fs.access(pnpmLockPath);
          await fs.unlink(pnpmLockPath);
          actions.push({
            type: "file_delete",
            rule: rule.id,
            path: "pnpm-lock.yaml",
            reason: "pnpm lock file after dependency changes",
            dryRun: false,
          });
        } catch (error) {
          // pnpm-lock.yaml doesn't exist
        }
      }
    } catch (error) {
      throw new Error(`Failed to process package.json: ${error.message}`);
    }

    return { actions };
  }

  /**
   * Handle PIP package pruning (requirements.txt)
   */
  async handlePipPrune(rule) {
    const actions = [];
    const requirementsPath = path.join(this.workingDir, "requirements.txt");

    try {
      const requirements = await fs.readFile(requirementsPath, "utf8");
      const lines = requirements.split("\n");
      let modified = false;

      if (rule.remove_deps) {
        const filteredLines = lines.filter(line => {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith("#")) return true;

          // Check if this line contains any of the packages to remove
          const shouldRemove = rule.remove_deps.some(dep => {
            // Handle various pip install formats
            return trimmed.includes(dep) || trimmed.includes(dep.replace("-", "_"));
          });

          if (shouldRemove) {
            modified = true;
            actions.push({
              type: "dependency_remove",
              rule: rule.id,
              manager: "pip",
              dependency: trimmed,
              section: "requirements.txt",
              dryRun: this.dryRun,
            });
            return false;
          }

          return true;
        });

        if (modified && !this.dryRun) {
          await fs.writeFile(requirementsPath, filteredLines.join("\n"));
        }
      }
    } catch (error) {
      throw new Error(`Failed to process requirements.txt: ${error.message}`);
    }

    return { actions };
  }

  /**
   * Handle Poetry package pruning (pyproject.toml)
   */
  async handlePoetryPrune(rule) {
    // Basic implementation - could be enhanced with proper TOML parsing
    const actions = [];
    const pyprojectPath = path.join(this.workingDir, "pyproject.toml");

    try {
      let content = await fs.readFile(pyprojectPath, "utf8");
      let modified = false;

      if (rule.remove_deps) {
        rule.remove_deps.forEach(dep => {
          const regex = new RegExp(`^${dep}\\s*=.*$`, "gm");
          if (regex.test(content)) {
            content = content.replace(regex, "");
            modified = true;
            actions.push({
              type: "dependency_remove",
              rule: rule.id,
              manager: "poetry",
              dependency: dep,
              section: "pyproject.toml",
              dryRun: this.dryRun,
            });
          }
        });
      }

      if (modified && !this.dryRun) {
        await fs.writeFile(pyprojectPath, content);
      }
    } catch (error) {
      throw new Error(`Failed to process pyproject.toml: ${error.message}`);
    }

    return { actions };
  }

  /**
   * Handle Go module pruning (go.mod)
   */
  async handleGoPrune(rule) {
    const actions = [];
    const goModPath = path.join(this.workingDir, "go.mod");

    try {
      let content = await fs.readFile(goModPath, "utf8");
      let modified = false;

      if (rule.remove_deps) {
        rule.remove_deps.forEach(dep => {
          const regex = new RegExp(`^\\s*${dep}\\s+.*$`, "gm");
          if (regex.test(content)) {
            content = content.replace(regex, "");
            modified = true;
            actions.push({
              type: "dependency_remove",
              rule: rule.id,
              manager: "go",
              dependency: dep,
              section: "go.mod",
              dryRun: this.dryRun,
            });
          }
        });
      }

      if (modified && !this.dryRun) {
        await fs.writeFile(goModPath, content);
      }
    } catch (error) {
      throw new Error(`Failed to process go.mod: ${error.message}`);
    }

    return { actions };
  }

  /**
   * Handle NuGet package pruning (.csproj files)
   */
  async handleNugetPrune(rule) {
    const actions = [];

    // Find .csproj files
    const csprojFiles = await glob("**/*.csproj", {
      cwd: this.workingDir,
      absolute: true,
    });

    for (const csprojFile of csprojFiles) {
      try {
        let content = await fs.readFile(csprojFile, "utf8");
        let modified = false;

        if (rule.remove_deps) {
          rule.remove_deps.forEach(dep => {
            // Match PackageReference elements
            const regex = new RegExp(
              `<PackageReference\\s+Include="${dep}"[^>]*>.*?<\\/PackageReference>`,
              "gs"
            );
            if (regex.test(content)) {
              content = content.replace(regex, "");
              modified = true;
              actions.push({
                type: "dependency_remove",
                rule: rule.id,
                manager: "nuget",
                dependency: dep,
                file: path.relative(this.workingDir, csprojFile),
                dryRun: this.dryRun,
              });
            }
          });
        }

        if (modified && !this.dryRun) {
          await fs.writeFile(csprojFile, content);
        }
      } catch (error) {
        throw new Error(`Failed to process ${csprojFile}: ${error.message}`);
      }
    }

    return { actions };
  }

  /**
   * Handle Maven package pruning (pom.xml)
   */
  async handleMavenPrune(rule) {
    const actions = [];
    const pomPath = path.join(this.workingDir, "pom.xml");

    try {
      let content = await fs.readFile(pomPath, "utf8");
      let modified = false;

      if (rule.remove_deps) {
        rule.remove_deps.forEach(dep => {
          // Match dependency elements (basic implementation)
          const regex = new RegExp(
            `<dependency>\\s*<groupId>[^<]*<\\/groupId>\\s*<artifactId>${dep}<\\/artifactId>.*?<\\/dependency>`,
            "gs"
          );
          if (regex.test(content)) {
            content = content.replace(regex, "");
            modified = true;
            actions.push({
              type: "dependency_remove",
              rule: rule.id,
              manager: "maven",
              dependency: dep,
              section: "pom.xml",
              dryRun: this.dryRun,
            });
          }
        });
      }

      if (modified && !this.dryRun) {
        await fs.writeFile(pomPath, content);
      }
    } catch (error) {
      throw new Error(`Failed to process pom.xml: ${error.message}`);
    }

    return { actions };
  }

  /**
   * Handle Gradle package pruning (build.gradle)
   */
  async handleGradlePrune(rule) {
    const actions = [];

    // Find build.gradle files
    const gradleFiles = await glob("**/build.gradle", {
      cwd: this.workingDir,
      absolute: true,
    });

    for (const gradleFile of gradleFiles) {
      try {
        let content = await fs.readFile(gradleFile, "utf8");
        let modified = false;

        if (rule.remove_deps) {
          rule.remove_deps.forEach(dep => {
            // Match implementation or compile statements
            const regex = new RegExp(`^(?:implementation|compile)\\s+['"]${dep}:.*['"]\\s*$`, "gm");
            if (regex.test(content)) {
              content = content.replace(regex, "");
              modified = true;
              actions.push({
                type: "dependency_remove",
                rule: rule.id,
                manager: "gradle",
                dependency: dep,
                file: path.relative(this.workingDir, gradleFile),
                dryRun: this.dryRun,
              });
            }
          });
        }

        if (modified && !this.dryRun) {
          await fs.writeFile(gradleFile, content);
        }
      } catch (error) {
        throw new Error(`Failed to process ${gradleFile}: ${error.message}`);
      }
    }

    return { actions };
  }

  /**
   * Handle custom rule
   */
  async handleCustomRule(rule) {
    const actions = [];

    if (!rule.module) {
      throw new Error(`Custom rule '${rule.id}' must specify a 'module' path`);
    }

    try {
      // Resolve module path relative to working directory
      const modulePath = path.resolve(this.workingDir, rule.module);

      // Load the custom module
      const customModule = require(modulePath);

      if (typeof customModule.execute !== "function") {
        throw new Error(`Custom module '${rule.module}' must export an 'execute' function`);
      }

      // Execute the custom rule
      const result = await customModule.execute(rule, this);

      // Handle different return formats
      if (result && Array.isArray(result)) {
        actions.push(...result);
      } else if (result && result.actions && Array.isArray(result.actions)) {
        actions.push(...result.actions);
      }
    } catch (error) {
      throw new Error(`Failed to execute custom rule '${rule.id}': ${error.message}`);
    }

    return actions;
  }

  /**
   * Calculate summary statistics
   */
  calculateSummary() {
    const summary = {
      totalActions: this.report.actions.length,
      filesDeleted: 0,
      linesRemoved: 0,
      blocksRemoved: 0,
      errors: this.report.errors.length,
    };

    for (const action of this.report.actions) {
      switch (action.type) {
        case "file_delete":
          summary.filesDeleted++;
          break;
        case "line_remove":
          summary.linesRemoved++;
          break;
        case "block_remove":
          summary.blocksRemoved++;
          break;
      }
    }

    this.report.summary = summary;
  }

  /**
   * Export report to JSON file
   */
  async exportReport(outputPath) {
    const reportPath = path.resolve(this.workingDir, outputPath);
    await fs.writeFile(reportPath, JSON.stringify(this.report, null, 2));
    return reportPath;
  }
}

/**
 * Execute cleanup with given options
 */
async function executeCleanup(options = {}) {
  const engine = new CleanupEngine(options);

  try {
    await engine.loadConfig();
    const report = await engine.execute();

    if (options.report) {
      await engine.exportReport(options.report);
    }

    // Determine exit code based on failOnActions flag
    let exitCode = 0; // Success
    if (options.failOnActions && report.actions.length > 0) {
      exitCode = 2; // Actions detected
    }

    return { report, exitCode };
  } catch (error) {
    throw new Error(`Cleanup failed: ${error.message}`);
  }
}

module.exports = {
  CleanupEngine,
  executeCleanup,
};
